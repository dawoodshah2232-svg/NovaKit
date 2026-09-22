'use client';

/**
 * PDFEdit Studio — Word/Google-Docs-style top chrome.
 *
 * Row 1: application menu bar (File · Edit · View · Insert · Format) with
 * working dropdown items, document name, and the Export action.
 * Row 2: formatting ribbon (font, size, B/I/U/S, colors, alignment, lists,
 * clear) followed by the PDF tool groups, undo/redo, zoom and panel toggles.
 *
 * Formatting controls are dual-target: when a text layer is selected they
 * patch that layer; otherwise they update the text tool's creation options
 * so the next text box inherits them.
 */
import { useEffect, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Download,
  FilePlus,
  Highlighter,
  Image as ImageIcon,
  Italic,
  LayoutGrid,
  List,
  ListOrdered,
  Loader2,
  MousePointer2,
  PanelRight,
  PenLine,
  PenTool,
  PencilLine,
  Redo2,
  RemoveFormatting,
  Shapes,
  Stamp,
  Strikethrough,
  Type,
  Underline,
  Undo2,
  ZoomIn,
  ZoomOut,
  EyeOff,
  type LucideIcon,
} from 'lucide-react';
import type { TextLayer, ToolId, ZoomState } from './types';
import type { ToolOptions } from './toolOptions';
import { STUDIO_FONTS } from './fonts';

/** Editing tools shown on the mobile bottom bar, in ribbon order. */
export const MOBILE_TOOLS: ToolId[] = [
  'select',
  'text',
  'edittext',
  'draw',
  'highlight',
  'shape',
  'image',
  'signature',
  'stamp',
  'redact',
];

export interface MenuBarProps {
  fileName: string;
  busy: boolean;
  tool: ToolId;
  onTool: (t: ToolId) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoomLabel: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomMode: (mode: ZoomState['mode']) => void;
  pagesOpen: boolean;
  onTogglePages: () => void;
  inspectorOpen: boolean;
  onToggleInspector: () => void;
  onNewFile: () => void;
  onOpenFile: (file: File) => void;
  onExport: () => void;
  onAddBlank: () => void;
  // edit-menu layer clipboard
  canCopy: boolean;
  canPaste: boolean;
  onCopySelected: () => void;
  onPaste: () => void;
  onDuplicateSelected: () => void;
  onDeleteSelected: () => void;
  // formatting (dual-target: selection or creation options)
  selectedText: TextLayer | null;
  options: ToolOptions;
  onPatchSelectedText: (patch: Partial<TextLayer>) => void;
  onOptionsChange: (patch: Partial<ToolOptions>) => void;
  /** displayed page height in PDF points — used for pt ↔ fraction conversion */
  pageHeightPt: number;
}

/* ------------------------------- menus ---------------------------------- */

type MenuItem =
  | { kind: 'divider' }
  | {
      kind: 'item';
      label: string;
      shortcut?: string;
      checked?: boolean;
      disabled?: boolean;
      action: () => void;
    };

