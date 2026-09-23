'use client';
import { validateUploadSize } from '@/lib/file-limits';
import { brandedFileName } from '@/lib/branded-filename';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';
import {
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  RefreshCw,
  FileText,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function UnlockPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isEncrypted, setIsEncrypted] = useState<boolean | null>(null);

  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword('');

    const pdfFile = acceptedFiles[0];
    if (!pdfFile) return;

    if (pdfFile.type !== 'application/pdf' && !pdfFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please upload a valid PDF document.');
      return;
    }

    // Guard: oversized files can exhaust browser tab memory — reject before parsing.
    const sizeError = validateUploadSize(pdfFile);
    if (sizeError) {
      setErrorMessage(sizeError);
      return;
    }

    try {
      const buffer = await pdfFile.arrayBuffer();
      // pdf.js transfers (detaches) the buffer it receives, so hand it a copy
      // and keep the canonical buffer intact for the unlock step below.
      const probeData = new Uint8Array(buffer.slice(0));
      setArrayBuffer(buffer);

      // Probe encryption with pdfjs-dist
      let encrypted = false;
      const loadingTask = pdfjsLib.getDocument({
        data: probeData,
      });

      loadingTask.onPassword = () => {
        encrypted = true;
      };

      try {
        await loadingTask.promise;
        setIsEncrypted(false);
        setFile(pdfFile);
      } catch (err: unknown) {
        // Password exception code 1 or 2
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (encrypted || (err as any)?.name === 'PasswordException' || (err as any)?.code === 1 || (err as any)?.code === 2) {
          setIsEncrypted(true);
          setFile(pdfFile);
        } else {
          throw err;
        }
      }
    } catch (err: unknown) {
      console.error('Error probing PDF:', err);
      const msg = err instanceof Error ? err.message : 'Failed to inspect PDF.';
      setErrorMessage(msg);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const handleUnlockPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arrayBuffer || !file) return;

    if (isEncrypted && !password) {
      setErrorMessage('Please enter the password for this protected PDF.');
      return;
    }

    setIsDecrypting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setProgressText('Verifying security credentials & decrypting streams...');

    try {
      // 1. Verify and decrypt with PDF.js (hand it a copy: it detaches the buffer it receives)
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer.slice(0)),
        password: password.trim(),
      });

      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;

      setProgressText(`Password verified. Re-encoding ${totalPages} pages into unencrypted PDF...`);

      // 2. Render each decrypted page to high-DPI canvas and compile cleanly with pdf-lib
      const unencryptedDoc = await PDFDocument.create();

      for (let i = 1; i <= totalPages; i++) {
        setProgressText(`Processing page ${i} of ${totalPages}...`);
        const page = await pdf.getPage(i);
        // Render at 2x scale for crisp vector fidelity
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) throw new Error('Canvas render context unavailable');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (page.render({ canvasContext: ctx, viewport } as any)).promise;

        const imgBlob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.95));
        if (!imgBlob) throw new Error(`Failed to rasterize page ${i}`);

        const imgBytes = new Uint8Array(await imgBlob.arrayBuffer());
        const embeddedImg = await unencryptedDoc.embedJpg(imgBytes);

        // Original point dimensions (scale 1.0)
        const origViewport = page.getViewport({ scale: 1.0 });
        const newPage = unencryptedDoc.addPage([origViewport.width, origViewport.height]);

        newPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: origViewport.width,
          height: origViewport.height,
        });
      }

      unencryptedDoc.setTitle(file.name.replace(/\.[^/.]+$/, ''));
      unencryptedDoc.setProducer('PDFEdit Studio (pdfedit.website)');
      unencryptedDoc.setCreator('PDFEdit Studio Client-Side Decryption Engine');

      const unlockedBytes = await unencryptedDoc.save();
      const blob = new Blob([unlockedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      saveAs(blob, brandedFileName(`${baseName}-unlocked`, 'pdf'));

      trackToolExecution('unlock-pdf', true);
      setSuccessMessage('PDF unlocked successfully! All password restrictions and encryption have been removed.');
    } catch (err: unknown) {
      trackToolExecution('unlock-pdf', false);
      console.error('Decryption failed:', err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((err as any)?.name === 'PasswordException' || (err as any)?.code === 1 || (err as any)?.code === 2) {
        setErrorMessage('Incorrect password. Please verify the credentials and try again.');
      } else {
        const msg = err instanceof Error ? err.message : 'Failed to decrypt and unlock PDF.';
        setErrorMessage(msg);
      }
    } finally {
      setIsDecrypting(false);
      setProgressText('');
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
 ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)] scale-[1.01]'
 : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-[var(--pe-accent)] hover:bg-slate-50/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="max-w-md mx-auto space-y-3">
 <div className="w-16 h-16 rounded-2xl bg-[var(--pe-accent-soft)] text-[var(--pe-accent)] flex items-center justify-center mx-auto shadow-sm">
              <Unlock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {isDragActive ? 'Drop protected PDF here...' : 'Choose or Drag Password-Protected PDF'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Decrypts and removes password restrictions client-side in browser memory with zero server uploads.
                Note: the unlocked PDF is rebuilt page-by-page, so text may no longer be selectable.
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

      {/* Unlock Form Workspace */}
      {file && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          {/* File Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                {isEncrypted ? (
                  <Lock className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                ) : (
 <FileText className="w-6 h-6 text-[var(--pe-accent)] " />
                )}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white truncate max-w-sm" title={file.name}>
                  {file.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span>{formatBytes(file.size)}</span>
                  <span>•</span>
                  {isEncrypted ? (
                    <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Password Protected</span>
                    </span>
                  ) : (
 <span className="font-bold text-[var(--pe-accent)] flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Already Unlocked (No Password)</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setArrayBuffer(null);
                setIsEncrypted(null);
                setPassword('');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors self-start sm:self-center"
            >
              Choose Another File
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleUnlockPdf} className="space-y-5 max-w-lg">
            {isEncrypted ? (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-rose-500" />
                  <span>Enter Current PDF Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Type the document password..."
 className="w-full h-12 pl-4 pr-11 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-[var(--pe-accent-ink)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pe-focus)] focus:border-[var(--pe-accent)] transition-all placeholder:font-sans placeholder:text-slate-400"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  We use your known password to permanently decrypt and remove security restrictions so you never have to type it again.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)] border border-[var(--pe-accent)] dark:border-[var(--pe-accent)] text-xs text-[var(--pe-accent)] dark:text-[var(--pe-accent)]">
                This document is not password encrypted. You can re-save it to confirm unencrypted format.
              </div>
            )}

            <button
              type="submit"
              disabled={isDecrypting}
 className="min-h-[46px] px-8 py-2.5 rounded-2xl bg-[var(--pe-accent)] hover:bg-[var(--pe-accent-hover)] text-[var(--pe-accent-ink)] text-xs sm:text-sm font-black transition-all shadow-md shadow-[var(--pe-shadow-accent)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isDecrypting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{progressText || 'Decrypting PDF...'}</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock & Decrypt PDF</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
