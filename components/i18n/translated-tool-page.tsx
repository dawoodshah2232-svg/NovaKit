import Link from 'next/link';
import { ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ToolEngine } from '@/app/tools/[slug]/tool-engine';
import { getAllPostsMeta } from '@/lib/blog';
import {
  BASE_URL,
  PILOT_TOOL_KEYS,
  getDictionary,
  localizedPath,
  type PilotLocale,
  type PilotToolKey,
} from '@/lib/i18n';

/**
 * Shared server component for translated pilot tool pages (/es/*, /ar/*).
 * Renders the full SEO/editorial layer from the hand-written dictionary and
 * embeds the real interactive tool engine (engine UI stays in English for
 * this pilot — see the report notes).
 */

const RELATED_GUIDES: Record<PilotToolKey, string[]> = {
  'merge-pdf': ['how-to-merge-pdf-files', 'how-to-split-a-pdf', 'how-to-edit-a-pdf-online'],
  'compress-pdf': ['how-to-compress-pdf', 'how-to-edit-a-pdf-online', 'how-to-protect-a-pdf-with-password'],
  'pdf-to-word': ['pdf-to-word-conversion-guide', 'pdf-vs-word-format', 'how-to-edit-a-pdf-online'],
  'word-to-pdf': ['pdf-to-word-conversion-guide', 'pdf-vs-word-format', 'how-to-convert-jpg-to-pdf'],
  'sign-pdf': ['how-to-sign-a-pdf-electronically', 'how-to-fill-out-pdf-forms-online', 'how-to-protect-a-pdf-with-password'],
};

export function TranslatedToolPage({
  locale,
  toolKey,
}: {
  locale: PilotLocale;
  toolKey: PilotToolKey;
}) {
  const dict = getDictionary(locale);
  const tool = dict.tools[toolKey];
  const canonicalUrl = `${BASE_URL}${localizedPath(locale, `/${toolKey}`)}`;

  const relatedTools = PILOT_TOOL_KEYS.filter((k) => k !== toolKey).map((k) => ({
    href: localizedPath(locale, `/${k}`),
    label: dict.tools[k].name,
  }));

  const postMetaBySlug = new Map(getAllPostsMeta().map((p) => [p.slug, p]));
  const relatedGuides = (RELATED_GUIDES[toolKey] ?? [])
    .map((slug) => postMetaBySlug.get(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${tool.name} | PDFEdit`,
    inLanguage: dict.htmlLang,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    url: canonicalUrl,
    description: tool.metaDescription,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: dict.htmlLang,
    mainEntity: tool.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: dict.chrome.home, item: `${BASE_URL}${localizedPath(locale, '/')}` },
      { '@type': 'ListItem', position: 2, name: tool.name, item: canonicalUrl },
    ],
  };

  return (
    <div dir={dict.dir} lang={dict.htmlLang} className="max-w-4xl mx-auto space-y-8 py-3 sm:py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div>
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <li>
              <Link href={localizedPath(locale, '/')} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                {tool.homeLabel}
              </Link>
            </li>
            <li aria-hidden="true" className="text-slate-300 dark:text-slate-600">/</li>
            <li aria-current="page" className="text-slate-900 dark:text-white font-semibold">
              {tool.name}
            </li>
          </ol>
        </nav>
        <Link
          href={localizedPath(locale, '/')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all mb-5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <span>{tool.backLabel}</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                PDF
              </span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                {dict.chrome.popularBadge}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-950 dark:text-white">
              {tool.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 max-w-xl leading-relaxed">
              {tool.answerLead}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/90 dark:border-emerald-800/70 text-xs font-bold shrink-0 self-start sm:self-center shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{tool.zeroUploadsLabel}</span>
          </div>
        </div>
      </div>

      <section aria-labelledby="tool-answer" className="rounded-3xl border border-blue-200/80 bg-blue-50/60 p-5 dark:border-blue-900/60 dark:bg-blue-950/20">
        <h2 id="tool-answer" className="text-base font-black text-slate-950 dark:text-white">{tool.answerHeading}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{tool.answerBody}</p>
        <p className="mt-2 text-xs font-semibold text-blue-700 dark:text-blue-300">{tool.processingNote}</p>
      </section>

      <ToolEngine slug={tool.engineSlug} />

      <section aria-labelledby="how-it-works-heading" className="space-y-4 pt-2">
        <div>
          <h2 id="how-it-works-heading" className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
            {tool.stepsHeading}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tool.steps.map((step, i) => (
            <div
              key={i}
              className="relative p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
            >
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                {i + 1}
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                {step.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        aria-label={tool.privacyHeading}
        className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-blue-50/60 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-blue-950/30 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
            {tool.privacyHeading}
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {tool.privacyBullets.map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold">{b}</span>
            </div>
          ))}
        </div>
      </section>

      <nav aria-label={tool.relatedToolsHeading} className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
        <h2 className="text-base font-black text-slate-900 dark:text-white">{tool.relatedToolsHeading}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {relatedTools.map(({ href, label }) => (
            <Link key={href} href={href} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800">
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {relatedGuides.length > 0 && (
        <nav aria-label={tool.relatedGuidesHeading} className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
          <h2 className="text-base font-black text-slate-900 dark:text-white">{tool.relatedGuidesHeading}</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {tool.relatedGuidesNote}
          </p>
          <ul className="mt-3 space-y-2">
            {relatedGuides.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-300"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <section aria-labelledby="tool-faq-heading" className="space-y-4 pt-2">
        <h2 id="tool-faq-heading" className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
          {tool.faqHeading}
        </h2>
        <div className="space-y-3">
          {tool.faqs.map((faq, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 open:shadow-xs"
            >
              <summary className="cursor-pointer list-none px-5 py-4 text-sm font-extrabold text-slate-900 dark:text-white">
                {faq.question}
              </summary>
              <p className="px-5 pb-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
