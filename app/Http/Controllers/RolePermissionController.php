<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\RolePermission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
class RolePermissionController extends Controller
{
    /**
     * Display role permissions
     */
    public function index(Request $request)
    {
        $roles = Role::all();
        $permissions = Permission::all();
        $rolePermissions =RolePermission::all();


        // dd($rolePermissions);

        return Inertia::render('Management/PermissionRoles', [
            'role_permissions' => $rolePermissions,
            'roles' => $roles,
            'permissions' => $permissions,
            'filters' => $request->only(['search', 'role_id', 'status'])
        ]);
    }

    /**
     * Assign permission to role
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,role_id',
            'permission_id' => 'required|exists:permissions,permission_id',
            'constraints' => 'nullable|array',
            'is_enabled' => 'boolean',
            'expires_at' => 'nullable|date|after:now'
        ]);

        // Check if permission already assigned to role
        $existing = RolePermission::where('role_id', $validated['role_id'])
                                ->where('permission_id', $validated['permission_id'])
                                ->first();

        if ($existing) {
            return redirect()->back()->with([
                'error' => 'Permission already assigned to this role'
            ]);
        }

        DB::beginTransaction();
        try {
            $rolePermission = RolePermission::create([
                'id' => Str::uuid(),
                'role_id' => $validated['role_id'],
                'permission_id' => $validated['permission_id'],
                'constraints' => $validated['constraints'] ?? null,
                'is_enabled' => $validated['is_enabled'] ?? true,
                'granted_at' => now(),
                'expires_at' => $validated['expires_at'] ?? null,
                'granted_by' => Auth::id()
            ]);

            DB::commit();

            return redirect()->back()->with([
                'success' => 'Permission assigned successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with([
                'error' => 'Failed to assign permission: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Update role permission
     */
    public function update(Request $request, $id)
    {
        try {
            $rolePermission = RolePermission::findOrFail($id);

            $validated = $request->validate([
                'constraints' => 'nullable|array',
                'is_enabled' => 'boolean',
                'expires_at' => 'nullable|date',
                'granted_at' => 'nullable|date'
            ]);

            DB::beginTransaction();
            
            $rolePermission->update($validated);

            DB::commit();

            return redirect()->back()->with([
                'success' => 'Role permission updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with([
                'error' => 'Failed to update role permission: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Remove permission from role
     */
    public function destroy($id)
    {
        try {
            $rolePermission = RolePermission::findOrFail($id);

            DB::beginTransaction();
            
            $rolePermission->delete();

            DB::commit();

            return redirect()->back()->with([
                'success' => 'Permission removed from role successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with([
                'error' => 'Failed to remove permission from role: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Bulk assign permissions to role
     */
    public function bulkAssign(Request $request)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,role_id',
            'permission_ids' => 'required|array',
            'permission_ids.*' => 'exists:permissions,permission_id',
            'constraints' => 'nullable|array',
            'is_enabled' => 'boolean',
            'expires_at' => 'nullable|date|after:now'
        ]);

        DB::beginTransaction();
        try {
            $assigned = [];
            $skipped = [];

            foreach ($validated['permission_ids'] as $permissionId) {
                // Check if already exists
                $existing = RolePermission::where('role_id', $validated['role_id'])
                                        ->where('permission_id', $permissionId)
                                        ->first();

                if ($existing) {
                    $skipped[] = $permissionId;
                    continue;
                }

                $rolePermission = RolePermission::create([
                    'id' => Str::uuid(),
                    'role_id' => $validated['role_id'],
                    'permission_id' => $permissionId,
                    'constraints' => $validated['constraints'] ?? null,
                    'is_enabled' => $validated['is_enabled'] ?? true,
                    'granted_at' => now(),
                    'expires_at' => $validated['expires_at'] ?? null,
                    'granted_by' => Auth::id()
                ]);

                $assigned[] = $rolePermission;
            }

            DB::commit();

            $message = 'Permissions assigned successfully. ' . 
                      count($assigned) . ' assigned, ' . 
                      count($skipped) . ' skipped.';

            return redirect()->back()->with([
                'success' => $message
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with([
                'error' => 'Failed to bulk assign permissions: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Bulk remove permissions from role
     */
    public function bulkRemove(Request $request)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,role_id',
            'permission_ids' => 'required|array',
            'permission_ids.*' => 'exists:permissions,permission_id'
        ]);

        DB::beginTransaction();
        try {
            $deleted = RolePermission::where('role_id', $validated['role_id'])
                                    ->whereIn('permission_id', $validated['permission_ids'])
                                    ->delete();

            DB::commit();

            return redirect()->back()->with([
                'success' => 'Permissions removed from role successfully. ' . $deleted . ' permissions removed.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with([
                'error' => 'Failed to remove permissions from role: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get permissions by role (for AJAX requests)
     */
    public function getByRole($roleId)
    {
        try {
            $role = Role::findOrFail($roleId);

            $permissions = RolePermission::with('permission')
                                        ->where('role_id', $roleId)
                                        ->get();

            // Return JSON for AJAX requests
            if (request()->expectsJson()) {
                return response()->json([
                    'role' => $role,
                    'permissions' => $permissions,
                    'available_permissions' => Permission::whereNotIn('permission_id', 
                        $permissions->pluck('permission_id')
                    )->get()
                ]);
            }

            // Return Inertia response for page loads
            return Inertia::render('Management/PermissionRoles', [
                'selected_role' => $role,
                'role_permissions' => $permissions,
                'roles' => Role::all(),
                'permissions' => Permission::all(),
            ]);

        } catch (\Exception $e) {
            if (request()->expectsJson()) {
                return response()->json([
                    'error' => 'Role not found'
                ], 404);
            }
            
            return redirect()->back()->with([
                'error' => 'Role not found'
            ]);
        }
    }

    /**
     * Toggle permission status
     */
    public function toggleStatus($id)
    {
        try {
            $rolePermission = RolePermission::findOrFail($id);

            DB::beginTransaction();
            
            $rolePermission->update([
                'is_enabled' => !$rolePermission->is_enabled
            ]);

            DB::commit();

            $newStatus = $rolePermission->is_enabled ? 'enabled' : 'disabled';

            return redirect()->back()->with([
                'success' => "Permission {$newStatus} successfully"
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with([
                'error' => 'Failed to update permission status: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get available permissions for a role (for dialog)
     */
    public function getAvailablePermissions($roleId)
    {
        try {
            $role = Role::findOrFail($roleId);

            $assignedPermissionIds = RolePermission::where('role_id', $roleId)
                                                ->pluck('permission_id')
                                                ->toArray();

            $availablePermissions = Permission::whereNotIn('permission_id', $assignedPermissionIds)
                                            ->get();

            return response()->json([
                'role' => $role,
                'available_permissions' => $availablePermissions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch available permissions'
            ], 500);
        }
    }
}