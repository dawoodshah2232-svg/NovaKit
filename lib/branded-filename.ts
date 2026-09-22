/**
 * Branded download filenames — every file the site generates for download
 * carries the [pdfedit.website] tag, e.g.:
 *   "abc defghi hk.pdf"  ->  "abc defghi hk [pdfedit.website].pdf"
 */
export const BRAND_TAG = '[pdfedit.website]';

function sanitizeBase(base: string): string {
  const clean = (base || 'file').trim().replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ');
  return clean.slice(0, 120) || 'file';
}

/**
 * Build a branded download filename.
 * @param baseName  descriptive base without extension (may already contain a suffix like "_compressed")
 * @param extension file extension without dot, e.g. "pdf", "jpg", "docx", "png", "txt", "zip"
 */
export function brandedFileName(baseName: string, extension: string): string {
  const ext = (extension || '').replace(/^\./, '').toLowerCase() || 'bin';
  return `${sanitizeBase(baseName)} ${BRAND_TAG}.${ext}`;
}
