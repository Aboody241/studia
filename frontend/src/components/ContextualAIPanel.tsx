'use client';

import React, { useState } from 'react';
import { Bot, Check, Copy, HelpCircle, Languages, Lightbulb, RefreshCw, Sparkles, X } from 'lucide-react';

interface ContextualAIPanelProps {
  selectedText: string;
  onClearSelection: () => void;
  isOpen?: boolean;
}

export const ContextualAIPanel: React.FC<ContextualAIPanelProps> = ({
  selectedText,
  onClearSelection,
  isOpen = true,
}) => {
  const [activeAction, setActiveAction] = useState<string>('explain');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | null>(null);
  const [isArabic, setIsArabic] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const actions = [
    { id: 'explain', label: 'Explain', icon: Lightbulb },
    { id: 'simplify', label: 'Simplify', icon: Sparkles },
    { id: 'translate', label: 'Arabic', icon: Languages },
    { id: 'quiz', label: 'Quick Quiz', icon: HelpCircle },
  ];

  const handleRunAction = (actionId: string) => {
    setActiveAction(actionId);
    setIsLoading(true);
    setIsArabic(actionId === 'translate');

    setTimeout(() => {
      let result = '';
      const sample = selectedText || 'Process state transitions and scheduling';

      if (actionId === 'explain') {
        result = `### Explanation\n\n"${sample.slice(0, 80)}..."\n\n**Core Idea:** In modern operating systems, processes alternate between CPU execution and waiting for external events (such as disk or network I/O). The OS scheduler uses this cycle to keep CPU utilization maximized.`;
      } else if (actionId === 'simplify') {
        result = `### In Plain Words\n\nThink of a process like a chef in a kitchen:\n- **Ready:** Standing by, knife in hand, waiting for a free stove.\n- **Running:** Actively cooking on the burner.\n- **Waiting:** Paused waiting for the oven timer or groceries to arrive.`;
      } else if (actionId === 'translate') {
        result = `المفهوم الأساسي: العملية (Process) هي برنامج قيد التنفيذ في نظام التشغيل. تنتقل العملية بين حالات متعددة: جديدة (New)، قيد التشغيل (Running)، في الانتظار (Waiting)، وجاهزة (Ready). هذا النموذج يسمح لنظام التشغيل بإدارة المهام بكفاءة دون تداخل.`;
      } else if (actionId === 'quiz') {
        result = `### Self-Check Question\n\n**Q:** What is the primary difference between the **Ready** state and the **Waiting** state in an operating system?\n\n*A:* A **Ready** process has all necessary resources and is only waiting for CPU time, while a **Waiting** process cannot execute until an external event (like I/O) finishes.`;
      }

      setResponse(result);
      setIsLoading(false);
    }, 350);
  };

  const handleCopy = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <aside className="w-72 border-l border-border bg-[#FAFAFA] dark:bg-[#121212] flex flex-col h-[calc(100vh)] shrink-0 select-none">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-3.5 h-3.5 text-foreground" />
          <h2 className="text-xs font-semibold text-foreground">
            Assistant
          </h2>
        </div>
        {selectedText && (
          <button
            onClick={onClearSelection}
            className="text-muted-foreground hover:text-foreground p-1 rounded"
            title="Clear selection"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Selected Context Box */}
        {selectedText ? (
          <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-border">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1">
              Selection:
            </span>
            <p className="text-xs text-foreground line-clamp-3 italic leading-relaxed">
              &ldquo;{selectedText}&rdquo;
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-white dark:bg-neutral-900 border border-border/80 text-center py-6">
            <Sparkles className="w-4 h-4 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Select text in the reader to explain, simplify, or translate.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5">
          {actions.map((act) => {
            const Icon = act.icon;
            const isCurrent = activeAction === act.id;
            return (
              <button
                key={act.id}
                onClick={() => handleRunAction(act.id)}
                className={`p-2 rounded-md border text-xs font-medium flex flex-col items-center gap-1 transition-colors ${
                  isCurrent
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-transparent shadow-xs'
                    : 'bg-white dark:bg-neutral-900 border-border text-muted-foreground hover:text-foreground hover:border-neutral-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>

        {/* Assistant Response Box */}
        {isLoading ? (
          <div className="p-5 rounded-lg bg-white dark:bg-neutral-900 border border-border flex flex-col items-center justify-center text-xs text-muted-foreground gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-foreground" />
            Processing...
          </div>
        ) : response ? (
          <div
            dir={isArabic ? 'rtl' : 'ltr'}
            className={`p-3.5 rounded-lg bg-white dark:bg-neutral-900 border border-border relative group text-xs text-foreground leading-relaxed whitespace-pre-line ${
              isArabic ? 'font-arabic text-[13px] leading-6' : ''
            }`}
          >
            <button
              onClick={handleCopy}
              className={`absolute top-2 ${
                isArabic ? 'left-2' : 'right-2'
              } p-1 rounded bg-secondary text-muted-foreground hover:text-foreground border border-border opacity-0 group-hover:opacity-100 transition-opacity`}
              title="Copy"
            >
              {copied ? <Check className="w-3 h-3 text-foreground" /> : <Copy className="w-3 h-3" />}
            </button>
            {response}
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-border bg-transparent text-[11px] text-muted-foreground text-center">
        Contextual AI · Concise study assistant
      </div>
    </aside>
  );
};
