import type { ComponentType, SVGProps } from 'react';
import {
  MergeIcon,
  SplitIcon,
  CompressIcon,
  PdfToWordIcon,
  WordToPdfIcon,
  PdfToJpgIcon,
  JpgToPdfIcon,
  OcrIcon,
  SignIcon,
  RedactIcon,
  RotateIcon,
  OrganizeIcon,
  DeletePagesIcon,
  ExtractPagesIcon,
  PageNumbersIcon,
  CropIcon,
  PdfToTextIcon,
  FlattenIcon,
  ProtectIcon,
  UnlockIcon,
  WatermarkIcon,
  StudioIcon,
} from './icons';

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export type PreviewCategoryId =
  | 'organize'
  | 'from'
  | 'to'
  | 'optimize'
  | 'edit'
  | 'security'
  | 'advanced';

export interface PreviewCategory {
  id: PreviewCategoryId;
  label: string;
  blurb: string;
  /** CSS var for the soft icon-tile tint */
  tint: string;
}

export const PREVIEW_CATEGORIES: PreviewCategory[] = [
  { id: 'organize', label: 'Organize PDF', blurb: 'Rearrange, split and shape documents', tint: 'var(--pe-tint-organize)' },
  { id: 'from', label: 'Convert from PDF', blurb: 'Turn PDFs into editable formats', tint: 'var(--pe-tint-from)' },
  { id: 'to', label: 'Convert to PDF', blurb: 'Make PDFs from other files', tint: 'var(--pe-tint-to)' },
  { id: 'optimize', label: 'Optimize PDF', blurb: 'Smaller, cleaner, faster files', tint: 'var(--pe-tint-optimize)' },
  { id: 'edit', label: 'Edit & Sign', blurb: 'Write, mark and sign documents', tint: 'var(--pe-tint-edit)' },
  { id: 'security', label: 'Security', blurb: 'Protect or unlock documents', tint: 'var(--pe-tint-security)' },
  { id: 'advanced', label: 'Advanced', blurb: 'Power tools for tough jobs', tint: 'var(--pe-tint-advanced)' },
];

export interface PreviewTool {
  id: string;
  name: string;
  tagline: string;
  href: string;
  category: PreviewCategoryId;
  icon: IconComponent;
  keywords: string[];
  popular?: boolean;
}

/**
 * Real, verified production routes. Slugs cross-checked against
 * the app router tree and the live sitemap on 2026-09-22.
 */
