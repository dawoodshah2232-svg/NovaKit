import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';
const url = 'https://www.pdfedit.website/organize-pdf';
export const metadata: Metadata = {
	title: { absolute: 'Organize and Reorder PDF Pages Online | PDFEdit' },
	description: 'Reorder, duplicate, and remove PDF pages in a visual browser workspace before downloading the organized document locally.',
	alternates: { canonical: url },
	openGraph: { title: 'Organize and Reorder PDF Pages Online | PDFEdit', description: 'Reorder, duplicate, and remove PDF pages in a visual browser workspace.', url },
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'organize-pdf' })} />; }
