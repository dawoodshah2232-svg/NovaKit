import type { Metadata } from 'next';
import {
  Hero,
  PopularTools,
  Categories,
  StudioPromo,
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
    'Free online PDF editor and document tools. Edit, merge, split, compress, sign, rotate, watermark, convert and organize PDF files directly in your browser.',
  alternates: {
    canonical: 'https://www.pdfedit.website/',
  },
  openGraph: {
    title: 'PDFEdit – Free Online PDF Editor & Tools',
    description:
      'Edit, convert, organize and sign PDFs with fast browser-based tools.',
    url: 'https://www.pdfedit.website/',
    siteName: 'PDFEdit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDFEdit – Free Online PDF Editor & Tools',
    description:
      'Edit, convert, organize and sign PDFs with fast browser-based tools.',
  },
};

const BASE_URL = 'https://www.pdfedit.website';

function jsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        url: `${BASE_URL}/`,
        name: 'PDFEdit',
        description:
          'Free online PDF editor and document tools. Edit, merge, split, compress, sign, rotate, watermark, convert and organize PDF files directly in your browser.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${BASE_URL}/#tools`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
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
        <PopularTools />
        <Categories />
        <StudioPromo />
        <div id="security" className="scroll-mt-24">
          <Trust />
        </div>
        <WhyPdfEdit />
        <HomeIndex />
      </div>
    </div>
  );
}
