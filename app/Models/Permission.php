<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Permission extends Model
{
    use HasFactory, SoftDeletes,Auditable;

    protected $primaryKey = 'permission_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'permission_id',
        'name',
        'slug',
        'module',
        'action',
        'description',
        'category',
        'is_system_permission',
        'weight',
        'dependencies',
    ];

    protected $casts = [
        'is_system_permission' => 'boolean',
        'weight' => 'integer',
        'dependencies' => 'array',
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
            if (empty($model->permission_id)) {
                $model->permission_id = (string) \Illuminate\Support\Str::uuid();
                 $model->id = (string) \Illuminate\Support\Str::uuid();
            }

            // if (empty($model->id)) {
            //     $model->id = (string) \Illuminate\Support\Str::uuid();
            // }
            
            // Set granted_at if not set
            // if (empty($model->granted_at)) {
            //     $model->granted_at = now();
            // }
            
            // Set is_enabled to true if not set
            // if (is_null($model->is_enabled)) {
            //     $model->is_enabled = true;
            // }

        });
    }

    /**
     * Relationships
     */
    // public function roles()
    // {
    //     return $this->belongsToMany(
    //         Role::class,
    //         'role_permission',
    //         'permission_id',
    //         'role_id',
    //         'permission_id',
    //         'role_id'
    //     );
    // }
    public function roles()
    {
        return $this->belongsToMany(
            Role::class,
            'role_permission',
            'permission_id',
            'role_id',
            'permission_id',
            'role_id'
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

    /**
     * Scope queries
     */
    public function scopeByModule($query, $module)
    {
        return $query->where('module', $module);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    public function scopeSystemPermissions($query)
    {
        return $query->where('is_system_permission', true);
    }

    public function scopeNonSystemPermissions($query)
    {
        return $query->where('is_system_permission', false);
    }

    public function scopeOrderByWeight($query, $direction = 'asc')
    {
        return $query->orderBy('weight', $direction);
    }

    public function scopeHeavyFirst($query)
    {
        return $query->orderBy('weight', 'desc');
    }

    public function scopeLightFirst($query)
    {
        return $query->orderBy('weight', 'asc');
    }

    /**
     * Accessors & Mutators
     */
    public function getDisplayNameAttribute()
    {
        return ucwords(str_replace(['.', '_'], ' ', $this->name));
    }

    public function getModuleDisplayNameAttribute()
    {
        return ucwords(str_replace('_', ' ', $this->module));
    }

    public function getActionDisplayNameAttribute()
    {
        return ucwords(str_replace('_', ' ', $this->action));
    }

    public function getFormattedNameAttribute()
    {
        $parts = explode('.', $this->name);
        if (count($parts) === 2) {
            return ucfirst($parts[1]) . ' ' . ucfirst($parts[0]);
        }
        return $this->display_name;
    }

    /**
     * Permission dependency methods
     */
    public function getDependenciesList()
    {
        return $this->dependencies ?? [];
    }

    public function hasDependencies()
    {
        return !empty($this->dependencies) && count($this->dependencies) > 0;
    }

    public function addDependency($permissionName)
    {
        $dependencies = $this->dependencies ?? [];
        if (!in_array($permissionName, $dependencies)) {
            $dependencies[] = $permissionName;
            $this->dependencies = $dependencies;
        }
    }

    public function removeDependency($permissionName)
    {
        $dependencies = $this->dependencies ?? [];
        $key = array_search($permissionName, $dependencies);
        if ($key !== false) {
            unset($dependencies[$key]);
            $this->dependencies = array_values($dependencies);
        }
    }

    /**
     * Role assignment methods
     */
    public function assignToRole($role)
    {
        if (is_string($role)) {
            $role = Role::where('slug', $role)->first();
        }

        if ($role && $role instanceof Role) {
            $this->roles()->syncWithoutDetaching([$role->role_id]);
            return true;
        }

        return false;
    }

    public function assignToRoles(array $roles)
    {
        $roleIds = [];
        
        foreach ($roles as $role) {
            if (is_string($role)) {
                $roleModel = Role::where('slug', $role)->first();
                if ($roleModel) {
                    $roleIds[] = $roleModel->role_id;
                }
            } elseif ($role instanceof Role) {
                $roleIds[] = $role->role_id;
            }
        }

        $this->roles()->syncWithoutDetaching($roleIds);
    }

    public function removeFromRole($role)
    {
        if (is_string($role)) {
            $role = Role::where('slug', $role)->first();
        }

        if ($role && $role instanceof Role) {
            $this->roles()->detach($role->role_id);
            return true;
        }

        return false;
    }

    /**
     * Check methods
     */
    public function isAssignedToRole($role)
    {
        if (is_string($role)) {
            $role = Role::where('slug', $role)->first();
        }

        if ($role && $role instanceof Role) {
            return $this->roles()->where('role_id', $role->role_id)->exists();
        }

        return false;
    }

    public function isSystemPermission()
    {
        return $this->is_system_permission;
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

    public static function getByModule($module)
    {
        return static::byModule($module)->orderByWeight()->get();
    }

    public static function getByCategory($category)
    {
        return static::byCategory($category)->orderByWeight()->get();
    }

    public static function getSystemPermissions()
    {
        return static::systemPermissions()->orderByWeight()->get();
    }

    public static function getGroupedByModule()
    {
        return static::orderBy('module')
                    ->orderBy('weight')
                    ->get()
                    ->groupBy('module');
    }

    public static function getGroupedByCategory()
    {
        return static::orderBy('category')
                    ->orderBy('weight')
                    ->get()
                    ->groupBy('category');
    }

    /**
     * Permission validation methods
     */
    public static function isValidPermission($permissionName)
    {
        return static::where('name', $permissionName)->exists();
    }

    public static function validatePermissions(array $permissionNames)
    {
        $validPermissions = static::whereIn('name', $permissionNames)->pluck('name')->toArray();
        $invalidPermissions = array_diff($permissionNames, $validPermissions);
        
        return [
            'valid' => $validPermissions,
            'invalid' => $invalidPermissions
        ];
    }

    /**
     * Get permissions with role assignment count
     */
    public function getRoleAssignmentCountAttribute()
    {
        return $this->roles()->count();
    }

    /**
     * Check if permission can be deleted
     */
    public function getCanBeDeletedAttribute()
    {
        return !$this->is_system_permission && $this->role_assignment_count == 0;
    }

    /**
     * Get related permissions (same module)
     */
    public function getRelatedPermissions()
    {
        return static::byModule($this->module)
                    ->where('permission_id', '!=', $this->permission_id)
                    ->orderByWeight()
                    ->get();
    }

    /**
     * Check if this permission depends on another permission
     */
    public function dependsOn($permissionName)
    {
        return in_array($permissionName, $this->getDependenciesList());
    }

    /**
     * Get all dependent permissions that need to be checked
     */
    public function getRequiredDependencies()
    {
        $dependencies = $this->getDependenciesList();
        $required = [];
        
        foreach ($dependencies as $dependency) {
            $depPermission = static::findByName($dependency);
            if ($depPermission) {
                $required[] = $depPermission;
                // Recursively get dependencies of dependencies
                $required = array_merge($required, $depPermission->getRequiredDependencies());
            }
        }
        
        return array_unique($required, SORT_REGULAR);
    }

     public function rolesWithPivot(){
        return $this->belongsToMany(
            Role::class,
            'role_permission',
            'permission_id',
            'role_id',
            'permission_id',
            'role_id'
        )->withPivot([
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

    /**
     * Get only active role assignments
     */
    public function activeRoles()
    {
        return $this->rolesWithPivot()
            ->wherePivot('is_enabled', true)
            ->where(function ($query) {
                $query->whereNull('role_permission.expires_at')
                      ->orWhere('role_permission.expires_at', '>', now());
            });
    }

    /**
     * Enhanced role assignment with pivot data
     */
    public function assignToRoleWithDetails($role, $grantedBy = null, $constraints = null, $expiresAt = null, $isEnabled = true)
    {
        if (is_string($role)) {
            $role = Role::where('slug', $role)->first();
        }

        if ($role && $role instanceof Role) {
            $this->roles()->syncWithoutDetaching([
                $role->role_id => [
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
     * Get roles that have this permission with specific constraints
     */
    public function getRolesWithConstraints($constraintsKey, $constraintsValue = null)
    {
        $query = $this->rolesWithPivot();

        if (is_array($constraintsKey)) {
            foreach ($constraintsKey as $key => $value) {
                $query->where('role_permission.constraints->' . $key, $value);
            }
        } else {
            $query->where('role_permission.constraints->' . $constraintsKey, $constraintsValue);
        }

        return $query->get();
    }

    /**
     * Count active role assignments
     */
    public function getActiveRoleCountAttribute()
    {
        return $this->activeRoles()->count();
    }

    /**
     * Get grant history for this permission
     */
    public function getGrantHistory()
    {
        return $this->rolesWithPivot()
            ->orderBy('role_permission.granted_at', 'desc')
            ->get()
            ->map(function ($role) {
                return [
                    'role' => $role->name,
                    'granted_at' => $role->pivot->granted_at,
                    'granted_by' => $role->pivot->granted_by,
                    'expires_at' => $role->pivot->expires_at,
                    'is_enabled' => $role->pivot->is_enabled,
                    'constraints' => $role->pivot->constraints,
                ];
            });
    }
}