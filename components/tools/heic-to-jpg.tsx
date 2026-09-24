'use client';
import { brandedFileName } from '@/lib/branded-filename';

import { useState } from 'react';
import { ToolFilePicker } from '@/components/tool-file-picker';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB — HEIC decoding is memory-heavy
const JPEG_QUALITY = 0.92;

const LIMITATIONS = [
  'Animated HEIC photos convert to a single still image (the first frame).',
  'Output is JPEG at 92% quality — a visually lossless balance, not a pixel-perfect copy.',
  'Camera metadata (EXIF) is not carried over to the converted files.',
  'Very large panoramas or bursts may exhaust the browser tab’s memory on low-end devices.',
];

type OutputMode = 'jpg' | 'pdf';

function isHeicFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith('.heic') ||
    name.endsWith('.heif') ||
    file.type === 'image/heic' ||
    file.type === 'image/heif'
  );
}

export function HeicToJpg() {
  const [files, setFiles] = useState<File[]>([]);
  const [outputMode, setOutputMode] = useState<OutputMode>('jpg');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  function addFiles(picked: File[]) {
    setError('');
    setStatus('');
    setProgress(0);
    const valid = picked.filter(isHeicFile);
    if (valid.length < picked.length) {
      setError('Only .heic / .heif files are supported here. Other image types can use the Image to PDF tool.');
    }
    const oversized = valid.filter((f) => f.size > MAX_FILE_BYTES);
    if (oversized.length > 0) {
      setError(
        `${oversized.length} file${oversized.length === 1 ? ' was' : 's were'} skipped — over the 50 MB per-file limit.`
      );
    }
    const usable = valid.filter((f) => f.size <= MAX_FILE_BYTES);
    if (usable.length > 0) setFiles((prev) => [...prev, ...usable]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError('');
    setStatus('');
  }

  async function convert() {
    if (files.length === 0 || busy) return;
    setBusy(true);
    setError('');
    setStatus('');
    setProgress(2);

    try {
      // Loaded on demand so the HEIC decoder (~WASM) never weighs down other pages.
      const { default: heic2any } = await import('heic2any');

      const jpegs: { name: string; bytes: Uint8Array }[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setStatus(`Converting ${file.name} (${i + 1} of ${files.length})…`);
        setProgress(2 + Math.round((i / files.length) * 60));
        await new Promise((resolve) => setTimeout(resolve, 0));

        let result: Blob | Blob[];
        try {
          result = await heic2any({ blob: file, toType: 'image/jpeg', quality: JPEG_QUALITY });
        } catch (decodeError) {
          const message = decodeError instanceof Error ? decodeError.message : '';
          throw new Error(
            `Could not decode ${file.name} — it may be corrupted or use an unsupported HEIC variant. ${message}`
          );
        }
        const blob = Array.isArray(result) ? result[0] : result;
        if (!blob) throw new Error(`Could not decode ${file.name}.`);
        jpegs.push({ name: file.name.replace(/\.(heic|heif)$/i, ''), bytes: new Uint8Array(await blob.arrayBuffer()) });
      }

      if (outputMode === 'jpg') {
        setStatus('Saving JPG files…');
        setProgress(85);
        for (const jpeg of jpegs) {
          saveAs(new Blob([jpeg.bytes as unknown as BlobPart], { type: 'image/jpeg' }), brandedFileName(jpeg.name, 'jpg'));
        }
        setProgress(100);
        setStatus(`Done — converted ${jpegs.length} photo${jpegs.length === 1 ? '' : 's'} to JPG.`);
      } else {
        setStatus('Building PDF pages…');
        setProgress(80);
        const pdfDoc = await PDFDocument.create();
        for (const jpeg of jpegs) {
          const embedded = await pdfDoc.embedJpg(jpeg.bytes);
          const page = pdfDoc.addPage([embedded.width, embedded.height]);
          page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
        }
        pdfDoc.setTitle('HEIC Photos Converted to PDF');
        pdfDoc.setProducer('PDFEdit Studio (pdfedit.website)');
        pdfDoc.setCreator('PDFEdit Studio Client-Side Suite');
        const pdfBytes = await pdfDoc.save();
        saveAs(new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }), brandedFileName(`heic-photos-${Date.now().toString().slice(-6)}`, 'pdf'));
        setProgress(100);
        setStatus(`Done — combined ${jpegs.length} photo${jpegs.length === 1 ? '' : 's'} into one PDF.`);
      }
      trackToolExecution('heic-to-jpg', true);
    } catch (conversionError) {
      setError(
        conversionError instanceof Error
          ? conversionError.message
          : 'Could not convert these files. Please try other HEIC photos.'
      );
      setStatus('');
      setProgress(0);
      trackToolExecution('heic-to-jpg', false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-lg font-black text-slate-950 dark:text-white">HEIC to JPG</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Convert iPhone HEIC photos to JPG images — or combine them into one PDF — entirely in your browser.
          Your photos are decoded on your device and never uploaded anywhere.
        </p>
      </div>

      <ToolFilePicker
        accept={{ 'image/heic': ['.heic'], 'image/heif': ['.heif'] }}
        multiple
        files={files}
        onAdd={addFiles}
        onRemove={removeFile}
        emptyTitle="Drag & drop your HEIC photos here"
        browseLabel="Browse HEIC"
        hint="HEIC / HEIF only · up to 50 MB per photo"
        disabled={busy}
        ariaLabel="Select HEIC photos to convert"
      />

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Output format
        </p>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Output format">
          {(
            [
              ['jpg', 'JPG images', 'One JPG download per photo'],
              ['pdf', 'Single PDF', 'All photos in one PDF document'],
            ] as [OutputMode, string, string][]
          ).map(([mode, label, hint]) => (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={outputMode === mode}
              disabled={busy}
              onClick={() => setOutputMode(mode)}
              className={`rounded-xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--pe-accent)] ${
                outputMode === mode
                  ? 'border-[var(--pe-accent)] bg-[var(--pe-accent)]/5'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              } disabled:opacity-50`}
            >
              <span className="block text-sm font-bold text-slate-900 dark:text-white">{label}</span>
              <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">What this converter can’t do</p>
        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {LIMITATIONS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          {error}
        </p>
      )}

      {busy && (
        <div className="space-y-2">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label="Conversion progress"
            className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
          >
            <div
              className="h-full rounded-full bg-[var(--pe-accent)] transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p role="status" className="text-sm text-slate-600 dark:text-slate-300">
            {status} <span className="font-semibold tabular-nums">{progress}%</span>
          </p>
        </div>
      )}

      {!busy && status && (
        <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {status}
        </p>
      )}

      <button
        type="button"
        onClick={() => void convert()}
        disabled={files.length === 0 || busy}
        className="min-h-12 w-full rounded-xl bg-[var(--pe-accent)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--pe-accent-hover)] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--pe-accent)]"
      >
        {busy ? 'Converting…' : outputMode === 'jpg' ? `Convert to JPG (${files.length})` : `Convert to PDF (${files.length})`}
      </button>
    </div>
  );
}
