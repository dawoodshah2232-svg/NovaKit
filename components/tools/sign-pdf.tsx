'use client';
import { brandedFileName } from '@/lib/branded-filename';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ToolFilePicker } from '@/components/tool-file-picker';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';

if (typeof window !== 'undefined') pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

type SignatureMode = 'draw' | 'type' | 'upload';

/** Signature placement box in pdf.js CSS pixels at scale 1 (1 unit = 1 PDF point), top-left origin. */
export interface SignatureBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Convert a top-left-origin signature box (pdf.js scale-1 pixels) into
 * bottom-left-origin PDF points for pdf-lib's drawImage.
 */
export function signatureBoxToPdfRect(box: SignatureBox, pageHeight: number) {
  return {
    x: box.x,
    y: pageHeight - box.y - box.height,
    width: box.width,
    height: box.height,
  };
}

/** Clamp a signature box so it stays fully inside the page (all values in scale-1 units). */
export function clampSignatureBox(
  box: SignatureBox,
  pageWidth: number,
  pageHeight: number,
  minWidth = 50,
  minHeight = 30
): SignatureBox {
  const width = Math.min(Math.max(box.width, minWidth), pageWidth);
  const height = Math.min(Math.max(box.height, minHeight), pageHeight);
  return {
    x: Math.min(Math.max(box.x, 0), Math.max(0, pageWidth - width)),
    y: Math.min(Math.max(box.y, 0), Math.max(0, pageHeight - height)),
    width,
    height,
  };
}

/** Minimal structural type for a pdf.js page render task (avoids version-specific type imports). */
interface PageRenderTask {
  promise: Promise<unknown>;
  cancel: () => void;
}

