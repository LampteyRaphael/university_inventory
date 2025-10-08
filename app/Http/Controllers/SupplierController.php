<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Models\University;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $suppliers = Supplier::with(['university', 'approver'])
            ->get()
            ->map(function($supplier){
                return [
                        'supplier_id'           => $supplier->supplier_id,
                        'university_id'         => $supplier->university_id,
                        'supplier_code'         => $supplier->supplier_code,
                        'legal_name'            => $supplier->legal_name,
                        'trade_name'            => $supplier->trade_name,
                        'supplier_type'         => $supplier->supplier_type,
                        'contact_person'        => $supplier->contact_person,
                        'phone'                 => $supplier->phone,
                        'email'                 => $supplier->email,
                        'website'               => $supplier->website,
                        'address'               => $supplier->address,
                        'city'                  => $supplier->city,
                        'state'                 => $supplier->state,
                        'country'               => $supplier->country,
                        'postal_code'           => $supplier->postal_code,
                        'tax_id'                => $supplier->tax_id,
                        'vat_number'            => $supplier->vat_number,
                        'credit_limit'          => $supplier->credit_limit,
                        'payment_terms_days'    => $supplier->payment_terms_days,
                        'rating'                => $supplier->rating,
                        'delivery_reliability'  => $supplier->delivery_reliability,
                        'quality_rating'        => $supplier->quality_rating,
                        'certifications'        => $supplier->certifications,
                        'is_approved'           => $supplier->is_approved,
                        'approval_date'         => $supplier->approval_date,
                        'next_evaluation_date'  => $supplier->next_evaluation_date,
                        'is_active'             => $supplier->is_active,
                        'notes'                 => $supplier->notes,
                        'approved_by'           => $supplier->approved_by,
                        'created_at'           => $supplier->created_at,
                        'updated_at'           => $supplier->updated_at,
                    ];

            });
               
            $universities = University::select('name','university_id')->get();

            return Inertia::render('Suppliers/Suppliers', [
                'suppliers' => Inertia::defer( fn ()=> $suppliers),
                'universities' =>Inertia::defer(fn () => $universities),
            ]);

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load suppliers: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
            $universities = University::all();
            
            return Inertia::render('Suppliers/Create', [
                'universities' => $universities,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load create form: ' . $e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'supplier_code' => 'required|string|max:50|unique:suppliers,supplier_code',
                'university_id' => 'required|uuid|exists:universities,university_id',
                'legal_name' => 'required|string|max:255',
                'trade_name' => 'nullable|string|max:255',
                'supplier_type' => 'required|in:manufacturer,distributor,wholesaler,retailer,service',
                'contact_person' => 'required|string|max:255',
                'phone' => 'required|string|max:20',
                'email' => 'required|email|max:255',
                'website' => 'nullable|url|max:255',
                'address' => 'required|string|max:500',
                'city' => 'required|string|max:100',
                'state' => 'required|string|max:100',
                'country' => 'required|string|max:100',
                'postal_code' => 'required|string|max:20',
                'tax_id' => 'nullable|string|max:100',
                'vat_number' => 'nullable|string|max:100',
                'credit_limit' => 'nullable|numeric|min:0',
                'payment_terms_days' => 'nullable|integer|min:0',
                'rating' => 'numeric|min:0|max:5',
                // 'rating' => 'nullable|numeric|between:0,5',
                'delivery_reliability' => 'nullable|integer|between:0,100',
                'quality_rating' => 'nullable|integer|between:0,100',
                'certifications' => 'nullable|array',
                'is_approved' => 'boolean',
                'approval_date' => 'nullable|date',
                'next_evaluation_date' => 'nullable|date|after_or_equal:today',
                'is_active' => 'boolean',
                'notes' => 'nullable|string',
                'approved_by' => 'nullable|uuid|exists:users,id',
            ], [
                'supplier_code.unique' => 'The supplier code already exists.',
                'next_evaluation_date.after_or_equal' => 'Next evaluation date must be today or in the future.',
                'university_id.exists' => 'The selected university does not exist.',
                'approved_by.exists' => 'The selected approver does not exist.',
            ]);

            if ($validator->fails()) {
                return redirect()
                    ->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            $validated = $validator->validated();

            // Generate UUID for supplier_id
            $validated['supplier_id'] = Str::uuid();

            // Set default values if not provided
            $validated['payment_terms_days'] = $validated['payment_terms_days'] ?? 30;
            $validated['credit_limit'] = $validated['credit_limit'] ?? 0;
            $validated['rating'] = $validated['rating'] ?? 0;
            $validated['delivery_reliability'] = $validated['delivery_reliability'] ?? 0;
            $validated['quality_rating'] = $validated['quality_rating'] ?? 0;
            $validated['is_approved'] = $validated['is_approved'] ?? false;
            $validated['is_active'] = $validated['is_active'] ?? true;

            // Set approved_by if approving and not provided
            if ($validated['is_approved'] && empty($validated['approved_by'])) {
                $validated['approved_by'] = Auth::user()->user_id;
            }

            // Handle certifications array
            if (isset($validated['certifications']) && is_array($validated['certifications'])) {
                $validated['certifications'] = json_encode($validated['certifications']);
            }

            $supplier = Supplier::create($validated);

            return redirect()
                ->route('suppliers.index')
                ->with('success', 'Supplier created successfully!');

        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Failed to create supplier: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($supplierId)
    {
        try {
            $supplier = Supplier::with(['university', 'approver'])
                ->where('supplier_id', $supplierId)
                ->firstOrFail();

            return Inertia::render('Suppliers/Show', [
                'supplier' => $supplier,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Supplier not found: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($supplierId)
    {
        try {
            $supplier = Supplier::with(['university', 'approver'])
                ->where('supplier_id', $supplierId)
                ->firstOrFail();
                
            $universities = University::all();

            return Inertia::render('Suppliers/Edit', [
                'supplier' => $supplier,
                'universities' => $universities,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load edit form: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $supplierId)
    {
        try {
            $supplier = Supplier::where('supplier_id', $supplierId)->firstOrFail();

            $validator = Validator::make($request->all(), [
                'supplier_code' => [
                    'required',
                    'string',
                    'max:50',
                    Rule::unique('suppliers')->ignore($supplier->supplier_id, 'supplier_id')
                ],
                'university_id' => 'required|uuid|exists:universities,university_id',
                'legal_name' => 'required|string|max:255',
                'trade_name' => 'nullable|string|max:255',
                'supplier_type' => 'required|in:manufacturer,distributor,wholesaler,retailer,service',
                'contact_person' => 'required|string|max:255',
                'phone' => 'required|string|max:20',
                'email' => 'required|email|max:255',
                'website' => 'nullable|url|max:255',
                'address' => 'required|string|max:500',
                'city' => 'required|string|max:100',
                'state' => 'required|string|max:100',
                'country' => 'required|string|max:100',
                'postal_code' => 'required|string|max:20',
                'tax_id' => 'nullable|string|max:100',
                'vat_number' => 'nullable|string|max:100',
                'credit_limit' => 'nullable|numeric|min:0',
                'payment_terms_days' => 'nullable|integer|min:0',
                'rating' => 'nullable|numeric|between:0,5',
                'delivery_reliability' => 'nullable|integer|between:0,100',
                'quality_rating' => 'nullable|integer|between:0,100',
                'certifications' => 'nullable|array',
                'is_approved' => 'boolean',
                'approval_date' => 'nullable|date',
                'next_evaluation_date' => 'nullable|date|after_or_equal:today',
                'is_active' => 'boolean',
                'notes' => 'nullable|string',
                'approved_by' => 'nullable|uuid|exists:users,id',
            ], [
                'supplier_code.unique' => 'The supplier code already exists.',
                'next_evaluation_date.after_or_equal' => 'Next evaluation date must be today or in the future.',
                'university_id.exists' => 'The selected university does not exist.',
                'approved_by.exists' => 'The selected approver does not exist.',
            ]);

            if ($validator->fails()) {
                return redirect()
                    ->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            $validated = $validator->validated();

            // Handle approval logic
            if ($validated['is_approved'] && !$supplier->is_approved) {
                // Newly approved - set approval date and approver
                if (empty($validated['approval_date'])) {
                    $validated['approval_date'] = now();
                }
                if (empty($validated['approved_by'])) {
                    $validated['approved_by'] = Auth::user()->user_id;
                }
            } elseif (!$validated['is_approved'] && $supplier->is_approved) {
                // Unapproved - clear approval data
                $validated['approval_date'] = null;
                $validated['approved_by'] = null;
            }

            // Handle certifications array
            if (isset($validated['certifications']) && is_array($validated['certifications'])) {
                $validated['certifications'] = json_encode($validated['certifications']);
            }

            $supplier->update($validated);

            return redirect()
                ->route('suppliers.index')
                ->with('success', 'Supplier updated successfully!');

        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Failed to update supplier: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($supplierId)
    {
        try {
            $supplier = Supplier::where('supplier_id', $supplierId)->firstOrFail();
            $supplierName = $supplier->legal_name;
            $supplier->delete();

            return redirect()
                ->route('suppliers.index')
                ->with('success', "Supplier '{$supplierName}' deleted successfully!");

        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Failed to delete supplier: ' . $e->getMessage());
        }
    }

    /**
     * Bulk actions for suppliers
     */
    public function bulkAction(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'action' => 'required|in:approve,disapprove,activate,deactivate,delete',
                'supplier_ids' => 'required|array',
                'supplier_ids.*' => 'uuid|exists:suppliers,supplier_id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid input',
                    'errors' => $validator->errors()
                ], 422);
            }

            $action = $request->action;
            $supplierIds = $request->supplier_ids;

            switch ($action) {
                case 'approve':
                    Supplier::whereIn('supplier_id', $supplierIds)
                        ->update([
                            'is_approved' => true,
                            'approval_date' => now(),
                            'approved_by' => Auth::user()->user_id,
                        ]);
                    $message = 'Suppliers approved successfully!';
                    break;

                case 'disapprove':
                    Supplier::whereIn('supplier_id', $supplierIds)
                        ->update([
                            'is_approved' => false,
                            'approval_date' => null,
                            'approved_by' => null
                        ]);
                    $message = 'Suppliers disapproved successfully!';
                    break;

                case 'activate':
                    Supplier::whereIn('supplier_id', $supplierIds)
                        ->update(['is_active' => true]);
                    $message = 'Suppliers activated successfully!';
                    break;

                case 'deactivate':
                    Supplier::whereIn('supplier_id', $supplierIds)
                        ->update(['is_active' => false]);
                    $message = 'Suppliers deactivated successfully!';
                    break;

                case 'delete':
                    Supplier::whereIn('supplier_id', $supplierIds)->delete();
                    $message = 'Suppliers deleted successfully!';
                    break;

                default:
                    throw new \Exception('Invalid bulk action');
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'affected_count' => count($supplierIds)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to perform bulk action: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export suppliers to Excel
     */
    public function export(Request $request)
    {
        try {
            $suppliers = Supplier::with(['university', 'approver'])
                ->when($request->has('supplier_ids'), function ($query) use ($request) {
                    $query->whereIn('supplier_id', $request->supplier_ids);
                })
                ->get();

            // Transform data for export
            $exportData = $suppliers->map(function ($supplier) {
                return [
                    'Supplier Code' => $supplier->supplier_code,
                    'Legal Name' => $supplier->legal_name,
                    'Trade Name' => $supplier->trade_name,
                    'Type' => $supplier->supplier_type,
                    'University' => $supplier->university->name ?? '',
                    'Contact Person' => $supplier->contact_person,
                    'Email' => $supplier->email,
                    'Phone' => $supplier->phone,
                    'Address' => $supplier->address,
                    'City' => $supplier->city,
                    'State' => $supplier->state,
                    'Country' => $supplier->country,
                    'Postal Code' => $supplier->postal_code,
                    'Tax ID' => $supplier->tax_id,
                    'VAT Number' => $supplier->vat_number,
                    'Credit Limit' => $supplier->credit_limit,
                    'Payment Terms (Days)' => $supplier->payment_terms_days,
                    'Rating' => $supplier->rating,
                    'Delivery Reliability %' => $supplier->delivery_reliability,
                    'Quality Rating %' => $supplier->quality_rating,
                    'Approved' => $supplier->is_approved ? 'Yes' : 'No',
                    'Active' => $supplier->is_active ? 'Yes' : 'No',
                    'Approval Date' => $supplier->approval_date?->format('Y-m-d'),
                    'Next Evaluation Date' => $supplier->next_evaluation_date?->format('Y-m-d'),
                    'Approved By' => $supplier->approver->name ?? '',
                    'Notes' => $supplier->notes,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $exportData,
                'total' => $exportData->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export suppliers: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import suppliers from Excel
     */
    public function import(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // 10MB max
                'university_id' => 'required|uuid|exists:universities,university_id'
            ]);

            if ($validator->fails()) {
                return redirect()
                    ->back()
                    ->with('error', 'Invalid file: ' . $validator->errors()->first());
            }

            // Process import file (you can use Maatwebsite\Excel package here)
            $file = $request->file('file');
            $universityId = $request->university_id;
            
            // Example import logic (you'll need to implement based on your Excel structure)
            // $import = new SuppliersImport($universityId);
            // Excel::import($import, $file);

            return redirect()
                ->route('suppliers.index')
                ->with('success', 'Suppliers import started! The process will complete in the background.');

        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Failed to import suppliers: ' . $e->getMessage());
        }
    }

    /**
     * Get supplier statistics for dashboard
     */
    public function getStatistics(Request $request)
    {
        try {
            $query = Supplier::query();

            // Filter by university if provided
            if ($request->has('university_id') && $request->university_id) {
                $query->where('university_id', $request->university_id);
            }

            $totalSuppliers = $query->count();
            $approvedSuppliers = $query->where('is_approved', true)->count();
            $activeSuppliers = $query->where('is_active', true)->count();
            $highRatedSuppliers = $query->where('rating', '>=', 4)->count();
            
            $totalCreditLimit = $query->sum('credit_limit');
            $averageRating = $query->avg('rating') ?? 0;

            $typeDistribution = $query->select('supplier_type', DB::raw('count(*) as count'))
                ->groupBy('supplier_type')
                ->pluck('count', 'supplier_type')
                ->toArray();

            $recentSuppliers = $query->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(['supplier_id', 'supplier_code', 'legal_name', 'created_at']);

            return response()->json([
                'success' => true,
                'data' => [
                    'totalSuppliers' => $totalSuppliers,
                    'approvedSuppliers' => $approvedSuppliers,
                    'activeSuppliers' => $activeSuppliers,
                    'highRatedSuppliers' => $highRatedSuppliers,
                    'totalCreditLimit' => (float) $totalCreditLimit,
                    'averageRating' => round($averageRating, 2),
                    'approvalRate' => $totalSuppliers > 0 ? round(($approvedSuppliers / $totalSuppliers) * 100, 1) : 0,
                    'activeRate' => $totalSuppliers > 0 ? round(($activeSuppliers / $totalSuppliers) * 100, 1) : 0,
                    'typeDistribution' => $typeDistribution,
                    'recentSuppliers' => $recentSuppliers,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Quick approve a supplier
     */
    public function quickApprove($supplierId)
    {
        try {
            $supplier = Supplier::where('supplier_id', $supplierId)->firstOrFail();
            
            $supplier->update([
                'is_approved' => true,
                'approval_date' => now(),
                'approved_by' => Auth::user()->user_id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Supplier approved successfully!'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve supplier: ' . $e->getMessage()
            ], 500);
        }
    }
}