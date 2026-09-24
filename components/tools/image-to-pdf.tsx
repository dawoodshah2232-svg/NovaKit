'use client';
import { MAX_IMAGE_FILE_BYTES, formatLimitBytes } from '@/lib/file-limits';
import { brandedFileName } from '@/lib/branded-filename';

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';
import {
  Image as ImageIcon,
  FileText,
  UploadCloud,
  Check,
  AlertCircle,
  RefreshCw,
  Trash2,
  ArrowUp,
  ArrowDown,
  Download,
  Sliders,
  Sparkles,
  Plus,
  Eye,
  FileCheck2,
} from 'lucide-react';

interface UploadedImage {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string;
  width: number;
  height: number;
}

type PageSizeOption = 'fit' | 'a4' | 'letter';
type PageOrientationOption = 'auto' | 'portrait' | 'landscape';
type MarginOption = 'none' | 'small' | 'standard';

function formatBytes(bytes: number, decimals = 1) {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Convert image file or canvas into pure PNG or JPEG ArrayBuffer
async function getImageBytesAndType(file: File): Promise<{ bytes: Uint8Array; isJpg: boolean }> {
  // If already pure JPEG, read directly
  if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
    const buffer = await file.arrayBuffer();
    return { bytes: new Uint8Array(buffer), isJpg: true };
  }

  // If already pure PNG, read directly
  if (file.type === 'image/png') {
    const buffer = await file.arrayBuffer();
    return { bytes: new Uint8Array(buffer), isJpg: false };
  }

  // For WebP or other formats, draw to canvas and convert to PNG
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to convert image to PNG'));
          return;
        }
        blob.arrayBuffer().then((buf) => {
          resolve({ bytes: new Uint8Array(buf), isJpg: false });
        }).catch(reject);
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };
    img.src = url;
  });
}

