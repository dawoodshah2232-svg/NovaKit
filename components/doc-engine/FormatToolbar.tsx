'use client';

/**
 * FormatToolbar — floating rich-text format bar for text layers.
 *
 * Two modes:
 * - editing=false: patches the document model (layer defaults + runs).
 * - editing=true:  a contentEditable is focused, so B/I/U/color go through
 *   document.execCommand and the model is updated on blur by DocCanvas.
 */

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  Minus,
  Plus,
  RemoveFormatting,
  Underline,
} from 'lucide-react';
import { A4_HEIGHT_PT, DOC_FONTS, type DocBlockKind, type DocTextLayer } from '@/lib/doc-engine/types';

export interface FormatToolbarProps {
  /** Currently selected text layers (empty = disabled state). */
  textLayers: DocTextLayer[];
  /** Apply a transform to every selected text layer (parent commits history). */
  onPatchLayers: (fn: (l: DocTextLayer) => DocTextLayer) => void;
  /** True when a contentEditable is focused; B/I/U/color route to execCommand. */
  editing: boolean;
  compact?: boolean;
  /** Page height in points, used for the pt size readout (default A4). */
  pageHeightPt?: number;
}

function allRunsBold(layers: DocTextLayer[]): boolean {
  return layers.length > 0 && layers.every((l) => l.blocks.every((b) => b.runs.every((r) => r.bold)));
}
function allRunsItalic(layers: DocTextLayer[]): boolean {
  return layers.length > 0 && layers.every((l) => l.blocks.every((b) => b.runs.every((r) => r.italic)));
}
function allRunsUnderline(layers: DocTextLayer[]): boolean {
  return layers.length > 0 && layers.every((l) => l.blocks.every((b) => b.runs.every((r) => r.underline)));
}
function allBlocksKind(layers: DocTextLayer[], kind: DocBlockKind): boolean {
  return layers.length > 0 && layers.every((l) => l.blocks.length > 0 && l.blocks.every((b) => b.kind === kind));
}
function allBlocksAlign(layers: DocTextLayer[], align: string): boolean {
  return layers.length > 0 && layers.every((l) => l.blocks.every((b) => b.align === align));
}

function clearRun(r: DocTextLayer['blocks'][number]['runs'][number]) {
  return { ...r, bold: false, italic: false, underline: false, color: null, fontSize: null, fontId: null };
}

const btnBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 30,
  height: 30,
  borderRadius: 8,
  border: 'none',
  background: 'transparent',
  color: 'var(--pe-text-2)',
  cursor: 'pointer',
  flexShrink: 0,
};

