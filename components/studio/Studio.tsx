'use client';

/**
 * PDFEdit Studio — main editor shell.
 * Owns document state, history, keyboard shortcuts, page operations,
 * export flow, autosave, upload flow, and the responsive 4-zone layout.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { X, AlertTriangle, CheckCircle2, Loader2, Download } from 'lucide-react';
import { StudioCanvas } from './Canvas';
import { PagesPanel } from './PagesPanel';
import { Toolbar, MOBILE_TOOLS } from './Toolbar';
import { Inspector } from './Inspector';
import { SignaturePad } from './SignaturePad';
import { UploadScreen } from './UploadScreen';
import { ExportDialog } from './ExportDialog';
import { DEFAULT_TOOL_OPTIONS, type ToolOptions } from './toolOptions';
import type { DocState, Layer, ShapeLayer, StudioPage, TextLayer, ToolId, ZoomState } from './types';
import { newId } from './types';
import type { PdfTextLine } from './textEdit';
import { useHistory } from './useHistory';
import { exportStudioPdf } from './exporter';
import { trackToolExecution } from '@/lib/analytics';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

const AUTOSAVE_KEY = 'pdfedit-studio-draft-v1';
const MAX_FILE_MB = 100;

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return mobile;
}

function fingerprintOf(f: File): string {
  return `${f.name}|${f.size}|${f.lastModified}`;
}

export function Studio() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [doc, setDoc] = useState<DocState>({ pages: [], layers: [] });
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedPageKeys, setSelectedPageKeys] = useState<string[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tool, setTool] = useState<ToolId>('select');
  const [options, setOptions] = useState<ToolOptions>(DEFAULT_TOOL_OPTIONS);
  const [zoom, setZoom] = useState<ZoomState>({ mode: 'fit-width' });
  const [zoomMenuOpen, setZoomMenuOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(true);
  const [mobilePagesOpen, setMobilePagesOpen] = useState(false);
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);
  const [sigPadOpen, setSigPadOpen] = useState(false);
  const [pendingSignature, setPendingSignature] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<Layer | null>(null);

  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showRestore, setShowRestore] = useState<null | { pages: StudioPage[]; layers: Layer[] }>(null);

  const [exportDlg, setExportDlg] = useState<{
    open: boolean;
    stage: 'options' | 'working' | 'done' | 'error';
    progress: string;
    result: { fileName: string; sizeBytes: number; pageCount: number } | null;
    error: string;
  }>({ open: false, stage: 'options', progress: '', result: null, error: '' });
  const exportBytesRef = useRef<Uint8Array | null>(null);

  const history = useHistory({ pages: [], layers: [] });
  const isMobile = useIsMobile();
  const thumbsRef = useRef<string[]>([]);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  pdfDocRef.current = pdfDoc;
  const loadingTaskRef = useRef<{ destroy: () => Promise<void> } | null>(null);

  // refs for keyboard handler
  const docRef = useRef(doc);
  const toolRef = useRef(tool);
  const selectedLayerIdRef = useRef(selectedLayerId);
  const activePageIndexRef = useRef(activePageIndex);
  const zoomRef = useRef(zoom);
  useEffect(() => {
    docRef.current = doc;
    toolRef.current = tool;
    selectedLayerIdRef.current = selectedLayerId;
    activePageIndexRef.current = activePageIndex;
    zoomRef.current = zoom;
  });

  const revokeThumbs = useCallback(() => {
    thumbsRef.current.forEach((u) => {
      try {
        URL.revokeObjectURL(u);
      } catch { /* noop */ }
    });
    thumbsRef.current = [];
  }, []);

  // ---------------- doc mutation helpers ----------------
  const applyDoc = useCallback(
    (next: DocState, commitIt: boolean) => {
      setDoc(next);
      if (commitIt) history.commit(next);
    },
    [history]
  );

  const addLayer = useCallback(
    (layer: Layer) => {
      const withPage = { ...layer, pageIndex: activePageIndexRef.current };
      const next: DocState = {
        pages: docRef.current.pages,
        layers: [...docRef.current.layers, withPage],
      };
      applyDoc(next, true);
      setSelectedLayerId(withPage.id);
      setTool('select');
      if (isMobile) setMobileInspectorOpen(true);
    },
    [applyDoc, isMobile]
  );

  const updateLayer = useCallback(
    (id: string, patch: Partial<Layer>, commitIt: boolean) => {
      const d = docRef.current;
      const next: DocState = {
        pages: d.pages,
        layers: d.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l)),
      };
      setDoc(next);
      if (commitIt) history.commit(next);
    },
    [history]
  );

  const commitNow = useCallback(() => {
    history.commit(docRef.current);
  }, [history]);

  const deleteLayer = useCallback(
    (id: string) => {
      const d = docRef.current;
      applyDoc({ pages: d.pages, layers: d.layers.filter((l) => l.id !== id) }, true);
      setSelectedLayerId(null);
    },
    [applyDoc]
  );

  const duplicateLayer = useCallback(
    (id: string) => {
      const d = docRef.current;
      const src = d.layers.find((l) => l.id === id);
      if (!src) return;
      const copy = { ...JSON.parse(JSON.stringify(src)), id: newId('copy'), x: Math.min(0.9, src.x + 0.03), y: Math.min(0.9, src.y + 0.03) } as Layer;
      const idx = d.layers.findIndex((l) => l.id === id);
      const layers = [...d.layers];
      layers.splice(idx + 1, 0, copy);
      applyDoc({ pages: d.pages, layers }, true);
      setSelectedLayerId(copy.id);
    },
    [applyDoc]
  );

  const doUndo = useCallback(() => {
    const prev = history.undo();
    if (prev) {
      setDoc(prev);
      setSelectedLayerId(null);
      setActivePageIndex((i) => Math.min(i, Math.max(0, prev.pages.length - 1)));
    }
  }, [history]);

  const doRedo = useCallback(() => {
    const next = history.redo();
    if (next) {
      setDoc(next);
      setSelectedLayerId(null);
      setActivePageIndex((i) => Math.min(i, Math.max(0, next.pages.length - 1)));
    }
  }, [history]);

  // ---------------- thumbnails ----------------
  const renderThumb = useCallback(async (pdf: PDFDocumentProxy, pageNum: number, rotation: number, nativeRotate: number): Promise<string> => {
    const pdfPage = await pdf.getPage(pageNum);
    const viewport = pdfPage.getViewport({ scale: 0.4, rotation: ((nativeRotate + rotation) % 360 + 360) % 360 });
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(viewport.width));
    canvas.height = Math.max(1, Math.round(viewport.height));
    const ctx = canvas.getContext('2d');
    if (ctx) {
      await pdfPage.render({ canvas, canvasContext: ctx, viewport } as unknown as Parameters<typeof pdfPage.render>[0]).promise;
    }
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', 0.75));
    const url = blob ? URL.createObjectURL(blob) : '';
    if (url) thumbsRef.current.push(url);
    return url;
  }, []);

  const blankThumb = useCallback((): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 170;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 120, 170);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Blank', 60, 88);
    }
    const url = canvas.toDataURL('image/png');
    return url;
  }, []);

  // ---------------- file loading ----------------
  const loadFile = useCallback(
    async (f: File) => {
      setErrorMsg('');
      if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
        setErrorMsg('Please choose a valid PDF file.');
        return;
      }
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        setErrorMsg(`This file is over ${MAX_FILE_MB}MB — your browser may run out of memory. Try a smaller file.`);
        return;
      }
      setBusy(true);
      setStatusMsg('Opening document…');
      try {
        const buf = await f.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let pdf: PDFDocumentProxy;
        try {
          const loadingTask = pdfjsLib.getDocument({ data: bytes.slice() });
          loadingTaskRef.current = loadingTask;
          pdf = await loadingTask.promise;
        } catch (e) {
          const msg = e instanceof Error ? e.message : '';
          if (/password/i.test(msg)) throw new Error('This PDF is password-protected. Remove the password first (try the Unlock PDF tool), then open it in Studio.');
          throw new Error('Could not read this PDF. It may be damaged or in an unsupported format.');
        }

        revokeThumbs();
        const pages: StudioPage[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          setStatusMsg(`Preparing page ${i} of ${pdf.numPages}…`);
          const pg = await pdf.getPage(i);
          const nr = pg.rotate || 0;
          const w = pg.view[2] - pg.view[0];
          const h = pg.view[3] - pg.view[1];
          const thumbUrl = await renderThumb(pdf, i, 0, nr);
          pages.push({
            key: newId('pg'),
            originalIndex: i - 1,
            rotation: 0,
            nativeRotate: nr,
            nativeWidth: w,
            nativeHeight: h,
            thumbUrl,
            isBlank: false,
          });
        }

        setFile(f);
        setPdfBytes(bytes);
        setPdfDoc(pdf);
        const initial = { pages, layers: [] };
        setDoc(initial);
        history.reset(initial);
        setActivePageIndex(0);
        setSelectedPageKeys([]);
        setSelectedLayerId(null);
        setTool('select');
        setZoom({ mode: 'fit-width' });

        // autosave restore offer
        try {
          const raw = localStorage.getItem(AUTOSAVE_KEY);
          if (raw) {
            const draft = JSON.parse(raw) as { fp: string; pages: StudioPage[]; layers: Layer[] };
            if (draft.fp === fingerprintOf(f) && draft.layers.length > 0) {
              setShowRestore({ pages: draft.pages, layers: draft.layers });
            }
          }
        } catch { /* ignore */ }

        trackToolExecution('pdf-studio', true);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Could not open this PDF.');
        trackToolExecution('pdf-studio', false);
      } finally {
        setBusy(false);
        setStatusMsg('');
      }
    },
    [history, renderThumb, revokeThumbs]
  );

  const loadSample = useCallback(async () => {
    setBusy(true);
    setStatusMsg('Creating sample document…');
    try {
      const d = await PDFDocument.create();
      const bold = await d.embedFont(StandardFonts.HelveticaBold);
      const reg = await d.embedFont(StandardFonts.Helvetica);
      const titles: Array<[string, [number, number, number]]> = [
        ['Sales Agreement — Draft', [0.1, 0.35, 0.75]],
        ['Project Timeline — Q3', [0.05, 0.55, 0.4]],
        ['Sign-off Sheet', [0.45, 0.2, 0.7]],
      ];
      titles.forEach(([title, c], i) => {
        const p = d.addPage([595.28, 841.89]);
        p.drawRectangle({ x: 0, y: 779, width: 595.28, height: 62.89, color: rgb(c[0], c[1], c[2]) });
        p.drawText(title, { x: 40, y: 800, size: 20, font: bold, color: rgb(1, 1, 1) });
        p.drawText(`Page ${i + 1} of ${titles.length} — try the Text, Signature, Stamp and Redact tools.`, {
          x: 40, y: 740, size: 12, font: reg, color: rgb(0.3, 0.3, 0.3),
        });
        p.drawText('Confidential reference: ACCT-4829-1928 (try redacting this line).', {
          x: 40, y: 700, size: 11, font: reg, color: rgb(0.6, 0.15, 0.15),
        });
      });
      const bytes = await d.save();
      const sample = new File([bytes.buffer as ArrayBuffer], 'PDFEdit-Studio-Sample.pdf', { type: 'application/pdf' });
      await loadFile(sample);
    } catch {
      setErrorMsg('Could not create the sample document.');
      setBusy(false);
    }
  }, [loadFile]);

  const destroyPdf = useCallback(() => {
    try {
      const t = loadingTaskRef.current;
      loadingTaskRef.current = null;
      if (t) void t.destroy().catch(() => undefined);
    } catch { /* noop */ }
  }, []);

  const closeDocument = useCallback(() => {
    revokeThumbs();
    destroyPdf();
    setFile(null);
    setPdfBytes(null);
    setPdfDoc(null);
    setDoc({ pages: [], layers: [] });
    history.reset({ pages: [], layers: [] });
    setActivePageIndex(0);
    setSelectedLayerId(null);
    setPendingSignature(null);
    setShowRestore(null);
    setErrorMsg('');
  }, [history, revokeThumbs, destroyPdf]);

  useEffect(() => {
    return () => {
      revokeThumbs();
      try {
        const t = loadingTaskRef.current;
        loadingTaskRef.current = null;
        if (t) void t.destroy().catch(() => undefined);
      } catch { /* noop */ }
    };
  }, [revokeThumbs]);

  // ---------------- autosave ----------------
  useEffect(() => {
    if (!file || !pdfBytes || doc.pages.length === 0) return;
    const t = setTimeout(() => {
      try {
        const slimPages = doc.pages.map((p) => ({ ...p, thumbUrl: '' }));
        const payload = JSON.stringify({ fp: fingerprintOf(file), pages: slimPages, layers: doc.layers, ts: Date.now() });
        if (payload.length < 4_500_000) localStorage.setItem(AUTOSAVE_KEY, payload);
      } catch { /* quota — skip silently */ }
    }, 1500);
    return () => clearTimeout(t);
  }, [doc, file, pdfBytes]);

  const restoreDraft = useCallback(async () => {
    if (!showRestore || !pdfDocRef.current) return;
    const pdf = pdfDocRef.current;
    // regenerate thumbnails for restored pages
    const pages: StudioPage[] = [];
    for (const p of showRestore.pages) {
      let thumbUrl = p.thumbUrl;
      if (!thumbUrl) {
        thumbUrl = p.isBlank ? blankThumb() : await renderThumb(pdf, p.originalIndex + 1, p.rotation, p.nativeRotate);
      }
      pages.push({ ...p, thumbUrl });
    }
    const next = { pages, layers: showRestore.layers };
    setDoc(next);
    history.reset(next);
    setShowRestore(null);
    setStatusMsg('Draft restored.');
    setTimeout(() => setStatusMsg(''), 2500);
  }, [showRestore, history, blankThumb, renderThumb]);

  // ---------------- page operations ----------------
  const remapLayers = (layers: Layer[], oldToNew: Map<number, number>, drop: Set<number>): Layer[] =>
    layers
      .filter((l) => !drop.has(l.pageIndex))
      .map((l) => ({ ...l, pageIndex: oldToNew.get(l.pageIndex) ?? l.pageIndex }));

  const selectPage = useCallback(
    (index: number, additive: boolean) => {
      setActivePageIndex(index);
      const key = docRef.current.pages[index]?.key;
      if (!key) return;
      setSelectedPageKeys((prev) => {
        if (!additive) return [key];
        return prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      });
    },
    []
  );

  const reorderPages = useCallback(
    (from: number, to: number) => {
      const d = docRef.current;
      if (from === to || from < 0 || to < 0 || from >= d.pages.length || to >= d.pages.length) return;
      const nextPages = [...d.pages];
      const [moved] = nextPages.splice(from, 1);
      nextPages.splice(to, 0, moved);
      const oldToNew = new Map<number, number>();
      nextPages.forEach((p, newIdx) => {
        const oldIdx = d.pages.findIndex((q) => q.key === p.key);
        oldToNew.set(oldIdx, newIdx);
      });
      const next: DocState = { pages: nextPages, layers: remapLayers(d.layers, oldToNew, new Set()) };
      applyDoc(next, true);
      setActivePageIndex(to);
    },
    [applyDoc]
  );

  const selectedPageIndexes = useCallback(() => {
    const d = docRef.current;
    const idx = d.pages.map((p, i) => (selectedPageKeys.includes(p.key) ? i : -1)).filter((i) => i >= 0);
    return idx.length > 0 ? idx : [activePageIndexRef.current];
  }, [selectedPageKeys]);

  const deleteSelectedPages = useCallback(() => {
    const d = docRef.current;
    const idx = selectedPageIndexes();
    if (d.pages.length - idx.length < 1) {
      setErrorMsg('A document needs at least one page.');
      return;
    }
    const drop = new Set(idx);
    const nextPages = d.pages.filter((_, i) => !drop.has(i));
    const oldToNew = new Map<number, number>();
    nextPages.forEach((p, newIdx) => {
      const oldIdx = d.pages.findIndex((q) => q.key === p.key);
      oldToNew.set(oldIdx, newIdx);
    });
    applyDoc({ pages: nextPages, layers: remapLayers(d.layers, oldToNew, drop) }, true);
    setActivePageIndex(0);
    setSelectedPageKeys([]);
  }, [applyDoc, selectedPageIndexes]);

  const duplicateSelectedPages = useCallback(() => {
    const d = docRef.current;
    const idx = [...selectedPageIndexes()].sort((a, b) => a - b);
    const nextPages = [...d.pages];
    // insert from last to first to keep source indexes stable
    for (let k = idx.length - 1; k >= 0; k--) {
      const i = idx[k];
      const src = d.pages[i];
      nextPages.splice(i + 1, 0, { ...src, key: newId('pg') });
    }
    // remap original layers old->new page index
    const oldIdxToNewIdx = new Map<number, number>();
    nextPages.forEach((p, ni) => {
      const oi = d.pages.findIndex((q) => q.key === p.key);
      if (oi >= 0) oldIdxToNewIdx.set(oi, ni);
    });
    const rebuilt: Layer[] = [];
    d.layers.forEach((l) => {
      const ni = oldIdxToNewIdx.get(l.pageIndex);
      if (ni !== undefined) rebuilt.push({ ...l, pageIndex: ni });
    });
    // clone layers onto each duplicated page (copies sit right after their source)
    const origNewIdx = idx.map((oi) => oldIdxToNewIdx.get(oi) ?? oi);
    origNewIdx.forEach((srcNewIdx, k) => {
      const srcOldIdx = idx[k];
      const copyNewIdx = srcNewIdx + 1;
      d.layers
        .filter((l) => l.pageIndex === srcOldIdx)
        .forEach((l) => {
          rebuilt.push({ ...JSON.parse(JSON.stringify(l)), id: newId('copy'), pageIndex: copyNewIdx } as Layer);
        });
    });
    applyDoc({ pages: nextPages, layers: rebuilt }, true);
  }, [applyDoc, selectedPageIndexes]);

  const rotatePages = useCallback(
    async (indexes: number[], deg: number) => {
      const d = docRef.current;
      const nextPages = d.pages.map((p, i) =>
        idxIncludes(indexes, i) ? { ...p, rotation: (p.rotation + deg) % 360 } : p
      );
      // Update UI immediately; commit once at the end (with fresh thumbnails)
      // so undo/redo treats the rotation as a single step.
      setDoc({ pages: nextPages, layers: d.layers });
      const pdf = pdfDocRef.current;
      let finalPages = nextPages;
      if (pdf) {
        for (const i of indexes) {
          const p = finalPages[i];
          if (p.isBlank) continue;
          try {
            const url = await renderThumb(pdf, p.originalIndex + 1, p.rotation, p.nativeRotate);
            finalPages = finalPages.map((q, qi) => (qi === i ? { ...q, thumbUrl: url } : q));
            const snapshot = finalPages;
            setDoc((cur) => ({ pages: snapshot, layers: cur.layers }));
          } catch { /* keep old thumb */ }
        }
      }
      history.commit({ pages: finalPages, layers: docRef.current.layers });
    },
    [history, renderThumb]
  );

  const rotateSelected = useCallback((deg: 90 | 180 | 270) => rotatePages(selectedPageIndexes(), deg), [rotatePages, selectedPageIndexes]);
  const rotateAll = useCallback(() => rotatePages(docRef.current.pages.map((_, i) => i), 90), [rotatePages]);

  const addBlankPage = useCallback(() => {
    const d = docRef.current;
    const blank: StudioPage = {
      key: newId('pg'),
      originalIndex: -1,
      rotation: 0,
      nativeRotate: 0,
      nativeWidth: 595.28,
      nativeHeight: 841.89,
      thumbUrl: blankThumb(),
      isBlank: true,
    };
    const at = activePageIndexRef.current + 1;
    const nextPages = [...d.pages];
    nextPages.splice(at, 0, blank);
    const oldToNew = new Map<number, number>();
    nextPages.forEach((p, ni) => {
      const oi = d.pages.findIndex((q) => q.key === p.key);
      if (oi >= 0) oldToNew.set(oi, ni);
    });
    applyDoc({ pages: nextPages, layers: remapLayers(d.layers, oldToNew, new Set()) }, true);
    setActivePageIndex(at);
  }, [applyDoc, blankThumb]);

  const extractSelected = useCallback(async () => {
    const d = docRef.current;
    if (!pdfBytes || !file) return;
    const idx = [...selectedPageIndexes()].sort((a, b) => a - b);
    setBusy(true);
    setStatusMsg('Extracting pages…');
    try {
      const subPages = idx.map((i) => d.pages[i]);
      const oldToNew = new Map<number, number>();
      idx.forEach((oldI, newI) => oldToNew.set(oldI, newI));
      const subLayers = remapLayers(d.layers, oldToNew, new Set(d.pages.map((_, i) => i).filter((i) => !idx.includes(i))));
      const res = await exportStudioPdf({
        srcBytes: pdfBytes,
        pages: subPages,
        layers: subLayers,
        fileName: file.name.replace(/\.pdf$/i, '') + '-extracted',
        flatten: false,
      });
      saveAs(new Blob([res.bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), res.fileName);
      trackToolExecution('pdf-studio', true);
    } catch (err) {
      setErrorMsg('Could not extract pages: ' + (err instanceof Error ? err.message : 'unknown error'));
      trackToolExecution('pdf-studio', false);
    } finally {
      setBusy(false);
      setStatusMsg('');
    }
  }, [pdfBytes, file, selectedPageIndexes]);

  // ---------------- export ----------------
  const openExport = useCallback(() => {
    setExportDlg({ open: true, stage: 'options', progress: '', result: null, error: '' });
  }, []);

  const doExport = useCallback(
    async (flatten: boolean) => {
      if (!pdfBytes || !file) return;
      setExportDlg((s) => ({ ...s, stage: 'working', progress: 'Starting export…', error: '' }));
      try {
        const d = docRef.current;
        const res = await exportStudioPdf({
          srcBytes: pdfBytes,
          pages: d.pages,
          layers: d.layers,
          fileName: file.name,
          flatten,
          onProgress: (msg) => setExportDlg((s) => ({ ...s, progress: msg })),
        });
        exportBytesRef.current = res.bytes;
        setExportDlg({
          open: true,
          stage: 'done',
          progress: '',
          result: { fileName: res.fileName, sizeBytes: res.bytes.byteLength, pageCount: res.pageCount },
          error: '',
        });
        try {
          localStorage.removeItem(AUTOSAVE_KEY);
        } catch { /* noop */ }
      } catch (err) {
        setExportDlg((s) => ({
          ...s,
          stage: 'error',
          error: 'Export failed: ' + (err instanceof Error ? err.message : 'unknown error'),
        }));
        trackToolExecution('pdf-studio', false);
      }
    },
    [pdfBytes, file]
  );

  const downloadExport = useCallback(() => {
    const bytes = exportBytesRef.current;
    const name = exportDlg.result?.fileName ?? 'PDFEdit-Studio.pdf';
    if (!bytes) return;
    saveAs(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), name);
    trackToolExecution('pdf-studio', true);
  }, [exportDlg.result]);

  // ---------------- zoom ----------------
  const zoomLabel = zoom.mode === 'fit-width' ? 'Fit width' : zoom.mode === 'fit-page' ? 'Fit page' : `${zoom.mode}%`;
  const zoomBy = useCallback((delta: number) => {
    const cur = zoomRef.current.mode;
    const curPct = cur === 'fit-width' || cur === 'fit-page' ? 100 : cur;
    const next = Math.min(400, Math.max(25, curPct + delta));
    setZoom({ mode: Math.round(next) });
  }, []);
  const setZoomMode = useCallback((mode: ZoomState['mode']) => {
    setZoom({ mode });
    setZoomMenuOpen(false);
  }, []);

  // ctrl/cmd + wheel zoom on canvas container
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = canvasWrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      zoomBy(e.deltaY < 0 ? 15 : -15);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomBy, pdfBytes]);

  // ---------------- keyboard ----------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inField = /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable;
      if (editingId) {
        if (e.key === 'Escape') setEditingId(null);
        return;
      }
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        doUndo();
        return;
      }
      if ((mod && e.key.toLowerCase() === 'y') || (mod && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        doRedo();
        return;
      }
      if (mod && e.key.toLowerCase() === 'c' && !inField) {
        const l = docRef.current.layers.find((x) => x.id === selectedLayerIdRef.current);
        if (l) {
          setClipboard(JSON.parse(JSON.stringify(l)) as Layer);
        }
        return;
      }
      if (mod && e.key.toLowerCase() === 'v' && !inField) {
        if (clipboard) {
          const copy = { ...JSON.parse(JSON.stringify(clipboard)), id: newId('paste'), x: Math.min(0.9, clipboard.x + 0.03), y: Math.min(0.9, clipboard.y + 0.03) } as Layer;
          addLayer(copy);
        }
        return;
      }
      if (inField) return;

      switch (e.key) {
        case 'Delete':
        case 'Backspace': {
          const id = selectedLayerIdRef.current;
          if (id) {
            e.preventDefault();
            deleteLayer(id);
          }
          return;
        }
        case 'Escape':
          setSelectedLayerId(null);
          setZoomMenuOpen(false);
          return;
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowUp':
        case 'ArrowDown': {
          const id = selectedLayerIdRef.current;
          if (!id) return;
          e.preventDefault();
          const step = e.shiftKey ? 0.02 : 0.003;
          const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
          const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
          const l = docRef.current.layers.find((x) => x.id === id);
          if (l) updateLayer(id, { x: l.x + dx, y: l.y + dy }, true);
          return;
        }
        case '+':
        case '=':
          zoomBy(15);
          return;
        case '-':
        case '_':
          zoomBy(-15);
          return;
        case '0':
          setZoomMode('fit-width');
          return;
      }

      if (mod || e.altKey) return;
      const k = e.key.toLowerCase();
      const toolFor: Record<string, ToolId> = {
        v: 'select', t: 'text', e: 'edittext', d: 'draw', h: 'highlight', s: 'shape',
        i: 'image', g: 'signature', m: 'stamp', r: 'redact', p: 'pages',
      };
      const t = toolFor[k];
      if (t) {
        if (t === 'pages') {
          if (isMobile) setMobilePagesOpen((v) => !v);
          else setPagesOpen((v) => !v);
        } else {
          setTool(t);
          setSelectedLayerId(null);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editingId, clipboard, doUndo, doRedo, deleteLayer, updateLayer, addLayer, zoomBy, setZoomMode, isMobile]);

  // ---------------- selection helpers for inspector ----------------
  const selectedLayer = doc.layers.find((l) => l.id === selectedLayerId) ?? null;
  const patchSelected = useCallback(
    (patch: Partial<Layer>) => {
      if (selectedLayerIdRef.current) updateLayer(selectedLayerIdRef.current, patch, true);
    },
    [updateLayer]
  );
  const patchOptions = useCallback((patch: Partial<ToolOptions>) => {
    setOptions((o) => ({ ...o, ...patch }));
  }, []);

  const bringToFront = useCallback(
    (id: string) => {
      const d = docRef.current;
      const layers = [...d.layers];
      const i = layers.findIndex((l) => l.id === id);
      if (i < 0) return;
      const [l] = layers.splice(i, 1);
      layers.push(l);
      applyDoc({ pages: d.pages, layers }, true);
    },
    [applyDoc]
  );
  const sendToBack = useCallback(
    (id: string) => {
      const d = docRef.current;
      const layers = [...d.layers];
      const i = layers.findIndex((l) => l.id === id);
      if (i < 0) return;
      const [l] = layers.splice(i, 1);
      layers.unshift(l);
      applyDoc({ pages: d.pages, layers }, true);
    },
    [applyDoc]
  );

  const handleToolSelect = useCallback(
    (t: ToolId) => {
      if (t === 'pages') {
        if (isMobile) setMobilePagesOpen((v) => !v);
        else setPagesOpen((v) => !v);
        return;
      }
      setTool(t);
      setSelectedLayerId(null);
      setEditingId(null);
      if (isMobile && t !== 'select') setMobileInspectorOpen(true);
    },
    [isMobile]
  );

  // ---------------- "Edit text" tool: patch a line of the PDF's own text ----
  // Covers the original glyphs with a background-colored rectangle and drops
  // an editable text layer on top with matched font/size/color. Both are
  // ordinary layers (one undo step), so the Inspector keeps working on them.
  const handleEditLine = useCallback(
    (line: PdfTextLine) => {
      const pageIndex = activePageIndexRef.current;
      const cover: ShapeLayer = {
        id: newId('cover'),
        type: 'shape',
        kind: 'rect',
        pageIndex,
        x: line.x,
        y: line.y,
        w: line.w,
        h: line.h,
        rotation: 0,
        opacity: 1,
        strokeColor: line.bg,
        fillColor: line.bg,
        strokeWidth: 0.0005,
      };
      const text: TextLayer = {
        id: newId('etext'),
        type: 'text',
        pageIndex,
        x: line.x,
        y: line.y,
        w: line.w,
        h: Math.max(line.h, line.fontSize * 1.35),
        rotation: 0,
        opacity: 1,
        text: line.text,
        fontId: line.fontId,
        fontSize: line.fontSize,
        bold: line.bold,
        italic: line.italic,
        underline: false,
        color: line.color,
        align: 'left',
        lineHeight: 1.15,
      };
      const d = docRef.current;
      applyDoc({ pages: d.pages, layers: [...d.layers, cover, text] }, true);
      setSelectedLayerId(text.id);
      // Open the inline editor immediately so the user can start typing.
      setEditingId(text.id);
      if (line.approxFont) {
        setStatusMsg('Font approximated — the original font is not available for export. Adjust it in Options if needed.');
      }
    },
    [applyDoc]
  );

  // ---------------- render ----------------
  if (!pdfBytes || doc.pages.length === 0) {
    return (
      <div className="pe-preview min-h-screen bg-[var(--pe-bg)] text-[var(--pe-text)]">
        <UploadScreen onFile={loadFile} onSample={loadSample} busy={busy} status={statusMsg} error={errorMsg} />
      </div>
    );
  }

  const activePage = doc.pages[activePageIndex] ?? doc.pages[0];
  const pageLayers = doc.layers.filter((l) => l.pageIndex === activePageIndex);

  const zoomMenu = (
    zoomMenuOpen && (
      <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 z-50 bg-[var(--pe-surface)] border border-[var(--pe-border-strong)] rounded-xl shadow-2xl py-1 min-w-[160px]">
        {(['fit-width', 'fit-page', 50, 75, 100, 125, 150, 200] as const).map((m) => (
          <button
            key={String(m)}
            type="button"
            onClick={() => setZoomMode(m)}
            className="w-full text-left px-4 py-2 text-xs text-[var(--pe-text)] hover:bg-[var(--pe-surface-3)]"
          >
            {m === 'fit-width' ? 'Fit width' : m === 'fit-page' ? 'Fit page' : `${m}%`}
          </button>
        ))}
      </div>
    )
  );

  return (
    <div className="pe-preview h-screen flex flex-col bg-[var(--pe-bg)] text-[var(--pe-text)] overflow-hidden">
      {/* desktop toolbar / mobile mini header */}
      {!isMobile ? (
        <div className="relative">
          <Toolbar
            tool={tool}
            onTool={handleToolSelect}
            canUndo={history.canUndo}
            canRedo={history.canRedo}
            onUndo={doUndo}
            onRedo={doRedo}
            zoomLabel={zoomLabel}
            onZoomIn={() => zoomBy(15)}
            onZoomOut={() => zoomBy(-15)}
            onZoomMenu={() => setZoomMenuOpen((v) => !v)}
            onExport={openExport}
            busy={busy}
            fileName={file?.name ?? ''}
            onNewFile={closeDocument}
          />
          {zoomMenu}
        </div>
      ) : (
        <header className="flex items-center gap-2 px-3 h-14 bg-[var(--pe-surface)] border-b border-[var(--pe-border)] shrink-0">
          <button
            type="button"
            onClick={() => setMobilePagesOpen(true)}
            className="h-9 px-3 rounded-lg bg-[var(--pe-surface-3)] text-[var(--pe-text)] text-xs font-semibold"
            aria-label="Open pages panel"
          >
            Pages
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[var(--pe-text)] truncate">{file?.name}</p>
            <p className="text-[10px] text-[var(--pe-text-2)]">{doc.pages.length} pages</p>
          </div>
          {(busy || statusMsg) && <Loader2 className="w-4 h-4 animate-spin text-[var(--pe-accent)]" />}
          <button
            type="button"
            onClick={openExport}
            disabled={busy}
            className="h-9 px-4 rounded-lg bg-[var(--pe-accent)] hover:bg-[var(--pe-accent-hover)] disabled:opacity-50 text-[var(--pe-accent-ink)] text-xs font-bold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </header>
      )}

      {/* restore banner */}
      {showRestore && (
        <div className="px-4 py-2 bg-[var(--pe-accent-soft)] border-b border-[var(--pe-border)] flex items-center gap-3 text-xs">
          <CheckCircle2 className="w-4 h-4 text-[var(--pe-accent)] shrink-0" />
          <span className="flex-1 text-[var(--pe-text)]">We found unsaved edits from your last session on this file.</span>
          <button type="button" onClick={restoreDraft} className="px-3 py-1 rounded-lg bg-[var(--pe-accent)] text-[var(--pe-accent-ink)] font-semibold">
            Restore
          </button>
          <button type="button" onClick={() => setShowRestore(null)} className="px-3 py-1 rounded-lg bg-[var(--pe-surface-3)] text-[var(--pe-text)]">
            Discard
          </button>
        </div>
      )}

      {/* status / error banners */}
      {errorMsg && (
        <div className="px-4 py-2 bg-[var(--pe-danger-soft)] border-b border-[var(--pe-border)] flex items-center gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 text-[var(--pe-accent)] shrink-0" />
          <span className="flex-1 text-[var(--pe-danger)]">{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg('')} aria-label="Dismiss error" className="text-[var(--pe-accent)] hover:text-[var(--pe-danger)]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {statusMsg && !busy && (
        <div className="px-4 py-1.5 bg-[var(--pe-surface)] border-b border-[var(--pe-border)] text-[11px] text-[var(--pe-text-2)]">{statusMsg}</div>
      )}

      {/* main 4-zone layout */}
      <div className="flex-1 flex min-h-0 relative">
        {/* LEFT: pages panel */}
        {!isMobile && pagesOpen && (
          <aside className="w-[200px] shrink-0 border-r border-[var(--pe-border)] bg-[var(--pe-surface-2)] overflow-hidden">
            <PagesPanel
              pages={doc.pages}
              activeIndex={activePageIndex}
              selectedKeys={selectedPageKeys}
              onSelect={selectPage}
              onReorder={reorderPages}
              onDeleteSelected={deleteSelectedPages}
              onDuplicateSelected={duplicateSelectedPages}
              onRotateSelected={rotateSelected}
              onRotateAll={rotateAll}
              onAddBlank={addBlankPage}
              onExtractSelected={extractSelected}
            />
          </aside>
        )}

        {/* CENTER: canvas */}
        <div ref={canvasWrapRef} className="flex-1 min-w-0 flex flex-col relative">
          <StudioCanvas
            pdfDoc={pdfDoc}
            page={activePage}
            layers={pageLayers}
            tool={tool}
            options={options}
            zoom={zoom}
            selectedId={selectedLayerId}
            editingId={editingId}
            pendingSignature={pendingSignature}
            onSelectLayer={setSelectedLayerId}
            onUpdateLayer={updateLayer}
            onAddLayer={addLayer}
            onCommit={commitNow}
            onOpenSignaturePad={() => setSigPadOpen(true)}
            onConsumeSignature={() => setPendingSignature(null)}
            onEditingChange={setEditingId}
            onBringToFront={bringToFront}
            onSendToBack={sendToBack}
            onEditLine={handleEditLine}
            onDeleteLayer={deleteLayer}
          />
          {/* trust strip */}
          <div className="shrink-0 px-4 py-1.5 bg-[var(--pe-surface-2)] border-t border-[var(--pe-border)] text-[10px] text-[var(--pe-text-3)] text-center">
            Files are processed in your browser — nothing is uploaded to our servers. Text and shapes are added as overlays on the original PDF.
          </div>
        </div>

        {/* RIGHT: inspector */}
        {!isMobile && (
          <aside className="w-72 shrink-0 border-l border-[var(--pe-border)] bg-[var(--pe-surface-2)] overflow-y-auto">
            <Inspector
              tool={tool}
              selected={selectedLayer}
              onPatchSelected={patchSelected}
              onDeleteSelected={() => selectedLayerId && deleteLayer(selectedLayerId)}
              onDuplicateSelected={() => selectedLayerId && duplicateLayer(selectedLayerId)}
              options={options}
              onOptionsChange={patchOptions}
              onOpenSignaturePad={() => setSigPadOpen(true)}
              hasSignature={!!pendingSignature}
              onBringToFront={() => selectedLayerId && bringToFront(selectedLayerId)}
              onSendToBack={() => selectedLayerId && sendToBack(selectedLayerId)}
            />
          </aside>
        )}
      </div>

      {/* mobile bottom toolbar */}
      {isMobile && (
        <nav className="shrink-0 bg-[var(--pe-surface)] border-t border-[var(--pe-border)] px-2 py-2 flex items-center gap-1 overflow-x-auto" aria-label="Editing tools">
          <MobileToolButtons tool={tool} onTool={handleToolSelect} />
          <div className="w-px h-8 bg-[var(--pe-surface-3)] shrink-0 mx-1" />
          <button type="button" onClick={doUndo} disabled={!history.canUndo} className="h-10 min-w-[44px] rounded-lg text-[var(--pe-text-2)] disabled:opacity-30 text-xs font-bold" aria-label="Undo">↺</button>
          <button type="button" onClick={doRedo} disabled={!history.canRedo} className="h-10 min-w-[44px] rounded-lg text-[var(--pe-text-2)] disabled:opacity-30 text-xs font-bold" aria-label="Redo">↻</button>
          <button
            type="button"
            onClick={() => setMobileInspectorOpen((v) => !v)}
            className={`h-10 px-3 rounded-lg text-xs font-semibold shrink-0 ${mobileInspectorOpen ? 'bg-[var(--pe-accent-soft)] text-[var(--pe-accent)]' : 'bg-[var(--pe-surface-3)] text-[var(--pe-text)]'}`}
          >
            Options
          </button>
        </nav>
      )}

      {/* mobile pages drawer */}
      {isMobile && mobilePagesOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobilePagesOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[240px] bg-[var(--pe-surface)] border-r border-[var(--pe-border)]">
            <PagesPanel
              pages={doc.pages}
              activeIndex={activePageIndex}
              selectedKeys={selectedPageKeys}
              onSelect={(i, a) => {
                selectPage(i, a);
                if (!a) setMobilePagesOpen(false);
              }}
              onReorder={reorderPages}
              onDeleteSelected={deleteSelectedPages}
              onDuplicateSelected={duplicateSelectedPages}
              onRotateSelected={rotateSelected}
              onRotateAll={rotateAll}
              onAddBlank={addBlankPage}
              onExtractSelected={extractSelected}
              onClose={() => setMobilePagesOpen(false)}
            />
          </div>
        </div>
      )}

      {/* mobile inspector bottom sheet */}
      {isMobile && mobileInspectorOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileInspectorOpen(false)} />
          <div className="absolute left-0 right-0 bottom-0 max-h-[55%] overflow-y-auto bg-[var(--pe-surface)] border-t border-[var(--pe-border-strong)] rounded-t-2xl">
            <div className="sticky top-0 bg-[var(--pe-surface)] pt-2 pb-1 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-[var(--pe-border-strong)]" />
            </div>
            <Inspector
              tool={tool}
              selected={selectedLayer}
              onPatchSelected={patchSelected}
              onDeleteSelected={() => selectedLayerId && deleteLayer(selectedLayerId)}
              onDuplicateSelected={() => selectedLayerId && duplicateLayer(selectedLayerId)}
              options={options}
              onOptionsChange={patchOptions}
              onOpenSignaturePad={() => setSigPadOpen(true)}
              hasSignature={!!pendingSignature}
              onBringToFront={() => selectedLayerId && bringToFront(selectedLayerId)}
              onSendToBack={() => selectedLayerId && sendToBack(selectedLayerId)}
            />
          </div>
        </div>
      )}

      {/* signature pad (remounted fresh on every open) */}
      {sigPadOpen && (
        <SignaturePad
          open
          onClose={() => setSigPadOpen(false)}
          onSave={(dataUrl) => {
            setPendingSignature(dataUrl);
            setSigPadOpen(false);
            setTool('signature');
            setStatusMsg('Signature ready — click on the page to place it.');
            setTimeout(() => setStatusMsg(''), 3000);
          }}
        />
      )}

      {/* export dialog */}
      <ExportDialog
        open={exportDlg.open}
        stage={exportDlg.stage}
        progress={exportDlg.progress}
        result={exportDlg.result}
        error={exportDlg.error}
        hasRedactions={doc.layers.some((l) => l.type === 'redact')}
        onClose={() => setExportDlg((s) => ({ ...s, open: false }))}
        onExport={doExport}
        onDownload={downloadExport}
        onContinue={() => setExportDlg((s) => ({ ...s, open: false }))}
        onNewFile={() => {
          setExportDlg((s) => ({ ...s, open: false }));
          closeDocument();
        }}
      />

      {/* busy overlay */}
      {busy && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center">
          <div className="bg-[var(--pe-surface)] border border-[var(--pe-border-strong)] rounded-2xl px-6 py-5 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--pe-accent)]" />
            <span className="text-sm text-[var(--pe-text)]">{statusMsg || 'Working…'}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function idxIncludes(arr: number[], v: number): boolean {
  return arr.indexOf(v) >= 0;
}

function MobileToolButtons({ tool, onTool }: { tool: ToolId; onTool: (t: ToolId) => void }) {
  const labels: Record<string, string> = {
    select: 'Select', text: 'Text', draw: 'Draw', highlight: 'Hi-Lite', shape: 'Shapes',
    image: 'Image', signature: 'Sign', stamp: 'Stamp', redact: 'Redact',
  };
  return (
    <>
      {MOBILE_TOOLS.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onTool(t)}
          aria-pressed={tool === t}
          className={`h-10 min-w-[52px] px-2 rounded-lg text-[11px] font-semibold shrink-0 ${
            tool === t ? 'bg-[var(--pe-accent-soft)] text-[var(--pe-accent)]' : 'text-[var(--pe-text-2)]'
          }`}
        >
          {labels[t] ?? t}
        </button>
      ))}
    </>
  );
}
