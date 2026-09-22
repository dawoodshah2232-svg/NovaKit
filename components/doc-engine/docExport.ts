/**
 * docExport — shared selectable-text PDF export for the document engine.
 *
 * One A4 page per document page. Text stays vector/selectable (pdf-lib
 * standard fonts mapped 1:1 from the DOC_FONTS screen stacks). Images with
 * rotation or cover-fit are pre-rasterized on an offscreen canvas so export
 * matches the screen exactly; other images are embedded directly.
 * Shapes/dividers ignore rotation in export (screen-only affordance).
 */

import {
  layersOnPage,
  type DocDividerLayer,
  type DocImageLayer,
  type DocShapeLayer,
  type DocStampLayer,
  type DocState,
  type DocTableLayer,
  type DocTextLayer,
} from '@/lib/doc-engine/types';
import type { PDFFont, PDFPage, RGB, Rotation } from 'pdf-lib';
import type { PDFDocument } from 'pdf-lib';

export async function exportDocPdf(doc: DocState, filename: string, pageIndices?: number[]): Promise<void> {
  const bytes = await docToPdfBytes(doc, pageIndices);
  downloadPdfBytes(bytes, filename);
}

export function downloadPdfBytes(bytes: Uint8Array, filename: string): void {
  try {
    const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename?.trim() || 'document'}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  } catch (err) {
    throw new Error('PDF export failed: ' + (err instanceof Error ? err.message : String(err)));
  }
}

/**
 * Open the normal browser print flow for a PDF: the PDF is rendered in a
 * hidden iframe and the browser's own print dialog is shown. Paper size,
 * orientation, copies and destination are chosen by the user in that dialog.
 */
export function printPdfBytes(bytes: Uint8Array, title: string): void {
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.title = title;
  iframe.src = url;
  const cleanup = () => {
    window.setTimeout(() => {
      iframe.remove();
      URL.revokeObjectURL(url);
    }, 1000);
  };
  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.alert('Could not open the print dialog automatically. The PDF was downloaded instead.');
      downloadPdfBytes(bytes, title);
    }
    const w = iframe.contentWindow;
    if (w) w.onafterprint = cleanup;
    window.setTimeout(cleanup, 60000);
  };
  document.body.appendChild(iframe);
}

export async function docToPdfBytes(doc: DocState, pageIndices?: number[]): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, degrees, rgb } = await import('pdf-lib');
  const pdf = await PDFDocument.create();

  const F = StandardFonts;
  const fonts: Record<string, PDFFont> = {
    sans: await pdf.embedFont(F.Helvetica),
    sansB: await pdf.embedFont(F.HelveticaBold),
    sansI: await pdf.embedFont(F.HelveticaOblique),
    sansBI: await pdf.embedFont(F.HelveticaBoldOblique),
    serif: await pdf.embedFont(F.TimesRoman),
    serifB: await pdf.embedFont(F.TimesRomanBold),
    serifI: await pdf.embedFont(F.TimesRomanItalic),
    serifBI: await pdf.embedFont(F.TimesRomanBoldItalic),
    mono: await pdf.embedFont(F.Courier),
    monoB: await pdf.embedFont(F.CourierBold),
    monoI: await pdf.embedFont(F.CourierOblique),
    monoBI: await pdf.embedFont(F.CourierBoldOblique),
  };

  const pageW = doc.page.widthPt;
  const pageH = doc.page.heightPt;
  const wanted = pageIndices && pageIndices.length > 0
    ? [...new Set(pageIndices)].filter((i) => i >= 0 && i < doc.pages.length).sort((a, b) => a - b)
    : doc.pages.map((_, i) => i);

  for (const pi of wanted) {
    const page = pdf.addPage([pageW, pageH]);
    // page background color (skip when the page has a full-page import image)
    const bg = doc.pages[pi].background;
    const pageBg = doc.pageBackground && doc.pageBackground.toLowerCase() !== '#ffffff' && !bg
      ? hexToRgb(doc.pageBackground, rgb)
      : null;
    if (pageBg) page.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: pageBg });
    if (bg) {
      await drawCoverImage(pdf, page, bg, 0, 0, pageW, pageH, 1);
    }
    for (const layer of layersOnPage(doc, pi)) {
      if (layer.opacity <= 0) continue;
      if (layer.type === 'text') {
        drawTextLayer(page, layer, fonts, rgb, degrees, pageW, pageH);
      } else if (layer.type === 'image') {
        await drawImageLayer(pdf, page, layer, pageW, pageH);
      } else if (layer.type === 'shape') {
        drawShapeLayer(page, layer, rgb, pageW, pageH);
      } else if (layer.type === 'table') {
        drawTableLayer(page, layer, fonts, rgb, pageW, pageH);
      } else if (layer.type === 'stamp') {
        drawStampLayer(page, layer, fonts, rgb, degrees, pageW, pageH);
      } else {
        drawDividerLayer(page, layer, rgb, pageW, pageH);
      }
    }
    drawHeaderFooter(page, doc, fonts, rgb, pageW, pageH);
  }

  return pdf.save();
}

