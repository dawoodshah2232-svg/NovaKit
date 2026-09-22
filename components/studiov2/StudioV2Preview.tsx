'use client';

/**
 * Studio V2 preview — a Word-style document editor built on the shared
 * document engine (components/doc-engine). Preview only: production Studio
 * at /studio is untouched.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FilePlus2,
  FileText,
  FileUp,
  Layers,
  LayoutTemplate,
  Lock,
  Plus,
  Printer,
  Redo2,
  Shapes,
  Trash2,
  Undo2,
  Unlock,
  Wrench,
} from 'lucide-react';
import { useDocHistory } from '@/components/doc-engine/useDocHistory';
import { DocCanvas } from '@/components/doc-engine/DocCanvas';
import { FormatToolbar } from '@/components/doc-engine/FormatToolbar';
import { docToPdfBytes, downloadPdfBytes, exportDocPdf, printPdfBytes } from '@/components/doc-engine/docExport';
import {
  ElementsPanel,
  LayersPanel,
  PagesPanel,
  type ElementKind,
} from '@/components/doc-engine/panels';
import { DocShell, type DocShellTab } from '@/components/doc-engine/DocShell';
import { MenuBar, type FileAction, type EditAction, type InsertAction, type FormatAction } from '@/components/studiov2/MenuBar';
import {
  DocumentSetupDialog,
  PrintDialog,
  SignatureModal,
  StampPicker,
  StartBackButton,
  StartScreen,
  type DocumentSetup,
} from '@/components/studiov2/dialogs';
import {
  A4_PAGE,
  DOC_FONTS,
  blankDoc,
  blankPage,
  block,
  describePageSize,
  docDefaults,
  makeDividerLayer,
  makeImageLayer,
  makeShapeLayer,
  makeStampLayer,
  makeTableLayer,
  makeTextLayer,
  newId,
  pageAspect,
  type DocAlign,
  type DocDividerLayer,
  type DocImageLayer,
  type DocLayer,
  type DocPageSize,
  type DocShapeLayer,
  type DocStampLayer,
  type DocState,
  type DocTableLayer,
  type DocTextLayer,
} from '@/lib/doc-engine/types';
import { STUDIO_TEMPLATES } from '@/lib/doc-engine/studioTemplates';

const AUTOSAVE_KEY = 'pdfedit_studiov2_preview_v1';
const ZOOM_LEVELS = [50, 75, 100, 125, 150];

function loadDraft(): { doc: DocState; title: string } | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { doc: DocState; title: string } | null;
    if (!parsed?.doc || !Array.isArray(parsed.doc.pages) || !Array.isArray(parsed.doc.layers)) return null;
    const doc = parsed.doc as DocState;
    // Migrate drafts saved before per-document page sizes / document settings existed.
    if (
      !doc.page ||
      !Number.isFinite((doc.page as DocPageSize).widthPt) ||
      !Number.isFinite((doc.page as DocPageSize).heightPt)
    ) {
      doc.page = A4_PAGE;
    }
    const defaults = docDefaults();
    if (!doc.margins) doc.margins = defaults.margins;
    if (typeof doc.pageBackground !== 'string') doc.pageBackground = defaults.pageBackground;
    if ((doc as { header?: unknown }).header === undefined) doc.header = defaults.header;
    if ((doc as { footer?: unknown }).footer === undefined) doc.footer = defaults.footer;
    return { doc, title: typeof parsed.title === 'string' ? parsed.title : 'Untitled document' };
  } catch {
    return null;
  }
}

export function StudioV2Preview() {
  const [initial] = useState(loadDraft);
  const hist = useDocHistory(initial?.doc ?? blankDoc());
  const [title, setTitle] = useState(initial?.title ?? 'Untitled document');
  const [zoom, setZoom] = useState(0.75);
  const [selection, setSelection] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(0);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  /** Start screen: false until the user picks "Edit PDF" or "New document". */
  const [started, setStarted] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  /** 'new' = create a blank document; 'page' = change the current doc's page size. */
  const [setupMode, setSetupMode] = useState<'new' | 'page'>('new');
  const [printOpen, setPrintOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [stampOpen, setStampOpen] = useState(false);
  /** Save indicator: true briefly after an explicit Save. */
  const [savedAt, setSavedAt] = useState<number | null>(null);
  /** Layer clipboard for copy/paste (cross-page, re-keyed on paste). */
  const clipboardRef = useRef<DocLayer[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Debounced autosave. */
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ doc: hist.doc, title }));
      } catch {
        /* Storage full (e.g. large imported PDF backgrounds) — skip silently. */
      }
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [hist.doc, title]);

  /** Explicit save: write now and flash the status indicator. */
  const handleSaveNow = useCallback(() => {
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ doc: hist.doc, title }));
      setSavedAt(Date.now());
    } catch {
      window.alert('Could not save — browser storage is full.');
    }
  }, [hist.doc, title]);

  const patchSelected = useCallback(
    (fn: (l: DocLayer) => DocLayer) => {
      hist.update(
        (d) => ({ ...d, layers: d.layers.map((l) => (selection.includes(l.id) ? fn(l) : l)) }),
        true,
      );
    },
    [hist, selection],
  );

  /** Snapshot history once before a transient control (slider / color / number). */
  const snapshot = useCallback(() => hist.update((d) => d, true), [hist]);
  const patchSelectedLive = useCallback(
    (fn: (l: DocLayer) => DocLayer) => {
      hist.update(
        (d) => ({ ...d, layers: d.layers.map((l) => (selection.includes(l.id) ? fn(l) : l)) }),
        false,
      );
    },
    [hist, selection],
  );

  const selected = hist.doc.layers.filter((l) => selection.includes(l.id));
  const primary = selected[0] ?? null;
  const selectedText = selected.filter((l): l is DocTextLayer => l.type === 'text');

  /* ------------------------------ elements ------------------------------ */

  const addLayer = useCallback(
    (layer: DocLayer) => {
      hist.update((d) => ({ ...d, layers: [...d.layers, layer] }), true);
      setSelection([layer.id]);
      setActivePage(layer.pageIndex);
    },
    [hist],
  );

  const handleAddElement = useCallback(
    (kind: ElementKind) => {
      if (kind === 'image') {
        fileRef.current?.click();
        return;
      }
      if (kind === 'signature') {
        setSignOpen(true);
        return;
      }
      if (kind === 'stamp') {
        setStampOpen(true);
        return;
      }
      const n = hist.doc.layers.length;
      const cx = 0.5;
      const cy = Math.min(0.75, 0.28 + (n % 6) * 0.05);
      let layer: DocLayer;
      if (kind === 'table') {
        layer = makeTableLayer({ pageIndex: activePage, x: cx - 0.35, y: cy, w: 0.7 });
      } else if (kind === 'heading') {
        layer = makeTextLayer({
          pageIndex: activePage, x: cx - 0.35, y: cy, w: 0.7, h: 0.09,
          blocks: [block('h1', 'New heading')], fontSize: 0.032,
        });
      } else if (kind === 'paragraph') {
        layer = makeTextLayer({
          pageIndex: activePage, x: cx - 0.35, y: cy, w: 0.7, h: 0.12,
          blocks: [block('paragraph', 'Start writing…')],
        });
      } else if (kind === 'bullets') {
        layer = makeTextLayer({
          pageIndex: activePage, x: cx - 0.35, y: cy, w: 0.7, h: 0.14,
          blocks: [block('bullet', 'First point'), block('bullet', 'Second point')],
        });
      } else if (kind === 'rect' || kind === 'ellipse' || kind === 'line') {
        layer = makeShapeLayer({
          pageIndex: activePage, x: cx - 0.2, y: cy, w: 0.4, h: kind === 'line' ? 0.01 : 0.14,
          kind, fill: kind === 'line' ? null : '#b91c1c', stroke: '#7f1d1d',
        });
      } else {
        layer = makeDividerLayer({ pageIndex: activePage, x: cx - 0.35, y: cy, w: 0.7 });
      }
      addLayer(layer);
    },
    [activePage, addLayer, hist],
  );

  const handleImageFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result);
        const img = new Image();
        img.onload = () => {
          const aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
          const w = 0.4;
          addLayer(
            makeImageLayer({ pageIndex: activePage, dataUrl, x: 0.3, y: 0.3, w, h: (w * pageAspect(hist.doc.page)) / aspect }),
          );
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    },
    [activePage, addLayer, hist],
  );

  /** Insert a drawn signature (data URL) as an image layer. */
  const handleSignatureDone = useCallback(
    (dataUrl: string) => {
      setSignOpen(false);
      const img = new Image();
      img.onload = () => {
        const aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
        const w = 0.32;
        addLayer(
          makeImageLayer({ pageIndex: activePage, dataUrl, imageKind: 'png', x: 0.34, y: 0.7, w, h: w / aspect / pageAspect(hist.doc.page) }),
        );
      };
      img.src = dataUrl;
    },
    [activePage, addLayer, hist],
  );


  /* ------------------------------ PDF import ---------------------------- */

  const handleImportPdf = useCallback(
    async (file: File) => {
      setImporting(true);
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        const buf = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: buf });
        const pdf = await loadingTask.promise;
        const count = Math.min(pdf.numPages, 15);
        const pages = [];
        let pageSize: DocPageSize = A4_PAGE;
        for (let i = 0; i < count; i++) {
          const page = await pdf.getPage(i + 1);
          // Capture the PDF's own page size (points) from the first page so
          // the document matches the imported file's dimensions.
          if (i === 0) {
            const v = page.getViewport({ scale: 1 });
            if (v.width > 36 && v.height > 36) {
              pageSize = { label: 'PDF import', widthPt: v.width, heightPt: v.height };
            }
          }
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas not available');
          await page.render({ canvas, canvasContext: ctx, viewport } as unknown as Parameters<typeof page.render>[0]).promise;
          pages.push({ key: newId('pg'), background: canvas.toDataURL('image/jpeg', 0.82) });
          page.cleanup();
        }
        void loadingTask.destroy().catch(() => undefined);
        hist.reset({ page: pageSize, pages, layers: [], ...docDefaults() });
        setSelection([]);
        setActivePage(0);
        setTitle(file.name.replace(/\.pdf$/i, ''));
        setStarted(true);
      } catch (e) {
        window.alert('Could not import this PDF: ' + (e instanceof Error ? e.message : 'unknown error'));
      } finally {
        setImporting(false);
      }
    },
    [hist],
  );

  /* ------------------------------ templates ----------------------------- */

  const applyTemplate = useCallback(
    (id: string) => {
      const t = STUDIO_TEMPLATES.find((x) => x.id === id);
      if (!t) return;
      const dirty = hist.doc.layers.length > 0 || hist.doc.pages.length > 1;
      if (dirty && !window.confirm(`Replace the current document with the “${t.label}” template? Your current content will be lost.`)) return;
      hist.reset(t.build());
      setSelection([]);
      setActivePage(0);
      setTitle(t.id === 'blank' ? 'Untitled document' : t.label);
    },
    [hist],
  );

  const handleNew = useCallback(() => {
    setSetupMode('new');
    setSetupOpen(true);
  }, []);


  const handleExport = useCallback(async (pageIndices?: number[]) => {
    setExporting(true);
    try {
      await exportDocPdf(hist.doc, title.trim() || 'document', pageIndices);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'PDF export failed.');
    } finally {
      setExporting(false);
    }
  }, [hist, title]);

  const handlePrint = useCallback(
    async (pageIndices?: number[]) => {
      setExporting(true);
      try {
        const bytes = await docToPdfBytes(hist.doc, pageIndices);
        printPdfBytes(bytes, title.trim() || 'document');
      } catch (e) {
        window.alert(e instanceof Error ? e.message : 'Print failed.');
      } finally {
        setExporting(false);
      }
    },
    [hist, title],
  );

  /** Download the PDF and open the print dialog. */
  const handleDownloadAndPrint = useCallback(
    async (pageIndices?: number[]) => {
      setExporting(true);
      try {
        const bytes = await docToPdfBytes(hist.doc, pageIndices);
        downloadPdfBytes(bytes, title.trim() || 'document');
        printPdfBytes(bytes, title.trim() || 'document');
      } catch (e) {
        window.alert(e instanceof Error ? e.message : 'Download + Print failed.');
      } finally {
        setExporting(false);
      }
    },
    [hist, title],
  );

  const handleDeleteSelected = useCallback(() => {
    if (selection.length === 0) return;
    hist.update((d) => ({ ...d, layers: d.layers.filter((l) => !selection.includes(l.id)) }), true);
    setSelection([]);
    setEditingId(null);
  }, [hist, selection]);

  /** Bring forward (dir=1) / send backward (dir=-1) in paint order. */
  const handleReorder = useCallback((dir: 1 | -1) => {
    const id = selection[0];
    if (!id) return;
    hist.update((d) => {
      const layers = d.layers.slice();
      const i = layers.findIndex((l) => l.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= layers.length) return d;
      const tmp = layers[i];
      layers[i] = layers[j];
      layers[j] = tmp;
      return { ...d, layers };
    }, true);
  }, [hist, selection]);

  const addPage = useCallback(() => {
    hist.update((d) => ({ ...d, pages: [...d.pages, blankPage()] }), true);
    const idx = hist.doc.pages.length;
    setActivePage(idx);
    setTimeout(() => document.getElementById(`doc-page-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }, [hist]);

  /* --------------------------- menu actions ---------------------------- */

  /** Copy the current selection to the layer clipboard. */
  const handleCopy = useCallback(() => {
    const sel = hist.doc.layers.filter((l) => selection.includes(l.id));
    if (sel.length > 0) clipboardRef.current = sel;
  }, [hist.doc, selection]);

  /** Paste the clipboard layers on the active page, re-keyed and offset. */
  const handlePaste = useCallback(() => {
    const clip = clipboardRef.current;
    if (clip.length === 0) return;
    const clones = clip.map((l) => ({
      ...l,
      id: newId(l.type),
      pageIndex: activePage,
      x: Math.min(0.9, l.x + 0.03),
      y: Math.min(0.9, l.y + 0.03),
    }));
    hist.update((d) => ({ ...d, layers: [...d.layers, ...clones] }), true);
    setSelection(clones.map((c) => c.id));
  }, [hist, activePage]);

  const handleSelectAll = useCallback(() => {
    setSelection(hist.doc.layers.filter((l) => l.pageIndex === activePage).map((l) => l.id));
  }, [hist.doc, activePage]);

  /** Patch selected text layers (no-op without a text selection). */
  const patchSelectedText = useCallback(
    (fn: (l: DocTextLayer) => DocTextLayer) => {
      if (selectedText.length === 0) return;
      hist.update(
        (d) => ({
          ...d,
          layers: d.layers.map((l) =>
            l.type === 'text' && selection.includes(l.id) ? fn(l) : l,
          ),
        }),
        true,
      );
    },
    [hist, selection, selectedText],
  );

  const handleFileAction = useCallback(
    (a: FileAction) => {
      if (a === 'new') handleNew();
      else if (a === 'open') pdfRef.current?.click();
      else if (a === 'save') handleSaveNow();
      else if (a === 'download') void handleExport();
      else if (a === 'print') setPrintOpen(true);
      else if (a === 'downloadPrint') void handleDownloadAndPrint();
      else if (a === 'setup') {
        setSetupMode('page');
        setSetupOpen(true);
      } else if (a === 'start') setStarted(false);
    },
    [handleNew, handleSaveNow, handleExport, handleDownloadAndPrint],
  );

  const handleEditAction = useCallback(
    (a: EditAction) => {
      if (a === 'undo') hist.undo();
      else if (a === 'redo') hist.redo();
      else if (a === 'copy') handleCopy();
      else if (a === 'paste') handlePaste();
      else if (a === 'selectAll') handleSelectAll();
      else if (a === 'delete') handleDeleteSelected();
    },
    [hist, handleCopy, handlePaste, handleSelectAll, handleDeleteSelected],
  );

  const handleInsertAction = useCallback(
    (a: InsertAction) => {
      if (a === 'text') handleAddElement('paragraph');
      else if (a === 'heading') handleAddElement('heading');
      else if (a === 'bullets') handleAddElement('bullets');
      else if (a === 'image') fileRef.current?.click();
      else if (a === 'table') {
        addLayer(makeTableLayer({ pageIndex: activePage, x: 0.15, y: 0.3, w: 0.7 }));
      } else if (a === 'shape-rect') handleAddElement('rect');
      else if (a === 'shape-ellipse') handleAddElement('ellipse');
      else if (a === 'shape-line') handleAddElement('line');
      else if (a === 'signature') setSignOpen(true);
      else if (a === 'stamp') setStampOpen(true);
      else if (a === 'divider') handleAddElement('divider');
      else if (a === 'pagebreak') addPage();
    },
    [handleAddElement, activePage, addLayer, addPage],
  );

  const handleFormatAction = useCallback(
    (a: FormatAction) => {
      const fontMap = { 'font-sans': 'sans', 'font-serif': 'serif', 'font-mono': 'mono' } as const;
      if (a.startsWith('font-')) {
        const font = fontMap[a as keyof typeof fontMap];
        patchSelectedText((l) => ({ ...l, blocks: l.blocks.map((b) => ({ ...b, font })) }));
      } else if (a === 'size-up' || a === 'size-down') {
        const delta = a === 'size-up' ? 0.002 : -0.002;
        patchSelectedText((l) => ({ ...l, fontSize: Math.max(0.006, Math.min(0.12, l.fontSize + delta)) }));
      } else if (a === 'bold' || a === 'italic' || a === 'underline') {
        patchSelectedText((l) => ({
          ...l,
          blocks: l.blocks.map((b) => ({
            ...b,
            runs: b.runs.map((r) => ({ ...r, [a]: !r[a] })),
          })),
        }));
      } else if (a.startsWith('align-')) {
        const align = a.replace('align-', '') as DocAlign;
        patchSelectedText((l) => ({ ...l, blocks: l.blocks.map((b) => ({ ...b, align })) }));
      } else if (a.startsWith('line-')) {
        const lineHeights: Record<string, number> = { 'line-1': 1, 'line-115': 1.15, 'line-15': 1.5, 'line-2': 2 };
        const lineHeight = lineHeights[a];
        patchSelectedText((l) => ({ ...l, lineHeight }));
      }
    },
    [patchSelectedText],
  );

  /** Apply the document-setup dialog to the current document. */
  const handleSetupApply = useCallback(
    (setup: DocumentSetup) => {
      setSetupOpen(false);
      if (setupMode === 'new') {
        const d = blankDoc(setup.page);
        hist.reset({ ...d, margins: setup.margins, pageBackground: setup.pageBackground, header: setup.header || null, footer: setup.footer || null });
        setTitle('Untitled document');
        setSelection([]);
        setActivePage(0);
        setEditingId(null);
        setStarted(true);
        try {
          localStorage.removeItem(AUTOSAVE_KEY);
        } catch {
          /* ignore */
        }
      } else {
        hist.update(
          (d) => ({
            ...d,
            page: setup.page,
            margins: setup.margins,
            pageBackground: setup.pageBackground,
            header: setup.header || null,
            footer: setup.footer || null,
          }),
          true,
        );
      }
    },
    [hist, setupMode],
  );

  /** Word count across all text layers. */
  const wordCount = hist.doc.layers
    .filter((l): l is DocTextLayer => l.type === 'text')
    .reduce((n, l) => n + l.blocks.reduce((m, b) => m + b.runs.reduce((k, r) => k + r.text.trim().split(/\s+/).filter(Boolean).length, 0), 0), 0);

  /* Keyboard shortcuts (skipped while editing text or typing in a field). */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!started) return;
      if (editingId) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          handleDeleteSelected();
        }
        return;
      }
      const key = e.key.toLowerCase();
      if (key === 's') {
        e.preventDefault();
        handleSaveNow();
      } else if (key === 'p') {
        e.preventDefault();
        setPrintOpen(true);
      } else if (key === 'e') {
        e.preventDefault();
        void handleExport();
      } else if (key === 'a') {
        e.preventDefault();
        handleSelectAll();
      } else if (key === 'c') {
        e.preventDefault();
        handleCopy();
      } else if (key === 'v') {
        e.preventDefault();
        handlePaste();
      } else if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        hist.undo();
      } else if (key === 'y' || (key === 'z' && e.shiftKey)) {
        e.preventDefault();
        hist.redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started, editingId, handleDeleteSelected, handleSaveNow, handleExport, handleSelectAll, handleCopy, handlePaste, hist]);

  const isBlankDoc =
    started &&
    hist.doc.pages.length === 1 &&
    hist.doc.layers.length === 0 &&
    !hist.doc.pages[0].background;

  const currentSetup: DocumentSetup = {
    page: hist.doc.page,
    margins: hist.doc.margins ?? { top: 0.06, right: 0.075, bottom: 0.06, left: 0.075 },
    pageBackground: hist.doc.pageBackground ?? '#ffffff',
    header: hist.doc.header ?? '',
    footer: hist.doc.footer ?? '',
  };

  /* -------------------------------- tabs -------------------------------- */

  const tabs: DocShellTab[] = [
    {
      id: 'pages', label: 'Pages', icon: <FileText size={18} />,
      content: <PagesPanel doc={hist.doc} onDocChange={(d, p) => hist.update(() => d, p)} activePage={activePage} onActivePage={setActivePage} />,
    },
    {
      id: 'templates', label: 'Templates', icon: <LayoutTemplate size={18} />,
      content: (
        <div className="flex flex-col gap-2 p-3">
          {STUDIO_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => applyTemplate(t.id)}
              className="rounded-[var(--pe-radius-sm)] border border-[var(--pe-border)] bg-[var(--pe-surface)] p-3 text-left transition hover:border-[var(--pe-accent)]"
            >
              <div className="text-sm font-semibold text-[var(--pe-text)]">{t.label}</div>
              <div className="mt-0.5 text-xs text-[var(--pe-text-2)]">{t.description}</div>
            </button>
          ))}
        </div>
      ),
    },
    {
      id: 'elements', label: 'Elements', icon: <Shapes size={18} />,
      content: <ElementsPanel onAdd={handleAddElement} />,
    },
    {
      id: 'layers', label: 'Layers', icon: <Layers size={18} />,
      content: (
        <LayersPanel
          doc={hist.doc}
          pageIndex={activePage}
          selection={selection}
          onSelectionChange={setSelection}
          onDocChange={(d, p) => hist.update(() => d, p)}
        />
      ),
    },
    {
      id: 'tools', label: 'Tools', icon: <Wrench size={18} />,
      content: (
        <div className="flex flex-col gap-3 p-3 text-sm text-[var(--pe-text-2)]">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--pe-text-3)]">Page tools</div>
            <div className="flex flex-col gap-2">
              <ToolButton onClick={addPage} icon={<Plus size={15} />} label="Add page" />
              <ToolButton
                onClick={() => {
                  const i = activePage;
                  hist.update((d) => {
                    const pages = d.pages.slice();
                    const copy = { ...pages[i], key: newId('pg') };
                    pages.splice(i + 1, 0, copy);
                    const layers = d.layers.map((l) =>
                      l.pageIndex === i ? l : l.pageIndex > i ? { ...l, pageIndex: l.pageIndex + 1 } : l,
                    );
                    const dup = d.layers.filter((l) => l.pageIndex === i).map((l) => ({ ...l, id: newId(l.type), pageIndex: i + 1 }));
                    return { ...d, pages, layers: [...layers, ...dup] };
                  }, true);
                  setActivePage(i + 1);
                }}
                icon={<Copy size={15} />}
                label="Duplicate this page"
              />
              <ToolButton
                onClick={() => {
                  if (hist.doc.pages.length <= 1) return;
                  if (!window.confirm('Delete this page and its layers?')) return;
                  const i = activePage;
                  hist.update((d) => ({
                    ...d,
                    pages: d.pages.filter((_, k) => k !== i),
                    layers: d.layers
                      .filter((l) => l.pageIndex !== i)
                      .map((l) => (l.pageIndex > i ? { ...l, pageIndex: l.pageIndex - 1 } : l)),
                  }), true);
                  setActivePage(Math.max(0, i - 1));
                }}
                icon={<Trash2 size={15} />}
                label="Delete this page"
                danger
              />
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--pe-text-3)]">PDF import</div>
            <ToolButton
              onClick={() => pdfRef.current?.click()}
              icon={<FileUp size={15} />}
              label={importing ? 'Importing…' : 'Import PDF as background'}
              disabled={importing}
            />
            <p className="mt-2 text-xs leading-relaxed">
              Imported PDF pages are placed as flat page backgrounds in this preview — add text
              or shapes on top to annotate. The original PDF text is not editable here.
            </p>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--pe-text-3)]">More tools</div>
            <Link href="/#tools" className="text-[var(--pe-accent)] underline underline-offset-2 hover:text-[var(--pe-accent-hover)]">
              Open the PDF tools hub
            </Link>
          </div>
        </div>
      ),
    },
  ];

  /* -------------------------------- render ------------------------------- */

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleImageFile(f);
          e.target.value = '';
        }}
      />
      <input
        ref={pdfRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleImportPdf(f);
          e.target.value = '';
        }}
      />
      <DocShell
        rightTitle="Properties"
        topBar={
          <div className="flex h-14 items-center gap-1 border-b border-[var(--pe-border)] bg-[var(--pe-surface)] px-2 sm:px-3">
            <StartBackButton onClick={() => setStarted(false)} />
            <div className="hidden md:block">
              <MenuBar
                onFile={handleFileAction}
                onEdit={handleEditAction}
                onInsert={handleInsertAction}
                onFormat={handleFormatAction}
                canUndo={hist.canUndo}
                canRedo={hist.canRedo}
                hasSelection={selection.length > 0}
              />
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1.5 text-sm font-semibold text-[var(--pe-text)] outline-none hover:border-[var(--pe-border)] focus:border-[var(--pe-accent)]"
              aria-label="Document title"
            />
            <div className="flex shrink-0 items-center gap-1">
              <IconBtn title="Undo" onClick={hist.undo} disabled={!hist.canUndo}><Undo2 size={16} /></IconBtn>
              <IconBtn title="Redo" onClick={hist.redo} disabled={!hist.canRedo}><Redo2 size={16} /></IconBtn>
            </div>
            <select
              value={Math.round(zoom * 100)}
              onChange={(e) => setZoom(Number(e.target.value) / 100)}
              className="hidden shrink-0 rounded-md border border-[var(--pe-border)] bg-[var(--pe-surface)] px-1.5 py-1.5 text-xs text-[var(--pe-text)] md:block"
              aria-label="Zoom"
            >
              {ZOOM_LEVELS.map((z) => (
                <option key={z} value={z}>{z}%</option>
              ))}
            </select>
            <IconBtn title="Add page" onClick={addPage}><FilePlus2 size={16} /></IconBtn>
            <IconBtn title="Print" onClick={() => setPrintOpen(true)}><Printer size={16} /></IconBtn>
            <button
              type="button"
              onClick={() => void handleExport()}
              disabled={exporting}
              className="flex shrink-0 items-center gap-1.5 rounded-md bg-[var(--pe-accent)] px-3 py-1.5 text-sm font-semibold text-[var(--pe-accent-ink)] hover:bg-[var(--pe-accent-hover)] disabled:opacity-60"
            >
              <Download size={15} /> {exporting ? 'Exporting…' : 'Export PDF'}
            </button>
          </div>
        }
        tabs={tabs}
        center={
          <div className="relative flex h-full flex-col">
            {selectedText.length > 0 && (
              <div className="border-b border-[var(--pe-border)] bg-[var(--pe-surface)] px-3 py-1.5">
                <FormatToolbar
                  textLayers={selectedText}
                  onPatchLayers={(fn) => patchSelected((l) => (l.type === 'text' ? fn(l) : l))}
                  editing={editingId !== null}
                  pageHeightPt={hist.doc.page.heightPt}
                />
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-auto">
              <DocCanvas
                doc={hist.doc}
                onDocChange={(d, p) => hist.update(() => d, p)}
                selection={selection}
                onSelectionChange={setSelection}
                zoom={zoom}
                editingId={editingId}
                onEditingChange={setEditingId}
              />
            </div>
            {isBlankDoc && (
              <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-24">
                <button
                  type="button"
                  onClick={() => {
                    const layer = makeTextLayer({
                      pageIndex: activePage,
                      x: 0.1,
                      y: 0.12,
                      w: 0.8,
                      blocks: [block('paragraph', 'Start writing…')],
                    });
                    addLayer(layer);
                    setEditingId(layer.id);
                  }}
                  className="pointer-events-auto rounded-2xl px-6 py-4 text-center transition hover:-translate-y-0.5"
                  style={{
                    background: 'var(--pe-surface)',
                    border: '1px solid var(--pe-border)',
                    boxShadow: 'var(--pe-shadow-md)',
                  }}
                >
                  <div className="text-base font-bold" style={{ color: 'var(--pe-ink)' }}>
                    Start writing
                  </div>
                  <div className="mt-0.5 text-xs" style={{ color: 'var(--pe-ink-soft)' }}>
                    Click anywhere to add text — or use Insert to add tables, images and more
                  </div>
                </button>
              </div>
            )}
            {/* status bar */}
            <div
              className="flex h-8 shrink-0 items-center gap-4 overflow-x-auto border-t border-[var(--pe-border)] bg-[var(--pe-surface)] px-4 text-xs whitespace-nowrap"
              style={{ color: 'var(--pe-ink-soft)' }}
            >
              <span>
                Page {activePage + 1} of {hist.doc.pages.length}
              </span>
              <span>{wordCount} words</span>
              <span className="hidden sm:inline">{describePageSize(hist.doc.page)}</span>
              <span className="hidden sm:inline">{Math.round(zoom * 100)}%</span>
              {savedAt && (
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <Check size={12} /> Saved
                </span>
              )}
              <span className="ml-auto hidden md:inline">PDF Studio · preview</span>
            </div>
          </div>
        }
        right={
          <PropertiesPanel
            doc={hist.doc}
            title={title}
            onTitle={setTitle}
            primary={primary}
            selectionCount={selected.length}
            snapshot={snapshot}
            patchLive={patchSelectedLive}
            patch={patchSelected}
            onDuplicate={() => {
              const clones = selected.map((l) => ({ ...l, id: newId(l.type), x: Math.min(0.9, l.x + 0.02), y: Math.min(0.9, l.y + 0.02) }));
              hist.update((d) => ({ ...d, layers: [...d.layers, ...clones] }), true);
              setSelection(clones.map((c) => c.id));
            }}
            onDelete={handleDeleteSelected}
            onReorder={handleReorder}
          />
        }
      />
      {/* dialogs */}
      {!started && (
        <StartScreen
          hasDraft={!!initial}
          draftTitle={initial?.title}
          onEditPdf={() => pdfRef.current?.click()}
          onCreateNew={() => {
            setSetupMode('new');
            setSetupOpen(true);
          }}
          onContinueDraft={() => setStarted(true)}
        />
      )}
      {setupOpen && (
        <DocumentSetupDialog
          title={setupMode === 'new' ? 'Create new document' : 'Document setup'}
          subtitle={
            setupMode === 'new'
              ? 'Choose the page size, orientation and layout for your document.'
              : 'Page size and orientation apply to every page of this document.'
          }
          initial={setupMode === 'new' ? { page: A4_PAGE, margins: { top: 0.06, right: 0.075, bottom: 0.06, left: 0.075 }, pageBackground: '#ffffff', header: '', footer: '' } : currentSetup}
          onCancel={() => setSetupOpen(false)}
          onConfirm={handleSetupApply}
          confirmLabel={setupMode === 'new' ? 'Create document' : 'Apply'}
        />
      )}
      {printOpen && (
        <PrintDialog
          pageCount={hist.doc.pages.length}
          currentPage={activePage}
          pageLabel={describePageSize(hist.doc.page)}
          onClose={() => setPrintOpen(false)}
          onPrint={(indices) => {
            setPrintOpen(false);
            void handlePrint(indices ?? undefined);
          }}
          onDownloadAndPrint={(indices) => {
            setPrintOpen(false);
            void handleDownloadAndPrint(indices ?? undefined);
          }}
        />
      )}
      {signOpen && (
        <SignatureModal
          onClose={() => setSignOpen(false)}
          onInsert={(dataUrl) => {
            setSignOpen(false);
            handleSignatureDone(dataUrl);
          }}
        />
      )}
      {stampOpen && (
        <StampPicker
          onClose={() => setStampOpen(false)}
          onInsert={(opts) => {
            setStampOpen(false);
            addLayer(makeStampLayer({ pageIndex: activePage, x: 0.35, y: 0.35, ...opts }));
          }}
        />
      )}
    </>
  );
}

/* ------------------------------- pieces -------------------------------- */

function IconBtn({ children, title, onClick, disabled }: {
  children: React.ReactNode; title: string; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className="rounded-md p-2 text-[var(--pe-text-2)] hover:bg-[var(--pe-surface-2)] hover:text-[var(--pe-text)] disabled:opacity-35 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

function ToolButton({ icon, label, onClick, danger, disabled }: {
  icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 rounded-[var(--pe-radius-sm)] border px-3 py-2 text-left text-sm transition disabled:opacity-50 ${
        danger
          ? 'border-[var(--pe-danger)]/30 text-[var(--pe-danger)] hover:bg-[var(--pe-danger-soft)]'
          : 'border-[var(--pe-border)] text-[var(--pe-text)] hover:border-[var(--pe-accent)]'
      }`}
    >
      {icon} {label}
    </button>
  );
}

/* --------------------------- properties panel -------------------------- */

function PropertiesPanel(props: {
  doc: DocState;
  title: string;
  onTitle: (t: string) => void;
  primary: DocLayer | null;
  selectionCount: number;
  snapshot: () => void;
  patchLive: (fn: (l: DocLayer) => DocLayer) => void;
  patch: (fn: (l: DocLayer) => DocLayer) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onReorder: (dir: 1 | -1) => void;
}) {
  const { primary, selectionCount } = props;

  return (
    <div className="flex flex-col gap-4 p-4 text-sm">
      {!primary && (
        <div>
          <SectionLabel>Document</SectionLabel>
          <label className="mb-1 block text-xs text-[var(--pe-text-2)]">Title</label>
          <input
            value={props.title}
            onChange={(e) => props.onTitle(e.target.value)}
            className="w-full rounded-md border border-[var(--pe-border)] bg-[var(--pe-surface)] px-2.5 py-1.5 text-sm text-[var(--pe-text)] outline-none focus:border-[var(--pe-accent)]"
          />
          <p className="mt-3 text-xs leading-relaxed text-[var(--pe-text-2)]">
            {props.doc.pages.length} page{props.doc.pages.length === 1 ? '' : 's'} · {props.doc.layers.length} layers.
            Select a layer on the canvas to edit its properties, or double-click text to edit it in place.
          </p>
        </div>
      )}

      {primary && (
        <>
          <div>
            <SectionLabel>
              {primary.type === 'text' ? 'Text' : primary.type === 'image' ? 'Image' : primary.type === 'shape' ? 'Shape' : primary.type === 'table' ? 'Table' : primary.type === 'stamp' ? 'Stamp' : 'Divider'}
              {selectionCount > 1 && <span className="ml-1 font-normal text-[var(--pe-text-3)]">(+{selectionCount - 1} more)</span>}
            </SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <GeoField label="X %" value={primary.x} onLive={(v) => props.patchLive((l) => ({ ...l, x: v }))} snapshot={props.snapshot} />
              <GeoField label="Y %" value={primary.y} onLive={(v) => props.patchLive((l) => ({ ...l, y: v }))} snapshot={props.snapshot} />
              <GeoField label="W %" value={primary.w} onLive={(v) => props.patchLive((l) => ({ ...l, w: v }))} snapshot={props.snapshot} />
              <GeoField label="H %" value={primary.h} onLive={(v) => props.patchLive((l) => ({ ...l, h: v }))} snapshot={props.snapshot} />
            </div>
          </div>

          {primary.type === 'text' && (
            <TextProps layer={primary} patch={props.patch} patchLive={props.patchLive} snapshot={props.snapshot} />
          )}
          {primary.type === 'image' && (
            <ImageProps layer={primary} patch={props.patch} patchLive={props.patchLive} snapshot={props.snapshot} />
          )}
          {primary.type === 'shape' && (
            <ShapeProps layer={primary} patch={props.patch} patchLive={props.patchLive} snapshot={props.snapshot} />
          )}
          {primary.type === 'divider' && (
            <DividerProps layer={primary} patch={props.patch} patchLive={props.patchLive} snapshot={props.snapshot} />
          )}
          {primary.type === 'table' && (
            <TableProps layer={primary} patch={props.patch} patchLive={props.patchLive} snapshot={props.snapshot} />
          )}
          {primary.type === 'stamp' && (
            <StampProps layer={primary} patch={props.patch} patchLive={props.patchLive} snapshot={props.snapshot} />
          )}

          <div>
            <SectionLabel>Layer</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <MiniBtn onClick={props.onDuplicate} icon={<Copy size={14} />} label="Duplicate" />
              <MiniBtn onClick={props.onDelete} icon={<Trash2 size={14} />} label="Delete" danger />
              <MiniBtn onClick={() => props.onReorder(1)} icon={<ChevronUp size={14} />} label="Forward" />
              <MiniBtn onClick={() => props.onReorder(-1)} icon={<ChevronDown size={14} />} label="Backward" />
              <MiniBtn
                onClick={() => props.patch((l) => ({ ...l, locked: !l.locked }))}
                icon={primary.locked ? <Lock size={14} /> : <Unlock size={14} />}
                label={primary.locked ? 'Unlock' : 'Lock'}
              />
              <MiniBtn
                onClick={() => props.patch((l) => ({ ...l, opacity: l.opacity > 0.05 ? 0 : 1 }))}
                label={primary.opacity > 0.05 ? 'Hide' : 'Show'}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--pe-text-3)]">{children}</div>
  );
}

function GeoField({ label, value, onLive, snapshot }: {
  label: string; value: number; onLive: (v: number) => void; snapshot: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-[var(--pe-text-2)]">{label}</span>
      <input
        type="number"
        min={0}
        max={100}
        step={1}
        value={Math.round(value * 100)}
        onFocus={snapshot}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) onLive(Math.min(1, Math.max(0, v / 100)));
        }}
        className="w-full rounded-md border border-[var(--pe-border)] bg-[var(--pe-surface)] px-2 py-1.5 text-sm text-[var(--pe-text)] outline-none focus:border-[var(--pe-accent)]"
      />
    </label>
  );
}

