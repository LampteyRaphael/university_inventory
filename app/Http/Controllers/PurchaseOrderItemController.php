<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrderItem;
use App\Models\PurchaseOrder;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PurchaseOrderItemController extends Controller
{
    /**
     * Display a listing of the purchase order items.
     */
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

            return Inertia::render('PurchaseOrders/PurchaseOrdersItems')
                ->with([
                    'orderItems' => Inertia::defer(fn () => $purchaseOrderItems),
                    
                    'purchaseOrders' => Inertia::defer(fn () => 
                        PurchaseOrder::select('order_id', 'po_number')
                            ->orderBy('po_number')
                            ->get()
                    ),
                    'inventoryItems' => Inertia::defer(fn () => 
                        InventoryItem::select('item_id', 'name', 'item_code')
                            ->orderBy('name')
                            ->get()
                    ),
                    
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
            'line_total' => 'required|numeric|min:0',
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
            
            $purchaseOrderItem = PurchaseOrderItem::create($validated);
            
            DB::commit();
            
            return redirect()->route('purchase-order-items.index')
                ->with('success', 'Purchase order item created successfully!');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->with('error', 'Failed to create purchase order item: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Update the specified purchase order item in storage.
     */
    public function update(Request $request, $id)
    {
        $purchaseOrderItem = PurchaseOrderItem::findOrFail($id);
                
        $validated = $request->validate([
            'order_id' => 'required|exists:purchase_orders,order_id',
            'item_id' => 'required|exists:inventory_items,item_id',
            'quantity_ordered' => 'required|integer|min:1',
            'quantity_received' => 'integer|min:0',
            'quantity_cancelled' => 'integer|min:0',
            'unit_price' => 'required|numeric|min:0',
            'tax_rate' => 'numeric|min:0|max:100',
            'discount_rate' => 'numeric|min:0|max:100',
            'line_total' => 'required|numeric|min:0',
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
            $purchaseOrderItem->update($validated);
            
            DB::commit();
            
            return redirect()->route('purchase-order-items.index')
                ->with('success', 'Purchase order item updated successfully!');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->with('error', 'Failed to update purchase order item: ' . $e->getMessage())
                ->withInput();
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
            
            return back()->with('error', 'Failed to delete purchase order item: ' . $e->getMessage());
        }
    }

    /**
     * Get purchase order items by purchase order (API endpoint)
     */
    public function getByPurchaseOrder($orderId)
    {
        $purchaseOrderItems = PurchaseOrderItem::with(['purchaseOrder', 'inventoryItem'])
            ->where('order_id', $orderId)
            ->latest()
            ->get();
            
        return response()->json($purchaseOrderItems);
    }

    /**
     * Update item status
     */
    public function updateStatus(Request $request, $id)
    {
        $purchaseOrderItem = PurchaseOrderItem::findOrFail($id);
        
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
            
            return back()->with('error', 'Failed to update item status: ' . $e->getMessage());
        }
    }

    /**
     * Receive partial quantity
     */
    public function receivePartial(Request $request, $id)
    {
        $purchaseOrderItem = PurchaseOrderItem::findOrFail($id);
        
        $validated = $request->validate([
            'quantity_received' => 'required|integer|min:0',
            'actual_delivery_date' => 'nullable|date',
        ]);

        DB::beginTransaction();
        
        try {
            $newQuantityReceived = $purchaseOrderItem->quantity_received + $validated['quantity_received'];
            
            // Update status based on received quantity
            $status = 'ordered';
            if ($newQuantityReceived >= $purchaseOrderItem->quantity_ordered) {
                $status = 'received';
            } elseif ($newQuantityReceived > 0) {
                $status = 'partially_received';
            }

            $purchaseOrderItem->update([
                'quantity_received' => $newQuantityReceived,
                'actual_delivery_date' => $validated['actual_delivery_date'] ?? $purchaseOrderItem->actual_delivery_date,
                'status' => $status,
            ]);
            
            DB::commit();
            
            return back()->with('success', 'Item quantity updated successfully!');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->with('error', 'Failed to update item quantity: ' . $e->getMessage());
        }
    }
}