'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FocusSession, Material, PlanAnalysis, StudyProject, StudyUnit } from '@/lib/types';
import { AppSidebar, NavTab } from '@/components/AppSidebar';
import { DashboardView } from '@/components/views/DashboardView';
import { CoursesView } from '@/components/views/CoursesView';
import { PlannerView } from '@/components/views/PlannerView';
import { FocusTimerView } from '@/components/views/FocusTimerView';
import { AnalyticsView } from '@/components/views/AnalyticsView';
import { SettingsView } from '@/components/views/SettingsView';
import { StudyPlanPanel } from '@/components/StudyPlanPanel';
import { DocumentReader } from '@/components/DocumentReader';
import { ContextualAIPanel } from '@/components/ContextualAIPanel';
import { FocusTimerBar } from '@/components/FocusTimerBar';
import { NewProjectModal } from '@/components/NewProjectModal';
import { ArrowLeft, Menu, X } from 'lucide-react';

// Authoritative local state fallbacks
const fallbackProjects: StudyProject[] = [
  {
    id: 1,
    name: 'CS 201: Operating Systems',
    subject: 'Computer Science',
    description: 'Kernel architectures, processes, memory management, and file systems.',
    strategy: 'pomodoro_25_5',
    daily_available_minutes: 90,
    target_deadline: '2026-10-29',
    status: 'active',
    total_units: 7,
    completed_units: 2,
    progress_percent: 29,
    total_estimated_minutes: 230,
    total_actual_minutes: 55,
  },
  {
    id: 2,
    name: 'MATH 220: Linear Algebra',
    subject: 'Mathematics',
    description: 'Vector spaces, eigenvalues, matrix decompositions, and linear transformations.',
    strategy: 'pomodoro_25_5',
    daily_available_minutes: 60,
    target_deadline: '2026-11-15',
    status: 'active',
    total_units: 5,
    completed_units: 3,
    progress_percent: 60,
    total_estimated_minutes: 150,
    total_actual_minutes: 90,
  },
];

const fallbackUnits: StudyUnit[] = [
  {
    id: 1,
    material_id: 1,
    study_project_id: 1,
    title: 'Introduction & Kernel Architecture',
    order_index: 1,
    page_start: 1,
    page_end: 25,
    estimated_minutes: 25,
    actual_minutes_spent: 25,
    difficulty: 'easy',
    is_completed: true,
  },
  {
    id: 2,
    material_id: 1,
    study_project_id: 1,
    title: 'Dual-Mode Operation & System Calls',
    order_index: 2,
    page_start: 26,
    page_end: 50,
    estimated_minutes: 30,
    actual_minutes_spent: 30,
    difficulty: 'medium',
    is_completed: true,
  },
  {
    id: 3,
    material_id: 1,
    study_project_id: 1,
    title: 'Process Concept & Context Switching',
    order_index: 3,
    page_start: 51,
    page_end: 80,
    estimated_minutes: 35,
    actual_minutes_spent: 0,
    difficulty: 'medium',
    is_completed: false,
  },
  {
    id: 4,
    material_id: 1,
    study_project_id: 1,
    title: 'Interprocess Communication (Pipes & Sockets)',
    order_index: 4,
    page_start: 81,
    page_end: 110,
    estimated_minutes: 30,
    actual_minutes_spent: 0,
    difficulty: 'medium',
    is_completed: false,
  },
  {
    id: 5,
    material_id: 1,
    study_project_id: 1,
    title: 'Multithreading & Concurrency Models',
    order_index: 5,
    page_start: 111,
    page_end: 145,
    estimated_minutes: 35,
    actual_minutes_spent: 0,
    difficulty: 'hard',
    is_completed: false,
  },
  {
    id: 6,
    material_id: 1,
    study_project_id: 1,
    title: 'CPU Scheduling Algorithms (FCFS, SJF, RR)',
    order_index: 6,
    page_start: 146,
    page_end: 180,
    estimated_minutes: 40,
    actual_minutes_spent: 0,
    difficulty: 'hard',
    is_completed: false,
  },
  {
    id: 7,
    material_id: 1,
    study_project_id: 1,
    title: 'Process Synchronization & Semaphores',
    order_index: 7,
    page_start: 181,
    page_end: 220,
    estimated_minutes: 35,
    actual_minutes_spent: 0,
    difficulty: 'hard',
    is_completed: false,
  },
];

