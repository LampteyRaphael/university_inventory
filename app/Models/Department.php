<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'department_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'department_id',
        'university_id',
        'department_code',
        'name',
        'building',
        'floor',
        'room_number',
        'contact_person',
        'contact_email',
        'contact_phone',
        'annual_budget',
        'remaining_budget',
        'department_head_id',
        'is_active',
        'custom_fields'
    ];

    protected $casts = [
        'annual_budget' => 'decimal:2',
        'remaining_budget' => 'decimal:2',
        'is_active' => 'boolean',
        'custom_fields' => 'array',
    ];

    public function university()
    {
        return $this->belongsTo(University::class, 'university_id');
    }

    public function users()
    {
        return $this->hasMany(User::class, 'department_id');
    }

    public function head()
    {
        return $this->belongsTo(User::class, 'department_head_id', 'user_id');
    }

    public function getBudgetUtilizationAttribute(): float
    {
        if ($this->annual_budget == 0) {
            return 0;
        }
        
        return (($this->annual_budget - $this->remaining_budget) / $this->annual_budget) * 100;
    }

    public function getLocationAttribute(): string
    {
        $location = $this->building;
        
        if ($this->floor) {
            $location .= ', Floor ' . $this->floor;
        }
        
        if ($this->room_number) {
            $location .= ', Room ' . $this->room_number;
        }
        
        return $location;
    }
}