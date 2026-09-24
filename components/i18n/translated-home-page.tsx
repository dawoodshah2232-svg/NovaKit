import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import {
  BASE_URL,
  PILOT_TOOL_KEYS,
  getDictionary,
  localizedPath,
  type PilotLocale,
} from '@/lib/i18n';

/**
 * Translated pilot homepage (/es, /ar). Self-contained editorial layer built
 * from the hand-written dictionary — the shared English homepage sections
 * are intentionally not reused so every visible string is translated.
 */
export function TranslatedHomePage({ locale }: { locale: PilotLocale }) {
  const dict = getDictionary(locale);
  const home = dict.home;
  const canonicalUrl = `${BASE_URL}${localizedPath(locale, '/')}`;

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${canonicalUrl}#website`,
    url: canonicalUrl,
    inLanguage: dict.htmlLang,
    name: 'PDFEdit',
    description: home.metaDescription,
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: dict.htmlLang,
    mainEntity: home.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: home.toolsHeading,
    inLanguage: dict.htmlLang,
    itemListElement: PILOT_TOOL_KEYS.map((k, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: dict.tools[k].name,
      description: dict.tools[k].metaDescription,
      url: `${BASE_URL}${localizedPath(locale, `/${k}`)}`,
    })),
  };

  return (
    <div dir={dict.dir} lang={dict.htmlLang} className="space-y-12 sm:space-y-16 py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      {/* Hero — answer-first */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200/70 dark:border-rose-900/60 rounded-full px-4 py-1.5">
          {home.heroKicker}
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-950 dark:text-white text-balance">
          {home.heroTitle}
        </h1>
        <p className="text-base sm:text-lg leading-8 text-slate-600 dark:text-slate-300">
          {home.heroLead}
        </p>
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="w-4 h-4" />
          <span>{home.trustBullets[0]}</span>
        </div>
      </section>

      {/* Tools grid */}
      <section aria-labelledby="pilot-tools-heading" className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h2 id="pilot-tools-heading" className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            {home.toolsHeading}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{home.toolsSub}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PILOT_TOOL_KEYS.map((k) => {
            const t = dict.tools[k];
            return (
              <Link
                key={k}
                href={localizedPath(locale, `/${k}`)}
                className="group rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs transition hover:border-blue-300 hover:shadow-md dark:hover:border-blue-800"
              >
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  {t.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {t.answerLead}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                  {dict.chrome.useTool}
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                </span>
              </Link>
            );
          })}
          <Link
            href="/tools"
            className="group rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/40 p-6 transition hover:border-blue-300 dark:hover:border-blue-800 flex flex-col justify-center"
          >
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {home.viewAllTools}
            </h3>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
              PDFEdit
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* Why */}
      <section aria-labelledby="why-heading" className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h2 id="why-heading" className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            {home.whyHeading}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {home.whyLead}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {home.whyPoints.map((p, i) => (
            <article key={i} className="rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{p.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section aria-label={home.trustHeading} className="max-w-5xl mx-auto rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-blue-50/60 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-blue-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{home.trustHeading}</h2>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
          {home.trustBullets.map((b, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section aria-labelledby="home-faq-heading" className="max-w-3xl mx-auto">
        <h2 id="home-faq-heading" className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white text-center mb-6">
          {home.faqHeading}
        </h2>
        <div className="space-y-3">
          {home.faqs.map((faq, i) => (
            <details key={i} className="group rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 open:shadow-xs">
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

      {/* CTA */}
      <section className="max-w-3xl mx-auto text-center rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-8 sm:p-10 shadow-xs">
        <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
          {home.ctaHeading}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {home.ctaBody}
        </p>
        <Link
          href={localizedPath(locale, '/merge-pdf')}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-rose-700 active:scale-95"
        >
          {home.ctaButton}
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </Link>
      </section>
    </div>
  );
}
