import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Download, FileText, LayoutTemplate, Palette, ShieldCheck, Sparkles } from 'lucide-react';
import { CV_TEMPLATES, CV_TEMPLATE_CATEGORIES } from '@/lib/cv/templates';
import { CvEditorLazy } from '@/components/cv/CvEditorLazy';

const url = 'https://www.pdfedit.website/cv-builder';

export const metadata: Metadata = {
  title: { absolute: 'Professional CV Builder | Create Resume Online — PDFEdit' },
  description:
    'Create a professional CV in minutes with PDFEdit Resume Studio. 8 original templates, live editor, ATS-friendly layouts, and high-quality PDF export — free, private, no account needed.',
  alternates: { canonical: url },
  openGraph: {
    title: 'Professional CV Builder | Create Resume Online — PDFEdit',
    description:
      'Design a job-winning CV with live preview, 8 professional templates, and one-click PDF export. Free and private — files never leave your browser.',
    url,
    type: 'website',
  },
};

const FAQS = [
  {
    q: 'Is the CV builder really free?',
    a: 'Yes. You can create, edit, and download your CV as a high-quality PDF without paying and without creating an account. Your draft is autosaved in your own browser.',
  },
  {
    q: 'Will my CV pass applicant tracking systems (ATS)?',
    a: 'Choose the ATS Plain or Corporate Classic templates: they use standard fonts, a single column, real selectable text, and no graphics — exactly what ATS parsers read best.',
  },
  {
    q: 'Is my personal data uploaded anywhere?',
    a: 'No. Everything runs locally in your browser. Your CV content, photo, and drafts never leave your device — there is no server upload.',
  },
  {
    q: 'Can I use my own photo?',
    a: 'Yes. Upload a profile photo, and it is automatically resized for a crisp, lightweight PDF. You can toggle it on or off per template.',
  },
  {
    q: 'How many pages can my CV be?',
    a: 'As many as you need. Pages break automatically with orphan control, so section headings never strand alone at the bottom of a page.',
  },
  {
    q: 'Can I edit the exported PDF afterwards?',
    a: 'Yes — open it in PDFEdit Studio to edit text in place, add a signature, or combine it with other documents.',
  },
];

const BENEFITS = [
  { icon: LayoutTemplate, title: '8 original templates', text: 'Corporate, minimal, creative, executive, student, technical, marketing, and ATS-friendly — designed in-house, never copied.' },
  { icon: Palette, title: 'Full design control', text: 'Fonts, colors, spacing, margins, and section styles — with guardrails that keep every CV professional.' },
  { icon: Sparkles, title: 'Honest writing helpers', text: 'Summary phrasing ideas and skill suggestions based on your role. Clearly labeled as suggestions — never fake AI claims.' },
  { icon: Download, title: 'Real PDF export', text: 'Selectable text, correct A4 pages, embedded fonts, and a crisp photo — not a screenshot.' },
  { icon: ShieldCheck, title: 'Private by design', text: 'No account, no upload, no tracking of your CV content. Drafts live only in your browser.' },
  { icon: FileText, title: 'Works with PDFEdit', text: 'Send the finished CV straight into Studio to sign it, merge pages, or convert it to Word.' },
];

