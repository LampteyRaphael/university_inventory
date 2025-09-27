<?php
// database/migrations/2024_01_01_000003_create_inventory_items_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->uuid('item_id')->primary();
            $table->uuid('university_id');
            $table->uuid('category_id');
            $table->string('item_code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('specifications')->nullable();
            $table->string('unit_of_measure');
            $table->decimal('unit_cost', 12, 2)->default(0);
            $table->decimal('current_value', 12, 2)->default(0);
            $table->integer('minimum_stock_level')->default(0);
            $table->integer('maximum_stock_level')->nullable();
            $table->integer('reorder_point')->default(0);
            $table->integer('economic_order_quantity')->nullable();
            $table->enum('abc_classification', ['A', 'B', 'C'])->default('C');
            $table->decimal('weight_kg', 8, 3)->nullable();
            $table->decimal('volume_cubic_m', 8, 4)->nullable();
            $table->boolean('is_hazardous')->default(false);
            $table->string('hazard_type')->nullable();
            $table->text('handling_instructions')->nullable();
            $table->string('storage_conditions')->nullable();
            $table->integer('shelf_life_days')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('barcode')->nullable()->unique();
            $table->string('qr_code')->nullable()->unique();
            $table->string('rfid_tag')->nullable()->unique();
            $table->string('image_url')->nullable();
            $table->string('document_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->uuid('created_by');
            $table->uuid('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('university_id')
                  ->references('university_id')
                  ->on('universities')
                  ->onDelete('cascade');
                  
            $table->foreign('category_id')
                  ->references('category_id')
                  ->on('item_categories')
                  ->onDelete('restrict');

            $table->index(['university_id', 'category_id']);
            $table->index(['item_code', 'is_active']);
            $table->index('abc_classification');
            $table->index('expiry_date');
        });

        // Add full-text search index
        DB::statement('ALTER TABLE inventory_items ADD FULLTEXT fulltext_index (name, description)');
    }

    public function down()
    {
        Schema::dropIfExists('inventory_items');
    }
};