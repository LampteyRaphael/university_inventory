<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\StockLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PurchaseOrderItemController extends Controller
{
    public function index(Request $request)
    {
        try {
            $purchaseOrderItems = PurchaseOrderItem::with(['purchaseOrder', 'inventoryItem'])
                ->get()
                ->map(function ($item) {
                    return [
                        'order_item_id' => $item->order_item_id,
                        'order_id' => $item->order_id,
                        'item_id' => $item->item_id,
                        'quantity_ordered' => $item->quantity_ordered,
                        'quantity_received' => $item->quantity_received,
                        'quantity_cancelled' => $item->quantity_cancelled,
                        'unit_price' => $item->unit_price,
                        'tax_rate' => $item->tax_rate,
                        'discount_rate' => $item->discount_rate,
                        'line_total' => $item->line_total,
                        'expected_delivery_date' => $item->expected_delivery_date,
                        'actual_delivery_date' => $item->actual_delivery_date,
                        'status' => $item->status,
                        'notes' => $item->notes,
                        
                        // Relationship data
                        'po_number' => $item->purchaseOrder->po_number ?? null,
                        'item_name' => $item->inventoryItem->name ?? null,
                        'item_code' => $item->inventoryItem->item_code ?? null,
                        
                        'created_at' => $item->created_at,
                        'updated_at' => $item->updated_at,
                    ];
                });

            return Inertia::render('PurchaseOrders/PurchaseOrdersItems', [
                'orderItems' => $purchaseOrderItems,
                'purchaseOrders' => PurchaseOrder::select('order_id', 'po_number')
                    ->orderBy('po_number')
                    ->get(),
                'inventoryItems' => InventoryItem::select('item_id', 'name', 'item_code')
                    ->orderBy('name')
                    ->get(),
                'filters' => $request->only(['search', 'status', 'order_id']),
            ]);

        } catch (\Exception $e) {
            Log::error('PurchaseOrderItems index error:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Error loading purchase order items: ' . $e->getMessage());
        }
    }

    /**
     * Store a newly created purchase order item in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:purchase_orders,order_id',
            'item_id' => 'required|exists:inventory_items,item_id',
            'quantity_ordered' => 'required|integer|min:1',
            'quantity_received' => 'integer|min:0',
            'quantity_cancelled' => 'integer|min:0',
            'unit_price' => 'required|numeric|min:0',
            'tax_rate' => 'numeric|min:0|max:100',
            'discount_rate' => 'numeric|min:0|max:100',
            'line_total' => 'numeric|min:0',
            'expected_delivery_date' => 'nullable|date',
            'actual_delivery_date' => 'nullable|date',
            'status' => 'required|in:ordered,partially_received,received,cancelled',
            'notes' => 'nullable|string',
        ]);

        // Auto-calculate line total if not provided
        if (empty($validated['line_total']) && !empty($validated['quantity_ordered']) && !empty($validated['unit_price'])) {
            $netPrice = $validated['unit_price'] * (1 - ($validated['discount_rate'] / 100));
            $validated['line_total'] = $validated['quantity_ordered'] * $netPrice;
        }

        DB::beginTransaction();
        
        try {
            // Generate UUID for order_item_id
            $validated['order_item_id'] = (string) \Illuminate\Support\Str::uuid();
            
            PurchaseOrderItem::create($validated);
            
            DB::commit();
            
            return redirect()->route('purchase-order-items.index')
                ->with('success', 'Purchase order item created successfully!');
                
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating purchase order item:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to create purchase order item: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Update the specified purchase order item in storage.
     */
    public function update(Request $request, $id)
    {
        $purchaseOrderItem = PurchaseOrderItem::with(['purchaseOrder', 'inventoryItem'])->findOrFail($id);
        
        // Store original values for comparison
        $originalStatus = $purchaseOrderItem->status;
        $originalQuantityReceived = $purchaseOrderItem->quantity_received;
        $originalQuantityCancelled = $purchaseOrderItem->quantity_cancelled;
                    
        $validated = $request->validate([
            'order_id' => 'required|exists:purchase_orders,order_id',
            'item_id' => 'required|exists:inventory_items,item_id',
            'quantity_ordered' => 'required|integer|min:1',
            'quantity_received' => 'integer|min:0',
            'quantity_cancelled' => 'integer|min:0',
            'unit_price' => 'required|numeric|min:0',
            'tax_rate' => 'numeric|min:0|max:100',
            'discount_rate' => 'numeric|min:0|max:100',
            'line_total' => 'numeric|min:0',
            'expected_delivery_date' => 'nullable|date',
            'actual_delivery_date' => 'nullable|date',
            'status' => 'required|in:ordered,partially_received,received,cancelled',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        
        try {
            // Update the purchase order item first
            $purchaseOrderItem->update($validated);
            
            // Call status-specific handlers
            $this->handleStatusUpdate($purchaseOrderItem, $originalStatus, $validated['status']);
            
            // Handle quantity changes
            $this->handleQuantityChanges($purchaseOrderItem, $originalQuantityReceived, $originalQuantityCancelled);
            
            DB::commit();
            
            return redirect()->route('purchase-order-items.index')
                ->with('success', 'Purchase order item updated successfully!');
                
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating purchase order item:', [
                'error' => $e->getMessage(), 
                'item_id' => $id,
                'original_status' => $originalStatus,
                'new_status' => $validated['status'] ?? 'unknown'
            ]);
            
            return back()->with('error', 'Failed to update purchase order item: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Handle status-specific logic
     */
    private function handleStatusUpdate(PurchaseOrderItem $orderItem, string $originalStatus, string $newStatus)
    {
        // Only proceed if status actually changed
        if ($originalStatus === $newStatus) {
            return;
        }

        switch ($newStatus) {
            case 'received':
                $this->handleReceivedStatus($orderItem, $originalStatus);
                break;
                
            case 'partially_received':
                $this->handlePartiallyReceivedStatus($orderItem, $originalStatus);
                break;
                
            case 'cancelled':
                $this->handleCancelledStatus($orderItem, $originalStatus);
                break;
                
            case 'ordered':
                $this->handleOrderedStatus($orderItem, $originalStatus);
                break;
        }
        
        Log::info('Purchase order item status changed', [
            'order_item_id' => $orderItem->order_item_id,
            'from_status' => $originalStatus,
            'to_status' => $newStatus
        ]);
    }

    /**
     * Handle quantity changes for inventory updates
     */
    private function handleQuantityChanges(PurchaseOrderItem $orderItem, int $originalQtyReceived, int $originalQtyCancelled)
    {
        $qtyReceivedChanged = $orderItem->quantity_received !== $originalQtyReceived;
        $qtyCancelledChanged = $orderItem->quantity_cancelled !== $originalQtyCancelled;

        if ($qtyReceivedChanged) {
            $this->handleReceivedQuantityChange($orderItem, $originalQtyReceived);
        }

        if ($qtyCancelledChanged) {
            $this->handleCancelledQuantityChange($orderItem, $originalQtyCancelled);
        }
    }

    /**
     * Handle when status changes to 'received'
     */
    private function handleReceivedStatus(PurchaseOrderItem $orderItem, string $originalStatus)
    {
        if (in_array($originalStatus, ['ordered', 'partially_received'])) {
            $pendingQuantity = $orderItem->quantity_ordered - $orderItem->quantity_received;
            
            if ($pendingQuantity > 0) {
                // Auto-receive all pending quantities
                $orderItem->update([
                    'quantity_received' => $orderItem->quantity_ordered,
                    'actual_delivery_date' => $orderItem->actual_delivery_date ?? now(),
                ]);
                
                // Update inventory for the auto-received quantity
                $this->updateInventoryFromReceipt($orderItem, $pendingQuantity);
            } else {
                // Ensure inventory is updated for already received quantities
                $this->updateInventoryFromReceipt($orderItem, $orderItem->quantity_received);
            }
        }
    }

    /**
     * Handle when status changes to 'partially_received'
     */
    private function handlePartiallyReceivedStatus(PurchaseOrderItem $orderItem, string $originalStatus)
    {
        // If coming from ordered, update inventory for received quantities
        if ($originalStatus === 'ordered' && $orderItem->quantity_received > 0) {
            $this->updateInventoryFromReceipt($orderItem, $orderItem->quantity_received);
        }
        
        // Ensure we have some received quantity
        if ($orderItem->quantity_received === 0) {
            throw new \Exception('Partially received status requires at least some quantity received');
        }
    }

    /**
     * Handle when status changes to 'cancelled'
     */
    private function handleCancelledStatus(PurchaseOrderItem $orderItem, string $originalStatus)
    {
        // If we have received quantities that are now being cancelled, we need to reverse them
        if ($orderItem->quantity_received > 0) {
            $this->reverseReceivedInventory($orderItem, $orderItem->quantity_received);
        }
        
        // Cancel all pending quantities
        $pendingQuantity = $orderItem->quantity_ordered - $orderItem->quantity_received - $orderItem->quantity_cancelled;
        if ($pendingQuantity > 0) {
            $orderItem->increment('quantity_cancelled', $pendingQuantity);
        }
    }

    /**
     * Handle when status changes to 'ordered'
     */
    private function handleOrderedStatus(PurchaseOrderItem $orderItem, string $originalStatus)
    {
        // If coming from received/partially_received, reverse inventory transactions
        if (in_array($originalStatus, ['received', 'partially_received']) && $orderItem->quantity_received > 0) {
            $this->reverseReceivedInventory($orderItem, $orderItem->quantity_received);
            
            // Reset received quantities
            $orderItem->update([
                'quantity_received' => 0,
                'actual_delivery_date' => null,
            ]);
        }
    }

    /**
     * Handle changes in received quantity
     */
    private function handleReceivedQuantityChange(PurchaseOrderItem $orderItem, int $originalQtyReceived)
    {
        $difference = $orderItem->quantity_received - $originalQtyReceived;
        
        if ($difference > 0) {
            // Received more items - add to inventory
            $this->updateInventoryFromReceipt($orderItem, $difference);
        } elseif ($difference < 0) {
            // Received less items - reverse from inventory
            $this->reverseReceivedInventory($orderItem, abs($difference));
        }
    }

    /**
     * Handle changes in cancelled quantity
     */
    private function handleCancelledQuantityChange(PurchaseOrderItem $orderItem, int $originalQtyCancelled)
    {
        $difference = $orderItem->quantity_cancelled - $originalQtyCancelled;
        
        if ($difference > 0) {
            // If we're cancelling items that were previously received, reverse them from inventory
            $receivedToReverse = min($difference, $orderItem->quantity_received);
            if ($receivedToReverse > 0) {
                $this->reverseReceivedInventory($orderItem, $receivedToReverse);
            }
        }
    }

    /**
     * Update inventory stock levels and create transaction record
     */
    private function updateInventoryFromReceipt(PurchaseOrderItem $orderItem, int $quantityReceived)
    {
        if ($quantityReceived <= 0) return;

        // Load relationships if not already loaded
        if (!$orderItem->relationLoaded('purchaseOrder')) {
            $orderItem->load('purchaseOrder');
        }

        // Validate required purchase order data
        if (!$orderItem->purchaseOrder) {
            throw new \Exception('Purchase order not found for this item');
        }

        // Find or create stock level for this item
        $stockLevel = StockLevel::where('item_id', $orderItem->item_id)->first();
        
        if (!$stockLevel) {
            // Create a new stock level record if it doesn't exist
            $stockLevel = StockLevel::create([
                'stock_id' => (string) \Illuminate\Support\Str::uuid(),
                'university_id' => $orderItem->purchaseOrder->university_id,
                'department_id' => $orderItem->purchaseOrder->department_id,
                'item_id' => $orderItem->item_id,
                'location_id' => $orderItem->purchaseOrder->university->location_id,
                'last_count_date' => now()->toDateString(),
                'next_count_date' => now()->addMonths(3)->toDateString(),
                'current_quantity' => $quantityReceived,
                'available_quantity' => $quantityReceived,
                'on_order_quantity' => max(0, $orderItem->quantity_ordered - $quantityReceived),
                'average_cost' => $orderItem->unit_price,
                
                'last_updated' => now(),
            ]);
            $stockLevel->calculateTotalValue();
            $stockLevel->save();
        } else {
            // Update existing stock level
            $stockLevel->current_quantity += $quantityReceived;
            $stockLevel->available_quantity += $quantityReceived;
            $stockLevel->on_order_quantity = max(0, $stockLevel->on_order_quantity - $quantityReceived);
            
            // Update average cost (weighted average)
            $this->updateAverageCost($stockLevel, $quantityReceived, $orderItem->unit_price);
            
            $stockLevel->calculateTotalValue();
            $stockLevel->save();
        }
        
        // Calculate total value for the transaction
        $totalValue = $quantityReceived * $orderItem->unit_price;
        
        // Create inventory transaction with all required fields
        InventoryTransaction::create([
            'transaction_id' => (string) \Illuminate\Support\Str::uuid(),
            'university_id' => $orderItem->purchaseOrder->university_id,
            'item_id' => $orderItem->item_id,
            'department_id' => $orderItem->purchaseOrder->department_id,
            'transaction_type' => 'purchase',
            'quantity' => $quantityReceived,
            'unit_cost' => $orderItem->unit_price,
            'total_value' => $totalValue,
            'transaction_date' => now(),
            'reference_id' => $orderItem->order_item_id,
            'source_location_id' => $orderItem->purchaseOrder->university->location_id,
            'destination_location_id' => $orderItem->purchaseOrder->university->location_id,
            'reference_number' => $orderItem->purchaseOrder->po_number,
            'notes' => "Received from PO: {$orderItem->purchaseOrder->po_number}",
            'status' => 'completed',
            'performed_by' => Auth::id() ?? $orderItem->purchaseOrder->created_by,
        ]);
        
        Log::info('Inventory updated from receipt', [
            'item_id' => $orderItem->item_id,
            'quantity' => $quantityReceived,
            'purchase_order_item_id' => $orderItem->order_item_id,
            'stock_level_id' => $stockLevel->stock_id
        ]);
    }

    /**
     * Reverse received inventory (for cancellations or corrections)
     */
    private function reverseReceivedInventory(PurchaseOrderItem $orderItem, int $quantityToReverse)
    {
        if ($quantityToReverse <= 0) return;

        $stockLevel = StockLevel::where('item_id', $orderItem->item_id)->first();
        
        if (!$stockLevel || $stockLevel->current_quantity < $quantityToReverse) {
            throw new \Exception('Insufficient stock to reverse');
        }

        // Load relationships if needed
        if (!$orderItem->relationLoaded('purchaseOrder')) {
            $orderItem->load('purchaseOrder');
        }

        // Update stock level
        $stockLevel->current_quantity -= $quantityToReverse;
        $stockLevel->available_quantity -= $quantityToReverse;
        $stockLevel->on_order_quantity += $quantityToReverse; // Put it back on order
        $stockLevel->calculateTotalValue();
        $stockLevel->save();
        
        // Create reverse transaction with all required fields
        InventoryTransaction::create([
            'transaction_id' => (string) \Illuminate\Support\Str::uuid(),
            'university_id' => $orderItem->purchaseOrder->university_id,
            'item_id' => $orderItem->item_id,
            'department_id' => $orderItem->purchaseOrder->department_id,
            'transaction_type' => 'adjustment',
            'quantity' => -$quantityToReverse,
            'unit_cost' => $orderItem->unit_price,
            'total_value' => -($quantityToReverse * $orderItem->unit_price),
            'transaction_date' => now(),
            'reference_id' => $orderItem->order_item_id,
            'reference_number' => $orderItem->purchaseOrder->po_number,
            'notes' => "Reversal from PO item cancellation: {$orderItem->purchaseOrder->po_number}",
            'status' => 'completed',
            'performed_by' => Auth::id() ?? $orderItem->purchaseOrder->created_by,
        ]);
        
        Log::info('Inventory reversed from cancellation', [
            'item_id' => $orderItem->item_id,
            'quantity' => $quantityToReverse,
            'purchase_order_item_id' => $orderItem->order_item_id
        ]);
    }

    /**
     * Update average cost using weighted average method
     */
    private function updateAverageCost(StockLevel $stockLevel, int $newQuantity, float $newUnitCost)
    {
        $currentTotalValue = $stockLevel->current_quantity * $stockLevel->average_cost;
        $newTotalValue = $newQuantity * $newUnitCost;
        $totalQuantity = $stockLevel->current_quantity + $newQuantity;
        
        if ($totalQuantity > 0) {
            $stockLevel->average_cost = ($currentTotalValue + $newTotalValue) / $totalQuantity;
        }
    }
    
    /**
     * Remove the specified purchase order item from storage.
     */
    public function destroy($id)
    {
        $purchaseOrderItem = PurchaseOrderItem::findOrFail($id);
        
        DB::beginTransaction();
        
        try {
            $purchaseOrderItem->delete();
            
            DB::commit();
            
            return redirect()->route('purchase-order-items.index')
                ->with('success', 'Purchase order item deleted successfully!');
                
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting purchase order item:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to delete purchase order item: ' . $e->getMessage());
        }
    }

    /**
     * Get purchase order items by purchase order (API endpoint)
     */
    public function getByPurchaseOrder($orderId)
    {
        try {
            $purchaseOrderItems = PurchaseOrderItem::with(['purchaseOrder', 'inventoryItem'])
                ->where('order_id', $orderId)
                ->latest()
                ->get();
                
            return response()->json($purchaseOrderItems);
        } catch (\Exception $e) {
            Log::error('Error fetching purchase order items:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to fetch purchase order items'], 500);
        }
    }

    /**
     * Update item status
     */
    public function updateStatus(Request $request, $id)
    {
        $purchaseOrderItem = PurchaseOrderItem::with(['purchaseOrder', 'inventoryItem'])->findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:ordered,partially_received,received,cancelled',
            'quantity_received' => 'integer|min:0',
            'quantity_cancelled' => 'integer|min:0',
            'actual_delivery_date' => 'nullable|date',
        ]);

        DB::beginTransaction();
        
        try {
            $purchaseOrderItem->update($validated);
            
            DB::commit();
            
            return back()->with('success', 'Item status updated successfully!');
                
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating item status:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to update item status: ' . $e->getMessage());
        }
    }

    /**
     * Receive partial quantity
     */
    public function receivePartial(Request $request, $id)
    {
        $purchaseOrderItem = PurchaseOrderItem::with(['purchaseOrder', 'inventoryItem'])->findOrFail($id);
        
        $validated = $request->validate([
            'quantity_received' => 'required|integer|min:1',
            'actual_delivery_date' => 'nullable|date',
        ]);

        DB::beginTransaction();
        
        try {
            $newQuantityReceived = $purchaseOrderItem->quantity_received + $validated['quantity_received'];
            
            // Validate we don't exceed ordered quantity
            if ($newQuantityReceived > $purchaseOrderItem->quantity_ordered) {
                throw new \Exception('Cannot receive more than ordered quantity');
            }

            // Update status based on received quantity
            $status = 'ordered';
            if ($newQuantityReceived >= $purchaseOrderItem->quantity_ordered) {
                $status = 'received';
            } elseif ($newQuantityReceived > 0) {
                $status = 'partially_received';
            }

            $purchaseOrderItem->update([
                'quantity_received' => $newQuantityReceived,
                'actual_delivery_date' => $validated['actual_delivery_date'] ?? now(),
                'status' => $status,
            ]);

            // Update inventory for the received quantity
            $this->updateInventoryFromReceipt($purchaseOrderItem, $validated['quantity_received']);
            
            DB::commit();
            
            return back()->with('success', 'Item quantity received successfully!');
                
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error receiving partial quantity:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to receive quantity: ' . $e->getMessage());
        }
    }
}