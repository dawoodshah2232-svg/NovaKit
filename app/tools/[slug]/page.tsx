import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, UploadCloud, Sparkles } from 'lucide-react';
import { getToolBySlug, TOOLS_CONFIG } from '@/lib/tools-config';
import { ImageCompressor } from '@/components/tools/image-compressor';
import { PdfMerger } from '@/components/tools/pdf-merger';
import { InvoiceGenerator } from '@/components/tools/invoice-generator';
import { TaxCalculator } from '@/components/tools/tax-calculator';
import { QrGenerator } from '@/components/tools/qr-generator';
import { ColorExtractor } from '@/components/tools/color-extractor';
import { TextAnalyzer } from '@/components/tools/text-analyzer';
import { PasswordGenerator } from '@/components/tools/password-generator';
import { SplitPdf } from '@/components/tools/split-pdf';
import { CompressPdf } from '@/components/tools/compress-pdf';
import { PdfToImage } from '@/components/tools/pdf-to-image';
import { ProtectPdf } from '@/components/tools/protect-pdf';

interface ToolPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return TOOLS_CONFIG.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: 'Tool Not Found',
      description: 'The requested tool does not exist on NovaKit.',
    };
  }

  const title = `${tool.name} – Free, 100% Private Online Tool`;
  const description = `${tool.description} Zero server uploads, completely free, and secure in your browser.`;

  return {
    title,
    description,
    keywords: [
      tool.name,
      ...tool.tags,
      tool.category,
      'free online tool',
      'browser tool',
      'zero server upload',
      'privacy-focused utility',
      'NovaKit',
    ],
    openGraph: {
      title: `${tool.name} | NovaKit Private Web Tools`,
      description,
      url: `https://novakit.app/tools/${tool.slug}`,
      siteName: 'NovaKit',
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
      title: `${tool.name} | NovaKit`,
      description,
    },
    alternates: {
      canonical: `https://novakit.app/tools/${tool.slug}`,
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    url: `https://novakit.app/tools/${tool.slug}`,
    description: tool.description,
    applicationCategory:
      tool.category === 'Finance'
        ? 'FinanceApplication'
        : tool.category === 'PDF'
        ? 'BusinessApplication'
        : 'UtilitiesApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      '100% Client-Side Processing',
      'Zero Server Uploads',
      tool.processingNote,
      ...tool.tags,
    ],
    creator: {
      '@type': 'Organization',
      name: 'NovaKit',
      url: 'https://novakit.app',
    },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-3 sm:py-6">
      {/* Structured Data for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Back button & tool header */}
      <div>
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
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {tool.category}
              </span>
              {tool.badge && (
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                  {tool.badge}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 dark:text-white">
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

      {/* Render Tool Engine */}
      {slug === 'image-compressor' ? (
        <ImageCompressor />
      ) : slug === 'pdf-merger' ? (
        <PdfMerger />
      ) : slug === 'split-pdf' ? (
        <SplitPdf />
      ) : slug === 'compress-pdf' ? (
        <CompressPdf />
      ) : slug === 'pdf-to-image' ? (
        <PdfToImage />
      ) : slug === 'protect-pdf' ? (
        <ProtectPdf />
      ) : slug === 'invoice-generator' ? (
        <InvoiceGenerator />
      ) : slug === 'tax-calculator' ? (
        <TaxCalculator />
      ) : slug === 'qr-generator' ? (
        <QrGenerator />
      ) : slug === 'color-extractor' ? (
        <ColorExtractor />
      ) : slug === 'text-analyzer' ? (
        <TextAnalyzer />
      ) : slug === 'password-generator' ? (
        <PasswordGenerator />
      ) : (
        /* Placeholder for upcoming tools */
        <div className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-white/70 dark:bg-slate-900/60 p-8 sm:p-14 text-center transition-all duration-200">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {tool.name} Workspace
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                100% in-browser processing module ready for Phase 3 implementation.
              </p>
            </div>
            <button
              type="button"
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              Select Local Files
            </button>
          </div>
        </div>
      )}

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
