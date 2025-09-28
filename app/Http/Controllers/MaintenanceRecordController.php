<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceRecord;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class MaintenanceRecordController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MaintenanceRecord::with(['university', 'inventoryItem', 'department']);

        // Advanced filtering
        if ($request->has('filters')) {
            $filters = json_decode($request->filters, true);
            
            foreach ($filters as $filter) {
                if (isset($filter['field'], $filter['value']) && $filter['value'] !== '') {
                    if ($filter['field'] === 'maintenance_type') {
                        $query->whereIn('maintenance_type', (array)$filter['value']);
                    } elseif ($filter['field'] === 'priority') {
                        $query->whereIn('priority', (array)$filter['value']);
                    } elseif ($filter['field'] === 'status') {
                        $query->whereIn('status', (array)$filter['value']);
                    } elseif ($filter['field'] === 'date_range') {
                        $query->whereBetween('scheduled_date', $filter['value']);
                    } else {
                        $query->where($filter['field'], 'LIKE', '%' . $filter['value'] . '%');
                    }
                }
            }
        }

        // Search
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('maintenance_code', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%")
                  ->orWhere('technician', 'LIKE', "%{$search}%")
                  ->orWhere('vendor', 'LIKE', "%{$search}%");
            });
        }

        // Sorting
        if ($request->has('sortBy') && $request->sortBy !== '') {
            $direction = $request->boolean('sortDesc', false) ? 'desc' : 'asc';
            $query->orderBy($request->sortBy, $direction);
        } else {
            $query->orderBy('scheduled_date', 'desc');
        }

        $records = $query->paginate($request->get('perPage', 10));

        return response()->json($records);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'university_id' => 'required|uuid|exists:universities,university_id',
            'item_id' => 'required|uuid|exists:inventory_items,item_id',
            'department_id' => 'required|uuid|exists:departments,department_id',
            'maintenance_code' => 'required|string|unique:maintenance_records,maintenance_code',
            'scheduled_date' => 'required|date',
            'completed_date' => 'nullable|date',
            'maintenance_type' => 'required|in:preventive,corrective,predictive,condition_based,emergency',
            'priority' => 'required|in:low,medium,high,critical',
            'description' => 'required|string',
            'work_performed' => 'nullable|string',
            'root_cause' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'labor_cost' => 'nullable|numeric|min:0',
            'parts_cost' => 'nullable|numeric|min:0',
            'total_cost' => 'nullable|numeric|min:0',
            'downtime_hours' => 'nullable|integer|min:0',
            'technician' => 'nullable|string|max:255',
            'vendor' => 'nullable|string|max:255',
            'next_maintenance_date' => 'nullable|date',
            'status' => 'required|in:scheduled,in_progress,completed,cancelled,deferred',
            'created_by' => 'required|uuid',
            'assigned_to' => 'nullable|uuid'
        ]);

        try {
            DB::beginTransaction();

            $validated['maintenance_id'] = (string) Str::uuid();
            
            if (empty($validated['total_cost'])) {
                $validated['total_cost'] = ($validated['labor_cost'] ?? 0) + ($validated['parts_cost'] ?? 0);
            }

            $record = MaintenanceRecord::create($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Maintenance record created successfully!',
                'data' => $record->load(['university', 'inventoryItem', 'department'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create maintenance record: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, MaintenanceRecord $maintenanceRecord): JsonResponse
    {
        $validated = $request->validate([
            'university_id' => 'sometimes|uuid|exists:universities,university_id',
            'item_id' => 'sometimes|uuid|exists:inventory_items,item_id',
            'department_id' => 'sometimes|uuid|exists:departments,department_id',
            'maintenance_code' => 'sometimes|string|unique:maintenance_records,maintenance_code,' . $maintenanceRecord->maintenance_id . ',maintenance_id',
            'scheduled_date' => 'sometimes|date',
            'completed_date' => 'nullable|date',
            'maintenance_type' => 'sometimes|in:preventive,corrective,predictive,condition_based,emergency',
            'priority' => 'sometimes|in:low,medium,high,critical',
            'description' => 'sometimes|string',
            'work_performed' => 'nullable|string',
            'root_cause' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'labor_cost' => 'nullable|numeric|min:0',
            'parts_cost' => 'nullable|numeric|min:0',
            'total_cost' => 'nullable|numeric|min:0',
            'downtime_hours' => 'nullable|integer|min:0',
            'technician' => 'nullable|string|max:255',
            'vendor' => 'nullable|string|max:255',
            'next_maintenance_date' => 'nullable|date',
            'status' => 'sometimes|in:scheduled,in_progress,completed,cancelled,deferred',
            'assigned_to' => 'nullable|uuid'
        ]);

        try {
            DB::beginTransaction();

            if (isset($validated['labor_cost']) || isset($validated['parts_cost'])) {
                $labor_cost = $validated['labor_cost'] ?? $maintenanceRecord->labor_cost;
                $parts_cost = $validated['parts_cost'] ?? $maintenanceRecord->parts_cost;
                $validated['total_cost'] = $labor_cost + $parts_cost;
            }

            $maintenanceRecord->update($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Maintenance record updated successfully!',
                'data' => $maintenanceRecord->fresh(['university', 'inventoryItem', 'department'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update maintenance record: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(MaintenanceRecord $maintenanceRecord): JsonResponse
    {
        try {
            $maintenanceRecord->delete();

            return response()->json([
                'success' => true,
                'message' => 'Maintenance record deleted successfully!'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete maintenance record: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getSummary(): JsonResponse
    {
        $summary = MaintenanceRecord::selectRaw('
            COUNT(*) as total_records,
            SUM(CASE WHEN status = "scheduled" THEN 1 ELSE 0 END) as scheduled,
            SUM(CASE WHEN status = "in_progress" THEN 1 ELSE 0 END) as in_progress,
            SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = "cancelled" THEN 1 ELSE 0 END) as cancelled,
            SUM(CASE WHEN status = "deferred" THEN 1 ELSE 0 END) as deferred,
            SUM(total_cost) as total_maintenance_cost,
            AVG(total_cost) as avg_maintenance_cost,
            SUM(downtime_hours) as total_downtime_hours,
            AVG(downtime_hours) as avg_downtime_hours
        ')->first();

        $maintenanceTypeSummary = MaintenanceRecord::groupBy('maintenance_type')
            ->selectRaw('maintenance_type, COUNT(*) as count')
            ->get();

        $prioritySummary = MaintenanceRecord::groupBy('priority')
            ->selectRaw('priority, COUNT(*) as count')
            ->get();

        return response()->json([
            'overall' => $summary,
            'by_maintenance_type' => $maintenanceTypeSummary,
            'by_priority' => $prioritySummary
        ]);
    }
}