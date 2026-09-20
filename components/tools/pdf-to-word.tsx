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

export function PdfToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function convert() {
    if (!file) return;
    setBusy(true); setError(''); setStatus('Extracting readable text locally...');
    try {
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const paragraphs: string[] = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const text = content.items.map((item) => 'str' in item ? item.str : '').join(' ').replace(/\s+/g, ' ').trim();
        if (text) paragraphs.push(text);
      }
      if (!paragraphs.length) throw new Error('No selectable text was found. Scanned PDFs need OCR, which this tool does not provide.');
      const body = paragraphs.map((paragraph) => `<w:p><w:r><w:t xml:space="preserve">${escapeXml(paragraph)}</w:t></w:r></w:p>`).join('');
      const zip = new JSZip();
      zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
      zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
      zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr/></w:body></w:document>`);
      saveAs(await zip.generateAsync({ type: 'blob' }), `${file.name.replace(/\.pdf$/i, '')}.docx`);
      setStatus(`Converted ${paragraphs.length} readable page${paragraphs.length === 1 ? '' : 's'} to DOCX.`);
      trackToolExecution('pdf-to-word', true);
    } catch (conversionError) {
      const message = conversionError instanceof Error ? conversionError.message : 'Could not convert this PDF.';
      setError(message); setStatus(''); trackToolExecution('pdf-to-word', false);
    } finally { setBusy(false); }
  }

  return <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div><h2 className="text-lg font-black text-slate-950 dark:text-white">PDF to Word</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Extract selectable PDF text into a downloadable DOCX file. Basic paragraph structure is preserved locally in your browser.</p></div>
    <input type="file" accept="application/pdf,.pdf" onChange={(event) => { setFile(event.target.files?.[0] || null); setError(''); setStatus(''); }} className="block w-full rounded-xl border border-slate-300 p-3 text-sm dark:border-slate-700" />
    <p className="text-xs text-slate-500">Complex positioning, tables, images, fonts, and scanned pages are not reconstructed. Scanned PDFs require OCR, which is not included.</p>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {status && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{status}</p>}
    <button type="button" onClick={() => void convert()} disabled={!file || busy} className="min-h-12 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50">{busy ? 'Converting locally...' : 'Download Word Document'}</button>
  </div>;
}
