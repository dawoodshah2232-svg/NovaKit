'use client';

/**
 * Client-side lazy loader for the CV editor (heavy: pdf-lib + editor UI).
 * Kept separate so the /cv-builder server page can keep its SEO metadata
 * while the editor bundle loads only in the browser.
 */
import dynamic from 'next/dynamic';

export const CvEditorLazy = dynamic(() => import('./CvEditor').then((m) => m.CvEditor), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60vh] items-center justify-center text-[var(--pe-text-2)]">
      <div className="flex items-center gap-2 text-sm">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--pe-accent)] border-t-transparent" />
        Loading Resume Studio…
      </div>
    </div>
  ),
});
