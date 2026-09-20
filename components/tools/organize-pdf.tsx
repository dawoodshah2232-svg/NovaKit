'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';
import {
  Layers,
  UploadCloud,
  Check,
  AlertCircle,
  RefreshCw,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Download,
  Copy,
  RotateCcw,
  Sparkles,
  FileText,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

interface PageItem {
  id: string;
  originalIndex: number; // 0-based
  thumbnailUrl: string;
  width: number;
  height: number;
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function OrganizePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [originalOrder, setOriginalOrder] = useState<PageItem[]>([]);

  const [isLoadingPages, setIsLoadingPages] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);

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
    setIsLoadingPages(true);
    cleanupThumbnails();

    try {
      const buffer = await pdfFile.arrayBuffer();
      setArrayBuffer(buffer);

      setLoadingProgress('Reading PDF pages...');
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;

      const pageItems: PageItem[] = [];

      for (let i = 1; i <= totalPages; i++) {
        setLoadingProgress(`Rendering thumbnail for page ${i} of ${totalPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 }); // Compact thumbnail scale

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
            thumbnailsRef.current.push(url);
            pageItems.push({
              id: `page-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              originalIndex: i - 1,
              thumbnailUrl: url,
              width: viewport.width,
              height: viewport.height,
            });
          }
        }
      }

      setPages(pageItems);
      setOriginalOrder([...pageItems]);
    } catch (err: unknown) {
      console.error('Error loading PDF pages:', err);
      const msg = err instanceof Error ? err.message : 'Failed to load PDF pages.';
      setErrorMessage(msg);
    } finally {
      setIsLoadingPages(false);
      setLoadingProgress('');
    }
  }, [cleanupThumbnails]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  // Page order modifications
  const movePage = (index: number, direction: 'left' | 'right') => {
    const target = direction === 'left' ? index - 1 : index + 1;
    if (target < 0 || target >= pages.length) return;

    const copy = [...pages];
    const item = copy[index];
    copy[index] = copy[target];
    copy[target] = item;
    setPages(copy);
  };

  const deletePage = (index: number) => {
    if (pages.length <= 1) {
      setErrorMessage('The PDF must contain at least one page.');
      return;
    }
    const copy = [...pages];
    copy.splice(index, 1);
    setPages(copy);
  };

  const duplicatePage = (index: number) => {
    const item = pages[index];
    const copy = [...pages];
    copy.splice(index + 1, 0, {
      ...item,
      id: `clone-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    });
    setPages(copy);
  };

  const reversePages = () => {
    setPages([...pages].reverse());
  };

  const resetOrder = () => {
    setPages([...originalOrder]);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Export rearranged PDF
  const handleExportPdf = async () => {
    if (!arrayBuffer || pages.length === 0) {
      setErrorMessage('No pages available to export.');
      return;
    }

    setIsExporting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const srcDoc = await PDFDocument.load(arrayBuffer);
      const newDoc = await PDFDocument.create();

      const pageIndices = pages.map((p) => p.originalIndex);
      const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);

      copiedPages.forEach((cp) => newDoc.addPage(cp));

      newDoc.setProducer('PDFEdit Studio (pdfedit.website)');
      newDoc.setCreator('PDFEdit Studio Client-Side Suite');

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'document';
      saveAs(blob, `${baseName}-reorganized.pdf`);

      trackToolExecution('organize-pdf', true);
      setSuccessMessage(`Successfully exported reorganized PDF with ${pages.length} pages!`);
    } catch (err: unknown) {
      trackToolExecution('organize-pdf', false);
      console.error('Error exporting reorganized PDF:', err);
      const msg = err instanceof Error ? err.message : 'Failed to export reorganized PDF.';
      setErrorMessage(msg);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Dropzone */}
      {!file && (
        <div
          {...getRootProps()}
          className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer select-none ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/20 scale-[1.01]'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {isDragActive ? 'Drop PDF here...' : 'Choose or Drag PDF Here'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Rearrange, delete, duplicate, and reorder pages visually with instant local export.
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
      {isLoadingPages && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{loadingProgress}</h4>
          <p className="text-xs text-slate-400">Rendering high-speed client-side page previews...</p>
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

      {/* Reorder Workspace */}
      {file && pages.length > 0 && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          {/* File Header Bar & Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white truncate max-w-sm" title={file.name}>
                  {file.name}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {pages.length} total pages in sequence • {formatBytes(file.size)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={reversePages}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Reverse Order
              </button>
              <button
                type="button"
                onClick={resetOrder}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPages([]);
                  setOriginalOrder([]);
                  cleanupThumbnails();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                Change File
              </button>
            </div>
          </div>

          {/* Page Cards Grid */}
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {pages.map((p, idx) => (
              <div
                key={p.id}
                className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-2.5 space-y-2 group shadow-2xs hover:border-indigo-400 transition-all"
              >
                {/* Page Sequence Number */}
                <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-slate-950/80 text-white text-[10px] font-black flex items-center justify-center backdrop-blur-xs shadow-xs">
                  {idx + 1}
                </div>

                {/* Original Page Reference */}
                <div className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-md bg-white/85 dark:bg-slate-900/85 text-[9px] font-bold text-slate-500 backdrop-blur-xs">
                  Orig #{p.originalIndex + 1}
                </div>

                {/* Thumbnail Preview */}
                <div className="w-full aspect-[3/4] rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.thumbnailUrl}
                    alt={`Page ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Per-Page Controls Toolbar */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => movePage(idx, 'left')}
                    disabled={idx === 0}
                    className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Left"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => duplicatePage(idx)}
                    className="p-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Duplicate Page"
                  >
                    <Copy className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => deletePage(idx)}
                    className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete Page"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => movePage(idx, 'right')}
                    disabled={idx === pages.length - 1}
                    className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Right"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Ready to export {pages.length} organized pages to a new clean PDF.
            </div>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExporting}
              className="w-full sm:w-auto min-h-[46px] px-7 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-black transition-all shadow-md shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Reorganizing & Saving...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export Reordered PDF ({pages.length} Pages)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
