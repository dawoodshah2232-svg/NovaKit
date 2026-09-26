import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  getAllPostSlugs,
  getAllPostsMeta,
  getPost,
  blogPostUrl,
  articleJsonLd,
  faqJsonLd,
  howToJsonLd,
} from '@/lib/blog';
import { ArrowLeft, ArrowRight, Clock, ChevronRight, BookOpenCheck } from 'lucide-react';
import BlogShareButtons from '@/components/blog-share-buttons';
import { PageFaq } from '@/components/page-faq';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let post;
  try {
    post = getPost(slug);
  } catch {
    return {};
  }
  const url = blogPostUrl(post.slug);
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    alternates: { canonical: url },
    // Google Discover requires large image previews — without this, posts
    // are ineligible for Discover's large-card layout.
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      title: `${post.title} | PDFEdit`,
      description: post.description,
      url,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: [{ url: post.image, alt: post.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | PDFEdit`,
      description: post.description,
      images: [post.image],
    },
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  let post;
  try {
    post = getPost(slug);
  } catch {
    notFound();
  }

  const all = getAllPostsMeta();
  const related = post.related
    .map((r) => all.find((p) => p.slug === r))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 3);
  const relatedFallback = related.length
    ? related
    : all.filter((p) => p.slug !== post.slug).slice(0, 3);

  const articleLd = articleJsonLd(post);
  const faqLd = faqJsonLd(post);
  const howToLd = howToJsonLd(post);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      {howToLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
        />
      )}

      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-[var(--pe-text-3)]">
        <Link href="/" className="transition hover:text-[var(--pe-accent)]">Home</Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <Link href="/blog" className="transition hover:text-[var(--pe-accent)]">Blog</Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="truncate text-[var(--pe-text-2)]">{post.title}</span>
      </nav>

      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--pe-text)] sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[var(--pe-text-2)]">
          {post.description}
        </p>
        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--pe-text-3)]">
          <span className="font-semibold text-[var(--pe-text-2)]">{post.author}</span>
          <span>{formatDate(post.date)}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {post.readingMinutes} min read
          </span>
        </p>
      </header>

      {/* Answer-first summary for readers and AI/answer engines.
          Every bullet is verbatim from this article: step headings for
          how-to guides, or the questions the guide answers below. */}
      {(post.howToSteps.length >= 2 || post.faqs.length > 0) && (
        <section
          aria-label="Key takeaways"
          className="mt-6 rounded-2xl border border-[var(--pe-border)] bg-[var(--pe-surface)] p-5 sm:p-6"
        >
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--pe-accent)]">
            Key takeaways
          </h2>
          <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-[var(--pe-text-2)]">
            {post.howToSteps.length >= 2
              ? post.howToSteps.slice(0, 4).map((s) => (
                  <li key={s.position} className="flex gap-2.5">
                    <span aria-hidden="true" className="font-bold text-[var(--pe-accent)]">✓</span>
                    <span>{s.name}</span>
                  </li>
                ))
              : post.faqs.slice(0, 4).map((f) => (
                  <li key={f.q} className="flex gap-2.5">
                    <span aria-hidden="true" className="font-bold text-[var(--pe-accent)]">→</span>
                    <span>Answered in this guide: {f.q}</span>
                  </li>
                ))}
          </ul>
        </section>
      )}

      <figure className="mt-8 overflow-hidden rounded-2xl border border-[var(--pe-border)]">
        <Image
          src={post.image}
          alt={post.imageAlt}
          width={1200}
          height={675}
          sizes="(max-width: 768px) 100vw, 768px"
          className="h-auto w-full object-cover"
          priority
        />
      </figure>

      <article
        className="pe-prose mt-8"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      <aside className="mt-10 rounded-2xl border border-[var(--pe-border)] bg-[var(--pe-surface)] p-5 sm:p-6" aria-label="About the author">
        <p className="text-sm leading-relaxed text-[var(--pe-text-2)]">
          <span className="font-bold text-[var(--pe-text)]">Written by the PDFEdit Team.</span>{' '}
          We are the same people who build the tools on this site. Our guides describe how the
          tools actually behave and cite official sources where relevant.
        </p>
      </aside>

      <PageFaq
        faqs={post.faqs}
        pageUrl={blogPostUrl(post.slug)}
        withJsonLd={false}
        intro="Short answers to the questions readers ask us most about this topic."
      />

      {post.sources.length > 0 && (
        <section className="mt-12" aria-label="Sources and further reading">
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            <BookOpenCheck className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
            Sources &amp; further reading
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Official documentation we referenced while writing this guide.
          </p>
          <ul className="mt-4 space-y-2">
            {post.sources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-red-600 underline decoration-red-200 underline-offset-2 transition hover:decoration-red-400 dark:text-red-400 dark:decoration-red-900"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <aside className="mt-10 rounded-2xl border border-[var(--pe-accent)]/30 bg-[var(--pe-accent-soft)] p-6 sm:p-8">
        <h2 className="text-xl font-bold text-[var(--pe-text)]">
          Try it free with PDFEdit
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--pe-text-2)]">
          Every technique in this guide works right in your browser — no uploads, no
          sign-up, no watermarks. Open the free PDF Studio and get it done in minutes.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/studio"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[var(--pe-accent)] px-5 py-2.5 text-sm font-bold text-[var(--pe-accent-ink)] transition hover:bg-[var(--pe-accent-hover)]"
          >
            Open PDF Studio
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/#tools"
            className="inline-flex min-h-[44px] items-center rounded-xl border border-[var(--pe-border-strong)] px-5 py-2.5 text-sm font-bold text-[var(--pe-text)] transition hover:bg-[var(--pe-surface-3)]"
          >
            Browse all tools
          </Link>
        </div>
      </aside>

      <BlogShareButtons title={post.title} path={`/blog/${post.slug}`} />

      {relatedFallback.length > 0 && (
        <section className="mt-12" aria-label="Related guides">
          <h2 className="text-xl font-bold text-[var(--pe-text)]">Keep reading</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {relatedFallback.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="group overflow-hidden rounded-xl border border-[var(--pe-border)] bg-[var(--pe-surface)] transition hover:shadow-md"
              >
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={r.image}
                    alt={r.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
                <p className="p-4 text-sm font-bold leading-snug text-[var(--pe-text)] group-hover:text-[var(--pe-accent)]">
                  {r.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="mt-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--pe-accent)] transition hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to all guides
        </Link>
      </p>
    </main>
  );
}
