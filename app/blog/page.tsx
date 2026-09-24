import type { Metadata } from 'next';
import { getAllPostsMeta, type BlogFaq, type BlogMeta } from '@/lib/blog';
import { PageFaq } from '@/components/page-faq';
import { BlogSearch } from '@/components/blog-search';

const BLOG_FAQS: BlogFaq[] = [
  {
    q: 'Are the PDFEdit guides free to read?',
    a: 'Yes. Every guide on the PDFEdit blog is free, with no account, no sign-up, and no paywall.',
  },
  {
    q: 'Do I need a PDFEdit account to follow these guides?',
    a: 'No. PDFEdit has no accounts at all. Open any guide, then open the linked tool and follow along right in your browser.',
  },
  {
    q: 'Who writes the PDFEdit guides?',
    a: 'The PDFEdit Team — the same people who build the tools. Our guides describe how the tools actually behave and cite official sources where relevant.',
  },
  {
    q: 'How often are the guides updated?',
    a: 'We review guides regularly and update them when our tools change or when PDF software behaves differently. Each guide shows its publication date at the top.',
  },
];

export const metadata: Metadata = {
  title: 'PDF Blog — Guides, Tips & Tutorials',
  description:
    'Practical PDF guides and tutorials from the PDFEdit team: edit, merge, compress, sign, convert, OCR and protect PDF files online — free, private, no sign-up.',
  keywords: [
    'PDF blog',
    'PDF guides',
    'PDF tutorials',
    'how to edit PDF',
    'PDF tips',
    'PDFEdit blog',
  ],
  alternates: { canonical: 'https://www.pdfedit.website/blog' },
  openGraph: {
    title: 'PDF Blog — Guides, Tips & Tutorials | PDFEdit',
    description:
      'Practical PDF guides from the PDFEdit team: edit, merge, compress, sign, convert and protect PDFs online.',
    url: 'https://www.pdfedit.website/blog',
    type: 'website',
  },
};

export default function BlogIndexPage() {
  const posts: BlogMeta[] = getAllPostsMeta();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mx-auto mb-10 max-w-3xl text-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--pe-accent)]">
          PDFEdit Blog
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--pe-text)] sm:text-4xl">
          PDF guides, tips &amp; tutorials
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[var(--pe-text-2)]">
          Step-by-step guides from the team behind PDFEdit — learn how to edit, merge,
          compress, sign, convert and protect PDF files right in your browser. Free forever,
          private by design, no account needed.
        </p>
      </header>

      <BlogSearch posts={posts} />

      <div className="mx-auto mt-4 max-w-3xl">
        <PageFaq
          faqs={BLOG_FAQS}
          pageUrl="https://www.pdfedit.website/blog"
          intro="Quick answers about reading and using the PDFEdit guides."
        />
      </div>
    </main>
  );
}
