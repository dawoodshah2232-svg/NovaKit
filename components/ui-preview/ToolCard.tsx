'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { categoryById, type PreviewTool } from './data';

export function ToolCard({ tool }: { tool: PreviewTool }) {
  const cat = categoryById(tool.category);
  const Icon = tool.icon;
  return (
    <Link
      href={tool.href}
      aria-label={`${tool.name} — ${tool.tagline}`}
      className="pe-lift group flex items-start gap-4 rounded-[var(--pe-radius-md)] border border-[var(--pe-border)] bg-[var(--pe-surface)] p-[18px] shadow-[var(--pe-shadow-sm)] hover:border-[var(--pe-accent)] hover:shadow-[var(--pe-shadow-md)]"
    >
      <span
        aria-hidden="true"
        className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-3"
        style={{ background: cat.tint, color: 'var(--pe-text)' }}
      >
        <Icon className="h-7 w-7" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-[var(--pe-text)]">
            {tool.name}
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 shrink-0 -translate-x-1 text-[var(--pe-accent)] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
          >
            <path d="M7 17 17 7M8 7h9v9" />
          </svg>
        </span>
        <span className="mt-1 block line-clamp-2 text-sm leading-snug text-[var(--pe-text-2)]">
          {tool.tagline}
        </span>
        <span className="mt-3 flex items-center justify-between gap-2">
          <span
            className="inline-block rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide text-[var(--pe-text)]"
            style={{ background: cat.tint }}
          >
            {cat.label}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--pe-accent)] px-3 py-1.5 text-[11px] font-bold text-[var(--pe-accent-ink)] shadow-sm transition-all duration-200 group-hover:bg-[var(--pe-accent-hover)] group-hover:shadow-md">
            Start
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </span>
      </span>
    </Link>
  );
}
