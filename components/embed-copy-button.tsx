'use client';

import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';

/** Copy-to-clipboard button for the embed snippet. */
export function EmbedCopyButton({ snippet }: { snippet: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = snippet;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--pe-accent)] px-5 py-2.5 text-sm font-bold text-[var(--pe-accent-ink)] transition hover:bg-[var(--pe-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pe-focus)]"
    >
      {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      {copied ? 'Copied!' : 'Copy embed code'}
    </button>
  );
}

/**
 * In bare iframe mode (`/embed?bare=1`) the page is embedded on third-party
 * sites, so the site chrome (header, footer, mobile nav, skip link) is
 * hidden to leave only the widget. Runs client-side after mount.
 */
export function EmbedChromeHider() {
  useEffect(() => {
    document.querySelectorAll('header, footer').forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });
    const mobileNav = document.querySelector('nav[aria-label="Mobile Navigation"]');
    if (mobileNav?.parentElement) {
      (mobileNav.parentElement as HTMLElement).style.display = 'none';
    }
    document.querySelectorAll('a.skip-to-content').forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });
  }, []);
  return null;
}
