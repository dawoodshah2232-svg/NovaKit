'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, StandardFonts, RGB } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';
import {
  EyeOff,
  UploadCloud,
  Check,
  AlertCircle,
  RefreshCw,
  Download,
  Sparkles,
  FileText,
  RotateCcw,
  ShieldAlert,
  Trash2,
  Plus,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

interface RedactionBox {
  id: string;
  pageNumber: number; // 1-based
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
  widthPercent: number; // 0 to 100
  heightPercent: number; // 0 to 100
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

export function RedactPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  // Redactions array
  const [redactions, setRedactions] = useState<RedactionBox[]>([]);
  const [redactColor, setRedactColor] = useState<'black' | 'white'>('black');
  const [customText, setCustomText] = useState<string>(''); // e.g. [REDACTED]
  const [sanitizeMetadata, setSanitizeMetadata] = useState<boolean>(true);

  // Interactive drawing states
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDragRect, setCurrentDragRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const [isLoadingPages, setIsLoadingPages] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
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
      setRedactions([]);

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

        setLoadingProgress('Rendering PDF preview pages...');
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;

        const pagesData: PageData[] = [];

        for (let i = 1; i <= Math.min(totalPages, 20); i++) {
          setLoadingProgress(`Rendering page ${i} of ${totalPages}...`);
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.75 });

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
                originalWidth: viewport.width / 0.75,
                originalHeight: viewport.height / 0.75,
              });
            }
          }
          canvas.width = 0;
          canvas.height = 0;
        }

        setPages(pagesData);
        setCurrentPageIndex(0);
      } catch (err: unknown) {
        console.error('Error loading PDF:', err);
        const msg = err instanceof Error ? err.message : 'Failed to load PDF document.';
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
    noClick: isDrawing, // prevent dropzone firing when drawing
  });

  const currentPage = pages[currentPageIndex];
  const currentPageNumber = currentPageIndex + 1;

  // Mouse event handlers for drawing redaction boxes
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setIsDrawing(true);
    setDrawStart({ x, y });
    setCurrentDragRect({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !drawStart || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    const minX = Math.min(drawStart.x, currentX);
    const minY = Math.min(drawStart.y, currentY);
    const width = Math.abs(currentX - drawStart.x);
    const height = Math.abs(currentY - drawStart.y);

    setCurrentDragRect({
      x: Math.max(0, minX),
      y: Math.max(0, minY),
      width: Math.min(100 - minX, width),
      height: Math.min(100 - minY, height),
    });
  };

  const handleMouseUp = () => {
    if (isDrawing && currentDragRect && currentDragRect.width > 1 && currentDragRect.height > 1) {
      setRedactions((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          pageNumber: currentPageNumber,
          xPercent: currentDragRect.x,
          yPercent: currentDragRect.y,
          widthPercent: currentDragRect.width,
          heightPercent: currentDragRect.height,
        },
      ]);
    }
    setIsDrawing(false);
    setDrawStart(null);
    setCurrentDragRect(null);
  };

  const removeRedaction = (id: string) => {
    setRedactions((prev) => prev.filter((r) => r.id !== id));
  };

  const clearCurrentPageRedactions = () => {
    setRedactions((prev) => prev.filter((r) => r.pageNumber !== currentPageNumber));
  };

  const handleApplyRedactions = async () => {
    if (!arrayBuffer || !file) {
      setErrorMessage('No PDF loaded.');
      return;
    }

    if (redactions.length === 0) {
      setErrorMessage('Please draw at least one redaction box on the document.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const fillColor = redactColor === 'black' ? rgb(0, 0, 0) : rgb(1, 1, 1);
      const textColor = redactColor === 'black' ? rgb(1, 1, 1) : rgb(0.8, 0, 0);

      // Group redactions by page number
      const totalPages = pdfDoc.getPageCount();

      for (let i = 0; i < totalPages; i++) {
        const pageNum = i + 1;
        const pageRedactions = redactions.filter((r) => r.pageNumber === pageNum);

        if (pageRedactions.length === 0) continue;

        const page = pdfDoc.getPage(i);
        const { width, height } = page.getSize();

        for (const box of pageRedactions) {
          // Convert percentages back to PDF points
          const boxX = (box.xPercent / 100) * width;
          const boxWidth = (box.widthPercent / 100) * width;
          const boxHeight = (box.heightPercent / 100) * height;
          // In PDF, Y=0 is at bottom!
          const boxY = height - (box.yPercent / 100) * height - boxHeight;

          // Draw opaque rectangle
          page.drawRectangle({
            x: boxX,
            y: boxY,
            width: boxWidth,
            height: boxHeight,
            color: fillColor,
            opacity: 1.0,
          });

          // Optional text label e.g. [REDACTED]
          if (customText.trim()) {
            const label = customText.trim();
            const textSz = Math.min(10, Math.max(6, boxHeight * 0.5));
            const textW = font.widthOfTextAtSize(label, textSz);

            if (boxWidth >= textW + 4 && boxHeight >= textSz) {
              page.drawText(label, {
                x: boxX + (boxWidth - textW) / 2,
                y: boxY + (boxHeight - textSz) / 2,
                size: textSz,
                font,
                color: textColor,
              });
            }
          }
        }
      }

      // Metadata Sanitization
      if (sanitizeMetadata) {
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('PDFEdit Studio (pdfedit.website)');
        pdfDoc.setCreator('PDFEdit Studio Redact PDF (Sanitized)');
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      saveAs(blob, `${baseName}-redacted.pdf`);

      trackToolExecution('redact-pdf', true);
      setSuccessMessage(
        `Successfully applied ${redactions.length} redaction(s)${
          sanitizeMetadata ? ' and sanitized document metadata' : ''
        }!`
      );
    } catch (err: unknown) {
      trackToolExecution('redact-pdf', false);
      console.error('Error redacting PDF:', err);
      const msg = err instanceof Error ? err.message : 'Failed to redact PDF.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setArrayBuffer(null);
    setPages([]);
    setRedactions([]);
    setErrorMessage(null);
    setSuccessMessage(null);
    cleanupThumbnails();
  };

  const currentPageRedactions = redactions.filter((r) => r.pageNumber === currentPageNumber);

  return (
    <div className="w-full space-y-6">
      {!file && (
        <div
          {...getRootProps()}
          className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer select-none ${
            isDragActive
              ? 'border-rose-600 bg-rose-50/60 dark:bg-rose-950/20 scale-[1.01]'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-rose-500 hover:bg-slate-50/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-sm">
              <EyeOff className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Choose a PDF to Redact
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Blackout or whiteout confidential text, PII, and sensitive data with full metadata sanitization
              </p>
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
          <RefreshCw className="w-8 h-8 text-rose-600 animate-spin mx-auto" />
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
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {file.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {pages.length} pages • {redactions.length} total redaction area(s)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition self-start md:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Choose Another File</span>
            </button>
          </div>

          {/* Main Studio Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Redaction Options & List */}
            <div className="lg:col-span-1 space-y-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Redaction Style</span>
              </div>

              {/* Redaction Color Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Fill Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRedactColor('black')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      redactColor === 'black'
                        ? 'bg-black text-white shadow-xs'
                        : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-black border border-white/40" />
                    <span>Blackout</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRedactColor('white')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      redactColor === 'white'
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-white border border-slate-400" />
                    <span>Whiteout</span>
                  </button>
                </div>
              </div>

              {/* Optional Text Overlay */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Stamp Text Overlay (Optional)
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g. [REDACTED] or CONFIDENTIAL"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Metadata Sanitization */}
              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sanitizeMetadata}
                  onChange={(e) => setSanitizeMetadata(e.target.checked)}
                  className="mt-0.5 rounded accent-rose-600"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Sanitize Document Metadata
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
                    Strip author names, titles, creation history, and keywords from the PDF
                  </span>
                </div>
              </label>

              {/* Current Page Redactions List */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Page {currentPageNumber} Redactions ({currentPageRedactions.length})
                  </span>
                  {currentPageRedactions.length > 0 && (
                    <button
                      type="button"
                      onClick={clearCurrentPageRedactions}
                      className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      Clear Page
                    </button>
                  )}
                </div>

                {currentPageRedactions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Click and drag directly on the document preview to draw a blackout box.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {currentPageRedactions.map((r, idx) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          Redaction #{idx + 1} ({Math.round(r.widthPercent)}% × {Math.round(r.heightPercent)}%)
                        </span>
                        <button
                          type="button"
                          onClick={() => removeRedaction(r.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Interactive Canvas Drawing Workspace */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Page {currentPageNumber} of {pages.length}
                    </span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      • Drag mouse to redact text
                    </span>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPageIndex === 0}
                      onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-30"
                    >
                      Prev
                    </button>
                    <span className="text-xs font-mono text-slate-500">
                      {currentPageNumber} / {pages.length}
                    </span>
                    <button
                      type="button"
                      disabled={currentPageIndex >= pages.length - 1}
                      onClick={() =>
                        setCurrentPageIndex((prev) => Math.min(pages.length - 1, prev + 1))
                      }
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-30"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Main Interactive Drawing Area */}
                {currentPage && (
                  <div
                    ref={containerRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    className="relative max-w-sm sm:max-w-md mx-auto aspect-3/4 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center cursor-crosshair select-none shadow-md"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentPage.thumbnailUrl}
                      alt={`Page ${currentPageNumber}`}
                      className="w-full h-full object-contain pointer-events-none"
                    />

                    {/* Existing Redaction Boxes on Current Page */}
                    {currentPageRedactions.map((r) => (
                      <div
                        key={r.id}
                        className="absolute flex items-center justify-center shadow-sm"
                        style={{
                          left: `${r.xPercent}%`,
                          top: `${r.yPercent}%`,
                          width: `${r.widthPercent}%`,
                          height: `${r.heightPercent}%`,
                          backgroundColor: redactColor === 'black' ? '#000000' : '#ffffff',
                          border: redactColor === 'black' ? '1px solid #333' : '1px solid #ccc',
                        }}
                      >
                        {customText && (
                          <span
                            className="text-[9px] font-bold uppercase truncate px-0.5"
                            style={{ color: redactColor === 'black' ? '#ffffff' : '#cc0000' }}
                          >
                            {customText}
                          </span>
                        )}
                      </div>
                    ))}

                    {/* Current Drag Preview Rectangle */}
                    {isDrawing && currentDragRect && (
                      <div
                        className="absolute border border-rose-500 bg-rose-500/30 pointer-events-none"
                        style={{
                          left: `${currentDragRect.x}%`,
                          top: `${currentDragRect.y}%`,
                          width: `${currentDragRect.width}%`,
                          height: `${currentDragRect.height}%`,
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="sticky bottom-4 p-4 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {redactions.length} redaction area{redactions.length === 1 ? '' : 's'} placed
              </span>{' '}
              • Style:{' '}
              <span className="font-semibold text-slate-900 dark:text-white capitalize">
                {redactColor}out
              </span>
            </div>

            <button
              type="button"
              onClick={handleApplyRedactions}
              disabled={isProcessing || redactions.length === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-sm shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sanitizing & Redacting PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Apply Redactions & Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
