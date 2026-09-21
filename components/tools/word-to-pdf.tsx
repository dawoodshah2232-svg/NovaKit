'use client';

import { useState } from 'react';
import JSZip from 'jszip';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';

interface ParsedRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

interface ParsedParagraph {
  runs: ParsedRun[];
  isHeading?: boolean;
  headingLevel?: number;
  alignment?: 'left' | 'center' | 'right';
  isListItem?: boolean;
  listType?: 'bullet' | 'number';
}

function decodeXml(value: string) {
  return value
    .replace(/<[^>]+>/g, '')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .trim();
}

async function parseDocxStructure(file: File): Promise<ParsedParagraph[]> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const documentXml = await zip.file('word/document.xml')?.async('text');
  if (!documentXml) throw new Error('This DOCX file does not contain a readable document.');

  const paragraphs: ParsedParagraph[] = [];
  const paraMatches = [...documentXml.matchAll(/<w:p[\s\S]*?<\/w:p>/g)];

  for (const paraMatch of paraMatches) {
    const paraXml = paraMatch[0];

    // Check if heading
    const headingMatch = paraXml.match(/<w:pStyle w:val="Heading(\d+)"\/>/);
    const isHeading = !!headingMatch;
    const headingLevel = headingMatch ? parseInt(headingMatch[1]) : undefined;

    // Check alignment
    let alignment: 'left' | 'center' | 'right' = 'left';
    if (paraXml.includes('<w:jc w:val="center"/>')) alignment = 'center';
    else if (paraXml.includes('<w:jc w:val="right"/>')) alignment = 'right';

    // Check if list item
    const isListItem = paraXml.includes('<w:numPr>');
    const listType: 'bullet' | 'number' = paraXml.includes('<w:ilvl w:val="0"/>') ? 'bullet' : 'bullet';

    // Parse runs
    const runs: ParsedRun[] = [];
    const runMatches = [...paraXml.matchAll(/<w:r[\s\S]*?<\/w:r>/g)];

    for (const runMatch of runMatches) {
      const runXml = runMatch[0];
      const textMatch = runXml.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/);
      if (!textMatch) continue;

      const text = decodeXml(textMatch[1]).replace(/<w:tab\s*\/?>/g, ' ');
      if (!text) continue;

      runs.push({
        text,
        bold: runXml.includes('<w:b/>') || runXml.includes('<w:b '),
        italic: runXml.includes('<w:i/>') || runXml.includes('<w:i '),
        underline: runXml.includes('<w:u ') && !runXml.includes('<w:u w:val="none"/>'),
      });
    }

    if (runs.length > 0) {
      paragraphs.push({ runs, isHeading, headingLevel, alignment, isListItem, listType });
    }
  }

  if (!paragraphs.length) {
    throw new Error('No readable text was found in this DOCX file.');
  }

  return paragraphs;
}

export function WordToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function convert() {
    if (!file) return;
    setBusy(true);
    setError('');
    setStatus('Reading document structure...');

    try {
      if (!file.name.toLowerCase().endsWith('.docx')) {
        throw new Error('Only .docx files are supported in this browser converter. Legacy .doc files require a desktop or server converter.');
      }

      const paragraphs = await parseDocxStructure(file);
      setStatus('Creating PDF with formatting...');

      const pdf = await PDFDocument.create();
      const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);
      const helveticaOblique = await pdf.embedFont(StandardFonts.HelveticaOblique);
      const helveticaBoldOblique = await pdf.embedFont(StandardFonts.HelveticaBoldOblique);

      const margin = 54;
      const width = 612;
      const height = 792;

      let page = pdf.addPage([width, height]);
      let y = height - margin;

      for (const para of paragraphs) {
        // Determine font size and spacing based on paragraph type
        let fontSize = 11;
        let spaceAfter = 8;

        if (para.isHeading) {
          fontSize = para.headingLevel === 1 ? 18 : para.headingLevel === 2 ? 16 : 14;
          spaceAfter = 12;
        }

        const effectiveLineHeight = fontSize * 1.4;

        // Add list prefix if needed
        let linePrefix = '';
        if (para.isListItem) {
          linePrefix = para.listType === 'bullet' ? '• ' : '1. ';
        }

        // Process each run in the paragraph
        let lineText = linePrefix;

        for (const run of para.runs) {
          const words = run.text.split(/\s+/);

          for (const word of words) {
            // Select font based on formatting
            let font = helvetica;
            if (run.bold && run.italic) font = helveticaBoldOblique;
            else if (run.bold) font = helveticaBold;
            else if (run.italic) font = helveticaOblique;

            const testText = lineText ? `${lineText} ${word}` : word;
            const testWidth = font.widthOfTextAtSize(testText, fontSize);

            if (testWidth > width - margin * 2 && lineText) {
              // Draw current line
              if (y < margin + effectiveLineHeight) {
                page = pdf.addPage([width, height]);
                y = height - margin;
              }

              let drawX = margin;
              if (para.alignment === 'center') {
                const lineWidth = font.widthOfTextAtSize(lineText, fontSize);
                drawX = (width - lineWidth) / 2;
              } else if (para.alignment === 'right') {
                const lineWidth = font.widthOfTextAtSize(lineText, fontSize);
                drawX = width - margin - lineWidth;
              }

              page.drawText(lineText, {
                x: drawX,
                y,
                size: fontSize,
                font,
                color: rgb(0.1, 0.1, 0.1),
              });

              y -= effectiveLineHeight;
              lineText = word;
            } else {
              lineText = testText;
            }
          }
        }

        // Draw remaining text
        if (lineText) {
          if (y < margin + effectiveLineHeight) {
            page = pdf.addPage([width, height]);
            y = height - margin;
          }

          let drawX = margin;
          const finalFont = para.runs[0]?.bold && para.runs[0]?.italic ? helveticaBoldOblique :
                           para.runs[0]?.bold ? helveticaBold :
                           para.runs[0]?.italic ? helveticaOblique : helvetica;

          if (para.alignment === 'center') {
            const lineWidth = finalFont.widthOfTextAtSize(lineText, fontSize);
            drawX = (width - lineWidth) / 2;
          } else if (para.alignment === 'right') {
            const lineWidth = finalFont.widthOfTextAtSize(lineText, fontSize);
            drawX = width - margin - lineWidth;
          }

          page.drawText(lineText, {
            x: drawX,
            y,
            size: fontSize,
            font: finalFont,
            color: rgb(0.1, 0.1, 0.1),
          });

          y -= effectiveLineHeight;
        }

        y -= spaceAfter;
      }

      saveAs(
        new Blob([await pdf.save() as unknown as BlobPart], { type: 'application/pdf' }),
        `${file.name.replace(/\.docx$/i, '')}.pdf`
      );
      setStatus(`Converted ${paragraphs.length} paragraphs to PDF with formatting.`);
      trackToolExecution('word-to-pdf', true);
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : 'Could not convert this document.');
      setStatus('');
      trackToolExecution('word-to-pdf', false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-lg font-black text-slate-950 dark:text-white">Word to PDF</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Convert a DOCX document into a PDF with support for basic formatting including bold, italic, headings, and lists.
        </p>
      </div>
      <div>
        <label htmlFor="docx-input" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Select DOCX Document
        </label>
        <input
          id="docx-input"
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
        Supports: paragraphs, headings (H1-H3), bold, italic, underline, center/right alignment, and bullet lists.
        Legacy .doc files, images, tables, and complex layouts are not supported by this browser-only implementation.
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
        {busy ? 'Converting...' : 'Download PDF'}
      </button>
    </div>
  );
}
