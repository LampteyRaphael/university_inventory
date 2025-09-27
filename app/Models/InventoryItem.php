<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'inventory_items';
    protected $primaryKey = 'item_id';
    public $incrementing = false; // Because you're using UUID
    protected $keyType = 'string';

    protected $fillable = [
        'item_id',
        'university_id',
        'category_id',
        'item_code',
        'name',
        'description',
        'specifications',
        'unit_of_measure',
        'unit_cost',
        'current_value',
        'minimum_stock_level',
        'maximum_stock_level',
        'reorder_point',
        'economic_order_quantity',
        'abc_classification',
        'weight_kg',
        'volume_cubic_m',
        'is_hazardous',
        'hazard_type',
        'handling_instructions',
        'storage_conditions',
        'shelf_life_days',
        'expiry_date',
        'barcode',
        'qr_code',
        'rfid_tag',
        'image_url',
        'document_url',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'specifications'       => 'array',
        'unit_cost'            => 'decimal:2',
        'current_value'        => 'decimal:2',
        'weight_kg'            => 'decimal:3',
        'volume_cubic_m'       => 'decimal:4',
        'is_hazardous'         => 'boolean',
        'is_active'            => 'boolean',
        'expiry_date'          => 'date',
        'minimum_stock_level'  => 'integer',
        'maximum_stock_level'  => 'integer',
        'reorder_point'        => 'integer',
        'economic_order_quantity' => 'integer',
        'shelf_life_days'      => 'integer',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    // public function university()
    // {
    //     return $this->belongsTo(University::class, 'university_id', 'university_id');
    // }

    // public function category()
    // {
    //     return $this->belongsTo(ItemCategory::class, 'category_id', 'category_id');
    // }

    // public function creator()
    // {
    //     return $this->belongsTo(User::class, 'created_by', 'id');
    // }

    // public function updater()
    // {
    //     return $this->belongsTo(User::class, 'updated_by', 'id');
    // }

    // public function recalculateTotalValue()
    // {
    //     $this->total_value = $this->current_value * $this->average_cost;
    //     $this->save();
    // }

    // Relationships
    public function university()
    {
        return $this->belongsTo(University::class, 'university_id', 'university_id');
    }

    public function category()
    {
        return $this->belongsTo(ItemCategory::class, 'category_id', 'category_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByUniversity($query, $universityId)
    {
        return $query->where('university_id', $universityId);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeExpiringSoon($query, $days = 30)
    {
        return $query->where('expiry_date', '<=', now()->addDays($days))
                    ->where('expiry_date', '>', now());
    }

    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now());
    }

    public function scopeLowStock($query)
    {
        return $query->whereRaw('(SELECT COALESCE(SUM(quantity), 0) FROM stock_levels WHERE stock_levels.item_id = inventory_items.item_id) <= reorder_point');
    }
}
