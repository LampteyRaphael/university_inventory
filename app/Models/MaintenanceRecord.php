<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MaintenanceRecord extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'maintenance_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'maintenance_id',
        'university_id',
        'item_id',
        'department_id',
        'maintenance_code',
        'scheduled_date',
        'completed_date',
        'maintenance_type',
        'priority',
        'description',
        'work_performed',
        'root_cause',
        'recommendations',
        'labor_cost',
        'parts_cost',
        'total_cost',
        'downtime_hours',
        'technician',
        'vendor',
        'next_maintenance_date',
        'status',
        'created_by',
        'assigned_to'
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'completed_date' => 'date',
        'next_maintenance_date' => 'date',
        'labor_cost' => 'decimal:2',
        'parts_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'downtime_hours' => 'integer'
    ];

    // Relationships
    public function university()
    {
        return $this->belongsTo(University::class, 'university_id');
    }

    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class, 'item_id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function item()
    {
        return $this->belongsTo(InventoryItem::class,'item_id');
    }

    public function createdByUser()
    {
        return $this->belongsTo(User::class,'created_by');
    }

    public function assignedToUser()
    {
        return $this->belongsTo(User::class,'assigned_to');
    }
}