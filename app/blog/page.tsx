import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllPostsMeta, type BlogFaq } from '@/lib/blog';
import { ArrowRight, Clock } from 'lucide-react';
import { PageFaq } from '@/components/page-faq';

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
    a: 'The PDFEdit Team — the same people who build the tools. Every workflow in our guides is tested by us before publishing, so the steps describe what actually works.',
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

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogIndexPage() {
  const posts = getAllPostsMeta();
  const [featured, ...rest] = posts;

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

      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="group mb-10 grid overflow-hidden rounded-2xl border border-[var(--pe-border)] bg-[var(--pe-surface)] shadow-sm transition hover:shadow-md md:grid-cols-2"
        >
          <div className="relative aspect-[16/9] w-full md:aspect-auto md:min-h-[280px]">
            <Image
              src={featured.image}
              alt={featured.imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--pe-accent)]">
              Featured guide
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--pe-text)] group-hover:text-[var(--pe-accent)]">
              {featured.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--pe-text-2)]">
              {featured.description}
            </p>
            <p className="mt-4 flex items-center gap-4 text-xs text-[var(--pe-text-3)]">
              <span>{formatDate(featured.date)}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {featured.readingMinutes} min read
              </span>
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--pe-accent)]">
              Read the guide
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </div>
        </Link>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--pe-border)] bg-[var(--pe-surface)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <Image
                src={post.image}
                alt={post.imageAlt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h2 className="text-lg font-bold leading-snug tracking-tight text-[var(--pe-text)] group-hover:text-[var(--pe-accent)]">
                {post.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--pe-text-2)]">
                {post.description}
              </p>
              <p className="mt-4 flex items-center gap-4 text-xs text-[var(--pe-text-3)]">
                <span>{formatDate(post.date)}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {post.readingMinutes} min read
                </span>
              </p>
            </div>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <p className="py-20 text-center text-sm text-[var(--pe-text-2)]">
          New guides are on the way — check back soon.
        </p>
      )}

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
