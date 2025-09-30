<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasFactory, SoftDeletes;
    use Auditable;
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'supplier_id';

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
        'supplier_id',
        'university_id',
        'supplier_code',
        'legal_name',
        'trade_name',
        'supplier_type',
        'contact_person',
        'phone',
        'email',
        'website',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'tax_id',
        'vat_number',
        'credit_limit',
        'payment_terms_days',
        'rating',
        'delivery_reliability',
        'quality_rating',
        'certifications',
        'is_approved',
        'approval_date',
        'next_evaluation_date',
        'is_active',
        'notes',
        'approved_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'credit_limit' => 'decimal:2',
        'rating' => 'decimal:2',
        'delivery_reliability' => 'integer',
        'quality_rating' => 'integer',
        'certifications' => 'array',
        'is_approved' => 'boolean',
        'approval_date' => 'date',
        'next_evaluation_date' => 'date',
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
        'payment_terms_days' => 30,
        'rating' => 0,
        'delivery_reliability' => 0,
        'quality_rating' => 0,
        'is_approved' => false,
        'is_active' => true,
    ];

    /**
     * Supplier type constants
     */
    const TYPE_MANUFACTURER = 'manufacturer';
    const TYPE_DISTRIBUTOR = 'distributor';
    const TYPE_WHOLESALER = 'wholesaler';
    const TYPE_RETAILER = 'retailer';
    const TYPE_SERVICE = 'service';

    /**
     * Get the supplier types with labels
     *
     * @return array
     */
    public static function getSupplierTypes(): array
    {
        return [
            self::TYPE_MANUFACTURER => 'Manufacturer',
            self::TYPE_DISTRIBUTOR => 'Distributor',
            self::TYPE_WHOLESALER => 'Wholesaler',
            self::TYPE_RETAILER => 'Retailer',
            self::TYPE_SERVICE => 'Service Provider',
        ];
    }

    /**
     * Get the label for the supplier type
     *
     * @return string
     */
    public function getSupplierTypeLabelAttribute(): string
    {
        return self::getSupplierTypes()[$this->supplier_type] ?? $this->supplier_type;
    }

    /**
     * Get the display name (trade name if available, otherwise legal name)
     *
     * @return string
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->trade_name ?: $this->legal_name;
    }

    /**
     * Get the full address as a formatted string
     *
     * @return string
     */
    public function getFullAddressAttribute(): string
    {
        $address = $this->address;
        
        if ($this->city) {
            $address .= ', ' . $this->city;
        }
        
        if ($this->state) {
            $address .= ', ' . $this->state;
        }
        
        if ($this->country) {
            $address .= ', ' . $this->country;
        }
        
        if ($this->postal_code) {
            $address .= ', ' . $this->postal_code;
        }
        
        return $address;
    }

    /**
     * Get the overall performance score (weighted average)
     *
     * @return float
     */
    public function getPerformanceScoreAttribute(): float
    {
        // Weighted average: rating (40%), delivery reliability (30%), quality rating (30%)
        return (
            ($this->rating * 0.4) + 
            ($this->delivery_reliability * 0.3) + 
            ($this->quality_rating * 0.3)
        );
    }

    /**
     * Get the performance rating as a string
     *
     * @return string
     */
    public function getPerformanceRatingAttribute(): string
    {
        $score = $this->performance_score;
        
        if ($score >= 90) return 'Excellent';
        if ($score >= 80) return 'Very Good';
        if ($score >= 70) return 'Good';
        if ($score >= 60) return 'Fair';
        return 'Poor';
    }

    /**
     * Check if the supplier has available credit
     *
     * @param  float  $amount
     * @return bool
     */
    public function hasAvailableCredit(float $amount = 0): bool
    {
        if ($this->credit_limit === null) {
            return true; // No credit limit set
        }
        
        // In a real application, you'd subtract current outstanding balance
        return $amount <= $this->credit_limit;
    }

    /**
     * Check if the supplier needs evaluation (evaluation date is past or near)
     *
     * @return bool
     */
    public function needsEvaluation(): bool
    {
        if (!$this->next_evaluation_date) {
            return false;
        }
        
        return now()->greaterThanOrEqualTo($this->next_evaluation_date->subDays(30));
    }

    /**
     * Check if the supplier is reliable (delivery reliability >= 90%)
     *
     * @return bool
     */
    public function isReliable(): bool
    {
        return $this->delivery_reliability >= 90;
    }

    /**
     * Check if the supplier provides high quality (quality rating >= 90%)
     *
     * @return bool
     */
    public function hasHighQuality(): bool
    {
        return $this->quality_rating >= 90;
    }

    /**
     * Check if the supplier has specific certification
     *
     * @param  string  $certification
     * @return bool
     */
    public function hasCertification(string $certification): bool
    {
        return in_array($certification, $this->certifications ?? []);
    }

    /**
     * Add a certification to the supplier
     *
     * @param  string  $certification
     * @return bool
     */
    public function addCertification(string $certification): bool
    {
        $certifications = $this->certifications ?? [];
        
        if (!in_array($certification, $certifications)) {
            $certifications[] = $certification;
            $this->certifications = $certifications;
            return $this->save();
        }
        
        return false;
    }

    /**
     * Remove a certification from the supplier
     *
     * @param  string  $certification
     * @return bool
     */
    public function removeCertification(string $certification): bool
    {
        $certifications = $this->certifications ?? [];
        
        if (($key = array_search($certification, $certifications)) !== false) {
            unset($certifications[$key]);
            $this->certifications = array_values($certifications);
            return $this->save();
        }
        
        return false;
    }

    /**
     * Approve the supplier
     *
     * @param  string  $approvedBy
     * @return bool
     */
    public function approve(string $approvedBy): bool
    {
        $this->is_approved = true;
        $this->approval_date = now();
        $this->approved_by = $approvedBy;
        $this->next_evaluation_date = now()->addYear(); // Evaluate again in 1 year
        
        return $this->save();
    }

    /**
     * Scope a query to only include active suppliers.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include approved suppliers.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    /**
     * Scope a query to only include suppliers of a specific type.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $type
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('supplier_type', $type);
    }

    /**
     * Scope a query to only include suppliers that need evaluation.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeNeedsEvaluation($query)
    {
        return $query->where('next_evaluation_date', '<=', now()->addDays(30));
    }

    /**
     * Scope a query to only include reliable suppliers (delivery reliability >= 90%).
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeReliable($query)
    {
        return $query->where('delivery_reliability', '>=', 90);
    }

    /**
     * Scope a query to only include high-quality suppliers (quality rating >= 90%).
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeHighQuality($query)
    {
        return $query->where('quality_rating', '>=', 90);
    }

    /**
     * Scope a query to only include suppliers for a specific university.
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
     * Get the university that owns the supplier.
     */
    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class, 'university_id', 'university_id');
    }

    /**
     * Get the user who approved the supplier.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by', 'user_id');
    }

    /**
     * Get the purchase orders for the supplier.
     */
    // public function purchaseOrders(): HasMany
    // {
    //     return $this->hasMany(PurchaseOrder::class, 'supplier_id', 'supplier_id');
    // }

    /**
     * Get the inventory items supplied by this supplier.
     */
    // public function inventoryItems(): HasMany
    // {
    //     return $this->hasMany(InventoryItem::class, 'supplier_id', 'supplier_id');
    // }

    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::creating(function ($supplier) {
            // Generate UUID if not provided
            if (empty($supplier->supplier_id)) {
                $supplier->supplier_id = (string) \Illuminate\Support\Str::uuid();
            }

            // Ensure supplier code is uppercase
            if (!empty($supplier->supplier_code)) {
                $supplier->supplier_code = strtoupper($supplier->supplier_code);
            }

            // Set default evaluation date if approved
            if ($supplier->is_approved && empty($supplier->next_evaluation_date)) {
                $supplier->next_evaluation_date = now()->addYear();
            }
        });

        static::updating(function ($supplier) {
            // Ensure supplier code is uppercase
            if ($supplier->isDirty('supplier_code')) {
                $supplier->supplier_code = strtoupper($supplier->supplier_code);
            }

            // Set approval date when supplier is approved
            if ($supplier->isDirty('is_approved') && $supplier->is_approved) {
                $supplier->approval_date = now();
                if (empty($supplier->next_evaluation_date)) {
                    $supplier->next_evaluation_date = now()->addYear();
                }
            }
        });
    }
}