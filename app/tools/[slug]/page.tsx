import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Sparkles, CheckCircle2, Lock, Cpu, Zap } from 'lucide-react';
import { getToolBySlug, getAllToolSlugs } from '@/lib/tools-config';
import { getAllPostsMeta } from '@/lib/blog';
import {
  getToolGeoData,
  generateFaqSchema,
  generateSoftwareAppSchema,
  generateHowToSchema,
} from '@/lib/geo-data';
import { GeoFaq } from '@/components/geo-faq';
import { ToolEngine } from './tool-engine';

// Tool engines are code-split: ./tool-engine.tsx is a client boundary that loads
// ONLY the engine for the current slug via next/dynamic (SSR preserved).


const canonicalPathBySlug: Record<string, string> = {
  'image-to-pdf': '/jpg-to-pdf',
  'pdf-to-images': '/pdf-to-images',
  'organize-pdf': '/organize-pdf',
  'unlock-pdf': '/unlock-pdf',
  'protect-pdf': '/protect-pdf',
  'rotate-pdf': '/rotate-pdf',
  'watermark-pdf': '/watermark-pdf',
  'split-pdf': '/split-pdf',
  'pdf-merger': '/merge-pdf',
  'compress-pdf': '/compress-pdf',
  'pdf-to-jpg': '/pdf-to-jpg',
  'pdf-to-word': '/pdf-to-word',
  'word-to-pdf': '/word-to-pdf',
  'ocr-pdf': '/ocr-pdf',
  'sign-pdf': '/sign-pdf',
  'delete-pdf-pages': '/delete-pdf-pages',
  'extract-pdf-pages': '/extract-pdf-pages',
  'add-page-numbers': '/add-page-numbers',
  'crop-pdf': '/crop-pdf',
  'pdf-to-text': '/pdf-to-text',
  'flatten-pdf': '/flatten-pdf',
  'redact-pdf': '/redact-pdf',
  'edit-pdf-metadata': '/edit-pdf',
};

const relatedToolsBySlug: Record<string, [string, string][]> = {
  'pdf-to-images': [['/jpg-to-pdf', 'JPG to PDF'], ['/split-pdf', 'Split PDF'], ['/compress-pdf', 'Compress PDF']],
  'image-to-pdf': [['/pdf-to-images', 'PDF to Images'], ['/merge-pdf', 'Merge PDF'], ['/organize-pdf', 'Organize PDF']],
  'organize-pdf': [['/merge-pdf', 'Merge PDF'], ['/split-pdf', 'Split PDF'], ['/rotate-pdf', 'Rotate PDF']],
  'unlock-pdf': [['/merge-pdf', 'Merge PDF'], ['/watermark-pdf', 'Watermark PDF'], ['/compress-pdf', 'Compress PDF']],
  'rotate-pdf': [['/organize-pdf', 'Organize PDF'], ['/watermark-pdf', 'Watermark PDF'], ['/merge-pdf', 'Merge PDF']],
  'watermark-pdf': [['/organize-pdf', 'Organize PDF'], ['/compress-pdf', 'Compress PDF'], ['/studio', 'PDF Studio']],
  'split-pdf': [['/merge-pdf', 'Merge PDF'], ['/organize-pdf', 'Organize PDF'], ['/compress-pdf', 'Compress PDF']],
  'pdf-merger': [['/split-pdf', 'Split PDF'], ['/compress-pdf', 'Compress PDF'], ['/organize-pdf', 'Organize PDF']],
  'compress-pdf': [['/merge-pdf', 'Merge PDF'], ['/split-pdf', 'Split PDF'], ['/pdf-to-images', 'PDF to Images']],
  'pdf-to-jpg': [['/pdf-to-images', 'PDF to Images'], ['/jpg-to-pdf', 'JPG to PDF'], ['/compress-pdf', 'Compress PDF']],
  'pdf-to-word': [['/pdf-to-jpg', 'PDF to JPG'], ['/merge-pdf', 'Merge PDF'], ['/compress-pdf', 'Compress PDF']],
  'word-to-pdf': [['/jpg-to-pdf', 'JPG to PDF'], ['/pdf-to-word', 'PDF to Word'], ['/compress-pdf', 'Compress PDF']],
  'ocr-pdf': [['/pdf-to-images', 'PDF to Images'], ['/pdf-to-word', 'PDF to Word'], ['/compress-pdf', 'Compress PDF']],
  'sign-pdf': [['/merge-pdf', 'Merge PDF'], ['/watermark-pdf', 'Watermark PDF'], ['/studio', 'PDF Studio']],
  'edit-pdf-metadata': [['/merge-pdf', 'Merge PDF'], ['/compress-pdf', 'Compress PDF'], ['/studio', 'PDF Studio']],
  'delete-pdf-pages': [['/organize-pdf', 'Organize PDF'], ['/extract-pdf-pages', 'Extract PDF Pages'], ['/split-pdf', 'Split PDF']],
  'extract-pdf-pages': [['/delete-pdf-pages', 'Delete PDF Pages'], ['/split-pdf', 'Split PDF'], ['/merge-pdf', 'Merge PDF']],
  'add-page-numbers': [['/watermark-pdf', 'Watermark PDF'], ['/flatten-pdf', 'Flatten PDF'], ['/studio', 'PDF Studio']],
  'crop-pdf': [['/rotate-pdf', 'Rotate PDF'], ['/compress-pdf', 'Compress PDF'], ['/flatten-pdf', 'Flatten PDF']],
  'pdf-to-text': [['/ocr-pdf', 'OCR PDF'], ['/pdf-to-word', 'PDF to Word'], ['/pdf-to-jpg', 'PDF to JPG']],
  'flatten-pdf': [['/sign-pdf', 'Sign PDF'], ['/unlock-pdf', 'Unlock PDF'], ['/redact-pdf', 'Redact PDF']],
  'redact-pdf': [['/flatten-pdf', 'Flatten PDF'], ['/edit-pdf', 'Edit Metadata'], ['/studio', 'PDF Studio']],
};

