/**
 * PDFEdit Studio — Export as Word (.docx).
 *
 * Rebuilds an editable Word document from the PDF's own text (via pdf.js
 * text extraction + the Studio's line/font/color matching). The result opens
 * cleanly in Microsoft Word, Google Docs, and LibreOffice.
 *
 * Fidelity notes (honest):
 * - Paragraphs, font size, bold/italic, text color, and alignment are
 *   preserved. Large lines become headings.
 * - Exact absolute positioning is NOT preserved — Word is a flow-layout
 *   format. Multi-column layouts become sequential paragraphs.
 * - Images, vector artwork, and letterhead graphics are not carried over in
 *   this version (text-only export).
 */
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  PageBreak,
  Paragraph,
  TextRun,
} from 'docx';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { extractTextLines, sampleLineColors, type PdfTextLine } from './textEdit';
import { wordFontFor } from './fonts';

interface PageGeometry {
  widthPt: number;
  heightPt: number;
}

/** Rough page size in points, from the pdf.js viewport at scale 1. */
async function pageGeometry(pdfDoc: PDFDocumentProxy, pageNumber: number): Promise<PageGeometry> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  return { widthPt: viewport.width, heightPt: viewport.height };
}

function alignmentFor(line: PdfTextLine): (typeof AlignmentType)[keyof typeof AlignmentType] {
  const center = line.x + line.w / 2;
  if (center > 0.62 && line.x > 0.45) return AlignmentType.RIGHT;
  if (center > 0.38 && center < 0.62 && line.x > 0.25) return AlignmentType.CENTER;
  return AlignmentType.LEFT;
}

/**
 * Build a .docx Blob from the PDF's extracted text.
 * @param onProgress optional progress callback ("Page 3 of 12…")
 */
export async function exportToDocx(
  pdfDoc: PDFDocumentProxy,
  onProgress?: (msg: string) => void
): Promise<Blob> {
  const pageCount = pdfDoc.numPages;
  const children: Paragraph[] = [];

  for (let p = 1; p <= pageCount; p++) {
    onProgress?.(`Reading page ${p} of ${pageCount}…`);
    const geo = await pageGeometry(pdfDoc, p);
    // extractTextLines needs a pixel sampler for colors; for docx we sample
    // against a rendered page canvas.
    const page = await pdfDoc.getPage(p);
    const scale = 1.5;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      await page.render({
        canvas,
        canvasContext: ctx,
        viewport,
      } as unknown as Parameters<typeof page.render>[0]).promise;
    }
    const getPixel = (nx: number, ny: number): [number, number, number] | null => {
      if (!ctx) return null;
      const px = Math.floor(Math.min(0.999, Math.max(0, nx)) * canvas.width);
      const py = Math.floor(Math.min(0.999, Math.max(0, ny)) * canvas.height);
      try {
        const d = ctx.getImageData(px, py, 1, 1).data;
        return [d[0], d[1], d[2]];
      } catch {
        return null;
      }
    };

    const lines = await extractTextLines(pdfDoc, p, 0);
    const colored = lines.map((l) => ({ ...l, ...sampleLineColors(getPixel, l) }));
    if (colored.length === 0) {
      if (p < pageCount) children.push(new Paragraph({ children: [new PageBreak()] }));
      continue;
    }

    // Heading detection: lines clearly larger than the page's median size.
    const sizes = colored.map((l) => l.fontSize).sort((a, b) => a - b);
    const median = sizes[Math.floor(sizes.length / 2)] || 0.02;

    // Group consecutive lines into paragraphs: a new paragraph starts when
    // the vertical gap exceeds ~60% of the previous line height.
    const paras: PdfTextLine[][] = [];
    for (const line of colored) {
      const last = paras[paras.length - 1];
      const prev = last?.[last.length - 1];
      const gap = prev ? line.glyphY - (prev.glyphY + prev.fontSize * 1.3) : 0;
      if (last && prev && gap < prev.fontSize * 0.6) {
        last.push(line);
      } else {
        paras.push([line]);
      }
    }

    for (const para of paras) {
      const first = para[0];
      const isHeading = first.fontSize > median * 1.55 && para.length === 1 && first.text.length < 120;
      const runs = para.map(
        (line) =>
          new TextRun({
            text: line.text,
            bold: line.bold,
            italics: line.italic,
            size: Math.max(16, Math.round((line.fontSize * geo.heightPt) * 2)), // half-points
            color: line.color && line.color !== '#ffffff' ? line.color.replace('#', '') : undefined,
            font: wordFontFor(line.fontId),
          })
      );
      // Join multi-line paragraphs with spaces (single TextRun per line keeps
      // per-line styling; spaces between them).
      const children_runs: TextRun[] = [];
      runs.forEach((r, i) => {
        if (i > 0) children_runs.push(new TextRun({ text: ' ' }));
        children_runs.push(r);
      });
      children.push(
        new Paragraph({
          children: children_runs,
          heading: isHeading ? (first.fontSize > median * 2 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2) : undefined,
          alignment: isHeading ? AlignmentType.LEFT : alignmentFor(first),
          spacing: { after: isHeading ? 160 : 120 },
        })
      );
    }
    if (p < pageCount) children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  const doc = new Document({
    sections: [{ children }],
    title: 'Exported from PDFEdit Studio',
    creator: 'PDFEdit Studio',
  });
  return Packer.toBlob(doc);
}
