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
        Schema::create('roles', function (Blueprint $table) {
            $table->uuid('role_id')->primary();
            $table->uuid('university_id')->nullable();
            $table->string('name'); // e.g., 'Super Administrator', 'Inventory Manager'
            $table->string('slug')->unique(); // e.g., 'super_admin', 'inventory_manager'
            $table->string('description')->nullable();
            $table->integer('level')->default(0); // Hierarchy level for role inheritance
            $table->boolean('is_system_role')->default(false);
            $table->boolean('is_assignable')->default(true);
            $table->json('settings')->nullable(); // Additional role settings
            $table->timestamps();
            $table->softDeletes();

            // Foreign key
            $table->foreign('university_id')
                  ->references('university_id')
                  ->on('universities')
                  ->onDelete('cascade');

            // Indexes
            $table->index(['university_id', 'is_system_role']);
            $table->index(['slug', 'is_assignable']);
            $table->index('level');
        });

        // Insert default system roles
        $this->seedDefaultRoles();
    }

    private function seedDefaultRoles()
    {
        $roles = [
            [
                'role_id' => Str::uuid(),
                'name' => 'Super Administrator',
                'slug' => 'super_admin',
                'description' => 'Full system administrator with all permissions across all universities',
                'level' => 100,
                'is_system_role' => true,
                'is_assignable' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => Str::uuid(),
                'name' => 'Inventory Manager',
                'slug' => 'inventory_manager',
                'description' => 'Manages inventory, categories, and stock levels',
                'level' => 80,
                'is_system_role' => false,
                'is_assignable' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => Str::uuid(),
                'name' => 'Department Head',
                'slug' => 'department_head',
                'description' => 'Oversees department operations and approvals',
                'level' => 70,
                'is_system_role' => false,
                'is_assignable' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => Str::uuid(),
                'name' => 'Procurement Officer',
                'slug' => 'procurement_officer',
                'description' => 'Handles purchase orders and vendor management',
                'level' => 60,
                'is_system_role' => false,
                'is_assignable' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => Str::uuid(),
                'name' => 'Faculty',
                'slug' => 'faculty',
                'description' => 'Teaching staff with limited system access',
                'level' => 40,
                'is_system_role' => false,
                'is_assignable' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => Str::uuid(),
                'name' => 'Staff',
                'slug' => 'staff',
                'description' => 'General staff with basic system access',
                'level' => 30,
                'is_system_role' => false,
                'is_assignable' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => Str::uuid(),
                'name' => 'Student',
                'slug' => 'student',
                'description' => 'Student with minimal system access',
                'level' => 10,
                'is_system_role' => false,
                'is_assignable' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('roles')->insert($roles);
    }

    public function down()
    {
        Schema::dropIfExists('roles');
    }
};