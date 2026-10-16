<?php

namespace App\Http\Controllers;

use App\Models\Material;
use App\Models\StudyProject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MaterialController extends Controller
{
    public function index(Request $request, StudyProject $studyProject): JsonResponse
    {
        $this->authorizeProject($request, $studyProject);

        return response()->json($studyProject->materials()->with('units')->latest()->get());
    }

    public function store(Request $request, StudyProject $studyProject): JsonResponse
    {
        $this->authorizeProject($request, $studyProject);

        $request->validate([
            'file' => 'required|file|mimes:pdf|max:51200', // max 50MB PDF
            'title' => 'nullable|string|max:255',
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $title = $request->input('title') ?: pathinfo($originalName, PATHINFO_FILENAME);
        $fileSize = $file->getSize();
        $mimeType = $file->getMimeType() ?: 'application/pdf';

        $path = $file->store("materials/{$studyProject->id}", 'local');

        $material = Material::create([
            'user_id' => $request->user()->id,
            'study_project_id' => $studyProject->id,
            'title' => $title,
            'original_file_name' => $originalName,
            'storage_path' => $path,
            'mime_type' => $mimeType,
            'file_size_bytes' => $fileSize,
            'processing_status' => 'ready', // Ready with provisional units
        ]);

        // Seed initial provisional study units so the user has immediate structure to work with
        $initialUnits = [
            ['title' => 'Overview & Introduction', 'page_start' => 1, 'page_end' => 5, 'estimated_minutes' => 20, 'order_index' => 1],
            ['title' => 'Core Concepts & Principles', 'page_start' => 6, 'page_end' => 18, 'estimated_minutes' => 30, 'order_index' => 2],
            ['title' => 'In-depth Analysis', 'page_start' => 19, 'page_end' => 32, 'estimated_minutes' => 35, 'order_index' => 3],
            ['title' => 'Summary & Key Takeaways', 'page_start' => 33, 'page_end' => 40, 'estimated_minutes' => 25, 'order_index' => 4],
        ];

        foreach ($initialUnits as $u) {
            $material->units()->create([
                'study_project_id' => $studyProject->id,
                'title' => $u['title'],
                'page_start' => $u['page_start'],
                'page_end' => $u['page_end'],
                'estimated_minutes' => $u['estimated_minutes'],
                'order_index' => $u['order_index'],
                'difficulty' => 'medium',
                'is_completed' => false,
            ]);
        }

        $material->load('units');

        return response()->json($material, 201);
    }

    public function show(Request $request, Material $material): JsonResponse
    {
        if ($material->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        $material->load('units');

        return response()->json($material);
    }

    public function download(Request $request, Material $material)
    {
        if ($material->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        if (! Storage::disk('local')->exists($material->storage_path)) {
            abort(404, 'Material file not found.');
        }

        return Storage::disk('local')->response($material->storage_path, $material->original_file_name);
    }

    public function destroy(Request $request, Material $material): JsonResponse
    {
        if ($material->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        if (Storage::disk('local')->exists($material->storage_path)) {
            Storage::disk('local')->delete($material->storage_path);
        }

        $material->delete();

        return response()->json(['message' => 'Material deleted successfully']);
    }

    private function authorizeProject(Request $request, StudyProject $studyProject): void
    {
        if ($studyProject->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to study project.');
        }
    }
}
