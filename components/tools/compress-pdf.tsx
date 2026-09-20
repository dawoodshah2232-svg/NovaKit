'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { compress, CompressionPreset } from '@quicktoolsone/pdf-compress';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';
import {
  Minimize2,
  FileText,
  ShieldCheck,
  UploadCloud,
  Check,
  RefreshCw,
  AlertCircle,
  FileCheck2,
  Zap,
  TrendingDown,
  Sparkles,
  Layers,
  ArrowRight,
  Download,
} from 'lucide-react';

interface LoadedPdf {
  file: File;
  name: string;
  size: number;
  pageCount: number;
  arrayBuffer: ArrayBuffer;
}

interface CompressionSummary {
  originalSize: number;
  compressedSize: number;
  percentageSaved: number;
  bytesSaved: number;
  blob: Blob;
  fileName: string;
}

type CompressionLevel = 'extreme' | 'recommended' | 'less';

const LEVEL_CONFIG: Record<
  CompressionLevel,
  {
    title: string;
    description: string;
    badge: string;
    preset: CompressionPreset;
    targetDPI: number;
    jpegQuality: number;
    expectedSaving: string;
    details: string;
  }
> = {
  extreme: {
    title: 'Extreme Compression',
    description: 'Less quality, high compression',
    badge: 'Smallest File Size',
    preset: 'max',
    targetDPI: 96,
    jpegQuality: 0.5,
    expectedSaving: '~60% - 85%',
    details: 'Heavy raster downsampling and aggressive stream thinning. Perfect for strict email limits.',
  },
  recommended: {
    title: 'Recommended Compression',
    description: 'Good quality, good compression',
    badge: 'Optimal Balance',
    preset: 'balanced',
    targetDPI: 150,
    jpegQuality: 0.72,
    expectedSaving: '~35% - 65%',
    details: 'Smart image resampling while preserving crisp text vectors and font outlines.',
  },
  less: {
    title: 'Less Compression',
    description: 'High quality, less compression',
    badge: 'Highest Fidelity',
    preset: 'lossless',
    targetDPI: 220,
    jpegQuality: 0.88,
    expectedSaving: '~15% - 35%',
    details: 'Cross-Reference object stream compression and metadata purging without loss of image detail.',
  },
};

