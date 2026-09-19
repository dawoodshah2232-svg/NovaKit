'use client';

import React, { useState, useCallback, useId } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { trackToolExecution } from '@/lib/analytics';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  UploadCloud,
  FileText,
  GripVertical,
  Trash2,
  Download,
  RotateCcw,
  ShieldCheck,
  Plus,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  FileCheck2,
  Layers,
} from 'lucide-react';

export interface PdfFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
  error?: string;
}

// Utility to format byte sizes
function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Individual Sortable PDF Row Component
interface SortablePdfItemProps {
  item: PdfFileItem;
  index: number;
  totalItems: number;
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

function SortablePdfItem({
  item,
  index,
  totalItems,
  onRemove,
  onMoveUp,
  onMoveDown,
}: SortablePdfItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center justify-between gap-1.5 sm:gap-2 p-2.5 sm:p-4 rounded-2xl border transition-all duration-150 ${
        isDragging
          ? 'bg-emerald-50/90 dark:bg-emerald-950/70 border-emerald-500 shadow-xl ring-2 ring-emerald-500/30 opacity-95 scale-[1.01]'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
      }`}
    >
      {/* Left section: Drag handle + Index badge + File metadata */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
        {/* Drag handle button with minimum 48px touch target */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder ${item.name}`}
          className="min-h-[48px] min-w-[48px] -ml-1 sm:ml-0 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-grab active:cursor-grabbing touch-none shrink-0"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Order index badge */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/70 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-black shrink-0">
          {index + 1}
        </div>

        {/* File icon */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 items-center justify-center shrink-0 hidden xs:flex">
          <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>

        {/* File name and metadata */}
        <div className="min-w-0 flex-1 pr-1">
          <p
            className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px] xs:max-w-[200px] sm:max-w-xs md:max-w-md"
            title={item.name}
          >
            {item.name}
          </p>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
            <span>{formatBytes(item.size)}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            {item.pageCount !== undefined ? (
              <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <Layers className="w-3 h-3" />
                <span>{item.pageCount} {item.pageCount === 1 ? 'pg' : 'pgs'}</span>
              </span>
            ) : item.error ? (
              <span className="text-amber-500 font-medium">Unreadable</span>
            ) : (
              <span className="text-slate-400 animate-pulse">Reading...</span>
            )}
          </div>
        </div>
      </div>

