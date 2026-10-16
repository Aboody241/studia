'use client';

import React, { useEffect, useState } from 'react';
import { FocusSession, StudyUnit } from '@/lib/types';
import confetti from 'canvas-confetti';
import { CheckCircle2, Maximize2, Pause, Play, Timer } from 'lucide-react';
import { Button } from './ui/button';

interface FocusTimerBarProps {
  activeSession: FocusSession | null;
  activeUnit: StudyUnit | null;
  onStart: (durationMinutes: number) => void;
  onPause: () => void;
  onResume: () => void;
  onComplete: (markUnitComplete: boolean) => void;
  onExpandToFullTimer?: () => void;
}

export const FocusTimerBar: React.FC<FocusTimerBarProps> = ({
  activeSession,
  activeUnit,
  onStart,
  onPause,
  onResume,
  onComplete,
  onExpandToFullTimer,
}) => {
  const calculateRemaining = () => {
    if (!activeSession) return 25 * 60;
    const planned = activeSession.planned_duration_seconds;
    let focusSecs = activeSession.actual_focus_seconds || 0;

    if (activeSession.status === 'running') {
      const started = new Date(activeSession.started_at).getTime();
      const totalElapsed = Math.floor((Date.now() - started) / 1000);
      focusSecs = Math.max(0, totalElapsed - (activeSession.accumulated_paused_seconds || 0));
    }

    return Math.max(0, planned - focusSecs);
  };

  const [secondsRemaining, setSecondsRemaining] = useState<number>(calculateRemaining);

  // Synchronize local ticking when running
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

  const handleFinish = (markComplete: boolean) => {
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.9 },
    });
    onComplete(markComplete);
  };

  const isRunning = activeSession?.status === 'running';
  const isPaused = activeSession?.status === 'paused';
  const plannedSeconds = activeSession?.planned_duration_seconds || 25 * 60;
  const progressPercent = Math.min(100, Math.max(0, ((plannedSeconds - secondsRemaining) / plannedSeconds) * 100));

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 select-none animate-in fade-in slide-in-from-bottom-3 duration-150">
      <div className="rounded-xl px-4 py-2.5 flex items-center gap-4 border border-border bg-card/95 backdrop-blur-md shadow-sm text-card-foreground">
        {/* Task Indicator */}
        <div className="flex items-center gap-2.5 pr-4 border-r border-border max-w-xs">
          <div className="w-7 h-7 rounded-md bg-secondary text-foreground flex items-center justify-center shrink-0">
            <Timer className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <span className="text-[10px] uppercase font-medium tracking-wider text-muted-foreground block leading-tight">
              {isRunning ? 'Focusing' : isPaused ? 'Paused' : 'Pomodoro (25m)'}
            </span>
            <span className="text-xs font-semibold text-foreground truncate block">
              {activeUnit ? activeUnit.title : 'Focus Session'}
            </span>
          </div>
        </div>

        {/* Digital Clock & Linear Progress */}
        <div className="flex items-center gap-3">
          <div className="text-lg font-mono font-semibold text-foreground tracking-tight">
            {formatTime(secondsRemaining)}
          </div>

          <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 pl-1">
          {!activeSession || activeSession.status === 'completed' || activeSession.status === 'abandoned' ? (
            <Button
              size="sm"
              onClick={() => {
                setSecondsRemaining(25 * 60);
                onStart(25);
              }}
              className="h-7 text-xs px-2.5"
            >
              <Play className="w-3 h-3 fill-current mr-1" />
              Start Focus
            </Button>
          ) : (
            <>
              {isRunning ? (
                <Button variant="outline" size="sm" onClick={onPause} title="Pause timer" className="h-7 px-2">
                  <Pause className="w-3 h-3 fill-current" />
                </Button>
              ) : (
                <Button size="sm" onClick={onResume} title="Resume timer" className="h-7 px-2">
                  <Play className="w-3 h-3 fill-current" />
                </Button>
              )}

              <Button variant="secondary" size="sm" onClick={() => handleFinish(false)} className="h-7 px-2 text-xs">
                Log
              </Button>

              <Button size="sm" onClick={() => handleFinish(true)} className="h-7 px-2.5 text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Done
              </Button>
            </>
          )}

          {onExpandToFullTimer && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onExpandToFullTimer}
              title="Expand to full timer view"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <Maximize2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
