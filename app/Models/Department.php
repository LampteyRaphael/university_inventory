<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'department_id';
    protected $keyType = 'string';
    public $incrementing = false;

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
        'custom_fields' => 'array'
    ];

    /**
     * Get the university that owns the department.
     */
    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class, 'university_id', 'university_id');
    }

    /**
     * Get the department head user.
     */
    public function departmentHead(): BelongsTo
    {
        return $this->belongsTo(User::class, 'department_head_id', 'id');
    }

    /**
     * Get the users in this department.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'department_id', 'department_id');
    }

    /**
     * Get the items assigned to this department.
     */
    public function items(): HasMany
    {
        return $this->hasMany(InventoryItem::class, 'department_id', 'department_id');
    }

    /**
     * Scope a query to only include active departments.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the full location string.
     */
    public function getFullLocationAttribute(): string
    {
        $location = $this->building;
        if ($this->floor) $location .= ', Floor ' . $this->floor;
        if ($this->room_number) $location .= ', Room ' . $this->room_number;
        return $location;
    }

    /**
     * Check if department has sufficient budget.
     */
    public function hasSufficientBudget($amount): bool
    {
        return $this->remaining_budget >= $amount;
    }

    /**
     * Get the budget utilization percentage.
     */
    public function getBudgetUtilizationAttribute(): float
    {
        if ($this->annual_budget <= 0) return 0;
        return (($this->annual_budget - $this->remaining_budget) / $this->annual_budget) * 100;
    }
}