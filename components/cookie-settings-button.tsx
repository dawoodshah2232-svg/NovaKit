'use client';

import { OPEN_SETTINGS_EVENT } from '@/lib/cookie-consent';

/** Footer affordance that re-opens the cookie-consent notice. */
export function CookieSettingsButton() {
  return (
    <li>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}
        className="transition hover:text-[var(--pe-accent)]"
      >
        Cookie Settings
      </button>
    </li>
  );
}
