"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";

export default function BatchPdfPage() {
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
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPages().map((_, i) => i));
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
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
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Batch PDF Processing Suite</h1>
      <p className="text-gray-600 mb-8">
        Upload multiple PDF documents to process them simultaneously right inside your browser with zero server uploads.
      </p>

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
    </main>
  );
}