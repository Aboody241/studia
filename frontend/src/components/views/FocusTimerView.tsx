'use client';

import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Pause,
  Play,
} from 'lucide-react';
import { FocusSession, StudyProject, StudyUnit } from '@/lib/types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface FocusTimerViewProps {
  currentProject: StudyProject | null;
  activeUnit: StudyUnit | null;
  activeSession: FocusSession | null;
  onStartSession: (durationMinutes: number) => void;
  onPauseSession: () => void;
  onResumeSession: () => void;
  onCompleteSession: (markUnitComplete: boolean) => void;
  onReturnToWorkspace: () => void;
}

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({
  currentProject,
  activeUnit,
  activeSession,
  onStartSession,
  onPauseSession,
  onResumeSession,
  onCompleteSession,
  onReturnToWorkspace,
}) => {
  const [sessionType, setSessionType] = useState<'focus' | 'break' | 'long_break'>('focus');

  const calculateRemaining = () => {
    if (!activeSession) {
      return sessionType === 'focus' ? 25 * 60 : sessionType === 'break' ? 5 * 60 : 15 * 60;
    }
    const planned = activeSession.planned_duration_seconds;
    let focusSecs = activeSession.actual_focus_seconds || 0;

    if (activeSession.status === 'running') {
      const started = new Date(activeSession.started_at).getTime();
      const now = Date.now();
      const totalElapsed = Math.floor((now - started) / 1000);
      focusSecs = Math.max(0, totalElapsed - (activeSession.accumulated_paused_seconds || 0));
    }

    return Math.max(0, planned - focusSecs);
  };

  const [secondsRemaining, setSecondsRemaining] = useState<number>(calculateRemaining);

  // Synchronize when running
  useEffect(() => {
    if (activeSession?.status !== 'running') {
      return;
    }

    const interval = setInterval(() => {
      const planned = activeSession.planned_duration_seconds;
      const started = new Date(activeSession.started_at).getTime();
      const totalElapsed = Math.floor((Date.now() - started) / 1000);
      const focusSecs = Math.max(0, totalElapsed - (activeSession.accumulated_paused_seconds || 0));
      setSecondsRemaining(Math.max(0, planned - focusSecs));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isRunning = activeSession?.status === 'running';
  const isPaused = activeSession?.status === 'paused';
  const totalPlanned = activeSession?.planned_duration_seconds || (sessionType === 'focus' ? 25 * 60 : sessionType === 'break' ? 5 * 60 : 15 * 60);
  const progressPercent = Math.min(100, Math.max(0, ((totalPlanned - secondsRemaining) / totalPlanned) * 100));

  return (
    <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-8 relative animate-in fade-in duration-150 bg-background">
      {/* Top Navigation Shortcuts */}
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReturnToWorkspace}
          className="text-muted-foreground hover:text-foreground text-xs"
        >
          <BookOpen className="w-3.5 h-3.5 mr-1.5" />
          Study Material
        </Button>
      </div>

      <div className="w-full max-w-lg flex flex-col items-center text-center space-y-6">
        {/* Active Study Task & Course Header */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono">
              {currentProject?.name || 'General Focus'}
            </Badge>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground font-mono">
              {activeUnit?.estimated_minutes || 25}m target
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            {activeUnit?.title || 'Open Focus Session'}
          </h1>
          {activeUnit?.page_start && (
            <p className="text-xs text-muted-foreground font-mono">
              Reading pp. {activeUnit.page_start}–{activeUnit.page_end}
            </p>
          )}
        </div>

        {/* State Status Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-medium tracking-wider text-muted-foreground">
            {sessionType === 'focus'
              ? 'Focus Interval'
              : sessionType === 'break'
              ? 'Short Break'
              : 'Long Break'}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs font-mono font-medium text-foreground flex items-center gap-1.5">
            {isRunning ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-pulse" />
                Active Focus
              </>
            ) : isPaused ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                Paused
              </>
            ) : (
              'Ready to Start'
            )}
          </span>
        </div>

        {/* Large Minimal Countdown Timer */}
        <div className="py-2">
          <div className="text-8xl sm:text-9xl font-mono font-semibold tracking-tighter text-foreground select-none">
            {formatTime(secondsRemaining)}
          </div>
        </div>

        {/* Minimal Progress Line */}
        <div className="w-64 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-foreground transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {!activeSession || activeSession.status === 'completed' || activeSession.status === 'abandoned' ? (
            <Button
              size="lg"
              onClick={() => {
                const mins = sessionType === 'focus' ? 25 : sessionType === 'break' ? 5 : 15;
                setSecondsRemaining(mins * 60);
                onStartSession(mins);
              }}
              className="px-8 text-sm h-11"
            >
              <Play className="w-4 h-4 fill-current mr-2" />
              Start Focus Session
            </Button>
          ) : (
            <>
              {isRunning ? (
                <Button variant="outline" size="md" onClick={onPauseSession} className="h-10 px-4">
                  <Pause className="w-3.5 h-3.5 fill-current mr-1.5" />
                  Pause
                </Button>
              ) : (
                <Button size="md" onClick={onResumeSession} className="h-10 px-4">
                  <Play className="w-3.5 h-3.5 fill-current mr-1.5" />
                  Resume
                </Button>
              )}

              <Button
                variant="secondary"
                size="md"
                onClick={() => onCompleteSession(false)}
                className="h-10 px-4"
              >
                Log Time
              </Button>

              <Button
                size="md"
                onClick={() => onCompleteSession(true)}
                className="h-10 px-4"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Complete Task
              </Button>
            </>
          )}
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center p-1 bg-secondary rounded-lg border border-border">
          <button
            onClick={() => {
              setSessionType('focus');
              if (!activeSession) setSecondsRemaining(25 * 60);
            }}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              sessionType === 'focus'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Focus (25m)
          </button>
          <button
            onClick={() => {
              setSessionType('break');
              if (!activeSession) setSecondsRemaining(5 * 60);
            }}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              sessionType === 'break'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => {
              setSessionType('long_break');
              if (!activeSession) setSecondsRemaining(15 * 60);
            }}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              sessionType === 'long_break'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Long Break (15m)
          </button>
        </div>
      </div>
    </div>
  );
};
