'use client';

/**
 * PDFEdit Studio — upload-first landing screen.
 *
 * Centered brand card with a drag & drop zone, a file picker button, a sample
 * document option, and the privacy line. Files never leave the browser.
 */
import { useRef, useState } from 'react';
import { AlertTriangle, FileText, Loader2, ShieldCheck, UploadCloud } from 'lucide-react';

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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-400">
            <FileText size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">PDFEdit Studio</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
            Edit PDFs right in your browser — add text, draw, highlight, sign, stamp and
            redact.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
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
            className={`rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
              dragging
                ? 'border-red-500 bg-red-500/10'
                : 'border-slate-700 bg-slate-950/60'
            }`}
          >
            <UploadCloud
              size={36}
              className={`mx-auto mb-3 ${dragging ? 'text-red-400' : 'text-slate-500'}`}
            />
            <p className="text-sm font-semibold text-slate-200">Drag &amp; drop your PDF here</p>
            <p className="my-3 text-xs text-slate-500">or</p>
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
              className="inline-flex h-11 items-center rounded-xl bg-red-600 px-6 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
            >
              Select PDF
            </button>
            <p className="mt-3 text-xs text-slate-500">PDF files up to ~100MB</p>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onSample}
              disabled={busy}
              className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline disabled:opacity-50"
            >
              Try a sample document
            </button>
          </div>

          {busy && status && (
            <div
              role="status"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300"
            >
              <Loader2 size={16} className="animate-spin text-red-400" />
              {status}
            </div>
          )}

          {shownError && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
            >
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              {shownError}
            </div>
          )}
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck size={14} className="shrink-0 text-red-500" />
          Files are processed in your browser — nothing is uploaded to our servers.
        </p>
      </div>
    </div>
  );
}
