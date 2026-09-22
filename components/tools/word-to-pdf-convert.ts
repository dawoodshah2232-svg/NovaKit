import JSZip from 'jszip';
import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';

/**
 * Pure, UI-free DOCX -> PDF conversion logic.
 *
 * Verified capabilities of this pipeline (do not advertise more than this):
 * - Reads word/document.xml from the .docx zip and extracts paragraphs/runs.
 * - Supports: paragraphs, headings H1-H6, bold, italic, underline,
 *   left/center/right alignment, bullet lists, and simple decimal numbered lists.
 * - Fonts: each run's font name, size and color are read from the document.
 *   Font names are mapped to metric-compatible open fonts (Calibri -> Carlito,
 *   Cambria -> Caladea, Arial -> Arimo, Times New Roman -> Tinos,
 *   Courier New -> Cousine), fetched on demand from the jsDelivr fontsource CDN
 *   and embedded with pdf-lib. Unknown fonts fall back to a close equivalent;
 *   if the CDN is unreachable the converter falls back to built-in Helvetica.
 * - Sizes come from the document (half-points -> pt); heading styles without an
 *   explicit size use 18/16/14 pt; body default is 11 pt.
 * - Images, charts, text boxes, headers/footers, footnotes: not parsed.
 * - Tables: cell text is extracted but the table grid/borders/structure are lost.
 */

export interface ParsedRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  /** Font name as declared in the DOCX (e.g. "Calibri"). */
  fontName?: string;
  /** Font size in points (converted from half-points). */
  fontSize?: number;
  /** Text color as 6-digit hex (e.g. "FF0000"). */
  color?: string;
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
  fontKey: string;
  size: number;
  color: { r: number; g: number; b: number };
  underline: boolean;
}

type FontId = 'carlito' | 'caladea' | 'arimo' | 'tinos' | 'cousine';

/** Common Word fonts -> metric-compatible open-font replacements. */
const FONT_ID_MAP: Record<string, FontId> = {
  calibri: 'carlito',
  carlito: 'carlito',
  cambria: 'caladea',
  caladea: 'caladea',
  arial: 'arimo',
  arimo: 'arimo',
  helvetica: 'arimo',
  'liberation sans': 'arimo',
  'times new roman': 'tinos',
  times: 'tinos',
  tinos: 'tinos',
  'liberation serif': 'tinos',
  georgia: 'tinos',
  'courier new': 'cousine',
  courier: 'cousine',
  cousine: 'cousine',
  'liberation mono': 'cousine',
  consolas: 'cousine',
  verdana: 'arimo',
  tahoma: 'arimo',
  'segoe ui': 'arimo',
  'trebuchet ms': 'arimo',
};

const DEFAULT_FONT_ID: FontId = 'carlito'; // Word's own default body font is Calibri
const DEFAULT_BODY_PT = 11;

function mapFontId(name: string | undefined): FontId {
  if (!name) return DEFAULT_FONT_ID;
  return FONT_ID_MAP[name.trim().toLowerCase()] ?? DEFAULT_FONT_ID;
}

const FONT_CDN = 'https://cdn.jsdelivr.net/fontsource/fonts';
const fontBytesCache = new Map<string, ArrayBuffer>();

