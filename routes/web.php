<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\InventoryTransactionController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RouteController;
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
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


Route::middleware('auth','verified')->group(function () {
 
        // Item categories table
        Route::get('/item_categories', [RouteController::class, 'item_categories'])->name('item_categories');        

        //Items table
        Route::get('/item', [ItemController::class, 'index'])->name('item.index');
        Route::post('/item', [ItemController::class, 'store'])->name('item.store');
        Route::put('/item/{id}', [ItemController::class, 'update'])->name('item.update');
        Route::delete('/item/{id}', [ItemController::class, 'destroy'])->name('item.destroy');
        // Route::apiResource('items', ItemController::class);


        //inventories table
        Route::get('/inventory-transactions', [InventoryTransactionController::class, 'transactionIndex'])->name('inventory-transactions.index');
        Route::post('/inventory-transactions', [InventoryTransactionController::class, 'store'])->name('inventory-transactions.store');
        Route::put('/inventory-transactions/{id}', [InventoryTransactionController::class, 'update'])->name('inventory-transactions.update');
        Route::delete('/inventory-transactions/{id}', [InventoryTransactionController::class, 'destroy'])->name('inventory-transactions.destroy');


        //departments
        Route::get('/departments', [RouteController::class, 'departments'])->name('departments');
        Route::post('/departments', [RouteController::class, 'departmentspost'])->name('departmentspost');

     
        //Suppliers
        Route::get('/suppliers', [RouteController::class, 'suppliers'])->name('suppliers');  


        //PurchaseOrders
        Route::get('/purchase_orders', [RouteController::class, 'purchase_orders'])->name('orders_purchase');  


        //PurchaseOrders
        Route::get('/purchase_order_items', [RouteController::class, 'purchase_order_items'])->name('purchase_order_items');  
  
        //stock_levels
        Route::get('/stock_levels', [RouteController::class, 'stock_levels'])->name('stock_levels');  

        //locations
        Route::get('/locations', [RouteController::class, 'locations'])->name('locations');  


        //universities
        Route::get('/universities', [RouteController::class, 'universities'])->name('universities');  


});

require __DIR__.'/auth.php';
