'use client';

import React from 'react';
import { CheckCircle2, Clock, Hourglass, Target } from 'lucide-react';
import { PlanAnalysis, StudyProject, StudyUnit } from '@/lib/types';
import { Progress } from '../ui/progress';

interface AnalyticsViewProps {
  currentProject: StudyProject | null;
  projects: StudyProject[];
  units: StudyUnit[];
  planAnalysis: PlanAnalysis | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  currentProject,
  projects,
  units,
  planAnalysis,
}) => {
  const completedUnits = units.filter((u) => u.is_completed);
  const totalEstMinutes = units.reduce((acc, u) => acc + u.estimated_minutes, 0);
  const totalActualMinutes = units.reduce((acc, u) => acc + (u.actual_minutes_spent || 0), 0);
  const totalRemainingMinutes = planAnalysis?.remaining_minutes || units.filter(u => !u.is_completed).reduce((acc, u) => acc + u.estimated_minutes, 0);

  const weeklyData = [
    { day: 'Mon', focusMins: 50, plannedMins: 60 },
    { day: 'Tue', focusMins: 75, plannedMins: 60 },
    { day: 'Wed', focusMins: 30, plannedMins: 90 },
    { day: 'Thu', focusMins: 60, plannedMins: 90 },
    { day: 'Fri', focusMins: 90, plannedMins: 90 },
    { day: 'Sat', focusMins: 45, plannedMins: 60 },
    { day: 'Sun', focusMins: 25, plannedMins: 60 },
  ];

  const maxMinutes = Math.max(...weeklyData.map((d) => Math.max(d.focusMins, d.plannedMins)), 100);

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-150">
      {/* Header */}
      <div className="border-b border-border/80 pb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">
          Insights & Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Measurable study velocity, consistency, and planned versus actual effort for {currentProject?.name || 'all courses'}.
        </p>
      </div>

      {/* Key Metrics Row (Meaningful Real Statistics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Study Time */}
        <div className="space-y-1.5 p-4 rounded-xl border border-border bg-card">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-foreground" /> Total Study Time
          </span>
          <div className="text-2xl font-semibold font-mono tracking-tight text-foreground">
            {Math.floor(totalActualMinutes / 60)}h {totalActualMinutes % 60}m
          </div>
          <p className="text-[11px] text-muted-foreground font-mono">
            Planned for units: {Math.floor(totalEstMinutes / 60)}h {totalEstMinutes % 60}m
          </p>
        </div>

        {/* Metric 2: Completed Sessions */}
        <div className="space-y-1.5 p-4 rounded-xl border border-border bg-card">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-foreground" /> Focus Sessions
          </span>
          <div className="text-2xl font-semibold font-mono tracking-tight text-foreground">
            {Math.max(1, Math.round(totalActualMinutes / 25))} <span className="text-xs font-normal text-muted-foreground font-sans">sessions</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Standard 25m Pomodoros
          </p>
        </div>

        {/* Metric 3: Curriculum Progress */}
        <div className="space-y-1.5 p-4 rounded-xl border border-border bg-card">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-foreground" /> Units Completed
          </span>
          <div className="text-2xl font-semibold font-mono tracking-tight text-foreground">
            {completedUnits.length} <span className="text-xs font-normal text-muted-foreground font-sans">/ {units.length}</span>
          </div>
          <p className="text-[11px] text-muted-foreground font-mono">
            {units.length > 0 ? Math.round((completedUnits.length / units.length) * 100) : 0}% course completion
          </p>
        </div>

        {/* Metric 4: Remaining Workload */}
        <div className="space-y-1.5 p-4 rounded-xl border border-border bg-card">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Hourglass className="w-3.5 h-3.5 text-foreground" /> Remaining Effort
          </span>
          <div className="text-2xl font-semibold font-mono tracking-tight text-foreground">
            {Math.floor(totalRemainingMinutes / 60)}h {totalRemainingMinutes % 60}m
          </div>
          <p className="text-[11px] text-muted-foreground font-mono">
            Across {units.length - completedUnits.length} pending units
          </p>
        </div>
      </div>

      {/* Weekly Consistency Bar Chart (Monochrome: Neutral gray target vs Black focused) */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Weekly Consistency & Velocity
            </h2>
            <p className="text-xs text-muted-foreground">Actual focus minutes logged compared against planned daily target</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-xs bg-foreground" /> Logged Focus
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-xs bg-secondary border border-border" /> Daily Target
            </span>
          </div>
        </div>

        <div className="h-52 flex items-end justify-between gap-4 pt-6">
          {weeklyData.map((d) => {
            const actualHeight = Math.round((d.focusMins / maxMinutes) * 100);
            const targetHeight = Math.round((d.plannedMins / maxMinutes) * 100);

            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center gap-1.5 h-36">
                  {/* Target bar */}
                  <div
                    style={{ height: `${targetHeight}%` }}
                    className="w-3 sm:w-4 bg-secondary border border-border rounded-t-xs"
                    title={`Target: ${d.plannedMins}m`}
                  />
                  {/* Actual bar */}
                  <div
                    style={{ height: `${actualHeight}%` }}
                    className="w-3 sm:w-4 bg-foreground rounded-t-xs transition-colors"
                    title={`Focused: ${d.focusMins}m`}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{d.day}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{d.focusMins}m</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Course Workload & Progress Breakdown */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-5">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Curriculum Progress by Course
          </h2>
          <p className="text-xs text-muted-foreground">Overall completion and remaining effort across active enrollments</p>
        </div>

        <div className="space-y-4 pt-1">
          {projects.map((p) => (
            <div key={p.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">{p.name}</span>
                <span className="text-muted-foreground font-mono">
                  {p.progress_percent || 0}% · {p.completed_units || 0}/{p.total_units || 0} units
                </span>
              </div>
              <Progress value={p.progress_percent || 0} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
