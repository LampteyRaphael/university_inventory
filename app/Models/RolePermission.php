<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RolePermission extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
     protected $table = 'role_permission';

    protected $fillable = [
        'id',
        'role_id',
        'permission_id',
        'constraints',
        'is_enabled',
        'granted_at',
        'expires_at',
        'granted_by'
    ];

    protected $casts = [
        'constraints' => 'array',
        'is_enabled' => 'boolean',
        'granted_at' => 'datetime',
        'expires_at' => 'datetime'
    ];

    /**
     * Get the role that owns the permission assignment.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id', 'role_id');
    }

    /**
     * Get the permission that is assigned.
     */
    public function permission(): BelongsTo
    {
        return $this->belongsTo(Permission::class, 'permission_id', 'permission_id');
    }

    /**
     * Get the user who granted this permission.
     */
    public function grantedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'granted_by', 'user_id');
    }

    /**
     * Scope to get active permissions (not expired and enabled)
     */
    public function scopeActive($query)
    {
        return $query->where('is_enabled', true)
                    ->where(function($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    });
    }

    /**
     * Check if permission is currently active
     */
    public function isActive(): bool
    {
        return $this->is_enabled && 
               (!$this->expires_at || $this->expires_at->isFuture());
    }
}