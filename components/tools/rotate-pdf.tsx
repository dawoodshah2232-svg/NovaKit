'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';
import {
  RotateCw,
  RotateCcw,
  UploadCloud,
  Check,
  AlertCircle,
  RefreshCw,
  Download,
  FileText,
  Compass,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

interface PageThumbnail {
  pageIndex: number; // 0-based
  thumbnailUrl: string;
  initialRotation: number;
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function RotatePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  // Additional rotation delta in degrees for each page (e.g. 0, 90, 180, 270)
  const [rotations, setRotations] = useState<number[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const previewsRef = useRef<string[]>([]);

  const cleanupPreviews = useCallback(() => {
    previewsRef.current.forEach((u) => {
      try {
        URL.revokeObjectURL(u);
      } catch (err) {
        console.error('Error revoking object URL:', err);
      }
    });
    previewsRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      cleanupPreviews();
    };
  }, [cleanupPreviews]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const pdfFile = acceptedFiles[0];
    if (!pdfFile) return;

    if (pdfFile.type !== 'application/pdf' && !pdfFile.name.endsWith('.pdf')) {
      setErrorMessage('Please upload a valid PDF document.');
      return;
    }

    setFile(pdfFile);
    setIsLoading(true);
    cleanupPreviews();

    try {
      const buffer = await pdfFile.arrayBuffer();
      setArrayBuffer(buffer);

      setLoadingProgress('Reading PDF structure...');
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;

      const thumbs: PageThumbnail[] = [];
      const rots: number[] = [];

      for (let i = 1; i <= totalPages; i++) {
        setLoadingProgress(`Rendering preview for page ${i} of ${totalPages}...`);
        const page = await pdf.getPage(i);
        const initialRotation = page.rotate || 0;
        const viewport = page.getViewport({ scale: 0.45 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (page.render({ canvasContext: ctx, viewport } as any)).promise;
          const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
          if (blob) {
            const url = URL.createObjectURL(blob);
            previewsRef.current.push(url);
            thumbs.push({
              pageIndex: i - 1,
              thumbnailUrl: url,
              initialRotation,
            });
            rots.push(0); // 0 additional degrees
          }
        }
      }

      setThumbnails(thumbs);
      setRotations(rots);
    } catch (err: unknown) {
      console.error('Error loading PDF for rotation:', err);
      const msg = err instanceof Error ? err.message : 'Failed to load PDF.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setLoadingProgress('');
    }
  }, [cleanupPreviews]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  // Rotate single page
  const rotateSinglePage = (index: number, delta: number) => {
    setRotations((prev) => {
      const copy = [...prev];
      copy[index] = (copy[index] + delta + 360) % 360;
      return copy;
    });
  };

  // Rotate all pages by delta
  const rotateAllPages = (delta: number) => {
    setRotations((prev) => prev.map((r) => (r + delta + 360) % 360));
  };

  // Reset all rotations
  const resetRotations = () => {
    setRotations(thumbnails.map(() => 0));
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Save rotated PDF
  const handleSaveRotatedPdf = async () => {
    if (!arrayBuffer || thumbnails.length === 0) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page, idx) => {
        const delta = rotations[idx] || 0;
        if (delta !== 0) {
          const currentRotation = page.getRotation().angle;
          const newAngle = (currentRotation + delta) % 360;
          page.setRotation(degrees(newAngle));
        }
      });

      pdfDoc.setProducer('PDFEdit Studio (pdfedit.website)');
      pdfDoc.setCreator('PDFEdit Studio Client-Side Rotator');

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'document';
      saveAs(blob, `${baseName}-rotated.pdf`);

      trackToolExecution('rotate-pdf');
      setSuccessMessage('Successfully applied page rotations and downloaded updated PDF!');
    } catch (err: unknown) {
      console.error('Error saving rotated PDF:', err);
      const msg = err instanceof Error ? err.message : 'Failed to save rotated PDF.';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const hasAnyRotations = rotations.some((r) => r !== 0);

  return (
    <div className="w-full space-y-6">
      {/* Upload Dropzone */}
      {!file && (
        <div
          {...getRootProps()}
          className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer select-none ${
            isDragActive
              ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/20 scale-[1.01]'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
              <RotateCw className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {isDragActive ? 'Drop PDF here...' : 'Choose or Drag PDF Here'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Rotate individual pages or all pages by 90, 180, or 270 degrees with instant lossless export.
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              Select Local PDF
            </button>
          </div>
        </div>
      )}

      {/* Loading Progress */}
      {isLoading && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{loadingProgress}</h4>
          <p className="text-xs text-slate-400">Rendering high-speed visual page orientation previews...</p>
        </div>
      )}

      {/* Error & Success Banners */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <Check className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Workspace */}
      {file && thumbnails.length > 0 && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          {/* File Header & Global Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white truncate max-w-sm" title={file.name}>
                  {file.name}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {thumbnails.length} total pages • {formatBytes(file.size)}
              </p>
            </div>

            {/* Global Rotation Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => rotateAllPages(90)}
                className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate All +90°</span>
              </button>
              <button
                type="button"
                onClick={() => rotateAllPages(-90)}
                className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rotate All -90°</span>
              </button>
              <button
                type="button"
                onClick={() => rotateAllPages(180)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Rotate All 180°
              </button>
              {hasAnyRotations && (
                <button
                  type="button"
                  onClick={resetRotations}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setThumbnails([]);
                  setRotations([]);
                  cleanupPreviews();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                Change File
              </button>
            </div>
          </div>

          {/* Grid of Pages with Dynamic Rotation Transform */}
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {thumbnails.map((thumb, idx) => {
              const currentDelta = rotations[idx] || 0;

              return (
                <div
                  key={thumb.pageIndex}
                  className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-3 space-y-2 group shadow-2xs hover:border-blue-400 transition-all flex flex-col justify-between"
                >
                  {/* Page Number & Rotation Badge */}
                  <div className="flex items-center justify-between gap-1">
                    <span className="w-5 h-5 rounded-full bg-slate-950/80 text-white text-[10px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                        currentDelta !== 0
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {currentDelta}°
                    </span>
                  </div>

                  {/* Visual Canvas Thumbnail with CSS Rotation Animation */}
                  <div className="w-full aspect-[3/4] rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb.thumbnailUrl}
                      alt={`Page ${idx + 1}`}
                      className="max-w-full max-h-full object-contain transition-transform duration-300 ease-out"
                      style={{
                        transform: `rotate(${currentDelta}deg)`,
                      }}
                    />
                  </div>

                  {/* Per-Page Rotation Buttons */}
                  <div className="flex items-center justify-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => rotateSinglePage(idx, -90)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Rotate -90° (Left)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => rotateSinglePage(idx, 90)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Rotate +90° (Right)"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Rotations are applied losslessly to the underlying PDF content streams without recompressing images.
            </div>
            <button
              type="button"
              onClick={handleSaveRotatedPdf}
              disabled={isSaving}
              className="w-full sm:w-auto min-h-[46px] px-7 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-black transition-all shadow-md shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Applying Rotations...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Rotated PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
