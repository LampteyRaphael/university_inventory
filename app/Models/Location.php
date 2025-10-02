<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Location extends Model
{
    use HasFactory, SoftDeletes,Auditable;

    protected $table='locations';
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'location_id';

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
        'location_id',
        'university_id',
        'department_id',
        'location_code',
        'name',
        'building',
        'floor',
        'room_number',
        'aisle',
        'shelf',
        'bin',
        'capacity',
        'current_utilization',
        'location_type',
        'is_secured',
        'is_climate_controlled',
        'temperature_min',
        'temperature_max',
        'humidity_min',
        'humidity_max',
        'is_active',
        'managed_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'capacity' => 'decimal:2',
        'current_utilization' => 'decimal:2',
        'is_secured' => 'boolean',
        'is_climate_controlled' => 'boolean',
        'temperature_min' => 'decimal:2',
        'temperature_max' => 'decimal:2',
        'humidity_min' => 'decimal:2',
        'humidity_max' => 'decimal:2',
        'is_active' => 'boolean',
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
        'current_utilization' => 0,
        'is_secured' => false,
        'is_climate_controlled' => false,
        'is_active' => true,
    ];

    /**
     * Location type constants
     */
    const TYPE_STORAGE = 'storage';
    const TYPE_OFFICE = 'office';
    const TYPE_LAB = 'lab';
    const TYPE_CLASSROOM = 'classroom';
    const TYPE_WORKSHOP = 'workshop';
    const TYPE_OUTDOOR = 'outdoor';

    /**
     * Get the location types with labels
     *
     * @return array
     */
    public static function getLocationTypes(): array
    {
        return [
            self::TYPE_STORAGE => 'Storage',
            self::TYPE_OFFICE => 'Office',
            self::TYPE_LAB => 'Laboratory',
            self::TYPE_CLASSROOM => 'Classroom',
            self::TYPE_WORKSHOP => 'Workshop',
            self::TYPE_OUTDOOR => 'Outdoor',
        ];
    }

    /**
     * Get the label for the location type
     *
     * @return string
     */
    public function getLocationTypeLabelAttribute(): string
    {
        return self::getLocationTypes()[$this->location_type] ?? $this->location_type;
    }

    /**
     * Get the full address string for the location.
     *
     * @return string
     */
    public function getFullAddressAttribute(): string
    {
        $address = $this->building;
        
        if ($this->floor) {
            $address .= ', Floor ' . $this->floor;
        }
        
        if ($this->room_number) {
            $address .= ', Room ' . $this->room_number;
        }
        
        if ($this->aisle) {
            $address .= ', Aisle ' . $this->aisle;
        }
        
        if ($this->shelf) {
            $address .= ', Shelf ' . $this->shelf;
        }
        
        if ($this->bin) {
            $address .= ', Bin ' . $this->bin;
        }
        
        return $address;
    }

    /**
     * Get the detailed location code with hierarchy.
     *
     * @return string
     */
    public function getDetailedLocationCodeAttribute(): string
    {
        $code = $this->location_code;
        
        if ($this->aisle) {
            $code .= '-A' . $this->aisle;
        }
        
        if ($this->shelf) {
            $code .= '-S' . $this->shelf;
        }
        
        if ($this->bin) {
            $code .= '-B' . $this->bin;
        }
        
        return $code;
    }

    /**
     * Get the utilization percentage.
     *
     * @return float
     */
    public function getUtilizationPercentageAttribute(): float
    {
        if ($this->capacity <= 0) {
            return 0;
        }
        
        return ($this->current_utilization / $this->capacity) * 100;
    }

    /**
     * Check if the location has available capacity.
     *
     * @param  float  $requiredCapacity
     * @return bool
     */
    public function hasAvailableCapacity(float $requiredCapacity = 0): bool
    {
        if ($this->capacity === null) {
            return true; // No capacity limit
        }
        
        $available = $this->capacity - $this->current_utilization;
        return $available >= $requiredCapacity;
    }

    /**
     * Check if the location is at or near capacity (90% or more utilized).
     *
     * @return bool
     */
    public function isNearCapacity(): bool
    {
        if ($this->capacity === null) {
            return false;
        }
        
        return $this->getUtilizationPercentageAttribute() >= 90;
    }

    /**
     * Check if the location is over capacity.
     *
     * @return bool
     */
    public function isOverCapacity(): bool
    {
        if ($this->capacity === null) {
            return false;
        }
        
        return $this->current_utilization > $this->capacity;
    }

    /**
     * Get the capacity status as a string.
     *
     * @return string
     */
    public function getCapacityStatusAttribute(): string
    {
        if ($this->isOverCapacity()) {
            return 'over_capacity';
        }
        
        if ($this->isNearCapacity()) {
            return 'near_capacity';
        }
        
        return 'within_capacity';
    }

    /**
     * Get the capacity status label with appropriate styling.
     *
     * @return array
     */
    public function getCapacityStatusLabelAttribute(): array
    {
        $status = $this->capacity_status;
        
        $labels = [
            'over_capacity' => [
                'text' => 'Over Capacity',
                'class' => 'badge bg-danger',
                'icon' => '⚠️'
            ],
            'near_capacity' => [
                'text' => 'Near Capacity',
                'class' => 'badge bg-warning',
                'icon' => '⚠️'
            ],
            'within_capacity' => [
                'text' => 'Within Capacity',
                'class' => 'badge bg-success',
                'icon' => '✅'
            ]
        ];
        
        return $labels[$status] ?? $labels['within_capacity'];
    }

    /**
     * Check if the location requires climate control.
     *
     * @return bool
     */
    public function requiresClimateControl(): bool
    {
        return $this->is_climate_controlled && 
               ($this->temperature_min !== null || 
                $this->temperature_max !== null || 
                $this->humidity_min !== null || 
                $this->humidity_max !== null);
    }

    /**
     * Get the climate control range as a formatted string.
     *
     * @return string|null
     */
    public function getClimateControlRangeAttribute(): ?string
    {
        if (!$this->requiresClimateControl()) {
            return null;
        }
        
        $range = '';
        
        if ($this->temperature_min !== null && $this->temperature_max !== null) {
            $range .= "Temp: {$this->temperature_min}°C - {$this->temperature_max}°C";
        }
        
        if ($this->humidity_min !== null && $this->humidity_max !== null) {
            if ($range !== '') {
                $range .= ' | ';
            }
            $range .= "Humidity: {$this->humidity_min}% - {$this->humidity_max}%";
        }
        
        return $range;
    }

    /**
     * Scope a query to only include active locations.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include locations with available capacity.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  float  $minCapacity
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithAvailableCapacity($query, $minCapacity = 0)
    {
        return $query->where(function ($q) use ($minCapacity) {
            $q->whereNull('capacity')
              ->orWhereRaw('(capacity - current_utilization) >= ?', [$minCapacity]);
        });
    }

    /**
     * Scope a query to only include locations of a specific type.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $type
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('location_type', $type);
    }

    /**
     * Scope a query to only include storage locations.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeStorage($query)
    {
        return $query->ofType(self::TYPE_STORAGE);
    }

    /**
     * Scope a query to only include secured locations.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSecured($query)
    {
        return $query->where('is_secured', true);
    }

    /**
     * Scope a query to only include climate-controlled locations.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeClimateControlled($query)
    {
        return $query->where('is_climate_controlled', true);
    }

    /**
     * Scope a query to only include locations in a specific building.
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
     * Scope a query to only include locations on a specific floor.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $floor
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOnFloor($query, $floor)
    {
        return $query->where('floor', $floor);
    }

    /**
     * Update the current utilization by a specified amount.
     *
     * @param  float  $amount
     * @param  bool  $isAddition
     * @return bool
     */
    public function updateUtilization(float $amount, bool $isAddition = true): bool
    {
        if ($isAddition) {
            $this->current_utilization += $amount;
        } else {
            $this->current_utilization -= $amount;
        }
        
        // Ensure utilization doesn't go below 0
        if ($this->current_utilization < 0) {
            $this->current_utilization = 0;
        }
        
        return $this->save();
    }

    /**
     * Reset the utilization to zero.
     *
     * @return bool
     */
    public function resetUtilization(): bool
    {
        $this->current_utilization = 0;
        return $this->save();
    }

    /**
     * Get the university that owns the location.
     */
    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class, 'university_id', 'university_id');
    }

    /**
     * Get the department that owns the location.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id', 'department_id');
    }

    public function stockLevels()
    {
        return $this->hasMany(StockLevel::class, 'item_id', 'item_id');
    }

    /**
     * Get the manager of the location.
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'managed_by', 'user_id');
    }

    /**
     * Get the source transactions for the location.
     */
    public function sourceTransactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class, 'source_location_id', 'location_id');
    }

    /**
     * Get the destination transactions for the location.
     */
    public function destinationTransactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class, 'destination_location_id', 'location_id');
    }

    /**
     * Get all transactions associated with the location.
     */
    public function allTransactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class, function ($query) {
            $query->where('source_location_id', $this->location_id)
                  ->orWhere('destination_location_id', $this->location_id);
        });
    }

    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::creating(function ($location) {
            // Generate UUID if not provided
            if (empty($location->location_id)) {
                $location->location_id = (string) \Illuminate\Support\Str::uuid();
            }

            // Ensure location code is uppercase
            if (!empty($location->location_code)) {
                $location->location_code = strtoupper($location->location_code);
            }
        });

        static::updating(function ($location) {
            // Ensure location code is uppercase
            if ($location->isDirty('location_code')) {
                $location->location_code = strtoupper($location->location_code);
            }

            // Ensure utilization doesn't exceed capacity if capacity is set
            if ($location->capacity !== null && $location->current_utilization > $location->capacity) {
                // You might want to throw an exception or handle this differently
                $location->current_utilization = $location->capacity;
            }
        });
    }
}