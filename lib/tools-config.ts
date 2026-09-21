export type ToolCategory = 'All' | 'PDF' | 'Image' | 'Finance' | 'Text' | 'Security';

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  slug: string;
  category: 'PDF' | 'Image' | 'Finance' | 'Text' | 'Security';
  badge?: string;
  iconName:
    | 'Image'
    | 'FileText'
    | 'Receipt'
    | 'Calculator'
    | 'QrCode'
    | 'Palette'
    | 'FileSearch'
    | 'KeyRound'
    | 'Scissors'
    | 'Minimize2'
    | 'FileImage'
    | 'ShieldAlert'
    | 'RotateCw'
    | 'Stamp'
    | 'Layers'
    | 'Unlock'
    | 'FilePenLine';
  tags: string[];
  gradient: string;
  accentColor: string;
  processingNote: string;
}

export const TOOLS_CONFIG: ToolConfig[] = [
  // --- Core 8 PDF Suite Tools ---
  {
    id: 'image-to-pdf',
    name: 'Image to PDF Converter',
    description: 'Convert multiple JPG, PNG, and WebP images into a single clean, beautifully formatted PDF document.',
    slug: 'image-to-pdf',
    category: 'PDF',
    badge: 'Essential',
    iconName: 'Image',
    tags: ['Image to PDF', 'JPG to PDF', 'PNG to PDF', 'Photos to PDF', 'Convert'],
    gradient: 'from-rose-500 to-pink-600',
    accentColor: 'text-rose-500 dark:text-rose-400',
    processingNote: '100% In-Browser • Fast Image Compilation',
  },
  {
    id: 'pdf-to-images',
    name: 'PDF to Images Converter',
    description: 'Extract and convert PDF pages into high-resolution PNG or JPG images individually or as a ZIP archive.',
    slug: 'pdf-to-images',
    category: 'PDF',
    badge: 'Popular',
    iconName: 'FileImage',
    tags: ['PDF to Image', 'PNG', 'JPG', 'Extract Pages', 'ZIP Bundle'],
    gradient: 'from-amber-500 to-orange-600',
    accentColor: 'text-amber-500 dark:text-amber-400',
    processingNote: 'Canvas Rendering • High-DPI Output',
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG Converter',
    description: 'Convert every PDF page to downloadable JPG images or a ZIP archive entirely in your browser.',
    slug: 'pdf-to-jpg',
    category: 'PDF',
    badge: 'Popular',
    iconName: 'FileImage',
    tags: ['PDF to JPG', 'JPG', 'Convert', 'Images', 'ZIP Bundle'],
    gradient: 'from-orange-500 to-red-600',
    accentColor: 'text-orange-500 dark:text-orange-400',
    processingNote: 'Client-Side PDF.js Rendering • JPEG Output',
  },
  {
    id: 'ocr-pdf',
    name: 'OCR PDF',
    description: 'Recognize text in scanned PDF pages with browser-based OCR and download the extracted text.',
    slug: 'ocr-pdf',
    category: 'PDF',
    badge: 'New',
    iconName: 'FileSearch',
    tags: ['OCR PDF', 'Scanned PDF', 'Extract Text', 'OCR'],
    gradient: 'from-cyan-600 to-blue-700',
    accentColor: 'text-cyan-500 dark:text-cyan-400',
    processingNote: 'Client-Side Tesseract OCR • English, Spanish, French, German Scans',
  },
  {
    id: 'sign-pdf',
    name: 'Sign PDF',
    description: 'Place a drawn, typed, or uploaded signature image on a PDF page and download the signed copy.',
    slug: 'sign-pdf',
    category: 'PDF',
    badge: 'New',
    iconName: 'FilePenLine',
    tags: ['Sign PDF', 'Electronic Signature', 'Draw Signature', 'PDF Form'],
    gradient: 'from-emerald-600 to-teal-700',
    accentColor: 'text-emerald-500 dark:text-emerald-400',
    processingNote: 'Client-Side Visual Signature Placement',
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word Converter',
    description: 'Extract selectable PDF text into a downloadable DOCX document in your browser.',
    slug: 'pdf-to-word',
    category: 'PDF',
    badge: 'New',
    iconName: 'FileText',
    tags: ['PDF to Word', 'DOCX', 'Text Extraction', 'Convert'],
    gradient: 'from-blue-600 to-indigo-600',
    accentColor: 'text-blue-500 dark:text-blue-400',
    processingNote: 'Local PDF.js Text Extraction • DOCX Export',
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF Converter',
    description: 'Convert supported DOCX text documents into PDFs locally in your browser.',
    slug: 'word-to-pdf',
    category: 'PDF',
    badge: 'New',
    iconName: 'FileText',
    tags: ['Word to PDF', 'DOCX', 'Convert', 'Documents'],
    gradient: 'from-indigo-600 to-violet-600',
    accentColor: 'text-indigo-500 dark:text-indigo-400',
    processingNote: 'Local DOCX Parsing • PDF Export',
  },
  {
    id: 'organize-pdf',
    name: 'Organize & Reorder PDF',
    description: 'Rearrange, duplicate, delete, and reorder PDF pages visually with intuitive drag-and-drop cards.',
    slug: 'organize-pdf',
    category: 'PDF',
    badge: 'New',
    iconName: 'Layers',
    tags: ['Reorder', 'Organize', 'Rearrange', 'Delete Pages', 'Duplicate'],
    gradient: 'from-indigo-600 to-violet-600',
    accentColor: 'text-indigo-500 dark:text-indigo-400',
    processingNote: 'Visual Page Thumbnails • Local Reordering',
  },
  {
    id: 'unlock-pdf',
    name: 'PDF Password Remover',
    description: 'Decrypt and permanently remove password restrictions from protected PDF files client-side.',
    slug: 'unlock-pdf',
    category: 'PDF',
    badge: 'Security',
    iconName: 'Unlock',
    tags: ['Unlock PDF', 'Password Remover', 'Decrypt', 'Permissions', 'Security'],
    gradient: 'from-emerald-600 to-teal-600',
    accentColor: 'text-emerald-500 dark:text-emerald-400',
    processingNote: 'Client-Side Decryption • Password Never Transmitted',
  },
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF Pages',
    description: 'Rotate specific pages or all pages by 90, 180, or 270 degrees with instant lossless stream orientation.',
    slug: 'rotate-pdf',
    category: 'PDF',
    badge: 'New',
    iconName: 'RotateCw',
    tags: ['Rotate', 'Orientation', 'Turn Pages', '90 Degrees', '180 Degrees'],
    gradient: 'from-blue-600 to-cyan-600',
    accentColor: 'text-blue-500 dark:text-blue-400',
    processingNote: 'Lossless Stream Rotation • Zero Quality Loss',
  },
  {
    id: 'watermark-pdf',
    name: 'PDF Watermarker',
    description: 'Apply custom text watermarks with adjustable opacity, angle, and position across all document pages.',
    slug: 'watermark-pdf',
    category: 'PDF',
    badge: 'Pro',
    iconName: 'Stamp',
    tags: ['Watermark', 'Stamp', 'Confidential', 'Draft', 'Custom Text'],
    gradient: 'from-rose-600 to-red-600',
    accentColor: 'text-rose-500 dark:text-rose-400',
    processingNote: 'Vector Inscription • Live Visual Preview',
  },
  {
    id: 'split-pdf',
    name: 'Split PDF Pages',
    description: 'Extract custom page ranges (e.g. 1-3, 5) or separate all pages into discrete documents with zero server uploads.',
    slug: 'split-pdf',
    category: 'PDF',
    badge: 'Essential',
    iconName: 'Scissors',
    tags: ['Split', 'Extract', 'Page Range', 'Separate Pages', 'Split PDF'],
    gradient: 'from-rose-500 to-red-600',
    accentColor: 'text-rose-500 dark:text-rose-400',
    processingNote: '100% In-Browser • Local Range Extraction',
  },
  {
    id: 'edit-pdf-metadata',
    name: 'PDF Metadata Editor',
    description: 'Inspect, modify, or sanitize Title, Author, Subject, and Keywords document catalog metadata.',
    slug: 'edit-pdf-metadata',
    category: 'PDF',
    badge: 'Pro',
    iconName: 'FilePenLine',
    tags: ['Metadata', 'Author', 'Title', 'Sanitize', 'Document Info', 'Clean'],
    gradient: 'from-violet-600 to-purple-600',
    accentColor: 'text-violet-500 dark:text-violet-400',
    processingNote: 'Catalog Editing • Clean Privacy Strip',
  },

  // --- Additional Foundation PDF Tools ---
  {
    id: 'pdf-merger',
    name: 'PDF Merger',
    description: 'Merge multiple PDF files into one clean document with drag-and-drop reordering and instant download.',
    slug: 'pdf-merger',
    category: 'PDF',
    badge: 'Popular',
    iconName: 'FileText',
    tags: ['PDF', 'Document', 'Merge', 'Combine', 'Joiner'],
    gradient: 'from-emerald-500 to-teal-600',
    accentColor: 'text-emerald-500 dark:text-emerald-400',
    processingNote: '100% Private • Processed in local memory',
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce PDF document file size with browser-side raster optimization and stream thinning.',
    slug: 'compress-pdf',
    category: 'PDF',
    badge: 'Popular',
    iconName: 'Minimize2',
    tags: ['PDF', 'Compress', 'Shrink', 'Fast', 'Reduce Size'],
    gradient: 'from-blue-600 to-cyan-600',
    accentColor: 'text-blue-500 dark:text-blue-400',
    processingNote: 'Zero uploads • Client-side stream optimization',
  },
  {
    id: 'protect-pdf',
    name: 'Protect PDF (Encrypt)',
    description: 'Encrypt PDF documents with standard security passwords and permission restrictions.',
    slug: 'protect-pdf',
    category: 'PDF',
    badge: 'Security',
    iconName: 'ShieldAlert',
    tags: ['PDF', 'Security', 'Password', 'Encrypt', 'Lock'],
    gradient: 'from-violet-600 to-indigo-700',
    accentColor: 'text-violet-500 dark:text-violet-400',
    processingNote: 'Local encryption • Passwords never leave device',
  },

  // --- Complementary Suite Utilities ---
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Compress JPEG, PNG, and WebP images directly in your browser with adjustable quality and instant preview.',
    slug: 'image-compressor',
    category: 'Image',
    badge: 'Popular',
    iconName: 'Image',
    tags: ['Images', 'Lossless/Lossy', 'Fast', 'Compress'],
    gradient: 'from-blue-500 to-indigo-600',
    accentColor: 'text-blue-500 dark:text-blue-400',
    processingNote: 'Zero uploads • In-browser WebAssembly canvas',
  },
  {
    id: 'color-extractor',
    name: 'Color Palette Extractor',
    description: 'Extract dominant color palettes, HEX/RGB codes, and contrast ratios directly from any uploaded image.',
    slug: 'color-extractor',
    category: 'Image',
    badge: 'New',
    iconName: 'Palette',
    tags: ['Color', 'Palette', 'Design', 'HEX'],
    gradient: 'from-pink-500 to-rose-600',
    accentColor: 'text-pink-500 dark:text-pink-400',
    processingNote: 'Local Canvas sampling • Zero uploads',
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Generate customizable, high-resolution QR codes for URLs, Wi-Fi, and text with instant SVG and PNG downloads.',
    slug: 'qr-generator',
    category: 'Image',
    badge: 'New',
    iconName: 'QrCode',
    tags: ['QR', 'Barcode', 'SVG/PNG', 'Offline'],
    gradient: 'from-cyan-500 to-blue-600',
    accentColor: 'text-cyan-500 dark:text-cyan-400',
    processingNote: 'Instant generation • 100% Client-side',
  },
  {
    id: 'invoice-generator',
    name: 'Invoice Generator',
    description: 'Create and export professional, branded PDF invoices with custom tax rates, line items, and currency support.',
    slug: 'invoice-generator',
    badge: 'Pro Format',
    category: 'Finance',
    iconName: 'Receipt',
    tags: ['Invoice', 'PDF Export', 'Billing'],
    gradient: 'from-violet-500 to-purple-600',
    accentColor: 'text-violet-500 dark:text-violet-400',
    processingNote: 'No sign-up needed • Direct PDF rendering',
  },
  {
    id: 'tax-calculator',
    name: 'Tax Calculator',
    description: 'Quickly compute sales tax, value-added tax (VAT), gross-to-net earnings, and deductions with real-time breakdowns.',
    slug: 'tax-calculator',
    category: 'Finance',
    badge: 'Updated 2026',
    iconName: 'Calculator',
    tags: ['Taxes', 'Deductions', 'Calculators'],
    gradient: 'from-amber-500 to-orange-600',
    accentColor: 'text-amber-500 dark:text-amber-400',
    processingNote: 'Instant math • Client-side computation',
  },
  {
    id: 'text-analyzer',
    name: 'SEO Text Analyzer',
    description: 'Analyze word count, reading time, keyword density, and sentence structure for high-ranking SEO copy.',
    slug: 'text-analyzer',
    category: 'Text',
    badge: 'New',
    iconName: 'FileSearch',
    tags: ['SEO', 'Text', 'Keywords', 'Content'],
    gradient: 'from-emerald-500 to-teal-600',
    accentColor: 'text-emerald-500 dark:text-emerald-400',
    processingNote: 'Instant local analysis • Private copy',
  },
  {
    id: 'password-generator',
    name: 'Secure Password Generator',
    description: 'Create cryptographically secure, random passwords and passphrases with entropy analysis and custom rules.',
    slug: 'password-generator',
    category: 'Security',
    badge: 'New',
    iconName: 'KeyRound',
    tags: ['Security', 'Password', 'Crypto', 'Entropy'],
    gradient: 'from-amber-500 to-yellow-600',
    accentColor: 'text-amber-500 dark:text-amber-400',
    processingNote: 'Web Crypto API • Never stored',
  },
];

// Slugs and Alias Lookup Mapping
const SLUG_ALIASES: Record<string, string> = {
  'pdf-to-image': 'pdf-to-images',
  'pdf-page-splitter': 'split-pdf',
  'pdf-password-remover': 'unlock-pdf',
  'pdf-page-rotator': 'rotate-pdf',
  'pdf-watermarker': 'watermark-pdf',
  'pdf-page-reorder': 'organize-pdf',
  'pdf-metadata-editor': 'edit-pdf-metadata',
};

export function getToolBySlug(slug: string): ToolConfig | undefined {
  const direct = TOOLS_CONFIG.find((tool) => tool.slug === slug);
  if (direct) return direct;

  // Check alias
  const targetSlug = SLUG_ALIASES[slug];
  if (targetSlug) {
    return TOOLS_CONFIG.find((tool) => tool.slug === targetSlug);
  }

  return undefined;
}

export function getAllToolSlugs(): string[] {
  const canonicals = TOOLS_CONFIG.map((t) => t.slug);
  const aliases = Object.keys(SLUG_ALIASES);
  return Array.from(new Set([...canonicals, ...aliases]));
}
