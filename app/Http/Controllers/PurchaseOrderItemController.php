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
                'orderItems' => Inertia::defer(fn () => $purchaseOrderItems),
                'purchaseOrders' => Inertia::defer(fn () => PurchaseOrder::select('order_id', 'po_number')
                    ->orderBy('po_number')
                    ->get()),
                'inventoryItems' => Inertia::defer(fn () =>  InventoryItem::select('item_id', 'name', 'item_code')
                    ->orderBy('name')
                    ->get()),
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
            'quantity_received' => 'required|integer|min:0',
            'quantity_cancelled' => 'required|integer|min:0',
            'unit_price' => 'required|numeric|min:0',
            'tax_rate' => 'numeric|min:0|max:100',
            'discount_rate' => 'numeric|min:0|max:100',
            'line_total' => 'numeric|min:0',
            'expected_delivery_date' => 'nullable|date',
            'actual_delivery_date' => 'nullable|date',
            'status' => 'required|in:ordered,partially_received,received,cancelled',
            'notes' => 'nullable|string',
        ]);

        // Validate quantities don't exceed ordered quantity
        $totalProcessed = $validated['quantity_received'] + $validated['quantity_cancelled'];
        if ($totalProcessed > $validated['quantity_ordered']) {
            return back()->with('error', 'Total received and cancelled quantities cannot exceed ordered quantity')->withInput();
        }

        DB::beginTransaction();
        
        try {
            // Log::info('Starting purchase order item update', [
            //     'order_item_id' => $id,
            //     'original_received' => $originalQuantityReceived,
            //     'new_received' => $validated['quantity_received'],
            //     'original_cancelled' => $originalQuantityCancelled,
            //     'new_cancelled' => $validated['quantity_cancelled'],
            //     'original_status' => $originalStatus,
            //     'new_status' => $validated['status']
            // ]);

            // Update the purchase order item WITHOUT triggering model events
            $purchaseOrderItem->update($validated);

            // Handle quantity changes FIRST
            $this->handleQuantityChanges($purchaseOrderItem, $originalQuantityReceived, $originalQuantityCancelled);
            
            // Then handle status changes
            $this->handleStatusUpdate($purchaseOrderItem, $originalStatus, $validated['status']);
            
            DB::commit();
            
            // Log::info('Purchase order item updated successfully', [
            //     'order_item_id' => $id,
            //     'final_received' => $purchaseOrderItem->quantity_received,
            //     'final_cancelled' => $purchaseOrderItem->quantity_cancelled,
            //     'final_status' => $purchaseOrderItem->status
            // ]);

            return redirect()->route('purchase-order-items.index')
                ->with('success', 'Purchase order item updated successfully!');
                
        } catch (\Exception $e) {
            DB::rollBack();
            // Log::error('Error updating purchase order item:', [
            //     'error' => $e->getMessage(), 
            //     'item_id' => $id,
            //     'original_status' => $originalStatus,
            //     'new_status' => $validated['status'] ?? 'unknown'
            // ]);
            
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
            Log::info('Status unchanged, skipping status update', [
                'order_item_id' => $orderItem->order_item_id,
                'status' => $newStatus
            ]);
            return;
        }

        Log::info('Processing status change', [
            'order_item_id' => $orderItem->order_item_id,
            'from_status' => $originalStatus,
            'to_status' => $newStatus
        ]);

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

        // Log::info('Checking quantity changes', [
        //     'order_item_id' => $orderItem->order_item_id,
        //     'qty_received_changed' => $qtyReceivedChanged,
        //     'qty_cancelled_changed' => $qtyCancelledChanged,
        //     'old_received' => $originalQtyReceived,
        //     'new_received' => $orderItem->quantity_received,
        //     'old_cancelled' => $originalQtyCancelled,
        //     'new_cancelled' => $orderItem->quantity_cancelled
        // ]);

        if ($qtyReceivedChanged) {
            $difference = $orderItem->quantity_received;
            //  - $originalQtyReceived;
            $this->handleReceivedQuantityChange($orderItem, $difference);
        }

        if ($qtyCancelledChanged) {
            $difference = $orderItem->quantity_cancelled - $originalQtyCancelled;
            $this->handleCancelledQuantityChange($orderItem, $difference);
        }
    }

    /**
     * Handle when status changes to 'received'
     */
    private function handleReceivedStatus(PurchaseOrderItem $orderItem, string $originalStatus)
    {
        // Log::info('Handling received status', [
        //     'order_item_id' => $orderItem->order_item_id,
        //     'original_status' => $originalStatus,
        //     'current_received' => $orderItem->quantity_received,
        //     'current_ordered' => $orderItem->quantity_ordered
        // ]);

        // Only auto-receive if coming from ordered or partially_received
        if (in_array($originalStatus, ['ordered', 'partially_received'])) {
            $pendingQuantity = $orderItem->quantity_ordered - $orderItem->quantity_received - $orderItem->quantity_cancelled;
            
            // Log::info('Auto-receiving pending quantity', [
            //     'order_item_id' => $orderItem->order_item_id,
            //     'pending_quantity' => $pendingQuantity
            // ]);

            if ($pendingQuantity > 0) {
                // Update the received quantity to include pending items
                $newReceivedQuantity = $orderItem->quantity_received + $pendingQuantity;
                
                // Update inventory for the pending quantities only
                $this->updateInventoryFromReceipt($orderItem, $pendingQuantity);
                
                // Update the purchase order item
                $orderItem->update([
                    'quantity_received' => $newReceivedQuantity,
                    'actual_delivery_date' => $orderItem->actual_delivery_date ?? now(),
                ]);

                // Log::info('Auto-received pending quantities', [
                //     'order_item_id' => $orderItem->order_item_id,
                //     'pending_received' => $pendingQuantity,
                //     'new_total_received' => $newReceivedQuantity
                // ]);
            }
        }
    }

    /**
     * Handle when status changes to 'partially_received'
     */
    private function handlePartiallyReceivedStatus(PurchaseOrderItem $orderItem, string $originalStatus)
    {
        // Log::info('Handling partially received status', [
        //     'order_item_id' => $orderItem->order_item_id,
        //     'original_status' => $originalStatus,
        //     'current_received' => $orderItem->quantity_received
        // ]);

        // Ensure we have some received quantity
        if ($orderItem->quantity_received === 0) {
            throw new \Exception('Partially received status requires at least some quantity received');
        }

        // If coming from ordered and we have received quantity, ensure inventory is updated
        if ($originalStatus === 'ordered' && $orderItem->quantity_received > 0) {
            // Log::info('Updating inventory for initial receipt in partially received', [
            //     'order_item_id' => $orderItem->order_item_id,
            //     'quantity_received' => $orderItem->quantity_received
            // ]);
            // Note: The actual inventory update should be handled by quantity change logic
        }
    }

    /**
     * Handle when status changes to 'cancelled'
     */
    private function handleCancelledStatus(PurchaseOrderItem $orderItem, string $originalStatus)
    {
        // Log::info('Handling cancelled status', [
        //     'order_item_id' => $orderItem->order_item_id,
        //     'original_status' => $originalStatus,
        //     'current_received' => $orderItem->quantity_received,
        //     'current_cancelled' => $orderItem->quantity_cancelled
        // ]);

        // If we have received quantities that are now being cancelled, we need to reverse them
        if ($orderItem->quantity_received > 0) {
            // Log::info('Reversing received inventory due to cancellation', [
            //     'order_item_id' => $orderItem->order_item_id,
            //     'quantity_to_reverse' => $orderItem->quantity_received
            // ]);
            $this->reverseReceivedInventory($orderItem, $orderItem->quantity_received);
        }
        
        // Cancel all pending quantities
        $pendingQuantity = $orderItem->quantity_ordered - $orderItem->quantity_received - $orderItem->quantity_cancelled;
        if ($pendingQuantity > 0) {
            // Log::info('Cancelling pending quantities', [
            //     'order_item_id' => $orderItem->order_item_id,
            //     'pending_quantity' => $pendingQuantity
            // ]);
            $orderItem->increment('quantity_cancelled', $pendingQuantity);
        }
    }

    /**
     * Handle when status changes to 'ordered'
     */
    private function handleOrderedStatus(PurchaseOrderItem $orderItem, string $originalStatus)
    {
        // Log::info('Handling ordered status', [
        //     'order_item_id' => $orderItem->order_item_id,
        //     'original_status' => $originalStatus,
        //     'current_received' => $orderItem->quantity_received
        // ]);

        // If coming from received/partially_received, reverse inventory transactions
        if (in_array($originalStatus, ['received', 'partially_received']) && $orderItem->quantity_received > 0) {
            // Log::info('Reversing inventory due to status change back to ordered', [
            //     'order_item_id' => $orderItem->order_item_id,
            //     'quantity_to_reverse' => $orderItem->quantity_received
            // ]);
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
    private function handleReceivedQuantityChange(PurchaseOrderItem $orderItem, int $difference)
    {
        // Log::info('Handling received quantity change', [
        //     'order_item_id' => $orderItem->order_item_id,
        //     'difference' => $difference
        // ]);

        if ($difference > 0) {
            // Received more items - add to inventory
            // Log::info('Adding received items to inventory', [
            //     'order_item_id' => $orderItem->order_item_id,
            //     'quantity' => $difference
            // ]);
            $this->updateInventoryFromReceipt($orderItem, $difference);
        } elseif ($difference < 0) {
            // Received less items - reverse from inventory
            // Log::info('Reversing received items from inventory', [
            //     'order_item_id' => $orderItem->order_item_id,
            //     'quantity' => abs($difference)
            // ]);
            $this->reverseReceivedInventory($orderItem, abs($difference));
        }
    }

    /**
     * Handle changes in cancelled quantity
     */
    private function handleCancelledQuantityChange(PurchaseOrderItem $orderItem, int $difference)
    {
        // Log::info('Handling cancelled quantity change', [
        //     'order_item_id' => $orderItem->order_item_id,
        //     'difference' => $difference
        // ]);

        if ($difference > 0) {
            // If we're cancelling items that were previously received, reverse them from inventory
            $receivedToReverse = min($difference, $orderItem->quantity_received);
            if ($receivedToReverse > 0) {
                // Log::info('Reversing received items due to cancellation', [
                //     'order_item_id' => $orderItem->order_item_id,
                //     'quantity' => $receivedToReverse
                // ]);
                $this->reverseReceivedInventory($orderItem, $receivedToReverse);
            }
        }
    }

    /**
     * Update inventory stock levels and create transaction record
     */
    private function updateInventoryFromReceipt(PurchaseOrderItem $orderItem, int $quantityReceived)
    {
        if ($quantityReceived <= 0) {
            // Log::warning('Attempted to update inventory with zero or negative quantity', [
            //     'order_item_id' => $orderItem->order_item_id,
            //     'quantity' => $quantityReceived
            // ]);
            return;
        }

        // Log::info('Updating inventory from receipt', [
        //     'order_item_id' => $orderItem->order_item_id,
        //     'item_id' => $orderItem->item_id,
        //     'quantity' => $quantityReceived
        // ]);

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
                'on_order_quantity' => max(0, $orderItem->quantity_ordered - $orderItem->quantity_received),
                'average_cost' => $orderItem->unit_price,
                
                'last_updated' => now(),
            ]);
            $stockLevel->calculateTotalValue();
            $stockLevel->save();

            // Log::info('Created new stock level', [
            //     'stock_id' => $stockLevel->stock_id,
            //     'item_id' => $orderItem->item_id,
            //     'initial_quantity' => $quantityReceived
            // ]);
        } else {
            // Update existing stock level
            $previousQuantity = $stockLevel->current_quantity;
            $stockLevel->current_quantity += $quantityReceived;
            $stockLevel->available_quantity += $quantityReceived;
            
            // Calculate on_order_quantity based on purchase order item
            $remainingOnOrder = max(0, $orderItem->quantity_ordered - $orderItem->quantity_received);
            $stockLevel->on_order_quantity = max(0, $remainingOnOrder);
            
            // Update average cost (weighted average)
            $this->updateAverageCost($stockLevel, $quantityReceived, $orderItem->unit_price);
            
            $stockLevel->calculateTotalValue();
            $stockLevel->save();

            // Log::info('Updated existing stock level', [
            //     'stock_id' => $stockLevel->stock_id,
            //     'item_id' => $orderItem->item_id,
            //     'previous_quantity' => $previousQuantity,
            //     'added_quantity' => $quantityReceived,
            //     'new_quantity' => $stockLevel->current_quantity,
            //     'new_on_order_quantity' => $stockLevel->on_order_quantity
            // ]);
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
        
        // Log::info('Inventory updated from receipt', [
        //     'item_id' => $orderItem->item_id,
        //     'quantity' => $quantityReceived,
        //     'purchase_order_item_id' => $orderItem->order_item_id,
        //     'stock_level_id' => $stockLevel->stock_id
        // ]);
    }

    /**
     * Reverse received inventory (for cancellations or corrections)
     */
    private function reverseReceivedInventory(PurchaseOrderItem $orderItem, int $quantityToReverse)
    {
        if ($quantityToReverse <= 0) {
            // Log::warning('Attempted to reverse inventory with zero or negative quantity', [
            //     'order_item_id' => $orderItem->order_item_id,
            //     'quantity' => $quantityToReverse
            // ]);
            return;
        }

        // Log::info('Reversing received inventory', [
        //     'order_item_id' => $orderItem->order_item_id,
        //     'item_id' => $orderItem->item_id,
        //     'quantity' => $quantityToReverse
        // ]);

        $stockLevel = StockLevel::where('item_id', $orderItem->item_id)->first();
        
        if (!$stockLevel) {
            // Log::error('No stock level found for item when trying to reverse', [
            //     'item_id' => $orderItem->item_id
            // ]);
            throw new \Exception('No stock level found for this item');
        }

        if ($stockLevel->current_quantity < $quantityToReverse) {
            // Log::error('Insufficient stock to reverse', [
            //     'item_id' => $orderItem->item_id,
            //     'current_stock' => $stockLevel->current_quantity,
            //     'quantity_to_reverse' => $quantityToReverse
            // ]);
            throw new \Exception('Insufficient stock to reverse');
        }

        // Load relationships if needed
        if (!$orderItem->relationLoaded('purchaseOrder')) {
            $orderItem->load('purchaseOrder');
        }

        // Update stock level
        $previousQuantity = $stockLevel->current_quantity;
        $stockLevel->current_quantity -= $quantityToReverse;
        $stockLevel->available_quantity -= $quantityToReverse;
        
        // Update on_order_quantity - put it back on order
        $stockLevel->on_order_quantity += $quantityToReverse;
        
        $stockLevel->calculateTotalValue();
        $stockLevel->save();

        // Log::info('Stock level updated for reversal', [
        //     'stock_id' => $stockLevel->stock_id,
        //     'previous_quantity' => $previousQuantity,
        //     'reversed_quantity' => $quantityToReverse,
        //     'new_quantity' => $stockLevel->current_quantity,
        //     'new_on_order_quantity' => $stockLevel->on_order_quantity
        // ]);
        
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
        
        // Log::info('Inventory reversed from cancellation', [
        //     'item_id' => $orderItem->item_id,
        //     'quantity' => $quantityToReverse,
        //     'purchase_order_item_id' => $orderItem->order_item_id
        // ]);
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