import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
const url = 'https://www.pdfedit.website/sign-pdf';
export const metadata: Metadata = { title: 'PDF Signer | PDFEdit', robots: { index: false, follow: false }, alternates: { canonical: url }, openGraph: { url } };
export default function Page() { notFound(); }
