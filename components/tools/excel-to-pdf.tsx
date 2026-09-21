'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Table,
  Sliders,
  Sparkles,
  ShieldCheck,
  FileText,
  Palette,
} from 'lucide-react';
import { trackToolExecution } from '@/lib/analytics';

interface SheetData {
  headers: string[];
  rows: string[][];
  fileName: string;
}

export function ExcelToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Styling Options
  const [docTitle, setDocTitle] = useState('Spreadsheet Report');
  const [orientation, setOrientation] = useState<'p' | 'l'>('l');
  const [themeColor, setThemeColor] = useState<'blue' | 'emerald' | 'indigo' | 'slate' | 'rose'>('blue');
  const [showGridlines, setShowGridlines] = useState(true);
  const [showStripes, setShowStripes] = useState(true);
  const [fontSize, setFontSize] = useState<number>(10);

  // Parse CSV / TSV text
  const parseCsvText = (text: string, fileName: string): SheetData => {
    const lines = text.split(/\r\n|\n/).filter((line) => line.trim().length > 0);
    if (lines.length === 0) {
      throw new Error('The spreadsheet file appears to be empty.');
    }

    // Determine delimiter (comma, semicolon, or tab)
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let insideQuote = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (insideQuote && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            insideQuote = !insideQuote;
          }
        } else if (char === delimiter && !insideQuote) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const parsedRows = lines.map(parseLine);
    const headers = parsedRows[0] || [];
    const rows = parsedRows.slice(1);

    return { headers, rows, fileName };
  };

  // Parse XLSX via JSZip XML extraction
  const parseXlsxBuffer = async (buffer: ArrayBuffer, fileName: string): Promise<SheetData> => {
    const zip = await JSZip.loadAsync(buffer);

    // 1. Parse Shared Strings
    const sharedStrings: string[] = [];
    const sharedStringsFile = zip.file('xl/sharedStrings.xml');
    if (sharedStringsFile) {
      const xmlStr = await sharedStringsFile.async('text');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlStr, 'application/xml');
      const stringNodes = xmlDoc.getElementsByTagName('si');
      for (let i = 0; i < stringNodes.length; i++) {
        const tNodes = stringNodes[i].getElementsByTagName('t');
        let str = '';
        for (let j = 0; j < tNodes.length; j++) {
          str += tNodes[j].textContent || '';
        }
        sharedStrings.push(str);
      }
    }

    // 2. Parse First Sheet
    const sheetFile = zip.file('xl/worksheets/sheet1.xml') || zip.file(/xl\/worksheets\/sheet.*\.xml/i)[0];
    if (!sheetFile) {
      throw new Error('Could not find any worksheet data in the Excel file.');
    }

    const sheetXmlStr = await sheetFile.async('text');
    const parser = new DOMParser();
    const sheetDoc = parser.parseFromString(sheetXmlStr, 'application/xml');
    const rowNodes = sheetDoc.getElementsByTagName('row');

    if (rowNodes.length === 0) {
      throw new Error('The worksheet contains no rows.');
    }

    const allRows: string[][] = [];

    for (let i = 0; i < rowNodes.length; i++) {
      const rowNode = rowNodes[i];
      const cellNodes = rowNode.getElementsByTagName('c');
      const rowData: string[] = [];

      for (let j = 0; j < cellNodes.length; j++) {
        const cell = cellNodes[j];
        const cellType = cell.getAttribute('t');
        const vNode = cell.getElementsByTagName('v')[0];
        let val = vNode?.textContent || '';

        if (cellType === 's') {
          // Shared string reference index
          const sIdx = parseInt(val, 10);
          val = !isNaN(sIdx) && sharedStrings[sIdx] !== undefined ? sharedStrings[sIdx] : val;
        } else if (cellType === 'inlineStr') {
          const tNode = cell.getElementsByTagName('t')[0];
          val = tNode?.textContent || '';
        }

        rowData.push(val);
      }

      if (rowData.some((cell) => cell.trim().length > 0)) {
        allRows.push(rowData);
      }
    }

    if (allRows.length === 0) {
      throw new Error('No readable tabular data found in Excel sheet.');
    }

    // Normalize column counts across all rows
    const maxCols = Math.max(...allRows.map((r) => r.length));
    const normalizedRows = allRows.map((r) => {
      const padded = [...r];
      while (padded.length < maxCols) padded.push('');
      return padded;
    });

    const headers = normalizedRows[0].map((h, idx) => h || `Col ${idx + 1}`);
    const rows = normalizedRows.slice(1);

    return { headers, rows, fileName };
  };

  const handleFile = async (selectedFile: File) => {
    setBusy(true);
    setErrorMsg('');
    setSuccessMsg('');
    setStatusMsg('Reading and parsing spreadsheet data...');

    try {
      setFile(selectedFile);
      setDocTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));

      let data: SheetData;
      const lowerName = selectedFile.name.toLowerCase();

      if (lowerName.endsWith('.csv') || lowerName.endsWith('.tsv') || lowerName.endsWith('.txt')) {
        const text = await selectedFile.text();
        data = parseCsvText(text, selectedFile.name);
      } else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
        const buffer = await selectedFile.arrayBuffer();
        data = await parseXlsxBuffer(buffer, selectedFile.name);
      } else {
        throw new Error('Please upload an Excel (.xlsx, .xls) or CSV (.csv, .tsv) file.');
      }

      setSheetData(data);
      setSuccessMsg(`Parsed ${data.rows.length + 1} rows and ${data.headers.length} columns.`);
      trackToolExecution('excel_to_pdf', 'parse_file', data.rows.length);
    } catch (err: any) {
      console.error('Error parsing spreadsheet:', err);
      setErrorMsg(err.message || 'Failed to read spreadsheet file. Please check file format.');
      setSheetData(null);
    } finally {
      setBusy(false);
      setStatusMsg('');
    }
  };

  const loadSampleSheet = () => {
    const sampleCsv = `Quarter,Product Line,Region,Units Sold,Revenue ($),Growth Rate,Status
Q1 2026,Enterprise Cloud,North America,12450,"$1,245,000",+18.4%,Active
Q1 2026,Security Suite,Europe & UK,8920,"$892,000",+12.1%,Active
Q1 2026,AI Workspace,Asia Pacific,15600,"$1,560,000",+34.8%,Active
Q2 2026,Enterprise Cloud,North America,14200,"$1,420,000",+14.1%,Active
Q2 2026,Security Suite,Europe & UK,9800,"$980,000",+9.8%,Active
Q2 2026,AI Workspace,Asia Pacific,19300,"$1,930,000",+23.7%,Active
Q3 2026,Enterprise Cloud,North America,16800,"$1,680,000",+18.3%,Projected
Q3 2026,Security Suite,Europe & UK,11200,"$1,120,000",+14.2%,Projected
Q3 2026,AI Workspace,Asia Pacific,24500,"$2,450,000",+26.9%,Projected`;

    const data = parseCsvText(sampleCsv, 'Q1-Q3-Revenue-Report.csv');
    const mockFile = new File([sampleCsv], 'Q1-Q3-Revenue-Report.csv', { type: 'text/csv' });
    setFile(mockFile);
    setSheetData(data);
    setDocTitle('Q1-Q3 Enterprise Revenue & Growth Report');
    setSuccessMsg('Loaded sample enterprise revenue dataset.');
  };

  const generatePdf = () => {
    if (!sheetData) return;

    setBusy(true);
    setStatusMsg('Generating high-quality PDF report...');
    setErrorMsg('');

    try {
      const doc = new jsPDF({
        orientation,
        unit: 'pt',
        format: 'a4',
      });

      // Palette themes
      const colorSchemes = {
        blue: { head: [30, 64, 175], stripe: [239, 246, 255] },
        emerald: { head: [5, 150, 105], stripe: [236, 253, 245] },
        indigo: { head: [79, 70, 229], stripe: [238, 242, 255] },
        slate: { head: [30, 41, 59], stripe: [248, 250, 252] },
        rose: { head: [225, 29, 72], stripe: [255, 241, 242] },
      };

      const activeColor = colorSchemes[themeColor];

      // Page Title Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(docTitle, 40, 45);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(
        `Generated with PDFEdit Enterprise • ${sheetData.rows.length} records • ${sheetData.headers.length} columns`,
        40,
        60
      );

      // Render Table with autoTable
      autoTable(doc, {
        head: [sheetData.headers],
        body: sheetData.rows,
        startY: 75,
        theme: showGridlines ? 'grid' : 'plain',
        styles: {
          fontSize,
          cellPadding: 6,
          font: 'helvetica',
          textColor: [30, 41, 59],
          lineColor: [226, 232, 240],
          lineWidth: showGridlines ? 0.5 : 0,
        },
        headStyles: {
          fillColor: activeColor.head as [number, number, number],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'left',
        },
        alternateRowStyles: showStripes
          ? {
              fillColor: activeColor.stripe as [number, number, number],
            }
          : undefined,
        margin: { left: 40, right: 40, top: 40, bottom: 40 },
        didDrawPage: (data) => {
          // Footer pagination
          const pageStr = `Page ${data.pageNumber}`;
          doc.setFontSize(8);
          doc.setTextColor(150);
          const pageSize = doc.internal.pageSize;
          const pageWidth = pageSize.width || pageSize.getWidth();
          const pageHeight = pageSize.height || pageSize.getHeight();
          doc.text(pageStr, pageWidth - 60, pageHeight - 20);
        },
      });

      const pdfBlob = doc.output('blob');
      const outName = (docTitle || 'Spreadsheet-Report').replace(/[^a-zA-Z0-9-_]/g, '_') + '.pdf';
      saveAs(pdfBlob, outName);
      setSuccessMsg(`Successfully created and downloaded "${outName}"!`);
      trackToolExecution('excel_to_pdf', 'export_pdf', sheetData.rows.length);
    } catch (err: any) {
      console.error('Error generating PDF table:', err);
      setErrorMsg('Failed to generate PDF: ' + err.message);
    } finally {
      setBusy(false);
      setStatusMsg('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload & Dropzone */}
      {!sheetData ? (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 rounded-3xl p-10 bg-white dark:bg-gray-900 text-center transition">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Upload Excel or CSV Spreadsheet
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            Convert Excel (.xlsx, .xls) spreadsheets and CSV (.csv, .tsv) datasets into beautifully formatted, publication-ready PDF tables.
          </p>

          <div className="flex items-center gap-3 justify-center flex-wrap">
            <label className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md cursor-pointer transition">
              <span>Select Spreadsheet File</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv,.tsv,.txt"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={loadSampleSheet}
              className="px-5 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-semibold text-sm transition flex items-center gap-2 border border-gray-200 dark:border-gray-700"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Try with Sample Sheet
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% In-Browser Parsing
            </span>
            <span>•</span>
            <span>Zero Server Uploads</span>
            <span>•</span>
            <span>Supports .XLSX, .XLS, .CSV, .TSV</span>
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

          {/* Formatting Controls Grid */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                PDF Table Formatting & Styling
              </h3>
              <label className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                Change File
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv,.tsv,.txt"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Document Title:
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Orientation:
                </label>
                <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setOrientation('l')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                      orientation === 'l'
                        ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-gray-500'
                    }`}
                  >
                    Landscape
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation('p')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                      orientation === 'p'
                        ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-gray-500'
                    }`}
                  >
                    Portrait
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Theme Color:
                </label>
                <select
                  value={themeColor}
                  onChange={(e: any) => setThemeColor(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
                >
                  <option value="blue">Corporate Blue</option>
                  <option value="emerald">Emerald Green</option>
                  <option value="indigo">Deep Indigo</option>
                  <option value="slate">Modern Slate</option>
                  <option value="rose">Crimson Rose</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Font Size ({fontSize}pt):
                </label>
                <input
                  type="range"
                  min="7"
                  max="14"
                  step="1"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600 mt-2"
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6 text-xs text-gray-600 dark:text-gray-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGridlines}
                    onChange={(e) => setShowGridlines(e.target.checked)}
                    className="rounded accent-emerald-600"
                  />
                  <span>Table Gridlines</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showStripes}
                    onChange={(e) => setShowStripes(e.target.checked)}
                    className="rounded accent-emerald-600"
                  />
                  <span>Zebra Striping</span>
                </label>
              </div>

              <button
                type="button"
                onClick={generatePdf}
                disabled={busy}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>Export & Download PDF</span>
              </button>
            </div>
          </div>

          {/* Table Data Preview */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Table className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Data Preview ({sheetData.rows.length} rows, {sheetData.headers.length} columns)
              </h3>
              <span className="text-xs text-gray-400 font-mono">
                Showing top 20 rows
              </span>
            </div>

            <div className="overflow-x-auto max-h-96 border border-gray-200 dark:border-gray-800 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                    <th className="p-2.5 font-bold text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 w-10 text-center">
                      #
                    </th>
                    {sheetData.headers.map((h, i) => (
                      <th
                        key={i}
                        className="p-2.5 font-bold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 last:border-r-0 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-mono">
                  {sheetData.rows.slice(0, 20).map((row, rIdx) => (
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
          </div>
        </div>
      )}
    </div>
  );
}
