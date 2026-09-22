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
      <div className="flex justify-center border-b border-[var(--pe-border)] bg-[var(--pe-surface)] px-3 py-1.5">
        <p className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--pe-border)] bg-[var(--pe-surface-2)] px-3 py-1 text-[11px] leading-snug text-[var(--pe-text-3)]">
          <FlaskConical className="h-3 w-3 shrink-0" />
          <span>
            <span className="font-semibold text-[var(--pe-text-2)]">Studio V2 preview</span>
            {' — experimental · production Studio unchanged at '}
            <Link href="/studio" className="font-medium text-[var(--pe-text-2)] underline underline-offset-2">
              /studio
            </Link>
          </span>
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <StudioV2PreviewLazy />
      </div>
    </div>
  );
}
