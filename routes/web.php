<?php

// use App\Http\Controllers\AnalyticsController;
// use App\Http\Controllers\AuditLogController;
// use App\Http\Controllers\DepartmentController;
// use App\Http\Controllers\HomeController;
// use App\Http\Controllers\InventoryReportController;
// use App\Http\Controllers\InventoryTransactionController;
// use App\Http\Controllers\ItemCategoryController;
// use App\Http\Controllers\ItemController;
// use App\Http\Controllers\LocationController;
// use App\Http\Controllers\MaintenanceRecordController;
// use App\Http\Controllers\ProfileController;
// use App\Http\Controllers\PurchaseOrderController;
// use App\Http\Controllers\PurchaseOrderItemController;
// use App\Http\Controllers\RoleController;
// use App\Http\Controllers\RouteController;
// use App\Http\Controllers\StockLevelsController;
// use App\Http\Controllers\SupplierController;
// use App\Http\Controllers\UserController;
// use App\Models\Department;
// use App\Models\InventoryItem;
// use App\Models\InventoryTransaction;
// use App\Models\ItemCategory;
// use App\Models\Location;
// use App\Models\PurchaseOrder;
// use App\Models\PurchaseOrderItem;
// use App\Models\StockLevel;
// use App\Models\Supplier;
// use App\Models\University;
// use App\Models\User;
// use Illuminate\Foundation\Application;
// use Illuminate\Support\Facades\Route;
// use Inertia\Inertia;

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });


// Route::middleware(['auth','verified','auth.custom', 'university.access'])->group(function () {
 
//      Route::get('/users', [UserController::class, 'index'])->name('users.index');
//     Route::post('/users', [UserController::class, 'store'])->name('admin.users.store');
//     Route::put('/users/{user}', [UserController::class, 'update'])->name('admin.users.update');
//     Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');
//     Route::put('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('admin.users.toggle-status');

//     // Role management
//     Route::get('/roles', [RoleController::class, 'index'])->name('admin.roles.index');
//     Route::post('/roles', [RoleController::class, 'store'])->name('admin.roles.store');
//     Route::put('/roles/{role}', [RoleController::class, 'update'])->name('admin.roles.update');
//     Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('admin.roles.destroy');
//     Route::post('/roles/{role}/permissions', [RoleController::class, 'updatePermissions'])->name('admin.roles.update-permissions');
    
//     // Route::resource('users', UserController::class);
//     // Route::post('/users/{user}/assign-role', [UserController::class, 'assignRole'])->name('users.assign-role');
//     // Route::post('/users/import', [UserController::class, 'import'])->name('users.import');
//     // Route::get('/users/export', [UserController::class, 'export'])->name('users.export');


//     //Item categories
//     Route::get('/item-categories', [ItemCategoryController::class, 'index'])->name("item-categories.index");
//     Route::post('/item-categories', [ItemCategoryController::class, 'store'])->name("item-categories.store");
//     Route::get('/item-categories/{id}', [ItemCategoryController::class, 'show'])->name("item-categories.show");
//     Route::put('/item-categories/{id}', [ItemCategoryController::class, 'update'])->name("item-categories.update");
//     Route::delete('/item-categories/{id}', [ItemCategoryController::class, 'destroy'])->name("item-categories.destroy");
    
//     // Additional routes
//     // Route::post('/item-categories/{id}/restore', [ItemCategoryController::class, 'restore']);
//     // Route::get('/item-categories/roots', [ItemCategoryController::class, 'getRootCategories']);
//     // Route::get('/item-categories/{parentId}/children', [ItemCategoryController::class, 'getChildren']);
//     // Route::get('/item-categories/tree', [ItemCategoryController::class, 'getTree']);
//     // Route::get('/item-categories/maintenance-required', [ItemCategoryController::class, 'getCategoriesWithMaintenance']);
//     // Route::get('/item-categories/check-code', [ItemCategoryController::class, 'checkCodeExists']);
//     //     // item-categories.store

//         //Items table
//         Route::get('/item', [ItemController::class, 'index'])->name('item.index');
//         Route::post('/item', [ItemController::class, 'store'])->name('item.store');
//         Route::put('/item/{id}', [ItemController::class, 'update'])->name('item.update');
//         Route::delete('/item/{id}', [ItemController::class, 'destroy'])->name('item.destroy');
//         // Route::apiResource('items', ItemController::class);


//         //inventories table
//         // Route::group(['middleware' => ['inventory_manager']], function () {
//         Route::get('/inventory-transactions', [InventoryTransactionController::class, 'transactionIndex'])->name('inventory-transactions.index');
//         Route::post('/inventory-transactions', [InventoryTransactionController::class, 'store'])->name('inventory-transactions.store');
//         Route::put('/inventory-transactions/{id}', [InventoryTransactionController::class, 'update'])->name('inventory-transactions.update');
//         Route::delete('/inventory-transactions/{id}', [InventoryTransactionController::class, 'destroy'])->name('inventory-transactions.destroy');
//         // });

