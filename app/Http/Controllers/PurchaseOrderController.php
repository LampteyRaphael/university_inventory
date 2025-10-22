<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\University;
use App\Models\Supplier;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(PurchaseOrder::class, 'purchaseOrder');
    }

    /**
     * Display a listing of the purchase orders.
     */
    public function index(Request $request)
    {   

        try {
            $purchaseOrders = PurchaseOrder::with(['university', 'supplier', 'department', 'requestedBy'])
                ->get()
                ->map(function ($purchaseOrder) {
                    return [
                        'order_id' => $purchaseOrder->order_id,
                        'po_number' => $purchaseOrder->po_number,
                        'order_type' => $purchaseOrder->order_type,
                        'order_date' => $purchaseOrder->order_date,
                        'expected_delivery_date' => $purchaseOrder->expected_delivery_date,
                        'actual_delivery_date' => $purchaseOrder->actual_delivery_date,
                        'subtotal_amount' => $purchaseOrder->subtotal_amount,
                        'tax_amount' => $purchaseOrder->tax_amount,
                        'shipping_amount' => $purchaseOrder->shipping_amount,
                        'discount_amount' => $purchaseOrder->discount_amount,
                        'total_amount' => $purchaseOrder->total_amount,
                        'currency' => $purchaseOrder->currency,
                        'exchange_rate' => $purchaseOrder->exchange_rate,
                        'status' => $purchaseOrder->status,
                        'payment_status' => $purchaseOrder->payment_status,
                        'notes' => $purchaseOrder->notes,
                        'terms_and_conditions' => $purchaseOrder->terms_and_conditions,
                        'requested_by' => $purchaseOrder->requested_by,
                        'approved_by' => $purchaseOrder->approved_by,
                        'approved_at' => $purchaseOrder->approved_at,
                        'received_by' => $purchaseOrder->received_by,
                        'supplier_id'=>$purchaseOrder->supplier_id,
                        'department_id'=>$purchaseOrder->department_id,
                        'university_id'=>$purchaseOrder->university_id,
                        
                        // Relationship data
                        'university_name' => $purchaseOrder->university->name ?? null,
                        'supplier_name' => $purchaseOrder->supplier->legal_name ?? null,
                        'department_name' => $purchaseOrder->department->name ?? null,
                        'requested_by_name' => $purchaseOrder->requestedBy->name ?? null,
                        
                        'created_at' => $purchaseOrder->created_at,
                        'updated_at' => $purchaseOrder->updated_at,
                    ];
                });

            return Inertia::render('PurchaseOrders/PurchaseOrders')
                ->with([
                    'purchaseOrders' => Inertia::defer(fn () => $purchaseOrders),
                    
                    'universities' => Inertia::defer(fn () => 
                        University::select('university_id', 'name')
                            ->orderBy('name')
                            ->get()
                    ),
                    'departments' => Inertia::defer(fn () => 
                        Department::select('department_id', 'name')
                            ->orderBy('name')
                            ->get()
                    ),
                    
                    'suppliers' => Inertia::defer(fn () => 
                        Supplier::select('supplier_id', 'legal_name')
                            ->orderBy('legal_name')
                            ->get()
                    ),
                    
                    'filters' => $request->only(['search', 'status', 'order_type']),
                ]);

        } catch (\Exception $e) {
            Log::error('PurchaseOrders index error:', ['error' => $e->getMessage()]);

            return redirect()->back()->with('error', 'Error loading purchase orders: ' . $e->getMessage());
        }
    }

    
    /**
     * Store a newly created purchase order in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'university_id' => 'required|exists:universities,university_id',
            'supplier_id' => 'required|exists:suppliers,supplier_id',
            'department_id' => 'required|exists:departments,department_id',
            'po_number' => 'required|unique:purchase_orders,po_number',
            'order_type' => 'required|in:regular,emergency,capital,consumable,service',
            'order_date' => 'required|date',
            'expected_delivery_date' => 'required|date|after_or_equal:order_date',
            'actual_delivery_date' => 'nullable|date|after_or_equal:order_date',
            'subtotal_amount' => 'required|numeric|min:0',
            'tax_amount' => 'required|numeric|min:0',
            'shipping_amount' => 'required|numeric|min:0',
            'discount_amount' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'currency' => 'required|in:USD,EUR,GBP,JPY,CAD,AUD,GHS',
            'exchange_rate' => 'required|numeric|min:0',
            'status' => 'required|in:draft,submitted,approved,ordered,partially_received,received,cancelled,closed',
            'payment_status' => 'required|in:pending,partial,paid,overdue',
            'notes' => 'nullable|string',
            'terms_and_conditions' => 'nullable|string',
            'requested_by' => 'required|exists:users,user_id',
        ]);

        DB::beginTransaction();
        
        try {
            $purchaseOrder = PurchaseOrder::create($validated);
            
            DB::commit();
            
            return redirect()->route('purchase-orders.index')
                ->with('success', 'Purchase order created successfully!');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->with('error', 'Failed to create purchase order: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified purchase order.
     */
    // public function show($id)
    // {
    //     $purchaseOrder = PurchaseOrder::with([
    //         'university', 
    //         'supplier', 
    //         'department', 
    //         'requestedBy', 
    //         'approvedBy', 
    //         'receivedBy'
    //     ])->findOrFail($id);
        
    //     return view('purchase-orders.show', compact('purchaseOrder'));
    // }

    /**
     * Show the form for editing the specified purchase order.
     */
    // public function edit($id)
    // {
    //     $purchaseOrder = PurchaseOrder::findOrFail($id);
        
    //     $universities = University::all();
    //     $suppliers = Supplier::all();
    //     $departments = Department::all();
    //     $users = User::all();
        
    //     $orderTypes = ['regular', 'emergency', 'capital', 'consumable', 'service'];
    //     $currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
    //     $statuses = ['draft', 'submitted', 'approved', 'ordered', 'partially_received', 'received', 'cancelled', 'closed'];
    //     $paymentStatuses = ['pending', 'partial', 'paid', 'overdue'];
        
    //     return view('purchase-orders.edit', compact(
    //         'purchaseOrder',
    //         'universities', 
    //         'suppliers', 
    //         'departments', 
    //         'users',
    //         'orderTypes',
    //         'currencies',
    //         'statuses',
    //         'paymentStatuses'
    //     ));
    // }

    /**
     * Update the specified purchase order in storage.
     */
    public function update(Request $request, $id)
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);
                
        $validated = $request->validate([
            'university_id' => 'required|exists:universities,university_id',
            'supplier_id' => 'required|exists:suppliers,supplier_id',
            'department_id' => 'required|exists:departments,department_id',
            'po_number' => 'required|unique:purchase_orders,po_number,' . $purchaseOrder->order_id . ',order_id',
            'order_type' => 'required|in:regular,emergency,capital,consumable,service',
            'order_date' => 'required|date',
            'expected_delivery_date' => 'required|date|after_or_equal:order_date',
            'actual_delivery_date' => 'nullable|date|after_or_equal:order_date',
            'subtotal_amount' => 'required|numeric|min:0',
            'tax_amount' => 'required|numeric|min:0',
            'shipping_amount' => 'required|numeric|min:0',
            'discount_amount' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'currency' => 'required|in:USD,EUR,GBP,JPY,CAD,AUD,GHS',
            'exchange_rate' => 'required|numeric|min:0',
            'status' => 'required|in:draft,submitted,approved,ordered,partially_received,received,cancelled,closed',
            'payment_status' => 'required|in:pending,partial,paid,overdue',
            'notes' => 'nullable|string',
            'terms_and_conditions' => 'nullable|string',
            'requested_by' => 'required|exists:users,user_id',
            'approved_by' => 'nullable|exists:users,user_id',
            'received_by' => 'nullable|exists:users,user_id',
        ]);

        // Handle approval timestamp
        if ($validated['status'] === 'approved' && $purchaseOrder->status !== 'approved') {
            $validated['approved_at'] = now();
        }

        DB::beginTransaction();
        
        try {
            $purchaseOrder->update($validated);
            
            DB::commit();
            
            return redirect()->route('purchase-orders.index', $purchaseOrder->order_id)
                ->with('success', 'Purchase order updated successfully!');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->with('error', 'Failed to update purchase order: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified purchase order from storage.
     */
    public function destroy($id)
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);
        
        DB::beginTransaction();
        
        try {
            $purchaseOrder->delete();
            
            DB::commit();
            
            return redirect()->route('purchase-orders.index')
                ->with('success', 'Purchase order deleted successfully!');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->with('error', 'Failed to delete purchase order: ' . $e->getMessage());
        }
    }

    /**
     * Approve a purchase order
     */
    public function approve($id)
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);
        
        DB::beginTransaction();
        
        try {
            $purchaseOrder->update([
                'status' => 'approved',
                'approved_by' => Auth::user_id(),
                'approved_at' => now(),
            ]);
            
            DB::commit();
            
            return back()->with('success', 'Purchase order approved successfully!');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->with('error', 'Failed to approve purchase order: ' . $e->getMessage());
        }
    }

    /**
     * Mark as received
     */
    public function markAsReceived(Request $request, $id)
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);
        
        $validated = $request->validate([
            'received_by' => 'required|exists:users,id',
            'actual_delivery_date' => 'required|date',
        ]);

        DB::beginTransaction();
        
        try {
            $purchaseOrder->update([
                'status' => 'received',
                'received_by' => $validated['received_by'],
                'actual_delivery_date' => $validated['actual_delivery_date'],
            ]);
            
            DB::commit();
            
            return back()->with('success', 'Purchase order marked as received!');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->with('error', 'Failed to update purchase order: ' . $e->getMessage());
        }
    }


    public function getByStatus($status)
    {
        $purchaseOrders = PurchaseOrder::with(['university', 'supplier', 'department'])
            ->where('status', $status)
            ->latest()
            ->get();
            
        return response()->json($purchaseOrders);
    }
}