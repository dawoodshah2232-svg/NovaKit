/**
 * Shared upload guards for every PDFEdit tool.
 *
 * Every tool processes files 100% in browser memory (zero server uploads),
 * which means a huge file can exhaust the tab's memory and crash the page.
 * These guards reject oversized or empty files BEFORE any parsing, rendering,
 * or OCR work starts, so users get a clear message instead of a frozen tab.
 */

/** Max accepted PDF upload — matches the merge tool's long-standing 100 MB cap. */
export const MAX_PDF_FILE_BYTES = 100 * 1024 * 1024;

/** Max accepted image upload (JPG/PNG/WebP → PDF, color extractor, compressor). */
export const MAX_IMAGE_FILE_BYTES = 50 * 1024 * 1024;

/** Max accepted Word document upload. */
export const MAX_DOC_FILE_BYTES = 50 * 1024 * 1024;

export function formatLimitBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(1))} ${units[i]}`;
}

/**
 * Validate a picked file's size. Returns a human-readable error message,
 * or null when the file is safe to process.
 */
export function validateUploadSize(file: File, maxBytes: number = MAX_PDF_FILE_BYTES): string | null {
  if (file.size === 0) {
    return `"${file.name}" is empty (0 bytes) and cannot be opened.`;
  }
  if (file.size > maxBytes) {
    return `"${file.name}" is ${formatLimitBytes(file.size)} — files over ${formatLimitBytes(maxBytes)} are not accepted, because processing them in your browser could run out of memory and crash the tab.`;
  }
  return null;
}

interface DropRejectionLike {
  errors: readonly { code: string }[];
}

/**
 * Build a user-facing error for react-dropzone rejections (used with the
 * `maxSize` option on ToolFilePicker / useDropzone configs).
 */
export function uploadRejectionMessage(rejections: DropRejectionLike[], maxBytes: number): string {
  const codes = new Set(rejections.flatMap((r) => r.errors.map((e) => e.code)));
  if (codes.has('file-too-large')) {
    return `That file exceeds the ${formatLimitBytes(maxBytes)} limit. Files this large can crash your browser tab during in-memory processing — please use a smaller file.`;
  }
  if (codes.has('file-invalid-type')) {
    return 'That file type is not supported here. Please choose a file with the right extension.';
  }
  if (codes.has('too-many-files')) {
    return 'Too many files selected at once. Please add fewer files and try again.';
  }
  return 'That file could not be accepted. Please try a different file.';
}
