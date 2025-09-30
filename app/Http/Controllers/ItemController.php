<?php
// app/Http/Controllers/ItemController.php

namespace App\Http\Controllers;

use App\Http\Requests\ItemPostResquest;
use App\Models\InventoryItem;
use App\Models\ItemCategory;
use App\Models\University;
use App\Repositories\ItemRepository;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ItemController extends Controller
{
    private $itemRepository;

    public function __construct(ItemRepository $itemRepository)
    {
        $this->itemRepository = $itemRepository;
    }


    public function index(Request $request)
    {
        try {
            $filters = $request->only([
                'university_id', 'category_id', 'abc_classification', 
                'is_active', 'search', 'order_by', 'order_direction'
            ]);

            // Clean filters
            $cleanedFilters = array_map(function($value) {
                return $value === '' ? null : $value;
            }, $filters);

            $items = $this->itemRepository->getAll($cleanedFilters);
            
            // Optimize categories and universities queries
            $categories = ItemCategory::select('category_id', 'name')
                ->orderBy('name')
                ->limit(100)
                ->get();
                
            $universities = University::select('university_id', 'name')
                ->orderBy('name')
                ->limit(100)
                ->get();


            return Inertia::render('Items/Items', [
                'items' => $items,
                'categories' => $categories,
                'universities' => $universities
            ]);

        } catch (\Exception $e) {
            Log::error('Items index error:', ['error' => $e->getMessage()]);
            
            return Inertia::render('Items/Items', [
                'items' => ['data' => []],
                'categories' => [],
                'universities' => []
            ]);
        }
    }

    public function store(ItemPostResquest $request): RedirectResponse
    {
        try {

            $validated = $request->validated();
            $item = $this->itemRepository->create($validated);

            return redirect()
                ->route('item.index')
                ->with('success', 'Item created successfully!');
            // return redirect()->back()->with('success', 'Item created successfully!');

        } catch (\Illuminate\Validation\ValidationException $e) {
            // return response()->json([
            //     'success' => false,
            //     'message' => 'Validation failed',
            //     'errors' => $e->errors()
            // ], 422);
                        return redirect()->back()->with('errors', $e->errors());

        } catch (\Exception $e) {
            // return response()->json([
            //     'success' => false,
            //     'message' => 'Failed to create item: ' . $e->getMessage()
            // ], 500);
            return redirect()->back()->with('errors', 'Failed to create item: ' . $e->getMessage());

        }
    }

    public function show($id): JsonResponse
    {
        try {
            $item = $this->itemRepository->findById($id);
            
            if (!$item) {
                return response()->json([
                    'success' => false,
                    'message' => 'Item not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $item
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve item: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'category_id' => 'sometimes|uuid|exists:item_categories,category_id',
                'item_code' => 'sometimes|string|max:50|unique:inventory_items,item_code,' . $id . ',item_id',
                'name' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'specifications' => 'nullable|array',
                'unit_of_measure' => 'sometimes|string|max:50',
                'unit_cost' => 'sometimes|numeric|min:0',
                'current_value' => 'nullable|numeric|min:0',
                'minimum_stock_level' => 'sometimes|integer|min:0',
                'maximum_stock_level' => 'nullable|integer|min:0',
                'reorder_point' => 'sometimes|integer|min:0',
                'economic_order_quantity' => 'nullable|integer|min:0',
                'abc_classification' => 'sometimes|in:A,B,C',
                'weight_kg' => 'nullable|numeric|min:0',
                'volume_cubic_m' => 'nullable|numeric|min:0',
                'is_hazardous' => 'boolean',
                'hazard_type' => 'nullable|string|max:100',
                'handling_instructions' => 'nullable|string',
                'storage_conditions' => 'nullable|string|max:255',
                'shelf_life_days' => 'nullable|integer|min:0',
                'expiry_date' => 'nullable|date',
                'barcode' => 'nullable|string|max:255|unique:inventory_items,barcode,' . $id . ',item_id',
                'qr_code' => 'nullable|string|max:255|unique:inventory_items,qr_code,' . $id . ',item_id',
                'rfid_tag' => 'nullable|string|max:255|unique:inventory_items,rfid_tag,' . $id . ',item_id',
                'image_url' => 'nullable|url|max:500',
                'document_url' => 'nullable|url|max:500',
                'is_active' => 'boolean'
            ]);

            $item = $this->itemRepository->update($id, $validated);
            return redirect()->back()->with('success', 'Item updated successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {

            throw $e;

        } catch (\Exception $e) {

              return redirect()->back()->with('error', 'Failed to update item: ' . $e->getMessage());

        }
    }

    public function destroy($id): RedirectResponse
    {
        try {
            $this->itemRepository->delete($id);

             return redirect()->back()->with('success', 'Item deleted successfully');

        } catch (\Exception $e) {
             return redirect()->back()->with('error', 'Failed to delete item: ');
        }
    }

    public function lowStock(Request $request): JsonResponse
    {
        try {
            $universityId = $request->get('university_id');
            $items = $this->itemRepository->getLowStockItems($universityId);

            return response()->json([
                'success' => true,
                'data' => $items
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve low stock items: ' . $e->getMessage()
            ], 500);
        }
    }

    public function expiringSoon(Request $request): JsonResponse
    {
        try {
            $days = $request->get('days', 30);
            $universityId = $request->get('university_id');
            $items = $this->itemRepository->getExpiringItems($days, $universityId);

            return response()->json([
                'success' => true,
                'data' => $items
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve expiring items: ' . $e->getMessage()
            ], 500);
        }
    }
}