<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;


class RoleController extends Controller
{
    public function home(){
        $user = auth()->user();
        // dd([
        // 'user_id' => $user->user_id,
        // 'permissions_relationship_loaded' => $user->relationLoaded('permissions'),
        // // 'permissions_collection' => $user->permissions,
        // // 'permissions_collection_count' => $user->permissions->count(),
        // // 'permissions_via_getPermissionNames' => $user->getPermissionNames(),
        // // 'permissions_via_getAllPermissions' => $user->getAllPermissions()->pluck('name'),
        // // 'has_permission_users_view' => $user->hasPermissionTo('users.view'),
        // ]);

        $roles = Role::orderBy('name','asc')->withCount(['permissions', 'users'])
                    ->with('permissions:id,name')
                    ->get();
        $permissions = Permission::orderBy('name','asc')->withCount('roles')->get();
        $users = User::orderBy('created_at','desc')->with(['roles', 'permissions'])->get()->map(function ($user) {
            return array_merge($user->toArray(), [
                'id' => $user->user_id,
            ]);
        });
        return Inertia::render('Admin/RolePermissionManager', [
            'roles' => $roles,
            'permissions' => $permissions,
            'users' => $users,
        ]);
    }

    /**
     * Display the role permission manager page
     */
    public function manager(Request $request)
    {
        $roles = Role::withCount(['permissions', 'users'])
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'guard_name' => $role->guard_name,
                    'permissions_count' => $role->permissions_count,
                    'users_count' => $role->users_count,
                    'permissions' => $role->permissions->map(function ($permission) {
                        return [
                            'id' => $permission->id,
                            'name' => $permission->name,
                        ];
                    }),
                    'created_at' => $role->created_at,
                    'updated_at' => $role->updated_at,
                ];
            });

        $permissions = Permission::withCount('roles')
            ->get()
            ->map(function ($permission) {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'guard_name' => $permission->guard_name,
                    'description' => $permission->description ?? '',
                    'roles_count' => $permission->roles_count,
                    'created_at' => $permission->created_at,
                    'updated_at' => $permission->updated_at,
                ];
            });

        $users = User::with(['roles', 'permissions'])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'user_id' => $user->user_id ?? $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'first_name' => $user->first_name ?? '',
                    'last_name' => $user->last_name ?? '',
                    'roles' => $user->roles->map(function ($role) {
                        return [
                            'id' => $role->id,
                            'name' => $role->name,
                        ];
                    }),
                    'permissions' => $user->permissions->map(function ($permission) {
                        return [
                            'id' => $permission->id,
                            'name' => $permission->name,
                        ];
                    }),
                ];
            });

        return Inertia::render('Admin/RolePermissionManager', [
            'roles' => $roles,
            'permissions' => $permissions,
            'users' => $users,
        ]);
    }

    /**
     * Display a listing of roles
     */
    public function index(Request $request)
    {
        $roles = Role::withCount(['permissions', 'users'])
            ->with('permissions')
            ->get();

        return response()->json([
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created role
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')
            ],
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        try {
            DB::transaction(function () use ($request) {
                $role = Role::create([
                    'name' => $request->name,
                    'guard_name' => 'web',
                ]);

                if ($request->has('permissions') && !empty($request->permissions)) {
                    $permissions = Permission::whereIn('id', $request->permissions)->get();
                    $role->syncPermissions($permissions);
                }

                app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
            });

            return redirect()->back()->with('success', 'Role created successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create role: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified role
     */
    public function update(Request $request, $roleId)
    {
        try {
            // Find the role by UUID
            $role = Role::findOrFail($roleId);

            // Prevent modification of Super Admin role
            // if ($role->name === 'Super Admin' && !auth()->user()->hasRole('Super Admin')) {
            //     return response()->json([
            //         'error' => 'You cannot modify the Super Admin role.'
            //     ], 403);
            // }

            $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('roles', 'name')->ignore($role->id)
                ],
                'permissions' => 'nullable|array',
                'permissions.*' => 'exists:permissions,id',
            ]);

            DB::transaction(function () use ($request, $role) {
                $role->update([
                    'name' => $request->name,
                ]);

                if ($request->has('permissions')) {
                    $permissions = Permission::whereIn('id', $request->permissions)->get();
                    $role->syncPermissions($permissions);
                } else {
                    $role->syncPermissions([]);
                }

                app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
            });

            return back()->with([
                'success' => 'Role updated successfully.',
                'role' => $role->load(['permissions'])
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return back()->with([
                'error' => 'Role not found.'
            ], 404);
        } catch (\Exception $e) {
            return back()->with([
                'error' => 'Failed to update role: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified role
     */
    public function destroy($roleId)
    {
        try {
            $role = Role::findOrFail($roleId);

            // Prevent deletion of Super Admin role
            if ($role->name === 'Super Admin') {
                return response()->json([
                    'error' => 'Cannot delete Super Admin role.'
                ], 403);
            }

            // Check if role has users
            if ($role->users()->count() > 0) {
                return response()->json([
                    'error' => 'Cannot delete role that has users assigned. Please reassign users first.'
                ], 422);
            }

            DB::transaction(function () use ($role) {
                $role->syncPermissions([]);
                $role->delete();

                app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
            });

            return response()->json([
                'success' => 'Role deleted successfully.'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Role not found.'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete role: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specific role with permissions
     */
    public function show($roleId)
    {
        try {
            $role = Role::with('permissions')->findOrFail($roleId);

            return response()->json([
                'role' => $role
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Role not found.'
            ], 404);
        }
    }



///////////////////////////////////

/////////////////////////////////////



/**
 * Update user roles
 */
public function updateUserRoles(Request $request, $user_id) // Use $user_id parameter
{
    try {
        $user = User::findOrFail($user_id); // Manually find the user
        
        $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,id',
        ]);

        $user->syncRoles($request->roles);
        
        // Clear permission cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        return back()->with([
            'success' => 'User roles updated successfully.',
            'user' => $user->load(['roles', 'permissions'])
        ]);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return back()->with([
            'error' => 'User not found.'
        ], 404);
    } catch (\Exception $e) {
        return back()->with([
            'error' => 'Failed to update user roles: '
        ], 500);
    }
}

/**
 * Update user direct permissions
 */
public function updateUserPermissions(Request $request, $user_id)
{
    try {
        $user = User::findOrFail($user_id);
        $permissions = $request->input('permissions', []);

        // Get the permission IDs
        $permissionIds = Permission::whereIn('id', $permissions)
            ->pluck('id')
            ->toArray();

        DB::transaction(function () use ($user, $permissionIds) {
            // Remove all existing direct permissions
            DB::table('model_has_permissions')
                ->where('model_type', get_class($user))
                ->where('model_id', $user->user_id) // Use user_id since that's your primary key
                ->delete();

            // Add new permissions
            if (!empty($permissionIds)) {
                $data = [];
                foreach ($permissionIds as $permissionId) {
                    $data[] = [
                        'permission_id' => $permissionId,
                        'model_type' => get_class($user),
                        'model_id' => $user->user_id, // Use user_id
                        'model_id' => $user->user_id, // Add this if your table has model_uuid column
                    ];
                }
                
                DB::table('model_has_permissions')->insert($data);
            }
        });

        // Clear cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        return back()->with([
            'success' => 'User permissions updated successfully.',
            'user' => $user->load(['roles', 'permissions'])
        ]);

    } catch (\Exception $e) {

        return back()->withErrors([
            'error' => 'Failed to update user permissions: ' . $e->getMessage()
        ], 500);
    }
}

/**
 * Get user roles
 */
public function getUserRoles($user_id) // Use $user_id parameter
{
    try {
        $user = User::with('roles')->findOrFail($user_id);

        return response()->json([
            'roles' => $user->roles
        ]);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'error' => 'User not found.'
        ], 404);
    }
}

/**
 * Get user permissions (both direct and via roles)
 */
public function getUserPermissions($user_id) // Use $user_id parameter
{
    try {
        $user = User::findOrFail($user_id);
        
        $permissions = $user->getAllPermissions();

        return response()->json([
            'permissions' => $permissions
        ]);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'error' => 'User not found.'
        ], 404);
    }
}

}