import type { Metadata } from 'next';
import Link from 'next/link';
import {
  LifeBuoy,
  MessageSquareText,
  Briefcase,
  ShieldAlert,
  Mail,
  Clock,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { JsonLd, contactSchema } from '@/components/schema-jsonld';

export const metadata: Metadata = {
  title: { absolute: 'Contact PDFEdit | Support, Feedback & Business Inquiries' },
  description:
    'Contact PDFEdit for support, feedback, business inquiries, and abuse reports. What to include for a fast reply, response expectations, and links to the FAQ and key tools.',
  alternates: {
    canonical: 'https://www.pdfedit.website/contact',
  },
  openGraph: {
    title: 'Contact PDFEdit | Support, Feedback & Business Inquiries',
    description:
      'Get support, send feedback, or reach out about business inquiries and abuse reports.',
    url: 'https://www.pdfedit.website/contact',
    siteName: 'PDFEdit',
    type: 'website',
  },
};

const REASONS = [
  {
    icon: LifeBuoy,
    title: 'Support',
    text: 'A tool is failing, a file won\u2019t process, or something on the site looks broken. Tell us which tool, which browser, and what error you saw.',
  },
  {
    icon: MessageSquareText,
    title: 'Feedback & feature requests',
    text: 'Ideas for a new tool, a format we don\u2019t handle yet, or a way an existing tool could be better.',
  },
  {
    icon: Briefcase,
    title: 'Business inquiries',
    text: 'Partnerships, licensing, or using PDFEdit\u2019s tools as part of a product or workflow.',
  },
  {
    icon: ShieldAlert,
    title: 'Abuse reports',
    text: 'If someone is using PDFEdit in a way that harms others, tell us what happened and where on the site.',
  },
];

const WHAT_TO_INCLUDE = [
  'The exact tool page (e.g. /compress-pdf, /sign-pdf) and what you were trying to do.',
  'Your browser and operating system (e.g. Chrome 128 on Windows, Safari on iPhone).',
  'The exact error message, if any, or a description of what went wrong.',
  'The file type and approximate size (e.g. a 40 MB scanned PDF). Do not send the file itself unless we ask for it.',
  'Steps that reproduce the problem, so we can verify it on our side.',
];

const KEY_TOOLS = [
  { label: 'Merge PDF', href: '/merge-pdf' },
  { label: 'Compress PDF', href: '/compress-pdf' },
  { label: 'PDF to Word', href: '/pdf-to-word' },
  { label: 'Sign PDF', href: '/sign-pdf' },
  { label: 'PDF Studio', href: '/studio' },
  { label: 'All tools', href: '/#tools' },
];

export default function ContactPage() {
  return (
    <main className='max-w-4xl mx-auto px-4 py-12'>
      <JsonLd schema={contactSchema} />
      <nav aria-label='Breadcrumb' className='mb-3'>
        <ol className='flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400'>
          <li>
            <Link href='/' className='hover:text-slate-900 dark:hover:text-white transition-colors'>
              Home
            </Link>
          </li>
          <li aria-hidden='true' className='text-slate-300 dark:text-slate-600'>/</li>
          <li aria-current='page' className='text-slate-900 dark:text-white font-semibold'>
            Contact
          </li>
        </ol>
      </nav>

      <h1 className='text-3xl font-bold mb-2 text-slate-900 dark:text-white'>Contact PDFEdit</h1>
      <p className='text-slate-600 dark:text-slate-400 mb-8'>
        Support, feedback, business inquiries, and abuse reports — here&apos;s how to reach us.
      </p>

      <section className='grid gap-4 sm:grid-cols-2 mb-10'>
        {REASONS.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className='rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5'
          >
            <Icon className='h-5 w-5 text-red-600 dark:text-red-400 mb-2' aria-hidden='true' />
            <h2 className='font-semibold mb-1 text-slate-900 dark:text-white'>{title}</h2>
            <p className='text-sm text-slate-600 dark:text-slate-400'>{text}</p>
          </div>
        ))}
      </section>

      <section className='mb-10'>
        <h2 className='text-xl font-semibold mb-3 text-slate-900 dark:text-white'>
          What to include when contacting support
        </h2>
        <ul className='space-y-2 text-slate-700 dark:text-slate-300 text-sm'>
          {WHAT_TO_INCLUDE.map((item) => (
            <li key={item} className='flex gap-2'>
              <ArrowRight className='h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5' aria-hidden='true' />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className='rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-5 mb-10'>
        <h2 className='font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2'>
          <Mail className='h-4 w-4 text-red-600 dark:text-red-400' aria-hidden='true' /> Email support
          — coming soon
        </h2>
        <p className='text-sm text-slate-700 dark:text-slate-300'>
          A dedicated support email address has not been published yet. This section will be updated
          as soon as one is available.
        </p>
      </section>

      <section className='mb-10'>
        <h2 className='text-xl font-semibold mb-3 text-slate-900 dark:text-white flex items-center gap-2'>
          <Clock className='h-5 w-5 text-red-600 dark:text-red-400' aria-hidden='true' /> Response
          expectations
        </h2>
        <div className='space-y-3 text-sm text-slate-700 dark:text-slate-300'>
          <p>
            Every message is read. We prioritize abuse reports and issues that affect many users,
            then work through support requests and feedback in the order they arrive.
          </p>
          <p>
            Because PDFEdit processes everything in your browser, most support questions can be
            answered without you sharing any file with us — and the{' '}
            <Link href='/faq' className='text-red-600 dark:text-red-400 underline'>
              FAQ / Help Center
            </Link>{' '}
            already covers the common ones: how files are handled, size limits, supported browsers,
            and troubleshooting failed conversions. Checking there first is the fastest way to get an
            answer.
          </p>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-xl font-semibold mb-3 text-slate-900 dark:text-white'>Key tools</h2>
        <div className='flex flex-wrap gap-2'>
          {KEY_TOOLS.map(({ label, href }) => (
            <Link
              key={href + label}
              href={href}
              className='px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700 transition'
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section className='rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 text-sm text-slate-600 dark:text-slate-400'>
        <h2 className='font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2'>
          <FileText className='h-4 w-4' aria-hidden='true' /> Policies
        </h2>
        <p className='mb-2'>
          How we handle data is described in our{' '}
          <Link href='/privacy' className='text-red-600 dark:text-red-400 underline'>Privacy Policy</Link>,
          and the rules for using the site are in our{' '}
          <Link href='/terms' className='text-red-600 dark:text-red-400 underline'>Terms of Service</Link>.
          Cookie details are in our{' '}
          <Link href='/cookies' className='text-red-600 dark:text-red-400 underline'>Cookie Policy</Link>,
          and the limits of our tools are in our{' '}
          <Link href='/disclaimer' className='text-red-600 dark:text-red-400 underline'>Disclaimer</Link>.
        </p>
        <p>
          PDFEdit is operated by Dawood Shah from Dubai, United Arab Emirates. For questions about
          the site itself, start with the{' '}
          <Link href='/faq' className='text-red-600 dark:text-red-400 underline'>FAQ</Link>.
        </p>
      </section>
    </main>
  );
}
