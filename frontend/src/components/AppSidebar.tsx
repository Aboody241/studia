'use client';

import React from 'react';
import Image from 'next/image';
import {
  BarChart3,
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  LayoutDashboard,
  Plus,
  Settings,
  Timer,
  User,
} from 'lucide-react';
import { StudyProject } from '@/lib/types';
import { ThemeToggle } from './ui/theme-toggle';

export type NavTab = 'overview' | 'courses' | 'planner' | 'focus' | 'insights' | 'settings' | 'workspace';

interface AppSidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  projects: StudyProject[];
  currentProject: StudyProject | null;
  onSelectProject: (p: StudyProject) => void;
  onOpenNewProject: () => void;
  activeSessionDuration?: string;
  isSessionRunning?: boolean;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentTab,
  onSelectTab,
  projects,
  currentProject,
  onSelectProject,
  onOpenNewProject,
  activeSessionDuration,
  isSessionRunning,
}) => {
  const primaryNavItems: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'courses', label: 'My Courses', icon: GraduationCap },
    { id: 'planner', label: 'Study Planner', icon: Calendar },
    { id: 'focus', label: 'Focus Mode', icon: Timer },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-60 border-r border-border bg-[#FAFAFA] dark:bg-[#121212] flex flex-col h-screen shrink-0 select-none transition-colors">
      {/* Brand Header with Logo */}
      <div className="p-4 border-b border-border/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Studia"
            width={24}
            height={24}
            className="h-6 w-auto object-contain dark:invert"
            priority
          />
          <span className="font-semibold text-sm tracking-tight text-foreground">
            Studia
          </span>
        </div>

        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-muted-foreground">
          v2.0
        </span>
      </div>

      {/* Course Selector Dropdown */}
      <div className="p-3 border-b border-border/80">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Active Course
          </span>
          <button
            onClick={onOpenNewProject}
            className="text-[11px] text-foreground hover:underline font-medium flex items-center gap-0.5"
            title="Create study course"
          >
            <Plus className="w-3 h-3" /> New
          </button>
        </div>

        <select
          value={currentProject?.id || ''}
          onChange={(e) => {
            const p = projects.find((item) => item.id === Number(e.target.value));
            if (p) onSelectProject(p);
          }}
          className="w-full bg-white dark:bg-neutral-900 text-foreground text-xs font-medium rounded-md px-2.5 py-1.5 border border-border focus:ring-1 focus:ring-ring focus:outline-none cursor-pointer"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* 6 Primary Navigation Items */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Main Menu
        </div>
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs transition-colors ${
                isActive
                  ? 'bg-[#EDEDED] dark:bg-neutral-800 text-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-foreground" />
                <span>{item.label}</span>
              </div>

              {item.id === 'focus' && isSessionRunning && (
                <span className="flex items-center gap-1 text-[11px] font-mono font-medium text-foreground bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.2 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-pulse" />
                  {activeSessionDuration || '25:00'}
                </span>
              )}
            </button>
          );
        })}

        {/* Contextual Study Workspace Shortcut */}
        <div className="pt-3">
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Study Environment
          </div>
          <button
            onClick={() => onSelectTab('workspace')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs transition-colors ${
              currentTab === 'workspace'
                ? 'bg-[#EDEDED] dark:bg-neutral-800 text-foreground font-semibold'
                : 'text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-foreground" />
              <span>Study Workspace</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">PDF</span>
          </button>
        </div>
      </nav>

      {/* Focus Timer Status Card in Sidebar (when session is running) */}
      {isSessionRunning && currentTab !== 'focus' && (
        <div className="mx-2 mb-2 p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-border text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-foreground flex items-center gap-1 text-[11px]">
              <Clock className="w-3 h-3" /> Focus Active
            </span>
            <span className="font-mono font-semibold text-foreground">{activeSessionDuration}</span>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {currentProject?.name}
          </p>
          <button
            onClick={() => onSelectTab('focus')}
            className="mt-2 w-full py-1 text-center bg-primary text-primary-foreground font-medium rounded text-[11px] hover:bg-neutral-800 transition-colors"
          >
            Open Focus Mode
          </button>
        </div>
      )}

      {/* User Account Snippet & Theme Toggle */}
      <div className="p-3 border-t border-border/80 flex items-center justify-between bg-transparent">
        <button
          onClick={() => onSelectTab('settings')}
          className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity"
          title="Account & Settings"
        >
          <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-foreground text-xs font-semibold">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="truncate max-w-[100px]">
            <p className="text-xs font-medium text-foreground truncate">Demo Student</p>
            <p className="text-[10px] text-muted-foreground truncate">demo@studia.app</p>
          </div>
        </button>

        <ThemeToggle />
      </div>
    </aside>
  );
};
