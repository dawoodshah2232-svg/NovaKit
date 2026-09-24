/**
 * Shared JSON-LD helper for static informational pages.
 * Renders a single <script type="application/ld+json"> block so every
 * public page carries machine-readable schema (SEO + GEO/AI search).
 */

const BASE_URL = 'https://www.pdfedit.website';

export function JsonLd({ schema }: { schema: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
  name: 'PDFEdit',
  url: `${BASE_URL}/`,
  logo: `${BASE_URL}/og-image.png`,
  description:
    'PDFEdit: free, private, browser-based PDF tools. Files are processed locally on your device and never uploaded to our servers.',
};

const organizationRef = {
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
  name: 'PDFEdit',
  url: `${BASE_URL}/`,
  logo: `${BASE_URL}/og-image.png`,
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  url: `${BASE_URL}/`,
  name: 'PDFEdit',
  description:
    'Free online PDF editor and document tools. Edit, merge, split, compress, sign, rotate, watermark, convert and organize PDF files directly in your browser.',
  inLanguage: 'en',
  publisher: organizationRef,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export const aboutSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${BASE_URL}/about`,
  url: `${BASE_URL}/about`,
  name: 'About PDFEdit',
  description:
    'About PDFEdit: free, private, browser-based PDF tools. Files are processed locally on your device and never uploaded to our servers.',
  about: organizationRef,
  publisher: organizationRef,
};

export const contactSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  '@id': `${BASE_URL}/contact`,
  url: `${BASE_URL}/contact`,
  name: 'Contact PDFEdit',
  description:
    'Contact PDFEdit for support, feedback, business inquiries, and abuse reports.',
  about: organizationRef,
  publisher: organizationRef,
};

export const privacySchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${BASE_URL}/privacy`,
  url: `${BASE_URL}/privacy`,
  name: 'Privacy Policy for PDFEdit',
  description:
    'PDFEdit privacy policy: PDF files are processed locally in your browser and never uploaded, stored, or viewed.',
  datePublished: '2026-09-22',
  publisher: organizationRef,
};

export const termsSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${BASE_URL}/terms`,
  url: `${BASE_URL}/terms`,
  name: 'Terms of Service for PDFEdit',
  description: 'Terms of Service for using PDFEdit free online PDF tools.',
  datePublished: '2026-09-22',
  publisher: organizationRef,
};

export const disclaimerSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${BASE_URL}/disclaimer`,
  url: `${BASE_URL}/disclaimer`,
  name: 'Disclaimer for PDFEdit',
  description:
    'PDFEdit disclaimer: free PDF tools provided as-is, best-effort outputs, visual signatures are not certified, and nothing on the site is professional advice.',
  datePublished: '2026-09-23',
  publisher: organizationRef,
};

export const cookiesSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${BASE_URL}/cookies`,
  url: `${BASE_URL}/cookies`,
  name: 'Cookie Policy for PDFEdit',
  description:
    'PDFEdit cookie policy: no first-party cookies; advertising cookies from Google AdSense only when ads are shown.',
  datePublished: '2026-09-22',
  publisher: organizationRef,
};

export const studioSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  '@id': `${BASE_URL}/studio`,
  url: `${BASE_URL}/studio`,
  name: 'PDFEdit Studio',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any (Web browser)',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'PDFEdit Studio: a free browser-based PDF editor. Edit text, sign documents, mask sensitive content, and organize pages — no installs, no uploads.',
  publisher: organizationRef,
};

export const batchPdfSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': `${BASE_URL}/batch-pdf`,
      url: `${BASE_URL}/batch-pdf`,
      name: 'Batch Merge PDF Online Free',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Any (Web browser)',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description:
        'Merge many PDF files at once in your browser. Combine multiple PDFs in your preferred order and download one merged document.',
    },
    {
      '@type': 'HowTo',
      name: 'How to batch merge PDFs',
      step: [
        { '@type': 'HowToStep', name: 'Add files', text: 'Select or drag in the PDF files you want to combine.' },
        { '@type': 'HowToStep', name: 'Arrange order', text: 'Drag files into your preferred order.' },
        { '@type': 'HowToStep', name: 'Merge and download', text: 'Merge the files in your browser and download the combined PDF.' },
      ],
    },
  ],
};
