'use client';

import { useState } from 'react';
import JSZip from 'jszip';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';

function decodeXml(value: string) {
  return value.replace(/<[^>]+>/g, '').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&apos;', "'").trim();
}

async function readDocxText(file: File) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const documentXml = await zip.file('word/document.xml')?.async('text');
  if (!documentXml) throw new Error('This DOCX file does not contain a readable document.');
  const paragraphs = [...documentXml.matchAll(/<w:p[\s\S]*?<\/w:p>/g)].map((match) => decodeXml(match[0].replace(/<w:tab\s*\/?>/g, ' '))).filter(Boolean);
  if (!paragraphs.length) throw new Error('No readable text was found in this DOCX file.');
  return paragraphs;
}

export function WordToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function convert() {
    if (!file) return;
    setBusy(true); setError(''); setStatus('Reading document locally...');
    try {
      if (!file.name.toLowerCase().endsWith('.docx')) throw new Error('Only .docx files are supported in this browser converter. Legacy .doc files require a desktop or server converter.');
      const paragraphs = await readDocxText(file);
      const pdf = await PDFDocument.create();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const margin = 54; const lineHeight = 16; const width = 612; const height = 792;
      let page = pdf.addPage([width, height]); let y = height - margin;
      for (const paragraph of paragraphs) {
        const words = paragraph.split(/\s+/); let line = '';
        for (const word of words) {
          const next = line ? `${line} ${word}` : word;
          if (font.widthOfTextAtSize(next, 11) > width - margin * 2 && line) {
            if (y < margin) { page = pdf.addPage([width, height]); y = height - margin; }
            page.drawText(line, { x: margin, y, size: 11, font, color: rgb(0.1, 0.1, 0.1) }); y -= lineHeight; line = word;
          } else line = next;
        }
        if (line) { if (y < margin) { page = pdf.addPage([width, height]); y = height - margin; } page.drawText(line, { x: margin, y, size: 11, font, color: rgb(0.1, 0.1, 0.1) }); y -= lineHeight; }
        y -= 8;
      }
      saveAs(new Blob([await pdf.save() as unknown as BlobPart], { type: 'application/pdf' }), `${file.name.replace(/\.docx$/i, '')}.pdf`);
      setStatus(`Converted ${paragraphs.length} paragraphs to PDF.`); trackToolExecution('word-to-pdf', true);
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : 'Could not convert this document.'); setStatus(''); trackToolExecution('word-to-pdf', false);
    } finally { setBusy(false); }
  }

  return <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div><h2 className="text-lg font-black text-slate-950 dark:text-white">Word to PDF</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Convert a DOCX text document into a downloadable PDF locally in your browser.</p></div>
    <input type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => { setFile(event.target.files?.[0] || null); setError(''); setStatus(''); }} className="block w-full rounded-xl border border-slate-300 p-3 text-sm dark:border-slate-700" />
    <p className="text-xs text-slate-500">DOCX text, paragraphs, and basic line flow are supported. Legacy .doc files, images, tables, styles, and complex layouts are not converted by this browser-only implementation.</p>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {status && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{status}</p>}
    <button type="button" onClick={() => void convert()} disabled={!file || busy} className="min-h-12 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50">{busy ? 'Converting locally...' : 'Download PDF'}</button>
  </div>;
}