      {/* Right section: Reorder shortcuts + Delete button (all min 48px touch targets) */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        {/* Touch-friendly up/down reorder buttons */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-slate-800 pr-1 mr-0.5">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMoveUp(index)}
            aria-label={`Move ${item.name} up`}
            className="min-h-[48px] min-w-[38px] sm:min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:pointer-events-none transition-colors touch-manipulation active:scale-95"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={index === totalItems - 1}
            onClick={() => onMoveDown(index)}
            aria-label={`Move ${item.name} down`}
            className="min-h-[48px] min-w-[38px] sm:min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:pointer-events-none transition-colors touch-manipulation active:scale-95"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        {/* Delete button (minimum 48px touch target) */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name}`}
          className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors active:scale-95 touch-manipulation cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function PdfMerger() {
  const [pdfFiles, setPdfFiles] = useState<PdfFileItem[]>([]);
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const dndContextId = useId();

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before dragging starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Read page count asynchronously in-browser using pdf-lib
  const inspectPdf = useCallback(async (file: File): Promise<number | undefined> => {
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      return pdf.getPageCount();
    } catch {
      return undefined;
    }
  }, []);

  // Process newly dropped or selected files
  const handleAddFiles = useCallback(
    async (files: File[]) => {
      setErrorMessage(null);
      setSuccessMessage(null);

      const pdfCandidates = files.filter(
        (file) =>
          file.type === 'application/pdf' ||
          file.name.toLowerCase().endsWith('.pdf')
      );

      if (pdfCandidates.length === 0) {
        setErrorMessage('Please select valid PDF files.');
        return;
      }

      // Create new initial items
      const newItems: PdfFileItem[] = pdfCandidates.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        pageCount: undefined,
      }));

      // Append to existing list
      setPdfFiles((prev) => [...prev, ...newItems]);

      // Inspect page counts asynchronously without blocking UI
      for (const item of newItems) {
        inspectPdf(item.file).then((pageCount) => {
          setPdfFiles((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, pageCount } : f))
          );
        });
      }
    },
    [inspectPdf]
  );

  // React-dropzone config
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleAddFiles(acceptedFiles);
      }
    },
    [handleAddFiles]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true,
    noClick: pdfFiles.length > 0, // Click inside workspace triggers custom add button instead
  });

  // Handle DragEnd from @dnd-kit
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPdfFiles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Quick move functions
  const handleMoveUp = (index: number) => {
    if (index > 0) {
      setPdfFiles((items) => arrayMove(items, index, index - 1));
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < pdfFiles.length - 1) {
      setPdfFiles((items) => arrayMove(items, index, index + 1));
    }
  };

  // Remove single file
  const handleRemoveFile = (id: string) => {
    setPdfFiles((prev) => prev.filter((item) => item.id !== id));
    setSuccessMessage(null);
  };

  // Clear all files
  const handleReset = () => {
    setPdfFiles([]);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Total summary metrics
  const totalPages = pdfFiles.reduce((acc, f) => acc + (f.pageCount || 0), 0);
  const totalBytes = pdfFiles.reduce((acc, f) => acc + f.size, 0);

  // Client-side PDF Merge execution using pdf-lib
  const handleMergeAndDownload = async () => {
    if (pdfFiles.length < 2) {
      setErrorMessage('Please add at least 2 PDF files to merge.');
      return;
    }

    setIsMerging(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. Create a brand new empty PDF document
      const mergedPdf = await PDFDocument.create();

      // 2. Sequentially load and copy pages in the exact user-sorted order
      for (let i = 0; i < pdfFiles.length; i++) {
        const item = pdfFiles[i];
        const arrayBuffer = await item.file.arrayBuffer();

        let srcPdf: PDFDocument;
        try {
          srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        } catch (loadErr) {
          console.error(`Error loading file: ${item.name}`, loadErr);
          throw new Error(
            `Unable to parse "${item.name}". The file may be password-protected or corrupted.`
          );
        }

        const copiedPages = await mergedPdf.copyPages(
          srcPdf,
          srcPdf.getPageIndices()
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      // 3. Serialize into Uint8Array bytes
      const mergedPdfBytes = await mergedPdf.save();

      // 4. Create Blob and trigger instant browser download
      const blob = new Blob([mergedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      const timestamp = new Date().toISOString().slice(0, 10);
      const downloadName = `pdfedit-merged-${timestamp}.pdf`;

      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = downloadName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Clean up object URL after a brief delay
      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 5000);

      setSuccessMessage(
        `Successfully merged ${pdfFiles.length} files (${mergedPdf.getPageCount()} pages) into ${downloadName}.`
      );
      trackToolExecution('pdf-merger');
    } catch (err) {
      console.error('PDF Merge Error:', err);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred while merging your PDF files.');
      }
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Privacy guarantee banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-medium text-emerald-800 dark:text-emerald-300 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong>Zero Server Uploads:</strong> PDF merging executes 100% locally in your browser memory. Your documents never touch a remote server.
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
          pdf-lib In-Memory
        </span>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs font-medium text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success alert */}
      {successMessage && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-800 dark:text-emerald-300">
          <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Empty State / Massive Foolproof Dropzone (Child-Friendly & Obvious) */}
      {pdfFiles.length === 0 ? (
        <div
          {...getRootProps()}
          className={`group relative rounded-3xl border-2 sm:border-3 border-dashed transition-all duration-200 p-6 sm:p-14 text-center cursor-pointer min-h-[320px] sm:min-h-[380px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(16,185,129,0.12)] active:scale-[0.98] select-none touch-manipulation ${
            isDragActive
              ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 scale-[0.99] ring-4 ring-emerald-500/20'
              : 'border-emerald-300/80 dark:border-emerald-900/60 hover:border-emerald-600 dark:hover:border-emerald-400'
          }`}
        >
          <input {...getInputProps()} aria-label="Select PDF files to merge" />
          <div className="max-w-md mx-auto space-y-4 sm:space-y-5">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-3xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform duration-200">
              <UploadCloud className="w-8 h-8 sm:w-12 sm:h-12" />
            </div>
            <div className="space-y-1 sm:space-y-1.5">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                {isDragActive ? 'Drop your PDF files here' : 'Drag & drop multiple PDFs here'}
              </h3>
              <p className="text-xs sm:text-base text-slate-500 dark:text-slate-400">
                or tap below to choose documents from your device
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 pt-0.5">
                Combine 2 or more PDF documents securely in local memory
              </p>
            </div>
            <button
              type="button"
              className="w-full sm:w-auto min-h-[50px] sm:min-h-[52px] px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base font-bold shadow-lg shadow-emerald-500/25 active:scale-95 transition-all inline-flex items-center justify-center gap-2.5 cursor-pointer touch-manipulation"
            >
              <FileText className="w-5 h-5" />
              <span>Choose PDF Files</span>
            </button>
          </div>
        </div>
      ) : (
        /* Reorderable Workspace when files are loaded */
        <div className="space-y-4 sm:space-y-5 pb-28 md:pb-0">
          {/* Workspace summary toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Merge Sequence</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60">
                  {pdfFiles.length} {pdfFiles.length === 1 ? 'file' : 'files'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Drag rows to adjust order • Total:{' '}
                <strong className="text-slate-700 dark:text-slate-200">
                  {totalPages > 0 ? `${totalPages} pages` : 'Calculating...'}
                </strong>{' '}
                ({formatBytes(totalBytes)})
              </p>
            </div>

            {/* Quick action buttons - 48px touch targets */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                type="button"
                onClick={open}
                className="flex-1 sm:flex-initial min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors active:scale-95 cursor-pointer touch-manipulation"
              >
                <Plus className="w-4 h-4" />
                <span>Add More</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="min-h-[48px] px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors active:scale-95 cursor-pointer touch-manipulation"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Hidden dropzone input for appending files */}
          <div {...getRootProps()} className="sr-only">
            <input {...getInputProps()} />
          </div>

          {/* Sortable List using @dnd-kit */}
          <DndContext
            id={dndContextId}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={pdfFiles.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 sm:space-y-2.5">
                {pdfFiles.map((item, index) => (
                  <SortablePdfItem
                    key={item.id}
                    item={item}
                    index={index}
                    totalItems={pdfFiles.length}
                    onRemove={handleRemoveFile}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Quick Notice if less than 2 files */}
          {pdfFiles.length < 2 && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Please add at least one more PDF to merge.</span>
            </div>
          )}

          {/* Sticky Bottom Action Bar (App-Level Frosted Glass on Mobile, In-Flow on Desktop) */}
          <div className="fixed bottom-0 left-0 right-0 z-50 md:static p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 md:border-t-0 md:bg-transparent md:backdrop-blur-none md:p-0 shadow-lg md:shadow-none transition-all">
            <div className="max-w-4xl mx-auto space-y-2">
              {/* Quick Mobile Micro-Status Bar */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 md:hidden px-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {pdfFiles.length} {pdfFiles.length === 1 ? 'file ready' : 'files queued'}
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {totalPages > 0 ? `${totalPages} pages` : formatBytes(totalBytes)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleMergeAndDownload}
                disabled={isMerging || pdfFiles.length < 2}
                className="w-full min-h-[52px] sm:min-h-[56px] px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm sm:text-base md:text-lg font-black shadow-xl shadow-emerald-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer touch-manipulation"
                aria-label="Merge and download combined PDF document"
              >
                {isMerging ? (
                  <>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Merging {pdfFiles.length} Documents in Browser...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>
                      {pdfFiles.length >= 2
                        ? `Merge & Download (${pdfFiles.length} Files)`
                        : 'Add 2+ Files to Merge'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
