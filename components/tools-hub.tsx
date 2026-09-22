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
  ArrowLeftRight,
  PenLine,
  Briefcase,
  Wrench,
} from 'lucide-react';
import { TOOLS_CONFIG, ToolConfig } from '@/lib/tools-config';

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

// PDF Studio is a real product (route /studio) but lives outside TOOLS_CONFIG.
// It gets a first-class card in the Edit PDF section so every product is visible.
const STUDIO_TOOL: ToolConfig = {
  id: 'studio',
  name: 'PDF Studio',
  description: 'The flagship editor — edit text, sign, redact and annotate PDFs in your browser.',
  slug: 'studio',
  category: 'PDF',
  badge: 'Flagship',
  iconName: 'FilePenLine',
  tags: ['Editor', 'Annotate', 'Sign', 'Redact'],
  gradient: '',
  accentColor: '',
  processingNote: 'Full in-browser PDF editor',
};

const ALL_TOOLS: ToolConfig[] = [...TOOLS_CONFIG, STUDIO_TOOL];
const TOOL_BY_ID: Record<string, ToolConfig> = Object.fromEntries(
  ALL_TOOLS.map((t) => [t.id, t]),
);

interface HubSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  toolIds: string[];
}

const SECTIONS: HubSection[] = [
  {
    id: 'organize-pdf',
    title: 'Organize PDF',
    subtitle: 'Merge, split, extract, delete and reorder pages',
    icon: Layers,
    toolIds: ['pdf-merger', 'split-pdf', 'extract-pdf-pages', 'delete-pdf-pages', 'rotate-pdf', 'organize-pdf'],
  },
  {
    id: 'convert-pdf',
    title: 'Convert to & from PDF',
    subtitle: 'Turn PDFs into anything — and anything into PDFs',
    icon: ArrowLeftRight,
    toolIds: ['pdf-to-word', 'pdf-to-images', 'pdf-to-jpg', 'image-to-pdf', 'word-to-pdf', 'pdf-to-text'],
  },
  {
    id: 'edit-pdf',
    title: 'Edit PDF',
    subtitle: 'Stamp, crop, watermark and finalize documents',
    icon: PenLine,
    toolIds: ['studio', 'add-page-numbers', 'watermark-pdf', 'crop-pdf', 'flatten-pdf', 'edit-pdf-metadata'],
  },
  {
    id: 'pdf-security',
    title: 'PDF Security',
    subtitle: 'Protect, unlock, redact and sign with confidence',
    icon: ShieldCheck,
    toolIds: ['protect-pdf', 'unlock-pdf', 'redact-pdf', 'sign-pdf'],
  },
  {
    id: 'compress',
    title: 'Compress',
    subtitle: 'Shrink PDFs and images without visible quality loss',
    icon: Minimize2,
    toolIds: ['compress-pdf', 'image-compressor'],
  },
  {
    id: 'extract-analyze',
    title: 'Extract & Analyze',
    subtitle: 'Pull text, colors and insights out of your files',
    icon: FileSearch,
    toolIds: ['ocr-pdf', 'color-extractor', 'text-analyzer'],
  },
  {
    id: 'business-tools',
    title: 'Business Tools',
    subtitle: 'Invoices and tax math for freelancers and teams',
    icon: Briefcase,
    toolIds: ['invoice-generator', 'tax-calculator'],
  },
  {
    id: 'utilities',
    title: 'Utilities',
    subtitle: 'Everyday helpers — QR codes and secure passwords',
    icon: Wrench,
    toolIds: ['qr-generator', 'password-generator'],
  },
];

function toolHref(tool: ToolConfig): string {
  return tool.slug === 'studio' ? '/studio' : `/tools/${tool.slug}`;
}

