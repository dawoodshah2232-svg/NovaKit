import { PreviewHeader, PreviewFooter, PreviewThemeSync } from '@/components/ui-preview/chrome';
import { Hero, PopularTools, Categories, StudioPromo, Trust, WhyPdfEdit } from '@/components/ui-preview/sections';

/**
 * /ui-preview — isolated homepage UI concept.
 * PREVIEW ONLY: does not replace or affect the production homepage (/).
 */
export default function UiPreviewPage() {
  return (
    <div className="pe-preview -mx-4 -my-5 sm:-mx-6 sm:-my-7 lg:-mx-8">
      <PreviewThemeSync />
      {/* concept ribbon — clearly marks this as a design preview */}
      <div className="bg-[var(--pe-ink-bg)] px-4 py-2 text-center text-[12px] font-medium tracking-wide text-[var(--pe-ink-text-2)]">
        <span className="mr-2 inline-block rounded-full bg-[var(--pe-accent-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--pe-accent)]">
          Preview
        </span>
        Design concept — the live homepage is untouched. Nothing here is final.
      </div>

      <PreviewHeader />

      <main>
        <Hero />
        <PopularTools />
        <Categories />
        <StudioPromo />
        <Trust />
        <WhyPdfEdit />
      </main>

      <PreviewFooter />
    </div>
  );
}
