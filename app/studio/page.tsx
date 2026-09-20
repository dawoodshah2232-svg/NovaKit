"use client";

import Link from "next/link";
import { 
  Layers, 
  FileText, 
  Scissors, 
  Database, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Lock 
} from "lucide-react";

const tools = [
  {
    title: "Batch PDF Processor",
    description: "Merge, compress, or process multiple PDF documents simultaneously in a single queue.",
    href: "/batch-pdf",
    icon: Layers,
    color: "bg-blue-500",
  },
  {
    title: "Form Filler & Signer",
    description: "Add text, stamps, and digital signatures onto your PDF files securely in your browser.",
    href: "/sign-pdf",
    icon: FileText,
    color: "bg-green-500",
  },
  {
    title: "PDF Data Extractor",
    description: "Extract text, metadata, and tables straight into CSV format instantly.",
    href: "/extract-pdf",
    icon: Database,
    color: "bg-purple-500",
  },
  {
    title: "Slide & Page Splitter",
    description: "Extract individual presentation slides or specific page ranges from large documents.",
    href: "/split-pdf",
    icon: Scissors,
    color: "bg-orange-500",
  },
];

export default function MasterStudioPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Banner / Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-blue-600 text-white p-2 rounded-lg">
                <Layers className="w-6 h-6" />
              </span>
              PDFEdit Master Studio
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Your all-in-one, 100% client-side secure PDF utility toolkit.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
            <span className="flex items-center gap-1 text-green-600">
              <ShieldCheck className="w-4 h-4" /> 100% Private
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-blue-600">
              <Zap className="w-4 h-4" /> Client-Side Processing
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900">Select a Tool to Begin</h2>
          <p className="text-gray-600 text-sm">Choose any utility below to launch its dedicated workspace.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool, index) => {
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
                    <span className="text-gray-400 group-hover:text-blue-600 transition flex items-center gap-1 text-sm font-medium">
                      Launch Tool <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition mb-2">
                    {tool.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {tool.description}
                  </p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> No server upload required
                  </span>
                  <span className="font-semibold text-blue-600">Ready</span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}