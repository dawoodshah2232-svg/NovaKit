'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Image as ImageIcon,
  FileText,
  Receipt,
  Calculator,
  QrCode,
  Palette,
  FileSearch,
  KeyRound,
  Scissors,
  Minimize2,
  FileImage,
  ShieldAlert,
  ArrowUpRight,
  Search,
  ShieldCheck,
  Zap,
  Lock,
  SlidersHorizontal,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  RotateCw,
  Stamp,
  Unlock,
  FilePenLine,
  Trash2,
  FolderOutput,
  Hash,
  Crop,
  EyeOff,
} from 'lucide-react';
import { TOOLS_CONFIG, ToolConfig, ToolCategory } from '@/lib/tools-config';

// Map iconName to Lucide icon components
const ICON_MAP: Record<string, React.ElementType> = {
  Image: ImageIcon,
  FileText: FileText,
  Receipt: Receipt,
  Calculator: Calculator,
  QrCode: QrCode,
  Palette: Palette,
  FileSearch: FileSearch,
  KeyRound: KeyRound,
  Scissors: Scissors,
  Minimize2: Minimize2,
  FileImage: FileImage,
  ShieldAlert: ShieldAlert,
  RotateCw: RotateCw,
  Stamp: Stamp,
  Layers: Layers,
  Unlock: Unlock,
  FilePenLine: FilePenLine,
  Trash2: Trash2,
  FolderOutput: FolderOutput,
  Hash: Hash,
  Crop: Crop,
  EyeOff: EyeOff,
};

const CATEGORIES: { id: ToolCategory; label: string }[] = [
  { id: 'All', label: 'All Tools' },
  { id: 'PDF', label: 'PDF Suite' },
  { id: 'Image', label: 'Image & Design' },
  { id: 'Finance', label: 'Finance' },
  { id: 'Text', label: 'Text & SEO' },
  { id: 'Security', label: 'Security' },
];

