'use client';

/**
 * Side panels for the document engine: page management, layer list,
 * and the element-insertion palette.
 */

import type { ReactNode } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Circle,
  Eye,
  EyeOff,
  FilePlus,
  Files,
  Grid3x3,
  Heading,
  Image as ImageIcon,
  Layers,
  List,
  Lock,
  LockOpen,
  Minus,
  PenLine,
  Pilcrow,
  SeparatorHorizontal,
  Square,
  Stamp,
  Trash2,
  Type,
} from 'lucide-react';
import {
  blankPage,
  layersOnPage,
  newId,
  type DocLayer,
  type DocState,
} from '@/lib/doc-engine/types';

const panelBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  height: 30,
  padding: '0 10px',
  borderRadius: 8,
  border: '1px solid var(--pe-border)',
  background: 'var(--pe-surface)',
  color: 'var(--pe-text)',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const iconBtnSm: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 26,
  height: 26,
  borderRadius: 7,
  border: 'none',
  background: 'transparent',
  color: 'var(--pe-text-2)',
  cursor: 'pointer',
  flexShrink: 0,
};

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */

export function PagesPanel({
  doc,
  onDocChange,
  activePage,
  onActivePage,
}: {
  doc: DocState;
  onDocChange: (d: DocState, pushHistory?: boolean) => void;
  activePage: number;
  onActivePage: (i: number) => void;
}): ReactNode {
  const addPage = () => {
    onDocChange({ ...doc, pages: [...doc.pages, blankPage()] }, true);
    onActivePage(doc.pages.length);
  };

  const duplicatePage = (i: number) => {
    const page = doc.pages[i];
    if (!page) return;
    const newPage = { ...page, key: newId('pg') };
    const clonedLayers = doc.layers
      .filter((l) => l.pageIndex === i)
      .map((l) => ({ ...structuredClone(l), id: newId('lyr'), pageIndex: i + 1 }));
    const pages = [...doc.pages.slice(0, i + 1), newPage, ...doc.pages.slice(i + 1)];
    const shifted = doc.layers.map((l) => (l.pageIndex > i ? { ...l, pageIndex: l.pageIndex + 1 } : l));
    onDocChange({ ...doc, pages, layers: [...shifted, ...clonedLayers] }, true);
    onActivePage(i + 1);
  };

  const deletePage = (i: number) => {
    if (doc.pages.length <= 1) return;
    onDocChange(
      {
        ...doc,
        pages: doc.pages.filter((_, idx) => idx !== i),
        layers: doc.layers
          .filter((l) => l.pageIndex !== i)
          .map((l) => (l.pageIndex > i ? { ...l, pageIndex: l.pageIndex - 1 } : l)),
      },
      true,
    );
    onActivePage(Math.max(0, i - 1));
  };

  const movePage = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= doc.pages.length) return;
    const pages = [...doc.pages];
    [pages[i], pages[j]] = [pages[j], pages[i]];
    const layers = doc.layers.map((l) =>
      l.pageIndex === i ? { ...l, pageIndex: j } : l.pageIndex === j ? { ...l, pageIndex: i } : l,
    );
    onDocChange({ ...doc, pages, layers }, true);
    onActivePage(j);
  };

  const gotoPage = (i: number) => {
    onActivePage(i);
    document.getElementById(`doc-page-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12 }}>
      <button type="button" onClick={addPage} style={{ ...panelBtn, height: 34 }}>
        <FilePlus size={14} /> Add page
      </button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {doc.pages.map((page, i) => {
          const count = layersOnPage(doc, i).length;
          const active = i === activePage;
          return (
            <div
              key={page.key}
              onClick={() => gotoPage(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: 8,
                borderRadius: 10,
                border: `1px solid ${active ? 'var(--pe-accent)' : 'var(--pe-border)'}`,
                background: active ? 'var(--pe-accent-soft)' : 'var(--pe-surface)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 44,
                  background: '#fff',
                  border: '1px solid var(--pe-border)',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--pe-text-2)',
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--pe-text)' }}>Page {i + 1}</div>
                <div style={{ fontSize: 11, color: 'var(--pe-text-3)' }}>
                  {count} layer{count === 1 ? '' : 's'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 2 }} onClick={(e) => e.stopPropagation()}>
                <button type="button" title="Move up" onClick={() => movePage(i, -1)} style={iconBtnSm} disabled={i === 0}>
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  title="Move down"
                  onClick={() => movePage(i, 1)}
                  style={iconBtnSm}
                  disabled={i === doc.pages.length - 1}
                >
                  <ChevronDown size={14} />
                </button>
                <button type="button" title="Duplicate page" onClick={() => duplicatePage(i)} style={iconBtnSm}>
                  <Files size={14} />
                </button>
                <button
                  type="button"
                  title="Delete page"
                  onClick={() => deletePage(i)}
                  style={{ ...iconBtnSm, color: 'var(--pe-danger)' }}
                  disabled={doc.pages.length <= 1}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Layers                                                              */
/* ------------------------------------------------------------------ */

function layerLabel(l: DocLayer): string {
  if (l.type === 'text') {
    const txt = l.blocks
      .map((b) => b.runs.map((r) => r.text).join(''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    return txt.slice(0, 30) || 'Text';
  }
  if (l.type === 'image') return 'Image';
  if (l.type === 'table') return `Table ${l.rows}×${l.cols}`;
  if (l.type === 'stamp') return `Stamp: ${l.label}`;
  if (l.type === 'shape') return l.kind === 'rect' ? 'Rectangle' : l.kind === 'ellipse' ? 'Ellipse' : 'Line';
  return 'Divider';
}

function LayerIcon({ layer }: { layer: DocLayer }) {
  const size = 14;
  if (layer.type === 'text') return <Type size={size} />;
  if (layer.type === 'image') return <ImageIcon size={size} />;
  if (layer.type === 'table') return <Grid3x3 size={size} />;
  if (layer.type === 'stamp') return <Stamp size={size} />;
  if (layer.type === 'divider') return <SeparatorHorizontal size={size} />;
  if (layer.kind === 'ellipse') return <Circle size={size} />;
  if (layer.kind === 'line') return <Minus size={size} />;
  return <Square size={size} />;
}

export function LayersPanel({
  doc,
  pageIndex,
  selection,
  onSelectionChange,
  onDocChange,
}: {
  doc: DocState;
  pageIndex: number;
  selection: string[];
  onSelectionChange: (ids: string[]) => void;
  onDocChange: (d: DocState, pushHistory?: boolean) => void;
}): ReactNode {
  const layers = [...layersOnPage(doc, pageIndex)].reverse(); // top of stack first

  const patch = (id: string, fn: (l: DocLayer) => DocLayer) => {
    onDocChange({ ...doc, layers: doc.layers.map((l) => (l.id === id ? fn(l) : l)) }, true);
  };

  if (layers.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: 'var(--pe-text-3)', fontSize: 12 }}>
        <Layers size={20} style={{ marginBottom: 6, opacity: 0.5 }} />
        <div>No layers on this page yet.</div>
        <div style={{ marginTop: 4 }}>Add elements from the Elements tab.</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 8 }}>
      {layers.map((l) => {
        const selected = selection.includes(l.id);
        const hidden = l.opacity <= 0;
        return (
          <div
            key={l.id}
            onClick={() => onSelectionChange([l.id])}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 8px',
              borderRadius: 9,
              border: `1px solid ${selected ? 'var(--pe-accent)' : 'transparent'}`,
              background: selected ? 'var(--pe-accent-soft)' : 'transparent',
              cursor: 'pointer',
              opacity: hidden ? 0.55 : 1,
            }}
          >
            <span style={{ color: 'var(--pe-text-2)', display: 'inline-flex' }}>
              <LayerIcon layer={l} />
            </span>
            <span
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: 12,
                color: 'var(--pe-text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {layerLabel(l)}
            </span>
            <button
              type="button"
              title={hidden ? 'Show' : 'Hide'}
              onClick={(e) => {
                e.stopPropagation();
                patch(l.id, (x) => ({ ...x, opacity: hidden ? 1 : 0 }));
              }}
              style={iconBtnSm}
            >
              {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button
              type="button"
              title={l.locked ? 'Unlock' : 'Lock'}
              onClick={(e) => {
                e.stopPropagation();
                patch(l.id, (x) => ({ ...x, locked: !x.locked }));
              }}
              style={iconBtnSm}
            >
              {l.locked ? <Lock size={14} /> : <LockOpen size={14} />}
            </button>
            <button
              type="button"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onDocChange({ ...doc, layers: doc.layers.filter((x) => x.id !== l.id) }, true);
                onSelectionChange(selection.filter((id) => id !== l.id));
              }}
              style={{ ...iconBtnSm, color: 'var(--pe-danger)' }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Elements                                                            */
/* ------------------------------------------------------------------ */

export type ElementKind = 'heading' | 'paragraph' | 'bullets' | 'image' | 'rect' | 'ellipse' | 'line' | 'divider' | 'table' | 'signature' | 'stamp';

const ELEMENTS: Array<{ kind: ElementKind; label: string; icon: ReactNode }> = [
  { kind: 'heading', label: 'Heading', icon: <Heading size={18} /> },
  { kind: 'paragraph', label: 'Text', icon: <Pilcrow size={18} /> },
  { kind: 'bullets', label: 'Bullets', icon: <List size={18} /> },
  { kind: 'image', label: 'Image', icon: <ImageIcon size={18} /> },
  { kind: 'table', label: 'Table', icon: <Grid3x3 size={18} /> },
  { kind: 'signature', label: 'Signature', icon: <PenLine size={18} /> },
  { kind: 'stamp', label: 'Stamp', icon: <Stamp size={18} /> },
  { kind: 'rect', label: 'Rectangle', icon: <Square size={18} /> },
  { kind: 'ellipse', label: 'Ellipse', icon: <Circle size={18} /> },
  { kind: 'line', label: 'Line', icon: <Minus size={18} /> },
  { kind: 'divider', label: 'Divider', icon: <SeparatorHorizontal size={18} /> },
];

export function ElementsPanel({ onAdd }: { onAdd: (kind: ElementKind) => void }): ReactNode {
  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {ELEMENTS.map((el) => (
          <button
            key={el.kind}
            type="button"
            onClick={() => onAdd(el.kind)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              padding: '14px 8px',
              borderRadius: 12,
              border: '1px solid var(--pe-border)',
              background: 'var(--pe-surface)',
              color: 'var(--pe-text-2)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--pe-accent)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--pe-accent)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--pe-border)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--pe-text-2)';
            }}
          >
            {el.icon}
            {el.label}
          </button>
        ))}
      </div>
      <p style={{ marginTop: 12, fontSize: 11, color: 'var(--pe-text-3)', lineHeight: 1.5 }}>
        Click an element to drop it on the current page, then drag it into place. Double-click text to edit it
        in place.
      </p>
    </div>
  );
}
