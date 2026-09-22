'use client';

/**
 * Client-side lazy loader for the Studio V2 preview editor (heavy: pdf-lib,
 * pdfjs-dist, canvas editor UI). The /studio-v2-preview server page keeps its
 * metadata while the editor bundle loads only in the browser.
 */
import dynamic from 'next/dynamic';

export const StudioV2PreviewLazy = dynamic(
  () => import('./StudioV2Preview').then((m) => m.StudioV2Preview),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[70vh] items-center justify-center text-[var(--pe-text-2)]">
        <div className="flex items-center gap-2 text-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--pe-accent)] border-t-transparent" />
          Loading Studio V2 preview…
        </div>
      </div>
    ),
  },
);
