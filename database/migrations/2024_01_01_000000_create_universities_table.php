<?php
// database/migrations/2024_01_01_000000_create_universities_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::create('universities', function (Blueprint $table) {
            $table->uuid('university_id')->primary();
            $table->string('name');
            $table->string('code', 10)->unique();
            $table->text('address');
            $table->string('city');
            $table->string('state');
            $table->string('country');
            $table->string('postal_code', 20);
            $table->string('contact_number', 20);
            $table->string('email');
            $table->string('website')->nullable();
            $table->date('established_date');
            $table->string('logo_url')->nullable();
            $table->json('settings')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['code', 'is_active']);
            $table->fullText(['name', 'city', 'state']);
        });

        // Add constraints that can't be defined in blueprint
        DB::statement('ALTER TABLE universities ADD CONSTRAINT check_valid_email 
            CHECK (email LIKE "%@%")');
    }

    public function down()
    {
        Schema::dropIfExists('universities');
    }
};