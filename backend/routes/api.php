<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FocusSessionController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\MaterialUnitController;
use App\Http\Controllers\StudyProjectController;
use Illuminate\Support\Facades\Route;

// Public authentication routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Study Projects
    Route::apiResource('projects', StudyProjectController::class);
    Route::get('/projects/{studyProject}/plan', [StudyProjectController::class, 'plan']);

    // Materials
    Route::get('/projects/{studyProject}/materials', [MaterialController::class, 'index']);
    Route::post('/projects/{studyProject}/materials', [MaterialController::class, 'store']);
    Route::get('/materials/{material}', [MaterialController::class, 'show']);
    Route::get('/materials/{material}/download', [MaterialController::class, 'download']);
    Route::delete('/materials/{material}', [MaterialController::class, 'destroy']);

    // Material Units
    Route::post('/projects/{studyProject}/units', [MaterialUnitController::class, 'store']);
    Route::put('/units/{materialUnit}', [MaterialUnitController::class, 'update']);
    Route::patch('/units/{materialUnit}/toggle-complete', [MaterialUnitController::class, 'toggleComplete']);
    Route::post('/projects/{studyProject}/units/reorder', [MaterialUnitController::class, 'reorder']);
    Route::delete('/units/{materialUnit}', [MaterialUnitController::class, 'destroy']);

    // Focus Sessions & Timer
    Route::get('/sessions/active', [FocusSessionController::class, 'active']);
    Route::post('/sessions/start', [FocusSessionController::class, 'start']);
    Route::post('/sessions/{focusSession}/pause', [FocusSessionController::class, 'pause']);
    Route::post('/sessions/{focusSession}/resume', [FocusSessionController::class, 'resume']);
    Route::post('/sessions/{focusSession}/complete', [FocusSessionController::class, 'complete']);
});
