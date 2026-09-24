import type { Metadata } from 'next';
import { ComparePage, type CompareConfig } from '@/components/compare-page';

const url = 'https://www.pdfedit.website/compare/pdfedit-vs-smallpdf';

const config: CompareConfig = {
  competitorName: 'Smallpdf',
  competitorSite: 'https://smallpdf.com',
  slug: 'pdfedit-vs-smallpdf',
  url,
  h1: 'PDFEdit is a free, browser-only alternative to Smallpdf — no uploads, no account, no 2-task daily limit.',
  intro: [
    'Smallpdf is one of the best-known online PDF platforms, and its free plan gives you access to 21 tools — but caps you at 2 tasks per day. After that you either wait until tomorrow or pay for Pro at $12/month (or $108 billed annually). PDFEdit takes the opposite approach: 32 tools that run entirely in your browser, with no daily caps, no account, and no watermark on core tools.',
    'The deeper difference is architectural. Smallpdf processes your files on its cloud servers. PDFEdit never uploads anything — your files stay on your device, which you can verify yourself by watching the network tab while you work.',
  ],
  verdictPdfEdit:
    'Pick PDFEdit if you want quick, private PDF work with zero friction: no account, no daily limits, and files that never leave your device.',
  verdictCompetitor:
    'Pick Smallpdf if you need polished OCR, AI document features, team workspaces, or mobile apps — and you are willing to pay $12/month for unlimited use.',
  tableRows: [
    {
      feature: 'Free usage limit',
      pdfedit: 'Unlimited — no daily or hourly task caps',
      competitor: '2 tasks per day on the free plan',
    },
    {
      feature: 'Cost to remove limits',
      pdfedit: 'Free forever — there is no paid tier',
      competitor: 'Pro: $12/month, or $108/year billed annually',
    },
    {
      feature: 'Where files are processed',
      pdfedit: '100% in your browser — files never leave your device',
      competitor: 'Uploaded to Smallpdf’s cloud servers for processing',
    },
    {
      feature: 'Account required',
      pdfedit: 'No account, ever',
      competitor: 'Free account signup is pushed from the first interaction',
    },
    {
      feature: 'Watermark on free output',
      pdfedit: 'No watermark on core tools',
      competitor: 'Some free-tier outputs include a watermark, depending on the tool',
    },
    {
      feature: 'Number of tools',
      pdfedit: '32 tools, plus 100 step-by-step guides',
      competitor: '21 tools on the free plan',
    },
    {
      feature: 'OCR (scanned PDFs)',
      pdfedit: 'Browser-based OCR included free',
      competitor: 'OCR is a Pro-only feature',
    },
    {
      feature: 'PDF editor',
      pdfedit: 'PDF Studio editor, free in the browser',
      competitor: 'The full editor is Pro-only',
    },
    {
      feature: 'AI features',
      pdfedit: 'None — PDFEdit does not compete here',
      competitor: 'Chat with PDF, AI summarizer, question generator (mostly Pro)',
    },
    {
      feature: 'eSign',
      pdfedit: 'Basic signature placement, free',
      competitor: 'Full e-signature workflows (Pro)',
    },
    {
      feature: 'Mobile & desktop apps',
      pdfedit: 'Web only — works on any device with a browser',
      competitor: 'iOS, Android, and desktop apps',
    },
    {
      feature: 'Cloud sync & teams',
      pdfedit: 'Not needed — nothing leaves your device',
      competitor: 'Yes, via Smallpdf account (Pro)',
    },
  ],
  tableNote:
    'Competitor details are based on Smallpdf’s published pricing page and independent reviews as of September 2026. Plans and limits can change — check smallpdf.com/pricing before you buy.',
  competitorWins: [
    {
      title: 'Polished, professional UX',
      text: 'Smallpdf has one of the cleanest interfaces in the category — smooth drag-and-drop, guided workflows, and error recovery that feel considered. If polish matters to you, it shows.',
    },
    {
      title: 'Proprietary OCR',
      text: 'Smallpdf’s OCR produces noticeably cleaner text from scanned PDFs than open-source alternatives. If you regularly digitize scans, this alone can justify Pro.',
    },
    {
      title: 'AI document tools',
      text: 'Chat with your PDF, AI summarization, and question generation are genuinely useful for research and long documents — a category PDFEdit does not compete in.',
    },
    {
      title: 'Team workflows and sync',
      text: 'Shared folders, cloud storage, and cross-device sync make Smallpdf Pro a reasonable pick for teams that live in PDFs all day.',
    },
  ],
  pdfeditWins: [
    {
      title: 'No 2-task daily wall',
      text: 'Merge, compress, and convert as many files as you need. PDFEdit has no daily quota, so batch work never stalls at task three.',
    },
    {
      title: 'Verifiable privacy',
      text: 'Nothing uploads — ever. You can open your browser’s developer tools and watch zero network requests during processing. With server-side tools, deletion promises are a matter of trust.',
    },
    {
      title: 'No account, no funnel',
      text: 'Open the tool and start. No signup prompts, no trial timers, no upsell screens between you and your file.',
    },
    {
      title: 'Free OCR and signing',
      text: 'OCR and electronic signatures are Pro-only on Smallpdf. On PDFEdit they are free, in the browser, with no watermark on core tools.',
    },
  ],
  faqs: [
    {
      q: 'Is PDFEdit really free?',
      a: 'Yes. All 32 tools are free with no daily task limit, no account, and no watermark on core tools. There is no paid tier to upsell you into.',
    },
    {
      q: 'Why does Smallpdf limit free users to 2 tasks per day?',
      a: 'It is a freemium funnel: the free tier is designed for occasional use, and heavy users are expected to upgrade to Pro at $12/month (or $108/year billed annually). That is their stated business model on their pricing page.',
    },
    {
      q: 'Is it safe to upload sensitive PDFs to Smallpdf?',
      a: 'Smallpdf uses encrypted connections and states files are auto-deleted. But any server-side tool requires trusting its deletion promise. If the document is sensitive — contracts, medical, financial — a browser-only tool like PDFEdit removes the question entirely, because nothing uploads.',
    },
    {
      q: 'Does Smallpdf add a watermark?',
      a: 'Some free-tier outputs include a watermark depending on the tool. PDFEdit adds no watermark on its core tools.',
    },
    {
      q: 'Can PDFEdit handle the same tasks as Smallpdf?',
      a: 'For everyday tasks — merge, split, compress, convert, sign, OCR, watermark, protect — yes, all free in your browser. Smallpdf pulls ahead on AI features, advanced e-signature workflows, and team collaboration.',
    },
    {
      q: 'Do I need to install anything to use PDFEdit?',
      a: 'No. PDFEdit runs in any modern browser on desktop or mobile. There are no native apps — Smallpdf wins if you want those.',
    },
  ],
  relatedTools: [
    { href: '/merge-pdf', name: 'Merge PDF', blurb: 'Combine multiple PDFs into one document, in your browser.' },
    { href: '/compress-pdf', name: 'Compress PDF', blurb: 'Shrink PDF file size without visible quality loss.' },
    { href: '/ocr-pdf', name: 'OCR PDF', blurb: 'Extract text from scanned PDFs with browser-based OCR — free.' },
  ],
  relatedGuides: [
    { href: '/blog/free-pdf-tools-vs-adobe-acrobat', title: 'Free PDF Tools vs Adobe Acrobat: What You Actually Need' },
    { href: '/blog/how-to-choose-pdf-tool-online', title: 'How to Choose a PDF Tool Online (Without Risking Your Files)' },
    { href: '/blog/how-to-merge-pdf-files', title: 'How to Merge PDF Files Into One Document' },
    { href: '/blog/how-to-ocr-a-scanned-pdf', title: 'How to OCR a Scanned PDF and Extract Its Text' },
  ],
};

export const metadata: Metadata = {
  title: { absolute: 'PDFEdit vs Smallpdf: Free Browser-Only Alternative (2026) | PDFEdit' },
  description:
    'PDFEdit vs Smallpdf compared honestly: PDFEdit is free with no uploads, no account, and no daily task limit. Smallpdf free is limited to 2 tasks/day; Pro is $12/month. See where each wins.',
  alternates: { canonical: url },
  openGraph: {
    title: 'PDFEdit vs Smallpdf: Free Browser-Only Alternative | PDFEdit',
    description:
      'No uploads, no account, no 2-task daily limit. An honest side-by-side of PDFEdit and Smallpdf.',
    url,
    siteName: 'PDFEdit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDFEdit vs Smallpdf: Free Browser-Only Alternative | PDFEdit',
    description:
      'No uploads, no account, no 2-task daily limit. An honest side-by-side of PDFEdit and Smallpdf.',
  },
};

export default function Page() {
  return <ComparePage config={config} />;
}
