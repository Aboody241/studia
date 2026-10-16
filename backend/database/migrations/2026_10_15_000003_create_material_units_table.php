<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('material_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_id')->constrained()->cascadeOnDelete();
            $table->foreignId('study_project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_unit_id')->nullable()->constrained('material_units')->nullOnDelete();
            $table->string('title');
            $table->unsignedInteger('order_index')->default(0);
            $table->unsignedInteger('page_start')->nullable();
            $table->unsignedInteger('page_end')->nullable();
            $table->unsignedInteger('estimated_minutes')->default(25);
            $table->unsignedInteger('actual_minutes_spent')->default(0);
            $table->enum('difficulty', ['easy', 'medium', 'hard'])->default('medium');
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('material_units');
    }
};
