import type { Metadata } from 'next';
import { ComparePage, type CompareConfig } from '@/components/compare-page';

const url = 'https://www.pdfedit.website/compare/pdfedit-vs-sejda';

const config: CompareConfig = {
  competitorName: 'Sejda',
  competitorSite: 'https://www.sejda.com',
  slug: 'pdfedit-vs-sejda',
  url,
  h1: 'PDFEdit is a free, browser-only alternative to Sejda — no 3-tasks-per-hour wall, no uploads.',
  intro: [
    'Sejda is a well-built independent PDF editor from the Netherlands, and its free tier is stated plainly on its own site: “Free service for documents up to 200 pages or 50 MB and 3 tasks per hour.” Merge, compress, then number pages — that is three tasks, and your hour is gone.',
    'PDFEdit takes a different approach: everything runs in your browser, so there is nothing to meter. No hourly quota, no page cap, no uploads — and no watermark on core tools.',
  ],
  verdictPdfEdit:
    'Pick PDFEdit when you want to chain several tasks without watching a quota, or when you want zero-upload privacy with zero installs.',
  verdictCompetitor:
    'Pick Sejda when precise text editing and form-filling are your main work — and install Sejda Desktop if you want its tools with no hourly limits and no uploads.',
  tableRows: [
    {
      feature: 'Free task limit',
      pdfedit: 'Unlimited — no hourly or daily caps',
      competitor: '3 tasks per hour (stated on sejda.com)',
    },
    {
      feature: 'Free document size',
      pdfedit: 'Limited only by your device’s memory',
      competitor: 'Up to 200 pages or 50 MB',
    },
    {
      feature: 'Where files are processed',
      pdfedit: '100% in your browser — never uploaded',
      competitor: 'Uploaded to Sejda’s servers, auto-deleted after 2 hours (their stated policy)',
    },
    {
      feature: 'Account required',
      pdfedit: 'No account, ever',
      competitor: 'No account needed for free use',
    },
    {
      feature: 'Watermark on free output',
      pdfedit: 'No watermark on core tools',
      competitor:
        'Free output from the editor and Fill & Sign tools carries a Sejda watermark; page tools like merge and split are watermark-free',
    },
    {
      feature: 'PDF editor',
      pdfedit: 'PDF Studio in-browser editor',
      competitor: 'One of the best-regarded free online PDF editors, strong on form-filling',
    },
    {
      feature: 'OCR (scanned PDFs)',
      pdfedit: 'Browser-based OCR, free',
      competitor: 'Free OCR limited to 10 pages per task',
    },
    {
      feature: 'Offline option',
      pdfedit: 'Not needed — the web app never uploads',
      competitor: 'Sejda Desktop: same tools offline, files never leave your computer',
    },
    {
      feature: 'Multi-file / batch',
      pdfedit: 'Batch tools with no task cap',
      competitor: 'Free users limited to a single file per task on some tools',
    },
  ],
  tableNote:
    'Sejda’s free-tier limits are quoted from sejda.com’s own tool pages as of September 2026. Paid plans remove the limits — check sejda.com/pricing for current pricing.',
  competitorWins: [
    {
      title: 'An excellent free editor',
      text: 'Sejda’s editor is one of the most capable free options anywhere — precise text editing, annotations, and especially form-filling. If editing and forms are your main job, it is superb within its limits.',
    },
    {
      title: 'Sejda Desktop is genuinely free and offline',
      text: 'The desktop app offers the same tools with no hourly limits and no uploads — a real answer to the privacy question, and worth installing if you do heavy PDF work.',
    },
    {
      title: 'Mature, focused product',
      text: 'Sejda is a bootstrapped indie product that has been refined since 2010. The interface is clean, the tools are deep, and it shows.',
    },
    {
      title: 'Form-fill specialist',
      text: 'For filling in and creating fillable PDF forms, Sejda is arguably the best free option online.',
    },
  ],
  pdfeditWins: [
    {
      title: 'No hourly wall',
      text: 'Three tasks per hour sounds generous until one workflow eats all three. PDFEdit has no quota at all — merge, compress, split, and sign in one sitting.',
    },
    {
      title: 'Zero-upload by default',
      text: 'Sejda’s online tools upload your files (auto-deleted after 2 hours per their policy); only the desktop app avoids that. PDFEdit never uploads, right in the browser tab.',
    },
    {
      title: 'No watermark on core tools',
      text: 'Sejda stamps its watermark on free output from the editor and Fill & Sign — the two tools casual users want most. PDFEdit’s core tools output clean files.',
    },
    {
      title: 'No install for privacy',
      text: 'You get Sejda-level privacy without downloading anything — nothing to install, update, or trust beyond the web page.',
    },
  ],
  faqs: [
    {
      q: 'What is Sejda’s free limit exactly?',
      a: 'Quoted from sejda.com: “Free service for documents up to 200 pages or 50 MB and 3 tasks per hour.” Each operation counts as a task, so a three-step workflow can use up an hour’s quota.',
    },
    {
      q: 'Does Sejda add a watermark?',
      a: 'On some tools, yes: free output from Sejda’s Edit PDF and Fill & Sign tools carries a Sejda watermark, while page tools like merge, split, and rotate are watermark-free. PDFEdit adds no watermark on its core tools.',
    },
    {
      q: 'Is Sejda safe for sensitive documents?',
      a: 'Sejda uploads files over an encrypted connection and states they are permanently deleted after processing (2 hours per their site). If you want zero upload, use Sejda Desktop — or PDFEdit, which processes everything in the browser.',
    },
    {
      q: 'Can I use Sejda without limits for free?',
      a: 'Their desktop app has no hourly limits and works offline. Online, the 3-tasks-per-hour limit applies unless you pay for a plan.',
    },
    {
      q: 'Is PDFEdit really unlimited?',
      a: 'Yes — because files never leave your browser, there is nothing server-side to meter. No hourly or daily caps, no account.',
    },
    {
      q: 'Which has the better PDF editor?',
      a: 'Sejda’s editor is more mature, especially for text editing and forms. PDFEdit’s Studio handles common edits in the browser with zero upload. For heavy editing, try both and keep the one you reach for.',
    },
  ],
  relatedTools: [
    { href: '/sign-pdf', name: 'Sign PDF', blurb: 'Place a drawn, typed, or image signature on any page — no watermark.' },
    { href: '/ocr-pdf', name: 'OCR PDF', blurb: 'Extract text from scanned PDFs with browser-based OCR — free.' },
    { href: '/edit-pdf', name: 'Edit PDF', blurb: 'Edit PDF content in your browser with zero uploads.' },
  ],
  relatedGuides: [
    { href: '/blog/free-pdf-tools-vs-adobe-acrobat', title: 'Free PDF Tools vs Adobe Acrobat: What You Actually Need' },
    { href: '/blog/how-to-choose-pdf-tool-online', title: 'How to Choose a PDF Tool Online (Without Risking Your Files)' },
    { href: '/blog/how-to-edit-a-pdf-online', title: 'How to Edit a PDF Online: The Complete Free Guide' },
    { href: '/blog/how-to-sign-a-pdf-electronically', title: 'How to Sign a PDF Electronically (Legally Valid)' },
  ],
};

export const metadata: Metadata = {
  title: { absolute: 'PDFEdit vs Sejda: Free Browser-Only Alternative, No Hourly Limit (2026) | PDFEdit' },
  description:
    'PDFEdit vs Sejda compared honestly: Sejda free is limited to 3 tasks per hour, 200 pages, and 50 MB. PDFEdit has no task caps and never uploads your files. See where each wins.',
  alternates: { canonical: url },
  openGraph: {
    title: 'PDFEdit vs Sejda: Free Browser-Only Alternative | PDFEdit',
    description:
      'No 3-tasks-per-hour wall, no uploads. An honest side-by-side of PDFEdit and Sejda.',
    url,
    siteName: 'PDFEdit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDFEdit vs Sejda: Free Browser-Only Alternative | PDFEdit',
    description:
      'No 3-tasks-per-hour wall, no uploads. An honest side-by-side of PDFEdit and Sejda.',
  },
};

export default function Page() {
  return <ComparePage config={config} />;
}
