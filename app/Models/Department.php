<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use HasFactory, SoftDeletes, Auditable;

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

    public function departmentHead()
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
    
    public function stockLevels(): HasMany
    {
        return $this->hasMany(StockLevel::class, 'department_id', 'department_id');
    }

    /**
     * Get the maintenance records for the department.
     */
    public function maintenanceRecords(): HasMany
    {
        return $this->hasMany(MaintenanceRecord::class, 'department_id', 'department_id');
    }

    /**
     * Get the purchase orders for the department.
     */
    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class, 'department_id', 'department_id');
    }

    /**
     * Get inventory items through stock levels (indirect relationship)
     */
    public function inventoryItems()
    {
        return $this->hasManyThrough(
            InventoryItem::class,
            StockLevel::class,
            'department_id', // Foreign key on stock_levels table
            'item_id',       // Foreign key on inventory_items table
            'department_id', // Local key on departments table
            'item_id'        // Local key on stock_levels table
        );
    }
    
}