'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { trackToolExecution } from '@/lib/analytics';
import {
  Palette,
  UploadCloud,
  Image as ImageIcon,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Download,
  Code2,
  Sliders,
  FileWarning,
} from 'lucide-react';

export interface ExtractedColor {
  hex: string;
  rgb: [number, number, number];
  isDark: boolean;
  textColor: string;
}

interface ImageMetadata {
  name: string;
  size: number;
  width: number;
  height: number;
  url: string;
}

// Convert RGB tuple to Hex
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Check if RGB is perceptually dark
function isColorDark(r: number, g: number, b: number): boolean {
  // Relative luminance formula (sRGB)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.55;
}

// Robust fallback canvas color quantizer
function extractColorsFallback(img: HTMLImageElement, colorCount = 8): { dominant: ExtractedColor; palette: ExtractedColor[] } {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const defaultColor: ExtractedColor = { hex: '#3B82F6', rgb: [59, 130, 246], isDark: false, textColor: '#0f172a' };
    return { dominant: defaultColor, palette: [defaultColor] };
  }

  const sampleSize = 100;
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

  const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
  const colorBuckets: Map<string, { r: number; g: number; b: number; count: number }> = new Map();

  for (let i = 0; i < imgData.length; i += 16) {
    const r = imgData[i];
    const g = imgData[i + 1];
    const b = imgData[i + 2];
    const a = imgData[i + 3];

    if (a < 128) continue;
    // Skip near-white or extreme edge cases
    if (r > 250 && g > 250 && b > 250) continue;

    // Quantize to 32-step buckets
    const qr = Math.round(r / 32) * 32;
    const qg = Math.round(g / 32) * 32;
    const qb = Math.round(b / 32) * 32;
    const key = `${qr},${qg},${qb}`;

    const existing = colorBuckets.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      colorBuckets.set(key, { r, g, b, count: 1 });
    }
  }

  const sorted = Array.from(colorBuckets.values()).sort((a, b) => b.count - a.count);
  const selected = sorted.slice(0, Math.max(colorCount, 6));

  const palette: ExtractedColor[] = selected.map((item) => {
    const hex = rgbToHex(item.r, item.g, item.b);
    const dark = isColorDark(item.r, item.g, item.b);
    return {
      hex,
      rgb: [item.r, item.g, item.b],
      isDark: dark,
      textColor: dark ? '#ffffff' : '#0f172a',
    };
  });

  const dominant = palette[0] || {
    hex: '#1E293B',
    rgb: [30, 41, 59],
    isDark: true,
    textColor: '#ffffff',
  };

  return { dominant, palette };
}

