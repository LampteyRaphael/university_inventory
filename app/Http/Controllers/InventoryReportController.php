<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryReportController extends Controller
{
      protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    public function index(){

         return Inertia::render('InventoryReport/InventoryReport', [
        ]);
    }

public function generate(Request $request)
    {
        $validated = $request->validate([
            'report_type' => 'required|string|in:comprehensive,stock-level,acquisition,depreciation,audit',
            'categories' => 'sometimes|array',
            'locations' => 'sometimes|array',
            'date_range' => 'sometimes|string',
            'custom_start_date' => 'nullable|date',
            'custom_end_date' => 'nullable|date|after_or_equal:custom_start_date',
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
                // 'acquisition' => $this->reportService->generateAcquisitionReport($validated),
                // 'depreciation' => $this->reportService->generateDepreciationReport($validated),
                // 'audit' => $this->reportService->generateAuditReport($validated),
                default => $this->reportService->generateInventoryReport($validated),
            };

            return response()->json([
                'success' => true,
                'data' => $reportData,
                'generated_at' => now()->toISOString(),
                'filters' => $validated,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to generate report: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function export(Request $request)
    {
        $validated = $request->validate([
            'format' => 'required|in:pdf,excel,csv',
            'report_data' => 'required|array',
            'config' => 'required|array',
        ]);

        try {
            $exportData = $this->reportService->exportReport(
                $validated['report_data'],
                $validated['format'],
                $validated['config']
            );

            return response()->json([
                'success' => true,
                'export_data' => $exportData,
                'download_url' => null, // Would be generated for actual file download
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Export failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}
