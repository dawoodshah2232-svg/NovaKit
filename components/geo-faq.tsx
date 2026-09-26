'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles, Check, Copy } from 'lucide-react';
import { GeoFaqItem } from '@/lib/geo-data';

interface GeoFaqProps {
  faqs: GeoFaqItem[];
  toolName: string;
}

export function GeoFaq({ faqs, toolName }: GeoFaqProps) {
  // Allow multiple items to be expanded or toggle individual items; default first item open
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleCopyAnswer = (text: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section
      aria-labelledby="faq-section-heading"
      className="w-full space-y-5 pt-4"
    >
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Generative Engine Optimization & Knowledge Base</span>
          </div>
          <h2
            id="faq-section-heading"
            className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Authoritative answers on privacy, client-side encryption, performance limits, and browser compatibility for {toolName}.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Optimized for AI & Search</span>
        </div>
      </div>

      {/* Accordion Stack */}
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndexes.includes(index);
          const questionId = `faq-q-${index}`;
          const answerId = `faq-a-${index}`;

          return (
            <div
              key={index}
              className={`rounded-2xl sm:rounded-3xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-white dark:bg-slate-900 border-blue-500/40 dark:border-blue-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.04)] ring-1 ring-blue-500/20'
                  : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
              }`}
            >
              {/* Accordion Header Button */}
              <button
                type="button"
                id={questionId}
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => toggleIndex(index)}
                className="w-full min-h-[52px] sm:min-h-[56px] px-5 sm:px-6 py-4 flex items-center justify-between gap-3 sm:gap-4 text-left cursor-pointer select-none touch-manipulation group"
              >
                <span
                  className={`text-sm sm:text-base font-extrabold tracking-tight transition-colors ${
                    isOpen
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  }`}
                >
                  {faq.question}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-transform duration-200 ${
                      isOpen
                        ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 rotate-180'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </div>
              </button>

              {/* Accordion Content Body */}
              {isOpen && (
                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={questionId}
                  className="px-5 sm:px-6 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3 animate-in fade-in duration-150"
                >
                  <p>{faq.answer}</p>

                  {/* Micro Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-400">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Client-Side In-Memory Guarantee
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleCopyAnswer(faq.answer, index, e)}
                      aria-label="Copy direct answer to clipboard"
                      className="min-h-[36px] px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Answer</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
