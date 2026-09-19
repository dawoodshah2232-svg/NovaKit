import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { Footer } from '@/components/footer';

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
    default: 'PDFEdit Studio – 100% Free & Private Online PDF Editor & Tools',
    template: '%s | PDFEdit Studio',
  },
  description:
    'Professional, browser-native PDF utilities. Edit, merge, split, rotate, watermark, convert, reorder, and unlock PDF files with zero server uploads.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PDFEdit Studio',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  keywords: [
    'pdf editor',
    'pdf tools',
    'pdfedit studio',
    'free pdf editor online',
    'edit pdf without uploading',
    'pdf to images converter',
    'image to pdf converter',
    'organize pdf pages',
    'reorder pdf pages',
    'pdf password remover',
    'unlock pdf online free',
    'rotate pdf pages',
    'watermark pdf in browser',
    'split pdf pages',
    'edit pdf metadata',
    'pdf merger',
    'compress pdf',
    'client-side pdf processing',
    'zero server upload',
    'privacy-first pdf editor',
  ],
  authors: [{ name: 'PDFEdit Studio Team' }],
  openGraph: {
    title: 'PDFEdit Studio – 100% Free & Private Online PDF Editor & Tools',
    description:
      'Professional, browser-native PDF utilities. Edit, merge, split, rotate, watermark, convert, reorder, and unlock PDF files with zero server uploads.',
    url: 'https://www.pdfedit.website',
    siteName: 'PDFEdit Studio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDFEdit Studio – 100% Free & Private Online PDF Editor & Tools',
    description:
      'Professional, browser-native PDF utilities with zero server uploads.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#f8fafc',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning className="h-full scroll-smooth">
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans min-h-full flex flex-col antialiased bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600/15 selection:text-blue-700 dark:selection:text-blue-300 transition-colors duration-200`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* Top Navigation Header */}
          <Header />

          {/* Main App Content Viewport */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>

          {/* Global Footer */}
          <Footer />

          {/* Mobile-only Sticky Bottom Navigation Bar */}
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}