function Slider({ label, min, max, step, value, onLive, snapshot, format }: {
  label: string; min: number; max: number; step: number; value: number;
  onLive: (v: number) => void; snapshot: () => void; format?: (v: number) => string;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between text-xs text-[var(--pe-text-2)]">
        <span>{label}</span>
        <span className="text-[var(--pe-text)]">{format ? format(value) : value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onPointerDown={snapshot}
        onChange={(e) => onLive(Number(e.target.value))}
        className="w-full accent-[var(--pe-accent)]"
      />
    </label>
  );
}

function ColorField({ label, value, onPick, snapshot }: {
  label: string; value: string; onPick: (v: string) => void; snapshot: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-[var(--pe-text-2)]">{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onFocus={snapshot}
          onChange={(e) => onPick(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded border border-[var(--pe-border)] bg-[var(--pe-surface)]"
        />
        <span className="text-xs text-[var(--pe-text-3)]">{value}</span>
      </span>
    </label>
  );
}

function MiniBtn({ icon, label, onClick, danger }: {
  icon?: React.ReactNode; label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-[var(--pe-radius-sm)] border px-2 py-1.5 text-xs transition ${
        danger
          ? 'border-[var(--pe-danger)]/30 text-[var(--pe-danger)] hover:bg-[var(--pe-danger-soft)]'
          : 'border-[var(--pe-border)] text-[var(--pe-text)] hover:border-[var(--pe-accent)]'
      }`}
    >
      {icon} {label}
    </button>
  );
}

/* ------------------------- per-type properties ------------------------- */

type Patchers = {
  patch: (fn: (l: DocLayer) => DocLayer) => void;
  patchLive: (fn: (l: DocLayer) => DocLayer) => void;
  snapshot: () => void;
};

function asText(l: DocLayer, fn: (t: DocTextLayer) => DocTextLayer): DocLayer {
  return l.type === 'text' ? fn(l) : l;
}

function TextProps({ layer, patch, patchLive, snapshot }: { layer: DocTextLayer } & Patchers) {
  const setAlign = (align: DocAlign) =>
    patch((l) => asText(l, (t) => ({ ...t, blocks: t.blocks.map((b) => ({ ...b, align })) })));
  const aligns: Array<{ id: DocAlign; icon: React.ReactNode; label: string }> = [
    { id: 'left', icon: <AlignLeft size={15} />, label: 'Align left' },
    { id: 'center', icon: <AlignCenter size={15} />, label: 'Align center' },
    { id: 'right', icon: <AlignRight size={15} />, label: 'Align right' },
    { id: 'justify', icon: <AlignJustify size={15} />, label: 'Justify' },
  ];
  return (
    <div className="flex flex-col gap-3">
      <div>
        <SectionLabel>Typography</SectionLabel>
        <div className="flex flex-col gap-3">
          <label className="block">
            <span className="mb-1 block text-xs text-[var(--pe-text-2)]">Font</span>
            <select
              value={layer.fontId}
              onChange={(e) =>
                patch((l) => asText(l, (t) => ({ ...t, fontId: e.target.value as DocTextLayer['fontId'] })))
              }
              className="w-full rounded-md border border-[var(--pe-border)] bg-[var(--pe-surface)] px-2 py-1.5 text-sm text-[var(--pe-text)]"
            >
              {DOC_FONTS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </label>
          <Slider
            label="Size" min={0.008} max={0.06} step={0.001} value={layer.fontSize} snapshot={snapshot}
            format={(v) => `${Math.round(v * 841.89)} pt`}
            onLive={(v) => patchLive((l) => asText(l, (t) => ({ ...t, fontSize: v })))}
          />
          <Slider
            label="Line height" min={1} max={2.4} step={0.05} value={layer.lineHeight} snapshot={snapshot}
            format={(v) => v.toFixed(2)}
            onLive={(v) => patchLive((l) => asText(l, (t) => ({ ...t, lineHeight: v })))}
          />
          <ColorField
            label="Text color" value={layer.color} snapshot={snapshot}
            onPick={(v) => patchLive((l) => asText(l, (t) => ({ ...t, color: v })))}
          />
          <div>
            <span className="mb-1 block text-xs text-[var(--pe-text-2)]">Alignment</span>
            <div className="flex gap-1">
              {aligns.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  title={a.label}
                  aria-label={a.label}
                  onClick={() => setAlign(a.id)}
                  className={`rounded-md border p-2 ${
                    layer.blocks.every((b) => b.align === a.id)
                      ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)] text-[var(--pe-accent)]'
                      : 'border-[var(--pe-border)] text-[var(--pe-text-2)] hover:text-[var(--pe-text)]'
                  }`}
                >
                  {a.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageProps({ layer, patchLive, snapshot }: { layer: DocImageLayer } & Patchers) {
  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Image</SectionLabel>
      <label className="block">
        <span className="mb-1 block text-xs text-[var(--pe-text-2)]">Fit</span>
        <select
          value={layer.fit}
          onChange={(e) =>
            (patchLive as Patchers['patch'])((l) =>
              l.type === 'image' ? { ...l, fit: e.target.value as DocImageLayer['fit'] } : l,
            )
          }
          className="w-full rounded-md border border-[var(--pe-border)] bg-[var(--pe-surface)] px-2 py-1.5 text-sm text-[var(--pe-text)]"
        >
          <option value="cover">Cover (fill box)</option>
          <option value="contain">Contain (fit inside)</option>
        </select>
      </label>
      <Slider
        label="Opacity" min={0} max={1} step={0.05} value={layer.opacity} snapshot={snapshot}
        format={(v) => `${Math.round(v * 100)}%`}
        onLive={(v) => patchLive((l) => (l.type === 'image' ? { ...l, opacity: v } : l))}
      />
      <Slider
        label="Rotation" min={-180} max={180} step={1} value={layer.rotation} snapshot={snapshot}
        format={(v) => `${Math.round(v)}°`}
        onLive={(v) => patchLive((l) => (l.type === 'image' ? { ...l, rotation: v } : l))}
      />
    </div>
  );
}

function ShapeProps({ layer, patch, patchLive, snapshot }: { layer: DocShapeLayer } & Patchers) {
  void patch;
  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Shape</SectionLabel>
      <ColorField
        label="Fill" value={layer.fill ?? '#000000'} snapshot={snapshot}
        onPick={(v) => patchLive((l) => (l.type === 'shape' ? { ...l, fill: v } : l))}
      />
      <ColorField
        label="Border" value={layer.stroke} snapshot={snapshot}
        onPick={(v) => patchLive((l) => (l.type === 'shape' ? { ...l, stroke: v } : l))}
      />
      <Slider
        label="Border width" min={0} max={0.02} step={0.001} value={layer.strokeWidth} snapshot={snapshot}
        format={(v) => `${(v * 595.28).toFixed(1)} pt`}
        onLive={(v) => patchLive((l) => (l.type === 'shape' ? { ...l, strokeWidth: v } : l))}
      />
      <Slider
        label="Opacity" min={0} max={1} step={0.05} value={layer.opacity} snapshot={snapshot}
        format={(v) => `${Math.round(v * 100)}%`}
        onLive={(v) => patchLive((l) => (l.type === 'shape' ? { ...l, opacity: v } : l))}
      />
    </div>
  );
}

function DividerProps({ layer, patch, patchLive, snapshot }: { layer: DocDividerLayer } & Patchers) {
  void patch;
  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Divider</SectionLabel>
      <ColorField
        label="Color" value={layer.color} snapshot={snapshot}
        onPick={(v) => patchLive((l) => (l.type === 'divider' ? { ...l, color: v } : l))}
      />
      <Slider
        label="Thickness" min={0.0005} max={0.01} step={0.0005} value={layer.thickness} snapshot={snapshot}
        format={(v) => `${(v * 595.28).toFixed(1)} pt`}
        onLive={(v) => patchLive((l) => (l.type === 'divider' ? { ...l, thickness: v } : l))}
      />
      <label className="block">
        <span className="mb-1 block text-xs text-[var(--pe-text-2)]">Style</span>
        <select
          value={layer.style}
          onChange={(e) =>
            patchLive((l) =>
              l.type === 'divider' ? { ...l, style: e.target.value as DocDividerLayer['style'] } : l,
            )
          }
          className="w-full rounded-md border border-[var(--pe-border)] bg-[var(--pe-surface)] px-2 py-1.5 text-sm text-[var(--pe-text)]"
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
        </select>
      </label>
    </div>
  );
}

function TableProps({ layer, patch, patchLive, snapshot }: { layer: DocTableLayer } & Patchers) {
  void patch;
  const asTable = (fn: (t: DocTableLayer) => DocTableLayer) =>
    (l: DocLayer): DocLayer => (l.type === 'table' ? fn(l) : l);
  const resize = (rows: number, cols: number) => {
    snapshot();
    patch((l) =>
      asTable((t) => {
        const cells = Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => t.cells[r]?.[c] ?? ''),
        );
        return { ...t, rows, cols, cells, colWidths: Array.from({ length: cols }, () => 1 / cols) };
      })(l),
    );
  };
  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Table</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-xs text-[var(--pe-text-2)]">Rows</span>
          <input
            type="number" min={1} max={12} value={layer.rows}
            onChange={(e) => resize(Math.max(1, Math.min(12, Number(e.target.value) || 1)), layer.cols)}
            className="w-full rounded-md border border-[var(--pe-border)] bg-[var(--pe-surface)] px-2 py-1.5 text-sm text-[var(--pe-text)]"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-[var(--pe-text-2)]">Columns</span>
          <input
            type="number" min={1} max={8} value={layer.cols}
            onChange={(e) => resize(layer.rows, Math.max(1, Math.min(8, Number(e.target.value) || 1)))}
            className="w-full rounded-md border border-[var(--pe-border)] bg-[var(--pe-surface)] px-2 py-1.5 text-sm text-[var(--pe-text)]"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm text-[var(--pe-text)]">
        <input
          type="checkbox" checked={layer.headerRow}
          onChange={(e) => patchLive((l) => asTable((t) => ({ ...t, headerRow: e.target.checked }))(l))}
          className="h-4 w-4 accent-rose-600"
        />
        Header row
      </label>
      {layer.headerRow && (
        <ColorField
          label="Header fill" value={layer.headerFill ?? '#f3f0e9'} snapshot={snapshot}
          onPick={(v) => patchLive((l) => asTable((t) => ({ ...t, headerFill: v }))(l))}
        />
      )}
      <ColorField
        label="Border color" value={layer.borderColor} snapshot={snapshot}
        onPick={(v) => patchLive((l) => asTable((t) => ({ ...t, borderColor: v }))(l))}
      />
      <ColorField
        label="Text color" value={layer.color} snapshot={snapshot}
        onPick={(v) => patchLive((l) => asTable((t) => ({ ...t, color: v }))(l))}
      />
      <p className="text-xs text-[var(--pe-text-3)]">Double-click a cell on the canvas to edit its text.</p>
    </div>
  );
}

function StampProps({ layer, patch, patchLive, snapshot }: { layer: DocStampLayer } & Patchers) {
  void patch;
  const asStamp = (fn: (s: DocStampLayer) => DocStampLayer) =>
    (l: DocLayer): DocLayer => (l.type === 'stamp' ? fn(l) : l);
  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Stamp</SectionLabel>
      <label className="block">
        <span className="mb-1 block text-xs text-[var(--pe-text-2)]">Label</span>
        <input
          value={layer.label}
          onChange={(e) => patchLive((l) => asStamp((s) => ({ ...s, label: e.target.value.toUpperCase().slice(0, 20) }))(l))}
          className="w-full rounded-md border border-[var(--pe-border)] bg-[var(--pe-surface)] px-2 py-1.5 text-sm font-bold uppercase tracking-wide text-[var(--pe-text)]"
        />
      </label>
      <ColorField
        label="Color" value={layer.color} snapshot={snapshot}
        onPick={(v) => patchLive((l) => asStamp((s) => ({ ...s, color: v }))(l))}
      />
      <label className="block">
        <span className="mb-1 block text-xs text-[var(--pe-text-2)]">Shape</span>
        <select
          value={layer.shape}
          onChange={(e) =>
            patchLive((l) => asStamp((s) => ({ ...s, shape: e.target.value as DocStampLayer['shape'] }))(l))
          }
          className="w-full rounded-md border border-[var(--pe-border)] bg-[var(--pe-surface)] px-2 py-1.5 text-sm text-[var(--pe-text)]"
        >
          <option value="rect">Rectangle</option>
          <option value="round">Round</option>
        </select>
      </label>
      <Slider
        label="Rotation" min={-45} max={45} step={1} value={layer.rotation ?? 0} snapshot={snapshot}
        format={(v) => `${v}°`}
        onLive={(v) => patchLive((l) => asStamp((s) => ({ ...s, rotation: v }))(l))}
      />
    </div>
  );
}
