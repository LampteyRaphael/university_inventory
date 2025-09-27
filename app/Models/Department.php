<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'department_id';

    /**
     * The "type" of the primary key ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
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
        'custom_fields',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'annual_budget' => 'decimal:2',
        'remaining_budget' => 'decimal:2',
        'is_active' => 'boolean',
        'custom_fields' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * The model's default values for attributes.
     *
     * @var array
     */
    protected $attributes = [
        'annual_budget' => 0,
        'remaining_budget' => 0,
        'is_active' => true,
    ];

    /**
     * Get the full location string for the department.
     *
     * @return string
     */
    public function getFullLocationAttribute(): string
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

    /**
     * Get the contact information as a formatted string.
     *
     * @return string
     */
    public function getContactInfoAttribute(): string
    {
        return "{$this->contact_person} | {$this->contact_email} | {$this->contact_phone}";
    }

    /**
     * Get the budget utilization percentage.
     *
     * @return float
     */
    public function getBudgetUtilizationAttribute(): float
    {
        if ($this->annual_budget <= 0) {
            return 0;
        }
        
        $utilized = $this->annual_budget - $this->remaining_budget;
        return ($utilized / $this->annual_budget) * 100;
    }

    /**
     * Check if the department has exceeded its budget.
     *
     * @return bool
     */
    public function hasExceededBudget(): bool
    {
        return $this->remaining_budget < 0;
    }

    /**
     * Check if the department is approaching budget limit (90% or more utilized).
     *
     * @return bool
     */
    public function isApproachingBudgetLimit(): bool
    {
        return $this->getBudgetUtilizationAttribute() >= 90;
    }

    /**
     * Get the budget status as a string.
     *
     * @return string
     */
    public function getBudgetStatusAttribute(): string
    {
        if ($this->hasExceededBudget()) {
            return 'exceeded';
        }
        
        if ($this->isApproachingBudgetLimit()) {
            return 'approaching_limit';
        }
        
        return 'within_budget';
    }

    /**
     * Get the budget status label with appropriate styling.
     *
     * @return array
     */
    public function getBudgetStatusLabelAttribute(): array
    {
        $status = $this->budget_status;
        
        $labels = [
            'exceeded' => [
                'text' => 'Budget Exceeded',
                'class' => 'badge bg-danger',
                'icon' => '⚠️'
            ],
            'approaching_limit' => [
                'text' => 'Approaching Limit',
                'class' => 'badge bg-warning',
                'icon' => '⚠️'
            ],
            'within_budget' => [
                'text' => 'Within Budget',
                'class' => 'badge bg-success',
                'icon' => '✅'
            ]
        ];
        
        return $labels[$status] ?? $labels['within_budget'];
    }

    /**
     * Scope a query to only include active departments.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include departments with remaining budget.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithRemainingBudget($query)
    {
        return $query->where('remaining_budget', '>', 0);
    }

    /**
     * Scope a query to only include departments that have exceeded budget.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeExceededBudget($query)
    {
        return $query->where('remaining_budget', '<', 0);
    }

    /**
     * Scope a query to only include departments approaching budget limit.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  int  $threshold
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeApproachingBudgetLimit($query, $threshold = 90)
    {
        return $query->whereRaw('((annual_budget - remaining_budget) / annual_budget * 100) >= ?', [$threshold])
                    ->where('remaining_budget', '>', 0);
    }

    /**
     * Scope a query to only include departments for a specific university.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $universityId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForUniversity($query, $universityId)
    {
        return $query->where('university_id', $universityId);
    }

    /**
     * Scope a query to only include departments in a specific building.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $building
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeInBuilding($query, $building)
    {
        return $query->where('building', $building);
    }

    /**
     * Update the remaining budget by a specified amount.
     *
     * @param  float  $amount
     * @param  bool  $isExpense
     * @return bool
     */
    public function updateBudget(float $amount, bool $isExpense = true): bool
    {
        if ($isExpense) {
            $this->remaining_budget -= $amount;
        } else {
            $this->remaining_budget += $amount;
        }
        
        return $this->save();
    }


    protected $with=['university'];
    /**
     * Reset the budget to the annual budget amount.
     *
     * @return bool
     */
    public function resetBudget(): bool
    {
        $this->remaining_budget = $this->annual_budget;
        return $this->save();
    }

    /**
     * Get the university that owns the department.
     */
    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class, 'university_id', 'university_id');
    }


    public function stockLevels()
    {
        return $this->hasMany(StockLevel::class, 'department_id', 'department_id');
    }
    /**
     * Get the department head user.
     */
    public function head(): BelongsTo
    {
        return $this->belongsTo(User::class, 'department_head_id', 'id');
    }

    /**
     * Get the inventory transactions for the department.
     */
    public function inventoryTransactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class, 'department_id', 'department_id');
    }

    /**
     * Get the inventory items associated with the department.
     */
    public function inventoryItems(): HasMany
    {
        return $this->hasMany(InventoryItem::class, 'department_id', 'department_id');
    }

    /**
     * Get the custom field value by key.
     *
     * @param  string  $key
     * @param  mixed  $default
     * @return mixed
     */
    public function getCustomField(string $key, $default = null)
    {
        return $this->custom_fields[$key] ?? $default;
    }

    /**
     * Set a custom field value.
     *
     * @param  string  $key
     * @param  mixed  $value
     * @return bool
     */
    public function setCustomField(string $key, $value): bool
    {
        $customFields = $this->custom_fields ?? [];
        $customFields[$key] = $value;
        $this->custom_fields = $customFields;
        
        return $this->save();
    }

    /**
     * Remove a custom field.
     *
     * @param  string  $key
     * @return bool
     */
    public function removeCustomField(string $key): bool
    {
        $customFields = $this->custom_fields ?? [];
        
        if (array_key_exists($key, $customFields)) {
            unset($customFields[$key]);
            $this->custom_fields = $customFields;
            return $this->save();
        }
        
        return false;
    }

    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::creating(function ($department) {
            // Generate UUID if not provided
            if (empty($department->department_id)) {
                $department->department_id = (string) \Illuminate\Support\Str::uuid();
            }

            // Ensure department code is uppercase
            if (!empty($department->department_code)) {
                $department->department_code = strtoupper($department->department_code);
            }

            // Set remaining budget to annual budget if not provided
            if (empty($department->remaining_budget) && !empty($department->annual_budget)) {
                $department->remaining_budget = $department->annual_budget;
            }
        });

        static::updating(function ($department) {
            // Ensure department code is uppercase
            if ($department->isDirty('department_code')) {
                $department->department_code = strtoupper($department->department_code);
            }

            // If annual budget changes, adjust remaining budget proportionally
            if ($department->isDirty('annual_budget') && $department->annual_budget > 0) {
                $oldAnnualBudget = $department->getOriginal('annual_budget');
                if ($oldAnnualBudget > 0) {
                    $ratio = $department->annual_budget / $oldAnnualBudget;
                    $department->remaining_budget = $department->remaining_budget * $ratio;
                }
            }
        });
    }
}