import Link from 'next/link';
import { ShieldCheck, Zap, Lock, Cpu, FileText } from 'lucide-react';
import { Logo } from './logo';

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28 md:pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & mission */}
          <div className="md:col-span-2 space-y-3">
            <Logo size="sm" badgeText="100% Client-Side" />
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Professional, browser-native PDF and document utility studio. All operations occur strictly within your device memory. 
              Your confidential documents, contracts, and images never touch any external server or database.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Zero Server Uploads
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Zap className="w-4 h-4 text-amber-500" />
                Instant Local Processing
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Lock className="w-4 h-4 text-rose-500" />
                Device Memory Only
              </span>
            </div>
          </div>

          {/* Core PDF Tools */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-rose-500" />
              <span>PDF Utilities</span>
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/tools/image-to-pdf" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Image to PDF Converter
                </Link>
              </li>
              <li>
                <Link href="/tools/pdf-to-images" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  PDF to Images Converter
                </Link>
              </li>
              <li>
                <Link href="/tools/organize-pdf" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Organize & Reorder PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/rotate-pdf" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Rotate PDF Pages
                </Link>
              </li>
              <li>
                <Link href="/tools/watermark-pdf" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Watermark PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/unlock-pdf" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Unlock / Remove Password
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Architecture */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3">
              Trust & Architecture
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/#security" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  Client-Side Architecture
                </Link>
              </li>
              <li>
                <span className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer">
                  Cookie & Ad Choices
                </span>
              </li>
              <li>
                <Link href="/admin" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors flex items-center gap-1 text-xs text-slate-400">
                  <Lock className="w-3 h-3" />
                  <span>Admin Console</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <p>© {new Date().getFullYear()} PDFEdit Studio (pdfedit.website). Engineered for speed and total client privacy.</p>
          </div>
          <p className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
            <Cpu className="w-3.5 h-3.5" />
            Runs 100% on your device hardware (Zero Cloud Storage)
          </p>
        </div>
      </div>
    </footer>
  );
}