/*
 * Related blog guides per tool slug (tool -> blog internal linking).
 * Only slugs that exist in content/blog/ are listed here.
 */
const relatedBlogPostsBySlug: Record<string, string[]> = {
  'pdf-merger': ['how-to-merge-pdf-files', 'how-to-split-a-pdf', 'how-to-edit-a-pdf-online'],
  'split-pdf': ['how-to-split-a-pdf', 'how-to-merge-pdf-files', 'how-to-edit-a-pdf-online'],
  'compress-pdf': ['how-to-compress-pdf', 'how-to-edit-a-pdf-online', 'how-to-protect-a-pdf-with-password'],
  'image-to-pdf': ['how-to-convert-jpg-to-pdf', 'pdf-to-jpg-images-guide', 'how-to-edit-a-pdf-online'],
  'pdf-to-images': ['pdf-to-jpg-images-guide', 'how-to-convert-jpg-to-pdf', 'how-to-ocr-a-scanned-pdf'],
  'pdf-to-jpg': ['pdf-to-jpg-images-guide', 'how-to-convert-jpg-to-pdf', 'how-to-compress-pdf'],
  'pdf-to-word': ['pdf-to-word-conversion-guide', 'pdf-vs-word-format', 'how-to-edit-a-pdf-online'],
  'word-to-pdf': ['pdf-to-word-conversion-guide', 'pdf-vs-word-format', 'how-to-convert-jpg-to-pdf'],
  'ocr-pdf': ['how-to-ocr-a-scanned-pdf', 'pdf-to-jpg-images-guide', 'how-to-edit-a-pdf-online'],
  'sign-pdf': ['how-to-sign-a-pdf-electronically', 'how-to-fill-out-pdf-forms-online', 'how-to-protect-a-pdf-with-password'],
  'rotate-pdf': ['how-to-rotate-pdf-pages', 'how-to-edit-a-pdf-online', 'how-to-split-a-pdf'],
  'organize-pdf': ['how-to-split-a-pdf', 'how-to-merge-pdf-files', 'how-to-rotate-pdf-pages'],
  'watermark-pdf': ['how-to-watermark-a-pdf', 'how-to-sign-a-pdf-electronically', 'how-to-protect-a-pdf-with-password'],
  'unlock-pdf': ['how-to-protect-a-pdf-with-password', 'how-to-edit-a-pdf-online', 'how-to-sign-a-pdf-electronically'],
  'protect-pdf': ['how-to-protect-a-pdf-with-password', 'how-to-sign-a-pdf-electronically', 'how-to-redact-a-pdf'],
  'delete-pdf-pages': ['how-to-split-a-pdf', 'how-to-edit-a-pdf-online', 'how-to-merge-pdf-files'],
  'extract-pdf-pages': ['how-to-split-a-pdf', 'how-to-edit-a-pdf-online', 'how-to-merge-pdf-files'],
  'add-page-numbers': ['how-to-add-page-numbers-to-pdf', 'how-to-watermark-a-pdf', 'how-to-edit-a-pdf-online'],
  'crop-pdf': ['how-to-rotate-pdf-pages', 'how-to-edit-a-pdf-online', 'pdf-to-jpg-images-guide'],
  'pdf-to-text': ['how-to-ocr-a-scanned-pdf', 'pdf-to-word-conversion-guide', 'how-to-edit-a-pdf-online'],
  'flatten-pdf': ['how-to-fill-out-pdf-forms-online', 'how-to-protect-a-pdf-with-password', 'how-to-sign-a-pdf-electronically'],
  'redact-pdf': ['how-to-redact-a-pdf', 'how-to-protect-a-pdf-with-password', 'how-to-fill-out-pdf-forms-online'],
  'edit-pdf-metadata': ['how-to-edit-a-pdf-online', 'how-to-redact-a-pdf', 'how-to-protect-a-pdf-with-password'],
  'image-compressor': ['how-to-compress-pdf', 'how-to-convert-jpg-to-pdf', 'pdf-to-jpg-images-guide'],
};

