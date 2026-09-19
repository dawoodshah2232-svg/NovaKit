import type { Metadata } from 'next';
import ToolPage from '../tools/[slug]/page';
const url = 'https://www.pdfedit.website/jpg-to-pdf';
export const metadata: Metadata = { alternates: { canonical: url }, openGraph: { url } };
export default function Page() { return <ToolPage params={Promise.resolve({ slug: 'image-to-pdf' })} />; }
