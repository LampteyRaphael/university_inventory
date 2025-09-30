<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Models\ItemCategory;
use App\Models\Location;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\StockLevel;
use App\Models\Supplier;
use App\Models\University;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RouteController extends Controller
{
    
    public function item_categories():Response
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
                    'university_name' => $category->university_name,
                    'items_count' => $category->items_count,
                    'is_root' => $category->is_root,
                    'created_at'=>$category->created_at,
                    'updated_at'=>$category->updated_at,
                    // ... include other computed attributes
                ];
            });
         return Inertia::render('Items/ItemCategories', ['categories'=>$categories]);

        } catch (\Exception $e) {
            Log::error('Items index error:', ['error' => $e->getMessage()]);
            
            return Inertia::render('Item/ItemCategories', [
                'categories' => [],
            ]);
        }
    }


    public function inventories():Response
    {
            $items= fn () => InventoryItem::all();
            $categories= fn () => ItemCategory::all();
            $transactions=fn () => InventoryTransaction::all();
            $departments=fn () => Department::all();
            $locations=fn () => Location::all();
            $users=fn () => User::all();
            return Inertia::render('Inventories/Inventories', [
                'transactions'=>$transactions,
                'items'=>$items,
                'categories'=>$categories,
                'departments'=>$departments,
                'locations'=>$locations,
                'users'=>$users,
            ]);
    }

    public function inventorytransactions(Request $request):RedirectResponse
    {


        // var_dump($request->all());


        return back()->with('success', 'Successfully posted');

    }

    /*********************************
     * 
     * Route for Department
     * ********************************/
    public function departments():Response
    {
            $departments= fn () => Department::all();
            // $departments=  Department::query()->paginate(10);
            // $departments= Inertia::lazy(fn () => Department::all());

            $universities = University::select('university_id','name')->get();
            return Inertia::render('Departments/Departments', [
                'departments'=> $departments,
                 'universities'=>$universities,
                 'users'=>User::select('id', 'first_name', 'last_name','name')
                ->orderBy('name')
                ->limit(100)
                ->get(),
                ]);
    }

    /*********************************
     * 
     * Saving of Department Data
     * ********************************/
    public function departmentspost(): RedirectResponse
    {


        return back()->with('success', 'Successfully posted');
    }

    public function suppliers():Response
    {
            $suppliers=Supplier::all();
            $universities= University::all();
            $users=User::all();
            return Inertia::render('Suppliers/Suppliers', [
                'suppliers'=>$suppliers,
                'universities'=> $universities,
                'users'=>$users,
            ]);
    }


    public function purchase_orders():Response
    {
            $universities= University::all();
            $suppliers=Supplier::all();
            $departments=Department::all();
            $users=User::all();
            return Inertia::render('PurchaseOrders/PurchaseOrders', [
                'universities'=> $universities,
                'suppliers'=>$suppliers,
                'departments'=>$departments,
                'users'=>$users,
            ]);
    }


    public function purchase_order_items():Response
    {
            $orderItems=PurchaseOrderItem::all();
            $purchaseOrders=PurchaseOrder::all();
            $inventoryItems=InventoryItem::all();
            return Inertia::render('PurchaseOrders/PurchaseOrdersItems', [
                'orderItems'=>$orderItems,
                'purchaseOrders'=>$purchaseOrders,
                'inventoryItems'=>$inventoryItems
            ]);
    }

    public function stock_levels()
    {
            $stockLevels=StockLevel::all();
            $universities= University::all();
            $items= InventoryItem::all();
            $departments=Department::all();
            $locations=Location::all();
            return Inertia::render('StockLevels/StockLevels', [
                'locations'=>$locations,
                'stockLevels'=>$stockLevels,
                'universities'=>$universities,
                'items'=>$items,
                'departments'=>$departments
            ]);
    }

    public function locations():Response
    {
            $stockLevels=StockLevel::all();
            $universities= University::all();
            $items= InventoryItem::all();
            $departments=Department::all();
            $locations=Location::all();
            return Inertia::render('Locations/Locations', [
                'locations'=>$locations,
                'stockLevels'=>$stockLevels,
                'universities'=>$universities,
                'items'=>$items,
                'departments'=>$departments
            ]);
    }


    public function universities():Response
    {
            $universities= University::all();
            return Inertia::render('Universities/Universities', [
                'universities'=>$universities,
            ]);
    }





}
