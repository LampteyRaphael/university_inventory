<?php

namespace App\Repositories;

use App\Models\ItemCategory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ItemCategoryRepository
{
    public function getAll($filters = [], $perPage = 500)
    {
        $query = ItemCategory::with([
            'university:university_id,name',
            'parent:category_id,name',
        ])->select([
            'category_id',
            'university_id',
            'parent_category_id',
            'category_code',
            'name',
            'description',
            'image_url',
            'warranty_period_days',
            'depreciation_rate',
            'depreciation_method',
            'requires_serial_number',
            'requires_maintenance',
            'maintenance_interval_days',
            'specification_template',
            'is_active',
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

        if (!empty($cleanedFilters['parent_category_id'])) {
            $query->where('parent_category_id', $cleanedFilters['parent_category_id']);
        }

        if (isset($cleanedFilters['is_active'])) {
            $query->where('is_active', (bool)$cleanedFilters['is_active']);
        }

        if (!empty($cleanedFilters['requires_maintenance'])) {
            $query->where('requires_maintenance', (bool)$cleanedFilters['requires_maintenance']);
        }

        if (!empty($cleanedFilters['requires_serial_number'])) {
            $query->where('requires_serial_number', (bool)$cleanedFilters['requires_serial_number']);
        }

        if (!empty($cleanedFilters['search'])) {
            $search = trim($cleanedFilters['search']);
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('category_code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $orderBy = $cleanedFilters['order_by'] ?? 'name';
        $orderDirection = $cleanedFilters['order_direction'] ?? 'asc';
        $query->orderBy($orderBy, $orderDirection);

        return $query->paginate($perPage);
    }

    public function findById($categoryId)
    {
        return ItemCategory::with(['university', 'parent', 'children'])
                  ->where('category_id', $categoryId)
                  ->first();
    }

    public function findByCode($categoryCode)
    {
        return ItemCategory::with(['university', 'parent'])
                  ->where('category_code', $categoryCode)
                  ->first();
    }

    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {
            // Generate UUID if not provided
            if (empty($data['category_id'])) {
                $data['category_id'] = Str::uuid()->toString();
            }

            // Ensure created_by is set
            if (empty($data['created_by'])) {
                $data['created_by'] = Auth::id() ?? null;
            }

            // Handle specification_template if provided as array
            if (isset($data['specification_template']) && is_array($data['specification_template'])) {
                $data['specification_template'] = json_encode($data['specification_template']);
            }

            return ItemCategory::create($data);
        });
    }

    public function update($categoryId, array $data)
    {
        return DB::transaction(function () use ($categoryId, $data) {
            $category = $this->findById($categoryId);
            
            if (!$category) {
                throw new \Exception("Category not found");
            }

            // Prevent circular reference
            if (isset($data['parent_category_id']) && $data['parent_category_id'] === $categoryId) {
                throw new \Exception("Category cannot be its own parent");
            }

            // Set updated_by
            $data['updated_by'] = Auth::id() ?? null;

            // Handle specification_template if provided as array
            if (isset($data['specification_template']) && is_array($data['specification_template'])) {
                $data['specification_template'] = json_encode($data['specification_template']);
            }

            $category->update($data);
            return $category->fresh();
        });
    }

    public function delete($categoryId)
    {
        return DB::transaction(function () use ($categoryId) {
            $category = $this->findById($categoryId);
            
            if (!$category) {
                throw new \Exception("Category not found");
            }

            // Check if category has children
            if ($category->children()->count() > 0) {
                throw new \Exception("Cannot delete category with child categories");
            }

            // Check if category has items (uncomment when you have items relationship)
            // if ($category->items()->count() > 0) {
            //     throw new \Exception("Cannot delete category with associated items");
            // }

            return $category->delete();
        });
    }

    public function forceDelete($categoryId)
    {
        return DB::transaction(function () use ($categoryId) {
            $category = ItemCategory::withTrashed()->where('category_id', $categoryId)->first();
            
            if (!$category) {
                throw new \Exception("Category not found");
            }

            return $category->forceDelete();
        });
    }

    public function restore($categoryId)
    {
        return DB::transaction(function () use ($categoryId) {
            $category = ItemCategory::withTrashed()->where('category_id', $categoryId)->first();
            
            if (!$category) {
                throw new \Exception("Category not found");
            }

            return $category->restore();
        });
    }

    public function getRootCategories($universityId = null)
    {
        $query = ItemCategory::with(['university', 'children'])
                  ->whereNull('parent_category_id')
                  ->active();

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        return $query->orderBy('name')->get();
    }

    public function getChildren($parentCategoryId)
    {
        return ItemCategory::with(['university', 'parent'])
                  ->where('parent_category_id', $parentCategoryId)
                  ->active()
                  ->orderBy('name')
                  ->get();
    }

    public function getTree($universityId = null)
    {
        $query = ItemCategory::with(['children.children'])
                  ->whereNull('parent_category_id')
                  ->active();

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        return $query->orderBy('name')->get();
    }

    public function getActiveCategories($universityId = null)
    {
        $query = ItemCategory::with(['university', 'parent'])
                  ->active();

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        return $query->orderBy('name')->get();
    }

    public function getCategoriesWithMaintenance($universityId = null)
    {
        $query = ItemCategory::with(['university', 'parent'])
                  ->requiresMaintenance()
                  ->active();

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        return $query->orderBy('name')->get();
    }

    public function checkCodeExists($categoryCode, $excludeCategoryId = null)
    {
        $query = ItemCategory::where('category_code', $categoryCode);

        if ($excludeCategoryId) {
            $query->where('category_id', '!=', $excludeCategoryId);
        }

        return $query->exists();
    }
}