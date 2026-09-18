'use client';

import Link from 'next/link';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl transition-all duration-200 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand (Corporate Geometric & Modern Modern Typeface) */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl p-1 transition-all"
          >
            {/* Corporate Geometric SVG Mark */}
            <div className="w-10 h-10 rounded-xl bg-slate-950 dark:bg-white flex items-center justify-center shadow-md shadow-slate-950/15 dark:shadow-white/10 group-hover:scale-105 group-hover:shadow-blue-500/25 group-active:scale-95 transition-all duration-200 shrink-0">
              <svg
                width="24"
                height="25"
                viewBox="0 0 28 29"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-300 group-hover:scale-105"
              >
                <defs>
                  <linearGradient id="nova-top" x1="4.5" y1="3" x2="23.5" y2="14" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60A5FA" />
                    <stop offset="1" stopColor="#818CF8" />
                  </linearGradient>
                  <linearGradient id="nova-left" x1="4" y1="10.5" x2="13" y2="26" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3B82F6" />
                    <stop offset="1" stopColor="#1D4ED8" />
                  </linearGradient>
                  <linearGradient id="nova-right" x1="15" y1="10.5" x2="24" y2="26" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366F1" />
                    <stop offset="1" stopColor="#4338CA" />
                  </linearGradient>
                </defs>
                {/* Isometric Geometric Facets */}
                <path d="M14 3L23.5 8.5L14 14L4.5 8.5L14 3Z" fill="url(#nova-top)" />
                <path d="M4 10.5L13 15.8V26L4 20.8V10.5Z" fill="url(#nova-left)" />
                <path d="M15 15.8L24 10.5V20.8L15 26V15.8Z" fill="url(#nova-right)" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-xl sm:text-2xl tracking-tight text-slate-950 dark:text-white leading-none">
                  NovaKit
                </span>
                <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  Directory
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline-block font-semibold tracking-tight mt-0.5">
                50+ Client-Side Tools
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors font-semibold"
          >
            Tools
          </Link>
          <Link
            href="/#features"
            className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors font-semibold"
          >
            Privacy Guarantee
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
            <span className="whitespace-nowrap font-bold">Zero Uploads</span>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
