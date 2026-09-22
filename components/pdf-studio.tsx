'use client';

/**
 * PDFEdit Studio entry point.
 * The heavy editor (pdf.js, pdf-lib, canvas tooling) is code-split behind
 * a dynamic import so /studio stays light until it is actually rendered.
 * (Previous monolithic implementation is preserved in git history.)
 */
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const Studio = dynamic(() => import('./studio/Studio').then((m) => m.Studio), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-300">
        <Loader2 className="w-5 h-5 animate-spin text-red-400" />
        <span className="text-sm">Loading PDFEdit Studio…</span>
      </div>
    </div>
  ),
});

export function PdfStudio() {
  return <Studio />;
}
