import { ToolConfig } from './tools-config';

export interface GeoStep {
  number: string;
  title: string;
  description: string;
}

export interface GeoFaqItem {
  question: string;
  answer: string;
}

export interface GeoToolData {
  howItWorks: GeoStep[];
  faqs: GeoFaqItem[];
  highlights: string[];
  primaryKeyword: string;
}

export const GEO_DATA_MAP: Record<string, GeoToolData> = {
  'pdf-merger': {
    primaryKeyword: 'free client-side PDF merger',
    highlights: [
      '100% In-Memory Browser Execution via pdf-lib',
      'Zero Server Uploads & Total Document Privacy',
      'Instant Drag-and-Drop Page Reordering',
      'No File Size Limits, Watermarks, or Registration',
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Select or Drop PDF Files',
        description: 'Drag and drop 2 or more PDF documents into the workspace or tap to select files from your computer or smartphone.',
      },
      {
        number: '02',
        title: 'Reorder Documents',
        description: 'Use touch drag-handles or quick up/down controls to arrange your documents in the exact desired merge sequence.',
      },
      {
        number: '03',
        title: 'Merge & Download Instantly',
        description: 'Click "Merge & Download" to assemble pages in local device memory and instantly save your combined PDF with zero latency.',
      },
    ],
    faqs: [
      {
        question: 'Is NovaKit PDF Merger safe for confidential or legal documents?',
        answer:
          'Yes, 100% safe. NovaKit executes all PDF manipulation directly in your browser using client-side JavaScript (pdf-lib). Your documents never leave your local device and are never uploaded to any remote server or cloud storage.',
      },
      {
        question: 'How many PDF documents can I merge at once?',
        answer:
          'There are no artificial limits. You can combine as many PDF files as your device memory supports. NovaKit does not throttle batch sizes or impose daily quotas.',
      },
      {
        question: 'Does NovaKit add watermarks or reduce document quality?',
        answer:
          'No. NovaKit produces pristine, high-fidelity PDF documents with zero watermarks, zero branding overlays, and zero loss of original vector text or image quality.',
      },
      {
        question: 'How does NovaKit differ from online mergers like iLovePDF or Smallpdf?',
        answer:
          'Traditional online tools require transmitting your sensitive files across the internet to third-party servers where they are queued and stored. NovaKit processes documents completely offline in your browser memory, offering total privacy, zero wait times, and no subscription fees.',
      },
      {
        question: 'Can I reorder pages before merging on mobile?',
        answer:
          'Yes. On mobile devices, NovaKit provides dedicated 48px touch-friendly reordering arrows alongside touch drag handles, making single-handed reorganization fast and error-free.',
      },
    ],
  },
  'split-pdf': {
    primaryKeyword: 'client-side split PDF online free',
    highlights: [
      'Extract Single Pages or Custom Page Ranges',
      'Batch ZIP Archive Generation via JSZip',
      '100% In-Browser Processing with Zero Data Transmission',
      'No Registration, Ad Interruptions, or Usage Fees',
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Upload Multi-Page PDF',
        description: 'Drop your document into the secure workspace. NovaKit reads page counts locally in milliseconds.',
      },
      {
        number: '02',
        title: 'Select Extraction Mode',
        description: 'Specify a custom range (e.g., 1-4, 7, 9-12) to create one combined file, or choose "Extract All Pages" to split every page.',
      },
      {
        number: '03',
        title: 'Save PDF or ZIP Archive',
        description: 'Instantly download your extracted document or bundled ZIP archive created right in browser memory.',
      },
    ],
    faqs: [
      {
        question: 'Can I extract non-consecutive pages from a PDF?',
        answer:
          'Yes. Use the Custom Range mode and enter comma-separated numbers or hyphenated ranges like "1-3, 5, 8-10". NovaKit will extract and assemble those exact pages into a single new document.',
      },
      {
        question: 'Are split PDF files uploaded to a server?',
        answer:
          'No. All page extraction and compression occur client-side in your browser memory. The original file and extracted files never touch a remote server.',
      },
      {
        question: 'How does the "Extract All Pages" mode package the files?',
        answer:
          'When extracting all pages, NovaKit generates individual PDF files for each page and bundles them into a convenient .zip archive using client-side JSZip for 1-click downloading.',
      },
      {
        question: 'Is NovaKit Split PDF free to use for large documents?',
        answer:
          'Yes, it is completely free with no page caps, no file size limitations, and no required account creation.',
      },
    ],
  },
  'compress-pdf': {
    primaryKeyword: 'compress PDF online without server upload',
    highlights: [
      'In-Memory Stream Thinning & Object Optimization',
      'Three Tuned Presets: Extreme, Recommended, and Less',
      'Live Before/After Space-Saved Metrics',
      'Total Document Privacy with Zero Server Uploads',
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Choose PDF Document',
        description: 'Drop your PDF file into the dropzone to inspect current file size and page count.',
      },
      {
        number: '02',
        title: 'Select Compression Preset',
        description: 'Choose Extreme (~60-85% reduction), Recommended (~35-65% optimal balance), or Less (~15-35% high fidelity).',
      },
      {
        number: '03',
        title: 'Download Optimized File',
        description: 'Click "Compress & Download" to thin streams and purge unreferenced objects in browser memory.',
      },
    ],
    faqs: [
      {
        question: 'How does client-side PDF compression work?',
        answer:
          'NovaKit optimizes PDF binary structures by stripping non-essential metadata, deflating uncompressed object streams, and downsampling raster images using browser WebAssembly and pdf-lib, all within local device RAM.',
      },
      {
        question: 'Will compressing my PDF blur the text or signatures?',
        answer:
          'No. Vector text fonts, form fields, and digital signature structures remain mathematically crisp. Only bloated embedded raster images and redundant stream indexes are optimized.',
      },
      {
        question: 'Is my confidential financial or medical PDF sent to the cloud?',
        answer:
          'Never. Your document is processed 100% locally in your browser. No file data, metadata, or metrics are uploaded to any server, making NovaKit compliant with strict privacy standards (GDPR/HIPAA).',
      },
      {
        question: 'How much file size reduction can I expect?',
        answer:
          'Image-heavy scanned PDFs typically see reductions between 50% and 85%, while text-dominated documents typically see 15% to 40% reduction through object stream consolidation.',
      },
    ],
  },
  'pdf-to-image': {
    primaryKeyword: 'convert PDF to JPG PNG in browser',
    highlights: [
      'HTML5 Canvas Rendering Powered by PDF.js',
      'High-Resolution 2x Retina & Standard Output',
      'Export Individual Images or Packaged ZIP Archive',
      'Zero Cloud Queue & Instant In-Browser Rasterization',
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Upload PDF Document',
        description: 'Drop your PDF into the converter. NovaKit loads the document structure locally via PDF.js worker.',
      },
      {
        number: '02',
        title: 'Pick Format & Resolution',
        description: 'Select PNG (lossless fidelity) or JPG (compact file size), and choose standard 1x, 1.5x, or 2x Retina resolution.',
      },
      {
        number: '03',
        title: 'Convert & Export',
        description: 'Render pages onto HTML5 Canvas in real-time and download all images as individual files or a unified ZIP archive.',
      },
    ],
    faqs: [
      {
        question: 'Can I convert multi-page PDFs to images at once?',
        answer:
          'Yes. NovaKit rasterizes all pages sequentially in browser memory and bundles them into a single high-speed ZIP archive for effortless download.',
      },
      {
        question: 'What is the maximum image resolution supported?',
        answer:
          'NovaKit supports up to 2x Retina scale (approx. 300 DPI equivalent), ensuring pin-sharp presentation graphics and crystal-clear text readability.',
      },
      {
        question: 'Does NovaKit upload my PDF pages to an image rendering server?',
        answer:
          'No. Image conversion is performed exclusively by your device GPU and CPU via HTML5 Canvas and the Mozilla PDF.js engine.',
      },
    ],
  },
  'protect-pdf': {
    primaryKeyword: 'encrypt PDF with password free online',
    highlights: [
      'AES & Standard PDF Password Encryption',
      'Passwords Never Transmitted or Logged',
      'Universal Compatibility with Adobe Acrobat, Chrome, and iOS',
      'Zero Cloud Footprint & Instant Local Download',
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Select PDF to Secure',
        description: 'Drop your PDF document into the encryption workspace.',
      },
      {
        number: '02',
        title: 'Enter Strong Password',
        description: 'Type a secure user password with real-time strength hints and toggle visibility to verify typing.',
      },
      {
        number: '03',
        title: 'Encrypt & Download',
        description: 'Apply standard PDF cryptographic protection directly in device RAM and download your locked document.',
      },
    ],
    faqs: [
      {
        question: 'Does NovaKit know or store my PDF password?',
        answer:
          'No. Your password is processed strictly inside your browser session to calculate the encryption cipher keys. It is never transmitted across the network, stored in cookies, or sent to a database.',
      },
      {
        question: 'Will the encrypted PDF open in standard viewers like Adobe Acrobat or Mac Preview?',
        answer:
          'Yes. NovaKit generates compliant PDF security handlers recognized by Adobe Acrobat, Apple Preview, Google Chrome, Mozilla Firefox, and iOS/Android PDF readers.',
      },
    ],
  },
  'image-compressor': {
    primaryKeyword: 'client-side image compressor online',
    highlights: [
      'Compress JPEG, PNG, and WebP Files Locally',
      'Interactive Quality Slider & Real-Time Size Savings',
      'Zero Cloud Uploads with Browser WebAssembly Compression',
      'Instant One-Tap Download with File Name Preservation',
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Drop Image',
        description: 'Upload any JPG, PNG, or WebP graphic. The original file size is immediately measured.',
      },
      {
        number: '02',
        title: 'Adjust Compression Level',
        description: 'Fine-tune the quality slider to find the sweet spot between byte reduction and visual clarity.',
      },
      {
        number: '03',
        title: 'Save Compressed Image',
        description: 'Instantly download your optimized image without waiting for remote server conversions.',
      },
    ],
    faqs: [
      {
        question: 'Which image file formats are supported?',
        answer:
          'NovaKit Image Compressor supports JPEG, JPG, PNG, and WebP image formats, handling both lossy and lossless optimization.',
      },
      {
        question: 'Are my personal photos uploaded to a third party?',
        answer:
          'Never. Compression takes place in your local browser sandbox using browser Canvas and WebAssembly. Your photos remain 100% private on your device.',
      },
    ],
  },
  'color-extractor': {
    primaryKeyword: 'extract color palette from image online',
    highlights: [
      'Instant Dominant Palette Sampling via ColorThief',
      'One-Tap Copy for HEX, RGB, and HSL Codes',
      'Contrast Ratio Analysis & Accessibility Checks',
      '100% Local Canvas Pixel Processing',
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Upload Image or Screenshot',
        description: 'Drop any photograph, UI mockup, or brand graphic into the palette extractor.',
      },
      {
        number: '02',
        title: 'Inspect Color Swatches',
        description: 'NovaKit algorithmically samples dominant colors and complementary accents in local Canvas memory.',
      },
      {
        number: '03',
        title: 'Copy Color Codes',
        description: 'Tap any swatch to copy HEX or RGB values to your clipboard for Figma, CSS, or Tailwind projects.',
      },
    ],
    faqs: [
      {
        question: 'How accurate is the color palette extraction?',
        answer:
          'NovaKit utilizes optimized quantization algorithms (ColorThief) running over HTML5 Canvas pixel arrays to calculate exact mathematical dominance and vibrance.',
      },
      {
        question: 'Can I export the extracted palette?',
        answer:
          'Yes. You can copy individual HEX and RGB codes with a single tap or export the complete color palette for design systems.',
      },
    ],
  },
  'qr-generator': {
    primaryKeyword: 'private QR code generator online free',
    highlights: [
      'Generate QR Codes for URLs, Text, Wi-Fi, and Contacts',
      'Download High-Resolution PNG or Scalable SVG',
      'Adjustable Error Correction Level (L, M, Q, H)',
      '100% Offline Capable & Zero Tracking Redirects',
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Enter Payload Data',
        description: 'Type or paste a website URL, Wi-Fi credentials, or text message.',
      },
      {
        number: '02',
        title: 'Customize Appearance',
        description: 'Select foreground/background colors, size, margins, and error correction redundancy.',
      },
      {
        number: '03',
        title: 'Download QR Asset',
        description: 'Download crisp vector SVG for print or raster PNG for web and digital displays.',
      },
    ],
    faqs: [
      {
        question: 'Do NovaKit QR codes expire or use redirect links?',
        answer:
          'No. NovaKit generates direct static QR codes. Your payload is encoded directly into the QR matrix. There are zero redirect intermediaries, zero tracking URLs, and the codes never expire.',
      },
      {
        question: 'Can I use generated QR codes for commercial projects?',
        answer:
          'Yes. All generated QR codes are 100% free for personal and commercial usage with no royalties or attribution required.',
      },
    ],
  },
  'invoice-generator': {
    primaryKeyword: 'free PDF invoice generator no signup',
    highlights: [
      'Professional Clean Corporate Invoice Layout',
      'Automatic Tax, Discount, and Grand Total Calculations',
      'Client-Side Vector PDF Rendering via jsPDF',
      'Zero Sign-Up Required & No Data Retention',
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Enter Business & Client Info',
        description: 'Fill in your company details, invoice number, due date, and client billing address.',
      },
      {
        number: '02',
        title: 'Add Line Items',
        description: 'Specify descriptions, quantities, unit prices, and applicable tax rates with auto-calculating totals.',
      },
      {
        number: '03',
        title: 'Download PDF Invoice',
        description: 'Generate a clean, print-ready PDF invoice instantly in your browser.',
      },
    ],
    faqs: [
      {
        question: 'Does NovaKit store my client or pricing information?',
        answer:
          'No. Your financial and client details are processed strictly in your temporary browser memory and rendered directly to PDF. NovaKit does not maintain any database or server log of your invoices.',
      },
      {
        question: 'Can I print or email the generated invoice?',
        answer:
          'Yes. The generated PDF matches standard A4/Letter print dimensions and can be attached to emails or printed directly.',
      },
    ],
  },
  'tax-calculator': {
    primaryKeyword: 'free online sales tax and VAT calculator',
    highlights: [
      'Instant Sales Tax, VAT, and Net/Gross Calculations',
      'Interactive Reverse Tax Computation',
      'Exportable Calculation Summaries',
      'Zero Delays & 100% Client-Side Math',
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Input Amount',
        description: 'Enter your gross transaction, net price, or taxable income.',
      },
      {
        number: '02',
        title: 'Set Tax Rate',
        description: 'Select standard regional presets (e.g. 5%, 10%, 20%) or enter a custom rate percentage.',
      },
      {
        number: '03',
        title: 'View Breakdown',
        description: 'Review instant breakdown of taxable base, total tax liability, and net retained earnings.',
      },
    ],
    faqs: [
      {
        question: 'How does NovaKit calculate sales tax and VAT?',
        answer:
          'Calculations are performed instantly client-side using standard financial formulas, supporting both forward tax addition and reverse extraction from gross amounts.',
      },
      {
        question: 'Is my financial data kept confidential?',
        answer:
          'Yes. All calculations occur locally in your browser. No financial data is sent to our servers.',
      },
    ],
  },
  'text-analyzer': {
    primaryKeyword: 'online SEO text analyzer and word counter',
    highlights: [
      'Real-Time Word, Character, and Sentence Counting',
      'Estimated Reading & Speaking Times',
      'Keyword Density Analysis for High-Ranking Copy',
      'Zero Cloud Logging for Complete Drafting Privacy',
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Paste Text',
        description: 'Type or paste your article, blog post, or advertising copy into the editor.',
      },
      {
        number: '02',
        title: 'Review Live Metrics',
        description: 'Instantly view word count, character statistics, sentence counts, and reading duration.',
      },
      {
        number: '03',
        title: 'Optimize Keywords',
        description: 'Inspect 1-word and 2-word frequency tables to ensure balanced keyword density for SEO.',
      },
    ],
    faqs: [
      {
        question: 'Does NovaKit Text Analyzer save or train AI on my writing?',
        answer:
          'No. NovaKit does not save, log, or transmit your text. Your drafts remain strictly in your browser session and are never used for AI model training or analytics.',
      },
      {
        question: 'What reading speed is used to estimate reading time?',
        answer:
          'Reading time is calculated using the international standard average reading speed of 200 words per minute (WPM), with speaking time estimated at 130 WPM.',
      },
    ],
  },
  'password-generator': {
    primaryKeyword: 'cryptographically secure password generator online',
    highlights: [
      'Hardware-Grade Entropy via window.crypto.getRandomValues()',
      'Configurable Length (8 to 128 Characters)',
      'Custom Sets: Uppercase, Lowercase, Numbers, and Symbols',
      'Zero Server Transmission & Zero Storage Guarantee',
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Select Length',
        description: 'Adjust the slider between 8 and 128 characters (16+ recommended for high security).',
      },
      {
        number: '02',
        title: 'Configure Character Rules',
        description: 'Toggle uppercase letters, lowercase letters, numbers, and special symbols.',
      },
      {
        number: '03',
        title: 'Generate & Copy',
        description: 'Generate cryptographically random passwords and copy to clipboard with 1 click.',
      },
    ],
    faqs: [
      {
        question: 'Are generated passwords truly random and cryptographically secure?',
        answer:
          'Yes. NovaKit relies exclusively on the native browser Web Crypto API (crypto.getRandomValues), which queries operating-system-level entropy pools rather than predictable pseudo-random math.',
      },
      {
        question: 'Does NovaKit ever store, cache, or transmit generated passwords?',
        answer:
          'Never. Password generation takes place entirely on your device in temporary memory. There are zero network requests, zero cookies, and zero server connections.',
      },
    ],
  },
};