export function FormatToolbar({ textLayers, onPatchLayers, editing, compact, pageHeightPt }: FormatToolbarProps) {
  const disabled = textLayers.length === 0;
  const first = textLayers[0];
  const sizePt = first ? Math.round(first.fontSize * (pageHeightPt ?? A4_HEIGHT_PT)) : 0;

  const exec = (cmd: string, value?: string) => {
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(cmd, false, value ?? '');
  };

  const toggleBold = () => {
    if (editing) return exec('bold');
    const target = !allRunsBold(textLayers);
    onPatchLayers((l) => ({ ...l, blocks: l.blocks.map((b) => ({ ...b, runs: b.runs.map((r) => ({ ...r, bold: target })) })) }));
  };
  const toggleItalic = () => {
    if (editing) return exec('italic');
    const target = !allRunsItalic(textLayers);
    onPatchLayers((l) => ({ ...l, blocks: l.blocks.map((b) => ({ ...b, runs: b.runs.map((r) => ({ ...r, italic: target })) })) }));
  };
  const toggleUnderline = () => {
    if (editing) return exec('underline');
    const target = !allRunsUnderline(textLayers);
    onPatchLayers((l) => ({ ...l, blocks: l.blocks.map((b) => ({ ...b, runs: b.runs.map((r) => ({ ...r, underline: target })) })) }));
  };
  const setColor = (color: string) => {
    if (editing) return exec('foreColor', color);
    onPatchLayers((l) => ({
      ...l,
      color,
      blocks: l.blocks.map((b) => ({ ...b, runs: b.runs.map((r) => ({ ...r, color: null })) })),
    }));
  };
  const setFont = (fontId: DocTextLayer['fontId']) => {
    onPatchLayers((l) => ({
      ...l,
      fontId,
      blocks: l.blocks.map((b) => ({ ...b, runs: b.runs.map((r) => ({ ...r, fontId: null })) })),
    }));
  };
  const bumpSize = (dir: 1 | -1) => {
    onPatchLayers((l) => {
      const next = Math.min(0.12, Math.max(0.004, l.fontSize * (dir === 1 ? 1.15 : 1 / 1.15)));
      return {
        ...l,
        fontSize: next,
        blocks: l.blocks.map((b) => ({ ...b, runs: b.runs.map((r) => ({ ...r, fontSize: null })) })),
      };
    });
  };
  const setAlign = (align: DocTextLayer['blocks'][number]['align']) => {
    onPatchLayers((l) => ({ ...l, blocks: l.blocks.map((b) => ({ ...b, align })) }));
  };
  const toggleList = (kind: 'bullet' | 'numbered') => {
    const toParagraph = allBlocksKind(textLayers, kind);
    onPatchLayers((l) => ({
      ...l,
      blocks: l.blocks.map((b) => ({ ...b, kind: toParagraph ? ('paragraph' as DocBlockKind) : kind })),
    }));
  };
  const clearFormatting = () => {
    onPatchLayers((l) => ({ ...l, blocks: l.blocks.map((b) => ({ ...b, runs: b.runs.map(clearRun) })) }));
  };

  const modelOnly = editing; // these controls only make sense against the model
  const iconBtn = (active: boolean, title: string, onClick: () => void, children: React.ReactNode, modelDisabled = false) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled || (modelDisabled && modelOnly)}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      style={{
        ...btnBase,
        background: active ? 'var(--pe-accent-soft)' : 'transparent',
        color: active ? 'var(--pe-accent)' : 'var(--pe-text-2)',
        opacity: disabled || (modelDisabled && modelOnly) ? 0.35 : 1,
        cursor: disabled ? 'default' : 'pointer',
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = active ? 'var(--pe-accent-soft)' : 'var(--pe-surface-2)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = active ? 'var(--pe-accent-soft)' : 'transparent';
      }}
    >
      {children}
    </button>
  );

  const sep = (
    <span style={{ width: 1, height: 20, background: 'var(--pe-border)', margin: '0 2px', flexShrink: 0 }} />
  );

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        padding: compact ? '4px 6px' : '6px 8px',
        background: 'var(--pe-elevated)',
        border: '1px solid var(--pe-border)',
        borderRadius: 14,
        boxShadow: 'var(--pe-shadow-md)',
        maxWidth: '100%',
        overflowX: 'auto',
      }}
    >
      <select
        aria-label="Font family"
        disabled={disabled || modelOnly}
        value={first?.fontId ?? 'sans'}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => setFont(e.target.value as DocTextLayer['fontId'])}
        style={{
          height: 30,
          borderRadius: 8,
          border: '1px solid var(--pe-border)',
          background: 'var(--pe-surface)',
          color: 'var(--pe-text)',
          fontSize: 12,
          padding: '0 6px',
          opacity: disabled || modelOnly ? 0.4 : 1,
          cursor: disabled ? 'default' : 'pointer',
        }}
      >
        {DOC_FONTS.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>
      {iconBtn(false, 'Decrease font size', () => bumpSize(-1), <Minus size={15} />, true)}
      <span
        style={{
          minWidth: 44,
          textAlign: 'center',
          fontSize: 12,
          fontVariantNumeric: 'tabular-nums',
          color: 'var(--pe-text-2)',
          opacity: disabled || modelOnly ? 0.4 : 1,
        }}
      >
        {sizePt > 0 ? `${sizePt}pt` : '—'}
      </span>
      {iconBtn(false, 'Increase font size', () => bumpSize(1), <Plus size={15} />, true)}
      {sep}
      {iconBtn(allRunsBold(textLayers), 'Bold', toggleBold, <Bold size={15} />)}
      {iconBtn(allRunsItalic(textLayers), 'Italic', toggleItalic, <Italic size={15} />)}
      {iconBtn(allRunsUnderline(textLayers), 'Underline', toggleUnderline, <Underline size={15} />)}
      <label
        title="Text color"
        style={{
          ...btnBase,
          position: 'relative',
          overflow: 'hidden',
          opacity: disabled ? 0.35 : 1,
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: first?.color ?? 'var(--pe-text-2)',
            lineHeight: 1,
            borderBottom: `3px solid ${first?.color ?? 'var(--pe-text-3)'}`,
          }}
        >
          A
        </span>
        <input
          type="color"
          aria-label="Text color"
          disabled={disabled}
          value={/^#[0-9a-f]{6}$/i.test(first?.color ?? '') ? first!.color : '#1c1a16'}
          onChange={(e) => setColor(e.target.value)}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
        />
      </label>
      {sep}
      {iconBtn(allBlocksAlign(textLayers, 'left'), 'Align left', () => setAlign('left'), <AlignLeft size={15} />, true)}
      {iconBtn(allBlocksAlign(textLayers, 'center'), 'Align center', () => setAlign('center'), <AlignCenter size={15} />, true)}
      {iconBtn(allBlocksAlign(textLayers, 'right'), 'Align right', () => setAlign('right'), <AlignRight size={15} />, true)}
      {iconBtn(allBlocksAlign(textLayers, 'justify'), 'Justify', () => setAlign('justify'), <AlignJustify size={15} />, true)}
      {sep}
      {iconBtn(allBlocksKind(textLayers, 'bullet'), 'Bullet list', () => toggleList('bullet'), <List size={15} />, true)}
      {iconBtn(allBlocksKind(textLayers, 'numbered'), 'Numbered list', () => toggleList('numbered'), <ListOrdered size={15} />, true)}
      {iconBtn(false, 'Clear formatting', clearFormatting, <RemoveFormatting size={15} />, true)}
    </div>
  );
}
