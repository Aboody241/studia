'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FastForward,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { PlanAnalysis, ScheduledDay, StudyProject, StudyUnit } from '@/lib/types';
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
  onUpdateProject?: (projectId: number, data: Partial<StudyProject>) => Promise<void>;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  currentProject,
  projects,
  units,
  planAnalysis,
  onStartFocus,
  onToggleUnit,
  onOpenWorkspace,
  onUpdateProject,
}) => {
  const [plannerMode, setPlannerMode] = useState<'daily' | 'weekly'>('daily');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [manualDayOverrides, setManualDayOverrides] = useState<Record<number, number>>({});
  const [isApplyingPacing, setIsApplyingPacing] = useState(false);

  const completedUnits = units.filter((u) => u.is_completed);
  const uncompletedUnits = units.filter((u) => !u.is_completed);
  const dailyCapacityMinutes = currentProject?.daily_available_minutes || 90;

  // Compute or enrich deterministic schedule with manual day overrides
  const effectiveScheduledDays: ScheduledDay[] = useMemo(() => {
    // Fallback baseline deterministic calculation if planAnalysis days not provided
    const baseDays: ScheduledDay[] = planAnalysis?.scheduled_days && planAnalysis.scheduled_days.length > 0
      ? planAnalysis.scheduled_days
      : (() => {
          const days: ScheduledDay[] = [];
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const queue = [...uncompletedUnits];
          let qIdx = 0;
          const maxDays = Math.max(7, Math.ceil(uncompletedUnits.reduce((a, b) => a + b.estimated_minutes, 0) / dailyCapacityMinutes) + 1);

          for (let d = 0; d < maxDays && qIdx < queue.length; d++) {
            const dDate = new Date(today);
            dDate.setDate(today.getDate() + d);
            const dUnits: StudyUnit[] = [];
            let mins = 0;

            while (qIdx < queue.length) {
              const u = queue[qIdx];
              const uMins = u.estimated_minutes || 25;
              if (mins + uMins > dailyCapacityMinutes && dUnits.length > 0) break;
              dUnits.push(u);
              mins += uMins;
              qIdx++;
            }

            if (dUnits.length > 0) {
              days.push({
                date: dDate.toISOString().split('T')[0],
                day_name: d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : dDate.toLocaleDateString('en-US', { weekday: 'short' }),
                day_label: d === 0
                  ? `Today, ${dDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  : d === 1
                  ? `Tomorrow, ${dDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  : dDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                day_number: d,
                is_today: d === 0,
                total_minutes: mins,
                pomodoros_count: Math.ceil(mins / 25),
                units_count: dUnits.length,
                units: dUnits,
                is_over_capacity: mins > dailyCapacityMinutes,
              });
            }
          }
          return days;
        })();

    if (Object.keys(manualDayOverrides).length === 0) {
      return baseDays;
    }

    // Apply manual day overrides
    const daysMap = new Map<number, StudyUnit[]>();
    baseDays.forEach((d) => daysMap.set(d.day_number, []));

    baseDays.forEach((d) => {
      d.units.forEach((u) => {
        const targetDay = manualDayOverrides[u.id] !== undefined ? manualDayOverrides[u.id] : d.day_number;
        if (!daysMap.has(targetDay)) daysMap.set(targetDay, []);
        daysMap.get(targetDay)!.push(u);
      });
    });

    return baseDays.map((d) => {
      const assignedUnits = daysMap.get(d.day_number) || [];
      const totalMins = assignedUnits.reduce((acc, u) => acc + (u.estimated_minutes || 25), 0);
      return {
        ...d,
        units: assignedUnits,
        units_count: assignedUnits.length,
        total_minutes: totalMins,
        pomodoros_count: Math.ceil(totalMins / 25),
        is_over_capacity: totalMins > dailyCapacityMinutes,
      };
    });
  }, [planAnalysis, uncompletedUnits, dailyCapacityMinutes, manualDayOverrides]);

  const activeDay = effectiveScheduledDays[selectedDayIndex] || effectiveScheduledDays[0] || {
    date: new Date().toISOString().split('T')[0],
    day_name: 'Today',
    day_label: 'Today',
    day_number: 0,
    is_today: true,
    total_minutes: 0,
    pomodoros_count: 0,
    units_count: 0,
    units: [],
    is_over_capacity: false,
  };

  const handlePostponeUnit = (unitId: number) => {
    const nextDay = (manualDayOverrides[unitId] !== undefined ? manualDayOverrides[unitId] : activeDay.day_number) + 1;
    setManualDayOverrides((prev) => ({ ...prev, [unitId]: nextDay }));
  };

  const handleMoveToToday = (unitId: number) => {
    setManualDayOverrides((prev) => ({ ...prev, [unitId]: 0 }));
  };

  const handleResetSchedule = () => {
    setManualDayOverrides({});
  };

  const feasibility = planAnalysis?.deadline_feasibility;
  const isUnrealistic = feasibility && !feasibility.is_realistic;

  const handleAcceptSuggestedDeadline = async () => {
    if (!currentProject || !feasibility?.suggested_deadline || !onUpdateProject) return;
    setIsApplyingPacing(true);
    try {
      await onUpdateProject(currentProject.id, {
        target_deadline: feasibility.suggested_deadline,
      });
    } finally {
      setIsApplyingPacing(false);
    }
  };

  const handleAcceptSuggestedBudget = async () => {
    if (!currentProject || !feasibility?.suggested_daily_minutes || !onUpdateProject) return;
    setIsApplyingPacing(true);
    try {
      await onUpdateProject(currentProject.id, {
        daily_available_minutes: feasibility.suggested_daily_minutes,
      });
    } finally {
      setIsApplyingPacing(false);
    }
  };

  const scheduledMinutesToday = effectiveScheduledDays[0]?.total_minutes || 0;
  const capacityPercent = Math.min(100, Math.round((scheduledMinutesToday / dailyCapacityMinutes) * 100));
  const isTodayOverCapacity = scheduledMinutesToday > dailyCapacityMinutes;

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">
            Study Planner
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Deterministic workload scheduling based on your study units, daily capacity, and target deadlines.
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

      {/* INFEASIBLE DEADLINE PACING ALERT (Phase 4 requirement: Explicit Infeasible Deadline Signal) */}
      {isUnrealistic && (
        <div className="p-5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/60 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-foreground shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-semibold text-foreground">
                Pacing Warning: Deadline Unattainable at Current Daily Capacity
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feasibility.warning ||
                  `You need ${feasibility.required_daily_minutes} min/day to hit this deadline, but your daily budget is ${dailyCapacityMinutes} min.`}
              </p>

              {/* Actionable Recommendations */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                {feasibility.suggested_deadline && onUpdateProject && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isApplyingPacing}
                    onClick={handleAcceptSuggestedDeadline}
                    className="text-xs h-7"
                  >
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    Extend Deadline to {feasibility.suggested_deadline}
                  </Button>
                )}

                {feasibility.suggested_daily_minutes && onUpdateProject && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isApplyingPacing}
                    onClick={handleAcceptSuggestedBudget}
                    className="text-xs h-7"
                  >
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    Increase Daily Budget to {feasibility.suggested_daily_minutes}m
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workload Capacity Bar */}
      <div className="p-5 rounded-xl border border-border bg-card space-y-3">
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
              isTodayOverCapacity
                ? 'bg-neutral-200 dark:bg-neutral-800 text-foreground font-semibold'
                : 'bg-neutral-100 dark:bg-neutral-800 text-muted-foreground'
            }`}
          >
            {isTodayOverCapacity
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
            {/* Day Selector Navigation */}
            <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-3">
              {effectiveScheduledDays.slice(0, 6).map((day, idx) => (
                <button
                  key={day.date}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    selectedDayIndex === idx
                      ? 'bg-foreground text-background font-semibold shadow-xs'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{day.day_name}</span>
                  <span className="opacity-70 font-mono text-[10px]">
                    ({day.units_count} · {day.total_minutes}m)
                  </span>
                </button>
              ))}

              {Object.keys(manualDayOverrides).length > 0 && (
                <button
                  onClick={handleResetSchedule}
                  className="ml-auto text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  title="Reset custom day moves"
                >
                  <RotateCcw className="w-3 h-3" />
                  Auto-Balance
                </button>
              )}
            </div>

            {/* Active Day Meta Banner */}
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span className="font-semibold text-foreground">{activeDay.day_label}</span>
              <span className="font-mono">
                {activeDay.units.length} tasks · {activeDay.total_minutes} minutes ({activeDay.pomodoros_count} sessions)
              </span>
            </div>

            {/* Task List */}
            <div className="border border-border rounded-xl divide-y divide-border/80 bg-card overflow-hidden">
              {activeDay.units.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
                  <p>No study tasks scheduled for {activeDay.day_label}. All caught up!</p>
                  {uncompletedUnits.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveToToday(uncompletedUnits[0].id)}
                      className="text-xs mt-2"
                    >
                      Pull task to this day
                    </Button>
                  )}
                </div>
              ) : (
                activeDay.units.map((unit) => (
                  <div
                    key={unit.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 pr-2">
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
                          <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                            {currentProject?.subject || 'Course'}
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
                            <span>pp. {unit.page_start}–{unit.page_end || unit.page_start}</span>
                          )}
                          <span className="capitalize">{unit.difficulty}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {/* Postpone Action */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePostponeUnit(unit.id)}
                        className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground"
                        title="Postpone to next scheduled day"
                      >
                        <FastForward className="w-3.5 h-3.5 mr-1" />
                        Postpone
                      </Button>

                      {/* Open in PDF Workspace */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenWorkspace(unit)}
                        className="text-xs h-8 px-2.5"
                        title="Open in Document Reader"
                      >
                        <BookOpen className="w-3.5 h-3.5 mr-1" />
                        Study
                      </Button>

                      {/* Start Focus Session */}
                      <Button
                        size="sm"
                        onClick={() => onStartFocus(unit)}
                        className="text-xs h-8 px-3"
                      >
                        <Play className="w-3 h-3 fill-current mr-1" />
                        Focus
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
                    Completed Units ({completedUnits.length})
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
                  Course Deadlines
                </h3>
              </div>

              <div className="space-y-3">
                {projects.map((p) => {
                  const pUnits = units.filter((u) => u.study_project_id === p.id);
                  const pRemMins = pUnits.filter((u) => !u.is_completed).reduce((a, b) => a + b.estimated_minutes, 0);
                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-lg border border-border bg-neutral-50/60 dark:bg-neutral-900/40 space-y-1"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-semibold text-foreground">{p.name}</h4>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {p.target_deadline || 'No deadline'}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>{pRemMins}m remaining</span>
                        <span className="font-medium text-foreground">
                          Budget: {p.daily_available_minutes || 90}m / day
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pacing Advice */}
            <div className="p-5 rounded-xl border border-border bg-card space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-foreground" />
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  Pacing Strategy
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You have {uncompletedUnits.length} units remaining ({planAnalysis?.remaining_pomodoros || Math.ceil(uncompletedUnits.length * 30 / 25)} Pomodoro sessions). At your budget of {dailyCapacityMinutes}m daily, complete {planAnalysis?.daily_pomodoro_capacity || 3} sessions each day to finish with a safety buffer.
              </p>
              <div className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={handleResetSchedule}
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
            {effectiveScheduledDays.slice(0, 7).map((day, idx) => (
              <div
                key={day.date}
                onClick={() => {
                  setSelectedDayIndex(idx);
                  setPlannerMode('daily');
                }}
                className={`p-4 rounded-xl border bg-card flex flex-col justify-between space-y-3 cursor-pointer transition-all hover:border-foreground/50 ${
                  day.is_today
                    ? 'border-foreground shadow-xs'
                    : 'border-border'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">{day.day_name}</span>
                    <span className="text-[11px] text-muted-foreground">{day.date.slice(5)}</span>
                  </div>

                  {day.is_today && (
                    <span className="inline-block mt-1 text-[10px] font-semibold bg-foreground text-background px-1.5 py-0.2 rounded">
                      Today
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="text-xl font-mono font-semibold text-foreground">
                    {day.total_minutes} <span className="text-xs font-normal text-muted-foreground font-sans">m</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {day.units_count} {day.units_count === 1 ? 'task' : 'tasks'} ({day.pomodoros_count} pomodoros)
                  </p>
                  <Progress value={Math.min(100, (day.total_minutes / dailyCapacityMinutes) * 100)} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-xl border border-border bg-neutral-50 dark:bg-neutral-900/40 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>
              Total scheduled study workload: <strong>{uncompletedUnits.reduce((a, b) => a + b.estimated_minutes, 0)} mins</strong> across {effectiveScheduledDays.length} active days.
            </span>
            <span className="font-mono">Daily target: {dailyCapacityMinutes} mins</span>
          </div>
        </div>
      )}
    </div>
  );
};
