import Link from 'next/link';
import { ShieldCheck, Zap, Lock, Cpu } from 'lucide-react';
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
              High-speed, browser-native utility hub. All operations occur strictly within your browser. 
              Your files and sensitive numbers never touch any server or database.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Zero Uploads
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                Instant WASM / JS
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-500" />
                Local Memory Only
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3">
              Tools Hub
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="#tools" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Image Compressor
                </Link>
              </li>
              <li>
                <Link href="#tools" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  PDF Merger
                </Link>
              </li>
              <li>
                <Link href="#tools" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Invoice Generator
                </Link>
              </li>
              <li>
                <Link href="#tools" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Tax Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / AdSense compliance */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3">
              Transparency
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
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
                  Ad & Cookie Choices
                </span>
              </li>
              <li>
                <span className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer">
                  Architecture & Security
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <p>© {new Date().getFullYear()} NovaKit. Engineered for speed and total client privacy.</p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Console</span>
            </Link>
          </div>
          <p className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
            <Cpu className="w-3.5 h-3.5" />
            Runs 100% on your device hardware
          </p>
        </div>
      </div>
    </footer>
  );
}
