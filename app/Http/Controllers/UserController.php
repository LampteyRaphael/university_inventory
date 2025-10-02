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
        $users = User::with([
                'university:university_id,name,code',
                // 'department:department_id,name,code'
            ])
            ->get()
            ->map(function ($user) {
                return [
                    'user_id'          => $user->user_id,
                    'university_id'    => $user->university_id,
                    'department_id'    => $user->department_id,
                    'employee_id'      => $user->employee_id,
                    'username'         => $user->username,
                    'email'            => $user->email,
                    'password'         => $user->password, // ⚠️ normally you don’t expose password
                    'name'             => $user->name,
                    'first_name'       => $user->first_name,
                    'last_name'        => $user->last_name,
                    'phone'            => $user->phone,
                    'position'         => $user->position,
                    'role'             => $user->role,
                    'permissions'      => $user->permissions,
                    'is_active'        => $user->is_active,
                    'hire_date'        => $user->hire_date,
                    'termination_date' => $user->termination_date,
                    'profile_image'    => $user->profile_image,
                    'timezone'         => $user->timezone,
                    'language'         => $user->language,
                    'last_login_at'    => $user->last_login_at,
                    'last_login_ip'    => $user->last_login_ip,
                    'university'       => $user->university->name??null,
                    'department'       => $user->department->name??null,
                ];
            });

           
        return Inertia::render('Users/Index')
            ->with([
                // Users (best if paginated)
                'users' => Inertia::defer(fn () =>
                    $users
                ),

                // Static array – keep immediate
                // 'roles' => [
                //     'super_adminsss',
                //     'inventory_manager', 
                //     'department_head',
                //     'procurement_officer',
                //     'faculty',
                //     'staff',
                //     'student',
                // ],

                    'roles' => [
                    'super_admin' => [
                        'label' => 'Super Admin',
                        'color' => 'error',
                    ],
                    'inventory_manager' => [
                        'label' => 'Inventory Manager',
                        'color' => 'warning',
                    ],
                    'department_head' => [
                        'label' => 'Department Head',
                        'color' => 'info',
                    ],
                    'procurement_officer' => [
                        'label' => 'Procurement Officer',
                        'color' => 'secondary',
                    ],
                    'faculty' => [
                        'label' => 'Faculty',
                        'color' => 'primary',
                    ],
                    'staff' => [
                        'label' => 'Staff',
                        'color' => 'default',
                    ],
                    'student' => [
                        'label' => 'Student',
                        'color' => 'success',
                    ],
                ],


                // Medium datasets – defer so they don’t block
                'universities' => Inertia::defer(fn () =>
                    University::select('university_id', 'name')->get()
                ),

                'departments' => Inertia::defer(fn () =>
                    Department::select('department_id', 'name')->get()
                ),
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
            // 'name' => 'required|string|unique:users',
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
            'name' => $request->username,
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