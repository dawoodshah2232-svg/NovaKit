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
  CheckCircle2
} from "lucide-react";

const pdfTools = [
  {
    title: "Master PDF Studio",
    description: "All-in-one corporate workspace to edit text, apply signatures, stamp documents, and export seamlessly.",
    href: "/studio",
    icon: Sparkles,
    badge: "Flagship",
    color: "bg-blue-600",
  },
  {
    title: "Batch PDF Suite",
    description: "Merge, compress, or convert multiple documents simultaneously in an optimized client queue.",
    href: "/batch-pdf",
    icon: Layers,
    badge: "Popular",
    color: "bg-indigo-600",
  },
  {
    title: "Form Filler & Signer",
    description: "Securely stamp signatures, dates, and text notes onto agreements and forms.",
    href: "/sign-pdf",
    icon: FileText,
    badge: "Secure",
    color: "bg-emerald-600",
  },
  {
    title: "PDF Data Extractor",
    description: "Extract text content, metadata, and tables directly into structured CSV format.",
    href: "/extract-pdf",
    icon: Database,
    badge: "Utility",
    color: "bg-purple-600",
  },
  {
    title: "Slide & Page Splitter",
    description: "Isolate precise page ranges or presentation slides from large PDF volumes instantly.",
    href: "/split-pdf",
    icon: Scissors,
    badge: "Precise",
    color: "bg-amber-600",
  },
];

export default function CorporateHomePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = pdfTools.filter(tool => 
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      <div>
        {/* Corporate Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-18 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-blue-500/30">
                PDF
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900">PDFEdit</span>
                <span className="text-xs uppercase font-semibold text-blue-600 block tracking-widest">Enterprise Studio</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/studio" 
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
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
              Professional PDF Document Suite. <span className="text-blue-600">Built for Privacy.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              An enterprise-grade toolkit to manage, edit, sign, and transform your documents locally with absolute data confidentiality.
            </p>

            {/* Search Input */}
            <div className="relative max-w-xl mx-auto">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g., merge, signature, splitter)..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition shadow-sm"
              />
            </div>
          </div>
        </section>

        {/* Main Content Sections */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">PDF Document Solutions</h2>
              <p className="text-sm text-slate-500">Select a specialized workspace tool below</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Ready for Production</span>
            </div>
          </div>

          {/* 3-Column Corporate Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={index}
                  href={tool.href}
                  className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-500 hover:shadow-lg hover:shadow-slate-100 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className={`${tool.color} text-white p-3 rounded-xl shadow-sm group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        {tool.badge}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition mb-2">
                      {tool.title}
                    </h3>
                    
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Client Engine
                    </span>
                    <span className="flex items-center gap-1">
                      Access Workspace <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

        </main>
      </div>

      {/* Corporate Footer */}
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