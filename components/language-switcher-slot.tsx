'use client';

import { usePathname } from 'next/navigation';
import { LanguageSwitcher, type SwitcherLocale } from './language-switcher';

/**
 * LanguageSwitcherSlot — self-contained i18n pilot slot.
 * Reads the current pathname, strips a leading /es or /ar locale prefix,
 * and renders <LanguageSwitcher> with the right props. Paste anywhere:
 *   <LanguageSwitcherSlot />
 */
export function LanguageSwitcherSlot({ className = '' }: { className?: string }) {
  const pathname = usePathname() ?? '/';
  const m = pathname.match(/^\/(es|ar)(\/|$)/);
  const currentLocale = ((m?.[1] ?? 'en') as SwitcherLocale);
  const basePath = m ? pathname.slice(3) || '/' : pathname;

  return (
    <LanguageSwitcher basePath={basePath} currentLocale={currentLocale} className={className} />
  );
}
