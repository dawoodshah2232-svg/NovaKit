import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';
const url = 'https://www.pdfedit.website/unlock-pdf';
export const metadata: Metadata = {
	title: 'Unlock PDF Online and Remove Password Restrictions | PDFEdit',
	description: 'Remove supported PDF password restrictions locally in your browser. Protected files stay on your device during processing.',
	alternates: { canonical: url },
	openGraph: { title: 'Unlock PDF Online and Remove Password Restrictions | PDFEdit', description: 'Remove supported PDF password restrictions locally in your browser.', url },
};
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'unlock-pdf' })} />; }
