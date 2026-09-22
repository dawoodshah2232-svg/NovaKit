'use client';

/**
 * PDFEdit Studio — document canvas.
 * Renders the active page via pdf.js and all overlay layers as HTML/SVG.
 * Handles: selection (click/drag/resize/rotate), and all tool interactions
 * (text/draw/highlight/shape/image/signature/stamp/redact).
 *
 * All layer geometry is normalized 0..1 in DISPLAYED space (see types.ts).
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type {
  Layer,
  StudioPage,
  ToolId,
  TextLayer,
  StrokeLayer,
  ShapeLayer,
  StampLayer,
  RedactLayer,
} from './types';
import { STAMPS, newId, clamp01 } from './types';
import { displayedSize } from './geometry';
import { STUDIO_FONTS } from './fonts';
import type { ToolOptions } from './toolOptions';
import { extractTextLines, sampleLineColors, type PdfTextLine } from './textEdit';

export interface CanvasProps {
  pdfDoc: PDFDocumentProxy | null;
  page: StudioPage;
  layers: Layer[];
  tool: ToolId;
  options: ToolOptions;
  zoom: { mode: 'fit-width' | 'fit-page' | number };
  selectedId: string | null;
  editingId: string | null;
  pendingSignature: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, patch: Partial<Layer>, commitHistory: boolean) => void;
  onAddLayer: (layer: Layer) => void;
  onCommit: () => void;
  onOpenSignaturePad: () => void;
  onConsumeSignature: () => void;
  onEditingChange: (id: string | null) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  /** "Edit text" tool: user clicked an extracted line of the PDF's own text */
  onEditLine: (line: PdfTextLine) => void;
}

const TOOL_EMPTY_HINT: Record<ToolId, string | null> = {
  select: null,
  text: 'Click anywhere on the page to add text',
  edittext: 'Click any text on the page to edit it in place',
  draw: 'Drag on the page to draw',
  highlight: 'Drag over text to highlight it',
  shape: 'Drag on the page to place a shape',
  image: 'Click on the page to place your image',
  signature: 'Click on the page to place your signature',
  stamp: 'Click on the page to place the stamp',
  redact: 'Drag over an area to redact it',
  pages: null,
};

type DragMode =
  | { kind: 'move'; id: string; startNX: number; startNY: number; origX: number; origY: number }
  | { kind: 'resize'; id: string; handle: string; startNX: number; startNY: number; orig: { x: number; y: number; w: number; h: number } }
  | { kind: 'rotate'; id: string; startAngle: number; origRotation: number; cx: number; cy: number }
  | { kind: 'create-stroke'; points: Array<{ x: number; y: number }> }
  | { kind: 'create-rect'; startNX: number; startNY: number }
  | null;

