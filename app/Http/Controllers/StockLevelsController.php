<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\InventoryItem;
use App\Models\Location;
use App\Models\StockLevel;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StockLevelsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
         $stockLevels=StockLevel::with([
                'university:university_id,name',
                'item:item_id,item_code,name,unit_of_measure',
                'department:department_id,name',
                'location:location_id,name',
            ])
            ->get()
            ->map(function($stock){
                return [
                    'stock_id'=>$stock->stock_id,
                    'university_id'=>$stock->university_id,
                    'item_id'=>$stock->item_id,
                    'item_name'=>$stock->item->name??'',
                    'department_id'=>$stock->department_id,
                    'department_name'=>$stock->department->name??null,
                    'location_id'=>$stock->location_id,
                    'location_name'=>$stock->location->name??null,
                    'current_quantity'=>$stock->current_quantity,
                    'committed_quantity'=>$stock->committed_quantity,
                    'available_quantity'=>$stock->available_quantity,
                    'on_order_quantity'=>$stock->on_order_quantity,
                    'average_cost'=>$stock->average_cost,
                    'total_value'=>$stock->total_value,
                    'last_count_date'=>$stock->last_count_date,
                    'next_count_date'=>$stock->next_count_date,
                    'count_frequency'=>$stock->count_frequency,
                    'reorder_level'=>$stock->reorder_level,
                    'max_level'=>$stock->max_level,
                    'safety_stock'=>$stock->safety_stock,
                    'lead_time_days'=>$stock->lead_time_days,
                    'service_level'=>$stock->service_level,
                    'stock_movement_stats'=>$stock->stock_movement_stats,
                    'last_updated'=>$stock->last_updated,

                ];
            });
            return Inertia::render('StockLevels/StockLevels')
            ->with([
                'stockLevels' => Inertia::defer(fn () =>
                    $stockLevels // paginate if this is very large
                ),
                'universities' => Inertia::defer(fn () =>
                    University::select('university_id','name','code')->get()
                ),
                'items' => Inertia::defer(fn () =>
                    InventoryItem::select('item_id','name')->get()
                ),
                'departments' => Inertia::defer(fn () =>
                    Department::select('department_id','name')->get()
                ),
                'locations' => Inertia::defer(fn () =>
                    Location::select('location_id','name')->get()
                ),
            ]);

            // $universities= University::select('university_id','name','code');
            // $items= InventoryItem::select('item_id','name')->get();
            // $departments=Department::select('department_id','name')->get();
            // $locations=Location::select('location_id','name')->get();
            // return Inertia::render('StockLevels/StockLevels', [
            //     'locations'=>$locations,
            //     'stockLevels'=>$stockLevels,
            //     'universities'=>$universities,
            //     'items'=>$items,
            //     'departments'=>$departments
            // ]);

    }

    /**
     * Store a newly created resource.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'university_id' => ['required', 'uuid', 'exists:universities,university_id'],
            'item_id' => ['required', 'uuid', 'exists:inventory_items,item_id'],
            'department_id' => ['required', 'uuid', 'exists:departments,department_id'],
            'location_id' => ['nullable', 'uuid', 'exists:locations,location_id'],
            'current_quantity' => ['required', 'integer', 'min:0'],
            'committed_quantity' => ['required', 'integer', 'min:0'],
            'on_order_quantity' => ['required', 'integer', 'min:0'],
            'average_cost' => ['required', 'numeric', 'min:0'],
            'last_count_date' => ['nullable', 'date'],
            'next_count_date' => ['nullable', 'date'],
            'count_frequency' => ['nullable', 'in:daily,weekly,monthly,quarterly,yearly'],
            'reorder_level' => ['required', 'numeric', 'min:0'],
            'max_level' => ['nullable', 'numeric', 'min:0'],
            'safety_stock' => ['required', 'numeric', 'min:0'],
            'lead_time_days' => ['required', 'integer', 'min:0'],
            'service_level' => ['required', 'numeric', 'min:0', 'max:100'],
        ], [
            'item_id.required' => 'The item field is required.',
            'department_id.required' => 'The department field is required.',
            'university_id.required' => 'The university field is required.',
            'service_level.max' => 'Service level cannot exceed 100%.',
        ]);

        // Check for unique constraint
        $exists = StockLevel::where('item_id', $validated['item_id'])
            ->where('department_id', $validated['department_id'])
            ->where('location_id', $validated['location_id'])
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors([
                'item_id' => 'A stock level record already exists for this item, department, and location combination.'
            ]);
        }

        // Calculate derived fields
        $validated['available_quantity'] = $validated['current_quantity'] - $validated['committed_quantity'];
        $validated['total_value'] = $validated['current_quantity'] * $validated['average_cost'];
        $validated['stock_id'] = Str::uuid();
        $validated['last_updated'] = now();

        // Handle stock movement stats
        $validated['stock_movement_stats'] = [
            'last_month_movement' => 0,
            'average_monthly_usage' => 0,
            'turnover_rate' => 0,
        ];

        DB::beginTransaction();
        try {
            $stockLevel = StockLevel::create($validated);
            DB::commit();

            return Redirect::route('stock-levels.index')
                ->with('success', 'Stock level created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors([
                'error' => 'Failed to create stock level: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Update the specified resource.
     */
    public function update(Request $request, $id)
    {
        $stockLevel = StockLevel::where('stock_id', $id)->firstOrFail();

        $validated = $request->validate([
            'university_id' => ['sometimes', 'required', 'uuid', 'exists:universities,university_id'],
            'item_id' => ['sometimes', 'required', 'uuid', 'exists:inventory_items,item_id'],
            'department_id' => ['sometimes', 'required', 'uuid', 'exists:departments,department_id'],
            'location_id' => ['nullable', 'uuid', 'exists:locations,location_id'],
            'current_quantity' => ['sometimes', 'required', 'integer', 'min:0'],
            'committed_quantity' => ['sometimes', 'required', 'integer', 'min:0'],
            'on_order_quantity' => ['sometimes', 'required', 'integer', 'min:0'],
            'average_cost' => ['sometimes', 'required', 'numeric', 'min:0'],
            'last_count_date' => ['nullable', 'date'],
            'next_count_date' => ['nullable', 'date'],
            'count_frequency' => ['nullable', 'in:daily,weekly,monthly,quarterly,yearly'],
            'reorder_level' => ['sometimes', 'required', 'numeric', 'min:0'],
            'max_level' => ['nullable', 'numeric', 'min:0'],
            'safety_stock' => ['sometimes', 'required', 'numeric', 'min:0'],
            'lead_time_days' => ['sometimes', 'required', 'integer', 'min:0'],
            'service_level' => ['sometimes', 'required', 'numeric', 'min:0', 'max:100'],
        ], [
            'item_id.required' => 'The item field is required.',
            'department_id.required' => 'The department field is required.',
            'service_level.max' => 'Service level cannot exceed 100%.',
        ]);

        // Check for unique constraint (excluding current record)
        if (isset($validated['item_id']) || isset($validated['department_id']) || isset($validated['location_id'])) {
            $exists = StockLevel::where('item_id', $validated['item_id'] ?? $stockLevel->item_id)
                ->where('department_id', $validated['department_id'] ?? $stockLevel->department_id)
                ->where('location_id', $validated['location_id'] ?? $stockLevel->location_id)
                ->where('stock_id', '!=', $id)
                ->exists();

            if ($exists) {
                return redirect()->back()->withErrors([
                    'item_id' => 'A stock level record already exists for this item, department, and location combination.'
                ]);
            }
        }

        // Calculate derived fields if quantities or cost changed
        if (isset($validated['current_quantity']) || isset($validated['committed_quantity']) || isset($validated['average_cost'])) {
            $currentQty = $validated['current_quantity'] ?? $stockLevel->current_quantity;
            $committedQty = $validated['committed_quantity'] ?? $stockLevel->committed_quantity;
            $avgCost = $validated['average_cost'] ?? $stockLevel->average_cost;

            $validated['available_quantity'] = $currentQty - $committedQty;
            $validated['total_value'] = $currentQty * $avgCost;
        }

        $validated['last_updated'] = now();

        DB::beginTransaction();
        try {
            $stockLevel->update($validated);
            DB::commit();

            return Redirect::route('stock-levels.index')
                ->with('success', 'Stock level updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors([
                'error' => 'Failed to update stock level: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Remove the specified resource.
     */
    public function destroy($id)
    {
        $stockLevel = StockLevel::where('stock_id', $id)->firstOrFail();

        DB::beginTransaction();
        try {
            $stockLevel->delete();
            DB::commit();

            return Redirect::route('stock-levels.index')
                ->with('error', 'Stock level deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors([
                'error' => 'Failed to delete stock level: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Import stock levels from Excel/CSV
     */
    public function import(Request $request)
    {
        $request->validate([
            'data' => ['required', 'array'],
            'data.*.item_id' => ['required', 'uuid', 'exists:inventory_items,item_id'],
            'data.*.department_id' => ['required', 'uuid', 'exists:departments,department_id'],
            'data.*.current_quantity' => ['required', 'integer', 'min:0'],
            'data.*.committed_quantity' => ['required', 'integer', 'min:0'],
            'data.*.on_order_quantity' => ['required', 'integer', 'min:0'],
            'data.*.average_cost' => ['required', 'numeric', 'min:0'],
        ]);

        $importedCount = 0;
        $errors = [];

        DB::beginTransaction();
        try {
            foreach ($request->data as $index => $row) {
                try {
                    // Check for existing record
                    $exists = StockLevel::where('item_id', $row['item_id'])
                        ->where('department_id', $row['department_id'])
                        ->where('location_id', $row['location_id'] ?? null)
                        ->exists();

                    if ($exists) {
                        $errors[] = "Row {$index}: Record already exists for this item, department, and location";
                        continue;
                    }

                    // Calculate derived fields
                    $availableQty = $row['current_quantity'] - $row['committed_quantity'];
                    $totalValue = $row['current_quantity'] * $row['average_cost'];

                    StockLevel::create([
                        'stock_id' => Str::uuid(),
                        'university_id' => Auth::user()->university_id ?? $row['university_id'],
                        'item_id' => $row['item_id'],
                        'department_id' => $row['department_id'],
                        'location_id' => $row['location_id'] ?? null,
                        'current_quantity' => $row['current_quantity'],
                        'committed_quantity' => $row['committed_quantity'],
                        'available_quantity' => $availableQty,
                        'on_order_quantity' => $row['on_order_quantity'],
                        'average_cost' => $row['average_cost'],
                        'total_value' => $totalValue,
                        'last_count_date' => $row['last_count_date'] ?? null,
                        'next_count_date' => $row['next_count_date'] ?? null,
                        'count_frequency' => $row['count_frequency'] ?? 'monthly',
                        'reorder_level' => $row['reorder_level'] ?? 0,
                        'max_level' => $row['max_level'] ?? null,
                        'safety_stock' => $row['safety_stock'] ?? 0,
                        'lead_time_days' => $row['lead_time_days'] ?? 7,
                        'service_level' => $row['service_level'] ?? 95,
                        'stock_movement_stats' => $row['stock_movement_stats'] ?? null,
                        'last_updated' => now(),
                    ]);

                    $importedCount++;
                } catch (\Exception $e) {
                    $errors[] = "Row {$index}: " . $e->getMessage();
                }
            }

            DB::commit();

            $message = "Successfully imported {$importedCount} stock levels.";
            if (!empty($errors)) {
                $message .= " " . count($errors) . " errors occurred.";
            }

            return Redirect::route('stock-levels.index')
                ->with('success', $message)
                ->with('import_errors', $errors);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors([
                'error' => 'Failed to import stock levels: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Bulk update stock levels
     */
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'updates' => ['required', 'array'],
            'updates.*.stock_id' => ['required', 'uuid', 'exists:stock_levels,stock_id'],
            'updates.*.current_quantity' => ['sometimes', 'required', 'integer', 'min:0'],
            'updates.*.committed_quantity' => ['sometimes', 'required', 'integer', 'min:0'],
        ]);

        $updatedCount = 0;

        DB::beginTransaction();
        try {
            foreach ($request->updates as $update) {
                $stockLevel = StockLevel::where('stock_id', $update['stock_id'])->first();

                if ($stockLevel) {
                    $stockLevel->update([
                        'current_quantity' => $update['current_quantity'] ?? $stockLevel->current_quantity,
                        'committed_quantity' => $update['committed_quantity'] ?? $stockLevel->committed_quantity,
                        'available_quantity' => ($update['current_quantity'] ?? $stockLevel->current_quantity) - ($update['committed_quantity'] ?? $stockLevel->committed_quantity),
                        'total_value' => ($update['current_quantity'] ?? $stockLevel->current_quantity) * $stockLevel->average_cost,
                        'last_updated' => now(),
                    ]);
                    $updatedCount++;
                }
            }

            DB::commit();

            return Redirect::route('stock-levels.index')
                ->with('success', "Successfully updated {$updatedCount} stock levels.");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors([
                'error' => 'Failed to bulk update stock levels: ' . $e->getMessage()
            ]);
        }
    }
}