<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Role extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'role_id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'roles';

    protected $fillable = [
        'role_id',
        'university_id',
        'name',
        'slug',
        'description',
        'level',
        'is_system_role',
        'is_assignable',
        'settings',
    ];

    protected $casts = [
        'level' => 'integer',
        'is_system_role' => 'boolean',
        'is_assignable' => 'boolean',
        'settings' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->role_id)) {
                $model->role_id = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    /**
     * Relationships
     */

    public function permissionsWithPivot()
    {
        return $this->belongsToMany(
            Permission::class,
            'role_permission',
            'role_id',
            'permission_id',
            'role_id',
            'permission_id'
        )->using(Permission::class) // Add this line
        ->withPivot([
            'id',
            'constraints',
            'is_enabled',
            'granted_at',
            'expires_at',
            'granted_by',
            'created_at',
            'updated_at'
        ])->withTimestamps();
    }

    //     public function permissionsWithPivot()
    // {
    //     return $this->belongsToMany(
    //         Permission::class,
    //         'role_permission',
    //         'role_id',
    //         'permission_id',
    //         'role_id',
    //         'permission_id'
    //     )->withPivot([
    //         'id',
    //         'constraints',
    //         'is_enabled',
    //         'granted_at',
    //         'expires_at',
    //         'granted_by',
    //         'created_at',
    //         'updated_at'
    //     ])->withTimestamps();
    // }

    /**
     * Get only active (enabled and not expired) permissions
     */
    public function activePermissions()
    {
        return $this->permissionsWithPivot()
            ->wherePivot('is_enabled', true)
            ->where(function ($query) {
                $query->whereNull('role_permission.expires_at')
                      ->orWhere('role_permission.expires_at', '>', now());
            });
    }

    /**
     * Get expired permissions
     */
    public function expiredPermissions()
    {
        return $this->permissionsWithPivot()
            ->where('role_permission.expires_at', '<=', now());
    }

    /**
     * Get disabled permissions
     */
    public function disabledPermissions()
    {
        return $this->permissionsWithPivot()
            ->wherePivot('is_enabled', false);
    }

    /**
     * Enhanced permission assignment with pivot data
     */
    public function assignPermissionWithDetails($permission, $grantedBy = null, $constraints = null, $expiresAt = null, $isEnabled = true)
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->first();
        }

        if ($permission && $permission instanceof Permission) {
            $this->permissions()->syncWithoutDetaching([
                $permission->permission_id => [
                    'constraints' => $constraints,
                    'is_enabled' => $isEnabled,
                    'granted_at' => now(),
                    'expires_at' => $expiresAt,
                    'granted_by' => $grantedBy,
                ]
            ]);
            return true;
        }

        return false;
    }

    /**
     * Enable a permission for this role
     */
    public function enablePermission($permission)
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->first();
        }

        if ($permission && $permission instanceof Permission) {
            $this->permissions()->updateExistingPivot($permission->permission_id, [
                'is_enabled' => true,
                'updated_at' => now()
            ]);
            return true;
        }

        return false;
    }

    /**
     * Disable a permission for this role
     */
    public function disablePermission($permission)
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->first();
        }

        if ($permission && $permission instanceof Permission) {
            $this->permissions()->updateExistingPivot($permission->permission_id, [
                'is_enabled' => false,
                'updated_at' => now()
            ]);
            return true;
        }

        return false;
    }

    /**
     * Set expiration for a permission
     */
    public function setPermissionExpiry($permission, $expiresAt)
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->first();
        }

        if ($permission && $permission instanceof Permission) {
            $this->permissions()->updateExistingPivot($permission->permission_id, [
                'expires_at' => $expiresAt,
                'updated_at' => now()
            ]);
            return true;
        }

        return false;
    }

    /**
     * Update constraints for a permission
     */
    public function updatePermissionConstraints($permission, $constraints)
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->first();
        }

        if ($permission && $permission instanceof Permission) {
            $this->permissions()->updateExistingPivot($permission->permission_id, [
                'constraints' => $constraints,
                'updated_at' => now()
            ]);
            return true;
        }

        return false;
    }

    /**
     * Enhanced permission check with pivot considerations
     */
    public function hasActivePermission($permission)
    {
        if (is_string($permission)) {
            $permissionName = $permission;
            $permission = Permission::where('name', $permission)->first();
            if (!$permission) return false;
        } else {
            $permissionName = $permission->name;
        }

        return $this->activePermissions()
            ->where('name', $permissionName)
            ->exists();
    }

    /**
     * Check if permission is assigned but expired
     */
    public function hasExpiredPermission($permission)
    {
        if (is_string($permission)) {
            $permissionName = $permission;
        } else {
            $permissionName = $permission->name;
        }

        return $this->expiredPermissions()
            ->where('name', $permissionName)
            ->exists();
    }

    /**
     * Check if permission is assigned but disabled
     */
    public function hasDisabledPermission($permission)
    {
        if (is_string($permission)) {
            $permissionName = $permission;
        } else {
            $permissionName = $permission->name;
        }

        return $this->disabledPermissions()
            ->where('name', $permissionName)
            ->exists();
    }

    /**
     * Get permission pivot details
     */
    public function getPermissionPivot($permission)
    {
        if (is_string($permission)) {
            $permissionName = $permission;
        } else {
            $permissionName = $permission->name;
        }

        return $this->permissionsWithPivot()
            ->where('name', $permissionName)
            ->first()
            ?->pivot;
    }

    /**
     * Renew an expired permission
     */
    public function renewPermission($permission, $newExpiry = null)
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->first();
        }

        if ($permission && $permission instanceof Permission) {
            $this->permissions()->updateExistingPivot($permission->permission_id, [
                'expires_at' => $newExpiry,
                'is_enabled' => true,
                'updated_at' => now()
            ]);
            return true;
        }

        return false;
    }

    /**
     * Get permissions that will expire soon
     */
    public function getExpiringPermissions($days = 7)
    {
        $expiryDate = now()->addDays($days);

        return $this->permissionsWithPivot()
            ->where('role_permission.expires_at', '<=', $expiryDate)
            ->where('role_permission.expires_at', '>', now())
            ->where('role_permission.is_enabled', true)
            ->get();
    }
    
    public function university()
    {
        return $this->belongsTo(University::class, 'university_id', 'university_id');
    }

    public function users()
    {
        return $this->hasMany(User::class, 'role_id', 'role_id');
    }

    public function permissions()
    {
        return $this->belongsToMany(
            Permission::class,
            'role_permission',
            'role_id',
            'permission_id',
            'role_id',
            'permission_id'
        );
    }

    /**
     * Scope queries
     */
    public function scopeSystemRoles($query)
    {
        return $query->where('is_system_role', true);
    }

    public function scopeAssignable($query)
    {
        return $query->where('is_assignable', true);
    }

    public function scopeByUniversity($query, $universityId)
    {
        return $query->where('university_id', $universityId);
    }

    public function scopeGlobalRoles($query)
    {
        return $query->whereNull('university_id');
    }

    public function scopeByLevel($query, $level)
    {
        return $query->where('level', $level);
    }

    public function scopeHigherThan($query, $level)
    {
        return $query->where('level', '>', $level);
    }

    public function scopeLowerThan($query, $level)
    {
        return $query->where('level', '<', $level);
    }

    /**
     * Accessors & Mutators
     */
    public function getDisplayNameAttribute()
    {
        return ucwords(str_replace('_', ' ', $this->name));
    }

    public function getFormattedLevelAttribute()
    {
        return "Level {$this->level}";
    }

    public function setSettingsAttribute($value)
    {
        $this->attributes['settings'] = json_encode($value);
    }

    /**
     * Permission management methods
     */
    public function assignPermission($permission)
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->first();
        }

        if ($permission && $permission instanceof Permission) {
            $this->permissions()->syncWithoutDetaching([$permission->permission_id]);
            return true;
        }

        return false;
    }

    public function assignPermissions(array $permissions)
    {
        $permissionIds = [];
        
        foreach ($permissions as $permission) {
            if (is_string($permission)) {
                $perm = Permission::where('name', $permission)->first();
                if ($perm) {
                    $permissionIds[] = $perm->permission_id;
                }
            } elseif ($permission instanceof Permission) {
                $permissionIds[] = $permission->permission_id;
            }
        }

        $this->permissions()->syncWithoutDetaching($permissionIds);
    }

    public function revokePermission($permission)
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->first();
        }

        if ($permission && $permission instanceof Permission) {
            $this->permissions()->detach($permission->permission_id);
            return true;
        }

        return false;
    }

    public function syncPermissions(array $permissions)
    {
        $permissionIds = [];
        
        foreach ($permissions as $permission) {
            if (is_string($permission)) {
                $perm = Permission::where('name', $permission)->first();
                if ($perm) {
                    $permissionIds[] = $perm->permission_id;
                }
            } elseif ($permission instanceof Permission) {
                $permissionIds[] = $permission->permission_id;
            }
        }

        $this->permissions()->sync($permissionIds);
    }

    public function hasPermission($permission)
    {
        if (is_string($permission)) {
            return $this->permissions()->where('name', $permission)->exists();
        }

        if ($permission instanceof Permission) {
            return $this->permissions()->where('permission_id', $permission->permission_id)->exists();
        }

        return false;
    }

    public function hasAnyPermission(array $permissions)
    {
        return $this->permissions()->whereIn('name', $permissions)->exists();
    }

    public function hasAllPermissions(array $permissions)
    {
        $count = $this->permissions()->whereIn('name', $permissions)->count();
        return $count === count($permissions);
    }

    /**
     * Role hierarchy methods
     */
    public function canManageRole(Role $otherRole)
    {
        // Higher level roles can manage lower level roles
        return $this->level > $otherRole->level;
    }

    public function canAssignRole(Role $otherRole)
    {
        // Can only assign roles that are assignable and lower level
        return $otherRole->is_assignable && $this->level > $otherRole->level;
    }

    /**
     * User count methods
     */
    public function getActiveUsersCountAttribute()
    {
        return $this->users()->where('is_active', true)->count();
    }

    public function getInactiveUsersCountAttribute()
    {
        return $this->users()->where('is_active', false)->count();
    }

    /**
     * Check if role can be deleted
     */
    public function getCanBeDeletedAttribute()
    {
        return !$this->is_system_role && $this->users_count == 0;
    }

    /**
     * Static helper methods
     */
    public static function findByName($name)
    {
        return static::where('name', $name)->first();
    }

    public static function findBySlug($slug)
    {
        return static::where('slug', $slug)->first();
    }

    public static function getSystemRoles()
    {
        return static::systemRoles()->get();
    }

    public static function getAssignableRoles($universityId = null)
    {
        $query = static::assignable();
        
        if ($universityId) {
            $query->where(function($q) use ($universityId) {
                $q->where('university_id', $universityId)
                  ->orWhereNull('university_id');
            });
        }
        
        return $query->get();
    }

    /**
     * Get permissions grouped by module
     */
    public function getPermissionsByModule()
    {
        return $this->permissions->groupBy('module');
    }

    /**
     * Check if role has permission to perform action on module
     */
    public function canPerform($module, $action)
    {
        $permissionName = "{$module}.{$action}";
        return $this->hasPermission($permissionName);
    }
}