export function StudioCanvas(props: CanvasProps) {
  const {
    pdfDoc, page, layers, tool, options, zoom, selectedId, editingId,
    pendingSignature, onSelectLayer, onUpdateLayer, onAddLayer, onCommit,
    onOpenSignaturePad, onConsumeSignature, onEditingChange, onEditLine,
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const [cssSize, setCssSize] = useState({ w: 0, h: 0 });
  const [drag, setDrag] = useState<DragMode>(null);
  const [previewRect, setPreviewRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [previewPoints, setPreviewPoints] = useState<Array<{ x: number; y: number }> | null>(null);
  // "Edit text" tool: extracted lines of the PDF's own text for the active page
  const [textLines, setTextLines] = useState<PdfTextLine[] | null>(null);
  const [textLinesState, setTextLinesState] = useState<'idle' | 'loading' | 'ready' | 'empty'>('idle');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragRef = useRef<DragMode>(null);
  useEffect(() => {
    dragRef.current = drag;
  }, [drag]);

  const disp = displayedSize(page);
  const aspect = disp.h / disp.w;

  // ---- compute CSS size from zoom ----
  const computeSize = useCallback(() => {
    const container = containerRef.current;
    if (!container || disp.w === 0) return;
    const availW = Math.max(50, container.clientWidth - 48);
    const availH = Math.max(50, container.clientHeight - 48);
    let w: number;
    if (zoom.mode === 'fit-width') w = availW;
    else if (zoom.mode === 'fit-page') w = Math.min(availW, availH / aspect);
    else w = availW * (zoom.mode / 100);
    w = Math.max(80, Math.min(w, 2400));
    setCssSize({ w, h: w * aspect });
  }, [disp.w, aspect, zoom.mode]);

  useEffect(() => {
    computeSize();
    const ro = new ResizeObserver(() => computeSize());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', computeSize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', computeSize);
    };
  }, [computeSize]);

  // ---- render PDF page ----
  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas || cssSize.w === 0) return;

    const render = async () => {
      try {
        renderTaskRef.current?.cancel();
      } catch { /* noop */ }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssSize.w * dpr);
      canvas.height = Math.round(cssSize.h * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (page.isBlank || page.originalIndex < 0 || !pdfDoc) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cssSize.w, cssSize.h);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Blank page', cssSize.w / 2, cssSize.h / 2);
        return;
      }

      try {
        const pdfPage = await pdfDoc.getPage(page.originalIndex + 1);
        if (cancelled) return;
        const rotation = ((page.nativeRotate + page.rotation) % 360 + 360) % 360;
        const viewport = pdfPage.getViewport({ scale: 1, rotation });
        const scale = cssSize.w / viewport.width;
        const v2 = pdfPage.getViewport({ scale, rotation });
        const task = pdfPage.render({
          canvas,
          canvasContext: ctx,
          viewport: v2,
        } as unknown as Parameters<typeof pdfPage.render>[0]);
        renderTaskRef.current = task as unknown as { cancel: () => void };
        await task.promise;
      } catch (err) {
        if (err instanceof Error && err.name === 'RenderingCancelledException') return;
        console.warn('Studio canvas render failed', err);
      }
    };

    render();
    return () => {
      cancelled = true;
      try {
        renderTaskRef.current?.cancel();
      } catch { /* noop */ }
    };
  }, [pdfDoc, page, cssSize]);

  // ---- "Edit text" tool: extract the PDF's own text lines for the active page ----
  // All state updates happen in async continuations below (never synchronously
  // in the effect body) — the documented pattern for data fetching in effects.
  useEffect(() => {
    let cancelled = false;
    const rotation = ((page.nativeRotate + page.rotation) % 360 + 360) % 360;
    const doc = pdfDoc;
    const srcIndex = page.originalIndex;
    const wantLines = tool === 'edittext' && doc && srcIndex >= 0;

    if (wantLines) {
      Promise.resolve().then(() => {
        if (!cancelled) setTextLinesState('loading');
      });
      extractTextLines(doc, srcIndex + 1, rotation)
        .then((lines) => {
          if (cancelled) return;
          // Sample rendered pixels for text + background colors.
          const canvas = canvasRef.current;
          const getPixel = (nx: number, ny: number): [number, number, number] | null => {
            if (!canvas) return null;
            const px = Math.floor(clamp01(nx) * canvas.width);
            const py = Math.floor(clamp01(ny) * canvas.height);
            if (px < 0 || py < 0 || px >= canvas.width || py >= canvas.height) return null;
            try {
              const d = canvas.getContext('2d')?.getImageData(px, py, 1, 1).data;
              return d ? [d[0], d[1], d[2]] : null;
            } catch {
              return null;
            }
          };
          const colored = lines.map((l) => ({ ...l, ...sampleLineColors(getPixel, l) }));
          setTextLines(colored);
          setTextLinesState(colored.length > 0 ? 'ready' : 'empty');
        })
        .catch(() => {
          if (!cancelled) {
            setTextLines(null);
            setTextLinesState('empty');
          }
        });
    } else {
      Promise.resolve().then(() => {
        if (!cancelled) {
          setTextLines(null);
          setTextLinesState('idle');
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [tool, pdfDoc, page.originalIndex, page.nativeRotate, page.rotation, page.key, cssSize.w]);

  const toNormalized = useCallback((clientX: number, clientY: number) => {
    const el = overlayRef.current;
    if (!el) return { nx: 0, ny: 0 };
    const r = el.getBoundingClientRect();
    return {
      nx: clamp01((clientX - r.left) / Math.max(1, r.width)),
      ny: clamp01((clientY - r.top) / Math.max(1, r.height)),
    };
  }, []);

  // ---- layer creation helpers ----
  const placeTextAt = useCallback(
    (nx: number, ny: number) => {
      const layer: TextLayer = {
        id: newId('text'),
        type: 'text',
        pageIndex: 0,
        x: Math.min(0.9, nx),
        y: Math.min(0.9, ny),
        w: 0.42,
        h: Math.max(0.035, options.fontSize * 1.6),
        rotation: 0,
        opacity: 1,
        text: 'Double-click to edit',
        fontId: options.fontId,
        fontSize: options.fontSize,
        bold: options.bold,
        italic: options.italic,
        underline: options.underline,
        color: options.textColor,
        align: options.align,
        lineHeight: 1.25,
      };
      onAddLayer(layer);
      onEditingChange(layer.id);
    },
    [options, onAddLayer, onEditingChange]
  );

  const placeImageAt = useCallback(
    (nx: number, ny: number, dataUrl: string) => {
      const img = new Image();
      img.onload = () => {
        const fw = 0.35;
        const fh = fw * (img.naturalHeight / Math.max(1, img.naturalWidth)) * (disp.w / disp.h);
        onAddLayer({
          id: newId('img'),
          type: 'image',
          pageIndex: 0,
          x: clamp01(nx - fw / 2),
          y: clamp01(ny - fh / 2),
          w: fw,
          h: Math.min(0.9, fh),
          rotation: 0,
          opacity: options.mediaOpacity,
          dataUrl,
          imageKind: dataUrl.includes('data:image/jpeg') || dataUrl.includes('data:image/jpg') ? 'jpg' : 'png',
        } as Layer);
      };
      img.src = dataUrl;
    },
    [disp.w, disp.h, onAddLayer, options.mediaOpacity]
  );

  const placeSignatureAt = useCallback(
    (nx: number, ny: number) => {
      if (!pendingSignature) {
        onOpenSignaturePad();
        return;
      }
      const img = new Image();
      img.onload = () => {
        const fw = 0.3;
        const fh = fw * (img.naturalHeight / Math.max(1, img.naturalWidth)) * (disp.w / disp.h);
        onAddLayer({
          id: newId('sig'),
          type: 'signature',
          pageIndex: 0,
          x: clamp01(nx - fw / 2),
          y: clamp01(ny - fh / 2),
          w: fw,
          h: Math.min(0.5, fh),
          rotation: 0,
          opacity: 1,
          dataUrl: pendingSignature,
        } as Layer);
        onConsumeSignature();
      };
      img.src = pendingSignature;
    },
    [pendingSignature, disp.w, disp.h, onAddLayer, onOpenSignaturePad, onConsumeSignature]
  );

  const placeStampAt = useCallback(
    (nx: number, ny: number) => {
      const fw = 0.26;
      const fh = (fw / 3) * (disp.w / disp.h);
      onAddLayer({
        id: newId('stamp'),
        type: 'stamp',
        pageIndex: 0,
        x: clamp01(nx - fw / 2),
        y: clamp01(ny - fh / 2),
        w: fw,
        h: fh,
        rotation: 0,
        opacity: 1,
        stampId: options.stampId,
      } as Layer);
    },
    [disp.w, disp.h, onAddLayer, options.stampId]
  );

  // ---- pointer handlers on overlay ----
  const handleOverlayPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const { nx, ny } = toNormalized(e.clientX, e.clientY);

    if (tool === 'select') {
      onSelectLayer(null);
      return;
    }
    if (tool === 'text') {
      placeTextAt(nx, ny);
      return;
    }
    if (tool === 'image') {
      fileInputRef.current?.click();
      return;
    }
    if (tool === 'signature') {
      placeSignatureAt(nx, ny);
      return;
    }
    if (tool === 'stamp') {
      placeStampAt(nx, ny);
      return;
    }
    if (tool === 'draw' || tool === 'highlight') {
      setDrag({ kind: 'create-stroke', points: [{ x: nx, y: ny }] });
      setPreviewPoints([{ x: nx, y: ny }]);
      return;
    }
    if (tool === 'shape' || tool === 'redact') {
      setDrag({ kind: 'create-rect', startNX: nx, startNY: ny });
      setPreviewRect({ x: nx, y: ny, w: 0, h: 0 });
    }
  };

  const handleOverlayPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const { nx, ny } = toNormalized(e.clientX, e.clientY);

    if (d.kind === 'create-stroke') {
      const last = d.points[d.points.length - 1];
      const dist = Math.hypot(nx - last.x, ny - last.y);
      if (dist > 0.002) {
        const pts = [...d.points, { x: nx, y: ny }];
        setDrag({ ...d, points: pts });
        setPreviewPoints(pts);
      }
      return;
    }
    if (d.kind === 'create-rect') {
      setPreviewRect({
        x: Math.min(d.startNX, nx),
        y: Math.min(d.startNY, ny),
        w: Math.abs(nx - d.startNX),
        h: Math.abs(ny - d.startNY),
      });
      return;
    }
    if (d.kind === 'move') {
      const dx = nx - d.startNX;
      const dy = ny - d.startNY;
      onUpdateLayer(d.id, { x: clamp01(d.origX + dx), y: clamp01(d.origY + dy) }, false);
      return;
    }
    if (d.kind === 'resize') {
      const dx = nx - d.startNX;
      const dy = ny - d.startNY;
      const o = d.orig;
      let { x, y, w, h } = o;
      const min = 0.015;
      if (d.handle.includes('e')) w = Math.max(min, o.w + dx);
      if (d.handle.includes('s')) h = Math.max(min, o.h + dy);
      if (d.handle.includes('w')) {
        const nw = Math.max(min, o.w - dx);
        x = o.x + (o.w - nw);
        w = nw;
      }
      if (d.handle.includes('n')) {
        const nh = Math.max(min, o.h - dy);
        y = o.y + (o.h - nh);
        h = nh;
      }
      onUpdateLayer(d.id, { x: clamp01(x), y: clamp01(y), w: Math.min(1, w), h: Math.min(1, h) }, false);
      return;
    }
    if (d.kind === 'rotate') {
      const el = overlayRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      const angle = (Math.atan2(py - d.cy * r.height, px - d.cx * r.width) * 180) / Math.PI + 90;
      onUpdateLayer(d.id, { rotation: Math.round(((angle - d.startAngle + d.origRotation) % 360 + 360) % 360) }, false);
    }
  };

  const handleOverlayPointerUp = () => {
    const d = dragRef.current;
    if (!d) return;

    if (d.kind === 'create-stroke' && d.points.length >= 2) {
      const xs = d.points.map((p) => p.x);
      const ys = d.points.map((p) => p.y);
      const x0 = Math.min(...xs);
      const y0 = Math.min(...ys);
      const x1 = Math.max(...xs);
      const y1 = Math.max(...ys);
      const kind = tool === 'highlight' ? 'highlight' : 'draw';
      const layer: StrokeLayer = {
        id: newId('stroke'),
        type: 'stroke',
        pageIndex: 0,
        x: Math.max(0, x0 - 0.01),
        y: Math.max(0, y0 - 0.01),
        w: Math.min(1, x1 - x0 + 0.02),
        h: Math.min(1, y1 - y0 + 0.02),
        rotation: 0,
        opacity: kind === 'highlight' ? 0.45 : 1,
        kind,
        points: d.points,
        color: kind === 'highlight' ? options.highlightColor : options.drawColor,
        width: options.drawWidth,
      };
      onAddLayer(layer);
    }

    if (d.kind === 'create-rect' && previewRect && previewRect.w > 0.008 && previewRect.h > 0.008) {
      if (tool === 'redact') {
        onAddLayer({
          id: newId('redact'),
          type: 'redact',
          pageIndex: 0,
          ...previewRect,
          rotation: 0,
          opacity: 1,
          color: options.redactColor,
          label: options.redactLabel || undefined,
        } as Layer);
      } else if (tool === 'shape') {
        onAddLayer({
          id: newId('shape'),
          type: 'shape',
          pageIndex: 0,
          ...previewRect,
          rotation: 0,
          opacity: 1,
          kind: options.shapeKind,
          strokeColor: options.strokeColor,
          fillColor: options.fillColor,
          strokeWidth: options.strokeWidth,
        } as Layer);
      }
    }

    if (d.kind === 'move' || d.kind === 'resize' || d.kind === 'rotate') {
      onCommit();
    }
    setDrag(null);
    setPreviewRect(null);
    setPreviewPoints(null);
  };

  // ---- layer-level pointer handlers (select tool) ----
  const handleLayerPointerDown = (e: React.PointerEvent, layer: Layer) => {
    if (tool !== 'select') return;
    e.stopPropagation();
    if (e.button !== 0) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    onSelectLayer(layer.id);
    const { nx, ny } = toNormalized(e.clientX, e.clientY);
    setDrag({ kind: 'move', id: layer.id, startNX: nx, startNY: ny, origX: layer.x, origY: layer.y });
  };

  const handleHandlePointerDown = (e: React.PointerEvent, layer: Layer, handle: string) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const { nx, ny } = toNormalized(e.clientX, e.clientY);
    if (handle === 'rotate') {
      const el = overlayRef.current;
      const r = el?.getBoundingClientRect();
      const cx = layer.x + layer.w / 2;
      const cy = layer.y + layer.h / 2;
      const px = r ? e.clientX - r.left : 0;
      const py = r ? e.clientY - r.top : 0;
      const startAngle = (Math.atan2(py - cy * (r?.height ?? 1), px - cx * (r?.width ?? 1)) * 180) / Math.PI + 90;
      setDrag({ kind: 'rotate', id: layer.id, startAngle, origRotation: layer.rotation, cx, cy });
    } else {
      setDrag({
        kind: 'resize',
        id: layer.id,
        handle,
        startNX: nx,
        startNY: ny,
        orig: { x: layer.x, y: layer.y, w: layer.w, h: layer.h },
      });
    }
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!/^image\/(png|jpeg)$/.test(f.type)) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      // place at center
      placeImageAt(0.5, 0.4, url);
    };
    reader.readAsDataURL(f);
  };

  const hint = TOOL_EMPTY_HINT[tool];

  return (
    <div ref={containerRef} className="relative flex-1 overflow-auto bg-slate-950 flex items-start justify-center">
      <div className="relative my-6" style={{ width: cssSize.w, height: cssSize.h }}>
        {/* page shadow / paper */}
        <div
          className="absolute inset-0 rounded-[2px] bg-white"
          style={{ boxShadow: '0 12px 48px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4)' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 rounded-[2px]"
          style={{ width: '100%', height: '100%' }}
        />
        {/* overlay interaction layer */}
        <div
          ref={overlayRef}
          className="absolute inset-0 rounded-[2px] touch-none"
          style={{ cursor: tool === 'select' ? 'default' : tool === 'edittext' ? 'text' : 'crosshair' }}
          onPointerDown={handleOverlayPointerDown}
          onPointerMove={handleOverlayPointerMove}
          onPointerUp={handleOverlayPointerUp}
          onPointerCancel={handleOverlayPointerUp}
        >
          {layers.map((layer) => (
            <LayerView
              key={layer.id}
              layer={layer}
              selected={layer.id === selectedId}
              editing={layer.id === editingId}
              tool={tool}
              textScalePx={cssSize.h}
              pagePxW={cssSize.w}
              onPointerDown={handleLayerPointerDown}
              onHandlePointerDown={handleHandlePointerDown}
              onDoubleClick={() => {
                if (layer.type === 'text') onEditingChange(layer.id);
              }}
              onEditCommit={(text) => {
                onUpdateLayer(layer.id, { text } as Partial<Layer>, true);
                onEditingChange(null);
              }}
              onEditCancel={() => onEditingChange(null)}
            />
          ))}

          {/* "Edit text" tool: clickable lines of the PDF's own text */}
          {tool === 'edittext' && textLinesState === 'ready' && textLines?.map((line) => (
            <button
              key={line.id}
              type="button"
              title={line.approxFont ? 'Edit this text (font approximated)' : 'Edit this text'}
              aria-label={`Edit text: ${line.text.slice(0, 80)}`}
              className="absolute rounded-[2px] transition-colors hover:bg-red-500/15 focus-visible:outline-2 focus-visible:outline-red-400"
              style={{
                left: `${line.x * 100}%`,
                top: `${line.y * 100}%`,
                width: `${line.w * 100}%`,
                height: `${line.h * 100}%`,
                cursor: 'text',
                border: '1px dashed transparent',
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onEditLine(line);
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(248,113,113,0.7)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(248,113,113,0.7)';
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
              }}
            />
          ))}
          {tool === 'edittext' && textLinesState === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="px-4 py-2 rounded-full bg-slate-900/85 text-slate-200 text-xs font-medium border border-slate-700 shadow-lg">
                Reading page text…
              </div>
            </div>
          )}
          {tool === 'edittext' && textLinesState === 'empty' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="px-4 py-2 rounded-full bg-slate-900/85 text-slate-200 text-xs font-medium border border-slate-700 shadow-lg text-center">
                No selectable text on this page — it may be a scanned image.
              </div>
            </div>
          )}

          {/* creation previews */}
          {previewRect && (tool === 'shape' || tool === 'redact') && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${previewRect.x * 100}%`,
                top: `${previewRect.y * 100}%`,
                width: `${previewRect.w * 100}%`,
                height: `${previewRect.h * 100}%`,
                background: tool === 'redact' ? (options.redactColor === 'white' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)') : 'transparent',
                border: tool === 'redact' ? '1px solid #64748b' : `2px solid ${options.strokeColor}`,
              }}
            />
          )}
          {previewPoints && previewPoints.length > 1 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                points={previewPoints.map((p) => `${p.x * 100},${p.y * 100}`).join(' ')}
                fill="none"
                stroke={tool === 'highlight' ? options.highlightColor : options.drawColor}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={tool === 'highlight' ? 0.45 : 1}
                style={{ strokeWidth: `${Math.max(2, options.drawWidth * cssSize.w * (tool === 'highlight' ? 4 : 1))}px` }}
              />
            </svg>
          )}
        </div>

        {hint && layers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="px-4 py-2 rounded-full bg-slate-900/85 text-slate-200 text-xs font-medium border border-slate-700 shadow-lg">
              {hint}
            </div>
          </div>
        )}
        {hint && (tool === 'text' || tool === 'edittext') && layers.length > 0 && (
          <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap">
            <div className="px-3 py-1.5 rounded-full bg-slate-900/90 text-slate-300 text-[11px] border border-slate-700">
              {hint}{tool === 'text' ? ' · double-click text to edit' : ''}
            </div>
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleImageFile} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layer rendering + selection chrome
// ---------------------------------------------------------------------------

const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

function LayerView(props: {
  layer: Layer;
  selected: boolean;
  editing: boolean;
  tool: ToolId;
  textScalePx: number;
  pagePxW: number;
  onPointerDown: (e: React.PointerEvent, layer: Layer) => void;
  onHandlePointerDown: (e: React.PointerEvent, layer: Layer, handle: string) => void;
  onDoubleClick: () => void;
  onEditCommit: (text: string) => void;
  onEditCancel: () => void;
}) {
  const { layer, selected, editing, tool, textScalePx, pagePxW, onPointerDown, onHandlePointerDown, onDoubleClick, onEditCommit, onEditCancel } = props;

  return (
    <div
      className="absolute group"
      style={{
        left: `${layer.x * 100}%`,
        top: `${layer.y * 100}%`,
        width: `${layer.w * 100}%`,
        height: `${layer.h * 100}%`,
        transform: layer.rotation ? `rotate(${layer.rotation}deg)` : undefined,
        opacity: layer.opacity,
        cursor: tool === 'select' ? 'move' : undefined,
        zIndex: selected ? 30 : 10,
      }}
      onPointerDown={(e) => onPointerDown(e, layer)}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
    >
      <LayerContent layer={layer} editing={editing} textScalePx={textScalePx} pagePxW={pagePxW} onEditCommit={onEditCommit} onEditCancel={onEditCancel} />

      {/* selection chrome */}
      {(selected || tool !== 'select') && selected && (
        <>
          <div className="absolute -inset-[1px] border-2 border-red-400 rounded-[2px] pointer-events-none" />
          {HANDLES.map((h) => (
            <div
              key={h}
              data-handle={h}
              onPointerDown={(e) => onHandlePointerDown(e, layer, h)}
              className="absolute w-3 h-3 -ml-1.5 -mt-1.5 bg-white border-2 border-red-500 rounded-full cursor-nwse-resize touch-none"
              style={handlePos(h)}
            />
          ))}
          <div
            data-handle="rotate"
            onPointerDown={(e) => onHandlePointerDown(e, layer, 'rotate')}
            className="absolute left-1/2 -ml-2 -top-8 w-4 h-4 bg-white border-2 border-red-500 rounded-full cursor-grab touch-none"
            title="Rotate"
          />
          <div className="absolute left-1/2 -top-6 w-px h-4 bg-red-400 pointer-events-none" style={{ transform: 'translateX(-0.5px)' }} />
        </>
      )}
    </div>
  );
}

function handlePos(h: string): React.CSSProperties {
  const base: React.CSSProperties = { position: 'absolute' };
  if (h.includes('n')) base.top = '0%';
  if (h.includes('s')) base.top = '100%';
  if (h.includes('w')) base.left = '0%';
  if (h.includes('e')) base.left = '100%';
  if (h === 'n' || h === 's') base.left = '50%';
  if (h === 'e' || h === 'w') base.top = '50%';
  const cursors: Record<string, string> = {
    nw: 'nwse-resize', se: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize',
    n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize',
  };
  base.cursor = cursors[h];
  return base;
}

function LayerContent(props: {
  layer: Layer;
  editing: boolean;
  textScalePx: number;
  pagePxW: number;
  onEditCommit: (text: string) => void;
  onEditCancel: () => void;
}) {
  const { layer, editing, textScalePx, pagePxW, onEditCommit, onEditCancel } = props;

  if (layer.type === 'text') {
    const t = layer as TextLayer;
    const font = STUDIO_FONTS.find((f) => f.id === t.fontId) ?? STUDIO_FONTS[0];
    const fontPx = Math.max(6, t.fontSize * textScalePx);
    if (editing) {
      return (
        <InlineTextEditor
          initial={t.text}
          fontFamily={font.cssFamily}
          bold={t.bold}
          italic={t.italic}
          color={t.color}
          align={t.align}
          onCommit={onEditCommit}
          onCancel={onEditCancel}
        />
      );
    }
    return (
      <div
        className="w-full h-full overflow-hidden select-none"
        style={{
          fontFamily: font.cssFamily,
          fontWeight: t.bold ? 700 : 400,
          fontStyle: t.italic ? 'italic' : 'normal',
          textDecoration: t.underline ? 'underline' : 'none',
          color: t.color,
          textAlign: t.align,
          lineHeight: t.lineHeight,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontSize: `${fontPx}px`,
        }}
      >
        {t.text}
      </div>
    );
  }

  if (layer.type === 'stroke') {
    const s = layer as StrokeLayer;
    const rel = s.points.map((p) => ({
      x: ((p.x - s.x) / Math.max(0.0001, s.w)) * 100,
      y: ((p.y - s.y) / Math.max(0.0001, s.h)) * 100,
    }));
    const pxWidth = Math.max(1, s.width * pagePxW * (s.kind === 'highlight' ? 4 : 1));
    return (
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={rel.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={s.color}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={s.kind === 'highlight' ? 0.45 : 1}
          vectorEffect="non-scaling-stroke"
          style={{ strokeWidth: `${pxWidth}px` }}
        />
      </svg>
    );
  }

  if (layer.type === 'shape') {
    const sh = layer as ShapeLayer;
    const sw = Math.max(1.5, sh.strokeWidth * 600);
    if (sh.kind === 'rect')
      return <div className="w-full h-full" style={{ border: `${sw}px solid ${sh.strokeColor}`, background: sh.fillColor ?? 'transparent' }} />;
    if (sh.kind === 'ellipse')
      return <div className="w-full h-full rounded-full" style={{ border: `${sw}px solid ${sh.strokeColor}`, background: sh.fillColor ?? 'transparent' }} />;
    return (
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="0" y1="50" x2="100" y2="50" stroke={sh.strokeColor} strokeWidth={sw} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {sh.kind === 'arrow' && (
          <polygon points="100,50 82,38 82,62" fill={sh.strokeColor} />
        )}
      </svg>
    );
  }

  if (layer.type === 'image' || layer.type === 'signature') {
    return <img src={layer.dataUrl} alt="" className="w-full h-full object-fill select-none" draggable={false} />;
  }

  if (layer.type === 'stamp') {
    const st = layer as StampLayer;
    const def = STAMPS.find((s) => s.id === st.stampId) ?? STAMPS[0];
    return (
      <div
        className="w-full h-full flex items-center justify-center rounded select-none"
        style={{ border: `3px solid ${def.color}`, color: def.color }}
      >
        <span className="font-extrabold tracking-widest" style={{ fontSize: 'clamp(8px, 2.2vw, 22px)' }}>
          {def.label}
        </span>
      </div>
    );
  }

  if (layer.type === 'redact') {
    const r = layer as RedactLayer;
    const dark = r.color !== 'white';
    return (
      <div
        className="w-full h-full flex items-center justify-center select-none"
        style={{ background: dark ? '#000' : '#fff', border: '1px solid #64748b' }}
      >
        {r.label && (
          <span className="font-bold text-[10px] tracking-wide" style={{ color: dark ? '#fff' : '#000' }}>
            {r.label}
          </span>
        )}
      </div>
    );
  }

  return null;
}

function InlineTextEditor(props: {
  initial: string;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  color: string;
  align: TextLayer['align'];
  onCommit: (text: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(props.initial === 'Double-click to edit' ? '' : props.initial);
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => props.onCommit(value || 'Text')}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Escape') props.onCancel();
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) props.onCommit(value || 'Text');
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className="w-full h-full bg-white/95 text-slate-900 rounded p-1 outline-none resize-none"
      style={{
        fontFamily: props.fontFamily,
        fontWeight: props.bold ? 700 : 400,
        fontStyle: props.italic ? 'italic' : 'normal',
        color: props.color,
        textAlign: props.align,
        fontSize: 16,
      }}
      aria-label="Edit text"
    />
  );
}