//         //departments
//         Route::get('/departments', [DepartmentController::class, 'index'])->name('department.index');
//         Route::post('/departments', [DepartmentController::class, 'store'])->name('department.store');
//         Route::put('/departments/{id}', [DepartmentController::class, 'update'])->name('department.update');
//         Route::delete('/departments/{id}', [DepartmentController::class, 'destroy'])->name('department.destroy');

     
//         //Suppliers
//         // Route::get('/suppliers', [RouteController::class, 'suppliers'])->name('suppliers');  
//          Route::resource('suppliers', SupplierController::class);

//          // Additional supplier routes
//         // Route::post('/suppliers/bulk-action', [SupplierController::class, 'bulkAction'])->name('suppliers.bulk-action');
//         // Route::get('/suppliers/export/data', [SupplierController::class, 'export'])->name('suppliers.export');
//         // Route::post('/suppliers/import', [SupplierController::class, 'import'])->name('suppliers.import');
//         // Route::get('/suppliers/statistics', [SupplierController::class, 'getStatistics'])->name('suppliers.statistics');
//         // Route::post('/suppliers/{supplierId}/quick-approve', [SupplierController::class, 'quickApprove'])->name('suppliers.quick-approve');

//         //PurchaseOrders
//         Route::resource('purchase-orders', PurchaseOrderController::class);

//         // Additional custom routes
//         // Route::post('/purchase-orders/{id}/approve', [PurchaseOrderController::class, 'approve'])
//         //     ->name('purchase-orders.approve');
//         // Route::post('/purchase-orders/{id}/receive', [PurchaseOrderController::class, 'markAsReceived'])
//         //     ->name('purchase-orders.receive');
//         // Route::get('/api/purchase-orders/status/{status}', [PurchaseOrderController::class, 'getByStatus'])
//         //     ->name('purchase-orders.by-status');
            

//         //PurchaseOrders
//         Route::get('/purchase_order_items', [RouteController::class, 'purchase_order_items'])->name('purchase_order_items');  
//         Route::resource('purchase-order-items', PurchaseOrderItemController::class);

//         //stock_levels
//         // Route::get('/stock_levels', [RouteController::class, 'stock_levels'])->name('stock_levels');  
        
//         Route::resource('stock-levels', StockLevelsController::class);
//         Route::post('/stock-levels/import', [StockLevelsController::class, 'import'])->name('stock-levels.import');
//         Route::post('/stock-levels/bulk-update', [StockLevelsController::class, 'bulkUpdate'])->name('stock-levels.bulk-update');
        
//         //locations
//         // Route::get('/locations', [RouteController::class, 'locations'])->name('locations');  
//         Route::resource('locations', LocationController::class); // This includes update -> PUT/PATCH locations/{location}


//         //universities
        
//         Route::get('/universities', [RouteController::class, 'universities'])->name('universities');  


//         //maintenance-records
//         Route::get('/maintenance-records', [MaintenanceRecordController::class, 'index'])->name('maintenance_records.index');
//         Route::post('/maintenance-records', [MaintenanceRecordController::class, 'store'])->name('maintenance.store');
//         Route::put('/maintenance-records/{maintenanceRecord}', [MaintenanceRecordController::class, 'update'])->name('maintenance.update');
//         Route::delete('/maintenance-records/{maintenanceRecord}', [MaintenanceRecordController::class, 'destroy'])->name('maintenance.destroy');





//     // Audit Logs Routes
//     // Route::get('/audit-logs/create', [AuditLogController::class, 'create'])->name('audit-logs.create');
//     // Route::get('/audit-logs/{id}', [AuditLogController::class, 'show'])->name('audit-logs.show');
//     // Route::get('/audit-logs/{id}/edit', [AuditLogController::class, 'edit'])->name('audit-logs.edit');
//     Route::post('/audit-logs', [AuditLogController::class, 'store'])->name('audit-logs.store');
//     Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
//     Route::put('/audit-logs/{id}', [AuditLogController::class, 'update'])->name('audit-logs.update');
//     Route::delete('/audit-logs/{id}', [AuditLogController::class, 'destroy'])->name('audit-logs.destroy');
    
//     // Additional audit log routes
//     // Route::get('/audit-logs/search', [AuditLogController::class, 'search'])->name('audit-logs.search');
//     // Route::get('/audit-logs/action/{action}', [AuditLogController::class, 'filterByAction'])->name('audit-logs.filter.action');
//     // Route::get('/audit-logs/table/{tableName}', [AuditLogController::class, 'filterByTable'])->name('audit-logs.filter.table');
//     // Route::get('/audit-logs/user/{userId}', [AuditLogController::class, 'userLogs'])->name('audit-logs.user');
//     // Route::get('/audit-logs/recent', [AuditLogController::class, 'recent'])->name('audit-logs.recent');
    