/**
 * Parse a page-range string like "1-3,5" into 0-based page indices.
 * Returns null for empty/invalid input.
 */
export function parsePageRange(input: string, pageCount: number): number[] | null {
  const out = new Set<number>();
  for (const part of input.split(',')) {
    const t = part.trim();
    if (!t) continue;
    const m = t.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      const a = Math.min(Number(m[1]), Number(m[2]));
      const b = Math.max(Number(m[1]), Number(m[2]));
      for (let i = a; i <= b; i++) if (i >= 1 && i <= pageCount) out.add(i - 1);
    } else if (/^\d+$/.test(t)) {
      const n = Number(t);
      if (n >= 1 && n <= pageCount) out.add(n - 1);
    } else {
      return null;
    }
  }
  return out.size > 0 ? [...out].sort((a, b) => a - b) : null;
}

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function hexToRgb(hex: string, rgb: (r: number, g: number, b: number) => RGB): RGB {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  if (!Number.isFinite(n) || h.length !== 6) return rgb(0, 0, 0);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function drawHeaderFooter(
  page: PDFPage,
  doc: import('@/lib/doc-engine/types').DocState,
  fonts: Record<string, PDFFont>,
  rgb: (r: number, g: number, b: number) => RGB,
  pageW: number,
  pageH: number,
) {
  const size = Math.max(8, pageH * 0.016);
  const grey = rgb(0.42, 0.47, 0.55);
  const font = fonts.sans;
  const marginX = doc.margins.left * pageW;
  const avail = pageW - marginX - doc.margins.right * pageW;
  const drawLine = (text: string, y: number) => {
    const maxW = avail;
    let t = text;
    let w = font.widthOfTextAtSize(t, size);
    while (w > maxW && t.length > 1) {
      t = t.slice(0, -1);
      w = font.widthOfTextAtSize(t, size);
    }
    page.drawText(t, { x: marginX + (avail - w) / 2, y: y - size, size, font, color: grey });
  };
  if (doc.header) drawLine(doc.header, pageH - (doc.margins.top / 2) * pageH + size * 0.5);
  if (doc.footer) drawLine(doc.footer, (doc.margins.bottom / 2) * pageH + size * 0.5);
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const b64 = dataUrl.split(',')[1] ?? '';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function embedDataUrl(pdf: PDFDocument, dataUrl: string) {
  const bytes = dataUrlToBytes(dataUrl);
  if (dataUrl.startsWith('data:image/png')) return pdf.embedPng(bytes);
  return pdf.embedJpg(bytes);
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not decode image'));
    img.src = dataUrl;
  });
}

/**
 * Rasterize an image layer to exactly the target box (points), applying
 * cover-crop and clockwise rotation. Returns a PNG data URL.
 */