export const PREVIEW_TOOLS: PreviewTool[] = [
  // ---- Organize PDF ----
  { id: 'merge', name: 'Merge PDF', tagline: 'Combine several PDFs into one clean document', href: '/merge-pdf', category: 'organize', icon: MergeIcon, keywords: ['merge', 'combine', 'join', 'join pdf', 'append'], popular: true },
  { id: 'split', name: 'Split PDF', tagline: 'Pull pages or ranges out into new files', href: '/split-pdf', category: 'organize', icon: SplitIcon, keywords: ['split', 'separate', 'extract range', 'divide'], popular: true },
  { id: 'organize', name: 'Organize Pages', tagline: 'Drag, reorder, duplicate and delete pages', href: '/organize-pdf', category: 'organize', icon: OrganizeIcon, keywords: ['organize', 'reorder', 'rearrange', 'pages', 'move pages'] },
  { id: 'rotate', name: 'Rotate PDF', tagline: 'Fix page orientation in seconds', href: '/rotate-pdf', category: 'organize', icon: RotateIcon, keywords: ['rotate', 'orientation', 'landscape', 'portrait', 'turn'] },
  { id: 'delete-pages', name: 'Delete Pages', tagline: 'Remove unwanted pages visually', href: '/delete-pdf-pages', category: 'organize', icon: DeletePagesIcon, keywords: ['delete', 'remove pages', 'drop pages'] },
  { id: 'extract-pages', name: 'Extract Pages', tagline: 'Save selected pages as a new PDF', href: '/extract-pdf-pages', category: 'organize', icon: ExtractPagesIcon, keywords: ['extract', 'pull pages', 'save pages'] },
  { id: 'page-numbers', name: 'Add Page Numbers', tagline: 'Stamp clean page numbers anywhere', href: '/add-page-numbers', category: 'organize', icon: PageNumbersIcon, keywords: ['page numbers', 'numbering', 'pagination', 'bates'] },
  { id: 'crop', name: 'Crop PDF', tagline: 'Trim margins and unwanted edges', href: '/crop-pdf', category: 'organize', icon: CropIcon, keywords: ['crop', 'trim', 'margins', 'cut edges'] },
  // ---- Convert from PDF ----
  { id: 'pdf-to-word', name: 'PDF to Word', tagline: 'Turn PDFs into editable Word documents', href: '/pdf-to-word', category: 'from', icon: PdfToWordIcon, keywords: ['pdf to word', 'docx', 'convert', 'editable'], popular: true },
  { id: 'pdf-to-jpg', name: 'PDF to JPG', tagline: 'Export every page as a crisp image', href: '/pdf-to-jpg', category: 'from', icon: PdfToJpgIcon, keywords: ['pdf to jpg', 'pdf to image', 'png', 'export images'], popular: true },
  { id: 'pdf-to-images', name: 'PDF to Images', tagline: 'High-resolution page images or ZIP', href: '/pdf-to-images', category: 'from', icon: PdfToJpgIcon, keywords: ['pdf to images', 'png', 'zip', 'screenshots of pdf'] },
  { id: 'pdf-to-text', name: 'PDF to Text', tagline: 'Extract clean, selectable text', href: '/pdf-to-text', category: 'from', icon: PdfToTextIcon, keywords: ['pdf to text', 'extract text', 'txt', 'copy text'] },
  // ---- Convert to PDF ----
  { id: 'word-to-pdf', name: 'Word to PDF', tagline: 'Convert Word files to polished PDFs', href: '/word-to-pdf', category: 'to', icon: WordToPdfIcon, keywords: ['word to pdf', 'docx to pdf', 'convert'], popular: true },
  { id: 'jpg-to-pdf', name: 'JPG to PDF', tagline: 'Build a PDF from your images', href: '/jpg-to-pdf', category: 'to', icon: JpgToPdfIcon, keywords: ['jpg to pdf', 'image to pdf', 'png to pdf', 'photos to pdf'], popular: true },
  // ---- Optimize ----
  { id: 'compress', name: 'Compress PDF', tagline: 'Shrink file size without the quality loss', href: '/compress-pdf', category: 'optimize', icon: CompressIcon, keywords: ['compress', 'reduce size', 'smaller', 'shrink', 'optimize'], popular: true },
  { id: 'flatten', name: 'Flatten PDF', tagline: 'Bake forms and layers into one file', href: '/flatten-pdf', category: 'advanced', icon: FlattenIcon, keywords: ['flatten', 'forms', 'layers', 'lock form'] },
  // ---- Edit & Sign ----
  { id: 'studio', name: 'PDF Studio', tagline: 'The flagship editor: edit, sign, redact', href: '/studio', category: 'edit', icon: StudioIcon, keywords: ['studio', 'editor', 'edit pdf', 'annotate', 'flagship'] },
  { id: 'sign', name: 'Sign PDF', tagline: 'Draw, type or upload your signature', href: '/sign-pdf', category: 'edit', icon: SignIcon, keywords: ['sign', 'signature', 'esign', 'draw signature'], popular: true },
  { id: 'watermark', name: 'Watermark PDF', tagline: 'Stamp text watermarks with style control', href: '/watermark-pdf', category: 'edit', icon: WatermarkIcon, keywords: ['watermark', 'stamp', 'branding', 'draft'] },
  // ---- Security ----
  { id: 'protect', name: 'Protect PDF', tagline: 'Encrypt with a password you choose', href: '/tools/protect-pdf', category: 'security', icon: ProtectIcon, keywords: ['protect', 'encrypt', 'password', 'lock pdf'] },
  { id: 'unlock', name: 'Unlock PDF', tagline: 'Remove password restrictions you own', href: '/unlock-pdf', category: 'security', icon: UnlockIcon, keywords: ['unlock', 'remove password', 'decrypt'] },
  // ---- Advanced ----
  { id: 'redact', name: 'Redact PDF', tagline: 'Black out sensitive text for good', href: '/redact-pdf', category: 'advanced', icon: RedactIcon, keywords: ['redact', 'blackout', 'censor', 'sensitive', 'hide text'] },
  { id: 'ocr', name: 'OCR PDF', tagline: 'Make scanned pages searchable text', href: '/ocr-pdf', category: 'advanced', icon: OcrIcon, keywords: ['ocr', 'scan', 'scanned', 'searchable', 'recognize text'] },
];

export const categoryById = (id: PreviewCategoryId): PreviewCategory =>
  PREVIEW_CATEGORIES.find((c) => c.id === id) as PreviewCategory;

export function searchPreviewTools(query: string): PreviewTool[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const words = q.split(/\s+/);
  return PREVIEW_TOOLS.filter((t) => {
    const hay = `${t.name} ${t.tagline} ${t.keywords.join(' ')}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  }).slice(0, 8);
}

/**
 * Popular tools, ordered by real global search demand:
 * merge → compress → pdf-to-word → split → word-to-pdf → jpg-to-pdf →
 * pdf-to-jpg → sign. Less-searched tools live in the category library.
 */
const POPULAR_ORDER = [
  'merge',
  'compress',
  'pdf-to-word',
  'split',
  'word-to-pdf',
  'jpg-to-pdf',
  'pdf-to-jpg',
  'sign',
];

export const POPULAR_TOOLS: PreviewTool[] = POPULAR_ORDER.map(
  (id) => PREVIEW_TOOLS.find((t) => t.id === id) as PreviewTool
);
