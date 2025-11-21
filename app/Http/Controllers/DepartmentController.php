<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\University;
use App\Models\User;
use App\Repositories\DepartmentRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DepartmentController extends Controller
{
    protected $departmentRepository;

    public function __construct(DepartmentRepository $departmentRepository)
    {
        $this->departmentRepository = $departmentRepository;
    }

    public function index(Request $request)
    {
        $user = Auth::user();

         $user = $request->user();
    
    if (!$user) {
        return 'No user logged in';
    }
    
        try {
            return Inertia::render('Departments/Departments')
            ->with([
                // Large dataset (best if repository paginates)
                'departments' => Inertia::defer(fn () =>
                    $this->departmentRepository->getAll()
                ),

                // Medium dataset
                'universities' => Inertia::defer(fn () =>
                    University::select('university_id', 'name')
                        ->orderBy('name')
                        ->get()
                ),

                // Medium dataset
                'users' => Inertia::defer(fn () =>
                    User::select('user_id', 'name')
                        ->orderBy('name')
                        ->get()
                ),
            ]);


        } catch (\Exception $e) {
            Log::error('Items index error:', ['error' => $e->getMessage()]);

            return redirect()->back()->with('error', 'Error loading categories: ' . $e->getMessage());
        }
    }


    public function create()
    {
        try {
            $universities = University::select('university_id', 'name')
                ->orderBy('name')
                ->get();

            return Inertia::render('Departments/Create', [
                'universities' => $universities
            ]);

        } catch (\Exception $e) {
            Log::error('Department create form error:', ['error' => $e->getMessage()]);

            return redirect()->back()->with('error', 'Error loading department form: ' . $e->getMessage());
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'university_id' => 'required|uuid|exists:universities,university_id',
                'department_code' => 'required|string|max:10',
                'name' => 'required|string|max:255',
                'building' => 'required|string|max:255',
                'floor' => 'nullable|string|max:50',
                'room_number' => 'nullable|string|max:50',
                'contact_person' => 'required|string|max:255',
                'contact_email' => 'required|email|max:255',
                'contact_phone' => 'required|string|max:20',
                'annual_budget' => 'required|numeric|min:0',
                'department_head_id' => 'nullable|uuid',
                'is_active' => 'boolean',
                'custom_fields' => 'nullable|array',
            ]);

            // Check if department code already exists for this university
            if ($this->departmentRepository->checkCodeExists($validated['department_code'], $validated['university_id'])) {
                return redirect()->back()->with('error', 'Department code already exists for this university.');
            }

            $department = $this->departmentRepository->create($validated);

            return redirect()->route('department.index')->with('success', 'Department created successfully.');

        } catch (\Exception $e) {
            Log::error('Department store error:', ['error' => $e->getMessage()]);

            return redirect()->back()->with('error', 'Error creating department: ' . $e->getMessage());
        }
    }

    public function show($id)
    {
        try {
            $department = $this->departmentRepository->findById($id);

            if (!$department) {
                return redirect()->back()->with('error', 'Department not found.');
            }

            $formattedDepartment = [
                'department_id' => $department->department_id,
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
                'university_name' => $department->university->name ?? null,
                'department_head_name' => $department->departmentHead ? 
                    $department->departmentHead->first_name . ' ' . $department->departmentHead->last_name : null,
                'university_id' => $department->university_id,
                'created_at' => $department->created_at,
                'updated_at' => $department->updated_at,
            ];

            return Inertia::render('Departments/Show', [
                'department' => $formattedDepartment
            ]);

        } catch (\Exception $e) {
            Log::error('Department show error:', ['error' => $e->getMessage()]);

            return redirect()->back()->with('error', 'Error loading department: ' . $e->getMessage());
        }
    }

    public function edit($id)
    {
        try {
            $department = $this->departmentRepository->findById($id);

            if (!$department) {
                return redirect()->back()->with('error', 'Department not found.');
            }

            $universities = University::select('university_id', 'name')
                ->orderBy('name')
                ->get();

            $formattedDepartment = [
                'department_id' => $department->department_id,
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
                'university_id' => $department->university_id,
            ];

            return Inertia::render('Departments/Edit', [
                'department' => $formattedDepartment,
                'universities' => $universities
            ]);

        } catch (\Exception $e) {
            Log::error('Department edit form error:', ['error' => $e->getMessage()]);

            return redirect()->back()->with('error', 'Error loading department edit form: ' . $e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'university_id' => 'required|uuid|exists:universities,university_id',
                'department_code' => 'required|string|max:10',
                'name' => 'required|string|max:255',
                'building' => 'required|string|max:255',
                'floor' => 'nullable|string|max:50',
                'room_number' => 'nullable|string|max:50',
                'contact_person' => 'required|string|max:255',
                'contact_email' => 'required|email|max:255',
                'contact_phone' => 'required|string|max:20',
                'annual_budget' => 'required|numeric|min:0',
                'department_head_id' => 'nullable',
                // 'department_head_id' => 'nullable|uuid',
                'is_active' => 'boolean',
                'custom_fields' => 'nullable|array',
            ]);

            // Check if department code already exists for this university (excluding current department)
            if ($this->departmentRepository->checkCodeExists($validated['department_code'], $validated['university_id'], $id)) {
                return redirect()->back()->with('error', 'Department code already exists for this university.');
            }

             $this->departmentRepository->update($id, $validated);

            return redirect()->route('department.index')->with('success', 'Department updated successfully.');

        } catch (\Exception $e) {
            Log::error('Department update error:', ['error' => $e->getMessage()]);

            return redirect()->back()->with('error', 'Error updating department: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $this->departmentRepository->delete($id);

            return redirect()->route('department.index')->with('success', 'Department deleted successfully.');

        } catch (\Exception $e) {
            Log::error('Department delete error:', ['error' => $e->getMessage()]);

            return redirect()->back()->with('error', 'Error deleting department: ' . $e->getMessage());
        }
    }

    public function restore($id)
    {
        try {
            $this->departmentRepository->restore($id);

            return redirect()->back()->with('success', 'Department restored successfully.');

        } catch (\Exception $e) {
            Log::error('Department restore error:', ['error' => $e->getMessage()]);

            return redirect()->back()->with('error', 'Error restoring department: ' . $e->getMessage());
        }
    }

    public function forceDelete($id)
    {
        try {
            $this->departmentRepository->forceDelete($id);

            return redirect()->route('department.index')->with('success', 'Department permanently deleted.');

        } catch (\Exception $e) {
            Log::error('Department force delete error:', ['error' => $e->getMessage()]);

            return redirect()->back()->with('error', 'Error permanently deleting department: ' . $e->getMessage());
        }
    }

    public function getByUniversity($universityId)
    {
        try {
            $departments = $this->departmentRepository->getActiveDepartments($universityId);

            $formattedDepartments = $departments->map(function ($department) {
                return [
                    'department_id' => $department->department_id,
                    'department_code' => $department->department_code,
                    'name' => $department->name,
                    'building' => $department->building,
                    'contact_person' => $department->contact_person,
                    'contact_email' => $department->contact_email,
                ];
            });

            return response()->json($formattedDepartments);

        } catch (\Exception $e) {
            Log::error('Get departments by university error:', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'Error loading departments'], 500);
        }
    }
}