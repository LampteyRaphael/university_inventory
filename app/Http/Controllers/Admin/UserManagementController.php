<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    /**
     * Get users with their roles and permissions
     */
    public function usersWithRoles(Request $request)
    {
        $users = User::with(['roles', 'permissions'])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->user_id,
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

        return response()->json([
            'users' => $users,
        ]);
    }

    /**
     * Update user roles
     */
    public function updateUserRoles(Request $request, User $user)
    {
        // Prevent non-super admins from modifying super admin users
        if ($user->hasRole('Super Admin') && !auth()->user()->hasRole('Super Admin')) {
            return redirect()->back()->with('error', 'You cannot modify Super Admin users.');
        }

        $request->validate([
            'roles' => 'array',
            'roles.*' => ['string', Rule::in(Role::pluck('name')->toArray())],
        ]);

        DB::transaction(function () use ($request, $user) {
            // Get the actual role objects
            $roles = Role::whereIn('name', $request->roles)->get();
            
            // Sync roles
            $user->syncRoles($roles);

            // Clear permission cache
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        });

        return redirect()->back()->with('success', 'User roles updated successfully.');
    }

    /**
     * Update user direct permissions
     */
    public function updateUserPermissions(Request $request, User $user)
    {
        // Prevent non-super admins from modifying super admin users
        if ($user->hasRole('Super Admin') && !auth()->user()->hasRole('Super Admin')) {
            return redirect()->back()->with('error', 'You cannot modify Super Admin users.');
        }

        $request->validate([
            'permissions' => 'array',
            'permissions.*' => ['string', Rule::in(Permission::pluck('name')->toArray())],
        ]);

        DB::transaction(function () use ($request, $user) {
            // Get the actual permission objects
            $permissions = Permission::whereIn('name', $request->permissions)->get();
            
            // Sync direct permissions
            $user->syncPermissions($permissions);

            // Clear permission cache
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        });

        return redirect()->back()->with('success', 'User permissions updated successfully.');
    }

    /**
     * Get user role and permission statistics
     */
    public function statistics(Request $request)
    {
        $totalUsers = User::count();
        $totalRoles = Role::count();
        $totalPermissions = Permission::count();

        $roleDistribution = Role::withCount('users')->get()->map(function ($role) {
            return [
                'name' => $role->name,
                'user_count' => $role->users_count,
            ];
        });

        $permissionDistribution = Permission::withCount('roles')->get()->map(function ($permission) {
            return [
                'name' => $permission->name,
                'role_count' => $permission->roles_count,
            ];
        });

        return response()->json([
            'statistics' => [
                'total_users' => $totalUsers,
                'total_roles' => $totalRoles,
                'total_permissions' => $totalPermissions,
                'role_distribution' => $roleDistribution,
                'permission_distribution' => $permissionDistribution,
            ],
        ]);
    }
}