/**
 * PDFEdit Studio — in-place text editing ("Edit text" tool).
 *
 * The Studio renders PDF pages as raster images, so the document's own text is
 * not editable by default. This module bridges that gap:
 *
 *  1. `extractTextLines` pulls the page's real text runs via pdf.js
 *     `getTextContent()`, positions them with the page viewport transform,
 *     and groups them into lines.
 *  2. `matchFont` maps the PDF's font name to the closest Studio font
 *     (honestly flagged when it's only an approximation).
 *  3. `sampleLineColors` reads the rendered page pixels to recover the text
 *     color and the page background color behind the line.
 *
 * Editing a line creates two ordinary layers — a background-colored rectangle
 * (covers the original glyphs) plus a text layer with the matched styling —
 * so undo/redo, selection, the Inspector, and the existing exporter all keep
 * working with zero changes.
 */

import type { PDFDocumentProxy } from 'pdfjs-dist';

/** One editable line of the PDF's own text, in DISPLAYED-page normalized coords (0..1, y-down). */
export interface PdfTextLine {
  id: string;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** fraction of displayed page height */
  fontSize: number;
  /** unpadded top of the actual glyphs (no padding) — use for text layer placement */
  glyphY: number;
  /** normalized baseline position of the glyphs */
  baselineY: number;
  fontId: string;
  bold: boolean;
  italic: boolean;
  /** hex, sampled from the rendered page ('' until sampled) */
  color: string;
  /** hex page background sampled near the line ('' until sampled) */
  bg: string;
  /** false when the background behind the line is busy (image/gradient) — use a tight cover */
  bgReliable: boolean;
  /** true when the PDF font had no close Studio match */
  approxFont: boolean;
}

interface RawItem {
  str: string;
  x: number; // baseline start, viewport px @scale 1
  top: number; // viewport px @scale 1
  fontH: number; // viewport px @scale 1
  widthPx: number; // measured, viewport px @scale 1
  fontName: string;
  hasEOL: boolean;
}

/** Multiply two 2D affine transforms (6-element arrays). */
function mul(m1: number[], m2: number[]): number[] {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
}

