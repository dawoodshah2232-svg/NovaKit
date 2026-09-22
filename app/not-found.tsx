import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page Not Found | PDFEdit',
  description: 'The page you are looking for does not exist on PDFEdit.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-6xl font-black tracking-tight text-slate-200 dark:text-slate-800">
        404
      </p>
      <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
        The page you are looking for may have been moved or deleted. Try one of
        our free PDF tools instead.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
        >
          Back to Home
        </Link>
        <Link
          href="/studio"
          className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          Open PDF Studio
        </Link>
      </div>
    </main>
  );
}
