<?php
// app/Repositories/ItemRepository.php

namespace App\Repositories;

use App\Models\InventoryItem;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ItemRepository
{

    public function getAll($filters = [], $perPage = 15)
    {
        $query = InventoryItem::with([
            'university:university_id,name', // Only select needed fields
            'category:category_id,name',
            'creator:id,name',
            'updater:id,name'
        ])->select([
            'item_id',
            'university_id',
            'category_id',
            'item_code',
            'name',
            'description', // Keep description but limit length if needed
            'unit_of_measure',
            'unit_cost',
            'current_value',
            'minimum_stock_level',
            'maximum_stock_level',
            'reorder_point',
            'economic_order_quantity',
            'abc_classification',
            'weight_kg',
            'volume_cubic_m',
            'is_hazardous',
            'hazard_type',
            'storage_conditions',
            'shelf_life_days',
            'expiry_date',
            'barcode',
            'qr_code',
            'rfid_tag',
            'image_url',
            'is_active',
            'created_by',
            'updated_by',
            'created_at',
            'updated_at'
        ]);

        // Apply filters
        $cleanedFilters = array_filter($filters, function($value) {
            return $value !== '' && $value !== null;
        });

        if (!empty($cleanedFilters['university_id'])) {
            $query->where('university_id', $cleanedFilters['university_id']);
        }

        if (!empty($cleanedFilters['category_id'])) {
            $query->where('category_id', $cleanedFilters['category_id']);
        }

        if (!empty($cleanedFilters['abc_classification'])) {
            $query->where('abc_classification', $cleanedFilters['abc_classification']);
        }

        if (isset($cleanedFilters['is_active'])) {
            $query->where('is_active', (bool)$cleanedFilters['is_active']);
        }

        if (!empty($cleanedFilters['search'])) {
            $search = trim($cleanedFilters['search']);
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                ->orWhere('item_code', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $orderBy = $cleanedFilters['order_by'] ?? 'created_at';
        $orderDirection = $cleanedFilters['order_direction'] ?? 'desc';
        $query->orderBy($orderBy, $orderDirection);

        return $query->paginate($perPage);
    }

    public function findById($itemId)
    {
        return InventoryItem::with(['university', 'category', 'creator', 'updater'])
                  ->where('item_id', $itemId)
                  ->first();
    }

    public function findByCode($itemCode)
    {
        return InventoryItem::with(['university', 'category'])
                  ->where('item_code', $itemCode)
                  ->first();
    }

    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {
            // Generate UUID if not provided
            if (empty($data['item_id'])) {
                $data['item_id'] = Str::uuid()->toString();
            }

            // Ensure created_by is set
            if (empty($data['created_by'])) {
                $data['created_by'] = Auth::id() ?? null;
            }

            // Handle specifications if provided as array
            if (isset($data['specifications']) && is_array($data['specifications'])) {
                $data['specifications'] = json_encode($data['specifications']);
            }

            return InventoryItem::create($data);
        });
    }

    public function update($itemId, array $data)
    {
        return DB::transaction(function () use ($itemId, $data) {
            $item = $this->findById($itemId);
            
            if (!$item) {
                throw new \Exception("Item not found");
            }

            // Set updated_by
            $data['updated_by'] = Auth::id() ?? null;

            // Handle specifications if provided as array
            if (isset($data['specifications']) && is_array($data['specifications'])) {
                $data['specifications'] = json_encode($data['specifications']);
            }

            $item->update($data);
            return $item->fresh();
        });
    }

    public function delete($itemId)
    {
        return DB::transaction(function () use ($itemId) {
            $item = $this->findById($itemId);
            
            if (!$item) {
                throw new \Exception("Item not found");
            }

            // Check if item can be deleted (no dependent records)
            // You might want to add additional checks here
            
            return $item->delete();
        });
    }

    public function forceDelete($itemId)
    {
        return DB::transaction(function () use ($itemId) {
            $item = InventoryItem::withTrashed()->where('item_id', $itemId)->first();
            
            if (!$item) {
                throw new \Exception("Item not found");
            }

            return $item->forceDelete();
        });
    }

    public function restore($itemId)
    {
        return DB::transaction(function () use ($itemId) {
            $item = InventoryItem::withTrashed()->where('item_id', $itemId)->first();
            
            if (!$item) {
                throw new \Exception("Item not found");
            }

            return $item->restore();
        });
    }

    public function updateStockLevels($itemId, array $stockData)
    {
        return $this->update($itemId, [
            'minimum_stock_level' => $stockData['minimum_stock_level'] ?? null,
            'maximum_stock_level' => $stockData['maximum_stock_level'] ?? null,
            'reorder_point' => $stockData['reorder_point'] ?? null,
            'economic_order_quantity' => $stockData['economic_order_quantity'] ?? null,
            'updated_by' => Auth::id()
        ]);
    }

    public function updateClassification($itemId, $classification)
    {
        if (!in_array($classification, ['A', 'B', 'C'])) {
            throw new \Exception("Invalid ABC classification");
        }

        return $this->update($itemId, [
            'abc_classification' => $classification,
            'updated_by' => Auth::id()
        ]);
    }

    public function getLowStockItems($universityId = null)
    {
        $query = InventoryItem::active()->lowStock();

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        return $query->with(['university', 'category'])->get();
    }

    public function getExpiringItems($days = 30, $universityId = null)
    {
        $query = InventoryItem::active()->expiringSoon($days);

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        return $query->with(['university', 'category'])->get();
    }

    public function checkCodeExists($itemCode, $excludeItemId = null)
    {
        $query = InventoryItem::where('item_code', $itemCode);

        if ($excludeItemId) {
            $query->where('item_id', '!=', $excludeItemId);
        }

        return $query->exists();
    }

    public function checkBarcodeExists($barcode, $excludeItemId = null)
    {
        $query = InventoryItem::where('barcode', $barcode);

        if ($excludeItemId) {
            $query->where('item_id', '!=', $excludeItemId);
        }

        return $query->exists();
    }
}