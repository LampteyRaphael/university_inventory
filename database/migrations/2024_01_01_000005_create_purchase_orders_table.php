<?php
// database/migrations/2024_01_01_000005_create_purchase_orders_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->uuid('order_id')->primary();
            $table->uuid('university_id');
            $table->uuid('supplier_id');
            $table->uuid('department_id');
            $table->string('po_number')->unique();
            $table->enum('order_type', ['regular', 'emergency', 'capital', 'consumable', 'service']);
            $table->date('order_date');
            $table->date('expected_delivery_date');
            $table->date('actual_delivery_date')->nullable();
            $table->decimal('subtotal_amount', 12, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('shipping_amount', 12, 2)->default(0);  
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->enum('currency', ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD','GHS'])->default('GHS');
            $table->decimal('exchange_rate', 10, 4)->default(1);
            $table->enum('status', ['draft', 'submitted', 'approved', 'ordered', 'partially_received', 'received', 'cancelled', 'closed'])->default('draft');
            $table->enum('payment_status', ['pending', 'partial', 'paid', 'overdue'])->default('pending');
            $table->text('notes')->nullable();
            $table->text('terms_and_conditions')->nullable();
            $table->uuid('requested_by');
            $table->uuid('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->uuid('received_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('university_id')
                  ->references('university_id')
                  ->on('universities')
                  ->onDelete('cascade');
                  
            $table->foreign('supplier_id')
                  ->references('supplier_id')
                  ->on('suppliers')
                  ->onDelete('restrict');
                  
            $table->foreign('department_id')
                  ->references('department_id')
                  ->on('departments')
                  ->onDelete('restrict');

            $table->index(['university_id', 'status']);
            $table->index(['order_date', 'expected_delivery_date']);
            $table->index('po_number');
        });
    }

    public function down()
    {
        Schema::dropIfExists('purchase_orders');
    }
};