async function rasterizeImageLayer(layer: DocImageLayer, targetW: number, targetH: number): Promise<string> {
  const scale = 2;
  const tw = Math.max(2, Math.round(targetW * scale));
  const th = Math.max(2, Math.round(targetH * scale));
  const img = await loadImage(layer.dataUrl);

  // Cover-crop the source to the target aspect on a temp canvas sized to the
  // rotation diagonal so corners stay filled after rotation.
  const diag = Math.ceil(Math.sqrt(tw * tw + th * th));
  const tmp = document.createElement('canvas');
  tmp.width = diag;
  tmp.height = diag;
  const tctx = tmp.getContext('2d');
  if (!tctx) throw new Error('Canvas 2D not available');
  const tAspect = tw / th;
  const sAspect = img.naturalWidth / img.naturalHeight;
  let sw: number;
  let sh: number;
  if (sAspect > tAspect) {
    sh = img.naturalHeight;
    sw = sh * tAspect;
  } else {
    sw = img.naturalWidth;
    sh = sw / tAspect;
  }
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) / 2;
  tctx.drawImage(img, sx, sy, sw, sh, 0, 0, diag, diag);

  const canvas = document.createElement('canvas');
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D not available');
  if (layer.rotation) {
    ctx.translate(tw / 2, th / 2);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.drawImage(tmp, -diag / 2, -diag / 2);
  } else {
    ctx.drawImage(tmp, (tw - diag) / 2, (th - diag) / 2);
  }
  return canvas.toDataURL('image/png');
}

/* ------------------------------------------------------------------ */
/* text                                                                */
/* ------------------------------------------------------------------ */

interface PdfSeg {
  text: string;
  font: PDFFont;
  size: number;
  color: RGB;
  underline: boolean;
  width: number;
}

interface PdfToken extends PdfSeg {
  isSpace: boolean;
}

function drawTextLayer(
  page: PDFPage,
  layer: DocTextLayer,
  fonts: Record<string, PDFFont>,
  rgb: (r: number, g: number, b: number) => RGB,
  degrees: (d: number) => Rotation,
  pageW: number,
  pageH: number,
): void {
  const x0 = layer.x * pageW;
  const boxW = layer.w * pageW;
  const yTop = pageH - layer.y * pageH;
  const rot = layer.rotation ? degrees(layer.rotation) : undefined;
  let cursorY = yTop;
  let numbered = 0;

  for (const b of layer.blocks) {
    const align = b.align === 'justify' ? 'left' : b.align;
    const prefix = b.kind === 'bullet' ? '• ' : b.kind === 'numbered' ? `${++numbered}. ` : '';
    if (b.kind !== 'numbered') numbered = 0;

    // Flatten runs into styled tokens (words + whitespace).
    const tokens: PdfToken[] = [];
    const pushTokens = (text: string, seg: PdfSeg) => {
      for (const part of text.split(/(\s+)/g)) {
        if (!part) continue;
        tokens.push({
          ...seg,
          text: part,
          width: seg.font.widthOfTextAtSize(part, seg.size),
          isSpace: /^\s+$/.test(part),
        });
      }
    };
    for (const r of b.runs) {
      const size = (r.fontSize ?? layer.fontSize) * pageH;
      const key = `${r.fontId ?? layer.fontId}${r.bold ? 'B' : ''}${r.italic ? 'I' : ''}`;
      const font = fonts[key] ?? fonts.sans;
      const color = hexToRgb(r.color ?? layer.color, rgb);
      pushTokens(r.text, { text: '', font, size, color, underline: r.underline, width: 0 });
    }
    if (prefix) {
      const size = layer.fontSize * pageH;
      const font = fonts[layer.fontId] ?? fonts.sans;
      pushTokens(prefix, {
        text: '',
        font,
        size,
        color: hexToRgb(layer.color, rgb),
        underline: false,
        width: 0,
      });
    }

    // Greedy word wrap.
    const indent = b.kind === 'bullet' || b.kind === 'numbered' ? layer.fontSize * pageH * 1.1 : 0;
    const maxW = Math.max(10, boxW - indent);
    const lines: PdfToken[][] = [];
    let line: PdfToken[] = [];
    let lineW = 0;
    const lineWidth = (ls: PdfToken[]) => ls.reduce((a, t) => a + t.width, 0);
    for (const t of tokens) {
      if (t.isSpace && line.length === 0) continue; // no leading spaces
      // Hard-break tokens wider than the box.
      if (!t.isSpace && t.width > maxW) {
        let rest = t.text;
        while (rest) {
          let cut = rest.length;
          while (cut > 1 && t.font.widthOfTextAtSize(rest.slice(0, cut), t.size) > maxW) cut--;
          const piece = rest.slice(0, cut);
          const pw = t.font.widthOfTextAtSize(piece, t.size);
          if (lineW + pw > maxW && line.length > 0) {
            lines.push(line);
            line = [];
            lineW = 0;
          }
          line.push({ ...t, text: piece, width: pw });
          lineW += pw;
          rest = rest.slice(cut);
        }
        continue;
      }
      if (lineW + t.width > maxW && line.length > 0) {
        lines.push(line);
        line = [];
        lineW = 0;
        if (t.isSpace) continue;
      }
      line.push(t);
      lineW += t.width;
    }
    if (line.length > 0) lines.push(line);

    // Draw lines.
    for (const ln of lines) {
      const w = lineWidth(ln);
      const maxSize = Math.max(...ln.map((t) => t.size));
      const lineH = maxSize * layer.lineHeight;
      const baseline = cursorY - lineH * 0.82;
      let x = x0 + indent;
      if (align === 'center') x += (maxW - w) / 2;
      if (align === 'right') x += maxW - w;
      for (const t of ln) {
        if (t.text) {
          page.drawText(t.text, {
            x,
            y: baseline,
            size: t.size,
            font: t.font,
            color: t.color,
            opacity: layer.opacity,
            rotate: rot,
          });
          if (t.underline) {
            page.drawLine({
              start: { x, y: baseline - t.size * 0.12 },
              end: { x: x + t.width, y: baseline - t.size * 0.12 },
              thickness: Math.max(0.5, t.size / 16),
              color: t.color,
              opacity: layer.opacity,
            });
          }
        }
        x += t.width;
      }
      cursorY -= lineH;
    }
    cursorY -= b.spaceAfter * pageH;
  }
}

