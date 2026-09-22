/**
 * PDFEdit Studio — font registry.
 *
 * CONTRACT: every font listed here is offered in the UI. Arial, Helvetica,
 * Times New Roman and Courier New embed with true metrics via pdf-lib
 * StandardFonts. The rest preview on-screen in their real face and export
 * through the closest metric-compatible StandardFont — the dropdown labels
 * this honestly (see aliasNote), so the exported PDF never silently swaps a
 * font the user chose.
 */
import { PDFDocument, StandardFonts, type PDFFont } from 'pdf-lib';

export interface FontDef {
  id: string;
  /** user-facing label */
  label: string;
  /** real CSS family for on-canvas preview (falls back gracefully if not installed) */
  cssFamily: string;
  /** Word (.docx) font name for the Word exporter */
  wordFont: string;
}

export const STUDIO_FONTS: FontDef[] = [
  { id: 'arial', label: 'Arial', cssFamily: 'Arial, Helvetica, sans-serif', wordFont: 'Arial' },
  { id: 'helvetica', label: 'Helvetica', cssFamily: 'Helvetica, Arial, sans-serif', wordFont: 'Arial' },
  { id: 'times', label: 'Times New Roman', cssFamily: '"Times New Roman", Times, serif', wordFont: 'Times New Roman' },
  { id: 'courier', label: 'Courier New', cssFamily: '"Courier New", Courier, monospace', wordFont: 'Courier New' },
  { id: 'calibri', label: 'Calibri', cssFamily: 'Calibri, Carlito, "Segoe UI", Arial, sans-serif', wordFont: 'Calibri' },
  { id: 'cambria', label: 'Cambria', cssFamily: 'Cambria, Caladea, Georgia, serif', wordFont: 'Cambria' },
  { id: 'garamond', label: 'Garamond', cssFamily: 'Garamond, "EB Garamond", Georgia, serif', wordFont: 'Garamond' },
  { id: 'georgia', label: 'Georgia', cssFamily: 'Georgia, "Times New Roman", serif', wordFont: 'Georgia' },
  { id: 'palatino', label: 'Palatino Linotype', cssFamily: '"Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif', wordFont: 'Palatino Linotype' },
  { id: 'bookman', label: 'Bookman Old Style', cssFamily: '"Bookman Old Style", Bookman, Georgia, serif', wordFont: 'Bookman Old Style' },
  { id: 'trebuchet', label: 'Trebuchet MS', cssFamily: '"Trebuchet MS", Verdana, Arial, sans-serif', wordFont: 'Trebuchet MS' },
  { id: 'verdana', label: 'Verdana', cssFamily: 'Verdana, Arial, sans-serif', wordFont: 'Verdana' },
  { id: 'tahoma', label: 'Tahoma', cssFamily: 'Tahoma, Verdana, Arial, sans-serif', wordFont: 'Tahoma' },
  { id: 'segoe', label: 'Segoe UI', cssFamily: '"Segoe UI", Calibri, Arial, sans-serif', wordFont: 'Segoe UI' },
  { id: 'franklin', label: 'Franklin Gothic', cssFamily: '"Franklin Gothic Medium", "Franklin Gothic", Arial, sans-serif', wordFont: 'Franklin Gothic Medium' },
  { id: 'century', label: 'Century Gothic', cssFamily: '"Century Gothic", Futura, Arial, sans-serif', wordFont: 'Century Gothic' },
  { id: 'lucida', label: 'Lucida Sans', cssFamily: '"Lucida Sans", "Lucida Grande", Verdana, sans-serif', wordFont: 'Lucida Sans' },
  { id: 'impact', label: 'Impact', cssFamily: 'Impact, "Arial Black", sans-serif', wordFont: 'Impact' },
  { id: 'comicsans', label: 'Comic Sans MS', cssFamily: '"Comic Sans MS", "Comic Sans", cursive', wordFont: 'Comic Sans MS' },
];

type Family = 'helvetica' | 'times' | 'courier';

/**
 * Fonts without a StandardFonts equivalent map to the closest
 * metric-compatible embedded font. The UI labels them honestly via
 * fontAliasNote() — the exported glyphs always match the embedded font.
 */
const FAMILY_MAP: Record<string, { family: Family; aliasNote: string }> = {
  arial: { family: 'helvetica', aliasNote: '' },
  helvetica: { family: 'helvetica', aliasNote: '' },
  times: { family: 'times', aliasNote: '' },
  courier: { family: 'courier', aliasNote: '' },
  calibri: { family: 'helvetica', aliasNote: 'exports as Helvetica' },
  cambria: { family: 'times', aliasNote: 'exports as Times' },
  garamond: { family: 'times', aliasNote: 'exports as Times' },
  georgia: { family: 'times', aliasNote: 'exports as Times' },
  palatino: { family: 'times', aliasNote: 'exports as Times' },
  bookman: { family: 'times', aliasNote: 'exports as Times' },
  trebuchet: { family: 'helvetica', aliasNote: 'exports as Helvetica' },
  verdana: { family: 'helvetica', aliasNote: 'exports as Helvetica' },
  tahoma: { family: 'helvetica', aliasNote: 'exports as Helvetica' },
  segoe: { family: 'helvetica', aliasNote: 'exports as Helvetica' },
  franklin: { family: 'helvetica', aliasNote: 'exports as Helvetica' },
  century: { family: 'helvetica', aliasNote: 'exports as Helvetica' },
  lucida: { family: 'helvetica', aliasNote: 'exports as Helvetica' },
  impact: { family: 'helvetica', aliasNote: 'exports as Helvetica' },
  comicsans: { family: 'helvetica', aliasNote: 'exports as Helvetica' },
};

export function fontAliasNote(fontId: string): string {
  return FAMILY_MAP[fontId]?.aliasNote ?? '';
}

function standardFontFor(family: Family, bold: boolean, italic: boolean): StandardFonts {
  if (family === 'times') {
    if (bold && italic) return StandardFonts.TimesRomanBoldItalic;
    if (bold) return StandardFonts.TimesRomanBold;
    if (italic) return StandardFonts.TimesRomanItalic;
    return StandardFonts.TimesRoman;
  }
  if (family === 'courier') {
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

const fontCache = new Map<string, PDFFont>();

/**
 * Embed (and cache per-document) the correct StandardFont for a text layer.
 * Bold/italic always resolve to the true bold/italic font program — never faked.
 */
export async function embedStudioFont(
  doc: PDFDocument,
  fontId: string,
  bold: boolean,
  italic: boolean
): Promise<PDFFont> {
  const key = `${fontId}|${bold ? 'b' : ''}${italic ? 'i' : ''}`;
  const cached = fontCache.get(key);
  if (cached) return cached;
  const entry = FAMILY_MAP[fontId] ?? FAMILY_MAP.arial;
  const font = await doc.embedFont(standardFontFor(entry.family, bold, italic));
  fontCache.set(key, font);
  return font;
}

/** Clear the per-document font cache (call for each new export document). */
export function clearFontCache(): void {
  fontCache.clear();
}

export function cssFontFor(fontId: string, bold: boolean, italic: boolean): string {
  const def = STUDIO_FONTS.find((f) => f.id === fontId) ?? STUDIO_FONTS[0];
  const weight = bold ? '700' : '400';
  const style = italic ? 'italic' : 'normal';
  return `${style} ${weight} 16px ${def.cssFamily}`;
}

/** Word font name for the .docx exporter. */
export function wordFontFor(fontId: string): string {
  return STUDIO_FONTS.find((f) => f.id === fontId)?.wordFont ?? 'Arial';
}
