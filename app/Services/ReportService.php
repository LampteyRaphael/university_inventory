<?php

namespace App\Services;

use App\Models\InventoryTransaction;
use App\Models\StockLevel;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\MaintenanceRecord;
use App\Models\University;
use App\Models\InventoryItem;
use App\Models\Department;
use App\Models\Location;
use App\Models\AuditLog;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

class ReportService
{
    /**
     * Generate comprehensive inventory report - COMPLETE VERSION
     */
    public function generateInventoryReport(array $params): array
    {
        $query = $this->buildBaseQuery($params);
        
        return [
            'summary' => $this->getSummaryMetrics($query, $params),
            'trends' => $this->getTrendData($query, $params),
            'critical_items' => $this->getCriticalItems($params),
            'recent_activities' => $this->getRecentActivities($query, $params),
            'category_breakdown' => $this->getCategoryBreakdown($query, $params),
            'department_analysis' => $this->getDepartmentAnalysis($query, $params),
            'transaction_analysis' => $this->getTransactionAnalysis($query, $params),
            'stock_level_summary' => $this->getStockLevelSummary($params),
            'purchase_analysis' => $this->getPurchaseAnalysis($params),
            'maintenance_analysis' => $this->getMaintenanceAnalysis($params),
        ];
    }

    /**
     * Generate stock level report
     */
    public function generateStockLevelReport(array $params): array
    {
        $stockQuery = StockLevel::with([
            'item.category', 
            'department', 
            'location'
        ]);

        if (Auth::check() && Auth::user()->university_id) {
            $stockQuery->where('university_id', Auth::user()->university_id);
        }

        if (!empty($params['departments'])) {
            $stockQuery->whereIn('department_id', $params['departments']);
        }

        if (!empty($params['item_categories'])) {
            $stockQuery->whereHas('item.category', function($q) use ($params) {
                $q->whereIn('category_id', $params['item_categories']);
            });
        }

        $stockLevels = $stockQuery->get()
            ->map(function ($stock) {
                $status = $this->getStockStatusBasedOnLevels($stock);
                
                return [
                    'item_id' => $stock->item_id,
                    'item_name' => $stock->item->name ?? 'Unknown',
                    'category' => $stock->item->category->name ?? 'Uncategorized',
                    'department' => $stock->department->name ?? 'N/A',
                    'location' => $stock->location->name ?? 'Main Storage',
                    'current_quantity' => $stock->current_quantity,
                    'available_quantity' => $stock->available_quantity,
                    'committed_quantity' => $stock->committed_quantity,
                    'on_order_quantity' => $stock->on_order_quantity,
                    'reorder_level' => (float) $stock->reorder_level,
                    'max_level' => (float) $stock->max_level,
                    'safety_stock' => (float) $stock->safety_stock,
                    'average_cost' => (float) $stock->average_cost,
                    'total_value' => (float) $stock->total_value,
                    'status' => $status,
                    'needs_reorder' => $stock->available_quantity <= $stock->reorder_level,
                    'service_level' => (float) $stock->service_level,
                ];
            });

        return [
            'stock_levels' => $stockLevels,
            'summary' => [
                'total_items' => $stockLevels->count(),
                'total_current_quantity' => $stockLevels->sum('current_quantity'),
                'total_available_quantity' => $stockLevels->sum('available_quantity'),
                'total_committed_quantity' => $stockLevels->sum('committed_quantity'),
                'total_on_order_quantity' => $stockLevels->sum('on_order_quantity'),
                'total_inventory_value' => $stockLevels->sum('total_value'),
                'items_need_reorder' => $stockLevels->where('needs_reorder', true)->count(),
                'out_of_stock_items' => $stockLevels->where('available_quantity', '<=', 0)->count(),
                'low_stock_items' => $stockLevels->where('status', 'low_stock')->count(),
            ]
        ];
    }

    /**
     * Generate acquisition report
     */
    public function generateAcquisitionReport(array $params): array
    {
        $query = $this->buildBaseQuery($params)
            ->where('transaction_type', 'purchase')
            ->with(['item.category', 'department', 'performedBy']);

        $acquisitions = $query->get();

        return [
            'summary' => $this->getAcquisitionSummary($acquisitions),
            'acquisitions' => $this->formatAcquisitionData($acquisitions),
            'trends' => $this->getAcquisitionTrends($query, $params),
            'supplier_analysis' => $this->getSupplierAnalysis($query),
            'category_breakdown' => $this->getAcquisitionCategoryBreakdown($acquisitions),
        ];
    }

    /**
     * Generate depreciation report
     */
    public function generateDepreciationReport(array $params): array
    {
        $query = StockLevel::with(['item', 'item.category', 'department'])
            ->where('total_value', '>', 500)
            ->where('current_quantity', '>', 0)
            ->orderBy('total_value', 'desc');

        if (Auth::check() && Auth::user()->university_id) {
            $query->where('university_id', Auth::user()->university_id);
        }

        $highValueItems = $query->get();

        return [
            'summary' => $this->getDepreciationSummary($highValueItems),
            'depreciating_assets' => $this->getDepreciatingAssets($highValueItems),
            'age_analysis' => $this->getAgeAnalysis($highValueItems),
            'category_depreciation' => $this->getCategoryDepreciation($highValueItems),
        ];
    }

    /**
     * Generate audit trail report
     */
    public function generateAuditReport(array $params): array
    {
        $query = $this->buildAuditBaseQuery($params);
        $auditLogs = $query->orderBy('performed_at', 'desc')->get();

        return [
            'summary' => $this->getAuditSummary($auditLogs),
            'audit_trail' => $this->formatAuditData($auditLogs),
            'user_activity' => $this->getUserActivity($auditLogs),
            'action_analysis' => $this->getActionAnalysis($auditLogs),
        ];
    }

    /**
     * Generate procurement performance report
     */
    public function generateProcurementReport(array $params): array
    {
        $purchaseOrders = PurchaseOrder::with(['supplier', 'department', 'items.item'])
            ->where('university_id', Auth::user()->university_id)
            ->when(!empty($params['date_range']) || !empty($params['custom_start_date']), function ($query) use ($params) {
                $dateRange = $this->getDateRange($params);
                $query->whereBetween('order_date', [
                    $dateRange['start']->format('Y-m-d'),
                    $dateRange['end']->format('Y-m-d')
                ]);
            })
            ->get();

        $leadTimeAnalysis = $purchaseOrders->where('actual_delivery_date', '!=', null)
            ->map(function ($order) {
                $leadTime = $order->order_date->diffInDays($order->actual_delivery_date);
                return [
                    'po_number' => $order->po_number,
                    'supplier' => $order->supplier->name,
                    'order_date' => $order->order_date->format('Y-m-d'),
                    'delivery_date' => $order->actual_delivery_date->format('Y-m-d'),
                    'lead_time_days' => $leadTime,
                    'status' => $order->status,
                    'total_amount' => (float) $order->total_amount,
                ];
            });

        return [
            'procurement_summary' => [
                'total_orders' => $purchaseOrders->count(),
                'total_value' => (float) $purchaseOrders->sum('total_amount'),
                'average_order_value' => (float) $purchaseOrders->avg('total_amount'),
                'average_lead_time_days' => $leadTimeAnalysis->avg('lead_time_days'),
                'on_time_delivery_rate' => $this->calculateOnTimeDeliveryRate($purchaseOrders),
            ],
            'supplier_performance' => $this->getSupplierPerformanceMetrics($purchaseOrders),
            'lead_time_analysis' => $leadTimeAnalysis->sortBy('lead_time_days')->values()->toArray(),
            'category_spend' => $this->getCategorySpendAnalysis($purchaseOrders),
        ];
    }

