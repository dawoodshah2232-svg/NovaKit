'use client';

import Link from 'next/link';
import { FileText, ShieldCheck, Sparkles } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { Logo } from './logo';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo href="/" badgeText="Enterprise Studio" />

        <nav className="hidden items-center gap-1 lg:flex">
          <Link
            href="/#tools"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400"
          >
            <FileText className="h-4 w-4" />
            PDF Tools
          </Link>

          <Link
            href="/#features"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400"
          >
            Capabilities
          </Link>

          <Link
            href="/#security"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400"
          >
            <ShieldCheck className="h-4 w-4" />
            Privacy
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cv-builder"
            className="hidden items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 sm:flex dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400"
          >
            <Sparkles className="h-4 w-4" />
            CV Builder
          </Link>

          <Link
            href="/studio"
            className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-blue-700 sm:text-sm"
          >
            PDF Editor
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}