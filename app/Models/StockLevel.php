<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class StockLevel extends Model
{
    use HasFactory;
    use Auditable;
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'stock_levels';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'stock_id';

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
        'stock_id',
        'university_id',
        'item_id',
        'department_id',
        'location_id',
        'current_quantity',
        'committed_quantity',
        'available_quantity',
        'on_order_quantity',
        'average_cost',
        'total_value',
        'last_count_date',
        'next_count_date',
        'count_frequency',
        'reorder_level',
        'max_level',
        'safety_stock',
        'lead_time_days',
        'service_level',
        'stock_movement_stats',
        'last_updated',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'current_quantity' => 'integer',
        'committed_quantity' => 'integer',
        'available_quantity' => 'integer',
        'on_order_quantity' => 'integer',
        'average_cost' => 'decimal:2',
        'total_value' => 'decimal:2',
        'last_count_date' => 'date',
        'next_count_date' => 'date',
        'reorder_level' => 'decimal:2',
        'max_level' => 'decimal:2',
        'safety_stock' => 'decimal:2',
        'lead_time_days' => 'integer',
        'service_level' => 'decimal:2',
        'stock_movement_stats' => 'array',
        'last_updated' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The attributes that have default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'current_quantity' => 0,
        'committed_quantity' => 0,
        'available_quantity' => 0,
        'on_order_quantity' => 0,
        'average_cost' => 0,
        'total_value' => 0,
        'reorder_level' => 0,
        'safety_stock' => 0,
        'lead_time_days' => 0,
        'service_level' => 95.00,
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the university that owns the stock level.
     */
    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class, 'university_id', 'university_id');
    }

    /**
     * Get the inventory item that owns the stock level.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'item_id', 'item_id');
    }

    /**
     * Get the department that owns the stock level.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id', 'department_id');
    }

    /**
     * Get the location that owns the stock level.
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'location_id', 'location_id');
    }

    /**
     * Scope a query to filter by university.
     */
    public function scopeForUniversity($query, $universityId)
    {
        return $query->where('university_id', $universityId);
    }

    /**
     * Scope a query to filter by department.
     */
    public function scopeForDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    /**
     * Scope a query to filter by item.
     */
    public function scopeForItem($query, $itemId)
    {
        return $query->where('item_id', $itemId);
    }

    /**
     * Scope a query to filter by low stock (below reorder level).
     */
    public function scopeLowStock($query)
    {
        return $query->where('available_quantity', '<=', $this->reorder_level);
    }

    /**
     * Scope a query to filter by out of stock items.
     */
    public function scopeOutOfStock($query)
    {
        return $query->where('available_quantity', '<=', 0);
    }

    /**
     * Check if the stock level is low.
     */
    public function isLowStock(): bool
    {
        return $this->available_quantity <= $this->reorder_level;
    }

    /**
     * Check if the item is out of stock.
     */
    public function isOutOfStock(): bool
    {
        return $this->available_quantity <= 0;
    }

    /**
     * Calculate the stock value.
     */
    public function calculateTotalValue(): void
    {
        $this->total_value = $this->current_quantity * $this->average_cost;
    }

    /**
     * Calculate available quantity.
     */
    public function calculateAvailableQuantity(): void
    {
        $this->available_quantity = $this->current_quantity - $this->committed_quantity;
    }
}