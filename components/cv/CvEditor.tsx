'use client';

/**
 * PDFEdit CV Builder — editor shell (lazy-loaded).
 *
 * Three-pane Studio-like layout:
 *   LEFT:   Templates / Sections / Design tabs
 *   CENTER: live A4 preview canvas
 *   RIGHT:  properties panel (personal info, selected section/item)
 *
 * State: single CvDocument, autosaved to localStorage (no account needed).
 * Export: pdf-lib via lib/cv/exportCvPdf (selectable text, A4, multi-page).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown, ArrowUp, Copy, Download, Eye, FileText, Layers, Loader2,
  Palette, Plus, Sparkles, Trash2, User, Wand2,
} from 'lucide-react';
import type { CvDocument, CvSection, CvSectionType } from '@/lib/cv/types';
import { blankDocument, blankSection, newId, SECTION_LABELS } from '@/lib/cv/types';
import { CV_TEMPLATES, CV_TEMPLATE_CATEGORIES, getTemplate } from '@/lib/cv/templates';
import { sampleDocument } from '@/lib/cv/sampleData';
import { exportCvPdf } from '@/lib/cv/exportCvPdf';
import { CvPreview } from './CvPreview';
import { suggestSkills, suggestSummary } from '@/lib/cv/smart';

const DRAFT_KEY = 'pdfedit_cv_draft_v1';

function loadDraft(): CvDocument | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const doc = JSON.parse(raw) as CvDocument;
    if (doc.version !== 1 || !doc.personal || !Array.isArray(doc.sections)) return null;
    return doc;
  } catch {
    return null;
  }
}

type LeftTab = 'templates' | 'sections' | 'design';
type MobileTab = 'edit' | 'preview';

export function CvEditor({ initialTemplate }: { initialTemplate?: string }) {
  const [cv, setCv] = useState<CvDocument>(() => {
    const draft = typeof window !== 'undefined' ? loadDraft() : null;
    if (draft) return draft;
    const doc = sampleDocument();
    if (initialTemplate) doc.design.templateId = initialTemplate;
    return doc;
  });
  const [leftTab, setLeftTab] = useState<LeftTab>('sections');
  const [mobileTab, setMobileTab] = useState<MobileTab>('preview');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [summaryIdeas, setSummaryIdeas] = useState<string[] | null>(null);
  const [skillIdeas, setSkillIdeas] = useState<string[] | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // autosave (debounced)
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...cv, updatedAt: new Date().toISOString() }));
      } catch { /* storage full — non-fatal */ }
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [cv]);

  const patch = useCallback((fn: (d: CvDocument) => CvDocument) => {
    setCv((prev) => fn(structuredClone(prev)));
  }, []);

  const patchPersonal = useCallback((p: Partial<CvDocument['personal']>) => {
    patch((d) => { Object.assign(d.personal, p); return d; });
  }, [patch]);

  const selectedSection: CvSection | null = useMemo(
    () => cv.sections.find((s) => s.id === selectedSectionId) ?? null,
    [cv.sections, selectedSectionId]
  );

  const patchSection = useCallback((id: string, p: Partial<CvSection>) => {
    patch((d) => {
      const s = d.sections.find((x) => x.id === id);
      if (s) Object.assign(s, p);
      return d;
    });
  }, [patch]);

  const addSection = useCallback((type: CvSectionType) => {
    const s = blankSection(type);
    patch((d) => { d.sections.push(s); return d; });
    setSelectedSectionId(s.id);
  }, [patch]);

  const removeSection = useCallback((id: string) => {
    patch((d) => { d.sections = d.sections.filter((s) => s.id !== id); return d; });
    setSelectedSectionId((cur) => (cur === id ? null : cur));
  }, [patch]);

  const moveSection = useCallback((id: string, dir: -1 | 1) => {
    patch((d) => {
      const i = d.sections.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= d.sections.length) return d;
      const [s] = d.sections.splice(i, 1);
      d.sections.splice(j, 0, s);
      return d;
    });
  }, [patch]);

  const duplicateSection = useCallback((id: string) => {
    patch((d) => {
      const i = d.sections.findIndex((s) => s.id === id);
      if (i < 0) return d;
      const copy = structuredClone(d.sections[i]);
      copy.id = newId('sec');
      copy.items = copy.items.map((it) => ({ ...it, id: newId('it') }));
      d.sections.splice(i + 1, 0, copy);
      return d;
    });
  }, [patch]);

  const handlePhoto = useCallback((file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      // downscale to max 512px to keep the PDF light
      const img = new Image();
      img.onload = () => {
        const max = 512;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
        patchPersonal({ photoDataUrl: canvas.toDataURL('image/jpeg', 0.85) });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, [patchPersonal]);

  const doExport = useCallback(async () => {
    setExporting(true);
    setStatus('Building your PDF…');
    try {
      const res = await exportCvPdf(cv, setStatus);
      const blob = new Blob([new Uint8Array(res.bytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setStatus(`Done — ${res.pageCount} page${res.pageCount > 1 ? 's' : ''} downloaded.`);
    } catch (err) {
      console.error(err);
      setStatus('Export failed — please try again.');
    } finally {
      setExporting(false);
      setTimeout(() => setStatus(null), 5000);
    }
  }, [cv]);

  const applyTemplate = useCallback((id: string) => {
    const tpl = getTemplate(id);
    patch((d) => {
      d.design.templateId = id;
      d.design.accentColor = tpl.accent;
      d.design.showPhoto = tpl.showPhotoDefault || !!d.personal.photoDataUrl;
      return d;
    });
    setStatus(`Template: ${tpl.name}`);
    setTimeout(() => setStatus(null), 2500);
  }, [patch]);

  const tpl = getTemplate(cv.design.templateId);
  const inputCls =
    'h-9 w-full rounded-lg border border-[var(--pe-border-strong)] bg-[var(--pe-bg)] px-2.5 text-sm text-[var(--pe-text)] outline-none focus:border-[var(--pe-focus)]';
  const labelCls = 'mb-1 block text-xs font-medium text-[var(--pe-text-2)]';

  return (
    <div className="pe-preview flex h-[calc(100dvh-64px)] min-h-[560px] flex-col overflow-hidden bg-[var(--pe-bg)] text-[var(--pe-text)]">
      {/* top bar */}
      <div className="flex items-center gap-2 border-b border-[var(--pe-border)] bg-[var(--pe-elevated)] px-3 py-2">
        <div className="flex items-center gap-2 font-semibold">
          <FileText size={18} className="text-[var(--pe-accent)]" />
          <span className="hidden sm:inline">Resume Studio</span>
        </div>
        <div className="ml-2 hidden items-center gap-1 rounded-full bg-[var(--pe-surface-2)] px-2.5 py-1 text-xs text-[var(--pe-text-2)] md:flex">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Draft autosaved in this browser
        </div>
        <div className="flex-1" />
        <button
          onClick={() => { if (confirm('Start over with a blank CV? Your draft will be replaced.')) { setCv(blankDocument()); setSelectedSectionId(null); } }}
          className="rounded-lg px-3 py-2 text-sm text-[var(--pe-text-2)] hover:bg-[var(--pe-surface-3)] hover:text-[var(--pe-text)]"
        >
          New
        </button>
        <button
          onClick={doExport}
          disabled={exporting}
          className="flex items-center gap-2 rounded-xl bg-[var(--pe-accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-60"
        >
          {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Download PDF
        </button>
      </div>

      {status ? (
        <div className="border-b border-[var(--pe-border)] bg-[var(--pe-accent-soft)] px-4 py-1.5 text-center text-xs font-medium text-[var(--pe-accent)]">
          {status}
        </div>
      ) : null}

      {/* mobile tab switch */}
      <div className="flex gap-1 border-b border-[var(--pe-border)] bg-[var(--pe-elevated)] p-1.5 md:hidden">
        {(['edit', 'preview'] as MobileTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setMobileTab(t)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium ${mobileTab === t ? 'bg-[var(--pe-accent-soft)] text-[var(--pe-accent)]' : 'text-[var(--pe-text-2)]'}`}
          >
            {t === 'edit' ? <Layers size={15} /> : <Eye size={15} />}
            {t === 'edit' ? 'Edit' : 'Preview'}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        {/* LEFT */}
        <div className={`${mobileTab === 'edit' ? 'flex' : 'hidden'} w-72 shrink-0 flex-col border-r border-[var(--pe-border)] bg-[var(--pe-elevated)] md:flex`}>
          <div className="flex gap-1 border-b border-[var(--pe-border)] p-1.5">
            {([['templates', 'Templates', Palette], ['sections', 'Sections', Layers], ['design', 'Design', Wand2]] as Array<[LeftTab, string, typeof Palette]>).map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setLeftTab(id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium ${leftTab === id ? 'bg-[var(--pe-accent-soft)] text-[var(--pe-accent)]' : 'text-[var(--pe-text-2)] hover:bg-[var(--pe-surface-3)]'}`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {leftTab === 'templates' ? (
              <div className="space-y-4">
                {CV_TEMPLATE_CATEGORIES.map((cat) => {
                  const list = CV_TEMPLATES.filter((t) => t.category === cat.id);
                  if (!list.length) return null;
                  return (
                    <div key={cat.id}>
                      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pe-text-3)]">{cat.label}</div>
                      <div className="grid grid-cols-2 gap-2">
                        {list.map((t) => {
                          const isActive = cv.design.templateId === t.id;
                          return (
                            <button
                              key={t.id}
                              onClick={() => applyTemplate(t.id)}
                              className={`rounded-xl border p-2 text-left transition ${isActive ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)] ring-1 ring-[var(--pe-accent)]' : 'border-[var(--pe-border)] hover:border-[var(--pe-border-strong)]'}`}
                            >
                              {/* Mini visual thumbnail */}
                              <div
                                className="mb-2 h-20 overflow-hidden rounded-lg border border-[var(--pe-border)] bg-white"
                                aria-hidden="true"
                              >
                                {t.layout === 'sidebar' ? (
                                  <div className="flex h-full">
                                    <div className="flex flex-col items-center pt-1.5" style={{ width: '34%', background: t.sidebarBg }}>
                                      <div className="h-4 w-4 rounded-full bg-white/30" />
                                      <div className="mt-1 h-1 w-8 rounded" style={{ background: t.sidebarText, opacity: 0.7 }} />
                                      <div className="mt-1 h-1 w-6 rounded" style={{ background: t.sidebarText, opacity: 0.4 }} />
                                    </div>
                                    <div className="flex-1 p-1.5">
                                      <div className="h-1.5 w-3/4 rounded" style={{ background: t.headingColor }} />
                                      <div className="mt-1 h-1 w-1/2 rounded" style={{ background: t.mutedColor, opacity: 0.6 }} />
                                      <div className="mt-2 h-1 w-full rounded" style={{ background: t.accent, opacity: 0.8 }} />
                                      <div className="mt-1 h-1 w-full rounded bg-gray-200" />
                                      <div className="mt-1 h-1 w-5/6 rounded bg-gray-200" />
                                    </div>
                                  </div>
                                ) : t.header === 'band' ? (
                                  <div className="h-full">
                                    <div className="flex h-8 items-center justify-center" style={{ background: t.headerBg }}>
                                      <div className="h-1.5 w-1/2 rounded bg-white/90" />
                                    </div>
                                    <div className="p-1.5">
                                      <div className="h-1 w-1/3 rounded" style={{ background: t.accent }} />
                                      <div className="mt-1 h-1 w-full rounded bg-gray-200" />
                                      <div className="mt-1 h-1 w-5/6 rounded bg-gray-200" />
                                    </div>
                                  </div>
                                ) : t.header === 'monogram' ? (
                                  <div className="h-full p-1.5">
                                    <div className="text-[14px] font-extrabold leading-none" style={{ color: t.accent }}>JD</div>
                                    <div className="mt-1 h-1.5 w-2/3 rounded" style={{ background: t.headingColor }} />
                                    <div className="mt-1 h-1 w-1/2 rounded" style={{ background: t.mutedColor, opacity: 0.6 }} />
                                    <div className="mt-1.5 h-0.5 w-full rounded" style={{ background: t.accent }} />
                                    <div className="mt-1 h-1 w-full rounded bg-gray-200" />
                                  </div>
                                ) : (
                                  <div className="h-full p-1.5" style={{ textAlign: t.header === 'centered' ? 'center' : 'left' }}>
                                    <div className={`h-1.5 rounded ${t.header === 'centered' ? 'mx-auto' : ''}`} style={{ width: '60%', background: t.headingColor }} />
                                    <div className={`mt-1 h-1 rounded ${t.header === 'centered' ? 'mx-auto' : ''}`} style={{ width: '40%', background: t.mutedColor, opacity: 0.6 }} />
                                    <div className="mt-2 h-1 w-1/3 rounded" style={{ background: t.accent }} />
                                    <div className="mt-1 h-1 w-full rounded bg-gray-200" />
                                    <div className="mt-1 h-1 w-5/6 rounded bg-gray-200" />
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center justify-between gap-1">
                                <div className="truncate text-xs font-semibold">{t.name}</div>
                                {t.atsSafe ? <span className="shrink-0 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600">ATS</span> : null}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {leftTab === 'sections' ? (
              <div className="space-y-1.5">
                {cv.sections.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSectionId(s.id)}
                    className={`group flex cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-2 ${selectedSectionId === s.id ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)]' : 'border-[var(--pe-border)] hover:border-[var(--pe-border-strong)]'}`}
                  >
                    <input
                      type="checkbox"
                      checked={s.visible}
                      onChange={(e) => { e.stopPropagation(); patchSection(s.id, { visible: e.target.checked }); }}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 accent-[var(--pe-accent)]"
                      aria-label={`Show ${s.title}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{s.title}</div>
                      <div className="text-[11px] text-[var(--pe-text-3)]">{SECTION_LABELS[s.type]}</div>
                    </div>
                    <button title="Move up" onClick={(e) => { e.stopPropagation(); moveSection(s.id, -1); }} className="rounded p-1 text-[var(--pe-text-3)] hover:bg-[var(--pe-surface-3)] hover:text-[var(--pe-text)]"><ArrowUp size={13} /></button>
                    <button title="Move down" onClick={(e) => { e.stopPropagation(); moveSection(s.id, 1); }} className="rounded p-1 text-[var(--pe-text-3)] hover:bg-[var(--pe-surface-3)] hover:text-[var(--pe-text)]"><ArrowDown size={13} /></button>
                    <button title="Duplicate" onClick={(e) => { e.stopPropagation(); duplicateSection(s.id); }} className="rounded p-1 text-[var(--pe-text-3)] hover:bg-[var(--pe-surface-3)] hover:text-[var(--pe-text)]"><Copy size={13} /></button>
                    <button title="Remove" onClick={(e) => { e.stopPropagation(); removeSection(s.id); }} className="rounded p-1 text-[var(--pe-text-3)] hover:text-[var(--pe-danger)]"><Trash2 size={13} /></button>
                  </div>
                ))}
                <div className="pt-2">
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pe-text-3)]">Add section</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(SECTION_LABELS) as CvSectionType[]).filter((t) => !cv.sections.some((s) => s.type === t && t !== 'custom')).map((t) => (
                      <button
                        key={t}
                        onClick={() => addSection(t)}
                        className="flex items-center gap-1 rounded-full border border-[var(--pe-border)] px-2.5 py-1.5 text-xs hover:border-[var(--pe-accent)] hover:text-[var(--pe-accent)]"
                      >
                        <Plus size={12} /> {SECTION_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {leftTab === 'design' ? (
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Accent color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={cv.design.accentColor}
                      onChange={(e) => patch((d) => { d.design.accentColor = e.target.value; return d; })}
                      className="h-9 w-12 cursor-pointer rounded-lg border border-[var(--pe-border-strong)] bg-[var(--pe-bg)]"
                      aria-label="Accent color"
                    />
                    <span className="text-xs text-[var(--pe-text-2)]">{cv.design.accentColor}</span>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Text size</label>
                  <input
                    type="range" min={0.9} max={1.12} step={0.02}
                    value={cv.design.fontScale}
                    onChange={(e) => patch((d) => { d.design.fontScale = Number(e.target.value); return d; })}
                    className="w-full accent-[var(--pe-accent)]"
                  />
                </div>
                <div>
                  <label className={labelCls}>Line spacing</label>
                  <input
                    type="range" min={1} max={1.6} step={0.05}
                    value={cv.design.lineSpacing}
                    onChange={(e) => patch((d) => { d.design.lineSpacing = Number(e.target.value); return d; })}
                    className="w-full accent-[var(--pe-accent)]"
                  />
                </div>
                <div>
                  <label className={labelCls}>Page margins</label>
                  <input
                    type="range" min={32} max={64} step={2}
                    value={cv.design.marginPt}
                    onChange={(e) => patch((d) => { d.design.marginPt = Number(e.target.value); return d; })}
                    className="w-full accent-[var(--pe-accent)]"
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={cv.design.showPhoto}
                    onChange={(e) => patch((d) => { d.design.showPhoto = e.target.checked; return d; })}
                    className="h-4 w-4 accent-[var(--pe-accent)]"
                  />
                  Show profile photo
                </label>
                {tpl.atsSafe ? (
                  <p className="rounded-lg bg-emerald-500/10 p-2.5 text-xs text-emerald-700 dark:text-emerald-400">
                    ATS-safe template: standard fonts, no graphics — built to parse cleanly in applicant tracking systems.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {/* CENTER preview */}
        <div className={`${mobileTab === 'preview' ? 'flex' : 'hidden'} min-w-0 flex-1 flex-col overflow-y-auto bg-[var(--pe-bg)] md:flex`}>
          <div className="flex justify-center p-4 sm:p-8">
            <div className="origin-top" style={{ transform: 'scale(0.62)' }}>
              <CvPreview cv={cv} />
            </div>
          </div>
        </div>

        {/* RIGHT properties */}
        <div className={`${mobileTab === 'edit' ? 'flex' : 'hidden'} w-80 shrink-0 flex-col border-l border-[var(--pe-border)] bg-[var(--pe-elevated)] md:flex`}>
          <div className="border-b border-[var(--pe-border)] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--pe-text-3)]">
            {selectedSection ? selectedSection.title : 'Personal information'}
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
            {!selectedSection ? (
              <>
                <div>
                  <label className={labelCls}>Photo</label>
                  <div className="flex items-center gap-2">
                    {cv.personal.photoDataUrl ? (
                      <img src={cv.personal.photoDataUrl} alt="Profile" className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--pe-surface-3)] text-[var(--pe-text-3)]">
                        <User size={20} />
                      </div>
                    )}
                    <label className="cursor-pointer rounded-lg border border-[var(--pe-border-strong)] px-3 py-2 text-xs font-medium hover:border-[var(--pe-accent)] hover:text-[var(--pe-accent)]">
                      Upload photo
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhoto(e.target.files?.[0])} />
                    </label>
                    {cv.personal.photoDataUrl ? (
                      <button onClick={() => patchPersonal({ photoDataUrl: null })} className="rounded-lg px-2 py-2 text-xs text-[var(--pe-danger)] hover:bg-[var(--pe-danger-soft)]">
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
                {([['fullName', 'Full name'], ['title', 'Professional title'], ['email', 'Email'], ['phone', 'Phone'], ['location', 'Location'], ['website', 'Website'], ['linkedin', 'LinkedIn']] as Array<[keyof CvDocument['personal'], string]>).map(([k, label]) => (
                  <div key={k}>
                    <label className={labelCls}>{label}</label>
                    <input value={String(cv.personal[k] ?? '')} onChange={(e) => patchPersonal({ [k]: e.target.value } as Partial<CvDocument['personal']>)} className={inputCls} />
                  </div>
                ))}
              </>
            ) : (
              <SectionEditor
                section={selectedSection}
                onPatch={(p) => patchSection(selectedSection.id, p)}
                inputCls={inputCls}
                labelCls={labelCls}
                onSuggestSummary={() => setSummaryIdeas(suggestSummary(cv.personal.title))}
                summaryIdeas={summaryIdeas}
                onUseSummary={(t) => { patchSection(selectedSection.id, { body: t }); setSummaryIdeas(null); }}
                onSuggestSkills={() => setSkillIdeas(suggestSkills(cv.personal.title))}
                skillIdeas={skillIdeas}
                onUseSkills={(names) => {
                  patch((d) => {
                    const s = d.sections.find((x) => x.id === selectedSection.id);
                    if (s) {
                      const existing = new Set(s.items.map((i) => ((i as { name?: string }).name ?? '').toLowerCase()));
                      for (const n of names) {
                        if (!existing.has(n.toLowerCase())) s.items.push({ id: newId('sk'), name: n, level: '' });
                      }
                    }
                    return d;
                  });
                  setSkillIdeas(null);
                }}
                onAddItem={(item) => patch((d) => { const s = d.sections.find((x) => x.id === selectedSection.id); if (s) s.items.push(item); return d; })}
                onPatchItem={(itemId, p) => patch((d) => {
                  const s = d.sections.find((x) => x.id === selectedSection.id);
                  const it = s?.items.find((i) => i.id === itemId);
                  if (it) Object.assign(it, p);
                  return d;
                })}
                onRemoveItem={(itemId) => patch((d) => {
                  const s = d.sections.find((x) => x.id === selectedSection.id);
                  if (s) s.items = s.items.filter((i) => i.id !== itemId);
                  return d;
                })}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- section item editors ------------------------- */

function SectionEditor(props: {
  section: CvSection;
  onPatch: (p: Partial<CvSection>) => void;
  inputCls: string;
  labelCls: string;
  onSuggestSummary: () => void;
  summaryIdeas: string[] | null;
  onUseSummary: (t: string) => void;
  onSuggestSkills: () => void;
  skillIdeas: string[] | null;
  onUseSkills: (names: string[]) => void;
  onAddItem: (item: CvSection['items'][number]) => void;
  onPatchItem: (itemId: string, p: Record<string, unknown>) => void;
  onRemoveItem: (itemId: string) => void;
}) {
  const { section, onPatch, inputCls, labelCls } = props;
  return (
    <div className="space-y-3">
      <div>
        <label className={labelCls}>Section title</label>
        <input value={section.title} onChange={(e) => onPatch({ title: e.target.value })} className={inputCls} />
      </div>

      {section.type === 'summary' ? (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className={labelCls}>Summary</label>
            <button onClick={props.onSuggestSummary} className="flex items-center gap-1 rounded-full bg-[var(--pe-accent-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--pe-accent)] hover:brightness-95">
              <Sparkles size={12} /> Suggest wording
            </button>
          </div>
          <textarea value={section.body} onChange={(e) => onPatch({ body: e.target.value })} rows={6} className={`${inputCls} h-auto py-2`} />
          {props.summaryIdeas ? (
            <div className="mt-2 space-y-1.5 rounded-xl border border-[var(--pe-border)] bg-[var(--pe-surface)] p-2">
              <div className="text-[11px] font-medium text-[var(--pe-text-3)]">Suggestions — tap to use (edit freely afterwards)</div>
              {props.summaryIdeas.map((t, i) => (
                <button key={i} onClick={() => props.onUseSummary(t)} className="w-full rounded-lg p-2 text-left text-xs hover:bg-[var(--pe-surface-3)]">
                  {t}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {section.type === 'experience' ? (
        <ItemList
          section={section}
          inputCls={inputCls} labelCls={labelCls}
          onAdd={() => props.onAddItem({ id: newId('exp'), role: '', company: '', location: '', startDate: '', endDate: '', current: false, bullets: [''] })}
          onPatchItem={props.onPatchItem} onRemoveItem={props.onRemoveItem}
          render={(it, p) => {
            const e = it as { role: string; company: string; location: string; startDate: string; endDate: string; current: boolean; bullets: string[] };
            return (
              <div className="space-y-2">
                <input placeholder="Job title" value={e.role} onChange={(ev) => p({ role: ev.target.value })} className={inputCls} />
                <input placeholder="Company" value={e.company} onChange={(ev) => p({ company: ev.target.value })} className={inputCls} />
                <div className="flex gap-2">
                  <input placeholder="Start (e.g. Jan 2023)" value={e.startDate} onChange={(ev) => p({ startDate: ev.target.value })} className={inputCls} />
                  <input placeholder="End" value={e.endDate} onChange={(ev) => p({ endDate: ev.target.value })} className={inputCls} disabled={e.current} />
                </div>
                <label className="flex items-center gap-2 text-xs text-[var(--pe-text-2)]">
                  <input type="checkbox" checked={e.current} onChange={(ev) => p({ current: ev.target.checked })} className="h-4 w-4 accent-[var(--pe-accent)]" />
                  I currently work here
                </label>
                <label className={labelCls}>Achievements (one per line)</label>
                <textarea
                  value={(e.bullets ?? []).join('\n')}
                  onChange={(ev) => p({ bullets: ev.target.value.split('\n') })}
                  rows={4}
                  className={`${inputCls} h-auto py-2`}
                  placeholder="Grew pipeline 63% year over year…"
                />
              </div>
            );
          }}
        />
      ) : null}

      {section.type === 'education' ? (
        <ItemList
          section={section} inputCls={inputCls} labelCls={labelCls}
          onAdd={() => props.onAddItem({ id: newId('edu'), degree: '', school: '', location: '', startDate: '', endDate: '', details: '' })}
          onPatchItem={props.onPatchItem} onRemoveItem={props.onRemoveItem}
          render={(it, p) => {
            const e = it as { degree: string; school: string; location: string; startDate: string; endDate: string; details: string };
            return (
              <div className="space-y-2">
                <input placeholder="Degree" value={e.degree} onChange={(ev) => p({ degree: ev.target.value })} className={inputCls} />
                <input placeholder="School / university" value={e.school} onChange={(ev) => p({ school: ev.target.value })} className={inputCls} />
                <div className="flex gap-2">
                  <input placeholder="Start year" value={e.startDate} onChange={(ev) => p({ startDate: ev.target.value })} className={inputCls} />
                  <input placeholder="End year" value={e.endDate} onChange={(ev) => p({ endDate: ev.target.value })} className={inputCls} />
                </div>
                <input placeholder="Details (optional)" value={e.details} onChange={(ev) => p({ details: ev.target.value })} className={inputCls} />
              </div>
            );
          }}
        />
      ) : null}

      {section.type === 'skills' ? (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className={labelCls}>Skills (one per line)</label>
            <button onClick={props.onSuggestSkills} className="flex items-center gap-1 rounded-full bg-[var(--pe-accent-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--pe-accent)]">
              <Sparkles size={12} /> Suggest skills
            </button>
          </div>
          <textarea
            value={section.items.map((i) => (i as { name: string }).name).join('\n')}
            onChange={(e) => {
              const names = e.target.value.split('\n');
              props.onPatch({ items: names.map((n, idx) => section.items[idx] ? { ...section.items[idx], name: n } : { id: newId('sk'), name: n, level: '' }) });
            }}
            rows={6}
            className={`${inputCls} h-auto py-2`}
          />
          {props.skillIdeas ? (
            <div className="mt-2 rounded-xl border border-[var(--pe-border)] bg-[var(--pe-surface)] p-2">
              <div className="mb-1.5 text-[11px] font-medium text-[var(--pe-text-3)]">Suggestions based on your title — tap to add</div>
              <div className="flex flex-wrap gap-1.5">
                {props.skillIdeas.map((n, i) => (
                  <button key={i} onClick={() => props.onUseSkills([n])} className="rounded-full border border-[var(--pe-border)] px-2.5 py-1 text-xs hover:border-[var(--pe-accent)] hover:text-[var(--pe-accent)]">
                    + {n}
                  </button>
                ))}
              </div>
              <button onClick={() => props.onUseSkills(props.skillIdeas ?? [])} className="mt-2 text-xs font-medium text-[var(--pe-accent)]">Add all</button>
            </div>
          ) : null}
        </div>
      ) : null}

      {['certifications', 'languages', 'projects', 'achievements', 'interests'].includes(section.type) ? (
        <ItemList
          section={section} inputCls={inputCls} labelCls={labelCls}
          onAdd={() => props.onAddItem({ id: newId('it'), title: '', subtitle: '', date: '', description: '' })}
          onPatchItem={props.onPatchItem} onRemoveItem={props.onRemoveItem}
          render={(it, p) => {
            const e = it as { title: string; subtitle: string; date: string; description: string };
            return (
              <div className="space-y-2">
                <input placeholder="Title" value={e.title} onChange={(ev) => p({ title: ev.target.value })} className={inputCls} />
                <div className="flex gap-2">
                  <input placeholder="Issuer / detail" value={e.subtitle} onChange={(ev) => p({ subtitle: ev.target.value })} className={inputCls} />
                  <input placeholder="Year" value={e.date} onChange={(ev) => p({ date: ev.target.value })} className={inputCls} />
                </div>
                <input placeholder="Description (optional)" value={e.description} onChange={(ev) => p({ description: ev.target.value })} className={inputCls} />
              </div>
            );
          }}
        />
      ) : null}

      {section.type === 'references' || section.type === 'custom' ? (
        <div>
          <label className={labelCls}>Text</label>
          <textarea value={section.body} onChange={(e) => onPatch({ body: e.target.value })} rows={4} className={`${inputCls} h-auto py-2`} placeholder={section.type === 'references' ? 'Available upon request.' : 'Write here…'} />
        </div>
      ) : null}
    </div>
  );
}

function ItemList(props: {
  section: CvSection;
  inputCls: string;
  labelCls: string;
  onAdd: () => void;
  onPatchItem: (itemId: string, p: Record<string, unknown>) => void;
  onRemoveItem: (itemId: string) => void;
  render: (item: CvSection['items'][number], patch: (p: Record<string, unknown>) => void) => React.ReactNode;
}) {
  const [openId, setOpenId] = useState<string | null>(props.section.items[0]?.id ?? null);
  return (
    <div className="space-y-2">
      {props.section.items.map((it, idx) => {
        const label = (it as { role?: string; degree?: string; title?: string; name?: string }).role
          ?? (it as { degree?: string }).degree ?? (it as { title?: string }).title ?? (it as { name?: string }).name ?? `Item ${idx + 1}`;
        const open = openId === it.id;
        return (
          <div key={it.id} className="rounded-xl border border-[var(--pe-border)]">
            <button
              onClick={() => setOpenId(open ? null : it.id)}
              className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm font-medium"
            >
              <span className="min-w-0 flex-1 truncate">{label || `Item ${idx + 1}`}</span>
              <span onClick={(e) => { e.stopPropagation(); props.onRemoveItem(it.id); }} className="rounded p-1 text-[var(--pe-text-3)] hover:text-[var(--pe-danger)]" title="Remove">
                <Trash2 size={13} />
              </span>
            </button>
            {open ? (
              <div className="border-t border-[var(--pe-border)] p-2.5">
                {props.render(it, (p) => props.onPatchItem(it.id, p))}
              </div>
            ) : null}
          </div>
        );
      })}
      <button onClick={() => props.onAdd()} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--pe-border-strong)] py-2 text-sm text-[var(--pe-text-2)] hover:border-[var(--pe-accent)] hover:text-[var(--pe-accent)]">
        <Plus size={14} /> Add entry
      </button>
    </div>
  );
}
