'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';
import {
  Scissors,
  FileText,
  ShieldCheck,
  UploadCloud,
  AlertCircle,
  FileCheck2,
  Check,
  RefreshCw,
  Archive,
} from 'lucide-react';

interface LoadedPdf {
  file: File;
  name: string;
  size: number;
  pageCount: number;
  arrayBuffer: ArrayBuffer;
}

type SplitMode = 'range' | 'all';

// Helper to format byte sizes
function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Parse custom range strings (e.g. "1-3, 5, 7-10")
function parsePageRanges(
  rangeStr: string,
  maxPages: number
): { pages: number[]; errors: string[] } {
  const pagesSet = new Set<number>();
  const errors: string[] = [];
  const parts = rangeStr.split(',').map((p) => p.trim()).filter(Boolean);

  if (parts.length === 0) {
    errors.push('Please enter at least one page or range.');
    return { pages: [], errors };
  }

  for (const part of parts) {
    if (part.includes('-')) {
      const rangeParts = part.split('-').map((s) => s.trim());
      if (rangeParts.length !== 2) {
        errors.push(`Invalid range format: "${part}". Example: "1-4".`);
        continue;
      }
      const start = parseInt(rangeParts[0], 10);
      const end = parseInt(rangeParts[1], 10);

      if (isNaN(start) || isNaN(end)) {
        errors.push(`Invalid numbers in range: "${part}".`);
        continue;
      }
      if (start < 1) {
        errors.push(`Page numbers must start from 1 (found ${start}).`);
        continue;
      }
      if (start > end) {
        errors.push(`Start page ${start} is greater than end page ${end} in "${part}".`);
        continue;
      }
      if (end > maxPages) {
        errors.push(`Range "${part}" exceeds document length (${maxPages} pages).`);
        continue;
      }
      for (let i = start; i <= end; i++) {
        pagesSet.add(i);
      }
    } else {
      const page = parseInt(part, 10);
      if (isNaN(page)) {
        errors.push(`"${part}" is not a valid number.`);
        continue;
      }
      if (page < 1) {
        errors.push(`Page numbers must start from 1 (found ${page}).`);
        continue;
      }
      if (page > maxPages) {
        errors.push(`Page ${page} exceeds document length (${maxPages} pages).`);
        continue;
      }
      pagesSet.add(page);
    }
  }

  const sortedPages = Array.from(pagesSet).sort((a, b) => a - b);
  return { pages: sortedPages, errors };
}

