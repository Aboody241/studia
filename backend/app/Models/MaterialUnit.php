<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MaterialUnit extends Model
{
    use HasFactory;

    protected $fillable = [
        'material_id',
        'study_project_id',
        'parent_unit_id',
        'title',
        'order_index',
        'page_start',
        'page_end',
        'estimated_minutes',
        'actual_minutes_spent',
        'difficulty',
        'is_completed',
        'completed_at',
    ];

    protected $casts = [
        'order_index' => 'integer',
        'page_start' => 'integer',
        'page_end' => 'integer',
        'estimated_minutes' => 'integer',
        'actual_minutes_spent' => 'integer',
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    public function studyProject(): BelongsTo
    {
        return $this->belongsTo(StudyProject::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(MaterialUnit::class, 'parent_unit_id');
    }

    public function subUnits(): HasMany
    {
        return $this->hasMany(MaterialUnit::class, 'parent_unit_id');
    }

    public function focusSessions(): HasMany
    {
        return $this->hasMany(FocusSession::class);
    }
}
