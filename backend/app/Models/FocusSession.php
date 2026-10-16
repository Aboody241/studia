<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FocusSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'study_project_id',
        'material_unit_id',
        'strategy',
        'status',
        'planned_duration_seconds',
        'started_at',
        'paused_at',
        'accumulated_paused_seconds',
        'completed_at',
        'actual_focus_seconds',
        'interruption_count',
    ];

    protected $casts = [
        'planned_duration_seconds' => 'integer',
        'accumulated_paused_seconds' => 'integer',
        'actual_focus_seconds' => 'integer',
        'interruption_count' => 'integer',
        'started_at' => 'datetime',
        'paused_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function studyProject(): BelongsTo
    {
        return $this->belongsTo(StudyProject::class);
    }

    public function materialUnit(): BelongsTo
    {
        return $this->belongsTo(MaterialUnit::class);
    }

    /**
     * Calculate live elapsed focus seconds authoritatively on the server.
     */
    public function getLiveFocusSecondsAttribute(): int
    {
        if ($this->status === 'completed' || $this->status === 'abandoned') {
            return $this->actual_focus_seconds;
        }

        if ($this->status === 'paused') {
            return $this->actual_focus_seconds;
        }

        // status === 'running'
        $totalElapsed = now()->diffInSeconds($this->started_at);
        $activeFocus = max(0, $totalElapsed - $this->accumulated_paused_seconds);

        return min($activeFocus, $this->planned_duration_seconds);
    }
}
