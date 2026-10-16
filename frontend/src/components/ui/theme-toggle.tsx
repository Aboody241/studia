'use client';

import React, { useSyncExternalStore } from 'react';
import { Laptop, Moon, Sun } from 'lucide-react';

function applyTheme(t: 'light' | 'dark' | 'system') {
  if (typeof window === 'undefined') return;
  const isDark =
    t === 'dark' ||
    (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('studia-theme-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('studia-theme-change', callback);
  };
}

function getSnapshot(): 'light' | 'dark' | 'system' {
  return (localStorage.getItem('studia_theme') as 'light' | 'dark' | 'system') || 'light';
}

function getServerSnapshot(): 'light' | 'dark' | 'system' {
  return 'light';
}

export const ThemeToggle: React.FC = () => {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleSelect = (newTheme: 'light' | 'dark' | 'system') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('studia_theme', newTheme);
      window.dispatchEvent(new Event('studia-theme-change'));
      applyTheme(newTheme);
    }
  };

  return (
    <div className="flex items-center p-1 bg-muted rounded-lg border border-border">
      <button
        onClick={() => handleSelect('light')}
        className={`p-1.5 rounded-md transition-all ${
          theme === 'light'
            ? 'bg-card text-foreground shadow-xs font-medium'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Light theme"
        aria-label="Light theme"
      >
        <Sun className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => handleSelect('dark')}
        className={`p-1.5 rounded-md transition-all ${
          theme === 'dark'
            ? 'bg-card text-foreground shadow-xs font-medium'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Dark theme"
        aria-label="Dark theme"
      >
        <Moon className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => handleSelect('system')}
        className={`p-1.5 rounded-md transition-all ${
          theme === 'system'
            ? 'bg-card text-foreground shadow-xs font-medium'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="System preference"
        aria-label="System preference"
      >
        <Laptop className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
