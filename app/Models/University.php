<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class University extends Model
{
    use HasFactory, SoftDeletes, Auditable;
    
    protected $primaryKey = 'university_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'university_id',
        'name',
        'code',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'contact_number',
        'email',
        'website',
        'established_date',
        'logo_url',
        'settings',
        'is_active',
    ];

    protected $casts = [
        'established_date' => 'date',
        'settings' => 'array',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the departments for the university.
     */
    public function departments()
    {
        return $this->hasMany(Department::class, 'university_id', 'university_id');
    }

    /**
     * Get the locations for the university.
     */
    public function locations()
    {
        return $this->hasMany(Location::class, 'university_id', 'university_id');
    }

    /**
     * Scope a query to only include active universities.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to search universities by name, city, or state.
     */
    public function scopeSearch($query, $searchTerm)
    {
        return $query->where(function($q) use ($searchTerm) {
            $q->where('name', 'like', "%{$searchTerm}%")
              ->orWhere('city', 'like', "%{$searchTerm}%")
              ->orWhere('state', 'like', "%{$searchTerm}%");
        });
    }

    /**
     * Scope a query to filter by country.
     */
    public function scopeByCountry($query, $country)
    {
        return $query->where('country', $country);
    }

    /**
     * Get the display name with code.
     */
    public function getDisplayNameAttribute()
    {
        return "{$this->name} ({$this->code})";
    }

    /**
     * Get the full address.
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
     * Get the age of the university in years.
     */
    public function getAgeAttribute()
    {
        return now()->diffInYears($this->established_date);
    }

    /**
     * Get specific setting value.
     */
    public function getSetting($key, $default = null)
    {
        return data_get($this->settings, $key, $default);
    }

    /**
     * Set specific setting value.
     */
    public function setSetting($key, $value)
    {
        $settings = $this->settings ?? [];
        data_set($settings, $key, $value);
        $this->settings = $settings;
        return $this;
    }
}