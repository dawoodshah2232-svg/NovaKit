'use client';

import {
  Download,
  EyeOff,
  FilePlus,
  Highlighter,
  Image as ImageIcon,
  LayoutGrid,
  Loader2,
  MousePointer2,
  PenLine,
  PenTool,
  PencilLine,
  Redo2,
  Shapes,
  Stamp,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from 'lucide-react';
import type { ToolId } from './types';

interface ToolbarProps {
  tool: ToolId;
  onTool: (t: ToolId) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoomLabel: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomMenu: () => void;
  onExport: () => void;
  busy: boolean;
  fileName: string;
  onNewFile: () => void;
}

/** Editing tools shown on the mobile bottom bar, in toolbar order. */
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

interface ToolDef {
  id: ToolId;
  label: string;
  icon: LucideIcon;
  tip: string;
}

const TOOLS: ToolDef[] = [
  { id: 'select', label: 'Select', icon: MousePointer2, tip: 'Select and move layers (V)' },
  { id: 'text', label: 'Text', icon: Type, tip: 'Add editable text overlays (T)' },
  { id: 'edittext', label: 'Edit text', icon: PencilLine, tip: 'Edit the PDF’s own text in place (E)' },
  { id: 'draw', label: 'Draw', icon: PenTool, tip: 'Draw freehand strokes (D)' },
  { id: 'highlight', label: 'Highlight', icon: Highlighter, tip: 'Mark text with a translucent highlighter (H)' },
  { id: 'shape', label: 'Shapes', icon: Shapes, tip: 'Insert rectangles, ellipses, lines and arrows (S)' },
  { id: 'image', label: 'Image', icon: ImageIcon, tip: 'Insert an image overlay (I)' },
  { id: 'signature', label: 'Signature', icon: PenLine, tip: 'Place your signature (G)' },
  { id: 'stamp', label: 'Stamp', icon: Stamp, tip: 'Apply a stamp such as APPROVED or DRAFT (M)' },
  { id: 'redact', label: 'Redact', icon: EyeOff, tip: 'Cover content with an opaque box (R)' },
  { id: 'pages', label: 'Pages', icon: LayoutGrid, tip: 'Toggle the pages panel (P)' },
];

const TOOL_BTN_BASE =
  'flex h-9 min-w-[44px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg px-2 transition-colors';
const TOOL_BTN_IDLE = 'text-slate-400 hover:bg-slate-800 hover:text-slate-100';
const TOOL_BTN_ACTIVE = 'bg-red-500/15 text-red-400';

const ICON_BTN =
  'flex h-9 min-w-[36px] shrink-0 items-center justify-center rounded-lg px-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400';

function Divider() {
  return <div className="mx-1 h-6 w-px shrink-0 bg-slate-800" aria-hidden="true" />;
}

export function Toolbar(props: ToolbarProps) {
  const {
    tool,
    onTool,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    zoomLabel,
    onZoomIn,
    onZoomOut,
    onZoomMenu,
    onExport,
    busy,
    fileName,
    onNewFile,
  } = props;

  return (
    <header
      aria-label="Studio toolbar"
      className="flex h-14 shrink-0 items-center gap-1 overflow-x-auto whitespace-nowrap border-b border-slate-800 bg-slate-950 px-2"
    >
      {/* Tools */}
      {TOOLS.map((t) => {
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
            className={`${TOOL_BTN_BASE} ${active ? TOOL_BTN_ACTIVE : TOOL_BTN_IDLE}`}
          >
            <Icon className="h-4 w-4" />
            <span className="text-[10px] font-medium leading-none">{t.label}</span>
          </button>
        );
      })}

      <Divider />

      {/* Undo / Redo */}
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl/Cmd+Z)"
        aria-label="Undo"
        className={ICON_BTN}
      >
        <Undo2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl/Cmd+Shift+Z)"
        aria-label="Redo"
        className={ICON_BTN}
      >
        <Redo2 className="h-4 w-4" />
      </button>

      <Divider />

      {/* Zoom */}
      <button
        type="button"
        onClick={onZoomOut}
        title="Zoom out (-)"
        aria-label="Zoom out"
        className={ICON_BTN}
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onZoomMenu}
        title="Open zoom menu (0 fits width)"
        aria-label="Open zoom menu"
        className="flex h-9 min-w-[64px] shrink-0 items-center justify-center rounded-lg px-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100"
      >
        {zoomLabel}
      </button>
      <button
        type="button"
        onClick={onZoomIn}
        title="Zoom in (+)"
        aria-label="Zoom in"
        className={ICON_BTN}
      >
        <ZoomIn className="h-4 w-4" />
      </button>

      <Divider />

      {/* Export */}
      <button
        type="button"
        onClick={onExport}
        disabled={busy}
        title="Export the edited document as PDF"
        className="flex h-9 shrink-0 items-center gap-2 rounded-lg bg-red-600 px-4 text-xs font-bold tracking-wide text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {busy ? 'EXPORTING…' : 'EXPORT PDF'}
      </button>

      <Divider />

      {/* File */}
      <span
        title={fileName}
        className="max-w-[160px] shrink-0 truncate text-xs text-slate-400"
      >
        {fileName}
      </span>
      <button
        type="button"
        onClick={onNewFile}
        title="Start a new file"
        aria-label="New file"
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100"
      >
        <FilePlus className="h-4 w-4" />
        New
      </button>
    </header>
  );
}
