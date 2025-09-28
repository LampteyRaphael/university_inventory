<?php

namespace App\Http\Controllers;

use App\Models\InventoryTransaction;
use App\Models\InventoryItem;
use App\Models\Department;
use App\Models\Location;
use App\Models\StockLevel;
use App\Repositories\InventoryTransactionRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class InventoryTransactionController extends Controller
{
    private $transactionRepository;

    public function __construct(InventoryTransactionRepository $inventoryRepository)
    {
        $this->transactionRepository = $inventoryRepository;
    }

    public function transactionIndex(Request $request)
    {
        try {
            $filters = $request->only([
                'university_id',
                'item_id', 
                'department_id',
                'transaction_type',
                'status',
                'reference_number',
                'batch_number',
                'performed_by',
                'start_date',
                'end_date',
                'search',
                'min_quantity',
                'max_quantity',
                'min_value',
                'max_value',
                'order_by',
                'order_direction'
            ]);

            $transactions = $this->transactionRepository->getAllTransactions($filters);
            
            // Get dropdown data
            $items = InventoryItem::select('item_id', 'item_code', 'name')
                ->orderBy('name')
                ->limit(100)
                ->get();
                
            $departments = Department::select('department_id', 'name')
                ->orderBy('name')
                ->limit(100)
                ->get();

                $locations = Location::select('location_id', 'name')
                ->orderBy('name')
                ->limit(100)
                ->get();

            $transactionTypes = [
                'purchase', 'sale', 'transfer', 'adjustment', 'return', 
                'write_off', 'consumption', 'production', 'donation'
            ];

            $statuses = ['pending', 'completed', 'cancelled', 'reversed'];

            // FIXED: Remove duplicate 'transactions' key
            return Inertia::render('Inventories/Inventories', [
                'transactions' => $transactions, // This is your paginated data
                'items' => $items,
                'locations'=>$locations,
                'departments' => $departments,
                'transactionTypes' => $transactionTypes,
                'statuses' => $statuses,
                'filters' => $filters // Changed from 'transactions' to 'filters'
            ]);

        } catch (\Exception $e) {
            Log::error('Transaction index error:', ['error' => $e->getMessage()]);
            
            return Inertia::render('Inventories/Inventories', [ // Fixed path consistency
                'transactions' => ['data' => []],
                'items' => [],
                'departments' => [],
                'transactionTypes' => [],
                'statuses' => [],
                'error' => 'Failed to load transactions'
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'university_id' => 'required|exists:universities,university_id',
            'item_id' => 'required|exists:inventory_items,item_id',
            'department_id' => 'required|exists:departments,department_id',
            'transaction_type' => 'required|in:' . implode(',', array_keys(InventoryTransaction::getTransactionTypes())),
            'quantity' => 'required|integer|min:1',
            'unit_cost' => 'required|numeric|min:0',
            'transaction_date' => 'required|date',
            'reference_number' => 'nullable|string|max:100',
            'reference_id' => 'nullable|string|max:50',
            'batch_number' => 'nullable|string|max:100',
            'expiry_date' => 'nullable|date|after_or_equal:today',
            'notes' => 'nullable|string|max:1000',
            'source_location_id' => 'nullable|exists:locations,location_id',
            'destination_location_id' => 'nullable|exists:locations,location_id',
            'status' => 'sometimes|in:' . implode(',', array_keys(InventoryTransaction::getStatusOptions())),
            'approved_by' => 'nullable|exists:users,name',
        ], [
            'item_id.required' => 'The inventory item is required.',
            'item_id.exists' => 'The selected inventory item does not exist.',
            'department_id.required' => 'The department is required.',
            'department_id.exists' => 'The selected department does not exist.',
            'transaction_type.required' => 'The transaction type is required.',
            'quantity.min' => 'Quantity must be at least 1.',
            'unit_cost.min' => 'Unit cost cannot be negative.',
            'expiry_date.after_or_equal' => 'Expiry date must be today or in the future.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Check if item exists and is active
            $item = InventoryItem::where('item_id', $request->item_id)
                ->where('university_id', $request->university_id)
                ->first();

            if (!$item) {
                return response()->json([
                    'success' => false,
                    'message' => 'Inventory item not found or does not belong to this university'
                ], 404);
            }

            if (!$item->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot create transaction for inactive inventory item'
                ], 422);
            }

            // Validate location access if provided
            if ($request->source_location_id) {
                $sourceLocation = Location::where('location_id', $request->source_location_id)
                    ->where('university_id', $request->university_id)
                    ->first();

                if (!$sourceLocation) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Source location not found or does not belong to this university'
                    ], 404);
                }
            }

            if ($request->destination_location_id) {
                $destinationLocation = Location::where('location_id', $request->destination_location_id)
                    ->where('university_id', $request->university_id)
                    ->first();

                if (!$destinationLocation) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Destination location not found or does not belong to this university'
                    ], 404);
                }
            }

            // Validate department belongs to university
            $department = Department::where('department_id', $request->department_id)
                ->where('university_id', $request->university_id)
                ->first();

            if (!$department) {
                return response()->json([
                    'success' => false,
                    'message' => 'Department not found or does not belong to this university'
                ], 404);
            }

            // Calculate total value
            $totalValue = $request->quantity * $request->unit_cost;

            // Create the transaction
            $transaction = new InventoryTransaction();
            $transaction->fill($request->all());
            $transaction->total_value = $totalValue;
            
            // Set default status if not provided
            if (!$request->has('status')) {
                $transaction->status = InventoryTransaction::STATUS_COMPLETED;
            }

            // $transaction->performed_by = Auth::user()->name??'';
            $transaction->save();

            // Update inventory item stock levels based on transaction type
            $this->updateInventoryStock($transaction);

            // Load relationships for response
            $transaction->load([
                'item', 
                'department', 
                'university', 
                'sourceLocation', 
                'destinationLocation',
                'performedBy',
                'approvedBy'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Inventory transaction created successfully',
                'data' => $transaction
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create inventory transaction',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    // end of store

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $transaction = InventoryTransaction::with([
            'item', 
            'department', 
            'university', 
            'sourceLocation', 
            'destinationLocation',
            'performedBy',
            'approvedBy',
            'reference'
        ])->find($id);

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Inventory transaction not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $transaction
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $transaction = InventoryTransaction::find($id);

        if (!$transaction) {
            return redirect()->route('inventory-transactions.index')->with('error', 'Inventory transaction not found');
        }

        // Prevent updates on completed transactions unless reversing
        if ($transaction->isCompleted() && $request->status !== InventoryTransaction::STATUS_REVERSED) {
            return redirect()->route('inventory-transactions.index')->with('error', 'Cannot update completed transaction. Consider reversing it instead.');
        }

        $validator = Validator::make($request->all(), [
            'item_id' => 'sometimes|required|exists:inventory_items,item_id',
            'department_id' => 'sometimes|required|exists:departments,department_id',
            'transaction_type' => 'sometimes|required|in:' . implode(',', array_keys(InventoryTransaction::getTransactionTypes())),
            'quantity' => 'sometimes|required|integer|min:1',
            'unit_cost' => 'sometimes|required|numeric|min:0',
            'transaction_date' => 'sometimes|required|date',
            'reference_number' => 'nullable|string|max:100',
            'reference_id' => 'nullable|string|max:50',
            'batch_number' => 'nullable|string|max:100',
            'expiry_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
            'source_location_id' => 'nullable|exists:locations,location_id',
            'destination_location_id' => 'nullable|exists:locations,location_id',
            'status' => 'sometimes|in:' . implode(',', array_keys(InventoryTransaction::getStatusOptions())),
            'approved_by' => 'nullable|exists:users,name',
        ], [
            'item_id.exists' => 'The selected inventory item does not exist.',
            'department_id.exists' => 'The selected department does not exist.',
            'quantity.min' => 'Quantity must be at least 1.',
            'unit_cost.min' => 'Unit cost cannot be negative.',
        ]);

        if ($validator->fails()) {
            return redirect()->route('inventory-transactions.index')->with('error', 'Validation failed');
        }

        try {
            DB::beginTransaction();

            // Store old values for inventory adjustment
            $oldQuantity = $transaction->quantity;
            $oldTransactionType = $transaction->transaction_type;

            // Update the transaction
            $transaction->fill($request->all());
            
            // Recalculate total value if quantity or unit cost changed
            if ($request->has('quantity') || $request->has('unit_cost')) {
                $transaction->total_value = $transaction->quantity * $transaction->unit_cost;
            }
            $transaction->performed_by=Auth::id();
            $transaction->approved_by=Auth::id();
            $transaction->save();

            // Update inventory stock levels if quantity or transaction type changed
            if ($request->has('quantity') || $request->has('transaction_type')) {
                $this->adjustInventoryStock($transaction, $oldQuantity, $oldTransactionType);
            }

            // Load relationships for response
            $transaction->load([
                'item', 
                'department', 
                'university', 
                'sourceLocation', 
                'destinationLocation',
                'performedBy',
                'approvedBy'
            ]);

            DB::commit();


            return redirect()->route('inventory-transactions.index')->with('success', 'Inventory Transaction created successfully!');
           
        } catch (\Exception $e) {
            DB::rollBack();
            
            return redirect()->route('inventory-transactions.index')->with('error', 'Failed to update inventory transaction');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $transaction = InventoryTransaction::find($id);

        if (!$transaction) {
            return redirect()->route('inventory-transactions.index')->with('error', 'Inventory transaction not found');
        }

        // Prevent deletion of completed transactions
        if ($transaction->isCompleted()) {
            return redirect()->route('inventory-transactions.index')->with('error', 'Cannot delete completed transaction. Consider reversing it instead.');
        }

        try {
            DB::beginTransaction();

            // Reverse inventory impact before deletion
            $this->reverseInventoryImpact($transaction);
            
            $transaction->delete();

            DB::commit();
            
            return redirect()->route('inventory-transactions.index')->with('success', 'Inventory transaction deleted successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('inventory-transactions.index')->with('error', 'Failed to delete inventory transaction');
        }
    }

    /**
     * Reverse a transaction
     */
    public function reverse(Request $request, string $id)
    {
        $transaction = InventoryTransaction::find($id);

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Inventory transaction not found'
            ], 404);
        }

        if ($transaction->isReversed()) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction is already reversed'
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Create reversal transaction
            $reversal = new InventoryTransaction();
            $reversal->fill($transaction->toArray());
            $reversal->transaction_id = (string) \Illuminate\Support\Str::uuid();
            $reversal->quantity = -$transaction->quantity; // Reverse the quantity
            $reversal->total_value = -$transaction->total_value; // Reverse the value
            $reversal->status = InventoryTransaction::STATUS_REVERSED;
            $reversal->notes = 'Reversal of transaction ' . $transaction->transaction_id . '. ' . ($request->notes ?? '');
            $reversal->reference_id = $transaction->transaction_id;
            $reversal->reference_number = 'REV-' . $transaction->reference_number;
            $reversal->save();

            // Update original transaction status
            $transaction->status = InventoryTransaction::STATUS_REVERSED;
            $transaction->save();

            // Update inventory stock
            $this->updateInventoryStock($reversal);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transaction reversed successfully',
                'data' => $reversal->load(['item', 'department', 'performedBy'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to reverse transaction',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Update inventory stock based on transaction
     */
    
    // private function updateInventoryStock(InventoryTransaction $transaction)
    // {
    // if (!$transaction->item || !$transaction->isCompleted()) {
    //     return;
    // }

    // Update or create stock level record
    // $stockLevel = StockLevel::firstOrCreate(
    //     [
    //         'item_id' => $transaction->item_id,
    //         'department_id' => $transaction->department_id,
    //         'location_id' => $transaction->destination_location_id ?: $transaction->source_location_id,
    //         'university_id' => $transaction->university_id
    //     ],
    //     [
    //         'stock_id' => (string) \Illuminate\Support\Str::uuid(),
    //         'current_quantity' => 0,
    //         'committed_quantity' => 0,
    //         'available_quantity' => 0,
    //         'on_order_quantity' => 0,
    //         'average_cost' => 0,
    //         'total_value' => 0,
    //         'reorder_level' => 0,
    //         'safety_stock' => 0,
    //         'lead_time_days' => 0,
    //         'service_level' => 95,
    //         'last_updated' => now()
    //     ]
    // );

    // if ($transaction->isInventoryIncrement()) {
    //     $stockLevel->increment('current_quantity', $transaction->quantity);
    //     $stockLevel->increment('available_quantity', $transaction->quantity);
    // } elseif ($transaction->isInventoryDecrement()) {
    //     $stockLevel->decrement('current_quantity', $transaction->quantity);
    //     $stockLevel->decrement('available_quantity', $transaction->quantity);
    // }

    // // Recalculate average cost and total value
    //     $this->recalculateStockLevelValues($stockLevel);
    // }

    // private function recalculateStockLevelValues(StockLevel $stockLevel)
    // {
    //     // Implement your average cost calculation logic here
    //     // This is a simplified version - you might want weighted average
    //     $stockLevel->total_value = $stockLevel->current_quantity * $stockLevel->average_cost;
    //     $stockLevel->last_updated = now();
    //     $stockLevel->save();
    // }

    /**
 * Update inventory stock based on transaction
 */
private function updateInventoryStock(InventoryTransaction $transaction)
{
    if (!$transaction->item || !$transaction->isCompleted()) {
        return;
    }

    try {
        // Get the location ID (prefer destination over source)
        $locationId = $transaction->destination_location_id ?: $transaction->source_location_id;

        // Update or create stock level record
        $stockLevel = StockLevel::firstOrCreate(
            [
                'item_id' => $transaction->item_id,
                'department_id' => $transaction->department_id,
                'location_id' => $locationId,
                'university_id' => $transaction->university_id
            ],
            [
            'stock_id' => (string) \Illuminate\Support\Str::uuid(),
            'current_quantity' => 0,
            'committed_quantity' => 0,
            'available_quantity' => 0,
            'on_order_quantity' => 0,
            'average_cost' => $transaction->unit_cost,
            'total_value' => 0,
            // Set from transaction or use defaults
            'reorder_level' => $transaction->reorder_level ?? 0,
            'safety_stock' => $transaction->safety_stock ?? 0,
            'max_level' => $transaction->max_level ?? null,
            'lead_time_days' => $transaction->lead_time_days ?? 0,
            'service_level' => $transaction->service_level ?? 95,
            'last_updated' => now()
        ]
        );

        // Store old values for average cost calculation
        $oldQuantity = $stockLevel->current_quantity;
        $oldAverageCost = $stockLevel->average_cost;
        
        if ($transaction->isInventoryIncrement()) {
            // For incoming stock, update current quantity
            $stockLevel->increment('current_quantity', $transaction->quantity);
            $stockLevel->increment('available_quantity', $transaction->quantity);
            
            // Recalculate weighted average cost
            $this->recalculateAverageCost($stockLevel, $oldQuantity, $oldAverageCost, $transaction);
            
        } elseif ($transaction->isInventoryDecrement()) {
            // For outgoing stock, check if enough stock is available
            if ($stockLevel->available_quantity < $transaction->quantity) {
                throw new \Exception("Insufficient stock available. Available: {$stockLevel->available_quantity}, Requested: {$transaction->quantity}");
            }
            
            $stockLevel->decrement('current_quantity', $transaction->quantity);
            $stockLevel->decrement('available_quantity', $transaction->quantity);
            
            // For decrements, average cost remains the same (FIFO assumption)
        }

        // Recalculate total value
        $this->recalculateStockLevelValues($stockLevel);

    } catch (\Exception $e) {
        Log::error('Failed to update inventory stock: ' . $e->getMessage());
        throw $e;
    }
}


/**
 * Adjust inventory stock when transaction is updated
 */
private function adjustInventoryStock(InventoryTransaction $transaction, $oldQuantity, $oldTransactionType)
{
    if (!$transaction->item || !$transaction->isCompleted()) {
        return;
    }

    try {
        // Reverse old impact first
        $this->reverseTransactionImpact($transaction, $oldQuantity, $oldTransactionType);
        
        // Apply new impact
        $this->updateInventoryStock($transaction);

    } catch (\Exception $e) {
        Log::error('Failed to adjust inventory stock: ' . $e->getMessage());
        throw $e;
    }
}


/**
 * Reverse inventory impact before deletion
 */
private function reverseInventoryImpact(InventoryTransaction $transaction)
{
    if (!$transaction->item || !$transaction->isCompleted()) {
        return;
    }

    $locationId = $transaction->destination_location_id ?: $transaction->source_location_id;
    
    $stockLevel = StockLevel::where([
        'item_id' => $transaction->item_id,
        'department_id' => $transaction->department_id,
        'location_id' => $locationId,
        'university_id' => $transaction->university_id
    ])->first();

    if (!$stockLevel) {
        return;
    }

    if ($transaction->isInventoryIncrement()) {
        $stockLevel->decrement('current_quantity', $transaction->quantity);
        $stockLevel->decrement('available_quantity', $transaction->quantity);
    } elseif ($transaction->isInventoryDecrement()) {
        $stockLevel->increment('current_quantity', $transaction->quantity);
        $stockLevel->increment('available_quantity', $transaction->quantity);
    }

    $this->recalculateStockLevelValues($stockLevel);
}
/**
 * Reverse the impact of a previous transaction
 */
private function reverseTransactionImpact(InventoryTransaction $transaction, $oldQuantity, $oldTransactionType)
{
    $locationId = $transaction->destination_location_id ?: $transaction->source_location_id;
    
    $stockLevel = StockLevel::where([
        'item_id' => $transaction->item_id,
        'department_id' => $transaction->department_id,
        'location_id' => $locationId,
        'university_id' => $transaction->university_id
    ])->first();

    if (!$stockLevel) {
        return; // No stock level record found to reverse
    }

    // Reverse the old transaction impact
    if (in_array($oldTransactionType, ['purchase', 'return', 'production', 'donation', 'adjustment'])) {
        // Reverse increment
        $stockLevel->decrement('current_quantity', $oldQuantity);
        $stockLevel->decrement('available_quantity', $oldQuantity);
    } elseif (in_array($oldTransactionType, ['sale', 'transfer', 'write_off', 'consumption'])) {
        // Reverse decrement
        $stockLevel->increment('current_quantity', $oldQuantity);
        $stockLevel->increment('available_quantity', $oldQuantity);
    }

    $this->recalculateStockLevelValues($stockLevel);
}

/**
 * Recalculate weighted average cost for stock level
 */
private function recalculateAverageCost(StockLevel $stockLevel, $oldQuantity, $oldAverageCost, InventoryTransaction $transaction)
{
    if ($transaction->isInventoryIncrement()) {
        // Weighted average cost calculation
        $oldTotalValue = $oldQuantity * $oldAverageCost;
        $newTotalValue = $transaction->quantity * $transaction->unit_cost;
        $totalQuantity = $oldQuantity + $transaction->quantity;
        
        if ($totalQuantity > 0) {
            $stockLevel->average_cost = ($oldTotalValue + $newTotalValue) / $totalQuantity;
        }
    }
    // For decrements, average cost doesn't change (FIFO)
}

/**
 * Recalculate stock level values
 */
private function recalculateStockLevelValues(StockLevel $stockLevel)
{
    // Ensure available quantity doesn't exceed current quantity
    $stockLevel->available_quantity = max(0, min(
        $stockLevel->current_quantity - $stockLevel->committed_quantity,
        $stockLevel->current_quantity
    ));
    
    // Calculate total value
    $stockLevel->total_value = $stockLevel->current_quantity * $stockLevel->average_cost;
    $stockLevel->last_updated = now();
    $stockLevel->save();
}
    /**
     * Adjust inventory stock when transaction is updated
     */
    // private function adjustInventoryStock(InventoryTransaction $transaction, $oldQuantity, $oldTransactionType)
    // {
    //     if (!$transaction->item || !$transaction->isCompleted()) {
    //         return;
    //     }

    //     $item = $transaction->item;

    //     // Reverse old impact
    //     if (in_array($oldTransactionType, array_keys(InventoryTransaction::getTransactionTypes()))) {
    //         $oldTransaction = new InventoryTransaction();
    //         $oldTransaction->transaction_type = $oldTransactionType;
    //         $oldTransaction->quantity = $oldQuantity;

    //         if ($oldTransaction->isInventoryIncrement()) {
    //             $item->decrement('current_stock', $oldQuantity);
    //         } elseif ($oldTransaction->isInventoryDecrement()) {
    //             $item->increment('current_stock', $oldQuantity);
    //         }
    //     }

    //     // Apply new impact
    //     $this->updateInventoryStock($transaction);
    // }

    /**
     * Reverse inventory impact before deletion
     */
    // private function reverseInventoryImpact(InventoryTransaction $transaction)
    // {
    //     if (!$transaction->item || !$transaction->isCompleted()) {
    //         return;
    //     }

    //     $item = $transaction->item;

    //     if ($transaction->isInventoryIncrement()) {
    //         $item->decrement('current_stock', $transaction->quantity);
    //     } elseif ($transaction->isInventoryDecrement()) {
    //         $item->increment('current_stock', $transaction->quantity);
    //     }

    //     $item->recalculateTotalValue();
    // }

    /**
     * Get transaction statistics
     */
    public function statistics(Request $request)
    {
        $universityId = $request->get('university_id');
        
        $query = InventoryTransaction::query();
        
        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        $stats = $query->selectRaw('
            COUNT(*) as total_transactions,
            SUM(total_value) as total_value,
            AVG(unit_cost) as average_unit_cost,
            COUNT(DISTINCT item_id) as unique_items,
            COUNT(DISTINCT department_id) as departments_involved
        ')->first();

        $transactionsByType = $query->selectRaw('transaction_type, COUNT(*) as count')
            ->groupBy('transaction_type')
            ->get()
            ->pluck('count', 'transaction_type');

        $transactionsByStatus = $query->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        return response()->json([
            'success' => true,
            'data' => [
                'overview' => $stats,
                'by_type' => $transactionsByType,
                'by_status' => $transactionsByStatus,
            ]
        ]);
    }
}