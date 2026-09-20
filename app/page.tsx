'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Download,
  FileText,
  Files,
  Image as ImageIcon,
  Layers,
  Lock,
  Minimize2,
  PenLine,
  Pencil,
  RotateCw,
  ScanText,
  Scissors,
  Search,
  ShieldCheck,
  Sparkles,
  Stamp,
  Type,
  Unlock,
  Upload,
} from 'lucide-react';

const tools = [
  {
    title: 'Merge PDF',
    description: 'Combine multiple PDF documents into one organized file.',
    href: '/merge-pdf',
    icon: Files,
    category: 'Organize',
    iconStyle: 'bg-violet-50 text-violet-600 dark:bg-violet-950/50',
  },
  {
    title: 'Split PDF',
    description: 'Extract pages or divide a PDF into separate documents.',
    href: '/split-pdf',
    icon: Scissors,
    category: 'Organize',
    iconStyle: 'bg-orange-50 text-orange-600 dark:bg-orange-950/50',
  },
  {
    title: 'Compress PDF',
    description: 'Reduce PDF file size while protecting document quality.',
    href: '/compress-pdf',
    icon: Minimize2,
    category: 'Optimize',
    iconStyle: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50',
  },
  {
    title: 'Edit PDF',
    description: 'Add and modify text, images and other document content.',
    href: '/edit-pdf',
    icon: Pencil,
    category: 'Edit',
    iconStyle: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50',
  },
  {
    title: 'Sign PDF',
    description: 'Add your signature and complete documents online.',
    href: '/sign-pdf',
    icon: PenLine,
    category: 'Sign',
    iconStyle: 'bg-pink-50 text-pink-600 dark:bg-pink-950/50',
  },
  {
    title: 'JPG to PDF',
    description: 'Turn JPG and image files into clean PDF documents.',
    href: '/jpg-to-pdf',
    icon: ImageIcon,
    category: 'Convert',
    iconStyle: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50',
  },
  {
    title: 'PDF to JPG',
    description: 'Convert PDF pages into high-quality JPG images.',
    href: '/pdf-to-jpg',
    icon: Download,
    category: 'Convert',
    iconStyle: 'bg-sky-50 text-sky-600 dark:bg-sky-950/50',
  },
  {
    title: 'PDF to Images',
    description: 'Export document pages as downloadable image files.',
    href: '/pdf-to-images',
    icon: ImageIcon,
    category: 'Convert',
    iconStyle: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50',
  },
  {
    title: 'Rotate PDF',
    description: 'Rotate individual pages or complete PDF documents.',
    href: '/rotate-pdf',
    icon: RotateCw,
    category: 'Organize',
    iconStyle: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50',
  },
  {
    title: 'Organize PDF',
    description: 'Reorder, arrange and manage pages visually.',
    href: '/organize-pdf',
    icon: Layers,
    category: 'Organize',
    iconStyle: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50',
  },
  {
    title: 'Watermark PDF',
    description: 'Place text or image watermarks onto PDF pages.',
    href: '/watermark-pdf',
    icon: Stamp,
    category: 'Edit',
    iconStyle: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50',
  },
  {
    title: 'Unlock PDF',
    description: 'Remove restrictions from PDF files you are authorized to edit.',
    href: '/unlock-pdf',
    icon: Unlock,
    category: 'Security',
    iconStyle: 'bg-teal-50 text-teal-600 dark:bg-teal-950/50',
  },
  {
    title: 'OCR PDF',
    description: 'Recognize text inside scanned documents and images.',
    href: '/ocr-pdf',
    icon: ScanText,
    category: 'OCR',
    iconStyle: 'bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-950/50',
  },
  {
    title: 'Batch PDF',
    description: 'Process several PDF files together from one workspace.',
    href: '/batch-pdf',
    icon: FileText,
    category: 'Productivity',
    iconStyle: 'bg-slate-100 text-slate-700 dark:bg-slate-800',
  },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) return tools;

    return tools.filter((tool) =>
      `${tool.title} ${tool.description} ${tool.category}`
        .toLowerCase()
        .includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="w-full">

      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm sm:px-8 sm:py-16 lg:py-20 dark:border-slate-800 dark:bg-slate-900">

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#dbeafe_1px,transparent_1px)] [background-size:18px_18px] opacity-70 dark:opacity-10" />

        <div className="relative z-10 mx-auto max-w-4xl">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
            <ShieldCheck className="h-4 w-4" />
            Private browser-based document tools
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
            Free Online PDF Tools
            <span className="mt-1 block text-blue-600">
              Edit. Convert. Sign. Organize.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base lg:text-lg dark:text-slate-400">
            A complete document workspace for everyday PDF tasks — fast,
            simple and designed around privacy.
          </p>

          <div className="relative mx-auto mt-8 max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="What do you want to do with your PDF?"
              className="w-full rounded-2xl border border-slate-300 bg-white py-4 pl-12 pr-4 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
            />
          </div>

        </div>
      </section>


      {/* FEATURE BANNERS */}
      <section
        id="features"
        className="grid gap-5 py-7 lg:grid-cols-2"
      >

        {/* PDF STUDIO BANNER */}
        <Link
          href="/studio"
          className="group relative overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-br from-[#081c4c] via-[#0b3b91] to-[#1268f3] p-6 text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7"
        >

          <div className="relative z-10 grid min-h-[300px] gap-6 sm:grid-cols-[1.05fr_.95fr] sm:items-center">

            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur">
                <Sparkles className="h-4 w-4" />
                PDFEdit Studio
              </div>

              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                Edit PDFs like a document.
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-blue-100">
                Edit text, create documents, add images, signatures, stamps and
                letterheads from one professional workspace.
              </p>

              <div className="mt-5 grid gap-2 text-xs font-semibold text-blue-50">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                  Edit and add document text
                </span>

                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                  Upload logos, stamps and signatures
                </span>

                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                  Create letterheads and blank documents
                </span>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-blue-700 transition group-hover:bg-blue-50">
                Open PDF Studio
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </div>


            {/* Visual mock editor */}
            <div className="relative mx-auto w-full max-w-[260px]">

              <div className="absolute -left-5 top-5 z-10 rounded-xl border border-white/20 bg-white/15 p-2.5 shadow-xl backdrop-blur">
                <Type className="h-5 w-5" />
              </div>

              <div className="absolute -right-4 top-20 z-10 rounded-xl border border-white/20 bg-white/15 p-2.5 shadow-xl backdrop-blur">
                <Upload className="h-5 w-5" />
              </div>

              <div className="rotate-2 rounded-xl bg-white p-4 shadow-2xl transition duration-300 group-hover:rotate-0">

                <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="h-3 w-20 rounded bg-blue-600" />
                  <div className="h-6 w-6 rounded bg-blue-100" />
                </div>

                <div className="space-y-2">
                  <div className="h-2.5 w-4/5 rounded bg-slate-900" />
                  <div className="h-2 w-full rounded bg-slate-200" />
                  <div className="h-2 w-11/12 rounded bg-slate-200" />
                  <div className="h-2 w-3/4 rounded bg-slate-200" />
                </div>

                <div className="mt-5 rounded-lg border border-dashed border-blue-300 bg-blue-50 p-3">
                  <div className="h-2 w-2/3 rounded bg-blue-300" />
                  <div className="mt-2 h-2 w-1/2 rounded bg-blue-200" />
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <div className="-rotate-6 font-serif text-xl italic text-blue-800">
                    Signature
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-red-400 text-[8px] font-black text-red-500">
                    STAMP
                  </div>
                </div>

              </div>

            </div>

          </div>
        </Link>


        {/* CV BUILDER BANNER */}
        <Link
          href="/cv-builder"
          className="group relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-[#052e2b] via-[#08665d] to-[#0ba58e] p-6 text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7"
        >

          <div className="relative z-10 grid min-h-[300px] gap-6 sm:grid-cols-[1.05fr_.95fr] sm:items-center">

            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur">
                <Briefcase className="h-4 w-4" />
                Professional CV Builder
              </div>

              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                Build a job-ready CV in minutes.
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-emerald-100">
                Choose a professional template, replace the content with your
                details and download a polished PDF resume.
              </p>

              <div className="mt-5 grid gap-2 text-xs font-semibold text-emerald-50">

                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  30+ professional CV layouts
                </span>

                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  Photo, skills, icons and sections
                </span>

                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  Edit visually and download as PDF
                </span>

              </div>

              <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-emerald-700 transition group-hover:bg-emerald-50">
                Create My CV
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </div>


            {/* CV visual */}
            <div className="relative mx-auto w-full max-w-[250px]">

              <div className="absolute -right-5 top-8 z-20 rounded-xl border border-white/20 bg-white/15 p-2.5 shadow-xl backdrop-blur">
                <Sparkles className="h-5 w-5" />
              </div>

              <div className="-rotate-2 overflow-hidden rounded-xl bg-white shadow-2xl transition duration-300 group-hover:rotate-0">

                <div className="grid grid-cols-[34%_66%]">

                  <div className="min-h-[260px] bg-slate-900 p-3">

                    <div className="mx-auto h-14 w-14 rounded-full bg-slate-300" />

                    <div className="mt-5 space-y-2">
                      <div className="h-2 w-12 rounded bg-emerald-400" />
                      <div className="h-1.5 w-full rounded bg-slate-600" />
                      <div className="h-1.5 w-4/5 rounded bg-slate-600" />
                    </div>

                    <div className="mt-5 space-y-2">
                      <div className="h-2 w-10 rounded bg-emerald-400" />
                      <div className="h-1.5 w-full rounded bg-slate-600" />
                      <div className="h-1.5 w-3/4 rounded bg-slate-600" />
                    </div>

                  </div>

                  <div className="p-4">

                    <div className="h-3 w-4/5 rounded bg-slate-900" />
                    <div className="mt-2 h-2 w-1/2 rounded bg-emerald-500" />

                    <div className="mt-6 space-y-2">
                      <div className="h-2 w-20 rounded bg-slate-800" />
                      <div className="h-1.5 w-full rounded bg-slate-200" />
                      <div className="h-1.5 w-full rounded bg-slate-200" />
                      <div className="h-1.5 w-4/5 rounded bg-slate-200" />
                    </div>

                    <div className="mt-5 space-y-2">
                      <div className="h-2 w-16 rounded bg-slate-800" />
                      <div className="h-1.5 w-full rounded bg-slate-200" />
                      <div className="h-1.5 w-5/6 rounded bg-slate-200" />
                    </div>

                    <div className="mt-5 flex gap-2">
                      <div className="h-5 w-10 rounded-full bg-emerald-100" />
                      <div className="h-5 w-12 rounded-full bg-emerald-100" />
                      <div className="h-5 w-8 rounded-full bg-emerald-100" />
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>
        </Link>

      </section>


      {/* TOOL DIRECTORY */}
      <section id="tools" className="py-8">

        <div className="mb-7">

          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
            PDFEdit Toolkit
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            All PDF tools
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Choose the task you need and start working immediately.
          </p>

        </div>


        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">

            {filteredTools.map((tool) => {
              const Icon = tool.icon;

              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex min-h-[190px] flex-col rounded-2xl border border-slate-200 bg-white p-4 transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg sm:p-5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800"
                >

                  <div className="flex items-start justify-between gap-2">

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${tool.iconStyle}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="hidden rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500 sm:block dark:bg-slate-800 dark:text-slate-400">
                      {tool.category}
                    </span>

                  </div>

                  <h3 className="mt-4 text-sm font-black text-slate-950 transition group-hover:text-blue-600 sm:text-base dark:text-white">
                    {tool.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600 sm:text-sm dark:text-slate-400">
                    {tool.description}
                  </p>

                  <div className="mt-auto flex items-center gap-1.5 pt-4 text-xs font-bold text-blue-600">
                    Open tool
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </div>

                </Link>
              );
            })}

          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">

            <Search className="mx-auto h-8 w-8 text-slate-400" />

            <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
              No tool found for “{searchQuery}”
            </p>

          </div>
        )}

      </section>


      {/* SECURITY / PRODUCT BENEFITS */}
      <section
        id="security"
        className="my-10 overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      >

        <div className="border-b border-slate-200 px-6 py-7 dark:border-slate-800">

          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
            Designed differently
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl dark:text-white">
            Your documents. Your browser. Your control.
          </h2>

        </div>

        <div className="grid sm:grid-cols-3">

          <div className="p-6 sm:border-r sm:border-slate-200 dark:sm:border-slate-800">

            <ShieldCheck className="h-7 w-7 text-emerald-600" />

            <h3 className="mt-4 font-black text-slate-950 dark:text-white">
              Privacy first
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              We prioritize browser-side processing for supported document operations.
            </p>

          </div>

          <div className="border-t border-slate-200 p-6 sm:border-r sm:border-t-0 dark:border-slate-800">

            <Lock className="h-7 w-7 text-blue-600" />

            <h3 className="mt-4 font-black text-slate-950 dark:text-white">
              No account needed
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Open the utility you need and get to work without unnecessary registration.
            </p>

          </div>

          <div className="border-t border-slate-200 p-6 sm:border-t-0 dark:border-slate-800">

            <Layers className="h-7 w-7 text-violet-600" />

            <h3 className="mt-4 font-black text-slate-950 dark:text-white">
              One workspace
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              PDF editing, conversion, organization, signing and productivity tools together.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}