'use client';

import React from 'react';
import { useDropzone, type Accept, type FileRejection } from 'react-dropzone';
import {
  UploadCloud,
  FileText,
  FileImage,
  FileUp,
  X,
  Plus,
  RefreshCw,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

export interface ToolFilePickerProps {
  /** react-dropzone accept map, e.g. { 'application/pdf': ['.pdf'] } */
  accept?: Accept;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  /** Currently attached files — drives empty vs. table state */
  files: File[];
  /** Called with newly dropped/selected files */
  onAdd: (files: File[]) => void;
  /** Remove the file at index */
  onRemove: (index: number) => void;
  /** Optional reorder support (up/down arrows render when provided) */
  onMove?: (index: number, direction: -1 | 1) => void;
  /** Called with dropzone rejections (wrong type, too many, too big) */
  onRejected?: (rejections: FileRejection[]) => void;
  emptyTitle?: string;
  emptySubtitle?: string;
  browseLabel?: string;
  /** Small hint line under the browse button, e.g. "PDF only · up to 100 MB" */
  hint?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Compact empty state (shorter) for secondary pickers */
  compact?: boolean;
  ariaLabel?: string;
  /** Extra per-row metadata, e.g. page counts: (file, index) => node */
  extraFileMeta?: (file: File, index: number) => React.ReactNode;
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(1))} ${units[i]}`;
}

function FileTypeIcon({ file }: { file: File }) {
  const t = file.type || '';
  const Icon = t.startsWith('image/') ? FileImage : t === 'application/pdf' ? FileText : FileUp;
  return <Icon className="h-5 w-5 shrink-0 text-[var(--pe-accent)]" aria-hidden="true" />;
}

const BROWSE_BUTTON_CLASS =
  'inline-flex min-h-[48px] cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-2xl bg-[var(--pe-accent)] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--pe-shadow-accent)] transition-all hover:bg-[var(--pe-accent-hover)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pe-accent)] focus-visible:ring-offset-2';

/**
 * Standardized file picker used across all PDFEdit tools.
 * Empty state: large dashed dropzone with an explicit red Browse button.
 * Attached state: compact file table (icon, name, size, reorder, remove)
 * plus an "Add more" / "Replace file" affordance.
 */
export function ToolFilePicker({
  accept,
  multiple = false,
  maxFiles,
  maxSize,
  files,
  onAdd,
  onRemove,
  onMove,
  onRejected,
  emptyTitle = 'Drag & drop files here',
  emptySubtitle = 'or choose files from your device',
  browseLabel = 'Browse files',
  hint,
  icon,
  disabled = false,
  compact = false,
  ariaLabel = 'Select files to upload',
  extraFileMeta,
}: ToolFilePickerProps) {
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept,
    multiple,
    maxFiles,
    maxSize,
    disabled,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) onAdd(acceptedFiles);
    },
    onDropRejected: (rejections) => {
      onRejected?.(rejections);
    },
  });

  const handleBrowse = (e: React.MouseEvent) => {
    e.stopPropagation();
    open();
  };

  // ---------- Attached state: compact file table ----------
  if (files.length > 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <ul className="divide-y divide-slate-100 dark:divide-slate-800" aria-label="Attached files">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--pe-accent-soft)]">
                <FileTypeIcon file={file} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white" title={file.name}>
                  {file.name}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold">{formatBytes(file.size)}</span>
                  {extraFileMeta?.(file, index)}
                </p>
              </div>
              {onMove && files.length > 1 && (
                <div className="flex shrink-0 items-center">
                  <button
                    type="button"
                    onClick={() => onMove(index, -1)}
                    disabled={disabled || index === 0}
                    aria-label={`Move ${file.name} up`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(index, 1)}
                    disabled={disabled || index === files.length - 1}
                    aria-label={`Move ${file.name} down`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => onRemove(index)}
                disabled={disabled}
                aria-label={`Remove ${file.name}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 dark:text-slate-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950/40">
          {/* Hidden dropzone input keeps "add more / replace" working via open() */}
          <div {...getRootProps()} className="sr-only">
            <input {...getInputProps()} />
          </div>
          <button
            type="button"
            onClick={handleBrowse}
            disabled={disabled}
            className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-[var(--pe-accent)] transition-colors hover:bg-[var(--pe-accent-soft)] disabled:opacity-40"
          >
            {multiple ? <Plus className="h-4 w-4" /> : <RefreshCw className="h-3.5 w-3.5" />}
            <span>{multiple ? 'Add more files' : 'Replace file'}</span>
          </button>
          {multiple && maxFiles ? (
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {files.length} of {maxFiles} files
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  // ---------- Empty state: large dropzone ----------
  return (
    <div
      {...getRootProps()}
      className={`group relative flex cursor-pointer touch-manipulation select-none flex-col items-center justify-center rounded-3xl border-2 border-dashed text-center transition-all duration-200 ${
        compact ? 'min-h-[220px] p-6 sm:p-8' : 'min-h-[220px] p-6 sm:min-h-[280px] sm:p-10'
      } ${
        isDragActive
          ? 'scale-[0.99] border-[var(--pe-accent)] bg-[var(--pe-accent-soft)] ring-4 ring-[var(--pe-accent-ring)]'
          : 'border-slate-200 bg-white hover:border-[var(--pe-accent)] hover:bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-[var(--pe-accent)]'
      } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
    >
      <input {...getInputProps()} aria-label={ariaLabel} />
      <div className="mx-auto max-w-md space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--pe-accent-soft)] text-[var(--pe-accent)] shadow-sm transition-transform duration-200 group-hover:scale-110">
          {icon ?? <UploadCloud className="h-8 w-8" aria-hidden="true" />}
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl dark:text-white">
            {isDragActive ? 'Drop your files here' : emptyTitle}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{emptySubtitle}</p>
        </div>
        <div>
          <button type="button" onClick={handleBrowse} disabled={disabled} className={BROWSE_BUTTON_CLASS}>
            <FileUp className="h-5 w-5" aria-hidden="true" />
            <span>{browseLabel}</span>
          </button>
        </div>
        {hint ? (
          <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

export { BROWSE_BUTTON_CLASS as toolBrowseButtonClass };
