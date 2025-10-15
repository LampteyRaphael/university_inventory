<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use App\Models\University;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    public function index()
    {
        // $this->authorize('users.manage_roles');
        
        $roles = Role::with(['permissions', 'university'])
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->role_id, // Add this for MUI Data Grid
                    'role_id' => $role->role_id,
                    'university_id' => $role->university_id,
                    'name' => $role->name,
                    'slug' => $role->slug,
                    'description' => $role->description,
                    'is_system_role' => $role->is_system_role,
                    'is_assignable' => $role->is_assignable,
                    'level' => $role->level,
                    'permissions' => $role->permissions->map(function ($permission) {
                        return [
                            'permission_id' => $permission->permission_id,
                            'name' => $permission->name,
                            'slug' => $permission->slug,
                            'module' => $permission->module,
                            'action' => $permission->action,
                            'category' => $permission->category,
                        ];
                    }),
                    'user_count' => $role->users()->count(),
                    'settings' => $role->settings,
                ];
            });

        $permissions = Permission::all()->groupBy('module');
        $universities = University::select('university_id', 'name')->get();

        return Inertia::render('Admin/RoleManagement', [
            'roles' => $roles,
            'permissions' => $permissions,
            'universities' => $universities,
        ]);
    }

public function store(Request $request)
{
    // $this->authorize('users.manage_roles');
    
    $validated = $request->validate([
        'name' => 'required|string|unique:roles,name',
        'description' => 'nullable|string',
        'university_id' => 'required|exists:universities,university_id',
        'permissions' => 'array',
        'permissions.*' => 'string|exists:permissions,name',
    ]);

    $role = Role::create([
        'name' => $validated['name'],
        'slug' => Str::slug($validated['name']),
        'description' => $validated['description'],
        'university_id' => $validated['university_id'],
        'is_system_role' => false,
        'level' => 50,
    ]);

    // Assign permissions with proper UUID handling
    // if (!empty($validated['permissions'])) {
    //     $permissions = Permission::whereIn('name', $validated['permissions'])->get();
        
    //     foreach ($permissions as $permission) {
    //         // This will automatically trigger the pivot model's creating event
    //         $role->permissions()->attach($permission->permission_id, [
    //             'is_enabled' => true,
    //             'granted_at' => now(),
    //             // The UUID for pivot id will be generated automatically by the pivot model
    //         ]);
    //     }

    // In your store method
if (!empty($validated['permissions'])) {
    $permissions = Permission::whereIn('name', $validated['permissions'])->get();
    
    $permissionData = [];
    foreach ($permissions as $permission) {
        $permissionData[$permission->permission_id] = [
            'id' => Str::uuid(), // Manually generate UUID for each pivot
            'is_enabled' => true,
            'granted_at' => now(),
            'granted_by'=>Auth::user()->user_id,
            'created_at'=> now(),
        ];
    }
    
    // $role->permissions()->syncWithoutDetaching($permissionData);
// }
        
        // Alternatively, you can use sync with additional data:
        // $permissionData = [];
        // foreach ($permissions as $permission) {
        //     $permissionData[$permission->permission_id] = [
        //         'id' => Str::uuid(), // Generate UUID manually
        //         'is_enabled' => true,
        //         'granted_at' => now(),
        //     ];
        // }
        $role->permissions()->sync($permissionData);
    }

    return redirect()->back()->with('success', 'Role created successfully.');
}

    public function update(Request $request, Role $role)
    {
        // $this->authorize('users.manage_roles');
        
        // Prevent modification of system roles
        if ($role->is_system_role) {
            return redirect()->back()->with('error', 'System roles cannot be modified.');
        }

        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name,' . $role->role_id . ',role_id',
            'slug' => 'required|string|unique:roles,slug,' . $role->role_id . ',role_id',
            'description' => 'nullable|string',
            'level' => 'required|integer|min:0|max:100',
            'is_assignable' => 'boolean',
            'permissions' => 'array',
            'permissions.*' => 'uuid|exists:permissions,permission_id',
            'settings' => 'nullable|array',
        ]);

        DB::transaction(function () use ($role, $validated) {
            $role->update([
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'description' => $validated['description'],
                'level' => $validated['level'],
                'is_assignable' => $validated['is_assignable'] ?? true,
                'settings' => $validated['settings'] ?? null,
            ]);

            // Sync permissions with UUID for pivot table
            if (isset($validated['permissions'])) {
                $permissionData = [];
                foreach ($validated['permissions'] as $permissionId) {
                    $permissionData[$permissionId] = [
                        'id' => (string) Str::uuid(),
                        'is_enabled' => true,
                        'granted_at' => now(),
                        'granted_by' => Auth::user()->user_id,
                    ];
                }
                $role->permissions()->sync($permissionData);
            }
        });

        return redirect()->back()->with('success', 'Role updated successfully.');
    }

    public function updatePermissions(Request $request, Role $role)
    {
        // $this->authorize('users.manage_roles');
        
        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*.permission_id' => 'required|uuid|exists:permissions,permission_id',
            'permissions.*.is_enabled' => 'boolean',
            'permissions.*.constraints' => 'nullable|array',
            'permissions.*.expires_at' => 'nullable|date|after:now',
        ]);

        DB::transaction(function () use ($role, $validated) {
            $permissionData = [];
            foreach ($validated['permissions'] as $permission) {
                $permissionData[$permission['permission_id']] = [
                    'id' => (string) Str::uuid(),
                    'is_enabled' => $permission['is_enabled'] ?? true,
                    'constraints' => $permission['constraints'] ?? null,
                    'expires_at' => $permission['expires_at'] ?? null,
                    'granted_at' => now(),
                    'granted_by' => Auth::user()->user_id,
                ];
            }
            
            $role->permissions()->sync($permissionData);
        });

        return redirect()->back()->with('success', 'Role permissions updated successfully.');
    }

    public function grantPermission(Request $request, Role $role)
    {
        // $this->authorize('users.manage_roles');
        
        $validated = $request->validate([
            'permission_id' => 'required|uuid|exists:permissions,permission_id',
            'is_enabled' => 'boolean',
            'constraints' => 'nullable|array',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $role->permissions()->attach($validated['permission_id'], [
            'id' => (string) Str::uuid(),
            'is_enabled' => $validated['is_enabled'] ?? true,
            'constraints' => $validated['constraints'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
            'granted_at' => now(),
            'granted_by' => Auth::user()->user_id,
        ]);

        return redirect()->back()->with('success', 'Permission granted successfully.');
    }

    public function revokePermission(Request $request, Role $role)
    {
        // $this->authorize('users.manage_roles');
        
        $validated = $request->validate([
            'permission_id' => 'required|uuid|exists:permissions,permission_id',
        ]);

        $role->permissions()->detach($validated['permission_id']);

        return redirect()->back()->with('success', 'Permission revoked successfully.');
    }

    public function togglePermission(Request $request, Role $role)
    {
        // $this->authorize('users.manage_roles');
        
        $validated = $request->validate([
            'permission_id' => 'required|uuid|exists:permissions,permission_id',
            'is_enabled' => 'required|boolean',
        ]);

        $role->permissions()->updateExistingPivot($validated['permission_id'], [
            'is_enabled' => $validated['is_enabled'],
            'updated_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Permission status updated successfully.');
    }

    public function destroy(Role $role)
    {
        // $this->authorize('users.manage_roles');
        
        // Prevent deletion of system roles or roles with users
        if ($role->is_system_role) {
            return redirect()->back()->with('error', 'System roles cannot be deleted.');
        }
        
        if ($role->users()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete role that has users assigned.');
        }

        DB::transaction(function () use ($role) {
            // Detach all permissions first
            $role->permissions()->detach();
            $role->delete();
        });
        
        return redirect()->back()->with('success', 'Role deleted successfully.');
    }

    public function show(Role $role)
    {
        // $this->authorize('users.manage_roles');
        
        $role->load(['permissions', 'university', 'users']);

        return Inertia::render('Admin/RoleDetail', [
            'role' => [
                'role_id' => $role->role_id,
                'university_id' => $role->university_id,
                'name' => $role->name,
                'slug' => $role->slug,
                'description' => $role->description,
                'is_system_role' => $role->is_system_role,
                'is_assignable' => $role->is_assignable,
                'level' => $role->level,
                'settings' => $role->settings,
                'permissions' => $role->permissions,
                'user_count' => $role->users()->count(),
                'users' => $role->users->map(function ($user) {
                    return [
                        'user_id' => $user->user_id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ];
                }),
                'created_at' => $role->created_at,
                'updated_at' => $role->updated_at,
            ],
        ]);
    }
}