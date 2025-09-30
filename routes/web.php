<?php

use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\InventoryReportController;
use App\Http\Controllers\InventoryTransactionController;
use App\Http\Controllers\ItemCategoryController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\MaintenanceRecordController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RouteController;
use App\Http\Controllers\UserController;
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
 

    //Item categories
    Route::get('/item-categories', [ItemCategoryController::class, 'index'])->name("item-categories.index");
    Route::post('/item-categories', [ItemCategoryController::class, 'store'])->name("item-categories.store");
    Route::get('/item-categories/{id}', [ItemCategoryController::class, 'show'])->name("item-categories.show");
    Route::put('/item-categories/{id}', [ItemCategoryController::class, 'update'])->name("item-categories.update");
    Route::delete('/item-categories/{id}', [ItemCategoryController::class, 'destroy'])->name("item-categories.destroy");
    
    // Additional routes
    // Route::post('/item-categories/{id}/restore', [ItemCategoryController::class, 'restore']);
    // Route::get('/item-categories/roots', [ItemCategoryController::class, 'getRootCategories']);
    // Route::get('/item-categories/{parentId}/children', [ItemCategoryController::class, 'getChildren']);
    // Route::get('/item-categories/tree', [ItemCategoryController::class, 'getTree']);
    // Route::get('/item-categories/maintenance-required', [ItemCategoryController::class, 'getCategoriesWithMaintenance']);
    // Route::get('/item-categories/check-code', [ItemCategoryController::class, 'checkCodeExists']);
    //     // item-categories.store

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
        Route::get('/departments', [DepartmentController::class, 'index'])->name('department.index');
        Route::post('/departments', [DepartmentController::class, 'store'])->name('department.store');
        Route::put('/departments/{id}', [DepartmentController::class, 'update'])->name('department.update');
        Route::delete('/departments/{id}', [DepartmentController::class, 'destroy'])->name('department.destroy');

     
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


        //maintenance-records
        Route::get('/maintenance-records', [MaintenanceRecordController::class, 'index'])->name('maintenance_records.index');
        Route::post('/maintenance-records', [MaintenanceRecordController::class, 'store'])->name('maintenance.store');
        Route::put('/maintenance-records/{maintenanceRecord}', [MaintenanceRecordController::class, 'update'])->name('maintenance.update');
        Route::delete('/maintenance-records/{maintenanceRecord}', [MaintenanceRecordController::class, 'destroy'])->name('maintenance.destroy');





        // Audit Logs Routes
    // Route::get('/audit-logs/create', [AuditLogController::class, 'create'])->name('audit-logs.create');
    // Route::get('/audit-logs/{id}', [AuditLogController::class, 'show'])->name('audit-logs.show');
    // Route::get('/audit-logs/{id}/edit', [AuditLogController::class, 'edit'])->name('audit-logs.edit');
    Route::post('/audit-logs', [AuditLogController::class, 'store'])->name('audit-logs.store');
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::put('/audit-logs/{id}', [AuditLogController::class, 'update'])->name('audit-logs.update');
    Route::delete('/audit-logs/{id}', [AuditLogController::class, 'destroy'])->name('audit-logs.destroy');
    
    // Additional audit log routes
    // Route::get('/audit-logs/search', [AuditLogController::class, 'search'])->name('audit-logs.search');
    // Route::get('/audit-logs/action/{action}', [AuditLogController::class, 'filterByAction'])->name('audit-logs.filter.action');
    // Route::get('/audit-logs/table/{tableName}', [AuditLogController::class, 'filterByTable'])->name('audit-logs.filter.table');
    // Route::get('/audit-logs/user/{userId}', [AuditLogController::class, 'userLogs'])->name('audit-logs.user');
    // Route::get('/audit-logs/recent', [AuditLogController::class, 'recent'])->name('audit-logs.recent');
    
    // Admin routes
    // Route::post('/audit-logs/purge', [AuditLogController::class, 'purgeOldLogs'])->name('audit-logs.purge');
    // Route::get('/audit-logs/export', [AuditLogController::class, 'export'])->name('audit-logs.export');
    // Route::post('/audit-logs/log-action', [AuditLogController::class, 'logAction'])->name('audit-logs.log-action');
    
    // Soft delete routes
    // Route::delete('/audit-logs/{id}/force', [AuditLogController::class, 'forceDelete'])->name('audit-logs.force-delete');
    // Route::post('/audit-logs/{id}/restore', [AuditLogController::class, 'restore'])->name('audit-logs.restore');

    Route::get('/inventory-report',[InventoryReportController::class,'index'])->name('inventory-report.index');
    Route::post('/reports/generate', [InventoryReportController::class, 'generate'])->name('reports.generate');
    // Route::post('/reports/generate', [InventoryReportController::class, 'export'])->name('reports.export');

});

require __DIR__.'/auth.php';
