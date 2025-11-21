<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\{
    ProfileController,
    UserController,
    RoleController,
    AuditLogController,
    AnalyticsController,
    ItemController,
    ItemCategoryController,
    InventoryTransactionController,
    PurchaseOrderController,
    PurchaseOrderItemController,
    SupplierController,
    StockLevelsController,
    LocationController,
    MaintenanceRecordController,
    DepartmentController,
    InventoryReportController,
    PermissionController,
    RolePermissionController,
    RouteController,
    UniversityController,
};
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Container\Attributes\Auth;

// ================================================
// PUBLIC ROUTES
// ================================================
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'      => Route::has('login'),
        'canRegister'   => Route::has('register'),
        'laravelVersion'=> Application::VERSION,
        'phpVersion'    => PHP_VERSION,
    ]);
});

Route::get('error/{code?}', function ($code = 500) {
    return Inertia::render('Errors/Error', ['status' => (int) $code]);
})->name('error.page');

// ================================================
// AUTHENTICATED ROUTES
// ================================================
Route::middleware(['auth', 'verified'])->group(function () {

    // DASHBOARD - Accessible to all authenticated users with dashboard.view permission
    Route::get('/dashboard', fn() => Inertia::render('Dashboard'))
        ->middleware('permission:dashboard.view')
        ->name('dashboard');

    // =============================================================
    // PROFILE MANAGEMENT - Accessible to all authenticated users
    // =============================================================
    Route::controller(ProfileController::class)->group(function () {
        Route::get('/profile', 'edit')->name('profile.edit');
        Route::patch('/profile', 'update')->name('profile.update');
        Route::delete('/profile', 'destroy')->name('profile.destroy');
    });

    // =============================================================
    // ADMIN ROUTES - Super Admin and Administrator only
    // =============================================================
    Route::middleware(['role:Super Admin|Administrator'])->group(function () {
        // Role & Permission Management
         Route::get('/admin/role-permission-manager', [RoleController::class, 'home'])->name('admin.role-permission.manager');
        // Role Management
        Route::get('/roles', [RoleController::class, 'index'])->name('admin.roles.index');
        Route::post('/roles', [RoleController::class, 'store'])->name('admin.roles.store');
        Route::put('/roles/{role}', [RoleController::class, 'update'])->name('admin.roles.update');
        Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('admin.roles.destroy');
        Route::post('/roles/{role}/permissions', [RoleController::class, 'updatePermissions'])->name('admin.roles.update-permissions');

        // Permission Management
        Route::get('/permissions', [PermissionController::class, 'index'])->name('admin.permissions.index');
        Route::post('/permissions', [PermissionController::class, 'store'])->name('admin.permissions.store');
        Route::put('/permissions/{permission}', [PermissionController::class, 'update'])->name('admin.permissions.update');
        Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])->name('admin.permissions.destroy');

        // User Role & Permission Management
        Route::put('/users/{user_id}/roles', [RoleController::class, 'updateUserRoles'])->name('admin.users.roles.update');
        Route::put('/users/{user_id}/permissions', [RoleController::class, 'updateUserPermissions'])->name('admin.users.permissions.update');
        Route::get('/users/{user_id}/roles', [RoleController::class, 'getUserRoles'])->name('admin.users.roles.index');
        Route::get('/users/{user_id}/permissions', [RoleController::class, 'getUserPermissions'])->name('admin.users.permissions.index');
    });

    // =============================================================
    // USER MANAGEMENT - Super Admin, Administrator with user permissions
    // =============================================================
    Route::middleware(['role:Super Admin|Administrator'])->group(function () {
        Route::get('/users', [UserController::class, 'index'])->middleware('permission:users.view')->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->middleware('permission:users.create')->name('admin.users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->middleware('permission:users.edit')->name('admin.users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('permission:users.delete')->name('admin.users.destroy');
        Route::put('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('admin.users.toggle-status');
    });

    // =============================================================
    // SUPPLIERS MANAGEMENT
    // =============================================================
    Route::prefix('suppliers')->group(function () {
        Route::get('/', [SupplierController::class, 'index'])->middleware('permission:suppliers.view')->name('suppliers.index');
        Route::post('/', [SupplierController::class, 'store'])->middleware('permission:suppliers.create')->name('suppliers.store');
        Route::put('/{id}', [SupplierController::class, 'update'])->middleware('permission:suppliers.edit')->name('suppliers.update');
        Route::delete('/{id}', [SupplierController::class, 'destroy'])->middleware('permission:suppliers.delete')->name('suppliers.destroy');
    });

    // =============================================================
    // PURCHASE ORDERS
    // =============================================================
    Route::prefix('purchase-orders')->group(function () {
        Route::get('/', [PurchaseOrderController::class, 'index'])->middleware('permission:purchase_orders.view')->name('purchase-orders.index');
        Route::post('/', [PurchaseOrderController::class, 'store'])->middleware('permission:purchase_orders.create')->name('purchase-orders.store');
        Route::put('/{id}', [PurchaseOrderController::class, 'update'])->middleware('permission:purchase_orders.edit')->name('purchase-orders.update');
        Route::delete('/{id}', [PurchaseOrderController::class, 'destroy'])->middleware('permission:purchase_orders.delete')->name('purchase-orders.destroy');
        Route::post('/{id}/approve', [PurchaseOrderController::class, 'approve'])->middleware('permission:purchase_orders.approve')->name('purchase-orders.approve');
        Route::get('/{id}', [PurchaseOrderController::class, 'show'])->middleware('permission:purchase_orders.view')->name('purchase-orders.show');
    });

    // =============================================================
    // INVENTORY MANAGEMENT
    // =============================================================
    Route::prefix('inventory')->group(function () {

        // Categories
        Route::prefix('categories')->group(function () {
            Route::get('/', [ItemCategoryController::class, 'index'])->middleware('permission:categories.view')->name('item-categories.index');
            Route::post('/', [ItemCategoryController::class, 'store'])->middleware('permission:categories.create')->name('item-categories.store');
            Route::put('/{id}', [ItemCategoryController::class, 'update'])->middleware('permission:categories.edit')->name('item-categories.update');
            Route::delete('/{id}', [ItemCategoryController::class, 'destroy'])->middleware('permission:categories.delete')->name('item-categories.destroy');
        });

        // Items
        Route::prefix('items')->group(function () {
            Route::get('/', [ItemController::class, 'index'])->middleware('permission:inventory.view')->name('item.index');
            Route::post('/', [ItemController::class, 'store'])->middleware('permission:inventory.create')->name('item.store');
            Route::put('/{id}', [ItemController::class, 'update'])->middleware('permission:inventory.edit')->name('item.update');
            Route::delete('/{id}', [ItemController::class, 'destroy'])->middleware('permission:inventory.delete')->name('item.destroy');
        });

        // Transactions
        Route::prefix('transactions')->group(function () {
            Route::get('/', [InventoryTransactionController::class, 'transactionIndex'])->middleware('permission:inventory.view')->name('inventory-transactions.index');
            Route::post('/', [InventoryTransactionController::class, 'store'])->middleware('permission:inventory.create')->name('inventory-transactions.store');
            Route::put('/{id}', [InventoryTransactionController::class, 'update'])->middleware('permission:inventory.edit')->name('inventory-transactions.update');
            Route::delete('/{id}', [InventoryTransactionController::class, 'destroy'])->middleware('permission:inventory.delete')->name('inventory-transactions.destroy');
        });
    });

    // =============================================================
    // STOCK MANAGEMENT
    // =============================================================
    Route::prefix('stock')->middleware('permission:inventory.manage_stock')->group(function () {
        Route::resource('stock-levels', StockLevelsController::class);
        Route::post('/adjust', [InventoryTransactionController::class, 'adjustStock'])->name('inventory.stock.adjust');
        Route::post('/bulk-adjust', [InventoryTransactionController::class, 'bulkAdjustStock'])->name('inventory.stock.bulk-adjust');
        Route::post('/stock-levels/import', [StockLevelsController::class, 'import'])->name('stock-levels.import');
        Route::post('/stock-levels/bulk-update', [StockLevelsController::class, 'bulkUpdate'])->name('stock-levels.bulk-update');
    });

    // =============================================================
    // DEPARTMENTS
    // =============================================================
    Route::prefix('departments')->group(function () {
        Route::get('/', [DepartmentController::class, 'index'])->middleware('permission:departments.view')->name('department.index');
        Route::post('/', [DepartmentController::class, 'store'])->middleware('permission:departments.create')->name('department.store');
        Route::put('/{id}', [DepartmentController::class, 'update'])->middleware('permission:departments.edit')->name('department.update');
        Route::delete('/{id}', [DepartmentController::class, 'destroy'])->middleware('permission:departments.delete')->name('department.destroy');
    });

    // =============================================================
    // EQUIPMENT/MAINTENANCE
    // =============================================================
    Route::prefix('equipment')->group(function () {
        Route::get('/', [MaintenanceRecordController::class, 'index'])->middleware('permission:equipment.view')->name('maintenance_records.index');
        Route::post('/', [MaintenanceRecordController::class, 'store'])->middleware('permission:equipment.create')->name('maintenance.store');
        Route::put('/{id}', [MaintenanceRecordController::class, 'update'])->middleware('permission:equipment.edit')->name('maintenance.update');
        Route::delete('/{id}', [MaintenanceRecordController::class, 'destroy'])->middleware('permission:equipment.delete')->name('maintenance.destroy');
    });

    // =============================================================
    // UNIVERSITIES
    // =============================================================
    Route::prefix('universities')->group(function () {
        Route::get('/', [UniversityController::class, 'index'])->middleware('permission:universities.view')->name('universities.index');
        Route::post('/', [UniversityController::class, 'store'])->middleware('permission:universities.create')->name('universities.store');
        Route::put('/{id}', [UniversityController::class, 'update'])->middleware('permission:universities.edit')->name('universities.update');
        Route::delete('/{id}', [UniversityController::class, 'destroy'])->middleware('permission:universities.delete')->name('universities.destroy');
    });

    // =============================================================
    // AUDIT LOGS
    // =============================================================
    Route::prefix('audit-logs')->group(function () {
        Route::get('/', [AuditLogController::class, 'index'])->middleware('permission:audit_logs.view')->name('audit-logs.index');
        Route::post('/', [AuditLogController::class, 'store'])->middleware('permission:audit_logs.create')->name('audit-logs.store');
        Route::put('/{id}', [AuditLogController::class, 'update'])->middleware('permission:audit_logs.edit')->name('audit-logs.update');
        Route::delete('/{id}', [AuditLogController::class, 'destroy'])->middleware('permission:audit_logs.delete')->name('audit-logs.destroy');
    });

    // =============================================================
    // REPORTS & ANALYTICS
    // =============================================================
    Route::prefix('reports')->group(function () {
        Route::get('/', [InventoryReportController::class, 'index'])->middleware('permission:reports.view')->name('inventory-report.index');
        Route::post('/generate', [InventoryReportController::class, 'generate'])->middleware('permission:reports.generate')->name('inventory-report.generate');
        Route::get('/quick/{type}', [InventoryReportController::class, 'quickReport'])->name('inventory-report.quick');
        Route::post('/preview', [InventoryReportController::class, 'preview'])->name('inventory-report.preview');
        Route::post('/export', [InventoryReportController::class, 'exportReport'])->name('inventory-report.export');
        Route::post('/clear', [InventoryReportController::class, 'clear'])->name('inventory-report.clear');
        Route::get('/filter-options', [InventoryReportController::class, 'getFilterOptions'])->name('inventory-report.filter-options');
    });

    Route::prefix('analytics')->group(function () {
        Route::get('/dashboard', [AnalyticsController::class, 'getDashboardData'])->middleware('permission:reports.view')->name('analytics.dashboard');
        Route::post('/export', [AnalyticsController::class, 'exportDashboard'])->middleware('permission:reports.generate')->name('analytics.export');
        Route::get('/refresh', [AnalyticsController::class, 'refreshData'])->middleware('permission:reports.view')->name('analytics.refresh');
    });

    // =============================================================
    // SETTINGS
    // =============================================================
    Route::prefix('settings')->middleware('permission:settings.manage')->group(function () {
        Route::get('/', fn() => Inertia::render('Settings/Index'))->name('settings.index');
    });

    // =============================================================
    // LOCATIONS & PURCHASE ORDER ITEMS
    // =============================================================
    Route::resource('locations', LocationController::class)->middleware('permission:inventory.view');
    Route::resource('purchase-order-items', PurchaseOrderItemController::class)->middleware('permission:purchase_orders.view');

});

require __DIR__ . '/auth.php';