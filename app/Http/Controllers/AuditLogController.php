<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Repositories\AuditLogRepository;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    protected $auditLogRepository;

    public function __construct(AuditLogRepository $auditLogRepository)
    {
        $this->auditLogRepository = $auditLogRepository;
    }

    /**
     * Display a listing of the audit logs.
     */
    public function index(Request $request)
    {
        try {
            // $auditLogs = $this->auditLogRepository->getAll();

            

            // $stats = $this->auditLogRepository->getAuditStats(Auth::user()->university_id ?? null);
            
            // $popularTables =$this->auditLogRepository->getPopularTables(Auth::user()->university_id ?? null);

            // return Inertia::render('AuditLog/AuditLog', [
            //     'logs' =>$auditLogs,
            //     'stats' =>$stats,
            //     'popularTables' => $popularTables,
            //     'filters' => $request->only(['search', 'action', 'table_name']),
            // ]);
            return Inertia::render('AuditLog/AuditLog')
            ->with([
                // Heavy logs (best if paginated)
                'logs' => Inertia::defer(fn () =>
                    $this->auditLogRepository->getAll()
                ),

                // Stats (lightweight → no defer)
                'stats' => $this->auditLogRepository->getAuditStats(
                    Auth::user()->university_id ?? null
                ),

                // Popular tables (small query → can keep immediate)
                'popularTables' => $this->auditLogRepository->getPopularTables(
                    Auth::user()->university_id ?? null
                ),

                // Filters from request
                'filters' => $request->only(['search', 'action', 'table_name']),
            ]);

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load audit logs: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for creating a new audit log.
     */
    public function create()
    {
        try {
            return Inertia::render('AuditLogs/Create', [
                'actions' => ['CREATE', 'UPDATE', 'DELETE'],
                'tables' => $this->getAvailableTables(),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load create form: ' . $e->getMessage());
        }
    }

    /**
     * Store a newly created audit log.
     */
    public function store(Request $request): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'table_name' => 'required|string|max:255',
                'record_id' => 'required|string|max:255',
                'action' => 'required|in:CREATE,UPDATE,DELETE',
                'old_values' => 'nullable|array',
                'new_values' => 'nullable|array',
                'url' => 'required|string|max:500',
                'ip_address' => 'required|ip',
                'user_agent' => 'nullable|string|max:500',
                'user_id' => 'nullable|uuid',
                'university_id' => 'nullable|uuid',
            ]);

            return $this->auditLogRepository->create($validated);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create audit log: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Display the specified audit log.
     */
    public function show(string $id)
    {
        try {
            $auditLog = $this->auditLogRepository->findById($id);
            
            if (!$auditLog) {
                throw new \Exception('Audit log not found');
            }

            return Inertia::render('AuditLogs/Show', [
                'auditLog' => $auditLog,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load audit log: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified audit log.
     */
    public function edit(string $id)
    {
        try {
            $auditLog = $this->auditLogRepository->findById($id);
            
            if (!$auditLog) {
                throw new \Exception('Audit log not found');
            }

            return Inertia::render('AuditLogs/Edit', [
                'auditLog' => $auditLog,
                'actions' => ['CREATE', 'UPDATE', 'DELETE'],
                'tables' => $this->getAvailableTables(),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load edit form: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified audit log.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'table_name' => 'required|string|max:255',
                'record_id' => 'required|string|max:255',
                'action' => 'required|in:CREATE,UPDATE,DELETE',
                'old_values' => 'nullable|array',
                'new_values' => 'nullable|array',
                'url' => 'required|string|max:500',
                'ip_address' => 'required|ip',
                'user_agent' => 'nullable|string|max:500',
                'user_id' => 'nullable|uuid',
            ]);

            return $this->auditLogRepository->update($id, $validated);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update audit log: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Remove the specified audit log.
     */
    public function destroy(string $id): RedirectResponse
    {
        try {
            return $this->auditLogRepository->delete($id);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete audit log: ' . $e->getMessage());
        }
    }

    /**
     * Search audit logs.
     */
    public function search(Request $request)
    {
        try {
            $searchTerm = $request->input('search', '');
            $auditLogs = $this->auditLogRepository->searchLogs($searchTerm, Auth::user()->university_id ?? null);

            return Inertia::render('AuditLogs/Index', [
                'auditLogs' => $auditLogs,
                'filters' => ['search' => $searchTerm],
                'stats' => $this->auditLogRepository->getAuditStats(Auth::user()->university_id ?? null),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to search audit logs: ' . $e->getMessage());
        }
    }

    /**
     * Filter audit logs by action.
     */
    public function filterByAction(Request $request, string $action)
    {
        try {
            $auditLogs = $this->auditLogRepository->getLogsByAction($action, Auth::user()->university_id ?? null);

            return Inertia::render('AuditLogs/Index', [
                'auditLogs' => $auditLogs,
                'filters' => ['action' => $action],
                'stats' => $this->auditLogRepository->getAuditStats(Auth::user()->university_id ?? null),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to filter audit logs: ' . $e->getMessage());
        }
    }

    /**
     * Filter audit logs by table.
     */
    public function filterByTable(Request $request, string $tableName)
    {
        try {
            $auditLogs = $this->auditLogRepository->findByTableAndRecord($tableName, '', Auth::user()->university_id ?? null);

            return Inertia::render('AuditLogs/Index', [
                'auditLogs' => $auditLogs,
                'filters' => ['table_name' => $tableName],
                'stats' => $this->auditLogRepository->getAuditStats(Auth::user()->university_id ?? null),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to filter audit logs: ' . $e->getMessage());
        }
    }

    /**
     * Get audit logs for a specific user.
     */
    public function userLogs(string $userId)
    {
        try {
            $auditLogs = $this->auditLogRepository->getLogsByUser($userId, Auth::user()->university_id ?? null);

            return Inertia::render('AuditLogs/Index', [
                'auditLogs' => $auditLogs,
                'filters' => ['user_id' => $userId],
                'stats' => $this->auditLogRepository->getAuditStats(Auth::user()->university_id ?? null),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load user audit logs: ' . $e->getMessage());
        }
    }

    /**
     * Get recent audit logs.
     */
    public function recent()
    {
        try {
            $auditLogs = $this->auditLogRepository->getRecentLogs(50, Auth::user()->university_id ?? null);

            return Inertia::render('AuditLogs/Index', [
                'auditLogs' => $auditLogs,
                'filters' => ['recent' => true],
                'stats' => $this->auditLogRepository->getAuditStats(Auth::user()->university_id ?? null),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load recent audit logs: ' . $e->getMessage());
        }
    }

    /**
     * Purge old audit logs.
     */
    public function purgeOldLogs(Request $request): RedirectResponse
    {
        try {
            $days = $request->input('days', 365);
            
            return $this->auditLogRepository->purgeOldLogs($days, Auth::user()->university_id ?? null);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to purge old audit logs: ' . $e->getMessage());
        }
    }

    /**
     * Export audit logs.
     */
    public function export(Request $request): RedirectResponse
    {
        try {
            // This would typically generate and download an Excel file
            // For now, we'll just return a success message
            // Implementation would depend on your export library (e.g., Maatwebsite/Laravel-Excel)
            
            return redirect()->back()->with('success', 'Audit logs export initiated successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to export audit logs: ' . $e->getMessage());
        }
    }

    /**
     * Log an action (convenience method for other controllers).
     */
    public function logAction(Request $request): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'table_name' => 'required|string|max:255',
                'record_id' => 'required|string|max:255',
                'action' => 'required|in:CREATE,UPDATE,DELETE',
                'old_values' => 'nullable|array',
                'new_values' => 'nullable|array',
                'url' => 'nullable|string|max:500',
                'ip_address' => 'nullable|ip',
                'user_agent' => 'nullable|string|max:500',
            ]);

            return $this->auditLogRepository->logAction(
                $validated['table_name'],
                $validated['record_id'],
                $validated['action'],
                $validated['old_values'] ?? null,
                $validated['new_values'] ?? null,
                $validated['url'] ?? null,
                $validated['ip_address'] ?? null,
                $validated['user_agent'] ?? null
            );
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to log action: ' . $e->getMessage());
        }
    }

    /**
     * Get available tables for dropdown.
     */
    private function getAvailableTables(): array
    {
        return [
            'users',
            'departments',
            'universities',
            'inventory_items',
            'maintenance_records',
            'categories',
            'audit_logs',
            // Add other tables as needed
        ];
    }
}