/**
 * PDFEdit Studio — export engine.
 *
 * Builds the output PDF with pdf-lib:
 * - pages copied in user order (or created blank), user+native rotation applied
 * - every overlay layer drawn through geometry.ts (rotation-safe at 0/90/180/270)
 * - redactions drawn LAST as opaque vector rects (overlay-only — see note)
 * - optional form flattening
 *
 * REDACTION HONESTY: redaction boxes are burned in as opaque rectangles on top
 * of the page. They are NOT removable in a viewer, but the underlying page
 * content (e.g. text) still exists in the file and could be extracted by
 * forensic tools. The UI must state this clearly.
 */
import { PDFDocument, rgb, degrees, type RGB, type PDFImage } from 'pdf-lib';
import type { Layer, StudioPage, TextLayer, StrokeLayer, ShapeLayer, ImageLayer, StampLayer, RedactLayer } from './types';
import { STAMPS } from './types';
import { displayedSize, layerToNativeRect, strokePointToNative, nativeRotation, rotateAnchor, rotatePoint } from './geometry';
import { embedStudioFont, clearFontCache } from './fonts';

export interface ExportInput {
  srcBytes: Uint8Array;
  pages: StudioPage[];
  layers: Layer[];
  fileName: string;
  flatten: boolean;
  onProgress?: (msg: string) => void;
}

export interface ExportResult {
  bytes: Uint8Array;
  fileName: string;
  pageCount: number;
}

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(v, 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; kind: 'png' | 'jpg' } {
  const [header, b64] = dataUrl.split(',');
  const kind = header.includes('jpeg') || header.includes('jpg') ? 'jpg' : 'png';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, kind };
}

export async function exportStudioPdf(input: ExportInput): Promise<ExportResult> {
  const { srcBytes, pages, layers, fileName, flatten, onProgress } = input;
  clearFontCache();
  onProgress?.('Loading document…');
  const srcDoc = await PDFDocument.load(srcBytes.slice(), { ignoreEncryption: true });
  const outDoc = await PDFDocument.create();
  const imageCache = new Map<string, PDFImage>();

  async function embedImage(dataUrl: string): Promise<PDFImage> {
    const cached = imageCache.get(dataUrl);
    if (cached) return cached;
    const { bytes, kind } = dataUrlToBytes(dataUrl);
    const img = kind === 'jpg' ? await outDoc.embedJpg(bytes) : await outDoc.embedPng(bytes);
    imageCache.set(dataUrl, img);
    return img;
  }

  for (let i = 0; i < pages.length; i++) {
    const pageMeta = pages[i];
    onProgress?.(`Drawing page ${i + 1} of ${pages.length}…`);

    let page;
    if (pageMeta.isBlank || pageMeta.originalIndex < 0) {
      page = outDoc.addPage([595.28, 841.89]);
    } else {
      const [copied] = await outDoc.copyPages(srcDoc, [pageMeta.originalIndex]);
      // Absolute page rotation the viewer must apply (native /Rotate + user rotation).
      const cur = copied.getRotation().angle;
      copied.setRotation(degrees(((cur + pageMeta.rotation) % 360 + 360) % 360));
      outDoc.addPage(copied);
      page = copied;
    }

    const pageLayers = layers.filter((l) => l.pageIndex === i);
    // Redactions always drawn last (on top of everything).
    const ordered = [
      ...pageLayers.filter((l) => l.type !== 'redact'),
      ...pageLayers.filter((l) => l.type === 'redact'),
    ];

    for (const layer of ordered) {
      try {
        await drawLayer(outDoc, page, layer, pageMeta, embedImage);
      } catch (err) {
        console.warn('Studio export: failed to draw layer', layer.id, err);
      }
    }
  }

  if (flatten) {
    try {
      outDoc.getForm().flatten();
    } catch {
      /* no form */
    }
  }

  onProgress?.('Saving PDF…');
  const bytes = await outDoc.save();
  const outName = fileName.replace(/\.pdf$/i, '') + '-studio.pdf';
  return { bytes, fileName: outName, pageCount: pages.length };
}

type PageLike = ReturnType<PDFDocument['addPage']>;

