/**
 * PDFEdit CV Builder — PDF export engine (pdf-lib).
 *
 * Renders a CvDocument to a real, selectable-text A4 PDF:
 * - standard fonts embedded (no subsetting issues, ATS-parseable)
 * - automatic page breaking with orphan control (a section heading never
 *   strands alone at the bottom of a page)
 * - multi-page support (1–3+ pages flow naturally)
 * - optional profile photo embedded as JPEG/PNG
 *
 * Text is drawn with drawText (real text objects), never rasterized, so the
 * output stays selectable and ATS-friendly.
 */
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { CvDocument } from './types';
import { getTemplate, type CvTemplate, type CvFontId } from './templates';

const A4_W = 595.28;
const A4_H = 841.89;

function hexRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(v, 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

function stdFont(fontId: CvFontId, bold: boolean, italic: boolean): StandardFonts {
  if (fontId === 'times') {
    if (bold && italic) return StandardFonts.TimesRomanBoldItalic;
    if (bold) return StandardFonts.TimesRomanBold;
    if (italic) return StandardFonts.TimesRomanItalic;
    return StandardFonts.TimesRoman;
  }
  if (fontId === 'courier') {
    if (bold && italic) return StandardFonts.CourierBoldOblique;
    if (bold) return StandardFonts.CourierBold;
    if (italic) return StandardFonts.CourierOblique;
    return StandardFonts.Courier;
  }
  if (bold && italic) return StandardFonts.HelveticaBoldOblique;
  if (bold) return StandardFonts.HelveticaBold;
  if (italic) return StandardFonts.HelveticaOblique;
  return StandardFonts.Helvetica;
}

interface FontSet {
  heading: PDFFont;
  headingBold: PDFFont;
  headingItalic: PDFFont;
  body: PDFFont;
  bodyBold: PDFFont;
  bodyItalic: PDFFont;
}

async function embedFonts(doc: PDFDocument, tpl: CvTemplate): Promise<FontSet> {
  const [h, hB, hI, b, bB, bI] = await Promise.all([
    doc.embedFont(stdFont(tpl.fontHeading, false, false)),
    doc.embedFont(stdFont(tpl.fontHeading, true, false)),
    doc.embedFont(stdFont(tpl.fontHeading, false, true)),
    doc.embedFont(stdFont(tpl.fontBody, false, false)),
    doc.embedFont(stdFont(tpl.fontBody, true, false)),
    doc.embedFont(stdFont(tpl.fontBody, false, true)),
  ]);
  return { heading: h, headingBold: hB, headingItalic: hI, body: b, bodyBold: bB, bodyItalic: bI };
}

export interface CvExportResult {
  bytes: Uint8Array;
  fileName: string;
  pageCount: number;
}

interface Ctx {
  doc: PDFDocument;
  fonts: FontSet;
  tpl: CvTemplate;
  cv: CvDocument;
  accent: { r: number; g: number; b: number };
  heading: { r: number; g: number; b: number };
  body: { r: number; g: number; b: number };
  muted: { r: number; g: number; b: number };
  sidebarBg: { r: number; g: number; b: number };
  sidebarText: { r: number; g: number; b: number };
  headerBg: { r: number; g: number; b: number };
  margin: number;
  lineGap: number; // multiplier
  page: PDFPage;
  y: number; // current baseline cursor (from top)
  x0: number; // left edge of current column
  x1: number; // right edge of current column
  pageCount: number;
}

function wrap(font: PDFFont, text: string, size: number, maxW: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const trial = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(trial, size) <= maxW) {
      cur = trial;
    } else {
      if (cur) lines.push(cur);
      // hard-break an overlong single word
      let rest = w;
      cur = '';
      while (font.widthOfTextAtSize(rest, size) > maxW && rest.length > 1) {
        let cut = rest.length - 1;
        while (cut > 1 && font.widthOfTextAtSize(rest.slice(0, cut), size) > maxW) cut--;
        lines.push(rest.slice(0, cut));
        rest = rest.slice(cut);
      }
      cur = rest;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}

function textH(size: number, gap: number): number {
  return size * gap;
}

/** Ensure `need` points of vertical space; start a new page if not. Returns true if a break happened. */
function ensure(ctx: Ctx, need: number): boolean {
  if (ctx.y - need < ctx.margin) {
    newPage(ctx);
    return true;
  }
  return false;
}

function newPage(ctx: Ctx) {
  ctx.page = ctx.doc.addPage([A4_W, A4_H]);
  ctx.pageCount++;
  ctx.y = A4_H - ctx.margin;
}

function drawLine(
  ctx: Ctx,
  text: string,
  font: PDFFont,
  size: number,
  color: { r: number; g: number; b: number },
  opts: { align?: 'left' | 'center' | 'right'; x0?: number; x1?: number; gap?: number } = {}
) {
  const x0 = opts.x0 ?? ctx.x0;
  const x1 = opts.x1 ?? ctx.x1;
  const w = x1 - x0;
  const tw = font.widthOfTextAtSize(text, size);
  let x = x0;
  if (opts.align === 'center') x = x0 + (w - tw) / 2;
  if (opts.align === 'right') x = x1 - tw;
  ctx.page.drawText(text, { x, y: ctx.y - size, font, size, color: rgb(color.r, color.g, color.b) });
  ctx.y -= textH(size, opts.gap ?? ctx.lineGap);
}

function drawPara(
  ctx: Ctx,
  text: string,
  font: PDFFont,
  size: number,
  color: { r: number; g: number; b: number },
  opts: { x0?: number; x1?: number; gap?: number; firstLineIndent?: number } = {}
) {
  const x0 = opts.x0 ?? ctx.x0;
  const x1 = opts.x1 ?? ctx.x1;
  const lines = wrap(font, text, size, x1 - x0);
  for (const ln of lines) {
    ensure(ctx, textH(size, opts.gap ?? ctx.lineGap));
    ctx.page.drawText(ln, { x: x0, y: ctx.y - size, font, size, color: rgb(color.r, color.g, color.b) });
    ctx.y -= textH(size, opts.gap ?? ctx.lineGap);
  }
}

/** Draw a section title. Keeps the title with at least one following line (orphan control). */
function drawSectionTitle(ctx: Ctx, title: string, minFollow: number) {
  const tpl = ctx.tpl;
  const size = tpl.sectionTitleSize * ctx.cv.design.fontScale;
  const need = textH(size, 1.4) + 8 + minFollow;
  ensure(ctx, need);
  const y = ctx.y;
  const c = rgb(ctx.accent.r, ctx.accent.g, ctx.accent.b);
  if (tpl.sectionTitle === 'rule') {
    ctx.page.drawText(title.toUpperCase(), {
      x: ctx.x0,
      y: y - size,
      font: ctx.fonts.headingBold,
      size,
      color: rgb(ctx.heading.r, ctx.heading.g, ctx.heading.b),
    });
    ctx.page.drawLine({
      start: { x: ctx.x0, y: y - size - 5 },
      end: { x: ctx.x1, y: y - size - 5 },
      thickness: 0.75,
      color: c,
    });
    ctx.y = y - size - 12;
  } else if (tpl.sectionTitle === 'accent-bar') {
    ctx.page.drawRectangle({ x: ctx.x0, y: y - size - 4, width: 3, height: size + 4, color: c });
    ctx.page.drawText(title.toUpperCase(), {
      x: ctx.x0 + 9,
      y: y - size,
      font: ctx.fonts.headingBold,
      size,
      color: rgb(ctx.heading.r, ctx.heading.g, ctx.heading.b),
    });
    ctx.y = y - size - 11;
  } else if (tpl.sectionTitle === 'boxed') {
    const tw = ctx.fonts.headingBold.widthOfTextAtSize(title.toUpperCase(), size);
    ctx.page.drawRectangle({
      x: ctx.x0,
      y: y - size - 7,
      width: tw + 14,
      height: size + 12,
      color: c,
    });
    ctx.page.drawText(title.toUpperCase(), {
      x: ctx.x0 + 7,
      y: y - size,
      font: ctx.fonts.headingBold,
      size,
      color: rgb(1, 1, 1),
    });
    ctx.y = y - size - 14;
  } else {
    // uppercase
    ctx.page.drawText(title.toUpperCase(), {
      x: ctx.x0,
      y: y - size,
      font: ctx.fonts.headingBold,
      size,
      color: rgb(ctx.heading.r, ctx.heading.g, ctx.heading.b),
    });
    ctx.y = y - size - 6;
    ctx.page.drawLine({
      start: { x: ctx.x0, y: ctx.y },
      end: { x: ctx.x1, y: ctx.y },
      thickness: 0.5,
      color: rgb(0.85, 0.85, 0.85),
    });
    ctx.y -= 7;
  }
}

function contactLine(cv: CvDocument): string {
  const p = cv.personal;
  return [p.email, p.phone, p.location, p.website, p.linkedin].filter(Boolean).join('  •  ');
}

async function embedPhoto(ctx: Ctx, dataUrl: string): Promise<{ img: Awaited<ReturnType<PDFDocument['embedPng']>>; w: number; h: number } | null> {
  try {
    const [header, b64] = dataUrl.split(',');
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const isJpg = header.includes('jpeg') || header.includes('jpg');
    const img = isJpg ? await ctx.doc.embedJpg(bytes) : await ctx.doc.embedPng(bytes);
    const scale = 92 / Math.max(img.width, img.height);
    return { img, w: img.width * scale, h: img.height * scale };
  } catch {
    return null;
  }
}

/* ------------------------------ header styles ------------------------------ */

async function drawHeaderSingle(ctx: Ctx) {
  const { cv, tpl } = ctx;
  const p = cv.personal;
  const fs = cv.design.fontScale;
  const showPhoto = cv.design.showPhoto && p.photoDataUrl;
  const photo = showPhoto ? await embedPhoto(ctx, p.photoDataUrl!) : null;

  if (tpl.header === 'band') {
    const bandH = 92;
    ctx.page.drawRectangle({ x: 0, y: A4_H - bandH, width: A4_W, height: bandH, color: rgb(ctx.headerBg.r, ctx.headerBg.g, ctx.headerBg.b) });
    const nameC = tpl.headerBg === '#FFFFFF' ? ctx.heading : { r: 1, g: 1, b: 1 };
    const subC = tpl.headerBg === '#FFFFFF' ? ctx.muted : { r: 1, g: 1, b: 1 };
    const cx = A4_W / 2;
    const align = tpl.id === 'marketing-bold' ? 'center' : 'left';
    const x0 = align === 'center' ? 0 : ctx.margin;
    const x1 = align === 'center' ? A4_W : A4_W - ctx.margin;
    const prevY = ctx.y;
    ctx.y = A4_H - 34;
    const prevX0 = ctx.x0; const prevX1 = ctx.x1;
    ctx.x0 = x0; ctx.x1 = x1;
    drawLine(ctx, p.fullName || 'Your Name', ctx.fonts.headingBold, tpl.nameSize * fs, nameC, { align });
    if (p.title) drawLine(ctx, p.title, ctx.fonts.body, tpl.titleSize * fs, subC, { align });
    const contact = contactLine(cv);
    if (contact) drawPara(ctx, contact, ctx.fonts.body, tpl.smallSize * fs, subC, { x0, x1 });
    ctx.x0 = prevX0; ctx.x1 = prevX1;
    ctx.y = Math.min(prevY, A4_H - bandH - 18);
    void prevY;
    return;
  }

  if (tpl.header === 'monogram') {
    const initials = (p.fullName || 'YN').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    // Oversized initials as brand mark
    drawLine(ctx, initials, ctx.fonts.headingBold, tpl.nameSize * 1.6 * fs, ctx.accent, { align: 'left' });
    ctx.y -= 4;
    drawLine(ctx, p.fullName || 'Your Name', ctx.fonts.headingBold, tpl.nameSize * 0.85 * fs, ctx.heading, { align: 'left' });
    if (p.title) drawLine(ctx, p.title, ctx.fonts.body, tpl.titleSize * 0.9 * fs, ctx.muted, { align: 'left' });
    const contact = contactLine(cv);
    if (contact) drawPara(ctx, contact, ctx.fonts.body, tpl.smallSize * fs, ctx.muted, {});
    ctx.y -= 6;
    // Accent rule below header
    ctx.page.drawRectangle({ x: ctx.margin, y: ctx.y, width: ctx.x1 - ctx.x0, height: 2, color: rgb(ctx.accent.r, ctx.accent.g, ctx.accent.b) });
    ctx.y -= 10;
    return;
  }

  // centered / left headers (photo floats right when enabled)
  const align = tpl.header === 'centered' ? 'center' : 'left';
  const nameSize = tpl.nameSize * fs;
  if (photo && align === 'left') {
    ctx.page.drawImage(photo.img, {
      x: ctx.x1 - photo.w,
      y: ctx.y - photo.h,
      width: photo.w,
      height: photo.h,
    });
  }
  drawLine(ctx, p.fullName || 'Your Name', ctx.fonts.headingBold, nameSize, ctx.heading, { align });
  if (p.title) drawLine(ctx, p.title, ctx.fonts.bodyItalic, tpl.titleSize * fs, ctx.accent, { align });
  const contact = contactLine(cv);
  if (contact) {
    if (align === 'center') drawLine(ctx, contact, ctx.fonts.body, tpl.smallSize * fs, ctx.muted, { align: 'center' });
    else drawPara(ctx, contact, ctx.fonts.body, tpl.smallSize * fs, ctx.muted);
  }
  ctx.y -= 10;
}

/* ------------------------------ section bodies ------------------------------ */

function dateRange(start: string, end: string, current: boolean): string {
  const e = current ? 'Present' : end;
  if (start && e) return `${start} – ${e}`;
  return start || e || '';
}

function drawExperience(ctx: Ctx, items: CvDocument['sections'][number]['items']) {
  const fs = ctx.cv.design.fontScale;
  const bodySize = ctx.tpl.bodySize * fs;
  const smallSize = ctx.tpl.smallSize * fs;
  for (const raw of items) {
    const it = raw as Extract<CvDocument['sections'][number]['items'][number], { role: string }>;
    const headNeed = textH(bodySize, 1.3) * 2 + textH(smallSize, 1.2) + (it.bullets?.length || 0) * textH(bodySize, ctx.lineGap) + 10;
    // orphan control: keep the entry heading with at least its first bullet
    ensure(ctx, Math.min(headNeed, textH(bodySize, 1.3) * 4 + 10));
    const x0 = ctx.x0; const x1 = ctx.x1;
    const date = dateRange(it.startDate, it.endDate, it.current);
    const roleFont = ctx.fonts.bodyBold;
    const roleW = roleFont.widthOfTextAtSize(it.role || '', bodySize);
    const dateW = date ? ctx.fonts.body.widthOfTextAtSize(date, smallSize) : 0;
    ctx.page.drawText(it.role || '', { x: x0, y: ctx.y - bodySize, font: roleFont, size: bodySize, color: rgb(ctx.body.r, ctx.body.g, ctx.body.b) });
    if (date && roleW + dateW + 12 < x1 - x0) {
      ctx.page.drawText(date, { x: x1 - dateW, y: ctx.y - smallSize, font: ctx.fonts.body, size: smallSize, color: rgb(ctx.muted.r, ctx.muted.g, ctx.muted.b) });
    }
    ctx.y -= textH(bodySize, 1.3);
    const sub = [it.company, it.location].filter(Boolean).join(', ');
    if (sub) {
      drawLine(ctx, sub, ctx.fonts.bodyItalic, smallSize, ctx.muted, { x0, x1 });
    } else {
      ctx.y -= 2;
    }
    for (const b of it.bullets ?? []) {
      if (!b.trim()) continue;
      ensure(ctx, textH(bodySize, ctx.lineGap));
      ctx.page.drawText('•', { x: x0 + 2, y: ctx.y - bodySize, font: ctx.fonts.body, size: bodySize, color: rgb(ctx.body.r, ctx.body.g, ctx.body.b) });
      drawPara(ctx, b, ctx.fonts.body, bodySize, ctx.body, { x0: x0 + 12, x1 });
    }
    ctx.y -= 8;
  }
}

function drawEducation(ctx: Ctx, items: CvDocument['sections'][number]['items']) {
  const fs = ctx.cv.design.fontScale;
  const bodySize = ctx.tpl.bodySize * fs;
  const smallSize = ctx.tpl.smallSize * fs;
  for (const raw of items) {
    const it = raw as Extract<CvDocument['sections'][number]['items'][number], { degree: string }>;
    ensure(ctx, textH(bodySize, 1.3) * 3 + 8);
    const x0 = ctx.x0; const x1 = ctx.x1;
    const date = dateRange(it.startDate, it.endDate, false);
    ctx.page.drawText(it.degree || '', { x: x0, y: ctx.y - bodySize, font: ctx.fonts.bodyBold, size: bodySize, color: rgb(ctx.body.r, ctx.body.g, ctx.body.b) });
    if (date) {
      const dw = ctx.fonts.body.widthOfTextAtSize(date, smallSize);
      ctx.page.drawText(date, { x: x1 - dw, y: ctx.y - smallSize, font: ctx.fonts.body, size: smallSize, color: rgb(ctx.muted.r, ctx.muted.g, ctx.muted.b) });
    }
    ctx.y -= textH(bodySize, 1.3);
    const sub = [it.school, it.location].filter(Boolean).join(', ');
    if (sub) drawLine(ctx, sub, ctx.fonts.bodyItalic, smallSize, ctx.muted, { x0, x1 });
    if (it.details) drawPara(ctx, it.details, ctx.fonts.body, bodySize, ctx.body, { x0, x1 });
    ctx.y -= 8;
  }
}

function drawSkills(ctx: Ctx, items: CvDocument['sections'][number]['items']) {
  const fs = ctx.cv.design.fontScale;
  const bodySize = ctx.tpl.bodySize * fs;
  const names = items
    .map((raw) => (raw as { name?: string; title?: string }).name ?? (raw as { title?: string }).title ?? '')
    .filter(Boolean);
  if (!names.length) return;
  if (ctx.tpl.atsSafe) {
    drawPara(ctx, names.join(', '), ctx.fonts.body, bodySize, ctx.body);
  } else {
    // chip row(s)
    const x0 = ctx.x0; const x1 = ctx.x1;
    let cx = x0;
    let cy = ctx.y;
    const padX = 8; const padY = 5;
    const chipH = bodySize + padY * 2;
    for (const n of names) {
      const tw = ctx.fonts.body.widthOfTextAtSize(n, bodySize);
      const cw = tw + padX * 2;
      if (cx + cw > x1) {
        cx = x0;
        cy -= chipH + 6;
      }
      ensure(ctx, A4_H - cy + chipH > 0 ? chipH + 6 : chipH + 6);
      // recompute after potential page break
      if (cy < ctx.margin + chipH) {
        cx = x0;
        cy = ctx.y;
      }
      ctx.page.drawRectangle({ x: cx, y: cy - chipH, width: cw, height: chipH, color: rgb(0.96, 0.96, 0.97), borderColor: rgb(0.88, 0.88, 0.9), borderWidth: 0.5 });
      ctx.page.drawText(n, { x: cx + padX, y: cy - chipH + padY + 1, font: ctx.fonts.body, size: bodySize, color: rgb(ctx.body.r, ctx.body.g, ctx.body.b) });
      cx += cw + 6;
    }
    ctx.y = cy - chipH - 8;
  }
}

function drawSimpleList(ctx: Ctx, items: CvDocument['sections'][number]['items'], withSubtitleRight = false) {
  const fs = ctx.cv.design.fontScale;
  const bodySize = ctx.tpl.bodySize * fs;
  const smallSize = ctx.tpl.smallSize * fs;
  for (const raw of items) {
    const it = raw as { title?: string; subtitle?: string; date?: string; description?: string };
    const title = it.title ?? '';
    if (!title && !it.description) continue;
    ensure(ctx, textH(bodySize, 1.3) * 2 + 6);
    const x0 = ctx.x0; const x1 = ctx.x1;
    if (withSubtitleRight && it.date) {
      const dw = ctx.fonts.body.widthOfTextAtSize(it.date, smallSize);
      ctx.page.drawText(title, { x: x0, y: ctx.y - bodySize, font: ctx.fonts.bodyBold, size: bodySize, color: rgb(ctx.body.r, ctx.body.g, ctx.body.b) });
      ctx.page.drawText(it.date, { x: x1 - dw, y: ctx.y - smallSize, font: ctx.fonts.body, size: smallSize, color: rgb(ctx.muted.r, ctx.muted.g, ctx.muted.b) });
      ctx.y -= textH(bodySize, 1.3);
    } else {
      drawLine(ctx, title, ctx.fonts.bodyBold, bodySize, ctx.body, { x0, x1 });
    }
    const sub = [it.subtitle, !withSubtitleRight && it.date ? it.date : ''].filter(Boolean).join('  •  ');
    if (sub) drawLine(ctx, sub, ctx.fonts.body, smallSize, ctx.muted, { x0, x1 });
    if (it.description) drawPara(ctx, it.description, ctx.fonts.body, bodySize, ctx.body, { x0, x1 });
    ctx.y -= 6;
  }
}

function drawSectionBody(ctx: Ctx, section: CvDocument['sections'][number]) {
  const fs = ctx.cv.design.fontScale;
  const bodySize = ctx.tpl.bodySize * fs;
  switch (section.type) {
    case 'summary':
      if (section.body.trim()) drawPara(ctx, section.body, ctx.fonts.body, bodySize, ctx.body);
      break;
    case 'experience':
      drawExperience(ctx, section.items);
      break;
    case 'education':
      drawEducation(ctx, section.items);
      break;
    case 'skills':
      drawSkills(ctx, section.items);
      break;
    case 'certifications':
    case 'projects':
    case 'achievements':
      drawSimpleList(ctx, section.items, true);
      break;
    case 'languages':
    case 'interests':
      drawSimpleList(ctx, section.items, false);
      break;
    case 'references':
      if (section.body.trim()) drawPara(ctx, section.body, ctx.fonts.bodyItalic, bodySize, ctx.muted);
      else drawPara(ctx, 'Available upon request.', ctx.fonts.bodyItalic, bodySize, ctx.muted);
      break;
    case 'custom':
      if (section.body.trim()) drawPara(ctx, section.body, ctx.fonts.body, bodySize, ctx.body);
      else drawSimpleList(ctx, section.items, true);
      break;
  }
  ctx.y -= 6;
}

/* ------------------------------ main render ------------------------------ */

export async function exportCvPdf(cv: CvDocument, onProgress?: (msg: string) => void): Promise<CvExportResult> {
  const tpl = getTemplate(cv.design.templateId);
  onProgress?.('Preparing document…');
  const doc = await PDFDocument.create();
  const fonts = await embedFonts(doc, tpl);

  const margin = cv.design.marginPt;
  const base: Omit<Ctx, 'page' | 'y' | 'pageCount'> = {
    doc,
    fonts,
    tpl,
    cv,
    accent: hexRgb(cv.design.accentColor || tpl.accent),
    heading: hexRgb(tpl.headingColor),
    body: hexRgb(tpl.bodyColor),
    muted: hexRgb(tpl.mutedColor),
    sidebarBg: hexRgb(tpl.sidebarBg),
    sidebarText: hexRgb(tpl.sidebarText),
    headerBg: hexRgb(tpl.headerBg),
    margin,
    lineGap: cv.design.lineSpacing,
    x0: margin,
    x1: A4_W - margin,
  };

  const newCtx = (): Ctx => {
    const page = doc.addPage([A4_W, A4_H]);
    return { ...base, page, y: A4_H - margin, pageCount: 1 };
  };

  if (tpl.layout === 'sidebar') {
    return renderSidebar({ ...base, page: doc.addPage([A4_W, A4_H]), y: A4_H - margin, pageCount: 1 }, onProgress);
  }

  const ctx = newCtx();
  onProgress?.('Drawing header…');
  await drawHeaderSingle(ctx);

  const sections = cv.sections.filter((s) => s.visible);
  for (const s of sections) {
    if (s.type === 'summary' && !s.body.trim()) continue;
    if (s.type !== 'summary' && s.type !== 'references' && s.type !== 'custom' && !s.items.length && !s.body.trim()) continue;
    onProgress?.(`Drawing ${s.title}…`);
    // orphan control: title + at least ~2 lines of body must fit
    drawSectionTitle(ctx, s.title, ctx.tpl.bodySize * cv.design.fontScale * 2.6);
    drawSectionBody(ctx, s);
  }

  const bytes = await doc.save();
  const name = `${(cv.personal.fullName || 'cv').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-cv.pdf`;
  return { bytes, fileName: name, pageCount: ctx.pageCount };
}

async function renderSidebar(ctx: Ctx, onProgress?: (msg: string) => void): Promise<CvExportResult> {
  const { cv, tpl } = ctx;
  const p = cv.personal;
  const fs = cv.design.fontScale;
  const contentW = A4_W - ctx.margin * 2;
  const sbW = contentW * tpl.sidebarWidth;
  const mainX0 = ctx.margin + sbW + 18;
  const sbX0 = ctx.margin;
  const sbX1 = ctx.margin + sbW;

  // sidebar background (full first page; redrawn on continuation pages)
  const paintSidebar = () => {
    ctx.page.drawRectangle({ x: 0, y: 0, width: sbX1 + 9, height: A4_H, color: rgb(ctx.sidebarBg.r, ctx.sidebarBg.g, ctx.sidebarBg.b) });
  };
  paintSidebar();

  // --- sidebar content ---
  const sCtx: Ctx = { ...ctx, x0: sbX0 + 12, x1: sbX1 - 4, y: A4_H - ctx.margin };
  const stC = ctx.sidebarText;
  const photo = cv.design.showPhoto && p.photoDataUrl ? await embedPhoto(ctx, p.photoDataUrl) : null;
  if (photo) {
    sCtx.page.drawImage(photo.img, { x: sCtx.x0, y: sCtx.y - photo.h, width: photo.w, height: photo.h });
    sCtx.y -= photo.h + 12;
  }
  drawLine(sCtx, p.fullName || 'Your Name', ctx.fonts.headingBold, tpl.nameSize * fs, stC, { x0: sCtx.x0, x1: sCtx.x1 });
  if (p.title) drawLine(sCtx, p.title, ctx.fonts.bodyItalic, tpl.titleSize * fs, stC, { x0: sCtx.x0, x1: sCtx.x1 });
  sCtx.y -= 6;
  for (const c of [p.email, p.phone, p.location, p.website, p.linkedin].filter(Boolean)) {
    drawPara(sCtx, c, ctx.fonts.body, tpl.smallSize * fs, stC, { x0: sCtx.x0, x1: sCtx.x1 });
  }
  sCtx.y -= 8;

  const sideSections = cv.sections.filter((s) => s.visible && tpl.sidebarSections.includes(s.type));
  const mainSections = cv.sections.filter((s) => s.visible && !tpl.sidebarSections.includes(s.type));

  for (const s of sideSections) {
    if (s.type !== 'summary' && !s.items.length && !s.body.trim()) continue;
    ensure(sCtx, 40);
    const y0 = sCtx.y;
    sCtx.page.drawText(s.title.toUpperCase(), { x: sCtx.x0, y: y0 - tpl.sectionTitleSize * fs, font: ctx.fonts.headingBold, size: tpl.sectionTitleSize * fs, color: rgb(stC.r, stC.g, stC.b) });
    sCtx.y = y0 - tpl.sectionTitleSize * fs - 10;
    // temporarily swap colors so body text uses sidebar text color
    const savedBody = sCtx.body; const savedMuted = sCtx.muted; const savedAccent = sCtx.accent;
    sCtx.body = stC; sCtx.muted = stC; sCtx.accent = stC;
    drawSectionBody(sCtx, s);
    sCtx.body = savedBody; sCtx.muted = savedMuted; sCtx.accent = savedAccent;
  }

  // --- main column ---
  const mCtx: Ctx = { ...ctx, x0: mainX0, x1: A4_W - ctx.margin, y: A4_H - ctx.margin };
  onProgress?.('Drawing sections…');
  for (const s of mainSections) {
    if (s.type === 'summary' && !s.body.trim()) continue;
    if (s.type !== 'summary' && s.type !== 'references' && s.type !== 'custom' && !s.items.length && !s.body.trim()) continue;
    drawSectionTitle(mCtx, s.title, tpl.bodySize * fs * 2.6);
    // keep main column's page breaks in sync with the real page
    mCtx.page = ctx.page;
    drawSectionBody(mCtx, s);
    ctx.page = mCtx.page;
    ctx.pageCount = Math.max(ctx.pageCount, mCtx.pageCount);
  }

  const bytes = await ctx.doc.save();
  const name = `${(p.fullName || 'cv').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-cv.pdf`;
  return { bytes, fileName: name, pageCount: Math.max(ctx.pageCount, mCtx.pageCount) };
}
