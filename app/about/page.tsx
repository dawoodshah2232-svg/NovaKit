import Link from 'next/link';
import { ShieldCheck, Zap, FileText, Lock, Globe } from 'lucide-react';
import { JsonLd, aboutSchema } from '@/components/schema-jsonld';
import { PageFaq } from '@/components/page-faq';
import type { BlogFaq } from '@/lib/blog';

const ABOUT_FAQS: BlogFaq[] = [
  {
    q: 'Is PDFEdit really free?',
    a: 'Yes. All core PDF tools on PDFEdit are free to use, with no watermarks on core tools and no subscription.',
  },
  {
    q: 'Are my files uploaded to your servers?',
    a: 'No. Every tool runs directly in your browser on your own device. Your documents are never uploaded to our servers, stored, or viewed by anyone.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No. PDFEdit has no accounts and no sign-up. We deliberately avoid collecting personal data, so there is nothing to leak or misuse.',
  },
  {
    q: 'Who runs PDFEdit?',
    a: 'PDFEdit is an independent project operated by Dawood Shah from Dubai, United Arab Emirates — a free utility site funded by advertising.',
  },
  {
    q: 'Does PDFEdit work on mobile?',
    a: 'Yes. The tools run in modern browsers on both desktop and mobile, with light and dark themes built in.',
  },
];

const TOOL_GROUPS = [
  { label: 'Merge PDF', href: '/merge-pdf' },
  { label: 'Split PDF', href: '/split-pdf' },
  { label: 'Compress PDF', href: '/compress-pdf' },
  { label: 'PDF to Word', href: '/pdf-to-word' },
  { label: 'Word to PDF', href: '/word-to-pdf' },
  { label: 'Sign PDF', href: '/sign-pdf' },
  { label: 'PDF Studio', href: '/studio' },
  { label: 'All tools', href: '/#tools' },
];

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: 'Your files never leave your device',
    text: 'Files are processed locally in your browser with client-side technology. Your documents are never uploaded to our servers, stored, or viewed by anyone.',
  },
  {
    icon: Zap,
    title: 'No accounts, no watermarks, no upload queues',
    text: 'No accounts, no watermarks on core tools, no waiting in upload queues. Open a tool and start working immediately.',
  },
  {
    icon: Lock,
    title: 'No accounts means nothing to leak',
    text: 'We deliberately avoid accounts and personal-data collection, so there is nothing to leak, sell, or misuse.',
  },
  {
    icon: Globe,
    title: 'Works in any modern browser, on desktop or mobile',
    text: 'Modern browsers on desktop and mobile, with light and dark themes built in.',
  },
];

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'About PDFEdit | Free Private PDF Tools' },
  description:
    'About PDFEdit: free, private, browser-based PDF tools. Files are processed locally on your device and never uploaded to our servers.',
  alternates: {
    canonical: 'https://www.pdfedit.website/about',
  },
  openGraph: {
    title: 'About PDFEdit | Free Private PDF Tools',
    description:
      'Free, private, browser-based PDF tools. Files are processed locally on your device and never uploaded to our servers.',
    url: 'https://www.pdfedit.website/about',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <main className='max-w-4xl mx-auto px-4 py-12'>
      <JsonLd schema={aboutSchema} />
      <h1 className='text-3xl font-bold mb-2'>About PDFEdit</h1>
      <p className='text-gray-600 mb-8'>Free PDF tools that respect your privacy.</p>

      <section className='space-y-4 text-gray-700 mb-10'>
        <h2 className='text-xl font-semibold'>Everyday PDF work, free — without asking for your files</h2>
        <p>
          PDFEdit is a free PDF tool that works entirely in your browser &mdash; your files are
          never uploaded. Our mission: make everyday PDF work free, fast, and private &mdash;
          without accounts, uploads, or subscriptions getting in the way. Every tool on PDFEdit is
          built to run directly on your device, so your documents stay yours.
        </p>
        <p>
          PDFEdit (www.pdfedit.website) is a free collection of browser-based PDF utility tools:
          merging, splitting, compressing, rotating, cropping, watermarking, signing, redacting,
          converting between PDF, Word, JPG, and text formats, and a full in-browser PDF Studio for
          editing, annotating, and organizing documents.
        </p>
        <p>
          Unlike most online PDF services, everything runs on your device. When you merge or convert
          a file, the work happens inside your browser tab &mdash; your documents never travel to a
          server. That architecture is the foundation of everything we do: if we never receive your
          files, we can&apos;t lose them, share them, or feed them to anyone.
        </p>
      </section>

      <section className='grid gap-4 sm:grid-cols-2 mb-10'>
        {PRINCIPLES.map(({ icon: Icon, title, text }) => (
          <div key={title} className='rounded-2xl border border-gray-200 bg-white p-5'>
            <Icon className='h-5 w-5 text-red-600 mb-2' aria-hidden='true' />
            <h2 className='font-semibold mb-1'>{title}</h2>
            <p className='text-sm text-gray-600'>{text}</p>
          </div>
        ))}
      </section>

      <section className='mb-10'>
        <h2 className='text-xl font-semibold mb-3'>The PDF tools people reach for every day</h2>
        <div className='flex flex-wrap gap-2'>
          {TOOL_GROUPS.map(({ label, href }) => (
            <Link
              key={href + label}
              href={href}
              className='px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:text-red-600 hover:border-red-300 transition'
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section className='space-y-3 text-gray-700'>
        <h2 className='text-xl font-semibold'>Funded by advertising — not by your files, your email, or your money</h2>
        <p>
          PDFEdit is operated by Dawood Shah from Dubai, United Arab Emirates. It is an independent
          project: a free utility site funded by advertising, built to do one thing well &mdash;
          handle everyday PDF work without asking for your files, your email, or your money.
        </p>
      </section>

      <section className='rounded-2xl bg-gray-50 border border-gray-200 p-5 text-sm text-gray-600 mb-10'>
        <h2 className='font-semibold text-gray-800 mb-2 flex items-center gap-2'>
          <FileText className='h-4 w-4' aria-hidden='true' /> Policies
        </h2>
        <p className='mb-2'>
          How we handle data and advertising is described in our{' '}
          <Link href='/privacy' className='text-blue-600 underline'>Privacy Policy</Link>, the
          rules for using the site are in our{' '}
          <Link href='/terms' className='text-blue-600 underline'>Terms of Service</Link>, cookie
          and browser-storage details are in our{' '}
          <Link href='/cookies' className='text-blue-600 underline'>Cookie Policy</Link>, and the
          limits of our tools &mdash; accuracy, signatures, redaction, and professional advice
          &mdash; are in our <Link href='/disclaimer' className='text-blue-600 underline'>Disclaimer</Link>.
        </p>
      </section>

      <section className='space-y-3 text-gray-700'>
        <h2 className='text-xl font-semibold'>Contact</h2>
        <p>
          For support, feedback, business inquiries, or abuse reports, visit our{' '}
          <Link href='/contact' className='text-blue-600 underline'>contact page</Link>.
        </p>
        <p>
          Our support email address is published on our{' '}
          <Link href='/contact' className='text-blue-600 underline'>contact page</Link> — write to
          us any time for support, feedback, business inquiries, or abuse reports.
        </p>
      </section>

      <PageFaq
        faqs={ABOUT_FAQS}
        pageUrl="https://www.pdfedit.website/about"
        intro="The short version of everything above, in question-and-answer form."
      />
    </main>
  );
}
