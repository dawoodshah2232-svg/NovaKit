'use client';
import { brandedFileName } from '@/lib/branded-filename';

import React, { useState, useRef } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { trackToolExecution } from '@/lib/analytics';
import {
  Download,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Sliders,
  Palette,
  FileCode,
  Globe,
  Wifi,
  Mail,
  UserCheck,
  QrCode,
} from 'lucide-react';

interface ColorPreset {
  name: string;
  fg: string;
  bg: string;
  badge: string;
}

const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Classic Black', fg: '#0f172a', bg: '#ffffff', badge: 'Standard' },
  { name: 'Brand Blue', fg: '#1d4ed8', bg: '#ffffff', badge: 'Corporate' },
  { name: 'Emerald Green', fg: '#047857', bg: '#ffffff', badge: 'Fresh' },
  { name: 'Royal Violet', fg: '#6d28d9', bg: '#ffffff', badge: 'Modern' },
  { name: 'Dark Slate', fg: '#f8fafc', bg: '#0f172a', badge: 'Inverted' },
];

const CONTENT_PRESETS = [
  {
    label: 'Website URL',
    icon: Globe,
    value: 'https://www.pdfedit.website',
  },
  {
    label: 'Wi-Fi Network',
    icon: Wifi,
    value: 'WIFI:T:WPA;S:PDFEdit_Secure_5G;P:ClientSideSpeed2026;;',
  },
  {
    label: 'Email',
    icon: Mail,
    value: 'mailto:hello@pdfedit.website?subject=Inquiry%20from%20PDFEdit%20Studio',
  },
  {
    label: 'Business Card',
    icon: UserCheck,
    value:
      'BEGIN:VCARD\nVERSION:3.0\nN:Smith;Alex;;;\nFN:Alex Smith\nORG:PDFEdit Studio\nTITLE:Lead Product Designer\nTEL:+1-555-019-2834\nEMAIL:alex@pdfedit.website\nURL:https://www.pdfedit.website\nEND:VCARD',
  },
];

