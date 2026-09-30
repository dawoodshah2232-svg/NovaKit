'use client';

import { usePathname } from 'next/navigation';
import { LanguageSwitcher, type SwitcherLocale } from './language-switcher';

/**
 * LanguageSwitcherSlot — self-contained i18n pilot slot.
 * Reads the current pathname, strips a leading /es or /ar locale prefix,
 * and renders <LanguageSwitcher> with the right props. Paste anywhere:
 *   <LanguageSwitcherSlot />
 *
 * SEO: only the 6 pilot routes exist per locale. On any other page the
 * switcher is hidden so crawlers never see links to /es/* or /ar/* URLs
 * that don't exist (58 broken internal links otherwise).
 */
const PILOT_ROUTES = new Set([
  '/',
  '/merge-pdf',
  '/compress-pdf',
  '/pdf-to-word',
  '/word-to-pdf',
  '/sign-pdf',
]);

export function LanguageSwitcherSlot({ className = '' }: { className?: string }) {
  const pathname = usePathname() ?? '/';
  const m = pathname.match(/^\/(es|ar)(\/|$)/);
  const currentLocale = ((m?.[1] ?? 'en') as SwitcherLocale);
  const basePath = m ? pathname.slice(3) || '/' : pathname;

  if (!PILOT_ROUTES.has(basePath)) return null;

  return (
    <LanguageSwitcher basePath={basePath} currentLocale={currentLocale} className={className} />
  );
}
