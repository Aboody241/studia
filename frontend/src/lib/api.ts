import { FocusSession, Material, PlanAnalysis, StudyProject, StudyUnit, User } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('studia_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('studia_token', token);
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string = 'demo@studia.app', password: string = 'password') {
    const data = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  // Projects
  async getProjects(): Promise<StudyProject[]> {
    return this.request<StudyProject[]>('/projects');
  }

  async getProject(id: number): Promise<StudyProject> {
    return this.request<StudyProject>(`/projects/${id}`);
  }

  async createProject(project: Partial<StudyProject>): Promise<StudyProject> {
    return this.request<StudyProject>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async getProjectPlan(id: number): Promise<PlanAnalysis> {
    return this.request<PlanAnalysis>(`/projects/${id}/plan`);
  }

  // Materials & PDF Upload
  async getMaterials(projectId: number): Promise<Material[]> {
    return this.request<Material[]>(`/projects/${projectId}/materials`);
  }

  async uploadMaterial(projectId: number, file: File, title?: string): Promise<Material> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) {
      formData.append('title', title);
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}/projects/${projectId}/materials`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Upload failed with status ${response.status}`);
    }

    return response.json();
  }

  async downloadMaterialBlob(materialId: number): Promise<Blob> {
    const headers: Record<string, string> = {
      'Accept': 'application/pdf, */*',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}/materials/${materialId}/download`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to load PDF (${response.status})`);
    }

    return response.blob();
  }

  async deleteMaterial(materialId: number): Promise<void> {
    await this.request(`/materials/${materialId}`, { method: 'DELETE' });
  }

  // Units
  async toggleUnitComplete(unitId: number): Promise<StudyUnit> {
    return this.request<StudyUnit>(`/units/${unitId}/toggle-complete`, {
      method: 'PATCH',
    });
  }

  async updateUnit(unitId: number, data: Partial<StudyUnit>): Promise<StudyUnit> {
    return this.request<StudyUnit>(`/units/${unitId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async addUnit(projectId: number, unit: Partial<StudyUnit>): Promise<StudyUnit> {
    return this.request<StudyUnit>(`/projects/${projectId}/units`, {
      method: 'POST',
      body: JSON.stringify(unit),
    });
  }

  async deleteUnit(unitId: number): Promise<void> {
    await this.request(`/units/${unitId}`, { method: 'DELETE' });
  }

  async reorderUnits(projectId: number, unitIds: number[]): Promise<void> {
    await this.request(`/projects/${projectId}/units/reorder`, {
      method: 'POST',
      body: JSON.stringify({ unit_ids: unitIds }),
    });
  }

  // Sessions
  async getActiveSession(): Promise<{ active_session: FocusSession | null; live_focus_seconds?: number }> {
    return this.request('/sessions/active');
  }

  async startSession(projectId: number, unitId?: number, durationMinutes: number = 25): Promise<{ session: FocusSession; live_focus_seconds: number }> {
    return this.request('/sessions/start', {
      method: 'POST',
      body: JSON.stringify({
        study_project_id: projectId,
        material_unit_id: unitId,
        duration_minutes: durationMinutes,
      }),
    });
  }

  async pauseSession(sessionId: number): Promise<{ session: FocusSession; live_focus_seconds: number }> {
    return this.request(`/sessions/${sessionId}/pause`, { method: 'POST' });
  }

  async resumeSession(sessionId: number): Promise<{ session: FocusSession; live_focus_seconds: number }> {
    return this.request(`/sessions/${sessionId}/resume`, { method: 'POST' });
  }

  async completeSession(sessionId: number, markUnitComplete: boolean = false): Promise<{ session: FocusSession; actual_focus_seconds: number }> {
    return this.request(`/sessions/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ mark_unit_complete: markUnitComplete }),
    });
  }
}

export const api = new ApiClient();
