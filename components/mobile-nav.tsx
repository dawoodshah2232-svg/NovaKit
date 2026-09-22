'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Layers, ShieldCheck } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  // Inside active tool workspaces or admin console, the tool's sticky action bar takes full priority.
  // /studio is also an immersive workspace with its own mobile toolbar and
  // bottom sheets — the floating pill would overlap them at the same z-index.
  if (pathname.startsWith('/tools') || pathname.startsWith('/admin') || pathname.startsWith('/studio')) {
    return null;
  }

  const navItems = [
    {
      label: 'Hub',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'All Tools',
      href: '/#tools',
      icon: Layers,
      isActive: pathname.startsWith('/tools'),
    },
    {
      label: 'Security',
      href: '/#security',
      icon: ShieldCheck,
      isActive: false,
    },
  ];

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 p-3 lg:hidden">
      <nav
        aria-label="Mobile Navigation"
        className="pointer-events-auto mx-auto max-w-sm rounded-3xl border border-[var(--pe-border)] bg-[var(--pe-elevated)]/95 p-1.5 shadow-[var(--pe-shadow-lg)] backdrop-blur-2xl transition-all"
      >
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={item.isActive ? 'page' : undefined}
                className={`flex min-h-[48px] flex-1 flex-col items-center justify-center rounded-2xl px-3 py-1.5 transition-all duration-200 active:scale-95 ${
                  item.isActive
                    ? 'bg-[var(--pe-accent-soft)] font-bold text-[var(--pe-accent)]'
                    : 'font-medium text-[var(--pe-text-2)] hover:text-[var(--pe-text)]'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={item.isActive ? 2.4 : 1.8} aria-hidden="true" />
                <span className="mt-0.5 text-[11px] tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
