<?php
// database/migrations/2024_01_01_000011_create_locations_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->uuid('location_id')->primary();
            $table->uuid('university_id');
            $table->uuid('department_id');
            $table->string('location_code')->unique();
            $table->string('name');
            $table->string('building');
            $table->string('floor')->nullable();
            $table->string('room_number')->nullable();
            $table->string('aisle')->nullable();
            $table->string('shelf')->nullable();
            $table->string('bin')->nullable();
            $table->decimal('capacity', 10, 2)->nullable();
            $table->decimal('current_utilization', 10, 2)->default(0);
            $table->enum('location_type', ['storage', 'office', 'lab', 'classroom', 'workshop', 'outdoor']);
            $table->boolean('is_secured')->default(false);
            $table->boolean('is_climate_controlled')->default(false);
            $table->decimal('temperature_min', 5, 2)->nullable();
            $table->decimal('temperature_max', 5, 2)->nullable();
            $table->decimal('humidity_min', 5, 2)->nullable();
            $table->decimal('humidity_max', 5, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->uuid('managed_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('university_id')
                  ->references('university_id')
                  ->on('universities')
                  ->onDelete('cascade');
                  
            $table->foreign('department_id')
                  ->references('department_id')
                  ->on('departments')
                  ->onDelete('cascade');

            $table->unique(['university_id', 'department_id', 'location_code']);
            $table->index(['building', 'floor', 'room_number']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('locations');
    }
};