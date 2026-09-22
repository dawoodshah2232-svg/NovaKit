'use client';

/**
 * PDFEdit Studio — upload-first landing screen.
 *
 * Premium brand hero with a drag & drop zone, file picker, sample document
 * option, and the privacy line. Theme-aware via --pe-* design tokens so it
 * follows the site's light/dark mode. Files never leave the browser.
 */
import { useRef, useState } from 'react';
import {
  AlertTriangle,
  FileText,
  Loader2,
  MousePointerClick,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from 'lucide-react';

interface UploadScreenProps {
  onFile: (file: File) => void;
  onSample: () => void;
  busy: boolean;
  status: string;
  error: string;
}

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
}

const HIGHLIGHTS = [
  { icon: MousePointerClick, label: 'Edit text in place' },
  { icon: Sparkles, label: 'Sign & stamp' },
  { icon: ShieldCheck, label: '100% private — files stay in your browser' },
];

export function UploadScreen({ onFile, onSample, busy, status, error }: UploadScreenProps) {
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptFile = (file: File | undefined | null) => {
    if (!file) return;
    if (!isPdf(file)) {
      setLocalError('Please choose a PDF file (.pdf).');
      return;
    }
    setLocalError('');
    onFile(file);
  };

  const shownError = localError || error;

  return (
    <div className="pe-preview relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--pe-bg)] px-4 py-12">
      {/* ambient brand glow */}
      <div
        aria-hidden="true"
        className="pe-pulse-soft pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, var(--pe-accent-soft), transparent)' }}
      />
      <div className="relative w-full max-w-xl">
        <div className="pe-fade-up mb-8 text-center">
          <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[var(--pe-border)] bg-[var(--pe-surface)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--pe-accent)] shadow-[var(--pe-shadow-sm)]">
            <FileText size={12} />
            Enterprise Studio
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--pe-text)] sm:text-4xl">
            PDFEdit Studio
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-[var(--pe-text-2)]">
            Edit PDFs right in your browser — add text, draw, highlight, sign,
            stamp and redact.
          </p>
        </div>

        <div className="pe-fade-up pe-fade-up-1 rounded-[var(--pe-radius-lg)] border border-[var(--pe-border)] bg-[var(--pe-surface)] p-6 shadow-[var(--pe-shadow-lg)] sm:p-8">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              acceptFile(e.dataTransfer.files?.[0]);
            }}
            className={`rounded-[var(--pe-radius-md)] border-2 border-dashed px-6 py-10 text-center transition-all ${
              dragging
                ? 'scale-[1.01] border-[var(--pe-focus)] bg-[var(--pe-accent-soft)]'
                : 'border-[var(--pe-border-strong)] bg-[var(--pe-surface-2)]'
            }`}
          >
            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
                dragging
                  ? 'bg-[var(--pe-accent)] text-[var(--pe-accent-ink)]'
                  : 'bg-[var(--pe-accent-soft)] text-[var(--pe-accent)]'
              }`}
            >
              <UploadCloud size={28} />
            </div>
            <p className="text-[15px] font-semibold text-[var(--pe-text)]">
              Drag &amp; drop your PDF here
            </p>
            <p className="my-3 text-xs text-[var(--pe-text-3)]">or</p>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              aria-label="Select a PDF file"
              disabled={busy}
              onChange={(e) => acceptFile(e.target.files?.[0])}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex h-12 items-center rounded-[var(--pe-radius-md)] bg-[var(--pe-accent)] px-8 text-sm font-bold text-[var(--pe-accent-ink)] shadow-[var(--pe-shadow-accent)] transition hover:bg-[var(--pe-accent-hover)] disabled:opacity-50"
            >
              {busy ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
              Select PDF
            </button>
            <p className="mt-3 text-xs text-[var(--pe-text-3)]">PDF files up to ~100MB</p>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onSample}
              disabled={busy}
              className="text-sm font-semibold text-[var(--pe-accent)] hover:text-[var(--pe-accent-hover)] hover:underline disabled:opacity-50"
            >
              Try a sample document
            </button>
          </div>

          {busy && status && (
            <div
              role="status"
              className="mt-4 flex items-center justify-center gap-2 rounded-[var(--pe-radius-md)] border border-[var(--pe-border)] bg-[var(--pe-bg)] px-4 py-3 text-sm text-[var(--pe-text-2)]"
            >
              <Loader2 size={16} className="animate-spin text-[var(--pe-accent)]" />
              {status}
            </div>
          )}

          {shownError && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-[var(--pe-radius-md)] border border-[var(--pe-danger)] bg-[var(--pe-danger-soft)] px-4 py-3 text-sm text-[var(--pe-danger)]"
            >
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              {shownError}
            </div>
          )}
        </div>

        <ul className="pe-fade-up pe-fade-up-2 mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {HIGHLIGHTS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-1.5 text-xs font-medium text-[var(--pe-text-2)]"
            >
              <Icon size={14} className="shrink-0 text-[var(--pe-accent)]" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
