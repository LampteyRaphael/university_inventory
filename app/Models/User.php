<?php

namespace App\Models;

use App\Contracts\HasRoles;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Log;

class User extends Authenticatable implements HasRoles
{
    use HasFactory, Notifiable, SoftDeletes, Auditable;

    protected $primaryKey = 'user_id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'users';

    protected $fillable = [
        'user_id',
        'university_id',
        'department_id',
        'role_id',
        'employee_id',
        'username',
        'email',
        'password',
        'name',
        'first_name',
        'last_name',
        'phone',
        'position',
        'role', // Legacy column - will be phased out
        'permissions', // User-specific permissions override
        'is_active',
        'hire_date',
        'termination_date',
        'profile_image',
        'timezone',
        'language',
        'last_login_at',
        'last_login_ip',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'hire_date' => 'date',
        'termination_date' => 'date',
        'is_active' => 'boolean',
        'permissions' => 'array',
    ];

    protected $appends = [
        'full_name', 
        'display_role',
        'effective_permissions',
    ];

    /**
     * Boot method
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->user_id)) {
                $model->user_id = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    /**
     * Relationships
     */
    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class, 'university_id', 'university_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id', 'department_id');
    }

    /**
     * Accessors
     */
    public function getFullNameAttribute(): string
    {
        if ($this->first_name && $this->last_name) {
            return "{$this->first_name} {$this->last_name}";
        }
        return $this->name ?: '';
    }




///////////////////////////////////////////////////////////////////////////////

 /**
     * Get the user's role
     */
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', 'role_id');
    }

    /**
     * Check if user is super admin - FIXED VERSION
     */
    public function isSuperAdmin(): bool
    {
        // If role is already loaded as a relationship
        if ($this->relationLoaded('role') && $this->role instanceof Role) {
            return $this->role->name === 'super_admin';
        }
        
        // If role is a string (from select), check directly
        if (is_string($this->role)) {
            return $this->role === 'super_admin';
        }
        
        // Fallback: check via database if needed
        if ($this->role_id) {
            $role = \App\Models\Role::find($this->role_id);
            return $role && $role->name === 'super_admin';
        }
        
        return false;
    }

    /**
     * Check if user has a specific permission - IMPROVED VERSION
     */
    public function hasPermissionTo(string $permission): bool
    {
        // Super admin has all permissions
        if ($this->isSuperAdmin()) {
            return true;
        }

        // Check if user has a role
        if (!$this->role_id) {
            return false;
        }

        return \App\Models\RolePermission::where('role_id', $this->role_id)
            ->where('is_enabled', true)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->whereHas('permission', function ($query) use ($permission) {
                $query->where('name', $permission);
            })
            ->exists();
    }

    /**
     * Check if user has any of the given permissions
     */
    public function hasAnyPermission(array $permissions): bool
    {
        // Super admin has all permissions
        if ($this->isSuperAdmin()) {
            return true;
        }

        if (!$this->role_id) {
            return false;
        }

        return \App\Models\RolePermission::where('role_id', $this->role_id)
            ->where('is_enabled', true)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->whereHas('permission', function ($query) use ($permissions) {
                $query->whereIn('name', $permissions);
            })
            ->exists();
    }

    /**
     * Get all permissions for the user
     */
    public function getAllPermissions()
    {
        if (!$this->role_id) {
            return collect();
        }

        return \App\Models\RolePermission::with('permission')
            ->where('role_id', $this->role_id)
            ->where('is_enabled', true)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->get()
            ->pluck('permission.name')
            ->filter();
    }

    /**
     * Get user's role name - SAFE VERSION
     */
    public function getRoleName(): string
    {
        // If role is loaded as relationship
        if ($this->relationLoaded('role') && $this->role instanceof Role) {
            return $this->role->name;
        }
        
        // If role is a string
        if (is_string($this->role)) {
            return $this->role;
        }
        
        // Fallback to database lookup
        if ($this->role_id) {
            $role = \App\Models\Role::find($this->role_id);
            return $role ? $role->name : 'No Role';
        }
        
        return 'No Role';
    }



