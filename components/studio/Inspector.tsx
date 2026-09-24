'use client';

/**
 * PDFEdit Studio — right-side contextual properties panel.
 *
 * Two modes:
 *  - A layer is selected → show ONLY the controls relevant to that layer type,
 *    plus Delete / Duplicate actions.
 *  - Nothing selected → show the ACTIVE TOOL's creation options (same controls
 *    minus position/geometry), or a hint for select/pages tools.
 *
 * NOTE (contract gap): the API text mentions z-order up/down for text layers,
 * but InspectorProps provides no reorder callback, so no z-order buttons are
 * rendered. Parent should add an optional onMoveZSelected(dir: 1 | -1) prop.
 * NOTE: ToolOptions defines no highlightWidth, so the highlight tool's width
 * slider reuses `drawWidth` in tool-options mode.
 */
import type { ReactNode } from 'react';
import { useRef, useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowUpRight,
  ArrowUpToLine,
  Bold,
  Circle,
  Copy,
  Image as ImageIcon,
  Italic,
  PenLine,
  Slash,
  Square,
  Trash2,
  TriangleAlert,
  Underline,
  Upload,
} from 'lucide-react';
import type {
  ImageLayer,
  Layer,
  RedactLayer,
  ShapeKind,
  ShapeLayer,
  SignatureLayer,
  StampId,
  StampLayer,
  StrokeLayer,
  TextLayer,
  ToolId,
} from './types';
import { STAMPS } from './types';
import { STUDIO_FONTS, fontAliasNote } from './fonts';
import type { ToolOptions } from './toolOptions';

export interface InspectorProps {
  tool: ToolId;
  selected: Layer | null;
  onPatchSelected: (patch: Partial<Layer>) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  options: ToolOptions;
  onOptionsChange: (patch: Partial<ToolOptions>) => void;
  onOpenSignaturePad: () => void;
  hasSignature: boolean;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  /** data URL of the staged image for the Image tool (null = none chosen) */
  pendingImage: string | null;
  onImageSelected: (dataUrl: string) => void;
  onClearImage: () => void;
}

/* ---------------------------------- bits --------------------------------- */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-[var(--pe-border)] px-4 py-3">
      <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pe-text-3)]">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

const pct0 = (v: number) => `${Math.round(v * 100)}%`;
const pct1 = (v: number) => `${(v * 100).toFixed(1)}%`;
const pct2 = (v: number) => `${(v * 100).toFixed(2)}%`;
const deg = (v: number) => `${Math.round(v)}°`;

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <div>
      <div className="mb-0.5 flex items-center justify-between">
        <span className="text-xs text-[var(--pe-text-2)]">{label}</span>
        <span className="text-xs tabular-nums text-[var(--pe-text-2)]">{format(value)}</span>
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 w-full cursor-pointer accent-[var(--pe-accent)]"
      />
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex min-h-9 items-center justify-between gap-2">
      <span className="text-xs text-[var(--pe-text-2)]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tabular-nums text-[var(--pe-text-3)]">{value}</span>
        <input
          type="color"
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-11 cursor-pointer rounded-lg border border-[var(--pe-border-strong)] bg-[var(--pe-bg)] p-1"
        />
      </div>
    </div>
  );
}

function TextAreaRow({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <div className="mb-1 text-xs text-[var(--pe-text-2)]">{label}</div>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[var(--pe-border-strong)] bg-[var(--pe-bg)] px-2.5 py-2 text-sm text-[var(--pe-text)] outline-none focus:border-[var(--pe-focus)]"
      />
    </div>
  );
}

function TextInputRow({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <div className="mb-1 text-xs text-[var(--pe-text-2)]">{label}</div>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-lg border border-[var(--pe-border-strong)] bg-[var(--pe-bg)] px-2.5 text-sm text-[var(--pe-text)] outline-none focus:border-[var(--pe-focus)]"
      />
    </div>
  );
}

