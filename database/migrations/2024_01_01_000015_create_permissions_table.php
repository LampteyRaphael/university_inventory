<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up()
    {
        Schema::create('permissions', function (Blueprint $table) {
            $table->uuid('permission_id')->primary();
            $table->string('name')->unique(); // e.g., 'users.view', 'inventory.create'
            $table->string('slug')->unique(); // e.g., 'view-users', 'create-inventory'
            $table->string('module'); // e.g., 'users', 'inventory', 'purchase_orders'
            $table->string('action'); // e.g., 'view', 'create', 'edit', 'delete', 'manage'
            $table->string('description')->nullable();
            $table->string('category')->default('general');
            $table->boolean('is_system_permission')->default(false);
            $table->integer('weight')->default(0);
            $table->json('dependencies')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['module', 'action']);
            $table->index(['category', 'is_system_permission']);
            $table->index('weight');
        });

        // Insert default permissions
        $this->seedDefaultPermissions();
    }

    private function seedDefaultPermissions()
    {
        $permissions = [];

        // User Management Permissions
        $userPermissions = [
            ['view', 'View users and profiles'],
            ['create', 'Create new users'],
            ['edit', 'Edit existing users'],
            ['delete', 'Delete users'],
            ['manage_roles', 'Manage user roles and assignments'],
            ['impersonate', 'Impersonate other users'],
            ['export', 'Export user data'],
        ];

        foreach ($userPermissions as $perm) {
            $permissions[] = [
                'permission_id' => Str::uuid(),
                'name' => "users.{$perm[0]}",
                'slug' => "{$perm[0]}-users",
                'module' => 'users',
                'action' => $perm[0],
                'description' => $perm[1],
                'category' => 'user_management',
                'is_system_permission' => in_array($perm[0], ['manage_roles', 'impersonate']),
                'weight' => $this->getPermissionWeight('users', $perm[0]),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Inventory Management Permissions
        $inventoryPermissions = [
            ['view', 'View inventory items and stock'],
            ['create', 'Create new inventory items'],
            ['edit', 'Edit existing inventory items'],
            ['delete', 'Delete inventory items'],
            ['manage_categories', 'Manage inventory categories'],
            ['adjust_stock', 'Adjust stock quantities'],
            ['export', 'Export inventory data'],
            ['view_reports', 'View inventory reports'],
        ];

        foreach ($inventoryPermissions as $perm) {
            $permissions[] = [
                'permission_id' => Str::uuid(),
                'name' => "inventory.{$perm[0]}",
                'slug' => "{$perm[0]}-inventory",
                'module' => 'inventory',
                'action' => $perm[0],
                'description' => $perm[1],
                'category' => 'inventory',
                'is_system_permission' => in_array($perm[0], ['manage_categories']),
                'weight' => $this->getPermissionWeight('inventory', $perm[0]),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Purchase Order Permissions
        $poPermissions = [
            ['view', 'View purchase orders'],
            ['create', 'Create new purchase orders'],
            ['edit', 'Edit purchase orders'],
            ['delete', 'Delete purchase orders'],
            ['approve', 'Approve purchase orders'],
            ['reject', 'Reject purchase orders'],
            ['export', 'Export purchase order data'],
            ['manage_vendors', 'Manage vendors and suppliers'],
        ];

        foreach ($poPermissions as $perm) {
            $permissions[] = [
                'permission_id' => Str::uuid(),
                'name' => "purchase_orders.{$perm[0]}",
                'slug' => "{$perm[0]}-purchase-orders",
                'module' => 'purchase_orders',
                'action' => $perm[0],
                'description' => $perm[1],
                'category' => 'procurement',
                'is_system_permission' => in_array($perm[0], ['approve', 'manage_vendors']),
                'weight' => $this->getPermissionWeight('purchase_orders', $perm[0]),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Department Management Permissions
        $deptPermissions = [
            ['view', 'View departments'],
            ['create', 'Create new departments'],
            ['edit', 'Edit departments'],
            ['delete', 'Delete departments'],
            ['manage_members', 'Manage department members'],
            ['view_reports', 'View department reports'],
        ];

        foreach ($deptPermissions as $perm) {
            $permissions[] = [
                'permission_id' => Str::uuid(),
                'name' => "departments.{$perm[0]}",
                'slug' => "{$perm[0]}-departments",
                'module' => 'departments',
                'action' => $perm[0],
                'description' => $perm[1],
                'category' => 'organization',
                'is_system_permission' => in_array($perm[0], ['create', 'delete']),
                'weight' => $this->getPermissionWeight('departments', $perm[0]),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // System Administration Permissions
        $systemPermissions = [
            ['view_settings', 'View system settings'],
            ['edit_settings', 'Edit system settings'],
            ['manage_system', 'Manage system configuration'],
            ['view_audit_logs', 'View audit logs'],
            ['manage_backups', 'Manage system backups'],
            ['view_dashboard', 'View admin dashboard'],
        ];

        foreach ($systemPermissions as $perm) {
            $permissions[] = [
                'permission_id' => Str::uuid(),
                'name' => "system.{$perm[0]}",
                'slug' => str_replace('_', '-', $perm[0]),
                'module' => 'system',
                'action' => $perm[0],
                'description' => $perm[1],
                'category' => 'administration',
                'is_system_permission' => true,
                'weight' => 100,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Report Permissions
        $reportPermissions = [
            ['view', 'View reports'],
            ['generate', 'Generate reports'],
            ['export', 'Export reports'],
        ];

        foreach ($reportPermissions as $perm) {
            $permissions[] = [
                'permission_id' => Str::uuid(),
                'name' => "reports.{$perm[0]}",
                'slug' => "{$perm[0]}-reports",
                'module' => 'reports',
                'action' => $perm[0],
                'description' => $perm[1],
                'category' => 'reports',
                'is_system_permission' => false,
                'weight' => $this->getPermissionWeight('reports', $perm[0]),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('permissions')->insert($permissions);
    }

    private function getPermissionWeight($module, $action)
    {
        $weights = [
            'view' => 10,
            'create' => 20,
            'edit' => 30,
            'delete' => 40,
            'manage' => 50,
            'approve' => 60,
            'export' => 70,
            'impersonate' => 80,
            'manage_roles' => 90,
        ];

        $moduleWeights = [
            'system' => 100,
            'users' => 90,
            'departments' => 80,
            'purchase_orders' => 70,
            'inventory' => 60,
            'reports' => 50,
        ];

        $actionWeight = $weights[$action] ?? 10;
        $moduleWeight = $moduleWeights[$module] ?? 50;

        return $moduleWeight + $actionWeight;
    }

    public function down()
    {
        Schema::dropIfExists('permissions');
    }
};