    /**
     * Generate maintenance performance report
     */
    public function generateMaintenanceReport(array $params): array
    {
        $query = MaintenanceRecord::with(['item', 'department', 'item.category'])
            ->where('university_id', Auth::user()->university_id);

        if (!empty($params['date_range']) || !empty($params['custom_start_date'])) {
            $dateRange = $this->getDateRange($params);
            $query->whereBetween('scheduled_date', [
                $dateRange['start']->format('Y-m-d'),
                $dateRange['end']->format('Y-m-d')
            ]);
        }

        $maintenanceRecords = $query->get();

        return [
            'maintenance_summary' => $this->getMaintenanceSummary($maintenanceRecords),
            'cost_analysis' => $this->getMaintenanceCostAnalysis($maintenanceRecords),
            'downtime_analysis' => $this->getDowntimeAnalysis($maintenanceRecords),
            'preventive_maintenance_effectiveness' => $this->getPreventiveMaintenanceEffectiveness($maintenanceRecords),
            'equipment_reliability' => $this->getEquipmentReliabilityMetrics($maintenanceRecords),
        ];
    }

    // ==================== CORE METHODS ====================

    /**
     * Build base query with filters for inventory transactions
     */
    private function buildBaseQuery(array $params)
    {
        $query = InventoryTransaction::with([
            'item.category',
            'department',
            'sourceLocation',
            'destinationLocation',
            'performedBy',
            'approvedBy'
        ]);

        if (!empty($params['date_range']) || !empty($params['custom_start_date'])) {
            $dateRange = $this->getDateRange($params);
            $query->whereBetween('inventory_transactions.transaction_date', [
                $dateRange['start']->format('Y-m-d H:i:s'),
                $dateRange['end']->format('Y-m-d H:i:s')
            ]);
        }

        if (!empty($params['item_categories'])) {
            $query->whereHas('item.category', function ($q) use ($params) {
                $q->whereIn('item_categories.category_id', (array)$params['item_categories']);
            });
        }

        if (!empty($params['departments'])) {
            $query->whereIn('inventory_transactions.department_id', (array)$params['departments']);
        }

        if (!empty($params['locations'])) {
            $query->where(function ($q) use ($params) {
                $q->whereIn('inventory_transactions.source_location_id', (array)$params['locations'])
                  ->orWhereIn('inventory_transactions.destination_location_id', (array)$params['locations']);
            });
        }

        if (Auth::check() && Auth::user()->university_id) {
            $query->where('inventory_transactions.university_id', Auth::user()->university_id);
        }

        return $query;
    }

    /**
     * Build base query for audit logs
     */
    private function buildAuditBaseQuery(array $params)
    {
        $query = AuditLog::with(['user', 'university'])
            ->where('table_name', 'inventory_transactions');

        if (!empty($params['date_range']) || !empty($params['custom_start_date'])) {
            $dateRange = $this->getDateRange($params);
            $query->whereBetween('performed_at', [$dateRange['start'], $dateRange['end']]);
        }

        if (Auth::check() && Auth::user()->university_id) {
            $query->where('university_id', Auth::user()->university_id);
        }

        return $query;
    }

    /**
     * Get date range based on parameters
     */
    private function getDateRange(array $params): array
    {
        if (!empty($params['custom_start_date']) && !empty($params['custom_end_date'])) {
            return [
                'start' => Carbon::parse($params['custom_start_date'])->startOfDay(),
                'end' => Carbon::parse($params['custom_end_date'])->endOfDay()
            ];
        }

        $dateRange = $params['date_range'] ?? 'last30days';
        
        return match($dateRange) {
            'last7days' => [
                'start' => now()->subDays(7)->startOfDay(),
                'end' => now()->endOfDay()
            ],
            'last90days' => [
                'start' => now()->subDays(90)->startOfDay(),
                'end' => now()->endOfDay()
            ],
            'currentMonth' => [
                'start' => now()->startOfMonth(),
                'end' => now()->endOfDay()
            ],
            'currentQuarter' => [
                'start' => now()->startOfQuarter(),
                'end' => now()->endOfDay()
            ],
            'currentYear' => [
                'start' => now()->startOfYear(),
                'end' => now()->endOfDay()
            ],
            default => [
                'start' => now()->subDays(30)->startOfDay(),
                'end' => now()->endOfDay()
            ],
        };
    }

    // ==================== INVENTORY REPORT METHODS ====================

    /**
     * Get summary metrics for the report
     */
    private function getSummaryMetrics($query, array $params): array
    {
        $baseQuery = clone $query;
        
        $totalTransactions = $baseQuery->count();
        $totalValue = $baseQuery->sum('inventory_transactions.total_value');
        
        $incomingStock = $baseQuery->clone()
            ->whereIn('inventory_transactions.transaction_type', [
                'purchase', 'return', 'production', 'donation'
            ])->sum('inventory_transactions.quantity');
            
        $outgoingStock = $baseQuery->clone()
            ->whereIn('inventory_transactions.transaction_type', [
                'sale', 'consumption', 'write_off'
            ])->sum('inventory_transactions.quantity');

        $transactionCounts = $baseQuery->clone()
            ->select('transaction_type', DB::raw('COUNT(*) as count'))
            ->groupBy('transaction_type')
            ->pluck('count', 'transaction_type')
            ->toArray();

        return [
            'total_transactions' => $totalTransactions,
            'total_value' => (float) $totalValue,
            'incoming_stock' => (int) $incomingStock,
            'outgoing_stock' => (int) $outgoingStock,
            'net_stock_movement' => (int) ($incomingStock - $outgoingStock),
            'purchase_count' => $transactionCounts['purchase'] ?? 0,
            'sale_count' => $transactionCounts['sale'] ?? 0,
            'transfer_count' => $transactionCounts['transfer'] ?? 0,
            'adjustment_count' => $transactionCounts['adjustment'] ?? 0,
            'consumption_count' => $transactionCounts['consumption'] ?? 0,
            'return_count' => $transactionCounts['return'] ?? 0,
            'average_transaction_value' => $totalTransactions > 0 ? (float) ($totalValue / $totalTransactions) : 0,
        ];
    }