export function ToolsHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('All');

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: TOOLS_CONFIG.length };
    CATEGORIES.forEach(({ id }) => {
      if (id !== 'All') {
        counts[id] = TOOLS_CONFIG.filter((t) => t.category === id).length;
      }
    });
    return counts;
  }, []);

  // Filtered tools based on real-time search and sticky category
  const filteredTools = useMemo(() => {
    return TOOLS_CONFIG.filter((tool) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'All' || tool.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="w-full space-y-8 sm:space-y-12">
      {/* TinyWow / Apple Style Search Hero Section */}
      <section className="relative pt-4 pb-2 text-center max-w-4xl mx-auto space-y-6">
        {/* Subtle Ambient Radial Glow */}
        <div
          aria-hidden="true"
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-80 sm:w-[540px] h-60 sm:h-80 bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-violet-500/10 blur-3xl -z-10 pointer-events-none rounded-full"
        />

        {/* Micro Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-slate-800 dark:text-slate-200 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-900 dark:text-white">PDFEdit Studio Directory</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-slate-500 dark:text-slate-400">Zero Server Uploads</span>
        </div>

        {/* High-Contrast Corporate Typography */}
        <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.12]">
          Professional PDF Tools.{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            100% Free & In-Browser.
          </span>
        </h1>

        {/* Trust & Advantage Hero Banner (Stripe/Apple-Grade Pill) */}
        <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 px-4 sm:px-6 py-2 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-cyan-500/10 dark:from-blue-950/50 dark:via-indigo-950/40 dark:to-cyan-950/50 border border-blue-500/30 dark:border-cyan-500/30 text-slate-800 dark:text-slate-100 shadow-[0_4px_24px_rgba(37,99,235,0.08)] backdrop-blur-xl text-xs sm:text-sm font-semibold tracking-tight transition-all duration-300 hover:border-blue-500/50 dark:hover:border-cyan-400/50">
          <span className="text-amber-500 font-bold text-sm">⚡</span>
          <span className="text-slate-950 dark:text-white font-extrabold">No Signup Required</span>
          <span className="text-slate-300 dark:text-slate-700 hidden xs:inline">•</span>
          <span className="text-blue-600 dark:text-cyan-400 font-extrabold">100% Free Forever</span>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
          <span className="text-slate-700 dark:text-slate-300 font-medium">Instant Local PDF Processing (Zero Server Uploads)</span>
        </div>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Comprehensive suite of ultra-fast in-browser PDF utilities. Convert, extract images, organize, unlock, rotate, watermark, split, and edit metadata without cloud storage.
        </p>

        {/* Prominent TinyWow-Style Search Bar */}
        <div className="max-w-2xl mx-auto pt-1">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
            <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200/90 dark:border-slate-800 shadow-lg shadow-slate-900/5 group-focus-within:border-blue-500 transition-all p-2 sm:p-2.5">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 ml-2.5 sm:ml-3 shrink-0 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search PDF tools (e.g., Image to PDF, Rotate, Watermark, Split, Unlock)..."
                className="w-full px-3 sm:px-4 py-2.5 text-sm sm:text-base font-medium bg-transparent text-slate-950 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors mr-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0 select-none">
                <span>{filteredTools.length}</span>
                <span>{filteredTools.length === 1 ? 'tool' : 'tools'}</span>
              </div>
            </div>
          </div>

          {/* Quick Keyword Suggestion Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-3 text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-semibold mr-1">Popular:</span>
            {['Image to PDF', 'PDF to Images', 'Organize PDF', 'Rotate PDF', 'Watermark PDF', 'Unlock PDF', 'Split PDF', 'PDF Merger'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearchQuery(tag)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 text-[11px] font-medium transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* AdSense Safe-Zone Banner (Preserving Zero CLS below Search Hero) */}
      <section className="w-full" aria-label="Sponsored Content">
        <div className="w-full rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 text-center shadow-xs">
          <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-2">
            <span>Advertisement Safe-Zone</span>
          </div>
          <div className="adsense-leaderboard-safe-zone rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 p-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Google AdSense Reserved Unit (728x90 Leaderboard / 320x100 Mobile)
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Fixed container with layout containment preventing Cumulative Layout Shift (CLS = 0).
            </span>
          </div>
        </div>
      </section>

      {/* Sticky Category Filter Menu */}
      <section className="sticky top-16 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-[#f8fafc]/90 dark:bg-slate-950/90 backdrop-blur-xl border-y border-slate-200/80 dark:border-slate-800/80 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Categories Tab List */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
            {CATEGORIES.map(({ id, label }) => {
              const count = categoryCounts[id] ?? 0;
              const isSelected = selectedCategory === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedCategory(id)}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-2 cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm shadow-slate-900/10'
                      : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <span>{label}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      isSelected
                        ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Active Count Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>
              Showing <strong className="text-slate-900 dark:text-white">{filteredTools.length}</strong> of {TOOLS_CONFIG.length} tools
            </span>
          </div>
        </div>
      </section>

      {/* Massive Directory Grid - Whole Card Clickable via Next.js <Link> */}
      <section id="directory" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredTools.map((tool: ToolConfig) => {
            const IconComponent = ICON_MAP[tool.iconName] || FileText;

            return (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="group relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.12)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:-translate-y-1.5 active:scale-[0.99] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div>
                  {/* Top Bar: Category Pill, Badge, & Corner Navigation Arrow */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70">
                        {tool.category}
                      </span>
                      {tool.badge && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60">
                          {tool.badge}
                        </span>
                      )}
                    </div>

                    {/* Corner Navigation Glyph Indicator */}
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-200 shadow-2xs">
                      <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 mb-3.5">
                    <div
                      className={`w-13 h-13 rounded-2xl bg-gradient-to-tr ${tool.gradient} flex items-center justify-center text-white shadow-md shadow-slate-900/10 group-hover:scale-108 transition-transform duration-200 shrink-0`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {tool.name}
                      </h2>
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{tool.processingNote}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5 line-clamp-2">
                    {tool.description}
                  </p>
                </div>

                {/* Bottom Row: Tags & App-Like Open Indicator */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-6">
                    {tool.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0 flex items-center gap-1">
                    <span>Open</span>
                    <span>→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty state when search produces no results */}
        {filteredTools.length === 0 && (
          <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <SlidersHorizontal className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No tools match &quot;{searchQuery}&quot;
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn&apos;t find any tools matching your keyword in the &quot;{selectedCategory}&quot; category.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Clear Search
              </button>
              {selectedCategory !== 'All' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  View All Tools
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Security & Architecture Features Section */}
      <section id="features" className="scroll-mt-24 pt-4">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-8">
          <div className="max-w-xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Privacy Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Engineered with zero network egress.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Standard online tools transmit your personal files to unverified backend servers. PDFEdit Studio is built from the ground up to execute all processing locally on your device.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Local In-Memory Processing</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Files are loaded directly into browser RAM and handled with native WebAssembly and Canvas APIs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Zero Server Storage</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                No intermediate files, temporary databases, or logs are created on any remote server.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Full Offline Capability</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Once the page is loaded, you can disconnect from the internet and every tool continues to work seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
