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
  Lock,
  Unlock,
  RotateCw,
  FileSpreadsheet,
  Image as ImageIcon,
  QrCode,
  Calculator,
  FileCode,
  KeyRound,
  FileEdit,
  Cpu,
  Moon
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
        {/* Single Unified Top Header Line */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center gap-4">
            
            {/* Left Group: Logo, Brand Name, Badge & Subtitle */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                  PDF
                </div>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold tracking-tight text-slate-900">
                    PDFEdit <span className="text-blue-600">Studio</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-full uppercase tracking-wider">
                    STUDIO SUITE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">100% Client-Side Private PDF Suite</p>
              </div>
            </div>

            {/* Middle Group: Navigation Links */}
            <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
              <a href="#tools" className="hover:text-blue-600 transition flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" /> PDF Suite
              </a>
              <Link href="/privacy" className="hover:text-blue-600 transition flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-600" /> Capabilities
              </Link>
              <Link href="/privacy" className="hover:text-blue-600 transition flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Zero-Upload Architecture
              </Link>
            </div>

            {/* Right Group: Action Buttons & Theme Toggle */}
            <div className="flex items-center gap-3 shrink-0">
              <Link 
                href="/cv-builder" 
                className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-emerald-100 transition shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI CV Builder (Free)
              </Link>
              <Link 
                href="/studio" 
                className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-xs flex items-center gap-1.5"
              >
                <FileEdit className="w-4 h-4" /> PDF Editor & Creator
              </Link>
              <button 
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition shadow-2xs"
                title="Toggle Theme"
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>

          </div>
        </header>

        {/* Hero & Search Section */}
        <section className="bg-white border-b border-slate-200 py-12 px-6 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto relative z-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Every tool you need to work with PDFs <span className="text-blue-600">in one place.</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Fast, secure, and professional browser utilities organized cleanly by category.
            </p>

            <div className="relative max-w-lg mx-auto">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across all tools (e.g., merge, sign, invoice, CV)..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition shadow-2xs"
              />
            </div>
          </div>
        </section>

        {/* CATEGORIZED TOOLS SECTIONS */}
        <main id="tools" className="max-w-7xl mx-auto px-6 py-10 space-y-12">
          {toolCategories.map((cat, idx) => (
            <div key={idx}>
              <div className="border-b border-slate-200 pb-2 mb-5">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">{cat.categoryName}</h2>
                <p className="text-[11px] text-slate-500">{cat.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cat.tools.map((tool, tIdx) => {
                  const Icon = tool.icon;
                  if (searchQuery && !tool.title.toLowerCase().includes(searchQuery.toLowerCase()) && !tool.description.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return null;
                  }

                  return (
                    <Link
                      key={tIdx}
                      href={tool.href}
                      className="group bg-white rounded-2xl p-4 border border-slate-200 hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <div className={`${tool.color} text-white p-2 rounded-xl shadow-2xs group-hover:scale-105 transition`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 group-hover:text-blue-600 transition">
                            Utility
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition mb-1">
                          {tool.title}
                        </h3>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-400 group-hover:text-blue-600">
                        <span>Ready</span>
                        <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition">Open <ArrowRight className="w-3 h-3" /></span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
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