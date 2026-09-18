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
    | 'ShieldAlert';
  tags: string[];
  gradient: string;
  accentColor: string;
  processingNote: string;
}

export const TOOLS_CONFIG: ToolConfig[] = [
  {
    id: 'pdf-merger',
    name: 'PDF Merger',
    description: 'Merge multiple PDF files into one clean document with drag-and-drop reordering and instant download.',
    slug: 'pdf-merger',
    category: 'PDF',
    badge: 'Popular',
    iconName: 'FileText',
    tags: ['PDF', 'Document', 'Reorder'],
    gradient: 'from-emerald-500 to-teal-600',
    accentColor: 'text-emerald-500 dark:text-emerald-400',
    processingNote: '100% Private • Processed in local memory'
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Extract individual pages or separate a multi-page PDF into discrete documents with zero server uploads.',
    slug: 'split-pdf',
    category: 'PDF',
    badge: 'Wave 2',
    iconName: 'Scissors',
    tags: ['PDF', 'Split', 'Extract', 'Pages'],
    gradient: 'from-rose-500 to-red-600',
    accentColor: 'text-rose-500 dark:text-rose-400',
    processingNote: '100% In-browser • Local page extraction'
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce PDF document file size with browser-side raster optimization and stream thinning.',
    slug: 'compress-pdf',
    category: 'PDF',
    badge: 'Wave 2',
    iconName: 'Minimize2',
    tags: ['PDF', 'Compress', 'Shrink', 'Fast'],
    gradient: 'from-blue-600 to-cyan-600',
    accentColor: 'text-blue-500 dark:text-blue-400',
    processingNote: 'Zero uploads • Client-side stream optimization'
  },
  {
    id: 'pdf-to-image',
    name: 'PDF to Image',
    description: 'Convert PDF document pages into high-resolution JPG or PNG images directly in your browser.',
    slug: 'pdf-to-image',
    category: 'PDF',
    badge: 'Wave 2',
    iconName: 'FileImage',
    tags: ['PDF', 'JPG', 'PNG', 'Convert'],
    gradient: 'from-amber-500 to-yellow-600',
    accentColor: 'text-amber-500 dark:text-amber-400',
    processingNote: 'Canvas rendering • 100% Client-side'
  },
  {
    id: 'protect-pdf',
    name: 'Protect PDF',
    description: 'Encrypt PDF documents with standard security passwords and permission restrictions.',
    slug: 'protect-pdf',
    category: 'PDF',
    badge: 'Wave 2',
    iconName: 'ShieldAlert',
    tags: ['PDF', 'Security', 'Password', 'Encrypt'],
    gradient: 'from-violet-600 to-indigo-700',
    accentColor: 'text-violet-500 dark:text-violet-400',
    processingNote: 'Local encryption • Passwords never leave device'
  },
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Compress JPEG, PNG, and WebP images directly in your browser with adjustable quality and instant preview.',
    slug: 'image-compressor',
    category: 'Image',
    badge: 'Popular',
    iconName: 'Image',
    tags: ['Images', 'Lossless/Lossy', 'Fast'],
    gradient: 'from-blue-500 to-indigo-600',
    accentColor: 'text-blue-500 dark:text-blue-400',
    processingNote: 'Zero uploads • In-browser WebAssembly canvas'
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
    processingNote: 'Local Canvas sampling • Zero uploads'
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
    processingNote: 'Instant generation • 100% Client-side'
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
    processingNote: 'No sign-up needed • Direct PDF rendering'
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
    processingNote: 'Instant math • Client-side computation'
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
    processingNote: 'Instant local analysis • Private copy'
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
    processingNote: 'Web Crypto API • Never stored'
  }
];

export function getToolBySlug(slug: string): ToolConfig | undefined {
  return TOOLS_CONFIG.find((tool) => tool.slug === slug);
}
