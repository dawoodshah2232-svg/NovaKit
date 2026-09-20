'use client';

import React, { useState, useMemo } from 'react';
import { trackToolExecution } from '@/lib/analytics';
import {
  FileSearch,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Copy,
  Check,
  BarChart3,
  BookOpen,
  Clock,
  Type,
  AlignLeft,
  FileText,
  Percent,
} from 'lucide-react';

// Common English stop words to exclude from keyword extraction
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'cannot', 'could', 'couldn', 'did', 'didn', 'do', 'does', 'doesn', 'doing', 'don', 'down',
  'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn', 'has', 'hasn', 'have', 'haven',
  'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in',
  'into', 'is', 'isn', 'it', 'its', 'itself', 'just', 'll', 'm', 'me', 'more', 'most', 'mustn',
  'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 're', 's', 'same', 'shan', 'she', 'should', 'shouldn',
  'so', 'some', 'such', 't', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then',
  'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 've',
  'very', 'was', 'wasn', 'we', 'were', 'weren', 'what', 'when', 'where', 'which', 'while', 'who',
  'whom', 'why', 'will', 'with', 'won', 'would', 'wouldn', 'you', 'your', 'yours', 'yourself',
  'yourselves', 'also', 'many', 'much', 'even', 'one', 'two', 'first', 'new', 'well', 'way'
]);

const SAMPLE_TEXT = `Client-Side Web Architecture and The Future of Private Web Applications

In modern web development, client-side web tools represent a foundational paradigm shift. Rather than streaming private documents, financial invoices, and high-resolution media across unverified cloud networks, modern web applications can execute all computation directly inside the user's browser.

By leveraging powerful browser technologies like WebAssembly, HTML5 Canvas, and modern JavaScript engines, applications achieve zero server upload latency. When image compression, PDF merging, and financial calculations run locally, sensitive data never leaves user memory. This private-first architecture delivers instantaneous performance, complete privacy, and zero server infrastructure costs.

Search engine optimization and digital publishing require consistent content quality. By analyzing keyword density, sentence structure, and reading time, content writers can create compelling, high-ranking copy that engages readers while avoiding keyword stuffing penalties. Modern client-side tools empower creators to verify these metrics securely, with absolute confidence in their digital privacy.`;

export interface KeywordDensity {
  word: string;
  count: number;
  density: number; // percentage e.g. 2.4%
}

