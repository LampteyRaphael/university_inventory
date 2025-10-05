<?php

namespace App\Http\Controllers;

use App\Models\ItemCategory;
use App\Models\Location;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        // Get initial data for filters
        $categories = ItemCategory::
        where('university_id', Auth::user()->university_id)
            ->select('category_id as id', 'name')
            ->get();
            
        $locations = Location::where('university_id', Auth::user()->university_id)
            ->select('location_id as id', 'name')
            ->get();

        // Check if we have report data from a previous generation
        $reportData = $request->session()->get('report_data');
        $filters = $request->session()->get('report_filters');

        // Clear the session data after reading
        if ($reportData) {
            $request->session()->forget(['report_data', 'report_filters']);
        }

        return Inertia::render('InventoryReport/InventoryReport', [
            'categories' => $categories,
            'locations' => $locations,
            'reportData' => $reportData,
            'filters' => $filters,
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
                'acquisition' => $this->reportService->generateAcquisitionReport($validated),
                'depreciation' => $this->reportService->generateDepreciationReport($validated),
                'audit' => $this->reportService->generateAuditReport($validated),
                default => $this->reportService->generateInventoryReport($validated),
            };

            // Store data in session for the next request
            $request->session()->put('report_data', $reportData);
            $request->session()->put('report_filters', $validated);
            $request->session()->put('report_generated_at', now()->toISOString());

            // Redirect back to the index page with success message
            return redirect()->route('inventory-report.index')->with([
                'success' => 'Report generated successfully!',
                'generated_at' => now()->toISOString(),
            ]);

        } catch (\Exception $e) {
            return redirect()->back()->with([
                'error' => 'Failed to generate report: ' . $e->getMessage(),
            ]);
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

            // For file download, you might want to return a different response
            // For now, we'll redirect back with success
            return redirect()->back()->with([
                'success' => 'Report exported successfully!',
                'export_data' => $exportData,
            ]);

        } catch (\Exception $e) {
            return redirect()->back()->with([
                'error' => 'Export failed: ' . $e->getMessage(),
            ]);
        }
    }

    // New method to clear report data
    public function clear(Request $request)
    {
        $request->session()->forget(['report_data', 'report_filters', 'report_generated_at']);
        
        return redirect()->route('reports.index')->with([
            'success' => 'Report data cleared successfully!'
        ]);
    }
}