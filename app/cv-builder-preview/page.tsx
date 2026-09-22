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
      <div className="flex justify-center border-b border-[var(--pe-border)] bg-[var(--pe-surface)] px-3 py-1.5">
        <p className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--pe-border)] bg-[var(--pe-surface-2)] px-3 py-1 text-[11px] leading-snug text-[var(--pe-text-3)]">
          <FlaskConical className="h-3 w-3 shrink-0" />
          <span>
            <span className="font-semibold text-[var(--pe-text-2)]">CV Builder V2 preview</span>
            {' — experimental · production builder unchanged at '}
            <Link href="/cv-builder" className="font-medium text-[var(--pe-text-2)] underline underline-offset-2">
              /cv-builder
            </Link>
          </span>
        </p>
      </div>
      <CvBuilderV2Lazy />
    </main>
  );
}
