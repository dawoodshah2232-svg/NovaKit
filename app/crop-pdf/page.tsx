import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';

const url = 'https://www.pdfedit.website/crop-pdf';

export const metadata: Metadata = {
  title: { absolute: 'Crop PDF Margins Online Free | PDFEdit' },
  description: 'Crop PDF page margins, remove unwanted borders, and standardize page sizes directly in your browser. 100% private with lossless CropBox editing.',
  alternates: { canonical: url },
  openGraph: {
    title: 'Crop PDF Margins Online Free | PDFEdit',
    description: 'Crop PDF page margins and trim borders directly in your browser. Fast and private.',
    url,
      images: [{ url: 'https://www.pdfedit.website/og-image.png', width: 1200, height: 630, alt: 'PDFEdit \u2013 Free Online PDF Editor & Tools' }],
},
  twitter: { card: 'summary_large_image', title: 'Crop PDF Margins Online Free | PDFEdit', description: 'Crop PDF page margins and trim borders directly in your browser. Fast and private.', images: ['https://www.pdfedit.website/og-image.png']},
};

export default function Page() {
  return <ToolPage params={Promise.resolve({ slug: 'crop-pdf' })} />;
}
