"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";

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
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">PDF Slide & Page Splitter</h1>
      <p className="text-gray-600 mb-8">
        Extract individual slides or specific pages from large presentation decks securely in your browser.
      </p>

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-white shadow-sm mb-6">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          id="split-file-input"
        />
        <label
          htmlFor="split-file-input"
          className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Select PDF Document
        </label>
        {file && (
          <p className="mt-4 text-sm font-medium text-gray-700">
            Selected: {file.name} ({totalPages} pages total)
          </p>
        )}
      </div>

      {file && (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extract Page Number (1 to {totalPages}):
            </label>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={pageNumber}
              onChange={(e) => setPageNumber(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleSplit}
            disabled={processing}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {processing ? "Splitting..." : "Extract & Download Page"}
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