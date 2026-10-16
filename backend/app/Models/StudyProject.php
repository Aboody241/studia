<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudyProject extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'subject',
        'description',
        'strategy',
        'daily_available_minutes',
        'target_deadline',
        'status',
    ];

    protected $casts = [
        'daily_available_minutes' => 'integer',
        'target_deadline' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function materials(): HasMany
    {
        return $this->hasMany(Material::class);
    }

    public function units(): HasMany
    {
        return $this->hasMany(MaterialUnit::class);
    }

    public function focusSessions(): HasMany
    {
        return $this->hasMany(FocusSession::class);
    }
}
