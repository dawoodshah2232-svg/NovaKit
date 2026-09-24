'use client';

import { useMemo, useState } from 'react';
import { HelpCircle, Search } from 'lucide-react';

interface FaqFilterItem {
  q: string;
  a: React.ReactNode;
  plain: string;
}

interface FaqFilterCategory {
  id: string;
  title: string;
  intro: string;
  items: FaqFilterItem[];
}

export function FaqFilter({ categories }: { categories: FaqFilterCategory[] }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.q.toLowerCase().includes(q) || item.plain.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, q]);

  const totalMatches = filtered.reduce((n, cat) => n + cat.items.length, 0);

  return (
    <>
      <div className="relative mb-8">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the help center — e.g. upload, size limit, mobile…"
          aria-label="Search frequently asked questions"
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-red-950"
        />
      </div>

      {q && (
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400" role="status">
          {totalMatches === 0
            ? `No answers match “${query.trim()}”. Try different words, or visit the contact page.`
            : `${totalMatches} answer${totalMatches === 1 ? '' : 's'} matching “${query.trim()}”.`}
        </p>
      )}

      {filtered.map((cat) => (
        <section key={cat.id} id={cat.id} className="mb-10 scroll-mt-20">
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{cat.title}</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{cat.intro}</p>
          <div className="space-y-3">
            {cat.items.map((item) => (
              <details
                key={item.q}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <summary className="cursor-pointer list-none px-5 py-4 font-medium text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition flex items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-red-600 dark:text-red-400 text-lg leading-none"
                  >
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-sm text-slate-700 dark:text-slate-300">{item.a}</div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
