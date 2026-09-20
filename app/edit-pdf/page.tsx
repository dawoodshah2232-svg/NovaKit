import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
const url = 'https://www.pdfedit.website/edit-pdf';
export const metadata: Metadata = {
	title: 'PDF Metadata Editor | PDFEdit',
	robots: { index: false, follow: true },
	alternates: { canonical: 'https://www.pdfedit.website/tools/edit-pdf-metadata' },
	openGraph: { url: 'https://www.pdfedit.website/tools/edit-pdf-metadata' },
};
export default function Page() { redirect('/tools/edit-pdf-metadata'); }
