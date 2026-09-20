'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowRight,
  BriefcaseBusiness,
  Calculator,
  Check,
  FileImage,
  FilePenLine,
  FileSearch,
  FileText,
  Image as ImageIcon,
  KeyRound,
  Layers3,
  LockKeyhole,
  Minimize2,
  Palette,
  QrCode,
  Receipt,
  RotateCw,
  Scissors,
  Search,
  ShieldCheck,
  Sparkles,
  Stamp,
  Unlock,
} from 'lucide-react';

import { TOOLS_CONFIG } from '@/lib/tools-config';

const iconMap = {
  Image: ImageIcon,
  FileText,
  Receipt,
  Calculator,
  QrCode,
  Palette,
  FileSearch,
  KeyRound,
  Scissors,
  Minimize2,
  FileImage,
  ShieldAlert: LockKeyhole,
  RotateCw,
  Stamp,
  Layers: Layers3,
  Unlock,
  FilePenLine,
};

const categoryOrder = ['PDF', 'Image', 'Finance', 'Text', 'Security'] as const;

const categoryConfig = {
  PDF: {
    title: 'PDF Tools',
    description:
      'Edit, organize, convert, compress, protect and manage PDF documents.',
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  },
  Image: {
    title: 'Image & Design Tools',
    description:
      'Compress images, extract colors and create useful visual assets.',
    badge:
      'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
  },
  Finance: {
    title: 'Business & Finance Tools',
    description:
      'Create invoices and handle everyday business calculations quickly.',
    badge:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  Text: {
    title: 'Writing & SEO Tools',
    description:
      'Analyze content and improve the structure of your written work.',
    badge:
      'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
  },
  Security: {
    title: 'Security Tools',
    description:
      'Simple privacy and security utilities that run directly in your browser.',
    badge:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  },
};

function ToolCard({
  tool,
}: {
  tool: (typeof TOOLS_CONFIG)[number];
}) {
  const Icon =
    iconMap[tool.iconName as keyof typeof iconMap] || FileText;

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group relative flex min-h-[176px] flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_12px_35px_rgba(15,23,42,0.08)] sm:min-h-[190px] sm:p-5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tool.gradient} text-white shadow-sm`}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>

        {tool.badge && (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            {tool.badge}
          </span>
        )}
      </div>

      <h3 className="mt-4 text-sm font-extrabold tracking-tight text-slate-950 transition-colors group-hover:text-blue-600 sm:text-[15px] dark:text-white">
        {tool.name}
      </h3>

      <p className="mt-2 line-clamp-3 text-[11px] leading-5 text-slate-500 sm:text-xs dark:text-slate-400">
        {tool.description}
      </p>

      <div className="mt-auto flex items-center gap-1.5 pt-4 text-[11px] font-bold text-slate-400 transition-colors group-hover:text-blue-600">
        Open tool
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredTools = useMemo(() => {
    if (!normalizedSearch) return TOOLS_CONFIG;

    return TOOLS_CONFIG.filter((tool) =>
      [
        tool.name,
        tool.description,
        tool.category,
        tool.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [normalizedSearch]);

  const handleSearch = () => {
    document
      .getElementById('all-tools')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="w-full">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[26px] border border-slate-200 bg-white px-5 py-9 text-center shadow-sm sm:px-8 sm:py-11 lg:py-12 dark:border-slate-800 dark:bg-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#dbeafe_1px,transparent_1px)] [background-size:18px_18px] opacity-60 dark:opacity-10" />

        <div className="pointer-events-none absolute -left-28 -top-28 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl dark:bg-blue-950/20" />

        <div className="pointer-events-none absolute -bottom-36 -right-20 h-72 w-72 rounded-full bg-cyan-100/50 blur-3xl dark:bg-cyan-950/20" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <h1 className="text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-[52px] lg:leading-[1.04] dark:text-white">
            Everything you need
            <br />
            to work with{' '}
            <span className="text-blue-600">documents.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400">
            Edit PDFs, organize pages, convert files and use practical productivity tools from one clean workspace.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/studio"
              className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 sm:w-auto"
            >
              <FilePenLine className="h-4 w-4" />
              Edit a PDF Document
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href="#all-tools"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Browse all {TOOLS_CONFIG.length} tools
            </a>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              No signup required
            </span>

            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              Unlimited core tool use
            </span>

            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              Download instantly
            </span>
          </div>

          <div className="mx-auto mt-7 max-w-3xl">
            <div className="rounded-2xl border border-slate-300 bg-white p-2 shadow-[0_10px_30px_rgba(15,23,42,0.10)] dark:border-slate-700 dark:bg-slate-950">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    placeholder="Search PDF, image, invoice, QR, SEO tools..."
                    className="h-12 w-full rounded-xl border border-transparent bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white dark:bg-slate-900 dark:text-white dark:focus:border-slate-700 dark:focus:bg-slate-900"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-extrabold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TOOL DIRECTORY */}
      <section id="all-tools" className="py-14 sm:py-16">
        <div className="mb-9 text-center">
          <span className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">
            PDFEdit Toolkit
          </span>

          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            One place. Every useful tool.
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Tools are grouped by purpose so you can find what you need without
            digging through menus.
          </p>
        </div>

        {normalizedSearch ? (
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 dark:text-white">
                Search results
              </h3>

              <span className="text-xs font-semibold text-slate-400">
                {filteredTools.length} found
              </span>
            </div>

            {filteredTools.length ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-900">
                <Search className="mx-auto h-8 w-8 text-slate-300" />

                <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                  No matching tool found.
                </p>

                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs font-bold text-blue-600"
                >
                  Show all tools
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-14">
            {categoryOrder.map((category) => {
              const categoryTools = TOOLS_CONFIG.filter(
                (tool) => tool.category === category
              );

              if (!categoryTools.length) return null;

              const config = categoryConfig[category];

              return (
                <div key={category}>
                  <div className="mb-5 flex flex-col justify-between gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-end dark:border-slate-800">
                    <div>
                      <div
                        className={`mb-1 inline-flex rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${config.badge}`}
                      >
                        {category}
                      </div>

                      <h3 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl dark:text-white">
                        {config.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm dark:text-slate-400">
                        {config.description}
                      </p>
                    </div>

                    <span className="text-[11px] font-bold text-slate-400">
                      {categoryTools.length}{' '}
                      {categoryTools.length === 1 ? 'tool' : 'tools'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                    {categoryTools.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* PRODUCT FEATURE BANNERS */}
      <section className="pb-14 sm:pb-16">
        <div className="mb-7 text-center">
          <span className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">
            More than quick tools
          </span>

          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            Professional workspaces for bigger jobs.
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Move beyond individual utilities when you need complete document
            creation and editing.
          </p>
        </div>

        <div className="grid gap-5">
          <div className="group grid overflow-hidden rounded-[24px] border border-blue-200/80 bg-gradient-to-br from-[#061a3a] via-[#0b2d60] to-[#0d4a82] shadow-[0_14px_38px_rgba(8,39,82,0.14)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(8,39,82,0.22)] dark:border-blue-900/80 dark:from-[#061329] dark:via-[#0a2247] dark:to-[#0c3764] lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col justify-center px-6 py-7 sm:px-9 sm:py-8 lg:px-10 lg:py-9">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-200">
                <FilePenLine className="h-4 w-4" />
                PDFEdit Studio
              </div>

              <h3 className="mt-3 max-w-xl text-2xl font-black tracking-tight text-white sm:text-3xl">
                Edit documents, not just PDFs.
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/80">
                Create documents or open an existing PDF and continue working
                in one professional visual workspace.
              </p>

              <ul className="mt-5 grid gap-2 text-xs font-medium text-blue-50 sm:grid-cols-2 sm:gap-x-5">
                {[
                  'Edit text, images and document content',
                  'Add company logos, letterheads and stamps',
                  'Insert signatures, shapes and visual elements',
                  'Export the finished document as PDF',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/studio"
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#08285a] shadow-lg shadow-black/10 transition hover:bg-blue-50 sm:w-fit"
              >
                Open PDF Studio
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="relative flex min-h-0 items-center overflow-hidden border-t border-white/10 bg-[#0a2855]/60 p-4 sm:p-6 lg:border-l lg:border-t-0 lg:p-7">
              <Image
                src="/pdf-studio.png"
                alt="PDFEdit Studio document editor"
                width={1711}
                height={919}
                className="h-auto w-full rounded-xl object-contain shadow-2xl"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </div>

          <div className="grid overflow-hidden rounded-[24px] border border-emerald-200/80 bg-gradient-to-br from-[#063c34] via-[#07594b] to-[#0b7660] shadow-[0_14px_38px_rgba(4,73,60,0.13)] dark:border-emerald-900/80 dark:from-[#062c27] dark:via-[#07443a] dark:to-[#075847] lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col justify-center px-6 py-7 sm:px-9 sm:py-8 lg:px-10 lg:py-9">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-200">
                <BriefcaseBusiness className="h-4 w-4" />
                Professional CV Builder
              </div>

              <h3 className="mt-3 max-w-xl text-2xl font-black tracking-tight text-white sm:text-3xl">
                Build a professional CV in minutes.
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-100/80">
                Choose a polished resume template, add your information and
                create a job-ready PDF without designing from scratch.
              </p>

              <ul className="mt-5 grid gap-2 text-xs font-medium text-emerald-50 sm:grid-cols-2 sm:gap-x-5">
                {[
                  'Professional ready-made CV templates',
                  'Edit experience, education and skills',
                  'Upload profile photo and personal details',
                  'Download a polished PDF resume',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white/70 sm:w-fit">
                <Sparkles className="h-4 w-4" />
                CV Builder - Coming Soon
              </div>
            </div>

            <div className="relative flex min-h-0 items-center overflow-hidden border-t border-white/10 bg-[#075144]/60 p-4 sm:p-6 lg:border-l lg:border-t-0 lg:p-7">
              <Image
                src="/cv-builder.png"
                alt="Professional CV builder preview"
                width={1711}
                height={919}
                className="h-auto w-full rounded-xl object-contain shadow-2xl"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section
        id="security"
        className="mb-14 overflow-hidden rounded-[28px] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="px-6 py-9 text-center sm:px-8">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">
            Built around privacy
          </span>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl dark:text-white">
            Simple tools without unnecessary friction.
          </h2>
        </div>

        <div className="grid border-t border-slate-200 sm:grid-cols-3 dark:border-slate-800">
          <div className="p-6 sm:border-r sm:border-slate-200 dark:sm:border-slate-800">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />

            <h3 className="mt-4 font-extrabold text-slate-950 dark:text-white">
              Privacy-minded
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm dark:text-slate-400">
              Supported tools are designed to process files directly in your
              browser whenever possible.
            </p>
          </div>

          <div className="border-t border-slate-200 p-6 sm:border-r sm:border-t-0 dark:border-slate-800">
            <Check className="h-6 w-6 text-blue-600" />

            <h3 className="mt-4 font-extrabold text-slate-950 dark:text-white">
              No unnecessary signup
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm dark:text-slate-400">
              Open the tool you need and get straight to the job.
            </p>
          </div>

          <div className="border-t border-slate-200 p-6 sm:border-t-0 dark:border-slate-800">
            <Sparkles className="h-6 w-6 text-violet-600" />

            <h3 className="mt-4 font-extrabold text-slate-950 dark:text-white">
              Built for everyday work
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm dark:text-slate-400">
              Documents, images, invoices, SEO and security utilities live in
              one consistent interface.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}