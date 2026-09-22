/**
 * PDFEdit Studio — per-tool creation options.
 *
 * These are the *creation* defaults: when the user picks a tool and places a
 * new layer on a page, the layer is seeded from these values. Editing an
 * already-selected layer writes to the layer itself (via the Inspector), not
 * to these options.
 *
 * Units mirror the layer contract in types.ts:
 * - fontSize: fraction of the DISPLAYED page height (0.03 = 3% of page height)
 * - drawWidth / strokeWidth: fraction of the DISPLAYED page width
 * - opacity values: 0..1
 */
import type { ShapeKind, StampId } from './types';

export interface ToolOptions {
  // text
  fontId: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  textColor: string;
  /** background highlight behind text runs; null = none */
  textHighlight: string | null;
  align: 'left' | 'center' | 'right' | 'justify';
  list: 'none' | 'bullet' | 'numbered';
  // draw
  drawColor: string;
  drawWidth: number; // width as fraction of page width, e.g. 0.004
  // highlight
  highlightColor: string;
  // shape
  shapeKind: ShapeKind;
  strokeColor: string;
  fillColor: string | null;
  strokeWidth: number;
  // stamp
  stampId: StampId;
  // redact
  redactColor: 'black' | 'white';
  redactLabel: string;
  // image/signature placed opacity
  mediaOpacity: number;
}

export const DEFAULT_TOOL_OPTIONS: ToolOptions = {
  fontId: 'arial',
  fontSize: 0.03,
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  textColor: '#0f172a',
  textHighlight: null,
  align: 'left',
  list: 'none',
  drawColor: '#1e3a8a',
  drawWidth: 0.004,
  highlightColor: '#fde047',
  shapeKind: 'rect',
  strokeColor: '#1e3a8a',
  fillColor: null,
  strokeWidth: 0.004,
  stampId: 'approved',
  redactColor: 'black',
  redactLabel: '',
  mediaOpacity: 1,
};
