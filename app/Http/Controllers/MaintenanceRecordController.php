<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\InventoryItem;
use App\Models\MaintenanceRecord;
use App\Models\University;
use App\Repositories\MaintenanceRecordRepository;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceRecordController extends Controller
{
    protected $maintenanceRecordRepository;

    public function __construct(MaintenanceRecordRepository $maintenanceRecordRepository)
    {
        $this->maintenanceRecordRepository = $maintenanceRecordRepository;
    }

    /**
     * Display a listing of the maintenance records.
     */
    public function index(Request $request)
    {
        try {
            $maintenanceRecords = $this->maintenanceRecordRepository->getAll();
            
            $stats = $this->maintenanceRecordRepository->getMaintenanceStats(Auth::user()->university_id ?? null);
            $items = InventoryItem::select('item_id','name')->get();
            $items = InventoryItem::select('item_id','name')->get();
            $departments = Department::select('department_id','name')->get();
            $universities  = University::select('university_id','name')->get();
            return Inertia::render('Maintenance/Maintenance', [
                'records' => $maintenanceRecords,
                'stats' => $stats,
                'items'=>$items,
                'departments'=>$departments,
                'universities'=>$universities,
                'filters' => $request->only(['search', 'status', 'type', 'priority']),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load maintenance records: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for creating a new maintenance record.
     */
    public function create()
    {
        try {
            return Inertia::render('Maintenance/Create', [
                'maintenanceTypes' => ['preventive', 'corrective', 'predictive', 'condition_based', 'emergency'],
                'priorities' => ['low', 'medium', 'high', 'critical'],
                'statuses' => ['scheduled', 'in_progress', 'completed', 'cancelled', 'deferred'],
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load create form: ' . $e->getMessage());
        }
    }

    /**
     * Store a newly created maintenance record.
     */
    public function store(Request $request): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'university_id' => 'required|uuid',
                'item_id' => 'required|uuid',
                'department_id' => 'required|uuid',
                'maintenance_code' => 'nullable|string|max:255|unique:maintenance_records,maintenance_code',
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
                'created_by' => 'nullable|uuid',
                'assigned_to' => 'nullable|uuid',
            ]);

            return $this->maintenanceRecordRepository->create($validated);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create maintenance record: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Display the specified maintenance record.
     */
    public function show(string $id)
    {
        try {
            $maintenanceRecord = $this->maintenanceRecordRepository->findById($id);
            
            if (!$maintenanceRecord) {
                throw new \Exception('Maintenance record not found');
            }

            return Inertia::render('Maintenance/Show', [
                'maintenanceRecord' => $maintenanceRecord,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load maintenance record: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified maintenance record.
     */
    public function edit(string $id)
    {
        try {
            $maintenanceRecord = $this->maintenanceRecordRepository->findById($id);
            
            if (!$maintenanceRecord) {
                throw new \Exception('Maintenance record not found');
            }

            return Inertia::render('Maintenance/Edit', [
                'maintenanceRecord' => $maintenanceRecord,
                'maintenanceTypes' => ['preventive', 'corrective', 'predictive', 'condition_based', 'emergency'],
                'priorities' => ['low', 'medium', 'high', 'critical'],
                'statuses' => ['scheduled', 'in_progress', 'completed', 'cancelled', 'deferred'],
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load edit form: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified maintenance record.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'university_id' => 'required|uuid',
                'item_id' => 'required|uuid',
                'department_id' => 'required|uuid',
                'maintenance_code' => 'nullable|string|max:255|unique:maintenance_records,maintenance_code,' . $id . ',maintenance_id',
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
                'assigned_to' => 'nullable|uuid',
            ]);

            return $this->maintenanceRecordRepository->update($id, $validated);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update maintenance record: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Remove the specified maintenance record.
     */
    public function destroy(string $id): RedirectResponse
    {
        try {
            return $this->maintenanceRecordRepository->delete($id);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete maintenance record: ' . $e->getMessage());
        }
    }

    /**
     * Permanently delete the specified maintenance record.
     */
    public function forceDelete(string $id): RedirectResponse
    {
        try {
            return $this->maintenanceRecordRepository->forceDelete($id);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to permanently delete maintenance record: ' . $e->getMessage());
        }
    }

    /**
     * Restore the specified soft-deleted maintenance record.
     */
    public function restore(string $id): RedirectResponse
    {
        try {
            return $this->maintenanceRecordRepository->restore($id);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to restore maintenance record: ' . $e->getMessage());
        }
    }

    /**
     * Update maintenance status.
     */
    public function updateStatus(Request $request, string $id): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:scheduled,in_progress,completed,cancelled,deferred',
                'work_performed' => 'nullable|string',
            ]);

            return $this->maintenanceRecordRepository->updateStatus(
                $id, 
                $validated['status'], 
                $validated['work_performed'] ?? null
            );
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update maintenance status: ' . $e->getMessage());
        }
    }

    /**
     * Assign technician to maintenance record.
     */
    public function assignTechnician(Request $request, string $id): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'technician' => 'required|string|max:255',
                'assigned_to' => 'nullable|uuid',
            ]);

            return $this->maintenanceRecordRepository->assignTechnician(
                $id, 
                $validated['technician'], 
                $validated['assigned_to'] ?? null
            );
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to assign technician: ' . $e->getMessage());
        }
    }

    /**
     * Get active maintenance records.
     */
    public function active()
    {
        try {
            $maintenanceRecords = $this->maintenanceRecordRepository->getActiveMaintenance(Auth::user()->university_id ?? null);

            return Inertia::render('Maintenance/Index', [
                'maintenanceRecords' => $maintenanceRecords,
                'filters' => ['status' => 'active'],
                'stats' => $this->maintenanceRecordRepository->getMaintenanceStats(Auth::user()->university_id ?? null),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load active maintenance records: ' . $e->getMessage());
        }
    }

    /**
     * Get overdue maintenance records.
     */
    public function overdue()
    {
        try {
            $maintenanceRecords = $this->maintenanceRecordRepository->getOverdueMaintenance(Auth::user()->university_id ?? null);

            return Inertia::render('Maintenance/Index', [
                'maintenanceRecords' => $maintenanceRecords,
                'filters' => ['status' => 'overdue'],
                'stats' => $this->maintenanceRecordRepository->getMaintenanceStats(Auth::user()->university_id ?? null),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load overdue maintenance records: ' . $e->getMessage());
        }
    }

    /**
     * Get completed maintenance records.
     */
    public function completed()
    {
        try {
            $maintenanceRecords = $this->maintenanceRecordRepository->getCompletedMaintenance(Auth::user()->university_id ?? null);

            return Inertia::render('Maintenance/Index', [
                'maintenanceRecords' => $maintenanceRecords,
                'filters' => ['status' => 'completed'],
                'stats' => $this->maintenanceRecordRepository->getMaintenanceStats(Auth::user()->university_id ?? null),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load completed maintenance records: ' . $e->getMessage());
        }
    }

    /**
     * Get maintenance records by item.
     */
    public function byItem(string $itemId)
    {
        try {
            $maintenanceRecords = $this->maintenanceRecordRepository->getMaintenanceByItem($itemId, Auth::user()->university_id ?? null);

            return Inertia::render('Maintenance/Index', [
                'maintenanceRecords' => $maintenanceRecords,
                'filters' => ['item_id' => $itemId],
                'stats' => $this->maintenanceRecordRepository->getMaintenanceStats(Auth::user()->university_id ?? null),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load maintenance records for item: ' . $e->getMessage());
        }
    }

    /**
     * Get maintenance records by department.
     */
    public function byDepartment(string $departmentId)
    {
        try {
            $maintenanceRecords = $this->maintenanceRecordRepository->getMaintenanceByDepartment($departmentId, Auth::user()->university_id ?? null);

            return Inertia::render('Maintenance/Maintenance', [
                'maintenanceRecords' => $maintenanceRecords,
                'filters' => ['department_id' => $departmentId],
                'stats' => $this->maintenanceRecordRepository->getMaintenanceStats(Auth::user()->university_id ?? null),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load maintenance records for department: ' . $e->getMessage());
        }
    }
}