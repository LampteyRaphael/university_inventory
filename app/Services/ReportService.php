<?php

namespace App\Services;

use App\Models\InventoryTransaction;
use App\Models\University;
use App\Models\InventoryItem;
use App\Models\Department;
use App\Models\Location;
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
     * Build base query with filters
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
                InventoryTransaction::TYPE_PRODUCTION
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

        return [
            'total_transactions' => $totalTransactions,
            'total_value' => (float) $totalValue,
            'incoming_stock' => (int) $incomingStock,
            'outgoing_stock' => (int) $outgoingStock,
            'net_stock_movement' => (int) ($incomingStock - $outgoingStock),
            'purchase_count' => $purchaseCount,
            'sale_count' => $saleCount,
            'transfer_count' => $transferCount,
            'average_transaction_value' => $totalTransactions > 0 ? (float) ($totalValue / $totalTransactions) : 0,
        ];
    }

    /**
     * Get trend data for charts
     */
    private function getTrendData($query, array $params): array
    {
        $trendQuery = clone $query;
        
        // Monthly acquisitions trend
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
                return [
                    'type' => $item->transaction_type,
                    'label' => (new InventoryTransaction())->getTransactionTypeLabelAttribute(),
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
        // This would typically join with inventory_items to get current stock levels
        // For now, we'll return recent high-value transactions as critical items
        $query = InventoryTransaction::with(['item', 'department'])
            ->where('total_value', '>', 1000) // High value threshold
            ->orderBy('total_value', 'desc')
            ->limit(10);

        if (!empty($params['date_range']) || !empty($params['custom_start_date'])) {
            $dateRange = $this->getDateRange($params);
            $query->whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']]);
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
                return [
                    'type' => $item->transaction_type,
                    'label' => (new InventoryTransaction())->getTransactionTypeLabelAttribute(),
                    'count' => $item->count,
                    'total_quantity' => (int) $item->total_quantity,
                    'total_value' => (float) $item->total_value,
                    'avg_unit_cost' => (float) $item->avg_unit_cost,
                    'avg_transaction_value' => (float) $item->avg_transaction_value,
                ];
            })->toArray();
    }

    /**
     * Generate stock level report
     */
    public function generateStockLevelReport(array $params): array
    {
        // This would typically calculate current stock levels from transactions
        // For now, we'll return transaction-based stock movements
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
            ]
        ];
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
     * Export report data in various formats
     */
    public function exportReport(array $reportData, string $format, array $config): array
    {
        // This would handle the actual export logic
        // For now, return the data structured for export
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