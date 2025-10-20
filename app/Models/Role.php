<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class Role extends Model
{
    use HasFactory, SoftDeletes, Auditable;

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

    protected $appends = [
        'display_name',
        'formatted_level',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->role_id)) {
                $model->role_id = (string) Str::uuid();
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

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'role_id', 'role_id');
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(
            Permission::class,
            'role_permission',
            'role_id',
            'permission_id',
            'role_id',
            'permission_id'
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
     * Get only active (enabled and not expired) permissions
     */
    public function activePermissions()
    {
        return $this->permissions()
            ->wherePivot('is_enabled', true)
            ->where(function ($query) {
                $query->whereNull('role_permission.expires_at')
                      ->orWhere('role_permission.expires_at', '>', now());
            });
    }

    /**
     * Check if role has an active permission
     */
    public function hasActivePermission($permission): bool
    {
        $permissionName = $this->getPermissionName($permission);
        
        if (!$permissionName) {
            return false;
        }

        return $this->activePermissions()
            ->where('name', $permissionName)
            ->orWhere('slug', $permissionName)
            ->exists();
    }

    // public function activePermissions()
    // {
    //     return $this->permissions()
    //         ->wherePivot('is_enabled', true)
    //         ->where(function ($query) {
    //             $query->whereNull('role_permission.expires_at')
    //                   ->orWhere('role_permission.expires_at', '>', now());
    //         });
    // }

    /**
     * Check if role has an active permission
     */
    // public function hasActivePermission($permission): bool
    // {
    //     $permissionName = $this->getPermissionName($permission);
        
    //     return $this->activePermissions()
    //         ->where('name', $permissionName)
    //         ->orWhere('slug', $permissionName)
    //         ->exists();
    // }

    /**
     * Permission management methods
     */
    public function assignPermission($permission, array $pivotData = []): bool
    {
        $permission = $this->resolvePermission($permission);
        
        if (!$permission) {
            return false;
        }

        $defaultPivotData = [
            'is_enabled' => true,
            'granted_at' => now(),
            'granted_by' => Auth::user()->user_id,
        ];

        $this->permissions()->syncWithoutDetaching([
            $permission->permission_id => array_merge($defaultPivotData, $pivotData)
        ]);
        
        return true;
    }

    public function revokePermission($permission): bool
    {
        $permission = $this->resolvePermission($permission);
        
        if (!$permission) {
            return false;
        }

        $this->permissions()->detach($permission->permission_id);
        return true;
    }

    public function syncPermissions(array $permissions): void
    {
        $permissionIds = [];
        
        foreach ($permissions as $permission) {
            $permission = $this->resolvePermission($permission);
            if ($permission) {
                $permissionIds[] = $permission->permission_id;
            }
        }

        $this->permissions()->sync($permissionIds);
    }

    public function hasPermission($permission): bool
    {
        $permissionName = $this->getPermissionName($permission);
        
        return $this->permissions()
            ->where('name', $permissionName)
            ->orWhere('slug', $permissionName)
            ->exists();
    }

    /**
     * Scopes
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

    /**
     * Accessors & Mutators
     */
    public function getDisplayNameAttribute(): string
    {
        return ucwords(str_replace('_', ' ', $this->name));
    }

    public function getFormattedLevelAttribute(): string
    {
        return "Level {$this->level}";
    }

    /**
     * Helper methods
     */
    private function resolvePermission($permission)
    {
        if (is_string($permission)) {
            return Permission::where('name', $permission)
                ->orWhere('slug', $permission)
                ->first();
        }

        return $permission instanceof Permission ? $permission : null;
    }

    private function getPermissionName($permission): ?string
    {
        if (is_string($permission)) {
            return $permission;
        }

        if ($permission instanceof Permission) {
            return $permission->name;
        }

        return null;
    }

    /**
     * Static methods
     */
    public static function findByName($name)
    {
        return static::where('name', $name)->first();
    }

    public static function findBySlug($slug)
    {
        return static::where('slug', $slug)->first();
    }
}