export default function CvBuilderPage() {
  return (
    <div className="pe-preview">
      {/* hero */}
      <section className="relative overflow-hidden border-b border-[var(--pe-border)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(640px 320px at 20% 0%, rgba(185,28,28,0.10), transparent 70%)' }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--pe-border)] bg-[var(--pe-elevated)] px-3 py-1 text-xs font-semibold text-[var(--pe-accent)]">
            <FileText size={13} /> Resume Studio — new
          </div>
          <h1 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight text-[var(--pe-text)] sm:text-5xl">
            Create a professional CV in minutes
          </h1>
          <p className="mt-4 max-w-2xl text-base text-[var(--pe-text-2)] sm:text-lg">
            Pick a template, fill in your story, and download a polished, ATS-friendly PDF.
            Free, private, and no account needed — everything happens in your browser.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#studio"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--pe-accent)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              Create Your CV <ArrowRight size={16} />
            </a>
            <a
              href="#templates"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--pe-border-strong)] px-6 py-3 text-sm font-semibold text-[var(--pe-text)] transition hover:border-[var(--pe-accent)] hover:text-[var(--pe-accent)]"
            >
              Browse templates
            </a>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--pe-text-2)]">
            {['No sign-up', 'ATS-friendly options', 'Real PDF export', '100% private'].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Check size={15} className="text-emerald-600" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* studio */}
      <section id="studio" className="scroll-mt-20 border-b border-[var(--pe-border)] bg-[var(--pe-bg)]">
        <CvEditorLazy />
      </section>

      {/* templates */}
      <section id="templates" className="scroll-mt-20 border-b border-[var(--pe-border)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--pe-text)] sm:text-3xl">Eight original templates — your content carries over when you switch</h2>
          <p className="mt-2 max-w-2xl text-[var(--pe-text-2)]">
            Eight original templates designed for PDFEdit. Switch anytime — your content carries over.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CV_TEMPLATES.map((t) => {
              const cat = CV_TEMPLATE_CATEGORIES.find((c) => c.id === t.category)?.label;
              return (
                <a
                  key={t.id}
                  href="#studio"
                  className="group rounded-2xl border border-[var(--pe-border)] bg-[var(--pe-elevated)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--pe-accent)] hover:shadow-[var(--pe-shadow-lg)]"
                >
                  <div
                    className="mb-3 flex h-28 items-center justify-center rounded-xl"
                    style={{ background: t.layout === 'sidebar' ? `linear-gradient(90deg, ${t.sidebarBg} 34%, #fff 34%)` : t.header === 'band' ? `linear-gradient(180deg, ${t.headerBg} 42%, #fff 42%)` : '#fff', border: '1px solid var(--pe-border)' }}
                    aria-hidden="true"
                  >
                    <span className="px-3 text-center text-[11px] font-bold" style={{ color: t.headingColor, fontFamily: 'Arial, sans-serif' }}>
                      {t.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-[var(--pe-text)]">{t.name}</div>
                    {t.atsSafe ? (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">ATS</span>
                    ) : null}
                  </div>
                  <div className="text-xs text-[var(--pe-text-3)]">{cat}</div>
                  <div className="mt-1.5 text-xs leading-relaxed text-[var(--pe-text-2)]">{t.description}</div>
                  <div className="mt-2 text-xs font-semibold text-[var(--pe-accent)] opacity-0 transition group-hover:opacity-100">
                    Use this template →
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* benefits */}
      <section className="border-b border-[var(--pe-border)] bg-[var(--pe-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--pe-text)] sm:text-3xl">Build your CV without uploading it anywhere</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.title} className="rounded-2xl border border-[var(--pe-border)] bg-[var(--pe-elevated)] p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--pe-accent-soft)] text-[var(--pe-accent)]">
                  <b.icon size={19} />
                </div>
                <div className="font-semibold text-[var(--pe-text)]">{b.title}</div>
                <p className="mt-1 text-sm leading-relaxed text-[var(--pe-text-2)]">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="border-b border-[var(--pe-border)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--pe-text)] sm:text-3xl">From blank page to hired in four steps</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['1', 'Choose a template', 'Start from an ATS-friendly classic or a bold creative layout.'],
              ['2', 'Add your story', 'Fill in experience, education, and skills — or start from realistic sample content.'],
              ['3', 'Refine the design', 'Tweak fonts, colors, spacing, and margins with live preview.'],
              ['4', 'Download the PDF', 'One click exports a crisp, selectable-text A4 PDF, ready to send.'],
            ].map(([n, title, text]) => (
              <li key={n} className="rounded-2xl border border-[var(--pe-border)] bg-[var(--pe-elevated)] p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--pe-accent)] text-sm font-bold text-white">{n}</div>
                <div className="font-semibold text-[var(--pe-text)]">{title}</div>
                <p className="mt-1 text-sm text-[var(--pe-text-2)]">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-[var(--pe-border)] bg-[var(--pe-surface)]">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--pe-text)] sm:text-3xl">Frequently asked questions</h2>
          <div className="mt-6 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-[var(--pe-border)] bg-[var(--pe-elevated)] p-4">
                <summary className="cursor-pointer list-none font-medium text-[var(--pe-text)]">
                  <span className="flex items-center justify-between gap-3">
                    {f.q}
                    <ArrowRight size={16} className="shrink-0 rotate-90 text-[var(--pe-text-3)] transition group-open:-rotate-90" />
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-[var(--pe-text-2)]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* related tools */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--pe-text)] sm:text-3xl">Finish your application with PDFEdit</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['/studio', 'PDF Editor', 'Edit your CV text in place after export.'],
              ['/sign-pdf', 'Sign PDF', 'Add a legally-styled signature to offer letters.'],
              ['/word-to-pdf', 'Word to PDF', 'Convert a cover letter to PDF.'],
              ['/pdf-to-word', 'PDF to Word', 'Turn an old CV PDF into editable text.'],
            ].map(([href, title, text]) => (
              <Link key={href} href={href} className="rounded-2xl border border-[var(--pe-border)] bg-[var(--pe-elevated)] p-4 transition hover:border-[var(--pe-accent)]">
                <div className="font-semibold text-[var(--pe-text)]">{title}</div>
                <p className="mt-1 text-sm text-[var(--pe-text-2)]">{text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'PDFEdit Resume Studio — Professional CV Builder',
            url,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            description:
              'Create a professional CV online with 8 original templates, a live editor, and high-quality PDF export. Free and private.',
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />
    </div>
  );
}
