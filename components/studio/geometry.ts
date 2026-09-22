/**
 * PDFEdit Studio — coordinate geometry.
 *
 * The canvas shows each page rotated by TOTAL = (nativeRotate + userRotation) % 360
 * clockwise (this matches pdf.js getViewport({ rotation }) and pdf-lib /Rotate).
 *
 * Overlays are stored in DISPLAYED space: normalized 0..1, top-left origin, y-down.
 * Export converts to NATIVE space: PDF points, bottom-left origin, y-up, unrotated
 * media box. All mappings below are derived from corner correspondences and are
 * exact for 0/90/180/270 degree rotations.
 */
import type { StudioPage, LayerBase } from './types';

export function totalRotation(page: Pick<StudioPage, 'nativeRotate' | 'rotation'>): number {
  return ((page.nativeRotate + page.rotation) % 360 + 360) % 360;
}

/** Displayed page size in PDF points (accounts for 90/270 swap). */
export function displayedSize(page: Pick<StudioPage, 'nativeWidth' | 'nativeHeight' | 'nativeRotate' | 'rotation'>): {
  w: number;
  h: number;
} {
  const r = totalRotation(page);
  if (r === 90 || r === 270) return { w: page.nativeHeight, h: page.nativeWidth };
  return { w: page.nativeWidth, h: page.nativeHeight };
}

/**
 * Map a point from displayed space (native points, y-down, displayed dims)
 * to PDF native space (points, y-up, unrotated media box).
 *
 * Corner correspondences (R = total clockwise page rotation):
 * - R=90:  displayed TL -> native (0,0);   displayed TR -> native (0,H)
 * - R=180: displayed TL -> native (W,H)
 * - R=270: displayed TL -> native (W,H);   displayed TR -> native (W,0)
 * Derived: 90 -> (x=dy, y=dx); 180 -> (x=W-dx, y=H-dy); 270 -> (x=W-dy, y=H-dx)
 */
export function displayedPointToNative(
  dx: number,
  dy: number,
  page: Pick<StudioPage, 'nativeWidth' | 'nativeHeight' | 'nativeRotate' | 'rotation'>
): { x: number; y: number } {
  const r = totalRotation(page);
  const W = page.nativeWidth;
  const H = page.nativeHeight;
  switch (r) {
    case 90:
      return { x: dy, y: dx };
    case 180:
      return { x: W - dx, y: H - dy };
    case 270:
      return { x: W - dy, y: H - dx };
    case 0:
    default:
      return { x: dx, y: H - dy };
  }
}

export interface NativeRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Map a layer's normalized displayed rect to a native PDF rect (points, y-up).
 * Result is always axis-aligned with positive w/h.
 */
export function layerToNativeRect(
  layer: Pick<LayerBase, 'x' | 'y' | 'w' | 'h'>,
  page: Pick<StudioPage, 'nativeWidth' | 'nativeHeight' | 'nativeRotate' | 'rotation'>
): NativeRect {
  const disp = displayedSize(page);
  const dx = layer.x * disp.w;
  const dy = layer.y * disp.h;
  const dw = layer.w * disp.w;
  const dh = layer.h * disp.h;
  const r = totalRotation(page);
  const W = page.nativeWidth;
  const H = page.nativeHeight;

  switch (r) {
    case 90: {
      // TL(dx,dy) -> (dy,dx); BR(dx+dw,dy+dh) -> (dy+dh,dx+dw)
      return { x: dy, y: dx, w: dh, h: dw };
    }
    case 180:
      return { x: W - dx - dw, y: H - dy - dh, w: dw, h: dh };
    case 270: {
      // TL(dx,dy) -> (W-dy,H-dx); BR -> (W-dy-dh,H-dx-dw)
      return { x: W - dy - dh, y: H - dx - dw, w: dh, h: dw };
    }
    case 0:
    default:
      return { x: dx, y: H - dy - dh, w: dw, h: dh };
  }
}

/**
 * Map a normalized displayed polyline point to native PDF coords.
 * Points are {x,y} normalized 0..1 in displayed space, y-down.
 */
export function strokePointToNative(
  px: number,
  py: number,
  page: Pick<StudioPage, 'nativeWidth' | 'nativeHeight' | 'nativeRotate' | 'rotation'>
): { x: number; y: number } {
  const disp = displayedSize(page);
  return displayedPointToNative(px * disp.w, py * disp.h, page);
}

/**
 * pdf-lib rotation angle (degrees, counterclockwise-positive) for a layer.
 *
 * The page's own /Rotate is applied by the viewer to the original content AND
 * to our overlays alike, so it cancels out: only the layer's on-screen
 * rotation (clockwise, matching CSS `rotate()`) matters, negated into
 * pdf-lib's CCW convention.
 */
export function nativeRotation(layerRotationDeg: number): number {
  return -layerRotationDeg;
}

/**
 * Rotate point (px,py) about center (cx,cy) by thetaDeg
 * (counterclockwise-positive, pdf-lib convention).
 */
export function rotatePoint(
  px: number,
  py: number,
  cx: number,
  cy: number,
  thetaDeg: number
): { x: number; y: number } {
  const t = (thetaDeg * Math.PI) / 180;
  const cos = Math.cos(t);
  const sin = Math.sin(t);
  const dx = px - cx;
  const dy = py - cy;
  return { x: cx + cos * dx - sin * dy, y: cy + sin * dx + cos * dy };
}

/**
 * Anchor adjustment for pdf-lib drawing ops: pdf-lib applies `rotate` about
 * the (x, y) anchor you pass (rect/image/text all rotate about their anchor).
 * To rotate about a different center C instead (e.g. the shape center, to
 * match CSS `transform-origin: center`), pass this function's result as x/y.
 * P0 is the anchor you would pass with no rotation.
 */
export function rotateAnchor(
  p0x: number,
  p0y: number,
  cx: number,
  cy: number,
  thetaDeg: number
): { x: number; y: number } {
  return rotatePoint(p0x, p0y, cx, cy, thetaDeg);
}
