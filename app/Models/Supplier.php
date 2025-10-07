<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Supplier extends Model
{
    use HasFactory, SoftDeletes, HasUuids, Auditable;

    protected $primaryKey = 'supplier_id';
    protected $keyType = 'string';
    public $incrementing = false;

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

    protected $casts = [
        'supplier_id' => 'string',
        'university_id' => 'string',
        'credit_limit' => 'decimal:2',
        'rating' => 'decimal:2',
        'delivery_reliability' => 'integer',
        'quality_rating' => 'integer',
        'payment_terms_days' => 'integer',
        'is_approved' => 'boolean',
        'is_active' => 'boolean',
        'approval_date' => 'date',
        'next_evaluation_date' => 'date',
        'certifications' => 'array',
        'approved_by' => 'string',
    ];

    /**
     * Get the university that owns the supplier.
     */
    public function university()
    {
        return $this->belongsTo(University::class, 'university_id', 'university_id');
    }

    /**
     * Get the user who approved the supplier.
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by', 'id');
    }

    /**
     * Scope a query to only include approved suppliers.
     */
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    /**
     * Scope a query to only include active suppliers.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include high-rated suppliers.
     */
    public function scopeHighRated($query, $minRating = 4)
    {
        return $query->where('rating', '>=', $minRating);
    }

    /**
     * Get the supplier's full address.
     */
    public function getFullAddressAttribute()
    {
        $addressParts = [
            $this->address,
            $this->city,
            $this->state,
            $this->country,
            $this->postal_code
        ];

        return implode(', ', array_filter($addressParts));
    }

    /**
     * Check if supplier needs evaluation.
     */
    public function getNeedsEvaluationAttribute()
    {
        if (!$this->next_evaluation_date) {
            return false;
        }

        return $this->next_evaluation_date->isPast();
    }

    /**
     * Get the formatted credit limit.
     */
    public function getFormattedCreditLimitAttribute()
    {
        return '$' . number_format($this->credit_limit, 2);
    }

    /**
     * Get the overall performance score.
     */
    public function getPerformanceScoreAttribute()
    {
        $ratingScore = $this->rating * 20; // Convert 5-point scale to percentage
        $deliveryScore = $this->delivery_reliability;
        $qualityScore = $this->quality_rating;

        return ($ratingScore + $deliveryScore + $qualityScore) / 3;
    }
}