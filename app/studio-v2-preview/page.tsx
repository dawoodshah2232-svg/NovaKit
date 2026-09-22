import type { Metadata } from 'next';
import Link from 'next/link';
import { FlaskConical } from 'lucide-react';
import { StudioV2PreviewLazy } from '@/components/studiov2/StudioV2PreviewLazy';

export const metadata: Metadata = {
  title: 'Studio V2 Preview — PDFEdit',
  robots: { index: false, follow: false },
};

export default function StudioV2PreviewPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--pe-bg)]">
      <div className="flex items-center justify-center gap-2 border-b border-[var(--pe-border)] bg-[var(--pe-accent-soft)] px-4 py-2 text-center text-xs text-[var(--pe-text-2)]">
        <FlaskConical size={14} className="shrink-0 text-[var(--pe-accent)]" />
        <span>
          <strong className="font-semibold text-[var(--pe-text)]">Studio V2 preview</strong>
          {' '}— experimental. The production Studio is unchanged at{' '}
          <Link href="/studio" className="font-medium text-[var(--pe-accent)] underline underline-offset-2">
            /studio
          </Link>.
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <StudioV2PreviewLazy />
      </div>
    </div>
  );
}
