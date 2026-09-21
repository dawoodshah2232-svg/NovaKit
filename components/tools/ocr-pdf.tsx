'use client';

import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';

if (typeof window !== 'undefined') pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const SUPPORTED_LANGUAGES = [
  { code: 'eng', name: 'English' },
  { code: 'spa', name: 'Spanish' },
  { code: 'fra', name: 'French' },
  { code: 'deu', name: 'German' },
];

export function OcrPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('eng');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState('');
  const workerRef = useRef<Awaited<ReturnType<typeof createWorker>> | null>(null);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate().catch(() => {});
      }
    };
  }, []);

  async function recognize() {
    if (!file) return;

    setBusy(true);
    setError('');
    setText('');
    setStatus('Loading PDF...');
    setProgress(0);
    setCurrentPage(0);
    setTotalPages(0);

    try {
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      setTotalPages(pdf.numPages);

      setStatus('Initializing OCR engine...');
      const worker = await createWorker(language, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round((m.progress || 0) * 100));
          }
        }
      });
      workerRef.current = worker;

      const pages: string[] = [];

      // Process one page at a time to manage memory
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        setCurrentPage(pageNumber);
        setStatus(`Recognizing page ${pageNumber} of ${pdf.numPages}...`);
        setProgress(0);

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not create canvas context');

        await page.render({ canvas, canvasContext: context, viewport }).promise;

        const result = await worker.recognize(canvas);
        const pageText = result.data.text.trim();

        if (pageText) {
          pages.push(`Page ${pageNumber}\n${pageText}`);
        }

        // Clean up canvas immediately
        canvas.width = 0;
        canvas.height = 0;
      }

      await worker.terminate();
      workerRef.current = null;

      const recognized = pages.join('\n\n');
      if (!recognized.trim()) {
        throw new Error('No text was recognized. Try a clearer scan or check the language setting.');
      }

      setText(recognized);
      setStatus(`Recognized text from ${pages.length} page${pages.length === 1 ? '' : 's'}.`);
      setProgress(100);
      trackToolExecution('ocr-pdf', true);
    } catch (ocrError) {
      const message = ocrError instanceof Error ? ocrError.message : 'OCR could not read this PDF.';
      setError(message);
      setStatus('');
      setProgress(0);
      trackToolExecution('ocr-pdf', false);

      if (workerRef.current) {
        await workerRef.current.terminate();
        workerRef.current = null;
      }
    } finally {
      setBusy(false);
      setCurrentPage(0);
    }
  }

  function cancelOcr() {
    if (workerRef.current && busy) {
      workerRef.current.terminate().catch(() => {});
      workerRef.current = null;
      setBusy(false);
      setStatus('OCR cancelled');
      setProgress(0);
      setCurrentPage(0);
    }
  }

  return (
    <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-lg font-black text-slate-950 dark:text-white">OCR PDF</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Recognize text in scanned PDF pages locally with browser OCR, then review and download the extracted text.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Select PDF
          </label>
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null);
              setText('');
              setError('');
              setStatus('');
              setProgress(0);
            }}
            className="block w-full rounded-xl border border-slate-300 p-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            disabled={busy}
          />
        </div>

        <div className="sm:w-40">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Language
          </label>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="w-full rounded-xl border border-slate-300 p-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            disabled={busy}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        OCR works best with clear, high-contrast scans. Currently supported languages: English, Spanish, French, and German. Files are processed locally in your browser and are not uploaded to our servers.
      </p>

      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          {error}
        </p>
      )}

      {status && (
        <div role="status" className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950">
          <p className="text-sm text-emerald-700 dark:text-emerald-300">{status}</p>
          {busy && totalPages > 0 && (
            <p className="text-xs text-emerald-600 mt-1 dark:text-emerald-400">
              Page {currentPage} of {totalPages} • {progress}%
            </p>
          )}
          {busy && progress > 0 && (
            <div className="mt-2 h-2 bg-emerald-200 rounded-full overflow-hidden dark:bg-emerald-900">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 dark:bg-emerald-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => void recognize()}
          disabled={!file || busy}
          className="flex-1 min-h-12 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {busy ? 'Recognizing...' : 'Recognize Text'}
        </button>

        {busy && (
          <button
            type="button"
            onClick={cancelOcr}
            className="min-h-12 px-5 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        )}
      </div>

      {text && (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Recognized Text (editable)
          </label>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            aria-label="Recognized OCR text"
            className="min-h-72 w-full rounded-xl border border-slate-300 p-4 text-sm leading-6 font-mono dark:border-slate-700 dark:bg-slate-950"
          />
          <button
            type="button"
            onClick={() =>
              saveAs(
                new Blob([text], { type: 'text/plain;charset=utf-8' }),
                `${file?.name.replace(/\.pdf$/i, '') || 'ocr-result'}.txt`
              )
            }
            className="w-full min-h-12 rounded-xl border-2 border-blue-600 px-5 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Download TXT
          </button>
        </div>
      )}
    </div>
  );
}
