<?php

namespace App\Http\Controllers;

use App\Models\StudyProject;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudyProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $projects = $request->user()->studyProjects()
            ->withCount(['units', 'materials'])
            ->with(['units' => function ($query) {
                $query->select('id', 'study_project_id', 'is_completed', 'estimated_minutes', 'actual_minutes_spent');
            }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($project) {
                $totalUnits = $project->units->count();
                $completedUnits = $project->units->where('is_completed', true)->count();
                $totalEstMinutes = $project->units->sum('estimated_minutes');
                $totalActualMinutes = $project->units->sum('actual_minutes_spent');

                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'subject' => $project->subject,
                    'description' => $project->description,
                    'strategy' => $project->strategy,
                    'daily_available_minutes' => $project->daily_available_minutes,
                    'target_deadline' => $project->target_deadline?->toDateString(),
                    'status' => $project->status,
                    'total_units' => $totalUnits,
                    'completed_units' => $completedUnits,
                    'progress_percent' => $totalUnits > 0 ? round(($completedUnits / $totalUnits) * 100) : 0,
                    'total_estimated_minutes' => $totalEstMinutes,
                    'total_actual_minutes' => $totalActualMinutes,
                    'created_at' => $project->created_at,
                ];
            });

        return response()->json($projects);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'strategy' => 'nullable|string',
            'daily_available_minutes' => 'nullable|integer|min:15|max:1440',
            'target_deadline' => 'nullable|date|after_or_equal:today',
        ]);

        $project = $request->user()->studyProjects()->create([
            'name' => $validated['name'],
            'subject' => $validated['subject'] ?? null,
            'description' => $validated['description'] ?? null,
            'strategy' => $validated['strategy'] ?? 'pomodoro_25_5',
            'daily_available_minutes' => $validated['daily_available_minutes'] ?? 120,
            'target_deadline' => $validated['target_deadline'] ?? null,
            'status' => 'active',
        ]);

        return response()->json($project, 201);
    }

    public function show(Request $request, StudyProject $studyProject): JsonResponse
    {
        $this->authorizeAccess($request, $studyProject);

        $studyProject->load([
            'units' => function ($query) {
                $query->orderBy('order_index', 'asc');
            },
            'materials.units' => function ($query) {
                $query->orderBy('order_index', 'asc');
            },
            'focusSessions' => function ($query) {
                $query->latest()->limit(10);
            },
        ]);

        return response()->json($studyProject);
    }

    public function update(Request $request, StudyProject $studyProject): JsonResponse
    {
        $this->authorizeAccess($request, $studyProject);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'subject' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'strategy' => 'sometimes|string',
            'daily_available_minutes' => 'sometimes|integer|min:15|max:1440',
            'target_deadline' => 'nullable|date',
            'status' => 'sometimes|in:active,completed,archived',
        ]);

        $studyProject->update($validated);

        return response()->json($studyProject);
    }

    public function destroy(Request $request, StudyProject $studyProject): JsonResponse
    {
        $this->authorizeAccess($request, $studyProject);

        $studyProject->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }

    /**
     * Deterministic plan calculations for this study project.
     */
    public function plan(Request $request, StudyProject $studyProject): JsonResponse
    {
        $this->authorizeAccess($request, $studyProject);

        $units = $studyProject->units()->orderBy('order_index', 'asc')->get();
        $uncompletedUnits = $units->where('is_completed', false);

        $remainingMinutes = $uncompletedUnits->sum('estimated_minutes');
        $sessionLengthMinutes = 25; // standard Pomodoro
        $remainingPomodoros = ceil($remainingMinutes / $sessionLengthMinutes);

        $dailyCapacityMinutes = $studyProject->daily_available_minutes ?: 120;
        $dailyPomodoros = floor($dailyCapacityMinutes / 30); // 25m work + 5m break

        $daysNeeded = $dailyCapacityMinutes > 0 ? ceil($remainingMinutes / $dailyCapacityMinutes) : 0;

        $suggestedDeadline = null;
        if ($studyProject->target_deadline) {
            $daysAvailable = max(1, Carbon::today()->diffInDays($studyProject->target_deadline, false) + 1);
            $requiredDailyMinutes = ceil($remainingMinutes / $daysAvailable);
            $isRealistic = $requiredDailyMinutes <= $dailyCapacityMinutes;
            $suggestedDeadline = ! $isRealistic ? Carbon::today()->addDays($daysNeeded)->toDateString() : null;

            $deadlineFeasibility = [
                'target_deadline' => $studyProject->target_deadline->toDateString(),
                'days_remaining' => $daysAvailable,
                'required_daily_minutes' => $requiredDailyMinutes,
                'is_realistic' => $isRealistic,
                'warning' => ! $isRealistic ? "You need {$requiredDailyMinutes} min/day to hit this deadline, but your daily budget is {$dailyCapacityMinutes} min." : null,
                'suggested_deadline' => $suggestedDeadline,
                'suggested_daily_minutes' => $requiredDailyMinutes,
            ];
        }

        // Deterministic day-by-day scheduling
        $scheduledDays = [];
        $currentDate = Carbon::today();
        $unitQueue = $uncompletedUnits->values()->all();
        $queueIndex = 0;
        $totalQueueCount = count($unitQueue);

        $maxDays = max(7, $daysNeeded + 2);
        for ($day = 0; $day < $maxDays && $queueIndex < $totalQueueCount; $day++) {
            $date = $currentDate->copy()->addDays($day);
            $dayUnits = [];
            $accumulatedMinutes = 0;

            while ($queueIndex < $totalQueueCount) {
                $unit = $unitQueue[$queueIndex];
                $unitMinutes = $unit->estimated_minutes ?: 25;

                // Stop if adding this unit exceeds capacity, unless nothing added yet for today
                if ($accumulatedMinutes + $unitMinutes > $dailyCapacityMinutes && count($dayUnits) > 0) {
                    break;
                }

                $dayUnits[] = $unit;
                $accumulatedMinutes += $unitMinutes;
                $queueIndex++;
            }

            if (! empty($dayUnits)) {
                $scheduledDays[] = [
                    'date' => $date->toDateString(),
                    'day_name' => $day === 0 ? 'Today' : ($day === 1 ? 'Tomorrow' : $date->format('D')),
                    'day_label' => $day === 0 ? 'Today, ' . $date->format('M j') : ($day === 1 ? 'Tomorrow, ' . $date->format('M j') : $date->format('D, M j')),
                    'day_number' => $day,
                    'is_today' => $day === 0,
                    'total_minutes' => $accumulatedMinutes,
                    'pomodoros_count' => ceil($accumulatedMinutes / $sessionLengthMinutes),
                    'units_count' => count($dayUnits),
                    'units' => $dayUnits,
                    'is_over_capacity' => $accumulatedMinutes > $dailyCapacityMinutes,
                ];
            }
        }

        return response()->json([
            'project_id' => $studyProject->id,
            'project_name' => $studyProject->name,
            'total_units' => $units->count(),
            'remaining_units' => $uncompletedUnits->count(),
            'total_estimated_minutes' => $units->sum('estimated_minutes'),
            'remaining_minutes' => $remainingMinutes,
            'remaining_pomodoros' => $remainingPomodoros,
            'daily_available_minutes' => $dailyCapacityMinutes,
            'daily_pomodoro_capacity' => $dailyPomodoros,
            'estimated_days_needed' => $daysNeeded,
            'deadline_feasibility' => $deadlineFeasibility,
            'scheduled_days' => $scheduledDays,
            'next_recommended_unit' => $uncompletedUnits->first(),
        ]);
    }

    private function authorizeAccess(Request $request, StudyProject $studyProject): void
    {
        if ($studyProject->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to study project.');
        }
    }
}
