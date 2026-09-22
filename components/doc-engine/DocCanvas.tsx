'use client';

/**
 * DocCanvas — the core WYSIWYG page canvas of the document engine.
 *
 * Renders A4 pages with absolutely-positioned layers (normalized 0..1
 * coordinates), with click select, drag-to-move, 8-handle resize, and
 * double-click in-place rich-text editing (contentEditable <-> block model).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import {
  fontStack,
  layersOnPage,
  pageAspect,
  type DocBlockKind,
  type DocFontId,
  type DocLayer,
  type DocStampLayer,
  type DocState,
  type DocTableLayer,
  type DocTextBlock,
  type DocTextLayer,
  type DocTextRun,
} from '@/lib/doc-engine/types';

export interface DocCanvasProps {
  doc: DocState;
  onDocChange: (d: DocState, pushHistory?: boolean) => void;
  selection: string[];
  onSelectionChange: (ids: string[]) => void;
  zoom: number;
  editingId: string | null;
  onEditingChange: (id: string | null) => void;
}

const PAGE_BASE_W = 800;
const MIN_SIZE = 0.02;
const SELECT_BLUE = '#2563eb';

/* ------------------------------------------------------------------ */
/* HTML serialization for in-place editing                               */
/* ------------------------------------------------------------------ */

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function blocksToHtml(layer: DocTextLayer): string {
  return layer.blocks
    .map((b) => {
      const runs =
        b.runs
          .map((r) => {
            const attrs = [
              r.bold ? 'data-b="1"' : '',
              r.italic ? 'data-i="1"' : '',
              r.underline ? 'data-u="1"' : '',
              r.color ? `data-color="${escapeHtml(r.color)}"` : '',
              r.fontSize != null ? `data-size="${r.fontSize}"` : '',
              r.fontId ? `data-font="${r.fontId}"` : '',
            ]
              .filter(Boolean)
              .join(' ');
            return `<span${attrs ? ' ' + attrs : ''}>${escapeHtml(r.text)}</span>`;
          })
          .join('') || '<br>';
      return `<p data-kind="${b.kind}" data-align="${b.align}">${runs}</p>`;
    })
    .join('');
}

interface RunStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string | null;
  fontSize: number | null;
  fontId: DocFontId | null;
}

const BASE_STYLE: RunStyle = {
  bold: false,
  italic: false,
  underline: false,
  color: null,
  fontSize: null,
  fontId: null,
};

function cssColorToHex(c: string): string | null {
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (!m) {
    return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c.trim()) ? c.trim() : null;
  }
  const parts = m[1].split(',').map((p) => parseFloat(p.trim()));
  if (parts.length < 3 || parts.some((n) => !Number.isFinite(n))) return null;
  const toHex = (n: number) =>
    Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0');
  return `#${toHex(parts[0])}${toHex(parts[1])}${toHex(parts[2])}`;
}

function styleFromElement(el: HTMLElement, base: RunStyle): RunStyle {
  const s: RunStyle = { ...base };
  const tag = el.tagName;
  if (tag === 'B' || tag === 'STRONG') s.bold = true;
  if (tag === 'I' || tag === 'EM') s.italic = true;
  if (tag === 'U') s.underline = true;
  if (el.dataset.b) s.bold = true;
  if (el.dataset.i) s.italic = true;
  if (el.dataset.u) s.underline = true;
  if (el.dataset.color) s.color = el.dataset.color;
  if (el.dataset.size) {
    const v = parseFloat(el.dataset.size);
    if (Number.isFinite(v)) s.fontSize = v;
  }
  const df = el.dataset.font;
  if (df === 'sans' || df === 'serif' || df === 'mono') s.fontId = df;
  // Inline styles left by execCommand (styleWithCSS mode).
  const cs = el.style;
  const fw = cs.fontWeight;
  if (fw === 'bold' || fw === 'bolder' || (fw !== '' && parseInt(fw, 10) >= 600)) s.bold = true;
  if (cs.fontStyle === 'italic' || cs.fontStyle === 'oblique') s.italic = true;
  const td = cs.textDecoration || '';
  if (td.includes('underline')) s.underline = true;
  if (cs.color) {
    const hex = cssColorToHex(cs.color);
    if (hex) s.color = hex;
  }
  return s;
}

function collectRuns(node: Node, base: RunStyle, out: DocTextRun[]): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? '';
    if (text) out.push({ text, ...base });
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node as HTMLElement;
  if (el.tagName === 'BR') {
    out.push({ text: '\n', ...base });
    return;
  }
  const style = styleFromElement(el, base);
  el.childNodes.forEach((c) => collectRuns(c, style, out));
}