export function QrGenerator() {
  const [text, setText] = useState('https://www.pdfedit.website');
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState<number>(256);
  const [marginSize, setMarginSize] = useState<number>(3);
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');

  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);

  const effectiveValue = text.trim() || 'https://www.pdfedit.website';

  // Apply color preset
  const handleApplyPreset = (preset: ColorPreset) => {
    setFgColor(preset.fg);
    setBgColor(preset.bg);
  };

  // Reset to default
  const handleReset = () => {
    setText('https://www.pdfedit.website');
    setFgColor('#0f172a');
    setBgColor('#ffffff');
    setSize(256);
    setMarginSize(3);
    setLevel('M');
  };

  // Download Canvas as PNG
  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = brandedFileName('pdfedit-qrcode', 'png');
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      trackToolExecution('qr-generator', true);
    } catch (err) {
      console.error('Failed to download PNG:', err);
      alert('Unable to export PNG image.');
    }
  };

  // Download SVG Vector
  const handleDownloadSvg = () => {
    if (!svgWrapperRef.current) return;
    const svgEl = svgWrapperRef.current.querySelector('svg');
    if (!svgEl) return;

    try {
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.download = brandedFileName('pdfedit-qrcode', 'svg');
      link.href = svgUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(svgUrl);
      trackToolExecution('qr-generator', true);
    } catch (err) {
      console.error('Failed to download SVG:', err);
      alert('Unable to export SVG vector.');
    }
  };

  // Copy PNG image to clipboard
  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
          setCopiedImage(true);
          trackToolExecution('qr-generator', true);
          setTimeout(() => setCopiedImage(false), 2000);
        } catch (clipErr) {
          console.warn('Direct clipboard image copy not supported:', clipErr);
          // Fallback: Copy URL as text
          await navigator.clipboard.writeText(text);
          setCopiedText(true);
          setTimeout(() => setCopiedText(false), 2000);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Privacy Guarantee Header Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--pe-accent-soft)]/90 dark:bg-[var(--pe-accent-soft)]/40 border border-[var(--pe-accent)]/80 dark:border-[var(--pe-accent)]/60 text-xs font-medium text-[var(--pe-accent)] dark:text-[var(--pe-accent)] shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--pe-accent)] dark:text-[var(--pe-accent)] shrink-0" />
          <span>
            <strong>Zero Server Uploads:</strong> QR generation executes strictly within your browser&apos;s HTML5 Canvas hardware.
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)]/60 text-[var(--pe-accent)] dark:text-[var(--pe-accent)]">
          Client-Side Canvas
        </span>
      </div>

      {/* Main Grid Layout: Settings (Left) & Sticky Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Configuration Panels */}
        <div className="space-y-6 lg:col-span-7">
          {/* Panel 1: Content Input & Quick Fill Presets */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[var(--pe-accent)] dark:text-[var(--pe-accent)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  QR Content & Destination
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {text.length} chars
              </span>
            </div>

            {/* Quick Content Preset Pills */}
            <div className="flex flex-wrap gap-1.5">
              {CONTENT_PRESETS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setText(item.value)}
                    className="min-h-[34px] px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all inline-flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 text-[var(--pe-accent)] dark:text-[var(--pe-accent)]" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Textarea Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                URL, Text, or Wi-Fi Credentials
              </label>
              <textarea
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter URL or any text to encode into the QR code..."
                className="w-full p-3.5 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--pe-accent)]/40 focus:border-[var(--pe-accent)] transition-all resize-none font-mono text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Panel 2: Color Palette & Corporate Presets */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[var(--pe-accent)] dark:text-[var(--pe-accent)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Color Styling
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Contrast Safe
              </span>
            </div>

            {/* Corporate Color Presets */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Corporate Themes
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = fgColor === preset.fg && bgColor === preset.bg;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`min-h-[44px] p-2 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)]/40 dark:bg-[var(--pe-accent-soft)]/40 ring-2 ring-[var(--pe-accent)]/30'
                          : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-lg border border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0 shadow-2xs"
                        style={{ backgroundColor: preset.bg }}
                      >
                        <div
                          className="w-3 h-3 rounded-xs"
                          style={{ backgroundColor: preset.fg }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {preset.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {preset.badge}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Foreground Color Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Foreground (Pattern)</span>
                  <span className="font-mono text-[11px] text-slate-500">{fgColor}</span>
                </label>
                <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border-0 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 min-h-[36px] px-2 text-xs font-mono font-medium rounded-lg bg-transparent text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Background Color Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Background</span>
                  <span className="font-mono text-[11px] text-slate-500">{bgColor}</span>
                </label>
                <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border-0 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 min-h-[36px] px-2 text-xs font-mono font-medium rounded-lg bg-transparent text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Panel 3: Size, Margin & Error Correction Level */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[var(--pe-accent)] dark:text-[var(--pe-accent)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Dimensions & Reliability
                </h3>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-medium text-slate-400 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1 active:scale-95 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Settings</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Size Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Export Resolution
                  </span>
                  <span className="font-mono font-bold text-[var(--pe-accent)] dark:text-[var(--pe-accent)]">
                    {size} × {size} px
                  </span>
                </div>
                <input
                  type="range"
                  min="160"
                  max="480"
                  step="16"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value, 10))}
                  className="w-full accent-[var(--pe-accent)] h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>160px (Compact)</span>
                  <span>480px (Ultra-HD)</span>
                </div>
              </div>

              {/* Margin (Quiet Zone) Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Margin (Quiet Zone)
                  </span>
                  <span className="font-mono font-bold text-[var(--pe-accent)] dark:text-[var(--pe-accent)]">
                    {marginSize} modules
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="1"
                  value={marginSize}
                  onChange={(e) => setMarginSize(parseInt(e.target.value, 10))}
                  className="w-full accent-[var(--pe-accent)] h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0 (Flush)</span>
                  <span>6 (Wide Buffer)</span>
                </div>
              </div>
            </div>

            {/* Error Correction Level Selector */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Error Correction Level
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Higher = scans even if damaged/covered
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { lvl: 'L', label: 'Low', pct: '~7%' },
                    { lvl: 'M', label: 'Medium', pct: '~15%' },
                    { lvl: 'Q', label: 'Quartile', pct: '~25%' },
                    { lvl: 'H', label: 'High', pct: '~30%' },
                  ] as const
                ).map((item) => {
                  const isSelected = level === item.lvl;
                  return (
                    <button
                      key={item.lvl}
                      type="button"
                      onClick={() => setLevel(item.lvl)}
                      className={`min-h-[42px] p-2 rounded-xl text-center border active:scale-95 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs font-bold leading-none">{item.label}</div>
                      <div className="text-[10px] opacity-70 mt-0.5">{item.pct}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Live Canvas Preview & Action Bar */}
        <div className="space-y-4 lg:col-span-5 lg:sticky lg:top-20">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6 text-center">
            {/* Top Preview Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--pe-accent)] dark:text-[var(--pe-accent)]" />
                <span>Live Canvas Preview</span>
              </span>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                Ready to Scan
              </span>
            </div>

            {/* Massive White Card with Centered Canvas */}
            <div
              className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-center min-h-[280px] sm:min-h-[320px] transition-colors shadow-inner"
              style={{ backgroundColor: bgColor }}
            >
              <div className="transition-transform duration-150 hover:scale-[1.02]">
                <QRCodeCanvas
                  ref={canvasRef}
                  value={effectiveValue}
                  size={size}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level={level}
                  marginSize={marginSize}
                />
              </div>

              {/* Hidden SVG component for vector extraction */}
              <div ref={svgWrapperRef} style={{ display: 'none' }}>
                <QRCodeSVG
                  value={effectiveValue}
                  size={size}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level={level}
                  marginSize={marginSize}
                />
              </div>
            </div>

            {/* Technical Spec Matrix */}
            <div className="grid grid-cols-3 gap-2 text-left p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Resolution</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {size}×{size}px
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Correction</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                  Level {level}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Security</span>
 <span className="text-xs font-bold text-[var(--pe-accent)] ">
                  Local RAM
                </span>
              </div>
            </div>

            {/* Primary & Secondary Action Export Buttons */}
            <div className="space-y-2.5 pt-1">
              {/* Primary Download PNG Button */}
              <button
                type="button"
                onClick={handleDownloadPng}
                className="w-full min-h-[52px] px-6 py-3 rounded-2xl bg-gradient-to-r from-[var(--pe-accent)] to-[var(--pe-accent-hover)] hover:from-[var(--pe-accent-hover)] hover:to-[var(--pe-accent)] text-white text-sm sm:text-base font-black shadow-lg shadow-[var(--pe-shadow-accent)] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Download QR Code (PNG)</span>
              </button>

              {/* Secondary Buttons: Download SVG & Copy Image */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <FileCode className="w-4 h-4 text-[var(--pe-accent)] dark:text-[var(--pe-accent)]" />
                  <span>Download SVG</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyImage}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  {copiedImage || copiedText ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span>Copy Image</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
