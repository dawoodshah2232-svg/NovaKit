import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  badgeText?: string;
  className?: string;
  href?: string;
}

export function Logo({
  size = 'md',
  showBadge = true,
  badgeText = 'Tier-1 Suite',
  className = '',
  href = '/',
}: LogoProps) {
  const sizeClasses = {
    sm: {
      mark: 'w-8 h-8 rounded-xl',
      svg: 20,
      title: 'text-lg',
      subtitle: 'text-[10px]',
    },
    md: {
      mark: 'w-10 h-10 rounded-2xl',
      svg: 24,
      title: 'text-xl sm:text-2xl',
      subtitle: 'text-[11px]',
    },
    lg: {
      mark: 'w-12 h-12 rounded-2xl',
      svg: 28,
      title: 'text-2xl sm:text-3xl',
      subtitle: 'text-xs',
    },
  }[size];

  const content = (
    <div className={`group flex items-center gap-3 select-none ${className}`}>
      {/* Hyper-Professional Geometric "N" Prism Icon */}
      <div className="relative flex items-center justify-center shrink-0">
        {/* Subtle Ambient Radial Glow */}
        <div
          aria-hidden="true"
          className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 opacity-40 blur-sm group-hover:opacity-75 transition-opacity duration-300"
        />

        {/* Outer Prism Container */}
        <div
          className={`${sizeClasses.mark} relative bg-gradient-to-b from-slate-950 to-slate-900 dark:from-slate-900 dark:to-slate-950 p-1.5 flex items-center justify-center border border-white/15 dark:border-cyan-500/20 shadow-[0_4px_16px_rgba(37,99,235,0.25)] group-hover:scale-105 group-hover:shadow-[0_6px_24px_rgba(6,182,212,0.35)] active:scale-95 transition-all duration-200`}
        >
          {/* Geometric "N" Prism Vector */}
          <svg
            width={sizeClasses.svg}
            height={sizeClasses.svg}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-300 group-hover:scale-105"
          >
            <defs>
              {/* Radiant Blue-to-Cyan Main Gradients */}
              <linearGradient id="prism-left-pillar" x1="4" y1="4" x2="12" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38BDF8" />
                <stop offset="0.5" stopColor="#2563EB" />
                <stop offset="1" stopColor="#1E40AF" />
              </linearGradient>

              <linearGradient id="prism-diagonal-blade" x1="6" y1="5" x2="26" y2="27" gradientUnits="userSpaceOnUse">
                <stop stopColor="#06B6D4" />
                <stop offset="0.45" stopColor="#3B82F6" />
                <stop offset="1" stopColor="#4F46E5" />
              </linearGradient>

              <linearGradient id="prism-right-pillar" x1="20" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22D3EE" />
                <stop offset="0.6" stopColor="#0284C7" />
                <stop offset="1" stopColor="#1E3A8A" />
              </linearGradient>

              <linearGradient id="prism-top-bevel" x1="4" y1="4" x2="28" y2="8" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A5F3FC" />
                <stop offset="0.5" stopColor="#67E8F9" />
                <stop offset="1" stopColor="#93C5FD" />
              </linearGradient>
            </defs>

            {/* Left Vertical Prism Pillar */}
            <path
              d="M5 6.5L11 4V24.5L5 27V6.5Z"
              fill="url(#prism-left-pillar)"
            />

            {/* Radiant Diagonal Prism Blade (Slicing N core) */}
            <path
              d="M10 4L22 23.5L22 28L9.5 7.5L10 4Z"
              fill="url(#prism-diagonal-blade)"
            />

            {/* Right Vertical Prism Pillar */}
            <path
              d="M21 4.5L27 6.5V27.5L21 25.5V4.5Z"
              fill="url(#prism-right-pillar)"
            />

            {/* Top Prismatic Light Reflex Bevels */}
            <path
              d="M5 6.5L11 4L16 11.5L10 14L5 6.5Z"
              fill="url(#prism-top-bevel)"
              fillOpacity="0.85"
            />
            <path
              d="M16 19.5L22 23.5L27 27.5L21 25.5L16 19.5Z"
              fill="#06B6D4"
              fillOpacity="0.75"
            />
          </svg>
        </div>
      </div>

      {/* Clean Typography & Subtle Glowing Badge */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`font-black ${sizeClasses.title} tracking-tight text-slate-950 dark:text-white leading-none group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors`}
          >
            NovaKit
          </span>

          {showBadge && (
            <span className="relative inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-cyan-500/10 border border-blue-500/30 dark:border-cyan-400/40 text-blue-700 dark:text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>{badgeText}</span>
            </span>
          )}
        </div>

        <span
          className={`${sizeClasses.subtitle} text-slate-500 dark:text-slate-400 font-semibold tracking-tight mt-0.5`}
        >
          100% Client-Side Private Utilities
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl p-0.5 transition-all inline-block"
      >
        {content}
      </Link>
    );
  }

  return content;
}
