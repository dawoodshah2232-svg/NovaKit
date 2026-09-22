'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';
import {
  FileText,
  UploadCloud,
  Check,
  AlertCircle,
  RefreshCw,
  Download,
  Copy,
  Sparkles,
  RotateCcw,
  Search,
  Hash,
  AlignLeft,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

interface PageText {
  pageNumber: number;
  text: string;
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function PdfToText() {
  const [file, setFile] = useState<File | null>(null);
  const [pagesText, setPagesText] = useState<PageText[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | number>('all');
  const [includePageHeaders, setIncludePageHeaders] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setPagesText([]);

    const pdfFile = acceptedFiles[0];
    if (!pdfFile) return;

    if (pdfFile.type !== 'application/pdf' && !pdfFile.name.endsWith('.pdf')) {
      setErrorMessage('Please upload a valid PDF document.');
      return;
    }

    setFile(pdfFile);
    setIsLoading(true);

    try {
      const buffer = await pdfFile.arrayBuffer();
      setLoadingProgress('Loading document structure...');
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;

      const extracted: PageText[] = [];

      for (let i = 1; i <= totalPages; i++) {
        setLoadingProgress(`Extracting text from page ${i} of ${totalPages}...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Reconstruct lines with intelligent spacing
        let lastY: number | null = null;
        let pageString = '';

        for (const item of textContent.items) {
          if ('str' in item) {
            const currentY = 'transform' in item ? item.transform[5] : null;
            if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
              pageString += '\n';
            } else if (pageString.length > 0 && !pageString.endsWith(' ') && !pageString.endsWith('\n')) {
              pageString += ' ';
            }
            pageString += item.str;
            lastY = currentY;
          }
        }

        extracted.push({
          pageNumber: i,
          text: pageString.trim(),
        });
      }

      const totalLength = extracted.reduce((acc, p) => acc + p.text.length, 0);
      if (totalLength === 0) {
        setErrorMessage(
          'No selectable text found in this PDF. It may be a scanned document or image-only PDF. Try using our OCR PDF tool for scanned documents.'
        );
      } else {
        setSuccessMessage(`Successfully extracted text from ${totalPages} pages!`);
      }

      setPagesText(extracted);
      trackToolExecution('pdf-to-text', true);
    } catch (err: unknown) {
      trackToolExecution('pdf-to-text', false);
      console.error('Error extracting text from PDF:', err);
      const msg = err instanceof Error ? err.message : 'Failed to extract text from PDF.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setLoadingProgress('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const getCombinedText = () => {
    if (activeTab !== 'all') {
      const p = pagesText.find((item) => item.pageNumber === activeTab);
      return p ? p.text : '';
    }

    return pagesText
      .map((p) => {
        if (includePageHeaders) {
          return `--- Page ${p.pageNumber} ---\n${p.text}\n`;
        }
        return p.text;
      })
      .join('\n\n')
      .trim();
  };

  const fullText = getCombinedText();

  // Statistics
  const totalCharacters = fullText.length;
  const wordCount = fullText.trim() ? fullText.trim().split(/\s+/).length : 0;
  const lineCount = fullText ? fullText.split('\n').length : 0;

  const handleCopy = async () => {
    if (!fullText) return;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownloadTxt = () => {
    if (!fullText || !file) return;
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    saveAs(blob, `${baseName}-text.txt`);
  };

  const handleReset = () => {
    setFile(null);
    setPagesText([]);
    setErrorMessage(null);
    setSuccessMessage(null);
    setActiveTab('all');
    setSearchQuery('');
  };

  // Filter text with search query if active
  const filteredPages = searchQuery.trim()
    ? pagesText.filter((p) => p.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : pagesText;

  return (
    <div className="w-full space-y-6">
      {!file && (
        <div
          {...getRootProps()}
          className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer select-none ${
            isDragActive
              ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 scale-[1.01]'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-slate-50/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Choose a PDF to Extract Text
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Instantly extract digital text, inspect page-by-page, copy, or download as TXT
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>100% Client-Side Privacy • Zero Server Uploads</span>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {loadingProgress || 'Extracting text...'}
          </p>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 text-emerald-700 dark:text-emerald-300 text-sm"
        >
          <Check className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      {file && pagesText.length > 0 && !isLoading && (
        <div className="space-y-6">
          {/* Header */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {file.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {pagesText.length} pages • {formatBytes(file.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New File</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total Words</span>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {wordCount.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">Characters</span>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {totalCharacters.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">Lines</span>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {lineCount.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">Pages</span>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {pagesText.length}
              </p>
            </div>
          </div>

          {/* Controls Bar: Tabs, Search, Options */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* View Selector */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                All Pages
              </button>
              {pagesText.slice(0, 8).map((p) => (
                <button
                  key={p.pageNumber}
                  type="button"
                  onClick={() => setActiveTab(p.pageNumber)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === p.pageNumber
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  P.{p.pageNumber}
                </button>
              ))}
            </div>

            {/* Search & Header toggle */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              {activeTab === 'all' && (
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includePageHeaders}
                    onChange={(e) => setIncludePageHeaders(e.target.checked)}
                    className="rounded accent-emerald-600"
                  />
                  <span>Page Dividers</span>
                </label>
              )}

              <div className="relative flex-1 md:w-48">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in text..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Textarea Workspace */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <textarea
              readOnly
              value={fullText}
              rows={16}
              className="w-full p-6 text-sm font-mono text-slate-800 dark:text-slate-200 bg-transparent focus:outline-none resize-y leading-relaxed"
              placeholder="Extracted text will appear here..."
            />

            {/* Quick Actions Floating in Top Right */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .TXT</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
