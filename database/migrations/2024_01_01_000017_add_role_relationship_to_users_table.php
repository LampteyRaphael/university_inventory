<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Add role_id foreign key (keeping the enum for fallback)
            $table->uuid('role_id')->nullable()->after('university_id');
            
            $table->foreign('role_id')
                  ->references('role_id')
                  ->on('roles')
                  ->onDelete('set null');

            $table->index(['role_id', 'is_active']);
        });

        // Migrate existing enum roles to role_id
        $this->migrateExistingRoles();
    }

    private function migrateExistingRoles()
    {
        $roles = DB::table('roles')->get()->keyBy('slug');
        
        $users = DB::table('users')->get();
        
        foreach ($users as $user) {
            $roleSlug = $user->role; // This comes from your existing enum column
            $role = $roles[$roleSlug] ?? $roles['staff'];
            
            DB::table('users')
                ->where('user_id', $user->user_id)
                ->update(['role_id' => $role->role_id]);
        }
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');
        });
    }
};