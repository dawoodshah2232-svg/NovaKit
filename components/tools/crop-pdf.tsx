'use client';
import { validateUploadSize } from '@/lib/file-limits';
import { brandedFileName } from '@/lib/branded-filename';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';
import {
  Crop,
  UploadCloud,
  Check,
  AlertCircle,
  RefreshCw,
  Download,
  Sparkles,
  FileText,
  RotateCcw,
  Sliders,
  Maximize2,
  Minimize2,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

interface PageData {
  pageNumber: number;
  thumbnailUrl: string;
  originalWidth: number;
  originalHeight: number;
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function CropPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // Crop Margins in Points (1 pt = 1/72 inch)
  const [marginTop, setMarginTop] = useState<number>(36); // 0.5 inch default
  const [marginBottom, setMarginBottom] = useState<number>(36);
  const [marginLeft, setMarginLeft] = useState<number>(36);
  const [marginRight, setMarginRight] = useState<number>(36);

  // Scope: all pages vs current page vs custom range
  const [applyScope, setApplyScope] = useState<'all' | 'current' | 'range'>('all');
  const [pageRange, setPageRange] = useState<string>('');

  const [isLoadingPages, setIsLoadingPages] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

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
      cleanupThumbnails();

      try {
        const buffer = await pdfFile.arrayBuffer();
        setArrayBuffer(buffer);

        setLoadingProgress('Loading PDF pages...');
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;

        const pagesData: PageData[] = [];

        for (let i = 1; i <= Math.min(totalPages, 20); i++) {
          setLoadingProgress(`Rendering page ${i} of ${totalPages}...`);
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.6 });

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
              pagesData.push({
                pageNumber: i,
                thumbnailUrl: url,
                originalWidth: viewport.width / 0.6,
                originalHeight: viewport.height / 0.6,
              });
            }
          }
          canvas.width = 0;
          canvas.height = 0;
        }

        setPages(pagesData);
        setActivePageIndex(0);
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

  const setPresetMargins = (all: number) => {
    setMarginTop(all);
    setMarginBottom(all);
    setMarginLeft(all);
    setMarginRight(all);
  };

  const handleCropAndSave = async () => {
    if (!arrayBuffer || !file) {
      setErrorMessage('No PDF loaded.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();

      // Determine which page indices to crop (0-based)
      const targetIndices: number[] = [];
      if (applyScope === 'all') {
        for (let i = 0; i < totalPages; i++) targetIndices.push(i);
      } else if (applyScope === 'current') {
        targetIndices.push(activePageIndex);
      } else {
        // Range parsing e.g. "1-3, 5"
        const parts = pageRange.split(',').map((p) => p.trim()).filter(Boolean);
        for (const part of parts) {
          if (part.includes('-')) {
            const [startStr, endStr] = part.split('-').map((s) => s.trim());
            const start = parseInt(startStr, 10);
            const end = parseInt(endStr, 10);
            if (!isNaN(start) && !isNaN(end)) {
              for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
                targetIndices.push(i - 1);
              }
            }
          } else {
            const p = parseInt(part, 10);
            if (!isNaN(p) && p >= 1 && p <= totalPages) {
              targetIndices.push(p - 1);
            }
          }
        }
      }

      if (targetIndices.length === 0) {
        setErrorMessage('No valid pages selected to crop.');
        setIsProcessing(false);
        return;
      }

      for (const idx of targetIndices) {
        const page = pdfDoc.getPage(idx);
        const { width, height } = page.getSize();

        // Calculate cropped boundary (PDF coordinate system has (0,0) at bottom-left)
        const newX = marginLeft;
        const newY = marginBottom;
        const newWidth = Math.max(20, width - marginLeft - marginRight);
        const newHeight = Math.max(20, height - marginTop - marginBottom);

        // Set both CropBox and MediaBox
        page.setCropBox(newX, newY, newWidth, newHeight);
      }

      pdfDoc.setProducer('PDFEdit Studio (pdfedit.website)');
      pdfDoc.setCreator('PDFEdit Studio Crop PDF');

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      saveAs(blob, brandedFileName(`${baseName}-cropped`, 'pdf'));

      trackToolExecution('crop-pdf', true);
      setSuccessMessage(
        `Successfully cropped ${targetIndices.length} page${targetIndices.length === 1 ? '' : 's'} and downloaded PDF!`
      );
    } catch (err: unknown) {
      trackToolExecution('crop-pdf', false);
      console.error('Error cropping PDF:', err);
      const msg = err instanceof Error ? err.message : 'Failed to crop PDF document.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setArrayBuffer(null);
    setPages([]);
    setErrorMessage(null);
    setSuccessMessage(null);
    cleanupThumbnails();
  };

  const activePage = pages[activePageIndex];

  // Visual percentage for overlay
  const topPercent = activePage ? (marginTop / activePage.originalHeight) * 100 : 5;
  const bottomPercent = activePage ? (marginBottom / activePage.originalHeight) * 100 : 5;
  const leftPercent = activePage ? (marginLeft / activePage.originalWidth) * 100 : 5;
  const rightPercent = activePage ? (marginRight / activePage.originalWidth) * 100 : 5;

  return (
    <div className="w-full space-y-6">
      {!file && (
        <div
          {...getRootProps()}
          className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer select-none ${
            isDragActive
 ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)] scale-[1.01]'
 : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-[var(--pe-accent)] hover:bg-slate-50/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="max-w-md mx-auto space-y-3">
 <div className="w-16 h-16 rounded-2xl bg-[var(--pe-accent-soft)] text-[var(--pe-accent)] flex items-center justify-center mx-auto shadow-sm">
              <Crop className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Choose a PDF to Crop
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Trim margins, remove white space, or crop page boundaries with live visual feedback
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
            {loadingProgress || 'Loading document pages...'}
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
          {/* Header */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-[var(--pe-accent-soft)] text-[var(--pe-accent)] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {file.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {pages.length} pages loaded • {formatBytes(file.size)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[var(--pe-accent)] transition self-start md:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Choose Another File</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Crop Margin Controls */}
            <div className="lg:col-span-1 space-y-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
 <Sliders className="w-4 h-4 text-[var(--pe-accent)]" />
                  <span>Crop Margins (Points)</span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Quick Presets
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPresetMargins(0)}
 className="px-2 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-[var(--pe-accent-soft)] hover:text-[var(--pe-accent)] transition"
                  >
                    Reset (0 pt)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetMargins(36)}
 className="px-2 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-[var(--pe-accent-soft)] hover:text-[var(--pe-accent)] transition"
                  >
                    0.5 in (36 pt)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetMargins(72)}
 className="px-2 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-[var(--pe-accent-soft)] hover:text-[var(--pe-accent)] transition"
                  >
                    1.0 in (72 pt)
                  </button>
                </div>
              </div>

              {/* Margin Inputs */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Top Margin</span>
 <span className="font-mono text-[var(--pe-accent)] ">{marginTop} pt</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={150}
                    step={2}
                    value={marginTop}
                    onChange={(e) => setMarginTop(parseInt(e.target.value) || 0)}
 className="w-full accent-red-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Bottom Margin</span>
 <span className="font-mono text-[var(--pe-accent)] ">
                      {marginBottom} pt
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={150}
                    step={2}
                    value={marginBottom}
                    onChange={(e) => setMarginBottom(parseInt(e.target.value) || 0)}
 className="w-full accent-red-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Left Margin</span>
 <span className="font-mono text-[var(--pe-accent)] ">
                      {marginLeft} pt
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={150}
                    step={2}
                    value={marginLeft}
                    onChange={(e) => setMarginLeft(parseInt(e.target.value) || 0)}
 className="w-full accent-red-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Right Margin</span>
 <span className="font-mono text-[var(--pe-accent)] ">
                      {marginRight} pt
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={150}
                    step={2}
                    value={marginRight}
                    onChange={(e) => setMarginRight(parseInt(e.target.value) || 0)}
 className="w-full accent-red-600"
                  />
                </div>
              </div>

              {/* Scope Selection */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Apply Crop To
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setApplyScope('all')}
                    className={`px-2 py-1.5 rounded-xl text-xs font-bold transition ${
                      applyScope === 'all'
 ? 'bg-[var(--pe-accent)] text-[var(--pe-accent-ink)] shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    All Pages
                  </button>
                  <button
                    type="button"
                    onClick={() => setApplyScope('current')}
                    className={`px-2 py-1.5 rounded-xl text-xs font-bold transition ${
                      applyScope === 'current'
 ? 'bg-[var(--pe-accent)] text-[var(--pe-accent-ink)] shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    Current
                  </button>
                  <button
                    type="button"
                    onClick={() => setApplyScope('range')}
                    className={`px-2 py-1.5 rounded-xl text-xs font-bold transition ${
                      applyScope === 'range'
 ? 'bg-[var(--pe-accent)] text-[var(--pe-accent-ink)] shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {applyScope === 'range' && (
                  <input
                    type="text"
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                    placeholder="e.g. 1-3, 5"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white mt-2"
                  />
                )}
              </div>
            </div>

            {/* Right: Live Interactive Visual Crop Box */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Crop Box Preview — Page {activePage?.pageNumber || 1}
                    </span>
                  </div>

                  {/* Page Navigation */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={activePageIndex === 0}
                      onClick={() => setActivePageIndex((prev) => Math.max(0, prev - 1))}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-30"
                    >
                      Prev
                    </button>
                    <span className="text-xs font-mono text-slate-500">
                      {activePageIndex + 1} / {pages.length}
                    </span>
                    <button
                      type="button"
                      disabled={activePageIndex >= pages.length - 1}
                      onClick={() =>
                        setActivePageIndex((prev) => Math.min(pages.length - 1, prev + 1))
                      }
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-30"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Main Visual Crop Area */}
                {activePage && (
                  <div className="relative max-w-sm sm:max-w-md mx-auto aspect-3/4 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center select-none">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activePage.thumbnailUrl}
                      alt={`Crop preview page ${activePage.pageNumber}`}
                      className="w-full h-full object-contain pointer-events-none"
                    />

                    {/* Dimmed Outside Mask */}
                    <div
                      className="absolute top-0 left-0 right-0 bg-black/60 transition-all pointer-events-none"
                      style={{ height: `${Math.min(45, topPercent)}%` }}
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-black/60 transition-all pointer-events-none"
                      style={{ height: `${Math.min(45, bottomPercent)}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-black/60 transition-all pointer-events-none"
                      style={{
                        width: `${Math.min(45, leftPercent)}%`,
                        top: `${Math.min(45, topPercent)}%`,
                        bottom: `${Math.min(45, bottomPercent)}%`,
                      }}
                    />
                    <div
                      className="absolute top-0 bottom-0 right-0 bg-black/60 transition-all pointer-events-none"
                      style={{
                        width: `${Math.min(45, rightPercent)}%`,
                        top: `${Math.min(45, topPercent)}%`,
                        bottom: `${Math.min(45, bottomPercent)}%`,
                      }}
                    />

                    {/* Crop Target Box Border */}
                    <div
 className="absolute border-2 border-dashed border-[var(--pe-accent)] shadow-2xl pointer-events-none transition-all flex items-center justify-center"
                      style={{
                        top: `${Math.min(45, topPercent)}%`,
                        bottom: `${Math.min(45, bottomPercent)}%`,
                        left: `${Math.min(45, leftPercent)}%`,
                        right: `${Math.min(45, rightPercent)}%`,
                      }}
                    >
 <div className="text-[10px] font-bold uppercase tracking-wider bg-[var(--pe-accent)] text-[var(--pe-accent-ink)] px-2 py-0.5 rounded shadow">
                        Cropped Area
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="sticky bottom-4 p-4 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Margins:{' '}
 <span className="font-bold text-[var(--pe-accent)] ">
                T:{marginTop}pt • B:{marginBottom}pt • L:{marginLeft}pt • R:{marginRight}pt
              </span>{' '}
              • Scope:{' '}
              <span className="font-semibold text-slate-900 dark:text-white capitalize">
                {applyScope}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCropAndSave}
              disabled={isProcessing}
 className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[var(--pe-accent)] hover:bg-[var(--pe-accent-hover)] active:scale-95 text-[var(--pe-accent-ink)] font-bold text-sm shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Cropping PDF Pages...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Crop PDF & Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