// Format byte sizes
function formatBytes(bytes: number, decimals = 1) {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function CompressPdf() {
  const [loadedPdf, setLoadedPdf] = useState<LoadedPdf | null>(null);
  const [level, setLevel] = useState<CompressionLevel>('recommended');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [summary, setSummary] = useState<CompressionSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // File Drop Handler
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setErrorMessage(null);
    setSummary(null);

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

      setLoadedPdf({
        file,
        name: file.name,
        size: file.size,
        pageCount,
        arrayBuffer,
      });
    } catch (err: unknown) {
      console.error('Failed to parse PDF:', err);
      setErrorMessage('Could not load this PDF document. It might be corrupted or locked.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const handleReset = () => {
    setLoadedPdf(null);
    setSummary(null);
    setErrorMessage(null);
    setProgressPercent(0);
    setProgressText('');
  };

  // Perform Client-Side Compression
  const handleCompressPdf = async () => {
    if (!loadedPdf) return;

    setErrorMessage(null);
    setIsProcessing(true);
    setProgressPercent(10);
    setProgressText('Initializing in-memory compression engine...');

    const config = LEVEL_CONFIG[level];

    try {
      let compressedBytes: Uint8Array | null = null;

      // Strategy 1: Attempt client-side compression via @quicktoolsone/pdf-compress
      try {
        setProgressPercent(30);
        setProgressText(`Applying ${config.title} algorithms...`);

        const result = await compress(loadedPdf.arrayBuffer, {
          preset: config.preset,
          targetDPI: config.targetDPI,
          jpegQuality: config.jpegQuality,
          onProgress: (evt) => {
            if (evt.progress) {
              setProgressPercent(Math.min(90, Math.max(30, Math.round(evt.progress))));
              setProgressText(`Compressing: ${evt.phase} (${Math.round(evt.progress)}%)...`);
            }
          },
        });

        if (result && result.pdf) {
          compressedBytes = new Uint8Array(result.pdf);
        }
      } catch (subErr) {
        console.warn('Advanced raster compressor bypassed, falling back to core stream optimization:', subErr);
      }

      // Strategy 2: Fallback / Secondary Pass via pdf-lib Object Streams
      if (!compressedBytes || compressedBytes.length >= loadedPdf.size) {
        setProgressPercent(70);
        setProgressText('Optimizing object streams and purging unreferenced structures...');

        const pdfDoc = await PDFDocument.load(loadedPdf.arrayBuffer, { ignoreEncryption: true });
        
        // Strip non-essential document metadata if extreme compression selected
        if (level === 'extreme') {
          pdfDoc.setTitle('');
          pdfDoc.setAuthor('');
          pdfDoc.setSubject('');
          pdfDoc.setKeywords([]);
          pdfDoc.setProducer('PDFEdit Studio (pdfedit.website)');
          pdfDoc.setCreator('PDFEdit Studio Client Compressor');
        }

        // Save with Object Streams enabled (PDF 1.5+ flate object stream compression)
        const objectStreamBytes = await pdfDoc.save({
          useObjectStreams: true,
          addDefaultPage: false,
          objectsPerTick: 60,
        });

        if (!compressedBytes || objectStreamBytes.length < compressedBytes.length) {
          compressedBytes = objectStreamBytes;
        }
      }

      setProgressPercent(95);
      setProgressText('Finalizing compressed PDF package...');

      const originalSize = loadedPdf.size;
      const finalSize = compressedBytes.length;
      const bytesSaved = Math.max(0, originalSize - finalSize);
      const percentageSaved =
        originalSize > 0 ? Math.max(0, parseFloat(((bytesSaved / originalSize) * 100).toFixed(1))) : 0;

      const blob = new Blob([compressedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const baseName = loadedPdf.name.replace(/\.[^/.]+$/, '');
      const outName = `${baseName}_compressed.pdf`;

      const resultSummary: CompressionSummary = {
        originalSize,
        compressedSize: finalSize,
        percentageSaved,
        bytesSaved,
        blob,
        fileName: outName,
      };

      setSummary(resultSummary);
      setProgressPercent(100);

      // Trigger instant client-side download
      saveAs(blob, outName);
      trackToolExecution('compress-pdf', true);
    } catch (err: unknown) {
      trackToolExecution('compress-pdf', false);
      console.error('Compression failed:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred while compressing the PDF file.'
      );
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Privacy Guarantee Header Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs font-medium text-blue-800 dark:text-blue-300 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            <strong>Zero Server Uploads:</strong> In-browser stream thinning and raster optimization. Your file is processed 100% locally in device memory.
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
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

      {/* Empty State / Massive Drag-and-Drop Zone */}
      {/* Empty State / Massive Drag-and-Drop Zone */}
      {!loadedPdf ? (
        <div
          {...getRootProps()}
          className={`group relative rounded-3xl border-2 sm:border-3 border-dashed transition-all duration-200 p-6 sm:p-14 text-center cursor-pointer min-h-[320px] sm:min-h-[380px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.12)] active:scale-[0.98] select-none touch-manipulation ${
            isDragActive
              ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/50 scale-[0.99] ring-4 ring-blue-500/20'
              : 'border-blue-300/80 dark:border-blue-900/60 hover:border-blue-600 dark:hover:border-blue-400'
          }`}
        >
          <input {...getInputProps()} aria-label="Select PDF file to compress" />
          <div className="max-w-md mx-auto space-y-4 sm:space-y-5">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-3xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform duration-200">
              <Minimize2 className="w-8 h-8 sm:w-12 sm:h-12" />
            </div>
            <div className="space-y-1 sm:space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
                {isDragActive ? 'Drop your PDF file here' : 'Drag & drop your PDF here'}
              </h3>
              <p className="text-xs sm:text-base text-slate-500 dark:text-slate-400">
                or tap below to choose a document from your device
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 pt-0.5">
                Choose Extreme, Recommended, or Less compression to reduce document size
              </p>
            </div>
            <button
              type="button"
              className="w-full sm:w-auto min-h-[50px] sm:min-h-[52px] px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-bold shadow-lg shadow-blue-500/25 active:scale-95 transition-all inline-flex items-center justify-center gap-2.5 cursor-pointer touch-manipulation"
            >
              <FileText className="w-5 h-5" />
              <span>Choose PDF File</span>
            </button>
          </div>
        </div>
      ) : (
        /* Workspace when document is loaded */
        <div className="space-y-5 pb-28 md:pb-0">
          {/* Active File Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate max-w-[200px] xs:max-w-xs sm:max-w-sm md:max-w-md">
                  {loadedPdf.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatBytes(loadedPdf.size)}
                  </span>
                  <span>•</span>
                  <span className="font-extrabold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60">
                    {loadedPdf.pageCount} {loadedPdf.pageCount === 1 ? 'Page' : 'Pages'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="min-h-[48px] px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center justify-center gap-1.5 self-stretch sm:self-center cursor-pointer active:scale-95 touch-manipulation"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Change Document</span>
            </button>
          </div>

          {/* Compression Level Selector Cards */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-8 shadow-sm space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
                  Optimization Level
                </span>
                <h4 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white tracking-tight">
                  Select Compression Preset
                </h4>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Current Size: <strong className="text-slate-900 dark:text-white">{formatBytes(loadedPdf.size)}</strong>
              </span>
            </div>

            {/* 3 Compression Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
              {(['extreme', 'recommended', 'less'] as CompressionLevel[]).map((lvlKey) => {
                const item = LEVEL_CONFIG[lvlKey];
                const isSelected = level === lvlKey;

                return (
                  <button
                    key={lvlKey}
                    type="button"
                    onClick={() => setLevel(lvlKey)}
                    className={`min-h-[48px] p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3.5 sm:gap-4 relative active:scale-[0.98] touch-manipulation ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      {/* Badge & Checkbox */}
                      <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            isSelected
                              ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>

                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <h5 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
                        {item.title}
                      </h5>

                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1.5 sm:mb-2">
                        {item.description}
                      </p>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {item.details}
                      </p>
                    </div>

                    <div className="pt-2.5 sm:pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500 dark:text-slate-400">Target reduction</span>
                      <span className="text-slate-900 dark:text-white font-mono">{item.expectedSaving}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Before & After Live Stats Card (If compression complete) */}
            {summary && (
              <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-emerald-50/90 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/70 shadow-xs space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-900 dark:text-emerald-200 truncate max-w-[200px] sm:max-w-none">
                      Complete • {summary.fileName}
                    </span>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-2xs shrink-0">
                    Saved {summary.percentageSaved}%
                  </span>
                </div>

                {/* Comparative Metric Columns */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center pt-1">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200/60 dark:border-emerald-800/40">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase">
                      Original
                    </span>
                    <span className="text-xs sm:text-base font-black text-slate-900 dark:text-white font-mono">
                      {formatBytes(summary.originalSize)}
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200/60 dark:border-emerald-800/40">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase">
                      Compressed
                    </span>
                    <span className="text-xs sm:text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatBytes(summary.compressedSize)}
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200/60 dark:border-emerald-800/40">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase">
                      Saved
                    </span>
                    <span className="text-xs sm:text-base font-black text-emerald-700 dark:text-emerald-300 font-mono">
                      -{formatBytes(summary.bytesSaved)}
                    </span>
                  </div>
                </div>

                {/* Download Again Button */}
                <button
                  type="button"
                  onClick={() => saveAs(summary.blob, summary.fileName)}
                  className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 touch-manipulation"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Compressed PDF Again</span>
                </button>
              </div>
            )}

            {/* Progress Bar (Visible while compressing) */}
            {isProcessing && (
              <div className="space-y-2 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/60 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
                    <span>{progressText}</span>
                  </span>
                  <span className="font-mono">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-blue-200/60 dark:bg-blue-900/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Sticky Bottom Action Bar (App-Level Frosted Glass on Mobile, In-Flow on Desktop) */}
            <div className="fixed bottom-0 left-0 right-0 z-50 md:static p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 md:border-t-0 md:bg-transparent md:backdrop-blur-none md:p-0 shadow-lg md:shadow-none transition-all">
              <div className="max-w-4xl mx-auto space-y-2">
                {/* Quick Mobile Micro-Status Bar */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 md:hidden px-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Preset: <strong className="text-blue-600 dark:text-blue-400">{LEVEL_CONFIG[level].title}</strong>
                  </span>
                  <span className="font-mono text-slate-600 dark:text-slate-300 font-bold">
                    {formatBytes(loadedPdf.size)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCompressPdf}
                  disabled={isProcessing}
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base md:text-lg transition-all flex items-center justify-center gap-2.5 sm:gap-3 shadow-lg active:scale-[0.98] cursor-pointer touch-manipulation ${
                    isProcessing
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/25'
                  }`}
                  aria-label="Compress and download PDF"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Compressing in Browser Memory...</span>
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-5 h-5" />
                      <span>Compress & Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
