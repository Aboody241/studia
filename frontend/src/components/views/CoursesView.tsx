'use client';

import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  GraduationCap,
  Loader2,
  Play,
  Plus,
  Search,
  Trash2,
  Upload,
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
  onAddUnit: (title: string, estimatedMinutes: number) => void;
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
  onUploadMaterial,
  onDeleteMaterial,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'units' | 'materials' | 'plan'>('units');
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitMinutes, setNewUnitMinutes] = useState(30);

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

  const handleAddUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitTitle.trim()) return;
    onAddUnit(newUnitTitle.trim(), newUnitMinutes);
    setNewUnitTitle('');
    setIsAddingUnit(false);
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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  Curriculum Breakdown
                </h3>
                <p className="text-xs text-muted-foreground">
                  Structured study units for this course. Click checkbox to toggle progress.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingUnit(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Unit
              </Button>
            </div>

            {/* Inline Add Unit Form */}
            {isAddingUnit && (
              <form
                onSubmit={handleAddUnitSubmit}
                className="p-4 rounded-xl border border-border bg-neutral-50 dark:bg-neutral-900/60 space-y-3"
              >
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Create New Study Unit
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="e.g. Chapter 4: Memory Management"
                      value={newUnitTitle}
                      onChange={(e) => setNewUnitTitle(e.target.value)}
                      className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="5"
                      max="180"
                      value={newUnitMinutes}
                      onChange={(e) => setNewUnitMinutes(Number(e.target.value))}
                      className="w-20 bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none"
                    />
                    <span className="text-xs text-muted-foreground">minutes</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
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
              {units.length === 0 ? (
                <div className="p-10 text-center text-xs text-muted-foreground">
                  No study units created yet. Add your first unit above.
                </div>
              ) : (
                units.map((unit) => (
                  <div
                    key={unit.id}
                    className={`p-4 flex items-center justify-between transition-colors ${
                      unit.is_completed ? 'bg-neutral-50/50 dark:bg-neutral-900/20' : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 pr-4">
                      <button
                        onClick={() => onToggleUnit(unit.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
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
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" /> {unit.estimated_minutes} min
                          </span>
                          {unit.page_start && (
                            <span className="font-mono">Pages {unit.page_start}–{unit.page_end}</span>
                          )}
                          <span className="capitalize text-[11px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 border border-border">
                            {unit.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenWorkspace(undefined, unit)}
                        className="text-xs h-8 px-2.5"
                      >
                        <BookOpen className="w-3.5 h-3.5 mr-1" />
                        Study
                      </Button>
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
                ))
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
