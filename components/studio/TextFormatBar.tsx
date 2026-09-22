'use client';

/**
 * PDFEdit Studio — floating text formatting toolbar.
 *
 * Sejda-style: when a text layer is selected (or being edited), a compact
 * floating bar appears above it with Bold / Italic / font size / font family /
 * text color / delete. All styling uses the --pe-* design tokens so it
 * follows the site's light/dark mode.
 */
import { Bold, Italic, Minus, Plus, Trash2 } from 'lucide-react';
import type { TextLayer } from './types';
import { STUDIO_FONTS } from './fonts';

interface TextFormatBarProps {
  layer: TextLayer;
  onPatch: (patch: Partial<TextLayer>) => void;
  onDelete: () => void;
}

export function TextFormatBar({ layer, onPatch, onDelete }: TextFormatBarProps) {
  const btn = (active: boolean) =>
    `flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
      active
        ? 'bg-[var(--pe-accent-soft)] text-[var(--pe-accent)]'
        : 'text-[var(--pe-text-2)] hover:bg-[var(--pe-surface-3)] hover:text-[var(--pe-text)]'
    }`;

  return (
    <div
      className="pe-preview absolute z-30 flex -translate-x-1/2 -translate-y-full items-center gap-0.5 rounded-xl border border-[var(--pe-border)] bg-[var(--pe-elevated)] px-1.5 py-1 shadow-[var(--pe-shadow-lg)]"
      style={{ left: `${(layer.x + layer.w / 2) * 100}%`, top: `${layer.y * 100}%`, marginTop: -8 }}
      onPointerDown={(e) => e.stopPropagation()}
      role="toolbar"
      aria-label="Text formatting"
    >
      <button
        type="button"
        title="Bold"
        aria-label="Bold"
        aria-pressed={layer.bold}
        onClick={() => onPatch({ bold: !layer.bold })}
        className={btn(!!layer.bold)}
      >
        <Bold size={15} />
      </button>
      <button
        type="button"
        title="Italic"
        aria-label="Italic"
        aria-pressed={layer.italic}
        onClick={() => onPatch({ italic: !layer.italic })}
        className={btn(!!layer.italic)}
      >
        <Italic size={15} />
      </button>
      <div className="mx-0.5 h-5 w-px bg-[var(--pe-border)]" aria-hidden="true" />
      <button
        type="button"
        title="Decrease font size"
        aria-label="Decrease font size"
        onClick={() =>
          onPatch({ fontSize: Math.max(0.004, +(layer.fontSize - 0.002).toFixed(4)) })
        }
        className={btn(false)}
      >
        <Minus size={14} />
      </button>
      <span
        className="min-w-[44px] text-center text-xs font-semibold tabular-nums text-[var(--pe-text)]"
        title="Font size"
      >
        {Math.round(layer.fontSize * 1000)}
      </span>
      <button
        type="button"
        title="Increase font size"
        aria-label="Increase font size"
        onClick={() =>
          onPatch({ fontSize: Math.min(0.2, +(layer.fontSize + 0.002).toFixed(4)) })
        }
        className={btn(false)}
      >
        <Plus size={14} />
      </button>
      <div className="mx-0.5 h-5 w-px bg-[var(--pe-border)]" aria-hidden="true" />
      <select
        value={layer.fontId}
        onChange={(e) => onPatch({ fontId: e.target.value })}
        title="Font family"
        aria-label="Font family"
        className="h-8 max-w-[110px] cursor-pointer rounded-lg bg-transparent px-1 text-xs font-medium text-[var(--pe-text)] outline-none hover:bg-[var(--pe-surface-3)]"
      >
        {STUDIO_FONTS.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>
      <label
        title="Text color"
        className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[var(--pe-text-2)] transition-colors hover:bg-[var(--pe-surface-3)] hover:text-[var(--pe-text)]"
      >
        <span
          aria-hidden="true"
          className="flex h-4 w-4 items-center justify-center rounded border border-[var(--pe-border-strong)] text-[10px] font-extrabold"
          style={{ color: layer.color, backgroundColor: `${layer.color}22` }}
        >
          A
        </span>
        <input
          type="color"
          value={layer.color}
          onChange={(e) => onPatch({ color: e.target.value })}
          aria-label="Text color"
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
      <div className="mx-0.5 h-5 w-px bg-[var(--pe-border)]" aria-hidden="true" />
      <button
        type="button"
        title="Delete text"
        aria-label="Delete text"
        onClick={onDelete}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--pe-danger)] transition-colors hover:bg-[var(--pe-danger-soft)]"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
