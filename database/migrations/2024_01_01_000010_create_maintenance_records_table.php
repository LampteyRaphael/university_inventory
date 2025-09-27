<?php
// database/migrations/2024_01_01_000010_create_maintenance_records_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('maintenance_records', function (Blueprint $table) {
            $table->uuid('maintenance_id')->primary();
            $table->uuid('university_id');
            $table->uuid('item_id');
            $table->uuid('department_id');
            $table->string('maintenance_code')->unique();
            $table->date('scheduled_date');
            $table->date('completed_date')->nullable();
            $table->enum('maintenance_type', ['preventive', 'corrective', 'predictive', 'condition_based', 'emergency']);
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->text('description');
            $table->text('work_performed')->nullable();
            $table->text('root_cause')->nullable();
            $table->text('recommendations')->nullable();
            $table->decimal('labor_cost', 10, 2)->default(0);
            $table->decimal('parts_cost', 10, 2)->default(0);
            $table->decimal('total_cost', 10, 2)->default(0);
            $table->integer('downtime_hours')->default(0);
            $table->string('technician')->nullable();
            $table->string('vendor')->nullable();
            $table->date('next_maintenance_date')->nullable();
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled', 'deferred'])->default('scheduled');
            $table->uuid('created_by');
            $table->uuid('assigned_to')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('university_id')
                  ->references('university_id')
                  ->on('universities')
                  ->onDelete('cascade');
                  
            $table->foreign('item_id')
                  ->references('item_id')
                  ->on('inventory_items')
                  ->onDelete('cascade');
                  
            $table->foreign('department_id')
                  ->references('department_id')
                  ->on('departments')
                  ->onDelete('cascade');

            $table->index(['university_id', 'status', 'scheduled_date']);
            $table->index('maintenance_type');
        });
    }

    public function down()
    {
        Schema::dropIfExists('maintenance_records');
    }
};