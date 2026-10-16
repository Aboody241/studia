<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('focus_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('study_project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('material_unit_id')->nullable()->constrained('material_units')->nullOnDelete();
            $table->string('strategy')->default('pomodoro_25_5');
            $table->enum('status', ['running', 'paused', 'completed', 'abandoned'])->default('running');
            $table->unsignedInteger('planned_duration_seconds')->default(1500);
            $table->timestamp('started_at');
            $table->timestamp('paused_at')->nullable();
            $table->unsignedInteger('accumulated_paused_seconds')->default(0);
            $table->timestamp('completed_at')->nullable();
            $table->unsignedInteger('actual_focus_seconds')->default(0);
            $table->unsignedInteger('interruption_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('focus_sessions');
    }
};