async function drawLayer(
  outDoc: PDFDocument,
  page: PageLike,
  layer: Layer,
  pageMeta: StudioPage,
  embedImage: (dataUrl: string) => Promise<PDFImage>
): Promise<void> {
  switch (layer.type) {
    case 'text':
      await drawTextLayer(outDoc, page, layer, pageMeta);
      break;
    case 'stroke':
      drawStrokeLayer(page, layer, pageMeta);
      break;
    case 'shape':
      drawShapeLayer(page, layer, pageMeta);
      break;
    case 'image':
    case 'signature':
      await drawImageLayer(page, layer, pageMeta, embedImage);
      break;
    case 'stamp':
      await drawStampLayer(outDoc, page, layer, pageMeta);
      break;
    case 'redact':
      await drawRedactLayer(outDoc, page, layer, pageMeta);
      break;
  }
}

async function drawTextLayer(outDoc: PDFDocument, page: PageLike, layer: TextLayer, pageMeta: StudioPage) {
  if (!layer.text.trim()) return;
  const font = await embedStudioFont(outDoc, layer.fontId, layer.bold, layer.italic);
  const rect = layerToNativeRect(layer, pageMeta);
  const disp = displayedSize(pageMeta);
  const size = Math.max(4, layer.fontSize * disp.h);
  const theta = nativeRotation(layer.rotation);
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const color = hexToRgb(layer.color);
  const lines = layer.text.split('\n');
  const lineStep = size * layer.lineHeight;

  // drawText y = baseline; anchor box top in native y-up = rect.y + rect.h
  let baselineTop = rect.y + rect.h - size * 0.82;
  for (const line of lines) {
    const lineWidth = font.widthOfTextAtSize(line, size);
    let x = rect.x;
    if (layer.align === 'center') x = rect.x + (rect.w - lineWidth) / 2;
    else if (layer.align === 'right') x = rect.x + rect.w - lineWidth;
    // pdf-lib rotates about the (x,y) anchor; rotate the anchor about the
    // box center so it matches CSS transform-origin: center on screen.
    const anchor = rotateAnchor(x, baselineTop, cx, cy, theta);
    page.drawText(line, {
      x: anchor.x,
      y: anchor.y,
      size,
      font,
      color,
      opacity: layer.opacity,
      rotate: degrees(theta),
    });
    if (layer.underline && line.trim()) {
      const uy = baselineTop - size * 0.12;
      const u0 = rotatePoint(x, uy, cx, cy, theta);
      const u1 = rotatePoint(x + lineWidth, uy, cx, cy, theta);
      page.drawLine({
        start: u0,
        end: u1,
        thickness: Math.max(0.75, size / 14),
        color,
        opacity: layer.opacity,
      });
    }
    baselineTop -= lineStep;
  }
}

function drawStrokeLayer(page: PageLike, layer: StrokeLayer, pageMeta: StudioPage) {
  if (layer.points.length < 2) return;
  const disp = displayedSize(pageMeta);
  const thickness = Math.max(0.5, layer.width * disp.w);
  const color = hexToRgb(layer.color);
  const opacity = layer.kind === 'highlight' ? Math.min(layer.opacity, 0.45) : layer.opacity;
  const pts = layer.points.map((p) => strokePointToNative(p.x, p.y, pageMeta));
  for (let i = 1; i < pts.length; i++) {
    page.drawLine({
      start: pts[i - 1],
      end: pts[i],
      thickness,
      color,
      opacity,
    });
  }
}

