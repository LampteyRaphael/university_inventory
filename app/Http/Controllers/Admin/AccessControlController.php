<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;

class AccessControlController extends Controller
{
     public function index()
    {
        // Load users with their roles and permissions
        $users = User::with(['roles', 'permissions'])->get()->map(function ($user) {
            return [
                'id' => $user->user_id, // Map user_id to id for frontend consistency
                'user_id' => $user->user_id,
                'name' => $user->name,
                'email' => $user->email,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'is_active' => $user->is_active,
                'roles' => $user->roles,
                'permissions' => $user->permissions,
                'created_at' => $user->created_at,
            ];
        });

        $roles = Role::with(['permissions', 'users'])->get();
        $permissions = Permission::all();

        return Inertia::render('Admin/AccessControl', [
            'users' => $users,
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function syncUserRolesAndPermissions(Request $request, $userId)
    {
        // Find user by user_id (not id)
        $user = User::where('user_id', $userId)->firstOrFail();

        $request->validate([
            'roles' => 'sometimes|array',
            'roles.*' => 'exists:roles,id',
            'permissions' => 'sometimes|array',
            'permissions.*' => 'exists:permissions,name',
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->user_id . ',user_id',
            'is_active' => 'sometimes|boolean',
        ]);

        // Update basic user info
        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        if ($request->has('is_active')) {
            $user->is_active = $request->is_active;
        }
        $user->save();

        // Sync roles
        if ($request->has('roles')) {
            $roleIds = $request->roles;
            $roles = Role::whereIn('id', $roleIds)->get();
            $user->syncRoles($roles);
        }

        // Sync permissions
        if ($request->has('permissions')) {
            $user->syncPermissions($request->permissions);
        }

        return response()->json([
            'message' => 'User updated successfully',
            'user' => [
                'id' => $user->user_id, // Return user_id as id for frontend
                'user_id' => $user->user_id,
                'name' => $user->name,
                'email' => $user->email,
                'is_active' => $user->is_active,
            ]
        ]);
    }

    public function syncRolePermissions(Request $request, $roleId)
    {
        $role = Role::findOrFail($roleId);

        $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role->syncPermissions($request->permissions);

        return response()->json([
            'message' => 'Role permissions updated successfully',
            'role' => $role->load('permissions')
        ]);
    }

    public function destroyUser($userId)
    {
        $user = User::where('user_id', $userId)->firstOrFail();
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function storeUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'is_active' => 'boolean',
        ]);

        $user = User::create([
            'user_id' => (string) \Illuminate\Support\Str::uuid(), // Generate UUID for user_id
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_active' => $request->is_active ?? true,
        ]);

        return redirect()->back()->with('success', 'User created successfully.');
    }

    // FIXED: Remove User type-hinting and find by user_id
    public function updateUser(Request $request, $userId)
    {
        $user = User::where('user_id', $userId)->firstOrFail();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id . ',user_id',
            'is_active' => 'boolean',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'is_active' => $request->is_active,
        ]);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    // FIXED: Remove User type-hinting and find by user_id
    public function toggleUserStatus($userId)
    {
        $user = User::where('user_id', $userId)->firstOrFail();
        
        $user->update([
            'is_active' => !$user->is_active
        ]);

        return redirect()->back()->with('success', 'User status updated successfully.');
    }

    // Role Management
    public function storeRole(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:roles',
            'guard_name' => 'required|string|max:255',
        ]);

        Role::create($request->only('name', 'guard_name'));

        return redirect()->back()->with('success', 'Role created successfully.');
    }

    public function updateRole(Request $request, Role $role)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'guard_name' => 'required|string|max:255',
        ]);

        $role->update($request->only('name', 'guard_name'));

        return redirect()->back()->with('success', 'Role updated successfully.');
    }

    public function destroyRole(Role $role)
    {
        if (in_array($role->name, ['Super Admin', 'Administrator'])) {
            return redirect()->back()->with('error', 'System roles cannot be deleted.');
        }

        if ($role->users()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete role that has users assigned.');
        }

        $role->delete();
        return redirect()->back()->with('success', 'Role deleted successfully.');
    }

    // FIXED: User Roles Management - find by user_id
    public function syncUserRoles(Request $request, $userId)
    {
        $request->validate([
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
        ]);

        $user = User::where('user_id', $userId)->firstOrFail();
        $user->syncRoles($request->roles);

        return response()->json([
            'success' => true,
            'message' => 'User roles updated successfully.',
            'user' => [
                'id' => $user->user_id, // Return user_id as id
                'name' => $user->name,
                'email' => $user->email,
            ]
        ]);
    }

    // FIXED: User Direct Permissions Management - find by user_id
    public function syncUserPermissions(Request $request, $userId)
    {
        $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $user = User::where('user_id', $userId)->firstOrFail();
        $user->syncPermissions($request->permissions);

        return response()->json([
            'success' => true,
            'message' => 'User direct permissions updated successfully.',
            'user' => [
                'id' => $user->user_id, // Return user_id as id
                'name' => $user->name,
                'email' => $user->email,
            ]
        ]);
    }

    // Helper method to get user by user_id for any future methods
    protected function getUserById($userId)
    {
        return User::where('user_id', $userId)->firstOrFail();
    }
}