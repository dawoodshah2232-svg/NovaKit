import type { Metadata } from 'next';
import Link from 'next/link';
import { FaqFilter } from '@/components/faq-filter';

export const metadata: Metadata = {
  title: { absolute: 'FAQ & Help Center | PDFEdit' },
  description:
    'PDFEdit help center: how browser-based PDF processing works, file privacy, size limits, supported browsers and formats, troubleshooting, and more.',
  alternates: {
    canonical: 'https://www.pdfedit.website/faq',
  },
  openGraph: {
    title: 'FAQ & Help Center | PDFEdit',
    description:
      'Answers about PDFEdit: privacy, file limits, supported browsers and formats, and troubleshooting.',
    url: 'https://www.pdfedit.website/faq',
    siteName: 'PDFEdit',
    type: 'website',
  },
};

interface FaqItem {
  q: string;
  a: React.ReactNode;
  plain: string;
}

interface FaqCategory {
  id: string;
  title: string;
  intro: string;
  items: FaqItem[];
}

const tool = (href: string, label: string) => (
  <Link href={href} className='text-red-600 dark:text-red-400 underline'>
    {label}
  </Link>
);

const CATEGORIES: FaqCategory[] = [
  {
    id: 'privacy',
    title: 'Privacy & how it works',
    intro: 'How your files are handled when you use PDFEdit.',
    items: [
      {
        q: 'How does PDFEdit work?',
        a: (
          <>
            <p className='mb-2'>
              PDFEdit is a collection of tools that run entirely inside your browser tab. When you
              open a tool such as {tool('/compress-pdf', 'Compress PDF')} or{' '}
              {tool('/merge-pdf', 'Merge PDF')}, the page loads a client-side component (for
              example, the compressor is built on the pdf-lib library running in your browser) that
              reads your file, performs the operation, and produces the result — all on your device.
            </p>
            <p>There are no accounts, no upload queues, and no waiting on a server.</p>
          </>
        ),
        plain:
          'PDFEdit tools run entirely inside your browser tab using client-side libraries such as pdf-lib. There are no accounts, no upload queues, and no waiting on a server.',
      },
      {
        q: 'Are my files uploaded to a server?',
        a: (
          <p>
            No. Processing is client-side: your documents never leave your device. They are not
            uploaded to our servers, not stored anywhere, and never viewed by anyone. See our{' '}
            {tool('/privacy', 'Privacy Policy')} for details on what data the site does collect
            (such as advertising and analytics).
          </p>
        ),
        plain:
          'No. Processing is client-side: your documents never leave your device. They are not uploaded to servers, not stored anywhere, and never viewed by anyone.',
      },
      {
        q: 'Is it safe to use for confidential documents?',
        a: (
          <p>
            Yes — this is exactly what PDFEdit is designed for. Because files never leave your
            browser, contracts, medical records, and other sensitive documents are not exposed to
            any third party. On a shared or public computer, just close the tab when you are done
            and clear your downloads if needed.
          </p>
        ),
        plain:
          'Yes. Because files never leave your browser, sensitive documents are not exposed to any third party. On a shared computer, close the tab when done and clear your downloads.',
      },
      {
        q: 'What happens to my file when I close the tab?',
        a: (
          <p>
            Everything is gone. Files live only in your browser tab&apos;s memory while you work.
            Closing the tab or reloading the page discards them — nothing was ever sent to a
            server, so there is nothing to delete on our side.
          </p>
        ),
        plain:
          'Everything is discarded. Files live only in your browser tab\u2019s memory; closing or reloading the tab removes them, and nothing was ever sent to a server.',
      },
      {
        q: 'What about password-protected PDFs?',
        a: (
          <p>
            Some tools cannot read a password-protected PDF directly. If a tool rejects your file,
            first remove the password with {tool('/unlock-pdf', 'Unlock PDF')} (also client-side),
            then run the tool you wanted. You&apos;ll need the file&apos;s password.
          </p>
        ),
        plain:
          'Some tools cannot read a password-protected PDF directly. Remove the password first with Unlock PDF (also client-side), then run the tool you wanted.',
      },
    ],
  },
  {
    id: 'files',
    title: 'Files, formats & limits',
    intro: 'What you can process and how large it can be.',
    items: [
      {
        q: 'Is there a file size limit?',
        a: (
          <>
            <p className='mb-2'>
              A few tools enforce their own limits, which are stated in the tool itself:
            </p>
            <ul className='list-disc pl-5 mb-2 space-y-1'>
              <li>{tool('/merge-pdf', 'Merge PDF')}: up to 100 MB per file.</li>
              <li>{tool('/word-to-pdf', 'Word to PDF')}: up to 50 MB per file.</li>
            </ul>
            <p>
              Tools without an enforced limit are constrained only by your device&apos;s memory.
              Very large files on a low-memory phone or tablet may freeze or crash the tab — on a
              desktop with plenty of RAM, much larger files work fine.
            </p>
          </>
        ),
        plain:
          'Merge PDF allows up to 100 MB per file and Word to PDF up to 50 MB. Other tools have no enforced limit and are constrained only by your device\u2019s memory.',
      },
      {
        q: 'Which file formats are supported?',
        a: (
          <>
            <p className='mb-2'>
              PDF is the core format for every tool. Depending on the tool, other formats are
              supported:
            </p>
            <ul className='list-disc pl-5 space-y-1'>
              <li>
                Images: JPG, PNG, and WebP can be converted to PDF with{' '}
                {tool('/jpg-to-pdf', 'Image to PDF')} and can be produced from PDFs with{' '}
                {tool('/pdf-to-jpg', 'PDF to JPG')}.
              </li>
              <li>
                Word: {tool('/pdf-to-word', 'PDF to Word')} produces .docx files, and{' '}
                {tool('/word-to-pdf', 'Word to PDF')} accepts .docx input. Legacy .doc files are
                not supported — save or re-export them as .docx first.
              </li>
              <li>{tool('/pdf-to-text', 'PDF to Text')} extracts plain text from PDFs.</li>
              <li>
                {tool('/sign-pdf', 'Sign PDF')} and {tool('/studio', 'PDF Studio')} work with PDF
                documents directly.
              </li>
            </ul>
          </>
        ),
        plain:
          'PDF is the core format. Images (JPG, PNG, WebP) can be converted to and from PDF; Word conversion uses .docx only (legacy .doc is not supported); plain text can be extracted from PDFs.',
      },
      {
        q: 'Does PDFEdit work on mobile?',
        a: (
          <p>
            Yes. The tools work in modern mobile browsers on phones and tablets, as well as on
            desktop. Large or complex files process more smoothly on a desktop, so for very big
            documents we recommend using a computer.
          </p>
        ),
        plain:
          'Yes. The tools work in modern mobile browsers, but large or complex files process more smoothly on a desktop.',
      },
    ],
  },
  {
    id: 'browsers',
    title: 'Browsers & compatibility',
    intro: 'What you need to run the tools.',
    items: [
      {
        q: 'Which browsers are supported?',
        a: (
          <p>
            Any modern, up-to-date browser with JavaScript enabled — on desktop or mobile. The
            tools rely on current web APIs for file reading, in-browser PDF processing, and
            downloads, so keeping your browser updated gives the best results.
          </p>
        ),
        plain:
          'Any modern, up-to-date browser with JavaScript enabled, on desktop or mobile. Keeping your browser updated gives the best results.',
      },
      {
        q: 'Do I need to install anything or create an account?',
        a: (
          <p>
            No. Everything runs in the browser — nothing to install, and no account or sign-up is
            required to use any tool. Open {tool('/#tools', 'the tools page')} and start working.
          </p>
        ),
        plain:
          'No. Nothing to install and no account or sign-up is required. Everything runs in the browser.',
      },
      {
        q: 'Is PDFEdit free? Are there watermarks?',
        a: (
          <p>
            Yes, the tools are free to use, with no watermark on core tools and no sign-up. See
            our {tool('/terms', 'Terms of Service')} for the rules of use.
          </p>
        ),
        plain:
          'Yes, the tools are free to use, with no watermark on core tools and no sign-up required.',
      },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    intro: 'Fixing the most common problems.',
    items: [
      {
        q: 'My conversion failed. What should I do?',
        a: (
          <>
            <p className='mb-2'>Work through this checklist:</p>
            <ol className='list-decimal pl-5 space-y-1'>
              <li>
                Confirm the file is the format the tool expects (e.g. .docx, not .doc, for{' '}
                {tool('/word-to-pdf', 'Word to PDF')}).
              </li>
              <li>
                Check the file is not empty (0 bytes) or corrupted — try opening it in another
                app.
              </li>
              <li>
                If the PDF is password-protected, unlock it first with{' '}
                {tool('/unlock-pdf', 'Unlock PDF')}.
              </li>
              <li>Try a smaller file, in case you hit a size limit or memory ceiling.</li>
              <li>
                Update your browser to the latest version and try again in a private/incognito
                window (this rules out extensions interfering).
              </li>
            </ol>
          </>
        ),
        plain:
          'Check the format is what the tool expects, confirm the file is not empty or corrupted, unlock password-protected PDFs first, try a smaller file, and retry in an up-to-date browser with extensions disabled.',
      },
      {
        q: 'The page froze or crashed while processing a large file.',
        a: (
          <p>
            The tool ran out of your device&apos;s available memory. Close other tabs and apps,
            then try a smaller file — or move to a desktop computer, which typically has far more
            RAM than a phone. If one specific tool always fails, tell us about it via the{' '}
            {tool('/contact', 'contact page')} with the tool name, browser, and file size.
          </p>
        ),
        plain:
          'The tool ran out of device memory. Close other tabs and apps, try a smaller file, or move to a desktop computer with more RAM.',
      },
      {
        q: 'My compressed PDF barely got smaller.',
        a: (
          <p>
            Compression works by removing redundancy. If the PDF was already optimized, or its
            bulk is high-resolution scanned images, {tool('/compress-pdf', 'Compress PDF')} may
            only shave off a little. Try a different compression profile in the tool, or reduce
            image-heavy pages before compressing.
          </p>
        ),
        plain:
          'Already-optimized PDFs or high-resolution scanned images have little redundancy to remove. Try a different compression profile in the tool.',
      },
      {
        q: 'Text extraction produced garbled output.',
        a: (
          <p>
            This usually means the PDF stores text as scanned images rather than real text —
            there are no characters to extract. For scanned documents, use{' '}
            {tool('/ocr-pdf', 'OCR PDF')} to recognize the text from the images first.
          </p>
        ),
        plain:
          'The PDF likely stores text as scanned images with no extractable characters. Use OCR PDF to recognize the text first.',
      },
      {
        q: 'My question is not answered here.',
        a: (
          <p>
            Reach out through the {tool('/contact', 'contact page')} — include the tool you were
            using, your browser and device, and the exact error or behavior you saw. The more
            detail you give, the faster we can help.
          </p>
        ),
        plain:
          'Use the contact page and include the tool name, your browser and device, and the exact error or behavior you saw.',
      },
    ],
  },
];

export default function FaqPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CATEGORIES.flatMap((cat) =>
      cat.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.plain,
        },
      }))
    ),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.pdfedit.website/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'FAQ',
        item: 'https://www.pdfedit.website/faq',
      },
    ],
  };

  return (
    <main className='max-w-4xl mx-auto px-4 py-12'>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <nav aria-label='Breadcrumb' className='mb-3'>
        <ol className='flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400'>
          <li>
            <Link href='/' className='hover:text-slate-900 dark:hover:text-white transition-colors'>
              Home
            </Link>
          </li>
          <li aria-hidden='true' className='text-slate-300 dark:text-slate-600'>/</li>
          <li aria-current='page' className='text-slate-900 dark:text-white font-semibold'>
            FAQ
          </li>
        </ol>
      </nav>

      <h1 className='text-3xl font-bold mb-2 text-slate-900 dark:text-white'>FAQ &amp; Help Center</h1>
      <p className='text-slate-600 dark:text-slate-400 mb-8'>
        Answers about how PDFEdit works, your privacy, file limits, and fixing common problems.
      </p>

      <FaqFilter categories={CATEGORIES} />

      <section className='rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 text-sm text-slate-600 dark:text-slate-400'>
        <h2 className='font-semibold text-slate-800 dark:text-slate-200 mb-2'>Still need help?</h2>
        <p>
          Visit the{' '}
          <Link href='/contact' className='text-red-600 dark:text-red-400 underline'>
            contact page
          </Link>{' '}
          for support, feedback, business inquiries, and abuse reports — it lists exactly what to
          include so we can help you faster. Also see our{' '}
          <Link href='/privacy' className='text-red-600 dark:text-red-400 underline'>
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link href='/terms' className='text-red-600 dark:text-red-400 underline'>
            Terms of Service
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