function Menu({
  label,
  items,
  open,
  onOpen,
  onClose,
}: {
  label: string;
  items: MenuItem[];
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? onClose() : onOpen())}
        className={`h-8 rounded-md px-2.5 text-[13px] font-medium transition-colors ${
          open
            ? 'bg-[var(--pe-surface-3)] text-[var(--pe-text)]'
            : 'text-[var(--pe-text-2)] hover:bg-[var(--pe-surface-3)] hover:text-[var(--pe-text)]'
        }`}
      >
        {label}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-1 min-w-[220px] rounded-xl border border-[var(--pe-border-strong)] bg-[var(--pe-surface)] py-1.5 shadow-2xl"
        >
          {items.map((it, i) =>
            it.kind === 'divider' ? (
              <div key={i} className="my-1 h-px bg-[var(--pe-border)]" aria-hidden="true" />
            ) : (
              <button
                key={i}
                type="button"
                role="menuitem"
                disabled={it.disabled}
                onClick={() => {
                  it.action();
                  onClose();
                }}
                className="flex w-full items-center justify-between gap-6 px-3.5 py-2 text-left text-[13px] text-[var(--pe-text)] transition-colors hover:bg-[var(--pe-surface-3)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <span className="flex items-center gap-2">
                  {it.checked && <span aria-hidden="true" className="text-[var(--pe-accent)]">✓</span>}
                  {it.label}
                </span>
                {it.shortcut && (
                  <span className="text-[11px] text-[var(--pe-text-3)]">{it.shortcut}</span>
                )}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ ribbon bits ------------------------------ */

const RIBBON_BTN =
  'flex h-8 min-w-[32px] items-center justify-center rounded-md px-1.5 text-[var(--pe-text-2)] transition-colors hover:bg-[var(--pe-surface-3)] hover:text-[var(--pe-text)] disabled:cursor-not-allowed disabled:opacity-30';
const RIBBON_BTN_ACTIVE = 'bg-[var(--pe-accent-soft)] text-[var(--pe-accent)] hover:text-[var(--pe-accent)]';

function RibbonDivider() {
  return <div className="mx-1 h-6 w-px shrink-0 bg-[var(--pe-border)]" aria-hidden="true" />;
}

const FONT_SIZES_PT = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

const PDF_TOOLS: Array<{ id: ToolId; label: string; icon: LucideIcon; tip: string }> = [
  { id: 'select', label: 'Select', icon: MousePointer2, tip: 'Select and move layers (V)' },
  { id: 'edittext', label: 'Edit PDF text', icon: PencilLine, tip: 'Edit the document’s own text in place (E)' },
  { id: 'draw', label: 'Draw', icon: PenTool, tip: 'Draw freehand strokes (D)' },
  { id: 'highlight', label: 'Highlight', icon: Highlighter, tip: 'Mark text with a translucent highlighter (H)' },
  { id: 'shape', label: 'Shapes', icon: Shapes, tip: 'Rectangles, ellipses, lines and arrows (S)' },
  { id: 'image', label: 'Image', icon: ImageIcon, tip: 'Insert an image (I)' },
  { id: 'signature', label: 'Sign', icon: PenLine, tip: 'Place your signature (G)' },
  { id: 'stamp', label: 'Stamp', icon: Stamp, tip: 'Apply a stamp such as APPROVED (M)' },
  { id: 'redact', label: 'Redact', icon: EyeOff, tip: 'Cover content with an opaque box (R)' },
];

/* --------------------------------- bar ----------------------------------- */

export function MenuBar(props: MenuBarProps) {
  const {
    fileName, busy, tool, onTool,
    canUndo, canRedo, onUndo, onRedo,
    zoomLabel, onZoomIn, onZoomOut, onZoomMode,
    pagesOpen, onTogglePages, inspectorOpen, onToggleInspector,
    onNewFile, onOpenFile, onExport, onAddBlank,
    canCopy, canPaste, onCopySelected, onPaste, onDuplicateSelected, onDeleteSelected,
    selectedText, options, onPatchSelectedText, onOptionsChange,
    pageHeightPt,
  } = props;

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);
  const openFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!openMenu && !zoomOpen) return;
    const onDown = (e: PointerEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
        setZoomOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
        setZoomOpen(false);
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [openMenu, zoomOpen]);

  /* ------- formatting state: selection wins, else creation options ------- */
  const fmt = {
    fontId: selectedText?.fontId ?? options.fontId,
    fontSize: selectedText?.fontSize ?? options.fontSize,
    bold: selectedText?.bold ?? options.bold,
    italic: selectedText?.italic ?? options.italic,
    underline: selectedText?.underline ?? options.underline,
    strikethrough: selectedText?.strikethrough ?? options.strikethrough,
    textColor: selectedText?.color ?? options.textColor,
    highlight: selectedText?.highlightColor ?? options.textHighlight,
    align: selectedText?.align ?? options.align,
    list: selectedText?.list ?? options.list,
  };

  const applyFmt = (patch: Partial<TextLayer>) => {
    if (selectedText) {
      onPatchSelectedText(patch);
      return;
    }
    const o: Partial<ToolOptions> = {};
    if (patch.fontId !== undefined) o.fontId = patch.fontId;
    if (patch.fontSize !== undefined) o.fontSize = patch.fontSize;
    if (patch.bold !== undefined) o.bold = patch.bold;
    if (patch.italic !== undefined) o.italic = patch.italic;
    if (patch.underline !== undefined) o.underline = patch.underline;
    if (patch.strikethrough !== undefined) o.strikethrough = patch.strikethrough;
    if (patch.color !== undefined) o.textColor = patch.color;
    if (patch.highlightColor !== undefined) o.textHighlight = patch.highlightColor;
    if (patch.align !== undefined) o.align = patch.align;
    if (patch.list !== undefined) o.list = patch.list;
    onOptionsChange(o);
  };

  const toggle = (k: 'bold' | 'italic' | 'underline' | 'strikethrough') =>
    applyFmt({ [k]: !fmt[k] } as Partial<TextLayer>);
  const setAlign = (a: TextLayer['align']) => applyFmt({ align: a });
  const setList = (l: TextLayer['list']) => applyFmt({ list: fmt.list === l ? 'none' : l });
  const clearFormatting = () =>
    applyFmt({
      bold: false, italic: false, underline: false, strikethrough: false,
      color: '#0f172a', highlightColor: null, align: 'left', list: 'none',
    });

  const pt = Math.max(1, Math.round(fmt.fontSize * pageHeightPt));
  const ptValue = FONT_SIZES_PT.includes(pt) ? String(pt) : '';

  const setPt = (v: string) => {
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) return;
    applyFmt({ fontSize: Math.min(0.25, Math.max(0.004, n / pageHeightPt)) });
  };

  const menuItems = (name: string): MenuItem[] => {
    switch (name) {
      case 'File':
        return [
          { kind: 'item', label: 'New document', action: onNewFile },
          { kind: 'item', label: 'Open PDF…', action: () => openFileRef.current?.click() },
          { kind: 'divider' },
          { kind: 'item', label: 'Export PDF…', action: onExport },
        ];
      case 'Edit':
        return [
          { kind: 'item', label: 'Undo', shortcut: 'Ctrl+Z', disabled: !canUndo, action: onUndo },
          { kind: 'item', label: 'Redo', shortcut: 'Ctrl+Shift+Z', disabled: !canRedo, action: onRedo },
          { kind: 'divider' },
          { kind: 'item', label: 'Copy', shortcut: 'Ctrl+C', disabled: !canCopy, action: onCopySelected },
          { kind: 'item', label: 'Paste', shortcut: 'Ctrl+V', disabled: !canPaste, action: onPaste },
          { kind: 'item', label: 'Duplicate', shortcut: 'Ctrl+D', disabled: !canCopy, action: onDuplicateSelected },
          { kind: 'divider' },
          { kind: 'item', label: 'Delete', shortcut: 'Del', disabled: !canCopy, action: onDeleteSelected },
        ];
      case 'View':
        return [
          { kind: 'item', label: 'Fit width', shortcut: '0', action: () => onZoomMode('fit-width') },
          { kind: 'item', label: 'Fit page', action: () => onZoomMode('fit-page') },
          { kind: 'divider' },
          ...([50, 75, 100, 125, 150, 200] as const).map(
            (z): MenuItem => ({ kind: 'item', label: `${z}%`, action: () => onZoomMode(z) })
          ),
          { kind: 'divider' },
          { kind: 'item', label: 'Pages panel', checked: pagesOpen, action: onTogglePages },
          { kind: 'item', label: 'Inspector panel', checked: inspectorOpen, action: onToggleInspector },
        ];
      case 'Insert':
        return [
          { kind: 'item', label: 'Text box', shortcut: 'T', action: () => onTool('text') },
          { kind: 'item', label: 'Image…', shortcut: 'I', action: () => onTool('image') },
          { kind: 'item', label: 'Signature', shortcut: 'G', action: () => onTool('signature') },
          { kind: 'item', label: 'Stamp', shortcut: 'M', action: () => onTool('stamp') },
          { kind: 'item', label: 'Shape', shortcut: 'S', action: () => onTool('shape') },
          { kind: 'divider' },
          { kind: 'item', label: 'Blank page', action: onAddBlank },
        ];
      case 'Format':
        return [
          { kind: 'item', label: 'Bold', shortcut: 'Ctrl+B', checked: fmt.bold, action: () => toggle('bold') },
          { kind: 'item', label: 'Italic', shortcut: 'Ctrl+I', checked: fmt.italic, action: () => toggle('italic') },
          { kind: 'item', label: 'Underline', shortcut: 'Ctrl+U', checked: fmt.underline, action: () => toggle('underline') },
          { kind: 'item', label: 'Strikethrough', checked: fmt.strikethrough, action: () => toggle('strikethrough') },
          { kind: 'divider' },
          { kind: 'item', label: 'Align left', checked: fmt.align === 'left', action: () => setAlign('left') },
          { kind: 'item', label: 'Align center', checked: fmt.align === 'center', action: () => setAlign('center') },
          { kind: 'item', label: 'Align right', checked: fmt.align === 'right', action: () => setAlign('right') },
          { kind: 'item', label: 'Justify', checked: fmt.align === 'justify', action: () => setAlign('justify') },
          { kind: 'divider' },
          { kind: 'item', label: 'Bulleted list', checked: fmt.list === 'bullet', action: () => setList('bullet') },
          { kind: 'item', label: 'Numbered list', checked: fmt.list === 'numbered', action: () => setList('numbered') },
          { kind: 'divider' },
          { kind: 'item', label: 'Clear formatting', action: clearFormatting },
        ];
      default:
        return [];
    }
  };

  const fmtBtn = (active: boolean) =>
    `${RIBBON_BTN} ${active ? RIBBON_BTN_ACTIVE : ''}`;

  return (
    <div ref={barRef} className="shrink-0 border-b border-[var(--pe-border)] bg-[var(--pe-surface)]">
      {/* row 1 — menu bar */}
      <div className="flex h-11 items-center gap-0.5 overflow-x-auto whitespace-nowrap px-3">
        <span className="mr-1 flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--pe-accent)] text-[var(--pe-accent-ink)]">
          <Type size={15} strokeWidth={2.5} />
        </span>
        {['File', 'Edit', 'View', 'Insert', 'Format'].map((m) => (
          <Menu
            key={m}
            label={m}
            items={menuItems(m)}
            open={openMenu === m}
            onOpen={() => setOpenMenu(m)}
            onClose={() => setOpenMenu(null)}
          />
        ))}
        <span
          title={fileName}
          className="mx-3 hidden max-w-[220px] flex-1 truncate text-[13px] text-[var(--pe-text-3)] sm:block"
        >
          {fileName}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={onNewFile}
            title="Start a new file"
            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-[var(--pe-text-2)] transition-colors hover:bg-[var(--pe-surface-3)] hover:text-[var(--pe-text)]"
          >
            <FilePlus size={15} />
            <span className="hidden lg:inline">New</span>
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={busy}
            title="Export the edited document as PDF"
            className="flex h-8 items-center gap-2 rounded-lg bg-[var(--pe-accent)] px-4 text-[13px] font-bold text-[var(--pe-accent-ink)] transition-colors hover:bg-[var(--pe-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            {busy ? 'Exporting…' : 'Export PDF'}
          </button>
        </div>
        <input
          ref={openFileRef}
          type="file"
          accept="application/pdf,.pdf"
          aria-label="Open a PDF file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (f) onOpenFile(f);
          }}
        />
      </div>

      {/* row 2 — formatting ribbon + PDF tools */}
      <div
        className="flex items-center gap-0.5 overflow-x-auto whitespace-nowrap border-t border-[var(--pe-border)] px-3 py-1.5"
        role="toolbar"
        aria-label="Formatting and tools"
      >
        {/* font family */}
        <select
          value={fmt.fontId}
          onChange={(e) => applyFmt({ fontId: e.target.value })}
          title="Font family"
          aria-label="Font family"
          className="h-8 max-w-[128px] cursor-pointer rounded-md bg-transparent px-1.5 text-[13px] text-[var(--pe-text)] outline-none hover:bg-[var(--pe-surface-3)]"
        >
          {STUDIO_FONTS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
        {/* font size */}
        <select
          value={ptValue}
          onChange={(e) => setPt(e.target.value)}
          title="Font size"
          aria-label="Font size"
          className="h-8 w-[62px] cursor-pointer rounded-md bg-transparent px-1 text-[13px] tabular-nums text-[var(--pe-text)] outline-none hover:bg-[var(--pe-surface-3)]"
        >
          {ptValue === '' && <option value="">{pt}</option>}
          {FONT_SIZES_PT.map((s) => (
            <option key={s} value={String(s)}>
              {s}
            </option>
          ))}
        </select>

        <RibbonDivider />

        {/* B I U S */}
        <button type="button" title="Bold" aria-label="Bold" aria-pressed={fmt.bold} onClick={() => toggle('bold')} className={fmtBtn(fmt.bold)}>
          <Bold size={15} />
        </button>
        <button type="button" title="Italic" aria-label="Italic" aria-pressed={fmt.italic} onClick={() => toggle('italic')} className={fmtBtn(fmt.italic)}>
          <Italic size={15} />
        </button>
        <button type="button" title="Underline" aria-label="Underline" aria-pressed={fmt.underline} onClick={() => toggle('underline')} className={fmtBtn(fmt.underline)}>
          <Underline size={15} />
        </button>
        <button type="button" title="Strikethrough" aria-label="Strikethrough" aria-pressed={fmt.strikethrough} onClick={() => toggle('strikethrough')} className={fmtBtn(fmt.strikethrough)}>
          <Strikethrough size={15} />
        </button>

        <RibbonDivider />

        {/* text color */}
        <label
          title="Text color"
          className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[var(--pe-text-2)] transition-colors hover:bg-[var(--pe-surface-3)]"
        >
          <span
            aria-hidden="true"
            className="flex h-[18px] w-[18px] items-center justify-center rounded border border-[var(--pe-border-strong)] text-[11px] font-extrabold"
            style={{ color: fmt.textColor, borderBottom: `3px solid ${fmt.textColor}` }}
          >
            A
          </span>
          <input
            type="color"
            value={fmt.textColor}
            onChange={(e) => applyFmt({ color: e.target.value })}
            aria-label="Text color"
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
        {/* highlight color */}
        <div className="flex items-center">
          <label
            title="Highlight color"
            className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[var(--pe-text-2)] transition-colors hover:bg-[var(--pe-surface-3)]"
          >
            <Highlighter size={15} style={fmt.highlight ? { color: fmt.highlight } : undefined} />
            {fmt.highlight && (
              <span aria-hidden="true" className="absolute bottom-1 h-1 w-4 rounded-full" style={{ background: fmt.highlight }} />
            )}
            <input
              type="color"
              value={fmt.highlight ?? '#fde047'}
              onChange={(e) => applyFmt({ highlightColor: e.target.value })}
              aria-label="Highlight color"
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
          {fmt.highlight && (
            <button
              type="button"
              title="Remove highlight"
              aria-label="Remove highlight"
              onClick={() => applyFmt({ highlightColor: null })}
              className="flex h-8 w-6 items-center justify-center rounded-md text-[var(--pe-text-3)] hover:bg-[var(--pe-surface-3)] hover:text-[var(--pe-text)]"
            >
              ×
            </button>
          )}
        </div>

        <RibbonDivider />

        {/* alignment */}
        {(
          [
            { a: 'left' as const, icon: AlignLeft, title: 'Align left' },
            { a: 'center' as const, icon: AlignCenter, title: 'Align center' },
            { a: 'right' as const, icon: AlignRight, title: 'Align right' },
            { a: 'justify' as const, icon: AlignJustify, title: 'Justify' },
          ]
        ).map(({ a, icon: Icon, title }) => (
          <button
            key={a}
            type="button"
            title={title}
            aria-label={title}
            aria-pressed={fmt.align === a}
            onClick={() => setAlign(a)}
            className={fmtBtn(fmt.align === a)}
          >
            <Icon size={15} />
          </button>
        ))}

        <RibbonDivider />

        {/* lists */}
        <button type="button" title="Bulleted list" aria-label="Bulleted list" aria-pressed={fmt.list === 'bullet'} onClick={() => setList('bullet')} className={fmtBtn(fmt.list === 'bullet')}>
          <List size={15} />
        </button>
        <button type="button" title="Numbered list" aria-label="Numbered list" aria-pressed={fmt.list === 'numbered'} onClick={() => setList('numbered')} className={fmtBtn(fmt.list === 'numbered')}>
          <ListOrdered size={15} />
        </button>
        <button type="button" title="Clear formatting" aria-label="Clear formatting" onClick={clearFormatting} className={RIBBON_BTN}>
          <RemoveFormatting size={15} />
        </button>

        <RibbonDivider />

        {/* PDF tools */}
        {PDF_TOOLS.map((t) => {
          const Icon = t.icon;
          const active = tool === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTool(t.id)}
              title={t.tip}
              aria-label={t.label}
              aria-pressed={active}
              className={`flex h-8 shrink-0 flex-col items-center justify-center gap-px rounded-md px-2 transition-colors ${
                active
                  ? 'bg-[var(--pe-accent-soft)] text-[var(--pe-accent)]'
                  : 'text-[var(--pe-text-2)] hover:bg-[var(--pe-surface-3)] hover:text-[var(--pe-text)]'
              }`}
            >
              <Icon className="h-[15px] w-[15px]" />
              <span className="text-[9px] font-medium leading-none">{t.label}</span>
            </button>
          );
        })}

        <RibbonDivider />

        {/* undo / redo */}
        <button type="button" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)" aria-label="Undo" className={RIBBON_BTN}>
          <Undo2 size={15} />
        </button>
        <button type="button" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)" aria-label="Redo" className={RIBBON_BTN}>
          <Redo2 size={15} />
        </button>

        <RibbonDivider />

        {/* zoom */}
        <button type="button" onClick={onZoomOut} title="Zoom out (-)" aria-label="Zoom out" className={RIBBON_BTN}>
          <ZoomOut size={15} />
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setZoomOpen((v) => !v)}
            title="Zoom options"
            aria-label="Zoom options"
            aria-expanded={zoomOpen}
            className="flex h-8 min-w-[64px] items-center justify-center rounded-md px-2 text-xs font-semibold text-[var(--pe-text-2)] transition-colors hover:bg-[var(--pe-surface-3)] hover:text-[var(--pe-text)]"
          >
            {zoomLabel}
          </button>
          {zoomOpen && (
            <div className="absolute left-1/2 top-full z-50 mt-1 min-w-[140px] -translate-x-1/2 rounded-xl border border-[var(--pe-border-strong)] bg-[var(--pe-surface)] py-1.5 shadow-2xl" role="menu">
              {(['fit-width', 'fit-page', 50, 75, 100, 125, 150, 200] as const).map((m) => (
                <button
                  key={String(m)}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onZoomMode(m);
                    setZoomOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-[13px] text-[var(--pe-text)] hover:bg-[var(--pe-surface-3)]"
                >
                  {m === 'fit-width' ? 'Fit width' : m === 'fit-page' ? 'Fit page' : `${m}%`}
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="button" onClick={onZoomIn} title="Zoom in (+)" aria-label="Zoom in" className={RIBBON_BTN}>
          <ZoomIn size={15} />
        </button>

        <RibbonDivider />

        {/* panel toggles */}
        <button
          type="button"
          onClick={onTogglePages}
          title="Toggle pages panel (P)"
          aria-label="Toggle pages panel"
          aria-pressed={pagesOpen}
          className={fmtBtn(pagesOpen)}
        >
          <LayoutGrid size={15} />
        </button>
        <button
          type="button"
          onClick={onToggleInspector}
          title="Toggle inspector panel"
          aria-label="Toggle inspector panel"
          aria-pressed={inspectorOpen}
          className={fmtBtn(inspectorOpen)}
        >
          <PanelRight size={15} />
        </button>
      </div>
    </div>
  );
}
