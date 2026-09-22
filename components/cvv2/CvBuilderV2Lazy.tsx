'use client';

/**
 * Client-side lazy loader for CV Builder V2 (preview). The editor is heavy
 * (canvas engine + pdf-lib on export), so it loads only in the browser while
 * the /cv-builder-preview server page keeps its metadata.
 */
import dynamic from 'next/dynamic';

export const CvBuilderV2Lazy = dynamic(() => import('./CvBuilderV2').then((m) => m.CvBuilderV2), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60vh] items-center justify-center text-[var(--pe-text-2)]">
      <div className="flex items-center gap-2 text-sm">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--pe-accent)] border-t-transparent" />
        Loading CV Builder V2 preview…
      </div>
    </div>
  ),
});