const fallbackMaterial: Material = {
  id: 1,
  study_project_id: 1,
  title: 'Operating System Concepts (10th Ed)',
  original_file_name: 'silberschatz_os_concepts.pdf',
  storage_path: 'materials/sample_os.pdf',
  mime_type: 'application/pdf',
  file_size_bytes: 14500000,
  page_count: 840,
  processing_status: 'ready',
};

export default function Home() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projects, setProjects] = useState<StudyProject[]>(fallbackProjects);
  const [currentProject, setCurrentProject] = useState<StudyProject | null>(fallbackProjects[0]);
  const [units, setUnits] = useState<StudyUnit[]>(fallbackUnits);
  const [materials, setMaterials] = useState<Material[]>([fallbackMaterial]);
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(fallbackMaterial);
  const [planAnalysis, setPlanAnalysis] = useState<PlanAnalysis | null>(null);

  // Active study state
  const [activeUnit, setActiveUnit] = useState<StudyUnit | null>(fallbackUnits[2]);
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);
  const [viewingCourseId, setViewingCourseId] = useState<number | null>(fallbackProjects[0].id);

  // Secondary panels state for Workspace
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const calculateLocalPlan = React.useCallback((currentUnits: StudyUnit[], project?: StudyProject | null) => {
    const p = project || currentProject;
    const uncompleted = currentUnits.filter((u) => !u.is_completed);
    const remMins = uncompleted.reduce((acc, u) => acc + u.estimated_minutes, 0);
    setPlanAnalysis({
      project_id: p?.id || 1,
      project_name: p?.name || 'Operating Systems',
      total_units: currentUnits.length,
      remaining_units: uncompleted.length,
      total_estimated_minutes: currentUnits.reduce((acc, u) => acc + u.estimated_minutes, 0),
      remaining_minutes: remMins,
      remaining_pomodoros: Math.ceil(remMins / 25),
      daily_available_minutes: p?.daily_available_minutes || 90,
      daily_pomodoro_capacity: Math.floor((p?.daily_available_minutes || 90) / 30),
      estimated_days_needed: Math.ceil(remMins / (p?.daily_available_minutes || 90)),
      deadline_feasibility: {
        target_deadline: p?.target_deadline || '2026-10-29',
        days_remaining: 14,
        required_daily_minutes: Math.ceil(remMins / 14),
        is_realistic: true,
      },
      next_recommended_unit: uncompleted[0] || null,
    });
  }, [currentProject]);

  const loadProjectDetails = React.useCallback(async (projectId: number) => {
    try {
      const fullProj = await api.getProject(projectId);
      if (fullProj.materials && fullProj.materials.length > 0) {
        setMaterials(fullProj.materials);
        setCurrentMaterial(fullProj.materials[0]);
        if (fullProj.materials[0].units) {
          setUnits(fullProj.materials[0].units);
        }
      } else {
        setMaterials([]);
      }
      const plan = await api.getProjectPlan(projectId);
      setPlanAnalysis(plan);
      if (plan.next_recommended_unit) {
        setActiveUnit(plan.next_recommended_unit);
      }
    } catch {
      calculateLocalPlan(units);
    }
  }, [calculateLocalPlan, units]);

  // Initial fetch from backend with fallback
  useEffect(() => {
    const initData = async () => {
      try {
        await api.login('demo@studia.app', 'password').catch(() => {});
        const projs = await api.getProjects();
        if (projs && projs.length > 0) {
          setProjects(projs);
          const first = projs[0];
          setCurrentProject(first);
          loadProjectDetails(first.id);
        }
      } catch (err) {
        console.warn('Backend API connection offline or starting, using local state:', err);
        calculateLocalPlan(fallbackUnits);
      }
    };

    initData();
  }, [calculateLocalPlan, loadProjectDetails]);

  // Toggle unit complete
  const handleToggleComplete = async (unitId: number) => {
    const updated = units.map((u) =>
      u.id === unitId ? { ...u, is_completed: !u.is_completed } : u
    );
    setUnits(updated);
    calculateLocalPlan(updated);

    try {
      await api.toggleUnitComplete(unitId);
    } catch (err) {
      console.warn('Saved locally:', err);
    }
  };

  // Add unit
  const handleAddUnit = async (title: string, estimatedMinutes: number) => {
    const newUnit: StudyUnit = {
      id: Date.now(),
      material_id: currentMaterial?.id || 1,
      study_project_id: currentProject?.id || 1,
      title,
      order_index: units.length + 1,
      estimated_minutes: estimatedMinutes,
      actual_minutes_spent: 0,
      difficulty: 'medium',
      is_completed: false,
    };

    const updated = [...units, newUnit];
    setUnits(updated);
    calculateLocalPlan(updated);

    try {
      if (currentProject) {
        await api.addUnit(currentProject.id, newUnit);
      }
    } catch (err) {
      console.warn('Saved unit locally:', err);
    }
  };

  // Material upload and delete handlers
  const handleUploadMaterial = async (file: File, title?: string) => {
    if (!currentProject) return;
    try {
      const newMaterial = await api.uploadMaterial(currentProject.id, file, title);
      setMaterials((prev) => [newMaterial, ...prev.filter((m) => m.id !== newMaterial.id)]);
      setCurrentMaterial(newMaterial);
      if (newMaterial.units && newMaterial.units.length > 0) {
        setUnits((prev) => [...newMaterial.units!, ...prev]);
        calculateLocalPlan([...newMaterial.units!, ...units]);
      }
      await loadProjectDetails(currentProject.id);
    } catch (err) {
      console.error('Failed to upload material:', err);
      throw err;
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    try {
      await api.deleteMaterial(materialId);
      setMaterials((prev) => prev.filter((m) => m.id !== materialId));
      if (currentMaterial?.id === materialId) {
        setCurrentMaterial(materials.find((m) => m.id !== materialId) || null);
      }
      if (currentProject) {
        await loadProjectDetails(currentProject.id);
      }
    } catch (err) {
      console.warn('Failed to delete material:', err);
    }
  };

  // Focus Timer actions (preserves timer across all navigation transitions)
  const handleStartSession = async (durationMinutes: number = 25) => {
    const now = new Date().toISOString();
    const session: FocusSession = {
      id: Date.now(),
      user_id: 1,
      study_project_id: currentProject?.id || 1,
      material_unit_id: activeUnit?.id || null,
      strategy: 'pomodoro_25_5',
      status: 'running',
      planned_duration_seconds: durationMinutes * 60,
      started_at: now,
      accumulated_paused_seconds: 0,
      actual_focus_seconds: 0,
      interruption_count: 0,
    };
    setActiveSession(session);

    try {
      const res = await api.startSession(currentProject?.id || 1, activeUnit?.id, durationMinutes);
      setActiveSession(res.session);
    } catch (err) {
      console.warn('Running timer in local authoritative mode:', err);
    }
  };

  const handlePauseSession = async () => {
    if (!activeSession) return;
    const paused = { ...activeSession, status: 'paused' as const, paused_at: new Date().toISOString() };
    setActiveSession(paused);

    try {
      await api.pauseSession(activeSession.id);
    } catch (err) {
      console.warn('Paused locally:', err);
    }
  };

  const handleResumeSession = async () => {
    if (!activeSession) return;
    const resumed = { ...activeSession, status: 'running' as const, paused_at: null };
    setActiveSession(resumed);

    try {
      await api.resumeSession(activeSession.id);
    } catch (err) {
      console.warn('Resumed locally:', err);
    }
  };

  const handleCompleteSession = async (markUnitComplete: boolean) => {
    if (!activeSession) return;
    setActiveSession(null);

    if (markUnitComplete && activeUnit) {
      handleToggleComplete(activeUnit.id);
    }

    try {
      await api.completeSession(activeSession.id, markUnitComplete);
    } catch (err) {
      console.warn('Logged locally:', err);
    }
  };

  const handleCreateProject = async (p: {
    name: string;
    subject: string;
    daily_available_minutes: number;
    target_deadline: string;
  }) => {
    const newProj: StudyProject = {
      id: Date.now(),
      name: p.name,
      subject: p.subject,
      daily_available_minutes: p.daily_available_minutes,
      target_deadline: p.target_deadline,
      strategy: 'pomodoro_25_5',
      status: 'active',
      total_units: 0,
      completed_units: 0,
      progress_percent: 0,
    };

    setProjects([newProj, ...projects]);
    setCurrentProject(newProj);
    setUnits([]);
    calculateLocalPlan([]);

    try {
      const res = await api.createProject(newProj);
      setCurrentProject(res);
    } catch (err) {
      console.warn('Created project locally:', err);
    }
  };

  const isSessionRunning = activeSession?.status === 'running';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground overflow-hidden">
      {/* Mobile Top App Bar with Hamburger */}
      <div className="md:hidden h-14 border-b border-border bg-[#FAFAFA] dark:bg-[#121212] px-4 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm tracking-tight text-foreground">
            Studia
          </span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-muted-foreground">
            {currentTab}
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Persistent Sidebar & Mobile Drawer */}
      <div
        className={`${
          mobileMenuOpen ? 'block fixed inset-0 z-50 bg-black/40 md:relative md:bg-transparent' : 'hidden md:block'
        }`}
      >
        <div className="h-full w-60" onClick={(e) => e.stopPropagation()}>
          <AppSidebar
            currentTab={currentTab}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              setMobileMenuOpen(false);
            }}
            projects={projects}
            currentProject={currentProject}
            onSelectProject={(p) => {
              setCurrentProject(p);
              loadProjectDetails(p.id);
            }}
            onOpenNewProject={() => {
              setIsNewProjectModalOpen(true);
              setMobileMenuOpen(false);
            }}
            isSessionRunning={isSessionRunning}
            activeSessionDuration="25:00"
          />
        </div>
      </div>

      {/* Main Experience Container */}
      <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] md:h-screen overflow-hidden relative">
        {/* Section 1: Overview (Dashboard) */}
        {currentTab === 'overview' && (
          <DashboardView
            currentProject={currentProject}
            projects={projects}
            units={units}
            planAnalysis={planAnalysis}
            onEnterCourse={(p) => {
              setCurrentProject(p);
              loadProjectDetails(p.id);
              setViewingCourseId(p.id);
              setCurrentTab('courses');
            }}
            onOpenNewProject={() => setIsNewProjectModalOpen(true)}
            onStartFocus={(u) => {
              if (u) setActiveUnit(u);
              handleStartSession(25);
              setCurrentTab('focus');
            }}
            onOpenWorkspace={(u) => {
              if (u) setActiveUnit(u);
              setCurrentTab('workspace');
            }}
            onToggleUnit={handleToggleComplete}
            onSelectProject={(p) => {
              setCurrentProject(p);
              loadProjectDetails(p.id);
            }}
            onNavigateToCourses={() => setCurrentTab('courses')}
            onNavigateToPlanner={() => setCurrentTab('planner')}
          />
        )}

        {/* Section 2: My Courses */}
        {currentTab === 'courses' && (
          <CoursesView
            projects={projects}
            currentProject={currentProject}
            selectedCourseId={viewingCourseId}
            onSelectCourseId={setViewingCourseId}
            units={units}
            materials={materials}
            planAnalysis={planAnalysis}
            onSelectProject={(p) => {
              setCurrentProject(p);
              loadProjectDetails(p.id);
            }}
            onOpenNewProject={() => setIsNewProjectModalOpen(true)}
            onOpenWorkspace={(mat, u) => {
              if (mat) setCurrentMaterial(mat);
              if (u) setActiveUnit(u);
              setCurrentTab('workspace');
            }}
            onStartFocus={(u) => {
              if (u) setActiveUnit(u);
              handleStartSession(25);
              setCurrentTab('focus');
            }}
            onToggleUnit={handleToggleComplete}
            onAddUnit={handleAddUnit}
            onUploadMaterial={handleUploadMaterial}
            onDeleteMaterial={handleDeleteMaterial}
          />
        )}

        {/* Section 3: Study Planner */}
        {currentTab === 'planner' && (
          <PlannerView
            currentProject={currentProject}
            projects={projects}
            units={units}
            planAnalysis={planAnalysis}
            onStartFocus={(u) => {
              if (u) setActiveUnit(u);
              handleStartSession(25);
              setCurrentTab('focus');
            }}
            onToggleUnit={handleToggleComplete}
            onOpenWorkspace={(u) => {
              if (u) setActiveUnit(u);
              setCurrentTab('workspace');
            }}
          />
        )}

        {/* Section 4: Focus Mode (Dedicated Distraction-free View) */}
        {currentTab === 'focus' && (
          <FocusTimerView
            currentProject={currentProject}
            activeUnit={activeUnit}
            activeSession={activeSession}
            onStartSession={handleStartSession}
            onPauseSession={handlePauseSession}
            onResumeSession={handleResumeSession}
            onCompleteSession={handleCompleteSession}
            onReturnToWorkspace={() => setCurrentTab('workspace')}
          />
        )}

        {/* Section 5: Insights */}
        {currentTab === 'insights' && (
          <AnalyticsView
            currentProject={currentProject}
            projects={projects}
            units={units}
            planAnalysis={planAnalysis}
          />
        )}

        {/* Section 6: Settings */}
        {currentTab === 'settings' && (
          <SettingsView
            onSyncBackend={async () => {
              if (currentProject) {
                await loadProjectDetails(currentProject.id);
              }
            }}
          />
        )}

        {/* Contextual Experience: Study Workspace & PDF Reader */}
        {currentTab === 'workspace' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Contextual Return Banner */}
            <div className="h-9 border-b border-border bg-[#FAFAFA] dark:bg-[#121212] px-4 flex items-center justify-between text-xs text-muted-foreground shrink-0 select-none">
              <button
                onClick={() => setCurrentTab('overview')}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Overview
              </button>
              <span className="font-mono text-[11px]">
                {currentProject?.name}
              </span>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Left Study Plan panel (collapsible) */}
              <StudyPlanPanel
                project={currentProject}
                units={units}
                planAnalysis={planAnalysis}
                activeUnitId={activeUnit?.id}
                onToggleComplete={handleToggleComplete}
                onSelectUnitForTimer={(u) => {
                  setActiveUnit(u);
                  handleStartSession(25);
                  setCurrentTab('focus');
                }}
                onAddUnit={handleAddUnit}
                isOpen={leftPanelOpen}
              />

              {/* Center Document Reader with independent zoom and real PDF stream */}
              <DocumentReader
                material={currentMaterial}
                activeUnit={activeUnit}
                onTextSelected={(text) => {
                  setSelectedText(text);
                  setRightPanelOpen(true);
                }}
                onUploadPDF={handleUploadMaterial}
                leftPanelOpen={leftPanelOpen}
                rightPanelOpen={rightPanelOpen}
                onToggleLeftPanel={() => setLeftPanelOpen(!leftPanelOpen)}
                onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
              />

              {/* Right Contextual Assistant panel (collapsible) */}
              <ContextualAIPanel
                selectedText={selectedText}
                onClearSelection={() => setSelectedText('')}
                isOpen={rightPanelOpen}
              />
            </div>
          </div>
        )}

        {/* Floating Focus Timer Bar (visible when away from Focus Mode and timer is active) */}
        {currentTab !== 'focus' && activeSession && (
          <FocusTimerBar
            activeSession={activeSession}
            activeUnit={activeUnit}
            onStart={handleStartSession}
            onPause={handlePauseSession}
            onResume={handleResumeSession}
            onComplete={handleCompleteSession}
            onExpandToFullTimer={() => setCurrentTab('focus')}
          />
        )}
      </div>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
}