/* ------------------------------------------------------------------ */
/* images / shapes / dividers / backgrounds                            */
/* ------------------------------------------------------------------ */

async function drawCoverImage(
  pdf: PDFDocument,
  page: PDFPage,
  dataUrl: string,
  x: number,
  y: number,
  w: number,
  h: number,
  opacity: number,
): Promise<void> {
  try {
    const img = await embedDataUrl(pdf, dataUrl);
    const s = Math.max(w / img.width, h / img.height);
    const dw = img.width * s;
    const dh = img.height * s;
    page.drawImage(img, { x: x + (w - dw) / 2, y: y + (h - dh) / 2, width: dw, height: dh, opacity });
  } catch {
    // A corrupt background must not kill the whole export.
  }
}

async function drawImageLayer(
  pdf: PDFDocument,
  page: PDFPage,
  layer: DocImageLayer,
  pageW: number,
  pageH: number,
): Promise<void> {
  const boxX = layer.x * pageW;
  const boxW = layer.w * pageW;
  const boxH = layer.h * pageH;
  const boxTop = pageH - layer.y * pageH;
  try {
    if (layer.rotation !== 0 || layer.fit === 'cover') {
      const raster = await rasterizeImageLayer(layer, boxW, boxH);
      const img = await pdf.embedPng(dataUrlToBytes(raster));
      page.drawImage(img, { x: boxX, y: boxTop - boxH, width: boxW, height: boxH, opacity: layer.opacity });
      return;
    }
    const img = await embedDataUrl(pdf, layer.dataUrl);
    // contain
    const s = Math.min(boxW / img.width, boxH / img.height);
    const dw = img.width * s;
    const dh = img.height * s;
    page.drawImage(img, {
      x: boxX + (boxW - dw) / 2,
      y: boxTop - boxH + (boxH - dh) / 2,
      width: dw,
      height: dh,
      opacity: layer.opacity,
    });
  } catch {
    // Skip unloadable images rather than failing the export.
  }
}

