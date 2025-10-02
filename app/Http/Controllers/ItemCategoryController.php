<?php

namespace App\Http\Controllers;

use App\Models\ItemCategory;
use App\Models\University;
use App\Repositories\ItemCategoryRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ItemCategoryController extends Controller
{
    protected $itemCategoryRepository;

    public function __construct(ItemCategoryRepository $itemCategoryRepository)
    {
        $this->itemCategoryRepository = $itemCategoryRepository;
    }

    public function index(Request $request)
    {
        try {
            $categories = ItemCategory::with(['university', 'parent','items'])
            ->get()
            ->map(function ($category) {
                return [
                    'category_id' => $category->category_id,
                    'category_code' => $category->category_code,
                    'name' => $category->name,
                    'description' => $category->description,
                    'image_url' => $category->image_url,
                    'warranty_period_days' => $category->warranty_period_days,
                    'depreciation_rate' => $category->depreciation_rate,
                    'depreciation_method' => $category->depreciation_method,
                    'requires_serial_number' => $category->requires_serial_number,
                    'requires_maintenance' => $category->requires_maintenance,
                    'maintenance_interval_days' => $category->maintenance_interval_days,
                    'specification_template' => $category->specification_template,
                    'lft' => $category->lft,
                    'rgt' => $category->rgt,
                    'depth' => $category->depth,
                    'is_active' => $category->is_active,
                    'parent_category_name' => $category->parent_category_name,
                    'parent_category_id' => $category->parent_category_id,
                    'university_name' => $category->university_name,
                    'university_id' => $category->university_id,
                    'items_count' => $category->items_count,
                    'is_root' => $category->is_root,
                    'created_at'=>$category->created_at,
                    'updated_at'=>$category->updated_at,
                ];
            });

            // $universities = University::select('university_id', 'name')
            //     ->orderBy('name')
            //     ->get();

            // return Inertia::render('Items/ItemCategories', [
            //     'categories'=>$categories,
            //     'universities' => $universities
            // ]);
            return Inertia::render('Items/ItemCategories')
            ->with([
                // Categories (likely not huge, but can still be deferred)
                'categories' => Inertia::defer(fn () =>
                    $categories
                ),

                // Universities (also deferred so UI loads instantly)
                'universities' => Inertia::defer(fn () =>
                    University::select('university_id', 'name')
                        ->orderBy('name')
                        ->get()
                ),
            ]);


        } catch (\Exception $e) {
            Log::error('Items index error:', ['error' => $e->getMessage()]);

            return redirect()->back()->with('error', 'Error loading categories: ' . $e->getMessage());
        }
    }

    public function store(Request $request):RedirectResponse
    {
        try {
            $validated = $request->validate([
                'university_id' => 'required|exists:universities,university_id',
                'parent_category_id' => 'nullable|exists:item_categories,category_id',
                'category_code' => 'required|string|max:50|unique:item_categories,category_code',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'image_url' => 'nullable|url|max:500',
                'warranty_period_days' => 'nullable|integer|min:0',
                'depreciation_rate' => 'nullable|numeric|min:0|max:100',
                'depreciation_method' => 'nullable|in:straight_line,reducing_balance',
                'requires_serial_number' => 'boolean',
                'requires_maintenance' => 'boolean',
                'lft' => 'nullable|integer|min:0',
                'rgt' =>'nullable|integer|min:0',
                'depth' =>'nullable|integer|min:0',
                'maintenance_interval_days' => 'nullable|integer|min:0',
                'specification_template' => 'nullable|array',
                'is_active' => 'boolean',
            ]);

            $this->itemCategoryRepository->create($validated);

            return redirect()->back()->with('success', 'Category created successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create category: ' . $e->getMessage());
        }
    }

    public function show($id):RedirectResponse
    {
        try {
            $category = $this->itemCategoryRepository->findById($id);

            if (!$category) {
                return redirect()->back()->with('error', 'Category not found');
            }

            return redirect()->back()->with('success', 'Category retrieved successfully');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to retrieve category: ' . $e->getMessage());
        }
    }

    public function update(Request $request, $id):RedirectResponse
    {
        try {
            $validated = $request->validate([
                'university_id' => 'sometimes|required|exists:universities,university_id',
                'parent_category_id' => 'nullable|exists:item_categories,category_id',
                'category_code' => 'sometimes|required|string|max:50|unique:item_categories,category_code,' . $id . ',category_id',
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'image_url' => 'nullable|url|max:500',
                'warranty_period_days' => 'nullable|integer|min:0',
                'depreciation_rate' => 'nullable|numeric|min:0|max:100',
                'depreciation_method' => 'nullable|in:straight_line,reducing_balance',
                'requires_serial_number' => 'boolean',
                'requires_maintenance' => 'boolean',
                'lft' => 'nullable|integer|min:0',
                'rgt' =>'nullable|integer|min:0',
                'depth' =>'nullable|integer|min:0',
                'maintenance_interval_days' => 'nullable|integer|min:0',
                'specification_template' => 'nullable|array',
                'is_active' => 'boolean',
            ]);

            $this->itemCategoryRepository->update($id, $validated);

            return redirect()->back()->with('success', 'Category updated successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update category: ' . $e->getMessage());
        }
    }

    public function destroy($id):RedirectResponse
    {
        try {
            $this->itemCategoryRepository->delete($id);

            return redirect()->back()->with('success', 'Category deleted successfully');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete category: ' . $e->getMessage());
        }
    }

    public function restore($id):RedirectResponse
    {
        try {
            $this->itemCategoryRepository->restore($id);

            return redirect()->back()->with('success', 'Category restored successfully');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to restore category: ' . $e->getMessage());
        }
    }

    public function getRootCategories(Request $request):RedirectResponse
    {
        try {
            $universityId = $request->get('university_id');
            $this->itemCategoryRepository->getRootCategories($universityId);

            return redirect()->back()->with('success', 'Root categories retrieved successfully');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to retrieve root categories: ' . $e->getMessage());
        }
    }

    public function getChildren($parentId):RedirectResponse
    {
        try {
            $this->itemCategoryRepository->getChildren($parentId);

            return redirect()->back()->with('success', 'Child categories retrieved successfully');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to retrieve child categories: ' . $e->getMessage());
        }
    }

    public function getTree(Request $request):RedirectResponse
    {
        try {
            $universityId = $request->get('university_id');
            $this->itemCategoryRepository->getTree($universityId);

            return redirect()->back()->with('success', 'Category tree retrieved successfully');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to retrieve category tree: ' . $e->getMessage());
        }
    }

    public function getCategoriesWithMaintenance(Request $request):RedirectResponse
    {
        try {
            $universityId = $request->get('university_id');
            $this->itemCategoryRepository->getCategoriesWithMaintenance($universityId);

            return redirect()->back()->with('success', 'Maintenance categories retrieved successfully');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to retrieve maintenance categories: ' . $e->getMessage());
        }
    }

    public function checkCodeExists(Request $request):RedirectResponse
    {
        try {
            $request->validate([
                'category_code' => 'required|string',
                'exclude_id' => 'nullable|string'
            ]);

            $this->itemCategoryRepository->checkCodeExists(
                $request->category_code,
                $request->exclude_id
            );

            return redirect()->back()->with('success', 'Code existence checked successfully');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to check code existence: ' . $e->getMessage());
        }
    }
}
