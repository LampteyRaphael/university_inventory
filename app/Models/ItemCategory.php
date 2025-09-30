<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ItemCategory extends Model
{
    use HasFactory;
    use SoftDeletes,Auditable;
   
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'category_id';

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
     * @var array
     */
    protected $fillable = [
        'category_id',
        'university_id',
        'parent_category_id',
        'category_code',
        'name',
        'description',
        'image_url',
        'warranty_period_days',
        'depreciation_rate',
        'depreciation_method',
        'requires_serial_number',
        'requires_maintenance',
        'maintenance_interval_days',
        'specification_template',
        'lft',
        'rgt',
        'depth',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'warranty_period_days' => 'integer',
        'depreciation_rate' => 'decimal:2',
        'requires_serial_number' => 'boolean',
        'requires_maintenance' => 'boolean',
        'maintenance_interval_days' => 'integer',
        'specification_template' => 'array',
        'lft' => 'integer',
        'rgt' => 'integer',
        'depth' => 'integer',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'lft',
        'rgt',
        'depth',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'full_category_path',
    ];

    /**
     * Boot function for the model.
     *
     * @return void
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->category_id)) {
                $model->category_id = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    /**
     * Get the university that owns the category.
     */
    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class, 'university_id', 'university_id');
    }

    /**
     * Get the parent category.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(ItemCategory::class, 'parent_category_id', 'category_id');
    }

    /**
     * Get the child categories.
     */
    public function children(): HasMany
    {
        return $this->hasMany(ItemCategory::class, 'parent_category_id', 'category_id')
                    ->orderBy('lft');
    }
    

    /**
     * Get all descendant categories (recursive).
     */
    public function descendants(): HasMany
    {
        return $this->children()->with('descendants');
    }

    /**
     * Get the root category for this category.
     * This should be a BelongsTo relationship, not HasOne
     */
    public function rootCategory(): BelongsTo
    {
        return $this->belongsTo(ItemCategory::class, 'parent_category_id', 'category_id')
                    ->whereNull('parent_category_id');
    }

    /**
     * Get the items in this category.
     */
    public function items(): HasMany
    {
        return $this->hasMany(InventoryItem::class, 'category_id', 'category_id');
    }

    /**
     * Scope a query to only include active categories.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include root categories (no parent).
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_category_id');
    }

    /**
     * Scope a query to only include categories with maintenance required.
     */
    public function scopeRequiresMaintenance($query)
    {
        return $query->where('requires_maintenance', true);
    }

    /**
     * Scope a query to only include categories that require serial numbers.
     */
    public function scopeRequiresSerialNumber($query)
    {
        return $query->where('requires_serial_number', true);
    }

    /**
     * Get the full category path as a string.
     */
    public function getFullCategoryPathAttribute(): string
    {
        $path = [];
        $category = $this;
        
        // Limit to prevent infinite loops
        $maxDepth = 10;
        $currentDepth = 0;
        
        while ($category && $currentDepth < $maxDepth) {
            array_unshift($path, $category->name);
            $category = $category->parent;
            $currentDepth++;
        }
        
        return implode(' > ', $path);
    }

    /**
     * Get the parent category name with fallback.
     */
    public function getParentCategoryNameAttribute(): string
    {
        return $this->parent ? $this->parent->name : 'Root Category';
    }

    /**
     * Get the university name with fallback.
     */
    public function getUniversityNameAttribute(): string
    {
        return $this->university ? $this->university->name : 'Unknown University';
    }

    /**
     * Check if the category is a root category.
     */
    public function getIsRootAttribute(): bool
    {
        return is_null($this->parent_category_id);
    }

    /**
     * Check if the category is a leaf category (no children).
     */
    public function getIsLeafAttribute(): bool
    {
        return $this->children()->count() === 0;
    }

    /**
     * Check if the category has children.
     */
    public function getHasChildrenAttribute(): bool
    {
        return $this->children()->count() > 0;
    }

    /**
     * Get the items count for this category.
     */
    public function getItemsCountAttribute(): int
    {
        return $this->items()->count();
    }

    /**
     * Get the depreciation method in human-readable format.
     */
    public function getDepreciationMethodNameAttribute(): string
    {
        return match($this->depreciation_method) {
            'straight_line' => 'Straight Line',
            'reducing_balance' => 'Reducing Balance',
            default => ucfirst(str_replace('_', ' ', $this->depreciation_method)),
        };
    }

    /**
     * Calculate the daily depreciation amount for an item value.
     */
    public function calculateDailyDepreciation(float $value): float
    {
        if ($this->depreciation_rate <= 0) {
            return 0;
        }

        $annualRate = $this->depreciation_rate / 100;
        
        if ($this->depreciation_method === 'straight_line') {
            return ($value * $annualRate) / 365;
        } else { // reducing_balance
            return ($value * $annualRate) / 365;
        }
    }

    /**
     * Check if warranty is applicable for items in this category.
     */
    public function getHasWarrantyAttribute(): bool
    {
        return $this->warranty_period_days > 0;
    }

    /**
     * Get the warranty period in a human-readable format.
     */
    public function getWarrantyPeriodFormattedAttribute(): string
    {
        if ($this->warranty_period_days === 0) {
            return 'No warranty';
        }

        $years = floor($this->warranty_period_days / 365);
        $months = floor(($this->warranty_period_days % 365) / 30);
        $days = $this->warranty_period_days % 30;

        $parts = [];
        if ($years > 0) $parts[] = $years . ' year' . ($years > 1 ? 's' : '');
        if ($months > 0) $parts[] = $months . ' month' . ($months > 1 ? 's' : '');
        if ($days > 0) $parts[] = $days . ' day' . ($days > 1 ? 's' : '');

        return implode(' ', $parts);
    }

    /**
     * Get the maintenance interval in a human-readable format.
     */
    public function getMaintenanceIntervalFormattedAttribute(): string
    {
        if (!$this->requires_maintenance || !$this->maintenance_interval_days) {
            return 'Not required';
        }

        $months = floor($this->maintenance_interval_days / 30);
        $days = $this->maintenance_interval_days % 30;

        $parts = [];
        if ($months > 0) $parts[] = $months . ' month' . ($months > 1 ? 's' : '');
        if ($days > 0) $parts[] = $days . ' day' . ($days > 1 ? 's' : '');

        return implode(' ', $parts) . ' interval';
    }
}