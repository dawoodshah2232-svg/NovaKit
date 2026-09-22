/**
 * Studio V2 menu bar — Word/Google-Docs-style File / Edit / Insert / Format
 * dropdown menus. All actions are callbacks; the parent owns document state.
 */
import { useEffect, useRef, useState } from 'react';

export type FileAction = 'new' | 'open' | 'save' | 'download' | 'print' | 'downloadPrint' | 'setup' | 'start';
export type EditAction = 'undo' | 'redo' | 'copy' | 'paste' | 'selectAll' | 'delete';
export type InsertAction =
  | 'text' | 'heading' | 'bullets' | 'image' | 'table'
  | 'shape-rect' | 'shape-ellipse' | 'shape-line'
  | 'signature' | 'stamp' | 'divider' | 'pagebreak';
export type FormatAction =
  | 'font-sans' | 'font-serif' | 'font-mono'
  | 'size-up' | 'size-down'
  | 'bold' | 'italic' | 'underline'
  | 'align-left' | 'align-center' | 'align-right' | 'align-justify'
  | 'line-1' | 'line-115' | 'line-15' | 'line-2';

interface MenuItem {
  label: string;
  hint?: string;
  action: string;
  disabled?: boolean;
  divider?: boolean;
}

const FILE_MENU: MenuItem[] = [
  { label: 'New document', hint: 'Ctrl+Alt+N', action: 'new' },
  { label: 'Open PDF…', hint: 'Ctrl+O', action: 'open' },
  { label: 'Save', hint: 'Ctrl+S', action: 'save' },
  { label: '', action: '', divider: true },
  { label: 'Document setup…', action: 'setup' },
  { label: '', action: '', divider: true },
  { label: 'Download PDF', hint: 'Ctrl+E', action: 'download' },
  { label: 'Print…', hint: 'Ctrl+P', action: 'print' },
  { label: 'Download + Print', action: 'downloadPrint' },
  { label: '', action: '', divider: true },
  { label: 'Back to start', action: 'start' },
];

const EDIT_MENU: MenuItem[] = [
  { label: 'Undo', hint: 'Ctrl+Z', action: 'undo' },
  { label: 'Redo', hint: 'Ctrl+Y', action: 'redo' },
  { label: '', action: '', divider: true },
  { label: 'Copy', hint: 'Ctrl+C', action: 'copy' },
  { label: 'Paste', hint: 'Ctrl+V', action: 'paste' },
  { label: 'Select all', hint: 'Ctrl+A', action: 'selectAll' },
  { label: '', action: '', divider: true },
  { label: 'Delete selection', hint: 'Del', action: 'delete' },
];

const INSERT_MENU: MenuItem[] = [
  { label: 'Text box', action: 'text' },
  { label: 'Heading', action: 'heading' },
  { label: 'Bullet list', action: 'bullets' },
  { label: '', action: '', divider: true },
  { label: 'Image…', action: 'image' },
  { label: 'Table', action: 'table' },
  { label: 'Rectangle', action: 'shape-rect' },
  { label: 'Ellipse', action: 'shape-ellipse' },
  { label: 'Line', action: 'shape-line' },
  { label: 'Horizontal divider', action: 'divider' },
  { label: '', action: '', divider: true },
  { label: 'Signature…', action: 'signature' },
  { label: 'Stamp…', action: 'stamp' },
  { label: '', action: '', divider: true },
  { label: 'Page break (new page)', action: 'pagebreak' },
];

