<?php

namespace App\Repositories;

use App\Models\MaintenanceRecord;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;

class MaintenanceRecordRepository
{
    public function getAll()
    {
        $maintenanceRecords = MaintenanceRecord::with([
            'university:university_id,name,code',
            'item:item_id,item_code,name',
            'department:department_id,name,department_code',
            // 'createdByUser:id,name,email',
            // 'assignedToUser:id,name,email'
        ])
        ->get()
        ->map(function ($record) {
            return [
                'maintenance_id' => $record->maintenance_id,
                'university_id' => $record->university_id,
                'item_id' => $record->item_id,
                'department_id' => $record->department_id,
                'maintenance_code' => $record->maintenance_code,
                'scheduled_date' => $record->scheduled_date,
                'completed_date' => $record->completed_date,
                'maintenance_type' => $record->maintenance_type,
                'priority' => $record->priority,
                'description' => $record->description,
                'work_performed' => $record->work_performed,
                'root_cause' => $record->root_cause,
                'recommendations' => $record->recommendations,
                'labor_cost' => $record->labor_cost,
                'parts_cost' => $record->parts_cost,
                'total_cost' => $record->total_cost,
                'downtime_hours' => $record->downtime_hours,
                'technician' => $record->technician,
                'vendor' => $record->vendor,
                'next_maintenance_date' => $record->next_maintenance_date,
                'status' => $record->status,
                'created_by' => $record->created_by,
                'assigned_to' => $record->assigned_to,
                'created_at' => $record->created_at,
                'updated_at' => $record->updated_at,
                'university_name' => $record->university ? $record->university->name : null,
                'item_code' => $record->item ? $record->item->item_code : null,
                'item_name' => $record->item ? $record->item->name : null,
                'department_name' => $record->department ? $record->department->name : null,
                'department_code' => $record->department ? $record->department->department_code : null,
                'created_by_name' => $record->createdByUser ? $record->createdByUser->name : null,
                'assigned_to_name' => $record->assignedToUser ? $record->assignedToUser->name : null,
                'is_overdue' => $record->scheduled_date < now() && in_array($record->status, ['scheduled', 'in_progress']),
                'completion_percentage' => $this->calculateCompletionPercentage($record),
            ];
        });  
        
        return $maintenanceRecords;
    }
    
    public function findById($maintenanceId)
    {
        return MaintenanceRecord::with(['university', 'item', 'department', 'createdByUser', 'assignedToUser'])
                  ->where('maintenance_id', $maintenanceId)
                  ->first();
    }

    public function findByCode($maintenanceCode, $universityId = null)
    {
        $query = MaintenanceRecord::with(['university', 'item', 'department', 'createdByUser', 'assignedToUser'])
                  ->where('maintenance_code', $maintenanceCode);

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        return $query->first();
    }

