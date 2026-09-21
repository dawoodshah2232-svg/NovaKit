'use client';

import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';

if (typeof window !== 'undefined') pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

function escapeXml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

interface TextItem {
  text: string;
  x: number;
  y: number;
  height: number;
  width: number;
}

export function PdfToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function convert() {
    if (!file) return;
    setBusy(true);
    setError('');
    setStatus('Extracting text with structure...');

    try {
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const paragraphs: string[] = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        setStatus(`Processing page ${pageNumber} of ${pdf.numPages}...`);
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();

        // Group text items by Y coordinate to form lines
        const lines: TextItem[][] = [];
        let currentLine: TextItem[] = [];
        let lastY = -1;

        for (const item of textContent.items) {
          if ('str' in item && item.str.trim()) {
            const textItem: TextItem = {
              text: item.str,
              x: item.transform[4],
              y: item.transform[5],
              height: item.height || 12,
              width: item.width || 0,
            };

            // New line if Y coordinate changes significantly
            if (lastY !== -1 && Math.abs(textItem.y - lastY) > textItem.height * 0.3) {
              if (currentLine.length > 0) {
                lines.push([...currentLine]);
                currentLine = [];
              }
            }

            currentLine.push(textItem);
            lastY = textItem.y;
          }
        }
        if (currentLine.length > 0) lines.push(currentLine);

        // Sort lines by Y coordinate (top to bottom)
        lines.sort((a, b) => (b[0]?.y || 0) - (a[0]?.y || 0));

        // Group lines into paragraphs based on spacing and font size
        let currentParagraph: string[] = [];
        let lastLineY = -1;
        let lastLineHeight = 12;

        for (const line of lines) {
          // Sort words in line by X coordinate (left to right)
          line.sort((a, b) => a.x - b.x);
          const lineText = line.map(item => item.text).join(' ');
          const lineHeight = line[0]?.height || 12;
          const lineY = line[0]?.y || 0;

          // Detect paragraph break: large vertical gap or significant height change
          const verticalGap = lastLineY !== -1 ? lastLineY - lineY : 0;
          const isNewParagraph = verticalGap > lastLineHeight * 1.5 ||
                                 (lineHeight > lastLineHeight * 1.3 && currentParagraph.length > 0);

          if (isNewParagraph && currentParagraph.length > 0) {
            paragraphs.push(currentParagraph.join(' '));
            currentParagraph = [];
          }

          currentParagraph.push(lineText);
          lastLineY = lineY;
          lastLineHeight = lineHeight;
        }

        if (currentParagraph.length > 0) {
          paragraphs.push(currentParagraph.join(' '));
        }

        // Page break marker
        if (pageNumber < pdf.numPages) {
          paragraphs.push('__PAGE_BREAK__');
        }
      }

      if (!paragraphs.length) {
        throw new Error('No selectable text was found. Scanned PDFs need OCR, which this tool does not provide.');
      }

      // Build DOCX with paragraph structure and page breaks
      const body = paragraphs.map(para => {
        if (para === '__PAGE_BREAK__') {
          return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
        }
        return `<w:p><w:r><w:t xml:space="preserve">${escapeXml(para)}</w:t></w:r></w:p>`;
      }).join('');

      const zip = new JSZip();
      zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
      zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
      zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr/></w:body></w:document>`);

      saveAs(await zip.generateAsync({ type: 'blob' }), `${file.name.replace(/\.pdf$/i, '')}.docx`);
      setStatus(`Converted ${paragraphs.filter(p => p !== '__PAGE_BREAK__').length} paragraphs to DOCX with page breaks.`);
      trackToolExecution('pdf-to-word', true);
    } catch (conversionError) {
      const message = conversionError instanceof Error ? conversionError.message : 'Could not convert this PDF.';
      setError(message);
      setStatus('');
      trackToolExecution('pdf-to-word', false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-lg font-black text-slate-950 dark:text-white">PDF to Word</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Extract selectable PDF text into a downloadable DOCX file with improved paragraph detection and page breaks.
        </p>
      </div>
      <div>
        <label htmlFor="pdf-input" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Select PDF
        </label>
        <input
          id="pdf-input"
          type="file"
          accept="application/pdf,.pdf"
          onChange={(event) => {
            setFile(event.target.files?.[0] || null);
            setError('');
            setStatus('');
          }}
          className="block w-full rounded-xl border border-slate-300 p-3 text-sm dark:border-slate-700 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={busy}
        />
      </div>
      <p className="text-xs text-slate-500">
        Text extraction uses coordinate-based paragraph detection. Complex layouts, tables, images, fonts, and scanned pages are not reconstructed. Scanned PDFs require OCR.
      </p>
      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          {error}
        </p>
      )}
      {status && (
        <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {status}
        </p>
      )}
      <button
        type="button"
        onClick={() => void convert()}
        disabled={!file || busy}
        className="min-h-12 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {busy ? 'Converting...' : 'Download Word Document'}
      </button>
    </div>
  );
}
