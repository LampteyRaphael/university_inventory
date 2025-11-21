<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolePermission extends Model
{
    protected $table = 'role_has_permissions';
    public $timestamps = false;

    protected $fillable = [
        'role_id',
        'permission_id',
        // 'granted_by', // optional — only if you have such a column
    ];

    // Each record belongs to a role
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    // Each record belongs to a permission
    public function permission()
    {
        return $this->belongsTo(Permission::class, 'permission_id');
    }

    // Optional: user who granted the permission (if you store that info)
    public function grantedBy()
    {
        return $this->belongsTo(User::class, 'granted_by');
    }
}
