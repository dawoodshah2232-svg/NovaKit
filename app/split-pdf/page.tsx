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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <span className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-700 rounded-full flex items-center gap-1">
              <Scissors className="w-3.5 h-3.5" /> Splitter Tool
            </span>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-3">PDF Slide & Page Splitter</h1>
          <p className="text-slate-600 mb-8">
            Extract individual presentation slides or specific pages from large documents securely in your browser.
          </p>

          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-white shadow-sm mb-6">
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
              <p className="mt-4 text-sm font-medium text-slate-700">
                Selected: {file.name} ({totalPages} pages total)
              </p>
            )}
          </div>

          {file && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Extract Page Number (1 to {totalPages}):
                </label>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={pageNumber}
                  onChange={(e) => setPageNumber(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <button
                onClick={handleSplit}
                disabled={processing}
                className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" /> {processing ? "Splitting..." : "Extract & Download Page"}
              </button>
            </div>
          )}

          {statusText && (
            <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-center font-medium border border-blue-100">
              {statusText}
            </div>
          )}
        </main>
      </div>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p className="flex items-center justify-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Client-Side Processing • Zero Server Uploads
        </p>
      </footer>
    </div>
  );
}