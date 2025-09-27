<?php
// database/migrations/2024_01_01_000007_create_inventory_transactions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->uuid('transaction_id')->primary();
            $table->uuid('university_id');
            $table->uuid('item_id');
            $table->uuid('department_id');
            $table->enum('transaction_type', ['purchase', 'sale', 'transfer', 'adjustment', 'return', 'write_off', 'consumption', 'production', 'donation']);
            $table->integer('quantity');
            $table->decimal('unit_cost', 12, 2)->default(0);
            $table->decimal('total_value', 12, 2)->default(0);
            $table->dateTime('transaction_date');
            $table->string('reference_number')->nullable();
            $table->uuid('reference_id')->nullable(); // Link to PO, SO, etc.
            $table->string('batch_number')->nullable();
            $table->date('expiry_date')->nullable();
            $table->text('notes')->nullable();
            $table->uuid('source_location_id')->nullable();
            $table->uuid('destination_location_id')->nullable();
            $table->enum('status', ['pending', 'completed', 'cancelled', 'reversed'])->default('completed');
            $table->uuid('performed_by');
            $table->uuid('approved_by')->nullable();
            $table->timestamps();

            $table->foreign('university_id')
                  ->references('university_id')
                  ->on('universities')
                  ->onDelete('cascade');
                  
            $table->foreign('item_id')
                  ->references('item_id')
                  ->on('inventory_items')
                  ->onDelete('restrict');
                  
            $table->foreign('department_id')
                  ->references('department_id')
                  ->on('departments')
                  ->onDelete('restrict');

            // Use shorter index names to avoid MySQL length limitations
            $table->index(['university_id', 'transaction_type', 'transaction_date'], 'inv_trans_univ_type_date_idx');
            $table->index(['item_id', 'department_id'], 'inv_trans_item_dept_idx');
            $table->index('reference_number', 'inv_trans_ref_num_idx');
            $table->index('batch_number', 'inv_trans_batch_num_idx');
            $table->index('transaction_date', 'inv_trans_date_idx');
            $table->index('status', 'inv_trans_status_idx');
        });
    }

    public function down()
    {
        Schema::dropIfExists('inventory_transactions');
    }
};