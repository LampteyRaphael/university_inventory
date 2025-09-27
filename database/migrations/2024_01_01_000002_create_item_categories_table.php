<?php
// database/migrations/2024_01_01_000002_create_item_categories_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('item_categories', function (Blueprint $table) {
            $table->uuid('category_id')->primary();
            $table->uuid('university_id');
            $table->uuid('parent_category_id')->nullable();
            $table->string('category_code', 20);
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->integer('warranty_period_days')->default(0);
            $table->decimal('depreciation_rate', 5, 2)->default(0);
            $table->enum('depreciation_method', ['straight_line', 'reducing_balance'])->default('straight_line');
            $table->boolean('requires_serial_number')->default(false);
            $table->boolean('requires_maintenance')->default(false);
            $table->integer('maintenance_interval_days')->nullable();
            $table->json('specification_template')->nullable();
            $table->integer('lft')->nullable();
            $table->integer('rgt')->nullable();
            $table->integer('depth')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('university_id')
                  ->references('university_id')
                  ->on('universities')
                  ->onDelete('cascade');
                  
            $table->foreign('parent_category_id')
                  ->references('category_id')
                  ->on('item_categories')
                  ->onDelete('set null');

            $table->unique(['university_id', 'category_code']);
            $table->index(['lft', 'rgt', 'depth']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('item_categories');
    }
};