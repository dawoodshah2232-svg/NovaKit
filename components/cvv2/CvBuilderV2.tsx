'use client';

/**
 * PDFEdit CV Builder V2 (preview) — direct-manipulation CV editor on the
 * shared document engine. Choose a template → click any text to edit it in
 * place → manage whole sections → export a selectable-text PDF.
 *
 * Production /cv-builder is untouched; this lives at /cv-builder-preview.
 */
import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Eye,
  EyeOff,
  ImagePlus,
  LayoutTemplate,
  Lightbulb,
  ListOrdered,
  Palette,
  Plus,
  Redo2,
  Shapes,
  Trash2,
  Undo2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useDocHistory } from '@/components/doc-engine/useDocHistory';
import { DocCanvas } from '@/components/doc-engine/DocCanvas';
import { FormatToolbar } from '@/components/doc-engine/FormatToolbar';
import { exportDocPdf } from '@/components/doc-engine/docExport';
import { ElementsPanel, type ElementKind } from '@/components/doc-engine/panels';
import { DocShell } from '@/components/doc-engine/DocShell';
import { CV_TEMPLATES, type CvTemplateMeta } from '@/lib/doc-engine/cvTemplates';
import {
  block,
  docSections,
  makeDividerLayer,
  makeImageLayer,
  makeShapeLayer,
  makeTextLayer,
  newId,
  run,
  type DocLayer,
  type DocState,
  type DocTextLayer,
} from '@/lib/doc-engine/types';

const STORAGE_KEY = 'pdfedit_cvv2_preview_v1';
const DEFAULT_TEMPLATE = 'modern-professional';

const ACCENT_SWATCHES = [
  '#B91C1C', '#1F3A5F', '#0D9488', '#7C3AED',
  '#EA580C', '#059669', '#111111', '#8A6D3B',
];

const SECTION_TYPES = [
  'Profile', 'Summary', 'Experience', 'Education', 'Skills',
  'Certifications', 'Languages', 'Projects', 'Achievements', 'Interests', 'References',
];

const ACTION_VERBS = [
  'led', 'built', 'launched', 'grew', 'increased', 'reduced', 'cut', 'drove',
  'owned', 'managed', 'delivered', 'created', 'designed', 'improved', 'achieved',
  'spearheaded', 'accelerated', 'doubled', 'negotiated', 'mentored', 'shipped',
];

const WORDING_RULES: Array<{ pattern: RegExp; label: string; suggestion: string }> = [
  { pattern: /responsible for/i, label: '“Responsible for”', suggestion: 'Swap for a strong verb: “Led”, “Owned” or “Drove”.' },
  { pattern: /\butilized\b/i, label: '“Utilized”', suggestion: 'Plain “used” reads stronger on a CV.' },
  { pattern: /\bhelped\b/i, label: '“Helped”', suggestion: 'Try “Supported”, “Enabled” or name the outcome.' },
  { pattern: /\bworked on\b/i, label: '“Worked on”', suggestion: 'Replace with “Built”, “Delivered” or “Launched”.' },
  { pattern: /\bvarious\b/i, label: '“Various”', suggestion: 'Be specific — name the things instead.' },
  { pattern: /\bhard worker\b|\bteam player\b|\bdetail-oriented\b|\bself-starter\b/i, label: 'Cliché phrase', suggestion: 'Show it with a result instead of claiming it.' },
  { pattern: /\breferences available on request\b/i, label: 'Filler closing line', suggestion: 'Drop it — employers assume it and it wastes space.' },
];

/* ------------------------------------------------------------------ */

function docText(doc: DocState): string {
  const parts: string[] = [];
  for (const l of doc.layers) {
    if (l.type !== 'text' || l.opacity === 0) continue;
    for (const b of l.blocks) {
      const t = b.runs.map((r) => r.text).join('');
      parts.push(b.kind === 'bullet' ? `• ${t}` : t);
    }
  }
  return parts.join('\n');
}

function firstH1(doc: DocState): string {
  for (const l of doc.layers) {
    if (l.type !== 'text') continue;
    for (const b of l.blocks) {
      if (b.kind === 'h1') {
        const t = b.runs.map((r) => r.text).join('').trim();
        if (t) return t;
      }
    }
  }
  return 'cv';
}

