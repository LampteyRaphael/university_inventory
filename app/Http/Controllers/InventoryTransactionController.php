<?php

namespace App\Http\Controllers;

use App\Models\InventoryTransaction;
use App\Models\InventoryItem;
use App\Models\Department;
use App\Models\Location;
use App\Models\StockLevel;
use App\Models\User;
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


    

    // public function transactionIndex(Request $request)
    // {
    //     try {

            

    //         // if (Auth::user()->hasRole('super_admin')) {
    //         //     // Super admin logic
    //         //  }

    //         return Inertia::render('Inventories/Inventories')
    //         ->with([
    //             'transactions' => Inertia::defer(fn () =>
    //                 $this->transactionRepository->getAllTransactions()
    //             ),

    //             // Dropdown data (still deferred to speed up first render)
    //             'items' => Inertia::defer(fn () =>
    //                 InventoryItem::select('item_id', 'item_code', 'name')
    //                     ->orderBy('name')
    //                     ->get()
    //             ),

    //             'departments' => Inertia::defer(fn () =>
    //                 Department::select('department_id', 'name')
    //                     ->orderBy('name')
    //                     ->get()
    //             ),

    //             'locations' => Inertia::defer(fn () =>
    //                 Location::select('location_id', 'name')
    //                     ->orderBy('name')
    //                     ->get()
    //             ),

    //             // Small static arrays → no need to defer
    //             'transactionTypes' => [
    //                 'purchase', 'sale', 'transfer', 'adjustment', 'return', 
    //                 'write_off', 'consumption', 'production', 'donation',
    //             ],

    //             'statuses' => ['pending', 'completed', 'cancelled', 'reversed'],
    //         ]);


    //     } catch (\Exception $e) {
    //         Log::error('Transaction index error:', ['error' => $e->getMessage()]);
            
    //         return Inertia::render('Inventories/Inventories', [ // Fixed path consistency
    //             'transactions' => ['data' => []],
    //             'items' => [],
    //             'departments' => [],
    //             'transactionTypes' => [],
    //             'statuses' => [],
    //             'error' => 'Failed to load transactions'
    //         ]);
    //     }
    // }

    // /**
    //  * Store a newly created resource in storage.
    //  */
    // public function store(Request $request)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'university_id' => 'required|exists:universities,university_id',
    //         'item_id' => 'required|exists:inventory_items,item_id',
    //         'department_id' => 'required|exists:departments,department_id',
    //         'transaction_type' => 'required|in:' . implode(',', array_keys(InventoryTransaction::getTransactionTypes())),
    //         'quantity' => 'required|integer|min:1',
    //         'unit_cost' => 'required|numeric|min:0',
    //         'transaction_date' => 'required|date',
    //         'reference_number' => 'nullable|string|max:100',
    //         'reference_id' => 'nullable|string|max:50',
    //         'batch_number' => 'nullable|string|max:100',
    //         'expiry_date' => 'nullable|date|after_or_equal:today',
    //         'notes' => 'nullable|string|max:1000',
    //         'source_location_id' => 'nullable|exists:locations,location_id',
    //         'destination_location_id' => 'nullable|exists:locations,location_id',
    //         'status' => 'sometimes|in:' . implode(',', array_keys(InventoryTransaction::getStatusOptions())),
    //         'approved_by' => 'nullable|exists:users,name',
    //     ], [
    //         'item_id.required' => 'The inventory item is required.',
    //         'item_id.exists' => 'The selected inventory item does not exist.',
    //         'department_id.required' => 'The department is required.',
    //         'department_id.exists' => 'The selected department does not exist.',
    //         'transaction_type.required' => 'The transaction type is required.',
    //         'quantity.min' => 'Quantity must be at least 1.',
    //         'unit_cost.min' => 'Unit cost cannot be negative.',
    //         'expiry_date.after_or_equal' => 'Expiry date must be today or in the future.',
    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Validation failed',
    //             'errors' => $validator->errors()
    //         ], 422);
    //     }

    //     try {
    //         DB::beginTransaction();

    //         // Check if item exists and is active
    //         $item = InventoryItem::where('item_id', $request->item_id)
    //             ->where('university_id', $request->university_id)
    //             ->first();

    //         if (!$item) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'Inventory item not found or does not belong to this university'
    //             ], 404);
    //         }

    //         if (!$item->is_active) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'Cannot create transaction for inactive inventory item'
    //             ], 422);
    //         }

    //         // Validate location access if provided
    //         if ($request->source_location_id) {
    //             $sourceLocation = Location::where('location_id', $request->source_location_id)
    //                 ->where('university_id', $request->university_id)
    //                 ->first();

    //             if (!$sourceLocation) {
    //                 return response()->json([
    //                     'success' => false,
    //                     'message' => 'Source location not found or does not belong to this university'
    //                 ], 404);
    //             }
    //         }

    //         if ($request->destination_location_id) {
    //             $destinationLocation = Location::where('location_id', $request->destination_location_id)
    //                 ->where('university_id', $request->university_id)
    //                 ->first();

    //             if (!$destinationLocation) {
    //                 return response()->json([
    //                     'success' => false,
    //                     'message' => 'Destination location not found or does not belong to this university'
    //                 ], 404);
    //             }
    //         }

    //         // Validate department belongs to university
    //         $department = Department::where('department_id', $request->department_id)
    //             ->where('university_id', $request->university_id)
    //             ->first();

    //         if (!$department) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'Department not found or does not belong to this university'
    //             ], 404);
    //         }

    //         // Calculate total value
    //         $totalValue = $request->quantity * $request->unit_cost;

    //         // Create the transaction
    //         $transaction = new InventoryTransaction();
    //         $transaction->fill($request->all());
    //         $transaction->total_value = $totalValue;
            
    //         // Set default status if not provided
    //         if (!$request->has('status')) {
    //             $transaction->status = InventoryTransaction::STATUS_COMPLETED;
    //         }

    //         // $transaction->performed_by = Auth::user()->name??'';
    //         $transaction->save();

    //         // Update inventory item stock levels based on transaction type
    //         $this->updateInventoryStock($transaction);

    //         // Load relationships for response
    //         $transaction->load([
    //             'item', 
    //             'department', 
    //             'university', 
    //             'sourceLocation', 
    //             'destinationLocation',
    //             'performedBy',
    //             'approvedBy'
    //         ]);

    //         DB::commit();

    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Inventory transaction created successfully',
    //             'data' => $transaction
    //         ], 201);

    //     } catch (\Exception $e) {
    //         DB::rollBack();
            
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to create inventory transaction',
    //             'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
    //         ], 500);
    //     }
    // }

    // // end of store

    // /**
    //  * Display the specified resource.
    //  */
    // public function show(string $id)
    // {
    //     $transaction = InventoryTransaction::with([
    //         'item', 
    //         'department', 
    //         'university', 
    //         'sourceLocation', 
    //         'destinationLocation',
    //         'performedBy',
    //         'approvedBy',
    //         'reference'
    //     ])->find($id);

    //     if (!$transaction) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Inventory transaction not found'
    //         ], 404);
    //     }

    //     return response()->json([
    //         'success' => true,
    //         'data' => $transaction
    //     ]);
    // }

    // /**
    //  * Update the specified resource in storage.
    //  */
    // public function update(Request $request, string $id)
    // {
    //     $transaction = InventoryTransaction::find($id);

    //     if (!$transaction) {
    //         return redirect()->route('inventory-transactions.index')->with('error', 'Inventory transaction not found');
    //     }

    //     // Prevent updates on completed transactions unless reversing
    //     if ($transaction->isCompleted() && $request->status !== InventoryTransaction::STATUS_REVERSED) {
    //         return redirect()->route('inventory-transactions.index')->with('error', 'Cannot update completed transaction. Consider reversing it instead.');
    //     }

    //     $validator = Validator::make($request->all(), [
    //         'item_id' => 'sometimes|required|exists:inventory_items,item_id',
    //         'department_id' => 'sometimes|required|exists:departments,department_id',
    //         'transaction_type' => 'sometimes|required|in:' . implode(',', array_keys(InventoryTransaction::getTransactionTypes())),
    //         'quantity' => 'sometimes|required|integer|min:1',
    //         'unit_cost' => 'sometimes|required|numeric|min:0',
    //         'transaction_date' => 'sometimes|required|date',
    //         'reference_number' => 'nullable|string|max:100',
    //         'reference_id' => 'nullable|string|max:50',
    //         'batch_number' => 'nullable|string|max:100',
    //         'expiry_date' => 'nullable|date',
    //         'notes' => 'nullable|string|max:1000',
    //         'source_location_id' => 'nullable|exists:locations,location_id',
    //         'destination_location_id' => 'nullable|exists:locations,location_id',
    //         'status' => 'sometimes|in:' . implode(',', array_keys(InventoryTransaction::getStatusOptions())),
    //         'approved_by' => 'nullable|exists:users,name',
    //     ], [
    //         'item_id.exists' => 'The selected inventory item does not exist.',
    //         'department_id.exists' => 'The selected department does not exist.',
    //         'quantity.min' => 'Quantity must be at least 1.',
    //         'unit_cost.min' => 'Unit cost cannot be negative.',
    //     ]);

    //     if ($validator->fails()) {
    //         return redirect()->route('inventory-transactions.index')->with('error', 'Validation failed');
    //     }

    //     try {
    //         DB::beginTransaction();

    //         // Store old values for inventory adjustment
    //         $oldQuantity = $transaction->quantity;
    //         $oldTransactionType = $transaction->transaction_type;

    //         // Update the transaction
    //         $transaction->fill($request->all());
            
    //         // Recalculate total value if quantity or unit cost changed
    //         if ($request->has('quantity') || $request->has('unit_cost')) {
    //             $transaction->total_value = $transaction->quantity * $transaction->unit_cost;
    //         }
    //         $transaction->performed_by=Auth::user()->user_id ?? null;
    //         $transaction->approved_by=Auth::user()->user_id ?? null;
    //         $transaction->save();

    //         // Update inventory stock levels if quantity or transaction type changed
    //         if ($request->has('quantity') || $request->has('transaction_type')) {
    //             $this->adjustInventoryStock($transaction, $oldQuantity, $oldTransactionType);
    //         }

    //         // Load relationships for response
    //         $transaction->load([
    //             'item', 
    //             'department', 
    //             'university', 
    //             'sourceLocation', 
    //             'destinationLocation',
    //             'performedBy',
    //             'approvedBy'
    //         ]);

    //         DB::commit();


    //         return redirect()->route('inventory-transactions.index')->with('success', 'Inventory Transaction created successfully!');
           
    //     } catch (\Exception $e) {
    //         DB::rollBack();
            
    //         return redirect()->route('inventory-transactions.index')->with('error', 'Failed to update inventory transaction');
    //     }
    // }

    // /**
    //  * Remove the specified resource from storage.
    //  */
    // public function destroy(string $id)
    // {
    //     $transaction = InventoryTransaction::find($id);

    //     if (!$transaction) {
    //         return redirect()->route('inventory-transactions.index')->with('error', 'Inventory transaction not found');
    //     }

    //     // Prevent deletion of completed transactions
    //     if ($transaction->isCompleted()) {
    //         return redirect()->route('inventory-transactions.index')->with('error', 'Cannot delete completed transaction. Consider reversing it instead.');
    //     }

    //     try {
    //         DB::beginTransaction();

    //         // Reverse inventory impact before deletion
    //         $this->reverseInventoryImpact($transaction);
            
    //         $transaction->delete();

    //         DB::commit();
            
    //         return redirect()->back()->with('success', 'Inventory transaction deleted successfully');

    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return redirect()->back()->with('error', 'Failed to delete inventory transaction');
    //     }
    // }

    // /**
    //  * Reverse a transaction
    //  */
    // public function reverse(Request $request, string $id)
    // {
    //     $transaction = InventoryTransaction::find($id);

    //     if (!$transaction) {
    //         return redirect()->route('inventory-transactions.index')->with('success','Inventory transaction not found');
    //     }

    //     if ($transaction->isReversed()) {
    //         return redirect()->route('inventory-transactions.index')->with('success', 'Transaction is already reversed');
    //     }

    //     try {
    //         DB::beginTransaction();

    //         // Create reversal transaction
    //         $reversal = new InventoryTransaction();
    //         $reversal->fill($transaction->toArray());
    //         $reversal->transaction_id = (string) \Illuminate\Support\Str::uuid();
    //         $reversal->quantity = -$transaction->quantity; // Reverse the quantity
    //         $reversal->total_value = -$transaction->total_value; // Reverse the value
    //         $reversal->status = InventoryTransaction::STATUS_REVERSED;
    //         $reversal->notes = 'Reversal of transaction ' . $transaction->transaction_id . '. ' . ($request->notes ?? '');
    //         $reversal->reference_id = $transaction->transaction_id;
    //         $reversal->reference_number = 'REV-' . $transaction->reference_number;
    //         $reversal->save();

    //         // Update original transaction status
    //         $transaction->status = InventoryTransaction::STATUS_REVERSED;
    //         $transaction->save();

    //         // Update inventory stock
    //         $this->updateInventoryStock($reversal);

    //         DB::commit();

    //         return redirect()->back()->with([
    //             'success' => 'Transaction reversed successfully',
    //             'data' => $reversal->load(['item', 'department', 'performedBy'])
    //         ]);

    //     } catch (\Exception $e) {
    //         DB::rollBack();
            
    //         return redirect()->back()->with('success','Failed to reverse transaction');
    //     }
    // }

    /**
     * Check permission and abort if not authorized
     */
    private function checkPermission($permission)
    {
        $user = Auth::user();
        if (!$user || !$user->hasPermission($permission)) {
            return redirect()->route('inventory-transactions.index')->with('error', 'Insufficient permissions for this action.');
        }
    }

    /**
     * Check if user can approve transactions based on role level or specific permission
     */
    private function canApproveTransactions()
    {
        $user = Auth::user();
        
        // Users with approve permission can approve
        if ($user->hasPermission('purchase_orders.approve')) {
            return true;
        }
        
        // Department heads can approve transactions in their department
        if ($user->hasRole('department_head')) {
            return true;
        }
        
        // Higher level roles can approve (super_admin, inventory_manager)
        if ($user->getRoleLevel() >= 70) { // department_head level and above
            return true;
        }
        
        return false;
    }

    /**
     * Check if user can manage transactions for specific department
     */
    private function canManageDepartment($departmentId)
    {
        $user = Auth::user();
        
        // Super admins and inventory managers can manage all departments
        if ($user->hasRole('super_admin') || $user->hasRole('inventory_manager')) {
            return true;
        }
        
        // Department heads can only manage their own department
        if ($user->hasRole('department_head') && $user->department_id == $departmentId) {
            return true;
        }
        
        // Check if user has department management permission
        if ($user->hasPermission('departments.manage_members') && $user->department_id == $departmentId) {
            return true;
        }
        
        return false;
    }

    /**
     * Check if user can perform restricted transaction types
     * 
     */
    private function canPerformRestrictedTransaction($transactionType)
    {
        $user = Auth::user();
        $restrictedTypes = ['adjustment', 'write_off', 'transfer'];
        
        if (in_array($transactionType, $restrictedTypes)) {
            return $user->hasAnyPermission(['inventory.manage_categories', 'purchase_orders.approve']) ||
                   $user->hasRole('inventory_manager') ||
                   $user->hasRole('department_head');
        }
        
        return true;
    }

    public function transactionIndex(Request $request)
    {
        // Check view permission
        $this->checkPermission('inventory.view');
        
        
        try {
            $user = Auth::user();
            // Determine transactions based on user role and permissions
            $transactionsCallback = function () use ($user) {
                if ($user->hasRole('super_admin') || $user->hasRole('inventory_manager')) {
                    // Admin users see all transactions
                    return $this->transactionRepository->getAllTransactions();
                } elseif ($user->hasRole('department_head') || $user->hasPermission('departments.manage_members')) {
                    // Department heads see transactions in their department
                    return $this->transactionRepository->getUserDepartmentTransactions($user->department_id);
                } else {
                    // Regular users see only their own transactions
                    return $this->transactionRepository->getUserTransactions($user->user_id);
                }
            };

            return Inertia::render('Inventories/Inventories')
            ->with([
                'transactions' => Inertia::defer(fn () => $transactionsCallback()),
                
                // User permissions for UI controls
                'user_permissions' => [
                    'can_create' => $user->hasPermission('inventory.create'),
                    'can_edit' => $user->hasPermission('inventory.edit'),
                    'can_delete' => $user->hasPermission('inventory.delete'),
                    'can_approve' => $this->canApproveTransactions(),
                    'can_export' => $user->hasPermission('inventory.export'),
                    'can_view_reports' => $user->hasPermission('inventory.view_reports'),
                    'can_manage_categories' => $user->hasPermission('inventory.manage_categories'),
                ],
                
                'user_role' => $user->getRoleName(),

                // Dropdown data (filtered by user's access)
                'items' => Inertia::defer(fn () => 
                    InventoryItem::select('item_id', 'item_code', 'name')
                        ->when(!$user->hasRole('super_admin') && !$user->hasRole('inventory_manager'), function ($query) use ($user) {
                            // Non-admin users only see items from their department
                            return $query->where('department_id', $user->department_id);
                        })
                        ->where('is_active', true)
                        ->orderBy('name')
                        ->get()
                ),

                'departments' => Inertia::defer(fn () => 
                    Department::select('department_id', 'name')
                        ->when(!$user->hasRole('super_admin') && !$user->hasRole('inventory_manager'), function ($query) use ($user) {
                            // Non-admin users only see their department
                            return $query->where('department_id', $user->department_id);
                        })
                        ->orderBy('name')
                        ->get()
                ),

                'locations' => Inertia::defer(fn () => 
                    Location::select('location_id', 'name')
                        ->when(!$user->hasRole('super_admin'), function ($query) use ($user) {
                            // Filter locations by user's university
                            return $query->where('university_id', $user->university_id);
                        })
                        ->orderBy('name')
                        ->get()
                ),

                'transactionTypes' => $this->getAllowedTransactionTypes($user),
                'statuses' => ['pending', 'completed', 'cancelled', 'reversed'],
            ]);

        } catch (\Exception $e) {
            Log::error('Transaction index error:', [
                'error' => $e->getMessage(), 
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return Inertia::render('Inventories/Inventories', [
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
     * Get allowed transaction types based on user permissions
     */
    private function getAllowedTransactionTypes($user)
    {
        $allTypes = [
            'purchase', 'sale', 'transfer', 'adjustment', 'return', 
            'write_off', 'consumption', 'production', 'donation',
        ];

        // Regular users can only perform basic transactions
        if ($user->hasRole('staff') || $user->hasRole('faculty') || $user->hasRole('student')) {
            return array_filter($allTypes, function ($type) {
                return in_array($type, ['purchase', 'sale', 'return', 'consumption']);
            });
        }

        // Department heads can perform most transactions except system-level ones
        if ($user->hasRole('department_head')) {
            return array_filter($allTypes, function ($type) {
                return !in_array($type, ['write_off', 'adjustment']);
            });
        }

        // Inventory managers and super admins can perform all transactions
        return $allTypes;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Check create permission
        $this->checkPermission('inventory.create');
        
        $user = Auth::user();

        // Check department access if not super admin/inventory manager
        if (!$user->hasRole('super_admin') && !$user->hasRole('inventory_manager')) {
            if (!$this->canManageDepartment($request->department_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to create transactions for this department'
                ], 403);
            }
        }

        // Check if user can perform this transaction type
        if (!$this->canPerformRestrictedTransaction($request->transaction_type)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to create ' . $request->transaction_type . ' transactions'
            ], 403);
        }

        // For purchase transactions, check purchase order permission
        if ($request->transaction_type === 'purchase' && !$user->hasPermission('purchase_orders.create')) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to create purchase transactions'
            ], 403);
        }

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

            // Validate department belongs to university and user has access
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
                $transaction->status = 'pending'; // Default to pending for approval
            }

            // Set performed_by to current user
            $transaction->performed_by = $user->user_id;
            
            // Auto-approve if user has approval rights, otherwise leave as pending
            if ($this->canApproveTransactions() && $request->status === 'completed') {
                $transaction->approved_by = $user->user_id;
                $transaction->status = 'completed';
            } else if ($request->status === 'completed') {
                // If user doesn't have approval rights but tries to set completed status
                $transaction->status = 'pending';
            }

            $transaction->save();

            // If transaction is completed, update inventory stock
            if ($transaction->status === 'completed') {
                $this->updateInventoryStock($transaction);
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

            return response()->json([
                'success' => true,
                'message' => 'Inventory transaction created successfully',
                'data' => $transaction
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Transaction store error:', [
                'error' => $e->getMessage(), 
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create inventory transaction',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Check view permission
        $this->checkPermission('inventory.view');
        
        $user = Auth::user();
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

        // Check if user can view this specific transaction
        if (!$user->hasRole('super_admin') && !$user->hasRole('inventory_manager')) {
            if ($transaction->department_id !== $user->department_id) {
                abort(403, 'You do not have permission to view this transaction.');
            }
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
        // Check edit permission
        $this->checkPermission('inventory.edit');
        
        $user = Auth::user();
        $transaction = InventoryTransaction::find($id);

        if (!$transaction) {
            return redirect()->route('inventory-transactions.index')->with('error', 'Inventory transaction not found');
        }

        // Check department access
        if (!$user->hasRole('super_admin') && !$user->hasRole('inventory_manager')) {
            if (!$this->canManageDepartment($transaction->department_id)) {
                return redirect()->route('inventory-transactions.index')->with('error', 'You do not have permission to update this transaction');
            }
        }

        // Prevent updates on completed transactions unless reversing
        if ($transaction->isCompleted() && $request->status !== InventoryTransaction::STATUS_REVERSED) {
            return redirect()->route('inventory-transactions.index')->with('error', 'Cannot update completed transaction. Consider reversing it instead.');
        }

        // Check approval permission if changing to completed status
        if ($request->status === 'completed' && !$this->canApproveTransactions()) {
            return redirect()->route('inventory-transactions.index')->with('error', 'You do not have permission to approve transactions');
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

            // Set performed_by to current user
            $transaction->performed_by = $user->user_id;
            
            // Set approved_by if completing the transaction and user has permission
            if ($request->status === 'completed' && $this->canApproveTransactions()) {
                $transaction->approved_by = $user->user_id;
            }

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

            return redirect()->route('inventory-transactions.index')->with('success', 'Inventory Transaction updated successfully!');
           
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Transaction update error:', [
                'error' => $e->getMessage(), 
                'user_id' => Auth::id(),
                'transaction_id' => $id
            ]);
            
            return redirect()->route('inventory-transactions.index')->with('error', 'Failed to update inventory transaction');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Check delete permission
        $this->checkPermission('inventory.delete');
        
        $user = Auth::user();
        $transaction = InventoryTransaction::find($id);

        if (!$transaction) {
            return redirect()->route('inventory-transactions.index')->with('error', 'Inventory transaction not found');
        }

        // Check department access
        if (!$user->hasRole('super_admin') && !$user->hasRole('inventory_manager')) {
            if (!$this->canManageDepartment($transaction->department_id)) {
                return redirect()->route('inventory-transactions.index')->with('error', 'You do not have permission to delete this transaction');
            }
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
            
            return redirect()->back()->with('success', 'Inventory transaction deleted successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Transaction delete error:', [
                'error' => $e->getMessage(), 
                'user_id' => Auth::id(),
                'transaction_id' => $id
            ]);
            return redirect()->back()->with('error', 'Failed to delete inventory transaction');
        }
    }

    /**
     * Reverse a transaction
     */
    public function reverse(Request $request, string $id)
    {
        // Check edit permission
        $this->checkPermission('inventory.edit');
        
        $user = Auth::user();
        $transaction = InventoryTransaction::find($id);

        if (!$transaction) {
            return redirect()->route('inventory-transactions.index')->with('error', 'Inventory transaction not found');
        }

        // Check department access
        if (!$user->hasRole('super_admin') && !$user->hasRole('inventory_manager')) {
            if (!$this->canManageDepartment($transaction->department_id)) {
                return redirect()->route('inventory-transactions.index')->with('error', 'You do not have permission to reverse this transaction');
            }
        }

        // Check approval permission for reversal
        if (!$this->canApproveTransactions()) {
            return redirect()->route('inventory-transactions.index')->with('error', 'You do not have permission to reverse transactions');
        }

        if ($transaction->isReversed()) {
            return redirect()->route('inventory-transactions.index')->with('error', 'Transaction is already reversed');
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
            $reversal->performed_by = $user->user_id;
            $reversal->approved_by = $user->user_id;
            $reversal->save();

            // Update original transaction status
            $transaction->status = InventoryTransaction::STATUS_REVERSED;
            $transaction->save();

            // Update inventory stock
            $this->updateInventoryStock($reversal);

            DB::commit();

            return redirect()->back()->with('success', 'Transaction reversed successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Transaction reverse error:', [
                'error' => $e->getMessage(), 
                'user_id' => Auth::id(),
                'transaction_id' => $id
            ]);
            return redirect()->back()->with('error', 'Failed to reverse transaction');
        }
    }

    /**
     * Approve a pending transaction
     */
    public function approve(Request $request, string $id)
    {
        // Check approval permission
        if (!$this->canApproveTransactions()) {
            return redirect()->route('inventory-transactions.index')->with('error', 'You do not have permission to approve transactions');
        }

        $user = Auth::user();
        $transaction = InventoryTransaction::find($id);

        if (!$transaction) {
            return redirect()->route('inventory-transactions.index')->with('error', 'Inventory transaction not found');
        }

        // Check if user can approve transactions for this department
        if (!$user->hasRole('super_admin') && !$user->hasRole('inventory_manager')) {
            if (!$this->canManageDepartment($transaction->department_id)) {
                return redirect()->route('inventory-transactions.index')->with('error', 'You do not have permission to approve transactions for this department');
            }
        }

        if ($transaction->status !== 'pending') {
            return redirect()->route('inventory-transactions.index')->with('error', 'Only pending transactions can be approved');
        }

        try {
            DB::beginTransaction();

            $transaction->status = 'completed';
            $transaction->approved_by = $user->user_id;
            $transaction->save();

            // Update inventory stock
            $this->updateInventoryStock($transaction);

            DB::commit();

            return redirect()->back()->with('success', 'Transaction approved successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Transaction approve error:', [
                'error' => $e->getMessage(), 
                'user_id' => Auth::id(),
                'transaction_id' => $id
            ]);
            return redirect()->back()->with('error', 'Failed to approve transaction');
        }
    }

    /**
     * Get transaction statistics
     */
    public function statistics(Request $request)
    {
        // Check report view permission
        $this->checkPermission('inventory.view_reports');
        
        $user = Auth::user();
        $universityId = $request->get('university_id') ?? $user->university_id;
        
        $query = InventoryTransaction::query();
        
        // Filter by university
        $query->where('university_id', $universityId);
        
        // For non-admin users, filter by their department
        if (!$user->hasRole('super_admin') && !$user->hasRole('inventory_manager')) {
            $query->where('department_id', $user->department_id);
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

}