'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  FileText,
  Files,
  Image as ImageIcon,
  Layers,
  Lock,
  RotateCw,
  Search,
  ShieldCheck,
  Split,
  Stamp,
  Unlock,
} from 'lucide-react';

const tools = [
  {
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into one document.',
    href: '/merge-pdf',
    icon: Files,
    category: 'Organize',
  },
  {
    title: 'Split PDF',
    description: 'Split pages or extract selected page ranges.',
    href: '/split-pdf',
    icon: Split,
    category: 'Organize',
  },
  {
    title: 'Compress PDF',
    description: 'Reduce PDF file size directly in your browser.',
    href: '/compress-pdf',
    icon: Layers,
    category: 'Optimize',
  },
  {
    title: 'Rotate PDF',
    description: 'Rotate individual pages or an entire PDF.',
    href: '/rotate-pdf',
    icon: RotateCw,
    category: 'Organize',
  },
  {
    title: 'Watermark PDF',
    description: 'Add text or watermark elements to PDF files.',
    href: '/watermark-pdf',
    icon: Stamp,
    category: 'Edit',
  },
  {
    title: 'Unlock PDF',
    description: 'Remove PDF restrictions from authorized files.',
    href: '/unlock-pdf',
    icon: Unlock,
    category: 'Security',
  },
  {
    title: 'JPG to PDF',
    description: 'Convert JPG and image files into PDF documents.',
    href: '/jpg-to-pdf',
    icon: ImageIcon,
    category: 'Convert',
  },
  {
    title: 'PDF to Images',
    description: 'Convert PDF pages into downloadable images.',
    href: '/pdf-to-images',
    icon: ImageIcon,
    category: 'Convert',
  },
  {
    title: 'Sign PDF',
    description: 'Add signatures and text to PDF documents.',
    href: '/sign-pdf',
    icon: FileText,
    category: 'Edit',
  },
  {
    title: 'PDF Editor',
    description: 'Open the full PDF editing workspace.',
    href: '/studio',
    icon: FileText,
    category: 'Edit',
  },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return tools;

    return tools.filter((tool) =>
      `${tool.title} ${tool.description} ${tool.category}`
        .toLowerCase()
        .includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="w-full">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40 dark:opacity-10" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
            <ShieldCheck className="h-4 w-4" />
            100% Client-Side Processing • Zero Server Uploads
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
            Every tool you need to work with
            <span className="block">
              PDFs <span className="text-blue-600">in one place.</span>
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400">
            Fast, secure, and professional browser utilities. All your document tools organized cleanly by category.
          </p>

          <div className="relative mx-auto mt-8 max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search across all tools..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950"
            />
          </div>
        </div>
      </section>

      <section id="tools" className="py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            PDF Tools
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Choose a tool and start instantly.
          </p>
        </div>

        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;

              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex min-h-48 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <Icon className="h-5 w-5" />
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {tool.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-950 transition group-hover:text-blue-600 dark:text-white">
                      {tool.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {tool.description}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-slate-500 dark:border-slate-800">
                    <span>Open Tool</span>

                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 group-hover:text-blue-600" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
            No matching tools found.
          </div>
        )}
      </section>

      <section
        id="security"
        className="mb-10 grid gap-6 rounded-3xl border border-slate-200 bg-white p-7 sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-900"
      >
        <div>
          <ShieldCheck className="h-6 w-6 text-emerald-600" />

          <h3 className="mt-3 font-bold text-slate-950 dark:text-white">
            Private Processing
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Files are processed directly inside your browser whenever supported.
          </p>
        </div>

        <div>
          <Lock className="h-6 w-6 text-blue-600" />

          <h3 className="mt-3 font-bold text-slate-950 dark:text-white">
            No Account Required
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Start using document tools without creating an account.
          </p>
        </div>

        <div>
          <Layers className="h-6 w-6 text-violet-600" />

          <h3 className="mt-3 font-bold text-slate-950 dark:text-white">
            Complete PDF Toolbox
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Editing, conversion, organization and security tools in one place.
          </p>
        </div>
      </section>
    </div>
  );
}