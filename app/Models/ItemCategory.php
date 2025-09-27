<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ItemCategory extends Model
{
    use SoftDeletes;

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
     * Get all descendant categories.
     */
    public function descendants(): HasMany
    {
        return $this->hasMany(ItemCategory::class, 'parent_category_id', 'category_id')
                    ->with('descendants')
                    ->orderBy('lft');
    }

    /**
     * Get the items in this category.
     */
    // public function items(): HasMany
    // {
    //     return $this->hasMany(Item::class, 'category_id', 'category_id');
    // }

    /**
     * Get the root category for this category.
     */
    public function rootCategory(): HasOne
    {
        return $this->hasOne(ItemCategory::class, 'category_id', 'parent_category_id')
                    ->whereNull('parent_category_id');
    }

    /**
     * Scope a query to only include active categories.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include root categories (no parent).
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_category_id');
    }

    /**
     * Scope a query to only include categories with maintenance required.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRequiresMaintenance($query)
    {
        return $query->where('requires_maintenance', true);
    }

    /**
     * Scope a query to only include categories that require serial numbers.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRequiresSerialNumber($query)
    {
        return $query->where('requires_serial_number', true);
    }

    /**
     * Get the full category path as a string.
     *
     * @return string
     */
    public function getFullCategoryPathAttribute(): string
    {
        $path = [];
        $category = $this;
        
        while ($category) {
            array_unshift($path, $category->name);
            $category = $category->parent;
        }
        
        return implode(' > ', $path);
    }

    /**
     * Check if the category is a root category.
     *
     * @return bool
     */
    public function isRoot(): bool
    {
        return is_null($this->parent_category_id);
    }

    /**
     * Check if the category is a leaf category (no children).
     *
     * @return bool
     */
    public function isLeaf(): bool
    {
        return $this->children()->count() === 0;
    }

    /**
     * Check if the category has children.
     *
     * @return bool
     */
    public function hasChildren(): bool
    {
        return $this->children()->count() > 0;
    }

    /**
     * Get the depreciation method in human-readable format.
     *
     * @return string
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
     *
     * @param float $value
     * @return float
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
     *
     * @return bool
     */
    public function hasWarranty(): bool
    {
        return $this->warranty_period_days > 0;
    }

    /**
     * Get the warranty period in a human-readable format.
     *
     * @return string
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
}