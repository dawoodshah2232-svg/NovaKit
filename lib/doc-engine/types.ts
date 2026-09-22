/**
 * PDFEdit Document Engine — shared model for Studio V2 and CV Builder V2.
 *
 * Design: absolute-positioned layers on A4 pages (same normalized-coordinate
 * contract as the Studio layer model), with rich-text layers for a Word-like
 * feel. One engine powers document creation, CV editing, and future products
 * (invoices, proposals, contracts, certificates).
 *
 * Coordinate contract:
 * - x, y, w, h are NORMALIZED (0..1) relative to the displayed page, y-down
 *   from top-left. A4 aspect is fixed: 1 x-unit = 595.28pt, 1 y-unit = 841.89pt.
 * - fontSize is a fraction of the displayed page HEIGHT (0..1).
 * - strokeWidth is a fraction of the displayed page WIDTH (0..1).
 * - rotation is degrees clockwise, opacity 0..1.
 */

export const A4_WIDTH_PT = 595.28;
export const A4_HEIGHT_PT = 841.89;
export const A4_ASPECT = A4_WIDTH_PT / A4_HEIGHT_PT;

/* ------------------------------------------------------------------ */
/* Page sizes                                                          */
/* ------------------------------------------------------------------ */

export interface DocPageSize {
  label: string;
  /** points (1/72 inch) */
  widthPt: number;
  /** points (1/72 inch) */
  heightPt: number;
}

export const PT_PER_IN = 72;
export const MM_PER_IN = 25.4;
export const PX_PER_PT = 96 / 72; // CSS px at 96 DPI

export const mmToPt = (mm: number): number => (mm / MM_PER_IN) * PT_PER_IN;
export const inToPt = (inch: number): number => inch * PT_PER_IN;
/** CSS px interpreted at 96 DPI. */
export const pxToPt = (px: number): number => (px / 96) * PT_PER_IN;

export type PageSizeUnit = 'mm' | 'inch' | 'px';

export function pageSizeFromCustom(w: number, h: number, unit: PageSizeUnit, label = 'Custom'): DocPageSize {
  const toPt = unit === 'mm' ? mmToPt : unit === 'inch' ? inToPt : pxToPt;
  return { label, widthPt: Math.max(36, toPt(w)), heightPt: Math.max(36, toPt(h)) };
}

export const A4_PAGE: DocPageSize = { label: 'A4', widthPt: A4_WIDTH_PT, heightPt: A4_HEIGHT_PT };
export const A3_PAGE: DocPageSize = { label: 'A3', widthPt: mmToPt(297), heightPt: mmToPt(420) };
export const A5_PAGE: DocPageSize = { label: 'A5', widthPt: mmToPt(148), heightPt: mmToPt(210) };
export const LETTER_PAGE: DocPageSize = { label: 'Letter', widthPt: inToPt(8.5), heightPt: inToPt(11) };
export const LEGAL_PAGE: DocPageSize = { label: 'Legal', widthPt: inToPt(8.5), heightPt: inToPt(14) };

export const PAGE_PRESETS: DocPageSize[] = [A4_PAGE, A3_PAGE, A5_PAGE, LETTER_PAGE, LEGAL_PAGE];

export function pageWithOrientation(page: DocPageSize, orientation: 'portrait' | 'landscape'): DocPageSize {
  const portrait = page.heightPt >= page.widthPt;
  if (orientation === 'portrait' && !portrait) {
    return { ...page, label: `${page.label} · Portrait`, widthPt: page.heightPt, heightPt: page.widthPt };
  }
  if (orientation === 'landscape' && portrait) {
    return { ...page, label: `${page.label} · Landscape`, widthPt: page.heightPt, heightPt: page.widthPt };
  }
  return page;
}

export const pageAspect = (page: DocPageSize): number => page.widthPt / page.heightPt;

export function describePageSize(page: DocPageSize): string {
  const mm = (pt: number) => Math.round((pt / PT_PER_IN) * MM_PER_IN);
  return `${page.label} · ${mm(page.widthPt)}×${mm(page.heightPt)} mm`;
}

/* ------------------------------------------------------------------ */
/* Fonts — screen stacks map 1:1 to pdf-lib StandardFonts for export   */
/* ------------------------------------------------------------------ */

export type DocFontId = 'sans' | 'serif' | 'mono';

export interface DocFont {
  id: DocFontId;
  label: string;
  /** CSS font stack used on screen */
  stack: string;
}

export const DOC_FONTS: DocFont[] = [
  {
    id: 'sans',
    label: 'Sans',
    stack: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Arial, sans-serif",
  },
  {
    id: 'serif',
    label: 'Serif',
    stack: "Georgia, 'Times New Roman', Times, serif",
  },
  {
    id: 'mono',
    label: 'Mono',
    stack: "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace",
  },
];

export function fontStack(id: string): string {
  return DOC_FONTS.find((f) => f.id === id)?.stack ?? DOC_FONTS[0].stack;
}

