<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $primaryKey = 'user_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'university_id',
        'department_id',
        'employee_id',
        'username',
        'email',
        'password',
        'name',
        'first_name',
        'last_name',
        'phone',
        'position',
        'role',
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
}