//     // Admin routes
//     // Route::post('/audit-logs/purge', [AuditLogController::class, 'purgeOldLogs'])->name('audit-logs.purge');
//     // Route::get('/audit-logs/export', [AuditLogController::class, 'export'])->name('audit-logs.export');
//     // Route::post('/audit-logs/log-action', [AuditLogController::class, 'logAction'])->name('audit-logs.log-action');
    
//     // Soft delete routes
//     // Route::delete('/audit-logs/{id}/force', [AuditLogController::class, 'forceDelete'])->name('audit-logs.force-delete');
//     // Route::post('/audit-logs/{id}/restore', [AuditLogController::class, 'restore'])->name('audit-logs.restore');

//     // Route::get('/inventory-report',[InventoryReportController::class,'index'])->name('inventory-report.index');
//     // Route::post('/reports/generate', [InventoryReportController::class, 'generate'])->name('reports.generate');
//     // Route::post('/reports-generate', [InventoryReportController::class, 'export'])->name('reports.export');

//     Route::prefix('reports')->group(function () {
//     Route::get('/', [InventoryReportController::class, 'index'])->name('inventory-report.index');
//     Route::post('/generate', [InventoryReportController::class, 'generate'])->name('inventory-report.generate');
//     Route::get('/quick/{type}', [InventoryReportController::class, 'quickReport'])->name('inventory-report.quick');
//     Route::post('/preview', [InventoryReportController::class, 'preview'])->name('inventory-report.preview');
//     Route::post('/export', [InventoryReportController::class, 'exportReport'])->name('inventory-report.export');
//     Route::post('/clear', [InventoryReportController::class, 'clear'])->name('inventory-report.clear');
//     Route::get('/filter-options', [InventoryReportController::class, 'getFilterOptions'])->name('inventory-report.filter-options');
// });


// Route::get('/analytics/dashboard', [AnalyticsController::class, 'getDashboardData'])
//     ->name('analytics.dashboard');
    
// Route::post('/analytics/export', [AnalyticsController::class, 'exportDashboard'])
//     ->name('analytics.export');

// Route::get('/analytics/refresh', [AnalyticsController::class, 'refreshData'])
//     ->name('analytics.refresh');
    

//     // User Management
//     // Route::get('/analytics-dashboard', [RouteController::class, 'analytics'])->name('analytics.index');  

// });

// require __DIR__.'/auth.php';


// use App\Http\Controllers\AnalyticsController;
// use App\Http\Controllers\AuditLogController;
// use App\Http\Controllers\DepartmentController;
// use App\Http\Controllers\InventoryReportController;
// use App\Http\Controllers\InventoryTransactionController;
// use App\Http\Controllers\ItemCategoryController;
// use App\Http\Controllers\ItemController;
// use App\Http\Controllers\LocationController;
// use App\Http\Controllers\MaintenanceRecordController;
// use App\Http\Controllers\ProfileController;
// use App\Http\Controllers\PurchaseOrderController;
// use App\Http\Controllers\PurchaseOrderItemController;
// use App\Http\Controllers\RoleController;
// use App\Http\Controllers\RouteController;
// use App\Http\Controllers\StockLevelsController;
// use App\Http\Controllers\SupplierController;
// use App\Http\Controllers\UserController;
// use Illuminate\Foundation\Application;
// use Illuminate\Support\Facades\Route;
// use Inertia\Inertia;

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });

// // Main application routes with role-based access control
// Route::middleware(['auth', 'verified'])->group(function () {
    
//     // Admin-only routes (Super Admin, Inventory Manager, Department Head)
//     Route::middleware(['role:super_admin,inventory_manager,department_head'])->group(function () {
//         // User Management
//         Route::get('/users', [UserController::class, 'index'])->name('users.index');
//         Route::post('/users', [UserController::class, 'store'])->name('admin.users.store');
//         Route::put('/users/{user}', [UserController::class, 'update'])->name('admin.users.update');
//         Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');
//         Route::put('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('admin.users.toggle-status');

//         // Role Management (Super Admin only)
//         Route::middleware(['role:super_admin'])->group(function () {
//             Route::get('/roles', [RoleController::class, 'index'])->name('admin.roles.index');
//             Route::post('/roles', [RoleController::class, 'store'])->name('admin.roles.store');
//             Route::put('/roles/{role}', [RoleController::class, 'update'])->name('admin.roles.update');
//             Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('admin.roles.destroy');
//             Route::post('/roles/{role}/permissions', [RoleController::class, 'updatePermissions'])->name('admin.roles.update-permissions');
//         });

//         // Audit Logs (Admin only)
//         Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
//         Route::post('/audit-logs', [AuditLogController::class, 'store'])->name('audit-logs.store');
//         Route::put('/audit-logs/{id}', [AuditLogController::class, 'update'])->name('audit-logs.update');
//         Route::delete('/audit-logs/{id}', [AuditLogController::class, 'destroy'])->name('audit-logs.destroy');

