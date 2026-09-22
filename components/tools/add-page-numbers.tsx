'use client';
import { brandedFileName } from '@/lib/branded-filename';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, StandardFonts, RGB } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';
import {
  Binary,
  UploadCloud,
  Check,
  AlertCircle,
  RefreshCw,
  Download,
  Sparkles,
  FileText,
  RotateCcw,
  Sliders,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

type Position =
  | 'bottom-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'top-right'
  | 'top-left';

type NumberFormat = 'n' | 'page-n' | 'page-n-of-total' | 'n-of-total' | 'dash-n-dash';

interface PagePreview {
  pageNumber: number;
  thumbnailUrl: string;
  width: number;
  height: number;
}

function hexToRgb(hex: string): RGB {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255 || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255 || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255 || 0;
  return rgb(r, g, b);
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function AddPageNumbers() {
  const [file, setFile] = useState<File | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<PagePreview[]>([]);

  // Settings
  const [format, setFormat] = useState<NumberFormat>('page-n-of-total');
  const [position, setPosition] = useState<Position>('bottom-center');
  const [startFromNumber, setStartFromNumber] = useState<number>(1);
  const [firstPageToNumber, setFirstPageToNumber] = useState<number>(1); // e.g. skip cover page = 2
  const [fontSize, setFontSize] = useState<number>(10);
  const [fontColor, setFontColor] = useState<string>('#334155'); // slate-700
  const [margin, setMargin] = useState<number>(30); // pt from edge
  const [fontFamily, setFontFamily] = useState<'Helvetica' | 'TimesRoman' | 'Courier'>('Helvetica');

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

      setFile(pdfFile);
      setIsLoadingPages(true);
      cleanupThumbnails();

      try {
        const buffer = await pdfFile.arrayBuffer();
        setArrayBuffer(buffer);

        setLoadingProgress('Reading PDF pages...');
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;

        const previews: PagePreview[] = [];

        for (let i = 1; i <= Math.min(totalPages, 12); i++) {
          setLoadingProgress(`Rendering preview page ${i} of ${totalPages}...`);
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.4 });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (page.render({ canvas, canvasContext: ctx, viewport } as any)).promise;
            const blob = await new Promise<Blob | null>((res) =>
              canvas.toBlob(res, 'image/jpeg', 0.8)
            );
            if (blob) {
              const url = URL.createObjectURL(blob);
              thumbnailsRef.current.push(url);
              previews.push({
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

        setPages(previews);
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

  const generatePageLabel = (pageIndex: number, totalPages: number) => {
    const pageNumber = pageIndex + 1;
    if (pageNumber < firstPageToNumber) return '';

    const currentNumber = startFromNumber + (pageNumber - firstPageToNumber);
    const effectiveTotal = totalPages - firstPageToNumber + startFromNumber;

    switch (format) {
      case 'n':
        return `${currentNumber}`;
      case 'page-n':
        return `Page ${currentNumber}`;
      case 'page-n-of-total':
        return `Page ${currentNumber} of ${effectiveTotal}`;
      case 'n-of-total':
        return `${currentNumber} / ${effectiveTotal}`;
      case 'dash-n-dash':
        return `- ${currentNumber} -`;
      default:
        return `${currentNumber}`;
    }
  };

  const handleApplyPageNumbers = async () => {
    if (!arrayBuffer || !file) {
      setErrorMessage('No PDF document loaded.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();

      // Embed selected standard font
      let font;
      if (fontFamily === 'TimesRoman') {
        font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      } else if (fontFamily === 'Courier') {
        font = await pdfDoc.embedFont(StandardFonts.Courier);
      } else {
        font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }

      const color = hexToRgb(fontColor);

      for (let i = 0; i < totalPages; i++) {
        const pageNumber = i + 1;
        if (pageNumber < firstPageToNumber) continue;

        const text = generatePageLabel(i, totalPages);
        if (!text) continue;

        const page = pdfDoc.getPage(i);
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        let x = 0;
        let y = 0;

        // Calculate X coordinate
        if (position === 'top-left' || position === 'bottom-left') {
          x = margin;
        } else if (position === 'top-center' || position === 'bottom-center') {
          x = (width - textWidth) / 2;
        } else {
          // right
          x = width - margin - textWidth;
        }

        // Calculate Y coordinate
        if (position.startsWith('top')) {
          y = height - margin - textHeight;
        } else {
          y = margin;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color,
        });
      }

      pdfDoc.setProducer('PDFEdit Studio (pdfedit.website)');
      pdfDoc.setCreator('PDFEdit Studio Add Page Numbers');

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      saveAs(blob, brandedFileName(`${baseName}-numbered`, 'pdf'));

      trackToolExecution('add-page-numbers', true);
      setSuccessMessage(
        `Successfully stamped page numbers on ${totalPages - firstPageToNumber + 1} pages!`
      );
    } catch (err: unknown) {
      trackToolExecution('add-page-numbers', false);
      console.error('Error stamping page numbers:', err);
      const msg = err instanceof Error ? err.message : 'Failed to stamp page numbers.';
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
              <Binary className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Choose a PDF to Add Page Numbers
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Customize format, position, font, and starting index with live preview
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
            {loadingProgress || 'Loading document preview...'}
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

      {file && !isLoadingPages && (
        <div className="space-y-6">
          {/* Document Header */}
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
                  {formatBytes(file.size)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[var(--pe-accent)] dark:hover:text-[var(--pe-accent)] transition self-start md:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Choose Another File</span>
            </button>
          </div>

          {/* Configuration Panel & Live Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Customization Settings */}
            <div className="lg:col-span-1 space-y-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm">
                <Sliders className="w-4 h-4 text-[var(--pe-accent)]" />
                <span>Page Number Settings</span>
              </div>

              {/* Number Format */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Number Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as NumberFormat)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--pe-accent)]"
                >
                  <option value="page-n-of-total">Page 1 of 10</option>
                  <option value="n-of-total">1 / 10</option>
                  <option value="page-n">Page 1</option>
                  <option value="n">1 (Number only)</option>
                  <option value="dash-n-dash">- 1 -</option>
                </select>
              </div>

              {/* Position Matrix */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Position on Page
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {[
                    { id: 'top-left', label: 'Top Left' },
                    { id: 'top-center', label: 'Top Center' },
                    { id: 'top-right', label: 'Top Right' },
                    { id: 'bottom-left', label: 'Bottom Left' },
                    { id: 'bottom-center', label: 'Bottom Center' },
                    { id: 'bottom-right', label: 'Bottom Right' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setPosition(pos.id as Position)}
                      className={`px-2 py-2 rounded-xl text-[11px] font-bold text-center transition ${
                        position === pos.id
                          ? 'bg-[var(--pe-accent)] text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Numbering Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Start on Page
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={firstPageToNumber}
                    onChange={(e) => setFirstPageToNumber(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--pe-accent)]"
                  />
                  <span className="text-[10px] text-slate-400">e.g. 2 to skip cover</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Initial Number
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={startFromNumber}
                    onChange={(e) => setStartFromNumber(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--pe-accent)]"
                  />
                  <span className="text-[10px] text-slate-400">First numbered value</span>
                </div>
              </div>

              {/* Font and Styling */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Font Family
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) =>
                      setFontFamily(e.target.value as 'Helvetica' | 'TimesRoman' | 'Courier')
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--pe-accent)]"
                  >
                    <option value="Helvetica">Helvetica</option>
                    <option value="TimesRoman">Times Roman</option>
                    <option value="Courier">Courier</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Font Size ({fontSize}pt)
                  </label>
                  <input
                    type="range"
                    min={8}
                    max={20}
                    step={1}
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full accent-[var(--pe-accent)] mt-2"
                  />
                </div>
              </div>

              {/* Color & Margin */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fontColor}
                      onChange={(e) => setFontColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent p-0.5"
                    />
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                      {fontColor}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Margin ({margin}pt)
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={72}
                    step={2}
                    value={margin}
                    onChange={(e) => setMargin(parseInt(e.target.value))}
                    className="w-full accent-[var(--pe-accent)] mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Right: Live Stamping Preview */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Live Stamp Placement Preview
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Sample: &quot;{generatePageLabel(firstPageToNumber - 1, pages.length || 10)}&quot;
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {pages.slice(0, 6).map((page, idx) => {
                    const label = generatePageLabel(idx, pages.length);
                    return (
                      <div
                        key={page.pageNumber}
                        className="relative rounded-2xl border border-slate-200 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-950 flex flex-col items-center"
                      >
                        <div className="w-full flex justify-between text-[10px] font-semibold text-slate-400 pb-1 px-1">
                          <span>Page {page.pageNumber}</span>
                          {label ? (
                            <span className="text-[var(--pe-accent)] font-bold">Numbered</span>
                          ) : (
                            <span className="text-slate-400">Skipped</span>
                          )}
                        </div>

                        <div className="relative w-full aspect-3/4 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={page.thumbnailUrl}
                            alt={`Preview page ${page.pageNumber}`}
                            className="w-full h-full object-contain pointer-events-none opacity-80"
                          />

                          {/* Dynamic Visual Badge */}
                          {label && (
                            <div
                              className={`absolute text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm transition-all pointer-events-none ${
                                position === 'top-left'
                                  ? 'top-2 left-2'
                                  : position === 'top-center'
                                  ? 'top-2 left-1/2 -translate-x-1/2'
                                  : position === 'top-right'
                                  ? 'top-2 right-2'
                                  : position === 'bottom-left'
                                  ? 'bottom-2 left-2'
                                  : position === 'bottom-center'
                                  ? 'bottom-2 left-1/2 -translate-x-1/2'
                                  : 'bottom-2 right-2'
                              }`}
                              style={{
                                color: fontColor,
                                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                                backdropFilter: 'blur(2px)',
                                border: '1px solid rgba(0,0,0,0.1)',
                              }}
                            >
                              {label}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="sticky bottom-4 p-4 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Format:{' '}
              <span className="font-bold text-[var(--pe-accent)] dark:text-[var(--pe-accent)]">
                &quot;{generatePageLabel(firstPageToNumber - 1, 10)}&quot;
              </span>{' '}
              • Position:{' '}
              <span className="font-semibold text-slate-900 dark:text-white capitalize">
                {position.replace('-', ' ')}
              </span>
            </div>

            <button
              type="button"
              onClick={handleApplyPageNumbers}
              disabled={isProcessing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[var(--pe-accent)] hover:bg-[var(--pe-accent-hover)] active:scale-95 text-white font-bold text-sm shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Stamping Page Numbers...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Apply Numbers & Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