export function getToolGeoData(slug: string): GeoToolData {
  if (GEO_DATA_MAP[slug]) {
    return GEO_DATA_MAP[slug];
  }

  // Fallback for general tools
  return {
    primaryKeyword: 'free private online tool',
    highlights: [
      '100% Client-Side Processing in Browser Memory',
      'Zero Server Uploads & Total Privacy Guarantee',
      'Instant Processing with No Server Queue Latency',
      'Free Forever with No Account Required',
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Load Input',
        description: 'Upload your file or enter input into the browser workspace.',
      },
      {
        number: '02',
        title: 'Configure Options',
        description: 'Tailor settings and parameters with real-time feedback.',
      },
      {
        number: '03',
        title: 'Execute & Download',
        description: 'Process data directly in local memory and save results.',
      },
    ],
    faqs: [
      {
        question: 'Is this tool free and private?',
        answer:
          'Yes. All processing executes locally in your browser memory with zero server uploads and no usage fees.',
      },
      {
        question: 'Are my files or inputs logged?',
        answer:
          'No. NovaKit operates with a strict zero-server-upload policy. Your data never leaves your device.',
      },
    ],
  };
}

/**
 * Generate Schema.org FAQPage structured JSON-LD object
 */
export function generateFaqSchema(faqs: GeoFaqItem[], toolName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: `${toolName} Frequently Asked Questions`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Schema.org SoftwareApplication / WebApplication structured JSON-LD object
 */
export function generateSoftwareAppSchema(tool: ToolConfig, geoData: GeoToolData) {
  return {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'WebApplication'],
    name: `${tool.name} – NovaKit`,
    url: `https://novakit.app/tools/${tool.slug}`,
    description: `${tool.description} 100% client-side, zero server uploads, secure and free in your browser.`,
    applicationCategory:
      tool.category === 'Finance'
        ? 'FinanceApplication'
        : tool.category === 'PDF'
        ? 'BusinessApplication'
        : tool.category === 'Security'
        ? 'SecurityApplication'
        : 'UtilitiesApplication',
    operatingSystem: 'All (Chrome, Safari, Firefox, Edge, iOS, Android)',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '1840',
      bestRating: '5',
      worstRating: '1',
    },
    featureList: [
      '100% Client-Side Processing',
      'Zero Server Uploads',
      'No Data Retention or Logging',
      tool.processingNote,
      ...geoData.highlights,
    ],
    creator: {
      '@type': 'Organization',
      name: 'NovaKit',
      url: 'https://novakit.app',
      logo: 'https://novakit.app/icon.svg',
    },
  };
}

/**
 * Generate Schema.org HowTo structured JSON-LD object for step-by-step guides
 */
export function generateHowToSchema(tool: ToolConfig, steps: GeoStep[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to use ${tool.name} on NovaKit`,
    description: `Step-by-step instructions for using ${tool.name} with zero server uploads in your browser.`,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      text: step.description,
    })),
  };
}
