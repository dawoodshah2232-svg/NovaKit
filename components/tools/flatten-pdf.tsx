'use client';
import { brandedFileName } from '@/lib/branded-filename';

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
  Download,
  Sparkles,
  FileText,
  RotateCcw,
  ShieldCheck,
  Zap,
  Image as ImageIcon,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

type FlattenMode = 'vector' | 'raster';

interface PagePreview {
  pageNumber: number;
  thumbnailUrl: string;
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function FlattenPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [flattenMode, setFlattenMode] = useState<FlattenMode>('vector');
  const [hasFormFields, setHasFormFields] = useState<boolean>(false);
  const [formFieldsCount, setFormFieldsCount] = useState<number>(0);

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

        // Check for form fields via pdf-lib
        try {
          const checkDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
          const form = checkDoc.getForm();
          const fields = form.getFields();
          setFormFieldsCount(fields.length);
          setHasFormFields(fields.length > 0);
        } catch {
          setHasFormFields(false);
        }

        setLoadingProgress('Rendering PDF previews...');
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;

        const previews: PagePreview[] = [];

        for (let i = 1; i <= Math.min(totalPages, 12); i++) {
          setLoadingProgress(`Rendering page ${i} of ${totalPages}...`);
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
              });
            }
          }
          canvas.width = 0;
          canvas.height = 0;
        }

        setPages(previews);
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
  });

  const handleFlattenAndDownload = async () => {
    if (!arrayBuffer || !file) {
      setErrorMessage('No PDF loaded.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const baseName = file.name.replace(/\.[^/.]+$/, '');

    try {
      if (flattenMode === 'vector') {
        // Native vector form flattening via pdf-lib
        setLoadingProgress('Flattening vector form fields...');
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        try {
          const form = pdfDoc.getForm();
          form.flatten();
        } catch (formErr) {
          console.warn('No AcroForm or form already flat:', formErr);
        }

        pdfDoc.setProducer('PDFEdit Studio (pdfedit.website)');
        pdfDoc.setCreator('PDFEdit Studio Flatten PDF');

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        saveAs(blob, brandedFileName(`${baseName}-flattened`, 'pdf'));

        trackToolExecution('flatten-pdf', true);
        setSuccessMessage('Successfully flattened form fields and locked document content!');
      } else {
        // High-resolution raster visual bake
        setLoadingProgress('Rendering and baking document pages...');
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer.slice(0)) });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;

        const newDoc = await PDFDocument.create();

        for (let i = 1; i <= totalPages; i++) {
          setLoadingProgress(`Baking page ${i} of ${totalPages} (Print Quality)...`);
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 }); // 2x print quality

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (page.render({ canvas, canvasContext: ctx, viewport } as any)).promise;
            const imgDataUrl = canvas.toDataURL('image/jpeg', 0.92);
            const jpgImage = await newDoc.embedJpg(imgDataUrl);

            // Add new page with original dimensions
            const newPage = newDoc.addPage([viewport.width / 2.0, viewport.height / 2.0]);
            newPage.drawImage(jpgImage, {
              x: 0,
              y: 0,
              width: viewport.width / 2.0,
              height: viewport.height / 2.0,
            });
          }
          canvas.width = 0;
          canvas.height = 0;
        }

        newDoc.setProducer('PDFEdit Studio (pdfedit.website)');
        newDoc.setCreator('PDFEdit Studio Flatten PDF (Visual Bake)');

        const pdfBytes = await newDoc.save();
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        saveAs(blob, brandedFileName(`${baseName}-baked-flattened`, 'pdf'));

        trackToolExecution('flatten-pdf', true);
        setSuccessMessage('Successfully baked all pages into uneditable static PDF document!');
      }
    } catch (err: unknown) {
      trackToolExecution('flatten-pdf', false);
      console.error('Error flattening PDF:', err);
      const msg = err instanceof Error ? err.message : 'Failed to flatten PDF.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
      setLoadingProgress('');
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
              ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)]/60 dark:bg-[var(--pe-accent-soft)]/20 scale-[1.01]'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-[var(--pe-accent)] dark:hover:border-[var(--pe-accent)] hover:bg-slate-50/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)]/60 text-[var(--pe-accent)] dark:text-[var(--pe-accent)] flex items-center justify-center mx-auto shadow-sm">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Choose a PDF to Flatten
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Make form fields, annotations, signatures, and interactive layers permanent & uneditable
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
              <div className="w-10 h-10 rounded-xl bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)]/60 text-[var(--pe-accent)] dark:text-[var(--pe-accent)] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {file.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {pages.length} pages • {formatBytes(file.size)} •{' '}
                  {hasFormFields
                    ? `${formFieldsCount} interactive form field(s) detected`
                    : 'Standard PDF'}
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

          {/* Mode Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vector Form Flatten */}
            <div
              onClick={() => setFlattenMode('vector')}
              className={`p-5 rounded-3xl border-2 cursor-pointer transition select-none flex flex-col justify-between ${
                flattenMode === 'vector'
                  ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)]/60 dark:bg-[var(--pe-accent-soft)]/40 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)]/60 text-[var(--pe-accent)] dark:text-[var(--pe-accent)] flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  {flattenMode === 'vector' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--pe-accent)] dark:text-[var(--pe-accent)] bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)]/60 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" /> Recommended
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Form Field Flatten (Vector)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Converts interactive text boxes, checkboxes, and radio buttons into permanent text.
                  Maintains original crystal-clear vector font sharpness and lightweight file size.
                </p>
              </div>
            </div>

            {/* Raster Visual Bake */}
            <div
              onClick={() => setFlattenMode('raster')}
              className={`p-5 rounded-3xl border-2 cursor-pointer transition select-none flex flex-col justify-between ${
                flattenMode === 'raster'
                  ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)]/60 dark:bg-[var(--pe-accent-soft)]/40 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)]/60 text-[var(--pe-accent)] dark:text-[var(--pe-accent)] flex items-center justify-center">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  {flattenMode === 'raster' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--pe-accent)] dark:text-[var(--pe-accent)] bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)]/60 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" /> High Security
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Full Visual Bake (Raster Freeze)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Bakes entire pages, complex annotations, comments, and drawn signatures into 2×
                  crisp print-quality image pages. Completely eliminates all hidden or editable layers.
                </p>
              </div>
            </div>
          </div>

          {/* Page Grid Previews */}
          <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Document Pages ({pages.length})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {pages.map((p) => (
                <div
                  key={p.pageNumber}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-center"
                >
                  <span className="text-[10px] font-semibold text-slate-400 block pb-1">
                    Page {p.pageNumber}
                  </span>
                  <div className="aspect-3/4 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.thumbnailUrl}
                      alt={`Page ${p.pageNumber}`}
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="sticky bottom-4 p-4 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Mode:{' '}
              <span className="font-bold text-[var(--pe-accent)] dark:text-[var(--pe-accent)]">
                {flattenMode === 'vector' ? 'Vector Form Flatten' : 'Full Visual Bake (Raster)'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleFlattenAndDownload}
              disabled={isProcessing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[var(--pe-accent)] hover:bg-[var(--pe-accent-hover)] active:scale-95 text-white font-bold text-sm shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{loadingProgress || 'Flattening PDF...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Flatten PDF & Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
