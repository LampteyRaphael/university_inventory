<?php

namespace App\Services;

use App\Models\InventoryTransaction;
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
     * Generate comprehensive inventory report
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
        ];
    }

    /**
     * Generate stock level report
     */
    public function generateStockLevelReport(array $params): array
    {
        $query = $this->buildBaseQuery($params);
        
        $stockMovements = $query
            ->with(['item', 'item.category'])
            ->select(
                'item_id',
                DB::raw('SUM(CASE WHEN transaction_type IN ("purchase", "return", "production") THEN quantity ELSE 0 END) as incoming'),
                DB::raw('SUM(CASE WHEN transaction_type IN ("sale", "consumption", "write_off") THEN quantity ELSE 0 END) as outgoing'),
                DB::raw('SUM(CASE WHEN transaction_type IN ("purchase", "return", "production") THEN total_value ELSE 0 END) as incoming_value'),
                DB::raw('SUM(CASE WHEN transaction_type IN ("sale", "consumption", "write_off") THEN total_value ELSE 0 END) as outgoing_value')
            )
            ->groupBy('item_id')
            ->get()
            ->map(function ($item) {
                $netQuantity = $item->incoming - $item->outgoing;
                $netValue = $item->incoming_value - $item->outgoing_value;
                
                return [
                    'item_id' => $item->item_id,
                    'item_name' => $item->item->name ?? 'Unknown',
                    'category' => $item->item->category->name ?? 'Uncategorized',
                    'incoming' => (int) $item->incoming,
                    'outgoing' => (int) $item->outgoing,
                    'net_movement' => $netQuantity,
                    'incoming_value' => (float) $item->incoming_value,
                    'outgoing_value' => (float) $item->outgoing_value,
                    'net_value' => $netValue,
                    'status' => $this->getStockStatus($netQuantity),
                ];
            });

        return [
            'stock_movements' => $stockMovements,
            'summary' => [
                'total_items' => $stockMovements->count(),
                'total_incoming' => $stockMovements->sum('incoming'),
                'total_outgoing' => $stockMovements->sum('outgoing'),
                'net_movement' => $stockMovements->sum('net_movement'),
                'total_incoming_value' => $stockMovements->sum('incoming_value'),
                'total_outgoing_value' => $stockMovements->sum('outgoing_value'),
                'net_value' => $stockMovements->sum('net_value'),
            ]
        ];
    }

    /**
     * Generate acquisition report
     */
    public function generateAcquisitionReport(array $params): array
    {
        $query = $this->buildBaseQuery($params)
            ->ofType(InventoryTransaction::TYPE_PURCHASE)
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
        $query = $this->buildBaseQuery($params)
            ->with(['item', 'item.category', 'department']);

        // For depreciation, we focus on high-value items and their aging
        $highValueItems = $query->where('total_value', '>', 500)
            ->orderBy('total_value', 'desc')
            ->get();

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

        // Date range filter
        if (!empty($params['date_range']) || !empty($params['custom_start_date'])) {
            $dateRange = $this->getDateRange($params);
            $query->whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']]);
        }

        // Category filter
        if (!empty($params['categories'])) {
            $query->whereHas('item.category', function ($q) use ($params) {
                $q->whereIn('category_id', $params['categories']);
            });
        }

        // Location filter
        if (!empty($params['locations'])) {
            $query->where(function ($q) use ($params) {
                $q->whereIn('source_location_id', $params['locations'])
                  ->orWhereIn('destination_location_id', $params['locations']);
            });
        }

        // University scope
        if (Auth::check() && Auth::user()->university_id) {
            $query->where('university_id', Auth::user()->university_id);
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

        // Date range filter
        if (!empty($params['date_range']) || !empty($params['custom_start_date'])) {
            $dateRange = $this->getDateRange($params);
            $query->whereBetween('performed_at', [$dateRange['start'], $dateRange['end']]);
        }

        // University scope
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
        // Handle custom date range
        if (!empty($params['custom_start_date']) && !empty($params['custom_end_date'])) {
            return [
                'start' => Carbon::parse($params['custom_start_date'])->startOfDay(),
                'end' => Carbon::parse($params['custom_end_date'])->endOfDay()
            ];
        }

        // Handle predefined date ranges
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
            'currentYear' => [
                'start' => now()->startOfYear(),
                'end' => now()->endOfDay()
            ],
            default => [ // last30days
                'start' => now()->subDays(30)->startOfDay(),
                'end' => now()->endOfDay()
            ],
        };
    }

    /**
     * Get summary metrics for the report
     */
    private function getSummaryMetrics($query, array $params): array
    {
        $baseQuery = clone $query;
        
        $totalTransactions = $baseQuery->count();
        $totalValue = $baseQuery->sum('total_value');
        
        // Stock movements
        $incomingStock = $baseQuery->clone()
            ->whereIn('transaction_type', [
                InventoryTransaction::TYPE_PURCHASE,
                InventoryTransaction::TYPE_RETURN,
                InventoryTransaction::TYPE_PRODUCTION,
                InventoryTransaction::TYPE_DONATION
            ])->sum('quantity');
            
        $outgoingStock = $baseQuery->clone()
            ->whereIn('transaction_type', [
                InventoryTransaction::TYPE_SALE,
                InventoryTransaction::TYPE_CONSUMPTION,
                InventoryTransaction::TYPE_WRITE_OFF
            ])->sum('quantity');

        // Transaction type counts
        $purchaseCount = $baseQuery->clone()->ofType(InventoryTransaction::TYPE_PURCHASE)->count();
        $saleCount = $baseQuery->clone()->ofType(InventoryTransaction::TYPE_SALE)->count();
        $transferCount = $baseQuery->clone()->ofType(InventoryTransaction::TYPE_TRANSFER)->count();
        $adjustmentCount = $baseQuery->clone()->ofType(InventoryTransaction::TYPE_ADJUSTMENT)->count();

        return [
            'total_transactions' => $totalTransactions,
            'total_value' => (float) $totalValue,
            'incoming_stock' => (int) $incomingStock,
            'outgoing_stock' => (int) $outgoingStock,
            'net_stock_movement' => (int) ($incomingStock - $outgoingStock),
            'purchase_count' => $purchaseCount,
            'sale_count' => $saleCount,
            'transfer_count' => $transferCount,
            'adjustment_count' => $adjustmentCount,
            'average_transaction_value' => $totalTransactions > 0 ? (float) ($totalValue / $totalTransactions) : 0,
        ];
    }

    /**
     * Get trend data for charts
     */
    private function getTrendData($query, array $params): array
    {
        $trendQuery = clone $query;
        
        // Monthly trends
        $monthlyTrends = $trendQuery
            ->select(
                DB::raw('DATE_FORMAT(transaction_date, "%Y-%m") as month'),
                DB::raw('COUNT(*) as transaction_count'),
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(total_value) as total_value'),
                DB::raw('AVG(unit_cost) as avg_unit_cost')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->limit(12)
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

        // Category distribution
        $categoryDistribution = $trendQuery->clone()
            ->join('inventory_items', 'inventory_transactions.item_id', '=', 'inventory_items.item_id')
            ->join('categories', 'inventory_items.category_id', '=', 'categories.category_id')
            ->select(
                'categories.name as category_name',
                DB::raw('COUNT(*) as transaction_count'),
                DB::raw('SUM(total_value) as total_value'),
                DB::raw('SUM(quantity) as total_quantity')
            )
            ->groupBy('categories.category_id', 'categories.name')
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

        // Transaction type distribution
        $transactionTypeDistribution = $trendQuery->clone()
            ->select(
                'transaction_type',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(total_value) as total_value')
            )
            ->groupBy('transaction_type')
            ->get()
            ->map(function ($item) {
                $transaction = new InventoryTransaction();
                return [
                    'type' => $item->transaction_type,
                    'label' => $transaction->getTransactionTypeLabelAttribute(),
                    'count' => $item->count,
                    'value' => (float) $item->total_value,
                ];
            });

        return [
            'monthly_trends' => $monthlyTrends,
            'category_distribution' => $categoryDistribution,
            'transaction_type_distribution' => $transactionTypeDistribution,
        ];
    }

    /**
     * Get critical stock items
     */
    private function getCriticalItems(array $params): array
    {
        $query = InventoryTransaction::with(['item', 'department', 'item.category'])
            ->where('total_value', '>', 1000)
            ->orderBy('total_value', 'desc')
            ->limit(10);

        if (!empty($params['date_range']) || !empty($params['custom_start_date'])) {
            $dateRange = $this->getDateRange($params);
            $query->whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']]);
        }

        if (Auth::check() && Auth::user()->university_id) {
            $query->where('university_id', Auth::user()->university_id);
        }

        return $query->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->transaction_id,
                    'item_code' => $transaction->item->item_code ?? 'N/A',
                    'name' => $transaction->item->name ?? 'Unknown Item',
                    'category' => $transaction->item->category->name ?? 'Uncategorized',
                    'department' => $transaction->department->name ?? 'N/A',
                    'transaction_type' => $transaction->transaction_type,
                    'quantity' => $transaction->quantity,
                    'unit_cost' => (float) $transaction->unit_cost,
                    'total_value' => (float) $transaction->total_value,
                    'transaction_date' => $transaction->transaction_date->format('Y-m-d'),
                    'status' => $transaction->status,
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
            ->orderBy('transaction_date', 'desc')
            ->limit(20)
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
     * Generate activity details description
     */
    private function getActivityDetails(InventoryTransaction $transaction): string
    {
        return match($transaction->transaction_type) {
            InventoryTransaction::TYPE_PURCHASE => "Purchased {$transaction->quantity} units",
            InventoryTransaction::TYPE_SALE => "Sold {$transaction->quantity} units",
            InventoryTransaction::TYPE_TRANSFER => "Transferred {$transaction->quantity} units",
            InventoryTransaction::TYPE_ADJUSTMENT => "Stock adjustment of {$transaction->quantity} units",
            InventoryTransaction::TYPE_CONSUMPTION => "Consumed {$transaction->quantity} units",
            InventoryTransaction::TYPE_RETURN => "Returned {$transaction->quantity} units",
            InventoryTransaction::TYPE_WRITE_OFF => "Written off {$transaction->quantity} units",
            InventoryTransaction::TYPE_PRODUCTION => "Produced {$transaction->quantity} units",
            InventoryTransaction::TYPE_DONATION => "Donated {$transaction->quantity} units",
            default => "{$transaction->transaction_type} of {$transaction->quantity} units",
        };
    }

    /**
     * Get category breakdown
     */
    private function getCategoryBreakdown($query, array $params): array
    {
        $breakdown = clone $query;
        
        return $breakdown
            ->join('inventory_items', 'inventory_transactions.item_id', '=', 'inventory_items.item_id')
            ->join('categories', 'inventory_items.category_id', '=', 'categories.category_id')
            ->select(
                'categories.name as category_name',
                DB::raw('COUNT(*) as transaction_count'),
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(total_value) as total_value'),
                DB::raw('AVG(unit_cost) as avg_unit_cost')
            )
            ->groupBy('categories.category_id', 'categories.name')
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
                DB::raw('SUM(total_value) as total_value'),
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('AVG(total_value) as avg_transaction_value')
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
                'transaction_type',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(total_value) as total_value'),
                DB::raw('AVG(unit_cost) as avg_unit_cost'),
                DB::raw('AVG(total_value) as avg_transaction_value')
            )
            ->groupBy('transaction_type')
            ->get()
            ->map(function ($item) {
                $transaction = new InventoryTransaction();
                return [
                    'type' => $item->transaction_type,
                    'label' => $transaction->getTransactionTypeLabelAttribute(),
                    'count' => $item->count,
                    'total_quantity' => (int) $item->total_quantity,
                    'total_value' => (float) $item->total_value,
                    'avg_unit_cost' => (float) $item->avg_unit_cost,
                    'avg_transaction_value' => (float) $item->avg_transaction_value,
                ];
            })->toArray();
    }

    /**
     * Determine stock status based on quantity
     */
    private function getStockStatus(int $quantity): string
    {
        return match(true) {
            $quantity <= 0 => 'out_of_stock',
            $quantity <= 10 => 'low_stock',
            $quantity <= 50 => 'medium_stock',
            default => 'high_stock',
        };
    }

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
    private function getAcquisitionTrends($query, array $params): array
    {
        $monthlyTrends = $query->clone()
            ->select(
                DB::raw('DATE_FORMAT(transaction_date, "%Y-%m") as month'),
                DB::raw('COUNT(*) as acquisition_count'),
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(total_value) as total_value'),
                DB::raw('AVG(unit_cost) as avg_unit_cost')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->limit(12)
            ->get();

        return [
            'monthly_trends' => $monthlyTrends,
            'quarterly_analysis' => $this->getQuarterlyAnalysis($query),
            'year_over_year' => $this->getYearOverYearAnalysis($query),
        ];
    }

    /**
     * Get quarterly analysis for acquisitions
     */
    private function getQuarterlyAnalysis($query): array
    {
        return $query->clone()
            ->select(
                DB::raw('YEAR(transaction_date) as year'),
                DB::raw('QUARTER(transaction_date) as quarter'),
                DB::raw('COUNT(*) as acquisition_count'),
                DB::raw('SUM(total_value) as total_value')
            )
            ->groupBy('year', 'quarter')
            ->orderBy('year', 'desc')
            ->orderBy('quarter', 'desc')
            ->limit(8)
            ->get()
            ->toArray();
    }

    /**
     * Get year-over-year analysis for acquisitions
     */
    private function getYearOverYearAnalysis($query): array
    {
        return $query->clone()
            ->select(
                DB::raw('YEAR(transaction_date) as year'),
                DB::raw('COUNT(*) as acquisition_count'),
                DB::raw('SUM(total_value) as total_value'),
                DB::raw('SUM(quantity) as total_quantity')
            )
            ->groupBy('year')
            ->orderBy('year', 'desc')
            ->limit(3)
            ->get()
            ->toArray();
    }

    /**
     * Get supplier analysis
     */
    private function getSupplierAnalysis($query): array
    {
        return $query->clone()
            ->select(
                'reference_number',
                DB::raw('COUNT(*) as transaction_count'),
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(total_value) as total_value'),
                DB::raw('AVG(unit_cost) as avg_unit_cost')
            )
            ->whereNotNull('reference_number')
            ->groupBy('reference_number')
            ->orderBy('total_value', 'desc')
            ->limit(10)
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

    /**
     * Get depreciation summary
     */
    private function getDepreciationSummary(Collection $highValueItems): array
    {
        $totalValue = $highValueItems->sum('total_value');
        $averageAge = $highValueItems->avg(function ($item) {
            return $item->transaction_date->diffInDays(now());
        });

        return [
            'total_high_value_items' => $highValueItems->count(),
            'total_asset_value' => (float) $totalValue,
            'average_asset_age_days' => round($averageAge),
            'oldest_asset_age_days' => $highValueItems->max(function ($item) {
                return $item->transaction_date->diffInDays(now());
            }),
            'newest_asset_age_days' => $highValueItems->min(function ($item) {
                return $item->transaction_date->diffInDays(now());
            }),
        ];
    }

    /**
     * Get depreciating assets list
     */
    private function getDepreciatingAssets(Collection $highValueItems): array
    {
        return $highValueItems->map(function ($item) {
            $ageInDays = $item->transaction_date->diffInDays(now());
            $ageInMonths = $item->transaction_date->diffInMonths(now());
            
            // Simple depreciation calculation (5% per year)
            $annualDepreciationRate = 0.05;
            $monthlyDepreciation = $item->total_value * ($annualDepreciationRate / 12);
            $accumulatedDepreciation = $monthlyDepreciation * $ageInMonths;
            $currentValue = max(0, $item->total_value - $accumulatedDepreciation);

            return [
                'id' => $item->transaction_id,
                'item_name' => $item->item->name ?? 'Unknown Asset',
                'category' => $item->item->category->name ?? 'Uncategorized',
                'department' => $item->department->name ?? 'N/A',
                'purchase_date' => $item->transaction_date->format('Y-m-d'),
                'age_months' => $ageInMonths,
                'original_value' => (float) $item->total_value,
                'accumulated_depreciation' => (float) $accumulatedDepreciation,
                'current_value' => (float) $currentValue,
                'depreciation_rate' => $annualDepreciationRate * 100, // as percentage
            ];
        })->toArray();
    }

    /**
     * Get age analysis of assets
     */
    private function getAgeAnalysis(Collection $highValueItems): array
    {
        $ageGroups = [
            '0-6 months' => 0,
            '6-12 months' => 0,
            '1-2 years' => 0,
            '2-5 years' => 0,
            '5+ years' => 0,
        ];

        $ageGroupValues = [
            '0-6 months' => 0,
            '6-12 months' => 0,
            '1-2 years' => 0,
            '2-5 years' => 0,
            '5+ years' => 0,
        ];

        foreach ($highValueItems as $item) {
            $ageInMonths = $item->transaction_date->diffInMonths(now());
            
            if ($ageInMonths <= 6) {
                $ageGroups['0-6 months']++;
                $ageGroupValues['0-6 months'] += $item->total_value;
            } elseif ($ageInMonths <= 12) {
                $ageGroups['6-12 months']++;
                $ageGroupValues['6-12 months'] += $item->total_value;
            } elseif ($ageInMonths <= 24) {
                $ageGroups['1-2 years']++;
                $ageGroupValues['1-2 years'] += $item->total_value;
            } elseif ($ageInMonths <= 60) {
                $ageGroups['2-5 years']++;
                $ageGroupValues['2-5 years'] += $item->total_value;
            } else {
                $ageGroups['5+ years']++;
                $ageGroupValues['5+ years'] += $item->total_value;
            }
        }

        return [
            'age_groups' => $ageGroups,
            'age_group_values' => $ageGroupValues,
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
                    $ageInMonths = $item->transaction_date->diffInMonths(now());
                    $monthlyDepreciation = $item->total_value * (0.05 / 12);
                    return max(0, $item->total_value - ($monthlyDepreciation * $ageInMonths));
                });

                return [
                    'category' => $categoryName ?: 'Uncategorized',
                    'asset_count' => $categoryItems->count(),
                    'total_original_value' => (float) $totalOriginalValue,
                    'total_current_value' => (float) $totalCurrentValue,
                    'total_depreciation' => (float) ($totalOriginalValue - $totalCurrentValue),
                    'depreciation_percentage' => $totalOriginalValue > 0 ? round((($totalOriginalValue - $totalCurrentValue) / $totalOriginalValue) * 100, 2) : 0,
                ];
            })
            ->sortByDesc('total_depreciation')
            ->values()
            ->toArray();

        return $categoryAnalysis;
    }

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
        return $auditLogs->take(50)->map(function ($audit) {
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
            $oldArray = $oldValues ? json_decode($oldValues, true) : [];
            $newArray = $newValues ? json_decode($newValues, true) : [];

            if (!is_array($oldArray) || !is_array($newArray)) {
                return 0;
            }

            $changes = 0;
            
            // Check for new keys or changed values
            foreach ($newArray as $key => $value) {
                if (!array_key_exists($key, $oldArray) || $oldArray[$key] !== $value) {
                    $changes++;
                }
            }
            
            // Check for removed keys
            foreach ($oldArray as $key => $value) {
                if (!array_key_exists($key, $newArray)) {
                    $changes++;
                }
            }

            return $changes;
        } catch (\Exception $e) {
            return 0;
        }
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