    /**
     * Get trend data for charts
     */
    private function getTrendData($query, array $params): array
    {
        $trendQuery = clone $query;
        
        // Monthly trends - FIXED: Use proper grouping and ordering
        $monthlyTrends = $trendQuery
            ->select(
                DB::raw("DATE_FORMAT(inventory_transactions.transaction_date, '%Y-%m') as month"),
                DB::raw('COUNT(*) as transaction_count'),
                DB::raw('SUM(inventory_transactions.quantity) as total_quantity'),
                DB::raw('SUM(inventory_transactions.total_value) as total_value'),
                DB::raw('AVG(inventory_transactions.unit_cost) as avg_unit_cost')
            )
            ->groupBy(DB::raw("DATE_FORMAT(inventory_transactions.transaction_date, '%Y-%m')"))
            ->orderBy(DB::raw("DATE_FORMAT(inventory_transactions.transaction_date, '%Y-%m')")) // Order by the same expression
            // ->limit(12)
            ->get()
            ->map(function ($item) {
                return [
                    'month' => $item->month,
                    'transactions' => $item->transaction_count,
                    'quantity' => (int) $item->total_quantity,
                    'value' => (float) $item->total_value,
                    'avg_unit_cost' => (float) $item->avg_unit_cost,
                ];
            });

        // Category distribution - FIXED: Remove invalid grouping
        $categoryDistribution = $trendQuery->clone()
            ->join('inventory_items', 'inventory_transactions.item_id', '=', 'inventory_items.item_id')
            ->join('item_categories', 'inventory_items.category_id', '=', 'item_categories.category_id')
            ->select(
                'item_categories.name as category_name',
                DB::raw('COUNT(*) as transaction_count'),
                DB::raw('SUM(inventory_transactions.total_value) as total_value'),
                DB::raw('SUM(inventory_transactions.quantity) as total_quantity')
            )
            ->groupBy('item_categories.category_id', 'item_categories.name') // Only group by category
            ->orderBy('total_value', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->category_name,
                    'value' => (float) $item->total_value,
                    'count' => $item->transaction_count,
                    'quantity' => (int) $item->total_quantity,
                ];
            });

        return [
            'monthly_trends' => $monthlyTrends,
            'category_distribution' => $categoryDistribution,
        ];
    }
    /**
     * Get critical stock items
     */
    private function getCriticalItems(array $params): array
    {
        $query = StockLevel::with(['item', 'department', 'item.category'])
            ->where(function($q) {
                $q->whereColumn('available_quantity', '<=', 'reorder_level')
                  ->orWhere('available_quantity', '<=', 0)
                  ->orWhere(function($q2) {
                      $q2->where('total_value', '>', 1000)
                         ->where('available_quantity', '<', 10);
                  });
            })
            ->orderBy('available_quantity')
            ->orderBy('total_value', 'desc');
            // ->limit(15);

        if (Auth::check() && Auth::user()->university_id) {
            $query->where('university_id', Auth::user()->university_id);
        }

        return $query->get()
            ->map(function ($stock) {
                return [
                    'id' => $stock->stock_id,
                    'item_code' => $stock->item->item_code ?? 'N/A',
                    'name' => $stock->item->name ?? 'Unknown Item',
                    'category' => $stock->item->category->name ?? 'Uncategorized',
                    'department' => $stock->department->name ?? 'N/A',
                    'current_quantity' => $stock->current_quantity,
                    'available_quantity' => $stock->available_quantity,
                    'reorder_level' => (float) $stock->reorder_level,
                    'safety_stock' => (float) $stock->safety_stock,
                    'average_cost' => (float) $stock->average_cost,
                    'total_value' => (float) $stock->total_value,
                    'status' => $this->getStockStatusBasedOnLevels($stock),
                    'needs_attention' => $stock->available_quantity <= $stock->reorder_level,
                    'last_updated' => $stock->last_updated->format('Y-m-d H:i'),
                ];
            })->toArray();
    }

    /**
     * Get recent activities
     */
    private function getRecentActivities($query, array $params): array
    {
        $activities = clone $query;
        
        return $activities
            ->with(['performedBy', 'item'])
            ->orderBy('inventory_transactions.transaction_date', 'desc')
            // ->limit(20)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->transaction_id,
                    'date' => $transaction->transaction_date->format('Y-m-d H:i'),
                    'action' => ucfirst($transaction->transaction_type),
                    'item' => $transaction->item->name ?? 'Unknown Item',
                    'user' => $transaction->performedBy->name ?? 'System',
                    'details' => $this->getActivityDetails($transaction),
                    'quantity' => $transaction->quantity,
                    'value' => (float) $transaction->total_value,
                ];
            })->toArray();
    }

    /**
     * Get category breakdown
     */
    private function getCategoryBreakdown($query, array $params): array
    {
        $breakdown = clone $query;
        
        return $breakdown
            ->join('inventory_items', 'inventory_transactions.item_id', '=', 'inventory_items.item_id')
            ->join('item_categories', 'inventory_items.category_id', '=', 'item_categories.category_id')
            ->select(
                'item_categories.name as category_name',
                DB::raw('COUNT(*) as transaction_count'),
                DB::raw('SUM(inventory_transactions.quantity) as total_quantity'),
                DB::raw('SUM(inventory_transactions.total_value) as total_value'),
                DB::raw('AVG(inventory_transactions.unit_cost) as avg_unit_cost')
            )
            ->groupBy('item_categories.category_id', 'item_categories.name')
            ->orderBy('total_value', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'category' => $item->category_name,
                    'transactions' => $item->transaction_count,
                    'quantity' => (int) $item->total_quantity,
                    'total_value' => (float) $item->total_value,
                    'avg_unit_cost' => (float) $item->avg_unit_cost,
                ];
            })->toArray();
    }

    /**
     * Get department analysis
     */
    private function getDepartmentAnalysis($query, array $params): array
    {
        $analysis = clone $query;
        
        return $analysis
            ->join('departments', 'inventory_transactions.department_id', '=', 'departments.department_id')
            ->select(
                'departments.name as department_name',
                DB::raw('COUNT(*) as transaction_count'),
                DB::raw('SUM(inventory_transactions.total_value) as total_value'),
                DB::raw('SUM(inventory_transactions.quantity) as total_quantity'),
                DB::raw('AVG(inventory_transactions.total_value) as avg_transaction_value')
            )
            ->groupBy('departments.department_id', 'departments.name')
            ->orderBy('total_value', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'department' => $item->department_name,
                    'transactions' => $item->transaction_count,
                    'total_value' => (float) $item->total_value,
                    'total_quantity' => (int) $item->total_quantity,
                    'avg_transaction_value' => (float) $item->avg_transaction_value,
                ];
            })->toArray();
    }

    /**
     * Get transaction type analysis
     */
    private function getTransactionAnalysis($query, array $params): array
    {
        $analysis = clone $query;
        
        return $analysis
            ->select(
                'inventory_transactions.transaction_type',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(inventory_transactions.quantity) as total_quantity'),
                DB::raw('SUM(inventory_transactions.total_value) as total_value'),
                DB::raw('AVG(inventory_transactions.unit_cost) as avg_unit_cost'),
                DB::raw('AVG(inventory_transactions.total_value) as avg_transaction_value')
            )
            ->groupBy('inventory_transactions.transaction_type')
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->transaction_type,
                    'label' => ucfirst($item->transaction_type),
                    'count' => $item->count,
                    'total_quantity' => (int) $item->total_quantity,
                    'total_value' => (float) $item->total_value,
                    'avg_unit_cost' => (float) $item->avg_unit_cost,
                    'avg_transaction_value' => (float) $item->avg_transaction_value,
                ];
            })->toArray();
    }

    /**
     * Get stock level summary
     */
    private function getStockLevelSummary(array $params): array
    {
        $query = StockLevel::query();

        if (Auth::check() && Auth::user()->university_id) {
            $query->where('university_id', Auth::user()->university_id);
        }

        $totalValue = $query->sum('total_value');
        $totalItems = $query->count();
        
        $statusBreakdown = $query->get()
            ->groupBy(function($stock) {
                return $this->getStockStatusBasedOnLevels($stock);
            })
            ->map->count();

        return [
            'total_inventory_value' => (float) $totalValue,
            'total_items_tracked' => $totalItems,
            'status_breakdown' => $statusBreakdown,
            'average_item_value' => $totalItems > 0 ? (float) ($totalValue / $totalItems) : 0,
        ];
    }

    // ==================== ACQUISITION REPORT METHODS ====================

    /**
     * Get acquisition summary metrics
     */
    private function getAcquisitionSummary(Collection $acquisitions): array
    {
        $totalValue = $acquisitions->sum('total_value');
        $totalQuantity = $acquisitions->sum('quantity');
        $averageCost = $totalQuantity > 0 ? $totalValue / $totalQuantity : 0;

        return [
            'total_acquisitions' => $acquisitions->count(),
            'total_quantity' => $totalQuantity,
            'total_value' => (float) $totalValue,
            'average_unit_cost' => (float) $averageCost,
            'highest_value_acquisition' => $acquisitions->max('total_value'),
            'lowest_value_acquisition' => $acquisitions->where('total_value', '>', 0)->min('total_value') ?? 0,
            'average_acquisition_value' => $acquisitions->avg('total_value'),
        ];
    }

    /**
     * Format acquisition data for display
     */
    private function formatAcquisitionData(Collection $acquisitions): array
    {
        return $acquisitions->map(function ($acquisition) {
            return [
                'id' => $acquisition->transaction_id,
                'item_name' => $acquisition->item->name ?? 'Unknown Item',
                'category' => $acquisition->item->category->name ?? 'Uncategorized',
                'department' => $acquisition->department->name ?? 'N/A',
                'quantity' => $acquisition->quantity,
                'unit_cost' => (float) $acquisition->unit_cost,
                'total_value' => (float) $acquisition->total_value,
                'transaction_date' => $acquisition->transaction_date->format('Y-m-d'),
                'reference_number' => $acquisition->reference_number,
                'performed_by' => $acquisition->performedBy->name ?? 'System',
                'status' => $acquisition->status,
            ];
        })->toArray();
    }

    /**
     * Get acquisition trends over time
     */
    /**
     * Get acquisition trends over time - FIXED VERSION
     */
    private function getAcquisitionTrends($query, array $params): array
    {
        $monthlyTrends = $query->clone()
            ->select(
                DB::raw("DATE_FORMAT(inventory_transactions.transaction_date, '%Y-%m') as month"),
                DB::raw('COUNT(*) as acquisition_count'),
                DB::raw('SUM(inventory_transactions.quantity) as total_quantity'),
                DB::raw('SUM(inventory_transactions.total_value) as total_value'),
                DB::raw('AVG(inventory_transactions.unit_cost) as avg_unit_cost')
            )
            ->groupBy(DB::raw("DATE_FORMAT(inventory_transactions.transaction_date, '%Y-%m')"))
            ->orderBy(DB::raw("DATE_FORMAT(inventory_transactions.transaction_date, '%Y-%m')")) // Fixed ordering
            // ->limit(12)
            ->get();

        return [
            'monthly_trends' => $monthlyTrends,
            'quarterly_analysis' => $this->getQuarterlyAnalysis($query),
            'year_over_year' => $this->getYearOverYearAnalysis($query),
        ];
    }

    /**
     * Get supplier analysis
     */
    private function getSupplierAnalysis($query): array
    {
        return $query->clone()
            ->select(
                'inventory_transactions.reference_number',
                DB::raw('COUNT(*) as transaction_count'),
                DB::raw('SUM(inventory_transactions.quantity) as total_quantity'),
                DB::raw('SUM(inventory_transactions.total_value) as total_value'),
                DB::raw('AVG(inventory_transactions.unit_cost) as avg_unit_cost')
            )
            ->whereNotNull('inventory_transactions.reference_number')
            ->groupBy('inventory_transactions.reference_number')
            ->orderBy('total_value', 'desc')
            // ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'supplier' => $item->reference_number,
                    'transactions' => $item->transaction_count,
                    'total_quantity' => (int) $item->total_quantity,
                    'total_value' => (float) $item->total_value,
                    'avg_unit_cost' => (float) $item->avg_unit_cost,
                ];
            })->toArray();
    }

    /**
     * Get acquisition category breakdown
     */
    private function getAcquisitionCategoryBreakdown(Collection $acquisitions): array
    {
        $breakdown = $acquisitions->groupBy('item.category.name')
            ->map(function ($categoryAcquisitions, $categoryName) use ($acquisitions) {
                $totalValue = $categoryAcquisitions->sum('total_value');
                $totalQuantity = $categoryAcquisitions->sum('quantity');
                
                return [
                    'category' => $categoryName ?: 'Uncategorized',
                    'acquisition_count' => $categoryAcquisitions->count(),
                    'total_quantity' => $totalQuantity,
                    'total_value' => (float) $totalValue,
                    'percentage_of_total' => $acquisitions->sum('total_value') > 0 ? 
                        round(($totalValue / $acquisitions->sum('total_value')) * 100, 2) : 0,
                ];
            })
            ->sortByDesc('total_value')
            ->values()
            ->toArray();

        return $breakdown;
    }

    // ==================== DEPRECIATION REPORT METHODS ====================

    /**
     * Get depreciation summary
     */
    private function getDepreciationSummary(Collection $highValueItems): array
    {
        $totalOriginalValue = $highValueItems->sum('total_value');
        
        $totalCurrentValue = $highValueItems->sum(function ($stock) {
            return $this->calculateCurrentValue($stock);
        });

        $totalDepreciation = $totalOriginalValue - $totalCurrentValue;

        return [
            'total_assets' => $highValueItems->count(),
            'total_original_value' => (float) $totalOriginalValue,
            'total_current_value' => (float) $totalCurrentValue,
            'total_depreciation' => (float) $totalDepreciation,
            'average_depreciation_rate' => $totalOriginalValue > 0 ? 
                round(($totalDepreciation / $totalOriginalValue) * 100, 2) : 0,
            'average_asset_age_months' => round($highValueItems->avg(function ($stock) {
                return $stock->last_updated->diffInMonths(now());
            })),
        ];
    }

    /**
     * Get depreciating assets list
     */
    private function getDepreciatingAssets(Collection $highValueItems): array
    {
        return $highValueItems->map(function ($stock) {
            $ageInMonths = $stock->last_updated->diffInMonths(now());
            $depreciationRate = $this->getDepreciationRate($stock->item->category->name ?? 'General');
            $monthlyDepreciation = $stock->total_value * ($depreciationRate / 12);
            $accumulatedDepreciation = $monthlyDepreciation * $ageInMonths;
            $currentValue = max(0, $stock->total_value - $accumulatedDepreciation);

            return [
                'id' => $stock->stock_id,
                'item_name' => $stock->item->name ?? 'Unknown Asset',
                'category' => $stock->item->category->name ?? 'Uncategorized',
                'department' => $stock->department->name ?? 'N/A',
                'acquisition_date' => $stock->last_updated->format('Y-m-d'),
                'age_months' => $ageInMonths,
                'original_value' => (float) $stock->total_value,
                'accumulated_depreciation' => (float) $accumulatedDepreciation,
                'current_value' => (float) $currentValue,
                'depreciation_rate' => $depreciationRate * 100,
                'remaining_life_months' => max(0, (60 - $ageInMonths)),
            ];
        })->toArray();
    }

    /**
     * Get age analysis of assets
     */
    private function getAgeAnalysis(Collection $highValueItems): array
    {
        $ageGroups = [
            '0-6 months' => ['count' => 0, 'value' => 0],
            '6-12 months' => ['count' => 0, 'value' => 0],
            '1-2 years' => ['count' => 0, 'value' => 0],
            '2-5 years' => ['count' => 0, 'value' => 0],
            '5+ years' => ['count' => 0, 'value' => 0],
        ];

        foreach ($highValueItems as $item) {
            $ageInMonths = $item->last_updated->diffInMonths(now());
            $currentValue = $this->calculateCurrentValue($item);
            
            if ($ageInMonths <= 6) {
                $ageGroups['0-6 months']['count']++;
                $ageGroups['0-6 months']['value'] += $currentValue;
            } elseif ($ageInMonths <= 12) {
                $ageGroups['6-12 months']['count']++;
                $ageGroups['6-12 months']['value'] += $currentValue;
            } elseif ($ageInMonths <= 24) {
                $ageGroups['1-2 years']['count']++;
                $ageGroups['1-2 years']['value'] += $currentValue;
            } elseif ($ageInMonths <= 60) {
                $ageGroups['2-5 years']['count']++;
                $ageGroups['2-5 years']['value'] += $currentValue;
            } else {
                $ageGroups['5+ years']['count']++;
                $ageGroups['5+ years']['value'] += $currentValue;
            }
        }

        return [
            'age_groups' => $ageGroups,
            'oldest_asset_months' => $highValueItems->max(function ($item) {
                return $item->last_updated->diffInMonths(now());
            }),
            'newest_asset_months' => $highValueItems->min(function ($item) {
                return $item->last_updated->diffInMonths(now());
            }),
        ];
    }

    /**
     * Get category-wise depreciation analysis
     */
    private function getCategoryDepreciation(Collection $highValueItems): array
    {
        $categoryAnalysis = $highValueItems->groupBy('item.category.name')
            ->map(function ($categoryItems, $categoryName) {
                $totalOriginalValue = $categoryItems->sum('total_value');
                $totalCurrentValue = $categoryItems->sum(function ($item) {
                    return $this->calculateCurrentValue($item);
                });

                $totalDepreciation = $totalOriginalValue - $totalCurrentValue;

                return [
                    'category' => $categoryName ?: 'Uncategorized',
                    'asset_count' => $categoryItems->count(),
                    'total_original_value' => (float) $totalOriginalValue,
                    'total_current_value' => (float) $totalCurrentValue,
                    'total_depreciation' => (float) $totalDepreciation,
                    'depreciation_percentage' => $totalOriginalValue > 0 ? 
                        round(($totalDepreciation / $totalOriginalValue) * 100, 2) : 0,
                    'average_age_months' => round($categoryItems->avg(function ($item) {
                        return $item->last_updated->diffInMonths(now());
                    })),
                ];
            })
            ->sortByDesc('total_depreciation')
            ->values()
            ->toArray();

        return $categoryAnalysis;
    }

    // ==================== AUDIT REPORT METHODS ====================

    /**
     * Get audit summary
     */
    private function getAuditSummary(Collection $auditLogs): array
    {
        $totalAudits = $auditLogs->count();
        $uniqueUsers = $auditLogs->pluck('user_id')->unique()->count();
        $actionCounts = $auditLogs->groupBy('action')->map->count();

        return [
            'total_audit_entries' => $totalAudits,
            'unique_users' => $uniqueUsers,
            'create_actions' => $actionCounts['CREATE'] ?? 0,
            'update_actions' => $actionCounts['UPDATE'] ?? 0,
            'delete_actions' => $actionCounts['DELETE'] ?? 0,
            'most_active_user' => $this->getMostActiveUser($auditLogs),
        ];
    }

    /**
     * Format audit data for display
     */
    private function formatAuditData(Collection $auditLogs): array
    {
        return $auditLogs->take(500)->map(function ($audit) {
            return [
                'id' => $audit->audit_id,
                'timestamp' => $audit->performed_at->format('Y-m-d H:i:s'),
                'action' => $audit->action,
                'user' => $audit->user->name ?? 'System',
                'table' => $audit->table_name,
                'record_id' => $audit->record_id,
                'changes_count' => $this->calculateChangesCount($audit->old_values, $audit->new_values),
                'ip_address' => $audit->ip_address,
                'user_agent' => $audit->user_agent,
            ];
        })->toArray();
    }

    /**
     * Get user activity analysis
     */
    private function getUserActivity(Collection $auditLogs): array
    {
        return $auditLogs->groupBy('user_id')
            ->map(function ($userLogs, $userId) {
                $user = $userLogs->first()->user;
                return [
                    'user_id' => $userId,
                    'user_name' => $user->name ?? 'Unknown User',
                    'activity_count' => $userLogs->count(),
                    'last_activity' => $userLogs->max('performed_at')->format('Y-m-d H:i:s'),
                    'actions' => $userLogs->groupBy('action')->map->count(),
                ];
            })
            ->sortByDesc('activity_count')
            ->values()
            ->toArray();
    }

    /**
     * Get action analysis
     */
    private function getActionAnalysis(Collection $auditLogs): array
    {
        return $auditLogs->groupBy('action')
            ->map(function ($actionLogs, $action) use ($auditLogs) {
                return [
                    'action' => $action,
                    'count' => $actionLogs->count(),
                    'percentage' => round(($actionLogs->count() / $auditLogs->count()) * 100, 2),
                    'users_involved' => $actionLogs->pluck('user_id')->unique()->count(),
                ];
            })
            ->sortByDesc('count')
            ->values()
            ->toArray();
    }

    // ==================== PURCHASE ANALYSIS METHODS ====================

    /**
     * Get purchase analysis
     */
    private function getPurchaseAnalysis(array $params): array
    {
        $query = PurchaseOrder::with(['supplier', 'department', 'items.item'])
            ->where('university_id', Auth::user()->university_id);

        if (!empty($params['date_range']) || !empty($params['custom_start_date'])) {
            $dateRange = $this->getDateRange($params);
            $query->whereBetween('order_date', [
                $dateRange['start']->format('Y-m-d'),
                $dateRange['end']->format('Y-m-d')
            ]);
        }

        $purchaseOrders = $query->get();

        $summary = [
            'total_orders' => $purchaseOrders->count(),
            'total_amount' => (float) $purchaseOrders->sum('total_amount'),
            'average_order_value' => (float) $purchaseOrders->avg('total_amount'),
            'status_breakdown' => $purchaseOrders->groupBy('status')->map->count(),
            'order_type_breakdown' => $purchaseOrders->groupBy('order_type')->map->count(),
        ];

        $supplierPerformance = $purchaseOrders->groupBy('supplier_id')
            ->map(function ($orders, $supplierId) {
                $supplier = $orders->first()->supplier;
                return [
                    'supplier_name' => $supplier->name ?? 'Unknown',
                    'order_count' => $orders->count(),
                    'total_spent' => (float) $orders->sum('total_amount'),
                    'average_order_value' => (float) $orders->avg('total_amount'),
                    'on_time_delivery_rate' => $this->calculateOnTimeDeliveryRate($orders),
                ];
            })
            ->sortByDesc('total_spent')
            ->values()
            ->take(10)
            ->toArray();

        return [
            'summary' => $summary,
            'supplier_performance' => $supplierPerformance,
            'recent_orders' => $purchaseOrders->take(10)->map(function ($order) {
                return [
                    'po_number' => $order->po_number,
                    'supplier' => $order->supplier->name,
                    'order_date' => $order->order_date->format('Y-m-d'),
                    'total_amount' => (float) $order->total_amount,
                    'status' => $order->status,
                    'items_count' => $order->items->count(),
                ];
            })->toArray(),
        ];
    }

    // ==================== MAINTENANCE ANALYSIS METHODS ====================

    /**
     * Get maintenance analysis
     */
    private function getMaintenanceAnalysis(array $params): array
    {
        $query = MaintenanceRecord::with(['item', 'department'])
            ->where('university_id', Auth::user()->university_id);

        if (!empty($params['date_range']) || !empty($params['custom_start_date'])) {
            $dateRange = $this->getDateRange($params);
            $query->whereBetween('scheduled_date', [
                $dateRange['start']->format('Y-m-d'),
                $dateRange['end']->format('Y-m-d')
            ]);
        }

        $maintenanceRecords = $query->get();

        $summary = [
            'total_maintenance' => $maintenanceRecords->count(),
            'total_cost' => (float) $maintenanceRecords->sum('total_cost'),
            'total_downtime_hours' => $maintenanceRecords->sum('downtime_hours'),
            'average_cost_per_maintenance' => (float) $maintenanceRecords->avg('total_cost'),
            'status_breakdown' => $maintenanceRecords->groupBy('status')->map->count(),
            'type_breakdown' => $maintenanceRecords->groupBy('maintenance_type')->map->count(),
            'priority_breakdown' => $maintenanceRecords->groupBy('priority')->map->count(),
        ];

        $maintenanceByCategory = $maintenanceRecords->groupBy('item.category.name')
            ->map(function ($records, $categoryName) {
                return [
                    'category' => $categoryName ?: 'Uncategorized',
                    'count' => $records->count(),
                    'total_cost' => (float) $records->sum('total_cost'),
                    'total_downtime' => $records->sum('downtime_hours'),
                    'average_cost' => (float) $records->avg('total_cost'),
                ];
            })
            ->sortByDesc('total_cost')
            ->values()
            ->toArray();

        $equipmentReliability = $maintenanceRecords->groupBy('item_id')
            ->map(function ($records, $itemId) {
                $item = $records->first()->item;
                $completedRecords = $records->where('status', 'completed');
                
                return [
                    'item_name' => $item->name ?? 'Unknown',
                    'maintenance_count' => $records->count(),
                    'completed_count' => $completedRecords->count(),
                    'total_downtime' => $records->sum('downtime_hours'),
                    'total_maintenance_cost' => (float) $records->sum('total_cost'),
                    'emergency_maintenance_rate' => $records->count() > 0 ? 
                        round(($records->where('maintenance_type', 'emergency')->count() / $records->count()) * 100, 2) : 0,
                ];
            })
            ->sortByDesc('maintenance_count')
            ->values()
            ->take(10)
            ->toArray();

        return [
            'summary' => $summary,
            'maintenance_by_category' => $maintenanceByCategory,
            'equipment_reliability' => $equipmentReliability,
            'upcoming_maintenance' => $this->getUpcomingMaintenance(),
        ];
    }

    /**
     * Get maintenance cost analysis
     */
    private function getMaintenanceCostAnalysis(Collection $maintenanceRecords): array
    {
        $totalCost = $maintenanceRecords->sum('total_cost');
        $laborCost = $maintenanceRecords->sum('labor_cost');
        $partsCost = $maintenanceRecords->sum('parts_cost');

        $costByType = $maintenanceRecords->groupBy('maintenance_type')
            ->map(function ($records, $type) {
                return [
                    'type' => $type,
                    'total_cost' => (float) $records->sum('total_cost'),
                    'average_cost' => (float) $records->avg('total_cost'),
                    'count' => $records->count(),
                ];
            })
            ->values()
            ->toArray();

        return [
            'total_cost' => (float) $totalCost,
            'labor_cost' => (float) $laborCost,
            'parts_cost' => (float) $partsCost,
            'labor_cost_percentage' => $totalCost > 0 ? round(($laborCost / $totalCost) * 100, 2) : 0,
            'parts_cost_percentage' => $totalCost > 0 ? round(($partsCost / $totalCost) * 100, 2) : 0,
            'cost_by_type' => $costByType,
            'average_cost_per_maintenance' => (float) $maintenanceRecords->avg('total_cost'),
        ];
    }

    /**
     * Get downtime analysis
     */
    private function getDowntimeAnalysis(Collection $maintenanceRecords): array
    {
        $totalDowntime = $maintenanceRecords->sum('downtime_hours');
        $completedRecords = $maintenanceRecords->where('status', 'completed');

        $downtimeByType = $maintenanceRecords->groupBy('maintenance_type')
            ->map(function ($records, $type) {
                return [
                    'type' => $type,
                    'total_downtime' => $records->sum('downtime_hours'),
                    'average_downtime' => (float) $records->avg('downtime_hours'),
                    'count' => $records->count(),
                ];
            })
            ->values()
            ->toArray();

        $downtimeByPriority = $maintenanceRecords->groupBy('priority')
            ->map(function ($records, $priority) {
                return [
                    'priority' => $priority,
                    'total_downtime' => $records->sum('downtime_hours'),
                    'average_downtime' => (float) $records->avg('downtime_hours'),
                ];
            })
            ->values()
            ->toArray();

        return [
            'total_downtime_hours' => $totalDowntime,
            'average_downtime_per_maintenance' => (float) $maintenanceRecords->avg('downtime_hours'),
            'downtime_by_type' => $downtimeByType,
            'downtime_by_priority' => $downtimeByPriority,
            'most_affected_equipment' => $this->getMostAffectedEquipment($maintenanceRecords),
        ];
    }

    /**
     * Get preventive maintenance effectiveness
     */
    private function getPreventiveMaintenanceEffectiveness(Collection $maintenanceRecords): array
    {
        $preventiveMaintenance = $maintenanceRecords->where('maintenance_type', 'preventive');
        $correctiveMaintenance = $maintenanceRecords->where('maintenance_type', 'corrective');
        $emergencyMaintenance = $maintenanceRecords->where('maintenance_type', 'emergency');

        $totalCost = $maintenanceRecords->sum('total_cost');
        $preventiveCost = $preventiveMaintenance->sum('total_cost');
        $correctiveCost = $correctiveMaintenance->sum('total_cost');

        return [
            'preventive_maintenance_count' => $preventiveMaintenance->count(),
            'corrective_maintenance_count' => $correctiveMaintenance->count(),
            'emergency_maintenance_count' => $emergencyMaintenance->count(),
            'preventive_maintenance_ratio' => $maintenanceRecords->count() > 0 ? 
                round(($preventiveMaintenance->count() / $maintenanceRecords->count()) * 100, 2) : 0,
            'cost_avoidance_estimate' => $this->calculateCostAvoidance($preventiveMaintenance, $correctiveMaintenance),
            'preventive_maintenance_cost_percentage' => $totalCost > 0 ? 
                round(($preventiveCost / $totalCost) * 100, 2) : 0,
            'corrective_maintenance_cost_percentage' => $totalCost > 0 ? 
                round(($correctiveCost / $totalCost) * 100, 2) : 0,
        ];
    }

    /**
     * Get equipment reliability metrics
     */
    private function getEquipmentReliabilityMetrics(Collection $maintenanceRecords): array
    {
        $equipmentMetrics = $maintenanceRecords->groupBy('item_id')
            ->map(function ($records, $itemId) {
                $item = $records->first()->item;
                $completedRecords = $records->where('status', 'completed');
                $preventiveRecords = $records->where('maintenance_type', 'preventive');
                $emergencyRecords = $records->where('maintenance_type', 'emergency');

                $mttr = $this->calculateMTTR($completedRecords);
                $mtbf = $this->calculateMTBF($completedRecords);

                return [
                    'item_name' => $item->name ?? 'Unknown',
                    'total_maintenance_count' => $records->count(),
                    'preventive_count' => $preventiveRecords->count(),
                    'emergency_count' => $emergencyRecords->count(),
                    'total_downtime_hours' => $records->sum('downtime_hours'),
                    'total_maintenance_cost' => (float) $records->sum('total_cost'),
                    'mean_time_to_repair' => $mttr,
                    'mean_time_between_failures' => $mtbf,
                    'reliability_score' => $this->calculateReliabilityScore($records),
                ];
            })
            ->sortByDesc('total_maintenance_count')
            ->values()
            ->toArray();

        return [
            'equipment_metrics' => $equipmentMetrics,
            'overall_reliability' => $this->calculateOverallReliability($maintenanceRecords),
        ];
    }

    // ==================== HELPER METHODS ====================

    /**
     * Get stock status based on actual stock levels
     */
    private function getStockStatusBasedOnLevels(StockLevel $stock): string
    {
        if ($stock->available_quantity <= 0) {
            return 'out_of_stock';
        } elseif ($stock->available_quantity <= $stock->safety_stock) {
            return 'critical_stock';
        } elseif ($stock->available_quantity <= $stock->reorder_level) {
            return 'low_stock';
        } elseif ($stock->available_quantity >= ($stock->max_level * 0.8)) {
            return 'over_stock';
        } else {
            return 'adequate_stock';
        }
    }

    /**
     * Get appropriate depreciation rate based on category
     */
    private function getDepreciationRate(?string $category): float
    {
        return match($category) {
            'Electronics', 'Computers' => 0.20,
            'Machinery', 'Equipment' => 0.15,
            'Furniture' => 0.10,
            'Vehicles' => 0.25,
            default => 0.10,
        };
    }

    /**
     * Calculate current value for depreciation
     */
    private function calculateCurrentValue($stock): float
    {
        $ageInMonths = $stock->last_updated->diffInMonths(now());
        $depreciationRate = $this->getDepreciationRate($stock->item->category->name ?? 'General');
        $monthlyDepreciation = $stock->total_value * ($depreciationRate / 12);
        return max(0, $stock->total_value - ($monthlyDepreciation * $ageInMonths));
    }

    /**
     * Generate activity details description
     */
    private function getActivityDetails(InventoryTransaction $transaction): string
    {
        return match($transaction->transaction_type) {
            'purchase' => "Purchased {$transaction->quantity} units",
            'sale' => "Sold {$transaction->quantity} units",
            'transfer' => "Transferred {$transaction->quantity} units",
            'adjustment' => "Stock adjustment of {$transaction->quantity} units",
            'consumption' => "Consumed {$transaction->quantity} units",
            'return' => "Returned {$transaction->quantity} units",
            'write_off' => "Written off {$transaction->quantity} units",
            'production' => "Produced {$transaction->quantity} units",
            'donation' => "Donated {$transaction->quantity} units",
            default => "{$transaction->transaction_type} of {$transaction->quantity} units",
        };
    }

    /**
     * Get most active user from audit logs
     */
    private function getMostActiveUser(Collection $auditLogs): string
    {
        if ($auditLogs->isEmpty()) {
            return 'No activity';
        }

        $userActivity = $auditLogs->groupBy('user_id')
            ->map->count()
            ->sortDesc();

        if ($userActivity->isEmpty()) {
            return 'Unknown User';
        }

        $mostActiveUserId = $userActivity->keys()->first();
        $activityCount = $userActivity->first();

        $user = $auditLogs->firstWhere('user_id', $mostActiveUserId)?->user;

        return $user ? "{$user->name} ({$activityCount} activities)" : 'Unknown User';
    }

    /**
     * Calculate changes count for audit logs
     */
    private function calculateChangesCount($oldValues, $newValues): int
    {
        try {
            $oldArray = is_string($oldValues) ? json_decode($oldValues, true) : (is_array($oldValues) ? $oldValues : []);
            $newArray = is_string($newValues) ? json_decode($newValues, true) : (is_array($newValues) ? $newValues : []);

            if (!is_array($oldArray)) $oldArray = [];
            if (!is_array($newArray)) $newArray = [];

            $allKeys = array_unique(array_merge(array_keys($oldArray), array_keys($newArray)));
            $changes = 0;

            foreach ($allKeys as $key) {
                $oldValue = $oldArray[$key] ?? null;
                $newValue = $newArray[$key] ?? null;

                if ($oldValue !== $newValue) {
                    $changes++;
                }
            }

            return $changes;
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Calculate on-time delivery rate for supplier
     */
    private function calculateOnTimeDeliveryRate(Collection $orders): float
    {
        $completedOrders = $orders->where('status', 'received');
        if ($completedOrders->isEmpty()) return 0;

        $onTimeDeliveries = $completedOrders->filter(function ($order) {
            return $order->actual_delivery_date && 
                   $order->actual_delivery_date <= $order->expected_delivery_date;
        });

        return round(($onTimeDeliveries->count() / $completedOrders->count()) * 100, 2);
    }

    /**
     * Get upcoming maintenance
     */
    private function getUpcomingMaintenance(): array
    {
        return MaintenanceRecord::with(['item', 'department'])
            ->where('university_id', Auth::user()->university_id)
            ->where('scheduled_date', '>=', now()->format('Y-m-d'))
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->orderBy('scheduled_date')
            // ->limit(10)
            ->get()
            ->map(function ($maintenance) {
                return [
                    'maintenance_code' => $maintenance->maintenance_code,
                    'item_name' => $maintenance->item->name,
                    'scheduled_date' => $maintenance->scheduled_date->format('Y-m-d'),
                    'type' => $maintenance->maintenance_type,
                    'priority' => $maintenance->priority,
                    'status' => $maintenance->status,
                ];
            })->toArray();
    }

    /**
     * Get supplier performance metrics
     */
    private function getSupplierPerformanceMetrics(Collection $purchaseOrders): array
    {
        return $purchaseOrders->groupBy('supplier_id')
            ->map(function ($orders, $supplierId) {
                $supplier = $orders->first()->supplier;
                $completedOrders = $orders->where('status', 'received');
                $leadTimes = $completedOrders->map(function ($order) {
                    return $order->order_date->diffInDays($order->actual_delivery_date);
                });

                return [
                    'supplier_name' => $supplier->name ?? 'Unknown',
                    'total_orders' => $orders->count(),
                    'completed_orders' => $completedOrders->count(),
                    'total_spend' => (float) $orders->sum('total_amount'),
                    'on_time_delivery_rate' => $this->calculateOnTimeDeliveryRate($orders),
                    'average_lead_time_days' => $leadTimes->avg(),
                    'quality_rating' => $this->calculateQualityRating($orders),
                ];
            })
            ->sortByDesc('total_spend')
            ->values()
            ->toArray();
    }

    /**
     * Calculate quality rating for supplier
     */
    private function calculateQualityRating(Collection $orders): float
    {
        // Implement your quality rating logic here
        return rand(80, 100); // Placeholder
    }

    /**
     * Get category spend analysis
     */
    private function getCategorySpendAnalysis(Collection $purchaseOrders): array
    {
        $categorySpend = [];

        foreach ($purchaseOrders as $order) {
            foreach ($order->items as $item) {
                $categoryName = $item->item->category->name ?? 'Uncategorized';
                if (!isset($categorySpend[$categoryName])) {
                    $categorySpend[$categoryName] = [
                        'category' => $categoryName,
                        'total_spend' => 0,
                        'order_count' => 0,
                        'item_count' => 0,
                    ];
                }

                $categorySpend[$categoryName]['total_spend'] += $item->line_total;
                $categorySpend[$categoryName]['item_count'] += $item->quantity_ordered;
            }
        }

        foreach ($categorySpend as $category => $data) {
            $categorySpend[$category]['order_count'] = $purchaseOrders->filter(function ($order) use ($category) {
                return $order->items->contains(function ($item) use ($category) {
                    return ($item->item->category->name ?? 'Uncategorized') === $category;
                });
            })->count();
        }

        return array_values($categorySpend);
    }
    

    /**
     * Get maintenance summary
     */
    private function getMaintenanceSummary(Collection $maintenanceRecords): array
    {
        $totalRecords = $maintenanceRecords->count();
        $completedRecords = $maintenanceRecords->where('status', 'completed');

        return [
            'total_maintenance_activities' => $totalRecords,
            'completed_activities' => $completedRecords->count(),
            'completion_rate' => $totalRecords > 0 ? round(($completedRecords->count() / $totalRecords) * 100, 2) : 0,
            'total_cost' => (float) $maintenanceRecords->sum('total_cost'),
            'total_downtime_hours' => $maintenanceRecords->sum('downtime_hours'),
            'average_response_time_hours' => $this->calculateAverageResponseTime($maintenanceRecords),
            'emergency_maintenance_percentage' => $totalRecords > 0 ? 
                round(($maintenanceRecords->where('maintenance_type', 'emergency')->count() / $totalRecords) * 100, 2) : 0,
        ];
    }

    /**
     * Calculate average response time for maintenance
     */
    private function calculateAverageResponseTime(Collection $maintenanceRecords): float
    {
        $completedRecords = $maintenanceRecords->where('status', 'completed')
            ->whereNotNull('completed_date')
            ->whereNotNull('scheduled_date');

        if ($completedRecords->isEmpty()) return 0;

        $totalResponseTime = $completedRecords->sum(function ($record) {
            return $record->scheduled_date->diffInHours($record->completed_date);
        });

        return round($totalResponseTime / $completedRecords->count(), 2);
    }

    /**
     * Get most affected equipment
     */
    private function getMostAffectedEquipment(Collection $maintenanceRecords): array
    {
        return $maintenanceRecords->groupBy('item_id')
            ->map(function ($records, $itemId) {
                $item = $records->first()->item;
                return [
                    'item_name' => $item->name ?? 'Unknown',
                    'downtime_hours' => $records->sum('downtime_hours'),
                    'maintenance_count' => $records->count(),
                ];
            })
            ->sortByDesc('downtime_hours')
            ->values()
            ->take(5)
            ->toArray();
    }

    /**
     * Calculate cost avoidance
     */
    private function calculateCostAvoidance(Collection $preventive, Collection $corrective): float
    {
        $avgCorrectiveCost = $corrective->avg('total_cost') ?? 0;
        $preventiveCount = $preventive->count();
        
        // Estimate that each preventive maintenance avoids 2 corrective maintenances
        return (float) ($avgCorrectiveCost * 2 * $preventiveCount);
    }

    /**
     * Calculate Mean Time To Repair (MTTR)
     */
    private function calculateMTTR(Collection $completedRecords): float
    {
        if ($completedRecords->isEmpty()) return 0;

        $totalRepairTime = $completedRecords->sum(function ($record) {
            return $record->scheduled_date->diffInHours($record->completed_date);
        });

        return round($totalRepairTime / $completedRecords->count(), 2);
    }

    /**
     * Calculate Mean Time Between Failures (MTBF)
     */
    private function calculateMTBF(Collection $completedRecords): float
    {
        if ($completedRecords->count() < 2) return 0;

        $sortedRecords = $completedRecords->sortBy('scheduled_date');
        $totalTime = 0;
        $count = 0;

        for ($i = 1; $i < $sortedRecords->count(); $i++) {
            $current = $sortedRecords->get($i);
            $previous = $sortedRecords->get($i - 1);
            $timeBetween = $previous->completed_date->diffInHours($current->scheduled_date);
            $totalTime += $timeBetween;
            $count++;
        }

        return $count > 0 ? round($totalTime / $count, 2) : 0;
    }

    /**
     * Calculate reliability score
     */
    private function calculateReliabilityScore(Collection $records): float
    {
        $totalRecords = $records->count();
        $emergencyRecords = $records->where('maintenance_type', 'emergency')->count();
        
        if ($totalRecords === 0) return 100;

        $emergencyRatio = $emergencyRecords / $totalRecords;
        $reliabilityScore = 100 * (1 - $emergencyRatio);

        return round(max(0, min(100, $reliabilityScore)), 2);
    }

    /**
     * Calculate overall reliability
     */
    private function calculateOverallReliability(Collection $maintenanceRecords): array
    {
        $totalRecords = $maintenanceRecords->count();
        $emergencyRecords = $maintenanceRecords->where('maintenance_type', 'emergency')->count();
        $preventiveRecords = $maintenanceRecords->where('maintenance_type', 'preventive')->count();

        return [
            'total_maintenance_activities' => $totalRecords,
            'emergency_maintenance_percentage' => $totalRecords > 0 ? 
                round(($emergencyRecords / $totalRecords) * 100, 2) : 0,
            'preventive_maintenance_percentage' => $totalRecords > 0 ? 
                round(($preventiveRecords / $totalRecords) * 100, 2) : 0,
            'overall_reliability_score' => $this->calculateReliabilityScore($maintenanceRecords),
        ];
    }

    /**
     * Get quarterly analysis
     */
  
/**
 * Get quarterly analysis for acquisitions - FIXED VERSION
 */
    private function getQuarterlyAnalysis($query): array
    {
        return $query->clone()
            ->select(
                DB::raw('YEAR(inventory_transactions.transaction_date) as year'),
                DB::raw('QUARTER(inventory_transactions.transaction_date) as quarter'),
                DB::raw('COUNT(*) as acquisition_count'),
                DB::raw('SUM(inventory_transactions.total_value) as total_value')
            )
            ->groupBy(
                DB::raw('YEAR(inventory_transactions.transaction_date)'),
                DB::raw('QUARTER(inventory_transactions.transaction_date)')
            )
            ->orderBy('year', 'desc')
            ->orderBy('quarter', 'desc')
            // ->limit(8)
            ->get()
            ->toArray();
    }
 

    /**
 * Get year-over-year analysis for acquisitions - FIXED VERSION
 */
private function getYearOverYearAnalysis($query): array
{
    return $query->clone()
        ->select(
            DB::raw('YEAR(inventory_transactions.transaction_date) as year'),
            DB::raw('COUNT(*) as acquisition_count'),
            DB::raw('SUM(inventory_transactions.total_value) as total_value'),
            DB::raw('SUM(inventory_transactions.quantity) as total_quantity')
        )
        ->groupBy(DB::raw('YEAR(inventory_transactions.transaction_date)'))
        ->orderBy('year', 'desc')
        // ->limit(3)
        ->get()
        ->toArray();
}


    /**
     * Export report data in various formats
     */
    public function exportReport(array $reportData, string $format, array $config): array
    {
        return [
            'export_data' => $reportData,
            'format' => $format,
            'config' => $config,
            'generated_at' => now()->toISOString(),
            'metadata' => [
                'total_records' => count($reportData['recent_activities'] ?? []),
                'report_type' => $config['report_type'] ?? 'comprehensive',
            ]
        ];
    }
}