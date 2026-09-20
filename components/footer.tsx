import Link from 'next/link';
import { ShieldCheck, Zap, Lock, Cpu, FileText } from 'lucide-react';
import { Logo } from './logo';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-10 pb-28 sm:px-6 md:pb-10 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4 md:col-span-2">
            <Logo size="sm" badgeText="100% Client-Side" />

            <p className="max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Free browser-based PDF tools designed for speed, privacy, and everyday document work.
              Your files are processed directly on your device whenever supported.
            </p>

            <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Private Processing
              </span>

              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                Fast Tools
              </span>

              <span className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-blue-500" />
                No Account Required
              </span>
            </div>
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              <FileText className="h-4 w-4 text-blue-600" />
              PDF Tools
            </h4>

            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/merge-pdf" className="transition hover:text-blue-600">
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link href="/split-pdf" className="transition hover:text-blue-600">
                  Split PDF
                </Link>
              </li>
              <li>
                <Link href="/compress-pdf" className="transition hover:text-blue-600">
                  Compress PDF
                </Link>
              </li>
              <li>
                <Link href="/rotate-pdf" className="transition hover:text-blue-600">
                  Rotate PDF
                </Link>
              </li>
              <li>
                <Link href="/jpg-to-pdf" className="transition hover:text-blue-600">
                  JPG to PDF
                </Link>
              </li>
              <li>
                <Link href="/pdf-to-images" className="transition hover:text-blue-600">
                  PDF to Images
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Company
            </h4>

            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/privacy" className="transition hover:text-blue-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition hover:text-blue-600">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/#security" className="transition hover:text-blue-600">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:text-slate-400">
          <p>
            © {new Date().getFullYear()} PDFEdit Enterprise Studio. All rights reserved.
          </p>

          <p className="flex items-center gap-1.5">
            <Cpu className="h-4 w-4" />
            Built for fast browser-based document processing
          </p>
        </div>
      </div>
    </footer>
  );
}