<?php

namespace App\Http\Controllers;

use App\Models\FocusSession;
use App\Models\StudyProject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FocusSessionController extends Controller
{
    /**
     * Get the active focus session (if any) for the authenticated user.
     */
    public function active(Request $request): JsonResponse
    {
        $session = FocusSession::where('user_id', $request->user()->id)
            ->whereIn('status', ['running', 'paused'])
            ->with(['studyProject', 'materialUnit'])
            ->latest()
            ->first();

        if (! $session) {
            return response()->json(['active_session' => null]);
        }

        return response()->json([
            'active_session' => $session,
            'live_focus_seconds' => $session->live_focus_seconds,
        ]);
    }

    /**
     * Start a new focus session.
     */
    public function start(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'study_project_id' => 'required|exists:study_projects,id',
            'material_unit_id' => 'nullable|exists:material_units,id',
            'strategy' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:1|max:180',
        ]);

        $project = StudyProject::findOrFail($validated['study_project_id']);
        if ($project->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        // Auto-pause or abandon any previous open session
        FocusSession::where('user_id', $request->user()->id)
            ->whereIn('status', ['running', 'paused'])
            ->update([
                'status' => 'abandoned',
                'completed_at' => now(),
            ]);

        $plannedMinutes = $validated['duration_minutes'] ?? 25;

        $session = FocusSession::create([
            'user_id' => $request->user()->id,
            'study_project_id' => $project->id,
            'material_unit_id' => $validated['material_unit_id'] ?? null,
            'strategy' => $validated['strategy'] ?? 'pomodoro_25_5',
            'status' => 'running',
            'planned_duration_seconds' => $plannedMinutes * 60,
            'started_at' => now(),
            'accumulated_paused_seconds' => 0,
        ]);

        $session->load(['studyProject', 'materialUnit']);

        return response()->json([
            'session' => $session,
            'live_focus_seconds' => 0,
        ], 201);
    }

    /**
     * Pause an active session.
     */
    public function pause(Request $request, FocusSession $focusSession): JsonResponse
    {
        $this->authorizeSession($request, $focusSession);

        if ($focusSession->status !== 'running') {
            return response()->json(['message' => 'Session is not currently running'], 400);
        }

        $now = now();
        $totalElapsed = $now->diffInSeconds($focusSession->started_at);
        $activeFocus = max(0, $totalElapsed - $focusSession->accumulated_paused_seconds);

        $focusSession->status = 'paused';
        $focusSession->paused_at = $now;
        $focusSession->actual_focus_seconds = min($activeFocus, $focusSession->planned_duration_seconds);
        $focusSession->interruption_count += 1;
        $focusSession->save();

        return response()->json([
            'session' => $focusSession,
            'live_focus_seconds' => $focusSession->actual_focus_seconds,
        ]);
    }

    /**
     * Resume a paused session.
     */
    public function resume(Request $request, FocusSession $focusSession): JsonResponse
    {
        $this->authorizeSession($request, $focusSession);

        if ($focusSession->status !== 'paused') {
            return response()->json(['message' => 'Session is not paused'], 400);
        }

        $pausedDuration = $focusSession->paused_at ? now()->diffInSeconds($focusSession->paused_at) : 0;
        $focusSession->accumulated_paused_seconds += $pausedDuration;
        $focusSession->paused_at = null;
        $focusSession->status = 'running';
        $focusSession->save();

        return response()->json([
            'session' => $focusSession,
            'live_focus_seconds' => $focusSession->live_focus_seconds,
        ]);
    }

    /**
     * Complete a focus session and credit time to the unit and project.
     */
    public function complete(Request $request, FocusSession $focusSession): JsonResponse
    {
        $this->authorizeSession($request, $focusSession);

        if (! in_array($focusSession->status, ['running', 'paused'])) {
            return response()->json(['message' => 'Session already finalized'], 400);
        }

        $finalFocus = $focusSession->live_focus_seconds;
        $focusSession->status = 'completed';
        $focusSession->completed_at = now();
        $focusSession->actual_focus_seconds = $finalFocus;
        $focusSession->save();

        // Credit minutes to unit if attached
        if ($focusSession->material_unit_id && $focusSession->materialUnit) {
            $unit = $focusSession->materialUnit;
            $unitMinutes = round($finalFocus / 60);
            $unit->actual_minutes_spent += $unitMinutes;

            if ($request->boolean('mark_unit_complete')) {
                $unit->is_completed = true;
                $unit->completed_at = now();
            }
            $unit->save();
        }

        return response()->json([
            'session' => $focusSession,
            'actual_focus_seconds' => $finalFocus,
            'message' => 'Focus session completed successfully! Great work.',
        ]);
    }

    private function authorizeSession(Request $request, FocusSession $session): void
    {
        if ($session->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to focus session.');
        }
    }
}