export function ToolsHub() {
  const [searchQuery, setSearchQuery] = useState('');

  const matchesSearch = (tool: ToolConfig): boolean => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const haystack = [tool.name, tool.description, tool.category, tool.processingNote, ...tool.tags]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  };

  // Sections with their search-filtered tools; empty sections are hidden.
  const visibleSections = useMemo(() => {
    return SECTIONS.map((section) => {
      const tools = section.toolIds
        .map((id) => TOOL_BY_ID[id])
        .filter((t): t is ToolConfig => Boolean(t))
        .filter(matchesSearch);
      return { ...section, tools };
    }).filter((section) => section.tools.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const totalVisible = visibleSections.reduce((sum, s) => sum + s.tools.length, 0);

  return (
    <div className="w-full space-y-8 sm:space-y-12">
      {/* Search Hero */}
      <section className="relative pt-4 pb-2 text-center max-w-4xl mx-auto space-y-6">
        {/* Subtle Ambient Radial Glow — crimson */}
        <div
          aria-hidden="true"
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-80 sm:w-[540px] h-60 sm:h-80 bg-gradient-to-tr from-red-500/10 via-rose-500/10 to-red-600/10 blur-3xl -z-10 pointer-events-none rounded-full"
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
          <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-500 bg-clip-text text-transparent">
            100% Free &amp; In-Browser.
          </span>
        </h1>

        {/* Trust Banner */}
        <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 px-4 sm:px-6 py-2 rounded-full bg-gradient-to-r from-red-500/10 via-rose-500/10 to-red-600/10 dark:from-red-950/50 dark:via-rose-950/40 dark:to-red-950/50 border border-red-500/30 dark:border-red-500/30 text-slate-800 dark:text-slate-100 shadow-[0_4px_24px_rgba(220,38,38,0.08)] backdrop-blur-xl text-xs sm:text-sm font-semibold tracking-tight transition-all duration-300 hover:border-red-500/50 dark:hover:border-red-400/50">
          <span className="text-amber-500 font-bold text-sm">⚡</span>
          <span className="text-slate-950 dark:text-white font-extrabold">No Signup Required</span>
          <span className="text-slate-300 dark:text-slate-700 hidden xs:inline">•</span>
          <span className="text-red-600 dark:text-red-400 font-extrabold">100% Free Forever</span>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
          <span className="text-slate-700 dark:text-slate-300 font-medium">Instant Local PDF Processing (Zero Server Uploads)</span>
        </div>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Every tool you need to work with PDFs — organized by task. Merge, convert, compress, secure and edit, all running privately in your browser.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto pt-1">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-red-500/20 via-rose-500/20 to-red-600/20 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
            <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200/90 dark:border-slate-800 shadow-lg shadow-slate-900/5 group-focus-within:border-red-500 transition-all p-2 sm:p-2.5">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-focus-within:text-red-600 dark:group-focus-within:text-red-400 ml-2.5 sm:ml-3 shrink-0 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g., Merge, Compress, Watermark, QR Code)..."
                aria-label="Search PDF tools"
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
                <span>{totalVisible}</span>
                <span>{totalVisible === 1 ? 'tool' : 'tools'}</span>
              </div>
            </div>
          </div>

          {/* Quick Keyword Suggestion Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-3 text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-semibold mr-1">Popular:</span>
            {['Merge PDF', 'Compress', 'Image to PDF', 'Watermark', 'Unlock', 'QR Code', 'OCR', 'Invoice'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearchQuery(tag)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700 text-[11px] font-medium transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* AdSense Safe-Zone Banner (Preserving Zero CLS below Search Hero) */}
      <section className="w-full" aria-label="Advertisement">
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

      {/* Sticky Category Quick-Jump Menu */}
      <nav
        aria-label="Tool categories"
        className="sticky top-16 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-[#f8fafc]/90 dark:bg-slate-950/90 backdrop-blur-xl border-y border-slate-200/80 dark:border-slate-800/80 transition-all shadow-xs"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
            {SECTIONS.map((section) => {
              const count = visibleSections.find((s) => s.id === section.id)?.tools.length ?? 0;
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-2 cursor-pointer active:scale-95 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200/80 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900"
                >
                  <span>{section.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {count}
                  </span>
                </a>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
            <Layers className="w-3.5 h-3.5 text-red-500" />
            <span>
              Showing <strong className="text-slate-900 dark:text-white">{totalVisible}</strong> of {ALL_TOOLS.length} tools
            </span>
          </div>
        </div>
      </nav>

      {/* Categorized Tool Sections */}
      <div className="space-y-10 sm:space-y-14">
        {visibleSections.map((section) => {
          const SectionIcon = section.icon;
          return (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-title`}
              className="scroll-mt-32 space-y-5"
            >
              {/* Section Header */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shadow-sm shrink-0">
                  <SectionIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h2
                    id={`${section.id}-title`}
                    className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white uppercase"
                  >
                    {section.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                    {section.subtitle}
                  </p>
                </div>
                <span className="ml-auto text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                  {section.tools.length} {section.tools.length === 1 ? 'tool' : 'tools'}
                </span>
              </div>

              {/* Section Card Grid — 2 cols mobile, 3-4 desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {section.tools.map((tool) => {
                  const IconComponent = ICON_MAP[tool.iconName] || FileText;
                  return (
                    <Link
                      key={tool.id}
                      href={toolHref(tool)}
                      aria-label={`Open ${tool.name}`}
                      className="group relative flex flex-col rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-15px_rgba(220,38,38,0.18)] dark:hover:shadow-[0_20px_40px_-15px_rgba(220,38,38,0.25)] hover:border-red-500/50 dark:hover:border-red-500/50 hover:-translate-y-1 active:scale-[0.99] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
                        <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:bg-red-100 dark:group-hover:bg-red-900/60 transition-all duration-200 shrink-0">
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        {tool.badge && (
                          <span className="text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200/80 dark:border-red-900/60 shrink-0">
                            {tool.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-lg font-bold text-slate-950 dark:text-white tracking-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-snug mb-1">
                        {tool.name}
                      </h3>
                      <p className="text-[11px] sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3 sm:mb-4">
                        {tool.description}
                      </p>

                      <span className="mt-auto pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 truncate">
                          <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                          <span className="truncate hidden sm:inline">{tool.processingNote}</span>
                          <span className="truncate sm:hidden">Free</span>
                        </span>
                        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-200 shrink-0">
                          <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Empty state when search produces no results */}
        {totalVisible === 0 && (
          <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <SlidersHorizontal className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No tools match &quot;{searchQuery}&quot;
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try a different keyword like &quot;merge&quot;, &quot;compress&quot; or &quot;QR&quot;.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Security & Architecture Features Section */}
      <section id="features" className="scroll-mt-24 pt-4">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-8">
          <div className="max-w-xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              Privacy Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Engineered with zero network egress.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Standard online tools transmit your personal files to unverified backend servers. PDFEdit is built from the ground up to execute all processing locally on your device.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Local In-Memory Processing</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Files are loaded directly into browser RAM and handled with native WebAssembly and Canvas APIs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Zero Server Storage</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                No intermediate files, temporary databases, or logs are created on any remote server.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Full Offline Capability</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Once the page is loaded, you can disconnect from the internet and every tool continues to work seamlessly.
              </p>
            </div>
          </div>

          <p className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-red-500 shrink-0" />
            Every tool above runs entirely in your browser — your files never leave your device.
          </p>
        </div>
      </section>
    </div>
  );
}
