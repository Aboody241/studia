'use client';

import React, { useState } from 'react';
import { PlanAnalysis, StudyProject, StudyUnit } from '@/lib/types';
import { CheckCircle2, Clock, ListOrdered, Play, Plus } from 'lucide-react';
import { Button } from './ui/button';

interface StudyPlanPanelProps {
  project?: StudyProject | null;
  units: StudyUnit[];
  planAnalysis: PlanAnalysis | null;
  activeUnitId?: number | null;
  onToggleComplete: (unitId: number) => void;
  onSelectUnitForTimer: (unit: StudyUnit) => void;
  onSelectUnit?: (unit: StudyUnit) => void;
  onAddUnit: (title: string, estimatedMinutes: number) => void;
  isOpen?: boolean;
}

export const StudyPlanPanel: React.FC<StudyPlanPanelProps> = ({
  units,
  planAnalysis,
  activeUnitId,
  onToggleComplete,
  onSelectUnitForTimer,
  onSelectUnit,
  onAddUnit,
  isOpen = true,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMinutes, setNewMinutes] = useState(25);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddUnit(newTitle.trim(), newMinutes);
    setNewTitle('');
    setIsAdding(false);
  };

  const completedCount = units.filter((u) => u.is_completed).length;

  return (
    <aside className="w-72 border-r border-border bg-[#FAFAFA] dark:bg-[#121212] flex flex-col h-[calc(100vh)] shrink-0 select-none">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-3.5 h-3.5 text-foreground" />
          <h2 className="text-xs font-semibold text-foreground">
            Study Plan
          </h2>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">
          {completedCount} / {units.length} done
        </span>
      </div>

      {/* Recommended Next Task banner */}
      {planAnalysis?.next_recommended_unit && (
        <div className="m-3 p-3 rounded-lg bg-white dark:bg-neutral-900 border border-border shadow-xs flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Next Task
            </span>
            <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {planAnalysis.next_recommended_unit.estimated_minutes}m
            </span>
          </div>
          <p className="text-xs font-medium text-foreground line-clamp-1">
            {planAnalysis.next_recommended_unit.title}
          </p>
          <Button
            size="sm"
            onClick={() => onSelectUnitForTimer(planAnalysis.next_recommended_unit!)}
            className="w-full mt-1.5 text-xs h-7"
          >
            <Play className="w-3 h-3 fill-current mr-1" />
            Focus
          </Button>
        </div>
      )}

      {/* Units List (Structured clean list) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {units.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-xs">
            No study units defined.
          </div>
        ) : (
          units.map((unit) => {
            const isActive = activeUnitId === unit.id;
            return (
              <div
                key={unit.id}
                className={`group p-2.5 rounded-lg border transition-colors flex items-start gap-2.5 ${
                  unit.is_completed
                    ? 'bg-transparent border-transparent opacity-50'
                    : isActive
                    ? 'bg-neutral-200/80 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700'
                    : 'bg-white dark:bg-neutral-900 border-border/80 hover:border-neutral-400'
                }`}
              >
                <button
                  onClick={() => onToggleComplete(unit.id)}
                  className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title={unit.is_completed ? 'Mark uncompleted' : 'Mark completed'}
                >
                  {unit.is_completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-foreground fill-foreground/10" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-neutral-300 dark:border-neutral-600 hover:border-foreground transition-colors" />
                  )}
                </button>

                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => onSelectUnit?.(unit)}
                  title="Click to jump to this unit in the reader"
                >
                  <p
                    className={`text-xs font-medium leading-snug truncate hover:underline ${
                      unit.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'
                    }`}
                  >
                    {unit.order_index}. {unit.title}
                  </p>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground font-mono">
                    <span>{unit.estimated_minutes}m</span>
                    {unit.page_start && <span>pp. {unit.page_start}–{unit.page_end}</span>}
                    <span className="capitalize">{unit.difficulty}</span>
                  </div>
                </div>

                {!unit.is_completed && (
                  <button
                    onClick={() => onSelectUnitForTimer(unit)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded bg-neutral-100 dark:bg-neutral-800 text-foreground hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                    title="Focus on this unit"
                  >
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                )}
              </div>
            );
          })
        )}

        {/* Add Unit Form */}
        {isAdding ? (
          <form onSubmit={handleCreate} className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-border space-y-2 mt-2">
            <input
              type="text"
              placeholder="Unit title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-border rounded px-2.5 py-1 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="180"
                value={newMinutes}
                onChange={(e) => setNewMinutes(Number(e.target.value))}
                className="w-16 bg-neutral-50 dark:bg-neutral-950 border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none"
              />
              <span className="text-xs text-muted-foreground">min</span>
            </div>
            <div className="flex justify-end gap-1.5 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(false)}
                className="text-xs h-7 px-2"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs h-7 px-3">
                Save
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="w-full text-xs h-8 border-dashed"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Unit
          </Button>
        )}
      </div>

      {/* Panel Footer */}
      <div className="p-3 border-t border-border bg-transparent text-[11px] text-muted-foreground flex items-center justify-between">
        <span>Workload:</span>
        <span className="font-mono font-medium text-foreground">
          {planAnalysis?.remaining_minutes || 0}m ({planAnalysis?.remaining_pomodoros || 0} sessions)
        </span>
      </div>
    </aside>
  );
};