function drawShapeLayer(
  page: PDFPage,
  layer: DocShapeLayer,
  rgb: (r: number, g: number, b: number) => RGB,
  pageW: number,
  pageH: number,
): void {
  // NOTE: rotation is a screen-only affordance for shapes/dividers; export
  // draws them unrotated.
  const x = layer.x * pageW;
  const w = layer.w * pageW;
  const h = layer.h * pageH;
  const yTop = pageH - layer.y * pageH;
  const strokeW = Math.max(0.5, layer.strokeWidth * pageW);
  if (layer.kind === 'line') {
    const midY = yTop - h / 2;
    page.drawLine({
      start: { x, y: midY },
      end: { x: x + w, y: midY },
      thickness: strokeW,
      color: hexToRgb(layer.stroke, rgb),
      opacity: layer.opacity,
    });
    return;
  }
  if (layer.kind === 'ellipse') {
    page.drawEllipse({
      x: x + w / 2,
      y: yTop - h / 2,
      xScale: w / 2,
      yScale: h / 2,
      color: layer.fill ? hexToRgb(layer.fill, rgb) : undefined,
      borderColor: hexToRgb(layer.stroke, rgb),
      borderWidth: strokeW,
      opacity: layer.opacity,
    });
    return;
  }
  page.drawRectangle({
    x,
    y: yTop - h,
    width: w,
    height: h,
    color: layer.fill ? hexToRgb(layer.fill, rgb) : undefined,
    borderColor: hexToRgb(layer.stroke, rgb),
    borderWidth: strokeW,
    opacity: layer.opacity,
  });
}

function drawDividerLayer(
  page: PDFPage,
  layer: DocDividerLayer,
  rgb: (r: number, g: number, b: number) => RGB,
  pageW: number,
  pageH: number,
): void {
  // NOTE: rotation ignored in export (see drawShapeLayer).
  const x = layer.x * pageW;
  const w = layer.w * pageW;
  const h = layer.h * pageH;
  const midY = pageH - layer.y * pageH - h / 2;
  const thickness = Math.max(0.5, layer.thickness * pageW);
  const color = hexToRgb(layer.color, rgb);
  if (layer.style === 'dashed') {
    const segLen = 6;
    const gap = 4;
    let cx = x;
    while (cx < x + w) {
      const ex = Math.min(x + w, cx + segLen);
      page.drawLine({ start: { x: cx, y: midY }, end: { x: ex, y: midY }, thickness, color, opacity: layer.opacity });
      cx = ex + gap;
    }
    return;
  }
  page.drawLine({
    start: { x, y: midY },
    end: { x: x + w, y: midY },
    thickness,
    color,
    opacity: layer.opacity,
  });
}

/* ------------------------------------------------------------------ */
/* tables / stamps                                                     */
/* ------------------------------------------------------------------ */

