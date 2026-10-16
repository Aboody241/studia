<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Material extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'study_project_id',
        'title',
        'original_file_name',
        'storage_path',
        'mime_type',
        'file_size_bytes',
        'page_count',
        'processing_status',
        'processing_error',
    ];

    protected $casts = [
        'file_size_bytes' => 'integer',
        'page_count' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function studyProject(): BelongsTo
    {
        return $this->belongsTo(StudyProject::class);
    }

    public function units(): HasMany
    {
        return $this->hasMany(MaterialUnit::class);
    }
}
