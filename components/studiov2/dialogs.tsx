/**
 * Studio V2 dialogs — start screen, document setup, print, signature, stamps.
 *
 * All dialogs are controlled, presentational components; state lives in
 * StudioV2Preview so they stay reusable by future builders on the doc engine.
 */
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileUp,
  FileText,
  Plus,
  Printer,
  Download,
  X,
  Eraser,
  FileCheck,
  Clock,
} from 'lucide-react';
import {
  A4_PAGE,
  MM_PER_IN,
  PAGE_PRESETS,
  PT_PER_IN,
  describePageSize,
  inToPt,
  mmToPt,
  pageSizeFromCustom,
  pageWithOrientation,
  pxToPt,
  type DocMargins,
  type DocPageSize,
  type PageSizeUnit,
} from '@/lib/doc-engine/types';

/* ------------------------------------------------------------------ */
/* shared dialog shell                                                 */
/* ------------------------------------------------------------------ */

function DialogShell({
  title,
  subtitle,
  onClose,
  children,
  wide,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(8,10,14,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full overflow-hidden rounded-2xl"
        style={{
          maxWidth: wide ? 720 : 560,
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'var(--pe-surface)',
          border: '1px solid var(--pe-border)',
          boxShadow: 'var(--pe-shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-start justify-between gap-3 px-6 pt-5 pb-4"
          style={{ borderBottom: '1px solid var(--pe-border)' }}
        >
          <div>
            <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--pe-ink)' }}>
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-sm" style={{ color: 'var(--pe-ink-soft)' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 transition hover:opacity-80"
            style={{ color: 'var(--pe-ink-soft)', background: 'var(--pe-surface-2)' }}
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* start screen                                                        */
/* ------------------------------------------------------------------ */

export function StartScreen({
  hasDraft,
  draftTitle,
  onEditPdf,
  onCreateNew,
  onContinueDraft,
}: {
  hasDraft: boolean;
  draftTitle?: string;
  onEditPdf: () => void;
  onCreateNew: () => void;
  onContinueDraft: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[95] flex min-h-full flex-col items-center justify-center overflow-y-auto px-4 py-12"
      style={{ background: 'var(--pe-surface-2)' }}
    >
      <div className="w-full" style={{ maxWidth: 880 }}>
        <div className="mb-2 flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg,#e11d48,#9f1239)', color: '#fff' }}
          >
            <FileText size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl" style={{ color: 'var(--pe-ink)' }}>
              PDF Studio
            </h1>
            <p className="text-sm" style={{ color: 'var(--pe-ink-soft)' }}>
              Your complete document workspace — create, edit and manage any document.
            </p>
          </div>
        </div>

        {hasDraft && (
          <button
            onClick={onContinueDraft}
            className="mt-6 flex w-full items-center gap-4 rounded-2xl p-4 text-left transition hover:opacity-95"
            style={{ background: 'var(--pe-surface)', border: '1px solid var(--pe-border)', boxShadow: 'var(--pe-shadow-sm)' }}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'rgba(225,29,72,0.12)', color: '#e11d48' }}
            >
              <Clock size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold" style={{ color: 'var(--pe-ink)' }}>
                Continue where you left off
              </div>
              <div className="truncate text-sm" style={{ color: 'var(--pe-ink-soft)' }}>
                {draftTitle || 'Untitled document'}
              </div>
            </div>
            <ArrowRight size={18} style={{ color: 'var(--pe-ink-soft)' }} />
          </button>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button
            onClick={onEditPdf}
            className="group flex flex-col gap-3 rounded-2xl p-6 text-left transition hover:-translate-y-0.5"
            style={{ background: 'var(--pe-surface)', border: '1px solid var(--pe-border)', boxShadow: 'var(--pe-shadow-md)' }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: 'rgba(225,29,72,0.12)', color: '#e11d48' }}
            >
              <FileUp size={22} />
            </div>
            <div>
              <div className="text-base font-bold" style={{ color: 'var(--pe-ink)' }}>
                Edit existing PDF
              </div>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--pe-ink-soft)' }}>
                Open a PDF and add text, images, signatures, stamps and more on top of its pages.
              </p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#e11d48' }}>
              Open PDF <ArrowRight size={15} />
            </span>
          </button>

          <button
            onClick={onCreateNew}
            className="group flex flex-col gap-3 rounded-2xl p-6 text-left transition hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg,#e11d48,#be123c)', color: '#fff', boxShadow: 'var(--pe-shadow-md)' }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.18)' }}>
              <Plus size={22} />
            </div>
            <div>
              <div className="text-base font-bold">Create new document</div>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Start from a blank page — pick a size, orientation and layout first.
              </p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold">
              Set up document <ArrowRight size={15} />
            </span>
          </button>
        </div>

        <p className="mt-8 text-center text-xs" style={{ color: 'var(--pe-ink-soft)' }}>
          Imported PDFs are shown as page backgrounds — you edit by adding overlays. Export anytime to PDF.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* document setup dialog                                               */
/* ------------------------------------------------------------------ */

export interface DocumentSetup {
  page: DocPageSize;
  margins: DocMargins;
  pageBackground: string;
  header: string;
  footer: string;
}

const UNITS: { id: PageSizeUnit; label: string; step: number; def: number }[] = [
  { id: 'mm', label: 'mm', step: 1, def: 210 },
  { id: 'inch', label: 'in', step: 0.25, def: 8.27 },
  { id: 'px', label: 'px', step: 10, def: 794 },
];

export function DocumentSetupDialog({
  title,
  subtitle,
  initial,
  onCancel,
  onConfirm,
  confirmLabel,
}: {
  title: string;
  subtitle?: string;
  initial: DocumentSetup;
  onCancel: () => void;
  onConfirm: (setup: DocumentSetup) => void;
  confirmLabel: string;
}) {
  const [preset, setPreset] = useState<string>(() => {
    const match = PAGE_PRESETS.find(
      (p) =>
        Math.abs(p.widthPt - initial.page.widthPt) < 0.5 && Math.abs(p.heightPt - initial.page.heightPt) < 0.5,
    );
    return match ? match.label : 'Custom';
  });
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() =>
    initial.page.heightPt >= initial.page.widthPt ? 'portrait' : 'landscape',
  );
  const [unit, setUnit] = useState<PageSizeUnit>('mm');
  const [customW, setCustomW] = useState('210');
  const [customH, setCustomH] = useState('297');
  const [marginsMm, setMarginsMm] = useState({
    top: Math.round(initial.margins.top * 297),
    right: Math.round(initial.margins.right * 210),
    bottom: Math.round(initial.margins.bottom * 297),
    left: Math.round(initial.margins.left * 210),
  });
  const [pageBackground, setPageBackground] = useState(initial.pageBackground || '#ffffff');
  const [header, setHeader] = useState(initial.header || '');
  const [footer, setFooter] = useState(initial.footer || '');
  const [error, setError] = useState('');

  const resolvedPage = (): DocPageSize => {
    if (preset !== 'Custom') {
      const base = PAGE_PRESETS.find((p) => p.label === preset) ?? A4_PAGE;
      return pageWithOrientation(base, orientation);
    }
    const w = Number(customW);
    const h = Number(customH);
    return pageWithOrientation(pageSizeFromCustom(w, h, unit, `Custom ${w}×${h} ${unit}`), orientation);
  };

  const handleConfirm = () => {
    setError('');
    if (preset === 'Custom') {
      const w = Number(customW);
      const h = Number(customH);
      const unitLabel = unit === 'mm' ? 'mm' : unit === 'inch' ? 'in' : 'px';
      const [min, max] =
        unit === 'mm' ? [20, 1500] : unit === 'inch' ? [0.75, 60] : [57, 4200];
      if (!Number.isFinite(w) || !Number.isFinite(h) || w < min || h < min || w > max || h > max) {
        setError(`Enter a valid width and height between ${min} and ${max} ${unitLabel}.`);
        return;
      }
    }
    for (const [k, v] of Object.entries(marginsMm)) {
      if (!Number.isFinite(v) || v < 0 || v > 100) {
        setError(`Margin "${k}" must be between 0 and 100 mm.`);
        return;
      }
    }
    const page = resolvedPage();
    const widthMm = (page.widthPt / PT_PER_IN) * MM_PER_IN;
    const heightMm = (page.heightPt / PT_PER_IN) * MM_PER_IN;
    if (marginsMm.top + marginsMm.bottom > heightMm - 10) {
      setError('Top and bottom margins are too large for this page height.');
      return;
    }
    if (marginsMm.left + marginsMm.right > widthMm - 10) {
      setError('Left and right margins are too large for this page width.');
      return;
    }
    const margins: DocMargins = {
      top: marginsMm.top / (page.heightPt / 2.83465),
      right: marginsMm.right / (page.widthPt / 2.83465),
      bottom: marginsMm.bottom / (page.heightPt / 2.83465),
      left: marginsMm.left / (page.widthPt / 2.83465),
    };
    onConfirm({ page, margins, pageBackground, header: header.trim(), footer: footer.trim() });
  };

  const page = resolvedPage();
  const inputCls =
    'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500/40';
  const inputStyle = { background: 'var(--pe-surface-2)', borderColor: 'var(--pe-border)', color: 'var(--pe-ink)' } as const;

  return (
    <DialogShell title={title} subtitle={subtitle} onClose={onCancel} wide>
      {/* page size presets */}
      <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--pe-ink-soft)' }}>
        Page size
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {[...PAGE_PRESETS.map((p) => p.label), 'Custom'].map((label) => (
          <button
            key={label}
            onClick={() => setPreset(label)}
            className="rounded-xl border px-2 py-2.5 text-sm font-semibold transition"
            style={{
              borderColor: preset === label ? '#e11d48' : 'var(--pe-border)',
              background: preset === label ? 'rgba(225,29,72,0.1)' : 'var(--pe-surface-2)',
              color: preset === label ? '#e11d48' : 'var(--pe-ink)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* orientation */}
      <div className="mt-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--pe-ink-soft)' }}>
        Orientation
      </div>
      <div className="mt-2 flex gap-2">
        {(['portrait', 'landscape'] as const).map((o) => (
          <button
            key={o}
            onClick={() => setOrientation(o)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold capitalize transition"
            style={{
              borderColor: orientation === o ? '#e11d48' : 'var(--pe-border)',
              background: orientation === o ? 'rgba(225,29,72,0.1)' : 'var(--pe-surface-2)',
              color: orientation === o ? '#e11d48' : 'var(--pe-ink)',
            }}
          >
            <span
              className="inline-block rounded-[2px] border-2"
              style={{
                width: o === 'portrait' ? 12 : 20,
                height: o === 'portrait' ? 16 : 12,
                borderColor: 'currentColor',
              }}
            />
            {o}
          </button>
        ))}
      </div>

      {/* custom size */}
      {preset === 'Custom' && (
        <div className="mt-4 rounded-xl border p-4" style={{ borderColor: 'var(--pe-border)', background: 'var(--pe-surface-2)' }}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--pe-ink-soft)' }}>
              Custom dimensions
            </span>
            <div className="flex gap-1">
              {UNITS.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    const factor = (id: PageSizeUnit) =>
                      id === 'mm' ? mmToPt(1) : id === 'inch' ? inToPt(1) : pxToPt(1);
                    const ratio = factor(unit) / factor(u.id);
                    const conv = (v: string) => {
                      const n = Number(v);
                      if (!Number.isFinite(n) || n <= 0) return v;
                      return String(Math.round(n * ratio * 100) / 100);
                    };
                    setCustomW(conv(customW));
                    setCustomH(conv(customH));
                    setUnit(u.id);
                  }}
                  className="rounded-md px-2 py-1 text-xs font-bold"
                  style={{
                    background: unit === u.id ? '#e11d48' : 'transparent',
                    color: unit === u.id ? '#fff' : 'var(--pe-ink-soft)',
                  }}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <label className="flex-1 text-xs font-semibold" style={{ color: 'var(--pe-ink-soft)' }}>
              Width
              <input
                type="number"
                value={customW}
                onChange={(e) => setCustomW(e.target.value)}
                className={`${inputCls} mt-1`}
                style={inputStyle}
                min={1}
              />
            </label>
            <label className="flex-1 text-xs font-semibold" style={{ color: 'var(--pe-ink-soft)' }}>
              Height
              <input
                type="number"
                value={customH}
                onChange={(e) => setCustomH(e.target.value)}
                className={`${inputCls} mt-1`}
                style={inputStyle}
                min={1}
              />
            </label>
          </div>
        </div>
      )}

      <p className="mt-3 text-xs" style={{ color: 'var(--pe-ink-soft)' }}>
        Result: {describePageSize(page)} · {orientation}
      </p>

      {/* margins */}
      <div className="mt-5 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--pe-ink-soft)' }}>
        Margins (mm)
      </div>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {(['top', 'right', 'bottom', 'left'] as const).map((k) => (
          <label key={k} className="text-xs font-semibold capitalize" style={{ color: 'var(--pe-ink-soft)' }}>
            {k}
            <input
              type="number"
              value={marginsMm[k]}
              onChange={(e) => setMarginsMm((m) => ({ ...m, [k]: Number(e.target.value) }))}
              className={`${inputCls} mt-1`}
              style={inputStyle}
              min={0}
              max={100}
            />
          </label>
        ))}
      </div>

      {/* background / header / footer */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold" style={{ color: 'var(--pe-ink-soft)' }}>
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider">Page background</span>
          <span className="flex items-center gap-2">
            <input
              type="color"
              value={pageBackground}
              onChange={(e) => setPageBackground(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded-md border"
              style={{ borderColor: 'var(--pe-border)', background: 'var(--pe-surface-2)' }}
            />
            <span className="text-sm" style={{ color: 'var(--pe-ink)' }}>
              {pageBackground}
            </span>
          </span>
        </label>
        <div />
        <label className="text-xs font-semibold" style={{ color: 'var(--pe-ink-soft)' }}>
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider">Header (optional)</span>
          <input
            value={header}
            onChange={(e) => setHeader(e.target.value)}
            placeholder="Shown at the top of every page"
            className={inputCls}
            style={inputStyle}
          />
        </label>
        <label className="text-xs font-semibold" style={{ color: 'var(--pe-ink-soft)' }}>
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider">Footer (optional)</span>
          <input
            value={footer}
            onChange={(e) => setFooter(e.target.value)}
            placeholder="Shown at the bottom of every page"
            className={inputCls}
            style={inputStyle}
          />
        </label>
      </div>

      {error && <p className="mt-4 text-sm font-semibold text-rose-600">{error}</p>}

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-xl border px-4 py-2.5 text-sm font-bold transition hover:opacity-80"
          style={{ borderColor: 'var(--pe-border)', color: 'var(--pe-ink)' }}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#e11d48,#be123c)' }}
        >
          {confirmLabel}
        </button>
      </div>
    </DialogShell>
  );
}

/* ------------------------------------------------------------------ */
/* print dialog                                                        */
/* ------------------------------------------------------------------ */

export type PrintChoice = 'all' | 'current' | 'custom';

export function PrintDialog({
  pageCount,
  currentPage,
  pageLabel,
  onClose,
  onPrint,
  onDownloadAndPrint,
}: {
  pageCount: number;
  currentPage: number;
  pageLabel: string;
  onClose: () => void;
  onPrint: (indices: number[] | null) => void;
  onDownloadAndPrint: (indices: number[] | null) => void;
}) {
  const [choice, setChoice] = useState<PrintChoice>('all');
  const [range, setRange] = useState('');
  const [error, setError] = useState('');

  const resolve = (): number[] | null => {
    if (choice === 'all') return null;
    if (choice === 'current') return [currentPage];
    const m = range.trim().match(/^[\d\s,\-]+$/);
    if (!m) return undefined as unknown as number[] | null;
    const out = new Set<number>();
    for (const part of range.split(',')) {
      const t = part.trim();
      if (!t) continue;
      const r = t.match(/^(\d+)\s*-\s*(\d+)$/);
      if (r) {
        const a = Math.min(Number(r[1]), Number(r[2]));
        const b = Math.max(Number(r[1]), Number(r[2]));
        for (let i = a; i <= b; i++) if (i >= 1 && i <= pageCount) out.add(i - 1);
      } else if (/^\d+$/.test(t)) {
        const n = Number(t);
        if (n >= 1 && n <= pageCount) out.add(n - 1);
      } else {
        return undefined as unknown as number[] | null;
      }
    }
    return out.size ? [...out].sort((a, b) => a - b) : (undefined as unknown as number[] | null);
  };

  const submit = (fn: (indices: number[] | null) => void) => {
    setError('');
    const indices = resolve();
    if (indices === undefined) {
      setError(`Enter pages like "1-3, 5" (document has ${pageCount} page${pageCount === 1 ? '' : 's'}).`);
      return;
    }
    fn(indices);
  };

  const opts: { id: PrintChoice; label: string; desc: string }[] = [
    { id: 'all', label: 'Entire document', desc: `${pageCount} page${pageCount === 1 ? '' : 's'}` },
    { id: 'current', label: 'Current page', desc: `Page ${currentPage + 1}` },
    { id: 'custom', label: 'Selected pages', desc: 'e.g. 1-3, 5' },
  ];

  return (
    <DialogShell title="Print" subtitle="Choose what to print. Your browser's print dialog opens next — paper size and orientation follow the document setup." onClose={onClose}>
      <div className="flex flex-col gap-2">
        {opts.map((o) => (
          <button
            key={o.id}
            onClick={() => setChoice(o.id)}
            className="flex items-center gap-3 rounded-xl border p-3.5 text-left transition"
            style={{
              borderColor: choice === o.id ? '#e11d48' : 'var(--pe-border)',
              background: choice === o.id ? 'rgba(225,29,72,0.08)' : 'var(--pe-surface-2)',
            }}
          >
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full border-2"
              style={{ borderColor: choice === o.id ? '#e11d48' : 'var(--pe-border)' }}
            >
              {choice === o.id && <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#e11d48' }} />}
            </span>
            <span>
              <span className="block text-sm font-bold" style={{ color: 'var(--pe-ink)' }}>
                {o.label}
              </span>
              <span className="block text-xs" style={{ color: 'var(--pe-ink-soft)' }}>
                {o.desc}
              </span>
            </span>
          </button>
        ))}
      </div>

      {choice === 'custom' && (
        <input
          value={range}
          onChange={(e) => setRange(e.target.value)}
          placeholder={`1-${pageCount}`}
          className="mt-3 w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/40"
          style={{ background: 'var(--pe-surface-2)', borderColor: 'var(--pe-border)', color: 'var(--pe-ink)' }}
        />
      )}

      <p className="mt-4 text-xs" style={{ color: 'var(--pe-ink-soft)' }}>
        Document paper: <span className="font-semibold">{pageLabel}</span> — set it from File → Document setup.
      </p>

      {error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          onClick={() => submit(onDownloadAndPrint)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition hover:opacity-80"
          style={{ borderColor: 'var(--pe-border)', color: 'var(--pe-ink)' }}
        >
          <Download size={16} /> Download + Print
        </button>
        <button
          onClick={() => submit(onPrint)}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#e11d48,#be123c)' }}
        >
          <Printer size={16} /> Print
        </button>
      </div>
    </DialogShell>
  );
}

/* ------------------------------------------------------------------ */
/* signature pad                                                       */
/* ------------------------------------------------------------------ */

export function SignatureModal({
  onClose,
  onInsert,
}: {
  onClose: () => void;
  onInsert: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    canvas.width = 560 * dpr;
    canvas.height = 200 * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';

    const pos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const down = (e: PointerEvent) => {
      drawing.current = true;
      canvas.setPointerCapture(e.pointerId);
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      setEmpty(false);
    };
    const move = (e: PointerEvent) => {
      if (!drawing.current) return;
      const p = pos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };
    const up = () => {
      drawing.current = false;
    };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    return () => {
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
    };
  }, []);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setEmpty(true);
  };

  const insert = () => {
    const canvas = canvasRef.current;
    if (!canvas || empty) return;
    onInsert(canvas.toDataURL('image/png'));
  };

  return (
    <DialogShell title="Draw your signature" subtitle="Sign with your mouse, trackpad or finger." onClose={onClose}>
      <canvas
        ref={canvasRef}
        className="w-full cursor-crosshair touch-none rounded-xl border-2 border-dashed"
        style={{ height: 200, borderColor: 'var(--pe-border)', background: '#fff' }}
      />
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={clear}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition hover:opacity-80"
          style={{ color: 'var(--pe-ink-soft)', background: 'var(--pe-surface-2)' }}
        >
          <Eraser size={15} /> Clear
        </button>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border px-4 py-2.5 text-sm font-bold transition hover:opacity-80"
            style={{ borderColor: 'var(--pe-border)', color: 'var(--pe-ink)' }}
          >
            Cancel
          </button>
          <button
            onClick={insert}
            disabled={empty}
            className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#e11d48,#be123c)' }}
          >
            <Check size={16} /> Insert signature
          </button>
        </div>
      </div>
    </DialogShell>
  );
}

/* ------------------------------------------------------------------ */
/* stamp picker                                                        */
/* ------------------------------------------------------------------ */

const STAMP_PRESETS = [
  { label: 'APPROVED', color: '#15803d', shape: 'round' as const },
  { label: 'PAID', color: '#1d4ed8', shape: 'round' as const },
  { label: 'DRAFT', color: '#b45309', shape: 'rect' as const },
  { label: 'CONFIDENTIAL', color: '#b91c1c', shape: 'rect' as const },
  { label: 'RECEIVED', color: '#0e7490', shape: 'rect' as const },
  { label: 'SIGNED', color: '#6d28d9', shape: 'round' as const },
];

const STAMP_COLORS = ['#b91c1c', '#15803d', '#1d4ed8', '#b45309', '#0e7490', '#6d28d9', '#0f172a'];

export function StampPicker({
  onClose,
  onInsert,
}: {
  onClose: () => void;
  onInsert: (opts: { label: string; color: string; shape: 'rect' | 'round' }) => void;
}) {
  const [label, setLabel] = useState('APPROVED');
  const [color, setColor] = useState('#b91c1c');
  const [shape, setShape] = useState<'rect' | 'round'>('round');

  return (
    <DialogShell title="Insert stamp" subtitle="Pick a preset or design your own." onClose={onClose}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {STAMP_PRESETS.map((s) => (
          <button
            key={s.label}
            onClick={() => {
              setLabel(s.label);
              setColor(s.color);
              setShape(s.shape);
            }}
            className="rounded-xl border px-3 py-2.5 text-sm font-bold transition hover:opacity-85"
            style={{
              borderColor: label === s.label && color === s.color ? s.color : 'var(--pe-border)',
              color: s.color,
              borderWidth: 2,
              borderRadius: s.shape === 'round' ? 999 : 8,
              background: 'transparent',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--pe-ink-soft)' }}>
          Custom label
        </div>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value.toUpperCase().slice(0, 20))}
          className="mt-2 w-full rounded-lg border px-3 py-2.5 text-sm font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-rose-500/40"
          style={{ background: 'var(--pe-surface-2)', borderColor: 'var(--pe-border)', color: 'var(--pe-ink)' }}
          placeholder="APPROVED"
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--pe-ink-soft)' }}>
            Color
          </div>
          <div className="mt-2 flex gap-1.5">
            {STAMP_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                aria-label={`Stamp color ${c}`}
                className="h-8 w-8 rounded-full transition"
                style={{
                  background: c,
                  outline: color === c ? '2px solid #e11d48' : '2px solid transparent',
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--pe-ink-soft)' }}>
            Shape
          </div>
          <div className="mt-2 flex gap-1.5">
            {(['rect', 'round'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setShape(s)}
                className="rounded-lg border px-3 py-1.5 text-xs font-bold capitalize"
                style={{
                  borderColor: shape === s ? '#e11d48' : 'var(--pe-border)',
                  color: shape === s ? '#e11d48' : 'var(--pe-ink-soft)',
                  background: shape === s ? 'rgba(225,29,72,0.08)' : 'transparent',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* live preview */}
      <div className="mt-5 flex items-center justify-center rounded-xl p-6" style={{ background: 'var(--pe-surface-2)' }}>
        <div
          className="px-5 py-2.5 text-lg font-black tracking-widest"
          style={{
            color,
            border: `3px solid ${color}`,
            borderRadius: shape === 'round' ? 999 : 6,
            transform: 'rotate(-6deg)',
            opacity: 0.9,
          }}
        >
          {label || 'STAMP'}
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-xl border px-4 py-2.5 text-sm font-bold transition hover:opacity-80"
          style={{ borderColor: 'var(--pe-border)', color: 'var(--pe-ink)' }}
        >
          Cancel
        </button>
        <button
          onClick={() => onInsert({ label: label.trim() || 'STAMP', color, shape })}
          disabled={!label.trim()}
          className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg,#e11d48,#be123c)' }}
        >
          <FileCheck size={16} /> Insert stamp
        </button>
      </div>
    </DialogShell>
  );
}

/* ------------------------------------------------------------------ */
/* back-to-start link (used in the editor top bar)                     */
/* ------------------------------------------------------------------ */

export function StartBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Back to start"
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition hover:opacity-80"
      style={{ color: 'var(--pe-ink-soft)', background: 'var(--pe-surface-2)' }}
    >
      <ArrowLeft size={14} /> Start
    </button>
  );
}
