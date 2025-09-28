<?php

namespace App\Traits;

use App\Models\AuditLog;
use App\Models\University;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

trait Auditable
{
    /**
     * Boot the auditable trait for a model.
     */
    protected static function bootAuditable()
    {
        static::created(function ($model) {
            self::logAudit($model, 'CREATE', null, $model->getAttributes());
        });

        static::updated(function ($model) {
            $changes = $model->getChanges();
            $oldValues = collect($model->getOriginal())
                ->only(array_keys($changes))
                ->toArray();
            
            self::logAudit($model, 'UPDATE', $oldValues, $changes);
        });

        static::deleted(function ($model) {
            self::logAudit($model, 'DELETE', $model->getOriginal(), null);
        });

        // For soft deletes
        if (method_exists(static::class, 'bootSoftDeletes')) {
            static::restored(function ($model) {
                self::logAudit($model, 'RESTORE', null, $model->getAttributes());
            });

            static::forceDeleted(function ($model) {
                self::logAudit($model, 'FORCE_DELETE', $model->getOriginal(), null);
            });
        }
    }

    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class, 'university_id', 'university_id')
                    ->withDefault(function ($university, $auditLog) {
                        // Provide default values if university doesn't exist
                        $university->name = 'Unknown University';
                        $university->code = 'UNKNOWN';
                    });
    }
    /**
     * Log audit entry for model events.
     */
    protected static function logAudit($model, $action, $oldValues = null, $newValues = null)
    {
        try {
            $tableName = $model->getTable();
            $recordId = $model->getKey();

            // Remove sensitive fields from logging
            $sensitiveFields = ['password', 'remember_token', 'api_token', 'email_verified_at'];
            
            if ($oldValues) {
                $oldValues = collect($oldValues)->except($sensitiveFields)->toArray();
            }
            
            if ($newValues) {
                $newValues = collect($newValues)->except($sensitiveFields)->toArray();
            }

            // Create audit log entry
            AuditLog::create([
                'university_id' => self::getUniversityId(),
                'table_name' => $tableName,
                'record_id' => (string) $recordId,
                'action' => $action,
                'old_values' => $oldValues,
                'new_values' => $newValues,
                'url' => request()->fullUrl() ?? 'system',
                'ip_address' => request()->ip() ?? '127.0.0.1',
                'user_agent' => request()->userAgent(),
                'user_id' => Auth::id(),
                'performed_at' => now(),
            ]);

        } catch (\Exception $e) {
            // Log the error but don't break the application
            Log::error('Audit logging failed: ' . $e->getMessage());
        }
    }

    /**
     * Get university ID from authenticated user or model.
     */
    protected static function getUniversityId()
    {
        if (Auth::check() && Auth::user()->university_id) {
            return Auth::user()->university_id;
        }

        // If model has university_id, use it
        if (isset($model->university_id)) {
            return $model->university_id;
        }

        return null;
    }
}