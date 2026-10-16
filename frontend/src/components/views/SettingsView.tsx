'use client';

import React, { useState } from 'react';
import {
  Check,
  Clock,
  Database,
  RotateCw,
  User,
} from 'lucide-react';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/theme-toggle';

interface SettingsViewProps {
  onSyncBackend?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onSyncBackend }) => {
  const [dailyMinutes, setDailyMinutes] = useState(90);
  const [strategy, setStrategy] = useState('pomodoro_25_5');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoBreak, setAutoBreak] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSave = () => {
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12 max-w-4xl mx-auto space-y-10 animate-in fade-in duration-150">
      {/* Header */}
      <div className="border-b border-border/80 pb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize your study habits, focus intervals, appearance, and backend sync preferences.
        </p>
      </div>

      {/* Section 1: User Account */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-border flex items-center justify-center text-foreground font-semibold">
            <User className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Account Profile</h2>
            <p className="text-xs text-muted-foreground">Demo authenticated session</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Full Name</label>
            <input
              type="text"
              readOnly
              value="Demo Student"
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-border rounded-lg px-3 py-2 text-xs text-foreground cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Email Address</label>
            <input
              type="text"
              readOnly
              value="demo@studia.app"
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-border rounded-lg px-3 py-2 text-xs text-foreground cursor-not-allowed font-mono"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Study & Focus Preferences */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-6">
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-foreground" />
          <div>
            <h2 className="text-sm font-semibold text-foreground">Study & Focus Preferences</h2>
            <p className="text-xs text-muted-foreground">Configure timer pacing and daily workload goals</p>
          </div>
        </div>

        {/* Daily Time Budget */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground block">
            Daily Study Time Budget ({dailyMinutes} minutes / day)
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {[60, 90, 120, 180].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setDailyMinutes(mins)}
                className={`py-2 px-3 rounded-lg border text-xs font-mono font-medium transition-colors ${
                  dailyMinutes === mins
                    ? 'bg-foreground text-background border-foreground font-semibold'
                    : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>

        {/* Focus Strategy Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground block">
            Focus Strategy
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setStrategy('pomodoro_25_5')}
              className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
                strategy === 'pomodoro_25_5'
                  ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-400 dark:border-neutral-600'
                  : 'bg-card border-border hover:bg-neutral-50 dark:hover:bg-neutral-900/40'
              }`}
            >
              <h3 className="text-xs font-semibold text-foreground">Standard Pomodoro</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                25 min Focus · 5 min Short Break
              </p>
            </div>

            <div
              onClick={() => setStrategy('deep_work_50_10')}
              className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
                strategy === 'deep_work_50_10'
                  ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-400 dark:border-neutral-600'
                  : 'bg-card border-border hover:bg-neutral-50 dark:hover:bg-neutral-900/40'
              }`}
            >
              <h3 className="text-xs font-semibold text-foreground">Deep Work</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                50 min Focus · 10 min Break
              </p>
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-2 border-t border-border/80">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-foreground block">
                Session Completion Chime
              </span>
              <span className="text-[11px] text-muted-foreground">
                Play a subtle acoustic chime when a focus session completes
              </span>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                soundEnabled ? 'bg-foreground' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background transition-transform ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-foreground block">
                Auto-Advance to Break
              </span>
              <span className="text-[11px] text-muted-foreground">
                Automatically start the break countdown when a session ends
              </span>
            </div>
            <button
              onClick={() => setAutoBreak(!autoBreak)}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                autoBreak ? 'bg-foreground' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background transition-transform ${
                  autoBreak ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Appearance */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Visual Theme</h2>
            <p className="text-xs text-muted-foreground">Light monochrome is the default design standard</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Section 4: Backend API & Synchronization */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <div className="flex items-center gap-2.5">
          <Database className="w-4 h-4 text-foreground" />
          <div>
            <h2 className="text-sm font-semibold text-foreground">Backend & Data Synchronization</h2>
            <p className="text-xs text-muted-foreground">Connected to Laravel Sanctum REST API</p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-border">
            <span className="text-muted-foreground">API Host</span>
            <span className="font-mono text-foreground">http://127.0.0.1:8000/api</span>
          </div>
          <div className="flex justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-border">
            <span className="text-muted-foreground">Session Status</span>
            <span className="font-medium text-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-pulse" />
              Connected & Authoritative
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSyncBackend}
            className="text-xs"
          >
            <RotateCw className="w-3.5 h-3.5 mr-1.5" />
            Force Sync Now
          </Button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-2">
        <Button onClick={handleSave} className="min-w-32">
          {savedFeedback ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Saved
            </>
          ) : (
            'Save Preferences'
          )}
        </Button>
      </div>
    </div>
  );
};