/* ------------------------------------------------------------------ */
/* Rich text                                                           */
/* ------------------------------------------------------------------ */

export type DocBlockKind = 'h1' | 'h2' | 'h3' | 'paragraph' | 'bullet' | 'numbered';
export type DocAlign = 'left' | 'center' | 'right' | 'justify';

export interface DocTextRun {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  /** null = inherit layer default */
  color: string | null;
  /** null = inherit layer default; fraction of page height */
  fontSize: number | null;
  /** null = inherit layer default */
  fontId: DocFontId | null;
}

export interface DocTextBlock {
  id: string;
  kind: DocBlockKind;
  align: DocAlign;
  runs: DocTextRun[];
  /** extra space after block, fraction of page height */
  spaceAfter: number;
}

export function run(text: string, style: Partial<Omit<DocTextRun, 'text'>> = {}): DocTextRun {
  return {
    text,
    bold: false,
    italic: false,
    underline: false,
    color: null,
    fontSize: null,
    fontId: null,
    ...style,
  };
}

export function block(
  kind: DocBlockKind,
  runs: DocTextRun[] | string,
  opts: Partial<Omit<DocTextBlock, 'id' | 'kind' | 'runs'>> = {},
): DocTextBlock {
  return {
    id: newId('blk'),
    kind,
    align: 'left',
    runs: typeof runs === 'string' ? [run(runs)] : runs,
    spaceAfter: 0.004,
    ...opts,
  };
}

/* ------------------------------------------------------------------ */
/* Layers                                                              */
/* ------------------------------------------------------------------ */

export type DocLayerType = 'text' | 'image' | 'shape' | 'divider' | 'table' | 'stamp';

interface DocLayerBase {
  id: string;
  type: DocLayerType;
  /** index into doc.pages */
  pageIndex: number;
  /** normalized 0..1, top-left, y-down */
  x: number;
  y: number;
  w: number;
  h: number;
  /** degrees clockwise */
  rotation: number;
  /** 0..1 */
  opacity: number;
  locked?: boolean;
  /**
   * Tags a layer that follows the template accent color so design panels
   * can recolor it when the accent changes.
   */
  accent?: boolean;
  /** section grouping (used by CV Builder: move/hide a whole section) */
  groupId?: string;
  groupLabel?: string;
}

export interface DocTextLayer extends DocLayerBase {
  type: 'text';
  blocks: DocTextBlock[];
  fontId: DocFontId;
  /** default font size, fraction of page height */
  fontSize: number;
  color: string;
  /** line-height multiplier */
  lineHeight: number;
}

export interface DocImageLayer extends DocLayerBase {
  type: 'image';
  dataUrl: string;
  imageKind: 'png' | 'jpg';
  fit: 'cover' | 'contain';
}

export type DocShapeKind = 'rect' | 'ellipse' | 'line';

export interface DocShapeLayer extends DocLayerBase {
  type: 'shape';
  kind: DocShapeKind;
  fill: string | null;
  stroke: string;
  /** fraction of page width */
  strokeWidth: number;
}

export interface DocDividerLayer extends DocLayerBase {
  type: 'divider';
  color: string;
  /** fraction of page width */
  thickness: number;
  style: 'solid' | 'dashed';
}

export interface DocTableLayer extends DocLayerBase {
  type: 'table';
  rows: number;
  cols: number;
  /** rows x cols plain-text cells */
  cells: string[][];
  /** per-column widths as fractions of the layer width (sum = 1) */
  colWidths: number[];
  headerRow: boolean;
  borderColor: string;
  /** fraction of page width */
  borderWidth: number;
  headerFill: string | null;
  fontId: DocFontId;
  /** fraction of page height */
  fontSize: number;
  color: string;
  /** line-height multiplier */
  lineHeight: number;
}

export type DocStampShape = 'rect' | 'round';

export interface DocStampLayer extends DocLayerBase {
  type: 'stamp';
  label: string;
  color: string;
  shape: DocStampShape;
  /** fraction of page height */
  fontSize: number;
}

export type DocLayer = DocTextLayer | DocImageLayer | DocShapeLayer | DocDividerLayer | DocTableLayer | DocStampLayer;

export interface DocPage {
  key: string;
  /** rendered under layers; used for PDF-import backgrounds */
  background: string | null;
}

/** Page margins as fractions of page width (left/right) and height (top/bottom). */
export interface DocMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const DEFAULT_MARGINS: DocMargins = { top: 0.06, right: 0.075, bottom: 0.06, left: 0.075 };

export interface DocState {
  /** page dimensions for every page in the document */
  page: DocPageSize;
  pages: DocPage[];
  layers: DocLayer[];
  /** margin guides (visual) + header/footer placement reference */
  margins: DocMargins;
  /** page background color (default white) */
  pageBackground: string;
  /** repeated text at the top of every page (null = none) */
  header: string | null;
  /** repeated text at the bottom of every page (null = none) */
  footer: string | null;
}