function drawTableLayer(
  page: PDFPage,
  layer: DocTableLayer,
  fonts: Record<string, PDFFont>,
  rgb: (r: number, g: number, b: number) => RGB,
  pageW: number,
  pageH: number,
): void {
  const x0 = layer.x * pageW;
  const w = layer.w * pageW;
  const h = layer.h * pageH;
  const yTop = pageH - layer.y * pageH;
  const borderW = Math.max(0.5, layer.borderWidth * pageW);
  const borderColor = hexToRgb(layer.borderColor, rgb);
  const fontSize = layer.fontSize * pageH;
  const font = fonts[layer.fontId] ?? fonts.sans;
  const fontB = fonts[`${layer.fontId}B`] ?? font;
  const color = hexToRgb(layer.color, rgb);

  const widths = layer.colWidths.length === layer.cols
    ? layer.colWidths
    : Array.from({ length: layer.cols }, () => 1 / layer.cols);
  const rowH = h / Math.max(1, layer.rows);

  // Header fills.
  if (layer.headerRow && layer.headerFill) {
    const fill = hexToRgb(layer.headerFill, rgb);
    page.drawRectangle({
      x: x0,
      y: yTop - rowH,
      width: w,
      height: rowH,
      color: fill,
      opacity: layer.opacity,
    });
  }

  // Grid.
  let cx = x0;
  const colX: number[] = [x0];
  for (let c = 0; c < layer.cols; c++) {
    cx += widths[c] * w;
    colX.push(cx);
  }
  for (let c = 0; c <= layer.cols; c++) {
    page.drawLine({
      start: { x: colX[c], y: yTop },
      end: { x: colX[c], y: yTop - h },
      thickness: borderW,
      color: borderColor,
      opacity: layer.opacity,
    });
  }
  for (let r = 0; r <= layer.rows; r++) {
    const y = yTop - r * rowH;
    page.drawLine({
      start: { x: x0, y },
      end: { x: x0 + w, y },
      thickness: borderW,
      color: borderColor,
      opacity: layer.opacity,
    });
  }

  // Cell text (single line, clipped to the cell).
  const padX = Math.max(2, fontSize * 0.35);
  for (let r = 0; r < layer.rows; r++) {
    for (let c = 0; c < layer.cols; c++) {
      const text = (layer.cells[r]?.[c] ?? '').trim();
      if (!text) continue;
      const cellW = widths[c] * w;
      const isHeader = r === 0 && layer.headerRow;
      const f = isHeader ? fontB : font;
      let size = fontSize;
      let tw = f.widthOfTextAtSize(text, size);
      if (tw > cellW - padX * 2 && tw > 0) {
        size = Math.max(4, (size * (cellW - padX * 2)) / tw);
        tw = f.widthOfTextAtSize(text, size);
      }
      const baseline = yTop - r * rowH - rowH / 2 - size * 0.35;
      page.drawText(text, {
        x: colX[c] + padX,
        y: baseline,
        size,
        font: f,
        color,
        opacity: layer.opacity,
        maxWidth: Math.max(1, cellW - padX * 2),
      });
    }
  }
}

function drawStampLayer(
  page: PDFPage,
  layer: DocStampLayer,
  fonts: Record<string, PDFFont>,
  rgb: (r: number, g: number, b: number) => RGB,
  degrees: (d: number) => Rotation,
  pageW: number,
  pageH: number,
): void {
  const x = layer.x * pageW;
  const w = layer.w * pageW;
  const h = layer.h * pageH;
  const yTop = pageH - layer.y * pageH;
  const color = hexToRgb(layer.color, rgb);
  const borderW = Math.max(1.5, layer.fontSize * pageH * 0.14);
  const rot = layer.rotation ? degrees(layer.rotation) : undefined;

  if (layer.shape === 'round') {
    page.drawEllipse({
      x: x + w / 2,
      y: yTop - h / 2,
      xScale: w / 2,
      yScale: h / 2,
      borderColor: color,
      borderWidth: borderW,
      opacity: layer.opacity,
    });
  } else {
    page.drawRectangle({
      x,
      y: yTop - h,
      width: w,
      height: h,
      borderColor: color,
      borderWidth: borderW,
      opacity: layer.opacity,
    });
  }

  const font = fonts.sansB ?? fonts.sans;
  let size = layer.fontSize * pageH;
  const label = layer.label.toUpperCase();
  let tw = font.widthOfTextAtSize(label, size);
  const maxW = (layer.shape === 'round' ? w * 0.62 : w * 0.8);
  if (tw > maxW && tw > 0) {
    size = Math.max(4, (size * maxW) / tw);
    tw = font.widthOfTextAtSize(label, size);
  }
  page.drawText(label, {
    x: x + (w - tw) / 2,
    y: yTop - h / 2 - size * 0.35,
    size,
    font,
    color,
    opacity: layer.opacity,
    rotate: rot,
  });
}