export function TextAnalyzer() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [copied, setCopied] = useState(false);

  // Compute text statistics efficiently via useMemo
  const stats = useMemo(() => {
    const raw = text;
    const trimmed = raw.trim();

    // Characters
    const totalChars = raw.length;
    const charsNoSpaces = raw.replace(/\s/g, '').length;

    // Words
    const words = trimmed.length > 0 ? trimmed.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;

    // Sentences
    const sentences = trimmed.length > 0
      ? trimmed.split(/[.!?]+(?:\s+|$)/).filter((s) => s.trim().length > 0)
      : [];
    const sentenceCount = sentences.length;

    // Paragraphs
    const paragraphs = trimmed.length > 0
      ? trimmed.split(/\n+/).filter((p) => p.trim().length > 0)
      : [];
    const paragraphCount = paragraphs.length;

    // Reading & Speaking Time
    // Reading ~225 wpm, Speaking ~140 wpm
    const readingTimeMinutes = Math.ceil(wordCount / 225);
    const readingTimeSeconds = Math.round((wordCount / 225) * 60);
    const speakingTimeMinutes = Math.ceil(wordCount / 140);

    // Keyword extraction & density
    const frequencyMap = new Map<string, number>();
    for (const w of words) {
      // Clean word: remove surrounding punctuation, lower case
      const clean = w.toLowerCase().replace(/[^a-z0-9'-]/g, '').trim();
      if (clean.length < 3 || STOP_WORDS.has(clean) || /^\d+$/.test(clean)) {
        continue;
      }
      frequencyMap.set(clean, (frequencyMap.get(clean) || 0) + 1);
    }

    const sortedKeywords: KeywordDensity[] = Array.from(frequencyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({
        word,
        count,
        density: wordCount > 0 ? Number(((count / wordCount) * 100).toFixed(1)) : 0,
      }));

    // Average metrics
    const avgWordsPerSentence = sentenceCount > 0 ? (wordCount / sentenceCount).toFixed(1) : '0';
    const avgCharsPerWord = wordCount > 0 ? (charsNoSpaces / wordCount).toFixed(1) : '0';

    return {
      totalChars,
      charsNoSpaces,
      wordCount,
      sentenceCount,
      paragraphCount,
      readingTimeMinutes,
      readingTimeSeconds,
      speakingTimeMinutes,
      keywords: sortedKeywords,
      avgWordsPerSentence,
      avgCharsPerWord,
    };
  }, [text]);

  // Copy text to clipboard
  const handleCopyText = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackToolExecution('text-analyzer', true);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Clear text
  const handleClear = () => {
    setText('');
  };

  // Load sample text
  const handleLoadSample = () => {
    setText(SAMPLE_TEXT);
  };

  return (
    <div className="w-full space-y-6">
      {/* Privacy Guarantee Header Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-medium text-emerald-800 dark:text-emerald-300 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong>Zero Server Uploads:</strong> Text analysis and keyword counting are 100% private in local memory.
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
          Client-Side Pure JS
        </span>
      </div>

      {/* Core Metrics Statistic Cards (Top Row) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Words */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Words</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Type className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
            {stats.wordCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Avg {stats.avgCharsPerWord} chars/word
          </div>
        </div>

        {/* Card 2: Characters */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Characters</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
            {stats.totalChars.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {stats.charsNoSpaces.toLocaleString()} excluding spaces
          </div>
        </div>

        {/* Card 3: Sentences & Paragraphs */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Sentences</span>
            <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <AlignLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
            {stats.sentenceCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {stats.paragraphCount} {stats.paragraphCount === 1 ? 'paragraph' : 'paragraphs'}
          </div>
        </div>

        {/* Card 4: Reading Time */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Reading Time</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
            {stats.wordCount === 0
              ? '0m'
              : stats.readingTimeSeconds < 60
              ? `${stats.readingTimeSeconds}s`
              : `${stats.readingTimeMinutes}m`}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            ~{stats.speakingTimeMinutes}m speaking time
          </div>
        </div>
      </div>

      {/* Main Content Layout: Text Input (Left) & SEO Keyword Density (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Panel */}
        <div className="space-y-4 lg:col-span-8">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Content Editor
                </h3>
              </div>

              {/* Action Buttons: Sample, Copy, Clear */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/60 transition-colors inline-flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sample Text</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyText}
                  disabled={!text}
                  className="min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  disabled={!text}
                  className="min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Large Textarea */}
            <div className="space-y-1">
              <textarea
                rows={16}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={() => {
                  if (text.trim().length > 30) {
                    trackToolExecution('text-analyzer', true);
                  }
                }}
                placeholder="Paste or write your article, blog post, or SEO copy here..."
                className="w-full p-4 text-sm sm:text-base rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all resize-y leading-relaxed font-sans"
              />
            </div>

            {/* Quick Content Summary Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <span>Avg Sentence: <strong>{stats.avgWordsPerSentence} words</strong></span>
                <span>•</span>
                <span>Avg Word: <strong>{stats.avgCharsPerWord} characters</strong></span>
              </div>
              <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Real-Time Analysis Active
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: SEO Keyword Density & Recommendations */}
        <div className="space-y-4 lg:col-span-4 lg:sticky lg:top-20">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Top SEO Keywords
                </h3>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                Stop-words Filtered
              </span>
            </div>

            {/* Keyword Density Table / List */}
            {stats.keywords.length > 0 ? (
              <div className="space-y-2.5">
                {stats.keywords.map((kw, index) => {
                  // Density health check (1% - 3% is optimal for SEO)
                  const isOptimal = kw.density >= 0.8 && kw.density <= 3.5;
                  const isHigh = kw.density > 3.5;

                  return (
                    <div
                      key={kw.word}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1.5 transition-all hover:border-emerald-300 dark:hover:border-emerald-800"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-mono font-bold text-slate-400 w-4">
                            #{index + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {kw.word}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-mono">
                            {kw.count}×
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isHigh
                                ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                                : isOptimal
                                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                                : 'bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {kw.density}%
                          </span>
                        </div>
                      </div>

                      {/* Mini visual density progress bar */}
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isHigh ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(kw.density * 20, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500 space-y-2">
                <BookOpen className="w-8 h-8 mx-auto opacity-50" />
                <p className="text-xs">Type or paste text above to extract high-frequency keywords.</p>
              </div>
            )}

            {/* SEO Keyword Guidelines Note */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed space-y-1">
              <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>SEO Density Guidance</span>
              </div>
              <p>
                An optimal keyword density of <strong>1.0% to 3.0%</strong> signals search relevance without triggering keyword stuffing algorithms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