function drawShapeLayer(page: PageLike, layer: ShapeLayer, pageMeta: StudioPage) {
  const rect = layerToNativeRect(layer, pageMeta);
  const disp = displayedSize(pageMeta);
  const thickness = Math.max(0.5, layer.strokeWidth * disp.w);
  const stroke = hexToRgb(layer.strokeColor);
  const fill = layer.fillColor ? hexToRgb(layer.fillColor) : undefined;
  const theta = nativeRotation(layer.rotation);
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const base = { borderColor: stroke, borderWidth: thickness, color: fill, opacity: layer.opacity };

  switch (layer.kind) {
    case 'rect': {
      // pdf-lib rotates rects about the (x,y) anchor; shift the anchor so the
      // rotation happens about the rect center (matches screen).
      const a = rotateAnchor(rect.x, rect.y, cx, cy, theta);
      page.drawRectangle({ x: a.x, y: a.y, width: rect.w, height: rect.h, ...base, rotate: degrees(theta) });
      break;
    }
    case 'ellipse':
      // pdf-lib already rotates ellipses about their center
      page.drawEllipse({
        x: cx,
        y: cy,
        xScale: rect.w / 2,
        yScale: rect.h / 2,
        ...base,
        rotate: degrees(theta),
      });
      break;
    case 'line': {
      const yMid = rect.y + rect.h / 2;
      page.drawLine({
        start: rotatePoint(rect.x, yMid, cx, cy, theta),
        end: rotatePoint(rect.x + rect.w, yMid, cx, cy, theta),
        thickness,
        color: stroke,
        opacity: layer.opacity,
      });
      break;
    }
    case 'arrow': {
      const yMid = rect.y + rect.h / 2;
      page.drawLine({
        start: rotatePoint(rect.x, yMid, cx, cy, theta),
        end: rotatePoint(rect.x + rect.w, yMid, cx, cy, theta),
        thickness,
        color: stroke,
        opacity: layer.opacity,
      });
      const head = Math.min(rect.w * 0.25, 14 + thickness * 2);
      const tip = rotatePoint(rect.x + rect.w, yMid, cx, cy, theta);
      const b1 = rotatePoint(rect.x + rect.w - head, yMid - head * 0.55, cx, cy, theta);
      const b2 = rotatePoint(rect.x + rect.w - head, yMid + head * 0.55, cx, cy, theta);
      page.drawSvgPath(`M ${tip.x} ${tip.y} L ${b1.x} ${b1.y} L ${b2.x} ${b2.y} Z`, {
        color: stroke,
        opacity: layer.opacity,
      });
      break;
    }
  }
}

async function drawImageLayer(
  page: PageLike,
  layer: ImageLayer | import('./types').SignatureLayer,
  pageMeta: StudioPage,
  embedImage: (dataUrl: string) => Promise<PDFImage>
) {
  const rect = layerToNativeRect(layer, pageMeta);
  const img = await embedImage(layer.dataUrl);
  const theta = nativeRotation(layer.rotation);
  const a = rotateAnchor(rect.x, rect.y, rect.x + rect.w / 2, rect.y + rect.h / 2, theta);
  page.drawImage(img, {
    x: a.x,
    y: a.y,
    width: rect.w,
    height: rect.h,
    opacity: layer.opacity,
    rotate: degrees(theta),
  });
}

async function drawStampLayer(outDoc: PDFDocument, page: PageLike, layer: StampLayer, pageMeta: StudioPage) {
  const rect = layerToNativeRect(layer, pageMeta);
  const def = STAMPS.find((s) => s.id === layer.stampId) ?? STAMPS[0];
  const color = hexToRgb(def.color);
  const theta = nativeRotation(layer.rotation);
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const font = await embedStudioFont(outDoc, 'arial', true, false);

  const ra = rotateAnchor(rect.x, rect.y, cx, cy, theta);
  page.drawRectangle({
    x: ra.x,
    y: ra.y,
    width: rect.w,
    height: rect.h,
    borderColor: color,
    borderWidth: Math.max(1.5, Math.min(rect.w, rect.h) * 0.06),
    opacity: layer.opacity,
    rotate: degrees(theta),
  });

  const size = Math.min(rect.h * 0.42, rect.w / Math.max(1, def.label.length) * 1.15);
  const textWidth = font.widthOfTextAtSize(def.label, size);
  const ta = rotateAnchor(rect.x + (rect.w - textWidth) / 2, rect.y + rect.h / 2 - size * 0.35, cx, cy, theta);
  page.drawText(def.label, {
    x: ta.x,
    y: ta.y,
    size,
    font,
    color,
    opacity: layer.opacity,
    rotate: degrees(theta),
  });
}

async function drawRedactLayer(outDoc: PDFDocument, page: PageLike, layer: RedactLayer, pageMeta: StudioPage) {
  const rect = layerToNativeRect(layer, pageMeta);
  const fill = layer.color === 'white' ? rgb(1, 1, 1) : rgb(0, 0, 0);
  page.drawRectangle({ x: rect.x, y: rect.y, width: rect.w, height: rect.h, color: fill, opacity: 1 });

  if (layer.label?.trim()) {
    const font = await embedStudioFont(outDoc, 'arial', true, false);
    const labelColor = layer.color === 'white' ? rgb(0, 0, 0) : rgb(1, 1, 1);
    const size = Math.min(11, rect.h * 0.5);
    if (size >= 6) {
      const tw = font.widthOfTextAtSize(layer.label, size);
      page.drawText(layer.label, {
        x: rect.x + (rect.w - tw) / 2,
        y: rect.y + rect.h / 2 - size * 0.35,
        size,
        font,
        color: labelColor,
      });
    }
  }
}
