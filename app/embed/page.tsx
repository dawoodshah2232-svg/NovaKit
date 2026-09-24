import type { Metadata } from 'next';
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';
import { EmbedCopyButton, EmbedChromeHider } from '@/components/embed-copy-button';

const BASE_URL = 'https://www.pdfedit.website';

const EMBED_SNIPPET = `<iframe src="${BASE_URL}/embed?bare=1" width="100%" height="480" style="border:0;border-radius:12px" loading="lazy" title="Free PDF tools by PDFEdit"></iframe>`;

interface EmbedPageProps {
  searchParams: Promise<{ bare?: string }>;
}

export async function generateMetadata({ searchParams }: EmbedPageProps): Promise<Metadata> {
  const { bare } = await searchParams;
  if (bare === '1') {
    // The bare iframe view is a widget fragment, not a standalone page.
    return { robots: { index: false, follow: true } };
  }
  return {
    title: { absolute: 'Embed free PDF tools on your website | PDFEdit' },
    description:
      'Add a free PDF tools widget to your website with one line of code. Merge, compress, split, convert and sign PDFs — powered by PDFEdit.',
    alternates: { canonical: `${BASE_URL}/embed` },
    openGraph: {
      title: 'Embed free PDF tools on your website | PDFEdit',
      description:
        'One line of code adds a free PDF tools widget to any website. Powered by PDFEdit.',
      url: `${BASE_URL}/embed`,
      siteName: 'PDFEdit',
      type: 'website',
    },
  };
}

export default async function EmbedPage({ searchParams }: EmbedPageProps) {
  const { bare } = await searchParams;
  const isBare = bare === '1';

  if (isBare) {
    return (
      <main className="mx-auto w-full max-w-3xl px-2 py-2">
        <EmbedChromeHider />
        <EmbedWidget />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--pe-text)]">
        Embed free PDF tools on your website
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--pe-text-2)]">
        Give your visitors 8 essential PDF tools — merge, compress, split, convert, sign,
        OCR and more — with a single line of code. The widget is free, lightweight, and
        every tool opens on PDFEdit, where files are processed in the visitor&apos;s
        browser with no uploads and no sign-up.
      </p>

      <h2 className="mt-8 text-lg font-bold text-[var(--pe-text)]">Live preview</h2>
      <div className="mt-3">
        <EmbedWidget />
      </div>

      <h2 className="mt-8 text-lg font-bold text-[var(--pe-text)]">Embed code</h2>
      <p className="mt-2 text-sm text-[var(--pe-text-2)]">
        Paste this where you want the widget to appear:
      </p>
      <pre className="mt-3 overflow-x-auto rounded-2xl border border-[var(--pe-border)] bg-[var(--pe-surface-3)] p-4 text-xs leading-relaxed text-[var(--pe-text)]">
        <code>{EMBED_SNIPPET}</code>
      </pre>
      <div className="mt-4">
        <EmbedCopyButton snippet={EMBED_SNIPPET} />
      </div>

      <p className="mt-8 text-xs leading-relaxed text-[var(--pe-text-3)]">
        The widget includes a “Powered by PDFEdit” link back to{' '}
        <Link href="/" className="font-semibold text-[var(--pe-accent)] hover:underline">
          pdfedit.website
        </Link>
        . You&apos;re welcome to place it on blogs, resource pages, intranets, or
        school sites.
      </p>
    </main>
  );
}
