'use client';

/**
 * PDFEdit Studio — signature capture modal.
 *
 * Three tabs: Draw (freehand, dark-blue ink), Type (name rendered in a script
 * style), Upload (PNG/JPG). onSave receives a transparent PNG data URL of the
 * canvas contents. Switching tabs clears the pad.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Check, PenLine, Trash2, Type as TypeIcon, Upload, X } from 'lucide-react';

interface SignaturePadProps {
  open: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}

type PadTab = 'draw' | 'type' | 'upload';

const INK = '#1e3a8a';
const CANVAS_W = 640;
const CANVAS_H = 240;

const SCRIPT_STACK = '"Segoe Script", "Brush Script MT", "Snell Roundhand", cursive';

export function SignaturePad({ open, onClose, onSave }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);

  const [tab, setTab] = useState<PadTab>('draw');
  const [typedText, setTypedText] = useState('');
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  // Content produced by pointer drawing or image upload (event handlers only).
  // The type tab derives its content from the input value instead.
  const [drawnContent, setDrawnContent] = useState(false);

  const setupCanvas = useCallback((): CanvasRenderingContext2D | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    return ctx;
  }, []);

  const clearPad = useCallback(() => {
    if (tab === 'type') {
      setTypedText('');
      return;
    }
    setupCanvas();
    setUploadedName(null);
    setDrawnContent(false);
  }, [setupCanvas, tab]);

  // NOTE: the parent remounts this component on every open (conditional render),
  // so state always starts fresh — no reset-on-open effect needed.

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Render typed signature in script style. Pure canvas side-effect: no setState.
  useEffect(() => {
    if (!open || tab !== 'type') return;
    const ctx = setupCanvas();
    if (!ctx) return;
    const text = typedText.trim();
    if (!text) return; // cleared canvas already handled by setupCanvas
    let size = 84;
    ctx.fillStyle = INK;
    ctx.textBaseline = 'middle';
    const setFont = (s: number) => {
      ctx.font = `500 ${s}px ${SCRIPT_STACK}`;
    };
    setFont(size);
    while (ctx.measureText(text).width > CANVAS_W - 48 && size > 28) {
      size -= 4;
      setFont(size);
    }
    ctx.fillText(text, 24, CANVAS_H / 2);
  }, [open, tab, typedText, setupCanvas]);

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_H,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (tab !== 'draw') return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    canvas.setPointerCapture(e.pointerId);
    const p = pointFromEvent(e);
    drawingRef.current = true;
    lastRef.current = p;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.01, p.y + 0.01);
    ctx.stroke();
    setDrawnContent(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (tab !== 'draw' || !drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const last = lastRef.current;
    if (!canvas || !ctx || !last) return;
    const p = pointFromEvent(e);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastRef.current = p;
  };

  const endStroke = () => {
    drawingRef.current = false;
    lastRef.current = null;
  };

  const handleUploadFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== 'string') return;
      const img = new Image();
      img.onload = () => {
        const ctx = setupCanvas();
        if (!ctx) return;
        const scale = Math.min(
          (CANVAS_W - 48) / img.width,
          (CANVAS_H - 48) / img.height,
          1
        );
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (CANVAS_W - w) / 2, (CANVAS_H - h) / 2, w, h);
        setUploadedName(file.name);
        setDrawnContent(true);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const switchTab = (t: PadTab) => {
    if (t === tab) return;
    setTab(t);
    setTypedText('');
    setUploadedName(null);
    setDrawnContent(false);
    setupCanvas();
  };

  const canSave = drawnContent || (tab === 'type' && typedText.trim() !== '');

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !canSave) return;
    onSave(canvas.toDataURL('image/png'));
  };

  if (!open) return null;

  const tabs: Array<{ id: PadTab; label: string; icon: ReactNode }> = [
    { id: 'draw', label: 'Draw', icon: <PenLine size={15} /> },
    { id: 'type', label: 'Type', icon: <TypeIcon size={15} /> },
    { id: 'upload', label: 'Upload', icon: <Upload size={15} /> },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create signature"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-100">Create signature</h2>
          <button
            type="button"
            title="Close"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X size={17} />
          </button>
        </div>

        <div className="mb-4 flex gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => switchTab(t.id)}
              aria-pressed={t.id === tab}
              className={`flex h-9 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-medium ${
                t.id === tab
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'type' && (
          <input
            type="text"
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            placeholder="Type your full name"
            aria-label="Type your name"
            className="mb-3 h-10 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-red-500"
          />
        )}

        {tab === 'upload' && (
          <div className="mb-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              aria-label="Upload signature image"
              onChange={(e) => handleUploadFile(e.target.files?.[0])}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 text-sm font-medium text-slate-300 hover:border-slate-600 hover:bg-slate-800/50"
            >
              <Upload size={15} />
              {uploadedName ? uploadedName : 'Choose a PNG or JPG image'}
            </button>
          </div>
        )}

        <canvas
          ref={canvasRef}
          style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          onPointerLeave={endStroke}
          aria-label={
            tab === 'draw'
              ? 'Draw your signature here'
              : tab === 'type'
                ? 'Signature preview'
                : 'Uploaded signature preview'
          }
          className={`w-full rounded-xl border border-slate-700 bg-white ${
            tab === 'draw' ? 'cursor-crosshair touch-none' : 'pointer-events-none'
          }`}
        />
        <p className="mt-2 text-xs text-slate-500">
          {tab === 'draw'
            ? 'Draw with your mouse, trackpad or finger.'
            : tab === 'type'
              ? 'Your name is rendered in a script style.'
              : 'Your image is placed on a transparent background.'}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={clearPad}
            className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <Trash2 size={15} />
            Clear
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-slate-700 px-4 text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-40"
            >
              <Check size={15} />
              Use signature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