async function fetchFontBytes(id: FontId, weight: 400 | 700, style: 'normal' | 'italic'): Promise<ArrayBuffer> {
  const key = `${id}/${weight}/${style}`;
  const hit = fontBytesCache.get(key);
  if (hit) return hit;
  const res = await fetch(`${FONT_CDN}/${id}@latest/latin-${weight}-${style}.ttf`);
  if (!res.ok) throw new Error(`Font download failed (${res.status}) for ${key}.`);
  const buf = await res.arrayBuffer();
  fontBytesCache.set(key, buf);
  return buf;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex, 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
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

      // Font name from run properties (w:rPr may appear before the w:t nodes).
      const rPr = runXml.match(/<w:rPr>[\s\S]*?<\/w:rPr>/)?.[0] ?? '';
      const fontName =
        rPr.match(/<w:rFonts[^>]*?\bw:ascii="([^"]+)"/)?.[1] ??
        rPr.match(/<w:rFonts[^>]*?\bw:hAnsi="([^"]+)"/)?.[1] ??
        undefined;
      const sizeHalfPt = rPr.match(/<w:sz\s+w:val="(\d+)"\s*\/>/)?.[1];
      const colorHex = rPr.match(/<w:color\s+w:val="([0-9A-Fa-f]{6})"\s*\/>/)?.[1];

      runs.push({
        text,
        bold: runXml.includes('<w:b/>') || runXml.includes('<w:b ') || runXml.includes('<w:b>'),
        italic: runXml.includes('<w:i/>') || runXml.includes('<w:i ') || runXml.includes('<w:i>'),
        underline:
          /<w:u(\s|\/|>)/.test(runXml) && !runXml.includes('w:val="none"'),
        fontName,
        fontSize: sizeHalfPt ? parseInt(sizeHalfPt, 10) / 2 : undefined,
        color: colorHex,
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

export interface RenderResult {
  bytes: Uint8Array;
  pageCount: number;
  paragraphCount: number;
}

export async function renderPdf(
  paragraphs: ParsedParagraph[],
  onProgress?: (fraction: number) => void
): Promise<RenderResult> {
  const pdf = await PDFDocument.create();

  // Collect every (family, weight, style) combination the document actually uses.
  const neededKeys = new Set<string>();
  for (const para of paragraphs) {
    for (const run of para.runs) {
      const id = mapFontId(run.fontName);
      const weight = run.bold ? 700 : 400;
      const style = run.italic ? 'italic' : 'normal';
      neededKeys.add(`${id}|${weight}|${style}`);
    }
  }

  // Embed each needed variant; fall back to built-in Helvetica if the CDN fails.
  const embedded = new Map<string, PDFFont>();
  let fallback: Record<string, PDFFont> | null = null;
  const getFallback = async (weight: number, style: string): Promise<PDFFont> => {
    if (!fallback) {
      fallback = {
        '400|normal': await pdf.embedFont(StandardFonts.Helvetica),
        '700|normal': await pdf.embedFont(StandardFonts.HelveticaBold),
        '400|italic': await pdf.embedFont(StandardFonts.HelveticaOblique),
        '700|italic': await pdf.embedFont(StandardFonts.HelveticaBoldOblique),
      };
    }
    return fallback[`${weight}|${style}`];
  };
  for (const key of neededKeys) {
    const [id, weightStr, style] = key.split('|');
    try {
      const bytes = await fetchFontBytes(id as FontId, Number(weightStr) as 400 | 700, style as 'normal' | 'italic');
      embedded.set(key, await pdf.embedFont(bytes));
    } catch {
      embedded.set(key, await getFallback(Number(weightStr), style));
    }
  }

  const fontFor = (key: string): PDFFont => {
    const f = embedded.get(key);
    if (!f) throw new Error('Internal error: font was not embedded.');
    return f;
  };

  const margin = 54;
  const width = 612;
  const height = 792;
  const maxWidth = width - margin * 2;
  const defaultColor = { r: 0.1, g: 0.1, b: 0.1 };

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

    // Flatten runs into styled words, preserving each run's formatting.
    const words: StyledWord[] = [];
    if (para.isListItem) {
      words.push({
        text: para.listType === 'decimal' ? `${para.listNumber ?? 1}.` : '•',
        fontKey: `${DEFAULT_FONT_ID}|400|normal`,
        size: DEFAULT_BODY_PT,
        color: defaultColor,
        underline: false,
      });
    }
    for (const run of para.runs) {
      const id = mapFontId(run.fontName);
      const fontKey = `${id}|${run.bold ? 700 : 400}|${run.italic ? 'italic' : 'normal'}`;
      const size =
        run.fontSize ??
        (para.isHeading
          ? para.headingLevel === 1
            ? 18
            : para.headingLevel === 2
              ? 16
              : 14
          : DEFAULT_BODY_PT);
      const color = run.color ? hexToRgb(run.color) : defaultColor;
      for (const w of run.text.split(/\s+/)) {
        if (!w) continue;
        words.push({ text: w, fontKey, size, color, underline: !!run.underline });
      }
    }

    // Greedy word wrap, measuring each word with its own font and size.
    let line: StyledWord[] = [];
    let lineWidth = 0;

    const drawLine = () => {
      if (!line.length) return;
      const lineHeight = Math.max(...line.map((w) => w.size)) * 1.35;
      newPageIfNeeded(lineHeight);

      const widths = line.map((w) => fontFor(w.fontKey).widthOfTextAtSize(w.text, w.size));
      const spaceWidth = fontFor(line[0].fontKey).widthOfTextAtSize(' ', line[0].size);
      let total = 0;
      for (let i = 0; i < widths.length; i++) total += widths[i] + (i > 0 ? spaceWidth : 0);

      let x = margin;
      if (para.alignment === 'center') x = (width - total) / 2;
      else if (para.alignment === 'right') x = width - margin - total;

      // Underline segments: merge consecutive underlined words.
      let segStart: number | null = null;
      let segEnd = 0;
      let segColor = defaultColor;
      let segSize = 11;
      const strokeSegment = () => {
        if (segStart !== null) {
          page.drawLine({
            start: { x: segStart, y: y - 2 },
            end: { x: segEnd, y: y - 2 },
            thickness: Math.max(0.75, segSize / 16),
            color: rgb(segColor.r, segColor.g, segColor.b),
          });
          segStart = null;
        }
      };

      for (let i = 0; i < line.length; i++) {
        const w = line[i];
        const font = fontFor(w.fontKey);
        page.drawText(w.text, {
          x,
          y,
          size: w.size,
          font,
          color: rgb(w.color.r, w.color.g, w.color.b),
        });
        if (w.underline) {
          if (segStart === null) {
            segStart = x;
            segColor = w.color;
            segSize = w.size;
          }
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
      const wordWidth = fontFor(word.fontKey).widthOfTextAtSize(word.text, word.size);
      const spaceWidth = fontFor(word.fontKey).widthOfTextAtSize(' ', word.size);
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

    y -= 8;

    if (p % 25 === 0) {
      onProgress?.(p / paragraphs.length);
      // Yield so the UI can paint the progress bar.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return { bytes: await pdf.save(), pageCount, paragraphCount: paragraphs.length };
}
