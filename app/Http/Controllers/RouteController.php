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
use Exception;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RouteController extends Controller
{
    
    public function analytics():Response
    {
        try {
            
        
         return Inertia::render('Analytics/Analytics');

        } catch (Exception $e) {
            
            return Inertia::render('Analytics/Analytics');
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



    public function management(){

       return Inertia::render('Management/Management',[
        'users'=>User::all(),
        'departments'=>Department::all(),
        'universities'=>University::all(),
        'roles' => [
            // ['name' => 'super_admin', 'role_id' => 'super_admin'],
            // ['name' => 'inventory_manager','role_id' => 'inventory_manager'],
            // ['name' => 'department_head','role_id' => 'department_head'],
            // ['name' => 'procurement_officer','role_id' => 'procurement_officer'],
            // ['name' => 'faculty','role_id' => 'faculty'],
            // ['name' => 'staff','role_id' => 'staff'],
            // ['name' => 'student','role_id' => 'student'],
            ['name' => 'super_admin', 'role_id' => 1],
            ['name' => 'inventory_manager','role_id' => 2],
            ['name' => 'department_head','role_id' => 3],
            ['name' => 'procurement_officer','role_id' => 4],
            ['name' => 'faculty','role_id' => 5],
            ['name' => 'staff','role_id' => 6],
            ['name' => 'student','role_id' => 7],
        ],
        
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



}
