"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import Link from "next/link";
import { ArrowLeft, Scissors, ShieldCheck, Download, Zap } from "lucide-react";

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [processing, setProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setTotalPages(pdfDoc.getPageCount());
      } catch (err) {
        console.error("Error reading PDF pages:", err);
      }
    }
  };

  const handleSplit = async () => {
    if (!file) return;
    setProcessing(true);
    setStatusText("Splitting PDF locally...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      if (pageNumber < 1 || pageNumber > totalPages) {
        alert(`Please enter a valid page number between 1 and ${totalPages}`);
        setProcessing(false);
        return;
      }

      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNumber - 1]);
      newPdf.addPage(copiedPage);

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name.replace(".pdf", "")}-page-${pageNumber}.pdf`;
      link.click();
      setStatusText(`Successfully extracted page ${pageNumber}!`);
    } catch (err) {
      console.error(err);
      setStatusText("Error splitting PDF document.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      <div>
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <span className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-700 rounded-full flex items-center gap-1">
              <Scissors className="w-3.5 h-3.5" /> Splitter Tool
            </span>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-3">PDF Slide & Page Splitter</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Extract individual presentation slides or specific pages from large documents securely in your browser.
          </p>

          <section className="mb-8 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/40 p-5">
            <h2 className="text-lg font-bold">What this tool does</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">Upload a PDF, choose one page number, and download that page as a new PDF. Processing happens locally in your browser.</p>
          </section>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center bg-white dark:bg-slate-900 shadow-sm mb-6">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="split-file-input"
            />
            <label
              htmlFor="split-file-input"
              className="cursor-pointer bg-blue-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition inline-block shadow-sm"
            >
              Select PDF Document
            </label>
            {file && (
              <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                Selected: {file.name} ({totalPages} pages total)
              </p>
            )}
          </div>

          {file && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Extract Page Number (1 to {totalPages}):
                </label>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={pageNumber}
                  onChange={(e) => setPageNumber(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <button
                onClick={handleSplit}
                disabled={processing}
 className="w-full bg-[var(--pe-accent)] text-[var(--pe-accent-ink)] py-3.5 rounded-xl font-semibold hover:bg-[var(--pe-accent-hover)] transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" /> {processing ? "Splitting..." : "Extract & Download Page"}
              </button>
            </div>
          )}

          {statusText && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 rounded-xl text-center font-medium border border-blue-100 dark:border-blue-900/40">
              {statusText}
            </div>
          )}

          <section className="mt-10 space-y-6 text-slate-700 dark:text-slate-300">
            <div><h2 className="text-xl font-bold text-slate-900 dark:text-white">How to use Split PDF</h2><p className="mt-2 text-sm leading-6">Select a PDF, enter the page number to extract, then choose Extract &amp; Download Page. The output contains the selected page only.</p></div>
            <div><h2 className="text-xl font-bold text-slate-900 dark:text-white">Why use this tool?</h2><p className="mt-2 text-sm leading-6">It is useful when you need one page from a presentation, report, application, or scanned document without editing the original file.</p></div>
            <div><h2 className="text-xl font-bold text-slate-900 dark:text-white">Privacy and limitations</h2><p className="mt-2 text-sm leading-6">The PDF stays in browser memory. This version extracts one page at a time and requires a readable, non-password-protected PDF.</p></div>
            <div><h2 className="text-xl font-bold text-slate-900 dark:text-white">Frequently asked questions</h2><div className="mt-3 space-y-3 text-sm"><p><strong>Does it upload my PDF?</strong> No. The file is processed on your device.</p><p><strong>Can I extract several pages?</strong> Use the tool once per page; multi-range extraction is not currently provided here.</p><p><strong>What file type is downloaded?</strong> The selected page is saved as a PDF.</p><p><strong>Can I use a protected PDF?</strong> Password-protected or unreadable files may not open in the browser.</p></div></div>
            <nav aria-label="Related PDF tools"><h2 className="text-xl font-bold text-slate-900 dark:text-white">Related PDF tools</h2><div className="mt-3 flex flex-wrap gap-2"><Link href="/organize-pdf" className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-blue-700 dark:text-blue-400">Organize PDF</Link><Link href="/merge-pdf" className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-blue-700 dark:text-blue-400">Merge PDF</Link><Link href="/compress-pdf" className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-blue-700 dark:text-blue-400">Compress PDF</Link></div></nav>
          </section>
        </main>
      </div>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p className="flex items-center justify-center gap-1">
 <ShieldCheck className="w-4 h-4 text-[var(--pe-accent)]" /> 100% Client-Side Processing • Zero Server Uploads
        </p>
      </footer>
    </div>
  );
}