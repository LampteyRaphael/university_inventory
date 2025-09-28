<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class AuditLog extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'audit_id';

    /**
     * The "type" of the primary key ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    // protected $table=""
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
        'audit_id',
        'university_id',
        'table_name',
        'record_id',
        'action',
        'old_values',
        'new_values',
        'url',
        'ip_address',
        'user_agent',
        'user_id',
        'performed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'performed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        // Add any sensitive fields you want to hide
    ];

    /**
     * Get the university that owns the audit log.
     */
    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class, 'university_id', 'university_id');
    }

    /**
     * Get the user that performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    /**
     * Scope a query to only include logs for a specific table.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $tableName
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForTable($query, string $tableName)
    {
        return $query->where('table_name', $tableName);
    }

    /**
     * Scope a query to only include logs for a specific action.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $action
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope a query to only include logs for a specific record.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $tableName
     * @param  string  $recordId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForRecord($query, string $tableName, string $recordId)
    {
        return $query->where('table_name', $tableName)
                    ->where('record_id', $recordId);
    }

    /**
     * Scope a query to only include logs for a specific user.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $userId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForUser($query, string $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to only include logs from a date range.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDateRange($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('performed_at', [$startDate, $endDate]);
    }

    /**
     * Scope a query to only include recent logs.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  int  $days
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('performed_at', '>=', now()->subDays($days));
    }

    /**
     * Scope a query to only include system actions (where user_id is null).
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSystemActions($query)
    {
        return $query->whereNull('user_id');
    }

    /**
     * Scope a query to only include user actions (where user_id is not null).
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeUserActions($query)
    {
        return $query->whereNotNull('user_id');
    }

    /**
     * Get the number of changes between old and new values.
     *
     * @return int
     */
    public function getChangesCountAttribute(): int
    {
        $oldValues = $this->old_values ?? [];
        $newValues = $this->new_values ?? [];

        if (empty($oldValues) && empty($newValues)) {
            return 0;
        }

        if (empty($oldValues)) {
            return count($newValues);
        }

        if (empty($newValues)) {
            return count($oldValues);
        }

        return count(array_diff_assoc($newValues, $oldValues)) + count(array_diff_assoc($oldValues, $newValues));
    }

    /**
     * Check if this is a system action.
     *
     * @return bool
     */
    public function getIsSystemActionAttribute(): bool
    {
        return is_null($this->user_id);
    }

    /**
     * Get the action with proper formatting.
     *
     * @return string
     */
    public function getFormattedActionAttribute(): string
    {
        return strtoupper($this->action);
    }

    /**
     * Get the short URL (truncated for display).
     *
     * @return string
     */
    public function getShortUrlAttribute(): string
    {
        if (strlen($this->url) > 50) {
            return substr($this->url, 0, 50) . '...';
        }

        return $this->url;
    }

    /**
     * Get the browser name from user agent.
     *
     * @return string|null
     */
    public function getBrowserAttribute(): ?string
    {
        if (!$this->user_agent) {
            return null;
        }

        // Simple browser detection (you can use a package like jenssegers/agent for more accuracy)
        $user_agent = $this->user_agent;

        if (strpos($user_agent, 'Chrome') !== false) return 'Chrome';
        if (strpos($user_agent, 'Firefox') !== false) return 'Firefox';
        if (strpos($user_agent, 'Safari') !== false) return 'Safari';
        if (strpos($user_agent, 'Edge') !== false) return 'Edge';
        if (strpos($user_agent, 'Opera') !== false) return 'Opera';

        return 'Unknown';
    }

    /**
     * Get the operating system from user agent.
     *
     * @return string|null
     */
    public function getOperatingSystemAttribute(): ?string
    {
        if (!$this->user_agent) {
            return null;
        }

        $user_agent = $this->user_agent;

        if (strpos($user_agent, 'Windows') !== false) return 'Windows';
        if (strpos($user_agent, 'Mac') !== false) return 'Mac';
        if (strpos($user_agent, 'Linux') !== false) return 'Linux';
        if (strpos($user_agent, 'Android') !== false) return 'Android';
        if (strpos($user_agent, 'iOS') !== false) return 'iOS';

        return 'Unknown';
    }

    /**
     * Boot function for handling model events.
     */
    protected static function boot()
    {
        parent::boot();

        // Generate UUID when creating new audit log
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) \Illuminate\Support\Str::uuid();
            }

            // Set performed_at to current time if not provided
            if (empty($model->performed_at)) {
                $model->performed_at = now();
            }
        });
    }
}