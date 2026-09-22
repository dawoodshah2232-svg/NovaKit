import Link from 'next/link';
import { ShieldCheck, Zap, Lock, Cpu, FileText } from 'lucide-react';
import { Logo } from './logo';

const PRODUCT_LINKS = [
  { label: 'All tools', href: '/#tools' },
  { label: 'PDF Studio', href: '/studio' },
  { label: 'Merge PDF', href: '/merge-pdf' },
  { label: 'Split PDF', href: '/split-pdf' },
  { label: 'Compress PDF', href: '/compress-pdf' },
  { label: 'Rotate PDF', href: '/rotate-pdf' },
  { label: 'JPG to PDF', href: '/jpg-to-pdf' },
  { label: 'PDF to Images', href: '/pdf-to-images' },
];

const COMPANY_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Security', href: '/#security' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookies' },
  { label: 'Disclaimer', href: '/disclaimer' },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--pe-border)] bg-[var(--pe-surface)]">
      <div className="mx-auto max-w-7xl px-4 py-10 pb-28 sm:px-6 lg:px-8 lg:pb-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-5">
          <div className="space-y-4 md:col-span-2">
            <Logo size="sm" badgeText="100% Client-Side" />

            <p className="max-w-md text-sm leading-relaxed text-[var(--pe-text-2)]">
              Free browser-based PDF tools designed for speed, privacy, and everyday document work.
              Your files are processed directly on your device whenever supported.
            </p>

            <div className="flex flex-wrap gap-4 text-xs font-medium text-[var(--pe-text-2)]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[var(--pe-success)]" aria-hidden="true" />
                Private Processing
              </span>

              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-[var(--pe-accent)]" aria-hidden="true" />
                Fast Tools
              </span>

              <span className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-[var(--pe-accent)]" aria-hidden="true" />
                No Account Required
              </span>
            </div>
          </div>

          <nav aria-label="Products">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--pe-text)]">
              <FileText className="h-4 w-4 text-[var(--pe-accent)]" aria-hidden="true" />
              Products
            </h4>

            <ul className="space-y-2 text-sm text-[var(--pe-text-2)]">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="transition hover:text-[var(--pe-accent)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--pe-text)]">
              Company
            </h4>

            <ul className="space-y-2 text-sm text-[var(--pe-text-2)]">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="transition hover:text-[var(--pe-accent)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--pe-text)]">
              Legal
            </h4>

            <ul className="space-y-2 text-sm text-[var(--pe-text-2)]">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="transition hover:text-[var(--pe-accent)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[var(--pe-divider)] pt-6 text-xs text-[var(--pe-text-3)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} PDFEdit. All rights reserved.
          </p>

          <p className="flex items-center gap-1.5">
            <Cpu className="h-4 w-4" aria-hidden="true" />
            Built for fast browser-based document processing
          </p>
        </div>
      </div>
    </footer>
  );
}