const KIND_FROM_TAG: Record<string, DocBlockKind> = {
  H1: 'h1',
  H2: 'h2',
  H3: 'h3',
  P: 'paragraph',
  DIV: 'paragraph',
  LI: 'paragraph',
};

function parseEditableHtml(root: HTMLElement): DocTextBlock[] {
  const blocks: DocTextBlock[] = [];
  let pending: DocTextRun[] = [];

  const flushPending = () => {
    if (pending.length > 0) {
      blocks.push({ id: `blk_${Math.random().toString(36).slice(2, 9)}`, kind: 'paragraph', align: 'left', runs: pending, spaceAfter: 0.004 });
      pending = [];
    }
  };

  const blockFromElement = (el: HTMLElement, forcedKind?: DocBlockKind): DocTextBlock => {
    const runs: DocTextRun[] = [];
    el.childNodes.forEach((c) => collectRuns(c, BASE_STYLE, runs));
    const kind =
      forcedKind ??
      (el.dataset.kind as DocBlockKind | undefined) ??
      KIND_FROM_TAG[el.tagName] ??
      'paragraph';
    const align = (el.dataset.align as DocTextBlock['align'] | undefined) ?? 'left';
    return {
      id: `blk_${Math.random().toString(36).slice(2, 9)}`,
      kind,
      align,
      runs: runs.length > 0 ? runs : [{ text: '', ...BASE_STYLE }],
      spaceAfter: 0.004,
    };
  };

  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent ?? '';
      if (t) pending.push({ text: t, ...BASE_STYLE });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName;
    if (tag === 'UL' || tag === 'OL') {
      flushPending();
      const forced: DocBlockKind = tag === 'UL' ? 'bullet' : 'numbered';
      el.querySelectorAll(':scope > li').forEach((li) => blocks.push(blockFromElement(li as HTMLElement, forced)));
      return;
    }
    if (tag === 'BR') {
      flushPending();
      blocks.push({ id: `blk_${Math.random().toString(36).slice(2, 9)}`, kind: 'paragraph', align: 'left', runs: [{ text: '', ...BASE_STYLE }], spaceAfter: 0.004 });
      return;
    }
    flushPending();
    blocks.push(blockFromElement(el));
  });
  flushPending();

  if (blocks.length === 0) {
    blocks.push({ id: `blk_${Math.random().toString(36).slice(2, 9)}`, kind: 'paragraph', align: 'left', runs: [{ text: '', ...BASE_STYLE }], spaceAfter: 0.004 });
  }
  return blocks;
}

/* ------------------------------------------------------------------ */
/* Read-mode rendering                                                 */
/* ------------------------------------------------------------------ */

function runStyle(run: DocTextRun, layer: DocTextLayer, pageH: number): React.CSSProperties {
  return {
    fontFamily: fontStack(run.fontId ?? layer.fontId),
    fontSize: (run.fontSize ?? layer.fontSize) * pageH,
    color: run.color ?? layer.color,
    fontWeight: run.bold ? 700 : 400,
    fontStyle: run.italic ? 'italic' : 'normal',
    textDecoration: run.underline ? 'underline' : 'none',
    lineHeight: layer.lineHeight,
  };
}

