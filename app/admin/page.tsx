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
  Search 
} from "lucide-react";

const allTools = [
  {
    title: "Master Studio Hub",
    description: "Access the all-in-one unified workspace for all advanced PDF editing and signing tools.",
    href: "/studio",
    icon: Layers,
    category: "Featured",
    color: "bg-blue-600",
  },
  {
    title: "Batch PDF Processing Suite",
    description: "Merge, compress, or process multiple PDF documents simultaneously in a single queue.",
    href: "/batch-pdf",
    icon: Layers,
    category: "Batch",
    color: "bg-blue-500",
  },
  {
    title: "Form Filler & Signer",
    description: "Add text, stamps, and digital signatures onto your PDF files securely in your browser.",
    href: "/sign-pdf",
    icon: FileText,
    category: "Edit",
    color: "bg-green-500",
  },
  {
    title: "PDF Data Extractor",
    description: "Extract text, metadata, and tables straight into CSV format instantly.",
    href: "/extract-pdf",
    icon: Database,
    category: "Extract",
    color: "bg-purple-500",
  },
  {
    title: "Slide & Page Splitter",
    description: "Extract individual presentation slides or specific page ranges from large documents.",
    href: "/split-pdf",
    icon: Scissors,
    category: "Organize",
    color: "bg-orange-500",
  },
];

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTools = allTools.filter(tool => 
    tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white p-2 rounded-xl font-bold">PDF</span>
              <span className="text-xl font-extrabold text-gray-900">PDFEdit Studio</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/studio" className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 transition">
                Launch Studio
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 text-center border-b border-gray-100">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Professional PDF Tools. <span className="text-blue-600">100% Free & In-Browser.</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Complete suite of lightning-fast client-side utilities to merge, sign, extract, and split documents without server uploads.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for tools (e.g., batch, sign, extract, split)..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">All PDF Utilities</h2>
            <span className="text-sm text-gray-500">{filteredTools.length} tool(s) available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={index}
                  href={tool.href}
                  className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${tool.color} text-white p-3 rounded-xl`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {tool.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition mb-2">
                      {tool.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {tool.description}
                    </p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <ShieldCheck className="w-4 h-4" /> Secure Client-Side
                    </span>
                    <span className="text-blue-600 font-semibold group-hover:translate-x-1 transition flex items-center gap-1">
                      Open <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} PDFEdit Studio. All processing happens locally on your device.</p>
      </footer>
    </div>
  );
}