import JSZip from 'jszip';
import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';

/**
 * Pure, UI-free DOCX -> PDF conversion logic.
 *
 * Verified capabilities of this pipeline (do not advertise more than this):
 * - Reads word/document.xml from the .docx zip and extracts paragraphs/runs.
 * - Supports: paragraphs, headings H1-H6 (size scaled), bold, italic, underline,
 *   left/center/right alignment, bullet lists, and simple decimal numbered lists.
 * - Fonts: pdf-lib can only embed its built-in StandardFonts families. This
 *   converter therefore renders with ONE chosen family (normal/bold/italic/
 *   bold-italic variants genuinely embedded). The document's original fonts,
 *   sizes and colors are NOT preserved.
 * - Images, charts, text boxes, headers/footers, footnotes: not parsed.
 * - Tables: cell text is extracted (w:p inside w:tc matches the paragraph
 *   regex) but the table grid/borders/structure are lost.
 */
export type WordFontFamily = 'helvetica' | 'times' | 'courier';

export const WORD_FONT_OPTIONS: { value: WordFontFamily; label: string }[] = [
  { value: 'helvetica', label: 'Helvetica' },
  { value: 'times', label: 'Times' },
  { value: 'courier', label: 'Courier' },
];

export interface ParsedRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface ParsedParagraph {
  runs: ParsedRun[];
  isHeading?: boolean;
  headingLevel?: number;
  alignment?: 'left' | 'center' | 'right';
  isListItem?: boolean;
  listType?: 'bullet' | 'decimal';
  /** 1-based counter for decimal list items */
  listNumber?: number;
}

