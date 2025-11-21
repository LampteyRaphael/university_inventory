<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $teams = config('permission.teams');
        $tableNames = config('permission.table_names');
        $columnNames = config('permission.column_names');
        $pivotRole = $columnNames['role_pivot_key'] ?? 'role_id';
        $pivotPermission = $columnNames['permission_pivot_key'] ?? 'permission_id';

        throw_if(empty($tableNames), new Exception('Error: config/permission.php not loaded. Run [php artisan config:clear] and try again.'));
        throw_if($teams && empty($columnNames['team_foreign_key'] ?? null), new Exception('Error: team_foreign_key on config/permission.php not loaded. Run [php artisan config:clear] and try again.'));

        Schema::create($tableNames['permissions'], static function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('guard_name');
            $table->timestamps();
            $table->unique(['name', 'guard_name']);
        });

        Schema::create($tableNames['roles'], static function (Blueprint $table) use ($teams, $columnNames) {
            $table->uuid('id')->primary();
            if ($teams || config('permission.testing')) {
                $table->uuid($columnNames['team_foreign_key'])->nullable();
                $table->index($columnNames['team_foreign_key'], 'roles_team_foreign_key_index');
            }
            $table->string('name');
            $table->string('guard_name');
            $table->timestamps();
            if ($teams || config('permission.testing')) {
                $table->unique([$columnNames['team_foreign_key'], 'name', 'guard_name']);
            } else {
                $table->unique(['name', 'guard_name']);
            }
        });

        Schema::create($tableNames['model_has_permissions'], static function (Blueprint $table) use ($tableNames, $columnNames, $pivotPermission, $teams) {
            $table->uuid($pivotPermission);
            $table->string('model_type');
            $table->uuid($columnNames['model_morph_key']);
            $table->index([$columnNames['model_morph_key'], 'model_type'], 'model_has_permissions_model_id_model_type_index');
            $table->foreign($pivotPermission)
                ->references('id')
                ->on($tableNames['permissions'])
                ->onDelete('cascade');
            if ($teams) {
                $table->uuid($columnNames['team_foreign_key']);
                $table->index($columnNames['team_foreign_key'], 'model_has_permissions_team_foreign_key_index');
                $table->primary([$columnNames['team_foreign_key'], $pivotPermission, $columnNames['model_morph_key'], 'model_type'],
                    'model_has_permissions_permission_model_type_primary');
            } else {
                $table->primary([$pivotPermission, $columnNames['model_morph_key'], 'model_type'],
                    'model_has_permissions_permission_model_type_primary');
            }
        });

        Schema::create($tableNames['model_has_roles'], static function (Blueprint $table) use ($tableNames, $columnNames, $pivotRole, $teams) {
            $table->uuid($pivotRole);
            $table->string('model_type');
            $table->uuid($columnNames['model_morph_key']);
            $table->index([$columnNames['model_morph_key'], 'model_type'], 'model_has_roles_model_id_model_type_index');
            $table->foreign($pivotRole)
                ->references('id')
                ->on($tableNames['roles'])
                ->onDelete('cascade');
            if ($teams) {
                $table->uuid($columnNames['team_foreign_key']);
                $table->index($columnNames['team_foreign_key'], 'model_has_roles_team_foreign_key_index');
                $table->primary([$columnNames['team_foreign_key'], $pivotRole, $columnNames['model_morph_key'], 'model_type'],
                    'model_has_roles_role_model_type_primary');
            } else {
                $table->primary([$pivotRole, $columnNames['model_morph_key'], 'model_type'],
                    'model_has_roles_role_model_type_primary');
            }
        });

        Schema::create($tableNames['role_has_permissions'], static function (Blueprint $table) use ($tableNames, $pivotRole, $pivotPermission) {
            $table->uuid($pivotPermission);
            $table->uuid($pivotRole);
            $table->foreign($pivotPermission)
                ->references('id')
                ->on($tableNames['permissions'])
                ->onDelete('cascade');
            $table->foreign($pivotRole)
                ->references('id')
                ->on($tableNames['roles'])
                ->onDelete('cascade');
            $table->primary([$pivotPermission, $pivotRole], 'role_has_permissions_permission_id_role_id_primary');
        });

        // Seed permissions and roles immediately after creating tables
        $this->seedPermissionsAndRoles();

        app('cache')
            ->store(config('permission.cache.store') != 'default' ? config('permission.cache.store') : null)
            ->forget(config('permission.cache.key'));
    }

    /**
     * Seed permissions and roles for university inventory management
     */
    protected function seedPermissionsAndRoles(): void
    {
        // Create Permissions using DB facade to handle UUIDs properly
        $permissions = [
            // User Management
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',

            // Role & Permission Management
            'roles.view',
            'roles.create',
            'roles.edit',
            'roles.delete',
            'permissions.view',

            // Categories
            'categories.view',
            'categories.create',
            'categories.edit',
            'categories.delete',

            // Suppliers
            'suppliers.view',
            'suppliers.create',
            'suppliers.edit',
            'suppliers.delete',

            // Purchase Orders
            'purchase_orders.view',
            'purchase_orders.create',
            'purchase_orders.edit',
            'purchase_orders.delete',
            'purchase_orders.approve',
            'purchase_orders.cancel',

            // Inventory Items
            'inventory.view',
            'inventory.create',
            'inventory.edit',
            'inventory.delete',
            'inventory.manage_stock',

            // Departments
            'departments.view',
            'departments.create',
            'departments.edit',
            'departments.delete',

            // Equipment
            'equipment.view',
            'equipment.create',
            'equipment.edit',
            'equipment.delete',
            'equipment.maintenance',

            // Reports
            'reports.view',
            'reports.generate',

            // Dashboard
            'dashboard.view',

            // Settings
            'settings.manage',
        ];

        $permissionData = [];
        $now = now();

        foreach ($permissions as $permission) {
            $permissionData[] = [
                'id' => (string) Str::uuid(),
                'name' => $permission,
                'guard_name' => 'web',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::table('permissions')->insert($permissionData);

        // Create Roles using DB facade
        $roles = [
            'Super Admin' => ['*'], // All permissions
            'Administrator' => [
                'users.view', 'users.create', 'users.edit',
                'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
                'suppliers.view', 'suppliers.create', 'suppliers.edit', 'suppliers.delete',
                'purchase_orders.view', 'purchase_orders.create', 'purchase_orders.edit', 'purchase_orders.delete', 'purchase_orders.approve',
                'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete', 'inventory.manage_stock',
                'departments.view', 'departments.create', 'departments.edit', 'departments.delete',
                'equipment.view', 'equipment.create', 'equipment.edit', 'equipment.delete', 'equipment.maintenance',
                'reports.view', 'reports.generate',
                'dashboard.view',
                'settings.manage'
            ],
            'Purchase Manager' => [
                'purchase_orders.view', 'purchase_orders.create', 'purchase_orders.edit',
                'suppliers.view', 'suppliers.create', 'suppliers.edit',
                'categories.view',
                'inventory.view', 'inventory.manage_stock',
                'reports.view',
                'dashboard.view'
            ],
            'Department Head' => [
                'purchase_orders.view', 'purchase_orders.create',
                'inventory.view',
                'equipment.view',
                'reports.view',
                'dashboard.view'
            ],
            'Store Keeper' => [
                'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.manage_stock',
                'purchase_orders.view',
                'equipment.view',
                'dashboard.view'
            ],
            'Staff' => [
                'purchase_orders.view', 'purchase_orders.create',
                'inventory.view',
                'equipment.view',
                'dashboard.view'
            ]
        ];

        $roleData = [];
        $rolePermissions = [];

        foreach ($roles as $roleName => $rolePermissionsList) {
            $roleId = (string) Str::uuid();
            $roleData[] = [
                'id' => $roleId,
                'name' => $roleName,
                'guard_name' => 'web',
                'created_at' => $now,
                'updated_at' => $now,
            ];

            // If Super Admin, get all permission IDs
            if ($roleName === 'Super Admin') {
                $allPermissionIds = DB::table('permissions')->pluck('id');
                foreach ($allPermissionIds as $permissionId) {
                    $rolePermissions[] = [
                        'permission_id' => $permissionId,
                        'role_id' => $roleId,
                    ];
                }
            } else {
                // Get permission IDs for the specific role
                $permissionIds = DB::table('permissions')
                    ->whereIn('name', $rolePermissionsList)
                    ->pluck('id');
                
                foreach ($permissionIds as $permissionId) {
                    $rolePermissions[] = [
                        'permission_id' => $permissionId,
                        'role_id' => $roleId,
                    ];
                }
            }
        }

        DB::table('roles')->insert($roleData);
        
        // Insert role-permission relationships
        if (!empty($rolePermissions)) {
            DB::table('role_has_permissions')->insert($rolePermissions);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tableNames = config('permission.table_names');

        if (empty($tableNames)) {
            throw new \Exception('Error: config/permission.php not found and defaults could not be merged. Please publish the package configuration before proceeding, or drop the tables manually.');
        }

        // Drop tables in correct order to handle foreign key constraints
        Schema::dropIfExists($tableNames['role_has_permissions']);
        Schema::dropIfExists($tableNames['model_has_roles']);
        Schema::dropIfExists($tableNames['model_has_permissions']);
        Schema::dropIfExists($tableNames['roles']);
        Schema::dropIfExists($tableNames['permissions']);
    }
};