'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import {
  OPEN_SETTINGS_EVENT,
  pushConsentToGtag,
  readConsentChoice,
  writeConsentChoice,
} from '@/lib/cookie-consent';

/**
 * Lightweight cookie-consent notice for Google Analytics.
 *
 * Only renders when NEXT_PUBLIC_GA_MEASUREMENT_ID is configured — without a
 * measurement ID there is nothing to consent to, so no banner is shown.
 * Choice persists in localStorage; visitors can change it any time via the
 * "Cookie Settings" link in the footer.
 */

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    if (readConsentChoice() === null) {
      // Small delay so the banner doesn't fight the first paint.
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const reopen = () => setVisible(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, reopen);
  }, []);

  const choose = useCallback((accepted: boolean) => {
    writeConsentChoice(accepted ? 'accepted' : 'declined');
    pushConsentToGtag(accepted);
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-[90] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-md"
    >
      <div className="overflow-hidden rounded-2xl border border-[var(--pe-border)] bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur-md dark:bg-slate-900/95">
        <div className="flex items-start gap-3 p-4 sm:p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--pe-accent-soft)] text-[var(--pe-accent)]">
            <Cookie className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">
              We value your privacy
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              We use Google Analytics to understand which tools people use, so we
              can improve them. No document content or file names are ever
              collected.{' '}
              <Link
                href="/cookies"
                className="font-bold text-[var(--pe-accent)] underline-offset-2 hover:underline"
              >
                Cookie Policy
              </Link>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-[var(--pe-border)] bg-slate-50/60 px-4 py-3 dark:bg-slate-950/40 sm:px-5">
          <button
            type="button"
            onClick={() => choose(false)}
            className="min-h-[44px] flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            className="min-h-[44px] flex-1 rounded-xl bg-[var(--pe-accent)] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[var(--pe-shadow-accent)] transition hover:bg-[var(--pe-accent-hover)] active:scale-95"
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  );
}
