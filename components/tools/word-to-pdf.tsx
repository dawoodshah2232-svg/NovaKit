'use client';

import { useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';
import {
  WORD_FONT_OPTIONS,
  parseDocxStructure,
  renderPdf,
  type WordFontFamily,
} from './word-to-pdf-convert';

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB — larger documents risk running out of browser memory

const LIMITATIONS = [
  'Text only — images, charts, text boxes, headers, footers and footnotes are skipped.',
  'Tables are flattened: cell text is kept but the table grid and borders are lost.',
  'Font choice is limited to the options above. Your document\u2019s original fonts, sizes and colors can\u2019t be embedded by this browser converter.',
  'Only .docx files are supported \u2014 legacy .doc files are not.',
];

export function WordToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [fontFamily, setFontFamily] = useState<WordFontFamily>('helvetica');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function selectFile(next: File | null) {
    setError('');
    setStatus('');
    setProgress(0);
    if (!next) {
      setFile(null);
      return;
    }
    if (!next.name.toLowerCase().endsWith('.docx')) {
      setFile(null);
      setError(
        'Only .docx files are supported. Legacy .doc files use a different format and need a desktop or server converter.'
      );
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setFile(next);
  }

  async function convert() {
    if (!file || busy) return;
    setBusy(true);
    setError('');
    setStatus('');
    setProgress(2);

    try {
      if (file.size === 0) {
        throw new Error('This file is empty (0 bytes). Please choose a valid .docx file.');
      }
      if (file.size > MAX_FILE_BYTES) {
        throw new Error(
          `This file is ${(file.size / 1024 / 1024).toFixed(1)} MB \u2014 the browser converter supports files up to 50 MB. Try a smaller document.`
        );
      }

      setStatus('Reading the Word document\u2026');
      setProgress(10);
      await new Promise((resolve) => setTimeout(resolve, 0));

      let paragraphs;
      try {
        paragraphs = await parseDocxStructure(await file.arrayBuffer());
      } catch (parseError) {
        // JSZip throws generic errors for non-zip/corrupt files \u2014 translate to something actionable.
        const message = parseError instanceof Error ? parseError.message : '';
        if (/end of central directory|invalid signature|not a zip|corrupt/i.test(message)) {
          throw new Error(
            'This file doesn\u2019t look like a valid .docx document. It may be corrupted, renamed from another format, or password-protected.'
          );
        }
        throw parseError;
      }

      setStatus(`Parsed ${paragraphs.length} paragraphs \u2014 building PDF pages\u2026`);
      setProgress(35);
      await new Promise((resolve) => setTimeout(resolve, 0));

      const { bytes, pageCount, paragraphCount } = await renderPdf(paragraphs, fontFamily, (fraction) => {
        setProgress(35 + Math.round(fraction * 55));
      });

      setStatus('Saving your PDF\u2026');
      setProgress(97);
      await new Promise((resolve) => setTimeout(resolve, 0));

      saveAs(new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }), `${file.name.replace(/\.docx$/i, '')}.pdf`);

      setProgress(100);
      setStatus(`Done \u2014 converted ${paragraphCount} paragraphs into a ${pageCount}-page PDF.`);
      trackToolExecution('word-to-pdf', true);
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : 'Could not convert this document. Please try another file.');
      setStatus('');
      setProgress(0);
      trackToolExecution('word-to-pdf', false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-lg font-black text-slate-950 dark:text-white">Word to PDF</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Convert a DOCX document into a PDF in your browser. Keeps paragraphs, headings, bold, italic, underline,
          alignment and simple lists.
        </p>
      </div>

      <div>
        <label htmlFor="docx-input" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Select DOCX Document
        </label>
        <input
          id="docx-input"
          ref={inputRef}
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(event) => selectFile(event.target.files?.[0] || null)}
          className="block w-full rounded-xl border border-slate-300 p-3 text-sm dark:border-slate-700 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={busy}
        />
        {file && !busy && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {file.name} \u00b7 {(file.size / 1024).toFixed(0)} KB
          </p>
        )}
      </div>

      <fieldset disabled={busy}>
        <legend className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">PDF font</legend>
        <div className="grid grid-cols-3 gap-2">
          {WORD_FONT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFontFamily(option.value)}
              aria-pressed={fontFamily === option.value}
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fontFamily === option.value
                  ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300'
                  : 'border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Bold and italic are supported for every option. These are standard built-in PDF fonts \u2014 fonts from your
          Word file can\u2019t be embedded by a browser converter, so the output always uses the font you pick here.
        </p>
      </fieldset>

      <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">What this converter can\u2019t do</p>
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
              className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
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
        disabled={!file || busy}
        className="min-h-12 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {busy ? 'Converting\u2026' : 'Download PDF'}
      </button>
    </div>
  );
}