const FORMAT_MENU: MenuItem[] = [
  { label: 'Font: Sans', action: 'font-sans' },
  { label: 'Font: Serif', action: 'font-serif' },
  { label: 'Font: Mono', action: 'font-mono' },
  { label: '', action: '', divider: true },
  { label: 'Increase font size', hint: 'Ctrl+]', action: 'size-up' },
  { label: 'Decrease font size', hint: 'Ctrl+[', action: 'size-down' },
  { label: '', action: '', divider: true },
  { label: 'Bold', hint: 'Ctrl+B', action: 'bold' },
  { label: 'Italic', hint: 'Ctrl+I', action: 'italic' },
  { label: 'Underline', hint: 'Ctrl+U', action: 'underline' },
  { label: '', action: '', divider: true },
  { label: 'Align left', action: 'align-left' },
  { label: 'Align center', action: 'align-center' },
  { label: 'Align right', action: 'align-right' },
  { label: 'Justify', action: 'align-justify' },
  { label: '', action: '', divider: true },
  { label: 'Line spacing: 1.0', action: 'line-1' },
  { label: 'Line spacing: 1.15', action: 'line-115' },
  { label: 'Line spacing: 1.5', action: 'line-15' },
  { label: 'Line spacing: 2.0', action: 'line-2' },
];

export function MenuBar({
  onFile,
  onEdit,
  onInsert,
  onFormat,
  canUndo,
  canRedo,
  hasSelection,
}: {
  onFile: (a: FileAction) => void;
  onEdit: (a: EditAction) => void;
  onInsert: (a: InsertAction) => void;
  onFormat: (a: FormatAction) => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
}) {
  const [open, setOpen] = useState<'file' | 'edit' | 'insert' | 'format' | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open ]);

  const menus = [
    { id: 'file' as const, label: 'File', items: FILE_MENU, dispatch: (a: string) => onFile(a as FileAction) },
    { id: 'edit' as const, label: 'Edit', items: EDIT_MENU, dispatch: (a: string) => onEdit(a as EditAction) },
    { id: 'insert' as const, label: 'Insert', items: INSERT_MENU, dispatch: (a: string) => onInsert(a as InsertAction) },
    { id: 'format' as const, label: 'Format', items: FORMAT_MENU, dispatch: (a: string) => onFormat(a as FormatAction) },
  ];

  const isDisabled = (menuId: string, item: MenuItem) => {
    if (item.divider) return false;
    if (menuId === 'edit') {
      if (item.action === 'undo') return !canUndo;
      if (item.action === 'redo') return !canRedo;
      if (['copy', 'delete'].includes(item.action)) return !hasSelection;
    }
    return !!item.disabled;
  };

  return (
    <div ref={rootRef} className="relative flex shrink-0 items-center">
      {menus.map((m) => (
        <div key={m.id} className="relative">
          <button
            type="button"
            onClick={() => setOpen(open === m.id ? null : m.id)}
            onMouseEnter={() => {
              if (open && open !== m.id) setOpen(m.id);
            }}
            className="rounded-md px-3 py-1.5 text-sm font-medium transition"
            style={{
              color: open === m.id ? 'var(--pe-ink)' : 'var(--pe-ink-soft)',
              background: open === m.id ? 'var(--pe-surface-2)' : 'transparent',
            }}
          >
            {m.label}
          </button>
          {open === m.id && (
            <div
              className="absolute left-0 top-full z-[80] mt-1 min-w-60 overflow-hidden rounded-xl py-1.5"
              style={{
                background: 'var(--pe-surface)',
                border: '1px solid var(--pe-border)',
                boxShadow: 'var(--pe-shadow-lg)',
              }}
              role="menu"
            >
              {m.items.map((item, i) =>
                item.divider ? (
                  <div key={i} className="mx-2 my-1.5" style={{ borderTop: '1px solid var(--pe-border)' }} />
                ) : (
                  <button
                    key={i}
                    type="button"
                    role="menuitem"
                    disabled={isDisabled(m.id, item)}
                    onClick={() => {
                      setOpen(null);
                      m.dispatch(item.action);
                    }}
                    className="flex w-full items-center justify-between gap-6 px-4 py-2 text-left text-sm transition hover:opacity-100 disabled:opacity-40"
                    style={{ color: 'var(--pe-ink)', background: 'transparent' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--pe-surface-2)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }}
                  >
                    <span>{item.label}</span>
                    {item.hint && (
                      <span className="text-xs" style={{ color: 'var(--pe-ink-soft)' }}>
                        {item.hint}
                      </span>
                    )}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