////////////////////////////////////////////////////////////////////////////














    public function getDisplayRoleAttribute(): string
    {
        return $this->getRoleName() ?: 'No Role';
    }


    public function getEffectivePermissionsAttribute(): array
    {
        $permissions = [];
        
        // Get permissions from role - FIXED: Handle both role relationship and legacy role column
        $rolePermissions = $this->getRolePermissions();
        $permissions = array_merge($permissions, $rolePermissions);
        
        // Get user-specific permissions from JSON column
        $userPermissions = $this->permissions ?? [];
        
        // Handle case where permissions might be stored as JSON string
        if (is_string($userPermissions)) {
            $userPermissions = json_decode($userPermissions, true) ?? [];
        }
        
        if (!is_array($userPermissions)) {
            $userPermissions = [];
        }
        
        // Check for wildcard permission
        if (in_array('*', $userPermissions)) {
            return ['*'];
        }
        
        $permissions = array_merge($permissions, $userPermissions);
        
        return array_unique($permissions);
    }

    /**
     * Get permissions from role - FIXED VERSION
     */
    private function getRolePermissions(): array
    {
        // If we have a role relationship, use it
        if ($this->role_id) {
            // Ensure role relationship is loaded with permissions
            if (!$this->relationLoaded('role')) {
                $this->load(['role.permissions']);
            }
            
            // Check if role is properly loaded and is an object
            if ($this->role && is_object($this->role) && method_exists($this->role, 'activePermissions')) {
                try {
                    return $this->role->activePermissions()->pluck('name')->toArray();
                } catch (\Exception $e) {
                    Log::error('Error getting role permissions via relationship', [
                        'user_id' => $this->user_id,
                        'role_id' => $this->role_id,
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }
        
        // Fallback: get permissions based on legacy role column
        return $this->getLegacyRolePermissions();
    }

    /**
     * Get permissions for legacy role string
     */
    private function getLegacyRolePermissions(): array
    {
        $legacyRole = $this->attributes['role'] ?? null;
        
        if (!$legacyRole) {
            return [];
        }

        $rolePermissionsMap = [
            'super_admin' => ['*'], // Super admin has all permissions
            'inventory_manager' => [
                'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete',
                'inventory.manage_categories', 'inventory.adjust_stock', 'inventory.export',
                'purchase_orders.view', 'purchase_orders.create', 'purchase_orders.edit',
                'purchase_orders.export', 'reports.view', 'reports.export',
                'users.view', 'departments.view'
            ],
            'department_head' => [
                'inventory.view', 'inventory.create', 'inventory.edit',
                'purchase_orders.view', 'purchase_orders.approve',
                'reports.view', 'reports.generate', 'budget.view',
                'users.view', 'departments.view', 'departments.manage_members'
            ],
            'procurement_officer' => [
                'inventory.view', 'inventory.create',
                'purchase_orders.view', 'purchase_orders.create', 'purchase_orders.edit',
                'purchase_orders.export', 'reports.view'
            ],
            'faculty' => [
                'inventory.view', 'requests.create', 'requests.view'
            ],
            'staff' => [
                'inventory.view', 'requests.create', 'requests.view'
            ],
            'student' => [
                'inventory.view'
            ],
        ];

        return $rolePermissionsMap[$legacyRole] ?? [];
    }

    /**
     * Safe method to get role object for debugging
     */
    public function getRoleObject(): ?Role
    {
        if ($this->role_id) {
            if (!$this->relationLoaded('role')) {
                $this->load('role');
            }
            
            return $this->role instanceof Role ? $this->role : null;
        }
        
        return null;
    }

    /**
     * Enhanced permission check that handles both systems
     */
    public function hasPermission($permission): bool
    {
        $effectivePermissions = $this->effective_permissions;
        
        if (in_array('*', $effectivePermissions)) {
            return true;
        }

        return in_array($permission, $effectivePermissions);
    }




    /**
     * Get effective permissions combining role permissions and user-specific permissions
     */
    // public function getEffectivePermissionsAttribute(): array
    // {
    //     $permissions = [];
        
    //     // Get permissions from role
    //     if ($this->role_id) {
    //         if (!$this->relationLoaded('role')) {
    //             $this->load(['role.permissions']);
    //         }
            
    //         if ($this->role) {
    //             $rolePermissions = $this->role->activePermissions()->pluck('name')->toArray();
    //             $permissions = array_merge($permissions, $rolePermissions);
    //         }
    //     }
        
    //     // Get user-specific permissions from JSON column
    //     $userPermissions = $this->permissions ?? [];
        
    //     // Handle case where permissions might be stored as JSON string
    //     if (is_string($userPermissions)) {
    //         $userPermissions = json_decode($userPermissions, true) ?? [];
    //     }
        
    //     if (!is_array($userPermissions)) {
    //         $userPermissions = [];
    //     }
        
    //     // Check for wildcard permission
    //     if (in_array('*', $userPermissions)) {
    //         return ['*'];
    //     }
        
    //     $permissions = array_merge($permissions, $userPermissions);
        
    //     return array_unique($permissions);
    // }

    /**
     * Role & Permission Methods
     */
    public function getRoleSlug(): ?string
    {
        if ($this->role_id && $this->relationLoaded('role') && $this->role) {
            return $this->role->slug;
        }
        
        return $this->attributes['role'] ?? null;
    }


    public function hasRole($role): bool
    {
        if (is_array($role)) {
            foreach ($role as $r) {
                if ($this->checkSingleRole($r)) {
                    return true;
                }
            }
            return false;
        }
        
        return $this->checkSingleRole($role);
    }

    private function checkSingleRole($role): bool
    {
        // Check role relationship first
        if ($this->role_id && $this->relationLoaded('role') && $this->role) {
            return $this->role->slug === $role || $this->role->name === $role;
        }
        
        // Fallback to legacy role column
        return isset($this->attributes['role']) && $this->attributes['role'] === $role;
    }

    public function hasAnyRole(array $roles): bool
    {
        return $this->hasRole($roles);
    }

    public function getRoleLevel(): int
    {
        if ($this->role_id && $this->relationLoaded('role') && $this->role) {
            return $this->role->level;
        }
        
        // Fallback levels for legacy roles
        $roleLevels = [
            'super_admin' => 100,
            'inventory_manager' => 80,
            'department_head' => 70,
            'procurement_officer' => 60,
            'faculty' => 40,
            'staff' => 30,
            'student' => 10,
        ];
        
        return $roleLevels[$this->attributes['role'] ?? 'student'] ?? 0;
    }

    public function hasHigherRoleThan($level): bool
    {
        return $this->getRoleLevel() > $level;
    }

    public function canManageUser(User $otherUser): bool
    {
        if ($this->user_id === $otherUser->user_id) {
            return false;
        }

        if ($this->hasRole('super_admin')) {
            return true;
        }

        return $this->getRoleLevel() > $otherUser->getRoleLevel();
    }


    public function hasAllPermissions(array $permissions): bool
    {
        $effectivePermissions = $this->effective_permissions;
        
        if (in_array('*', $effectivePermissions)) {
            return true;
        }

        foreach ($permissions as $permission) {
            if (!in_array($permission, $effectivePermissions)) {
                return false;
            }
        }
        
        return true;
    }

    public function canPerform($module, $action): bool
    {
        $permissionName = "{$module}.{$action}";
        return $this->hasPermission($permissionName);
    }

    /**
     * User-specific permission management
     */
    public function assignUserPermission($permission): void
    {
        $permissions = $this->permissions ?? [];
        
        if (is_array($permission)) {
            $permissions = array_merge($permissions, $permission);
        } else {
            $permissions[] = $permission;
        }
        
        $this->update(['permissions' => array_unique($permissions)]);
    }

    public function revokeUserPermission($permission): void
    {
        $permissions = $this->permissions ?? [];
        
        if (is_array($permission)) {
            $permissions = array_diff($permissions, $permission);
        } else {
            $permissions = array_diff($permissions, [$permission]);
        }
        
        $this->update(['permissions' => array_values($permissions)]);
    }

    public function syncUserPermissions(array $permissions): void
    {
        $this->update(['permissions' => array_unique($permissions)]);
    }



    public function isInventoryManager(): bool
    {
        return $this->hasRole('inventory_manager');
    }

    public function isDepartmentHead(): bool
    {
        return $this->hasRole('department_head');
    }

    public function isProcurementOfficer(): bool
    {
        return $this->hasRole('procurement_officer');
    }

    public function isFaculty(): bool
    {
        return $this->hasRole('faculty');
    }

    public function isStaff(): bool
    {
        return $this->hasRole('staff');
    }

    public function isStudent(): bool
    {
        return $this->hasRole('student');
    }

    public function isAdmin(): bool
    {
        return $this->hasAnyRole(['super_admin', 'inventory_manager', 'department_head']);
    }

    /**
     * Module access checks
     */
    public function canAccessInventory(): bool
    {
        return $this->hasAnyPermission([
            'inventory.view',
            'inventory.create', 
            'inventory.edit',
            'inventory.delete',
            'inventory.manage_categories'
        ]);
    }

    public function canAccessPurchaseOrders(): bool
    {
        return $this->hasAnyPermission([
            'purchase_orders.view',
            'purchase_orders.create',
            'purchase_orders.edit',
            'purchase_orders.approve'
        ]);
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeWithRole($query, $role)
    {
        if (is_array($role)) {
            return $query->whereHas('role', function($q) use ($role) {
                $q->whereIn('slug', $role);
            })->orWhereIn('role', $role);
        }
        
        return $query->whereHas('role', function($q) use ($role) {
            $q->where('slug', $role);
        })->orWhere('role', $role);
    }
}