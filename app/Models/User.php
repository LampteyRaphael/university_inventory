<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
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
        'role', // Keep for backward compatibility
        'permissions',
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

    // Add appends for computed attributes
    protected $appends = ['full_name', 'display_role'];

    public function university()
    {
        return $this->belongsTo(University::class, 'university_id', 'university_id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id', 'department_id');
    }

    /**
     * Role relationship - FIXED: Added proper foreign key and local key
     */
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', 'role_id');
    }

    public function getFullNameAttribute()
    {
        if ($this->first_name && $this->last_name) {
            return "{$this->first_name} {$this->last_name}";
        }
        return $this->name;
    }

    /**
     * Get the role slug safely - FIXED VERSION
     */
    public function getRoleSlug()
    {
        // Use role relationship if available
        if ($this->role_id && $this->relationLoaded('role') && $this->role) {
            return $this->role->slug;
        }
        
        // Fallback to the old string role column
        return $this->attributes['role'] ?? null;
    }

    /**
     * Get the role name safely - FIXED VERSION
     */
    public function getRoleName()
    {
        // Use role relationship if available
        if ($this->role_id && $this->relationLoaded('role') && $this->role) {
            return $this->role->name;
        }
        
        // Fallback: convert the enum string to a display name
        if (isset($this->attributes['role'])) {
            return ucwords(str_replace('_', ' ', $this->attributes['role']));
        }
        
        return null;
    }

    /**
     * Check if user has a specific role - FIXED VERSION
     */
    public function hasRole($roleName)
    {
        // Use role relationship if available
        if ($this->role_id) {
            // Ensure role relationship is loaded
            if (!$this->relationLoaded('role')) {
                $this->load('role');
            }
            
            if ($this->role) {
                if (is_array($roleName)) {
                    return in_array($this->role->slug, $roleName) || in_array($this->role->name, $roleName);
                }
                return $this->role->slug === $roleName || $this->role->name === $roleName;
            }
        }
        
        // Fallback: check against the string role column
        if (isset($this->attributes['role'])) {
            if (is_array($roleName)) {
                return in_array($this->attributes['role'], $roleName);
            }
            return $this->attributes['role'] === $roleName;
        }
        
        return false;
    }

    /**
     * Check if user has any of the given roles - FIXED VERSION
     */
    public function hasAnyRole(array $roles)
    {
        return $this->hasRole($roles);
    }

    /**
     * Get user's role level - FIXED VERSION
     */
    public function getRoleLevel()
    {
        // Use role relationship if available
        if ($this->role_id) {
            if (!$this->relationLoaded('role')) {
                $this->load('role');
            }
            
            if ($this->role) {
                return $this->role->level;
            }
        }
        
        // Fallback: approximate levels for string roles
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

    /**
     * Check role level hierarchy - FIXED VERSION
     */
    public function hasHigherRoleThan($level)
    {
        return $this->getRoleLevel() > $level;
    }

    /**
     * Check if user can manage another user based on role level - FIXED VERSION
     */
    public function canManageUser(User $otherUser)
    {
        // Users can't manage themselves
        if ($this->user_id === $otherUser->user_id) {
            return false;
        }

        // Super admins can manage everyone
        if ($this->hasRole('super_admin')) {
            return true;
        }

        // Users can only manage others with lower role levels
        return $this->getRoleLevel() > $otherUser->getRoleLevel();
    }

    /**
     * Check if user has a specific permission - FIXED VERSION
     */
    public function hasPermission($permissionName)
    {
        // Always use the role relationship
        if (!$this->role_id) {
            return false;
        }
        
        // Ensure role relationship is loaded with permissions
        if (!$this->relationLoaded('role')) {
            $this->load(['role' => function($query) {
                $query->with('permissions');
            }]);
        }
        
        if (!$this->role) {
            return false;
        }
        
        return $this->role->hasActivePermission($permissionName);
    }

    /**
     * Check if user has any of the given permissions - FIXED VERSION
     */
    public function hasAnyPermission(array $permissions)
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check if user has all of the given permissions
     */
    public function hasAllPermissions(array $permissions)
    {
        foreach ($permissions as $permission) {
            if (!$this->hasPermission($permission)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Check if user can perform specific module action
     */
    public function canPerform($module, $action)
    {
        $permissionName = "{$module}.{$action}";
        return $this->hasPermission($permissionName);
    }

    /**
     * Helper methods for common role checks
     */
    public function isSuperAdmin()
    {
        return $this->hasRole('super_admin');
    }

    public function isInventoryManager()
    {
        return $this->hasRole('inventory_manager');
    }

    public function isDepartmentHead()
    {
        return $this->hasRole('department_head');
    }

    public function isProcurementOfficer()
    {
        return $this->hasRole('procurement_officer');
    }

    public function isFaculty()
    {
        return $this->hasRole('faculty');
    }

    public function isStaff()
    {
        return $this->hasRole('staff');
    }

    public function isStudent()
    {
        return $this->hasRole('student');
    }

    /**
     * Check if user can access inventory module
     */
    public function canAccessInventory()
    {
        return $this->hasAnyPermission([
            'inventory.view',
            'inventory.create', 
            'inventory.edit',
            'inventory.delete',
            'inventory.manage_categories'
        ]);
    }

    /**
     * Check if user can access purchase orders module
     */
    public function canAccessPurchaseOrders()
    {
        return $this->hasAnyPermission([
            'purchase_orders.view',
            'purchase_orders.create',
            'purchase_orders.edit',
            'purchase_orders.approve'
        ]);
    }

    /**
     * Check if user has any admin privileges
     */
    public function isAdmin()
    {
        return $this->hasAnyRole(['super_admin', 'inventory_manager', 'department_head']);
    }

    /**
     * Get display role name for UI
     */
    public function getDisplayRoleAttribute()
    {
        return $this->getRoleName();
    }

    /**
     * Scope for active users
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for users with role
     */
    public function scopeWithRole($query, $role)
    {
        if (is_array($role)) {
            return $query->whereHas('role', function($q) use ($role) {
                $q->whereIn('slug', $role)->orWhereIn('name', $role);
            })->orWhereIn('role', $role);
        }
        
        return $query->whereHas('role', function($q) use ($role) {
            $q->where('slug', $role)->orWhere('name', $role);
        })->orWhere('role', $role);
    }
}