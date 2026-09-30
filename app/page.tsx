import type { Metadata } from 'next';
import {
  Hero,
  PopularTools,
  Categories,
  StudioPromo,
  CvPromo,
  Trust,
  WhyPdfEdit,
} from '@/components/ui-preview/sections';
import { HomeIndex, getFaqJsonLd } from '@/components/home-index';
import { PREVIEW_TOOLS } from '@/components/ui-preview/data';

/**
 * Production homepage (/) — the approved red design system.
 * Uses the shared homepage sections (Hero, PopularTools, Categories,
 * StudioPromo, Trust, WhyPdfEdit) plus a server-rendered SEO index.
 * No preview chrome: no badges, ribbons, concept labels or route hacks.
 * The /ui-preview route keeps its own isolated concept page.
 */

export const metadata: Metadata = {
  title: 'PDFEdit – Free Online PDF Editor & PDF Tools',
  description:
    'Free online PDF editor and PDF tools. Merge, split, compress, sign, convert and watermark PDF files directly in your browser — no uploads, no accounts.',
  alternates: {
    canonical: 'https://www.pdfedit.website/',
    languages: {
      'x-default': 'https://www.pdfedit.website/',
      en: 'https://www.pdfedit.website/',
      es: 'https://www.pdfedit.website/es',
      ar: 'https://www.pdfedit.website/ar',
    },
  },
  openGraph: {
    title: 'PDFEdit – Free Online PDF Editor & Tools',
    description:
      'Edit, convert, organize and sign PDFs with fast browser-based tools.',
    url: 'https://www.pdfedit.website/',
    siteName: 'PDFEdit',
    type: 'website',
    images: [{ url: 'https://www.pdfedit.website/og-image.png', width: 1200, height: 630, alt: 'PDFEdit \u2013 Free Online PDF Editor & Tools' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDFEdit – Free Online PDF Editor & Tools',
    description:
      'Edit, convert, organize and sign PDFs with fast browser-based tools.',
  images: ['https://www.pdfedit.website/og-image.png']},
};

const BASE_URL = 'https://www.pdfedit.website';

function jsonLd() {
  // NOTE: WebSite + Organization are emitted site-wide from app/layout.tsx —
  // keep only page-specific nodes here to avoid duplicate @ids.
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: 'PDFEdit tool library',
        itemListElement: PREVIEW_TOOLS.map((tool, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: tool.name,
          description: tool.tagline,
          url: `${BASE_URL}${tool.href}`,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: getFaqJsonLd(),
      },
    ],
  };
}

export default function HomePage() {
  return (
    <div className="pe-preview -mx-4 -my-5 sm:-mx-6 sm:-my-7 lg:-mx-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
      />

      <div>
        <Hero />
        <div id="tools" className="scroll-mt-24">
          <PopularTools />
        </div>
        <div id="categories" className="scroll-mt-24">
          <Categories />
        </div>
        <StudioPromo />
        <div id="security" className="scroll-mt-24">
          <Trust />
        </div>
        <CvPromo />
        <div id="why" className="scroll-mt-24">
          <WhyPdfEdit />
        </div>
        <HomeIndex />
      </div>
    </div>
  );
}
