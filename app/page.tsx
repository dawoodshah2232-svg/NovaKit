"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Layers, 
  FileText, 
  Scissors, 
  Database, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Search,
  Sparkles,
  Briefcase,
  FileCheck,
  Cpu
} from "lucide-react";

export default function MasterHomepage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      <div>
        {/* Navigation Bar */}
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-18 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                PDF
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900">PDFEdit</span>
                <span className="text-xs uppercase font-semibold text-blue-600 block tracking-widest">Enterprise Studio</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/cv-builder" 
                className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition"
              >
                <Briefcase className="w-4 h-4" /> CV Builder
              </Link>
              <Link 
                href="/studio" 
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Launch Master Studio
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-white border-b border-slate-200 py-16 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>
          
          <div className="max-w-3xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-6">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> 100% Client-Side Processing • Zero Server Uploads
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
              Every tool you need to work with PDFs <span className="text-blue-600">in one place.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Professional, software-grade document utilities. Edit, sign, convert, split, and manage files securely in your browser.
            </p>

            {/* Global Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for any tool (e.g., merge, signature, splitter)..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition shadow-sm"
              />
            </div>
          </div>
        </section>

        {/* Category Sections */}
        <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
          
          {/* SECTION 1: Flagship Software & Editors */}
          <div>
            <div className="border-b border-slate-200 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-600" /> Flagship Workspaces & Editors
              </h2>
              <p className="text-sm text-slate-500">Full desktop-style application suites running locally in your browser.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Master Studio Card */}
              <Link
                href="/studio"
                className="group bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-2xl p-8 border border-blue-800 shadow-lg hover:shadow-xl transition flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-blue-300 transition">
                    PDFEdit Master Studio (Word-Style Editor)
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    A fully functional document powerhouse. Upload documents, edit native text with matching fonts, apply custom digital signatures, insert letterheads, and export instantly.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-700 text-xs font-semibold text-blue-400">
                  <span>Full Suite Software</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition">Launch Workspace <ArrowRight className="w-4 h-4" /></span>
                </div>
              </Link>

              {/* CV Builder Card */}
              <Link
                href="/cv-builder"
                className="group bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-8 border border-emerald-800 shadow-lg hover:shadow-xl transition flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-emerald-300 transition">
                    Professional CV Builder Studio
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    Create region-compliant resumes (UAE, USA, Europe) with a real-time live preview pane on the left and instant PDF export.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-700 text-xs font-semibold text-emerald-400">
                  <span>Career Suite</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition">Open CV Studio <ArrowRight className="w-4 h-4" /></span>
                </div>
              </Link>
            </div>
          </div>

          {/* SECTION 2: Core PDF Utilities */}
          <div>
            <div className="border-b border-slate-200 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-6 h-6 text-indigo-600" /> PDF Document Utilities
              </h2>
              <p className="text-sm text-slate-500">Fast, secure tools to merge, split, sign, and extract data.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Batch Processing */}
              <Link
                href="/batch-pdf"
                className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition mb-2">
                    Batch PDF Suite
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Merge, compress, or process multiple files simultaneously in an optimized queue.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-blue-600">
                  <span>Client Engine</span>
                  <span className="flex items-center gap-1">Open <ArrowRight className="w-3.5 h-3.5" /></span>
                </div>
              </Link>

              {/* Form Filler & Signer */}
              <Link
                href="/sign-pdf"
                className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition mb-2">
                    Form Filler & Signer
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Securely stamp signatures, dates, and text notes onto agreements.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-blue-600">
                  <span>Secure Sign</span>
                  <span className="flex items-center gap-1">Open <ArrowRight className="w-3.5 h-3.5" /></span>
                </div>
              </Link>

              {/* Data Extractor */}
              <Link
                href="/extract-pdf"
                className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition mb-2">
                    PDF Data Extractor
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Extract text content, metadata, and tables directly into CSV format.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-blue-600">
                  <span>Data Tool</span>
                  <span className="flex items-center gap-1">Open <ArrowRight className="w-3.5 h-3.5" /></span>
                </div>
              </Link>

              {/* Page Splitter */}
              <Link
                href="/split-pdf"
                className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 bg-amber-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition mb-2">
                    Slide & Page Splitter
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Isolate precise page ranges or presentation slides instantly.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-blue-600">
                  <span>Organize</span>
                  <span className="flex items-center gap-1">Open <ArrowRight className="w-3.5 h-3.5" /></span>
                </div>
              </Link>
            </div>
          </div>

        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} PDFEdit Enterprise Studio. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-900 transition">Privacy Architecture</Link>
            <Link href="/terms" className="hover:text-slate-900 transition">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}