// Sample gradient images generated via client-side SVG for instant testing
const SAMPLE_PREVIEWS = [
  {
    name: 'Sunset Horizon',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FF512F"/><stop offset="35%" stop-color="#DD2476"/><stop offset="70%" stop-color="#7928CA"/><stop offset="100%" stop-color="#2D3748"/></linearGradient></defs><rect width="600" height="400" fill="url(#g1)"/><circle cx="300" cy="180" r="80" fill="#FFE066" opacity="0.9"/><rect y="260" width="600" height="140" fill="#1A202C" opacity="0.75"/></svg>`,
  },
  {
    name: 'Neon Cyberpunk',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0F2027"/><stop offset="50%" stop-color="#203A43"/><stop offset="100%" stop-color="#2C5364"/></linearGradient></defs><rect width="600" height="400" fill="url(#g2)"/><circle cx="150" cy="150" r="90" fill="#00F2FE" opacity="0.8"/><circle cx="450" cy="220" r="110" fill="#4FACFE" opacity="0.7"/><rect x="220" y="80" width="160" height="240" fill="#FF0844" opacity="0.85" rx="20"/></svg>`,
  },
  {
    name: 'Emerald Forest',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g3" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#0575E6"/><stop offset="40%" stop-color="#00F260"/><stop offset="70%" stop-color="#11998E"/><stop offset="100%" stop-color="#38EF7D"/></linearGradient></defs><rect width="600" height="400" fill="url(#g3)"/><circle cx="200" cy="300" r="140" fill="#0F3854" opacity="0.6"/><circle cx="420" cy="140" r="80" fill="#FAFFD1" opacity="0.8"/></svg>`,
  },
];

export function ColorExtractor() {
  const [imageMeta, setImageMeta] = useState<ImageMetadata | null>(null);
  const [dominantColor, setDominantColor] = useState<ExtractedColor | null>(null);
  const [palette, setPalette] = useState<ExtractedColor[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Copied state mapping (color hex => boolean)
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedCss, setCopiedCss] = useState(false);

  const hiddenImgRef = useRef<HTMLImageElement | null>(null);

  // Core processing function
  const processImage = useCallback((imgElement: HTMLImageElement, fileMeta: ImageMetadata) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Dynamic import of colorthief with canvas fallback
      import('colorthief')
        .then(async ({ getColor, getPalette }) => {
          try {
            const rawDominant = await getColor(imgElement);
            const rawPalette = await getPalette(imgElement, { colorCount: 8, quality: 5 });

            if (rawDominant && rawPalette && rawPalette.length > 0) {
              const domHex = rawDominant.hex().toUpperCase();
              const domRgb = rawDominant.array();
              const domDark = rawDominant.isDark;

              setDominantColor({
                hex: domHex,
                rgb: domRgb,
                isDark: domDark,
                textColor: domDark ? '#ffffff' : '#0f172a',
              });

              const pal: ExtractedColor[] = rawPalette.map((c) => {
                const hex = c.hex().toUpperCase();
                const rgb = c.array();
                const isDark = c.isDark;
                return {
                  hex,
                  rgb,
                  isDark,
                  textColor: isDark ? '#ffffff' : '#0f172a',
                };
              });

              setPalette(pal);
              setImageMeta(fileMeta);
              setIsProcessing(false);
              trackToolExecution('color-extractor');
              return;
            }
          } catch (e) {
            console.warn('ColorThief extraction warning, using canvas fallback:', e);
          }

          // Fallback
          const res = extractColorsFallback(imgElement, 8);
          setDominantColor(res.dominant);
          setPalette(res.palette);
          setImageMeta(fileMeta);
          setIsProcessing(false);
          trackToolExecution('color-extractor');
        })
        .catch(() => {
          const res = extractColorsFallback(imgElement, 8);
          setDominantColor(res.dominant);
          setPalette(res.palette);
          setImageMeta(fileMeta);
          setIsProcessing(false);
          trackToolExecution('color-extractor');
        });
    } catch (err) {
      console.error('Failed to process image colors:', err);
      const res = extractColorsFallback(imgElement, 8);
      setDominantColor(res.dominant);
      setPalette(res.palette);
      setImageMeta(fileMeta);
      setIsProcessing(false);
    }
  }, []);

  // Dropzone Handler
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select a valid image file (PNG, JPG, WebP, SVG).');
        return;
      }

      setErrorMessage(null);
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const meta: ImageMetadata = {
          name: file.name,
          size: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
          url: objectUrl,
        };
        processImage(img, meta);
      };

      img.onerror = () => {
        setErrorMessage('Failed to decode the selected image.');
      };

      img.src = objectUrl;
    },
    [processImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'],
    },
    maxFiles: 1,
    multiple: false,
  });

  // Load sample image
  const handleLoadSample = (sample: (typeof SAMPLE_PREVIEWS)[0]) => {
    setErrorMessage(null);
    const blob = new Blob([sample.svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const meta: ImageMetadata = {
        name: `${sample.name}.svg`,
        size: blob.size,
        width: 600,
        height: 400,
        url,
      };
      processImage(img, meta);
    };

    img.src = url;
  };

  // Copy specific color hex
  const handleCopyColor = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedColor(hex);
      setTimeout(() => setCopiedColor(null), 1800);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  // Copy all HEX codes
  const handleCopyAll = async () => {
    if (palette.length === 0) return;
    const allHexes = palette.map((c) => c.hex).join(', ');
    try {
      await navigator.clipboard.writeText(allHexes);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error('Failed to copy all:', err);
    }
  };

  // Export CSS Variables
  const handleCopyCss = async () => {
    if (palette.length === 0) return;
    const cssVars = `:root {\n${palette
      .map((c, i) => `  --color-${i + 1}: ${c.hex}; /* rgb(${c.rgb.join(', ')}) */`)
      .join('\n')}\n}`;

    try {
      await navigator.clipboard.writeText(cssVars);
      setCopiedCss(true);
      setTimeout(() => setCopiedCss(false), 2000);
    } catch (err) {
      console.error('Failed to copy CSS:', err);
    }
  };

  // Download Palette as JSON
  const handleDownloadJson = () => {
    if (palette.length === 0) return;
    const data = {
      image: imageMeta?.name || 'palette',
      dominant: dominantColor,
      palette,
      extractedAt: new Date().toISOString(),
      tool: 'PDFEdit Studio Color Palette Extractor',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `palette-${(imageMeta?.name || 'colors').replace(/\.[^/.]+$/, '')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Reset
  const handleReset = () => {
    if (imageMeta?.url) {
      URL.revokeObjectURL(imageMeta.url);
    }
    setImageMeta(null);
    setDominantColor(null);
    setPalette([]);
    setErrorMessage(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Privacy Guarantee Header Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-pink-50/90 dark:bg-pink-950/40 border border-pink-200/80 dark:border-pink-800/60 text-xs font-medium text-pink-800 dark:text-pink-300 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
          <span>
            <strong>Zero Server Uploads:</strong> Pixel color sampling executes strictly in local browser memory via HTML5 Canvas.
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/60 text-pink-700 dark:text-pink-300">
          Client-Side ColorThief
        </span>
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-700 dark:text-red-300">
          <FileWarning className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Zone (Visible when no image is loaded) */}
      {!imageMeta ? (
        <div className="space-y-6">
          <div
            {...getRootProps()}
            className={`group relative rounded-3xl border-3 border-dashed transition-all duration-200 p-8 sm:p-14 text-center cursor-pointer min-h-[340px] sm:min-h-[380px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(236,72,153,0.12)] ${
              isDragActive
                ? 'border-pink-500 bg-pink-50/70 dark:bg-pink-950/50 scale-[0.99] ring-4 ring-pink-500/20'
                : 'border-pink-300/80 dark:border-pink-900/60 hover:border-pink-600 dark:hover:border-pink-400'
            }`}
          >
            <input {...getInputProps()} aria-label="Select an image file to extract colors" />
            <div className="max-w-md mx-auto space-y-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-pink-50 dark:bg-pink-950/80 text-pink-600 dark:text-pink-400 flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform duration-200">
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
                  Supports PNG, JPG, WebP, SVG, and GIF up to 25MB
                </p>
              </div>
              <button
                type="button"
                className="min-h-[52px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 hover:from-pink-500 hover:to-rose-500 text-white text-sm sm:text-base font-bold shadow-lg shadow-pink-500/25 active:scale-95 transition-all inline-flex items-center gap-2.5 cursor-pointer"
              >
                <ImageIcon className="w-5 h-5" />
                <span>Choose Image File</span>
              </button>
            </div>
          </div>

          {/* Quick Demo Previews */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                <span>Or test instantly with sample images:</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">1-click demo</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_PREVIEWS.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => handleLoadSample(sample)}
                  className="min-h-[48px] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-pink-300 dark:hover:border-pink-800 transition-all text-left flex items-center gap-3 cursor-pointer active:scale-95"
                >
                  <div
                    className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs"
                    dangerouslySetInnerHTML={{ __html: sample.svg }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {sample.name}
                    </div>
                    <div className="text-[10px] text-pink-600 dark:text-pink-400 font-semibold">
                      Extract Palette →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Workspace: Image Preview & Extracted Palette Grid */
        <div className="space-y-6">
          {/* Top Controls Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                <img
                  src={imageMeta.url}
                  alt={imageMeta.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {imageMeta.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {imageMeta.width} × {imageMeta.height} px • {(imageMeta.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleCopyAll}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied All!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All HEX</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyCss}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                {copiedCss ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied CSS!</span>
                  </>
                ) : (
                  <>
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Export CSS</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadJson}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Upload New</span>
              </button>
            </div>
          </div>

          {/* Two Column Layout: Left (Image Preview & Dominant) & Right (Palette Swatches) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Image Preview + Dominant Color */}
            <div className="space-y-6 lg:col-span-4">
              {/* Image Preview Card */}
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Source Image
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Preview</span>
                </div>
                <div className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 aspect-video flex items-center justify-center">
                  <img
                    src={imageMeta.url}
                    alt={imageMeta.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Dominant Color Card */}
              {dominantColor && (
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                      <span>Dominant Color</span>
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/60 text-pink-800 dark:text-pink-300">
                      Primary
                    </span>
                  </div>

                  {/* Big Color Block */}
                  <button
                    type="button"
                    onClick={() => handleCopyColor(dominantColor.hex)}
                    className="w-full h-28 rounded-2xl p-4 flex flex-col justify-between text-left transition-transform active:scale-[0.98] shadow-md cursor-pointer group"
                    style={{ backgroundColor: dominantColor.hex }}
                  >
                    <div className="flex justify-between items-start">
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs"
                        style={{
                          backgroundColor: dominantColor.isDark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.7)',
                          color: dominantColor.textColor,
                        }}
                      >
                        Tap to Copy
                      </span>
                      {copiedColor === dominantColor.hex ? (
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-emerald-500 text-white flex items-center gap-1">
                          <Check className="w-3 h-3" /> Copied!
                        </span>
                      ) : (
                        <Copy
                          className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity"
                          style={{ color: dominantColor.textColor }}
                        />
                      )}
                    </div>
                    <div style={{ color: dominantColor.textColor }}>
                      <div className="text-xl font-black font-mono tracking-tight">
                        {dominantColor.hex}
                      </div>
                      <div className="text-[11px] opacity-85 font-mono">
                        rgb({dominantColor.rgb.join(', ')})
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Extracted Palette Grid */}
            <div className="space-y-4 lg:col-span-8">
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Palette className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                      <span>Extracted Color Palette ({palette.length} Swatches)</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Tap any swatch to instantly copy its HEX code to your clipboard.
                    </p>
                  </div>
                </div>

                {/* Swatch Grid (Flawlessly responsive on 390px mobile viewports with min 44px tap targets) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {palette.map((color, index) => {
                    const isCopied = copiedColor === color.hex;

                    return (
                      <button
                        key={`${color.hex}-${index}`}
                        type="button"
                        onClick={() => handleCopyColor(color.hex)}
                        className="group flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 overflow-hidden shadow-xs hover:shadow-md hover:border-pink-300 dark:hover:border-pink-800 transition-all text-left cursor-pointer active:scale-95"
                      >
                        {/* Upper Color Tile */}
                        <div
                          className="w-full h-20 sm:h-24 p-2.5 flex items-start justify-between relative transition-transform duration-200 group-hover:scale-[1.02]"
                          style={{ backgroundColor: color.hex }}
                        >
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs font-mono"
                            style={{
                              backgroundColor: color.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)',
                              color: color.textColor,
                            }}
                          >
                            #{index + 1}
                          </span>

                          {isCopied ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-sm">
                              <Check className="w-3 h-3" /> Copied!
                            </span>
                          ) : (
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs"
                              style={{
                                backgroundColor: color.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.8)',
                                color: color.textColor,
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        {/* Lower Meta Block (Min 44px tap target) */}
                        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 min-h-[48px] flex flex-col justify-center">
                          <div className="text-xs font-black font-mono text-slate-900 dark:text-white flex items-center justify-between">
                            <span>{color.hex}</span>
                            <span className="text-[10px] font-normal text-slate-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                              Copy
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate mt-0.5">
                            rgb({color.rgb.join(', ')})
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