    public function create(array $data): RedirectResponse
    {
        try {
            return DB::transaction(function () use ($data) {
                // Generate UUID if not provided
                if (empty($data['maintenance_id'])) {
                    $data['maintenance_id'] = Str::uuid()->toString();
                }

                // Generate maintenance code if not provided
                if (empty($data['maintenance_code'])) {
                    $data['maintenance_code'] = 'MNT-' . date('Ymd') . '-' . Str::random(6);
                }

                // Calculate total cost
                if (isset($data['labor_cost']) || isset($data['parts_cost'])) {
                    $laborCost = $data['labor_cost'] ?? 0;
                    $partsCost = $data['parts_cost'] ?? 0;
                    $data['total_cost'] = $laborCost + $partsCost;
                }

                // Set created_by if not provided
                if (empty($data['created_by'])) {
                    $data['created_by'] = Auth::id();
                }

                MaintenanceRecord::create($data);

                return redirect()->back()->with('success', 'Maintenance record created successfully!');
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create maintenance record: ' . $e->getMessage())->withInput();
        }
    }

    public function update($maintenanceId, array $data): RedirectResponse
    {
        try {
            return DB::transaction(function () use ($maintenanceId, $data) {
                $record = $this->findById($maintenanceId);
                
                if (!$record) {
                    throw new \Exception("Maintenance record not found");
                }

                // Recalculate total cost if labor_cost or parts_cost changed
                if (isset($data['labor_cost']) || isset($data['parts_cost'])) {
                    $laborCost = $data['labor_cost'] ?? $record->labor_cost;
                    $partsCost = $data['parts_cost'] ?? $record->parts_cost;
                    $data['total_cost'] = $laborCost + $partsCost;
                }

                // If status changed to completed, set completed_date
                if (isset($data['status']) && $data['status'] === 'completed' && $record->status !== 'completed') {
                    $data['completed_date'] = now()->format('Y-m-d');
                }

                // If status changed from completed, clear completed_date
                if (isset($data['status']) && $data['status'] !== 'completed' && $record->status === 'completed') {
                    $data['completed_date'] = null;
                }

                $record->update($data);

                return redirect()->back()->with('success', 'Maintenance record updated successfully!');
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update maintenance record: ' . $e->getMessage())->withInput();
        }
    }

    public function delete($maintenanceId): RedirectResponse
    {
        try {
            return DB::transaction(function () use ($maintenanceId) {
                $record = $this->findById($maintenanceId);
                
                if (!$record) {
                    throw new \Exception("Maintenance record not found");
                }

                $record->delete();

                return redirect()->back()->with('success', 'Maintenance record deleted successfully!');
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete maintenance record: ' . $e->getMessage());
        }
    }

    public function forceDelete($maintenanceId): RedirectResponse
    {
        try {
            return DB::transaction(function () use ($maintenanceId) {
                $record = MaintenanceRecord::withTrashed()->where('maintenance_id', $maintenanceId)->first();
                
                if (!$record) {
                    throw new \Exception("Maintenance record not found");
                }

                $record->forceDelete();

                return redirect()->back()->with('success', 'Maintenance record permanently deleted!');
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to permanently delete maintenance record: ' . $e->getMessage());
        }
    }

    public function restore($maintenanceId): RedirectResponse
    {
        try {
            return DB::transaction(function () use ($maintenanceId) {
                $record = MaintenanceRecord::withTrashed()->where('maintenance_id', $maintenanceId)->first();
                
                if (!$record) {
                    throw new \Exception("Maintenance record not found");
                }

                $record->restore();

                return redirect()->back()->with('success', 'Maintenance record restored successfully!');
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to restore maintenance record: ' . $e->getMessage());
        }
    }

    public function getActiveMaintenance($universityId = null)
    {
        $query = MaintenanceRecord::with(['university', 'item', 'department'])
                  ->whereIn('status', ['scheduled', 'in_progress']);

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        return $query->orderBy('scheduled_date')->get();
    }

    public function getOverdueMaintenance($universityId = null)
    {
        $query = MaintenanceRecord::with(['university', 'item', 'department'])
                  ->where('scheduled_date', '<', now())
                  ->whereIn('status', ['scheduled', 'in_progress']);

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        return $query->orderBy('scheduled_date')->get();
    }

    public function getCompletedMaintenance($universityId = null)
    {
        $query = MaintenanceRecord::with(['university', 'item', 'department'])
                  ->where('status', 'completed');

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        return $query->orderBy('completed_date', 'desc')->get();
    }

    public function getMaintenanceByItem($itemId, $universityId = null)
    {
        $query = MaintenanceRecord::with(['university', 'item', 'department'])
                  ->where('item_id', $itemId);

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        return $query->orderBy('scheduled_date', 'desc')->get();
    }

    public function getMaintenanceByDepartment($departmentId, $universityId = null)
    {
        $query = MaintenanceRecord::with(['university', 'item', 'department'])
                  ->where('department_id', $departmentId);

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        return $query->orderBy('scheduled_date', 'desc')->get();
    }

    public function updateStatus($maintenanceId, $status, $workPerformed = null): RedirectResponse
    {
        try {
            return DB::transaction(function () use ($maintenanceId, $status, $workPerformed) {
                $record = $this->findById($maintenanceId);
                
                if (!$record) {
                    throw new \Exception("Maintenance record not found");
                }

                $data = ['status' => $status];

                if ($status === 'completed') {
                    $data['completed_date'] = now()->format('Y-m-d');
                    if ($workPerformed) {
                        $data['work_performed'] = $workPerformed;
                    }
                } elseif ($record->status === 'completed' && $status !== 'completed') {
                    $data['completed_date'] = null;
                }

                $record->update($data);

                return redirect()->back()->with('success', 'Maintenance status updated successfully!');
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update maintenance status: ' . $e->getMessage());
        }
    }

    public function assignTechnician($maintenanceId, $technician, $assignedTo = null): RedirectResponse
    {
        try {
            return DB::transaction(function () use ($maintenanceId, $technician, $assignedTo) {
                $record = $this->findById($maintenanceId);
                
                if (!$record) {
                    throw new \Exception("Maintenance record not found");
                }

                $data = [
                    'technician' => $technician,
                    'assigned_to' => $assignedTo,
                    'status' => 'in_progress'
                ];

                $record->update($data);

                return redirect()->back()->with('success', 'Technician assigned successfully!');
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to assign technician: ' . $e->getMessage());
        }
    }

    public function getMaintenanceStats($universityId = null)
    {
        $query = MaintenanceRecord::query();

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        $total = $query->count();
        $scheduled = $query->where('status', 'scheduled')->count();
        $inProgress = $query->where('status', 'in_progress')->count();
        $completed = $query->where('status', 'completed')->count();
        $overdue = $query->where('scheduled_date', '<', now())
                        ->whereIn('status', ['scheduled', 'in_progress'])
                        ->count();
        $totalCost = $query->sum('total_cost');
        $totalDowntime = $query->sum('downtime_hours');

        return [
            'total_records' => $total,
            'scheduled' => $scheduled,
            'in_progress' => $inProgress,
            'completed' => $completed,
            'overdue' => $overdue,
            'total_cost' => $totalCost,
            'total_downtime' => $totalDowntime,
        ];
    }

    public function checkCodeExists($maintenanceCode, $universityId, $excludeMaintenanceId = null): bool
    {
        $query = MaintenanceRecord::where('maintenance_code', $maintenanceCode)
                  ->where('university_id', $universityId);

        if ($excludeMaintenanceId) {
            $query->where('maintenance_id', '!=', $excludeMaintenanceId);
        }

        return $query->exists();
    }

    /**
     * Calculate completion percentage based on status and dates
     */
    private function calculateCompletionPercentage($record): int
    {
        if ($record->status === 'completed') {
            return 100;
        } elseif ($record->status === 'in_progress') {
            return 50;
        } elseif ($record->status === 'scheduled') {
            return 0;
        } elseif ($record->status === 'cancelled') {
            return 0;
        } elseif ($record->status === 'deferred') {
            return 25;
        }

        return 0;
    }
}