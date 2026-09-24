'use client';

import { useState } from 'react';
import { Share2, Check, Link2, X } from 'lucide-react';

interface ShareNudgeProps {
  /** e.g. "Merge PDF" */
  toolName: string;
  /** Canonical path of the tool page, e.g. "/merge-pdf" */
  toolPath: string;
}

/**
 * Small "share this tool" nudge shown after a successful download or
 * conversion. Uses the Web Share API where available, with a
 * copy-link fallback. Dismissible; renders nothing until mounted.
 */
export function ShareNudge({ toolName, toolPath }: ShareNudgeProps) {
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = `https://www.pdfedit.website${toolPath}`;

  if (dismissed) return null;

  const share = async () => {
    const data = {
      title: `${toolName} — free, no sign-up | PDFEdit`,
      text: `I just used PDFEdit's free ${toolName} tool — works in the browser, no uploads.`,
      url,
    };
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        // User cancelled or share failed — fall through to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="status"
      aria-label={`Share the ${toolName} tool`}
      className="flex items-center gap-3 rounded-2xl border border-[var(--pe-border)] bg-[var(--pe-surface)] p-3.5 shadow-sm"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--pe-accent-soft)] text-[var(--pe-accent)]">
        <Share2 className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-[var(--pe-text)]">
          {copied ? 'Link copied — thanks for sharing!' : 'Like this tool? Share it'}
        </p>
        <p className="truncate text-[11px] text-[var(--pe-text-3)]">
          {copied ? url : 'Free forever, no sign-up needed.'}
        </p>
      </div>
      <button
        type="button"
        onClick={share}
        className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl bg-[var(--pe-accent)] px-4 py-2 text-xs font-bold text-[var(--pe-accent-ink)] transition hover:bg-[var(--pe-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pe-focus)]"
      >
        {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Link2 className="h-3.5 w-3.5" aria-hidden="true" />}
        {copied ? 'Copied' : 'Share'}
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss share prompt"
        className="shrink-0 rounded-lg p-1.5 text-[var(--pe-text-3)] transition hover:bg-[var(--pe-surface-3)] hover:text-[var(--pe-text)]"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
