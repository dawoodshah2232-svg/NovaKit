'use client';
import { validateUploadSize } from '@/lib/file-limits';
import { brandedFileName } from '@/lib/branded-filename';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';
import {
  FileImage,
  FileText,
  ShieldCheck,
  UploadCloud,
  Check,
  RefreshCw,
  AlertCircle,
  FileCheck2,
  Download,
  Archive,
  Eye,
  Sliders,
  Sparkles,
  Maximize2,
  Layers,
} from 'lucide-react';

interface LoadedPdf {
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

interface ConvertedPage {
  pageNumber: number;
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
  size: number;
}

type ImageFormat = 'png' | 'jpeg';
type ImageResolution = 1 | 2 | 3;

// Configure PDF.js worker in browser
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function PdfToImage({ jpgOnly = false, analyticsSlug = 'pdf-to-image' }: { jpgOnly?: boolean; analyticsSlug?: string } = {}) {
  const [loadedPdf, setLoadedPdf] = useState<LoadedPdf | null>(null);
  const [format, setFormat] = useState<ImageFormat>(jpgOnly ? 'jpeg' : 'png');
  const [resolution, setResolution] = useState<ImageResolution>(2);
  const [jpegQuality, setJpegQuality] = useState<number>(0.92);

  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const [convertedPages, setConvertedPages] = useState<ConvertedPage[]>([]);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Keep track of preview URLs to revoke on unmount or reset
  const previewUrlsRef = useRef<string[]>([]);

  const revokeAllPreviews = useCallback(() => {
    previewUrlsRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Error revoking object URL:', err);
      }
    });
    previewUrlsRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      revokeAllPreviews();
    };
  }, [revokeAllPreviews]);

  // Dropzone file handler
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setErrorMessage(null);
      setSuccessMessage(null);
      revokeAllPreviews();
      setConvertedPages([]);

      const file = acceptedFiles[0];
      if (!file) return;

      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMessage('Please upload a valid PDF document.');
        return;
      }

      // Guard: oversized files can exhaust browser tab memory — reject before parsing.
      const sizeError = validateUploadSize(file);
      if (sizeError) {
        setErrorMessage(sizeError);
        return;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();

        // Ensure worker source is set
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            window.location.origin + '/pdf.worker.min.mjs';
        }

        // Load document to count pages (using a slice clone so file buffer is never detached)
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer.slice(0)),
        });
        const pdfDoc = await loadingTask.promise;
        const pageCount = pdfDoc.numPages;
        await pdfDoc.cleanup();

        if (pageCount === 0) {
          setErrorMessage('This PDF document contains no readable pages.');
          return;
        }

        setLoadedPdf({
          file,
          name: file.name,
          size: file.size,
          pageCount,
        });
      } catch (err: unknown) {
        console.error('Failed to parse PDF:', err);
        setErrorMessage(
          'Could not parse this PDF file. It might be password-protected or corrupted.'
        );
      }
    },
    [revokeAllPreviews]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const handleReset = () => {
    revokeAllPreviews();
    setLoadedPdf(null);
    setConvertedPages([]);
    setErrorMessage(null);
    setSuccessMessage(null);
    setProgressPercent(0);
    setProgressText('');
  };

  // Convert PDF Pages to Images using HTML5 Canvas
  const handleConvertPdf = async () => {
    if (!loadedPdf) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    revokeAllPreviews();
    setConvertedPages([]);
    setIsConverting(true);
    setProgressPercent(5);
    setProgressText('Loading PDF in local Canvas engine...');

    try {
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          window.location.origin + '/pdf.worker.min.mjs';
      }

      const arrayBuffer = await loadedPdf.file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      });
      const pdfDoc = await loadingTask.promise;
      const totalPages = pdfDoc.numPages;

      const results: ConvertedPage[] = [];
      const newUrls: string[] = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const percent = Math.round((pageNum / totalPages) * 100);
        setProgressPercent(percent);
        setProgressText(`Rendering page ${pageNum} of ${totalPages} onto Canvas (${percent}%)...`);

        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: resolution });

        // Create offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const context = canvas.getContext('2d', { alpha: false });

        if (!context) {
          throw new Error('Failed to create Canvas 2D rendering context.');
        }

        // Fill background with white for JPEG clarity
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);

        const renderContext = {
          canvas,
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        // Extract Blob from Canvas
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const qualityParam = format === 'png' ? undefined : jpegQuality;

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), mimeType, qualityParam);
        });

        // Memory cleanup of canvas buffers
        canvas.width = 0;
        canvas.height = 0;

        if (!blob) {
          throw new Error(`Failed to generate image for page ${pageNum}.`);
        }

        const previewUrl = URL.createObjectURL(blob);
        newUrls.push(previewUrl);

        results.push({
          pageNumber: pageNum,
          blob,
          previewUrl,
          width: Math.floor(viewport.width),
          height: Math.floor(viewport.height),
          size: blob.size,
        });

        // Clean up cached rendering resources for this page
        page.cleanup();
      }
      await pdfDoc.cleanup();

      previewUrlsRef.current = newUrls;
      setConvertedPages(results);
      setSuccessMessage(
        `Successfully converted all ${totalPages} pages to high-resolution ${format.toUpperCase()} images!`
      );
      trackToolExecution(analyticsSlug, true);
    } catch (err: unknown) {
      trackToolExecution(analyticsSlug, false);
      console.error('PDF Conversion error:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred while converting the PDF.'
      );
    } finally {
      setIsConverting(false);
      setProgressText('');
    }
  };

  // Download a single page image
  const handleDownloadSingle = (page: ConvertedPage) => {
    if (!loadedPdf) return;
    const baseName = loadedPdf.name.replace(/\.[^/.]+$/, '');
    const pageStr = String(page.pageNumber).padStart(2, '0');
    const ext = format === 'png' ? 'png' : 'jpg';
    const fileName = brandedFileName(`${baseName}_page_${pageStr}`, ext);
    saveAs(page.blob, fileName);
  };

  // Download all converted images into a single ZIP archive
  const handleDownloadAllZip = async () => {
    if (!loadedPdf || convertedPages.length === 0) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();
      const baseName = loadedPdf.name.replace(/\.[^/.]+$/, '');
      const ext = format === 'png' ? 'png' : 'jpg';
      const padLen = String(convertedPages.length).length;

      convertedPages.forEach((page) => {
        const pageStr = String(page.pageNumber).padStart(Math.max(2, padLen), '0');
        const fileName = brandedFileName(`${baseName}_page_${pageStr}`, ext);
        zip.file(fileName, page.blob);
      });

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const zipFileName = brandedFileName(`${baseName}_${format.toUpperCase()}_images`, 'zip');
      saveAs(zipBlob, zipFileName);
    } catch (err: unknown) {
      console.error('Error generating ZIP archive:', err);
      setErrorMessage('Failed to generate ZIP archive.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Privacy Guarantee Header Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs font-medium text-amber-800 dark:text-amber-300 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Zero Server Uploads:</strong> In-browser HTML5 Canvas rasterization. Images are rendered directly inside your device memory.
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
          HTML5 Canvas Engine
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
          className={`group relative rounded-3xl border-3 border-dashed transition-all duration-200 p-8 sm:p-16 text-center cursor-pointer min-h-[340px] sm:min-h-[380px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(245,158,11,0.12)] ${
            isDragActive
              ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/50 scale-[0.99] ring-4 ring-amber-500/20'
              : 'border-amber-300/80 dark:border-amber-900/60 hover:border-amber-600 dark:hover:border-amber-400'
          }`}
        >
          <input {...getInputProps()} aria-label="Select PDF file to convert to images" />
          <div className="max-w-md mx-auto space-y-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform duration-200">
              <FileImage className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                {isDragActive ? 'Drop your PDF file here' : 'Drag & drop your PDF here'}
              </h3>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
                or tap below to choose a document from your computer
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 pt-1">
                Convert every page into high-resolution PNG or JPG images with batch ZIP download
              </p>
            </div>
            <button
              type="button"
              className="min-h-[52px] px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-sm sm:text-base font-bold shadow-lg shadow-amber-500/25 active:scale-95 transition-all inline-flex items-center gap-2.5 cursor-pointer"
            >
              <FileText className="w-5 h-5" />
              <span>Choose PDF File</span>
            </button>
          </div>
        </div>
      ) : (
        /* Workspace when document is loaded */
        <div className="space-y-6">
          {/* Active File Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <FileImage className="w-6 h-6" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                  {loadedPdf.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold">{formatBytes(loadedPdf.size)}</span>
                  <span>•</span>
                  <span className="font-extrabold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/60">
                    {loadedPdf.pageCount} {loadedPdf.pageCount === 1 ? 'Page' : 'Pages'} Detected
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5 self-start sm:self-center cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change Document</span>
            </button>
          </div>

          {/* Conversion Settings Card */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-0.5">
                Raster Settings
              </span>
              <h4 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white tracking-tight">
                Output Format & Resolution
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Format Selection (PNG vs JPG) */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  Image Format
                </label>
                <div className={jpgOnly ? 'grid grid-cols-1 gap-2.5' : 'grid grid-cols-2 gap-2.5'}>
                  {!jpgOnly && <button
                    type="button"
                    onClick={() => setFormat('png')}
                    className={`min-h-[48px] p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      format === 'png'
                        ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block">
                        PNG
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Lossless • Sharpest Text
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        format === 'png'
                          ? 'border-amber-600 bg-amber-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {format === 'png' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </button>}

                  <button
                    type="button"
                    onClick={() => setFormat('jpeg')}
                    className={`min-h-[48px] p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      format === 'jpeg'
                        ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block">
                        JPG
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Compact • Smaller Size
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        format === 'jpeg'
                          ? 'border-amber-600 bg-amber-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {format === 'jpeg' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </button>
                </div>
              </div>

              {/* Resolution / DPI Scale */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  Target Resolution & DPI
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { scale: 1 as const, label: '1x Standard', dpi: '72 DPI' },
                    { scale: 2 as const, label: '2x High-Res', dpi: '144 DPI' },
                    { scale: 3 as const, label: '3x Ultra', dpi: '216 DPI' },
                  ].map((res) => (
                    <button
                      key={res.scale}
                      type="button"
                      onClick={() => setResolution(res.scale)}
                      className={`min-h-[48px] p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                        resolution === res.scale
                          ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 ring-2 ring-amber-500/20 text-slate-950 dark:text-white font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xs font-extrabold block">{res.label}</span>
                      <span className="text-[10px] opacity-75 font-mono">{res.dpi}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* JPEG Quality Slider (if JPEG selected) */}
            {format === 'jpeg' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    JPEG Compression Quality
                  </span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                    {Math.round(jpegQuality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.0"
                  step="0.05"
                  value={jpegQuality}
                  onChange={(e) => setJpegQuality(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            )}

            {/* Progress Bar (Visible while converting) */}
            {isConverting && (
              <div className="space-y-2 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" />
                    <span>{progressText}</span>
                  </span>
                  <span className="font-mono">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-amber-200/60 dark:bg-amber-900/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Convert Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConvertPdf}
                disabled={isConverting}
                className={`w-full min-h-[54px] px-6 py-3.5 rounded-2xl font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 shadow-lg active:scale-[0.98] cursor-pointer ${
                  isConverting
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-amber-500/25'
                }`}
              >
                {isConverting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Rasterizing PDF Pages in Memory...</span>
                  </>
                ) : (
                  <>
                    <FileImage className="w-5 h-5" />
                    <span>
                      Convert {loadedPdf.pageCount}{' '}
                      {loadedPdf.pageCount === 1 ? 'Page' : 'Pages'} to {format.toUpperCase()}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Post-Conversion Output Gallery & Masonry Grid */}
          {convertedPages.length > 0 && (
            <div className="space-y-5 animate-in fade-in">
              {/* Batch Action Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Generated Images</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                      {convertedPages.length} {convertedPages.length === 1 ? 'Image' : 'Images'}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Download individual pages or package the entire document into a single ZIP archive.
                  </p>
                </div>

                {/* Primary Batch ZIP Download Button */}
                <button
                  type="button"
                  onClick={handleDownloadAllZip}
                  disabled={isZipping}
                  className="min-h-[46px] px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-amber-500 dark:bg-white dark:hover:bg-amber-500 text-white dark:text-slate-900 dark:hover:text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all inline-flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  {isZipping ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creating ZIP Package...</span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4" />
                      <span>Download All Images (ZIP)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Responsive Thumbnails Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                {convertedPages.map((page) => (
                  <div
                    key={page.pageNumber}
                    className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    {/* Image Preview Container */}
                    <div className="relative bg-slate-100 dark:bg-slate-800 aspect-[3/4] flex items-center justify-center overflow-hidden border-b border-slate-200/80 dark:border-slate-800 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={page.previewUrl}
                        alt={`Page ${page.pageNumber}`}
                        className="w-full h-full object-contain p-2 group-hover:scale-102 transition-transform duration-200"
                        loading="lazy"
                      />

                      {/* Top Badge */}
                      <div className="absolute top-2.5 left-2.5">
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-slate-900/80 text-white backdrop-blur-xs shadow-xs">
                          Page {page.pageNumber}
                        </span>
                      </div>

                      {/* Fullscreen Preview Action */}
                      <a
                        href={page.previewUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:scale-105 active:scale-95"
                        title="View Full Size"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-3.5 space-y-2.5 bg-white dark:bg-slate-900">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <span>
                          {page.width} × {page.height} px
                        </span>
                        <span className="font-semibold">{formatBytes(page.size)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDownloadSingle(page)}
                        className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-amber-500 dark:bg-slate-800 dark:hover:bg-amber-500 text-slate-800 hover:text-white dark:text-slate-200 dark:hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Page {page.pageNumber}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Batch Download Bar */}
              {convertedPages.length > 3 && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleDownloadAllZip}
                    disabled={isZipping}
                    className="min-h-[50px] px-8 py-3 rounded-2xl bg-slate-900 hover:bg-amber-500 dark:bg-white dark:hover:bg-amber-500 text-white dark:text-slate-900 dark:hover:text-white text-sm font-black shadow-lg active:scale-95 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Archive className="w-4 h-4" />
                    <span>Download All {convertedPages.length} Images in Single ZIP</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
