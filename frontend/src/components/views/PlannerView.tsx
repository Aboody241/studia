'use client';

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Play,
  RotateCcw,
} from 'lucide-react';
import { PlanAnalysis, StudyProject, StudyUnit } from '@/lib/types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

interface PlannerViewProps {
  currentProject: StudyProject | null;
  projects: StudyProject[];
  units: StudyUnit[];
  planAnalysis: PlanAnalysis | null;
  onStartFocus: (unit?: StudyUnit) => void;
  onToggleUnit: (unitId: number) => void;
  onOpenWorkspace: (unit?: StudyUnit) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  currentProject,
  projects,
  units,
  planAnalysis,
  onStartFocus,
  onToggleUnit,
  onOpenWorkspace,
}) => {
  const [plannerMode, setPlannerMode] = useState<'daily' | 'weekly'>('daily');
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0); // 0 = Today, 1 = Tomorrow, 2 = Next Day

  const completedUnits = units.filter((u) => u.is_completed);
  const uncompletedUnits = units.filter((u) => !u.is_completed);

  // Group units for daily schedule demo
  const todayUnits = uncompletedUnits.slice(0, 3);
  const tomorrowUnits = uncompletedUnits.slice(3, 5);
  const upcomingUnits = uncompletedUnits.slice(5);

  const activeDailyList =
    selectedDayOffset === 0 ? todayUnits : selectedDayOffset === 1 ? tomorrowUnits : upcomingUnits;

  const dailyCapacityMinutes = currentProject?.daily_available_minutes || 90;
  const scheduledMinutesToday = todayUnits.reduce((acc, u) => acc + u.estimated_minutes, 0);
  const capacityPercent = Math.min(100, Math.round((scheduledMinutesToday / dailyCapacityMinutes) * 100));
  const isOverCapacity = scheduledMinutesToday > dailyCapacityMinutes;

  const weeklySchedule = [
    { day: 'Mon', label: 'Oct 19', minutes: 75, unitsCount: 3, deadline: null },
    { day: 'Tue', label: 'Oct 20', minutes: 60, unitsCount: 2, deadline: null },
    { day: 'Wed', label: 'Oct 21', minutes: 90, unitsCount: 3, deadline: null },
    { day: 'Thu', label: 'Oct 22', minutes: 45, unitsCount: 2, deadline: null },
    { day: 'Fri', label: 'Oct 23', minutes: 80, unitsCount: 3, deadline: 'Quiz 1' },
    { day: 'Sat', label: 'Oct 24', minutes: 30, unitsCount: 1, deadline: null },
    { day: 'Sun', label: 'Oct 25', minutes: 0, unitsCount: 0, deadline: null },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">
            Study Planner
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Structured session planning tailored to your deadlines and daily available time.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 bg-secondary rounded-lg border border-border">
          <button
            onClick={() => setPlannerMode('daily')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              plannerMode === 'daily'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Daily Plan
          </button>
          <button
            onClick={() => setPlannerMode('weekly')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              plannerMode === 'weekly'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Weekly Schedule
          </button>
        </div>
      </div>

      {/* Workload Capacity Bar */}
      <div className="p-5 rounded-xl border border-border bg-neutral-50 dark:bg-neutral-900/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
              Today&apos;s Workload Capacity
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground font-mono">
              {scheduledMinutesToday}m scheduled / {dailyCapacityMinutes}m daily budget
            </span>
          </div>

          <span
            className={`font-medium px-2 py-0.5 rounded text-[11px] self-start sm:self-auto ${
              isOverCapacity
                ? 'bg-neutral-200 dark:bg-neutral-800 text-foreground font-semibold'
                : 'bg-neutral-100 dark:bg-neutral-800 text-muted-foreground'
            }`}
          >
            {isOverCapacity
              ? `Over capacity by ${scheduledMinutesToday - dailyCapacityMinutes}m`
              : `${dailyCapacityMinutes - scheduledMinutesToday}m capacity remaining`}
          </span>
        </div>

        <Progress value={capacityPercent} />
      </div>

      {/* VIEW 1: DAILY PLAN */}
      {plannerMode === 'daily' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Day Task Schedule */}
          <div className="lg:col-span-2 space-y-6">
            {/* Day Selector Pills */}
            <div className="flex items-center gap-2 border-b border-border/80 pb-3">
              <button
                onClick={() => setSelectedDayOffset(0)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedDayOffset === 0
                    ? 'bg-foreground text-background font-semibold'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                Today ({todayUnits.length} tasks)
              </button>
              <button
                onClick={() => setSelectedDayOffset(1)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedDayOffset === 1
                    ? 'bg-foreground text-background font-semibold'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                Tomorrow ({tomorrowUnits.length} tasks)
              </button>
              <button
                onClick={() => setSelectedDayOffset(2)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedDayOffset === 2
                    ? 'bg-foreground text-background font-semibold'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                Upcoming Queue ({upcomingUnits.length})
              </button>
            </div>

            {/* Task List */}
            <div className="border border-border rounded-xl divide-y divide-border/80 bg-card overflow-hidden">
              {activeDailyList.length === 0 ? (
                <div className="p-10 text-center text-xs text-muted-foreground">
                  No study tasks scheduled for this day. All caught up!
                </div>
              ) : (
                activeDailyList.map((unit) => (
                  <div
                    key={unit.id}
                    className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors"
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
                          <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                            {currentProject?.subject || 'CS'}
                          </Badge>
                          <p className="text-sm font-medium text-foreground truncate">
                            {unit.title}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {unit.estimated_minutes} min
                          </span>
                          {unit.page_start && (
                            <span>Pages {unit.page_start}–{unit.page_end}</span>
                          )}
                          <span className="capitalize">{unit.difficulty}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenWorkspace(unit)}
                        className="text-xs h-8 px-2"
                        title="View document"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onStartFocus(unit)}
                        className="text-xs h-8 px-3"
                      >
                        <Play className="w-3 h-3 fill-current mr-1" />
                        Start
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Completed Work Section */}
            {completedUnits.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Completed Today ({completedUnits.length})
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {completedUnits.reduce((acc, u) => acc + (u.actual_minutes_spent || u.estimated_minutes), 0)}m completed
                  </span>
                </div>

                <div className="border border-border/70 rounded-xl divide-y divide-border/60 bg-neutral-50/50 dark:bg-neutral-900/20">
                  {completedUnits.map((unit) => (
                    <div key={unit.id} className="p-3 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2.5 truncate">
                        <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                        <span className="line-through truncate">{unit.title}</span>
                      </div>
                      <span className="font-mono text-[11px] shrink-0">
                        {unit.actual_minutes_spent || unit.estimated_minutes}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Deadlines & Pacing Feasibility */}
          <div className="space-y-6">
            {/* Upcoming Deadlines */}
            <div className="p-5 rounded-xl border border-border bg-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-foreground" />
                  Upcoming Deadlines
                </h3>
              </div>

              <div className="space-y-3">
                {projects.map((p) => (
                  <div key={p.id} className="p-3 rounded-lg border border-border bg-neutral-50/60 dark:bg-neutral-900/40 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-semibold text-foreground">{p.name}</h4>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {p.target_deadline || 'Oct 29'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>14 days remaining</span>
                      <span className="font-medium text-foreground">
                        {Math.ceil((p.total_estimated_minutes || 140) / 14)}m / day needed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pacing Advice */}
            <div className="p-5 rounded-xl border border-border bg-card space-y-3">
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                Planner Recommendations
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You have {uncompletedUnits.length} total units remaining across active courses ({planAnalysis?.remaining_pomodoros || Math.ceil(uncompletedUnits.length * 30 / 25)} estimated sessions). Aim for {planAnalysis?.daily_pomodoro_capacity || 3} Pomodoro sessions daily to finish on schedule.
              </p>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => onStartFocus(uncompletedUnits[0])}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Auto-Balance Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: WEEKLY SCHEDULE */}
      {plannerMode === 'weekly' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {weeklySchedule.map((day) => (
              <div
                key={day.day}
                className="p-4 rounded-xl border border-border bg-card flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">{day.day}</span>
                    <span className="text-[11px] text-muted-foreground">{day.label}</span>
                  </div>

                  {day.deadline && (
                    <div className="mt-2 text-[10px] font-medium bg-neutral-200 dark:bg-neutral-800 text-foreground px-1.5 py-0.5 rounded">
                      {day.deadline}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="text-xl font-mono font-semibold text-foreground">
                    {day.minutes} <span className="text-xs font-normal text-muted-foreground font-sans">m</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {day.unitsCount} {day.unitsCount === 1 ? 'task' : 'tasks'}
                  </p>
                  <Progress value={Math.min(100, (day.minutes / 90) * 100)} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-xl border border-border bg-neutral-50 dark:bg-neutral-900/40 text-xs text-muted-foreground flex items-center justify-between">
            <span>Weekly Workload Target: <strong>380 mins (15 Pomodoro sessions)</strong></span>
            <span className="font-mono">Weekly completion pace: 82%</span>
          </div>
        </div>
      )}
    </div>
  );
};
