<?php
// database/migrations/2024_01_01_000004_create_suppliers_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->uuid('supplier_id')->primary();
            $table->uuid('university_id');
            $table->string('supplier_code')->unique();
            $table->string('legal_name');
            $table->string('trade_name')->nullable();
            $table->enum('supplier_type', ['manufacturer', 'distributor', 'wholesaler', 'retailer', 'service']);
            $table->string('contact_person');
            $table->string('phone');
            $table->string('email');
            $table->string('website')->nullable();
            $table->text('address');
            $table->string('city');
            $table->string('state');
            $table->string('country');
            $table->string('postal_code', 20);
            $table->string('tax_id')->nullable();
            $table->string('vat_number')->nullable();
            $table->decimal('credit_limit', 12, 2)->nullable();
            $table->integer('payment_terms_days')->default(30);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('delivery_reliability')->default(0); // Percentage
            $table->integer('quality_rating')->default(0); // Percentage
            $table->json('certifications')->nullable();
            $table->boolean('is_approved')->default(false);
            $table->date('approval_date')->nullable();
            $table->date('next_evaluation_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->uuid('approved_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('university_id')
                  ->references('university_id')
                  ->on('universities')
                  ->onDelete('cascade');

            $table->index(['university_id', 'is_active', 'is_approved']);
            $table->index('supplier_type');
        });
    }

    public function down()
    {
        Schema::dropIfExists('suppliers');
    }
};