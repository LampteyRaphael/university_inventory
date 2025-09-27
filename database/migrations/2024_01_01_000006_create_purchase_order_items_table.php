<?php
// database/migrations/2024_01_01_000006_create_purchase_order_items_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->uuid('order_item_id')->primary();
            $table->uuid('order_id');
            $table->uuid('item_id');
            $table->integer('quantity_ordered');
            $table->integer('quantity_received')->default(0);
            $table->integer('quantity_cancelled')->default(0);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('discount_rate', 5, 2)->default(0);
            $table->decimal('line_total', 10, 2);
            $table->date('expected_delivery_date')->nullable();
            $table->date('actual_delivery_date')->nullable();
            $table->enum('status', ['ordered', 'partially_received', 'received', 'cancelled'])->default('ordered');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('order_id')
                  ->references('order_id')
                  ->on('purchase_orders')
                  ->onDelete('cascade');
                  
            $table->foreign('item_id')
                  ->references('item_id')
                  ->on('inventory_items')
                  ->onDelete('restrict');

            $table->index(['order_id', 'item_id']);
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('purchase_order_items');
    }
};