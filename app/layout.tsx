import { Suspense } from 'react';
import { AnalyticsTracker } from '@/components/analytics-tracker';
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { Footer } from '@/components/footer';
import { JsonLd, organizationSchema } from '@/components/schema-jsonld';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.pdfedit.website'),

  title: {
    default: 'PDFEdit – Free Online PDF Editor & PDF Tools',
    template: '%s | PDFEdit',
  },

  description:
    'Free online PDF editor and document tools. Edit, merge, split, compress, sign, rotate, watermark, convert and organize PDF files directly in your browser.',

  alternates: {
    canonical: 'https://www.pdfedit.website/',
  },

  manifest: '/manifest.json',

  icons: {
    icon: [
      {
        url: '/pdfedit-icon-16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/pdfedit-icon-32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/pdfedit-icon-48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        url: '/pdfedit-icon-180.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        url: '/pdfedit-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon-180.png',
  },

  keywords: [
    'PDF editor',
    'free PDF editor',
    'edit PDF online',
    'PDF tools',
    'merge PDF',
    'split PDF',
    'compress PDF',
    'sign PDF',
    'rotate PDF',
    'watermark PDF',
    'JPG to PDF',
    'PDF to image',
    'unlock PDF',
    'OCR PDF',
    'online PDF editor',
    'private PDF editor',
  ],

  authors: [
    {
      name: 'PDFEdit',
    },
  ],

  openGraph: {
    title: 'PDFEdit – Free Online PDF Editor & Tools',
    description:
      'Edit, convert, organize and sign PDFs with fast browser-based tools.',
    url: 'https://www.pdfedit.website/',
    siteName: 'PDFEdit',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PDFEdit – Free Online PDF Editor & Tools',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'PDFEdit – Free Online PDF Editor & Tools',
    description:
      'Edit, convert, organize and sign PDFs with fast browser-based tools.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9f7' },
    { media: '(prefers-color-scheme: dark)', color: '#090c10' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full scroll-smooth"
    >
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${jetbrainsMono.variable} min-h-full bg-[#f8fafc] font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <Suspense fallback={null}><AnalyticsTracker /></Suspense>
            <JsonLd schema={organizationSchema} />
            <a href="#main-content" className="skip-to-content">
              Skip to content
            </a>
            <Header />

            <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
              {children}
            </main>

            <Footer />

            <MobileNav />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}