interface ToolPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: 'Tool Not Found',
      description: 'The requested tool does not exist on PDFEdit Studio.',
    };
  }

  const geoData = getToolGeoData(slug);
  const title = geoData.seoTitle || `${tool.name} – Free, 100% Private Online Tool | PDFEdit Studio`;
  const description =
    geoData.metaDescription ||
    `${tool.description} Zero server uploads, completely free, and secure in your browser.`;

  const canonicalPath = canonicalPathBySlug[tool.slug] || `/tools/${tool.slug}`;
  const canonicalUrl = `https://www.pdfedit.website${canonicalPath}`;

  return {
    title: { absolute: title },
    description,
    keywords: [
      tool.name,
      geoData.primaryKeyword,
      ...(geoData.longTailKeywords || []),
      ...tool.tags,
      tool.category,
      'free online tool',
      'browser tool',
      'zero server upload',
      'privacy-focused utility',
      'PDFEdit Studio Suite',
      'client-side WebAssembly',
    ],
    robots: canonicalPath === `/tools/${tool.slug}` ? undefined : { index: false, follow: true },
    openGraph: {
      title: `${tool.name} | PDFEdit Studio Tools`,
      description,
      url: canonicalUrl,
      siteName: 'PDFEdit Studio',
      type: 'website',
      images: [
        {
          url: '/icon.svg',
          width: 512,
          height: 512,
          alt: `${tool.name} icon`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.name} | PDFEdit Studio`,
      description,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const geoData = getToolGeoData(slug);
  const canonicalPath = canonicalPathBySlug[tool.slug] || `/tools/${tool.slug}`;
  const isMergePdf = slug === 'pdf-merger';
  const softwareSchema = generateSoftwareAppSchema(
    tool,
    geoData,
    isMergePdf
      ? {
          canonicalUrl: `https://www.pdfedit.website${canonicalPath}`,
          includeAggregateRating: false,
        }
      : undefined
  );
  const faqSchema = generateFaqSchema(geoData.faqs, tool.name);
  const howToSchema = generateHowToSchema(tool, geoData.howItWorks);
  const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://www.pdfedit.website/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: tool.name,
            item: `https://www.pdfedit.website${canonicalPath}`,
          },
        ],
      };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-3 sm:py-6">
      {/* Generative Engine Optimization (GEO): SoftwareApplication JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      {/* Generative Engine Optimization (GEO): FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Generative Engine Optimization (GEO): HowTo Procedural JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Back button & tool header */}
      <div>
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <li>
              <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-slate-300 dark:text-slate-600">/</li>
            <li aria-current="page" className="text-slate-900 dark:text-white font-semibold">
              {tool.name}
            </li>
          </ol>
        </nav>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all mb-5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tools Directory</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                {tool.category}
              </span>
              {tool.badge && (
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                  {tool.badge}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-950 dark:text-white">
              {tool.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 max-w-xl leading-relaxed">
              {tool.description}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/90 dark:border-emerald-800/70 text-xs font-bold shrink-0 self-start sm:self-center shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Zero Server Uploads</span>
          </div>
        </div>
      </div>

      <section aria-labelledby="tool-answer" className="rounded-3xl border border-blue-200/80 bg-blue-50/60 p-5 dark:border-blue-900/60 dark:bg-blue-950/20">
        <h2 id="tool-answer" className="text-base font-black text-slate-950 dark:text-white">What this tool does</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{tool.description}</p>
        <p className="mt-2 text-xs font-semibold text-blue-700 dark:text-blue-300">{tool.processingNote}</p>
      </section>

            {/* Render Tool Engine (code-split client boundary) */}
      <ToolEngine slug={slug} />

      {isMergePdf && (
        <section aria-labelledby="merge-pdf-guide" className="space-y-6 pt-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Merge PDF Guide
            </span>
            <h2 id="merge-pdf-guide" className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">
              How to merge PDF files
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Add two or more PDF files, arrange them in the order you want, then choose Merge PDFs. PDFEdit combines every page in that displayed order and keeps the work in your browser.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Why use PDFEdit Merge PDF?</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Reorder contracts, reports, forms, and attachments before creating one clean document. The merger copies PDF pages directly instead of rasterizing them, so text and vector content remain usable.
              </p>
            </article>
            <article className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Privacy and browser processing</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                The merge runs locally in browser memory using pdf-lib. This page does not send your selected PDF files to a merge server; files are released when you clear the workspace or close the page.
              </p>
            </article>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Common use cases</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Combine a signed cover letter with a resume, assemble an invoice packet, join project documents for review, or prepare one submission file from separate PDF attachments.
            </p>
          </div>

          <nav aria-label="Related PDF tools" className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Related PDF tools</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                ['/split-pdf', 'Split PDF'],
                ['/compress-pdf', 'Compress PDF'],
                ['/organize-pdf', 'Organize PDF'],
                ['/rotate-pdf', 'Rotate PDF'],
                ['/studio', 'PDF Studio'],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800">
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </section>
      )}

      {relatedToolsBySlug[slug] && !isMergePdf && (
        <nav aria-label="Related PDF tools" className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
          <h2 className="text-base font-black text-slate-900 dark:text-white">Related PDF tools</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {relatedToolsBySlug[slug].map(([href, label]) => (
              <Link key={href} href={href} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800">
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* Related blog guides (tool -> blog internal linking) */}
      {(() => {
        const postSlugs = relatedBlogPostsBySlug[slug] ?? [];
        if (postSlugs.length === 0) return null;
        const postMetaBySlug = new Map(getAllPostsMeta().map((p) => [p.slug, p]));
        const posts = postSlugs
          .map((postSlug) => postMetaBySlug.get(postSlug))
          .filter((p): p is NonNullable<typeof p> => Boolean(p));
        if (posts.length === 0) return null;
        return (
          <nav aria-label="Related guides" className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
            <h2 className="text-base font-black text-slate-900 dark:text-white">Related guides</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Step-by-step tutorials from the PDFEdit blog.
            </p>
            <ul className="mt-3 space-y-2">
              {posts.map((post) => (
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
        );
      })()}

      {/* Tool Architecture & Security Guarantee Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Client-Side Engine</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {tool.processingNote}
          </p>
        </div>
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Data Isolation</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Your files remain in local device memory and are never transmitted across any network.
          </p>
        </div>
      </div>

      {/* Procedural "How It Works" Guide (Targeted for AI Overviews & Answer Engines) */}
      <section aria-labelledby="how-it-works-heading" className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 pb-1">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Step-by-Step Guide
            </span>
            <h2
              id="how-it-works-heading"
              className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight"
            >
              How to Use {tool.name} in 3 Easy Steps
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            100% In-Browser • Zero Wait Queue
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {geoData.howItWorks.map((step) => (
            <div
              key={step.number}
              className="relative p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                  {step.number}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 text-[10px] font-black uppercase">
                  Step
                </span>
              </div>
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

      {/* Local Zero-Server Privacy Badges & Compliance Guarantee */}
      <section
        aria-label="Privacy and Security Standards"
        className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-blue-50/60 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-blue-950/30 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-emerald-200/60 dark:border-emerald-800/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              Zero-Server Privacy & Architecture Standards
            </h3>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 self-start sm:self-auto">
            Zero-server architecture
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">In-Memory Sandbox</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">Zero Cloud Storage</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">Local Hardware Speed</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">No Usage Caps</span>
          </div>
        </div>
      </section>

      {/* Semantic Long-Tail Keyword & Architectural Deep-Dive Section (Targeted for AI Search & Google Crawlers) */}
      {geoData.semanticSubheadings && geoData.semanticSubheadings.length > 0 && (
        <section aria-labelledby="technical-deep-dive-heading" className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 pb-1 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                Technical Architecture & Security Insights
              </span>
              <h2
                id="technical-deep-dive-heading"
                className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight"
              >
                Why Professionals Choose PDFEdit Studio for {tool.name}
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Enterprise Data Isolation Standard
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {geoData.semanticSubheadings.map((item, idx) => (
              <article
                key={idx}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5 hover:border-blue-500/30 dark:hover:border-cyan-500/30 transition-colors"
              >
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                  {item.heading}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.body}
                </p>
              </article>
            ))}
          </div>

          {/* High-Intent Long-Tail Search Index Tag Cloud */}
          {geoData.longTailKeywords && geoData.longTailKeywords.length > 0 && (
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 block mb-2">
                Supported Query Intents & Capabilities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {geoData.longTailKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Generative Engine Optimization (GEO) Accordion FAQ Component */}
      <GeoFaq faqs={geoData.faqs} toolName={tool.name} />

      {/* AdSense Safe-Zone Banner (Layout Containment for 0 CLS) */}
      <div className="w-full rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 text-center shadow-xs">
        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-2">
          Advertisement Safe-Zone
        </div>
        <div className="adsense-leaderboard-safe-zone rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 p-4">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Google AdSense Responsive Unit (Adaptive 300x250 / 728x90)
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Zero-CLS layout reservation container
          </span>
        </div>
      </div>
    </div>
  );
}
