<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class InventoryItem extends Model
{
    use HasFactory, SoftDeletes;
    use Auditable;
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
        'expiry_date'          => 'date:Y-m-d',
        'minimum_stock_level'  => 'integer',
        'maximum_stock_level'  => 'integer',
        'reorder_point'        => 'integer',
        'economic_order_quantity' => 'integer',
        'shelf_life_days'      => 'integer',
    ];


    protected static function booted()
    {
        static::creating(function ($model) {
            // Auto-generate UUID if not provided
            if (empty($model->item_id)) {
                $model->item_id = Str::uuid()->toString();
            }
            
            // Set created_by from authenticated user
            if (Auth::check() && empty($model->created_by)) {
                $model->created_by = Auth::user()->user_id;
            }

            // Convert specifications array to JSON if needed
            if (isset($model->specifications) && is_array($model->specifications)) {
                $model->specifications = json_encode($model->specifications);
            }
        });

        static::updating(function ($model) {
            // Convert specifications array to JSON on update as well
            if (isset($model->specifications) && is_array($model->specifications)) {
                $model->specifications = json_encode($model->specifications);
            }
        });
    }

    // Relationships
    public function university()
    {
        return $this->belongsTo(University::class, 'university_id', 'university_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function purchaseOrderItems()
    {
        return $this->hasMany(PurchaseOrderItem::class, 'item_id', 'item_id');
    }
    
    public function category()
    {
        return $this->belongsTo(ItemCategory::class, 'category_id', 'category_id');
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