function recolorDoc(doc: DocState, from: string, to: string): DocState {
  const f = from.toLowerCase();
  const swap = (c: string | null): string | null =>
    c && c.toLowerCase() === f ? to : c;
  return {
    ...doc,
    layers: doc.layers.map((l) => {
      if (!l.accent) return l;
      if (l.type === 'text') {
        const color = swap(l.color);
        return {
          ...l,
          color: color ?? l.color,
          blocks: l.blocks.map((b) => ({
            ...b,
            runs: b.runs.map((r) => ({ ...r, color: swap(r.color) })),
          })),
        };
      }
      if (l.type === 'shape') {
        const stroke = swap(l.stroke);
        return { ...l, fill: swap(l.fill), stroke: stroke ?? l.stroke };
      }
      if (l.type === 'divider') {
        const color = swap(l.color);
        return { ...l, color: color ?? l.color };
      }
      return l;
    }),
  };
}

function scaleFonts(doc: DocState, ratio: number): DocState {
  return {
    ...doc,
    layers: doc.layers.map((l) =>
      l.type === 'text'
        ? {
            ...l,
            fontSize: l.fontSize * ratio,
            blocks: l.blocks.map((b) => ({
              ...b,
              runs: b.runs.map((r) => ({
                ...r,
                fontSize: r.fontSize == null ? null : r.fontSize * ratio,
              })),
            })),
          }
        : l,
    ),
  };
}

interface StashEntry {
  layers: DocLayer[];
  index: number;
  label: string;
}

/* ------------------------------------------------------------------ */

function CheckRow({ ok, label, hint }: { ok: boolean; label: string; hint?: string }) {
  return (
    <li className="flex items-start gap-2">
      {ok ? (
        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--pe-success)]" />
      ) : (
        <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--pe-danger)]" />
      )}
      <div className="min-w-0">
        <p className={`text-xs ${ok ? 'text-[var(--pe-text-2)]' : 'font-medium text-[var(--pe-text)]'}`}>{label}</p>
        {!ok && hint && <p className="text-[11px] leading-snug text-[var(--pe-text-3)]">{hint}</p>}
      </div>
    </li>
  );
}

