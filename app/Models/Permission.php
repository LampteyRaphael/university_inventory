<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Permission extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'permission_id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'permissions';

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
            }
        });
    }

    /**
     * Relationships
     */
    public function roles(): BelongsToMany
    {
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
     * Scopes
     */
    public function scopeByModule($query, $module)
    {
        return $query->where('module', $module);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeSystemPermissions($query)
    {
        return $query->where('is_system_permission', true);
    }

    public function scopeRegularPermissions($query)
    {
        return $query->where('is_system_permission', false);
    }

    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Helper methods
     */
    public function isSystemPermission(): bool
    {
        return $this->is_system_permission;
    }

    public function getFullPermissionName(): string
    {
        return "{$this->module}.{$this->action}";
    }

    /**
     * Check if permission is assigned to a role
     */
    public function isAssignedToRole($role): bool
    {
        if (is_string($role)) {
            return $this->roles()->where('slug', $role)->exists();
        }

        if ($role instanceof Role) {
            return $this->roles()->where('role_id', $role->role_id)->exists();
        }

        return false;
    }
}