export function SplitPdf() {
  const [loadedPdf, setLoadedPdf] = useState<LoadedPdf | null>(null);
  const [splitMode, setSplitMode] = useState<SplitMode>('range');
  const [rangeInput, setRangeInput] = useState<string>('1');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Parse pages in real-time
  const rangeValidation = useMemo(() => {
    if (!loadedPdf) return { pages: [], errors: [] };
    return parsePageRanges(rangeInput, loadedPdf.pageCount);
  }, [rangeInput, loadedPdf]);

  // Handle PDF file upload
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please upload a valid PDF document.');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      // Load document to count pages
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pageCount = pdfDoc.getPageCount();

      if (pageCount === 0) {
        setErrorMessage('This PDF document has no readable pages.');
        return;
      }

      setLoadedPdf({
        file,
        name: file.name,
        size: file.size,
        pageCount,
        arrayBuffer,
      });

      // Default range: if multi-page, offer "1-min(pageCount, 3)"
      if (pageCount > 1) {
        setRangeInput(`1-${Math.min(pageCount, 3)}`);
      } else {
        setRangeInput('1');
      }
    } catch (err: unknown) {
      console.error('Failed to parse PDF:', err);
      setErrorMessage('Could not parse this PDF file. It might be password-protected or corrupted.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  // Reset file selection
  const handleResetFile = () => {
    setLoadedPdf(null);
    setRangeInput('1');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Toggle page in range input
  const togglePageInGrid = (pageNum: number) => {
    const currentPages = new Set(rangeValidation.pages);
    if (currentPages.has(pageNum)) {
      currentPages.delete(pageNum);
    } else {
      currentPages.add(pageNum);
    }

    const sorted = Array.from(currentPages).sort((a, b) => a - b);
    if (sorted.length === 0) {
      setRangeInput('');
      return;
    }

    // Convert sorted array to compact ranges
    const ranges: string[] = [];
    let start = sorted[0];
    let prev = start;

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === prev + 1) {
        prev = sorted[i];
      } else {
        ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
        start = sorted[i];
        prev = start;
      }
    }
    ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
    setRangeInput(ranges.join(', '));
  };

  // Apply quick presets
  const applyPreset = (preset: 'all' | 'first' | 'odd' | 'even' | 'half') => {
    if (!loadedPdf) return;
    const total = loadedPdf.pageCount;

    if (preset === 'all') {
      setRangeInput(total === 1 ? '1' : `1-${total}`);
    } else if (preset === 'first') {
      setRangeInput('1');
    } else if (preset === 'odd') {
      const odds = [];
      for (let i = 1; i <= total; i += 2) odds.push(i);
      setRangeInput(odds.join(', '));
    } else if (preset === 'even') {
      const evens = [];
      for (let i = 2; i <= total; i += 2) evens.push(i);
      setRangeInput(evens.length > 0 ? evens.join(', ') : '1');
    } else if (preset === 'half') {
      const mid = Math.ceil(total / 2);
      setRangeInput(`1-${mid}`);
    }
  };

  // Execute PDF splitting
  const handleSplitPdf = async () => {
    if (!loadedPdf) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsProcessing(true);

    try {
      // ignoreEncryption matches the upload probe so password-protected PDFs behave consistently
      const srcDoc = await PDFDocument.load(loadedPdf.arrayBuffer, { ignoreEncryption: true });
      const baseName = loadedPdf.name.replace(/\.[^/.]+$/, '');

      if (splitMode === 'range') {
        const { pages, errors } = rangeValidation;
        if (errors.length > 0 || pages.length === 0) {
          setErrorMessage(errors[0] || 'Please provide a valid page range.');
          setIsProcessing(false);
          return;
        }

        setProgressText(`Extracting ${pages.length} pages in browser memory...`);

        // Create new document with selected pages
        const newDoc = await PDFDocument.create();
        // pdf-lib expects 0-indexed page indices
        const indices = pages.map((p) => p - 1);
        const copiedPages = await newDoc.copyPages(srcDoc, indices);
        copiedPages.forEach((page) => newDoc.addPage(page));

        const pdfBytes = await newDoc.save();
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        const outputFileName = `${baseName}_extracted_pages.pdf`;

        saveAs(blob, outputFileName);

        setSuccessMessage(
          `Extracted ${pages.length} ${
            pages.length === 1 ? 'page' : 'pages'
          } successfully into "${outputFileName}" (${formatBytes(blob.size)})`
        );
        trackToolExecution('split-pdf', true);
      } else {
        // Option B: Extract all individual pages and bundle into ZIP
        const total = loadedPdf.pageCount;
        setProgressText(`Separating ${total} pages into individual PDF files...`);

        const zip = new JSZip();
        const padding = String(total).length;

        for (let i = 0; i < total; i++) {
          setProgressText(`Processing page ${i + 1} of ${total}...`);
          const singleDoc = await PDFDocument.create();
          const [copiedPage] = await singleDoc.copyPages(srcDoc, [i]);
          singleDoc.addPage(copiedPage);

          const singleBytes = await singleDoc.save();
          const pageStr = String(i + 1).padStart(padding, '0');
          zip.file(`${baseName}_page_${pageStr}.pdf`, singleBytes);
        }

        setProgressText('Bundling ZIP archive...');
        const zipBlob = await zip.generateAsync({
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 },
        });

        const zipFileName = `${baseName}_all_${total}_pages.zip`;
        saveAs(zipBlob, zipFileName);

        setSuccessMessage(
          `Extracted all ${total} pages into individual PDFs in "${zipFileName}" (${formatBytes(
            zipBlob.size
          )})`
        );
        trackToolExecution('split-pdf', true);
      }
    } catch (err: unknown) {
      trackToolExecution('split-pdf', false);
      console.error('Error during split operation:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while splitting the PDF.'
      );
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Privacy Guarantee Header Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 text-xs font-medium text-rose-800 dark:text-rose-300 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>
            <strong>Zero Server Uploads:</strong> PDF extraction and ZIP packaging execute 100% locally in browser memory via pdf-lib & JSZip.
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
          Client-Side In-Memory
        </span>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs sm:text-sm font-medium text-red-700 dark:text-red-300 shadow-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-300 shadow-xs animate-in fade-in">
          <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Empty State / Massive Drag-and-Drop Zone */}
      {!loadedPdf ? (
        <div
          {...getRootProps()}
          className={`group relative rounded-3xl border-3 border-dashed transition-all duration-200 p-8 sm:p-16 text-center cursor-pointer min-h-[340px] sm:min-h-[380px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(244,63,94,0.12)] ${
            isDragActive
              ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/50 scale-[0.99] ring-4 ring-rose-500/20'
              : 'border-rose-300/80 dark:border-rose-900/60 hover:border-rose-600 dark:hover:border-rose-400'
          }`}
        >
          <input {...getInputProps()} aria-label="Select PDF file to split" />
          <div className="max-w-md mx-auto space-y-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform duration-200">
              <UploadCloud className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                {isDragActive ? 'Drop your PDF file here' : 'Drag & drop your PDF here'}
              </h3>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
                or tap below to choose a document from your computer
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 pt-1">
                Extract page ranges or separate all pages into a ZIP archive
              </p>
            </div>
            <button
              type="button"
              className="min-h-[52px] px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-sm sm:text-base font-bold shadow-lg shadow-rose-500/25 active:scale-95 transition-all inline-flex items-center gap-2.5 cursor-pointer"
            >
              <FileText className="w-5 h-5" />
              <span>Choose PDF File</span>
            </button>
          </div>
        </div>
      ) : (
        /* Workspace when document is loaded */
        <div className="space-y-6">
          {/* Active File Summary Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                  {loadedPdf.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold">{formatBytes(loadedPdf.size)}</span>
                  <span>•</span>
                  <span className="font-extrabold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60">
                    {loadedPdf.pageCount} {loadedPdf.pageCount === 1 ? 'Page' : 'Pages'} Detected
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetFile}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5 self-start sm:self-center cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change Document</span>
            </button>
          </div>

          {/* Mode Selector Tabs (Option A vs Option B) */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-1">
                Extraction Mode
              </span>
              <h4 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white tracking-tight">
                Choose how to split your document
              </h4>
            </div>

            {/* Mode Toggle Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Custom Range */}
              <button
                type="button"
                onClick={() => setSplitMode('range')}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  splitMode === 'range'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-500/20 shadow-xs'
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        splitMode === 'range'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Scissors className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Custom Page Range
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      splitMode === 'range'
                        ? 'border-rose-600 bg-rose-600 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {splitMode === 'range' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Extract specific pages (e.g. 1-3, 5) into a single, clean new PDF document.
                </p>
              </button>

              {/* Option B: Extract All Pages */}
              <button
                type="button"
                onClick={() => setSplitMode('all')}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  splitMode === 'all'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-500/20 shadow-xs'
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        splitMode === 'all'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Archive className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Extract All Pages (ZIP)
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      splitMode === 'all'
                        ? 'border-rose-600 bg-rose-600 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {splitMode === 'all' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Splits every page into an individual PDF file and bundles them into a ZIP archive.
                </p>
              </button>
            </div>

            {/* Mode Option Details Container */}
            {splitMode === 'range' ? (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label htmlFor="range-input" className="text-xs font-bold text-slate-900 dark:text-white">
                    Specify Page Ranges
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Total Document: <strong>{loadedPdf.pageCount} pages</strong> (1 to {loadedPdf.pageCount})
                  </span>
                </div>

                {/* Range Input Field */}
                <div className="relative">
                  <input
                    id="range-input"
                    type="text"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    placeholder="e.g. 1-3, 5, 7-10"
                    className="w-full min-h-[48px] px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all"
                  />
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Quick Range Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyPreset('all')}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer active:scale-95 transition-all"
                    >
                      All Pages
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('first')}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer active:scale-95 transition-all"
                    >
                      Page 1
                    </button>
                    {loadedPdf.pageCount > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => applyPreset('odd')}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer active:scale-95 transition-all"
                        >
                          Odd Pages
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset('even')}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer active:scale-95 transition-all"
                        >
                          Even Pages
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset('half')}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer active:scale-95 transition-all"
                        >
                          First Half (1-{Math.ceil(loadedPdf.pageCount / 2)})
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Real-time Range Status or Validation Error */}
                {rangeValidation.errors.length > 0 ? (
                  <div className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5 pt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{rangeValidation.errors[0]}</span>
                  </div>
                ) : (
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5 pt-1">
 <Check className="w-3.5 h-3.5 text-[var(--pe-accent)] shrink-0" />
                    <span>
                      Ready to extract{' '}
                      <strong className="text-slate-900 dark:text-white">
                        {rangeValidation.pages.length} {rangeValidation.pages.length === 1 ? 'page' : 'pages'}
                      </strong>{' '}
                      ({rangeValidation.pages.slice(0, 8).join(', ')}
                      {rangeValidation.pages.length > 8 ? '...' : ''}) into a single PDF.
                    </span>
                  </div>
                )}

                {/* Interactive Visual Page Selection Grid */}
                {loadedPdf.pageCount <= 64 && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                      Tap pages to toggle selection:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
                      {Array.from({ length: loadedPdf.pageCount }, (_, i) => i + 1).map((pageNum) => {
                        const isSelected = rangeValidation.pages.includes(pageNum);
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => togglePageInGrid(pageNum)}
                            className={`min-w-[38px] h-9 px-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer active:scale-90 ${
                              isSelected
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Option B Details */
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <Archive className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Full Archive Export</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Every page of &quot;{loadedPdf.name}&quot; will be extracted as its own standalone PDF document with numbered naming (e.g.{' '}
                  <code className="font-mono text-[11px] bg-white dark:bg-slate-900 px-1 py-0.5 rounded border">
                    {loadedPdf.name.replace(/\.[^/.]+$/, '')}_page_01.pdf
                  </code>
                  ). All {loadedPdf.pageCount} files will be bundled into a compressed ZIP archive for single-click download.
                </p>
 <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--pe-accent)] ">
 <Check className="w-3.5 h-3.5 text-[var(--pe-accent)]" />
                  <span>{loadedPdf.pageCount} individual PDF documents will be generated</span>
                </div>
              </div>
            )}

            {/* Primary Action Split & Download Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSplitPdf}
                disabled={
                  isProcessing ||
                  (splitMode === 'range' &&
                    (rangeValidation.errors.length > 0 || rangeValidation.pages.length === 0))
                }
                className={`w-full min-h-[52px] px-6 py-3.5 rounded-2xl font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 shadow-lg active:scale-[0.98] cursor-pointer ${
                  isProcessing ||
                  (splitMode === 'range' &&
                    (rangeValidation.errors.length > 0 || rangeValidation.pages.length === 0))
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-600 text-white shadow-rose-600/25'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{progressText || 'Processing PDF in Memory...'}</span>
                  </>
                ) : splitMode === 'range' ? (
                  <>
                    <Scissors className="w-5 h-5" />
                    <span>
                      Split & Download PDF (
                      {rangeValidation.pages.length}{' '}
                      {rangeValidation.pages.length === 1 ? 'page' : 'pages'})
                    </span>
                  </>
                ) : (
                  <>
                    <Archive className="w-5 h-5" />
                    <span>Extract All {loadedPdf.pageCount} Pages & Download ZIP</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
