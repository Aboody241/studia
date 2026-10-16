'use client';

import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  GraduationCap,
  Loader2,
  Pencil,
  Play,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Material, PlanAnalysis, StudyProject, StudyUnit } from '@/lib/types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

interface CoursesViewProps {
  projects: StudyProject[];
  currentProject: StudyProject | null;
  selectedCourseId: number | null;
  onSelectCourseId: (id: number | null) => void;
  units: StudyUnit[];
  materials?: Material[];
  planAnalysis: PlanAnalysis | null;
  onSelectProject: (p: StudyProject) => void;
  onOpenNewProject: () => void;
  onOpenWorkspace: (material?: Material, unit?: StudyUnit) => void;
  onStartFocus: (unit?: StudyUnit) => void;
  onToggleUnit: (unitId: number) => void;
  onAddUnit: (
    title: string,
    estimatedMinutes: number,
    pageStart?: number,
    pageEnd?: number,
    difficulty?: 'easy' | 'medium' | 'hard',
    materialId?: number
  ) => void;
  onUpdateUnit?: (unitId: number, data: Partial<StudyUnit>) => void;
  onDeleteUnit?: (unitId: number) => void;
  onReorderUnits?: (reorderedUnits: StudyUnit[]) => void;
  onUploadMaterial?: (file: File) => Promise<void>;
  onDeleteMaterial?: (materialId: number) => Promise<void>;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  projects,
  currentProject,
  selectedCourseId,
  onSelectCourseId,
  units,
  materials = [],
  planAnalysis,
  onSelectProject,
  onOpenNewProject,
  onOpenWorkspace,
  onStartFocus,
  onToggleUnit,
  onAddUnit,
  onUpdateUnit,
  onDeleteUnit,
  onReorderUnits,
  onUploadMaterial,
  onDeleteMaterial,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'units' | 'materials' | 'plan'>('units');
  const [unitFilter, setUnitFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitMinutes, setNewUnitMinutes] = useState(30);
  const [newUnitPageStart, setNewUnitPageStart] = useState<string>('');
  const [newUnitPageEnd, setNewUnitPageEnd] = useState<string>('');
  const [newUnitDifficulty, setNewUnitDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [newUnitMaterialId, setNewUnitMaterialId] = useState<string>('');

  // Unit Editing state
  const [editingUnitId, setEditingUnitId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMinutes, setEditMinutes] = useState(30);
  const [editPageStart, setEditPageStart] = useState<string>('');
  const [editPageEnd, setEditPageEnd] = useState<string>('');
  const [editDifficulty, setEditDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [editMaterialId, setEditMaterialId] = useState<string>('');

  // Unit Delete Confirmation state
  const [deletingUnitId, setDeletingUnitId] = useState<number | null>(null);

  // Material upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setUploadError('Only PDF documents are supported.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('File exceeds maximum size of 50MB.');
      return;
    }
    setUploadError(null);
    setIsUploading(true);
    try {
      if (onUploadMaterial) {
        await onUploadMaterial(file);
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Check backend connection.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processUpload(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const activeCourse = projects.find((p) => p.id === selectedCourseId) || currentProject || projects[0];

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.subject && p.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const completedUnits = units.filter((u) => u.is_completed);
  const uncompletedUnits = units.filter((u) => !u.is_completed);

  const filteredUnits = units.filter((u) => {
    if (unitFilter === 'pending') return !u.is_completed;
    if (unitFilter === 'completed') return u.is_completed;
    return true;
  });

  const handleAddUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitTitle.trim()) return;
    onAddUnit(
      newUnitTitle.trim(),
      newUnitMinutes,
      newUnitPageStart ? parseInt(newUnitPageStart, 10) : undefined,
      newUnitPageEnd ? parseInt(newUnitPageEnd, 10) : undefined,
      newUnitDifficulty,
      newUnitMaterialId ? parseInt(newUnitMaterialId, 10) : undefined
    );
    setNewUnitTitle('');
    setNewUnitMinutes(30);
    setNewUnitPageStart('');
    setNewUnitPageEnd('');
    setIsAddingUnit(false);
  };

  const startEditing = (unit: StudyUnit) => {
    setEditingUnitId(unit.id);
    setEditTitle(unit.title);
    setEditMinutes(unit.estimated_minutes);
    setEditPageStart(unit.page_start ? String(unit.page_start) : '');
    setEditPageEnd(unit.page_end ? String(unit.page_end) : '');
    setEditDifficulty(unit.difficulty || 'medium');
    setEditMaterialId(unit.material_id ? String(unit.material_id) : '');
  };

  const handleSaveEdit = (unitId: number) => {
    if (!editTitle.trim()) return;
    if (onUpdateUnit) {
      onUpdateUnit(unitId, {
        title: editTitle.trim(),
        estimated_minutes: editMinutes,
        page_start: editPageStart ? parseInt(editPageStart, 10) : undefined,
        page_end: editPageEnd ? parseInt(editPageEnd, 10) : undefined,
        difficulty: editDifficulty,
        material_id: editMaterialId ? parseInt(editMaterialId, 10) : undefined,
      });
    }
    setEditingUnitId(null);
  };

  const handleMoveUnit = (unitId: number, direction: 'up' | 'down') => {
    const index = units.findIndex((u) => u.id === unitId);
    if (index < 0) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === units.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...units];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    if (onReorderUnits) {
      onReorderUnits(reordered);
    }
  };

  const handleDelete = (unitId: number) => {
    if (onDeleteUnit) {
      onDeleteUnit(unitId);
    }
    setDeletingUnitId(null);
  };

  // -------------------------------------------------------------
  // VIEW: Course Detail (when selectedCourseId is set and viewing single course)
  // -------------------------------------------------------------
  if (selectedCourseId && activeCourse) {
    const courseProgress = units.length > 0 ? Math.round((completedUnits.length / units.length) * 100) : (activeCourse.progress_percent || 0);

    return (
      <div className="flex-1 overflow-y-auto p-8 lg:p-12 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-150">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <button
            onClick={() => onSelectCourseId(null)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to All Courses
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenWorkspace()}
            >
              <BookOpen className="w-3.5 h-3.5 mr-1.5" />
              Open in Study Workspace
            </Button>
            {uncompletedUnits[0] && (
              <Button
                size="sm"
                onClick={() => onStartFocus(uncompletedUnits[0])}
              >
                <Play className="w-3 h-3 fill-current mr-1.5" />
                Focus Next Unit
              </Button>
            )}
          </div>
        </div>

        {/* Course Header Banner */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="outline" className="text-[11px] font-mono">
                  {activeCourse.subject || 'Academic Course'}
                </Badge>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {activeCourse.strategy === 'pomodoro_25_5' ? 'Pomodoro (25/5)' : activeCourse.strategy}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                {activeCourse.name}
              </h1>
              {activeCourse.description && (
                <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
                  {activeCourse.description}
                </p>
              )}
            </div>

            {/* Quick Stats Pill */}
            <div className="p-4 rounded-xl border border-border bg-neutral-50 dark:bg-neutral-900/50 sm:w-64 space-y-2 shrink-0">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Course Completion</span>
                <span className="font-mono font-semibold text-foreground">{courseProgress}%</span>
              </div>
              <Progress value={courseProgress} />
              <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                <span>{completedUnits.length} of {units.length} units done</span>
                {activeCourse.target_deadline && (
                  <span className="font-mono">Due {activeCourse.target_deadline}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Tabs: Study Units | Materials | Plan & Feasibility */}
        <div className="border-b border-border/80">
          <div className="flex items-center gap-6 text-sm">
            <button
              onClick={() => setActiveTab('units')}
              className={`pb-3 font-medium transition-colors relative ${
                activeTab === 'units'
                  ? 'text-foreground font-semibold border-b-2 border-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Study Units ({units.length})
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`pb-3 font-medium transition-colors relative ${
                activeTab === 'materials'
                  ? 'text-foreground font-semibold border-b-2 border-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Course Materials ({materials.length})
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className={`pb-3 font-medium transition-colors relative ${
                activeTab === 'plan'
                  ? 'text-foreground font-semibold border-b-2 border-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Plan & Feasibility
            </button>
          </div>
        </div>

        {/* TAB 1: Study Units */}
        {activeTab === 'units' && (
          <div className="space-y-4">
            {/* Header, Filters & Add Unit Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  Curriculum Breakdown
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Organize and edit study units, assign pages and time estimates, and track progress.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Filter Pills */}
                <div className="flex items-center p-0.5 rounded-lg border border-border bg-neutral-100/80 dark:bg-neutral-900/80 text-[11px]">
                  <button
                    onClick={() => setUnitFilter('all')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      unitFilter === 'all'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    All ({units.length})
                  </button>
                  <button
                    onClick={() => setUnitFilter('pending')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      unitFilter === 'pending'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Pending ({uncompletedUnits.length})
                  </button>
                  <button
                    onClick={() => setUnitFilter('completed')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      unitFilter === 'completed'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Done ({completedUnits.length})
                  </button>
                </div>

                <Button
                  size="sm"
                  onClick={() => setIsAddingUnit(!isAddingUnit)}
                  className="text-xs h-8"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Unit
                </Button>
              </div>
            </div>

            {/* Inline Add Unit Form */}
            {isAddingUnit && (
              <form
                onSubmit={handleAddUnitSubmit}
                className="p-5 rounded-xl border border-border bg-neutral-50/80 dark:bg-neutral-900/60 space-y-4 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Create New Study Unit
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingUnit(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-6">
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Unit Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chapter 4: Memory Management"
                      value={newUnitTitle}
                      onChange={(e) => setNewUnitTitle(e.target.value)}
                      className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      autoFocus
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={newUnitMinutes}
                      onChange={(e) => setNewUnitMinutes(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Start Page
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 45"
                      value={newUnitPageStart}
                      onChange={(e) => setNewUnitPageStart(e.target.value)}
                      className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      End Page
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 60"
                      value={newUnitPageEnd}
                      onChange={(e) => setNewUnitPageEnd(e.target.value)}
                      className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  <div className="md:col-span-6">
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Difficulty Level
                    </label>
                    <div className="flex gap-2">
                      {(['easy', 'medium', 'hard'] as const).map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setNewUnitDifficulty(level)}
                          className={`flex-1 text-xs py-1.5 rounded-md border capitalize font-medium transition-all ${
                            newUnitDifficulty === level
                              ? 'bg-foreground text-background border-foreground'
                              : 'bg-background text-muted-foreground border-border hover:text-foreground'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {materials.length > 0 && (
                    <div className="md:col-span-6">
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                        Attached Material (Optional)
                      </label>
                      <select
                        value={newUnitMaterialId}
                        onChange={(e) => setNewUnitMaterialId(e.target.value)}
                        className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none"
                      >
                        <option value="">Default ({materials[0]?.title || 'Auto'})</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingUnit(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Save Unit
                  </Button>
                </div>
              </form>
            )}

            {/* Units List */}
            <div className="border border-border rounded-xl divide-y divide-border/80 bg-card overflow-hidden">
              {filteredUnits.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
                  <p>
                    {units.length === 0
                      ? 'No study units created yet. Add your first unit above.'
                      : `No units matching the '${unitFilter}' filter.`}
                  </p>
                </div>
              ) : (
                filteredUnits.map((unit) => {
                  const isEditing = editingUnitId === unit.id;
                  const isDeleting = deletingUnitId === unit.id;
                  const unitMaterial = materials.find((m) => m.id === unit.material_id);

                  if (isEditing) {
                    return (
                      <div
                        key={unit.id}
                        className="p-4 bg-neutral-50 dark:bg-neutral-900/60 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground">
                            Editing Unit #{unit.order_index}
                          </span>
                          <button
                            onClick={() => setEditingUnitId(null)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                          <div className="sm:col-span-6">
                            <label className="text-[10px] text-muted-foreground uppercase font-medium">Title</label>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full bg-background border border-border rounded px-2.5 py-1 text-xs text-foreground focus:outline-none"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[10px] text-muted-foreground uppercase font-medium">Minutes</label>
                            <input
                              type="number"
                              min="5"
                              max="300"
                              value={editMinutes}
                              onChange={(e) => setEditMinutes(Number(e.target.value))}
                              className="w-full bg-background border border-border rounded px-2.5 py-1 text-xs text-foreground focus:outline-none"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[10px] text-muted-foreground uppercase font-medium">Start Page</label>
                            <input
                              type="number"
                              min="1"
                              value={editPageStart}
                              onChange={(e) => setEditPageStart(e.target.value)}
                              className="w-full bg-background border border-border rounded px-2.5 py-1 text-xs text-foreground focus:outline-none"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[10px] text-muted-foreground uppercase font-medium">End Page</label>
                            <input
                              type="number"
                              min="1"
                              value={editPageEnd}
                              onChange={(e) => setEditPageEnd(e.target.value)}
                              className="w-full bg-background border border-border rounded px-2.5 py-1 text-xs text-foreground focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-muted-foreground">Difficulty:</span>
                            {(['easy', 'medium', 'hard'] as const).map((diff) => (
                              <button
                                key={diff}
                                type="button"
                                onClick={() => setEditDifficulty(diff)}
                                className={`text-[10px] px-2 py-0.5 rounded capitalize font-medium ${
                                  editDifficulty === diff
                                    ? 'bg-foreground text-background font-semibold'
                                    : 'bg-background text-muted-foreground border border-border'
                                }`}
                              >
                                {diff}
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingUnitId(null)}
                              className="h-7 text-xs px-2.5"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(unit.id)}
                              className="h-7 text-xs px-3"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={unit.id}
                      className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        unit.is_completed
                          ? 'bg-neutral-50/50 dark:bg-neutral-900/20'
                          : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/40'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0 pr-2">
                        {/* Completion Checkbox */}
                        <button
                          onClick={() => onToggleUnit(unit.id)}
                          className="mt-0.5 sm:mt-0 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                          title={unit.is_completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {unit.is_completed ? (
                            <CheckCircle2 className="w-5 h-5 text-foreground fill-foreground/10" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-neutral-300 dark:border-neutral-600 hover:border-foreground transition-colors" />
                          )}
                        </button>

                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">
                              #{unit.order_index}
                            </span>
                            <p
                              className={`text-sm font-medium truncate ${
                                unit.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'
                              }`}
                            >
                              {unit.title}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" /> {unit.estimated_minutes} min
                            </span>
                            {unit.page_start && (
                              <span className="font-mono">
                                pp. {unit.page_start}–{unit.page_end || unit.page_start}
                              </span>
                            )}
                            <span className="capitalize text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 border border-border">
                              {unit.difficulty}
                            </span>
                            {unitMaterial && (
                              <span className="text-[10px] text-muted-foreground/80 truncate max-w-[150px]">
                                · {unitMaterial.title}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {/* Reorder Buttons */}
                        {onReorderUnits && (
                          <div className="flex items-center border border-border rounded-md overflow-hidden bg-background">
                            <button
                              onClick={() => handleMoveUnit(unit.id, 'up')}
                              disabled={units.indexOf(unit) === 0}
                              title="Move unit up"
                              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors text-muted-foreground hover:text-foreground"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleMoveUnit(unit.id, 'down')}
                              disabled={units.indexOf(unit) === units.length - 1}
                              title="Move unit down"
                              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 border-l border-border transition-colors text-muted-foreground hover:text-foreground"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* Edit Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(unit)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title="Edit unit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>

                        {/* Delete Button / Inline Confirmation */}
                        {isDeleting ? (
                          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-md text-xs">
                            <span className="text-[10px] text-muted-foreground px-1">Delete?</span>
                            <button
                              onClick={() => handleDelete(unit.id)}
                              className="px-1.5 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black font-semibold text-[10px]"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeletingUnitId(null)}
                              className="px-1.5 py-0.5 rounded text-muted-foreground hover:text-foreground text-[10px]"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          onDeleteUnit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingUnitId(unit.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              title="Delete unit"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )
                        )}

                        {/* Open in PDF Workspace */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onOpenWorkspace(unitMaterial, unit)}
                          className="text-xs h-8 px-2.5"
                          title={unit.page_start ? `Read in PDF at page ${unit.page_start}` : 'Open in Study Workspace'}
                        >
                          <BookOpen className="w-3.5 h-3.5 mr-1" />
                          Study
                        </Button>

                        {/* Focus Pomodoro */}
                        {!unit.is_completed && (
                          <Button
                            size="sm"
                            onClick={() => onStartFocus(unit)}
                            className="text-xs h-8 px-3"
                          >
                            <Play className="w-3 h-3 fill-current mr-1" />
                            Focus
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Materials */}
        {activeTab === 'materials' && (
          <div className="space-y-6">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  Textbooks & Uploaded Materials
                </h3>
                <p className="text-xs text-muted-foreground">
                  Original PDFs stored securely on disk and partitioned into study units.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Upload PDF
                  </>
                )}
              </Button>
            </div>

            {/* Upload Error Alert */}
            {uploadError && (
              <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-border text-xs flex items-center justify-between text-foreground">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-foreground shrink-0" />
                  <span>{uploadError}</span>
                </div>
                <button
                  onClick={() => setUploadError(null)}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Uploading progress notification */}
            {isUploading && (
              <div className="p-4 rounded-xl border border-border bg-neutral-50 dark:bg-neutral-900/40 flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-foreground animate-spin shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-foreground block">Uploading document...</span>
                  <span className="text-muted-foreground">Persisting to secure storage and generating study units</span>
                </div>
              </div>
            )}

            {/* List of Uploaded Materials */}
            <div className="space-y-3">
              {materials.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground border border-border rounded-xl">
                  No PDF materials uploaded for this course yet. Use the upload zone below to add your textbook.
                </div>
              ) : (
                materials.map((mat) => {
                  const fileSizeMB = (mat.file_size_bytes / (1024 * 1024)).toFixed(1);
                  return (
                    <div
                      key={mat.id}
                      className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-border flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-foreground" />
                        </div>
                        <div className="truncate">
                          <h4 className="text-sm font-semibold text-foreground truncate">
                            {mat.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                            {mat.original_file_name} · {fileSizeMB} MB ·{' '}
                            <span className="capitalize">{mat.processing_status}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => onOpenWorkspace(mat)}
                        >
                          <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                          Read in Workspace
                        </Button>
                        {onDeleteMaterial && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteMaterial(mat.id)}
                            className="text-muted-foreground hover:text-foreground h-8 w-8"
                            title="Delete material"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) await processUpload(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-foreground bg-neutral-100 dark:bg-neutral-800'
                  : 'border-border bg-neutral-50/50 dark:bg-neutral-900/20 hover:bg-neutral-50 dark:hover:bg-neutral-900/40'
              }`}
            >
              <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs font-semibold text-foreground">
                {isDragging ? 'Drop PDF here' : 'Drop your syllabus or textbook PDF here, or click to browse'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Supports PDF up to 50MB. File is securely stored on disk and linked to this course.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: Plan & Feasibility */}
        {activeTab === 'plan' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Remaining Workload
                </span>
                <div className="text-2xl font-mono font-semibold text-foreground">
                  {planAnalysis?.remaining_minutes || 140} <span className="text-xs font-normal text-muted-foreground font-sans">min</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Approx. {planAnalysis?.remaining_pomodoros || 6} focus sessions
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Daily Study Budget
                </span>
                <div className="text-2xl font-mono font-semibold text-foreground">
                  {activeCourse.daily_available_minutes || 90} <span className="text-xs font-normal text-muted-foreground font-sans">min/day</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {planAnalysis?.daily_pomodoro_capacity || 3} pomodoros daily capacity
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Pacing Feasibility
                </span>
                <div className="text-2xl font-semibold text-foreground">
                  {planAnalysis?.deadline_feasibility?.is_realistic ? 'On Schedule' : 'Pacing Alert'}
                </div>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {planAnalysis?.deadline_feasibility?.days_remaining || 14} days until deadline
                </p>
              </div>
            </div>

            {planAnalysis?.deadline_feasibility?.warning && (
              <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-border text-xs text-foreground">
                <strong className="block font-semibold mb-0.5">Study Pacing Advisory</strong>
                <p className="text-muted-foreground">{planAnalysis.deadline_feasibility.warning}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: Course Library (All courses grid)
  // -------------------------------------------------------------
  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">
            My Courses
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your academic curriculum, study materials, and unit progress.
          </p>
        </div>

        <Button onClick={onOpenNewProject}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Course
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses or subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5" />
          <span>Showing {filteredProjects.length} of {projects.length} courses</span>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((course) => {
          const isCurrent = course.id === currentProject?.id;
          return (
            <div
              key={course.id}
              onClick={() => {
                onSelectProject(course);
                onSelectCourseId(course.id);
              }}
              className="p-6 rounded-xl border border-border bg-card hover:bg-neutral-50/50 dark:hover:bg-neutral-900/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {course.subject || 'General'}
                  </Badge>
                  {isCurrent && (
                    <span className="text-[10px] font-medium bg-neutral-200 dark:bg-neutral-800 text-foreground px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>

                <h3 className="text-base font-semibold text-foreground group-hover:text-black dark:group-hover:text-white transition-colors">
                  {course.name}
                </h3>
                {course.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-border/80 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-mono font-medium text-foreground">
                    {course.progress_percent || 0}%
                  </span>
                </div>
                <Progress value={course.progress_percent || 0} />

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" /> {course.daily_available_minutes || 90}m / day
                  </span>
                  {course.target_deadline && (
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" /> {course.target_deadline}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <GraduationCap className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-foreground">No courses found</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search or add a new study course.
          </p>
        </div>
      )}
    </div>
  );
};
