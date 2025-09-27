<?php

namespace App\Http\Controllers;

use App\Repositories\DepartmentRepository;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    protected $departmentRepository;

    public function __construct(DepartmentRepository $departmentRepository)
    {
        $this->departmentRepository = $departmentRepository;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'university_id' => 'required|exists:universities,university_id',
            'department_code' => 'required|string|max:10',
            'name' => 'required|string|max:255',
            // ... other validation rules
        ]);

        return $this->departmentRepository->create($validated);
    }

    public function update(Request $request, $departmentId)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'annual_budget' => 'sometimes|required|numeric|min:0',
            // ... other validation rules
        ]);

        return $this->departmentRepository->update($departmentId, $validated);
    }

    public function destroy($departmentId)
    {
        return $this->departmentRepository->delete($departmentId);
    }
}