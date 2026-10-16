<?php

namespace Database\Seeders;

use App\Models\FocusSession;
use App\Models\Material;
use App\Models\MaterialUnit;
use App\Models\StudyProject;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'demo@studia.app'],
            [
                'name' => 'Abdullah',
                'password' => Hash::make('password'),
            ]
        );

        $project = StudyProject::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'CS 201: Operating Systems'],
            [
                'subject' => 'Computer Science',
                'description' => 'Operating systems concepts, processes, memory management, and file systems.',
                'strategy' => 'pomodoro_25_5',
                'daily_available_minutes' => 90,
                'target_deadline' => Carbon::now()->addDays(14)->toDateString(),
                'status' => 'active',
            ]
        );

        $material = Material::firstOrCreate(
            ['study_project_id' => $project->id, 'title' => 'Operating System Concepts (10th Ed)'],
            [
                'user_id' => $user->id,
                'original_file_name' => 'silberschatz_os_concepts.pdf',
                'storage_path' => 'materials/sample_os.pdf',
                'mime_type' => 'application/pdf',
                'file_size_bytes' => 14500000,
                'page_count' => 840,
                'processing_status' => 'ready',
            ]
        );

        $sampleUnits = [
            [
                'title' => 'Introduction & Kernel Architecture',
                'order_index' => 1,
                'page_start' => 1,
                'page_end' => 25,
                'estimated_minutes' => 25,
                'actual_minutes_spent' => 25,
                'difficulty' => 'easy',
                'is_completed' => true,
                'completed_at' => Carbon::now()->subDays(2),
            ],
            [
                'title' => 'Dual-Mode Operation & System Calls',
                'order_index' => 2,
                'page_start' => 26,
                'page_end' => 50,
                'estimated_minutes' => 30,
                'actual_minutes_spent' => 30,
                'difficulty' => 'medium',
                'is_completed' => true,
                'completed_at' => Carbon::now()->subDays(1),
            ],
            [
                'title' => 'Process Concept & Context Switching',
                'order_index' => 3,
                'page_start' => 51,
                'page_end' => 80,
                'estimated_minutes' => 35,
                'actual_minutes_spent' => 0,
                'difficulty' => 'medium',
                'is_completed' => false,
            ],
            [
                'title' => 'Interprocess Communication (Pipes & Sockets)',
                'order_index' => 4,
                'page_start' => 81,
                'page_end' => 110,
                'estimated_minutes' => 30,
                'actual_minutes_spent' => 0,
                'difficulty' => 'medium',
                'is_completed' => false,
            ],
            [
                'title' => 'Multithreading & Concurrency Models',
                'order_index' => 5,
                'page_start' => 111,
                'page_end' => 145,
                'estimated_minutes' => 35,
                'actual_minutes_spent' => 0,
                'difficulty' => 'hard',
                'is_completed' => false,
            ],
            [
                'title' => 'CPU Scheduling Algorithms (FCFS, SJF, RR)',
                'order_index' => 6,
                'page_start' => 146,
                'page_end' => 180,
                'estimated_minutes' => 40,
                'actual_minutes_spent' => 0,
                'difficulty' => 'hard',
                'is_completed' => false,
            ],
            [
                'title' => 'Process Synchronization & Semaphores',
                'order_index' => 7,
                'page_start' => 181,
                'page_end' => 220,
                'estimated_minutes' => 35,
                'actual_minutes_spent' => 0,
                'difficulty' => 'hard',
                'is_completed' => false,
            ],
        ];

        foreach ($sampleUnits as $unitData) {
            MaterialUnit::firstOrCreate(
                [
                    'study_project_id' => $project->id,
                    'title' => $unitData['title'],
                ],
                array_merge($unitData, ['material_id' => $material->id])
            );
        }

        // Add a sample completed focus session
        $unit1 = MaterialUnit::where('study_project_id', $project->id)->where('order_index', 1)->first();
        if ($unit1) {
            FocusSession::create([
                'user_id' => $user->id,
                'study_project_id' => $project->id,
                'material_unit_id' => $unit1->id,
                'strategy' => 'pomodoro_25_5',
                'status' => 'completed',
                'planned_duration_seconds' => 1500,
                'started_at' => Carbon::now()->subDays(2)->setHour(14),
                'completed_at' => Carbon::now()->subDays(2)->setHour(14)->addMinutes(25),
                'actual_focus_seconds' => 1500,
            ]);
        }
    }
}
