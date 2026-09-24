import Link from 'next/link';
import { CheckCircle2, ArrowRight, ShieldCheck, Lock, Zap, FileText, BookOpen } from 'lucide-react';
import { PageFaq } from '@/components/page-faq';
import type { BlogFaq } from '@/lib/blog';

export interface CompareTableRow {
  feature: string;
  pdfedit: string;
  competitor: string;
}

export interface CompareWin {
  title: string;
  text: string;
}

export interface CompareConfig {
  competitorName: string;
  competitorSite: string;
  slug: string;
  url: string;
  h1: string;
  intro: string[];
  verdictPdfEdit: string;
  verdictCompetitor: string;
  tableRows: CompareTableRow[];
  tableNote?: string;
  competitorWins: CompareWin[];
  pdfeditWins: CompareWin[];
  faqs: BlogFaq[];
  relatedTools: { href: string; name: string; blurb: string }[];
  relatedGuides: { href: string; title: string }[];
}

function jsonLd(config: CompareConfig) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.pdfedit.website/' },
          { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.pdfedit.website/tools' },
          { '@type': 'ListItem', position: 3, name: `PDFEdit vs ${config.competitorName}`, item: config.url },
        ],
      },
      {
        '@type': 'SoftwareApplication',
        name: 'PDFEdit',
        url: config.url,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any (Web browser)',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Free online PDF tools that run entirely in your browser — merge, compress, convert, sign and edit PDFs with no uploads and no accounts.',
      },
    ],
  };
}

export function ComparePage({ config }: { config: CompareConfig }) {
  const c = config;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(c)) }}
      />
      <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-slate-500 dark:text-slate-400">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-red-600 dark:hover:text-red-400">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/tools" className="hover:text-red-600 dark:hover:text-red-400">
                Tools
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-semibold text-slate-700 dark:text-slate-200">
              PDFEdit vs {c.competitorName}
            </li>
          </ol>
        </nav>

        {/* Answer-first H1 */}
        <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          {c.h1}
        </h1>

        {c.intro.map((p, i) => (
          <p
            key={i}
            className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300"
          >
            {p}
          </p>
        ))}

        {/* Verdict box */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/40 dark:bg-red-950/20">
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-red-700 dark:text-red-400">
              <ShieldCheck className="h-4 w-4" /> Choose PDFEdit
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {c.verdictPdfEdit}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="h-4 w-4" /> Choose {c.competitorName}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {c.verdictCompetitor}
            </p>
          </div>
        </div>

        {/* Comparison table */}
        <h2 className="mt-12 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
          PDFEdit vs {c.competitorName}: side-by-side comparison
        </h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/60">
                <th className="px-4 py-3 font-bold text-slate-900 dark:text-white">Feature</th>
                <th className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                  <span className="inline-flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-red-600" /> PDFEdit
                  </span>
                </th>
                <th className="px-4 py-3 font-bold text-slate-900 dark:text-white">{c.competitorName}</th>
              </tr>
            </thead>
            <tbody>
              {c.tableRows.map((row) => (
                <tr
                  key={row.feature}
                  className="border-t border-slate-200 align-top dark:border-slate-800"
                >
                  <th
                    scope="row"
                    className="px-4 py-3 font-semibold text-slate-900 dark:text-white"
                  >
                    {row.feature}
                  </th>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.pdfedit}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.competitor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {c.tableNote && (
          <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {c.tableNote}
          </p>
        )}

        {/* Honest wins */}
        <h2 className="mt-12 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
          Where {c.competitorName} wins (honestly)
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          No honest comparison hides the other side&apos;s strengths. Here is where{' '}
          {c.competitorName} is genuinely the better pick.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {c.competitorWins.map((w) => (
            <div
              key={w.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{w.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {w.text}
              </p>
            </div>
          ))}
        </div>

        <h2 className="mt-12 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
          Where PDFEdit wins
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {c.pdfeditWins.map((w) => (
            <div
              key={w.title}
              className="rounded-2xl border border-red-200/60 bg-red-50/50 p-5 dark:border-red-900/30 dark:bg-red-950/10"
            >
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Zap className="h-4 w-4 text-red-600" /> {w.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {w.text}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-slate-950 p-6 text-center dark:bg-slate-900 sm:p-8">
          <h2 className="text-xl font-black text-white sm:text-2xl">
            Try the tools yourself — free, no account
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
            Everything runs in your browser. Your files never upload, so there is nothing to
            trust us about — open your network tab and see zero requests while you work.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/merge-pdf"
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700"
            >
              Merge PDF <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-full border border-slate-600 px-5 py-2.5 text-sm font-bold text-white hover:border-slate-400"
            >
              Open PDF Studio
            </Link>
          </div>
        </div>

        {/* Related tools */}
        <h2 className="mt-12 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
          Popular PDFEdit tools
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {c.relatedTools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group rounded-2xl border border-slate-200 bg-white p-4 hover:border-red-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-red-800"
            >
              <p className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <FileText className="h-4 w-4 text-red-600" /> {t.name}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {t.blurb}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-red-600 group-hover:underline dark:text-red-400">
                Open tool <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>

        {/* Related guides */}
        <h2 className="mt-12 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
          Related guides
        </h2>
        <ul className="mt-4 space-y-2.5">
          {c.relatedGuides.map((g) => (
            <li key={g.href}>
              <Link
                href={g.href}
                className="group flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-red-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-red-800"
              >
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <span className="text-sm font-semibold text-slate-900 group-hover:underline dark:text-white">
                  {g.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* FAQ */}
        <PageFaq
          faqs={c.faqs}
          pageUrl={c.url}
          heading={`PDFEdit vs ${c.competitorName}: questions & answers`}
          intro="Short, direct answers to the questions people actually ask when choosing between the two."
        />
      </div>
    </>
  );
}
