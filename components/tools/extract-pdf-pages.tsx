'use client';
import { validateUploadSize } from '@/lib/file-limits';
import { brandedFileName } from '@/lib/branded-filename';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';
import {
  Scissors,
  UploadCloud,
  Check,
  AlertCircle,
  RefreshCw,
  Download,
  Archive,
  FileCheck2,
  Sparkles,
  FileText,
  RotateCcw,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

interface PageItem {
  pageNumber: number; // 1-based
  thumbnailUrl: string;
  width: number;
  height: number;
}

type ExtractMode = 'merged' | 'zip';

function formatBytes(bytes: number, decimals = 1) {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function ExtractPdfPages() {
  const [file, setFile] = useState<File | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set()); // pages to EXTRACT
  const [extractMode, setExtractMode] = useState<ExtractMode>('merged');

  const [isLoadingPages, setIsLoadingPages] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const [rangeInput, setRangeInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const thumbnailsRef = useRef<string[]>([]);

  const cleanupThumbnails = useCallback(() => {
    thumbnailsRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Error revoking thumbnail URL:', err);
      }
    });
    thumbnailsRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      cleanupThumbnails();
    };
  }, [cleanupThumbnails]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setErrorMessage(null);
      setSuccessMessage(null);

      const pdfFile = acceptedFiles[0];
      if (!pdfFile) return;

      if (pdfFile.type !== 'application/pdf' && !pdfFile.name.endsWith('.pdf')) {
        setErrorMessage('Please upload a valid PDF document.');
        return;
      }

      // Guard: oversized files can exhaust browser tab memory — reject before parsing.
      const sizeError = validateUploadSize(pdfFile);
      if (sizeError) {
        setErrorMessage(sizeError);
        return;
      }

      setFile(pdfFile);
      setIsLoadingPages(true);
      setSelectedPages(new Set());
      cleanupThumbnails();

      try {
        const buffer = await pdfFile.arrayBuffer();
        setArrayBuffer(buffer);

        setLoadingProgress('Reading PDF pages...');
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;

        const pageItems: PageItem[] = [];

        for (let i = 1; i <= totalPages; i++) {
          setLoadingProgress(`Rendering thumbnail for page ${i} of ${totalPages}...`);
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.5 });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (page.render({ canvas, canvasContext: ctx, viewport } as any)).promise;
            const blob = await new Promise<Blob | null>((res) =>
              canvas.toBlob(res, 'image/jpeg', 0.85)
            );
            if (blob) {
              const url = URL.createObjectURL(blob);
              thumbnailsRef.current.push(url);
              pageItems.push({
                pageNumber: i,
                thumbnailUrl: url,
                width: viewport.width,
                height: viewport.height,
              });
            }
          }
          canvas.width = 0;
          canvas.height = 0;
        }

        setPages(pageItems);
      } catch (err: unknown) {
        console.error('Error loading PDF pages:', err);
        const msg = err instanceof Error ? err.message : 'Failed to load PDF pages.';
        setErrorMessage(msg);
      } finally {
        setIsLoadingPages(false);
        setLoadingProgress('');
      }
    },
    [cleanupThumbnails]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const togglePage = (pageNumber: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNumber)) {
        next.delete(pageNumber);
      } else {
        next.add(pageNumber);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedPages(new Set(pages.map((p) => p.pageNumber)));
  };

  const selectEven = () => {
    const evens = new Set<number>();
    pages.forEach((p) => {
      if (p.pageNumber % 2 === 0) evens.add(p.pageNumber);
    });
    setSelectedPages(evens);
  };

  const selectOdd = () => {
    const odds = new Set<number>();
    pages.forEach((p) => {
      if (p.pageNumber % 2 !== 0) odds.add(p.pageNumber);
    });
    setSelectedPages(odds);
  };

  const clearSelection = () => {
    setSelectedPages(new Set());
  };

  const applyRangeSelection = () => {
    if (!rangeInput.trim()) return;
    const parts = rangeInput.split(',').map((p) => p.trim()).filter(Boolean);
    const newSelected = new Set(selectedPages);

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-').map((s) => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = Math.max(1, start); i <= Math.min(pages.length, end); i++) {
            newSelected.add(i);
          }
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p) && p >= 1 && p <= pages.length) {
          newSelected.add(p);
        }
      }
    }

    setSelectedPages(newSelected);
    setRangeInput('');
  };

  const handleExtract = async () => {
    if (!arrayBuffer || pages.length === 0) {
      setErrorMessage('No PDF loaded.');
      return;
    }

    const pagesToExtract = Array.from(selectedPages).sort((a, b) => a - b);
    if (pagesToExtract.length === 0) {
      setErrorMessage('Please select at least one page to extract.');
      return;
    }

    setIsExporting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'document';

    try {
      const srcDoc = await PDFDocument.load(arrayBuffer);

      if (extractMode === 'merged') {
        // Extract into a single merged PDF
        const newDoc = await PDFDocument.create();
        const pageIndices = pagesToExtract.map((p) => p - 1);
        const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
        copiedPages.forEach((cp) => newDoc.addPage(cp));

        newDoc.setProducer('PDFEdit Studio (pdfedit.website)');
        newDoc.setCreator('PDFEdit Studio Extract Pages');

        const pdfBytes = await newDoc.save();
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        saveAs(blob, brandedFileName(`${baseName}-extracted`, 'pdf'));

        trackToolExecution('extract-pdf-pages', true);
        setSuccessMessage(
          `Successfully extracted ${pagesToExtract.length} page${pagesToExtract.length === 1 ? '' : 's'} into a single PDF!`
        );
      } else {
        // Extract each page as an individual PDF inside a ZIP archive
        const zip = new JSZip();

        for (const pNum of pagesToExtract) {
          const singleDoc = await PDFDocument.create();
          const [copiedPage] = await singleDoc.copyPages(srcDoc, [pNum - 1]);
          singleDoc.addPage(copiedPage);

          singleDoc.setProducer('PDFEdit Studio (pdfedit.website)');
          singleDoc.setCreator('PDFEdit Studio Extract Pages');

          const singlePdfBytes = await singleDoc.save();
          zip.file(brandedFileName(`${baseName}-page-${pNum}`, 'pdf'), singlePdfBytes);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, brandedFileName(`${baseName}-extracted-pages`, 'zip'));

        trackToolExecution('extract-pdf-pages', true);
        setSuccessMessage(
          `Successfully bundled ${pagesToExtract.length} extracted page PDFs into a ZIP archive!`
        );
      }
    } catch (err: unknown) {
      trackToolExecution('extract-pdf-pages', false);
      console.error('Error extracting PDF pages:', err);
      const msg = err instanceof Error ? err.message : 'Failed to extract PDF pages.';
      setErrorMessage(msg);
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setArrayBuffer(null);
    setPages([]);
    setSelectedPages(new Set());
    setErrorMessage(null);
    setSuccessMessage(null);
    cleanupThumbnails();
  };

  return (
    <div className="w-full space-y-6">
      {!file && (
        <div
          {...getRootProps()}
          className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer select-none ${
            isDragActive
              ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)] scale-[1.01]'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-[var(--pe-accent)] dark:hover:border-[var(--pe-accent)] hover:bg-slate-50/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)] text-[var(--pe-accent)] dark:text-[var(--pe-accent)] flex items-center justify-center mx-auto shadow-sm">
              <Scissors className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Choose a PDF to Extract Pages
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Select specific pages to extract into a new PDF or ZIP archive
              </p>
            </div>
            <div>
              <button
                type="button"
                className="inline-flex min-h-[48px] cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-2xl bg-[var(--pe-accent)] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--pe-shadow-accent)] transition-all hover:bg-[var(--pe-accent-hover)] active:scale-95"
              >
                Browse files
              </button>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>100% Client-Side Privacy • Zero Server Uploads</span>
            </div>
          </div>
        </div>
      )}

      {isLoadingPages && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[var(--pe-accent)] animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {loadingProgress || 'Loading document thumbnails...'}
          </p>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 text-emerald-700 dark:text-emerald-300 text-sm"
        >
          <Check className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      {file && pages.length > 0 && !isLoadingPages && (
        <div className="space-y-6">
          {/* Document Header & Quick Actions */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)] text-[var(--pe-accent)] dark:text-[var(--pe-accent)] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {file.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {pages.length} total pages • {formatBytes(file.size)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={selectEven}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                Select Even
              </button>
              <button
                type="button"
                onClick={selectOdd}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                Select Odd
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                Deselect All
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-[var(--pe-accent)] dark:hover:text-[var(--pe-accent)] transition"
                title="Choose different file"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Range Selection & Output Format Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Range Selection */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                Range:
              </span>
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                placeholder="e.g. 1-3, 5, 7"
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--pe-accent)]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyRangeSelection();
                  }
                }}
              />
              <button
                type="button"
                onClick={applyRangeSelection}
                className="px-3 py-1.5 rounded-xl bg-[var(--pe-accent)] text-white text-xs font-bold hover:bg-[var(--pe-accent-hover)] transition shrink-0"
              >
                Select
              </button>
            </div>

            {/* Export Format Toggle */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 pl-1">
                Output Format:
              </span>
              <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setExtractMode('merged')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                    extractMode === 'merged'
                      ? 'bg-white dark:bg-slate-900 text-[var(--pe-accent)] dark:text-[var(--pe-accent)] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Single PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExtractMode('zip')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                    extractMode === 'zip'
                      ? 'bg-white dark:bg-slate-900 text-[var(--pe-accent)] dark:text-[var(--pe-accent)] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Individual PDFs (ZIP)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Page Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pages.map((item) => {
              const isSelected = selectedPages.has(item.pageNumber);
              return (
                <div
                  key={item.pageNumber}
                  onClick={() => togglePage(item.pageNumber)}
                  className={`group relative rounded-2xl p-2 border-2 transition-all cursor-pointer flex flex-col items-center select-none ${
                    isSelected
                      ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)] shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs opacity-75'
                  }`}
                >
                  {/* Selection Badge */}
                  <div className="w-full flex items-center justify-between pb-1.5 px-1">
                    <span
                      className={`text-xs font-bold ${
                        isSelected
                          ? 'text-[var(--pe-accent)] dark:text-[var(--pe-accent)]'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Page {item.pageNumber}
                    </span>
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[var(--pe-accent)] text-white">
                        <Check className="w-3 h-3" />
                        Selected
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400">Skip</span>
                    )}
                  </div>

                  {/* Thumbnail Image */}
                  <div className="relative w-full aspect-3/4 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-800/80">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnailUrl}
                      alt={`Page ${item.pageNumber}`}
                      className="w-full h-full object-contain pointer-events-none"
                    />

                    {isSelected && (
                      <div className="absolute inset-0 bg-[var(--pe-accent-soft)] backdrop-blur-[0.5px] pointer-events-none" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="sticky bottom-4 p-4 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <span className="font-bold text-[var(--pe-accent)] dark:text-[var(--pe-accent)]">
                {selectedPages.size} of {pages.length} pages selected
              </span>{' '}
              • Export format:{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                {extractMode === 'merged' ? 'Single Merged PDF' : 'ZIP Bundle of Individual PDFs'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleExtract}
              disabled={isExporting || selectedPages.size === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[var(--pe-accent)] hover:bg-[var(--pe-accent-hover)] active:scale-95 text-white font-bold text-sm shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting Pages...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>
                    Extract {selectedPages.size} Page{selectedPages.size === 1 ? '' : 's'} & Download
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
