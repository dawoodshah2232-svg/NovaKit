'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';

if (typeof window !== 'undefined') pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

type SignatureMode = 'draw' | 'type' | 'upload';

interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
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

  const [mode, setMode] = useState<SignatureMode>('draw');
  const [typedText, setTypedText] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageType, setImageType] = useState<'png' | 'jpg'>('png');

  const [signaturePosition, setSignaturePosition] = useState<Position>({ x: 100, y: 100, width: 200, height: 60 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (uploadedImage) {
        try {
          URL.revokeObjectURL(uploadedImage);
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, [uploadedImage]);

  // Render typed signature to canvas
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
  }, [typedText, mode]);

  // Load PDF and render preview
  const loadPdfFile = useCallback(async (selectedFile: File) => {
    setBusy(true);
    setError('');
    setStatus('Loading PDF...');

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
      setBusy(false);
    }
  }, []);

  // Render current page preview
  useEffect(() => {
    if (!pdfDoc || !previewCanvasRef.current || !containerRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1 });

        // Store PDF page dimensions for coordinate conversion
        setPdfPageDimensions({ width: viewport.width, height: viewport.height });

        // Calculate scale to fit container
        const containerWidth = containerRef.current!.clientWidth - 32;
        const scale = Math.min(containerWidth / viewport.width, 2);
        setPageScale(scale);

        const scaledViewport = page.getViewport({ scale });
        const canvas = previewCanvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        await page.render({ canvas, canvasContext: ctx, viewport: scaledViewport }).promise;
      } catch (err) {
        console.error('Error rendering page:', err);
      }
    };

    renderPage();
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
    canvas.setPointerCapture(e.pointerId);
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

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setTypedText('');
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
      setUploadedImage(null);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageFile = e.target.files?.[0];
    if (!imageFile) return;

    // Revoke previous URL
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
    }

    const url = URL.createObjectURL(imageFile);
    setUploadedImage(url);
    setImageType(imageFile.type === 'image/jpeg' ? 'jpg' : 'png');
    setMode('upload');
  };

  // Drag signature on preview
  const handlePreviewPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / pageScale;
    const y = (e.clientY - rect.top) / pageScale;

    // Check if clicking on signature box
    const sig = signaturePosition;
    const clickOnSignature = x >= sig.x && x <= sig.x + sig.width && y >= sig.y && y <= sig.y + sig.height;

    // Check if clicking on resize handle (bottom-right corner)
    const handleSize = 20;
    const clickOnHandle =
      x >= sig.x + sig.width - handleSize/pageScale &&
      x <= sig.x + sig.width + handleSize/pageScale &&
      y >= sig.y + sig.height - handleSize/pageScale &&
      y <= sig.y + sig.height + handleSize/pageScale;

    if (clickOnHandle) {
      setIsResizing(true);
      setDragStart({ x: sig.x + sig.width, y: sig.y + sig.height });
      e.currentTarget.setPointerCapture(e.pointerId);
    } else if (clickOnSignature) {
      setIsDragging(true);
      setDragStart({ x: x - sig.x, y: y - sig.y });
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePreviewPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / pageScale;
    const y = (e.clientY - rect.top) / pageScale;

    if (isDragging) {
      const newX = Math.max(0, Math.min(pdfPageDimensions.width - signaturePosition.width, x - dragStart.x));
      const newY = Math.max(0, Math.min(pdfPageDimensions.height - signaturePosition.height, y - dragStart.y));

      setSignaturePosition(prev => ({
        ...prev,
        x: newX,
        y: newY
      }));
    } else if (isResizing) {
      const newWidth = Math.max(50, Math.min(pdfPageDimensions.width - signaturePosition.x, x - signaturePosition.x));
      const newHeight = Math.max(30, Math.min(pdfPageDimensions.height - signaturePosition.y, y - signaturePosition.y));

      setSignaturePosition(prev => ({
        ...prev,
        width: newWidth,
        height: newHeight
      }));
    }
  };

  const handlePreviewPointerUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // Export signed PDF
  const exportSignedPdf = async () => {
    if (!file) return;

    setBusy(true);
    setError('');
    setStatus('Creating signed PDF...');

    try {
      const pdfDoc = await PDFDocument.load(await file.arrayBuffer());

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

      // Embed image
      const image = mode === 'upload' && imageType === 'jpg'
        ? await pdfDoc.embedJpg(imageBytes)
        : await pdfDoc.embedPng(imageBytes);

      // Get page and convert coordinates
      const page = pdfDoc.getPage(currentPage - 1);
      const { height: pageHeight } = page.getSize();

      // Convert from screen coordinates to PDF coordinates (PDF origin is bottom-left)
      const pdfX = signaturePosition.x;
      const pdfY = pageHeight - signaturePosition.y - signaturePosition.height;

      // Draw signature
      page.drawImage(image, {
        x: pdfX,
        y: pdfY,
        width: signaturePosition.width,
        height: signaturePosition.height
      });

      // Save
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      saveAs(blob, `${file.name.replace(/\.pdf$/i, '')}_signed.pdf`);

      setStatus('PDF signed and downloaded successfully');
      trackToolExecution('sign-pdf', true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not sign PDF';
      setError(message);
      setStatus('');
      trackToolExecution('sign-pdf', false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-lg font-black text-slate-950 dark:text-white">Sign PDF</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Upload a PDF, create your signature, then drag it to position visually on the page.
        </p>
      </div>

      {/* File Upload */}
      <div>
        <label htmlFor="pdf-file-input" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Select PDF Document
        </label>
        <input
          id="pdf-file-input"
          type="file"
          accept="application/pdf,.pdf"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) loadPdfFile(selectedFile);
          }}
          className="block w-full rounded-xl border border-slate-300 p-3 text-sm dark:border-slate-700 dark:bg-slate-950"
          disabled={busy}
        />
      </div>

      {file && (
        <>
          {/* Page Navigation */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || busy}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Page {currentPage} of {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
              disabled={currentPage === pageCount || busy}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Next page"
            >
              Next
            </button>
          </div>

          {/* Signature Creation */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Create Signature
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={() => setMode('draw')}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  mode === 'draw'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                Draw
              </button>
              <button
                type="button"
                onClick={() => setMode('type')}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  mode === 'type'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                Type
              </button>
              <label
                className={`rounded-lg border px-4 py-2 text-sm font-semibold cursor-pointer transition focus-within:ring-2 focus-within:ring-blue-500 ${
                  mode === 'upload'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
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
                className="w-full rounded-lg border border-slate-300 p-3 text-sm mb-3 dark:border-slate-700 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full h-28 touch-none rounded-xl border border-dashed border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
                aria-label="Signature canvas - draw your signature here"
              />
            )}

            {mode === 'upload' && uploadedImage && (
              <img
                src={uploadedImage}
                alt="Uploaded signature preview"
                className="max-h-28 max-w-full rounded border p-2 bg-white dark:bg-slate-950"
              />
            )}

            <button
              type="button"
              onClick={clearSignature}
              className="mt-2 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none focus:underline"
            >
              Clear Signature
            </button>
          </div>

          {/* PDF Preview with Signature Overlay */}
          <div ref={containerRef}>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Position Signature (drag to move, drag corner to resize)
            </label>
            <div
              className="relative inline-block"
              onPointerDown={handlePreviewPointerDown}
              onPointerMove={handlePreviewPointerMove}
              onPointerUp={handlePreviewPointerUp}
              style={{ touchAction: 'none', cursor: isDragging ? 'grabbing' : 'default' }}
            >
              <canvas
                ref={previewCanvasRef}
                className="border border-slate-300 rounded-lg dark:border-slate-700"
              />
              {/* Signature overlay */}
              <div
                className="absolute border-2 border-blue-500 bg-blue-500/10 rounded pointer-events-none"
                style={{
                  left: `${signaturePosition.x * pageScale}px`,
                  top: `${signaturePosition.y * pageScale}px`,
                  width: `${signaturePosition.width * pageScale}px`,
                  height: `${signaturePosition.height * pageScale}px`,
                  cursor: 'move'
                }}
              >
                {/* Resize handle */}
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full transform translate-x-1/2 translate-y-1/2"
                  style={{ cursor: 'nwse-resize' }}
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Drag the blue box to position your signature. Drag the corner to resize. This is a visual signature mark, not a certificate-based digital signature.
            </p>
          </div>

          {/* Size Controls */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label className="text-xs">
              Width (px)
              <input
                type="number"
                min="50"
                max="500"
                value={Math.round(signaturePosition.width)}
                onChange={(e) => setSignaturePosition(prev => ({
                  ...prev,
                  width: Math.max(50, Number(e.target.value))
                }))}
                className="mt-1 w-full rounded border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="text-xs">
              Height (px)
              <input
                type="number"
                min="30"
                max="300"
                value={Math.round(signaturePosition.height)}
                onChange={(e) => setSignaturePosition(prev => ({
                  ...prev,
                  height: Math.max(30, Number(e.target.value))
                }))}
                className="mt-1 w-full rounded border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="text-xs">
              X Position
              <input
                type="number"
                min="0"
                value={Math.round(signaturePosition.x)}
                onChange={(e) => setSignaturePosition(prev => ({
                  ...prev,
                  x: Math.max(0, Number(e.target.value))
                }))}
                className="mt-1 w-full rounded border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="text-xs">
              Y Position
              <input
                type="number"
                min="0"
                value={Math.round(signaturePosition.y)}
                onChange={(e) => setSignaturePosition(prev => ({
                  ...prev,
                  y: Math.max(0, Number(e.target.value))
                }))}
                className="mt-1 w-full rounded border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>

          {/* Status Messages */}
          {error && (
            <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              {error}
            </p>
          )}
          {status && (
            <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {status}
            </p>
          )}

          {/* Export Button */}
          <button
            type="button"
            onClick={exportSignedPdf}
            disabled={busy}
            className="min-h-12 w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            {busy ? 'Signing PDF...' : 'Download Signed PDF'}
          </button>
        </>
      )}
    </div>
  );
}
