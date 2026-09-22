import type { Metadata } from 'next';
import Link from 'next/link';
import { FlaskConical } from 'lucide-react';
import { CvBuilderV2Lazy } from '@/components/cvv2/CvBuilderV2Lazy';

export const metadata: Metadata = {
  title: { absolute: 'CV Builder V2 Preview — PDFEdit' },
  description: 'Preview of the next-generation PDFEdit CV builder: direct on-page editing, 8 new templates, and one-click PDF export.',
  robots: { index: false, follow: false },
};

export default function CvBuilderPreviewPage() {
  return (
    <main className="min-h-screen bg-[var(--pe-bg)]">
      <div className="flex items-center gap-2 border-b border-[var(--pe-border)] bg-[var(--pe-accent-soft)] px-4 py-2 text-sm">
        <FlaskConical className="h-4 w-4 shrink-0 text-[var(--pe-accent)]" />
        <p className="text-[var(--pe-text-2)]">
          <span className="font-semibold text-[var(--pe-text)]">CV Builder V2 preview</span>
          {' — experimental. The production builder is unchanged at '}
          <Link href="/cv-builder" className="font-medium text-[var(--pe-accent)] underline underline-offset-2">
            /cv-builder
          </Link>
          .
        </p>
      </div>
      <CvBuilderV2Lazy />
    </main>
  );
}
