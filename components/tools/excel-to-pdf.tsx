'use client';
import { brandedFileName } from '@/lib/branded-filename';

import { useState } from 'react';
import { ToolFilePicker } from '@/components/tool-file-picker';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB — large workbooks can exhaust browser memory
const MAX_ROWS_PER_SHEET = 5000;
const MAX_COLUMNS = 26;

const LIMITATIONS = [
  'Cell text and values are converted — fonts, colors, charts, images and pivot tables are not.',
  'Formulas are replaced by their last computed values from Excel.',
  'Merged cells are flattened: only the top-left cell keeps the value.',
  `Very large sheets are capped at ${MAX_ROWS_PER_SHEET.toLocaleString()} rows and ${MAX_COLUMNS} columns per sheet to protect browser memory.`,
];

interface SheetInfo {
  name: string;
  rows: string[][];
  rowCount: number;
  truncated: boolean;
}

function isSpreadsheetFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv') || name.endsWith('.ods');
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'number') return Number.isInteger(value) ? value.toString() : value.toFixed(2);
  return String(value);
}

export function ExcelToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [firstRowHeader, setFirstRowHeader] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function selectFile(next: File | null) {
    setError('');
    setStatus('');
    setProgress(0);
    setSheets([]);
    setSelectedSheets([]);
    if (!next) {
      setFile(null);
      return;
    }
    if (!isSpreadsheetFile(next)) {
      setFile(null);
      setError('Only spreadsheet files are supported (.xlsx, .xls, .csv, .ods).');
      return;
    }
    if (next.size > MAX_FILE_BYTES) {
      setFile(null);
      setError('This file is over the 25 MB limit for browser conversion. Try a smaller workbook.');
      return;
    }
    if (next.size === 0) {
      setFile(null);
      setError('This file is empty (0 bytes). Please choose a valid spreadsheet.');
      return;
    }
    setFile(next);
    setStatus('Reading workbook…');

    try {
      // Loaded on demand so the spreadsheet parser never weighs down other pages.
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(await next.arrayBuffer(), { type: 'array', cellDates: true });
      if (workbook.SheetNames.length === 0) throw new Error('This workbook has no sheets.');

      const parsed: SheetInfo[] = workbook.SheetNames.map((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const rawRows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: true });
        const truncated = rawRows.length > MAX_ROWS_PER_SHEET;
        const rows = rawRows
          .slice(0, MAX_ROWS_PER_SHEET)
          .map((row) => row.slice(0, MAX_COLUMNS).map(formatCellValue));
        // Drop trailing fully-empty rows so blank padding doesn't bloat the PDF.
        while (rows.length > 0 && rows[rows.length - 1].every((cell) => cell === '')) rows.pop();
        return { name: sheetName, rows, rowCount: rawRows.length, truncated };
      });

      setSheets(parsed);
      setSelectedSheets(parsed.filter((s) => s.rows.length > 0).map((s) => s.name));
      setStatus('');
    } catch (parseError) {
      setFile(null);
      setError(
        parseError instanceof Error
          ? `Could not read this workbook: ${parseError.message}`
          : 'Could not read this workbook. It may be corrupted or password-protected.'
      );
      setStatus('');
    }
  }

  function toggleSheet(name: string) {
    setSelectedSheets((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]));
  }

  async function convert() {
    if (!file || busy || selectedSheets.length === 0) return;
    setBusy(true);
    setError('');
    setStatus('');
    setProgress(2);

    try {
      const doc = new jsPDF({ orientation, unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      let firstPage = true;

      const chosen = sheets.filter((s) => selectedSheets.includes(s.name));
      for (let i = 0; i < chosen.length; i++) {
        const sheet = chosen[i];
        setStatus(`Rendering sheet ${i + 1} of ${chosen.length}: ${sheet.name}…`);
        setProgress(2 + Math.round((i / chosen.length) * 85));
        await new Promise((resolve) => setTimeout(resolve, 0));

        if (!firstPage) doc.addPage('a4', orientation);
        firstPage = false;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text(sheet.name, 40, 48);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Converted by PDFEdit Studio — ${file.name}`, 40, 62);

        const dataRows = sheet.rows;
        const hasHeader = firstRowHeader && dataRows.length > 1;
        const head = hasHeader ? [dataRows[0]] : [];
        const body = hasHeader ? dataRows.slice(1) : dataRows;

        if (body.length === 0 && head.length === 0) {
          doc.setFontSize(11);
          doc.setTextColor(100, 116, 139);
          doc.text('This sheet is empty.', 40, 100);
          continue;
        }

        autoTable(doc, {
          startY: 74,
          head,
          body,
          margin: { left: 40, right: 40 },
          tableWidth: pageWidth - 80,
          headStyles: {
            fillColor: [185, 28, 28],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
            cellPadding: 5,
          },
          styles: {
            font: 'helvetica',
            fontSize: 9,
            cellPadding: 5,
            textColor: [51, 65, 85],
            lineColor: [226, 232, 240],
            lineWidth: 0.5,
          },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          didDrawPage: (data) => {
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(
              `${sheet.name} — page ${data.pageNumber}`,
              pageWidth / 2,
              doc.internal.pageSize.getHeight() - 24,
              { align: 'center' }
            );
          },
        });
      }

      doc.setProperties({
        title: `${file.name} — converted to PDF`,
        creator: 'PDFEdit Studio (pdfedit.website)',
      });

      setStatus('Saving your PDF…');
      setProgress(96);
      const pdfBlob = doc.output('blob');
      saveAs(pdfBlob, brandedFileName(file.name.replace(/\.(xlsx|xls|csv|ods)$/i, ''), 'pdf'));

      setProgress(100);
      setStatus(`Done — converted ${chosen.length} sheet${chosen.length === 1 ? '' : 's'} to PDF.`);
      trackToolExecution('excel-to-pdf', true);
    } catch (conversionError) {
      setError(
        conversionError instanceof Error
          ? conversionError.message
          : 'Could not build the PDF. Please try a smaller workbook.'
      );
      setStatus('');
      setProgress(0);
      trackToolExecution('excel-to-pdf', false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-lg font-black text-slate-950 dark:text-white">Excel to PDF</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Turn an Excel workbook into a clean, paginated PDF in your browser. Pick which sheets to include,
          choose the page orientation, and download — your spreadsheet never leaves your device.
        </p>
      </div>

      <ToolFilePicker
        accept={{
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
          'application/vnd.ms-excel': ['.xls'],
          'text/csv': ['.csv'],
        }}
        multiple={false}
        files={file ? [file] : []}
        onAdd={(picked) => void selectFile(picked[0] || null)}
        onRemove={() => void selectFile(null)}
        emptyTitle="Drag & drop your spreadsheet here"
        browseLabel="Browse spreadsheet"
        hint="XLSX, XLS, CSV, ODS · up to 25 MB"
        disabled={busy}
        ariaLabel="Select spreadsheet to convert"
      />

      {sheets.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Sheets to include ({selectedSheets.length} of {sheets.length})
            </p>
            <div className="mt-2 space-y-1.5">
              {sheets.map((sheet) => (
                <label
                  key={sheet.name}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={selectedSheets.includes(sheet.name)}
                    onChange={() => toggleSheet(sheet.name)}
                    disabled={busy}
                    className="h-4 w-4 accent-[var(--pe-accent)]"
                  />
                  <span className="flex-1 truncate font-semibold text-slate-800 dark:text-slate-200">
                    {sheet.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {sheet.rowCount.toLocaleString()} rows{sheet.truncated ? ` (capped at ${MAX_ROWS_PER_SHEET.toLocaleString()})` : ''}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Page orientation
              </label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                disabled={busy}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--pe-accent)]/30 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <option value="landscape">Landscape (best for wide tables)</option>
                <option value="portrait">Portrait</option>
              </select>
            </div>
            <label className="flex cursor-pointer items-center gap-3 self-end rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-900">
              <input
                type="checkbox"
                checked={firstRowHeader}
                onChange={(e) => setFirstRowHeader(e.target.checked)}
                disabled={busy}
                className="h-4 w-4 accent-[var(--pe-accent)]"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">First row is the header</span>
            </label>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">What this converter can’t do</p>
        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {LIMITATIONS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          {error}
        </p>
      )}

      {busy && (
        <div className="space-y-2">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label="Conversion progress"
            className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
          >
            <div
              className="h-full rounded-full bg-[var(--pe-accent)] transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p role="status" className="text-sm text-slate-600 dark:text-slate-300">
            {status} <span className="font-semibold tabular-nums">{progress}%</span>
          </p>
        </div>
      )}

      {!busy && status && (
        <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {status}
        </p>
      )}

      <button
        type="button"
        onClick={() => void convert()}
        disabled={!file || busy || selectedSheets.length === 0}
        className="min-h-12 w-full rounded-xl bg-[var(--pe-accent)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--pe-accent-hover)] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--pe-accent)]"
      >
        {busy ? 'Converting…' : 'Download PDF'}
      </button>
    </div>
  );
}