function renderBlock(b: DocTextBlock, layer: DocTextLayer, pageH: number, key: string): React.ReactNode {
  const style: React.CSSProperties = {
    textAlign: b.align,
    margin: 0,
    padding: 0,
    marginBottom: b.spaceAfter * pageH,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
  };
  const runs = b.runs.map((r, i) => (
    <span key={i} style={runStyle(r, layer, pageH)}>
      {r.text}
    </span>
  ));
  if (b.kind === 'bullet') {
    return (
      <ul key={key} style={{ ...style, paddingLeft: '1.4em', listStyleType: 'disc' }}>
        <li>{runs}</li>
      </ul>
    );
  }
  if (b.kind === 'numbered') {
    return (
      <ol key={key} style={{ ...style, paddingLeft: '1.4em', listStyleType: 'decimal' }}>
        <li>{runs}</li>
      </ol>
    );
  }
  const Tag = b.kind === 'h1' ? 'h1' : b.kind === 'h2' ? 'h2' : b.kind === 'h3' ? 'h3' : 'p';
  const weight: React.CSSProperties = b.kind === 'paragraph' ? {} : { fontWeight: 700 };
  return (
    <Tag key={key} style={{ ...style, ...weight }}>
      {runs}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* Editable text (contentEditable)                                     */
/* ------------------------------------------------------------------ */

function EditableText({
  layer,
  pageH,
  onCommit,
  onCancel,
}: {
  layer: DocTextLayer;
  pageH: number;
  onCommit: (blocks: DocTextBlock[]) => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const cancelled = useRef(false);
  const html = useMemo(() => blocksToHtml(layer), [layer]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    // Place caret at the end.
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, []);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      dangerouslySetInnerHTML={{ __html: html }}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Escape') {
          e.preventDefault();
          cancelled.current = true;
          ref.current?.blur();
        }
      }}
      onBlur={() => {
        if (cancelled.current) {
          onCancel();
          return;
        }
        if (ref.current) onCommit(parseEditableHtml(ref.current));
      }}
      style={{
        width: '100%',
        minHeight: '100%',
        outline: 'none',
        cursor: 'text',
        fontFamily: fontStack(layer.fontId),
        fontSize: layer.fontSize * pageH,
        color: layer.color,
        lineHeight: layer.lineHeight,
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Editable table (cell editing)                                       */
/* ------------------------------------------------------------------ */

function EditableTable({
  layer,
  pageH,
  pageW,
  onCommit,
  onCancel,
}: {
  layer: DocTableLayer;
  pageH: number;
  pageW: number;
  onCommit: (cells: string[][]) => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLTableElement>(null);
  const cancelled = useRef(false);

  useEffect(() => {
    const first = ref.current?.querySelector('td');
    (first as HTMLElement | null)?.focus();
  }, []);

  const readCells = (): string[][] => {
    const table = ref.current;
    if (!table) return layer.cells;
    const rows: string[][] = [];
    table.querySelectorAll('tr').forEach((tr) => {
      const row: string[] = [];
      tr.querySelectorAll('td, th').forEach((cell) => row.push(cell.textContent ?? ''));
      rows.push(row);
    });
    return rows;
  };

  return (
    <table
      ref={ref}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Escape') {
          e.preventDefault();
          cancelled.current = true;
          (document.activeElement as HTMLElement | null)?.blur();
        }
      }}
      onBlur={(e) => {
        // Commit only when focus leaves the whole table.
        if (cancelled.current) {
          onCancel();
          return;
        }
        if (!e.currentTarget.contains(e.relatedTarget as Node)) onCommit(readCells());
      }}
      style={{
        width: '100%',
        height: '100%',
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
        fontFamily: fontStack(layer.fontId),
        fontSize: layer.fontSize * pageH,
        color: layer.color,
        lineHeight: layer.lineHeight,
      }}
    >
      <tbody>
        {layer.cells.map((row, r) => (
          <tr key={r}>
            {row.map((cell, c) => (
              <td
                key={c}
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  border: `${Math.max(1, layer.borderWidth * pageW)}px solid ${layer.borderColor}`,
                  background: r === 0 && layer.headerRow && layer.headerFill ? layer.headerFill : 'transparent',
                  fontWeight: r === 0 && layer.headerRow ? 700 : 400,
                  padding: `${layer.fontSize * pageH * 0.45}px ${layer.fontSize * pageH * 0.6}px`,
                  width: `${(layer.colWidths[c] ?? 1 / layer.cols) * 100}%`,
                  overflowWrap: 'break-word',
                  outline: 'none',
                  cursor: 'text',
                  verticalAlign: 'top',
                }}
                dangerouslySetInnerHTML={{ __html: escapeHtml(cell) || '<br>' }}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function renderTable(layer: DocTableLayer, pageH: number, pageW: number): React.ReactNode {
  return (
    <table
      style={{
        width: '100%',
        height: '100%',
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
        fontFamily: fontStack(layer.fontId),
        fontSize: layer.fontSize * pageH,
        color: layer.color,
        lineHeight: layer.lineHeight,
        pointerEvents: 'none',
      }}
    >
      <tbody>
        {layer.cells.map((row, r) => (
          <tr key={r}>
            {row.map((cell, c) => (
              <td
                key={c}
                style={{
                  border: `${Math.max(1, layer.borderWidth * pageW)}px solid ${layer.borderColor}`,
                  background: r === 0 && layer.headerRow && layer.headerFill ? layer.headerFill : 'transparent',
                  fontWeight: r === 0 && layer.headerRow ? 700 : 400,
                  padding: `${layer.fontSize * pageH * 0.45}px ${layer.fontSize * pageH * 0.6}px`,
                  width: `${(layer.colWidths[c] ?? 1 / layer.cols) * 100}%`,
                  overflowWrap: 'break-word',
                  verticalAlign: 'top',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function renderStamp(layer: DocStampLayer, pageH: number): React.ReactNode {
  const borderPx = Math.max(2, layer.fontSize * pageH * 0.14);
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `${borderPx}px solid ${layer.color}`,
        borderRadius: layer.shape === 'round' ? '999px' : 6,
        color: layer.color,
        fontFamily: fontStack('sans'),
        fontWeight: 800,
        fontSize: layer.fontSize * pageH,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        background: 'transparent',
        padding: '0 8px',
        textAlign: 'center',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      {layer.label}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Canvas                                                              */
/* ------------------------------------------------------------------ */

interface DragState {
  layerId: string;
  pageIndex: number;
  startClientX: number;
  startClientY: number;
  rectW: number;
  rectH: number;
  orig: { x: number; y: number; w: number; h: number };
  mode: 'move' | 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
}

const HANDLES: Array<DragState['mode']> = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

function handlePos(dir: string): React.CSSProperties {
  const s: React.CSSProperties = { position: 'absolute', width: 10, height: 10, background: '#fff', border: `2px solid ${SELECT_BLUE}`, borderRadius: 2, zIndex: 5 };
  if (dir.includes('n')) s.top = -6;
  if (dir.includes('s')) s.bottom = -6;
  if (dir.includes('w')) s.left = -6;
  if (dir.includes('e')) s.right = -6;
  if (dir === 'n' || dir === 's') s.left = 'calc(50% - 5px)';
  if (dir === 'e' || dir === 'w') s.top = 'calc(50% - 5px)';
  s.cursor = dir === 'n' || dir === 's' ? 'ns-resize' : dir === 'e' || dir === 'w' ? 'ew-resize' : dir === 'ne' || dir === 'sw' ? 'nesw-resize' : 'nwse-resize';
  return s;
}

export function DocCanvas({
  doc,
  onDocChange,
  selection,
  onSelectionChange,
  zoom,
  editingId,
  onEditingChange,
}: DocCanvasProps) {
  const pageW = PAGE_BASE_W * zoom;
  const pageH = pageW / pageAspect(doc.page);
  // Mirror of the doc prop so pointer-event handlers (which outlive renders)
  // can build committed DocState values without stale closures.
  const docRef = useRef(doc);
  useEffect(() => {
    docRef.current = doc;
  }, [doc]);
  const pageRefs = useRef(new Map<number, HTMLDivElement>());
  const dragRef = useRef<DragState | null>(null);
  const [transient, setTransient] = useState<{ id: string; x: number; y: number; w: number; h: number } | null>(null);

  const commitTransient = useCallback(
    (t: { id: string; x: number; y: number; w: number; h: number } | null, orig: { x: number; y: number; w: number; h: number }) => {
      setTransient(null);
      if (!t) return;
      const changed =
        Math.abs(t.x - orig.x) > 1e-6 || Math.abs(t.y - orig.y) > 1e-6 ||
        Math.abs(t.w - orig.w) > 1e-6 || Math.abs(t.h - orig.h) > 1e-6;
      if (!changed) return;
      const cur = docRef.current;
      onDocChange(
        {
          ...cur,
          layers: cur.layers.map((l) => (l.id === t.id ? { ...l, x: t.x, y: t.y, w: t.w, h: t.h } : l)),
        },
        true,
      );
    },
    [onDocChange],
  );

  const beginDrag = useCallback(
    (e: React.PointerEvent, layer: DocLayer, pageIndex: number, mode: DragState['mode']) => {
      if (e.button !== 0 || layer.locked || editingId) return;
      e.stopPropagation();
      e.preventDefault();
      if (!selection.includes(layer.id)) {
        onSelectionChange(e.shiftKey ? [...selection, layer.id] : [layer.id]);
      }
      const pageEl = pageRefs.current.get(pageIndex);
      if (!pageEl) return;
      const rect = pageEl.getBoundingClientRect();
      dragRef.current = {
        layerId: layer.id,
        pageIndex,
        startClientX: e.clientX,
        startClientY: e.clientY,
        rectW: rect.width,
        rectH: rect.height,
        orig: { x: layer.x, y: layer.y, w: layer.w, h: layer.h },
        mode,
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [editingId, onSelectionChange, selection],
  );

  const onDragMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = (e.clientX - d.startClientX) / d.rectW;
    const dy = (e.clientY - d.startClientY) / d.rectH;
    if (d.mode === 'move') {
      setTransient({ id: d.layerId, x: d.orig.x + dx, y: d.orig.y + dy, w: d.orig.w, h: d.orig.h });
      return;
    }
    let { x, y, w, h } = d.orig;
    const m = d.mode;
    if (m.includes('e')) w = d.orig.w + dx;
    if (m.includes('s')) h = d.orig.h + dy;
    if (m.includes('w')) {
      w = d.orig.w - dx;
      x = d.orig.x + dx;
    }
    if (m.includes('n')) {
      h = d.orig.h - dy;
      y = d.orig.y + dy;
    }
    w = Math.max(MIN_SIZE, w);
    h = Math.max(MIN_SIZE, h);
    setTransient({ id: d.layerId, x, y, w, h });
  }, []);

  const onDragEnd = useCallback(() => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    commitTransient(transient, d.orig);
  }, [commitTransient, transient]);

  // Keyboard: delete selection, Enter to edit, Escape to deselect.
  const onCanvasKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) return;
      if (editingId) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selection.length > 0) {
        e.preventDefault();
        const ids = new Set(selection);
        const cur = docRef.current;
        onDocChange(
          { ...cur, layers: cur.layers.filter((l) => !ids.has(l.id)) },
          true,
        );
        onSelectionChange([]);
      } else if (e.key === 'Escape') {
        onSelectionChange([]);
      } else if (e.key === 'Enter' && selection.length === 1) {
        const layer = doc.layers.find((l) => l.id === selection[0]);
        if (layer && (layer.type === 'text' || layer.type === 'table') && !layer.locked) {
          e.preventDefault();
          onEditingChange(layer.id);
        }
      }
    },
    [doc.layers, editingId, onDocChange, onEditingChange, onSelectionChange, selection],
  );

  const renderLayerVisual = (layer: DocLayer): React.ReactNode => {
    if (layer.type === 'table') {
      if (editingId === layer.id) {
        return (
          <EditableTable
            layer={layer}
            pageH={pageH}
            pageW={pageW}
            onCommit={(cells) => {
              onEditingChange(null);
              const cur = docRef.current;
              onDocChange(
                { ...cur, layers: cur.layers.map((l) => (l.id === layer.id ? { ...l, cells } : l)) },
                true,
              );
            }}
            onCancel={() => onEditingChange(null)}
          />
        );
      }
      return renderTable(layer, pageH, pageW);
    }
    if (layer.type === 'stamp') {
      return renderStamp(layer, pageH);
    }
    if (layer.type === 'text') {
      if (editingId === layer.id) {
        return (
          <EditableText
            layer={layer}
            pageH={pageH}
            onCommit={(blocks) => {
              onEditingChange(null);
              const cur = docRef.current;
              onDocChange(
                { ...cur, layers: cur.layers.map((l) => (l.id === layer.id ? { ...l, blocks } : l)) },
                true,
              );
            }}
            onCancel={() => onEditingChange(null)}
          />
        );
      }
      return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
          {layer.blocks.map((b) => renderBlock(b, layer, pageH, b.id))}
        </div>
      );
    }
    if (layer.type === 'image') {
      return (
        <img
          src={layer.dataUrl}
          alt=""
          draggable={false}
          style={{ width: '100%', height: '100%', objectFit: layer.fit, display: 'block', userSelect: 'none' }}
        />
      );
    }
    if (layer.type === 'shape') {
      if (layer.kind === 'line') {
        return (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '100%', height: Math.max(1, layer.strokeWidth * pageW), backgroundColor: layer.stroke }} />
          </div>
        );
      }
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: layer.fill ?? 'transparent',
            border: `${Math.max(1, layer.strokeWidth * pageW)}px solid ${layer.stroke}`,
            borderRadius: layer.kind === 'ellipse' ? '50%' : 0,
            boxSizing: 'border-box',
          }}
        />
      );
    }
    // divider
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            width: '100%',
            borderTop: `${Math.max(1, layer.thickness * pageW)}px ${layer.style} ${layer.color}`,
          }}
        />
      </div>
    );
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={onCanvasKeyDown}
      style={{
        outline: 'none',
        background: 'var(--pe-surface-2)',
        minHeight: '100%',
        padding: '32px 16px 64px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 28,
      }}
    >
      {doc.pages.map((page, i) => {
        const layers = layersOnPage(doc, i);
        return (
          <div
            key={page.key}
            id={`doc-page-${i}`}
            ref={(el) => {
              if (el) pageRefs.current.set(i, el);
              else pageRefs.current.delete(i);
            }}
            onClick={() => onSelectionChange([])}
            style={{
              position: 'relative',
              width: pageW,
              height: pageH,
              background: doc.pageBackground || '#ffffff',
              boxShadow: 'var(--pe-shadow-md)',
              borderRadius: 2,
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {page.background && (
              <img
                src={page.background}
                alt=""
                draggable={false}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
              />
            )}
            {/* margin guides */}
            {doc.margins && (
              <div
                style={{
                  position: 'absolute',
                  left: `${doc.margins.left * 100}%`,
                  top: `${doc.margins.top * 100}%`,
                  width: `${(1 - doc.margins.left - doc.margins.right) * 100}%`,
                  height: `${(1 - doc.margins.top - doc.margins.bottom) * 100}%`,
                  border: '1px dashed rgba(100,116,139,0.35)',
                  pointerEvents: 'none',
                }}
              />
            )}
            {/* header / footer */}
            {doc.header && (
              <div
                style={{
                  position: 'absolute',
                  top: `${Math.max(0, doc.margins.top / 2 - 0.02) * 100}%`,
                  left: `${doc.margins.left * 100}%`,
                  width: `${(1 - doc.margins.left - doc.margins.right) * 100}%`,
                  textAlign: 'center',
                  fontSize: Math.max(9, pageH * 0.018),
                  color: '#64748b',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {doc.header}
              </div>
            )}
            {doc.footer && (
              <div
                style={{
                  position: 'absolute',
                  bottom: `${Math.max(0, doc.margins.bottom / 2 - 0.02) * 100}%`,
                  left: `${doc.margins.left * 100}%`,
                  width: `${(1 - doc.margins.left - doc.margins.right) * 100}%`,
                  textAlign: 'center',
                  fontSize: Math.max(9, pageH * 0.018),
                  color: '#64748b',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {doc.footer}
              </div>
            )}
            {layers.map((layer) => {
              const box = transient && transient.id === layer.id ? { ...layer, ...transient } : layer;
              const selected = selection.includes(layer.id);
              const isEditing = editingId === layer.id;
              return (
                <div
                  key={layer.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isEditing) return;
                    if (e.shiftKey) {
                      onSelectionChange(
                        selected ? selection.filter((id) => id !== layer.id) : [...selection, layer.id],
                      );
                    } else {
                      onSelectionChange([layer.id]);
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if ((layer.type === 'text' || layer.type === 'table') && !layer.locked) onEditingChange(layer.id);
                  }}
                  onPointerDown={(e) => beginDrag(e, layer, i, 'move')}
                  onPointerMove={onDragMove}
                  onPointerUp={onDragEnd}
                  onPointerCancel={onDragEnd}
                  style={{
                    position: 'absolute',
                    left: `${box.x * 100}%`,
                    top: `${box.y * 100}%`,
                    width: `${box.w * 100}%`,
                    height: `${box.h * 100}%`,
                    opacity: layer.opacity,
                    transform: layer.rotation ? `rotate(${layer.rotation}deg)` : undefined,
                    transformOrigin: 'center',
                    outline: selected ? `2px solid ${SELECT_BLUE}` : '2px solid transparent',
                    outlineOffset: 0,
                    cursor: layer.locked ? 'not-allowed' : isEditing ? 'text' : 'move',
                    touchAction: 'none',
                    userSelect: isEditing ? 'text' : 'none',
                  }}
                >
                  {renderLayerVisual(layer)}
                  {layer.locked && !isEditing && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: 'var(--pe-surface)',
                        border: '1px solid var(--pe-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--pe-text-2)',
                        zIndex: 6,
                      }}
                    >
                      <Lock size={11} />
                    </div>
                  )}
                  {selected && !layer.locked && !isEditing && selection.length === 1 &&
                    HANDLES.map((h) => (
                      <div
                        key={h}
                        style={handlePos(h)}
                        onPointerDown={(e) => beginDrag(e, layer, i, h)}
                        onPointerMove={onDragMove}
                        onPointerUp={onDragEnd}
                        onPointerCancel={onDragEnd}
                        onClick={(e) => e.stopPropagation()}
                        onDoubleClick={(e) => e.stopPropagation()}
                      />
                    ))}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
