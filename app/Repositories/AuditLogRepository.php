<?php

namespace App\Repositories;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;

class AuditLogRepository
{
        
  public function getAll()
    {
        $auditLogs = AuditLog::with([
            'university:university_id,name,code',
            'user:user_id,name,email'
        ])
        ->orderBy('performed_at', 'desc')
        ->get()
        ->map(function ($auditLog) {
            return [
                'audit_id' => $auditLog->audit_id,
                'university_id' => $auditLog->university_id,
                'table_name' => $auditLog->table_name,
                'record_id' => $auditLog->record_id,
                'action' => $auditLog->action,
                'old_values' => $auditLog->old_values??null,
                'new_values' =>  $auditLog->new_values??[],
                'url' => $auditLog->url,
                'ip_address' => $auditLog->ip_address,
                'user_agent' => $auditLog->user_agent,
                'user_id' => $auditLog->user_id,
                'performed_at' => $auditLog->performed_at,
                'created_at' => $auditLog->created_at,
                'updated_at' => $auditLog->updated_at,
                'university_name' => $auditLog->university ? $auditLog->university->name : null,
                'university_code' => $auditLog->university ? $auditLog->university->code : null,
                'user_name' => $auditLog->user ? $auditLog->user->name : null,
                'user_email' => $auditLog->user ? $auditLog->user->email : null,
                'changes_count' => $this->calculateChangesCount($auditLog->old_values, $auditLog->new_values),
                'is_system_action' => is_null($auditLog->user_id),
            ];
        });  
        
        return $auditLogs;
    }



    public function findById($auditId)
    {
        return AuditLog::with(['university', 'user'])
                  ->where('audit_id', $auditId)
                  ->first();
    }

    public function findByTableAndRecord($tableName, $recordId, $universityId = null)
    {
        $query = AuditLog::with(['university', 'user'])
                  ->where('table_name', $tableName)
                  ->where('record_id', $recordId);

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        return $query->orderBy('performed_at', 'desc')->get();
    }

