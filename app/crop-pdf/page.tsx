import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';

const url = 'https://www.pdfedit.website/crop-pdf';

export const metadata: Metadata = {
  title: 'Crop PDF Margins Online Free | PDFEdit',
  description: 'Crop PDF page margins, remove unwanted borders, and standardize page sizes directly in your browser. 100% private with lossless CropBox editing.',
  alternates: { canonical: url },
  openGraph: {
    title: 'Crop PDF Margins Online Free | PDFEdit',
    description: 'Crop PDF page margins and trim borders directly in your browser. Fast and private.',
    url,
  },
};

export default function Page() {
  return <ToolPage params={Promise.resolve({ slug: 'crop-pdf' })} />;
}
