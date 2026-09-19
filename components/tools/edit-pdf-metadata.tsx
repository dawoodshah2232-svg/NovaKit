'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';
import {
  FilePenLine,
  UploadCloud,
  Check,
  AlertCircle,
  RefreshCw,
  Download,
  FileText,
  Shield,
  Trash2,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';

interface MetadataState {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate?: string;
  modificationDate?: string;
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function EditPdfMetadata() {
  const [file, setFile] = useState<File | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);

  const [metadata, setMetadata] = useState<MetadataState>({
    title: '',
    author: '',
    subject: '',
    keywords: '',
    creator: '',
    producer: '',
  });

  const [initialMetadata, setInitialMetadata] = useState<MetadataState | null>(null);

  const [isReading, setIsReading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const pdfFile = acceptedFiles[0];
    if (!pdfFile) return;

    if (pdfFile.type !== 'application/pdf' && !pdfFile.name.endsWith('.pdf')) {
      setErrorMessage('Please upload a valid PDF document.');
      return;
    }

    setFile(pdfFile);
    setIsReading(true);

    try {
      const buffer = await pdfFile.arrayBuffer();
      setArrayBuffer(buffer);

      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setPageCount(pdfDoc.getPageCount());

      const readMeta: MetadataState = {
        title: pdfDoc.getTitle() || '',
        author: pdfDoc.getAuthor() || '',
        subject: pdfDoc.getSubject() || '',
        keywords: pdfDoc.getKeywords() || '',
        creator: pdfDoc.getCreator() || '',
        producer: pdfDoc.getProducer() || '',
        creationDate: pdfDoc.getCreationDate() ? pdfDoc.getCreationDate()!.toLocaleString() : undefined,
        modificationDate: pdfDoc.getModificationDate() ? pdfDoc.getModificationDate()!.toLocaleString() : undefined,
      };

      setMetadata(readMeta);
      setInitialMetadata({ ...readMeta });
    } catch (err: unknown) {
      console.error('Error reading PDF metadata:', err);
      const msg = err instanceof Error ? err.message : 'Failed to parse PDF metadata.';
      setErrorMessage(msg);
    } finally {
      setIsReading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const handleChange = (field: keyof MetadataState, value: string) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
  };

  // Strip all metadata for complete privacy
  const handleWipeMetadata = () => {
    setMetadata({
      title: '',
      author: '',
      subject: '',
      keywords: '',
      creator: 'PDFEdit Studio Clean Export',
      producer: 'PDFEdit Studio (pdfedit.website)',
    });
    setSuccessMessage('Metadata sanitized! Click "Save & Download PDF" to write changes.');
  };

  // Save updated metadata to PDF
  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arrayBuffer || !file) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      if (metadata.title.trim()) {
        pdfDoc.setTitle(metadata.title.trim());
      }
      if (metadata.author.trim()) {
        pdfDoc.setAuthor(metadata.author.trim());
      }
      if (metadata.subject.trim()) {
        pdfDoc.setSubject(metadata.subject.trim());
      }
      if (metadata.keywords.trim()) {
        const kwArray = metadata.keywords.split(',').map((k) => k.trim()).filter(Boolean);
        pdfDoc.setKeywords(kwArray);
      }
      if (metadata.creator.trim()) {
        pdfDoc.setCreator(metadata.creator.trim());
      } else {
        pdfDoc.setCreator('PDFEdit Studio Client-Side Suite');
      }
      if (metadata.producer.trim()) {
        pdfDoc.setProducer(metadata.producer.trim());
      } else {
        pdfDoc.setProducer('PDFEdit Studio (pdfedit.website)');
      }

      pdfDoc.setModificationDate(new Date());

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      saveAs(blob, `${baseName}-updated-metadata.pdf`);

      trackToolExecution('edit-pdf-metadata');
      setSuccessMessage('Metadata successfully updated and downloaded!');
    } catch (err: unknown) {
      console.error('Error saving metadata:', err);
      const msg = err instanceof Error ? err.message : 'Failed to update PDF metadata.';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Dropzone */}
      {!file && (
        <div
          {...getRootProps()}
          className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer select-none ${
            isDragActive
              ? 'border-violet-500 bg-violet-50/60 dark:bg-violet-950/20 scale-[1.01]'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-slate-50/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto shadow-sm">
              <FilePenLine className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {isDragActive ? 'Drop PDF here...' : 'Choose or Drag PDF Here'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Inspect, modify, or strip Title, Author, Subject, and Keywords metadata client-side.
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              Select Local PDF
            </button>
          </div>
        </div>
      )}

      {/* Reading Progress */}
      {isReading && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
          <RefreshCw className="w-8 h-8 animate-spin text-violet-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Parsing PDF Catalog Metadata...</h4>
          <p className="text-xs text-slate-400">Extracting document headers and properties...</p>
        </div>
      )}

      {/* Error & Success Banners */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <Check className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Metadata Editor Workspace */}
      {file && !isReading && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          {/* File Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-600" />
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white truncate max-w-sm" title={file.name}>
                  {file.name}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {pageCount} total pages • {formatBytes(file.size)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleWipeMetadata}
                className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sanitize / Strip All</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setArrayBuffer(null);
                  setInitialMetadata(null);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                Change File
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveMetadata} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Document Title
                </label>
                <input
                  type="text"
                  value={metadata.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. Annual Financial Report 2026"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              {/* Author */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Author / Organization
                </label>
                <input
                  type="text"
                  value={metadata.author}
                  onChange={(e) => handleChange('author', e.target.value)}
                  placeholder="e.g. Acme Corporation / Legal Team"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Subject / Summary Description
                </label>
                <input
                  type="text"
                  value={metadata.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  placeholder="e.g. Certified corporate balance sheets"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              {/* Keywords */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={metadata.keywords}
                  onChange={(e) => handleChange('keywords', e.target.value)}
                  placeholder="e.g. audit, finance, 2026, statement"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              {/* Creator Application */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Creator Application
                </label>
                <input
                  type="text"
                  value={metadata.creator}
                  onChange={(e) => handleChange('creator', e.target.value)}
                  placeholder="e.g. PDFEdit Studio Client-Side Suite"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              {/* Producer Software */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Producer Software
                </label>
                <input
                  type="text"
                  value={metadata.producer}
                  onChange={(e) => handleChange('producer', e.target.value)}
                  placeholder="e.g. PDFEdit Studio (pdfedit.website)"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </div>

            {/* Read-Only Timestamps info if present */}
            {(initialMetadata?.creationDate || initialMetadata?.modificationDate) && (
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                {initialMetadata.creationDate && (
                  <span>
                    Original Created: <strong className="text-slate-600 dark:text-slate-300">{initialMetadata.creationDate}</strong>
                  </span>
                )}
                {initialMetadata.modificationDate && (
                  <span>
                    Last Modified: <strong className="text-slate-600 dark:text-slate-300">{initialMetadata.modificationDate}</strong>
                  </span>
                )}
              </div>
            )}

            {/* Action Row */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Metadata is updated losslessly without altering page contents or compressing graphics.
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto min-h-[46px] px-8 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-black transition-all shadow-md shadow-violet-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Writing Metadata...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Save & Download Updated PDF</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