export function ImageToPdf() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [pageSize, setPageSize] = useState<PageSizeOption>('a4');
  const [orientation, setOrientation] = useState<PageOrientationOption>('auto');
  const [margin, setMargin] = useState<MarginOption>('none');

  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Read dimensions when dropping images
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const validFiles = acceptedFiles.filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setErrorMessage('Please select valid image files (JPG, PNG, WebP).');
      return;
    }

    // Guard: oversized images can exhaust browser tab memory — skip before loading.
    const oversized = validFiles.filter((f) => f.size > MAX_IMAGE_FILE_BYTES);
    const usableFiles = validFiles.filter((f) => f.size <= MAX_IMAGE_FILE_BYTES);
    if (oversized.length > 0) {
      setErrorMessage(
        `${oversized.length} image${oversized.length === 1 ? ' was' : 's were'} skipped — over the ${formatLimitBytes(MAX_IMAGE_FILE_BYTES)} per-image limit.`
      );
    }
    if (usableFiles.length === 0) return;

    const loadedList: UploadedImage[] = [];

    for (const file of usableFiles) {
      const previewUrl = URL.createObjectURL(file);
      const img = new Image();

      const dims = await new Promise<{ width: number; height: number }>((resolve) => {
        img.onload = () => {
          resolve({ width: img.naturalWidth || 800, height: img.naturalHeight || 600 });
        };
        img.onerror = () => {
          resolve({ width: 800, height: 600 });
        };
        img.src = previewUrl;
      });

      loadedList.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        previewUrl,
        width: dims.width,
        height: dims.height,
      });
    }

    setImages((prev) => [...prev, ...loadedList]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif'],
    },
    multiple: true,
  });

  // Reorder helpers
  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const copy = [...images];
    const item = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = item;
    setImages(copy);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const clearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Compile images to PDF using pdf-lib
  const handleCompilePdf = async () => {
    if (images.length === 0) {
      setErrorMessage('Please add at least one image to compile.');
      return;
    }

    setIsCompiling(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setProgressText('Initializing PDF document...');

    try {
      const pdfDoc = await PDFDocument.create();

      // Standard dimensions in points (72 points = 1 inch)
      const standardSizes = {
        a4: { width: 595.28, height: 841.89 },
        letter: { width: 612.0, height: 792.0 },
      };

      const marginSizes = {
        none: 0,
        small: 20,
        standard: 36,
      };

      const pad = marginSizes[margin];

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        setProgressText(`Embedding image ${i + 1} of ${images.length}: ${item.name}...`);

        const { bytes, isJpg } = await getImageBytesAndType(item.file);
        const embeddedImage = isJpg
          ? await pdfDoc.embedJpg(bytes)
          : await pdfDoc.embedPng(bytes);

        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;

        let pageWidth = imgWidth;
        let pageHeight = imgHeight;

        if (pageSize === 'fit') {
          pageWidth = imgWidth + pad * 2;
          pageHeight = imgHeight + pad * 2;
        } else {
          const base = standardSizes[pageSize];
          let isLandscape = false;
          if (orientation === 'auto') {
            isLandscape = imgWidth > imgHeight;
          } else {
            isLandscape = orientation === 'landscape';
          }

          pageWidth = isLandscape ? base.height : base.width;
          pageHeight = isLandscape ? base.width : base.height;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Calculate fitted scale within margins
        const availWidth = Math.max(10, pageWidth - pad * 2);
        const availHeight = Math.max(10, pageHeight - pad * 2);

        const scale = Math.min(availWidth / imgWidth, availHeight / imgHeight);
        const drawWidth = imgWidth * scale;
        const drawHeight = imgHeight * scale;

        // Center on page
        const x = pad + (availWidth - drawWidth) / 2;
        const y = pad + (availHeight - drawHeight) / 2;

        page.drawImage(embeddedImage, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });
      }

      setProgressText('Finalizing PDF stream...');
      pdfDoc.setTitle('Compiled Images Document');
      pdfDoc.setProducer('PDFEdit Studio (pdfedit.website)');
      pdfDoc.setCreator('PDFEdit Studio Client-Side Suite');

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      saveAs(blob, brandedFileName(`images-compiled-${Date.now().toString().slice(-6)}`, 'pdf'));

      trackToolExecution('image-to-pdf', true);
      setSuccessMessage(`Successfully compiled ${images.length} image${images.length > 1 ? 's' : ''} into a single PDF!`);
    } catch (err: unknown) {
      trackToolExecution('image-to-pdf', false);
      console.error('Error compiling PDF:', err);
      const msg = err instanceof Error ? err.message : 'Failed to compile images to PDF.';
      setErrorMessage(msg);
    } finally {
      setIsCompiling(false);
      setProgressText('');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Dropzone */}
      <div
        {...getRootProps()}
        className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer select-none ${
          isDragActive
            ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/20 scale-[1.01]'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-rose-400 dark:hover:border-rose-500 hover:bg-slate-50/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-sm">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {isDragActive ? 'Drop images here...' : 'Choose or Drag Images Here'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports JPG, JPEG, PNG, and WebP. Reorder images visually and compile into a single PDF.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex min-h-[48px] cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-2xl bg-[var(--pe-accent)] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--pe-shadow-accent)] transition-all hover:bg-[var(--pe-accent-hover)] active:scale-95"
          >
            Select Local Images
          </button>
        </div>
      </div>

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

      {/* Control Bar & Options */}
      {images.length > 0 && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-black text-slate-950 dark:text-white">
                Selected Images ({images.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Use arrows to adjust the order of pages in your compiled PDF.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearAll}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Compilation Settings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Page Size */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Page Size
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as PageSizeOption)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="a4">Standard A4 (210 x 297 mm)</option>
                <option value="letter">US Letter (8.5 x 11 in)</option>
                <option value="fit">Fit to Image Dimensions</option>
              </select>
            </div>

            {/* Orientation */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Orientation
              </label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as PageOrientationOption)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="auto">Auto (Match Image Aspect)</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            {/* Margins */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Margins
              </label>
              <select
                value={margin}
                onChange={(e) => setMargin(e.target.value as MarginOption)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="none">No Margin (Full Bleed)</option>
                <option value="small">Small Margin (7 mm)</option>
                <option value="standard">Standard Margin (13 mm)</option>
              </select>
            </div>
          </div>

          {/* Visual Images Order Gallery */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-3 space-y-2 group shadow-2xs hover:border-rose-400 transition-all"
              >
                {/* Page Number Badge */}
                <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-slate-950/80 text-white text-[10px] font-black flex items-center justify-center backdrop-blur-xs">
                  {idx + 1}
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  title="Remove image"
                  className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                {/* Thumbnail */}
                <div className="w-full h-36 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.previewUrl}
                    alt={img.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* File info */}
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={img.name}>
                    {img.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {img.width}×{img.height} • {formatBytes(img.size)}
                  </p>
                </div>

                {/* Reorder Buttons */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => moveImage(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Left / Forward"
                  >
                    <ArrowUp className="w-3.5 h-3.5 -rotate-90" />
                  </button>
                  <span className="text-[10px] font-extrabold text-slate-500">Page {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => moveImage(idx, 'down')}
                    disabled={idx === images.length - 1}
                    className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Right / Backward"
                  >
                    <ArrowDown className="w-3.5 h-3.5 -rotate-90" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Trigger */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Output will be compiled locally in browser memory with zero network uploads.
            </div>
            <button
              type="button"
              onClick={handleCompilePdf}
              disabled={isCompiling}
              className="w-full sm:w-auto min-h-[46px] px-7 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-black transition-all shadow-md shadow-rose-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isCompiling ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{progressText || 'Compiling PDF...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Compile & Download PDF ({images.length} {images.length === 1 ? 'Page' : 'Pages'})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