export interface DocTemplate {
  id: string;
  label: string;
  description: string;
  build: () => DocState;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function newId(prefix = 'doc'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

export function blankPage(): DocPage {
  return { key: newId('pg'), background: null };
}

export function blankDoc(page: DocPageSize = A4_PAGE): DocState {
  return { page, pages: [blankPage()], layers: [], ...docDefaults() };
}

/** Default document-level settings (margins, background, header/footer). */
export function docDefaults(): Pick<DocState, 'margins' | 'pageBackground' | 'header' | 'footer'> {
  return { margins: { ...DEFAULT_MARGINS }, pageBackground: '#ffffff', header: null, footer: null };
}

export function makeTextLayer(
  partial: Partial<DocTextLayer> & { blocks: DocTextBlock[] },
): DocTextLayer {
  return {
    id: newId('txt'),
    type: 'text',
    pageIndex: 0,
    x: 0.1,
    y: 0.1,
    w: 0.8,
    h: 0.1,
    rotation: 0,
    opacity: 1,
    fontId: 'sans',
    fontSize: 0.016,
    color: '#1c1a16',
    lineHeight: 1.45,
    ...partial,
  };
}

export function makeImageLayer(
  partial: Partial<DocImageLayer> & { dataUrl: string },
): DocImageLayer {
  const kind: 'png' | 'jpg' = partial.dataUrl.startsWith('data:image/png') ? 'png' : 'jpg';
  return {
    id: newId('img'),
    type: 'image',
    pageIndex: 0,
    x: 0.3,
    y: 0.3,
    w: 0.4,
    h: 0.25,
    rotation: 0,
    opacity: 1,
    fit: 'cover',
    ...partial,
    imageKind: partial.imageKind ?? kind,
  };
}

export function makeShapeLayer(partial: Partial<DocShapeLayer> = {}): DocShapeLayer {
  return {
    id: newId('shp'),
    type: 'shape',
    pageIndex: 0,
    x: 0.3,
    y: 0.3,
    w: 0.4,
    h: 0.12,
    rotation: 0,
    opacity: 1,
    kind: 'rect',
    fill: '#b91c1c',
    stroke: '#7f1d1d',
    strokeWidth: 0.003,
    ...partial,
  };
}

export function makeDividerLayer(partial: Partial<DocDividerLayer> = {}): DocDividerLayer {
  return {
    id: newId('div'),
    type: 'divider',
    pageIndex: 0,
    x: 0.1,
    y: 0.2,
    w: 0.8,
    h: 0.004,
    rotation: 0,
    opacity: 1,
    color: '#d9d2c2',
    thickness: 0.002,
    style: 'solid',
    ...partial,
  };
}

/** Layers on a page, in paint order (array order = back to front). */
export function layersOnPage(doc: DocState, pageIndex: number): DocLayer[] {
  return doc.layers.filter((l) => l.pageIndex === pageIndex);
}

export function makeTableLayer(
  partial: Partial<DocTableLayer> & { rows?: number; cols?: number },
): DocTableLayer {
  const rows = Math.min(12, Math.max(1, Math.round(partial.rows ?? 3)));
  const cols = Math.min(8, Math.max(1, Math.round(partial.cols ?? 3)));
  const cells: string[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) =>
      partial.cells?.[r]?.[c] ?? (r === 0 && (partial.headerRow ?? true) ? `Header ${c + 1}` : ''),
    ),
  );
  return {
    id: newId('tbl'),
    type: 'table',
    pageIndex: 0,
    x: 0.15,
    y: 0.3,
    w: 0.7,
    h: 0.16,
    rotation: 0,
    opacity: 1,
    rows,
    cols,
    cells: partial.cells ?? cells,
    colWidths: partial.colWidths ?? Array.from({ length: cols }, () => 1 / cols),
    headerRow: true,
    borderColor: '#9a958a',
    borderWidth: 0.0012,
    headerFill: '#f3f0e9',
    fontId: 'sans',
    fontSize: 0.0135,
    color: '#1c1a16',
    lineHeight: 1.4,
    ...partial,
  };
}

export function makeStampLayer(
  partial: Partial<DocStampLayer> & { label: string },
): DocStampLayer {
  const { label, ...rest } = partial;
  return {
    id: newId('stp'),
    type: 'stamp',
    pageIndex: 0,
    x: 0.35,
    y: 0.35,
    w: 0.3,
    h: 0.075,
    rotation: -8,
    opacity: 0.92,
    label,
    color: '#b91c1c',
    shape: 'rect',
    fontSize: 0.02,
    ...rest,
  };
}

/** Distinct section groups in document order. */
export function docSections(doc: DocState): Array<{ id: string; label: string; pageIndex: number }> {
  const seen = new Map<string, { id: string; label: string; pageIndex: number }>();
  for (const l of doc.layers) {
    if (l.groupId && !seen.has(l.groupId)) {
      seen.set(l.groupId, {
        id: l.groupId,
        label: l.groupLabel ?? 'Section',
        pageIndex: l.pageIndex,
      });
    }
  }
  return [...seen.values()];
}