interface StyledWord {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

function decodeXml(value: string): string {
  return value
    .replace(/<[^>]+>/g, '')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .trim();
}

/** numId:ilvl -> 'bullet' | 'decimal' | 'other' */
async function parseNumbering(zip: JSZip): Promise<Map<string, string>> {
  const formats = new Map<string, string>();
  const numberingXml = await zip.file('word/numbering.xml')?.async('text');
  if (!numberingXml) return formats;

  // numId -> abstractNumId
  const numToAbstract = new Map<string, string>();
  for (const m of numberingXml.matchAll(/<w:num\s+w:numId="(\d+)"[\s\S]*?<w:abstractNumId\s+w:val="(\d+)"\s*\/>/g)) {
    numToAbstract.set(m[1], m[2]);
  }
  // abstractNumId -> (ilvl -> numFmt)
  for (const m of numberingXml.matchAll(/<w:abstractNum\s+w:abstractNumId="(\d+)"[\s\S]*?<\/w:abstractNum>/g)) {
    const abstractId = m[1];
    for (const lvl of m[0].matchAll(/<w:lvl\s+w:ilvl="(\d+)"[\s\S]*?<w:numFmt\s+w:val="([a-zA-Z]+)"\s*\/>/g)) {
      formats.set(`${abstractId}:${lvl[1]}`, lvl[2].toLowerCase());
    }
  }
  const resolved = new Map<string, string>();
  for (const [numId, abstractId] of numToAbstract) {
    for (const [key, fmt] of formats) {
      const [aId, ilvl] = key.split(':');
      if (aId === abstractId) resolved.set(`${numId}:${ilvl}`, fmt);
    }
  }
  return resolved;
}

export async function parseDocxStructure(input: ArrayBuffer): Promise<ParsedParagraph[]> {
  const zip = await JSZip.loadAsync(input);
  const documentXml = await zip.file('word/document.xml')?.async('text');
  if (!documentXml) {
    throw new Error(
      'This file does not contain a readable Word document. It may be corrupted, password-protected, or not a real .docx file.'
    );
  }

  const numbering = await parseNumbering(zip);
  const paragraphs: ParsedParagraph[] = [];
  // counters for decimal lists: numId -> per-level counts
  const listCounters = new Map<string, number[]>();

  const paraMatches = [...documentXml.matchAll(/<w:p[\s\S]*?<\/w:p>/g)];

  for (const paraMatch of paraMatches) {
    const paraXml = paraMatch[0];

    const headingMatch = paraXml.match(/<w:pStyle\s+w:val="Heading(\d)"\s*\/>/);
    const isHeading = !!headingMatch;
    const headingLevel = headingMatch ? parseInt(headingMatch[1], 10) : undefined;

    let alignment: 'left' | 'center' | 'right' = 'left';
    if (/<w:jc\s+w:val="center"\s*\/>/.test(paraXml)) alignment = 'center';
    else if (/<w:jc\s+w:val="right"\s*\/>/.test(paraXml)) alignment = 'right';

    // List detection via w:numPr
    let isListItem = false;
    let listType: 'bullet' | 'decimal' = 'bullet';
    let listNumber: number | undefined;
    const numPrMatch = paraXml.match(/<w:numPr>[\s\S]*?<\/w:numPr>/);
    if (numPrMatch) {
      isListItem = true;
      const numId = numPrMatch[0].match(/<w:numId\s+w:val="(\d+)"\s*\/>/)?.[1];
      const ilvl = numPrMatch[0].match(/<w:ilvl\s+w:val="(\d+)"\s*\/>/)?.[1] ?? '0';
      const fmt = numId ? numbering.get(`${numId}:${ilvl}`) : undefined;
      if (fmt === 'decimal' || fmt === 'decimalzero') {
        listType = 'decimal';
        const key = numId ?? 'default';
        const counters = listCounters.get(key) ?? [];
        const level = parseInt(ilvl, 10);
        counters[level] = (counters[level] ?? 0) + 1;
        // reset deeper levels
        for (let i = level + 1; i < counters.length; i++) counters[i] = 0;
        listCounters.set(key, counters);
        listNumber = counters[level];
      }
    }

    const runs: ParsedRun[] = [];
    const runMatches = [...paraXml.matchAll(/<w:r[\s\S]*?<\/w:r>/g)];

    for (const runMatch of runMatches) {
      const runXml = runMatch[0];
      // A run can hold several <w:t> nodes; join them in order.
      const textParts: string[] = [];
      for (const t of runXml.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)) {
        textParts.push(t[1]);
      }
      if (!textParts.length) continue;
      const raw = textParts
        .join('')
        .replace(/<w:tab\s*\/?>/g, ' ')
        .replace(/<w:br\s*\/?>/g, ' ');
      const text = decodeXml(raw);
      if (!text) continue;

      runs.push({
        text,
        bold: runXml.includes('<w:b/>') || runXml.includes('<w:b ') || runXml.includes('<w:b>'),
        italic: runXml.includes('<w:i/>') || runXml.includes('<w:i ') || runXml.includes('<w:i>'),
        underline:
          /<w:u(\s|\/|>)/.test(runXml) && !runXml.includes('w:val="none"'),
      });
    }

    if (runs.length > 0) {
      paragraphs.push({ runs, isHeading, headingLevel, alignment, isListItem, listType, listNumber });
    }
  }

  if (!paragraphs.length) {
    throw new Error('No readable text was found in this DOCX file. It may contain only images or be empty.');
  }

  return paragraphs;
}

const FONT_VARIANTS: Record<WordFontFamily, [normal: StandardFonts, bold: StandardFonts, italic: StandardFonts, boldItalic: StandardFonts]> = {
  helvetica: [
    StandardFonts.Helvetica,
    StandardFonts.HelveticaBold,
    StandardFonts.HelveticaOblique,
    StandardFonts.HelveticaBoldOblique,
  ],
  times: [StandardFonts.TimesRoman, StandardFonts.TimesRomanBold, StandardFonts.TimesRomanItalic, StandardFonts.TimesRomanBoldItalic],
  courier: [
    StandardFonts.Courier,
    StandardFonts.CourierBold,
    StandardFonts.CourierOblique,
    StandardFonts.CourierBoldOblique,
  ],
};

function pickFont(
  embedded: { normal: PDFFont; bold: PDFFont; italic: PDFFont; boldItalic: PDFFont },
  bold: boolean,
  italic: boolean
): PDFFont {
  if (bold && italic) return embedded.boldItalic;
  if (bold) return embedded.bold;
  if (italic) return embedded.italic;
  return embedded.normal;
}

export interface RenderResult {
  bytes: Uint8Array;
  pageCount: number;
  paragraphCount: number;
}

