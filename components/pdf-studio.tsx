'use client';

import { useState, useEffect, useRef, useCallback, type ChangeEvent } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, degrees, StandardFonts, type PDFImage } from 'pdf-lib';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import Link from 'next/link';
import {
  Layers,
  Upload,
  Download,
  Trash2,
  RotateCw,
  RotateCcw,
  MoveLeft,
  MoveRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Stamp,
  PenTool,
  EyeOff,
  Scissors,
  Settings,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Copy,
  Sparkles,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { trackToolExecution } from '@/lib/analytics';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

interface PageMeta {
  pageNumber: number;
  originalIndex: number;
  rotation: number;
  thumbnailUrl: string;
  width: number;
  height: number;
}

interface RedactionBox {
  id: string;
  pageIndex: number;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  color: 'black' | 'white';
}

type StudioTab = 'pages' | 'annotate' | 'sign' | 'redact' | 'metadata' | 'tools';

export function PdfStudio() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<StudioTab>('pages');
  const [busy, setBusy] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Annotations State
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [watermarkPosition, setWatermarkPosition] = useState<'center' | 'top' | 'bottom'>('center');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.3);
  const [watermarkColor, setWatermarkColor] = useState<string>('red');
  const [pageNumberFormat, setPageNumberFormat] = useState<'none' | 'simple' | 'total'>('none');

  // Signature State
  const [sigType, setSigType] = useState<'draw' | 'type'>('draw');
  const [typedSig, setTypedSig] = useState<string>('');
  const [sigPosition, setSigPosition] = useState<'bottom-right' | 'bottom-left' | 'bottom-center'>('bottom-right');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSig, setHasDrawnSig] = useState(false);
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Redaction State
  const [redactions, setRedactions] = useState<RedactionBox[]>([]);
  const [redactionColor, setRedactionColor] = useState<'black' | 'white'>('black');
  const [isDraggingRedact, setIsDraggingRedact] = useState(false);
  const [redactStart, setRedactStart] = useState<{ x: number; y: number } | null>(null);
  const [redactCurrent, setRedactCurrent] = useState<{ x: number; y: number } | null>(null);

  // Metadata State
  const [metaTitle, setMetaTitle] = useState<string>('');
  const [metaAuthor, setMetaAuthor] = useState<string>('');
  const [metaSubject, setMetaSubject] = useState<string>('');
  const [metaKeywords, setMetaKeywords] = useState<string>('');

  // Main Canvas & Thumbnail Refs
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mainCanvasContainerRef = useRef<HTMLDivElement | null>(null);
  const thumbnailsRef = useRef<string[]>([]);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      thumbnailsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const loadPdfData = useCallback(async (data: Uint8Array, fileName: string) => {
    setBusy(true);
    setErrorMsg('');
    setSuccessMsg('');
    setStatusMsg('Rendering document in workspace...');

    try {
      // Revoke prior thumbnails
      thumbnailsRef.current.forEach((url) => URL.revokeObjectURL(url));
      thumbnailsRef.current = [];

      const loadingTask = pdfjsLib.getDocument({ data: data.slice() });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;

      const loadedPages: PageMeta[] = [];

      for (let i = 1; i <= numPages; i++) {
        setStatusMsg(`Generating preview: page ${i} of ${numPages}...`);
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.35 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;
          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.8));
          if (blob) {
            const url = URL.createObjectURL(blob);
            thumbnailsRef.current.push(url);
            loadedPages.push({
              pageNumber: i,
              originalIndex: i - 1,
              rotation: 0,
              thumbnailUrl: url,
              width: page.view[2] - page.view[0],
              height: page.view[3] - page.view[1],
            });
          }
        }
      }

      // Load PDF-Lib for metadata inspection
      try {
        const pDoc = await PDFDocument.load(data.slice(), { ignoreEncryption: true });
        setMetaTitle(pDoc.getTitle() || '');
        setMetaAuthor(pDoc.getAuthor() || '');
        setMetaSubject(pDoc.getSubject() || '');
        setMetaKeywords(pDoc.getKeywords() || '');
      } catch {
        // Continue if metadata read fails
      }

      setPdfBytes(data);
      setPages(loadedPages);
      setSelectedPageIndex(0);
      setRedactions([]);
      setSuccessMsg(`Loaded "${fileName}" (${numPages} ${numPages === 1 ? 'page' : 'pages'})`);
      trackToolExecution('pdf-studio', true);
    } catch (err: unknown) {
      console.error('Failed to load PDF in studio:', err);
      setErrorMsg((err instanceof Error && err.message) || 'Unable to load PDF document. Please verify the file is a valid, unencrypted PDF.');
      trackToolExecution('pdf-studio', false);
    } finally {
      setBusy(false);
      setStatusMsg('');
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    if (uploadedFile.type !== 'application/pdf' && !uploadedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a valid PDF file.');
      return;
    }
    setFile(uploadedFile);
    const buffer = await uploadedFile.arrayBuffer();
    await loadPdfData(new Uint8Array(buffer), uploadedFile.name);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    if (droppedFile.type !== 'application/pdf' && !droppedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please drop a valid PDF file.');
      return;
    }
    setFile(droppedFile);
    const buffer = await droppedFile.arrayBuffer();
    await loadPdfData(new Uint8Array(buffer), droppedFile.name);
  };

  const loadSamplePdf = async () => {
    setBusy(true);
    setStatusMsg('Generating sample PDF...');
    try {
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const fontReg = await doc.embedFont(StandardFonts.Helvetica);

      // Page 1
      const p1 = doc.addPage([595, 842]);
      p1.drawRectangle({ x: 0, y: 780, width: 595, height: 62, color: rgb(0.12, 0.35, 0.85) });
      p1.drawText('PDFEdit Enterprise Studio Demo', { x: 40, y: 800, size: 20, font, color: rgb(1, 1, 1) });
      p1.drawText('Welcome to your all-in-one private client-side PDF workspace.', { x: 40, y: 740, size: 14, font, color: rgb(0.2, 0.2, 0.2) });
      p1.drawText('This sample document is created directly inside your browser memory.', { x: 40, y: 710, size: 12, font: fontReg, color: rgb(0.4, 0.4, 0.4) });
      p1.drawText('Features you can test right now:', { x: 40, y: 670, size: 13, font, color: rgb(0.2, 0.2, 0.2) });
      p1.drawText('1. Page Organizer: Rotate, delete, duplicate, or reorder pages.', { x: 50, y: 640, size: 11, font: fontReg, color: rgb(0.3, 0.3, 0.3) });
      p1.drawText('2. Watermarks & Stamps: Add custom text and page numbering.', { x: 50, y: 615, size: 11, font: fontReg, color: rgb(0.3, 0.3, 0.3) });
      p1.drawText('3. Digital Signatures: Draw or type your signature directly.', { x: 50, y: 590, size: 11, font: fontReg, color: rgb(0.3, 0.3, 0.3) });
      p1.drawText('4. Redaction: Draw blackout boxes over sensitive information.', { x: 50, y: 565, size: 11, font: fontReg, color: rgb(0.3, 0.3, 0.3) });
      p1.drawText('Confidential Sample Data: Account #4829-1928-3920-1123', { x: 40, y: 500, size: 12, font, color: rgb(0.8, 0.1, 0.1) });

      // Page 2
      const p2 = doc.addPage([595, 842]);
      p2.drawRectangle({ x: 0, y: 780, width: 595, height: 62, color: rgb(0.1, 0.6, 0.4) });
      p2.drawText('Sample Page 2 — Analytics & Records', { x: 40, y: 800, size: 20, font, color: rgb(1, 1, 1) });
      p2.drawText('Test page splitting, page number stamping, and metadata sanitization.', { x: 40, y: 740, size: 13, font: fontReg, color: rgb(0.3, 0.3, 0.3) });

      // Page 3
      const p3 = doc.addPage([595, 842]);
      p3.drawRectangle({ x: 0, y: 780, width: 595, height: 62, color: rgb(0.5, 0.2, 0.8) });
      p3.drawText('Sample Page 3 — Authorization Signoff', { x: 40, y: 800, size: 20, font, color: rgb(1, 1, 1) });
      p3.drawText('Sign this page in the bottom signature block or add your company seal.', { x: 40, y: 740, size: 13, font: fontReg, color: rgb(0.3, 0.3, 0.3) });

      const bytes = await doc.save();
      const mockFile = new File([bytes.buffer as ArrayBuffer], 'PDFEdit-Sample-Document.pdf', { type: 'application/pdf' });
      setFile(mockFile);
      await loadPdfData(bytes, mockFile.name);
    } catch (err: unknown) {
      setErrorMsg('Failed to generate sample PDF: ' + (err instanceof Error ? err.message : 'unknown error'));
      setBusy(false);
    }
  };

  // Render active page on the main canvas
  useEffect(() => {
    if (!pdfBytes || pages.length === 0 || selectedPageIndex >= pages.length) return;

    let isCancelled = false;

    async function renderMainCanvas() {
      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const pageMeta = pages[selectedPageIndex];
        if (!pageMeta) return;

        const loadingTask = pdfjsLib.getDocument({ data: pdfBytes!.slice() });
        const pdfDoc = await loadingTask.promise;
        const page = await pdfDoc.getPage(pageMeta.originalIndex + 1);

        if (isCancelled) return;

        const scale = (zoomLevel / 100) * 1.5;
        const viewport = page.getViewport({
          scale,
          rotation: (page.rotate + pageMeta.rotation) % 360,
        });

        const canvas = mainCanvasRef.current;
        if (!canvas) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const renderTask = page.render({ canvas, canvasContext: ctx, viewport });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err: unknown) {
        if (!(err instanceof Error) || err.name !== 'RenderingCancelledException') {
          console.error('Error rendering main canvas:', err);
        }
      }
    }

    renderMainCanvas();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfBytes, pages, selectedPageIndex, zoomLevel]);

  // Page Operations
  const rotateActivePage = (deg: number) => {
    if (pages.length === 0) return;
    setPages((prev) =>
      prev.map((p, idx) => (idx === selectedPageIndex ? { ...p, rotation: (p.rotation + deg + 360) % 360 } : p))
    );
  };

  const rotateAllPages = (deg: number) => {
    setPages((prev) => prev.map((p) => ({ ...p, rotation: (p.rotation + deg + 360) % 360 })));
  };

  const deleteActivePage = () => {
    if (pages.length <= 1) {
      setErrorMsg('Cannot delete the only page in document.');
      return;
    }
    const newPages = pages.filter((_, idx) => idx !== selectedPageIndex);
    setPages(newPages);
    if (selectedPageIndex >= newPages.length) {
      setSelectedPageIndex(newPages.length - 1);
    }
  };

  const duplicateActivePage = () => {
    const cur = pages[selectedPageIndex];
    if (!cur) return;
    const newPages = [...pages];
    newPages.splice(selectedPageIndex + 1, 0, {
      ...cur,
      pageNumber: pages.length + 1,
    });
    setPages(newPages);
    setSelectedPageIndex(selectedPageIndex + 1);
  };

  const movePage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= pages.length || fromIdx === toIdx) return;
    const newPages = [...pages];
    const [moved] = newPages.splice(fromIdx, 1);
    newPages.splice(toIdx, 0, moved);
    setPages(newPages);
    setSelectedPageIndex(toIdx);
  };

  const reverseAllPages = () => {
    setPages([...pages].reverse());
    setSelectedPageIndex(0);
  };

  // Signature Canvas Drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
    setHasDrawnSig(true);
  };

  const drawOnCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSigCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSig(false);
  };

  // Redaction Selection
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTab !== 'redact') return;
    const container = mainCanvasContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRedactStart({ x, y });
    setRedactCurrent({ x, y });
    setIsDraggingRedact(true);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRedact || activeTab !== 'redact') return;
    const container = mainCanvasContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setRedactCurrent({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleCanvasMouseUp = () => {
    if (!isDraggingRedact || !redactStart || !redactCurrent || activeTab !== 'redact') {
      setIsDraggingRedact(false);
      return;
    }

    const container = mainCanvasContainerRef.current;
    if (!container) return;

    const width = Math.abs(redactCurrent.x - redactStart.x);
    const height = Math.abs(redactCurrent.y - redactStart.y);

    if (width > 10 && height > 10) {
      const startX = Math.min(redactStart.x, redactCurrent.x);
      const startY = Math.min(redactStart.y, redactCurrent.y);

      const xPercent = (startX / container.clientWidth) * 100;
      const yPercent = (startY / container.clientHeight) * 100;
      const widthPercent = (width / container.clientWidth) * 100;
      const heightPercent = (height / container.clientHeight) * 100;

      const newRedaction: RedactionBox = {
        id: Math.random().toString(36).substring(2, 9),
        pageIndex: selectedPageIndex,
        xPercent,
        yPercent,
        widthPercent,
        heightPercent,
        color: redactionColor,
      };

      setRedactions((prev) => [...prev, newRedaction]);
    }

    setIsDraggingRedact(false);
    setRedactStart(null);
    setRedactCurrent(null);
  };

  // Compile & Export Document
  const exportModifiedPdf = async (options: { flatten?: boolean } = {}) => {
    if (!pdfBytes || pages.length === 0) return;

    setBusy(true);
    setStatusMsg('Assembling modified PDF document...');
    setErrorMsg('');

    try {
      const srcDoc = await PDFDocument.load(pdfBytes.slice(), { ignoreEncryption: true });
      const outDoc = await PDFDocument.create();

      // Embed standard fonts for stamps/text
      const font = await outDoc.embedFont(StandardFonts.HelveticaBold);
      const regFont = await outDoc.embedFont(StandardFonts.Helvetica);

      // Embed signature if available
      let sigImageEmbed: PDFImage | null = null;
      if (activeTab === 'sign') {
        if (sigType === 'draw' && hasDrawnSig && sigCanvasRef.current) {
          const dataUrl = sigCanvasRef.current.toDataURL('image/png');
          const imageBytes = await fetch(dataUrl).then((r) => r.arrayBuffer());
          sigImageEmbed = await outDoc.embedPng(imageBytes);
        }
      }

      // Copy pages according to user ordering
      for (let i = 0; i < pages.length; i++) {
        const pageMeta = pages[i];
        const [copiedPage] = await outDoc.copyPages(srcDoc, [pageMeta.originalIndex]);

        // Apply rotation
        if (pageMeta.rotation !== 0) {
          const currentRotation = copiedPage.getRotation().angle;
          copiedPage.setRotation(degrees((currentRotation + pageMeta.rotation) % 360));
        }

        const { width, height } = copiedPage.getSize();

        // 1. Watermark Stamp
        if (watermarkText.trim()) {
          const wColor =
            watermarkColor === 'red'
              ? rgb(0.9, 0.1, 0.1)
              : watermarkColor === 'blue'
              ? rgb(0.1, 0.3, 0.9)
              : rgb(0.3, 0.3, 0.3);

          if (watermarkPosition === 'center') {
            const textSize = Math.min(width, height) * 0.08;
            const textWidth = font.widthOfTextAtSize(watermarkText, textSize);
            copiedPage.drawText(watermarkText, {
              x: (width - textWidth) / 2,
              y: height / 2 - textSize / 2,
              size: textSize,
              font,
              color: wColor,
              opacity: watermarkOpacity,
              rotate: degrees(35),
            });
          } else if (watermarkPosition === 'top') {
            copiedPage.drawText(watermarkText, {
              x: 40,
              y: height - 30,
              size: 11,
              font,
              color: wColor,
              opacity: watermarkOpacity,
            });
          } else if (watermarkPosition === 'bottom') {
            copiedPage.drawText(watermarkText, {
              x: 40,
              y: 20,
              size: 11,
              font,
              color: wColor,
              opacity: watermarkOpacity,
            });
          }
        }

        // 2. Page Numbers
        if (pageNumberFormat !== 'none') {
          const numText =
            pageNumberFormat === 'total' ? `Page ${i + 1} of ${pages.length}` : `${i + 1}`;
          const numSize = 10;
          const numWidth = regFont.widthOfTextAtSize(numText, numSize);
          copiedPage.drawText(numText, {
            x: (width - numWidth) / 2,
            y: 18,
            size: numSize,
            font: regFont,
            color: rgb(0.3, 0.3, 0.3),
          });
        }

        // 3. Digital Signature (if active and target page matches)
        if (i === selectedPageIndex) {
          if (sigImageEmbed) {
            const sigWidth = 140;
            const sigHeight = (sigImageEmbed.height / sigImageEmbed.width) * sigWidth;
            let sigX = width - sigWidth - 40;
            if (sigPosition === 'bottom-left') sigX = 40;
            if (sigPosition === 'bottom-center') sigX = (width - sigWidth) / 2;

            copiedPage.drawImage(sigImageEmbed, {
              x: sigX,
              y: 40,
              width: sigWidth,
              height: sigHeight,
            });
          } else if (sigType === 'type' && typedSig.trim()) {
            const tSigSize = 18;
            let sigX = width - 160;
            if (sigPosition === 'bottom-left') sigX = 40;
            if (sigPosition === 'bottom-center') sigX = (width - 120) / 2;

            copiedPage.drawText(typedSig, {
              x: sigX,
              y: 50,
              size: tSigSize,
              font,
              color: rgb(0.1, 0.2, 0.6),
            });
          }
        }

        // 4. Redaction Blackouts
        const pageRedactions = redactions.filter((r) => r.pageIndex === i);
        for (const r of pageRedactions) {
          const boxX = (r.xPercent / 100) * width;
          const boxWidth = (r.widthPercent / 100) * width;
          const boxHeight = (r.heightPercent / 100) * height;
          // Invert Y coordinate from top-left browser canvas to bottom-left PDF coordinate system
          const boxY = height - (r.yPercent / 100) * height - boxHeight;

          const rColor = r.color === 'white' ? rgb(1, 1, 1) : rgb(0, 0, 0);

          copiedPage.drawRectangle({
            x: boxX,
            y: boxY,
            width: boxWidth,
            height: boxHeight,
            color: rColor,
          });
        }

        outDoc.addPage(copiedPage);
      }

      // Metadata setting
      if (metaTitle) outDoc.setTitle(metaTitle);
      if (metaAuthor) outDoc.setAuthor(metaAuthor);
      if (metaSubject) outDoc.setSubject(metaSubject);
      if (metaKeywords) outDoc.setKeywords(metaKeywords.split(',').map((k) => k.trim()));
      outDoc.setProducer('PDFEdit Enterprise Studio (https://www.pdfedit.website/)');

      // Flatten forms if requested
      if (options.flatten) {
        try {
          const form = outDoc.getForm();
          form.flatten();
        } catch {
          // No forms to flatten
        }
      }

      const outBytes = await outDoc.save();
      const outBlob = new Blob([outBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const outName = file?.name
        ? file.name.replace(/\.pdf$/i, '') + '-edited.pdf'
        : 'PDFEdit-Studio-Export.pdf';

      saveAs(outBlob, outName);
      setSuccessMsg(`Successfully exported "${outName}"!`);
      trackToolExecution('pdf-studio', true);
    } catch (err: unknown) {
      console.error('Error exporting PDF:', err);
      setErrorMsg('Failed to export PDF: ' + (err instanceof Error ? err.message : 'unknown error'));
      trackToolExecution('pdf-studio', false);
    } finally {
      setBusy(false);
      setStatusMsg('');
    }
  };

  // Quick Extract Text
  const extractTextFromActiveDoc = async () => {
    if (!pdfBytes) return;
    setBusy(true);
    setStatusMsg('Extracting text content...');
    try {
      const pdf = await pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise;
      let fullText = `PDFEdit Studio Text Extraction\nDocument: ${file?.name || 'Untitled'}\nPages: ${pdf.numPages}\n\n`;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .filter((item) => 'str' in item && typeof item.str === 'string')
          .map((item) => ('str' in item ? String(item.str) : ''))
          .join(' ');
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
      }

      const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, (file?.name ? file.name.replace(/\.pdf$/i, '') : 'document') + '-text.txt');
      setSuccessMsg('Extracted and downloaded document text.');
      trackToolExecution('pdf-studio', true);
    } catch (err: unknown) {
      setErrorMsg('Failed to extract text: ' + (err instanceof Error ? err.message : 'unknown error'));
      trackToolExecution('pdf-studio', false);
    } finally {
      setBusy(false);
      setStatusMsg('');
    }
  };

  // Quick Export High-Res Images ZIP
  const exportImagesZip = async () => {
    if (!pdfBytes) return;
    setBusy(true);
    setStatusMsg('Rendering pages to high-res images...');
    try {
      const pdf = await pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise;
      const zip = new JSZip();

      for (let i = 1; i <= pdf.numPages; i++) {
        setStatusMsg(`Rendering image ${i} of ${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;
          const imgBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
          if (imgBlob) {
            zip.file(`page-${String(i).padStart(3, '0')}.jpg`, imgBlob);
          }
        }
      }

      setStatusMsg('Packaging ZIP bundle...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, (file?.name ? file.name.replace(/\.pdf$/i, '') : 'document') + '-images.zip');
      setSuccessMsg('Successfully exported images ZIP archive.');
      trackToolExecution('pdf-studio', true);
    } catch (err: unknown) {
      setErrorMsg('Failed to export images ZIP: ' + (err instanceof Error ? err.message : 'unknown error'));
      trackToolExecution('pdf-studio', false);
    } finally {
      setBusy(false);
      setStatusMsg('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">PDFEdit Master Studio</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
                Workspace v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {file ? `${file.name} (${pages.length} pages)` : '100% In-Browser Interactive PDF Editor'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {file && (
            <>
              <button
                type="button"
                onClick={() => exportModifiedPdf({ flatten: false })}
                disabled={busy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>

              <button
                type="button"
                onClick={() => exportModifiedPdf({ flatten: true })}
                disabled={busy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
                title="Flattens all annotations and form fields into static content"
              >
                <span>Flatten & Export</span>
              </button>
            </>
          )}

          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer transition">
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>{file ? 'Replace File' : 'Open PDF'}</span>
            <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
          </label>

          {!file && (
            <button
              type="button"
              onClick={loadSamplePdf}
              disabled={busy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Try Sample PDF</span>
            </button>
          )}
        </div>
      </header>

      {/* Notifications & Status Banner */}
      {(statusMsg || errorMsg || successMsg) && (
        <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            {busy && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />}
            {errorMsg && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
            {successMsg && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span className={errorMsg ? 'text-rose-300' : successMsg ? 'text-emerald-300' : 'text-slate-300'}>
              {statusMsg || errorMsg || successMsg}
            </span>
          </div>
          {(errorMsg || successMsg) && (
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-slate-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Main Workspace Layout */}
      {!file ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="w-full max-w-2xl border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-3xl p-10 bg-slate-950/50 backdrop-blur-sm transition flex flex-col items-center justify-center cursor-pointer mb-8"
          >
            <div className="w-20 h-20 rounded-2xl bg-blue-950/80 border border-blue-800/50 flex items-center justify-center text-blue-400 mb-4 shadow-inner">
              <Layers className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Drag & Drop Your PDF File Here</h2>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              Organize, annotate, sign, redact, reorder, stamp, and transform your PDF documents directly in your browser with zero server uploads.
            </p>

            <div className="flex items-center gap-3 flex-wrap justify-center">
              <label className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl cursor-pointer shadow-lg shadow-blue-600/20 transition">
                Browse PDF Files
                <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
              </label>
              <button
                type="button"
                onClick={loadSamplePdf}
                disabled={busy}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold rounded-xl transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Load Sample PDF
              </button>
            </div>
          </div>

          {/* Quick Features Highlight */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full text-left">
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80">
              <div className="text-blue-400 mb-2 font-bold text-sm flex items-center gap-1.5">
                <RotateCw className="w-4 h-4" /> Page Manager
              </div>
              <p className="text-xs text-slate-400">Reorder, delete, duplicate, or rotate single and multi-page layouts.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80">
              <div className="text-emerald-400 mb-2 font-bold text-sm flex items-center gap-1.5">
                <Stamp className="w-4 h-4" /> Watermark & Numbers
              </div>
              <p className="text-xs text-slate-400">Add Bates numbering, confidential stamps, and custom header/footers.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80">
              <div className="text-purple-400 mb-2 font-bold text-sm flex items-center gap-1.5">
                <PenTool className="w-4 h-4" /> Sign & Annotate
              </div>
              <p className="text-xs text-slate-400">Draw or type electronic signatures directly onto target pages.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80">
              <div className="text-rose-400 mb-2 font-bold text-sm flex items-center gap-1.5">
                <EyeOff className="w-4 h-4" /> Redact & Blackout
              </div>
              <p className="text-xs text-slate-400">Permanently blackout sensitive numbers, PII, and financial data.</p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Private In-Browser
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-blue-400">
              <Zap className="w-3.5 h-3.5" /> Zero Server Uploads
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Lock className="w-3.5 h-3.5" /> Local In-Memory Buffer
            </span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar: Thumbnail Page Navigator */}
          <aside className="w-full md:w-56 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 max-h-48 md:max-h-none overflow-y-auto">
            <div className="p-3 border-b border-slate-800/80 flex items-center justify-between sticky top-0 bg-slate-950 z-10">
              <span className="text-xs font-semibold text-slate-300">Pages ({pages.length})</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={reverseAllPages}
                  title="Reverse page order"
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-3 space-y-3 flex md:flex-col flex-row gap-2 overflow-x-auto md:overflow-x-visible">
              {pages.map((p, idx) => (
                <div
                  key={`${p.originalIndex}-${idx}`}
                  onClick={() => setSelectedPageIndex(idx)}
                  className={`group relative p-1.5 rounded-xl border transition cursor-pointer shrink-0 md:shrink ${
                    selectedPageIndex === idx
                      ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-950'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="relative aspect-[3/4] w-20 md:w-full bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
                    {p.thumbnailUrl ? (
                      <img
                        src={p.thumbnailUrl}
                        alt={`Page ${idx + 1}`}
                        className="w-full h-full object-contain"
                        style={{ transform: `rotate(${p.rotation}deg)` }}
                      />
                    ) : (
                      <span className="text-xs text-slate-500">Page {idx + 1}</span>
                    )}

                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-mono text-white">
                      {idx + 1}
                    </span>
                  </div>

                  {/* Thumbnail Mini Controls */}
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>p. {idx + 1}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          movePage(idx, idx - 1);
                        }}
                        disabled={idx === 0}
                        title="Move Up"
                        className="hover:text-blue-400 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          movePage(idx, idx + 1);
                        }}
                        disabled={idx === pages.length - 1}
                        title="Move Down"
                        className="hover:text-blue-400 disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Center: Main Interactive Canvas Viewer */}
          <main className="flex-1 bg-slate-900 flex flex-col min-w-0 overflow-hidden">
            {/* Viewport Control Bar */}
            <div className="bg-slate-950/60 border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-3 text-xs flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPageIndex((prev) => Math.max(0, prev - 1))}
                  disabled={selectedPageIndex === 0}
                  className="p-1 hover:bg-slate-800 disabled:opacity-40 rounded text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-slate-300 font-medium">
                  Page {selectedPageIndex + 1} of {pages.length}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPageIndex((prev) => Math.min(pages.length - 1, prev + 1))}
                  disabled={selectedPageIndex === pages.length - 1}
                  className="p-1 hover:bg-slate-800 disabled:opacity-40 rounded text-slate-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Zoom & Quick Page Transforms */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.max(50, prev - 25))}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-300"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-slate-400 font-mono">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.min(200, prev + 25))}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-300"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(100)}
                  className="px-2 py-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                >
                  Reset
                </button>
                <div className="h-4 w-px bg-slate-800 mx-1" />
                <button
                  type="button"
                  onClick={() => rotateActivePage(90)}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-300 flex items-center gap-1"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Rotate</span>
                </button>
                <button
                  type="button"
                  onClick={deleteActivePage}
                  className="p-1.5 hover:bg-rose-950/60 text-rose-400 rounded flex items-center gap-1"
                  title="Delete this page"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>

            {/* Scrollable Canvas Viewport */}
            <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-slate-900/50">
              <div
                ref={mainCanvasContainerRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                className={`relative bg-white shadow-2xl rounded-sm transition-all select-none ${
                  activeTab === 'redact' ? 'cursor-crosshair' : ''
                }`}
                style={{
                  maxWidth: '100%',
                }}
              >
                <canvas ref={mainCanvasRef} className="block mx-auto max-w-full" />

                {/* Redaction Overlay Boxes for current page */}
                {redactions
                  .filter((r) => r.pageIndex === selectedPageIndex)
                  .map((r) => (
                    <div
                      key={r.id}
                      className="absolute border border-red-500/50 flex items-center justify-center group"
                      style={{
                        left: `${r.xPercent}%`,
                        top: `${r.yPercent}%`,
                        width: `${r.widthPercent}%`,
                        height: `${r.heightPercent}%`,
                        backgroundColor: r.color === 'white' ? '#ffffff' : '#000000',
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRedactions((prev) => prev.filter((item) => item.id !== r.id));
                        }}
                        className="opacity-0 group-hover:opacity-100 bg-rose-600 text-white rounded-full p-0.5 text-[10px] shadow"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                {/* Live Redaction Drag Preview */}
                {isDraggingRedact && redactStart && redactCurrent && (
                  <div
                    className="absolute border-2 border-dashed border-red-500 bg-red-500/20 pointer-events-none"
                    style={{
                      left: `${Math.min(redactStart.x, redactCurrent.x)}px`,
                      top: `${Math.min(redactStart.y, redactCurrent.y)}px`,
                      width: `${Math.abs(redactCurrent.x - redactStart.x)}px`,
                      height: `${Math.abs(redactCurrent.y - redactStart.y)}px`,
                    }}
                  />
                )}
              </div>
            </div>
          </main>

          {/* Right Action Panel */}
          <aside className="w-full md:w-80 bg-slate-950 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto">
            {/* Tab Navigation */}
            <div className="grid grid-cols-6 border-b border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('pages')}
                className={`py-3 flex flex-col items-center gap-1 border-b-2 transition ${
                  activeTab === 'pages' ? 'border-blue-500 text-blue-400 bg-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
                title="Page Manager"
              >
                <Layers className="w-4 h-4" />
                <span className="text-[10px]">Pages</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('annotate')}
                className={`py-3 flex flex-col items-center gap-1 border-b-2 transition ${
                  activeTab === 'annotate' ? 'border-blue-500 text-blue-400 bg-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
                title="Watermark & Page Numbers"
              >
                <Stamp className="w-4 h-4" />
                <span className="text-[10px]">Stamp</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sign')}
                className={`py-3 flex flex-col items-center gap-1 border-b-2 transition ${
                  activeTab === 'sign' ? 'border-blue-500 text-blue-400 bg-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
                title="Sign Document"
              >
                <PenTool className="w-4 h-4" />
                <span className="text-[10px]">Sign</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('redact')}
                className={`py-3 flex flex-col items-center gap-1 border-b-2 transition ${
                  activeTab === 'redact' ? 'border-blue-500 text-blue-400 bg-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
                title="Redaction & Blackout"
              >
                <EyeOff className="w-4 h-4" />
                <span className="text-[10px]">Redact</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('metadata')}
                className={`py-3 flex flex-col items-center gap-1 border-b-2 transition ${
                  activeTab === 'metadata' ? 'border-blue-500 text-blue-400 bg-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
                title="Metadata Inspector"
              >
                <Settings className="w-4 h-4" />
                <span className="text-[10px]">Meta</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tools')}
                className={`py-3 flex flex-col items-center gap-1 border-b-2 transition ${
                  activeTab === 'tools' ? 'border-blue-500 text-blue-400 bg-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
                title="Quick Tools"
              >
                <Scissors className="w-4 h-4" />
                <span className="text-[10px]">Tools</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-4 space-y-5 flex-1">
              {/* TAB 1: Pages */}
              {activeTab === 'pages' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Page Actions</h3>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => rotateActivePage(90)}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs flex items-center justify-center gap-1.5 text-slate-200"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                      Rotate Page +90°
                    </button>
                    <button
                      type="button"
                      onClick={() => rotateActivePage(180)}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs flex items-center justify-center gap-1.5 text-slate-200"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                      Rotate 180°
                    </button>
                    <button
                      type="button"
                      onClick={() => rotateAllPages(90)}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs flex items-center justify-center gap-1.5 text-slate-200"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                      Rotate All Pages
                    </button>
                    <button
                      type="button"
                      onClick={duplicateActivePage}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs flex items-center justify-center gap-1.5 text-slate-200"
                    >
                      <Copy className="w-3.5 h-3.5 text-emerald-400" />
                      Duplicate Page
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={deleteActivePage}
                      className="w-full p-2.5 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 rounded-xl text-xs font-semibold text-rose-300 flex items-center justify-center gap-2 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Current Page ({selectedPageIndex + 1})
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <label className="text-xs text-slate-400 mb-1.5 block">Move Page Position:</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => movePage(selectedPageIndex, selectedPageIndex - 1)}
                        disabled={selectedPageIndex === 0}
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 rounded-lg text-xs"
                      >
                        ← Move Left
                      </button>
                      <button
                        type="button"
                        onClick={() => movePage(selectedPageIndex, selectedPageIndex + 1)}
                        disabled={selectedPageIndex === pages.length - 1}
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 rounded-lg text-xs"
                      >
                        Move Right →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Annotations & Stamps */}
              {activeTab === 'annotate' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Watermark Inscription</h3>

                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Watermark Text:</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="e.g. CONFIDENTIAL, DRAFT"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Position:</label>
                      <select
                        value={watermarkPosition}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setWatermarkPosition(e.target.value as 'center' | 'top' | 'bottom')}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                      >
                        <option value="center">Diagonal Center</option>
                        <option value="top">Top Header</option>
                        <option value="bottom">Bottom Footer</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Color:</label>
                      <select
                        value={watermarkColor}
                        onChange={(e) => setWatermarkColor(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                      >
                        <option value="red">Red</option>
                        <option value="blue">Blue</option>
                        <option value="gray">Gray</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1 flex justify-between">
                      <span>Opacity:</span>
                      <span className="font-mono">{Math.round(watermarkOpacity * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.05"
                      value={watermarkOpacity}
                      onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-800/80">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Page Numbers</h3>
                    <select
                      value={pageNumberFormat}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => setPageNumberFormat(e.target.value as 'none' | 'simple' | 'total')}
                      className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      <option value="none">No Page Numbers</option>
                      <option value="simple">Simple (&quot;1&quot;, &quot;2&quot;, &quot;3&quot;)</option>
                      <option value="total">Page X of Y (&quot;Page 1 of {pages.length}&quot;)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 3: Sign */}
              {activeTab === 'sign' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Electronic Signature</h3>

                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSigType('draw')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                        sigType === 'draw' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Draw Signature
                    </button>
                    <button
                      type="button"
                      onClick={() => setSigType('type')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                        sigType === 'type' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Type Name
                    </button>
                  </div>

                  {sigType === 'draw' ? (
                    <div className="space-y-2">
                      <div className="border border-slate-800 bg-white rounded-xl overflow-hidden shadow-inner">
                        <canvas
                          ref={sigCanvasRef}
                          width={260}
                          height={120}
                          onMouseDown={startDrawing}
                          onMouseMove={drawOnCanvas}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          className="w-full h-28 bg-white cursor-crosshair block"
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Draw with mouse / finger</span>
                        <button
                          type="button"
                          onClick={clearSigCanvas}
                          className="text-rose-400 hover:text-rose-300 font-medium"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Your Full Name:</label>
                      <input
                        type="text"
                        value={typedSig}
                        onChange={(e) => setTypedSig(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Signature Placement:</label>
                    <select
                      value={sigPosition}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => setSigPosition(e.target.value as 'bottom-right' | 'bottom-left' | 'bottom-center')}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="bottom-right">Bottom Right Corner</option>
                      <option value="bottom-left">Bottom Left Corner</option>
                      <option value="bottom-center">Bottom Center</option>
                    </select>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Targeting active page: <strong>Page {selectedPageIndex + 1}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 4: Redact */}
              {activeTab === 'redact' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Redaction Tool</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Click and drag a box across any sensitive text on the main canvas to blackout or whiteout data.
                  </p>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-400">Redaction Fill:</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRedactionColor('black')}
                        className={`px-3 py-1 text-xs rounded-lg border font-medium ${
                          redactionColor === 'black'
                            ? 'bg-black text-white border-blue-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        Blackout
                      </button>
                      <button
                        type="button"
                        onClick={() => setRedactionColor('white')}
                        className={`px-3 py-1 text-xs rounded-lg border font-medium ${
                          redactionColor === 'white'
                            ? 'bg-white text-slate-900 border-blue-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        Whiteout
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-400">Applied Redactions ({redactions.length})</span>
                      {redactions.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setRedactions([])}
                          className="text-rose-400 hover:text-rose-300 font-medium"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    {redactions.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No redactions on this document yet.</p>
                    ) : (
                      <div className="space-y-1 max-h-36 overflow-y-auto">
                        {redactions.map((r, i) => (
                          <div
                            key={r.id}
                            className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs text-slate-300"
                          >
                            <span>
                              Box {i + 1} (Page {r.pageIndex + 1} • {r.color})
                            </span>
                            <button
                              type="button"
                              onClick={() => setRedactions((prev) => prev.filter((item) => item.id !== r.id))}
                              className="text-rose-400 hover:text-rose-300 px-1"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: Metadata */}
              {activeTab === 'metadata' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Document Catalog Info</h3>

                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Title:</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Author:</label>
                    <input
                      type="text"
                      value={metaAuthor}
                      onChange={(e) => setMetaAuthor(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Subject:</label>
                    <input
                      type="text"
                      value={metaSubject}
                      onChange={(e) => setMetaSubject(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Keywords (comma separated):</label>
                    <input
                      type="text"
                      value={metaKeywords}
                      onChange={(e) => setMetaKeywords(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMetaTitle('');
                      setMetaAuthor('');
                      setMetaSubject('');
                      setMetaKeywords('');
                      setSuccessMsg('Sanitized metadata fields.');
                    }}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs"
                  >
                    Scrub / Sanitize All
                  </button>
                </div>
              )}

              {/* TAB 6: Quick Tools */}
              {activeTab === 'tools' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Extractions</h3>

                  <button
                    type="button"
                    onClick={extractTextFromActiveDoc}
                    disabled={busy}
                    className="w-full p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs flex items-center justify-between text-slate-200"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      Extract Text Layer (TXT)
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  <button
                    type="button"
                    onClick={exportImagesZip}
                    disabled={busy}
                    className="w-full p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs flex items-center justify-between text-slate-200"
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      Export Pages as Images (ZIP)
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  <div className="pt-2 border-t border-slate-800/80">
                    <h4 className="text-[11px] font-bold uppercase text-slate-500 mb-2">Dedicated Tools</h4>
                    <div className="grid grid-cols-2 gap-1.5">
                      <Link
                        href="/compress-pdf"
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800 block text-center"
                      >
                        Compress PDF
                      </Link>
                      <Link
                        href="/ocr-pdf"
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800 block text-center"
                      >
                        OCR Scans
                      </Link>
                      <Link
                        href="/pdf-to-word"
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800 block text-center"
                      >
                        PDF to Word
                      </Link>
                      <Link
                        href="/merge-pdf"
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800 block text-center"
                      >
                        Merge PDFs
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Panel Export Callout */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-2">
              <button
                type="button"
                onClick={() => exportModifiedPdf({ flatten: false })}
                disabled={busy}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>Export & Download PDF</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
