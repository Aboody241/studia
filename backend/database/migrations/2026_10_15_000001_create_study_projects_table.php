<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('study_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('subject')->nullable();
            $table->text('description')->nullable();
            $table->string('strategy')->default('pomodoro_25_5');
            $table->unsignedInteger('daily_available_minutes')->default(120);
            $table->date('target_deadline')->nullable();
            $table->enum('status', ['active', 'completed', 'archived'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_projects');
    }
};
