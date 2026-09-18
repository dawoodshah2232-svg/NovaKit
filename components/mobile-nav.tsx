'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Layers, ShieldCheck } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

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
      href: '/#features',
      icon: ShieldCheck,
      isActive: pathname === '/#features',
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-3 pointer-events-none">
      <nav
        aria-label="Mobile Navigation"
        className="pointer-events-auto max-w-sm mx-auto bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 rounded-3xl p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.12)] transition-all"
      >
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex-1 min-h-[46px] flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 active:scale-95 ${
                  item.isActive
                    ? 'bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={item.isActive ? 2.4 : 1.8} />
                <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
