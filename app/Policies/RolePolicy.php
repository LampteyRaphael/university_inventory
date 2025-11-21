<?php

namespace App\Policies;

use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Auth\Access\Response;

class RolePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('roles.view') || $user->hasRole('Super Admin');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('roles.create') || $user->hasRole('Super Admin');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Role $role): bool
    {
        // Only Super Admin can modify Super Admin role
        if ($role->name === 'Super Admin') {
            return $user->hasRole('Super Admin');
        }

        return $user->hasPermissionTo('roles.edit') || $user->hasRole('Super Admin');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Role $role): bool
    {
        // Prevent deletion of Super Admin role
        if ($role->name === 'Super Admin') {
            return false;
        }

        // Prevent deletion of roles with users
        if ($role->users()->count() > 0) {
            return false;
        }

        return $user->hasPermissionTo('roles.delete') || $user->hasRole('Super Admin');
    }
}