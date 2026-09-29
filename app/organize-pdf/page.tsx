import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';
const url = 'https://www.pdfedit.website/organize-pdf';
export const metadata: Metadata = {
	title: { absolute: 'Organize and Reorder PDF Pages Online | PDFEdit' },
	description: 'Reorder, duplicate, and remove PDF pages in a visual browser workspace before downloading the organized document locally.',
	alternates: { canonical: url },
	openGraph: { title: 'Organize and Reorder PDF Pages Online | PDFEdit', description: 'Reorder, duplicate, and remove PDF pages in a visual browser workspace.', url, images: [{ url: 'https://www.pdfedit.website/og-image.png', width: 1200, height: 630, alt: 'PDFEdit \u2013 Free Online PDF Editor & Tools' }],},
	twitter: { card: 'summary_large_image', title: 'Organize and Reorder PDF Pages Online | PDFEdit', description: 'Reorder, duplicate, and remove PDF pages in a visual browser workspace.', images: ['https://www.pdfedit.website/og-image.png']},
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'organize-pdf' })} />; }
