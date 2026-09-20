'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';
import {
  Stamp,
  UploadCloud,
  Check,
  AlertCircle,
  RefreshCw,
  Download,
  FileText,
  Sliders,
  Type,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

type WatermarkPosition = 'diagonal' | 'center' | 'header' | 'footer';

interface ColorPreset {
  name: string;
  hex: string;
  rgb: [number, number, number];
}

const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Crimson', hex: '#E11D48', rgb: [0.88, 0.11, 0.28] },
  { name: 'Slate', hex: '#475569', rgb: [0.28, 0.33, 0.41] },
  { name: 'Blue', hex: '#2563EB', rgb: [0.14, 0.39, 0.92] },
  { name: 'Emerald', hex: '#059669', rgb: [0.02, 0.59, 0.41] },
  { name: 'Amber', hex: '#D97706', rgb: [0.85, 0.47, 0.02] },
];

const TEXT_PRESETS = ['CONFIDENTIAL', 'DRAFT', 'SAMPLE', 'DO NOT COPY', 'PRIVATE'];

function formatBytes(bytes: number, decimals = 1) {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function WatermarkPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);

  // Watermark Settings
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [position, setPosition] = useState<WatermarkPosition>('diagonal');
  const [fontSize, setFontSize] = useState<number>(48);
  const [opacity, setOpacity] = useState<number>(30); // 10 to 90 %
  const [selectedColor, setSelectedColor] = useState<ColorPreset>(COLOR_PRESETS[0]);

  // Preview Page 1
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDims, setPreviewDims] = useState<{ width: number; height: number }>({ width: 400, height: 550 });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isWatermarking, setIsWatermarking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const previewRef = useRef<string | null>(null);

  const cleanupPreview = useCallback(() => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => cleanupPreview();
  }, [cleanupPreview]);

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
    cleanupPreview();

    try {
      const buffer = await pdfFile.arrayBuffer();
      setArrayBuffer(buffer);

      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      setPageCount(pdf.numPages);

      // Render first page as live preview
      const page1 = await pdf.getPage(1);
      const viewport = page1.getViewport({ scale: 0.8 });
      setPreviewDims({ width: viewport.width, height: viewport.height });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (page1.render({ canvasContext: ctx, viewport } as any)).promise;
        const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.9));
        if (blob) {
          const url = URL.createObjectURL(blob);
          previewRef.current = url;
          setPreviewUrl(url);
        }
      }
    } catch (err: unknown) {
      console.error('Error loading PDF preview:', err);
      const msg = err instanceof Error ? err.message : 'Failed to inspect PDF.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [cleanupPreview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  // Apply Watermark and Download
  const handleApplyWatermark = async () => {
    if (!arrayBuffer || !file) return;

    if (!watermarkText.trim()) {
      setErrorMessage('Please provide text for the watermark.');
      return;
    }

    setIsWatermarking(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const helvetica = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      const [r, g, b] = selectedColor.rgb;
      const normalizedOpacity = opacity / 100;

      for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = helvetica.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = helvetica.heightAtSize(fontSize);

        let x = 0;
        let y = 0;
        let rotationAngle = 0;

        if (position === 'diagonal') {
          // Angle in degrees
          rotationAngle = 45;
          // Approximate center taking rotation into account
          const rad = (rotationAngle * Math.PI) / 180;
          x = width / 2 - (textWidth * Math.cos(rad)) / 2;
          y = height / 2 - (textWidth * Math.sin(rad)) / 2;
        } else if (position === 'center') {
          rotationAngle = 0;
          x = (width - textWidth) / 2;
          y = (height - textHeight) / 2;
        } else if (position === 'header') {
          rotationAngle = 0;
          x = (width - textWidth) / 2;
          y = height - 40 - textHeight;
        } else if (position === 'footer') {
          rotationAngle = 0;
          x = (width - textWidth) / 2;
          y = 30;
        }

        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font: helvetica,
          color: rgb(r, g, b),
          opacity: normalizedOpacity,
          rotate: degrees(rotationAngle),
        });
      }

      pdfDoc.setProducer('PDFEdit Studio (pdfedit.website)');
      pdfDoc.setCreator('PDFEdit Studio Watermarker');

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      saveAs(blob, `${baseName}-watermarked.pdf`);

      trackToolExecution('watermark-pdf', true);
      setSuccessMessage(`Watermark applied across all ${pages.length} pages successfully!`);
    } catch (err: unknown) {
      trackToolExecution('watermark-pdf', false);
      console.error('Error applying watermark:', err);
      const msg = err instanceof Error ? err.message : 'Failed to apply watermark to PDF.';
      setErrorMessage(msg);
    } finally {
      setIsWatermarking(false);
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
              ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/20 scale-[1.01]'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-rose-400 dark:hover:border-rose-500 hover:bg-slate-50/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-sm">
              <Stamp className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {isDragActive ? 'Drop PDF here...' : 'Choose or Drag PDF Here'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Apply custom watermark text with adjustable opacity, angle, and position across all pages.
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
          <RefreshCw className="w-8 h-8 animate-spin text-rose-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Inspecting PDF & Generating Preview...</h4>
          <p className="text-xs text-slate-400">Rendering live interactive watermark workspace in browser memory...</p>
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
      {file && previewUrl && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          {/* File Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-600" />
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white truncate max-w-sm" title={file.name}>
                  {file.name}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {pageCount} total pages • {formatBytes(file.size)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setArrayBuffer(null);
                setPreviewUrl(null);
                cleanupPreview();
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors self-start sm:self-center"
            >
              Choose Another File
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Settings Form Column */}
            <div className="lg:col-span-7 space-y-5">
              {/* Text Input & Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-rose-500" />
                  <span>Watermark Text</span>
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="Enter watermark string..."
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {TEXT_PRESETS.map((txt) => (
                    <button
                      key={txt}
                      type="button"
                      onClick={() => setWatermarkText(txt)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        watermarkText === txt
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {txt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Position choices */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Position & Layout
                </label>
                <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
                  {[
                    { id: 'diagonal', label: 'Diagonal 45°' },
                    { id: 'center', label: 'Center Flat' },
                    { id: 'header', label: 'Top Header' },
                    { id: 'footer', label: 'Bottom Footer' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setPosition(pos.id as WatermarkPosition)}
                      className={`h-10 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        position === pos.id
                          ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Watermark Color
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        selectedColor.name === color.name
                          ? 'border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders: Opacity & Font Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Opacity */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300 uppercase tracking-wider">Opacity</span>
                    <span className="font-mono text-slate-500">{opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={opacity}
                    onChange={(e) => setOpacity(parseInt(e.target.value, 10))}
                    className="w-full accent-rose-600"
                  />
                </div>

                {/* Font Size */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300 uppercase tracking-wider">Font Size</span>
                    <span className="font-mono text-slate-500">{fontSize} pt</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="96"
                    step="2"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                    className="w-full accent-rose-600"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleApplyWatermark}
                  disabled={isWatermarking}
                  className="w-full min-h-[46px] px-8 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-black transition-all shadow-md shadow-rose-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isWatermarking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Watermarking All {pageCount} Pages...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Apply & Download Watermarked PDF ({pageCount} Pages)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Interactive Page Preview Column */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">
                Page 1 Live Watermark Preview
              </span>
              <div className="relative rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-md overflow-hidden max-w-[320px]">
                {/* Base Page Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Page 1 Preview"
                  className="w-full h-auto block select-none pointer-events-none"
                />

                {/* CSS Watermark Overlay that mirrors configuration in real time */}
                <div
                  className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
                  style={{
                    alignItems:
                      position === 'header'
                        ? 'flex-start'
                        : position === 'footer'
                        ? 'flex-end'
                        : 'center',
                    padding: position === 'header' || position === 'footer' ? '20px' : '0',
                  }}
                >
                  <span
                    className="font-black select-none text-center whitespace-nowrap leading-none transition-all"
                    style={{
                      color: selectedColor.hex,
                      opacity: opacity / 100,
                      fontSize: `${Math.max(12, fontSize * 0.45)}px`,
                      transform: position === 'diagonal' ? 'rotate(-45deg)' : 'none',
                    }}
                  >
                    {watermarkText || 'WATERMARK'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
