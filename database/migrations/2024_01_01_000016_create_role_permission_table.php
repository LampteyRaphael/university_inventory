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
        Schema::create('role_permission', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('role_id');
            $table->uuid('permission_id');
            $table->json('constraints')->nullable();
            $table->boolean('is_enabled')->default(true);
            $table->timestamp('granted_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->uuid('granted_by')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('role_id')
                  ->references('role_id')
                  ->on('roles')
                  ->onDelete('cascade');

            $table->foreign('permission_id')
                  ->references('permission_id')
                  ->on('permissions')
                  ->onDelete('cascade');

            $table->foreign('granted_by')
                  ->references('user_id')
                  ->on('users')
                  ->onDelete('set null');

            // Indexes
            $table->unique(['role_id', 'permission_id']);
            $table->index(['role_id', 'is_enabled']);
            $table->index('expires_at');
        });

        // Assign default permissions to roles
        $this->assignDefaultPermissions();
    }

    private function assignDefaultPermissions()
    {
        // Get all roles
        $superAdminRole = DB::table('roles')->where('slug', 'super_admin')->first();
        $inventoryManagerRole = DB::table('roles')->where('slug', 'inventory_manager')->first();
        $departmentHeadRole = DB::table('roles')->where('slug', 'department_head')->first();
        $procurementOfficerRole = DB::table('roles')->where('slug', 'procurement_officer')->first();
        $facultyRole = DB::table('roles')->where('slug', 'faculty')->first();
        $staffRole = DB::table('roles')->where('slug', 'staff')->first();
        $studentRole = DB::table('roles')->where('slug', 'student')->first();
        
        $allPermissions = DB::table('permissions')->get();

        // Super Admin gets all permissions
        foreach ($allPermissions as $permission) {
            DB::table('role_permission')->insert([
                'id' => Str::uuid(),
                'role_id' => $superAdminRole->role_id,
                'permission_id' => $permission->permission_id,
                'is_enabled' => true,
                'granted_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Inventory Manager permissions
        $inventoryManagerPerms = $allPermissions->filter(function ($perm) {
            return str_starts_with($perm->module, 'inventory') || 
                   str_starts_with($perm->module, 'purchase_orders') ||
                   in_array($perm->name, ['users.view', 'departments.view', 'reports.view', 'reports.export']);
        });

        foreach ($inventoryManagerPerms as $permission) {
            DB::table('role_permission')->insert([
                'id' => Str::uuid(),
                'role_id' => $inventoryManagerRole->role_id,
                'permission_id' => $permission->permission_id,
                'is_enabled' => true,
                'granted_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Department Head permissions
        $departmentHeadPerms = $allPermissions->filter(function ($perm) {
            return in_array($perm->name, [
                'users.view', 'departments.view', 'departments.manage_members',
                'inventory.view', 'purchase_orders.view', 'purchase_orders.approve',
                'reports.view', 'reports.generate'
            ]);
        });

        foreach ($departmentHeadPerms as $permission) {
            DB::table('role_permission')->insert([
                'id' => Str::uuid(),
                'role_id' => $departmentHeadRole->role_id,
                'permission_id' => $permission->permission_id,
                'is_enabled' => true,
                'granted_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Procurement Officer permissions
        $procurementOfficerPerms = $allPermissions->filter(function ($perm) {
            return in_array($perm->name, [
                'inventory.view', 'purchase_orders.view', 'purchase_orders.create',
                'purchase_orders.edit', 'purchase_orders.export', 'reports.view'
            ]);
        });

        foreach ($procurementOfficerPerms as $permission) {
            DB::table('role_permission')->insert([
                'id' => Str::uuid(),
                'role_id' => $procurementOfficerRole->role_id,
                'permission_id' => $permission->permission_id,
                'is_enabled' => true,
                'granted_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Faculty permissions (basic access)
        $facultyPerms = $allPermissions->filter(function ($perm) {
            return in_array($perm->name, [
                'inventory.view', 'purchase_orders.view', 'purchase_orders.create'
            ]);
        });

        foreach ($facultyPerms as $permission) {
            DB::table('role_permission')->insert([
                'id' => Str::uuid(),
                'role_id' => $facultyRole->role_id,
                'permission_id' => $permission->permission_id,
                'is_enabled' => true,
                'granted_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Staff permissions (very basic)
        $staffPerms = $allPermissions->filter(function ($perm) {
            return in_array($perm->name, [
                'inventory.view', 'purchase_orders.view'
            ]);
        });

        foreach ($staffPerms as $permission) {
            DB::table('role_permission')->insert([
                'id' => Str::uuid(),
                'role_id' => $staffRole->role_id,
                'permission_id' => $permission->permission_id,
                'is_enabled' => true,
                'granted_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Student permissions (minimal)
        $studentPerms = $allPermissions->filter(function ($perm) {
            return in_array($perm->name, [
                'inventory.view'
            ]);
        });

        foreach ($studentPerms as $permission) {
            DB::table('role_permission')->insert([
                'id' => Str::uuid(),
                'role_id' => $studentRole->role_id,
                'permission_id' => $permission->permission_id,
                'is_enabled' => true,
                'granted_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down()
    {
        Schema::dropIfExists('role_permission');
    }
};