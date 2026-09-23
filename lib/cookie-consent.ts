/**
 * Shared cookie-consent state for Google Analytics (GA4).
 *
 * - Choice is stored in localStorage under CONSENT_STORAGE_KEY ('accepted' | 'declined').
 * - GA4 runs in Consent Mode: analytics_storage defaults to 'denied' and is
 *   only granted after the visitor explicitly accepts.
 * - The cookie banner only renders when NEXT_PUBLIC_GA_MEASUREMENT_ID is set —
 *   without a measurement ID there is nothing to consent to.
 */

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
      gtag('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' });
    }
  } catch {
    /* Analytics must never break the page. */
  }
}