//         // Analytics & Reports
//         Route::get('/analytics/dashboard', [AnalyticsController::class, 'getDashboardData'])->name('analytics.dashboard');
//         Route::post('/analytics/export', [AnalyticsController::class, 'exportDashboard'])->name('analytics.export');
//         Route::get('/analytics/refresh', [AnalyticsController::class, 'refreshData'])->name('analytics.refresh');
//     });

//     // Inventory Management Routes (Various permission levels)
//     Route::prefix('inventory')->middleware(['permission:inventory.view'])->group(function () {
//         // Item Categories (Manage categories permission)
//         Route::middleware(['permission:inventory.manage_categories'])->group(function () {
//             Route::get('/item-categories', [ItemCategoryController::class, 'index'])->name("item-categories.index");
//             Route::post('/item-categories', [ItemCategoryController::class, 'store'])->name("item-categories.store");
//             Route::get('/item-categories/{id}', [ItemCategoryController::class, 'show'])->name("item-categories.show");
//             Route::put('/item-categories/{id}', [ItemCategoryController::class, 'update'])->name("item-categories.update");
//             Route::delete('/item-categories/{id}', [ItemCategoryController::class, 'destroy'])->name("item-categories.destroy");
//         });

//         // Items (Various item permissions)
//         Route::get('/items', [ItemController::class, 'index'])->name('item.index');
//         Route::middleware(['permission:inventory.create'])->group(function () {
//             Route::post('/items', [ItemController::class, 'store'])->name('item.store');
//         });
//         Route::middleware(['permission:inventory.edit'])->group(function () {
//             Route::put('/items/{id}', [ItemController::class, 'update'])->name('item.update');
//         });
//         Route::middleware(['permission:inventory.delete'])->group(function () {
//             Route::delete('/items/{id}', [ItemController::class, 'destroy'])->name('item.destroy');
//         });

//         // Inventory Transactions
//         Route::get('/transactions', [InventoryTransactionController::class, 'transactionIndex'])->name('inventory-transactions.index');
//         Route::middleware(['permission:inventory.edit'])->group(function () {
//             Route::post('/transactions', [InventoryTransactionController::class, 'store'])->name('inventory-transactions.store');
//             Route::put('/transactions/{id}', [InventoryTransactionController::class, 'update'])->name('inventory-transactions.update');
//             Route::delete('/transactions/{id}', [InventoryTransactionController::class, 'destroy'])->name('inventory-transactions.destroy');
//         });
//     });

//     // Purchase Order Routes
//     Route::prefix('purchase-orders')->middleware(['permission:purchase_orders.view'])->group(function () {
//         Route::get('/', [PurchaseOrderController::class, 'index'])->name('purchase-orders.index');
//         Route::get('/{id}', [PurchaseOrderController::class, 'show'])->name('purchase-orders.show');
        
//         Route::middleware(['permission:purchase_orders.create'])->group(function () {
//             Route::post('/', [PurchaseOrderController::class, 'store'])->name('purchase-orders.store');
//         });
        
//         Route::middleware(['permission:purchase_orders.edit'])->group(function () {
//             Route::put('/{id}', [PurchaseOrderController::class, 'update'])->name('purchase-orders.update');
//         });
        
//         Route::middleware(['permission:purchase_orders.approve'])->group(function () {
//             Route::post('/{id}/approve', [PurchaseOrderController::class, 'approve'])->name('purchase-orders.approve');
//         });
//     });

//     // Department Routes (Department Head and above)
//     Route::middleware(['role:super_admin,inventory_manager,department_head'])->group(function () {
//         Route::get('/departments', [DepartmentController::class, 'index'])->name('department.index');
//         Route::post('/departments', [DepartmentController::class, 'store'])->name('department.store');
//         Route::put('/departments/{id}', [DepartmentController::class, 'update'])->name('department.update');
//         Route::delete('/departments/{id}', [DepartmentController::class, 'destroy'])->name('department.destroy');
//     });

//     // Supplier Routes
//     Route::resource('suppliers', SupplierController::class)->middleware(['permission:inventory.view']);

//     // Stock Levels
//     Route::resource('stock-levels', StockLevelsController::class)->middleware(['permission:inventory.view']);
//     Route::post('/stock-levels/import', [StockLevelsController::class, 'import'])->name('stock-levels.import')->middleware(['permission:inventory.edit']);
//     Route::post('/stock-levels/bulk-update', [StockLevelsController::class, 'bulkUpdate'])->name('stock-levels.bulk-update')->middleware(['permission:inventory.edit']);

//     // Locations
//     Route::resource('locations', LocationController::class)->middleware(['permission:inventory.view']);

