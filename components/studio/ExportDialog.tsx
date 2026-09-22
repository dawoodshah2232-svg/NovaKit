'use client';

/**
 * PDFEdit Studio — export modal.
 *
 * Stages: options → working → done | error. Standard export keeps the document
 * editable; "Flatten & Export" merges overlays and form fields into static
 * page content.
 */
import { useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Download,
  FilePlus2,
  Loader2,
  Pencil,
  TriangleAlert,
  X,
} from 'lucide-react';
import { useFocusTrap } from './use-focus-trap';

export interface ExportDialogProps {
  open: boolean;
  stage: 'options' | 'working' | 'done' | 'error';
  progress: string;
  result: { fileName: string; sizeBytes: number; pageCount: number } | null;
  error: string;
  /** when true, show the overlay-only redaction notice in the options step */
  hasRedactions: boolean;
  onClose: () => void;
  onExport: (flatten: boolean) => void;
  onDownload: () => void;
  onContinue: () => void;
  onNewFile: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ExportDialog({
  open,
  stage,
  progress,
  result,
  error,
  hasRedactions,
  onClose,
  onExport,
  onDownload,
  onContinue,
  onNewFile,
}: ExportDialogProps) {
  const canClose = stage !== 'working';
  const dialogRef = useRef<HTMLDivElement>(null);

  // Keep keyboard focus inside the modal while open; restore on close.
  useFocusTrap(dialogRef, open);

  useEffect(() => {
    if (!open || !canClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, canClose, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={() => {
        if (canClose) onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Export PDF"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-100">Export PDF</h2>
          <button
            type="button"
            title="Close"
            aria-label="Close export dialog"
            onClick={onClose}
            disabled={!canClose}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-40"
          >
            <X size={17} />
          </button>
        </div>

        {stage === 'options' && (
          <div>
            <p className="mb-5 text-sm leading-6 text-slate-400">
              Your edits are drawn onto a new PDF file. The original document stays untouched.
            </p>
            <button
              type="button"
              onClick={() => onExport(false)}
              className="h-12 w-full rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              Export PDF
            </button>
            <p className="mb-4 mt-1.5 text-center text-xs text-slate-500">Standard export</p>
            <button
              type="button"
              onClick={() => onExport(true)}
              className="h-12 w-full rounded-xl border border-slate-700 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Flatten &amp; Export
            </button>
            <p className="mt-1.5 text-center text-xs leading-5 text-slate-500">
              Merges all overlays and form fields into static page content.
            </p>
            {hasRedactions && (
              <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] leading-5 text-amber-300">
                Redactions are opaque overlays: they cover content visually, but the underlying
                text may still be extractable from the exported PDF.
              </p>
            )}
          </div>
        )}

        {stage === 'working' && (
          <div className="flex flex-col items-center py-8 text-center">
            <Loader2 size={32} className="mb-4 animate-spin text-red-400" />
            <p className="text-sm font-medium text-slate-200">Exporting your PDF…</p>
            {progress && <p className="mt-1 text-xs text-slate-500">{progress}</p>}
          </div>
        )}

        {stage === 'done' && result && (
          <div>
            <div className="flex flex-col items-center py-2 text-center">
              <CheckCircle2 size={40} className="mb-3 text-emerald-400" />
              <p className="text-sm font-semibold text-slate-100">Export complete</p>
              <p className="mt-1 max-w-full truncate text-xs text-slate-500" title={result.fileName}>
                {result.fileName}
              </p>
              <p className="mt-2 text-xs tabular-nums text-slate-400">
                {formatSize(result.sizeBytes)} · {result.pageCount}{' '}
                {result.pageCount === 1 ? 'page' : 'pages'}
              </p>
            </div>
            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={onDownload}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                <Download size={16} />
                Download
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onContinue}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                >
                  <Pencil size={15} />
                  Continue Editing
                </button>
                <button
                  type="button"
                  onClick={onNewFile}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                >
                  <FilePlus2 size={15} />
                  Edit Another PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {stage === 'error' && (
          <div>
            <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
              <TriangleAlert size={18} className="mt-0.5 shrink-0 text-rose-400" />
              <div>
                <p className="text-sm font-semibold text-rose-200">Export failed</p>
                <p className="mt-1 text-xs leading-5 text-rose-300/90">
                  {error || 'Something went wrong while exporting the PDF.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 h-11 w-full rounded-xl border border-slate-700 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
