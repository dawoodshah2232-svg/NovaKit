'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState, useSyncExternalStore } from 'react';

/**
 * Preview-only: force a theme via ?theme=dark|light (for shareable
 * theme links and deterministic QA screenshots). No-op without the param.
 */
export function PreviewThemeSync() {
  const { setTheme } = useTheme();
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('theme');
    if (t === 'dark' || t === 'light') setTheme(t);
  }, [setTheme]);
  return null;
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const dark = mounted && theme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="pe-lift grid h-11 w-11 place-items-center rounded-full border border-[var(--pe-border)] bg-[var(--pe-surface)] text-[var(--pe-text-2)] hover:text-[var(--pe-text)]"
    >
      {dark ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
        </svg>
      )}
    </button>
  );
}

const NAV = [
  { label: 'PDF Tools', href: '#tools' },
  { label: 'Categories', href: '#categories' },
  { label: 'Studio', href: '/studio' },
  { label: 'Why PDFEdit', href: '#why' },
];

export function PreviewHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--pe-border)] bg-[color-mix(in_srgb,var(--pe-bg)_82%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <Link href="/ui-preview" className="flex min-w-0 items-center gap-2.5" aria-label="PDFEdit concept home">
          <img
            src="/pdfedit-logo-light-bg.png"
            alt="PDFEdit"
            className="h-7 w-auto shrink-0 object-contain dark:hidden sm:h-8"
          />
          <img
            src="/pdfedit-logo-dark-bg.png"
            alt="PDFEdit"
            className="hidden h-7 w-auto shrink-0 object-contain dark:block sm:h-8"
          />
          <span className="hidden shrink-0 rounded-full bg-[var(--pe-accent-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--pe-accent)] min-[400px]:inline-block">
            Concept
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Concept navigation">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="rounded-full px-3.5 py-2.5 text-sm font-medium text-[var(--pe-text-2)] transition-colors hover:bg-[var(--pe-surface-2)] hover:text-[var(--pe-text)]"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/studio"
            className="pe-lift hidden min-h-[44px] items-center rounded-full bg-[var(--pe-accent)] px-5 text-sm font-semibold text-[var(--pe-accent-ink)] shadow-[var(--pe-shadow-accent)] hover:bg-[var(--pe-accent-hover)] sm:inline-flex"
          >
            Open Studio
          </Link>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-[var(--pe-border)] text-[var(--pe-text)] lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-[var(--pe-border)] px-4 py-3 lg:hidden" aria-label="Mobile concept navigation">
          <div className="grid gap-1">
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-[15px] font-medium text-[var(--pe-text)] hover:bg-[var(--pe-surface-2)]"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/studio"
              onClick={() => setOpen(false)}
              className="mt-1 flex min-h-[48px] items-center justify-center rounded-xl bg-[var(--pe-accent)] px-3 text-[15px] font-semibold text-[var(--pe-accent-ink)]"
            >
              Open Studio
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

const FOOT_COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Popular tools',
    links: [
      { label: 'Merge PDF', href: '/merge-pdf' },
      { label: 'Compress PDF', href: '/compress-pdf' },
      { label: 'PDF to Word', href: '/pdf-to-word' },
      { label: 'Sign PDF', href: '/sign-pdf' },
    ],
  },
  {
    title: 'Product',
    links: [
      { label: 'PDF Studio', href: '/studio' },
      { label: 'All tools', href: '/ui-preview#tools' },
      { label: 'OCR PDF', href: '/ocr-pdf' },
      { label: 'Redact PDF', href: '/redact-pdf' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

export function PreviewFooter() {
  return (
    <footer className="relative bg-[var(--pe-surface)]">
      {/* subtle accent hairline */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, var(--pe-accent-soft) 20%, var(--pe-accent-soft) 80%, transparent)' }}
      />
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_repeat(3,1fr)] md:py-12">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <img src="/pdfedit-logo-light-bg.png" alt="PDFEdit" className="h-8 w-auto object-contain dark:hidden" />
            <img src="/pdfedit-logo-dark-bg.png" alt="PDFEdit" className="hidden h-8 w-auto object-contain dark:block" />
          </div>
          <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-[var(--pe-text-2)]">
            Fast, browser-based PDF tools. Your files are processed on your
            device — no account needed.
          </p>
          <p className="mt-4 inline-block rounded-full bg-[var(--pe-accent-soft)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-[var(--pe-accent)]">
            Design concept preview
          </p>
        </div>
        {FOOT_COLS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-[var(--pe-text-3)]">
              {col.title}
            </h3>
            <ul className="mt-3 space-y-1">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="inline-block py-1.5 text-[15px] text-[var(--pe-text-2)] transition-colors hover:text-[var(--pe-accent)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-[var(--pe-divider)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-1.5 px-4 py-5 text-sm text-[var(--pe-text-3)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© 2026 PDFEdit — concept preview, not the live site.</span>
          <span>Processing happens in your browser where supported.</span>
        </div>
      </div>
    </footer>
  );
}
