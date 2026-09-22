import type { Metadata } from 'next';
import BatchTool from './batch-tool';

const url = 'https://www.pdfedit.website/batch-pdf';

export const metadata: Metadata = {
  title: { absolute: 'Batch Merge PDF Online Free | Combine Files | PDFEdit' },
  description:
    'Merge multiple PDF files at once in your browser. Batch PDF processing with zero server uploads — free, private, and no sign-up required.',
  alternates: { canonical: url },
  openGraph: {
    title: 'Batch Merge PDF Online Free | PDFEdit',
    description:
      'Combine many PDF files into one document at once, locally in your browser. No uploads, no sign-up.',
    url,
  },
};

function jsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.pdfedit.website/' },
          { '@type': 'ListItem', position: 2, name: 'Batch PDF Processing', item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Are files sent to a server?',
            acceptedAnswer: { '@type': 'Answer', text: 'No. The batch merge runs entirely in browser memory; files are never uploaded.' },
          },
          {
            '@type': 'Question',
            name: 'How many files can I select?',
            acceptedAnswer: { '@type': 'Answer', text: 'The practical limit depends on available device memory.' },
          },
          {
            '@type': 'Question',
            name: 'Can I reorder files?',
            acceptedAnswer: { '@type': 'Answer', text: 'The batch page uses selection order; use Merge PDF for drag-and-drop ordering.' },
          },
        ],
      },
    ],
  };
}

export default function BatchPdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
      />
      <BatchTool />
    </>
  );
}
