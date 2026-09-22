'use client';

import Link from 'next/link';
import { FileText, LayoutGrid, ShieldCheck, Sparkles } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { Logo } from './logo';

const NAV_LINKS = [
  { label: 'PDF Tools', href: '/#tools', icon: FileText },
  { label: 'Categories', href: '/#categories', icon: LayoutGrid },
  { label: 'Why PDFEdit', href: '/#why', icon: Sparkles },
  { label: 'Privacy', href: '/#security', icon: ShieldCheck },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--pe-border)] bg-[var(--pe-surface)]/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Logo href="/" badgeText="Enterprise Studio" priority />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="flex min-h-[44px] items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--pe-text-2)] transition hover:bg-[var(--pe-accent-soft)] hover:text-[var(--pe-accent)]"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/studio"
            className="inline-flex min-h-[44px] items-center rounded-xl bg-[var(--pe-accent)] px-3.5 py-2 text-xs font-bold text-[var(--pe-accent-ink)] shadow-[var(--pe-shadow-accent)] transition hover:bg-[var(--pe-accent-hover)] sm:px-5 sm:text-sm"
          >
            PDF Editor
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
