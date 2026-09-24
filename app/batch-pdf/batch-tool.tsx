"use client";

import { useState } from "react";
import Link from "next/link";

// pdf-lib is lazy-loaded inside the handler below so this route's initial
// JS stays light — the library only downloads when the user clicks merge.
async function loadPdfLib() {
  return import("pdf-lib");
}

export default function BatchTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleBatchMerge = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setStatusText("Merging PDFs locally...");

    try {
      const { PDFDocument } = await loadPdfLib();
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPages().map((_, i) => i));
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      // Explicitly casting as any to bypass strict TS BlobPart union check across environments
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = "batch-merged.pdf";
      link.click();
      setStatusText("Batch merge completed successfully!");
    } catch (err) {
      console.error(err);
      setStatusText("Error processing batch files.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <li><Link href="/" className="hover:text-slate-900 dark:hover:text-white">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-slate-900 dark:text-white">Batch PDF Processing</li>
        </ol>
      </nav>
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Merge many PDFs at once — right in your browser</h1>
      <p className="text-gray-600 mb-8">
        Upload multiple PDF documents to process them simultaneously right inside your browser with zero server uploads.
      </p>

      <section className="mb-8 rounded-xl border border-blue-100 bg-blue-50 p-5">
        <h2 className="text-lg font-bold text-gray-900">Many files in, one PDF out — in a single session</h2>
        <p className="mt-2 text-sm leading-6 text-gray-700">Select multiple PDF files and combine them into one downloaded PDF. Files are read and merged locally in your browser.</p>
      </section>

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-white shadow-sm mb-6">
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          id="batch-file-input"
        />
        <label
          htmlFor="batch-file-input"
          className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Select Multiple PDFs
        </label>
        {files.length > 0 && (
          <p className="mt-4 text-sm font-medium text-gray-700">
            {files.length} file(s) selected
          </p>
        )}
      </div>

      {files.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-3">Selected Files:</h2>
          <ul className="divide-y divide-gray-100 max-h-48 overflow-y-auto mb-6">
            {files.map((file, idx) => (
              <li key={idx} className="py-2 text-sm text-gray-600 flex justify-between">
                <span>{file.name}</span>
                <span className="text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleBatchMerge}
            disabled={processing}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {processing ? "Processing..." : "Merge All into One PDF"}
          </button>
        </div>
      )}

      {statusText && (
        <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-center font-medium">
          {statusText}
        </div>
      )}

      <section className="mt-10 space-y-6 text-gray-700">
        <div><h2 className="text-xl font-bold text-gray-900">How to use Batch PDF</h2><p className="mt-2 text-sm leading-6">Choose multiple PDF files, confirm the selected list, and select Merge All into One PDF. The files are processed in their displayed selection order.</p></div>
        <div><h2 className="text-xl font-bold text-gray-900">Combine packets, invoices, and reports in one go</h2><p className="mt-2 text-sm leading-6">Batch processing is useful for combining document packets, reports, invoices, or other PDF groups in one browser session.</p></div>
        <div><h2 className="text-xl font-bold text-gray-900">Nothing is uploaded — your device&rsquo;s memory is the only limit</h2><p className="mt-2 text-sm leading-6">Selected files are not uploaded by this page. The browser must have enough memory for the source files and this simple batch page does not provide visual page reordering.</p></div>
        <div><h2 className="text-xl font-bold text-gray-900">Frequently asked questions</h2><div className="mt-3 space-y-3 text-sm"><p><strong>Are files sent to a server?</strong> No. The merge runs in browser memory.</p><p><strong>How many files can I select?</strong> The practical limit depends on available device memory.</p><p><strong>Are pages rasterized?</strong> PDF pages are copied with pdf-lib rather than converted to images.</p><p><strong>Can I reorder files?</strong> This batch page uses selection order; use Merge PDF for drag-and-drop ordering.</p></div></div>
        <nav aria-label="Related PDF tools"><h2 className="text-xl font-bold text-gray-900">Related PDF tools</h2><div className="mt-3 flex flex-wrap gap-2"><Link href="/merge-pdf" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700">Merge PDF</Link><Link href="/compress-pdf" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700">Compress PDF</Link><Link href="/split-pdf" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700">Split PDF</Link></div></nav>
      </section>
    </div>
  );
}
