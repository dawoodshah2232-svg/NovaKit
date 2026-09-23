'use client';

import { useState } from 'react';
import { Link2, Check, Share2 } from 'lucide-react';

/**
 * Social share buttons for blog articles.
 * Lets readers push articles out to social platforms in one tap —
 * each share is a small external-traffic signal for the page.
 */
export default function BlogShareButtons({
  title,
  path,
}: {
  title: string;
  path: string;
}) {
  const [copied, setCopied] = useState(false);

  const share = (network: 'x' | 'facebook' | 'linkedin' | 'whatsapp') => {
    const url = `https://www.pdfedit.website${path}`;
    const text = title;
    const links: Record<string, string> = {
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    };
    window.open(links[network], '_blank', 'noopener,noreferrer,width=600,height=540');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://www.pdfedit.website${path}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — user can copy from the address bar */
    }
  };

  const btn =
    'inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl border border-[var(--pe-border-strong)] px-4 py-2.5 text-sm font-bold text-[var(--pe-text)] transition hover:bg-[var(--pe-surface-3)]';

  return (
    <div className="mt-10 flex flex-wrap items-center gap-2.5" aria-label="Share this guide">
      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--pe-text-2)]">
        <Share2 className="h-4 w-4" aria-hidden="true" />
        Share this guide
      </span>
      <button type="button" className={btn} onClick={() => share('x')} aria-label="Share on X">
        𝕏
      </button>
      <button type="button" className={btn} onClick={() => share('facebook')} aria-label="Share on Facebook">
        Facebook
      </button>
      <button type="button" className={btn} onClick={() => share('linkedin')} aria-label="Share on LinkedIn">
        LinkedIn
      </button>
      <button type="button" className={btn} onClick={() => share('whatsapp')} aria-label="Share on WhatsApp">
        WhatsApp
      </button>
      <button type="button" className={btn} onClick={copyLink} aria-label="Copy link">
        {copied ? (
          <>
            <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
            Copied
          </>
        ) : (
          <>
            <Link2 className="h-4 w-4" aria-hidden="true" />
            Copy link
          </>
        )}
      </button>
    </div>
  );
}
