<?php
// app/Repositories/ItemRepository.php

namespace App\Repositories;

use App\Models\InventoryItem;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ItemRepository
{

    public function getAll()
    {
        $query = InventoryItem::orderBy('created_at','desc')->with([
            'university:university_id,name', // Only select needed fields
            'category:category_id,name',
            'creator:user_id,name',
            'updater:user_id,name'
        ])->get()->map(function ($item){
          return [
                    'item_id' => $item->item_id,
                    'university_id' => $item->university_id,
                    'university' => $item->university->name??null,
                    'category_id' => $item->category_id,
                    'category' => $item->category->name??'',
                    'item_code' => $item->item_code,
                    'name' => $item->name??null,
                    'description' => $item->description, // limit description length
                    'unit_of_measure' => $item->unit_of_measure,
                    'unit_cost' => $item->unit_cost,
                    'current_value' => $item->current_value,
                    'minimum_stock_level' => $item->minimum_stock_level,
                    'maximum_stock_level' => $item->maximum_stock_level,
                    'reorder_point' => $item->reorder_point,
                    'economic_order_quantity' => $item->economic_order_quantity,
                    'abc_classification' => $item->abc_classification,
                    'weight_kg' => $item->weight_kg,
                    'volume_cubic_m' => $item->volume_cubic_m,
                    'is_hazardous' => $item->is_hazardous,
                    'hazard_type' => $item->hazard_type,
                    'storage_conditions' => $item->storage_conditions,
                    'handling_instructions' => $item->handling_instructions,
                    'specifications' => $item->specifications,
                    'shelf_life_days' => $item->shelf_life_days,
                    'expiry_date' => $item->expiry_date??'',
                    'barcode' => $item->barcode,
                    'qr_code' => $item->qr_code,
                    'rfid_tag' => $item->rfid_tag,
                    'image_url' => $item->image_url,
                    'is_active' => $item->is_active,
                    'created_by' => $item->created_by,
                    'creator' => $item->creator->name??null,
                    'updated_by' => $item->updated_by,
                    'updater' => $item->updater->name??null,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
          ];
        });
        return $query;
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
                $data['created_by'] = Auth::user()->user_id ?? null;
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
            $data['updated_by'] = Auth::user()->user_id ?? null;

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
            'updated_by' => Auth::user()->user_id ?? null
        ]);
    }

    public function updateClassification($itemId, $classification)
    {
        if (!in_array($classification, ['A', 'B', 'C'])) {
            throw new \Exception("Invalid ABC classification");
        }

        return $this->update($itemId, [
            'abc_classification' => $classification,
            'updated_by' => Auth::user()->user_id ?? null
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