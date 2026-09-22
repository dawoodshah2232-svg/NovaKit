'use client';

import Image from 'next/image';
import Link from 'next/link';
import heroBanner from '../../app/ui-preview/hero-banner.png';
import studioVisual from '../../app/ui-preview/studio-visual.png';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import {
  PREVIEW_CATEGORIES,
  PREVIEW_TOOLS,
  POPULAR_TOOLS,
  categoryById,
  searchPreviewTools,
  type PreviewCategoryId,
  type PreviewTool,
} from './data';
import { ToolCard } from './ToolCard';
import { StudioIcon } from './icons';

/* ================= HERO + SIGNATURE SEARCH ================= */

function SearchBar() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchPreviewTools(q), [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (t: PreviewTool) => {
    window.location.href = t.href;
  };

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div
        className="flex items-center gap-3 rounded-[20px] border border-[var(--pe-border-strong)] bg-[var(--pe-elevated)] py-2 pl-5 pr-2 shadow-[var(--pe-shadow-md)] transition-all duration-200 focus-within:-translate-y-0.5 focus-within:border-[var(--pe-accent)] focus-within:shadow-[var(--pe-shadow-lg)] focus-within:ring-4 focus-within:ring-[var(--pe-accent-ring)]"
        role="search"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-5 w-5 shrink-0 text-[var(--pe-accent)]" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setHi(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setQ('');
              setOpen(false);
              inputRef.current?.blur();
            } else if (e.key === 'ArrowDown' && results.length) {
              e.preventDefault();
              setHi((h) => (h + 1) % results.length);
            } else if (e.key === 'ArrowUp' && results.length) {
              e.preventDefault();
              setHi((h) => (h - 1 + results.length) % results.length);
            } else if (e.key === 'Enter' && results.length) {
              go(results[hi] ?? results[0]);
            }
          }}
          placeholder="Search 24 tools — try “compress”, “sign”, “word”…"
          aria-label="Search PDF tools"
          className="h-11 w-full bg-transparent text-base text-[var(--pe-text)] placeholder:text-[var(--pe-text-3)] focus:outline-none"
        />
        <kbd className="mr-1 hidden shrink-0 rounded-lg border border-[var(--pe-border)] bg-[var(--pe-surface-2)] px-2.5 py-1.5 text-xs font-semibold text-[var(--pe-text-3)] sm:block">
          /
        </kbd>
      </div>

      {open && q.trim() !== '' && (
        <div className="pe-search-pop absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-[var(--pe-radius-md)] border border-[var(--pe-border)] bg-[var(--pe-elevated)] shadow-[var(--pe-shadow-lg)]" role="listbox" aria-label="Search results">
          {results.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-[var(--pe-text-2)]">
              No tools match “{q}”. Try “merge”, “ocr” or “protect”.
            </p>
          ) : (
            <ul className="max-h-[340px] overflow-auto py-2">
              {results.map((t, i) => {
                const Icon = t.icon;
                const cat = categoryById(t.category);
                return (
                  <li key={t.id} role="option" aria-selected={i === hi}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => go(t)}
                      onMouseEnter={() => setHi(i)}
                      className="flex min-h-[56px] w-full items-center gap-3 px-4 py-2.5 text-left transition-colors"
                      style={i === hi ? { background: 'var(--pe-accent-soft)' } : undefined}
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: cat.tint, color: 'var(--pe-text)' }}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold text-[var(--pe-text)]">{t.name}</span>
                        <span className="block truncate text-[13px] text-[var(--pe-text-2)]">{t.tagline}</span>
                      </span>
                      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-[var(--pe-text-3)]">{cat.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Hero visual — the signature moment.
 * Owner-supplied premium product render (hero-banner.png): annual report
 * artwork with Merge / Edit / Compress / Convert badges and a
 * "Signed & ready" pill. The artwork carries its own badges, so no
 * extra chips are layered on top.
 */
function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]" aria-hidden="true">
      {/* ambient accent light */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[88%] w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(50% 50% at 50% 50%, var(--pe-accent-soft), transparent 70%)' }}
      />
      {/* owner artwork, framed as the product shot */}
      <div className="pe-float-slow relative overflow-hidden rounded-[24px] border border-[var(--pe-border)] shadow-[var(--pe-shadow-lg)]">
        <Image
          src={heroBanner}
          alt=""
          sizes="(max-width: 640px) 100vw, 520px"
          className="h-auto w-full"
          priority
        />
        {/* top-light sheen */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24"
          style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.12), transparent)' }}
        />
      </div>
    </div>
  );
}

const POPULAR_IDS = ['merge', 'compress', 'pdf-to-word', 'split', 'sign'];

/** Small eyebrow label used across section headers for rhythm. */
function Eyebrow({ children }: { children: string }) {
  return (
    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--pe-accent)]">
      {children}
    </p>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(60% 50% at 50% 0%, var(--pe-bg-glow), transparent 70%)' }}
      />
      {/* restrained accent light — dark mode only */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{ background: 'radial-gradient(46% 34% at 50% 0%, rgba(248,113,113,0.08), transparent 70%)' }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-16 lg:pt-16">
        <div className="text-center lg:text-left">
          <p className="pe-fade-up inline-flex items-center gap-2 rounded-full border border-[var(--pe-border)] bg-[var(--pe-surface)] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--pe-text-2)] shadow-[var(--pe-shadow-sm)]">
            <span className="h-2 w-2 rounded-full bg-[var(--pe-accent)]" />
            Browser-based PDF tools
          </p>
          <h1 className="pe-fade-up pe-fade-up-1 mt-4 text-balance text-[2.6rem] font-bold leading-[1.05] tracking-tight text-[var(--pe-text)] sm:text-6xl lg:text-[3.8rem]">
            Free online PDF editor &amp; PDF tools.
            <br />
            <span className="text-[var(--pe-accent)]">Every PDF task, done beautifully.</span>
          </h1>
          <p className="pe-fade-up pe-fade-up-2 mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-[var(--pe-text-2)] sm:text-lg lg:mx-0">
            Merge, compress, convert, sign and edit PDFs right in your browser —
            fast, private, and free to start. No uploads. No accounts.
          </p>
          <div className="pe-fade-up pe-fade-up-3 mt-7">
            <SearchBar />
          </div>
          <div className="pe-fade-up pe-fade-up-3 mt-5 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            <span className="mr-1 text-sm font-medium text-[var(--pe-text-3)]">Popular:</span>
            {POPULAR_IDS.map((id) => {
              const t = PREVIEW_TOOLS.find((x) => x.id === id) as PreviewTool;
              return (
                <Link
                  key={id}
                  href={t.href}
                  className="pe-lift inline-flex min-h-[44px] items-center rounded-full border border-[var(--pe-border)] bg-[var(--pe-surface)] px-4 text-sm font-medium text-[var(--pe-text-2)] hover:border-[var(--pe-accent)] hover:bg-[var(--pe-accent-soft)] hover:text-[var(--pe-accent)]"
                >
                  {t.name}
                </Link>
              );
            })}
          </div>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}

/* ================= POPULAR TOOLS ================= */

export function PopularTools() {
  return (
    <section id="tools" className="scroll-mt-24 border-y border-[var(--pe-border)] bg-[var(--pe-surface-2)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <Eyebrow>Most used</Eyebrow>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--pe-text)] sm:text-3xl">Popular tools</h2>
            <p className="mt-1.5 text-[15px] text-[var(--pe-text-2)]">The tools people reach for every day.</p>
          </div>
          <a href="#categories" className="hidden shrink-0 rounded-full px-3 py-2 text-sm font-semibold text-[var(--pe-accent)] transition-colors hover:bg-[var(--pe-accent-soft)] sm:block">
            Browse all →
          </a>
        </div>
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POPULAR_TOOLS.map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= CATEGORIES ================= */

export function Categories() {
  const [active, setActive] = useState<PreviewCategoryId>('organize');
  const listRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState({ left: 0, width: 0 });

  const tools = useMemo(
    () => PREVIEW_TOOLS.filter((t) => t.category === active),
    [active]
  );

  useLayoutEffect(() => {
    const el = listRef.current?.querySelector<HTMLButtonElement>(
      `[data-cat="${active}"]`
    );
    if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active]);

  return (
    <section id="categories" className="scroll-mt-24 bg-[var(--pe-surface)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="max-w-2xl">
          <Eyebrow>Browse the library</Eyebrow>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--pe-text)] sm:text-3xl">Find the right tool fast</h2>
          <p className="mt-1.5 text-[15px] text-[var(--pe-text-2)]">
            Seven clear groups. Pick a category — every tool inside does exactly what it says.
          </p>
        </div>

        <div className="-mx-4 mt-7 px-4 sm:mx-0 sm:px-0">
          <div ref={listRef} className="pe-no-scrollbar pe-tabs-scroll relative flex gap-1 overflow-x-auto rounded-full border border-[var(--pe-border)] bg-[var(--pe-surface-2)] p-1.5" role="tablist" aria-label="Tool categories">
            <span
              aria-hidden="true"
              className="pe-tab-pill absolute top-1.5 left-0 h-[calc(100%-12px)] rounded-full bg-[var(--pe-accent-soft)]"
              style={{ transform: `translateX(${pill.left}px)`, width: pill.width }}
            />
            {PREVIEW_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={active === c.id}
                data-cat={c.id}
                onClick={() => setActive(c.id)}
                className={`relative z-10 min-h-[48px] shrink-0 rounded-full px-4 text-sm transition-colors sm:px-5 ${
                  active === c.id
                    ? 'font-bold text-[var(--pe-accent)]'
                    : 'font-medium text-[var(--pe-text-2)] hover:bg-[var(--pe-surface)] hover:text-[var(--pe-text)]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 text-[15px] text-[var(--pe-text-2)]" aria-live="polite">
          {categoryById(active).blurb} · {tools.length} tools
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" key={active}>
          {tools.map((t, i) => (
            <div key={t.id} className={i < 4 ? `pe-fade-up pe-fade-up-${Math.min(i, 3)}` : undefined}>
              <ToolCard tool={t} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= STUDIO PROMO — compact flagship ================= */

const STUDIO_POINTS = [
  { title: 'Edit & annotate', desc: 'Text, shapes and highlights anywhere' },
  { title: 'Sign documents', desc: 'Draw, type or upload your signature' },
  { title: 'Redact precisely', desc: 'Black out sensitive text' },
  { title: 'Organize pages', desc: 'Reorder, rotate and extract' },
];

export function StudioPromo() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div
        className="relative overflow-hidden rounded-[var(--pe-radius-lg)] p-5 shadow-[var(--pe-shadow-lg)] sm:p-7"
        style={{ background: 'var(--pe-ink-bg)', border: '1px solid var(--pe-ink-border)' }}
      >
        {/* top highlight line */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-10 top-0 h-px bg-white/15" />
        <div
          aria-hidden="true"
          className="pe-pulse-soft pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(55% 65% at 82% 18%, rgba(248,113,113,0.13), transparent 70%)' }}
        />
        <div className="relative grid items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest"
               style={{ background: 'rgba(248,113,113,0.14)', color: '#f87171' }}>
              <StudioIcon className="h-4 w-4" />
              Flagship product
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--pe-ink-text)' }}>
              Meet PDFEdit Studio
            </h2>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed" style={{ color: 'var(--pe-ink-text-2)' }}>
              A full document workspace in your browser — edit, sign, redact and
              organize PDFs. No installs, no uploads.
            </p>
            <ul className="mt-5 grid gap-x-5 gap-y-3.5 sm:grid-cols-2">
              {STUDIO_POINTS.map((p) => (
                <li key={p.title} className="flex gap-2.5">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full" style={{ background: 'rgba(248,113,113,0.14)', color: '#f87171' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-sm font-semibold" style={{ color: 'var(--pe-ink-text)' }}>{p.title}</span>
                    <span className="mt-0.5 block text-[13px] leading-snug" style={{ color: 'var(--pe-ink-text-2)' }}>{p.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/studio"
                className="pe-lift rounded-full bg-[var(--pe-accent)] px-6 py-3 text-sm font-bold text-[var(--pe-accent-ink)] shadow-[var(--pe-shadow-accent)] hover:bg-[var(--pe-accent-hover)]"
              >
                Open Studio — it&apos;s free
              </Link>
              <Link
                href="/sign-pdf"
                className="pe-lift rounded-full px-5 py-3 text-sm font-semibold"
                style={{ border: '1px solid var(--pe-ink-border)', color: 'var(--pe-ink-text)' }}
              >
                Try signing
              </Link>
            </div>
            <p className="mt-3 text-xs" style={{ color: 'var(--pe-ink-text-2)' }}>
              Free forever · No sign-up · Your files never leave your device
            </p>
          </div>
          {/* generated Studio artwork — dark editor workspace */}
          <div className="relative">
            <div
              className="overflow-hidden rounded-2xl shadow-[var(--pe-shadow-lg)]"
              style={{ border: '1px solid var(--pe-ink-border)' }}
            >
              <Image
                src={studioVisual}
                alt="PDFEdit Studio editor workspace"
                sizes="(max-width: 1024px) 100vw, 560px"
                className="h-auto w-full"
              />
            </div>
            {/* floating exported chip */}
            <div
              className="pe-float-slow absolute -bottom-3 right-5 flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-[var(--pe-shadow-lg)]"
              style={{ background: 'var(--pe-accent)', color: 'var(--pe-accent-ink)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
                <path d="m5 13 4 4L19 7" />
              </svg>
              Exported
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= TRUST — refined strip, not boxes ================= */

const TRUST: { title: string; desc: string; icon: ReactElement }[] = [
  {
    title: 'Processed in your browser',
    desc: 'Tools run locally on your device wherever technically possible.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M9 20h6M12 16v4" />
      </svg>
    ),
  },
  {
    title: 'Files stay with you',
    desc: 'No forced uploads just to merge or compress a file.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="m10 14 1.5 1.5L14.5 12" />
      </svg>
    ),
  },
  {
    title: 'No account needed',
    desc: 'Open a tool and start working immediately.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
      </svg>
    ),
  },
  {
    title: 'Free core tools',
    desc: 'The everyday tools are free to use, no trial walls.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M12 3v18" />
        <path d="M5 7h14v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
        <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
      </svg>
    ),
  },
];

export function Trust() {
  return (
    <section className="border-y border-[var(--pe-border)] bg-[var(--pe-surface)]">
      <div className="mx-auto grid max-w-6xl gap-x-8 gap-y-6 px-4 py-9 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {TRUST.map((t, i) => (
          <div
            key={t.title}
            className={`flex items-start gap-3.5 ${i > 0 ? 'lg:border-l lg:border-[var(--pe-divider)] lg:pl-8' : ''}`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--pe-accent-soft)] text-[var(--pe-accent)]">
              {t.icon}
            </span>
            <div>
              <h3 className="text-[15px] font-bold tracking-tight text-[var(--pe-text)]">{t.title}</h3>
              <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--pe-text-2)]">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ================= WHY PDFEDIT ================= */

const WHY: { n: string; title: string; desc: string; tint: string; visual: ReactElement }[] = [
  {
    n: '01',
    title: 'Built for speed',
    desc: 'Lightweight pages and browser-side processing keep every tool feeling instant — even on mobile data.',
    tint: 'var(--pe-tint-optimize)',
    visual: (
      <svg viewBox="0 0 120 56" className="h-14 w-full" fill="none" aria-hidden="true">
        <rect x="14" y="30" width="10" height="16" rx="3" fill="currentColor" opacity="0.35" />
        <rect x="32" y="22" width="10" height="24" rx="3" fill="currentColor" opacity="0.6" />
        <rect x="50" y="12" width="10" height="34" rx="3" fill="currentColor" />
        <path d="M78 18h18M82 28h14M78 38h18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    n: '02',
    title: 'Private by design',
    desc: 'Your documents are processed on your device where possible, instead of being shipped to a server farm.',
    tint: 'var(--pe-tint-security)',
    visual: (
      <svg viewBox="0 0 120 56" className="h-14 w-full" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M60 6l20 8v12c0 14-9 22-20 26-11-4-20-12-20-26V14z" opacity="0.9" />
        <path d="m52 27 6 6 10-11" />
      </svg>
    ),
  },
  {
    n: '03',
    title: 'One calm workspace',
    desc: 'From quick conversions to the full Studio editor, everything shares the same clean, predictable interface.',
    tint: 'var(--pe-tint-edit)',
    visual: (
      <svg viewBox="0 0 120 56" className="h-14 w-full" fill="none" aria-hidden="true">
        <rect x="18" y="14" width="56" height="34" rx="6" fill="currentColor" opacity="0.3" />
        <rect x="40" y="8" width="56" height="34" rx="6" fill="currentColor" opacity="0.55" />
        <rect x="40" y="8" width="56" height="34" rx="6" stroke="currentColor" strokeWidth="2.4" />
        <circle cx="88" cy="34" r="4" fill="currentColor" />
      </svg>
    ),
  },
];

export function WhyPdfEdit() {
  return (
    <section id="why" className="scroll-mt-24 border-b border-[var(--pe-border)] bg-[var(--pe-surface-2)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="max-w-2xl">
          <Eyebrow>Why PDFEdit</Eyebrow>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--pe-text)] sm:text-3xl">A serious tool, without the enterprise bloat.</h2>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {WHY.map((w) => (
            <article key={w.n} className="pe-lift overflow-hidden rounded-[var(--pe-radius-md)] border border-[var(--pe-border)] bg-[var(--pe-surface)] shadow-[var(--pe-shadow-sm)] hover:shadow-[var(--pe-shadow-md)]">
              <div className="grid place-items-center px-6 pt-5 text-[var(--pe-text)]" style={{ background: w.tint }}>
                {w.visual}
              </div>
              <div className="p-5 pt-4 sm:p-6 sm:pt-5">
                <span className="text-[13px] font-bold tracking-widest text-[var(--pe-accent)]">{w.n}</span>
                <h3 className="mt-1.5 text-lg font-bold tracking-tight text-[var(--pe-text)]">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--pe-text-2)]">{w.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
