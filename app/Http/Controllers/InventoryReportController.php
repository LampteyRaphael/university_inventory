<?php

namespace App\Http\Controllers;

use App\Models\ItemCategory;
use App\Models\Location;
use App\Models\Department;
use App\Models\Supplier;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class InventoryReportController extends Controller
{
    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    public function index(Request $request)
    {
        try {
            $universityId = Auth::user()->university_id;
            
            if (!$universityId) {
                throw new \Exception('University ID not found for user.');
            }

            // Get initial data for filters with caching
            $categories = Cache::remember("categories_{$universityId}", 3600, function () use ($universityId) {
                return ItemCategory::where('university_id', $universityId)
                    ->select('category_id as id', 'name')
                    ->orderBy('name')
                    ->get();
            });

            
            $locations = Cache::remember("locations_{$universityId}", 3600, function () use ($universityId) {
                return Location::where('university_id', $universityId)
                    ->select('location_id as id', 'name')
                    ->orderBy('name')
                    ->get();
            });
             // Get initial data for filters
     

             

            $departments = Cache::remember("departments_{$universityId}", 3600, function () use ($universityId) {
                return Department::where('university_id', $universityId)
                    ->select('department_id as id', 'name')
                    ->orderBy('name')
                    ->get();
            });

            $suppliers = Cache::remember("suppliers_{$universityId}", 3600, function () use ($universityId) {
                return Supplier::where('university_id', $universityId)
                    ->select('supplier_id as id', 'legal_name')
                    ->orderBy('legal_name')
                    ->get();
            });

            // Check if we have report data from a previous generation
            $reportData = $request->session()->get('report_data');
            $filters = $request->session()->get('report_filters', []);
            $reportGeneratedAt = $request->session()->get('report_generated_at');
            $reportType = $request->session()->get('report_type');

            // Don't clear session data immediately - keep it for the current request
            // The frontend will handle clearing it when needed

            return Inertia::render('InventoryReport/InventoryReport', [
                'categories' => $categories,
                'locations' => $locations,
                'departments' => $departments,
                'suppliers' => $suppliers,
                'reportData' => $reportData,
                'filters' => $filters,
                'reportGeneratedAt' => $reportGeneratedAt,
                'reportType' => $reportType,
                'initialData' => [
                    'reportTypes' => $this->getReportTypes(),
                    'dateRanges' => $this->getDateRanges(),
                    'chartTypes' => $this->getChartTypes(),
                    'dataDepthOptions' => $this->getDataDepthOptions(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Report index error: ' . $e->getMessage());

            return Inertia::render('InventoryReport/InventoryReport', [
                'categories' => [],
                'locations' => [],
                'departments' => [],
                'suppliers' => [],
                'reportData' => null,
                'filters' => [],
                'error' => 'Unable to load report data. Please try again.',
                'initialData' => [
                    'reportTypes' => $this->getReportTypes(),
                    'dateRanges' => $this->getDateRanges(),
                    'chartTypes' => $this->getChartTypes(),
                    'dataDepthOptions' => $this->getDataDepthOptions(),
                ]
            ]);
        }
    }

    public function generate(Request $request)
    {
        $validated = $request->validate([
            'report_type' => 'required|string|in:comprehensive,stock-level,acquisition,depreciation,audit,procurement,maintenance',
            'categories' => 'sometimes|array',
            'locations' => 'sometimes|array',
            'departments' => 'sometimes|array',
            'date_range' => 'sometimes|string|in:last7days,last30days,last90days,currentMonth,currentQuarter,currentYear,previousMonth,previousQuarter,previousYear,custom',
            'custom_start_date' => 'nullable|date|required_if:date_range,custom',
            'custom_end_date' => 'nullable|date|after_or_equal:custom_start_date|required_if:date_range,custom',
            'include_charts' => 'sometimes|boolean',
            'include_tables' => 'sometimes|boolean',
            'include_summary' => 'sometimes|boolean',
            'export_format' => 'sometimes|string|in:pdf,excel,csv,html',
            'chart_types' => 'sometimes|array',
            'data_depth' => 'sometimes|string|in:summary,detailed,granular',
            'compare_period' => 'sometimes|boolean',
        ]);

        try {
            $reportData = match($validated['report_type']) {
                'comprehensive' => $this->reportService->generateInventoryReport($validated),
                'stock-level' => $this->reportService->generateStockLevelReport($validated),
                'acquisition' => $this->reportService->generateAcquisitionReport($validated),
                'depreciation' => $this->reportService->generateDepreciationReport($validated),
                'audit' => $this->reportService->generateAuditReport($validated),
                'procurement' => $this->reportService->generateProcurementReport($validated),
                'maintenance' => $this->reportService->generateMaintenanceReport($validated),
                default => $this->reportService->generateInventoryReport($validated),
            };

            // Store data in session for the next request
            $request->session()->put('report_data', $reportData);
            $request->session()->put('report_filters', $validated);
            $request->session()->put('report_generated_at', now()->toISOString());
            $request->session()->put('report_type', $validated['report_type']);

            // Check if export is requested
            // if ($request->has('export_format') && in_array($request->export_format, ['pdf', 'excel', 'csv'])) {
            //     return $this->exportReport($request, $reportData, $validated);
            // }

            // Return JSON response for AJAX requests or redirect for form submissions
            // if ($request->expectsJson() || $request->header('X-Inertia')) {
            //     return response()->json([
            //         'success' => true,
            //         'reportData' => $reportData,
            //         'filters' => $validated,
            //         'generated_at' => now()->toISOString(),
            //         'message' => 'Report generated successfully!'
            //     ]);
            // }

            // Redirect back to the index page with success message
             return back()->with([
                'success' => 'Report generated successfully!',
                'generated_at' => now()->toISOString(),
                'report_type' => $validated['report_type'],
                'has_data' => !empty($reportData),
            ]);

        } catch (\Exception $e) {
            Log::error('Report generation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'filters' => $validated,
                'user_id' => Auth::id(),
            ]);

            $errorMessage = 'Failed to generate report: ' . $e->getMessage();

            if ($request->expectsJson() || $request->header('X-Inertia')) {
                return response()->json([
                    'success' => false,
                    'error' => $errorMessage,
                ], 500);
            }

            return redirect()->back()->with([
                'error' => $errorMessage,
            ])->withInput();
        }
    }

    /**
     * Quick report generation for common report types
     */
    public function quickReport(Request $request, string $type)
    {
        $validTypes = ['comprehensive', 'stock-level', 'acquisition', 'depreciation', 'audit', 'procurement', 'maintenance'];
        
        if (!in_array($type, $validTypes)) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid report type'
            ], 400);
        }

        try {
            $filters = [
                'report_type' => $type,
                'date_range' => 'last30days',
                'include_charts' => true,
                'include_tables' => true,
                'include_summary' => true,
            ];

            $reportData = $this->reportService->{"generate" . ucfirst($type) . "Report"}($filters);

            // Store in session
            $request->session()->put('report_data', $reportData);
            $request->session()->put('report_filters', $filters);
            $request->session()->put('report_generated_at', now()->toISOString());
            $request->session()->put('report_type', $type);

            return response()->json([
                'success' => true,
                'reportData' => $reportData,
                'filters' => $filters,
                'generated_at' => now()->toISOString(),
                'message' => ucfirst($type) . ' report generated successfully!'
            ]);

        } catch (\Exception $e) {
            Log::error('Quick report generation failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Failed to generate quick report: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export report in various formats
     */
    public function exportReport(Request $request, $reportData = null, $filters = null)
    {
        try {
            // If no data provided, get from session
            if (!$reportData) {
                $reportData = $request->session()->get('report_data');
                $filters = $request->session()->get('report_filters');
            }

            if (!$reportData) {
                throw new \Exception('No report data available for export. Please generate a report first.');
            }

            $exportFormat = $request->export_format ?? $filters['export_format'] ?? 'pdf';
            $reportType = $request->session()->get('report_type') ?? $filters['report_type'] ?? 'comprehensive';

            $exportData = $this->reportService->exportReport($reportData, $exportFormat, [
                'report_type' => $reportType,
                'filters' => $filters,
                'generated_by' => Auth::user()->name,
                'generated_at' => now()->toISOString(),
            ]);

            // Return appropriate response based on format
            return match($exportFormat) {
                'pdf' => $this->exportAsPdf($exportData, $reportType),
                'excel' => $this->exportAsExcel($exportData, $reportType),
                'csv' => $this->exportAsCsv($exportData, $reportType),
                'html' => $this->exportAsHtml($exportData, $reportType),
                default => $this->exportAsPdf($exportData, $reportType),
            };

        } catch (\Exception $e) {
            Log::error('Report export failed: ' . $e->getMessage());

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to export report: ' . $e->getMessage(),
                ], 500);
            }

            return redirect()->back()->with([
                'error' => 'Failed to export report: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Preview report without saving to session
     */
    public function preview(Request $request)
    {
        $validated = $request->validate([
            'report_type' => 'required|string|in:comprehensive,stock-level,acquisition,depreciation,audit,procurement,maintenance',
            'categories' => 'sometimes|array',
            'locations' => 'sometimes|array',
            'departments' => 'sometimes|array',
            'date_range' => 'sometimes|string',
            'custom_start_date' => 'nullable|date',
            'custom_end_date' => 'nullable|date|after_or_equal:custom_start_date',
            'include_charts' => 'sometimes|boolean',
            'include_tables' => 'sometimes|boolean',
            'include_summary' => 'sometimes|boolean',
        ]);

        try {
            $reportData = match($validated['report_type']) {
                'comprehensive' => $this->reportService->generateInventoryReport($validated),
                'stock-level' => $this->reportService->generateStockLevelReport($validated),
                'acquisition' => $this->reportService->generateAcquisitionReport($validated),
                'depreciation' => $this->reportService->generateDepreciationReport($validated),
                'audit' => $this->reportService->generateAuditReport($validated),
                'procurement' => $this->reportService->generateProcurementReport($validated),
                'maintenance' => $this->reportService->generateMaintenanceReport($validated),
                default => $this->reportService->generateInventoryReport($validated),
            };

            return response()->json([
                'success' => true,
                'data' => $reportData,
                'preview' => true,
                'generated_at' => now()->toISOString(),
            ]);

        } catch (\Exception $e) {
            Log::error('Report preview failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Failed to generate preview: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get available report filters and options
     */
    public function getFilterOptions(Request $request)
    {
        try {
            $universityId = Auth::user()->university_id;

            $options = [
                'categories' => ItemCategory::where('university_id', $universityId)
                    ->select('category_id as id', 'name')
                    ->orderBy('name')
                    ->get()
                    ->toArray(),
                'departments' => Department::where('university_id', $universityId)
                    ->select('department_id as id', 'name')
                    ->orderBy('name')
                    ->get()
                    ->toArray(),
                'locations' => Location::where('university_id', $universityId)
                    ->select('location_id as id', 'name')
                    ->orderBy('name')
                    ->get()
                    ->toArray(),
                'suppliers' => Supplier::where('university_id', $universityId)
                    ->select('supplier_id as id', 'name')
                    ->orderBy('name')
                    ->get()
                    ->toArray(),
                'date_ranges' => $this->getDateRanges(),
                'report_types' => $this->getReportTypes(),
                'chart_types' => $this->getChartTypes(),
                'data_depth_options' => $this->getDataDepthOptions(),
                'maintenance_types' => [
                    ['value' => 'preventive', 'label' => 'Preventive'],
                    ['value' => 'corrective', 'label' => 'Corrective'],
                    ['value' => 'predictive', 'label' => 'Predictive'],
                    ['value' => 'condition_based', 'label' => 'Condition Based'],
                    ['value' => 'emergency', 'label' => 'Emergency'],
                ],
                'priority_levels' => [
                    ['value' => 'low', 'label' => 'Low'],
                    ['value' => 'medium', 'label' => 'Medium'],
                    ['value' => 'high', 'label' => 'High'],
                    ['value' => 'critical', 'label' => 'Critical'],
                ],
                'order_types' => [
                    ['value' => 'regular', 'label' => 'Regular'],
                    ['value' => 'emergency', 'label' => 'Emergency'],
                    ['value' => 'capital', 'label' => 'Capital'],
                    ['value' => 'consumable', 'label' => 'Consumable'],
                    ['value' => 'service', 'label' => 'Service'],
                ],
            ];

            return response()->json($options);

        } catch (\Exception $e) {
            Log::error('Failed to get filter options: ' . $e->getMessage());

            return response()->json([
                'error' => 'Failed to load filter options',
            ], 500);
        }
    }

    // ==================== PRIVATE EXPORT METHODS ====================

    /**
     * Export report as PDF
     */
    private function exportAsPdf(array $exportData, string $reportType)
    {
        // You'll need to install a PDF library like dompdf or mpdf
        // For now, return a JSON response or implement your PDF logic
        return response()->json([
            'message' => 'PDF export would be implemented here',
            'data' => $exportData,
            'type' => $reportType
        ]);
    }

    /**
     * Export report as Excel
     */
    private function exportAsExcel(array $exportData, string $reportType)
    {
        // You'll need to install maatwebsite/excel or similar
        // For now, return a JSON response
        return response()->json([
            'message' => 'Excel export would be implemented here',
            'data' => $exportData,
            'type' => $reportType
        ]);
    }

    /**
     * Export report as CSV
     */
    private function exportAsCsv(array $exportData, string $reportType)
    {
        // Simple CSV implementation
        $filename = $this->generateFilename($reportType, 'csv');
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($exportData) {
            $file = fopen('php://output', 'w');
            
            // Add headers
            fputcsv($file, ['Report Data', 'Value']);
            
            // Add some sample data - you would iterate through your actual data
            foreach ($exportData['export_data'] as $key => $value) {
                if (is_array($value)) {
                    foreach ($value as $subKey => $subValue) {
                        fputcsv($file, [$subKey, $subValue]);
                    }
                } else {
                    fputcsv($file, [$key, $value]);
                }
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export report as HTML
     */
    private function exportAsHtml(array $exportData, string $reportType)
    {
        return response()->json([
            'message' => 'HTML export would be implemented here',
            'data' => $exportData,
            'type' => $reportType
        ]);
    }

    /**
     * Generate filename for export
     */
    private function generateFilename(string $reportType, string $format): string
    {
        $typeMap = [
            'comprehensive' => 'comprehensive-inventory',
            'stock-level' => 'stock-level',
            'acquisition' => 'acquisition',
            'depreciation' => 'depreciation',
            'audit' => 'audit-trail',
            'procurement' => 'procurement',
            'maintenance' => 'maintenance',
        ];

        $type = $typeMap[$reportType] ?? 'report';
        $timestamp = now()->format('Y-m-d_H-i-s');

        return "{$type}-report_{$timestamp}.{$format}";
    }

    /**
     * Clear report data from session
     */
    public function clear(Request $request)
    {
        $request->session()->forget([
            'report_data', 
            'report_filters', 
            'report_generated_at',
            'report_type'
        ]);
        
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Report data cleared successfully!'
            ]);
        }

        return redirect()->route('inventory-report.index')->with([
            'success' => 'Report data cleared successfully!'
        ]);
    }

    // ==================== HELPER METHODS ====================

    private function getReportTypes(): array
    {
        return [
            ['value' => 'comprehensive', 'label' => 'Comprehensive Inventory Report'],
            ['value' => 'stock-level', 'label' => 'Stock Level Report'],
            ['value' => 'acquisition', 'label' => 'Acquisition Report'],
            ['value' => 'depreciation', 'label' => 'Depreciation Report'],
            ['value' => 'audit', 'label' => 'Audit Trail Report'],
            ['value' => 'procurement', 'label' => 'Procurement Performance Report'],
            ['value' => 'maintenance', 'label' => 'Maintenance Performance Report'],
        ];
    }

    private function getDateRanges(): array
    {
        return [
            ['value' => 'last7days', 'label' => 'Last 7 Days'],
            ['value' => 'last30days', 'label' => 'Last 30 Days'],
            ['value' => 'last90days', 'label' => 'Last 90 Days'],
            ['value' => 'currentMonth', 'label' => 'Current Month'],
            ['value' => 'currentQuarter', 'label' => 'Current Quarter'],
            ['value' => 'currentYear', 'label' => 'Current Year'],
            ['value' => 'previousMonth', 'label' => 'Previous Month'],
            ['value' => 'previousQuarter', 'label' => 'Previous Quarter'],
            ['value' => 'previousYear', 'label' => 'Previous Year'],
            ['value' => 'custom', 'label' => 'Custom Range'],
        ];
    }

    private function getChartTypes(): array
    {
        return [
            ['value' => 'bar', 'label' => 'Bar Charts'],
            ['value' => 'pie', 'label' => 'Pie Charts'],
            ['value' => 'line', 'label' => 'Line Charts'],
            ['value' => 'area', 'label' => 'Area Charts'],
        ];
    }

    private function getDataDepthOptions(): array
    {
        return [
            ['value' => 'summary', 'label' => 'Summary Only'],
            ['value' => 'detailed', 'label' => 'Detailed Data'],
            ['value' => 'granular', 'label' => 'Granular Level'],
        ];
    }
}