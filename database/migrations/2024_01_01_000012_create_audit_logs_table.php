<?php
// database/migrations/2024_01_01_000012_create_audit_logs_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('audit_id')->primary();
            $table->uuid('university_id');
            $table->string('table_name');
            $table->string('record_id');
            $table->string('action'); // CREATE, UPDATE, DELETE
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->text('url');
            $table->ipAddress('ip_address');
            $table->string('user_agent')->nullable();
            $table->uuid('user_id')->nullable();
            $table->timestamp('performed_at')->useCurrent();

            $table->foreign('university_id')
                  ->references('university_id')
                  ->on('universities')
                  ->onDelete('cascade');

            $table->index(['table_name', 'record_id']);
            $table->index(['action', 'performed_at']);
            $table->index('user_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('audit_logs');
    }
};