/** Lazily-rendered page thumbnail for the visual page selector. */
function PageThumbnail({
  pdfDoc,
  pageNumber,
  selected,
  onSelect,
}: {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let renderTask: PageRenderTask | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || renderedRef.current) return;
        renderedRef.current = true;

        (async () => {
          try {
            const page = await pdfDoc.getPage(pageNumber);
            if (cancelled) return;
            const viewport = page.getViewport({ scale: 1 });
            // Render at 2x the displayed 72px width for crisp thumbnails.
            const scale = 144 / viewport.width;
            const scaledViewport = page.getViewport({ scale });
            canvas.width = Math.ceil(scaledViewport.width);
            canvas.height = Math.ceil(scaledViewport.height);
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            renderTask = page.render({ canvas, canvasContext: ctx, viewport: scaledViewport }) as PageRenderTask;
            await renderTask.promise;
          } catch (err) {
            if (!cancelled) console.error(`Error rendering thumbnail for page ${pageNumber}:`, err);
          }
        })();
      },
      { rootMargin: '240px' }
    );

    observer.observe(canvas);
    return () => {
      cancelled = true;
      try {
        renderTask?.cancel();
      } catch {
        // Ignore cancellation errors.
      }
      observer.disconnect();
    };
  }, [pdfDoc, pageNumber]);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Go to page ${pageNumber}`}
      aria-current={selected ? 'page' : undefined}
      className={`flex min-h-[88px] w-[88px] shrink-0 flex-col items-center gap-1 rounded-xl border-2 p-1.5 transition focus:outline-none focus:ring-2 focus:ring-[var(--pe-accent)] ${
        selected
          ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)]'
          : 'border-slate-200 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500'
      }`}
    >
      <span className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
        <canvas ref={canvasRef} className="h-auto w-[72px]" aria-hidden="true" />
      </span>
      <span className={`text-xs font-bold ${selected ? 'text-[var(--pe-accent)] dark:text-[var(--pe-accent)]' : 'text-slate-500 dark:text-slate-400'}`}>
        {pageNumber}
      </span>
    </button>
  );
}

export function SignPdf() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageScale, setPageScale] = useState(1);
  const [pdfPageDimensions, setPdfPageDimensions] = useState({ width: 0, height: 0 });
  const [pageRendering, setPageRendering] = useState(false);

  const [mode, setMode] = useState<SignatureMode>('draw');
  const [typedText, setTypedText] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageType, setImageType] = useState<'png' | 'jpg'>('png');
  const [sigPreview, setSigPreview] = useState<string | null>(null);

  const [signaturePosition, setSignaturePosition] = useState<SignatureBox>({ x: 100, y: 100, width: 200, height: 60 });

  // Refs used by pointer handlers so they never read stale state.
  const sigBoxRef = useRef<SignatureBox>(signaturePosition);
  const renderTaskRef = useRef<PageRenderTask | null>(null);
  const renderTokenRef = useRef(0);
  const dragRef = useRef<null | { kind: 'move' | 'resize'; grabX: number; grabY: number }>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());
  const [dragKind, setDragKind] = useState<null | 'move' | 'resize'>(null);

  const [progress, setProgress] = useState<{ label: string } | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const busy = progress !== null;

  // Keep the ref mirror of the signature box in sync for pointer handlers.
  useEffect(() => {
    sigBoxRef.current = signaturePosition;
  });

  // --- Object URL bookkeeping (no memory leaks) ---
  const trackObjectUrl = useCallback((url: string) => {
    objectUrlsRef.current.add(url);
    return url;
  }, []);

  const revokeObjectUrl = useCallback((url: string | null) => {
    if (!url) return;
    objectUrlsRef.current.delete(url);
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore cleanup errors.
    }
  }, []);

  // Unmount cleanup: revoke every tracked object URL and cancel any in-flight
  // page render so no stale work touches an unmounted component.
  useEffect(() => {
    const trackedUrls = objectUrlsRef.current;
    return () => {
      renderTokenRef.current += 1;
      try {
        renderTaskRef.current?.cancel();
      } catch {
        // Ignore cancellation errors.
      }
      for (const url of trackedUrls) {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // Ignore cleanup errors.
        }
      }
      trackedUrls.clear();
    };
  }, []);

  // Snapshot the draw-canvas as a preview image for the WYSIWYG overlay.
  const refreshDrawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas && mode === 'draw') {
      try {
        setSigPreview(canvas.toDataURL('image/png'));
      } catch {
        // Canvas may be tainted/unavailable; overlay falls back to the box outline.
      }
    }
  }, [mode]);

  // Render typed signature to canvas (+ live overlay preview)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || mode !== 'type') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '42px cursive';
    ctx.fillStyle = '#111827';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedText || 'Your signature', 16, canvas.height / 2);
    try {
      setSigPreview(canvas.toDataURL('image/png'));
    } catch {
      // Ignore snapshot failures.
    }
  }, [typedText, mode]);

  // When returning to draw mode, restore the overlay preview from the canvas.
  useEffect(() => {
    if (mode === 'draw') refreshDrawPreview();
  }, [mode, refreshDrawPreview]);

  // Load PDF and render preview
  const loadPdfFile = useCallback(
    async (selectedFile: File) => {
      setProgress({ label: 'Reading document…' });
      setError('');
      setStatus('');

      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

        setPdfDoc(pdf);
        setFile(selectedFile);
        setPageCount(pdf.numPages);
        setCurrentPage(1);
        setStatus('');
      } catch {
        setError('Could not load PDF. It may be corrupted or password-protected.');
      } finally {
        setProgress(null);
      }
    },
    []
  );

  // Render current page preview (cancellable; stale renders never overwrite the canvas)
  useEffect(() => {
    if (!pdfDoc || !previewCanvasRef.current || !containerRef.current) return;

    const token = ++renderTokenRef.current;
    try {
      renderTaskRef.current?.cancel();
    } catch {
      // Ignore cancellation errors.
    }

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setPageRendering(true);

    (async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        if (token !== renderTokenRef.current) return;

        const viewport = page.getViewport({ scale: 1 });

        // Store PDF page dimensions for coordinate conversion (scale 1 === PDF points).
        setPdfPageDimensions({ width: viewport.width, height: viewport.height });

        // Calculate scale to fit container
        const containerWidth = containerRef.current!.clientWidth - 32;
        const scale = Math.min(containerWidth / viewport.width, 2);
        setPageScale(scale);

        const scaledViewport = page.getViewport({ scale });
        canvas.width = Math.floor(scaledViewport.width);
        canvas.height = Math.floor(scaledViewport.height);

        const task = page.render({ canvas, canvasContext: ctx, viewport: scaledViewport }) as PageRenderTask;
        renderTaskRef.current = task;
        await task.promise;
      } catch (err) {
        const name = err instanceof Error ? err.name : '';
        if (name !== 'RenderingCancelledException') console.error('Error rendering page:', err);
      } finally {
        if (token === renderTokenRef.current) {
          setPageRendering(false);
          renderTaskRef.current = null;
        }
      }
    })();
  }, [pdfDoc, currentPage]);

  // Drawing signature
  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode !== 'draw') return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d')!;

    ctx.beginPath();
    ctx.moveTo(
      (e.clientX - rect.left) * canvas.width / rect.width,
      (e.clientY - rect.top) * canvas.height / rect.height
    );
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // Pointer capture is best-effort.
    }
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode !== 'draw' || !e.buttons) return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d')!;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#111827';
    ctx.lineTo(
      (e.clientX - rect.left) * canvas.width / rect.width,
      (e.clientY - rect.top) * canvas.height / rect.height
    );
    ctx.stroke();
  };

  const endDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode !== 'draw') return;
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore release errors.
    }
    refreshDrawPreview();
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setTypedText('');
    setSigPreview(null);
    revokeObjectUrl(uploadedImage);
    setUploadedImage(null);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageFile = e.target.files?.[0];
    if (!imageFile) return;

    // Revoke previous URL before creating a new one.
    revokeObjectUrl(uploadedImage);

    const url = trackObjectUrl(URL.createObjectURL(imageFile));
    setUploadedImage(url);
    setSigPreview(url);
    setImageType(imageFile.type === 'image/jpeg' ? 'jpg' : 'png');
    setMode('upload');
    // Allow re-selecting the same file.
    e.target.value = '';
  };

  // --- Visual placement: drag/move, resize, tap-to-place ---
  const previewPoint = (clientX: number, clientY: number) => {
    const canvas = previewCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / pageScale,
      y: (clientY - rect.top) / pageScale,
    };
  };

  const handlePreviewPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!previewCanvasRef.current || busy || pageScale <= 0) return;

    const { x, y } = previewPoint(e.clientX, e.clientY);
    const box = sigBoxRef.current;

    // Resize handle hit zone: fixed ~28 CSS px on screen for comfortable touch.
    const tol = 28 / pageScale;
    const onHandle =
      x >= box.x + box.width - tol &&
      x <= box.x + box.width + tol &&
      y >= box.y + box.height - tol &&
      y <= box.y + box.height + tol;

    const onBox = x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Pointer capture is best-effort.
    }

    if (onHandle) {
      dragRef.current = { kind: 'resize', grabX: x - box.x, grabY: y - box.y };
      setDragKind('resize');
    } else if (onBox) {
      dragRef.current = { kind: 'move', grabX: x - box.x, grabY: y - box.y };
      setDragKind('move');
    } else {
      // Tap-to-place: center the signature where the user tapped, then keep dragging.
      const dims = pdfPageDimensions;
      const placed = clampSignatureBox(
        { x: x - box.width / 2, y: y - box.height / 2, width: box.width, height: box.height },
        dims.width,
        dims.height
      );
      setSignaturePosition(placed);
      dragRef.current = { kind: 'move', grabX: placed.width / 2, grabY: placed.height / 2 };
      setDragKind('move');
    }
  };

  const handlePreviewPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || !previewCanvasRef.current || pageScale <= 0) return;

    const { x, y } = previewPoint(e.clientX, e.clientY);
    const dims = pdfPageDimensions;
    const box = sigBoxRef.current;

    if (drag.kind === 'move') {
      setSignaturePosition(
        clampSignatureBox({ ...box, x: x - drag.grabX, y: y - drag.grabY }, dims.width, dims.height)
      );
    } else {
      const newWidth = Math.max(50, Math.min(dims.width - box.x, x - box.x));
      const newHeight = Math.max(30, Math.min(dims.height - box.y, y - box.y));
      setSignaturePosition((prev) => ({ ...prev, width: newWidth, height: newHeight }));
    }
  };

  const endPreviewDrag = () => {
    dragRef.current = null;
    setDragKind(null);
  };

  // Export signed PDF
  const exportSignedPdf = async () => {
    if (!file || busy) return;

    const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 40));
    setError('');
    setStatus('');

    try {
      setProgress({ label: 'Reading document…' });
      const outDoc = await PDFDocument.load(await file.arrayBuffer());
      await tick();

      setProgress({ label: 'Preparing signature…' });
      // Get signature image bytes
      let imageBytes: ArrayBuffer | null = null;

      if (mode === 'upload' && uploadedImage) {
        imageBytes = await (await fetch(uploadedImage)).arrayBuffer();
      } else if (canvasRef.current) {
        const dataUrl = canvasRef.current.toDataURL('image/png');
        imageBytes = await (await fetch(dataUrl)).arrayBuffer();
      }

      if (!imageBytes) {
        throw new Error('Please create a signature first');
      }
      await tick();

      setProgress({ label: 'Placing signature…' });
      // Embed image
      const image = mode === 'upload' && imageType === 'jpg'
        ? await outDoc.embedJpg(imageBytes)
        : await outDoc.embedPng(imageBytes);

      // Get page and convert the visual box (top-left origin) to PDF coordinates (bottom-left origin).
      const page = outDoc.getPage(currentPage - 1);
      const { height: pageHeight, width: pageWidth } = page.getSize();
      const rect = signatureBoxToPdfRect(
        clampSignatureBox(sigBoxRef.current, pageWidth, pageHeight),
        pageHeight
      );

      // Draw signature
      page.drawImage(image, {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      });
      await tick();

      setProgress({ label: 'Building signed PDF…' });
      const pdfBytes = await outDoc.save();

      setProgress({ label: 'Preparing download…' });
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      saveAs(blob, brandedFileName(`${file.name.replace(/\.pdf$/i, '')}_signed`, 'pdf'));

      setStatus('PDF signed and downloaded successfully');
      trackToolExecution('sign-pdf', true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not sign PDF';
      setError(message);
      setStatus('');
      trackToolExecution('sign-pdf', false);
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-lg font-black text-slate-950 dark:text-white">Sign PDF</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Upload a PDF, create your signature, then place it visually on the page.
        </p>
      </div>

      {/* File Upload */}
      <ToolFilePicker
        accept={{ 'application/pdf': ['.pdf'] }}
        multiple={false}
        files={file ? [file] : []}
        onAdd={(picked) => {
          const selectedFile = picked[0];
          if (selectedFile) loadPdfFile(selectedFile);
        }}
        onRemove={() => {
          setFile(null);
          setPdfDoc(null);
          setPageCount(0);
          setCurrentPage(1);
          setError('');
          setStatus('');
        }}
        emptyTitle="Drag & drop your PDF here"
        browseLabel="Browse PDF"
        hint="PDF only · your signature is applied locally in your browser"
        disabled={busy}
        ariaLabel="Select PDF document to sign"
        extraFileMeta={() =>
          pageCount > 0 ? (
            <span className="rounded-md bg-[var(--pe-accent-soft)] px-2 py-0.5 font-bold text-[var(--pe-accent)]">
              {pageCount} {pageCount === 1 ? 'page' : 'pages'}
            </span>
          ) : null
        }
      />

      {file && (
        <>
          {/* Signature Creation */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Create Signature
            </label>
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMode('draw')}
                className={`min-h-[44px] rounded-lg border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--pe-accent)] ${
                  mode === 'draw'
                    ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)] text-[var(--pe-accent)] dark:bg-[var(--pe-accent-soft)] dark:text-[var(--pe-accent)]'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                Draw
              </button>
              <button
                type="button"
                onClick={() => setMode('type')}
                className={`min-h-[44px] rounded-lg border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--pe-accent)] ${
                  mode === 'type'
                    ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)] text-[var(--pe-accent)] dark:bg-[var(--pe-accent-soft)] dark:text-[var(--pe-accent)]'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                Type
              </button>
              <label
                className={`inline-flex min-h-[44px] cursor-pointer items-center rounded-lg border px-4 py-2 text-sm font-semibold transition focus-within:ring-2 focus-within:ring-[var(--pe-accent)] ${
                  mode === 'upload'
                    ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)] text-[var(--pe-accent)] dark:bg-[var(--pe-accent-soft)] dark:text-[var(--pe-accent)]'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                Upload Image
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Upload signature image"
                />
              </label>
            </div>

            {mode === 'type' && (
              <input
                type="text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder="Type your name"
                className="mb-3 w-full rounded-lg border border-slate-300 p-3 text-sm dark:border-slate-700 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[var(--pe-accent)]"
                aria-label="Type signature text"
              />
            )}

            {mode !== 'upload' && (
              <canvas
                ref={canvasRef}
                width={520}
                height={100}
                onPointerDown={startDraw}
                onPointerMove={draw}
                onPointerUp={endDraw}
                onPointerCancel={endDraw}
                className="h-28 w-full touch-none rounded-xl border border-dashed border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
                aria-label="Signature canvas - draw your signature here"
              />
            )}

            {mode === 'upload' && uploadedImage && (
              <img
                src={uploadedImage}
                alt="Uploaded signature preview"
                className="max-h-28 max-w-full rounded border bg-white p-2 dark:bg-slate-950"
              />
            )}

            <button
              type="button"
              onClick={clearSignature}
              className="mt-2 min-h-[44px] text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none focus:underline"
            >
              Clear Signature
            </button>
          </div>

          {/* Visual page selector */}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || busy}
                className="min-h-[44px] rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--pe-accent)]"
                aria-label="Previous page"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Page {currentPage} of {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                disabled={currentPage === pageCount || busy}
                className="min-h-[44px] rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--pe-accent)]"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
            {pageCount > 1 && (
              <div className="mt-3">
                <p id="page-thumbnails-label" className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Choose a page
                </p>
                <div
                  role="group"
                  aria-labelledby="page-thumbnails-label"
                  className="flex gap-2 overflow-x-auto pb-2"
                  style={{ touchAction: 'pan-x pan-y' }}
                >
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => (
                    <PageThumbnail
                      key={pageNum}
                      pdfDoc={pdfDoc!}
                      pageNumber={pageNum}
                      selected={pageNum === currentPage}
                      onSelect={() => setCurrentPage(pageNum)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PDF Preview with Signature Overlay */}
          <div ref={containerRef}>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Place Signature
            </label>
            <div
              className="relative inline-block max-w-full"
              onPointerDown={handlePreviewPointerDown}
              onPointerMove={handlePreviewPointerMove}
              onPointerUp={endPreviewDrag}
              onPointerCancel={endPreviewDrag}
              style={{
                touchAction: 'none',
                cursor: dragKind === 'move' ? 'grabbing' : dragKind === 'resize' ? 'nwse-resize' : 'crosshair',
              }}
              role="application"
              aria-label="Signature placement preview. Tap to place the signature, drag to move it, drag the bottom-right handle to resize."
            >
              <canvas
                ref={previewCanvasRef}
                className="max-w-full rounded-lg border border-slate-300 dark:border-slate-700"
              />
              {pageRendering && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/60 dark:bg-slate-900/60">
                  <p className="rounded-full bg-slate-900/80 px-4 py-2 text-xs font-semibold text-white">
                    Rendering page…
                  </p>
                </div>
              )}
              {/* Signature overlay (WYSIWYG) */}
              <div
                className="pointer-events-none absolute rounded border-2 border-[var(--pe-accent)] bg-[var(--pe-accent-soft)]"
                style={{
                  left: `${signaturePosition.x * pageScale}px`,
                  top: `${signaturePosition.y * pageScale}px`,
                  width: `${signaturePosition.width * pageScale}px`,
                  height: `${signaturePosition.height * pageScale}px`,
                }}
                aria-hidden="true"
              >
                {sigPreview && (
                  <img
                    src={sigPreview}
                    alt=""
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-fill"
                  />
                )}
                {/* Resize handle: large touch target */}
                <div className="absolute bottom-0 right-0 flex h-6 w-6 translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[var(--pe-accent)] shadow-md">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M7 2l3 3M5 4l5 5M3 6l5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Tap anywhere on the page to place your signature there. Drag the box to move it, or drag the
              bottom-right handle to resize. What you see is exactly where the signature will appear in the
              exported PDF. This is a visual signature mark, not a certificate-based digital signature.
            </p>
          </div>

          {/* Status Messages */}
          {error && (
            <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              {error}
            </p>
          )}
          {progress && (
            <div role="status" className="space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
 <div className="h-full w-full animate-pulse rounded-full bg-[var(--pe-accent)]" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{progress.label}</p>
            </div>
          )}
          {status && !progress && (
            <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {status}
            </p>
          )}

          {/* Export Button */}
          <button
            type="button"
            onClick={exportSignedPdf}
            disabled={busy}
 className="min-h-12 w-full rounded-xl bg-[var(--pe-accent)] px-5 py-3 text-sm font-bold text-[var(--pe-accent-ink)] transition hover:bg-[var(--pe-accent-hover)] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--pe-focus)] focus:ring-offset-2"
          >
            {progress ? progress.label : 'Download Signed PDF'}
          </button>
        </>
      )}
    </div>
  );
}
