<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Models\InventoryItem;
use App\Models\MaintenanceRecord;
use App\Models\PurchaseOrder;
use App\Models\Department;
use App\Models\ItemCategory;
use App\Models\StockLevel;
use Carbon\Carbon;
use Exception;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AnalyticsController extends Controller
{
    public function getDashboardData(Request $request)
    {        
        $timeRange = $request->get('time_range', 'last30days');
        $realTime = $request->boolean('real_time', false);
        
        // Calculate date range based on time range
        $dateRange = $this->calculateDateRange($timeRange);
        
        try {
            $dashboardData = [
                'overview' => $this->getOverviewMetrics($dateRange, $realTime, $timeRange),
                'performance' => $this->getPerformanceMetrics($dateRange, $realTime, $timeRange),
                'trends' => $this->getTrendData($dateRange, $realTime, $timeRange),
                'alerts' => $this->getAlerts($realTime, $timeRange),
                'recentActivity' => $this->getRecentActivity($dateRange, $realTime, $timeRange),
            ];

            // Add real-time data if requested
            if ($realTime) {
                $dashboardData['realTime'] = $this->getRealTimeData();
            }

            return Inertia::render('Analytics/Analytics', [
                'success' => true,
                'dashboardData' => $dashboardData,
                'timeRange' => $timeRange,
                'realTime' => $realTime,
                'lastUpdated' => now()->toISOString()
            ]);

        } catch (Exception $e) {
            return Inertia::render('Analytics/Analytics', [
                'success' => false,
                'message' => 'Failed to fetch dashboard data',
                'error' => $e->getMessage()
            ]);
        }
    }

    private function calculateDateRange($timeRange)
    {
        $now = Carbon::now();
        
        return match($timeRange) {
            'last7days' => [
                'start' => $now->copy()->subDays(7)->startOfDay(),
                'end' => $now->endOfDay()
            ],
            'last30days' => [
                'start' => $now->copy()->subDays(30)->startOfDay(),
                'end' => $now->endOfDay()
            ],
            'last90days' => [
                'start' => $now->copy()->subDays(90)->startOfDay(),
                'end' => $now->endOfDay()
            ],
            'currentMonth' => [
                'start' => $now->copy()->startOfMonth(),
                'end' => $now->endOfDay()
            ],
            'currentQuarter' => [
                'start' => $now->copy()->startOfQuarter(),
                'end' => $now->endOfDay()
            ],
            'currentYear' => [
                'start' => $now->copy()->startOfYear(),
                'end' => $now->endOfDay()
            ],
            default => [
                'start' => $now->copy()->subDays(30)->startOfDay(),
                'end' => $now->endOfDay()
            ]
        };
    }

    private function getOverviewMetrics($dateRange, $realTime = false, $timeRange = 'last30days')
    {
        $universityId = Auth::user()->university_id ?? null;
        
        if ($realTime) {
            return $this->getFreshOverviewMetrics($dateRange, $universityId);
        } else {
            $cacheKey = "overview_metrics_{$universityId}_{$timeRange}";
            return Cache::remember($cacheKey, 300, function() use ($dateRange, $universityId) {
                return $this->getFreshOverviewMetrics($dateRange, $universityId);
            });
        }
    }

    private function getFreshOverviewMetrics($dateRange, $universityId)
    {
        // Total assets count (active items only)
        $totalAssetsQuery = InventoryItem::active();
        if ($universityId) {
            $totalAssetsQuery->where('university_id', $universityId);
        }
        $totalAssets = $totalAssetsQuery->count();
        
        // Total inventory value - using current_value from inventory_items
        $totalValueQuery = InventoryItem::active();
        if ($universityId) {
            $totalValueQuery->where('university_id', $universityId);
        }
        $totalValue = $totalValueQuery->sum('current_value');
        
        // Maintenance due - items with categories that require maintenance and have upcoming maintenance
        $maintenanceDueQuery = MaintenanceRecord::where(function($query) {
            $query->where('scheduled_date', '<=', now()->addDays(30))
                  ->orWhere('next_maintenance_date', '<=', now()->addDays(30));
        })
        ->where('status', '!=', 'completed');
        
        if ($universityId) {
            $maintenanceDueQuery->where('university_id', $universityId);
        }
        $maintenanceDue = $maintenanceDueQuery->count();
        
        // Low stock items - using InventoryItem's lowStock scope
        $lowStockItemsQuery = InventoryItem::active()->lowStock();
        if ($universityId) {
            $lowStockItemsQuery->where('university_id', $universityId);
        }
        $lowStockItems = $lowStockItemsQuery->count();
        
        // New acquisitions in date range
        $newAcquisitionsQuery = InventoryItem::active()
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
        if ($universityId) {
            $newAcquisitionsQuery->where('university_id', $universityId);
        }
        $newAcquisitions = $newAcquisitionsQuery->count();
        
        // Calculate depreciated value based on category depreciation rates
        $depreciatedValue = $this->calculateDepreciatedValue($universityId);

        return [
            'totalAssets' => $totalAssets,
            'totalValue' => round($totalValue, 2),
            'maintenanceDue' => $maintenanceDue,
            'lowStockItems' => $lowStockItems,
            'newAcquisitions' => $newAcquisitions,
            'depreciatedValue' => round($depreciatedValue, 2),
        ];
    }

    private function getPerformanceMetrics($dateRange, $realTime = false, $timeRange = 'last30days')
    {
        $universityId = Auth::user()->university_id ?? null;
        
        if ($realTime) {
            return $this->getFreshPerformanceMetrics($dateRange, $universityId);
        } else {
            $cacheKey = "performance_metrics_{$universityId}_{$timeRange}";
            return Cache::remember($cacheKey, 300, function() use ($dateRange, $universityId) {
                return $this->getFreshPerformanceMetrics($dateRange, $universityId);
            });
        }
    }

    private function getFreshPerformanceMetrics($dateRange, $universityId)
    {
        // Inventory Health - using InventoryItem stock status
        $totalItemsQuery = InventoryItem::active()->has('stockLevel');
        if ($universityId) {
            $totalItemsQuery->where('university_id', $universityId);
        }
        $totalItems = $totalItemsQuery->count();
        
        if ($totalItems > 0) {
            $adequateStockItemsQuery = InventoryItem::active()
                ->whereHas('stockLevel', function($query) {
                    $query->where('current_quantity', '>', DB::raw('reorder_level'));
                });
            
            if ($universityId) {
                $adequateStockItemsQuery->where('university_id', $universityId);
            }
            
            $adequateStockItems = $adequateStockItemsQuery->count();
            $inventoryHealth = round(($adequateStockItems / $totalItems) * 100);
        } else {
            $inventoryHealth = 100;
        }

        // Maintenance Efficiency
        $maintenanceQuery = MaintenanceRecord::whereBetween('scheduled_date', [$dateRange['start'], $dateRange['end']]);
        if ($universityId) {
            $maintenanceQuery->where('university_id', $universityId);
        }
        
        $totalMaintenance = $maintenanceQuery->count();
        
        $completedMaintenanceQuery = MaintenanceRecord::whereBetween('scheduled_date', [$dateRange['start'], $dateRange['end']])
            ->where('status', 'completed');
        
        if ($universityId) {
            $completedMaintenanceQuery->where('university_id', $universityId);
        }
        
        $completedMaintenance = $completedMaintenanceQuery->count();
        
        $maintenanceEfficiency = $totalMaintenance > 0 ? 
            round(($completedMaintenance / $totalMaintenance) * 100) : 100;

        // Procurement Success Rate
        $purchaseOrderQuery = PurchaseOrder::whereBetween('order_date', [$dateRange['start'], $dateRange['end']]);
        if ($universityId) {
            $purchaseOrderQuery->where('university_id', $universityId);
        }
        
        $totalOrders = $purchaseOrderQuery->count();
        
        $completedOrdersQuery = PurchaseOrder::whereBetween('order_date', [$dateRange['start'], $dateRange['end']])
            ->whereIn('status', ['received', 'closed']);
        
        if ($universityId) {
            $completedOrdersQuery->where('university_id', $universityId);
        }
        
        $completedOrders = $completedOrdersQuery->count();
        
        $procurementSuccess = $totalOrders > 0 ? 
            round(($completedOrders / $totalOrders) * 100) : 100;

        // Cost Savings - calculate based on purchase order discounts and efficient maintenance
        $costSavings = $this->calculateCostSavings($dateRange, $universityId);

        return [
            'inventoryHealth' => $inventoryHealth,
            'maintenanceEfficiency' => $maintenanceEfficiency,
            'procurementSuccess' => $procurementSuccess,
            'costSavings' => $costSavings,
        ];
    }

    private function getAlerts($realTime = false, $timeRange = 'last30days')
    {
        $universityId = Auth::user()->university_id ?? null;
        
        if ($realTime) {
            return $this->getFreshAlerts($universityId);
        } else {
            $cacheKey = "alerts_{$universityId}_{$timeRange}";
            return Cache::remember($cacheKey, 60, function() use ($universityId) {
                return $this->getFreshAlerts($universityId);
            });
        }
    }

    private function getFreshAlerts($universityId)
    {
        // Critical alerts - maintenance overdue
        $criticalMaintenanceQuery = MaintenanceRecord::with(['inventoryItem', 'department'])
            ->where('scheduled_date', '<', now())
            ->where('status', '!=', 'completed')
            ->where('priority', 'high');
        
        if ($universityId) {
            $criticalMaintenanceQuery->where('university_id', $universityId);
        }
        
        $criticalMaintenance = $criticalMaintenanceQuery->get()
            ->map(function($maintenance) {
                return [
                    'id' => $maintenance->maintenance_id,
                    'type' => 'maintenance',
                    'title' => "Overdue Maintenance: " . ($maintenance->inventoryItem->name ?? 'Unknown Item'),
                    'department' => $maintenance->department->name ?? 'Unknown Department',
                    'priority' => 'high',
                    'scheduled_date' => $maintenance->scheduled_date->format('M j, Y')
                ];
            });

        // Critical stock alerts - items below safety stock or out of stock
        $criticalStockQuery = InventoryItem::active()
            ->whereHas('stockLevel', function($query) {
                $query->where('current_quantity', '<=', DB::raw('safety_stock'))
                    ->orWhere('current_quantity', '<=', 0);
            })
            ->with(['stockLevel.department']);
        
        if ($universityId) {
            $criticalStockQuery->where('university_id', $universityId);
        }
        
        $criticalStock = $criticalStockQuery->get()
            ->map(function($item) {
                return [
                    'id' => $item->item_id,
                    'type' => 'stock',
                    'title' => "Critical Stock: {$item->name}",
                    'department' => $item->stockLevel->department->name ?? 'Unknown Department',
                    'priority' => 'high',
                    'current_quantity' => $item->stockLevel->current_quantity ?? 0
                ];
            });

        // Expiring items alerts
        $expiringItemsQuery = InventoryItem::active()
            ->where('expiry_date', '<=', now()->addDays(30))
            ->where('expiry_date', '>', now())
            ->with(['stockLevel.department']);
        
        if ($universityId) {
            $expiringItemsQuery->where('university_id', $universityId);
        }
        
        $expiringItems = $expiringItemsQuery->get()
            ->map(function($item) {
                return [
                    'id' => $item->item_id,
                    'type' => 'expiry',
                    'title' => "Expiring Soon: {$item->name}",
                    'department' => $item->stockLevel->department->name ?? 'Unknown Department',
                    'priority' => 'medium',
                    'expiry_date' => $item->expiry_date?->format('M j, Y')
                ];
            });

        // Warning alerts - low stock items (above safety stock but below reorder level)
        $warningAlertsQuery = InventoryItem::active()
            ->whereHas('stockLevel', function($query) {
                $query->where('current_quantity', '<=', DB::raw('reorder_level'))
                    ->where('current_quantity', '>', DB::raw('safety_stock'));
            })
            ->with(['stockLevel.department']);
        
        if ($universityId) {
            $warningAlertsQuery->where('university_id', $universityId);
        }
        
        $warningAlerts = $warningAlertsQuery->get()
            ->map(function($item) {
                return [
                    'id' => $item->item_id,
                    'type' => 'stock',
                    'title' => "Low Stock: {$item->name}",
                    'department' => $item->stockLevel->department->name ?? 'Unknown Department',
                    'priority' => 'medium',
                    'current_quantity' => $item->stockLevel->current_quantity ?? 0
                ];
            });

        return [
            'critical' => $criticalMaintenance->merge($criticalStock)->merge($expiringItems)->take(5)->values(),
            'warnings' => $warningAlerts->take(5)->values(),
        ];
    }

    private function getRecentActivity($dateRange, $realTime = false, $timeRange = 'last30days')
    {
        $universityId = Auth::user()->university_id ?? null;
        
        if ($realTime) {
            return $this->getFreshRecentActivity($dateRange, $universityId);
        } else {
            $cacheKey = "recent_activity_{$universityId}_{$timeRange}";
            return Cache::remember($cacheKey, 300, function() use ($dateRange, $universityId) {
                return $this->getFreshRecentActivity($dateRange, $universityId);
            });
        }
    }

    private function getFreshRecentActivity($dateRange, $universityId)
    {
        $activities = collect();

        // Recent acquisitions
        $recentAcquisitionsQuery = InventoryItem::with(['stockLevel.department'])
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->orderBy('created_at', 'desc')
            ->take(3);
        
        if ($universityId) {
            $recentAcquisitionsQuery->where('university_id', $universityId);
        }
        
        $recentAcquisitions = $recentAcquisitionsQuery->get()
            ->map(function($item) {
                return [
                    'id' => $item->item_id,
                    'action' => 'Acquisition',
                    'item' => $item->name,
                    'user' => 'System',
                    'time' => $item->created_at->diffForHumans(),
                    'value' => $item->unit_cost,
                    'type' => 'acquisition',
                    'department' => $item->stockLevel->department->name ?? 'Unknown Department'
                ];
            });

        // Recent maintenance
        $recentMaintenanceQuery = MaintenanceRecord::with(['inventoryItem', 'department'])
            ->whereBetween('scheduled_date', [$dateRange['start'], $dateRange['end']])
            ->orderBy('scheduled_date', 'desc')
            ->take(2);
        
        if ($universityId) {
            $recentMaintenanceQuery->where('university_id', $universityId);
        }
        
        $recentMaintenance = $recentMaintenanceQuery->get()
            ->map(function($maintenance) {
                return [
                    'id' => $maintenance->maintenance_id,
                    'action' => 'Maintenance',
                    'item' => $maintenance->inventoryItem->name ?? 'Unknown Item',
                    'user' => $maintenance->technician ?? 'Technician',
                    'time' => $maintenance->scheduled_date->diffForHumans(),
                    'value' => $maintenance->total_cost,
                    'type' => 'maintenance',
                    'department' => $maintenance->department->name ?? 'Unknown Department'
                ];
            });

        // Recent procurement
        $recentProcurementQuery = PurchaseOrder::with(['department', 'requestedBy'])
            ->whereBetween('order_date', [$dateRange['start'], $dateRange['end']])
            ->orderBy('order_date', 'desc')
            ->take(2);
        
        if ($universityId) {
            $recentProcurementQuery->where('university_id', $universityId);
        }
        
        $recentProcurement = $recentProcurementQuery->get()
            ->map(function($order) {
                return [
                    'id' => $order->order_id,
                    'action' => 'Procurement',
                    'item' => "PO: {$order->po_number}",
                    'user' => $order->requestedBy->name ?? 'Procurement Team',
                    'time' => $order->order_date->diffForHumans(),
                    'value' => $order->total_amount,
                    'type' => 'procurement',
                    'department' => $order->department->name ?? 'Unknown Department'
                ];
            });

        return $activities->merge($recentAcquisitions)
                        ->merge($recentMaintenance)
                        ->merge($recentProcurement)
                        ->sortByDesc(function($activity) {
                            return strtotime($activity['time']);
                        })
                        ->take(5)
                        ->values();
    }

    private function getTrendData($dateRange, $realTime = false, $timeRange = 'last30days')
    {
        $universityId = Auth::user()->university_id ?? null;
        
        if ($realTime) {
            return $this->getFreshTrendData($dateRange, $universityId);
        } else {
            $cacheKey = "trend_data_{$universityId}_{$timeRange}";
            return Cache::remember($cacheKey, 600, function() use ($dateRange, $universityId) {
                return $this->getFreshTrendData($dateRange, $universityId);
            });
        }
    }

    private function getFreshTrendData($dateRange, $universityId)
    {
        // Monthly spending trends
        $monthlySpendingQuery = PurchaseOrder::select(
            DB::raw('YEAR(order_date) as year'),
            DB::raw('MONTH(order_date) as month'),
            DB::raw('SUM(total_amount) as spending'),
            DB::raw('COUNT(*) as acquisitions')
        )
        ->whereBetween('order_date', [$dateRange['start'], $dateRange['end']]);
        
        if ($universityId) {
            $monthlySpendingQuery->where('university_id', $universityId);
        }
        
        $monthlySpending = $monthlySpendingQuery->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get()
            ->map(function($item) {
                $monthName = Carbon::create()->month($item->month)->format('M');
                return [
                    'month' => $monthName,
                    'spending' => $item->spending ?? 0,
                    'acquisitions' => $item->acquisitions
                ];
            });

        // Category distribution by value
        $categoryDistributionQuery = ItemCategory::withCount(['items' => function($query) use ($universityId) {
            $query->active();
            if ($universityId) {
                $query->where('university_id', $universityId);
            }
        }])
        ->withSum(['items' => function($query) use ($universityId) {
            $query->active();
            if ($universityId) {
                $query->where('university_id', $universityId);
            }
        }], 'current_value');
        
        $categoryDistribution = $categoryDistributionQuery->get()
            ->map(function($category) use ($universityId) {
                $totalValueQuery = InventoryItem::active();
                if ($universityId) {
                    $totalValueQuery->where('university_id', $universityId);
                }
                $totalValue = $totalValueQuery->sum('current_value') ?: 1;
                
                $categoryValue = $category->items_sum_current_value ?: 0;
                $percentage = ($categoryValue / $totalValue) * 100;
                
                return [
                    'name' => $category->name,
                    'value' => round($percentage, 2),
                    'count' => $category->items_count,
                    'total_value' => $categoryValue
                ];
            });

        // Department usage - Get department usage from StockLevel
        $departmentUsage = Department::select(
            'departments.department_id',
            'departments.name',
            DB::raw('COUNT(DISTINCT stock_levels.item_id) as item_count'),
            DB::raw('SUM(stock_levels.total_value) as total_value'),
            DB::raw('SUM(stock_levels.current_quantity) as total_quantity')
        )
        ->leftJoin('stock_levels', 'departments.department_id', '=', 'stock_levels.department_id')
        ->leftJoin('inventory_items', 'stock_levels.item_id', '=', 'inventory_items.item_id')
        ->where('inventory_items.is_active', true)
        ->when($universityId, function($query) use ($universityId) {
            $query->where('departments.university_id', $universityId)
                ->where('stock_levels.university_id', $universityId)
                ->where('inventory_items.university_id', $universityId);
        })
        ->groupBy('departments.department_id', 'departments.name')
        ->get()
        ->map(function($department) use ($universityId) {
            // Calculate total inventory value for percentage calculation
            $totalInventoryValue = StockLevel::when($universityId, function($query) use ($universityId) {
                $query->where('university_id', $universityId);
            })
            ->sum('total_value') ?: 1;
            
            $deptValue = $department->total_value ?: 0;
            $usagePercentage = ($deptValue / $totalInventoryValue) * 100;
            
            return [
                'department' => $department->name,
                'usage' => round($usagePercentage, 2),
                'value' => $deptValue,
                'item_count' => $department->item_count,
                'total_quantity' => $department->total_quantity
            ];
        });

        return [
            'monthlySpending' => $monthlySpending,
            'categoryDistribution' => $categoryDistribution,
            'departmentUsage' => $departmentUsage,
        ];
    }

    // Real-time data methods
    private function getRealTimeData()
    {
        $universityId = Auth::user()->university_id ?? null;
        
        return [
            'currentStockMovements' => $this->getCurrentStockMovements($universityId),
            'activeMaintenance' => $this->getActiveMaintenance($universityId),
            'pendingOrders' => $this->getPendingOrders($universityId),
            'serverTime' => now()->toISOString(),
        ];
    }

    private function getCurrentStockMovements($universityId)
    {
        // Get recent stock level updates (last 1 hour)
        return StockLevel::with(['item', 'department'])
            ->when($universityId, function($query) use ($universityId) {
                $query->where('university_id', $universityId);
            })
            ->where('last_updated', '>=', now()->subHour())
            ->orderBy('last_updated', 'desc')
            ->take(10)
            ->get()
            ->map(function($stockLevel) {
                return [
                    'item_name' => $stockLevel->item->name ?? 'Unknown Item',
                    'department' => $stockLevel->department->name ?? 'Unknown Department',
                    'current_quantity' => $stockLevel->current_quantity,
                    'available_quantity' => $stockLevel->available_quantity,
                    'last_updated' => $stockLevel->last_updated->diffForHumans(),
                ];
            });
    }

    private function getActiveMaintenance($universityId)
    {
        // Get currently active maintenance
        return MaintenanceRecord::with(['inventoryItem', 'department'])
            ->when($universityId, function($query) use ($universityId) {
                $query->where('university_id', $universityId);
            })
            ->where('status', 'in_progress')
            ->get()
            ->map(function($maintenance) {
                return [
                    'item_name' => $maintenance->inventoryItem->name ?? 'Unknown Item',
                    'technician' => $maintenance->technician ?? 'Unknown Technician',
                    'department' => $maintenance->department->name ?? 'Unknown Department',
                    'scheduled_date' => $maintenance->scheduled_date->format('M j, Y H:i'),
                    'priority' => $maintenance->priority,
                ];
            });
    }

    private function getPendingOrders($universityId)
    {
        // Get pending purchase orders
        return PurchaseOrder::with(['supplier', 'department'])
            ->when($universityId, function($query) use ($universityId) {
                $query->where('university_id', $universityId);
            })
            ->whereIn('status', ['draft', 'submitted', 'approved', 'ordered'])
            ->orderBy('order_date', 'desc')
            ->take(5)
            ->get()
            ->map(function($order) {
                return [
                    'po_number' => $order->po_number,
                    'supplier' => $order->supplier->name ?? 'Unknown Supplier',
                    'department' => $order->department->name ?? 'Unknown Department',
                    'total_amount' => $order->total_amount,
                    'status' => $order->status,
                    'order_date' => $order->order_date->format('M j, Y'),
                ];
            });
    }

    // Helper methods for calculations
    private function calculateDepreciatedValue($universityId = null)
    {
        // Calculate total depreciated value based on category depreciation rates
        $itemsQuery = InventoryItem::active()->with('category');
        if ($universityId) {
            $itemsQuery->where('university_id', $universityId);
        }
        
        $items = $itemsQuery->get();

        $totalDepreciatedValue = 0;

        foreach ($items as $item) {
            if ($item->category && $item->category->depreciation_rate > 0) {
                // Simple straight-line depreciation calculation
                $depreciationRate = $item->category->depreciation_rate / 100;
                $yearsOwned = $item->created_at->diffInYears(now());
                $depreciatedValue = $item->current_value * (1 - ($depreciationRate * $yearsOwned));
                $totalDepreciatedValue += max($depreciatedValue, 0);
            } else {
                $totalDepreciatedValue += $item->current_value;
            }
        }

        return $totalDepreciatedValue;
    }

    private function calculateCostSavings($dateRange, $universityId = null)
    {
        // Calculate cost savings from purchase order discounts and efficient maintenance
        $purchaseOrderSavingsQuery = PurchaseOrder::whereBetween('order_date', [
            $dateRange['start'], $dateRange['end']
        ]);
        
        if ($universityId) {
            $purchaseOrderSavingsQuery->where('university_id', $universityId);
        }
        
        $purchaseOrderSavings = $purchaseOrderSavingsQuery->sum('discount_amount');

        // Calculate maintenance cost savings (preventive vs corrective cost difference)
        $maintenanceSavings = $this->calculateMaintenanceSavings($dateRange, $universityId);

        $totalSavings = $purchaseOrderSavings + $maintenanceSavings;
        
        // Return as percentage of total spending for meaningful metric
        $totalSpendingQuery = PurchaseOrder::whereBetween('order_date', [
            $dateRange['start'], $dateRange['end']
        ]);
        
        if ($universityId) {
            $totalSpendingQuery->where('university_id', $universityId);
        }
        
        $totalSpending = $totalSpendingQuery->sum('total_amount');

        if ($totalSpending > 0) {
            return round(($totalSavings / $totalSpending) * 100, 2);
        }

        return 0;
    }

    private function calculateMaintenanceSavings($dateRange, $universityId = null)
    {
        // Simplified calculation: compare preventive maintenance cost vs estimated corrective cost
        $preventiveMaintenanceQuery = MaintenanceRecord::where('maintenance_type', 'preventive')
            ->whereBetween('scheduled_date', [$dateRange['start'], $dateRange['end']]);
        
        if ($universityId) {
            $preventiveMaintenanceQuery->where('university_id', $universityId);
        }
        
        $preventiveMaintenanceCost = $preventiveMaintenanceQuery->sum('total_cost');

        // Assume preventive maintenance saves 40% compared to corrective maintenance
        return $preventiveMaintenanceCost * 0.4;
    }

    public function exportDashboard(Request $request)
    {
        $timeRange = $request->get('time_range', 'last30days');
        $format = $request->get('format', 'pdf');
        
        // Generate export file (PDF, Excel, etc.)
        // This would use libraries like Laravel Excel or DomPDF
        
        return response()->json([
            'success' => true,
            'message' => "Dashboard exported successfully as {$format}",
            'download_url' => '/path/to/exported/file'
        ]);
    }

    public function refreshData(Request $request)
    {
        // Force refresh of cached data
        $universityId = Auth::user()->university_id ?? null;
        $timeRange = $request->get('time_range', 'last30days');
        
        // Clear all cached data for this university and time range
        Cache::forget("overview_metrics_{$universityId}_{$timeRange}");
        Cache::forget("performance_metrics_{$universityId}_{$timeRange}");
        Cache::forget("trend_data_{$universityId}_{$timeRange}");
        Cache::forget("alerts_{$universityId}_{$timeRange}");
        Cache::forget("recent_activity_{$universityId}_{$timeRange}");
        
        return $this->getDashboardData($request);
    }
}