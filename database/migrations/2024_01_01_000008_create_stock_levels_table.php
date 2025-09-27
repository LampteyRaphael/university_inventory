<?php
// database/migrations/2024_01_01_000008_create_stock_levels_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('stock_levels', function (Blueprint $table) {
            $table->uuid('stock_id')->primary();
            $table->uuid('university_id');
            $table->uuid('item_id');
            $table->uuid('department_id');
            $table->uuid('location_id')->nullable();
            $table->integer('current_quantity')->default(0);
            $table->integer('committed_quantity')->default(0);
            $table->integer('available_quantity')->default(0);
            $table->integer('on_order_quantity')->default(0);
            $table->decimal('average_cost', 12, 2)->default(0);
            $table->decimal('total_value', 12, 2)->default(0);
            $table->date('last_count_date')->nullable();
            $table->date('next_count_date')->nullable();
            $table->enum('count_frequency', ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])->nullable();
            $table->decimal('reorder_level', 10, 2)->default(0);
            $table->decimal('max_level', 10, 2)->nullable();
            $table->decimal('safety_stock', 10, 2)->default(0);
            $table->integer('lead_time_days')->default(0);
            $table->decimal('service_level', 5, 2)->default(95); // Percentage
            $table->json('stock_movement_stats')->nullable();
            $table->timestamp('last_updated');
            $table->timestamps();

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

            $table->unique(['item_id', 'department_id', 'location_id']);
            $table->index(['university_id', 'department_id']);
            $table->index('available_quantity');
        });
    }

    public function down()
    {
        Schema::dropIfExists('stock_levels');
    }
};