'use client';

import Script from 'next/script';
import { Suspense, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { readConsentChoice } from '@/lib/cookie-consent';

/**
 * Google Analytics 4 (gtag.js) provider.
 *
 * Activation is one step: set NEXT_PUBLIC_GA_MEASUREMENT_ID in the hosting
 * environment (e.g. Vercel → Project Settings → Environment Variables).
 * When the variable is absent this component renders nothing — no scripts,
 * no tracking, and no cookie banner.
 *
 * Privacy design:
 * - Google Consent Mode defaults analytics_storage to 'denied' until the
 *   visitor accepts the cookie notice (see components/cookie-consent.tsx).
 * - IP anonymization is enabled explicitly (GA4 also anonymizes by default).
 * - No file names, file contents, or document data are ever sent — only
 *   standard GA4 page_view events.
 */

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function gtagSafe(...args: unknown[]): void {
  try {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === 'function') gtag(...args);
  } catch {
    /* Analytics must never break the page. */
  }
}

/** Fires a GA4 page_view on every App Router navigation (path + query). */
function GaRoutePageviews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // The initial page_view is already sent by gtag('config', ...) on load —
  // skip the first run so the landing page isn't double-counted.
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (readConsentChoice() !== 'accepted') return;
    const query = searchParams?.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;
    gtagSafe('config', GA_MEASUREMENT_ID, { page_path: pagePath });
  }, [pathname, searchParams]);

  return null;
}

export function Ga4Provider() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        id="ga4-gtag-js"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });`}
      </Script>
      <Suspense fallback={null}>
        <GaRoutePageviews />
      </Suspense>
    </>
  );
}