function SmartSuggestions({ doc, templateId }: { doc: DocState; templateId: string }) {
  const smart = useMemo(() => {
    const text = docText(doc);
    const lower = text.toLowerCase();

    const wording = WORDING_RULES.filter((r) => r.pattern.test(text)).map((r) => ({
      label: r.label,
      suggestion: r.suggestion,
    }));

    const verbHits = ACTION_VERBS.filter((v) => new RegExp(`\\b${v}\\b`).test(lower)).length;
    const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
    const hasPhone = /\+?\d[\d\s().-]{7,}\d/.test(text);
    const hasNumbers = /(\d+%|\d+\.\d+x|\bAED\b|\$\s?\d|\b\d{2,}\b)/.test(text);
    const imageCount = doc.layers.filter((l) => l.type === 'image').length;
    const sections = docSections(doc).filter((s) => s.id !== 'sec-photo');
    const hasHeadings = doc.layers.some(
      (l) => l.type === 'text' && l.blocks.some((b) => b.kind === 'h1' || b.kind === 'h2' || b.kind === 'h3'),
    );

    const ats = [
      { ok: hasEmail, label: 'Contact email present', hint: 'Recruiters and parsers need a contact email.' },
      { ok: hasPhone, label: 'Phone number present', hint: 'Use international format, e.g. +971 50 123 4567.' },
      { ok: doc.pages.length <= 2, label: `Compact length (${doc.pages.length} page${doc.pages.length === 1 ? '' : 's'})`, hint: 'Keep it to one or two pages.' },
      { ok: verbHits >= 3, label: `Action verbs used (${verbHits} found)`, hint: 'Start bullets with strong verbs: led, built, grew, delivered.' },
      { ok: hasNumbers, label: 'Quantified achievements', hint: 'Add numbers: %, revenue, team size, timelines.' },
      {
        ok: imageCount === 0,
        label: imageCount === 0 ? 'No images (parser-safe)' : `${imageCount} image layer${imageCount === 1 ? '' : 's'} present`,
        hint: 'Some ATS parsers choke on images — the ATS Resume template is the safest pick.',
      },
      { ok: sections.length >= 4, label: `${sections.length} sections detected`, hint: 'Aim for summary, experience, education, and skills at minimum.' },
      { ok: hasHeadings, label: 'Clear section headings', hint: 'Parsers rely on standard headings like Experience and Education.' },
      { ok: templateId === 'ats-resume' || imageCount === 0, label: 'ATS-friendly layout', hint: 'Single-column layouts parse most reliably.' },
    ];

    const skillsText = doc.layers
      .filter((l) => l.type === 'text' && l.groupId === 'sec-skills')
      .map((l) => (l as DocTextLayer).blocks.map((b) => b.runs.map((r) => r.text).join('')).join('\n'))
      .join('\n');
    const skillsCount = skillsText.split(/[\n,•|·]+/).map((s) => s.trim()).filter(Boolean).length;

    const bullets: string[] = [];
    doc.layers.forEach((l) => {
      if (l.type !== 'text') return;
      l.blocks.forEach((b) => {
        if (b.kind === 'bullet') bullets.push(b.runs.map((r) => r.text).join('').trim());
      });
    });
    const verbStart = bullets.filter((b) => {
      const first = (b.match(/[a-z']+/i)?.[0] ?? '').toLowerCase();
      return ACTION_VERBS.includes(first);
    }).length;

    const improvements = [
      { ok: sections.some((s) => s.id === 'sec-summary'), label: 'Professional summary present', hint: 'Add a 2–3 line summary near the top.' },
      {
        ok: bullets.length === 0 || verbStart / bullets.length >= 0.5,
        label: bullets.length ? `Bullets open with action verbs (${verbStart}/${bullets.length})` : 'Experience bullets use action verbs',
        hint: 'Open most bullets with a verb: led, launched, grew, cut.',
      },
      { ok: skillsCount >= 6, label: `Skills listed (${skillsCount} found)`, hint: 'List at least 6 relevant skills.' },
      { ok: !/references available on request/i.test(lower), label: 'No filler closing line', hint: 'Remove “references available on request”.' },
    ];

    return { wording, ats, improvements };
  }, [doc, templateId]);

  return (
    <div className="space-y-5">
      <p className="rounded-[var(--pe-radius-md)] bg-[var(--pe-surface-2)] p-2.5 text-[11px] leading-relaxed text-[var(--pe-text-2)]">
        <span className="font-semibold text-[var(--pe-text)]">Smart Suggestions</span> — rule-based writing
        checks. No AI, runs 100% in your browser.
      </p>

      <section>
        <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--pe-text-2)]">
          <Lightbulb className="h-3.5 w-3.5" /> Wording
        </h4>
        {smart.wording.length === 0 ? (
          <p className="flex items-center gap-1.5 text-xs text-[var(--pe-success)]">
            <Check className="h-3.5 w-3.5" /> No weak phrasing detected.
          </p>
        ) : (
          <ul className="space-y-2">
            {smart.wording.map((w, i) => (
              <li key={i} className="rounded-[var(--pe-radius-md)] border border-[var(--pe-border)] p-2">
                <p className="text-xs font-medium text-[var(--pe-text)]">{w.label}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-[var(--pe-text-2)]">{w.suggestion}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--pe-text-2)]">
          ATS checklist
        </h4>
        <ul className="space-y-2">
          {smart.ats.map((c, i) => (
            <CheckRow key={i} ok={c.ok} label={c.label} hint={c.hint} />
          ))}
        </ul>
      </section>

      <section>
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--pe-text-2)]">
          Improvements
        </h4>
        <ul className="space-y-2">
          {smart.improvements.map((c, i) => (
            <CheckRow key={i} ok={c.ok} label={c.label} hint={c.hint} />
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function CvBuilderV2() {
  const [initialDoc] = useState<DocState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as { templateId?: string; accent?: string; doc?: DocState };
        if (s.doc && Array.isArray(s.doc.pages) && s.doc.pages.length > 0 && Array.isArray(s.doc.layers)) {
          return s.doc;
        }
      }
    } catch {
      /* corrupted draft — fall through to template */
    }
    return CV_TEMPLATES.find((t) => t.id === DEFAULT_TEMPLATE)?.build() ?? CV_TEMPLATES[1].build();
  });
  const [initialMeta] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as { templateId?: string; accent?: string };
        const t = CV_TEMPLATES.find((x) => x.id === s.templateId);
        if (t) return { templateId: t.id, accent: typeof s.accent === 'string' ? s.accent : t.accent };
      }
    } catch {
      /* ignore */
    }
    const t = CV_TEMPLATES.find((x) => x.id === DEFAULT_TEMPLATE) ?? CV_TEMPLATES[1];
    return { templateId: t.id, accent: t.accent };
  });

  const hist = useDocHistory(initialDoc);
  const { doc } = hist;

  const [templateId, setTemplateId] = useState(initialMeta.templateId);
  const [accent, setAccent] = useState(initialMeta.accent);
  const [fontScale, setFontScale] = useState(1);
  const [selection, setSelection] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.7);
  const [exporting, setExporting] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [photoVisible, setPhotoVisible] = useState(true);

  const fontScaleRef = useRef(1);
  const [hiddenMap, setHiddenMap] = useState(() => new Map<string, StashEntry>());
  const fileRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const template: CvTemplateMeta =
    CV_TEMPLATES.find((t) => t.id === templateId) ?? CV_TEMPLATES[1];

  /* Debounced autosave */
  const queueSave = (d: DocState, tid: string, acc: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ templateId: tid, accent: acc, doc: d }));
      } catch {
        /* storage full/blocked — non-fatal */
      }
    }, 800);
  };

  const sections = useMemo(
    () => docSections(doc).filter((s) => s.id !== 'sec-photo'),
    [doc],
  );
  const selectedTextLayers = useMemo(
    () => doc.layers.filter((l): l is DocTextLayer => l.type === 'text' && selection.includes(l.id)),
    [doc, selection],
  );
  const hiddenIds = useMemo(() => [...hiddenMap.keys()], [hiddenMap]);

  /* ------------------------- document actions ------------------------- */

  const switchTemplate = (t: CvTemplateMeta) => {
    if (t.id === templateId) return;
    if (!window.confirm('Switching templates rebuilds the layout — your text edits will be lost. Continue?')) return;
    setHiddenMap(new Map());
    setSelection([]);
    setEditingId(null);
    setFontScale(1);
    fontScaleRef.current = 1;
    setPhotoVisible(true);
    setTemplateId(t.id);
    setAccent(t.accent);
    hist.reset(t.build());
  };

  const onAccentChange = (next: string) => {
    if (next.toLowerCase() === accent.toLowerCase()) return;
    hist.update((d) => recolorDoc(d, accent, next), true);
    setAccent(next);
  };

  const onFontScale = (next: number) => {
    const ratio = next / fontScaleRef.current;
    fontScaleRef.current = next;
    setFontScale(next);
    if (ratio === 1) return;
    hist.update((d) => scaleFonts(d, ratio), true);
  };

  const groupRange = (d: DocState, gid: string): [number, number] | null => {
    let start = -1;
    let end = -1;
    d.layers.forEach((l, i) => {
      if (l.groupId === gid) {
        if (start === -1) start = i;
        end = i;
      }
    });
    return start === -1 ? null : [start, end];
  };

  const sectionLabel = (gid: string): string =>
    docSections(doc).find((s) => s.id === gid)?.label ??
    hiddenMap.get(gid)?.label ??
    'Section';

  const hideSection = (gid: string) => {
    const items = doc.layers.filter((l) => l.groupId === gid);
    if (!items.length) return;
    const index = doc.layers.indexOf(items[0]);
    const entry: StashEntry = { layers: structuredClone(items), index, label: sectionLabel(gid) };
    setHiddenMap((prev) => new Map(prev).set(gid, entry));
    setSelection((sel) => sel.filter((sid) => !items.some((l) => l.id === sid)));
    hist.update((d) => ({ ...d, layers: d.layers.filter((l) => l.groupId !== gid) }), true);
  };

  const showSection = (gid: string) => {
    const st = hiddenMap.get(gid);
    if (!st) return;
    setHiddenMap((prev) => {
      const next = new Map(prev);
      next.delete(gid);
      return next;
    });
    hist.update((d) => {
      const layers = [...d.layers];
      const restored: DocLayer[] = st.layers.map((l) => ({ ...l, id: newId('lyr') }));
      layers.splice(Math.min(st.index, layers.length), 0, ...restored);
      return { ...d, layers: layers };
    }, true);
  };

  const moveSection = (gid: string, dir: -1 | 1) => {
    hist.update((d) => {
      const order = docSections(d).map((s) => s.id);
      const i = order.indexOf(gid);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= order.length) return d;
      const moving = d.layers.filter((l) => l.groupId === gid);
      if (!moving.length) return d;
      const remaining = d.layers.filter((l) => l.groupId !== gid);
      const nid = order[j];
      const nIdxs = remaining.map((l, k) => (l.groupId === nid ? k : -1)).filter((k) => k >= 0);
      if (!nIdxs.length) return d;
      const at = dir === -1 ? nIdxs[0] : nIdxs[nIdxs.length - 1] + 1;
      remaining.splice(at, 0, ...moving);
      return { ...d, layers: remaining };
    }, true);
  };

  const duplicateSection = (gid: string) => {
    hist.update((d) => {
      const range = groupRange(d, gid);
      if (!range) return d;
      const [start, end] = range;
      const label = docSections(d).find((s) => s.id === gid)?.label ?? 'Section';
      let newGid = `${gid}-copy`;
      let k = 1;
      while (d.layers.some((l) => l.groupId === newGid)) {
        k += 1;
        newGid = `${gid}-copy-${k}`;
      }
      const clones: DocLayer[] = structuredClone(d.layers.slice(start, end + 1)).map((l: DocLayer) => {
        const base = { ...l, id: newId('lyr'), groupId: newGid, groupLabel: `${label} (copy)` };
        if (base.type === 'text') {
          return { ...base, blocks: base.blocks.map((b) => ({ ...b, id: newId('blk') })) };
        }
        return base;
      });
      const layers = [...d.layers];
      layers.splice(end + 1, 0, ...clones);
      return { ...d, layers: layers };
    }, true);
  };

  const deleteSection = (gid: string) => {
    if (!window.confirm(`Delete the “${sectionLabel(gid)}” section? You can still undo this.`)) return;
    setHiddenMap((prev) => {
      const next = new Map(prev);
      next.delete(gid);
      return next;
    });
    setSelection((sel) => sel.filter((sid) => !doc.layers.some((l) => l.id === sid && l.groupId === gid)));
    hist.update((d) => ({ ...d, layers: d.layers.filter((l) => l.groupId !== gid) }), true);
  };

  const addSection = (label: string) => {
    hist.update((d) => {
      const pageLayers = d.layers.filter((l) => l.pageIndex === 0);
      const bottom = pageLayers.reduce((m, l) => Math.max(m, l.y + l.h), 0.1);
      const y = Math.min(bottom + 0.03, 0.88);
      let gid = `sec-${label.toLowerCase()}`;
      let n = 1;
      while (d.layers.some((l) => l.groupId === gid)) {
        n += 1;
        gid = `sec-${label.toLowerCase()}-${n}`;
      }
      const head = makeTextLayer({
        groupId: gid, groupLabel: label, x: 0.07, y, w: 0.86, h: 0.025,
        blocks: [block('h3', [run(label.toUpperCase(), { bold: true, color: accent, fontSize: 12.5 / 841.89 })])],
        fontSize: 0.0125, color: '#1c1a16', accent: true,
      });
      const body = makeTextLayer({
        groupId: gid, groupLabel: label, x: 0.07, y: y + 0.032, w: 0.86, h: 0.05,
        blocks: [block('paragraph', `Add your ${label.toLowerCase()} here — double-click the text to edit.`)],
        fontSize: 0.012, color: '#1c1a16',
      });
      return { ...d, layers: [...d.layers, head, body] };
    }, true);
    setShowAddSection(false);
  };

  /* ------------------------------ elements ------------------------------ */

  const addElement = (kind: ElementKind) => {
    if (kind === 'image') {
      fileRef.current?.click();
      return;
    }
    let layer: DocLayer | null = null;
    const cx = 0.5;
    if (kind === 'heading') {
      layer = makeTextLayer({ x: cx - 0.3, y: 0.4, w: 0.6, h: 0.05, blocks: [block('h2', 'New heading')], fontSize: 0.02, color: accent });
    } else if (kind === 'paragraph') {
      layer = makeTextLayer({ x: cx - 0.35, y: 0.4, w: 0.7, h: 0.08, blocks: [block('paragraph', 'Double-click to edit this text.')], fontSize: 0.015 });
    } else if (kind === 'bullets') {
      layer = makeTextLayer({ x: cx - 0.35, y: 0.4, w: 0.7, h: 0.09, blocks: [block('bullet', 'First point'), block('bullet', 'Second point')], fontSize: 0.015 });
    } else if (kind === 'rect' || kind === 'ellipse') {
      layer = makeShapeLayer({ x: cx - 0.2, y: 0.4, w: 0.4, h: 0.12, kind, fill: accent, stroke: accent, accent: true });
    } else if (kind === 'line' || kind === 'divider') {
      layer = makeDividerLayer({ x: cx - 0.35, y: 0.5, w: 0.7, h: 0.004, color: accent, accent: true });
    }
    if (layer) {
      const lid = layer.id;
      hist.update((d) => ({ ...d, layers: [...d.layers, layer as DocLayer] }), true);
      setSelection([lid]);
    }
  };

  const onPhotoFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const img = new Image();
      img.onload = () => {
        const w = 0.22;
        const layer = makeImageLayer({
          dataUrl, pageIndex: 0,
          x: 0.39, y: 0.05, w, h: w / (img.naturalWidth / img.naturalHeight) / 1.414,
          groupId: 'sec-photo', groupLabel: 'Photo',
        });
        hist.update((d) => ({ ...d, layers: [...d.layers, layer] }), true);
        setSelection([layer.id]);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const togglePhoto = (show: boolean) => {
    setPhotoVisible(show);
    hist.update((d) => ({
      ...d,
      layers: d.layers.map((l) => (l.groupId === 'sec-photo' ? { ...l, opacity: show ? 1 : 0 } : l)),
    }), true);
  };

  /* -------------------------------- export ------------------------------- */

  const doExport = async () => {
    setExporting(true);
    try {
      const name = firstH1(doc).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'cv';
      await exportDocPdf(doc, `${name}-cv`);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'PDF export failed.');
    } finally {
      setExporting(false);
    }
  };

  const onPatchLayers = (fn: (l: DocTextLayer) => DocTextLayer) => {
    const ids = new Set(selection);
    hist.update((d) => ({
      ...d,
      layers: d.layers.map((l) => (l.type === 'text' && ids.has(l.id) ? fn(l) : l)),
    }), true);
  };

  /* -------------------------------- render ------------------------------- */

  const topBar = (
    <div className="flex h-14 items-center gap-2 border-b border-[var(--pe-border)] bg-[var(--pe-surface)] px-3">
      <Link
        href="/cv-builder"
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-[var(--pe-text-2)] hover:bg-[var(--pe-surface-2)] hover:text-[var(--pe-text)]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">CV Builder</span>
      </Link>
      <div className="hidden h-5 w-px bg-[var(--pe-border)] sm:block" />
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm font-semibold text-[var(--pe-text)]">{template.label}</span>
        <span className="rounded-full bg-[var(--pe-accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--pe-accent)]">
          V2 Preview
        </span>
      </div>
      <div className="flex-1" />
      <button onClick={hist.undo} disabled={!hist.canUndo} title="Undo"
        className="rounded-md p-2 text-[var(--pe-text-2)] hover:bg-[var(--pe-surface-2)] disabled:opacity-40">
        <Undo2 className="h-4 w-4" />
      </button>
      <button onClick={hist.redo} disabled={!hist.canRedo} title="Redo"
        className="rounded-md p-2 text-[var(--pe-text-2)] hover:bg-[var(--pe-surface-2)] disabled:opacity-40">
        <Redo2 className="h-4 w-4" />
      </button>
      <div className="hidden h-5 w-px bg-[var(--pe-border)] sm:block" />
      <div className="hidden items-center gap-1 sm:flex">
        <button onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))} title="Zoom out"
          className="rounded-md p-2 text-[var(--pe-text-2)] hover:bg-[var(--pe-surface-2)]">
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="w-12 text-center text-xs tabular-nums text-[var(--pe-text-2)]">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))} title="Zoom in"
          className="rounded-md p-2 text-[var(--pe-text-2)] hover:bg-[var(--pe-surface-2)]">
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>
      <button onClick={doExport} disabled={exporting}
        className="flex items-center gap-1.5 rounded-md bg-[var(--pe-accent)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--pe-accent-hover)] disabled:opacity-60">
        <Download className="h-4 w-4" />
        {exporting ? 'Exporting…' : 'Export PDF'}
      </button>
    </div>
  );

  const templatesTab = (
    <div className="grid gap-2 p-3">
      {CV_TEMPLATES.map((t) => (
        <button
          key={t.id}
          onClick={() => switchTemplate(t)}
          className={`rounded-lg border p-3 text-left transition ${
            t.id === templateId
              ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)]'
              : 'border-[var(--pe-border)] bg-[var(--pe-surface)] hover:border-[var(--pe-border-strong)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: t.accent }} />
            <p className="text-xs font-semibold text-[var(--pe-text)]">{t.label}</p>
            {t.id === templateId && <Check className="ml-auto h-4 w-4 shrink-0 text-[var(--pe-accent)]" />}
          </div>
          <p className="mt-1 text-[11px] leading-snug text-[var(--pe-text-3)]">{t.description}</p>
        </button>
      ))}
    </div>
  );

  const sectionsTab = (
    <div className="p-3">
      {sections.length === 0 && hiddenIds.length === 0 && (
        <p className="text-xs text-[var(--pe-text-3)]">No sections yet.</p>
      )}
      <ul className="space-y-1.5">
        {sections.map((s, i) => (
          <li key={s.id} className="flex items-center gap-0.5 rounded-lg border border-[var(--pe-border)] bg-[var(--pe-surface)] px-2 py-1.5">
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-[var(--pe-text)]">{s.label}</span>
            <button onClick={() => moveSection(s.id, -1)} disabled={i === 0} title="Move up"
              className="rounded p-1 text-[var(--pe-text-3)] hover:bg-[var(--pe-surface-2)] disabled:opacity-30">
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => moveSection(s.id, 1)} disabled={i === sections.length - 1} title="Move down"
              className="rounded p-1 text-[var(--pe-text-3)] hover:bg-[var(--pe-surface-2)] disabled:opacity-30">
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => duplicateSection(s.id)} title="Duplicate section"
              className="rounded p-1 text-[var(--pe-text-3)] hover:bg-[var(--pe-surface-2)]">
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => hideSection(s.id)} title="Hide section"
              className="rounded p-1 text-[var(--pe-text-3)] hover:bg-[var(--pe-surface-2)]">
              <EyeOff className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => deleteSection(s.id)} title="Delete section"
              className="rounded p-1 text-[var(--pe-text-3)] hover:bg-[var(--pe-danger-soft)] hover:text-[var(--pe-danger)]">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
        {hiddenIds.map((id) => (
          <li key={`hidden-${id}`} className="flex items-center gap-2 rounded-lg border border-dashed border-[var(--pe-border)] px-2 py-1.5">
            <span className="min-w-0 flex-1 truncate text-xs text-[var(--pe-text-3)]">
              {sectionLabel(id)} (hidden)
            </span>
            <button onClick={() => showSection(id)} title="Show section"
              className="rounded p-1 text-[var(--pe-text-3)] hover:bg-[var(--pe-surface-2)]">
              <Eye className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3">
        <button
          onClick={() => setShowAddSection((v) => !v)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--pe-border-strong)] px-3 py-2 text-xs font-medium text-[var(--pe-text-2)] hover:border-[var(--pe-accent)] hover:text-[var(--pe-accent)]"
        >
          <Plus className="h-4 w-4" /> Add section
        </button>
        {showAddSection && (
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {SECTION_TYPES.map((label) => (
              <button
                key={label}
                onClick={() => addSection(label)}
                className="rounded-md border border-[var(--pe-border)] bg-[var(--pe-surface)] px-2 py-1.5 text-xs text-[var(--pe-text)] hover:border-[var(--pe-accent)]"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const elementsTab = (
    <div className="p-3">
      <ElementsPanel onAdd={addElement} />
      <button
        onClick={() => fileRef.current?.click()}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--pe-border-strong)] px-3 py-2.5 text-xs font-medium text-[var(--pe-text-2)] hover:border-[var(--pe-accent)] hover:text-[var(--pe-accent)]"
      >
        <ImagePlus className="h-4 w-4" />
        Upload photo
      </button>
      <p className="mt-2 text-[11px] leading-snug text-[var(--pe-text-3)]">
        Tip: double-click any text on the page to edit it in place. Photos stay on your device — nothing is uploaded.
      </p>
    </div>
  );

  const center = (
    <div className="flex h-full flex-col">
      {selectedTextLayers.length > 0 && (
        <div className="border-b border-[var(--pe-border)] bg-[var(--pe-surface)] px-3 py-1.5">
          <FormatToolbar
            textLayers={selectedTextLayers}
            onPatchLayers={(fn) => {
              onPatchLayers(fn);
              queueSave(doc, templateId, accent);
            }}
            editing={editingId !== null}
            compact
          />
        </div>
      )}
      <div className="min-h-0 flex-1">
        <DocCanvas
          doc={doc}
          onDocChange={(d, push) => {
            hist.update(() => d, push);
            if (push) queueSave(d, templateId, accent);
          }}
          selection={selection}
          onSelectionChange={setSelection}
          zoom={zoom}
          editingId={editingId}
          onEditingChange={(id) => {
            setEditingId(id);
            if (id === null) queueSave(doc, templateId, accent);
          }}
        />
      </div>
    </div>
  );

  const right = (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 p-4">
        <section>
          <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--pe-text-2)]">
            <Palette className="h-3.5 w-3.5" /> Design
          </h3>
          <p className="mb-1.5 text-[11px] font-medium text-[var(--pe-text-2)]">Accent color</p>
          <div className="flex flex-wrap gap-1.5">
            {ACCENT_SWATCHES.map((c) => (
              <button
                key={c}
                onClick={() => onAccentChange(c)}
                title={c}
                aria-label={`Accent ${c}`}
                className={`h-7 w-7 rounded-full border-2 transition ${
                  accent.toLowerCase() === c.toLowerCase()
                    ? 'scale-110 border-[var(--pe-text)]'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-[var(--pe-text-3)]">Recolors every element tagged with the template accent.</p>
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-[11px] font-medium text-[var(--pe-text-2)]">Font size</p>
              <span className="text-[11px] tabular-nums text-[var(--pe-text-3)]">{Math.round(fontScale * 100)}%</span>
            </div>
            <input
              type="range" min={0.9} max={1.15} step={0.01} value={fontScale}
              onChange={(e) => onFontScale(Number(e.target.value))}
              className="w-full accent-[var(--pe-accent)]"
              aria-label="Font size scale"
            />
          </div>
          <label className="mt-3 flex cursor-pointer items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--pe-text-2)]">Show photo</span>
            <button
              role="switch"
              aria-checked={photoVisible}
              aria-label="Show photo"
              onClick={() => togglePhoto(!photoVisible)}
              className={`relative h-5 w-9 rounded-full transition ${photoVisible ? 'bg-[var(--pe-accent)]' : 'bg-[var(--pe-surface-3)]'}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${photoVisible ? 'left-[18px]' : 'left-0.5'}`} />
            </button>
          </label>
        </section>

        <div className="h-px bg-[var(--pe-divider)]" />

        <section>
          <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--pe-text-2)]">
            <Lightbulb className="h-3.5 w-3.5" /> Smart Suggestions
          </h3>
          <SmartSuggestions doc={doc} templateId={templateId} />
        </section>
      </div>
    </div>
  );

  return (
    <div className="h-full">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (f) onPhotoFile(f);
        }}
      />
      <DocShell
        topBar={topBar}
        tabs={[
          { id: 'templates', label: 'Templates', icon: <LayoutTemplate className="h-4 w-4" />, content: templatesTab },
          { id: 'sections', label: 'Sections', icon: <ListOrdered className="h-4 w-4" />, content: sectionsTab },
          { id: 'elements', label: 'Elements', icon: <Shapes className="h-4 w-4" />, content: elementsTab },
        ]}
        center={center}
        right={right}
        rightTitle="Design & insights"
      />
    </div>
  );
}
