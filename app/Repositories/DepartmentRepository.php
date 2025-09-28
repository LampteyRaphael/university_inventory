<?php

namespace App\Repositories;

use App\Models\Department;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;

class DepartmentRepository
{
        
    public function getAll()
    {
               $departments = Department::with([
                'university:university_id,name,code',
                'departmentHead:id,name,email'
                ])
            ->get()
            ->map(function ($department) {
                return [
                'department_id' => $department->department_id,
                'university_id' => $department->university_id,
                'department_code' => $department->department_code,
                'name' => $department->name,
                'building' => $department->building,
                'floor' => $department->floor,
                'room_number' => $department->room_number,
                'contact_person' => $department->contact_person,
                'contact_email' => $department->contact_email,
                'contact_phone' => $department->contact_phone,
                'annual_budget' => $department->annual_budget,
                'remaining_budget' => $department->remaining_budget,
                'department_head_id' => $department->department_head_id,
                'is_active' => $department->is_active,
                'custom_fields' => $department->custom_fields,
                'created_at' => $department->created_at,
                'updated_at' => $department->updated_at,
                'university_name' => $department->university ? $department->university->name : null,
                'university_code' => $department->university ? $department->university->university_code : null,
                'department_head_name' => $department->departmentHead ? $department->departmentHead->name : null,
                'department_head_email' => $department->departmentHead ? $department->departmentHead->email : null,
                'budget_utilization_percent' => $department->annual_budget > 0 
                    ? number_format((($department->annual_budget - $department->remaining_budget) / $department->annual_budget) * 100, 2)
                    : 0,
                ];
            });  
            
            return $departments;
    }
    
    public function findById($departmentId)
    {
        return Department::with(['university', 'departmentHead'])
                  ->where('department_id', $departmentId)
                  ->first();
    }

    public function findByCode($departmentCode, $universityId = null)
    {
        $query = Department::with(['university', 'departmentHead'])
                  ->where('department_code', $departmentCode);

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
                if (empty($data['department_id'])) {
                    $data['department_id'] = Str::uuid()->toString();
                }

                // Ensure remaining_budget equals annual_budget initially
                if (isset($data['annual_budget']) && !isset($data['remaining_budget'])) {
                    $data['remaining_budget'] = $data['annual_budget'];
                }

                // Handle custom_fields if provided as array
                if (isset($data['custom_fields']) && is_array($data['custom_fields'])) {
                    $data['custom_fields'] = json_encode($data['custom_fields']);
                }

                Department::create($data);

                return redirect()->back()->with('success', 'Department created successfully!');
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create department: ' . $e->getMessage())->withInput();
        }
    }

    public function update($departmentId, array $data): RedirectResponse
    {
        try {
            return DB::transaction(function () use ($departmentId, $data) {
                $department = $this->findById($departmentId);
                
                if (!$department) {
                    throw new \Exception("Department not found");
                }

                // Handle budget updates carefully
                if (isset($data['annual_budget'])) {
                    $budgetDifference = $data['annual_budget'] - $department->annual_budget;
                    $data['remaining_budget'] = $department->remaining_budget + $budgetDifference;
                    
                    // Ensure remaining budget doesn't go negative
                    if ($data['remaining_budget'] < 0) {
                        $data['remaining_budget'] = 0;
                    }
                }

                // Handle custom_fields if provided as array
                if (isset($data['custom_fields']) && is_array($data['custom_fields'])) {
                    $data['custom_fields'] = json_encode($data['custom_fields']);
                }

                $department->update($data);

                return redirect()->back()->with('success', 'Department updated successfully!');
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update department: ' . $e->getMessage())->withInput();
        }
    }

    public function delete($departmentId): RedirectResponse
    {
        try {
            return DB::transaction(function () use ($departmentId) {
                $department = $this->findById($departmentId);
                
                if (!$department) {
                    throw new \Exception("Department not found");
                }

                // Check if department has associated items (you'll need to define this relationship)
                // if ($department->items()->count() > 0) {
                //     throw new \Exception("Cannot delete department with associated items");
                // }

                // Check if department has associated users
                if ($department->users()->count() > 0) {
                    throw new \Exception("Cannot delete department with associated users");
                }

                $department->delete();

                return redirect()->back()->with('success', 'Department deleted successfully!');
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete department: ' . $e->getMessage());
        }
    }

    public function forceDelete($departmentId): RedirectResponse
    {
        try {
            return DB::transaction(function () use ($departmentId) {
                $department = Department::withTrashed()->where('department_id', $departmentId)->first();
                
                if (!$department) {
                    throw new \Exception("Department not found");
                }

                $department->forceDelete();

                return redirect()->back()->with('success', 'Department permanently deleted!');
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to permanently delete department: ' . $e->getMessage());
        }
    }

    public function restore($departmentId): RedirectResponse
    {
        try {
            return DB::transaction(function () use ($departmentId) {
                $department = Department::withTrashed()->where('department_id', $departmentId)->first();
                
                if (!$department) {
                    throw new \Exception("Department not found");
                }

                $department->restore();

                return redirect()->back()->with('success', 'Department restored successfully!');
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to restore department: ' . $e->getMessage());
        }
    }

    public function getActiveDepartments($universityId = null)
    {
        $query = Department::with(['university', 'departmentHead'])
                  ->where('is_active', true);

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        return $query->orderBy('name')->get();
    }

    public function getDepartmentsByUniversity($universityId)
    {
        return Department::with('departmentHead')
                  ->where('university_id', $universityId)
                  ->where('is_active', true)
                  ->orderBy('name')
                  ->get();
    }

    public function updateBudget($departmentId, $amount): RedirectResponse
    {
        try {
            return DB::transaction(function () use ($departmentId, $amount) {
                $department = $this->findById($departmentId);
                
                if (!$department) {
                    throw new \Exception("Department not found");
                }

                $department->remaining_budget += $amount;
                
                // Ensure budget doesn't go negative
                if ($department->remaining_budget < 0) {
                    throw new \Exception("Insufficient budget for this operation");
                }

                $department->save();

                return redirect()->back()->with('success', 'Budget updated successfully!');
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update budget: ' . $e->getMessage());
        }
    }

    public function checkCodeExists($departmentCode, $universityId, $excludeDepartmentId = null): bool
    {
        $query = Department::where('department_code', $departmentCode)
                  ->where('university_id', $universityId);

        if ($excludeDepartmentId) {
            $query->where('department_id', '!=', $excludeDepartmentId);
        }

        return $query->exists();
    }

    public function getDepartmentStats($universityId = null)
    {
        $query = Department::query();

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        return [
            'total_departments' => $query->count(),
            'active_departments' => $query->where('is_active', true)->count(),
            'total_budget' => $query->sum('annual_budget'),
            'remaining_budget' => $query->sum('remaining_budget'),
        ];
    }
}