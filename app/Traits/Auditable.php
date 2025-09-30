<?php

namespace App\Traits;

use App\Models\AuditLog;
use App\Models\University;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

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

        if (method_exists(static::class, 'bootSoftDeletes')) {
            static::restored(function ($model) {
                self::logAudit($model, 'RESTORE', null, $model->getAttributes());
            });

            static::forceDeleted(function ($model) {
                self::logAudit($model, 'FORCE_DELETE', $model->getOriginal(), null);
            });
        }
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
            $sensitiveFields = ['password', 'remember_token', 'api_token', 'email_verified_at','updated_at'];
            
            if ($oldValues) {
                $oldValues = collect($oldValues)->except($sensitiveFields)->toArray();
            }
            
            if ($newValues) {
                $newValues = collect($newValues)->except($sensitiveFields)->toArray();
            }

            // Get university ID with validation
            $universityId = self::getValidUniversityId($model);

            // Prepare audit data
            $auditData = [
                'audit_id' => \Illuminate\Support\Str::uuid()->toString(),
                'university_id' => $universityId,
                'table_name' => $tableName,
                'record_id' => (string) $recordId,
                'action' => $action,
                'old_values' => $oldValues ?: null,
                'new_values' => $newValues ?: null,
                'url' => request()->fullUrl() ?? 'system',
                'ip_address' => request()->ip() ?? '127.0.0.1',
                'user_agent' => request()->userAgent() ?? 'Unknown',
                'user_id' => Auth::user()->id??null,
                'performed_at' => now(),
            ];

            // Create audit log entry
            AuditLog::create($auditData);

        } catch (\Exception $e) {
            Log::error('Audit logging failed: ' . $e->getMessage(), [
                'model' => get_class($model),
                'action' => $action,
                'exception' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Get validated university ID.
     */
    protected static function getValidUniversityId($model = null)
    {
        $universityId = self::getUniversityId($model);
        
        // Validate that the university exists
        if ($universityId && !self::universityExists($universityId)) {
            Log::warning("University ID {$universityId} does not exist in universities table");
            
            // Get a valid university ID or create a default one
            $universityId = self::getOrCreateDefaultUniversity();
        }
        
        return $universityId;
    }

    /**
     * Check if university exists.
     */
    protected static function universityExists($universityId)
    {
        return DB::table('universities')->where('university_id', $universityId)->exists();
    }

    /**
     * Get university ID from various sources.
     */
    protected static function getUniversityId($model = null)
    {
        // 1. From authenticated user
        if (Auth::check() && Auth::user()->university_id) {
            return Auth::user()->university_id;
        }

        // 2. From model
        if ($model && isset($model->university_id) && !empty($model->university_id)) {
            return $model->university_id;
        }

        // 3. From request
        if (request()->has('university_id')) {
            return request()->get('university_id');
        }

        // 4. Get default university
        return self::getOrCreateDefaultUniversity();
    }

    /**
     * Get or create a default university.
     */
    protected static function getOrCreateDefaultUniversity()
    {
        try {
            // Try to get an existing university
            $defaultUniversity = University::first();
            
            if ($defaultUniversity) {
                return $defaultUniversity->university_id;
            }
            
            // Create a default university if none exists
            return self::createDefaultUniversity();
            
        } catch (\Exception $e) {
            Log::error('Failed to get or create default university: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Create a default university.
     */
    protected static function createDefaultUniversity()
    {
        try {
            $university = University::create([
                'university_id' => 'DEFAULT001',
                'name' => 'Default University',
                'code' => 'DEFAULT',
                'description' => 'Automatically created default university',
                'is_active' => true,
            ]);
            
            Log::info('Created default university: ' . $university->university_id);
            return $university->university_id;
            
        } catch (\Exception $e) {
            Log::error('Failed to create default university: ' . $e->getMessage());
            return null;
        }
    }
}