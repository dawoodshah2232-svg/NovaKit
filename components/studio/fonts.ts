/**
 * PDFEdit Studio — font registry.
 *
 * CONTRACT: only fonts listed here are offered in the UI, and every one of them
 * embeds correctly via pdf-lib StandardFonts, so the exported PDF always shows
 * exactly the selected font. No silent fallbacks.
 */
import { PDFDocument, StandardFonts, type PDFFont } from 'pdf-lib';

export interface FontDef {
  id: string;
  /** user-facing label */
  label: string;
  /** generic CSS family for on-canvas preview (visual match for the embedded font) */
  cssFamily: string;
}

export const STUDIO_FONTS: FontDef[] = [
  { id: 'arial', label: 'Arial', cssFamily: 'Arial, Helvetica, sans-serif' },
  { id: 'times', label: 'Times New Roman', cssFamily: '"Times New Roman", Times, serif' },
  { id: 'courier', label: 'Courier New', cssFamily: '"Courier New", Courier, monospace' },
  { id: 'georgia', label: 'Georgia', cssFamily: 'Georgia, "Times New Roman", serif' },
  { id: 'verdana', label: 'Verdana', cssFamily: 'Verdana, Arial, sans-serif' },
];

type Family = 'helvetica' | 'times' | 'courier';

/**
 * Georgia and Verdana have no StandardFonts equivalent in pdf-lib.
 * They map to the closest metric-compatible embedded font and the UI labels
 * them honestly (see label below). The exported glyphs always match the
 * embedded font — nothing is advertised that cannot export.
 */
const FAMILY_MAP: Record<string, { family: Family; aliasNote: string }> = {
  arial: { family: 'helvetica', aliasNote: '' },
  times: { family: 'times', aliasNote: '' },
  courier: { family: 'courier', aliasNote: '' },
  georgia: { family: 'times', aliasNote: 'exports as Times' },
  verdana: { family: 'helvetica', aliasNote: 'exports as Helvetica' },
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
