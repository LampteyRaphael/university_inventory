<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Permission;
use Illuminate\Validation\Rule;

class PermissionController extends Controller
{
    /**
     * Display a listing of permissions
     */
    public function index()
    {
        $permissions = Permission::withCount('roles')->get();
        
        return back()->with([
            'permissions' => $permissions
        ]);
    }

    /**
     * Store a newly created permission
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('permissions', 'name')
                ],
                'description' => 'nullable|string|max:500',
            ]);

            $permission = Permission::create([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'guard_name' => 'web',
            ]);

            // Clear permission cache
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            return back()->with([
                'success' => 'Permission created successfully.',
                'permission' => $permission
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput()
                ->with(['error' => 'Please fix the validation errors below.']);
                
        } catch (\Exception $e) {
            return back()->with([
                'error' => 'Failed to create permission: ' . $e->getMessage()
            ])->withInput();
        }
    }

    /**
     * Update the specified permission
     */
    public function update(Request $request, $permissionId)
    {
        try {
            $permission = Permission::findOrFail($permissionId);

            $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('permissions', 'name')->ignore($permission->id)
                ],
                'description' => 'nullable|string|max:500',
            ]);

            $permission->update([
                'name' => $request->name,
                'description' => $request->description,
            ]);

            // Clear permission cache
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            return back()->with([
                'success' => 'Permission updated successfully.',
                'permission' => $permission
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return back()->with([
                'error' => 'Permission not found.'
            ], 404);
        } catch (\Exception $e) {
            return back()->with([
                'error' => 'Failed to update permission: '
            ], 500);
        }
    }

    /**
     * Remove the specified permission
     */
    public function destroy($permissionId)
    {
        try {
            $permission = Permission::findOrFail($permissionId);

            // Check if permission is being used by any roles
            if ($permission->roles()->count() > 0) {
                return back()->with([
                    'error' => 'Cannot delete permission that is assigned to roles. Please remove it from all roles first.'
                ], 422);
            }

            $permission->delete();

            // Clear permission cache
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            return back()->with([
                'success' => 'Permission deleted successfully.'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return back()->with([
                'error' => 'Permission not found.'
            ], 404);
        } catch (\Exception $e) {
            return back()->with([
                'error' => 'Failed to delete permission: '
            ], 500);
        }
    }
}