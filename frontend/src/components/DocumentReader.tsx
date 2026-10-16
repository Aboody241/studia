'use client';

import React, { useEffect, useState } from 'react';
import { Material, StudyUnit } from '@/lib/types';
import { api } from '@/lib/api';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  PanelLeft,
  PanelRight,
  RotateCcw,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Button } from './ui/button';

interface DocumentReaderProps {
  material: Material | null;
  activeUnit: StudyUnit | null;
  onTextSelected: (selectedText: string) => void;
  onUploadPDF?: (file: File) => void;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
}

export const DocumentReader: React.FC<DocumentReaderProps> = ({
  material,
  activeUnit,
  onTextSelected,
  leftPanelOpen,
  rightPanelOpen,
  onToggleLeftPanel,
  onToggleRightPanel,
}) => {
  const [pageOffset, setPageOffset] = useState<number>(0);
  const basePage = activeUnit?.page_start || 1;
  const currentPage = Math.max(1, basePage + pageOffset);

  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState<'pdf' | 'text'>('pdf');
  const [floatingAction, setFloatingAction] = useState<{ x: number; y: number; text: string } | null>(null);

  const [pdfState, setPdfState] = useState<{
    materialId: number | null;
    url: string | null;
    loading: boolean;
    error: string | null;
  }>({
    materialId: null,
    url: null,
    loading: false,
    error: null,
  });

  const isLoaded = pdfState.materialId === material?.id;
  const pdfBlobUrl = isLoaded ? pdfState.url : null;
  const pdfLoading = Boolean(material?.id && !isLoaded && !pdfState.error);
  const pdfError = isLoaded ? pdfState.error : null;

  // Fetch real PDF as blob and generate Object URL
  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (!material?.id) return;

    api.downloadMaterialBlob(material.id)
      .then((blob) => {
        if (!active) return;
        createdUrl = URL.createObjectURL(blob);
        setPdfState({
          materialId: material.id,
          url: createdUrl,
          loading: false,
          error: null,
        });
      })
      .catch((err) => {
        if (!active) return;
        console.warn('PDF stream offline, switching to reader mode:', err);
        setPdfState({
          materialId: material.id,
          url: null,
          loading: false,
          error: 'PDF binary stream offline. Showing reader view.',
        });
      });

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [material?.id]);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 5) {
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();
      if (rect) {
        setFloatingAction({
          x: rect.left + rect.width / 2,
          y: rect.top - 40,
          text,
        });
      }
    } else {
      setFloatingAction(null);
    }
  };

  const handleTriggerAI = () => {
    if (floatingAction) {
      onTextSelected(floatingAction.text);
      setFloatingAction(null);
    }
  };

  return (
    <main
      className="flex-1 flex flex-col h-[calc(100vh)] bg-neutral-50 dark:bg-neutral-950 overflow-hidden relative"
      onMouseUp={handleMouseUp}
    >
      {/* Document Workspace Top Toolbar */}
      <div className="h-11 border-b border-border bg-background px-4 flex items-center justify-between text-xs text-muted-foreground select-none">
        {/* Left: Panel toggles & Document Title */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleLeftPanel}
            title={leftPanelOpen ? 'Collapse study plan' : 'Expand study plan'}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <PanelLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2 max-w-xs sm:max-w-sm truncate">
            <FileText className="w-3.5 h-3.5 text-foreground shrink-0" />
            <span className="font-semibold text-foreground truncate">
              {material?.title || 'Course Material'}
            </span>
          </div>

          {activeUnit && (
            <span className="hidden lg:flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 rounded text-[11px] text-muted-foreground border border-border">
              <span>Section:</span>
              <strong className="text-foreground font-medium truncate max-w-[180px]">
                {activeUnit.title}
              </strong>
            </span>
          )}
        </div>

        {/* Center: Mode Switcher (PDF Viewer vs Distilled Reader) */}
        <div className="hidden sm:flex items-center p-0.5 bg-secondary rounded-lg border border-border text-xs">
          <button
            onClick={() => setViewMode('pdf')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
              viewMode === 'pdf'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="w-3 h-3" />
            PDF Canvas
          </button>
          <button
            onClick={() => setViewMode('text')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
              viewMode === 'text'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            Reader View
          </button>
        </div>

        {/* Right: Zoom, Page Controls & Panel Toggle */}
        <div className="flex items-center gap-2">
          {/* Page Selector */}
          <div className="flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-900 rounded-md p-0.5 border border-border">
            <button
              onClick={() => setPageOffset((prev) => Math.max(1 - basePage, prev - 1))}
              className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded text-foreground transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="px-1.5 text-xs font-mono text-foreground font-medium">
              p. {currentPage} / {material?.page_count || 45}
            </span>
            <button
              onClick={() => setPageOffset((prev) => prev + 1)}
              className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded text-foreground transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Independent Zoom (for text mode) */}
          <div className="hidden md:flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-900 rounded-md p-0.5 border border-border">
            <button
              onClick={() => setZoom((z) => Math.max(70, z - 10))}
              className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded text-foreground transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="px-1.5 text-[11px] font-mono text-foreground font-medium">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(150, z + 10))}
              className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded text-foreground transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          {/* Download button if blob exists */}
          {pdfBlobUrl && (
            <a
              href={pdfBlobUrl}
              download={material?.original_file_name || 'document.pdf'}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              title="Download original PDF"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Right Panel Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleRightPanel}
            title={rightPanelOpen ? 'Collapse assistant panel' : 'Expand assistant panel'}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <PanelRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Floating Contextual AI Prompt Pill upon text selection */}
      {floatingAction && (
        <div
          style={{
            position: 'fixed',
            left: `${floatingAction.x}px`,
            top: `${floatingAction.y}px`,
            transform: 'translateX(-50%)',
          }}
          className="z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            onClick={handleTriggerAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-neutral-800 text-xs font-medium shadow-md border border-neutral-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ask Studia AI
          </button>
        </div>
      )}

      {/* Main Document Reading Canvas */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {/* MODE 1: REAL PDF VIEWER (Iframe / Native PDF Reader) */}
        {viewMode === 'pdf' ? (
          pdfLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
              <Loader2 className="w-8 h-8 text-foreground animate-spin" />
              <p className="text-xs font-medium text-foreground">Loading PDF Document...</p>
              <p className="text-[11px] text-muted-foreground">{material?.original_file_name}</p>
            </div>
          ) : pdfBlobUrl ? (
            <div className="flex-1 w-full h-full p-2 bg-neutral-100 dark:bg-neutral-900">
              <iframe
                src={`${pdfBlobUrl}#page=${currentPage}`}
                className="w-full h-full rounded-lg border border-border bg-white shadow-xs"
                title={material?.title || 'PDF Document'}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-border flex items-center justify-center text-foreground">
                <FileText className="w-6 h-6" />
              </div>
              <div className="max-w-md">
                <h3 className="text-sm font-semibold text-foreground">
                  {pdfError || 'No PDF Stream Available'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  You can view the distilled textbook reading notes below or upload a PDF in My Courses.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => setViewMode('text')}>
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                  Open Reader View
                </Button>
                {material?.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPdfState({
                        materialId: material.id,
                        url: null,
                        loading: true,
                        error: null,
                      });
                      api.downloadMaterialBlob(material.id)
                        .then((blob) => {
                          const url = URL.createObjectURL(blob);
                          setPdfState({
                            materialId: material.id,
                            url,
                            loading: false,
                            error: null,
                          });
                        })
                        .catch((err) => {
                          setPdfState({
                            materialId: material.id,
                            url: null,
                            loading: false,
                            error: err instanceof Error ? err.message : 'Failed to reload PDF stream',
                          });
                        });
                    }}
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Retry
                  </Button>
                )}
              </div>
            </div>
          )
        ) : (
          /* MODE 2: DISTILLED READER VIEW (High-clarity typography with text selection for AI) */
          <div className="flex-1 overflow-y-auto p-6 md:p-12 flex justify-center">
            <div
              style={{ width: `${Math.round(740 * (zoom / 100))}px` }}
              className="bg-card border border-border/80 rounded-lg p-10 md:p-14 text-foreground leading-relaxed shadow-xs transition-all self-start my-auto"
            >
              <div className="border-b border-border/80 pb-4 mb-6 flex justify-between items-center text-xs text-muted-foreground">
                <span>{material?.title || 'Academic Reading'}</span>
                <span>Page {currentPage}</span>
              </div>

              <h1 className="text-2xl font-semibold text-foreground mb-4 tracking-tight">
                {activeUnit ? activeUnit.title : '3.1 Process Concept and Multitasking'}
              </h1>

              <p className="text-foreground/90 text-sm mb-5 leading-7">
                A <strong>process</strong> is fundamentally a program in execution. The execution of a process must progress in a sequential fashion. Although a program is a passive entity—such as a file containing a list of instructions stored on disk—a process is an active entity, with a program counter specifying the next instruction to execute and a set of associated resources.
              </p>

              <div className="my-6 p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-border text-xs text-foreground">
                <strong className="block mb-1 font-semibold text-foreground">Key Concept: Process Control Block (PCB)</strong>
                Each process is represented in the operating system by a Process Control Block (PCB)—also called a task control block. It contains key information including process state, program counter, CPU registers, CPU scheduling parameters, memory-management information, and I/O status.
              </div>

              <h2 className="text-base font-semibold text-foreground mt-8 mb-3">
                Process State Transitions
              </h2>

              <p className="text-foreground/90 text-sm mb-5 leading-7">
                As a process executes, it changes state according to operating system scheduling and hardware interrupts. The general states of a process are:
              </p>

              <ul className="list-disc pl-5 text-sm text-foreground/90 space-y-2 mb-6">
                <li>
                  <strong>New:</strong> The process is being created and resources are allocated.
                </li>
                <li>
                  <strong>Running:</strong> Instructions are being actively executed on the CPU core.
                </li>
                <li>
                  <strong>Waiting (Blocked):</strong> The process is waiting for some event to occur (such as an I/O completion or reception of a signal).
                </li>
                <li>
                  <strong>Ready:</strong> The process is waiting to be assigned to a processor core.
                </li>
                <li>
                  <strong>Terminated:</strong> The process has finished execution and system resources are reclaimed.
                </li>
              </ul>

              <div className="mt-10 p-3 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-border text-xs text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-foreground shrink-0" />
                <span>
                  Select any passage above to trigger the Contextual AI Assistant for summaries, flashcards, or explanation.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
