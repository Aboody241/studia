'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Play,
  Plus,
  Search,
} from 'lucide-react';
import { PlanAnalysis, StudyProject, StudyUnit } from '@/lib/types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

interface DashboardViewProps {
  currentProject: StudyProject | null;
  projects: StudyProject[];
  units: StudyUnit[];
  planAnalysis: PlanAnalysis | null;
  onEnterCourse: (project: StudyProject) => void;
  onOpenNewProject: () => void;
  onStartFocus: (unit?: StudyUnit) => void;
  onOpenWorkspace: (unit?: StudyUnit) => void;
  onToggleUnit: (unitId: number) => void;
  onSelectProject: (p: StudyProject) => void;
  onNavigateToCourses: () => void;
  onNavigateToPlanner: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentProject,
  projects,
  units,
  planAnalysis,
  onEnterCourse,
  onOpenNewProject,
  onStartFocus,
  onOpenWorkspace,
  onToggleUnit,
  onNavigateToPlanner,
}) => {
  const [courseSearch, setCourseSearch] = useState('');

  const completedUnits = units.filter((u) => u.is_completed);
  const uncompletedUnits = units.filter((u) => !u.is_completed);
  const nextUnit = planAnalysis?.next_recommended_unit || uncompletedUnits[0];

  const progressPercent = units.length > 0 ? Math.round((completedUnits.length / units.length) * 100) : 0;

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
    (p.subject && p.subject.toLowerCase().includes(courseSearch.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-150">
      {/* 1. Header with Overview & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">
            Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse all your courses, open materials, and execute today&apos;s study plan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onOpenNewProject}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Course
          </Button>
          <Button size="sm" onClick={() => onStartFocus(nextUnit)}>
            <Play className="w-3 h-3 fill-current mr-1.5" />
            Start Focus (25m)
          </Button>
        </div>
      </div>

      {/* 2. ALL COURSES CARDS (Requested by User: Cards for every course to easily select and enter) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-foreground" />
              <h2 className="text-base font-semibold text-foreground tracking-tight">
                All Courses ({projects.length})
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select any course to view curriculum breakdown, study units, or open PDF documents.
            </p>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter courses..."
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              className="w-full bg-card border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Courses Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          {filteredProjects.map((course) => {
            const isCurrent = course.id === currentProject?.id;
            const coursePercent = isCurrent ? progressPercent : (course.progress_percent || 0);

            return (
              <div
                key={course.id}
                onClick={() => onEnterCourse(course)}
                className={`p-5 rounded-xl border bg-card transition-all cursor-pointer group flex flex-col justify-between hover:shadow-sm ${
                  isCurrent
                    ? 'border-neutral-400 dark:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-900/40 ring-1 ring-neutral-300 dark:ring-neutral-700'
                    : 'border-border hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50/30'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {course.subject || 'Academic'}
                    </Badge>
                    {isCurrent && (
                      <span className="text-[10px] font-medium bg-neutral-200 dark:bg-neutral-800 text-foreground px-2 py-0.5 rounded">
                        Active Course
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

                <div className="mt-5 pt-4 border-t border-border/80 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-mono font-semibold text-foreground">
                      {coursePercent}%
                    </span>
                  </div>
                  <Progress value={coursePercent} />

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {course.daily_available_minutes || 90}m / day
                    </span>
                    {course.target_deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Due {course.target_deadline}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEnterCourse(course);
                      }}
                      className="w-full text-xs h-8 font-medium"
                    >
                      Enter Course <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add New Course Card */}
          <div
            onClick={onOpenNewProject}
            className="p-6 rounded-xl border border-dashed border-border hover:border-neutral-400 bg-neutral-50/40 dark:bg-neutral-900/20 hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-all cursor-pointer flex flex-col items-center justify-center text-center min-h-[220px]"
          >
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground mb-3">
              <Plus className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">
              Add Another Course
            </h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Upload textbook PDFs, create new study units, and configure deadlines.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Recommended Next Study Task */}
      {nextUnit && (
        <div className="p-6 rounded-xl border border-border bg-neutral-50 dark:bg-neutral-900/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recommended Next Task
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                {nextUnit.estimated_minutes} min
              </span>
            </div>

            <Badge variant="outline" className="text-[10px] font-mono capitalize">
              {nextUnit.difficulty}
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground tracking-tight">
                {nextUnit.title}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentProject?.name} {nextUnit.page_start ? `· pp. ${nextUnit.page_start}–${nextUnit.page_end}` : ''}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="md"
                onClick={() => onOpenWorkspace(nextUnit)}
              >
                Read Material
              </Button>
              <Button
                size="md"
                onClick={() => onStartFocus(nextUnit)}
              >
                <Play className="w-3.5 h-3.5 fill-current mr-1.5" />
                Start Focus (25m)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Today's Actionable Study Plan */}
      <div className="space-y-4 pt-2 border-t border-border/80">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Today&apos;s Study Plan
            </h3>
            <p className="text-xs text-muted-foreground">
              Actionable units scheduled for today. Check off units as you finish them.
            </p>
          </div>
          <button
            onClick={onNavigateToPlanner}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium transition-colors"
          >
            Full Planner <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="divide-y divide-border/80 border border-border rounded-xl overflow-hidden bg-card">
          {units.length === 0 ? (
            <p className="text-xs text-muted-foreground p-8 text-center">
              No study units defined. Add units in your courses.
            </p>
          ) : (
            units.slice(0, 5).map((unit) => {
              const isNext = unit.id === nextUnit?.id && !unit.is_completed;
              return (
                <div
                  key={unit.id}
                  className={`p-3.5 flex items-center justify-between transition-colors ${
                    unit.is_completed
                      ? 'bg-neutral-50/50 dark:bg-neutral-900/30'
                      : isNext
                      ? 'bg-neutral-100/70 dark:bg-neutral-900/60'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <button
                      onClick={() => onToggleUnit(unit.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      title={unit.is_completed ? 'Mark uncompleted' : 'Mark completed'}
                    >
                      {unit.is_completed ? (
                        <CheckCircle2 className="w-4 h-4 text-foreground fill-foreground/10" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-600 hover:border-foreground transition-colors" />
                      )}
                    </button>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-muted-foreground">
                          #{unit.order_index}
                        </span>
                        <p
                          className={`text-xs font-medium truncate ${
                            unit.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          {unit.title}
                        </p>
                        {isNext && (
                          <span className="text-[9px] uppercase font-semibold bg-neutral-200 dark:bg-neutral-800 text-foreground px-1.5 py-0.2 rounded">
                            Up Next
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {unit.estimated_minutes}m
                        </span>
                        {unit.page_start && <span>pp. {unit.page_start}–{unit.page_end}</span>}
                      </div>
                    </div>
                  </div>

                  {!unit.is_completed && (
                    <Button
                      variant={isNext ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => onStartFocus(unit)}
                      className="text-xs h-7 px-2.5 shrink-0"
                    >
                      <Play className="w-3 h-3 fill-current mr-1" />
                      Focus
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