//     // Maintenance Records
//     Route::get('/maintenance-records', [MaintenanceRecordController::class, 'index'])->name('maintenance_records.index');
//     Route::middleware(['permission:inventory.edit'])->group(function () {
//         Route::post('/maintenance-records', [MaintenanceRecordController::class, 'store'])->name('maintenance.store');
//         Route::put('/maintenance-records/{maintenanceRecord}', [MaintenanceRecordController::class, 'update'])->name('maintenance.update');
//         Route::delete('/maintenance-records/{maintenanceRecord}', [MaintenanceRecordController::class, 'destroy'])->name('maintenance.destroy');
//     });

//     // Reports
//     Route::prefix('reports')->middleware(['permission:reports.view'])->group(function () {
//         Route::get('/', [InventoryReportController::class, 'index'])->name('inventory-report.index');
//         Route::post('/generate', [InventoryReportController::class, 'generate'])->name('inventory-report.generate');
//         Route::get('/quick/{type}', [InventoryReportController::class, 'quickReport'])->name('inventory-report.quick');
//         Route::post('/export', [InventoryReportController::class, 'exportReport'])->name('inventory-report.export');
//     });

//     // Universities (Read-only for most users)
//     Route::get('/universities', [RouteController::class, 'universities'])->name('universities');
// });

use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\InventoryReportController;
use App\Http\Controllers\InventoryTransactionController;
use App\Http\Controllers\ItemCategoryController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\MaintenanceRecordController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\PurchaseOrderItemController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RouteController;
use App\Http\Controllers\StockLevelsController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
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

