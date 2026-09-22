import Link from 'next/link';
import { ShieldCheck, Zap, FileText, Lock, Globe } from 'lucide-react';

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
    title: 'Private by design',
    text: 'Files are processed locally in your browser with client-side technology. Your documents are never uploaded to our servers, stored, or viewed by anyone.',
  },
  {
    icon: Zap,
    title: 'Fast and free',
    text: 'No accounts, no watermarks on core tools, no waiting in upload queues. Open a tool and start working immediately.',
  },
  {
    icon: Lock,
    title: 'No sign-up required',
    text: 'We deliberately avoid accounts and personal-data collection, so there is nothing to leak, sell, or misuse.',
  },
  {
    icon: Globe,
    title: 'Works everywhere',
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
};

export default function AboutPage() {
  return (
    <main className='max-w-4xl mx-auto px-4 py-12'>
      <h1 className='text-3xl font-bold mb-2'>About PDFEdit</h1>
      <p className='text-gray-600 mb-8'>Free PDF tools that respect your privacy.</p>

      <section className='space-y-4 text-gray-700 mb-10'>
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
        <h2 className='text-xl font-semibold mb-3'>Popular tools</h2>
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

      <section className='rounded-2xl bg-gray-50 border border-gray-200 p-5 text-sm text-gray-600'>
        <h2 className='font-semibold text-gray-800 mb-2 flex items-center gap-2'>
          <FileText className='h-4 w-4' aria-hidden='true' /> Policies
        </h2>
        <p className='mb-2'>
          How we handle data and advertising is described in our{' '}
          <Link href='/privacy' className='text-blue-600 underline'>Privacy Policy</Link>, and the
          rules for using the site are in our{' '}
          <Link href='/terms' className='text-blue-600 underline'>Terms of Service</Link>.
        </p>
        <p>
          PDFEdit is operated by the PDFEdit team. For questions about this site, see our{' '}
          <Link href='/privacy' className='text-blue-600 underline'>Privacy Policy</Link> or{' '}
          <Link href='/terms' className='text-blue-600 underline'>Terms of Service</Link>.
        </p>
      </section>
    </main>
  );
}