    public function create(array $data): RedirectResponse
    {
        try {
            return DB::transaction(function () use ($data) {
                // Generate UUID if not provided
                if (empty($data['audit_id'])) {
                    $data['audit_id'] = Str::uuid()->toString();
                }

                // Handle JSON fields
                if (isset($data['old_values']) && is_array($data['old_values'])) {
                    $data['old_values'] = json_encode($data['old_values']);
                }

                if (isset($data['new_values']) && is_array($data['new_values'])) {
                    $data['new_values'] = json_encode($data['new_values']);
                }

                // Set performed_at to current timestamp if not provided
                if (empty($data['performed_at'])) {
                    $data['performed_at'] = now();
                }

                AuditLog::create($data);

                return redirect()->back()->with('success', 'Audit log created successfully!');
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create audit log: ' . $e->getMessage())->withInput();
        }
    }

    public function update($auditId, array $data): RedirectResponse
    {
        try {
            return DB::transaction(function () use ($auditId, $data) {
                $auditLog = $this->findById($auditId);
                
                if (!$auditLog) {
                    throw new \Exception("Audit log not found");
                }

                // Handle JSON fields if provided as arrays
                if (isset($data['old_values']) && is_array($data['old_values'])) {
                    $data['old_values'] = json_encode($data['old_values']);
                }

                if (isset($data['new_values']) && is_array($data['new_values'])) {
                    $data['new_values'] = json_encode($data['new_values']);
                }

                $auditLog->update($data);

                return redirect()->back()->with('success', 'Audit log updated successfully!');
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update audit log: ' . $e->getMessage())->withInput();
        }
    }

    public function getRecentLogs($limit = 50, $universityId = null)
    {
        $query = AuditLog::with(['university', 'user'])
                  ->orderBy('performed_at', 'desc')
                  ->limit($limit);

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        return $query->get();
    }

    public function getLogsByAction($action, $universityId = null)
    {
        $query = AuditLog::with(['university', 'user'])
                  ->where('action', $action);

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        return $query->orderBy('performed_at', 'desc')->get();
    }

    public function getLogsByUser($userId, $universityId = null)
    {
        $query = AuditLog::with(['university', 'user'])
                  ->where('user_id', $userId);

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        return $query->orderBy('performed_at', 'desc')->get();
    }

    public function getLogsByDateRange($startDate, $endDate, $universityId = null)
    {
        $query = AuditLog::with(['university', 'user'])
                  ->whereBetween('performed_at', [$startDate, $endDate]);

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        return $query->orderBy('performed_at', 'desc')->get();
    }

    public function logAction($tableName, $recordId, $action, $oldValues = null, $newValues = null, $url = null, $ipAddress = null, $userAgent = null, $userId = null, $universityId = null): RedirectResponse
    {
        try {
            return DB::transaction(function () use ($tableName, $recordId, $action, $oldValues, $newValues, $url, $ipAddress, $userAgent, $userId, $universityId) {
                
                $data = [
                    'table_name' => $tableName,
                    'record_id' => $recordId,
                    'action' => $action,
                    'old_values' => $oldValues,
                    'new_values' => $newValues,
                    'url' => $url ?? request()->fullUrl(),
                    'ip_address' => $ipAddress ?? request()->ip(),
                    'user_agent' => $userAgent ?? request()->userAgent(),
                    'user_id' => $userId ?? Auth::user()->user_id ?? null,
                    'university_id' => $universityId ?? Auth::user()->university_id ?? null,
                    'performed_at' => now(),
                ];

                return $this->create($data);
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to log action: ' . $e->getMessage());
        }
    }

    public function getAuditStats($universityId = null)
    {
        $query = AuditLog::query();

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        $totalLogs = $query->count();
        $createActions = $query->where('action', 'CREATE')->count();
        $updateActions = $query->where('action', 'UPDATE')->count();
        $deleteActions = $query->where('action', 'DELETE')->count();
        $todayLogs = $query->whereDate('performed_at', today())->count();

        return [
            'total_logs' => $totalLogs,
            'create_actions' => $createActions,
            'update_actions' => $updateActions,
            'delete_actions' => $deleteActions,
            'today_logs' => $todayLogs,
            'system_actions' => $query->whereNull('user_id')->count(),
            'user_actions' => $query->whereNotNull('user_id')->count(),
        ];
    }

    ////////////////////

/**
 * Calculate the number of changes between old and new values
 */
private function calculateChangesCount($oldValues, $newValues): int
{
    $oldArray = $this->safeJsonDecode($oldValues);
    $newArray = $this->safeJsonDecode($newValues);

    if (empty($oldArray) && empty($newArray)) {
        return 0;
    }

    if (empty($oldArray)) {
        return count($newArray);
    }

    if (empty($newArray)) {
        return count($oldArray);
    }

    if (!is_array($oldArray) || !is_array($newArray)) {
        return $oldArray !== $newArray ? 1 : 0;
    }

    return $this->countArrayDifferences($oldArray, $newArray);
}

/**
 * Recursively count differences between two arrays
 */
private function countArrayDifferences(array $old, array $new): int
{
    $count = 0;

    // Check keys in new array
    foreach ($new as $key => $value) {
        if (!array_key_exists($key, $old)) {
            $count++;
        } elseif (is_array($value) && is_array($old[$key])) {
            $count += $this->countArrayDifferences($old[$key], $value);
        } elseif ($value !== $old[$key]) {
            $count++;
        }
    }

    // Check keys removed from old array
    foreach ($old as $key => $value) {
        if (!array_key_exists($key, $new)) {
            $count++;
        }
    }

    return $count;
}

// private function calculateChangesCount($oldValues, $newValues): int
// {
//     // Safely decode JSON values, ensuring we always get arrays
//     $oldArray = $this->safeJsonDecode($oldValues);
//     $newArray = $this->safeJsonDecode($newValues);

//     if (empty($oldArray) && empty($newArray)) {
//         return 0;
//     }

//     if (empty($oldArray)) {
//         return count($newArray);
//     }

//     if (empty($newArray)) {
//         return count($oldArray);
//     }

//     // Ensure both are arrays before using array functions
//     if (!is_array($oldArray) || !is_array($newArray)) {
//         // If either is not an array, compare as simple values
//         return $oldArray !== $newArray ? 1 : 0;
//     }

//     return count(array_diff_assoc($newArray, $oldArray)) + count(array_diff_assoc($oldArray, $newArray));
// }

/**
 * Safely decode JSON values, always returning an array
 */
private function safeJsonDecode($value): array
{
    if (is_null($value) || $value === '') {
        return [];
    }

    // If it's already an array, return it
    if (is_array($value)) {
        return $value;
    }

    // If it's a string, try to decode it
    if (is_string($value)) {
        $decoded = json_decode($value, true);
        
        // If decoding failed or returned null, return empty array
        if (json_last_error() !== JSON_ERROR_NONE || is_null($decoded)) {
            return [];
        }
        
        // If decoded value is not an array, wrap it in an array
        if (!is_array($decoded)) {
            return [$decoded];
        }
        
        return $decoded;
    }

    // For any other type (int, float, bool, etc.), wrap in array
    return [$value];
}
    ////////////////////
    public function getPopularTables($universityId = null, $limit = 10)
    {
        $query = AuditLog::query();

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        return $query->select('table_name', DB::raw('COUNT(*) as log_count'))
                  ->groupBy('table_name')
                  ->orderBy('log_count', 'desc')
                  ->limit($limit)
                  ->get();
    }

    public function getActivityTimeline($universityId = null, $days = 30)
    {
        $query = AuditLog::query();

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        return $query->where('performed_at', '>=', now()->subDays($days))
                  ->select(DB::raw('DATE(performed_at) as date'), DB::raw('COUNT(*) as count'))
                  ->groupBy('date')
                  ->orderBy('date', 'desc')
                  ->get();
    }

    public function searchLogs($searchTerm, $universityId = null)
    {
        $query = AuditLog::with(['university', 'user']);

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        return $query->where(function ($q) use ($searchTerm) {
                    $q->where('table_name', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('record_id', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('action', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('url', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('ip_address', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('user_agent', 'LIKE', "%{$searchTerm}%")
                      ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                          $userQuery->where('name', 'LIKE', "%{$searchTerm}%")
                                   ->orWhere('email', 'LIKE', "%{$searchTerm}%");
                      });
                })
                ->orderBy('performed_at', 'desc')
                ->get();
    }

     public function delete($auditId): RedirectResponse
    {
        try {
            return DB::transaction(function () use ($auditId) {
                $auditLog = $this->findById($auditId);
                
                if (!$auditLog) {
                    throw new \Exception("Audit log not found");
                }

                // Since we don't have soft deletes, we'll permanently delete
                $auditLog->delete();

                return redirect()->back()->with('success', 'Audit log deleted successfully!');
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete audit log: ' . $e->getMessage());
        }
    }


   public function purgeOldLogs($days = 365, $universityId = null): RedirectResponse
    {
        try {
            return DB::transaction(function () use ($days, $universityId) {
                $query = AuditLog::where('performed_at', '<', now()->subDays($days));

                if ($universityId) {
                    $query->where('university_id', $universityId);
                }

                $deletedCount = $query->count();
                $query->delete(); // Permanent delete since no soft deletes

                return redirect()->back()->with('success', "Successfully purged {$deletedCount} audit logs older than {$days} days!");
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to purge old audit logs: ' . $e->getMessage());
        }
    }
  
}