// Main application routes with role-based access control
Route::middleware(['auth', 'verified'])->group(function () {
    
    // =========================================================================
    // USER MANAGEMENT - STRICT REQUIREMENTS
    // =========================================================================
    Route::prefix('users')->group(function () {
        // View users - REQUIRES: admin role + view permission
        Route::middleware(['role:super_admin'])->group(function () {
            Route::get('/', [UserController::class, 'index'])->name('users.index');
        // });
        
        // Create users - REQUIRES: super_admin role + create permission
        // Route::middleware(['role:super_admin', 'permission:users.create'])->group(function () {
            Route::post('/', [UserController::class, 'store'])->name('admin.users.store');
        // });
        
        // Update users - REQUIRES: admin role + edit permission
        // Route::middleware(['role:super_admin,inventory_manager,department_head', 'permission:users.edit'])->group(function () {
            Route::put('/{user}', [UserController::class, 'update'])->name('admin.users.update');
            Route::put('/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('admin.users.toggle-status');
                
    // Route::put('/users/{user}', [UserController::class, 'update'])->name('admin.users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');
    // Route::put('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('admin.users.toggle-status');

        // });
        
        // Delete users - REQUIRES: super_admin role + delete permission
        // Route::middleware(['role:super_admin', 'permission:users.delete'])->group(function () {
            Route::delete('/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');
        });
    });

    // =========================================================================
    // ROLE MANAGEMENT - SUPER ADMIN ONLY
    // =========================================================================
    Route::prefix('roles')->group(function () {
        // All role management - REQUIRES: super_admin role + specific permissions
        Route::middleware(['role:super_admin'])->group(function () {
            // View roles - requires view permission
            Route::middleware(['permission:roles.view'])->group(function () {
                Route::get('/', [RoleController::class, 'index'])->name('admin.roles.index');
            });
            
            // Create roles - requires create permission
            Route::middleware(['permission:roles.create'])->group(function () {
                Route::post('/', [RoleController::class, 'store'])->name('admin.roles.store');
            });
            
            // Update roles - requires edit permission
            Route::middleware(['permission:roles.edit'])->group(function () {
                Route::put('/{role}', [RoleController::class, 'update'])->name('admin.roles.update');
            });
            
            // Delete roles - requires delete permission
            Route::middleware(['permission:roles.delete'])->group(function () {
                Route::delete('/{role}', [RoleController::class, 'destroy'])->name('admin.roles.destroy');
            });
            
            // Manage permissions - requires manage permission
            Route::middleware(['permission:roles.manage_permissions'])->group(function () {
                Route::post('/{role}/permissions', [RoleController::class, 'updatePermissions'])->name('admin.roles.update-permissions');
            });
        });
    });

    // =========================================================================
    // AUDIT LOGS - ADMIN ROLES + PERMISSIONS
    // =========================================================================
    Route::prefix('audit-logs')->group(function () {
        // View audit logs - REQUIRES: admin role + view permission
        Route::middleware(['role:super_admin,inventory_manager', 'permission:audit_logs.view'])->group(function () {
            Route::get('/', [AuditLogController::class, 'index'])->name('audit-logs.index');
        });
        
        // Create audit logs - REQUIRES: admin role + create permission
        Route::middleware(['role:super_admin,inventory_manager', 'permission:audit_logs.create'])->group(function () {
            Route::post('/', [AuditLogController::class, 'store'])->name('audit-logs.store');
        });
        
        // Update audit logs - REQUIRES: admin role + edit permission
        Route::middleware(['role:super_admin,inventory_manager', 'permission:audit_logs.edit'])->group(function () {
            Route::put('/{id}', [AuditLogController::class, 'update'])->name('audit-logs.update');
        });
        
        // Delete audit logs - REQUIRES: admin role + delete permission
        Route::middleware(['role:super_admin,inventory_manager', 'permission:audit_logs.delete'])->group(function () {
            Route::delete('/{id}', [AuditLogController::class, 'destroy'])->name('audit-logs.destroy');
        });
    });

    // =========================================================================
    // ANALYTICS & REPORTS - ADMIN ROLES + PERMISSIONS
    // =========================================================================
    Route::prefix('analytics')->group(function () {
        // View analytics - REQUIRES: admin role + view permission
        Route::middleware(['role:super_admin,inventory_manager,department_head', 'permission:analytics.view'])->group(function () {
            Route::get('/dashboard', [AnalyticsController::class, 'getDashboardData'])->name('analytics.dashboard');
        });
        
        // Export analytics - REQUIRES: admin role + export permission
        Route::middleware(['role:super_admin,inventory_manager,department_head', 'permission:analytics.export'])->group(function () {
            Route::post('/export', [AnalyticsController::class, 'exportDashboard'])->name('analytics.export');
        });
        
        // Refresh analytics - REQUIRES: admin role + refresh permission
        Route::middleware(['role:super_admin,inventory_manager,department_head', 'permission:analytics.refresh'])->group(function () {
            Route::get('/refresh', [AnalyticsController::class, 'refreshData'])->name('analytics.refresh');
        });
    });

    // =========================================================================
    // INVENTORY MANAGEMENT ROUTES - STRICT REQUIREMENTS
    // =========================================================================
    Route::prefix('inventory')->group(function () {
        Route::middleware(['role:super_admin,inventory_manager'])->group(function () {

        // VIEW INVENTORY - REQUIRES: any role + view permission
        Route::middleware(['permission:inventory.view'])->group(function () {
            Route::get('/items', [ItemController::class, 'index'])->name('item.index');
            Route::get('/transactions', [InventoryTransactionController::class, 'transactionIndex'])->name('inventory-transactions.index');
        });

        // ITEM CATEGORIES MANAGEMENT
        Route::prefix('item-categories')->group(function () {
            // View categories - REQUIRES: any role + view permission
            Route::middleware(['permission:inventory.view'])->group(function () {
                Route::get('/', [ItemCategoryController::class, 'index'])->name("item-categories.index");
                Route::get('/{id}', [ItemCategoryController::class, 'show'])->name("item-categories.show");
            });
            
            // Manage categories - REQUIRES: inventory_manager role + manage_categories permission
            Route::middleware(['role:inventory_manager', 'permission:inventory.manage_categories'])->group(function () {
                Route::post('/', [ItemCategoryController::class, 'store'])->name("item-categories.store");
                Route::put('/{id}', [ItemCategoryController::class, 'update'])->name("item-categories.update");
                Route::delete('/{id}', [ItemCategoryController::class, 'destroy'])->name("item-categories.destroy");
            });
        });

        // ITEMS MANAGEMENT
        Route::prefix('items')->group(function () {
            // View items - REQUIRES: any role + view permission
            Route::middleware(['permission:inventory.view'])->group(function () {
                Route::get('/', [ItemController::class, 'index'])->name('item.index');
                Route::get('/{id}', [ItemController::class, 'show'])->name('item.show');
            });
            
            // Create items - REQUIRES: inventory_manager role + create permission
            Route::middleware(['role:inventory_manager', 'permission:inventory.create'])->group(function () {
                Route::post('/', [ItemController::class, 'store'])->name('item.store');
            });
            
            // Update items - REQUIRES: inventory_manager role + edit permission
            Route::middleware(['role:inventory_manager', 'permission:inventory.edit'])->group(function () {
                Route::put('/{id}', [ItemController::class, 'update'])->name('item.update');
            });
            
            // Delete items - REQUIRES: inventory_manager role + delete permission
            Route::middleware(['role:inventory_manager', 'permission:inventory.delete'])->group(function () {
                Route::delete('/{id}', [ItemController::class, 'destroy'])->name('item.destroy');
            });
        });

        // INVENTORY TRANSACTIONS MANAGEMENT
        Route::prefix('transactions')->group(function () {
            // View transactions - REQUIRES: any role + view permission
            Route::middleware(['permission:inventory.view'])->group(function () {
                Route::get('/', [InventoryTransactionController::class, 'transactionIndex'])->name('inventory-transactions.index');
                Route::get('/{id}', [InventoryTransactionController::class, 'show'])->name('inventory-transactions.show');
            });
            
            // Create transactions - REQUIRES: inventory_manager role + edit permission
            Route::middleware(['role:inventory_manager', 'permission:inventory.edit'])->group(function () {
                Route::post('/', [InventoryTransactionController::class, 'store'])->name('inventory-transactions.store');
            });
            
            // Update transactions - REQUIRES: inventory_manager role + edit permission
            Route::middleware(['role:inventory_manager', 'permission:inventory.edit'])->group(function () {
                Route::put('/{id}', [InventoryTransactionController::class, 'update'])->name('inventory-transactions.update');
            });
            
            // Delete transactions - REQUIRES: inventory_manager role + edit permission
            Route::middleware(['role:inventory_manager', 'permission:inventory.edit'])->group(function () {
                Route::delete('/{id}', [InventoryTransactionController::class, 'destroy'])->name('inventory-transactions.destroy');
            });
        });

        // STOCK MANAGEMENT
        Route::prefix('stock')->group(function () {
            // Adjust stock - REQUIRES: inventory_manager role + edit permission
            Route::middleware(['role:inventory_manager', 'permission:inventory.edit'])->group(function () {
                Route::post('/adjust', [InventoryTransactionController::class, 'adjustStock'])->name('inventory.adjust-stock');
                Route::post('/bulk-adjust', [InventoryTransactionController::class, 'bulkAdjustStock'])->name('inventory.bulk-adjust-stock');
            });
        });

       });
    });

    // =========================================================================
    // PURCHASE ORDER ROUTES - STRICT REQUIREMENTS
    // =========================================================================
    Route::prefix('purchase-orders')->group(function () {
        
    Route::middleware(['role:super_admin,inventory_manager,procurement_officer'])->group(function () {

        // View purchase orders - REQUIRES: any role + view permission
        Route::middleware(['permission:purchase_orders.view'])->group(function () {
            Route::get('/', [PurchaseOrderController::class, 'index'])->name('purchase-orders.index');
            Route::get('/{id}', [PurchaseOrderController::class, 'show'])->name('purchase-orders.show');
            Route::resource('purchase-order-items', PurchaseOrderItemController::class);

        });
        
        // Create purchase orders - REQUIRES: inventory_manager role + create permission
        Route::middleware(['permission:purchase_orders.create'])->group(function () {
            Route::post('/', [PurchaseOrderController::class, 'store'])->name('purchase-orders.store');
        });
        
        // Edit purchase orders - REQUIRES: inventory_manager role + edit permission
        Route::middleware(['permission:purchase_orders.edit'])->group(function () {
            Route::put('/{id}', [PurchaseOrderController::class, 'update'])->name('purchase-orders.update');
        });
        
        // Approve purchase orders - REQUIRES: department_head role + approve permission
        Route::middleware(['role:department_head', 'permission:purchase_orders.approve'])->group(function () {
            Route::post('/{id}/approve', [PurchaseOrderController::class, 'approve'])->name('purchase-orders.approve');
            Route::post('/{id}/reject', [PurchaseOrderController::class, 'reject'])->name('purchase-orders.reject');
        });

    });


    });

    // =========================================================================
    // SUPPLIER MANAGEMENT - STRICT REQUIREMENTS
    // =========================================================================
    Route::prefix('suppliers')->group(function () {
        // View suppliers - REQUIRES: any role + view permission
        Route::middleware(['permission:inventory.view'])->group(function () {
            Route::get('/', [SupplierController::class, 'index'])->name('suppliers.index');
            Route::get('/{supplier}', [SupplierController::class, 'show'])->name('suppliers.show');
        });
        
        // Manage suppliers - REQUIRES: inventory_manager role + edit permission
        Route::middleware(['role:inventory_manager', 'permission:inventory.edit'])->group(function () {
            Route::post('/', [SupplierController::class, 'store'])->name('suppliers.store');
            Route::put('/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update');
            Route::delete('/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');
        });
    });

    // =========================================================================
    // STOCK LEVELS MANAGEMENT - STRICT REQUIREMENTS
    // =========================================================================
    Route::prefix('stock-levels')->group(function () {
        // View stock levels - REQUIRES: any role + view permission
        Route::middleware(['permission:inventory.view'])->group(function () {
            Route::get('/', [StockLevelsController::class, 'index'])->name('stock-levels.index');
            Route::get('/{stockLevels}', [StockLevelsController::class, 'show'])->name('stock-levels.show');
        });
        
        // Manage stock levels - REQUIRES: inventory_manager role + edit permission
        Route::middleware(['role:inventory_manager', 'permission:inventory.edit'])->group(function () {
            Route::post('/', [StockLevelsController::class, 'store'])->name('stock-levels.store');
            Route::put('/{stockLevels}', [StockLevelsController::class, 'update'])->name('stock-levels.update');
            Route::delete('/{stockLevels}', [StockLevelsController::class, 'destroy'])->name('stock-levels.destroy');
            Route::post('/import', [StockLevelsController::class, 'import'])->name('stock-levels.import');
            Route::post('/bulk-update', [StockLevelsController::class, 'bulkUpdate'])->name('stock-levels.bulk-update');
        });
    });

    // =========================================================================
    // LOCATIONS MANAGEMENT - STRICT REQUIREMENTS
    // =========================================================================
    Route::prefix('locations')->group(function () {
        // View locations - REQUIRES: any role + view permission
        Route::middleware(['permission:inventory.view'])->group(function () {
            Route::get('/', [LocationController::class, 'index'])->name('locations.index');
            Route::get('/{location}', [LocationController::class, 'show'])->name('locations.show');
        });
        
        // Manage locations - REQUIRES: inventory_manager role + edit permission
        Route::middleware(['role:inventory_manager', 'permission:inventory.edit'])->group(function () {
            Route::post('/', [LocationController::class, 'store'])->name('locations.store');
            Route::put('/{location}', [LocationController::class, 'update'])->name('locations.update');
            Route::delete('/{location}', [LocationController::class, 'destroy'])->name('locations.destroy');
        });
    });

    // =========================================================================
    // MAINTENANCE RECORDS - STRICT REQUIREMENTS
    // =========================================================================
    Route::prefix('maintenance-records')->group(function () {
        // View maintenance records - REQUIRES: any role + view permission
        Route::middleware(['permission:inventory.view'])->group(function () {
            Route::get('/', [MaintenanceRecordController::class, 'index'])->name('maintenance_records.index');
            Route::get('/{maintenanceRecord}', [MaintenanceRecordController::class, 'show'])->name('maintenance_records.show');
        });
        
        // Manage maintenance records - REQUIRES: inventory_manager role + edit permission
        Route::middleware(['role:inventory_manager', 'permission:inventory.edit'])->group(function () {
            Route::post('/', [MaintenanceRecordController::class, 'store'])->name('maintenance.store');
            Route::put('/{maintenanceRecord}', [MaintenanceRecordController::class, 'update'])->name('maintenance.update');
            Route::delete('/{maintenanceRecord}', [MaintenanceRecordController::class, 'destroy'])->name('maintenance.destroy');
        });
    });

    // =========================================================================
    // DEPARTMENT ROUTES - STRICT REQUIREMENTS
    // =========================================================================
    Route::prefix('departments')->group(function () {
        // View departments - REQUIRES: admin role + view permission
        Route::middleware(['role:super_admin,inventory_manager,department_head', 'permission:departments.view'])->group(function () {
            Route::get('/', [DepartmentController::class, 'index'])->name('department.index');
            Route::get('/{id}', [DepartmentController::class, 'show'])->name('department.show');
        });
        
        // Manage departments - REQUIRES: department_head/super_admin role + manage permission
        Route::middleware(['role:super_admin,department_head', 'permission:departments.manage'])->group(function () {
            Route::post('/', [DepartmentController::class, 'store'])->name('department.store');
            Route::put('/{id}', [DepartmentController::class, 'update'])->name('department.update');
            Route::delete('/{id}', [DepartmentController::class, 'destroy'])->name('department.destroy');
        });
    });

    // =========================================================================
    // REPORTS - STRICT REQUIREMENTS
    // =========================================================================
    Route::prefix('reports')->group(function () {
        // View reports - REQUIRES: any role + view permission
        Route::middleware(['permission:reports.view'])->group(function () {
            Route::get('/', [InventoryReportController::class, 'index'])->name('inventory-report.index');
            Route::post('/generate', [InventoryReportController::class, 'generate'])->name('inventory-report.generate');
            Route::get('/quick/{type}', [InventoryReportController::class, 'quickReport'])->name('inventory-report.quick');
        });
        
        // Export reports - REQUIRES: inventory_manager role + export permission
        Route::middleware(['role:inventory_manager', 'permission:reports.export'])->group(function () {
            Route::post('/export', [InventoryReportController::class, 'exportReport'])->name('inventory-report.export');
        });
    });

    // =========================================================================
    // UNIVERSITIES - VIEW ONLY
    // =========================================================================
    Route::get('/universities', [RouteController::class, 'universities'])->name('universities');


    // =========================================================================
    // ROLES AND PERMISSIONS - VIEW ONLY
    // =========================================================================
    Route::prefix('admin/role-permissions')->group(function () {
    // Get all role permissions with filters
    Route::get('/', [RolePermissionController::class, 'index'])->name('role_permission.index');
    
    // Assign permission to role
    Route::post('/', [RolePermissionController::class, 'store']);
    
    // Bulk operations
    Route::post('/bulk-assign', [RolePermissionController::class, 'bulkAssign']);
    Route::post('/bulk-remove', [RolePermissionController::class, 'bulkRemove']);
    
    // Get permissions by role
    Route::get('/role/{roleId}', [RolePermissionController::class, 'getByRole']);
    
    // Update role permission
    Route::put('/{id}', [RolePermissionController::class, 'update']);
    
    // Toggle permission status
    Route::patch('/{id}/toggle-status', [RolePermissionController::class, 'toggleStatus']);
    
    // Remove permission from role
    Route::delete('/{id}', [RolePermissionController::class, 'destroy']);
});



});

require __DIR__.'/auth.php';