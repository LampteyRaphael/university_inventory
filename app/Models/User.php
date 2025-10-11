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
    protected $table ='users';

    protected $fillable = [
        'user_id',
        'university_id',
        'department_id',
        'role_id', // Make sure this is included
        'employee_id',
        'username',
        'email',
        'password',
        'name',
        'first_name',
        'last_name',
        'phone',
        'position',
        'role', // Keep this for backward compatibility
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

    public function university()
    {
        return $this->belongsTo(University::class, 'university_id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function getFullNameAttribute()
    {
        return $this->first_name && $this->last_name 
            ? "{$this->first_name} {$this->last_name}"
            : $this->name;
    }

    /**
     * Role relationship - NEW relationship using role_id
     */
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', 'role_id');
    }

    /**
     * Get the role slug safely - handles both string role and role relationship
     */
    public function getRoleSlug()
    {
        // First try to get from role relationship
        if ($this->role_id && $this->role) {
            return $this->role->slug;
        }
        
        // Fallback to the old string role column
        return $this->role; // This returns the string from enum column
    }

    /**
     * Get the role name safely
     */
    public function getRoleName()
    {
        if ($this->role_id && $this->role) {
            return $this->role->name;
        }
        
        // Fallback: convert the enum string to a display name
        return ucwords(str_replace('_', ' ', $this->role));
    }

    /**
     * Check if user has a specific role - FIXED VERSION
     */
    public function hasRole($roleName)
    {
        // Handle role relationship (preferred)
        if ($this->role_id && $this->role) {
            if (is_array($roleName)) {
                return in_array($this->role->slug, $roleName) || in_array($this->role->name, $roleName);
            }
            return $this->role->slug === $roleName || $this->role->name === $roleName;
        }
        
        // Fallback: check against the string role column
        if (is_array($roleName)) {
            return in_array($this->role, $roleName);
        }
        return $this->role === $roleName;
    }

    /**
     * Check if user has any of the given roles - FIXED VERSION
     */
    public function hasAnyRole(array $roles)
    {
        // Handle role relationship (preferred)
        if ($this->role_id && $this->role) {
            foreach ($roles as $role) {
                if ($this->role->slug === $role || $this->role->name === $role) {
                    return true;
                }
            }
            return false;
        }
        
        // Fallback: check against the string role column
        foreach ($roles as $role) {
            if ($this->role === $role) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check role level hierarchy - FIXED VERSION
     */
    public function hasHigherRoleThan($level)
    {
        if ($this->role_id && $this->role) {
            return $this->role->level > $level;
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
        
        $userLevel = $roleLevels[$this->role] ?? 0;
        return $userLevel > $level;
    }

    /**
     * Get user's role level - FIXED VERSION
     */
    public function getRoleLevel()
    {
        if ($this->role_id && $this->role) {
            return $this->role->level;
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
        
        return $roleLevels[$this->role] ?? 0;
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



    public function hasPermission($permissionName)
{
    // Always use the role relationship, not the string attribute
    if (!$this->role_id || !$this->role()->exists()) {
        return false;
    }
    
    // Eager load the role relationship if not already loaded
    if (!$this->relationLoaded('role')) {
        $this->load('role');
    }
    
    return $this->role->hasActivePermission($permissionName);
}

/**
 * Check if user has any of the given permissions - FIXED VERSION
 */
public function hasAnyPermission(array $permissions)
{
    if (!$this->role_id || !$this->role()->exists()) {
        return false;
    }
    
    if (!$this->relationLoaded('role')) {
        $this->load('role');
    }
    
    foreach ($permissions as $permission) {
        if ($this->role->hasActivePermission($permission)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Safe role accessor that always returns the Role object
 */
public function getRoleAttribute()
{
    if (isset($this->attributes['role']) && !$this->relationLoaded('role')) {
        // If the string role is loaded but relationship isn't, load it
        $this->load('role');
    }
    
    return $this->getRelationValue('role');
}


    public function hasAllPermissions(array $permissions)
    {
        if (!$this->role_id || !$this->role) return false;
        
        foreach ($permissions as $permission) {
            if (!$this->role->hasActivePermission($permission)) {
                return false;
            }
        }
        
        return true;
    }

    public function canPerform($module, $action)
    {
        if (!$this->role_id || !$this->role) return false;
        
        return $this->role->canPerform($module, $action);
    }

    /**
     * Helper methods for common role checks - UPDATED
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
}