'use client';
import { validateUploadSize } from '@/lib/file-limits';
import { brandedFileName } from '@/lib/branded-filename';

import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { encryptPDF, EncryptPDFOptions } from '@pdfsmaller/pdf-encrypt';
import { saveAs } from 'file-saver';
import { trackToolExecution } from '@/lib/analytics';
import {
  Lock,
  ShieldCheck,
  FileText,
  Eye,
  EyeOff,
  Printer,
  Copy,
  FileEdit,
  MessageSquare,
  AlertCircle,
  FileCheck2,
  RefreshCw,
  Check,
  KeyRound,
  Sliders,
} from 'lucide-react';

interface LoadedPdf {
  file: File;
  name: string;
  size: number;
  pageCount: number;
  arrayBuffer: ArrayBuffer;
}

interface PermissionsConfig {
  allowPrinting: boolean;
  allowCopying: boolean;
  allowModifying: boolean;
  allowAnnotating: boolean;
}

// Helper to format byte sizes
function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function ProtectPdf() {
  const [loadedPdf, setLoadedPdf] = useState<LoadedPdf | null>(null);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [ownerPassword, setOwnerPassword] = useState<string>('');
  const [showOwnerPassword, setShowOwnerPassword] = useState<boolean>(false);
  const [enableOwnerPassword, setEnableOwnerPassword] = useState<boolean>(false);
  const [algorithm, setAlgorithm] = useState<'AES-256' | 'RC4'>('AES-256');

  const [permissions, setPermissions] = useState<PermissionsConfig>({
    allowPrinting: true,
    allowCopying: false,
    allowModifying: false,
    allowAnnotating: true,
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Calculate password strength indicator
  const passwordStrength = useMemo(() => {
    if (!password) return { level: 'None', percent: 0, color: 'bg-slate-200', text: '' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (password.length >= 14) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) {
      return {
        level: 'Weak',
        percent: 25,
        color: 'bg-red-500',
        textColor: 'text-red-600 dark:text-red-400',
      };
    }
    if (score <= 4) {
      return {
        level: 'Medium',
        percent: 50,
        color: 'bg-amber-500',
        textColor: 'text-amber-600 dark:text-amber-400',
      };
    }
    if (score <= 5) {
      return {
        level: 'Strong',
        percent: 75,
        color: 'bg-emerald-500',
        textColor: 'text-emerald-600 dark:text-emerald-400',
      };
    }
    return {
      level: 'Very Strong',
      percent: 100,
      color: 'bg-emerald-600',
      textColor: 'text-emerald-700 dark:text-emerald-300',
    };
  }, [password]);

  // Dropzone handler
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please upload a valid PDF document.');
      return;
    }

    // Guard: oversized files can exhaust browser tab memory — reject before parsing.
    const sizeError = validateUploadSize(file);
    if (sizeError) {
      setErrorMessage(sizeError);
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Check if already encrypted
      try {
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();

        setLoadedPdf({
          file,
          name: file.name,
          size: file.size,
          pageCount,
          arrayBuffer,
        });
      } catch {
        // Test if error is due to encryption
        try {
          await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          setErrorMessage('This PDF document is already password-protected. Please upload an unprotected file.');
          return;
        } catch {
          setErrorMessage('Could not parse this PDF file. It might be corrupted.');
          return;
        }
      }
    } catch (err: unknown) {
      console.error('Failed to parse PDF:', err);
      setErrorMessage('Could not load this PDF document.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const handleResetFile = () => {
    setLoadedPdf(null);
    setPassword('');
    setShowPassword(false);
    setOwnerPassword('');
    setShowOwnerPassword(false);
    setEnableOwnerPassword(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const togglePermission = (key: keyof PermissionsConfig) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Encrypt execution
  const handleEncryptPdf = async () => {
    if (!loadedPdf) return;
    if (!password.trim()) {
      setErrorMessage('Please enter a document password to protect your file.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsProcessing(true);

    try {
      const uint8Bytes = new Uint8Array(loadedPdf.arrayBuffer);

      const options: EncryptPDFOptions = {
        algorithm,
        allowPrinting: permissions.allowPrinting,
        allowCopying: permissions.allowCopying,
        allowModifying: permissions.allowModifying,
        allowAnnotating: permissions.allowAnnotating,
        allowHighQualityPrint: permissions.allowPrinting,
      };

      if (enableOwnerPassword && ownerPassword.trim()) {
        options.ownerPassword = ownerPassword.trim();
      }

      // Execute AES-256 / RC4 client-side encryption
      const encryptedBytes = await encryptPDF(uint8Bytes, password.trim(), options);

      const blob = new Blob([encryptedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const baseName = loadedPdf.name.replace(/\.[^/.]+$/, '');
      const protectedFileName = brandedFileName(`${baseName}_protected`, 'pdf');

      saveAs(blob, protectedFileName);

      setSuccessMessage(
        `Document encrypted successfully with ${algorithm} encryption! File saved as "${protectedFileName}" (${formatBytes(
          blob.size
        )}).`
      );
      trackToolExecution('protect-pdf', true);
    } catch (err: unknown) {
      trackToolExecution('protect-pdf', false);
      console.error('Encryption failed:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred while encrypting the PDF document.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Privacy Guarantee Header Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)] border border-[var(--pe-border)] dark:border-[var(--pe-border)] text-xs font-medium text-[var(--pe-accent)] dark:text-[var(--pe-accent)] shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--pe-accent)] dark:text-[var(--pe-accent)] shrink-0" />
          <span>
            <strong>Zero Server Uploads:</strong> In-browser AES-256 standard encryption. Your document and passwords never leave local device memory.
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)] text-[var(--pe-accent)] dark:text-[var(--pe-accent)]">
          Hardware Web Crypto
        </span>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs sm:text-sm font-medium text-red-700 dark:text-red-300 shadow-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-300 shadow-xs animate-in fade-in">
          <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Empty State / Massive Drag-and-Drop Zone */}
      {!loadedPdf ? (
        <div
          {...getRootProps()}
          className={`group relative rounded-3xl border-3 border-dashed transition-all duration-200 p-8 sm:p-16 text-center cursor-pointer min-h-[340px] sm:min-h-[380px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(124,58,237,0.12)] ${
            isDragActive
              ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)] scale-[0.99] ring-4 ring-[var(--pe-accent-ring)]'
              : 'border-[var(--pe-border)] dark:border-[var(--pe-border)] hover:border-[var(--pe-accent)] dark:hover:border-[var(--pe-accent)]'
          }`}
        >
          <input {...getInputProps()} aria-label="Select PDF file to protect" />
          <div className="max-w-md mx-auto space-y-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)] text-[var(--pe-accent)] dark:text-[var(--pe-accent)] flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform duration-200">
              <Lock className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                {isDragActive ? 'Drop your PDF file here' : 'Drag & drop your PDF here'}
              </h3>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
                or tap below to choose a document from your computer
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 pt-1">
                Encrypt with AES-256 standard password and restrict permissions
              </p>
            </div>
            <button
              type="button"
              className="min-h-[52px] px-8 py-3.5 rounded-2xl bg-[var(--pe-accent)] hover:bg-[var(--pe-accent-hover)] text-white text-sm sm:text-base font-bold shadow-lg shadow-[var(--pe-shadow-accent)] active:scale-95 transition-all inline-flex items-center gap-2.5 cursor-pointer"
            >
              <FileText className="w-5 h-5" />
              <span>Choose PDF File</span>
            </button>
          </div>
        </div>
      ) : (
        /* Workspace when document is loaded */
        <div className="space-y-6">
          {/* Active File Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)] text-[var(--pe-accent)] dark:text-[var(--pe-accent)] flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                  {loadedPdf.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold">{formatBytes(loadedPdf.size)}</span>
                  <span>•</span>
                  <span className="font-extrabold px-2 py-0.5 rounded-md bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)] text-[var(--pe-accent)] dark:text-[var(--pe-accent)] border border-[var(--pe-border)] dark:border-[var(--pe-border)]">
                    {loadedPdf.pageCount} {loadedPdf.pageCount === 1 ? 'Page' : 'Pages'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetFile}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5 self-start sm:self-center cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change Document</span>
            </button>
          </div>

          {/* Security Configuration Card */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-7">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--pe-accent)] dark:text-[var(--pe-accent)] block mb-0.5">
                  Security Settings
                </span>
                <h4 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white tracking-tight">
                  Document Password & Encryption
                </h4>
              </div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)] text-[var(--pe-accent)] dark:text-[var(--pe-accent)] border border-[var(--pe-border)] dark:border-[var(--pe-border)]">
                {algorithm} Standard
              </span>
            </div>

            {/* Document Password Input Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="doc-password"
                  className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[var(--pe-accent)]" />
                  <span>Document Open Password (Required)</span>
                </label>
                {password && (
                  <span className={`text-[11px] font-bold ${passwordStrength.textColor}`}>
                    {passwordStrength.level} Password
                  </span>
                )}
              </div>

              <div className="relative flex items-center">
                <input
                  id="doc-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a strong password to lock this PDF..."
                  className="w-full min-h-[50px] pl-4 pr-12 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white text-sm sm:text-base font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--pe-accent-ring)] focus:border-[var(--pe-accent)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="space-y-1 pt-1">
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.percent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                    Use 10+ characters with mixed case, numbers, and symbols for maximum security.
                  </span>
                </div>
              )}
            </div>

            {/* Algorithm Selection (AES-256 vs RC4) */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                Encryption Cipher Standard
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAlgorithm('AES-256')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    algorithm === 'AES-256'
                      ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)] ring-2 ring-[var(--pe-accent-ring)]'
                      : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 opacity-70'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>AES-256 (PDF 2.0 Standard)</span>
 <span className="text-[10px] px-2 py-0.2 rounded-full bg-[var(--pe-accent-soft)] text-[var(--pe-accent)] font-bold">
                        Recommended
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                      Maximum cryptographic security across modern PDF readers.
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                      algorithm === 'AES-256'
                        ? 'border-[var(--pe-accent)] bg-[var(--pe-accent)] text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {algorithm === 'AES-256' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAlgorithm('RC4')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    algorithm === 'RC4'
                      ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)] ring-2 ring-[var(--pe-accent-ring)]'
                      : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 opacity-70'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      RC4 128-bit (Legacy Acrobat)
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                      For older PDF software and legacy system compatibility.
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                      algorithm === 'RC4'
                        ? 'border-[var(--pe-accent)] bg-[var(--pe-accent)] text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {algorithm === 'RC4' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              </div>
            </div>

            {/* Granular Permission Toggles */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[var(--pe-accent)]" />
                    <span>Granular Document Permissions</span>
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Control what authorized viewers can perform after opening the document.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Allow Printing */}
                <button
                  type="button"
                  onClick={() => togglePermission('allowPrinting')}
                  className={`min-h-[50px] p-3.5 rounded-2xl border transition-all flex items-center justify-between text-left cursor-pointer ${
                    permissions.allowPrinting
                      ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)]'
                      : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        permissions.allowPrinting
                          ? 'bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)] text-[var(--pe-accent)] dark:text-[var(--pe-accent)]'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      <Printer className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Allow Printing
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {permissions.allowPrinting ? 'Printing permitted' : 'Printing blocked'}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                      permissions.allowPrinting
                        ? 'bg-[var(--pe-accent)] text-white'
                        : 'border-2 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {permissions.allowPrinting && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>

                {/* Allow Copying Text */}
                <button
                  type="button"
                  onClick={() => togglePermission('allowCopying')}
                  className={`min-h-[50px] p-3.5 rounded-2xl border transition-all flex items-center justify-between text-left cursor-pointer ${
                    permissions.allowCopying
                      ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)]'
                      : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        permissions.allowCopying
                          ? 'bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)] text-[var(--pe-accent)] dark:text-[var(--pe-accent)]'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      <Copy className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Allow Copying Text
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {permissions.allowCopying ? 'Clipboard copying allowed' : 'Content copying prevented'}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                      permissions.allowCopying
                        ? 'bg-[var(--pe-accent)] text-white'
                        : 'border-2 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {permissions.allowCopying && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>

                {/* Allow Modifying Document */}
                <button
                  type="button"
                  onClick={() => togglePermission('allowModifying')}
                  className={`min-h-[50px] p-3.5 rounded-2xl border transition-all flex items-center justify-between text-left cursor-pointer ${
                    permissions.allowModifying
                      ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)]'
                      : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        permissions.allowModifying
                          ? 'bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)] text-[var(--pe-accent)] dark:text-[var(--pe-accent)]'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      <FileEdit className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Allow Modifications
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {permissions.allowModifying ? 'Editing allowed' : 'Modifications locked'}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                      permissions.allowModifying
                        ? 'bg-[var(--pe-accent)] text-white'
                        : 'border-2 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {permissions.allowModifying && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>

                {/* Allow Annotating */}
                <button
                  type="button"
                  onClick={() => togglePermission('allowAnnotating')}
                  className={`min-h-[50px] p-3.5 rounded-2xl border transition-all flex items-center justify-between text-left cursor-pointer ${
                    permissions.allowAnnotating
                      ? 'border-[var(--pe-accent)] bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)]'
                      : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        permissions.allowAnnotating
                          ? 'bg-[var(--pe-accent-soft)] dark:bg-[var(--pe-accent-soft)] text-[var(--pe-accent)] dark:text-[var(--pe-accent)]'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Allow Comments & Forms
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {permissions.allowAnnotating ? 'Form filling enabled' : 'Annotations disabled'}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                      permissions.allowAnnotating
                        ? 'bg-[var(--pe-accent)] text-white'
                        : 'border-2 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {permissions.allowAnnotating && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              </div>
            </div>

            {/* Optional Separate Owner/Master Password */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEnableOwnerPassword(!enableOwnerPassword)}
                className="text-xs font-bold text-[var(--pe-accent)] dark:text-[var(--pe-accent)] hover:text-[var(--pe-accent-hover)] flex items-center gap-2 cursor-pointer"
              >
                <span>{enableOwnerPassword ? '− Remove Master Admin Password' : '+ Set Separate Master Owner Password (Optional)'}</span>
              </button>

              {enableOwnerPassword && (
                <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                  <label
                    htmlFor="owner-password"
                    className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block"
                  >
                    Master Owner Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="owner-password"
                      type={showOwnerPassword ? 'text' : 'password'}
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      placeholder="Admin password to override permission restrictions..."
                      className="w-full min-h-[46px] pl-4 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--pe-accent-ring)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                      aria-label={showOwnerPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showOwnerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Massive Primary CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleEncryptPdf}
                disabled={isProcessing || !password.trim()}
                className={`w-full min-h-[54px] px-6 py-3.5 rounded-2xl font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 shadow-lg active:scale-[0.98] cursor-pointer ${
                  isProcessing || !password.trim()
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-[var(--pe-accent)] to-[var(--pe-accent-hover)] hover:from-[var(--pe-accent-hover)] hover:to-[var(--pe-accent)] text-white shadow-[var(--pe-shadow-accent)]'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Encrypting with {algorithm} in Browser...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>
                      {password.trim()
                        ? `Encrypt & Download Protected PDF`
                        : 'Enter a Password to Enable Protection'}
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