function SegRow<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: ReactNode; title: string }>;
}) {
  return (
    <div>
      <div className="mb-1 text-xs text-[var(--pe-text-2)]">{label}</div>
      <div
        className="flex gap-1 rounded-xl border border-[var(--pe-border)] bg-[var(--pe-bg)] p-1"
        role="group"
        aria-label={label}
      >
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            title={o.title}
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
            className={`flex h-9 min-w-9 flex-1 items-center justify-center rounded-lg text-xs font-medium ${
              o.value === value
                ? 'bg-[var(--pe-surface-3)] text-[var(--pe-text)]'
                : 'text-[var(--pe-text-3)] hover:text-[var(--pe-text-2)]'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StyleToggles({
  bold,
  italic,
  underline,
  onToggle,
}: {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  onToggle: (k: 'bold' | 'italic' | 'underline') => void;
}) {
  const items = [
    { k: 'bold' as const, active: bold, title: 'Bold', icon: <Bold size={15} /> },
    { k: 'italic' as const, active: italic, title: 'Italic', icon: <Italic size={15} /> },
    {
      k: 'underline' as const,
      active: underline,
      title: 'Underline',
      icon: <Underline size={15} />,
    },
  ];
  return (
    <div>
      <div className="mb-1 text-xs text-[var(--pe-text-2)]">Style</div>
      <div className="flex gap-1.5">
        {items.map((it) => (
          <button
            key={it.k}
            type="button"
            aria-pressed={it.active}
            title={it.title}
            onClick={() => onToggle(it.k)}
            className={`flex h-9 min-w-9 items-center justify-center rounded-lg border ${
              it.active
                ? 'border-[var(--pe-focus)] bg-[var(--pe-accent-soft)] text-[var(--pe-accent)]'
                : 'border-[var(--pe-border-strong)] text-[var(--pe-text-2)] hover:bg-[var(--pe-surface-3)] hover:text-[var(--pe-text)]'
            }`}
          >
            {it.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

function FontRow({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const note = fontAliasNote(value);
  return (
    <div>
      <div className="mb-1 text-xs text-[var(--pe-text-2)]">Font</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-lg border border-[var(--pe-border-strong)] bg-[var(--pe-bg)] px-2 text-sm text-[var(--pe-text)] outline-none focus:border-[var(--pe-focus)]"
      >
        {STUDIO_FONTS.map((f) => {
          const n = fontAliasNote(f.id);
          return (
            <option key={f.id} value={f.id}>
              {n ? `${f.label} (${n})` : f.label}
            </option>
          );
        })}
      </select>
      {note && (
        <div className="mt-1 text-[11px] leading-4 text-[var(--pe-danger)]">
          {note.charAt(0).toUpperCase() + note.slice(1)} in the exported PDF.
        </div>
      )}
    </div>
  );
}

function PercentField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const display = Math.round(value * 1000) / 10;
  return (
    <label className="flex h-9 items-center justify-between gap-1 rounded-lg border border-[var(--pe-border)] bg-[var(--pe-bg)] px-2">
      <span className="text-xs text-[var(--pe-text-3)]">{label}</span>
      <input
        type="number"
        aria-label={label}
        min={0}
        max={100}
        step={0.5}
        value={display}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(Math.min(1, Math.max(0, n / 100)));
        }}
        className="w-16 bg-transparent text-right text-sm tabular-nums text-[var(--pe-text)] outline-none"
      />
    </label>
  );
}

function FillRow({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div>
      <div className="mb-1 text-xs text-[var(--pe-text-2)]">Fill color</div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-pressed={value === null}
          title="Transparent fill"
          onClick={() => onChange(value === null ? '#ffffff' : null)}
          className={`h-9 rounded-lg border px-3 text-xs font-medium ${
            value === null
              ? 'border-[var(--pe-focus)] bg-[var(--pe-accent-soft)] text-[var(--pe-accent)]'
              : 'border-[var(--pe-border-strong)] text-[var(--pe-text-2)] hover:bg-[var(--pe-surface-3)] hover:text-[var(--pe-text)]'
          }`}
        >
          No fill
        </button>
        {value !== null && (
          <input
            type="color"
            aria-label="Fill color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-11 cursor-pointer rounded-lg border border-[var(--pe-border-strong)] bg-[var(--pe-bg)] p-1"
          />
        )}
      </div>
    </div>
  );
}

function StampPicker({
  value,
  onChange,
}: {
  value: StampId;
  onChange: (v: StampId) => void;
}) {
  return (
    <div>
      <div className="mb-1 text-xs text-[var(--pe-text-2)]">Stamp</div>
      <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Stamp">
        {STAMPS.map((s) => {
          const active = s.id === value;
          return (
            <button
              key={s.id}
              type="button"
              title={s.label}
              aria-pressed={active}
              onClick={() => onChange(s.id)}
              style={{
                borderColor: s.color,
                color: s.color,
                backgroundColor: active ? `${s.color}26` : 'transparent',
              }}
              className={`h-9 rounded-lg border text-[10px] font-extrabold tracking-widest ${
                active ? 'ring-1' : 'opacity-70 hover:opacity-100'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RedactWarning() {
  return (
    <div className="flex gap-2 rounded-xl border border-[var(--pe-danger)] bg-[var(--pe-danger-soft)] p-3">
      <TriangleAlert size={16} className="mt-0.5 shrink-0 text-[var(--pe-danger)]" />
      <p className="text-xs leading-5 text-[var(--pe-danger)]">
        Overlay-only redaction: covers content with an opaque box. The underlying content may
        still be extractable from the file.
      </p>
    </div>
  );
}

function OverlayNote() {
  return (
    <p className="text-[11px] leading-5 text-[var(--pe-text-3)]">
      Text is added as an overlay on the original PDF.
    </p>
  );
}

function ToolHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="border-b border-[var(--pe-border)] px-4 py-3">
      <div className="text-sm font-semibold text-[var(--pe-text)]">{title}</div>
      {hint && <div className="mt-0.5 text-xs text-[var(--pe-text-3)]">{hint}</div>}
    </div>
  );
}

/* ------------------------- selected-layer sections ------------------------ */

type Patch = (patch: Partial<Layer>) => void;

function layerTitle(l: Layer): string {
  switch (l.type) {
    case 'text':
      return 'Text';
    case 'stroke':
      return l.kind === 'highlight' ? 'Highlight' : 'Drawing';
    case 'shape':
      return 'Shape';
    case 'image':
      return 'Image';
    case 'signature':
      return 'Signature';
    case 'stamp':
      return 'Stamp';
    case 'redact':
      return 'Redaction';
  }
}

function TextSection({ layer, onPatch }: { layer: TextLayer; onPatch: Patch }) {
  return (
    <>
      <Section title="Text">
        <TextAreaRow
          label="Content"
          value={layer.text}
          onChange={(v) => onPatch({ text: v })}
        />
        <FontRow value={layer.fontId} onChange={(v) => onPatch({ fontId: v })} />
        <SliderRow
          label="Size"
          value={layer.fontSize}
          min={0.008}
          max={0.12}
          step={0.002}
          onChange={(v) => onPatch({ fontSize: v })}
          format={pct1}
        />
        <StyleToggles
          bold={layer.bold}
          italic={layer.italic}
          underline={layer.underline}
          onToggle={(k) => {
            if (k === 'bold') onPatch({ bold: !layer.bold });
            else if (k === 'italic') onPatch({ italic: !layer.italic });
            else onPatch({ underline: !layer.underline });
          }}
        />
        <ColorRow label="Color" value={layer.color} onChange={(v) => onPatch({ color: v })} />
        <SegRow
          label="Align"
          value={layer.align}
          onChange={(v) => onPatch({ align: v })}
          options={[
            { value: 'left', label: <AlignLeft size={15} />, title: 'Align left' },
            { value: 'center', label: <AlignCenter size={15} />, title: 'Align center' },
            { value: 'right', label: <AlignRight size={15} />, title: 'Align right' },
          ]}
        />
        <OverlayNote />
      </Section>
      <Section title="Layout">
        <SliderRow
          label="Line height"
          value={layer.lineHeight}
          min={1}
          max={2.5}
          step={0.05}
          onChange={(v) => onPatch({ lineHeight: v })}
          format={(v) => v.toFixed(2)}
        />
        <SliderRow
          label="Opacity"
          value={layer.opacity}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => onPatch({ opacity: v })}
          format={pct0}
        />
        <SliderRow
          label="Rotation"
          value={layer.rotation}
          min={-180}
          max={180}
          step={1}
          onChange={(v) => onPatch({ rotation: v })}
          format={deg}
        />
        <div className="grid grid-cols-2 gap-2">
          <PercentField label="X" value={layer.x} onChange={(v) => onPatch({ x: v })} />
          <PercentField label="Y" value={layer.y} onChange={(v) => onPatch({ y: v })} />
          <PercentField label="W" value={layer.w} onChange={(v) => onPatch({ w: v })} />
          <PercentField label="H" value={layer.h} onChange={(v) => onPatch({ h: v })} />
        </div>
        <p className="text-[11px] leading-4 text-[var(--pe-text-3)]">
          Position and size are % of the page.
        </p>
      </Section>
    </>
  );
}

function StrokeSection({ layer, onPatch }: { layer: StrokeLayer; onPatch: Patch }) {
  const isHighlight = layer.kind === 'highlight';
  return (
    <Section title={isHighlight ? 'Highlight' : 'Drawing'}>
      <ColorRow
        label={isHighlight ? 'Highlight color' : 'Ink color'}
        value={layer.color}
        onChange={(v) => onPatch({ color: v })}
      />
      <SliderRow
        label="Width"
        value={layer.width}
        min={0.001}
        max={0.03}
        step={0.0005}
        onChange={(v) => onPatch({ width: v })}
        format={pct2}
      />
      <SliderRow
        label="Opacity"
        value={layer.opacity}
        min={0}
        max={1}
        step={0.05}
        onChange={(v) => onPatch({ opacity: v })}
        format={pct0}
      />
    </Section>
  );
}

function ShapeSection({ layer, onPatch }: { layer: ShapeLayer; onPatch: Patch }) {
  const kinds: Array<{ value: ShapeKind; label: ReactNode; title: string }> = [
    { value: 'rect', label: <Square size={15} />, title: 'Rectangle' },
    { value: 'ellipse', label: <Circle size={15} />, title: 'Ellipse' },
    { value: 'line', label: <Slash size={15} />, title: 'Line' },
    { value: 'arrow', label: <ArrowUpRight size={15} />, title: 'Arrow' },
  ];
  return (
    <Section title="Shape">
      <SegRow label="Shape" value={layer.kind} onChange={(v) => onPatch({ kind: v })} options={kinds} />
      <ColorRow
        label="Stroke color"
        value={layer.strokeColor}
        onChange={(v) => onPatch({ strokeColor: v })}
      />
      <FillRow value={layer.fillColor} onChange={(v) => onPatch({ fillColor: v })} />
      <SliderRow
        label="Stroke width"
        value={layer.strokeWidth}
        min={0.001}
        max={0.03}
        step={0.0005}
        onChange={(v) => onPatch({ strokeWidth: v })}
        format={pct2}
      />
      <SliderRow
        label="Opacity"
        value={layer.opacity}
        min={0}
        max={1}
        step={0.05}
        onChange={(v) => onPatch({ opacity: v })}
        format={pct0}
      />
    </Section>
  );
}

function MediaSection({
  layer,
  onPatch,
}: {
  layer: ImageLayer | SignatureLayer;
  onPatch: Patch;
}) {
  return (
    <Section title={layer.type === 'image' ? 'Image' : 'Signature'}>
      <SliderRow
        label="Opacity"
        value={layer.opacity}
        min={0}
        max={1}
        step={0.05}
        onChange={(v) => onPatch({ opacity: v })}
        format={pct0}
      />
      <SliderRow
        label="Rotation"
        value={layer.rotation}
        min={-180}
        max={180}
        step={1}
        onChange={(v) => onPatch({ rotation: v })}
        format={deg}
      />
    </Section>
  );
}

function StampSelectedSection({ layer, onPatch }: { layer: StampLayer; onPatch: Patch }) {
  return (
    <Section title="Stamp">
      <StampPicker value={layer.stampId} onChange={(v) => onPatch({ stampId: v })} />
      <SliderRow
        label="Opacity"
        value={layer.opacity}
        min={0}
        max={1}
        step={0.05}
        onChange={(v) => onPatch({ opacity: v })}
        format={pct0}
      />
    </Section>
  );
}

function RedactSelectedSection({ layer, onPatch }: { layer: RedactLayer; onPatch: Patch }) {
  return (
    <Section title="Redaction">
      <SegRow
        label="Color"
        value={layer.color}
        onChange={(v) => onPatch({ color: v })}
        options={[
          { value: 'black', label: 'Black', title: 'Black box' },
          { value: 'white', label: 'White', title: 'White box' },
        ]}
      />
      <TextInputRow
        label="Label"
        value={layer.label ?? ''}
        placeholder="Optional label"
        onChange={(v) => onPatch({ label: v })}
      />
      <SliderRow
        label="Opacity"
        value={layer.opacity}
        min={0}
        max={1}
        step={0.05}
        onChange={(v) => onPatch({ opacity: v })}
        format={pct0}
      />
      <RedactWarning />
    </Section>
  );
}

/* --------------------------- tool-option sections ------------------------- */

type OptPatch = (patch: Partial<ToolOptions>) => void;

function TextToolOptions({ options, onChange }: { options: ToolOptions; onChange: OptPatch }) {
  void options;
  void onChange;
  return (
    <>
      <ToolHeader title="Text tool" hint="Click on a page to place text." />
      <Section title="Formatting">
        <p className="text-xs leading-relaxed text-[var(--pe-text-3)]">
          Use the formatting ribbon above the canvas — font, size, bold, italic, underline,
          strikethrough, colors, alignment, lists and clear formatting. It edits the selected text
          box, or sets the style for the next one you place.
        </p>
        <OverlayNote />
      </Section>
    </>
  );
}

function DrawToolOptions({ options, onChange }: { options: ToolOptions; onChange: OptPatch }) {
  return (
    <>
      <ToolHeader title="Draw tool" hint="Drag on a page to draw freehand." />
      <Section title="Pen">
        <ColorRow
          label="Ink color"
          value={options.drawColor}
          onChange={(v) => onChange({ drawColor: v })}
        />
        <SliderRow
          label="Width"
          value={options.drawWidth}
          min={0.001}
          max={0.03}
          step={0.0005}
          onChange={(v) => onChange({ drawWidth: v })}
          format={pct2}
        />
      </Section>
    </>
  );
}

function HighlightToolOptions({
  options,
  onChange,
}: {
  options: ToolOptions;
  onChange: OptPatch;
}) {
  return (
    <>
      <ToolHeader title="Highlight tool" hint="Drag over text to highlight it." />
      <Section title="Highlighter">
        <ColorRow
          label="Highlight color"
          value={options.highlightColor}
          onChange={(v) => onChange({ highlightColor: v })}
        />
        <SliderRow
          label="Width"
          value={options.drawWidth}
          min={0.001}
          max={0.03}
          step={0.0005}
          onChange={(v) => onChange({ drawWidth: v })}
          format={pct2}
        />
      </Section>
    </>
  );
}

function ShapeToolOptions({ options, onChange }: { options: ToolOptions; onChange: OptPatch }) {
  const kinds: Array<{ value: ShapeKind; label: ReactNode; title: string }> = [
    { value: 'rect', label: <Square size={15} />, title: 'Rectangle' },
    { value: 'ellipse', label: <Circle size={15} />, title: 'Ellipse' },
    { value: 'line', label: <Slash size={15} />, title: 'Line' },
    { value: 'arrow', label: <ArrowUpRight size={15} />, title: 'Arrow' },
  ];
  return (
    <>
      <ToolHeader title="Shape tool" hint="Drag on a page to draw a shape." />
      <Section title="Shape">
        <SegRow
          label="Shape"
          value={options.shapeKind}
          onChange={(v) => onChange({ shapeKind: v })}
          options={kinds}
        />
        <ColorRow
          label="Stroke color"
          value={options.strokeColor}
          onChange={(v) => onChange({ strokeColor: v })}
        />
        <FillRow value={options.fillColor} onChange={(v) => onChange({ fillColor: v })} />
        <SliderRow
          label="Stroke width"
          value={options.strokeWidth}
          min={0.001}
          max={0.03}
          step={0.0005}
          onChange={(v) => onChange({ strokeWidth: v })}
          format={pct2}
        />
      </Section>
    </>
  );
}

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

function MediaToolOptions({
  options,
  onChange,
  pendingImage,
  onImageSelected,
  onClearImage,
}: {
  options: ToolOptions;
  onChange: OptPatch;
  pendingImage: string | null;
  onImageSelected: (dataUrl: string) => void;
  onClearImage: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptFile = (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (PNG, JPG, GIF, WebP…).');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('That image is larger than 15 MB — please pick a smaller one.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => onImageSelected(String(reader.result));
    reader.onerror = () => setError('Could not read that image. Try another file.');
    reader.readAsDataURL(file);
  };

  return (
    <>
      <ToolHeader
        title="Image tool"
        hint={
          pendingImage
            ? 'Click on a page to place the image. You can place it again on other pages.'
            : 'Choose an image first, then click on a page to place it.'
        }
      />
      <Section title="Image">
        {pendingImage ? (
          <div className="space-y-2.5">
            <div className="overflow-hidden rounded-xl border border-[var(--pe-border-strong)] bg-[var(--pe-surface-3)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendingImage} alt="Selected image preview" className="max-h-44 w-full object-contain" />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--pe-border-strong)] text-[13px] font-medium text-[var(--pe-text-2)] transition-colors hover:bg-[var(--pe-surface-3)] hover:text-[var(--pe-text)]"
              >
                <Upload size={14} />
                Replace
              </button>
              <button
                type="button"
                onClick={onClearImage}
                className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--pe-border-strong)] text-[13px] font-medium text-[var(--pe-text-2)] transition-colors hover:bg-[var(--pe-surface-3)] hover:text-[var(--pe-text)]"
              >
                <Trash2 size={14} />
                Remove
              </button>
            </div>
            <p className="text-xs leading-relaxed text-[var(--pe-text-3)]">
              Click on a page to place the image at that spot. The image stays ready so you can
              place it multiple times.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div
              role="button"
              tabIndex={0}
              aria-label="Choose an image to insert"
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                acceptFile(e.dataTransfer.files?.[0]);
              }}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
                dragOver
                  ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)]'
                  : 'border-[var(--pe-border-strong)] bg-[var(--pe-surface-3)] hover:border-[var(--pe-accent)]'
              }`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--pe-accent-soft)] text-[var(--pe-accent)]">
                <ImageIcon size={20} />
              </span>
              <p className="text-[13px] font-medium text-[var(--pe-text)]">
                Drag &amp; drop an image here
              </p>
              <p className="text-xs text-[var(--pe-text-3)]">or</p>
              <span className="flex h-9 items-center rounded-lg bg-[var(--pe-accent)] px-4 text-[13px] font-bold text-[var(--pe-accent-ink)]">
                Browse files
              </span>
              <p className="text-[11px] text-[var(--pe-text-3)]">PNG, JPG, GIF or WebP · up to 15 MB</p>
            </div>
            {error && (
              <p role="alert" className="text-xs leading-relaxed text-[var(--pe-accent)]">
                {error}
              </p>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          aria-label="Choose an image file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            acceptFile(f);
          }}
        />
        <SliderRow
          label="Opacity"
          value={options.mediaOpacity}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => onChange({ mediaOpacity: v })}
          format={pct0}
        />
      </Section>
    </>
  );
}

function SignatureToolOptions({
  options,
  onChange,
  onOpenSignaturePad,
  hasSignature,
}: {
  options: ToolOptions;
  onChange: OptPatch;
  onOpenSignaturePad: () => void;
  hasSignature: boolean;
}) {
  return (
    <>
      <ToolHeader title="Signature tool" hint="Click on a page to place your signature." />
      <Section title="Signature">
        <button
          type="button"
          onClick={onOpenSignaturePad}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[var(--pe-border-strong)] text-sm font-medium text-[var(--pe-text)] hover:bg-[var(--pe-surface-3)]"
        >
          <PenLine size={15} />
          {hasSignature ? 'Update signature' : 'Draw signature'}
        </button>
        <SliderRow
          label="Opacity"
          value={options.mediaOpacity}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => onChange({ mediaOpacity: v })}
          format={pct0}
        />
      </Section>
    </>
  );
}

function StampToolOptions({ options, onChange }: { options: ToolOptions; onChange: OptPatch }) {
  return (
    <>
      <ToolHeader title="Stamp tool" hint="Click on a page to place a stamp." />
      <Section title="Stamp">
        <StampPicker value={options.stampId} onChange={(v) => onChange({ stampId: v })} />
      </Section>
    </>
  );
}

function RedactToolOptions({ options, onChange }: { options: ToolOptions; onChange: OptPatch }) {
  return (
    <>
      <ToolHeader title="Redact tool" hint="Drag over content to cover it." />
      <Section title="Redaction">
        <SegRow
          label="Color"
          value={options.redactColor}
          onChange={(v) => onChange({ redactColor: v })}
          options={[
            { value: 'black', label: 'Black', title: 'Black box' },
            { value: 'white', label: 'White', title: 'White box' },
          ]}
        />
        <TextInputRow
          label="Label"
          value={options.redactLabel}
          placeholder="Optional label"
          onChange={(v) => onChange({ redactLabel: v })}
        />
        <RedactWarning />
      </Section>
    </>
  );
}

function IdleToolOptions({ tool }: { tool: ToolId }) {
  const hint =
    tool === 'pages'
      ? 'Use the pages panel to reorder, rotate, add or delete pages.'
      : 'Pick a tool above, or click a layer on the page to edit its properties.';
  return (
    <>
      <ToolHeader title="Inspector" />
      <Section title="Nothing to edit">
        <p className="text-xs leading-5 text-[var(--pe-text-3)]">{hint}</p>
      </Section>
    </>
  );
}

/* --------------------------------- panel ---------------------------------- */

export function Inspector({
  tool,
  selected,
  onPatchSelected,
  onDeleteSelected,
  onDuplicateSelected,
  options,
  onOptionsChange,
  onOpenSignaturePad,
  hasSignature,
  onBringToFront,
  onSendToBack,
  pendingImage,
  onImageSelected,
  onClearImage,
}: InspectorProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[var(--pe-surface)]">
      {selected ? (
        <>
          <div className="flex items-center justify-between gap-2 border-b border-[var(--pe-border)] px-4 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[var(--pe-text)]">
                {layerTitle(selected)}
              </div>
              <div className="text-xs text-[var(--pe-text-3)]">Page {selected.pageIndex + 1}</div>
            </div>
            <div className="flex shrink-0 gap-1.5">
              {onBringToFront && (
                <button
                  type="button"
                  title="Bring to front"
                  aria-label="Bring to front"
                  onClick={onBringToFront}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--pe-border-strong)] text-[var(--pe-text-2)] hover:bg-[var(--pe-surface-3)]"
                >
                  <ArrowUpToLine size={15} />
                </button>
              )}
              {onSendToBack && (
                <button
                  type="button"
                  title="Send to back"
                  aria-label="Send to back"
                  onClick={onSendToBack}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--pe-border-strong)] text-[var(--pe-text-2)] hover:bg-[var(--pe-surface-3)]"
                >
                  <ArrowDownToLine size={15} />
                </button>
              )}
              <button
                type="button"
                title="Duplicate"
                onClick={onDuplicateSelected}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--pe-border-strong)] text-[var(--pe-text-2)] hover:bg-[var(--pe-surface-3)]"
              >
                <Copy size={15} />
              </button>
              <button
                type="button"
                title="Delete (Delete/Backspace)"
                onClick={onDeleteSelected}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--pe-danger)] text-[var(--pe-danger)] hover:bg-[var(--pe-danger-soft)]"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
          {selected.type === 'text' && (
            <TextSection layer={selected} onPatch={onPatchSelected} />
          )}
          {selected.type === 'stroke' && (
            <StrokeSection layer={selected} onPatch={onPatchSelected} />
          )}
          {selected.type === 'shape' && (
            <ShapeSection layer={selected} onPatch={onPatchSelected} />
          )}
          {(selected.type === 'image' || selected.type === 'signature') && (
            <MediaSection layer={selected} onPatch={onPatchSelected} />
          )}
          {selected.type === 'stamp' && (
            <StampSelectedSection layer={selected} onPatch={onPatchSelected} />
          )}
          {selected.type === 'redact' && (
            <RedactSelectedSection layer={selected} onPatch={onPatchSelected} />
          )}
        </>
      ) : (
        <>
          {tool === 'text' && <TextToolOptions options={options} onChange={onOptionsChange} />}
          {tool === 'draw' && <DrawToolOptions options={options} onChange={onOptionsChange} />}
          {tool === 'highlight' && (
            <HighlightToolOptions options={options} onChange={onOptionsChange} />
          )}
          {tool === 'shape' && <ShapeToolOptions options={options} onChange={onOptionsChange} />}
          {tool === 'image' && (
            <MediaToolOptions
              options={options}
              onChange={onOptionsChange}
              pendingImage={pendingImage}
              onImageSelected={onImageSelected}
              onClearImage={onClearImage}
            />
          )}
          {tool === 'signature' && (
            <SignatureToolOptions
              options={options}
              onChange={onOptionsChange}
              onOpenSignaturePad={onOpenSignaturePad}
              hasSignature={hasSignature}
            />
          )}
          {tool === 'stamp' && <StampToolOptions options={options} onChange={onOptionsChange} />}
          {tool === 'redact' && <RedactToolOptions options={options} onChange={onOptionsChange} />}
          {(tool === 'select' || tool === 'pages') && <IdleToolOptions tool={tool} />}
          {tool === 'edittext' && (
            <>
              <ToolHeader title="Edit text" />
              <Section title="How it works">
                <p className="text-xs leading-5 text-[var(--pe-text-3)]">
                  Click any line of the document&rsquo;s own text to edit it in place. The original
                  wording is covered and your replacement keeps the matched font, size and color.
                  After editing, select the text to fine-tune it here.
                </p>
              </Section>
            </>
          )}
        </>
      )}
    </div>
  );
}
