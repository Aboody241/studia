<?php

namespace App\Http\Controllers;

use App\Models\MaterialUnit;
use App\Models\StudyProject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaterialUnitController extends Controller
{
    public function store(Request $request, StudyProject $studyProject): JsonResponse
    {
        if ($studyProject->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'material_id' => 'nullable|exists:materials,id',
            'title' => 'required|string|max:255',
            'estimated_minutes' => 'nullable|integer|min:5|max:300',
            'page_start' => 'nullable|integer|min:1',
            'page_end' => 'nullable|integer|min:1',
            'difficulty' => 'nullable|in:easy,medium,hard',
        ]);

        $materialId = $validated['material_id'] ?? $studyProject->materials()->first()?->id;
        if (! $materialId) {
            $defaultMaterial = $studyProject->materials()->create([
                'user_id' => $request->user()->id,
                'title' => $studyProject->name . ' Course Notes',
                'original_file_name' => 'course_notes.pdf',
                'storage_path' => 'materials/sample_os.pdf',
                'mime_type' => 'application/pdf',
                'file_size_bytes' => 0,
                'processing_status' => 'ready',
            ]);
            $materialId = $defaultMaterial->id;
        }

        $maxOrder = $studyProject->units()->max('order_index') ?? 0;

        $unit = $studyProject->units()->create([
            'material_id' => $materialId,
            'title' => $validated['title'],
            'estimated_minutes' => $validated['estimated_minutes'] ?? 25,
            'page_start' => $validated['page_start'] ?? null,
            'page_end' => $validated['page_end'] ?? null,
            'difficulty' => $validated['difficulty'] ?? 'medium',
            'order_index' => $maxOrder + 1,
            'is_completed' => false,
        ]);

        return response()->json($unit, 201);
    }

    public function update(Request $request, MaterialUnit $materialUnit): JsonResponse
    {
        $this->authorizeUnit($request, $materialUnit);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'estimated_minutes' => 'sometimes|integer|min:5|max:300',
            'page_start' => 'nullable|integer|min:1',
            'page_end' => 'nullable|integer|min:1',
            'difficulty' => 'sometimes|in:easy,medium,hard',
            'order_index' => 'sometimes|integer',
        ]);

        $materialUnit->update($validated);

        return response()->json($materialUnit);
    }

    public function toggleComplete(Request $request, MaterialUnit $materialUnit): JsonResponse
    {
        $this->authorizeUnit($request, $materialUnit);

        $materialUnit->is_completed = ! $materialUnit->is_completed;
        $materialUnit->completed_at = $materialUnit->is_completed ? now() : null;
        $materialUnit->save();

        return response()->json($materialUnit);
    }

    public function reorder(Request $request, StudyProject $studyProject): JsonResponse
    {
        if ($studyProject->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'unit_ids' => 'required|array',
            'unit_ids.*' => 'integer|exists:material_units,id',
        ]);

        foreach ($validated['unit_ids'] as $index => $id) {
            MaterialUnit::where('id', $id)
                ->where('study_project_id', $studyProject->id)
                ->update(['order_index' => $index + 1]);
        }

        return response()->json(['message' => 'Units reordered successfully']);
    }

    public function destroy(Request $request, MaterialUnit $materialUnit): JsonResponse
    {
        $this->authorizeUnit($request, $materialUnit);

        $materialUnit->delete();

        return response()->json(['message' => 'Study unit deleted successfully']);
    }

    private function authorizeUnit(Request $request, MaterialUnit $unit): void
    {
        if ($unit->studyProject->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to study unit.');
        }
    }
}
