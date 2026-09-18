'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import {
  UploadCloud,
  Download,
  RotateCcw,
  ShieldCheck,
  ImageIcon,
  CheckCircle2,
  FileWarning,
  Sliders,
} from 'lucide-react';

type OutputFormat = 'image/jpeg' | 'image/webp' | 'image/png';

interface ImageMeta {
  name: string;
  size: number;
  width?: number;
  height?: number;
  url: string;
}

export function ImageCompressor() {
  const [originalImage, setOriginalImage] = useState<ImageMeta | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [originalFileRef, setOriginalFileRef] = useState<File | null>(null);

  const [quality, setQuality] = useState<number>(75);
  const [format, setFormat] = useState<OutputFormat>('image/webp');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keep track of object URLs for cleanup
  const prevOriginalUrlRef = useRef<string | null>(null);
  const prevCompressedUrlRef = useRef<string | null>(null);

  const cleanupUrls = useCallback(() => {
    if (prevOriginalUrlRef.current) {
      URL.revokeObjectURL(prevOriginalUrlRef.current);
      prevOriginalUrlRef.current = null;
    }
    if (prevCompressedUrlRef.current) {
      URL.revokeObjectURL(prevCompressedUrlRef.current);
      prevCompressedUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupUrls();
    };
  }, [cleanupUrls]);

  // Format bytes helper
  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Perform client-side compression
  const compress = useCallback(
    async (file: File, qualityValue: number, outputFormat: OutputFormat) => {
      setIsProcessing(true);
      setErrorMessage(null);

      try {
        const options = {
          maxSizeMB: 50,
          maxWidthOrHeight: 3840, // 4K max boundary
          useWebWorker: true,
          initialQuality: qualityValue / 100,
          fileType: outputFormat,
          alwaysKeepResolution: true,
        };

        const resultFile = await imageCompression(file, options);
        setCompressedFile(resultFile);

        if (prevCompressedUrlRef.current) {
          URL.revokeObjectURL(prevCompressedUrlRef.current);
        }
        const newCompressedUrl = URL.createObjectURL(resultFile);
        prevCompressedUrlRef.current = newCompressedUrl;
        setCompressedUrl(newCompressedUrl);
      } catch (err) {
        console.error('Compression error:', err);
        setErrorMessage('Failed to compress image. Please try a different quality or format.');
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  // Handle image drop/selection
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      setOriginalFileRef(file);
      setErrorMessage(null);

      if (prevOriginalUrlRef.current) {
        URL.revokeObjectURL(prevOriginalUrlRef.current);
      }
      const newOriginalUrl = URL.createObjectURL(file);
      prevOriginalUrlRef.current = newOriginalUrl;

      // Extract image dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalImage({
          name: file.name,
          size: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
          url: newOriginalUrl,
        });
      };
      img.onerror = () => {
        setOriginalImage({
          name: file.name,
          size: file.size,
          url: newOriginalUrl,
        });
      };
      img.src = newOriginalUrl;

      // Auto-detect matching format if reasonable
      let initialFormat: OutputFormat = 'image/webp';
      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        initialFormat = 'image/jpeg';
      } else if (file.type === 'image/png') {
        initialFormat = 'image/png';
      }
      setFormat(initialFormat);

      // Trigger initial compression
      compress(file, quality, initialFormat);
    },
    [compress, quality]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    multiple: false,
  });

  // Re-compress when quality or format changes
  const handleQualityChange = (newQuality: number) => {
    setQuality(newQuality);
    if (originalFileRef) {
      compress(originalFileRef, newQuality, format);
    }
  };

  const handleFormatChange = (newFormat: OutputFormat) => {
    setFormat(newFormat);
    if (originalFileRef) {
      compress(originalFileRef, quality, newFormat);
    }
  };

  // Reset entire state
  const handleReset = () => {
    cleanupUrls();
    setOriginalImage(null);
    setCompressedFile(null);
    setCompressedUrl(null);
    setOriginalFileRef(null);
    setErrorMessage(null);
    setQuality(75);
  };

  // Instant download handler
  const handleDownload = () => {
    if (!compressedFile || !compressedUrl || !originalImage) return;

    let extension = 'webp';
    if (format === 'image/jpeg') extension = 'jpg';
    if (format === 'image/png') extension = 'png';

    const baseName = originalImage.name.substring(0, originalImage.name.lastIndexOf('.')) || originalImage.name;
    const fileName = `${baseName}-compressed.${extension}`;

    const link = document.createElement('a');
    link.href = compressedUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Savings calculation
  const savingsPercent =
    originalImage && compressedFile
      ? Math.max(0, Math.round(((originalImage.size - compressedFile.size) / originalImage.size) * 100))
      : 0;

  const savingsBytes =
    originalImage && compressedFile
      ? Math.max(0, originalImage.size - compressedFile.size)
      : 0;

  return (
    <div className="w-full space-y-6">
      {/* Privacy guarantee banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/70 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong>100% In-Browser Compression:</strong> Your photos are processed exclusively inside local memory. Zero bytes leave your browser.
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          Client-Side Web Worker
        </span>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-700 dark:text-red-300">
          <FileWarning className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Massive Foolproof Upload Zone (Child-Friendly & Obvious) */}
      {!originalImage ? (
        <div
          {...getRootProps()}
          className={`group relative rounded-3xl border-3 border-dashed transition-all duration-200 p-8 sm:p-16 text-center cursor-pointer min-h-[340px] sm:min-h-[380px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(59,130,246,0.12)] ${
            isDragActive
              ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/50 scale-[0.99] ring-4 ring-blue-500/20'
              : 'border-blue-300/80 dark:border-blue-900/60 hover:border-blue-600 dark:hover:border-blue-400'
          }`}
        >
          <input {...getInputProps()} aria-label="Select an image file to compress" />
          <div className="max-w-md mx-auto space-y-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform duration-200">
              <UploadCloud className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                {isDragActive ? 'Drop image right here' : 'Drag & drop your image here'}
              </h3>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
                or tap the button below to browse from your device
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 pt-1">
                Supports JPG, PNG, and WebP up to high-resolution 4K
              </p>
            </div>
            <button
              type="button"
              className="min-h-[52px] px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-bold shadow-lg shadow-blue-500/25 active:scale-95 transition-all inline-flex items-center gap-2.5"
            >
              <ImageIcon className="w-5 h-5" />
              <span>Choose Image File</span>
            </button>
          </div>
        </div>
      ) : (
        /* Workspace when image is uploaded */
        <div className="space-y-6">
          {/* Controls Bar: Sliders, Formats, and Reset */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Compression Settings</h3>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replace Image</span>
              </button>
            </div>

            {/* Quality Slider with Touch-Friendly Hit Target (Min 44px) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="quality-slider" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target Quality
                </label>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60">
                  {quality}%
                </span>
              </div>
              
              <div className="py-2 flex items-center min-h-[44px]">
                <input
                  id="quality-slider"
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={quality}
                  onChange={(e) => handleQualityChange(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  aria-label="Compression quality slider"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mr-1">Presets:</span>
                {[
                  { label: 'Max Savings', val: 40 },
                  { label: 'Balanced', val: 75 },
                  { label: 'High Fidelity', val: 90 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleQualityChange(preset.val)}
                    className={`min-h-[32px] px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all active:scale-95 ${
                      quality === preset.val
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Selector (Min 44px Touch Targets) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Target Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'image/webp' as OutputFormat, name: 'WebP', desc: 'Best compression' },
                  { id: 'image/jpeg' as OutputFormat, name: 'JPEG', desc: 'Universal photo' },
                  { id: 'image/png' as OutputFormat, name: 'PNG', desc: 'Lossless graphics' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleFormatChange(f.id)}
                    className={`min-h-[44px] p-2.5 rounded-xl text-center border transition-all active:scale-95 flex flex-col items-center justify-center ${
                      format === f.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs font-bold">{f.name}</span>
                    <span className="text-[10px] opacity-75 hidden xs:inline-block">{f.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Size Comparison Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-6 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left items-center">
              {/* Original */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Original File
                </span>
                <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {formatBytes(originalImage.size)}
                </div>
                {originalImage.width && originalImage.height && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {originalImage.width} × {originalImage.height} px
                  </p>
                )}
              </div>

              {/* Compressed */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Compressed File
                </span>
                <div className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                  {isProcessing ? (
                    <span className="animate-pulse">Optimizing...</span>
                  ) : compressedFile ? (
                    formatBytes(compressedFile.size)
                  ) : (
                    '—'
                  )}
                </div>
                <p className="text-[11px] text-blue-500/80 dark:text-blue-400/80 mt-0.5">
                  {format.replace('image/', '').toUpperCase()} format
                </p>
              </div>

              {/* Reduction Rate */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/50 flex flex-col justify-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Data Reduction
                </span>
                <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{savingsPercent}% Saved</span>
                </div>
                <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                  {formatBytes(savingsBytes)} reduced
                </p>
              </div>
            </div>
          </div>

          {/* Side-by-Side Visual Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Preview */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-3 sm:p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Original Image</span>
                <span className="text-slate-400 font-normal">{formatBytes(originalImage.size)}</span>
              </div>
              <div className="relative aspect-video sm:aspect-square max-h-72 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center border border-slate-200/60 dark:border-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={originalImage.url}
                  alt="Original preview"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Compressed Preview */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-3 sm:p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="text-blue-600 dark:text-blue-400">Compressed Output</span>
                {compressedFile && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {formatBytes(compressedFile.size)} ({savingsPercent}% smaller)
                  </span>
                )}
              </div>
              <div className="relative aspect-video sm:aspect-square max-h-72 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center border border-slate-200/60 dark:border-slate-800">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium">Compressing in memory...</span>
                  </div>
                ) : compressedUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={compressedUrl}
                    alt="Compressed preview"
                    className="w-full h-full object-contain"
                  />
                ) : null}
              </div>
            </div>
          </div>

          {/* Instant Download Button (Massive & Foolproof) */}
          <div className="sticky bottom-20 md:static z-30 pt-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isProcessing || !compressedFile}
              className="w-full min-h-[56px] px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-base sm:text-lg font-black shadow-xl shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
              aria-label="Download compressed image"
            >
              <Download className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>
                {isProcessing
                  ? 'Optimizing Image in Memory...'
                  : `Instant Download (${compressedFile ? formatBytes(compressedFile.size) : 'Ready'})`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
