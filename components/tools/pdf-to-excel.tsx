'use client';

import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Table,
  Copy,
  Sliders,
  ShieldCheck,
  FileText,
  Sparkles,
} from 'lucide-react';
import { trackToolExecution } from '@/lib/analytics';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

interface ParsedTable {
  headers: string[];
  rows: string[][];
  pageCount: number;
}

export function PdfToExcel() {
  const [file, setFile] = useState<File | null>(null);
  const [tableData, setTableData] = useState<ParsedTable | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Extraction options
  const [extractionMode, setExtractionMode] = useState<'spatial' | 'delimiter'>('spatial');
  const [yTolerance, setYTolerance] = useState<number>(5);

  const extractTableFromPdf = async (pdfFile: File) => {
    setBusy(true);
    setProgress(10);
    setErrorMsg('');
    setSuccessMsg('');
    setStatusMsg('Loading PDF document into memory...');

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      const allExtractedRows: string[][] = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        setStatusMsg(`Analyzing page ${pageNum} of ${numPages} for tabular data...`);
        setProgress(10 + Math.round((pageNum / numPages) * 75));

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const items = textContent.items as unknown as Array<{ str?: string; transform?: number[] }>;

        if (!items || items.length === 0) continue;

        if (extractionMode === 'spatial') {
          // Group text items by approximate Y coordinate (line clustering)
          const lineBuckets: { y: number; items: { x: number; text: string }[] }[] = [];

          for (const item of items) {
            const str = item.str || '';
            if (!str.trim()) continue;

            const x = item.transform ? item.transform[4] : 0;
            const y = item.transform ? item.transform[5] : 0;

            // Find matching line bucket within tolerance
            let matchedBucket = lineBuckets.find((b) => Math.abs(b.y - y) <= yTolerance);
            if (!matchedBucket) {
              matchedBucket = { y, items: [] };
              lineBuckets.push(matchedBucket);
            }
            matchedBucket.items.push({ x, text: str });
          }

          // Sort lines from top of page to bottom (higher Y in PDF coordinates is higher on page)
          lineBuckets.sort((a, b) => b.y - a.y);

          // For each line, sort items horizontally by X
          for (const bucket of lineBuckets) {
            bucket.items.sort((a, b) => a.x - b.x);

            // Group into columns based on horizontal gaps
            const rowCells: string[] = [];
            let currentCellText = '';
            let lastX = -1;
            const columnGapThreshold = 18; // Gap in pt to treat as distinct cell

            for (const item of bucket.items) {
              if (lastX >= 0 && item.x - lastX > columnGapThreshold) {
                if (currentCellText.trim()) {
                  rowCells.push(currentCellText.trim());
                }
                currentCellText = item.text;
              } else {
                currentCellText += (currentCellText ? ' ' : '') + item.text;
              }
              lastX = item.x;
            }
            if (currentCellText.trim()) {
              rowCells.push(currentCellText.trim());
            }

            if (rowCells.length > 0) {
              allExtractedRows.push(rowCells);
            }
          }
        } else {
          // Delimiter mode: split line items by common separators
          const textLines: string[] = [];
          let currentLine = '';
          let lastY = -1;

          for (const item of items) {
            const str = item.str || '';
            const y = item.transform ? Math.round(item.transform[5]) : 0;

            if (lastY >= 0 && Math.abs(lastY - y) > yTolerance) {
              if (currentLine.trim()) textLines.push(currentLine.trim());
              currentLine = str;
            } else {
              currentLine += (currentLine ? ' ' : '') + str;
            }
            lastY = y;
          }
          if (currentLine.trim()) textLines.push(currentLine.trim());

          for (const line of textLines) {
            const delimiter = line.includes('\t') ? '\t' : line.includes(';') ? ';' : ',';
            const cells = line.split(delimiter).map((c) => c.trim());
            if (cells.some((c) => c.length > 0)) {
              allExtractedRows.push(cells);
            }
          }
        }
      }

      if (allExtractedRows.length === 0) {
        throw new Error(
          'No readable text tables found in this PDF. If the PDF contains scanned images, please run OCR PDF first.'
        );
      }

      // Normalize row column counts
      const maxColumns = Math.max(...allExtractedRows.map((r) => r.length));
      const normalizedRows = allExtractedRows.map((r) => {
        const padded = [...r];
        while (padded.length < maxColumns) padded.push('');
        return padded;
      });

      const headers = normalizedRows[0].map((h, i) => h || `Column ${i + 1}`);
      const rows = normalizedRows.slice(1);

      const tableResult: ParsedTable = {
        headers,
        rows,
        pageCount: numPages,
      };

      setTableData(tableResult);
      setProgress(100);
      setSuccessMsg(
        `Extracted ${normalizedRows.length} rows across ${maxColumns} columns from ${numPages} page(s).`
      );
      trackToolExecution('pdf-to-excel', true);
    } catch (err: unknown) {
      console.error('PDF to Excel extraction error:', err);
      setErrorMsg((err instanceof Error && err.message) || 'Failed to extract tabular data from PDF.');
      setTableData(null);
      trackToolExecution('pdf-to-excel', false);
    } finally {
      setBusy(false);
      setStatusMsg('');
    }
  };

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    extractTableFromPdf(selectedFile);
  };

  const formatCsv = (delimiter: string = ','): string => {
    if (!tableData) return '';
    const all = [tableData.headers, ...tableData.rows];
    return all
      .map((row) =>
        row
          .map((cell) => {
            const str = String(cell || '');
            if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(delimiter)
      )
      .join('\r\n');
  };

  const downloadCsv = () => {
    const csvContent = formatCsv(',');
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const name = (file?.name || 'document').replace(/\.[^/.]+$/, '') + '-extracted.csv';
    saveAs(blob, name);
    setSuccessMsg(`Downloaded "${name}"!`);
  };

  const downloadTsv = () => {
    const tsvContent = formatCsv('\t');
    const blob = new Blob(['﻿' + tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const name = (file?.name || 'document').replace(/\.[^/.]+$/, '') + '-extracted.tsv';
    saveAs(blob, name);
    setSuccessMsg(`Downloaded "${name}"!`);
  };

  const copyToClipboard = async () => {
    const tsvContent = formatCsv('\t');
    await navigator.clipboard.writeText(tsvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!tableData ? (
 <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[var(--pe-accent)] rounded-3xl p-10 bg-white dark:bg-gray-900 text-center transition">
 <div className="w-16 h-16 rounded-2xl bg-[var(--pe-accent-soft)] text-[var(--pe-accent)] flex items-center justify-center mx-auto mb-4 border border-[var(--pe-border)] ">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Extract Tables from PDF to Excel / CSV
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            Extract structured tabular data, invoices, statements, and spreadsheets from PDF documents directly into Excel-compatible CSV and TSV formats.
          </p>

 <label className="px-6 py-3 bg-[var(--pe-accent)] hover:bg-[var(--pe-accent-hover)] text-[var(--pe-accent-ink)] rounded-xl font-semibold text-sm shadow-md cursor-pointer transition inline-flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span>Select PDF Document</span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileChange(f);
              }}
              className="hidden"
            />
          </label>

          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-gray-400">
 <span className="flex items-center gap-1 text-[var(--pe-accent)] ">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% In-Browser Extraction
            </span>
            <span>•</span>
            <span>Zero Server Uploads</span>
            <span>•</span>
            <span>Outputs RFC 4180 CSV / TSV</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status Messages */}
          {(statusMsg || errorMsg || successMsg) && (
            <div
              className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
                errorMsg
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                  : successMsg
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {busy && <RefreshCw className="w-4 h-4 animate-spin" />}
                {errorMsg && <AlertCircle className="w-4 h-4" />}
                {successMsg && <CheckCircle2 className="w-4 h-4" />}
                <span>{statusMsg || errorMsg || successMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none"
              >
                ×
              </button>
            </div>
          )}

          {/* Action Bar & Controls */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
 <Table className="w-4 h-4 text-[var(--pe-accent)] " />
                Extracted Data Table ({tableData.rows.length} rows, {tableData.headers.length} columns)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Source: {file?.name} • {tableData.pageCount} page(s)
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={copyToClipboard}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 border border-gray-200 dark:border-gray-700"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>

              <button
                type="button"
                onClick={downloadTsv}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 border border-gray-200 dark:border-gray-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download TSV</span>
              </button>

              <button
                type="button"
                onClick={downloadCsv}
 className="px-5 py-2 bg-[var(--pe-accent)] hover:bg-[var(--pe-accent-hover)] text-[var(--pe-accent-ink)] font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Excel CSV</span>
              </button>

              <label className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer ml-2">
                New PDF
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileChange(f);
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Table Preview Component */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[500px] border border-gray-200 dark:border-gray-800 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                    <th className="p-2.5 font-bold text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 w-10 text-center">
                      #
                    </th>
                    {tableData.headers.map((h, i) => (
                      <th
                        key={i}
 className="p-2.5 font-bold text-gray-900 dark:text-[var(--pe-accent-ink)] border-r border-gray-200 dark:border-gray-700 last:border-r-0 whitespace-nowrap bg-[var(--pe-accent-soft)] "
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-mono">
                  {tableData.rows.slice(0, 50).map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={
                        rIdx % 2 === 0
                          ? 'bg-white dark:bg-gray-900'
                          : 'bg-gray-50/50 dark:bg-gray-800/30'
                      }
                    >
                      <td className="p-2 text-center text-gray-400 border-r border-gray-100 dark:border-gray-800">
                        {rIdx + 1}
                      </td>
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className="p-2 text-gray-700 dark:text-gray-300 border-r border-gray-100 dark:border-gray-800 last:border-r-0 whitespace-nowrap"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {tableData.rows.length > 50 && (
              <p className="text-xs text-gray-400 text-center mt-3">
                Showing top 50 rows of {tableData.rows.length} total rows in preview. All records will be included in the exported CSV.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
