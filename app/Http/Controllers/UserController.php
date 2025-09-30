<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\University;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::with(['university', 'department'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%");
            })
            ->when($request->role, function ($query, $role) {
                $query->where('role', $role);
            })
            ->when($request->is_active, function ($query, $isActive) {
                $query->where('is_active', $isActive === 'active');
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'is_active']),
            'roles' => [
                'super_admin',
                'inventory_manager', 
                'department_head',
                'procurement_officer',
                'faculty',
                'staff',
                'student'
            ],
            'universities' => University::all(),
            'departments' => Department::all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Users/Create', [
            'roles' => [
                'super_admin',
                'inventory_manager', 
                'department_head',
                'procurement_officer',
                'faculty',
                'staff',
                'student'
            ],
            'universities' => University::all(),
            'departments' => Department::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'university_id' => 'nullable|exists:universities,university_id',
            'department_id' => 'nullable|exists:departments,department_id',
            'employee_id' => 'nullable|string|unique:users',
            'username' => 'nullable|string|unique:users',
            'email' => 'required|string|email|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'name' => 'required|string|unique:users',
            'first_name' => 'nullable|string',
            'last_name' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'position' => 'nullable|string',
            'role' => 'required|in:super_admin,inventory_manager,department_head,procurement_officer,faculty,staff,student',
            'is_active' => 'boolean',
            'hire_date' => 'nullable|date',
            'termination_date' => 'nullable|date|after:hire_date',
            'timezone' => 'nullable|string',
            'language' => 'nullable|string|max:10',
        ]);

        User::create([
            'user_id' => Str::uuid(),
            'university_id' => $request->university_id,
            'department_id' => $request->department_id,
            'employee_id' => $request->employee_id,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'name' => $request->name,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'phone' => $request->phone,
            'position' => $request->position,
            'role' => $request->role,
            'is_active' => $request->is_active ?? true,
            'hire_date' => $request->hire_date,
            'termination_date' => $request->termination_date,
            'timezone' => $request->timezone ?? 'UTC',
            'language' => $request->language ?? 'en',
        ]);

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    public function edit(User $user)
    {
        return Inertia::render('Users/Edit', [
            'user' => $user->load(['university', 'department']),
            'roles' => [
                'super_admin',
                'inventory_manager', 
                'department_head',
                'procurement_officer',
                'faculty',
                'staff',
                'student'
            ],
            'universities' => University::all(),
            'departments' => Department::all(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'university_id' => 'nullable|exists:universities,university_id',
            'department_id' => 'nullable|exists:departments,department_id',
            'employee_id' => 'nullable|string|unique:users,employee_id,' . $user->user_id . ',user_id',
            'username' => 'nullable|string|unique:users,username,' . $user->user_id . ',user_id',
            'email' => 'required|string|email|unique:users,email,' . $user->user_id . ',user_id',
            'name' => 'required|string|unique:users,name,' . $user->user_id . ',user_id',
            'first_name' => 'nullable|string',
            'last_name' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'position' => 'nullable|string',
            'role' => 'required|in:super_admin,inventory_manager,department_head,procurement_officer,faculty,staff,student',
            'is_active' => 'boolean',
            'hire_date' => 'nullable|date',
            'termination_date' => 'nullable|date|after:hire_date',
            'timezone' => 'nullable|string',
            'language' => 'nullable|string|max:10',
        ]);

        $user->update($request->all());

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }

    public function assignRole(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|in:super_admin,inventory_manager,department_head,procurement_officer,faculty,staff,student'
        ]);

        $user->update(['role' => $request->role]);

        return back()->with('success', 'Role assigned successfully.');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx'
        ]);

        // Implement Excel import logic here
        // You can use maatwebsite/excel package

        return back()->with('success', 'Users imported successfully.');
    }

    public function export()
    {
        // Implement Excel export logic here
        // return Excel::download(new UsersExport, 'users.xlsx');
    }
}