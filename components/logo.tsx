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
  badgeText = 'Studio Suite',
  className = '',
  href = '/',
}: LogoProps) {
  const sizeClasses = {
    sm: {
      mark: 'w-8 h-8 rounded-xl',
      svg: 22,
      title: 'text-lg',
      subtitle: 'text-[10px]',
    },
    md: {
      mark: 'w-10 h-10 rounded-2xl',
      svg: 26,
      title: 'text-xl sm:text-2xl',
      subtitle: 'text-[11px]',
    },
    lg: {
      mark: 'w-12 h-12 rounded-2xl',
      svg: 30,
      title: 'text-2xl sm:text-3xl',
      subtitle: 'text-xs',
    },
  }[size];

  const content = (
    <div className={`group flex items-center gap-3 select-none ${className}`}>
      {/* Modern Minimalist Document + Edit Pen Vector Icon */}
      <div className="relative flex items-center justify-center shrink-0">
        {/* Ambient Radial Glow */}
        <div
          aria-hidden="true"
          className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-rose-600 via-indigo-600 to-cyan-500 opacity-35 blur-sm group-hover:opacity-75 transition-opacity duration-300"
        />

        {/* Outer Icon Container */}
        <div
          className={`${sizeClasses.mark} relative bg-gradient-to-b from-slate-950 to-slate-900 dark:from-slate-900 dark:to-slate-950 p-1.5 flex items-center justify-center border border-white/15 dark:border-rose-500/20 shadow-[0_4px_16px_rgba(225,29,72,0.25)] group-hover:scale-105 group-hover:shadow-[0_6px_24px_rgba(244,63,94,0.35)] active:scale-95 transition-all duration-200`}
        >
          {/* Custom Vector Logo: Document with Edit Pen/Pencil Stroke */}
          <svg
            width={sizeClasses.svg}
            height={sizeClasses.svg}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-300 group-hover:scale-105"
          >
            <defs>
              {/* Document Body Radiant Gradient */}
              <linearGradient id="doc-gradient" x1="4" y1="3" x2="24" y2="29" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F43F5E" />
                <stop offset="0.5" stopColor="#E11D48" />
                <stop offset="1" stopColor="#4F46E5" />
              </linearGradient>

              {/* Folded Corner Bevel */}
              <linearGradient id="corner-fold" x1="18" y1="3" x2="24" y2="9" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FECDD3" />
                <stop offset="1" stopColor="#FB7185" />
              </linearGradient>

              {/* Edit Pen Barrel Gradient */}
              <linearGradient id="pen-barrel" x1="14" y1="14" x2="29" y2="29" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38BDF8" />
                <stop offset="0.5" stopColor="#6366F1" />
                <stop offset="1" stopColor="#2563EB" />
              </linearGradient>

              {/* Glowing Pen Stroke Accent */}
              <linearGradient id="pen-stroke" x1="7" y1="21" x2="19" y2="25" gradientUnits="userSpaceOnUse">
                <stop stopColor="#06B6D4" />
                <stop offset="1" stopColor="#38BDF8" />
              </linearGradient>
            </defs>

            {/* Document Base (with folded top-right corner) */}
            <path
              d="M6 5.5C6 4.12 7.12 3 8.5 3H18.5L25 9.5V26.5C25 27.88 23.88 29 22.5 29H8.5C7.12 29 6 27.88 6 26.5V5.5Z"
              fill="url(#doc-gradient)"
            />

            {/* Folded Top-Right Corner */}
            <path
              d="M18.5 3V8C18.5 8.83 19.17 9.5 20 9.5H25L18.5 3Z"
              fill="url(#corner-fold)"
              fillOpacity="0.95"
            />

            {/* Document Internal Content Guideline Bars */}
            <rect x="9.5" y="12" width="7" height="1.75" rx="0.875" fill="#FFFFFF" fillOpacity="0.85" />
            <rect x="9.5" y="16" width="11" height="1.75" rx="0.875" fill="#FFFFFF" fillOpacity="0.7" />
            <rect x="9.5" y="20" width="5.5" height="1.75" rx="0.875" fill="#FFFFFF" fillOpacity="0.5" />

            {/* Glowing Dynamic Ink Edit Stroke */}
            <path
              d="M8.5 24.5C11.5 23 14 26 18 24.5"
              stroke="url(#pen-stroke)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Modern Edit Pen / Stylus (Angled diagonally at 45°) */}
            <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
              {/* Pen Body / Barrel */}
              <path
                d="M27.2 13.8L25.2 11.8C24.7 11.3 23.9 11.3 23.4 11.8L16.2 19L15.5 23.5L20 22.8L27.2 15.6C27.7 15.1 27.7 14.3 27.2 13.8Z"
                fill="url(#pen-barrel)"
              />
              {/* Metallic Nib Joint */}
              <path
                d="M16.2 19L15.5 23.5L20 22.8L18.2 21L16.2 19Z"
                fill="#F8FAFC"
              />
              {/* Pen Active Drawing Tip */}
              <path
                d="M15.5 23.5L16.8 22.2L16.2 21.6L15.5 23.5Z"
                fill="#06B6D4"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* Clean Typography & Sleek Studio Badge */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span
            className={`font-black ${sizeClasses.title} tracking-tight text-slate-950 dark:text-white leading-none group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors`}
          >
            PDFEdit
          </span>
          <span className="font-black bg-gradient-to-r from-rose-500 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
            Studio
          </span>

          {showBadge && (
            <span className="relative inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500/10 via-indigo-500/10 to-cyan-500/10 border border-rose-500/30 dark:border-rose-400/40 text-rose-700 dark:text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)]">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>{badgeText}</span>
            </span>
          )}
        </div>

        <span
          className={`${sizeClasses.subtitle} text-slate-500 dark:text-slate-400 font-semibold tracking-tight mt-0.5`}
        >
          100% Client-Side Private PDF Suite
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-2xl p-0.5 transition-all inline-block"
      >
        {content}
      </Link>
    );
  }

  return content;
}
