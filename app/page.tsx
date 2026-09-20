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
  Search,
  Sparkles,
  Briefcase,
  Lock,
  Unlock,
  RotateCw,
  FileSpreadsheet,
  Image as ImageIcon,
  QrCode,
  Calculator,
  FileCode,
  KeyRound,
  FileEdit
} from "lucide-react";

const toolCategories = [
  {
    categoryName: "Organize & Structure PDFs",
    description: "Merge, split, rotate, and reorder document pages effortlessly.",
    tools: [
      { title: "Batch PDF Suite", description: "Merge, compress, or process multiple files in queue.", href: "/batch-pdf", icon: Layers, color: "bg-blue-600" },
      { title: "Slide & Page Splitter", description: "Extract individual presentation slides or page ranges.", href: "/split-pdf", icon: Scissors, color: "bg-amber-600" },
      { title: "Rotate PDF Pages", description: "Rotate portrait or landscape documents instantly.", href: "/studio", icon: RotateCw, color: "bg-indigo-600" },
    ]
  },
  {
    categoryName: "Edit, Sign & Secure",
    description: "Add digital signatures, fill forms, and protect confidential files.",
    tools: [
      { title: "PDF Editor & Creator", description: "Full Word-style editor for text, stamps, and signatures.", href: "/studio", icon: FileEdit, color: "bg-blue-700" },
      { title: "Form Filler & Signer", description: "Stamp signatures, dates, and text notes securely.", href: "/sign-pdf", icon: FileText, color: "bg-emerald-600" },
      { title: "Protect PDF (Encrypt)", description: "Secure sensitive documents with strong passwords.", href: "/studio", icon: Lock, color: "bg-rose-600" },
      { title: "PDF Password Remover", description: "Remove access restrictions from authorized files.", href: "/studio", icon: Unlock, color: "bg-teal-600" },
    ]
  },
  {
    categoryName: "Conversion & Data Extraction",
    description: "Convert images to PDF, extract tables, and parse metadata.",
    tools: [
      { title: "PDF Data Extractor", description: "Extract text and tables directly into CSV format.", href: "/extract-pdf", icon: Database, color: "bg-purple-600" },
      { title: "Image to PDF Converter", description: "Transform JPG, PNG images into clean PDF documents.", href: "/studio", icon: ImageIcon, color: "bg-cyan-600" },
      { title: "PDF to Images", description: "Extract high-resolution image files from any PDF.", href: "/studio", icon: FileSpreadsheet, color: "bg-orange-600" },
    ]
  },
  {
    categoryName: "Business & Productivity Utilities",
    description: "Generate invoices, QR codes, calculate taxes, and analyze text.",
    tools: [
      { title: "QR Code Generator", description: "Create scannable custom QR codes for URLs and Wi-Fi.", href: "/studio", icon: QrCode, color: "bg-violet-600" },
      { title: "Invoice Generator", description: "Create professional business invoices and export to PDF.", href: "/studio", icon: FileCode, color: "bg-emerald-700" },
      { title: "Tax Calculator", description: "Calculate regional corporate and service taxes instantly.", href: "/studio", icon: Calculator, color: "bg-blue-500" },
      { title: "Secure Password Generator", description: "Generate robust cryptographic credentials.", href: "/studio", icon: KeyRound, color: "bg-slate-700" },
    ]
  }
];

export default function MasterCorporateHomepage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      <div>
        {/* Navigation Bar with New SVG Logo */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-xs">
          <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <img 
                  src="/pdfedit-light.svg" 
                  alt="PDFEdit Enterprise Studio" 
                  className="h-10 w-auto object-contain" 
                />
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/cv-builder" 
                className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" /> AI CV Builder (Free)
              </Link>
              <Link 
                href="/studio" 
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
              >
                <FileEdit className="w-4 h-4" /> PDF Editor & Creator
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
              Fast, secure, and professional browser utilities. All your document tools organized cleanly by category.
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
                placeholder="Search across all tools (e.g., merge, sign, invoice, CV)..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition shadow-2xs"
              />
            </div>
          </div>
        </section>

        {/* CATEGORIZED TOOLS SECTIONS */}
        <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
          
          {toolCategories.map((cat, idx) => (
            <div key={idx}>
              <div className="border-b border-slate-200 pb-3 mb-6">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{cat.categoryName}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {cat.tools.map((tool, tIdx) => {
                  const Icon = tool.icon;
                  if (searchQuery && !tool.title.toLowerCase().includes(searchQuery.toLowerCase()) && !tool.description.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return null;
                  }

                  return (
                    <Link
                      key={tIdx}
                      href={tool.href}
                      className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`${tool.color} text-white p-2.5 rounded-xl shadow-2xs group-hover:scale-105 transition`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 group-hover:text-blue-600 transition">
                            Utility
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition mb-1">
                          {tool.title}
                        </h3>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400 group-hover:text-blue-600">
                        <span>Ready</span>
                        <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition">Open <ArrowRight className="w-3 h-3" /></span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* AI CV BUILDER BANNER SECTION */}
          <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-emerald-800/40 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>
            
            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" /> AI Career & Resume Studio
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                AI CV Builder (Free) with Live Split-Screen Preview.
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Generate region-compliant resumes (UAE, USA, Europe) instantly. Watch your resume format live on the left as you type on the right.
              </p>
              <Link
                href="/cv-builder"
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-500 transition shadow-md"
              >
                Launch AI CV Builder <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center sm:text-left">
              <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">Key Features</div>
              <ul className="text-xs text-slate-200 space-y-2">
                <li className="flex items-center gap-2">✓ UAE / GCC & International Templates</li>
                <li className="flex items-center gap-2">✓ Live Side-by-Side PDF Rendering</li>
                <li className="flex items-center gap-2">✓ 100% Free & Secure Local Export</li>
              </ul>
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