export async function renderPdf(
  paragraphs: ParsedParagraph[],
  fontFamily: WordFontFamily,
  onProgress?: (fraction: number) => void
): Promise<RenderResult> {
  const [normal, bold, italic, boldItalic] = FONT_VARIANTS[fontFamily];
  const pdf = await PDFDocument.create();
  const embedded = {
    normal: await pdf.embedFont(normal),
    bold: await pdf.embedFont(bold),
    italic: await pdf.embedFont(italic),
    boldItalic: await pdf.embedFont(boldItalic),
  };

  const margin = 54;
  const width = 612;
  const height = 792;
  const maxWidth = width - margin * 2;
  const textColor = rgb(0.1, 0.1, 0.1);

  let page = pdf.addPage([width, height]);
  let y = height - margin;
  let pageCount = 1;

  const newPageIfNeeded = (lineHeight: number) => {
    if (y < margin + lineHeight) {
      page = pdf.addPage([width, height]);
      pageCount += 1;
      y = height - margin;
    }
  };

  for (let p = 0; p < paragraphs.length; p++) {
    const para = paragraphs[p];
    const fontSize = para.isHeading
      ? para.headingLevel === 1
        ? 18
        : para.headingLevel === 2
          ? 16
          : 14
      : 11;
    const lineHeight = fontSize * 1.4;
    const spaceAfter = para.isHeading ? 12 : 8;

    // Flatten runs into styled words, preserving each run's formatting.
    const words: StyledWord[] = [];
    if (para.isListItem) {
      words.push({
        text: para.listType === 'decimal' ? `${para.listNumber ?? 1}.` : '•',
        bold: false,
        italic: false,
        underline: false,
      });
    }
    for (const run of para.runs) {
      for (const w of run.text.split(/\s+/)) {
        if (!w) continue;
        words.push({ text: w, bold: !!run.bold, italic: !!run.italic, underline: !!run.underline });
      }
    }

    // Greedy word wrap, measuring each word with its own font.
    let line: StyledWord[] = [];
    let lineWidth = 0;
    const spaceWidth = embedded.normal.widthOfTextAtSize(' ', fontSize);

    const drawLine = () => {
      if (!line.length) return;
      newPageIfNeeded(lineHeight);
      // line width incl. single spaces between words
      let total = 0;
      const widths = line.map((w) => {
        const f = pickFont(embedded, w.bold, w.italic);
        return f.widthOfTextAtSize(w.text, fontSize);
      });
      for (let i = 0; i < widths.length; i++) total += widths[i] + (i > 0 ? spaceWidth : 0);

      let x = margin;
      if (para.alignment === 'center') x = (width - total) / 2;
      else if (para.alignment === 'right') x = width - margin - total;

      // Underline segments: merge consecutive underlined words.
      let segStart: number | null = null;
      let segEnd = 0;
      const strokeSegment = () => {
        if (segStart !== null) {
          page.drawLine({
            start: { x: segStart, y: y - 2 },
            end: { x: segEnd, y: y - 2 },
            thickness: Math.max(0.75, fontSize / 16),
            color: textColor,
          });
          segStart = null;
        }
      };

      for (let i = 0; i < line.length; i++) {
        const w = line[i];
        const font = pickFont(embedded, w.bold, w.italic);
        page.drawText(w.text, { x, y, size: fontSize, font, color: textColor });
        if (w.underline) {
          if (segStart === null) segStart = x;
          segEnd = x + widths[i];
        } else {
          strokeSegment();
        }
        x += widths[i] + spaceWidth;
      }
      strokeSegment();
      y -= lineHeight;
    };

    for (const word of words) {
      const wordWidth = pickFont(embedded, word.bold, word.italic).widthOfTextAtSize(word.text, fontSize);
      const needed = line.length === 0 ? wordWidth : lineWidth + spaceWidth + wordWidth;
      if (line.length > 0 && needed > maxWidth) {
        drawLine();
        line = [];
        lineWidth = 0;
      }
      // A single overlong word (e.g. a long URL) can't wrap further; draw it anyway.
      line.push(word);
      lineWidth = line.length === 1 ? wordWidth : lineWidth + spaceWidth + wordWidth;
    }
    drawLine();

    y -= spaceAfter;

    if (p % 25 === 0) {
      onProgress?.(p / paragraphs.length);
      // Yield so the UI can paint the progress bar.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return { bytes: await pdf.save(), pageCount, paragraphCount: paragraphs.length };
}
