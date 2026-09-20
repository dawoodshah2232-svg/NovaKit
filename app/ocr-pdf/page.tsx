import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
const url = 'https://www.pdfedit.website/ocr-pdf';
export const metadata: Metadata = { title: 'OCR PDF | PDFEdit', robots: { index: false, follow: false }, alternates: { canonical: url }, openGraph: { url } };
export default function Page() { notFound(); }
