'use client';

import Link from 'next/link';

const LOCALES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'ar', label: 'AR', name: 'العربية' },
] as const;

export type SwitcherLocale = 'en' | 'es' | 'ar';

/**
 * LanguageSwitcher — EN / ES / AR links for the i18n pilot.
 *
 * NOT WIRED IN anywhere yet (deliberate — see WIRING.md).
 *
 * Usage once wired:
 *   <LanguageSwitcher basePath="/merge-pdf" currentLocale="es" />
 * `basePath` is the ENGLISH path of the current page ("/" for home).
 * The switcher maps it to "/", "/es/…", "/ar/…" automatically.
 */
export function LanguageSwitcher({
  basePath = '/',
  currentLocale = 'en',
  className = '',
}: {
  basePath?: string;
  currentLocale?: SwitcherLocale;
  className?: string;
}) {
  const clean = basePath.startsWith('/') ? basePath : `/${basePath}`;
  const suffix = clean === '/' ? '' : clean;

  return (
    <nav aria-label="Language / Idioma / اللغة" className={className}>
      <ul className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white p-1 text-xs font-bold dark:border-slate-800 dark:bg-slate-900">
        {LOCALES.map(({ code, label, name }) => {
          const href = code === 'en' ? clean : `/${code}${suffix}`;
          const active = code === currentLocale;
          return (
            <li key={code}>
              <Link
                href={href}
                hrefLang={code}
                aria-label={name}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'inline-block rounded-full bg-slate-900 px-3 py-1.5 text-white dark:bg-white dark:text-slate-900'
                    : 'inline-block rounded-full px-3 py-1.5 text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
