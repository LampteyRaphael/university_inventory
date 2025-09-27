<?php
// database/migrations/2024_01_01_000001_create_departments_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->uuid('department_id')->primary();
            $table->uuid('university_id');
            $table->string('department_code', 10);
            $table->string('name');
            $table->string('building');
            $table->string('floor')->nullable();
            $table->string('room_number')->nullable();
            $table->string('contact_person');
            $table->string('contact_email');
            $table->string('contact_phone', 20);
            $table->decimal('annual_budget', 15, 2)->default(0);
            $table->decimal('remaining_budget', 15, 2)->default(0);
            $table->uuid('department_head_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('custom_fields')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('university_id')
                  ->references('university_id')
                  ->on('universities')
                  ->onDelete('cascade');
                  
            $table->unique(['university_id', 'department_code']);
            $table->index(['university_id', 'is_active']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('departments');
    }
};