export interface User {
  id: number;
  name: string;
  email: string;
}

export interface StudyProject {
  id: number;
  name: string;
  subject?: string;
  description?: string;
  strategy: string;
  daily_available_minutes: number;
  target_deadline?: string;
  status: 'active' | 'completed' | 'archived';
  total_units?: number;
  completed_units?: number;
  progress_percent?: number;
  total_estimated_minutes?: number;
  total_actual_minutes?: number;
  created_at?: string;
  materials?: Material[];
}

export interface Material {
  id: number;
  study_project_id: number;
  title: string;
  original_file_name: string;
  storage_path: string;
  mime_type: string;
  file_size_bytes: number;
  page_count?: number;
  processing_status: 'uploaded' | 'processing' | 'ready' | 'failed';
  units?: StudyUnit[];
}

export interface StudyUnit {
  id: number;
  material_id: number;
  study_project_id: number;
  parent_unit_id?: number | null;
  title: string;
  order_index: number;
  page_start?: number;
  page_end?: number;
  estimated_minutes: number;
  actual_minutes_spent: number;
  difficulty: 'easy' | 'medium' | 'hard';
  is_completed: boolean;
  completed_at?: string | null;
}

export interface FocusSession {
  id: number;
  user_id: number;
  study_project_id: number;
  material_unit_id?: number | null;
  strategy: string;
  status: 'running' | 'paused' | 'completed' | 'abandoned';
  planned_duration_seconds: number;
  started_at: string;
  paused_at?: string | null;
  accumulated_paused_seconds: number;
  completed_at?: string | null;
  actual_focus_seconds: number;
  interruption_count: number;
  study_project?: StudyProject;
  material_unit?: StudyUnit;
}

export interface PlanAnalysis {
  project_id: number;
  project_name: string;
  total_units: number;
  remaining_units: number;
  total_estimated_minutes: number;
  remaining_minutes: number;
  remaining_pomodoros: number;
  daily_available_minutes: number;
  daily_pomodoro_capacity: number;
  estimated_days_needed: number;
  deadline_feasibility?: {
    target_deadline: string;
    days_remaining: number;
    required_daily_minutes: number;
    is_realistic: boolean;
    warning?: string | null;
  } | null;
  next_recommended_unit?: StudyUnit | null;
}
