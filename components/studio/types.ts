/**
 * PDFEdit Studio — core layer & document model.
 *
 * Coordinate contract (used by canvas, selection, history AND export):
 * - Every layer stores geometry NORMALIZED (0..1) relative to the DISPLAYED page
 *   (the page as the user sees it, after native + user rotation), y-down from top-left.
 * - `geometry.ts` converts displayed coords -> native PDF coords (points, y-up)
 *   accounting for total page rotation. Export must always go through it.
 * - fontSize is stored as a fraction of the DISPLAYED page height (0..1).
 * - strokeWidth is stored as a fraction of the DISPLAYED page width (0..1).
 */

export type ToolId =
  | 'select'
  | 'text'
  | 'edittext'
  | 'draw'
  | 'highlight'
  | 'shape'
  | 'image'
  | 'signature'
  | 'stamp'
  | 'redact'
  | 'pages';

export type LayerType =
  | 'text'
  | 'stroke'
  | 'shape'
  | 'image'
  | 'signature'
  | 'stamp'
  | 'redact';

export interface LayerBase {
  id: string;
  type: LayerType;
  /** index into the pages array (document order, follows reorder) */
  pageIndex: number;
  /** normalized 0..1, top-left, displayed page, y-down */
  x: number;
  y: number;
  w: number;
  h: number;
  /** object rotation in degrees clockwise, relative to displayed view */
  rotation: number;
  /** 0..1 */
  opacity: number;
}

export interface TextLayer extends LayerBase {
  type: 'text';
  text: string;
  fontId: string;
  /** fraction of displayed page height */
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  color: string;
  /** background highlight behind the text runs; null = none */
  highlightColor: string | null;
  align: 'left' | 'center' | 'right' | 'justify';
  list: 'none' | 'bullet' | 'numbered';
  lineHeight: number;
}

export interface StrokeLayer extends LayerBase {
  type: 'stroke';
  /** 'draw' | 'highlight' */
  kind: 'draw' | 'highlight';
  /** normalized points, y-down, relative to displayed page */
  points: Array<{ x: number; y: number }>;
  color: string;
  /** fraction of displayed page width */
  width: number;
}

export type ShapeKind = 'rect' | 'ellipse' | 'line' | 'arrow';

export interface ShapeLayer extends LayerBase {
  type: 'shape';
  kind: ShapeKind;
  strokeColor: string;
  fillColor: string | null;
  /** fraction of displayed page width */
  strokeWidth: number;
}

export interface ImageLayer extends LayerBase {
  type: 'image';
  dataUrl: string;
  /** 'png' | 'jpg' — detected from dataUrl */
  imageKind: 'png' | 'jpg';
}

export interface SignatureLayer extends LayerBase {
  type: 'signature';
  dataUrl: string;
}

export type StampId =
  | 'approved'
  | 'reviewed'
  | 'draft'
  | 'confidential'
  | 'final'
  | 'signed'
  | 'rejected';

export interface StampLayer extends LayerBase {
  type: 'stamp';
  stampId: StampId;
}

export interface RedactLayer extends LayerBase {
  type: 'redact';
  color: 'black' | 'white';
  label?: string;
}

export type Layer =
  | TextLayer
  | StrokeLayer
  | ShapeLayer
  | ImageLayer
  | SignatureLayer
  | StampLayer
  | RedactLayer;

export interface StudioPage {
  /** stable id across reorder */
  key: string;
  /** index into the SOURCE pdf for copyPages; -1 for blank pages */
  originalIndex: number;
  /** user rotation 0|90|180|270 (clockwise) */
  rotation: number;
  /** rotation baked into the source file */
  nativeRotate: number;
  /** unrotated media-box size in PDF points */
  nativeWidth: number;
  nativeHeight: number;
  /** object URL for the thumbnail */
  thumbUrl: string;
  isBlank: boolean;
}

/** Serializable document state — the unit of undo/redo and autosave. */
export interface DocState {
  pages: StudioPage[];
  layers: Layer[];
}

export interface ZoomState {
  mode: 'fit-width' | 'fit-page' | number; // number = percent
}

export const STAMPS: Array<{ id: StampId; label: string; color: string }> = [
  { id: 'approved', label: 'APPROVED', color: '#15803d' },
  { id: 'reviewed', label: 'REVIEWED', color: '#1d4ed8' },
  { id: 'draft', label: 'DRAFT', color: '#b45309' },
  { id: 'confidential', label: 'CONFIDENTIAL', color: '#b91c1c' },
  { id: 'final', label: 'FINAL', color: '#0f766e' },
  { id: 'signed', label: 'SIGNED', color: '#4d7c0f' },
  { id: 'rejected', label: 'REJECTED', color: '#991b1b' },
];

export function newId(prefix = 'lyr'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}
