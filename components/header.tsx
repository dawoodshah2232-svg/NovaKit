'use client';

import Link from 'next/link';
import { ShieldCheck, Sparkles, FileText } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { Logo } from './logo';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl transition-all duration-200 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* PDFEdit Studio Brand Logo */}
        <Logo href="/" badgeText="Studio Suite" />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link
            href="/#directory"
            className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors font-semibold flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-rose-500" />
            <span>PDF Suite</span>
          </Link>
          <Link
            href="/#features"
            className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors font-semibold"
          >
            Capabilities
          </Link>
          <Link
            href="/#security"
            className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors font-semibold"
          >
            Zero-Upload Architecture
          </Link>
        </nav>

        {/* Right side badges & theme toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* 100% Client-Side Privacy Badge */}
          <div className="hidden xs:flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/90 dark:border-emerald-800/70 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="whitespace-nowrap font-bold">100% In-Browser</span>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
