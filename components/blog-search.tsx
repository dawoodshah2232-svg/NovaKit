'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, Search } from 'lucide-react';
import type { BlogMeta } from '@/lib/blog';

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function ReadTime({ minutes }: { minutes: number }) {
  return (
    <span className="flex items-center gap-1">
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      {minutes} min read
    </span>
  );
}

export function BlogSearch({ posts }: { posts: BlogMeta[] }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [posts, q]);

  const [featured, ...rest] = filtered;

  return (
    <>
      <div className="relative mx-auto mb-10 max-w-xl">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search guides — e.g. compress, sign, OCR…"
          aria-label="Search guides"
          className="w-full rounded-2xl border border-[var(--pe-border)] bg-[var(--pe-surface)] py-3 pl-11 pr-4 text-sm text-[var(--pe-text)] placeholder:text-[var(--pe-text-3)] shadow-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950"
        />
      </div>

      {q && (
        <p className="mb-6 text-center text-sm text-[var(--pe-text-2)]" role="status">
          {filtered.length === 0
            ? `No guides match “${query.trim()}”.`
            : `${filtered.length} guide${filtered.length === 1 ? '' : 's'} matching “${query.trim()}”.`}
        </p>
      )}

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
              <ReadTime minutes={featured.readingMinutes} />
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
                <ReadTime minutes={post.readingMinutes} />
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
    </>
  );
}
