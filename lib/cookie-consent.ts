/**
 * Shared cookie-consent state for Google Analytics (GA4) and Google AdSense.
 *
 * - Choice is stored in localStorage under CONSENT_STORAGE_KEY ('accepted' | 'declined').
 * - GA4 runs in Consent Mode: analytics/ad storage defaults to 'denied' and is
 *   only granted after the visitor explicitly accepts.
 * - The cookie banner renders when a GA4 measurement ID is configured OR when
 *   AdSense advertising cookies are active — AdSense runs on every page, so the
 *   banner must appear even when no measurement ID is set.
 */

/**
 * AdSense is rendered on every page (see app/layout.tsx), which sets
 * advertising cookies via Google's ad tag. Keep this true whenever the AdSense
 * snippet is rendered — it gates the cookie banner alongside the GA4
 * measurement ID. The client bundle cannot read the server-only
 * ADSENSE_CLIENT_ID env var, so this stays a plain constant.
 */
export const ADSENSE_COOKIES_ACTIVE = true;

export const CONSENT_STORAGE_KEY = 'pdfedit.cookie-consent';
export const OPEN_SETTINGS_EVENT = 'pdfedit:open-cookie-settings';

export type ConsentChoice = 'accepted' | 'declined' | null;

/**
 * Inline Consent Mode defaults — must execute before the gtag.js library
 * loads (rendered in <head> by the root layout). Analytics stays denied
 * until the visitor accepts the cookie notice; a previously stored
 * acceptance is honored on load.
 */
export const CONSENT_DEFAULTS_SCRIPT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
(function(){
  var granted = false;
  try { granted = localStorage.getItem('${CONSENT_STORAGE_KEY}') === 'accepted'; } catch (e) {}
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: granted ? 'granted' : 'denied'
  });
})();
`;

export function readConsentChoice(): ConsentChoice {
  try {
    const value = localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === 'accepted' || value === 'declined' ? value : null;
  } catch {
    return null;
  }
}

export function writeConsentChoice(choice: Exclude<ConsentChoice, null>): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    /* Storage unavailable — consent simply won't persist. */
  }
}

/** Push a consent update into gtag's Consent Mode (no-op when gtag isn't loaded). */
export function pushConsentToGtag(granted: boolean): void {
  try {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        analytics_storage: granted ? 'granted' : 'denied',
        ad_storage: granted ? 'granted' : 'denied',
        ad_user_data: granted ? 'granted' : 'denied',
        ad_personalization: granted ? 'granted' : 'denied',
      });
    }
  } catch {
    /* Analytics must never break the page. */
  }
}