function normAngle(a: number): number {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

let measureCtx: CanvasRenderingContext2D | null = null;
/** Approximate rendered width of a string at a given pixel height (generic sans metrics). */
function measureWidth(str: string, px: number): number {
  try {
    if (!measureCtx) {
      const c = document.createElement('canvas');
      measureCtx = c.getContext('2d');
    }
    if (measureCtx) {
      measureCtx.font = '16px Arial, sans-serif';
      return (measureCtx.measureText(str).width / 16) * px;
    }
  } catch {
    /* noop — fall through to estimate */
  }
  return str.length * px * 0.55;
}

export interface MatchedFont {
  fontId: string;
  bold: boolean;
  italic: boolean;
  approx: boolean;
}

/**
 * Map a PDF font name (often subset-prefixed like "ABCDEF+ArialMT-Bold") to
 * the closest Studio font. Only Arial/Times/Courier embed with true metrics
 * via pdf-lib StandardFonts; the rest are offered as labeled aliases.
 */
export function matchFont(rawFamily: string | undefined): MatchedFont {
  const cleaned = (rawFamily ?? '')
    .replace(/^[A-Z0-9]{6}\+/, '') // strip subset prefix
    .toLowerCase()
    .replace(/[-_,]/g, '');
  const bold = /bold|black|heavy|demi|medium|\bbd\b/.test(cleaned);
  const italic = /italic|oblique|slant|\bit\b/.test(cleaned);

  const has = (s: string) => cleaned.includes(s);
  // Exact document workhorses first.
  if (has('times')) return { fontId: 'times', bold, italic, approx: false };
  if (has('courier')) return { fontId: 'courier', bold, italic, approx: false };
  if (has('arial') || has('helvetica') || has('arialmt')) return { fontId: 'arial', bold, italic, approx: false };
  // Common office fonts → labeled aliases (honest export note in the UI).
  if (has('calibri') || has('carlito')) return { fontId: 'calibri', bold, italic, approx: false };
  if (has('cambria') || has('caladea')) return { fontId: 'cambria', bold, italic, approx: false };
  if (has('garamond')) return { fontId: 'garamond', bold, italic, approx: false };
  if (has('palatino') || has('bookantiqua')) return { fontId: 'palatino', bold, italic, approx: false };
  if (has('bookman')) return { fontId: 'bookman', bold, italic, approx: false };
  if (has('trebuchet')) return { fontId: 'trebuchet', bold, italic, approx: false };
  if (has('tahoma')) return { fontId: 'tahoma', bold, italic, approx: false };
  if (has('segoe')) return { fontId: 'segoe', bold, italic, approx: false };
  if (has('georgia')) return { fontId: 'georgia', bold, italic, approx: false };
  if (has('verdana')) return { fontId: 'verdana', bold, italic, approx: false };
  if (has('franklin')) return { fontId: 'franklin', bold, italic, approx: false };
  if (has('lucida')) return { fontId: 'lucida', bold, italic, approx: false };
  if (has('century')) return { fontId: 'century', bold, italic, approx: false };
  if (has('impact')) return { fontId: 'impact', bold, italic, approx: false };
  if (has('comicsans')) return { fontId: 'comicsans', bold, italic, approx: false };
  // Fallbacks by family class — flagged as approximations.
  if (has('mono') || has('typewriter') || has('couriernew') || has('consolas') || has('menlo'))
    return { fontId: 'courier', bold, italic, approx: true };
  if (has('serif') || has('roman') || has('didot') || has('bodoni') || has('caslon') || has('minion'))
    return { fontId: 'times', bold, italic, approx: true };
  if (has('sans') || has('gothic') || has('futura') || has('geneva') || has('optima') || has('arialnarrow'))
    return { fontId: 'arial', bold, italic, approx: true };
  return { fontId: 'arial', bold, italic, approx: true };
}

/**
 * Extract editable text lines for one page.
 * @param pageNumber 1-based page number in the SOURCE document
 * @param totalRotation degrees clockwise applied to the displayed page
 */
export async function extractTextLines(
  pdfDoc: PDFDocumentProxy,
  pageNumber: number,
  totalRotation: number
): Promise<PdfTextLine[]> {
  const pdfPage = await pdfDoc.getPage(pageNumber);
  const viewport = pdfPage.getViewport({ scale: 1, rotation: totalRotation });
  const tc = await pdfPage.getTextContent();
  const styles = (tc as unknown as { styles?: Record<string, { fontFamily?: string; ascent?: number }> }).styles ?? {};
  const items = (tc.items ?? []) as unknown as Array<{
    str?: string;
    transform?: number[];
    fontName?: string;
    hasEOL?: boolean;
  }>;

  const raw: RawItem[] = [];
  for (const it of items) {
    const str = it.str ?? '';
    if (!str.trim() || !it.transform || it.transform.length < 6) continue;
    const tx = mul(viewport.transform, it.transform);
    const angle = normAngle(Math.atan2(tx[1], tx[0]));
    if (Math.abs(angle) > 0.09) continue; // ~5° — only near-horizontal text
    const fontH = Math.hypot(tx[2], tx[3]);
    if (fontH < 2 || !Number.isFinite(fontH)) continue;
    const style = it.fontName ? styles[it.fontName] : undefined;
    const ascent = style && style.ascent ? Math.min(1.1, Math.max(0.6, style.ascent)) : 0.8;
    raw.push({
      str,
      x: tx[4],
      top: tx[5] - fontH * ascent,
      fontH,
      widthPx: measureWidth(str, fontH),
      fontName: it.fontName ?? '',
      hasEOL: !!it.hasEOL,
    });
  }
  if (raw.length === 0) return [];

  // Group into lines by vertical position.
  raw.sort((a, b) => a.top - b.top || a.x - b.x);
  const rows: RawItem[][] = [];
  for (const it of raw) {
    const last = rows[rows.length - 1];
    const lastH = last ? Math.max(...last.map((r) => r.fontH)) : 0;
    if (last && Math.abs(it.top - last[0].top) <= Math.max(it.fontH, lastH) * 0.45 && !last[0].hasEOL) {
      last.push(it);
    } else {
      rows.push([it]);
    }
    // hasEOL forces the next item onto a fresh row
    if (it.hasEOL) rows.push([]);
  }
  const nonEmpty = rows.filter((r) => r.length > 0);

  const vw = viewport.width;
  const vh = viewport.height;
  const lines: PdfTextLine[] = [];
  nonEmpty.forEach((row, ri) => {
    const ordered = [...row].sort((a, b) => a.x - b.x);
    // Join items: insert a space only where the horizontal gap between items
    // looks like a real word space (avoids splitting kerned words apart and
    // avoids gluing separate words together).
    let joined = '';
    ordered.forEach((r, i) => {
      if (i > 0) {
        const prev = ordered[i - 1];
        const gap = r.x - (prev.x + prev.widthPx);
        if (!/\s$/.test(prev.str) && !/^\s/.test(r.str) && gap > r.fontH * 0.18) {
          joined += ' ';
        }
      }
      joined += r.str;
    });
    const text = joined.replace(/\s+/g, ' ').trim();
    if (!text) return;
    const fontH = Math.max(...ordered.map((r) => r.fontH));
    const minX = Math.min(...ordered.map((r) => r.x));
    const maxR = Math.max(...ordered.map((r) => r.x + r.widthPx));
    const minTop = Math.min(...ordered.map((r) => r.top));
    // Majority font in the row wins.
    const fontCounts = new Map<string, number>();
    for (const r of ordered) fontCounts.set(r.fontName, (fontCounts.get(r.fontName) ?? 0) + 1);
    const topFont = [...fontCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
    const matched = matchFont(styles[topFont]?.fontFamily);
    const padX = fontH * 0.12;
    const padY = fontH * 0.18;
    const hPx = fontH * 1.28 + padY * 2;
    const glyphTopPx = minTop; // unpadded top of the actual glyphs
    const ascent = 0.8; // matches the ascent used when grouping
    lines.push({
      id: `pdfline_${ri}_${Math.random().toString(36).slice(2, 8)}`,
      text,
      x: clamp01((minX - padX) / vw),
      y: clamp01((minTop - padY) / vh),
      w: clamp01((maxR - minX + padX * 2) / vw),
      h: clamp01(hPx / vh),
      fontSize: clamp01(fontH / vh),
      glyphY: clamp01(glyphTopPx / vh),
      baselineY: clamp01((glyphTopPx + fontH * ascent) / vh),
      fontId: matched.fontId,
      bold: matched.bold,
      italic: matched.italic,
      color: '',
      bg: '',
      bgReliable: true,
      approxFont: matched.approx,
    });
  });
  return lines;
}

function luminance(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function toHex(r: number, g: number, b: number): string {
  const h = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

/**
 * Sample the rendered page pixels to recover each line's text color and
 * background color.
 *
 * Text color: median of the darkest third of samples across the glyph band —
 * robust against anti-aliased edges and stray pixels (a single darkest pixel
 * is usually noise, which is what made old edits look "destroyed").
 *
 * Background: median of the lightest third of samples from a ring just
 * outside the line box. If those samples vary wildly (image, gradient, or
 * rule lines behind the text), the background is flagged unreliable so the
 * caller can use a tight glyph-band cover instead of painting a solid block
 * over the artwork.
 */
export function sampleLineColors(
  getPixel: (nx: number, ny: number) => [number, number, number] | null,
  line: PdfTextLine
): { color: string; bg: string; bgReliable: boolean } {
  const glyphSamples: Array<{ l: number; rgb: [number, number, number] }> = [];
  for (let i = 0; i < 14; i++) {
    const px = getPixel(line.x + (line.w * (i + 0.5)) / 14, line.glyphY + line.fontSize * 0.45);
    if (!px) continue;
    glyphSamples.push({ l: luminance(px[0], px[1], px[2]), rgb: px });
  }
  let color = '#1f2937';
  if (glyphSamples.length > 0) {
    glyphSamples.sort((a, b) => a.l - b.l);
    const darkest = glyphSamples.slice(0, Math.max(1, Math.ceil(glyphSamples.length / 3)));
    const med = darkest[Math.floor(darkest.length / 2)];
    // Ignore near-white samples (missed glyphs) — fall back to near-black text.
    if (med.l < 225) color = toHex(med.rgb[0], med.rgb[1], med.rgb[2]);
    else color = '#111827';
  }

  const bgSamples: Array<{ l: number; rgb: [number, number, number] }> = [];
  for (let i = 0; i < 8; i++) {
    const nx = clamp01(line.x + (line.w * (i + 0.5)) / 8);
    for (const ny of [line.y - 0.008, line.y + line.h + 0.008]) {
      const px = getPixel(nx, clamp01(ny));
      if (!px) continue;
      bgSamples.push({ l: luminance(px[0], px[1], px[2]), rgb: px });
    }
  }
  let bg = '#ffffff';
  let bgReliable = true;
  if (bgSamples.length > 0) {
    bgSamples.sort((a, b) => a.l - b.l);
    const lightest = bgSamples.slice(Math.floor((bgSamples.length * 2) / 3));
    const med = lightest[Math.floor(lightest.length / 2)];
    bg = toHex(med.rgb[0], med.rgb[1], med.rgb[2]);
    // High spread among background samples => busy background (image/gradient).
    const spread = bgSamples[bgSamples.length - 1].l - bgSamples[0].l;
    bgReliable = spread < 60;
  }
  return { color, bg, bgReliable };
}
