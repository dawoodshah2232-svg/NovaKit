import type { Metadata } from 'next';
import Link from 'next/link';
import { Search as SearchIcon, Wrench, BookOpenText, ArrowRight } from 'lucide-react';
import { TOOLS_CONFIG } from '@/lib/tools-config';
import { canonicalPathBySlug } from '@/lib/tool-paths';
import { getAllPostsMeta } from '@/lib/blog';

export const metadata: Metadata = {
  title: { absolute: 'Search PDFEdit tools & guides | PDFEdit' },
  description:
    'Search all free PDFEdit tools and step-by-step PDF guides — merge, compress, convert, sign, OCR and more, all in your browser.',
  alternates: { canonical: 'https://www.pdfedit.website/search' },
  robots: { index: true, follow: true },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

function toolHref(slug: string): string {
  return canonicalPathBySlug[slug] || `/tools/${slug}`;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();
  const needle = query.toLowerCase();

  const toolResults = needle
    ? TOOLS_CONFIG.filter((t) => {
        const haystack = `${t.name} ${t.description} ${t.category} ${t.tags.join(' ')}`.toLowerCase();
        return needle.split(/\s+/).every((part) => haystack.includes(part));
      }).slice(0, 12)
    : [];

  const allPosts = getAllPostsMeta();
  const guideResults = needle
    ? allPosts
        .filter((p) =>
          `${p.title} ${p.description} ${p.keywords.join(' ')}`.toLowerCase().includes(needle),
        )
        .slice(0, 12)
    : [];

  const searched = needle.length > 0;
  const total = toolResults.length + guideResults.length;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--pe-text)]">
        Search PDFEdit
      </h1>
      <p className="mt-2 text-sm text-[var(--pe-text-2)]">
        Find a free tool or a step-by-step guide. Everything runs in your browser — no uploads, no sign-up.
      </p>

      <form action="/search" method="get" className="relative mx-auto mt-6 max-w-xl" role="search">
        <SearchIcon
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search tools & guides — e.g. merge, compress, sign…"
          aria-label="Search tools and guides"
          className="w-full rounded-2xl border border-[var(--pe-border)] bg-[var(--pe-surface)] py-3 pl-11 pr-4 text-sm text-[var(--pe-text)] placeholder:text-[var(--pe-text-3)] shadow-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950"
        />
      </form>

      {searched && (
        <p className="mt-6 text-sm text-[var(--pe-text-2)]" role="status">
          {total === 0
            ? `No results for “${query}”. Try “merge”, “compress”, “sign” or “convert”.`
            : `${total} result${total === 1 ? '' : 's'} for “${query}”.`}
        </p>
      )}

      {toolResults.length > 0 && (
        <section aria-label="Matching tools" className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--pe-text)]">
            <Wrench className="h-5 w-5 text-[var(--pe-accent)]" aria-hidden="true" />
            Tools
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {toolResults.map((t) => (
              <li key={t.slug}>
                <Link
                  href={toolHref(t.slug)}
                  className="block h-full rounded-2xl border border-[var(--pe-border)] bg-[var(--pe-surface)] p-4 transition hover:border-[var(--pe-accent)] hover:shadow-sm"
                >
                  <p className="flex items-center justify-between gap-2 text-sm font-bold text-[var(--pe-text)]">
                    {t.name}
                    <ArrowRight className="h-4 w-4 shrink-0 text-[var(--pe-accent)]" aria-hidden="true" />
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--pe-text-2)]">{t.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {guideResults.length > 0 && (
        <section aria-label="Matching guides" className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--pe-text)]">
            <BookOpenText className="h-5 w-5 text-[var(--pe-accent)]" aria-hidden="true" />
            Guides
          </h2>
          <ul className="mt-4 space-y-3">
            {guideResults.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="block rounded-2xl border border-[var(--pe-border)] bg-[var(--pe-surface)] p-4 transition hover:border-[var(--pe-accent)] hover:shadow-sm"
                >
                  <p className="text-sm font-bold text-[var(--pe-text)]">{p.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--pe-text-2)]">{p.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {searched && total === 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {['Merge PDF', 'Compress PDF', 'JPG to PDF', 'Sign PDF'].map((s) => (
            <Link
              key={s}
              href={`/search?q=${encodeURIComponent(s)}`}
              className="rounded-full border border-[var(--pe-border)] bg-[var(--pe-surface)] px-4 py-2 text-xs font-bold text-[var(--pe-text-2)] transition hover:border-[var(--pe-accent)] hover:text-[var(--pe-accent)]"
            >
              {s}
            </Link>
          ))}
        </div>
      )}

      {!searched && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-[var(--pe-text)]">Popular right now</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Merge PDF', 'Compress PDF', 'Split PDF', 'JPG to PDF', 'Sign PDF', 'OCR PDF', 'Watermark', 'Protect PDF'].map(
              (s) => (
                <Link
                  key={s}
                  href={`/search?q=${encodeURIComponent(s)}`}
                  className="rounded-full border border-[var(--pe-border)] bg-[var(--pe-surface)] px-4 py-2 text-xs font-bold text-[var(--pe-text-2)] transition hover:border-[var(--pe-accent)] hover:text-[var(--pe-accent)]"
                >
                  {s}
                </Link>
              ),
            )}
          </div>
        </div>
      )}
    </main>
  );
}
