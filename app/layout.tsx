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
  metadataBase: new URL('https://novakit.app'),
  title: {
    default: 'NovaKit - Premium Client-Side Web Tools Hub',
    template: '%s | NovaKit',
  },
  description:
    'High-speed, 100% private browser-based utilities. Image compression, PDF merging, invoice creation, and tax calculation with zero server uploads.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NovaKit',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  keywords: [
    'web tools',
    'free local pdf compressor',
    'secure client-side pdf merger',
    'browser-based image compressor without quality loss',
    'instant invoice generator for freelancers',
    'high-speed qr code maker',
    'image compressor',
    'pdf merger',
    'invoice generator',
    'tax calculator',
    'client-side',
    'privacy first',
    'zero server upload',
    'offline web app',
    'pwa',
  ],
  authors: [{ name: 'NovaKit Team' }],
  openGraph: {
    title: 'NovaKit - Premium Client-Side Web Tools Hub',
    description:
      'High-speed, 100% private browser-based utilities. Image compression, PDF merging, invoice creation, and tax calculation with zero server uploads.',
    url: 'https://novakit.app',
    siteName: 'NovaKit',
    type: 'website',
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
