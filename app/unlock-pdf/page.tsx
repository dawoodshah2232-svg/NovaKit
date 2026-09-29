import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';
const url = 'https://www.pdfedit.website/unlock-pdf';
export const metadata: Metadata = {
	title: { absolute: 'Unlock PDF Online and Remove Password Restrictions | PDFEdit' },
	description: 'Remove supported PDF password restrictions locally in your browser. Protected files stay on your device during processing.',
	alternates: { canonical: url },
	openGraph: { title: 'Unlock PDF Online and Remove Password Restrictions | PDFEdit', description: 'Remove supported PDF password restrictions locally in your browser.', url, images: [{ url: 'https://www.pdfedit.website/og-image.png', width: 1200, height: 630, alt: 'PDFEdit \u2013 Free Online PDF Editor & Tools' }],},
	twitter: { card: 'summary_large_image', title: 'Unlock PDF Online and Remove Password Restrictions | PDFEdit', description: 'Remove supported PDF password restrictions locally in your browser.', images: ['https://www.pdfedit.website/og-image.png']},
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'unlock-pdf' })} />; }
