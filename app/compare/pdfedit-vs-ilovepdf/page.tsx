import type { Metadata } from 'next';
import { ComparePage, type CompareConfig } from '@/components/compare-page';

const url = 'https://www.pdfedit.website/compare/pdfedit-vs-ilovepdf';

const config: CompareConfig = {
  competitorName: 'iLovePDF',
  competitorSite: 'https://www.ilovepdf.com',
  slug: 'pdfedit-vs-ilovepdf',
  url,
  h1: 'PDFEdit is a free, browser-only alternative to iLovePDF — your files never leave your device.',
  intro: [
    'iLovePDF is one of the most popular PDF platforms in the world, with around 25 tools and a generous free tier. But every file you process is uploaded to iLovePDF’s servers, and the free plan comes with limited document processing — unlimited use requires Premium at around $5/month on annual billing.',
    'PDFEdit matches the core toolkit — merge, split, compress, convert, sign, OCR — with one structural difference: everything runs in your browser. Files are never uploaded, there is no account, and there is no watermark on core tools.',
  ],
  verdictPdfEdit:
    'Pick PDFEdit when privacy matters or you want unlimited free use without accounts — sensitive documents, batch jobs, quick everyday tasks.',
  verdictCompetitor:
    'Pick iLovePDF when you want a mature all-rounder with a real editor, mobile apps, and e-signatures — and you are comfortable uploading files or paying around $5/month.',
  tableRows: [
    {
      feature: 'Free usage limit',
      pdfedit: 'Unlimited — no daily or hourly task caps',
      competitor: 'Limited document processing on the free plan',
    },
    {
      feature: 'Cost for unlimited use',
      pdfedit: 'Free forever — there is no paid tier',
      competitor: 'Premium: around $5/month on annual billing',
    },
    {
      feature: 'Where files are processed',
      pdfedit: '100% in your browser — never uploaded',
      competitor: 'Uploaded to iLovePDF’s servers',
    },
    {
      feature: 'Max file size (free)',
      pdfedit: 'Limited only by your device’s memory',
      competitor: '200 MB per task on the free plan',
    },
    {
      feature: 'Account required',
      pdfedit: 'No account, ever',
      competitor: 'No account needed for most free tools',
    },
    {
      feature: 'Watermark on free output',
      pdfedit: 'No watermark on core tools',
      competitor: 'Generally none on free tools',
    },
    {
      feature: 'Number of tools',
      pdfedit: '32 tools, plus 100 step-by-step guides',
      competitor: 'Around 25 PDF tools',
    },
    {
      feature: 'PDF editor',
      pdfedit: 'PDF Studio editor in the browser',
      competitor: 'Full PDF editor: text editing, annotations, form fields',
    },
    {
      feature: 'OCR (scanned PDFs)',
      pdfedit: 'Browser-based OCR, free',
      competitor: 'OCR included; higher quality on Premium',
    },
    {
      feature: 'eSign',
      pdfedit: 'Basic signature placement, free',
      competitor: 'Built-in electronic signatures and workflows',
    },
    {
      feature: 'AI features',
      pdfedit: 'None — PDFEdit does not compete here',
      competitor: 'AI summarizer and translator (limited on free)',
    },
    {
      feature: 'Mobile apps',
      pdfedit: 'Web only — works in any mobile browser',
      competitor: 'Native iOS and Android apps',
    },
  ],
  tableNote:
    'Competitor details are based on iLovePDF’s published pricing page and independent testing as of September 2026. Free-tier task counts vary by tool — check ilovepdf.com/pricing for current plans.',
  competitorWins: [
    {
      title: 'A real PDF editor',
      text: 'iLovePDF’s editor supports text editing, annotations, images, and form fields in one place. PDFEdit’s Studio covers common edits but is not a full document editor.',
    },
    {
      title: 'Native mobile apps',
      text: 'iLovePDF’s iOS and Android apps work well on the go. PDFEdit is web-only — fine in a mobile browser, but not a native app.',
    },
    {
      title: 'Speed at scale',
      text: 'iLovePDF runs on a global server network, so heavy server-side operations are fast worldwide. Browser-side processing is instant for typical files but depends on your device.',
    },
    {
      title: 'eSign and workflows',
      text: 'Built-in electronic signatures and document workflows suit businesses that send documents out for signing regularly.',
    },
  ],
  pdfeditWins: [
    {
      title: 'Zero-upload privacy',
      text: 'iLovePDF must upload your files to process them. PDFEdit never uploads anything — for sensitive documents, that is not a policy promise, it is architecture.',
    },
    {
      title: 'No processing caps',
      text: 'Work through a whole folder of invoices without counting tasks. No daily quota, no hourly quota.',
    },
    {
      title: 'No account',
      text: 'iLovePDF does not require an account for most free tools either — but PDFEdit requires one never, with no prompts at all.',
    },
    {
      title: 'Free, with guides',
      text: '32 tools plus 100 step-by-step guides, all free. No premium tier exists to upsell you into.',
    },
  ],
  faqs: [
    {
      q: 'Is PDFEdit really a replacement for iLovePDF?',
      a: 'For everyday tasks — merge, split, compress, convert, sign, OCR, protect — yes. iLovePDF stays ahead on its full document editor, mobile apps, and e-signature workflows.',
    },
    {
      q: 'Why does it matter that PDFEdit does not upload files?',
      a: 'Every server-side tool must receive your file to process it, which means trusting its deletion policy. PDFEdit processes files in your browser’s memory, so sensitive documents never travel across the internet at all.',
    },
    {
      q: 'What does iLovePDF Premium cost?',
      a: 'According to iLovePDF’s pricing page, Premium is around $5 per month on annual billing, with full tool access, unlimited document processing, and use across web, mobile, and desktop. Exact pricing varies by region and currency.',
    },
    {
      q: 'Does iLovePDF add watermarks?',
      a: 'Free output is generally watermark-free on most tools. PDFEdit likewise adds no watermark on its core tools.',
    },
    {
      q: 'Which is better for a team?',
      a: 'iLovePDF — it has workflows, digital signatures, and cross-device access built for shared use. PDFEdit is designed for individuals who want fast, private, free tools.',
    },
    {
      q: 'Does PDFEdit work on phones?',
      a: 'Yes, in any modern mobile browser — no install needed. But there are no native apps; iLovePDF’s iOS and Android apps are more polished on mobile.',
    },
  ],
  relatedTools: [
    { href: '/merge-pdf', name: 'Merge PDF', blurb: 'Combine multiple PDFs into one document, in your browser.' },
    { href: '/sign-pdf', name: 'Sign PDF', blurb: 'Place a drawn, typed, or image signature on any page — free.' },
    { href: '/compress-pdf', name: 'Compress PDF', blurb: 'Shrink PDF file size without visible quality loss.' },
  ],
  relatedGuides: [
    { href: '/blog/free-pdf-tools-vs-adobe-acrobat', title: 'Free PDF Tools vs Adobe Acrobat: What You Actually Need' },
    { href: '/blog/how-to-choose-pdf-tool-online', title: 'How to Choose a PDF Tool Online (Without Risking Your Files)' },
    { href: '/blog/how-to-sign-a-pdf-electronically', title: 'How to Sign a PDF Electronically (Legally Valid)' },
    { href: '/blog/how-to-compress-pdf', title: 'How to Compress a PDF Without Losing Quality' },
  ],
};

export const metadata: Metadata = {
  title: { absolute: 'PDFEdit vs iLovePDF: Free Browser-Only Alternative (2026) | PDFEdit' },
  description:
    'PDFEdit vs iLovePDF compared honestly: PDFEdit processes everything in your browser with no uploads and no account. iLovePDF uploads files to its servers; Premium is around $5/month on annual billing. See where each wins.',
  alternates: { canonical: url },
  openGraph: {
    title: 'PDFEdit vs iLovePDF: Free Browser-Only Alternative | PDFEdit',
    description:
      'Your files never leave your device. An honest side-by-side of PDFEdit and iLovePDF.',
    url,
    siteName: 'PDFEdit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDFEdit vs iLovePDF: Free Browser-Only Alternative | PDFEdit',
    description:
      'Your files never leave your device. An honest side-by-side of PDFEdit and iLovePDF.',
  },
};

export default function Page() {
  return <ComparePage config={config} />;
}
