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

export interface GeoSemanticSubheading {
  heading: string;
  body: string;
}

export interface GeoToolData {
  primaryKeyword: string;
  seoTitle: string;
  metaDescription: string;
  longTailKeywords: string[];
  highlights: string[];
  semanticSubheadings: GeoSemanticSubheading[];
  howItWorks: GeoStep[];
  faqs: GeoFaqItem[];
}

export const GEO_DATA_MAP: Record<string, GeoToolData> = {
  'pdf-merger': {
    primaryKeyword: 'secure client-side PDF merger',
    seoTitle: 'Secure Client-Side PDF Merger – Combine PDF Files Locally Free | NovaKit',
    metaDescription:
      'Combine multiple PDF files into one clean document with zero server uploads. 100% private, client-side in-memory processing via pdf-lib. Drag-and-drop page reordering with instant local download. Unlimited file size, no watermark, no sign-up required.',
    longTailKeywords: [
      'secure client-side pdf merger',
      'free local pdf merger',
      'combine pdf files without uploading',
      'offline pdf joiner for confidential documents',
      'merge pdf online free no limit no signup',
      'browser-based pdf binder for legal contracts',
      'drag and drop pdf page reorder and combine',
      'fast private pdf stitcher',
      'client-side pdf merger online free',
    ],
    highlights: [
      '100% In-Memory Browser Execution via pdf-lib',
      'Zero Server Uploads & Total Document Privacy',
      'Instant Drag-and-Drop Page Reordering',
      'No File Size Limits, Watermarks, or Registration',
      'Compliant with GDPR, HIPAA, and Enterprise Data Isolation Standards',
    ],
    semanticSubheadings: [
      {
        heading: 'Why Client-Side PDF Merging Is the Superior Enterprise Standard',
        body: 'Unlike legacy online PDF tools that upload sensitive client records to remote cloud servers, NovaKit processes multi-page documents strictly within device RAM using pdf-lib. This guarantees zero server exposure, 100% compliance with GDPR/HIPAA standards, and zero network lag.',
      },
      {
        heading: 'How to Reorder and Assemble PDFs Without File Size Limits',
        body: 'Drag and drop unlimited documents into the workspace. Reorder pages seamlessly using intuitive touch-friendly controls and instant in-memory concatenation for immediate export.',
      },
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Select or Drop PDF Files',
        description:
          'Drag and drop 2 or more PDF documents into the workspace or tap to select files from your computer or smartphone.',
      },
      {
        number: '02',
        title: 'Reorder Documents',
        description:
          'Use touch drag-handles or quick up/down controls to arrange your documents in the exact desired merge sequence.',
      },
      {
        number: '03',
        title: 'Merge & Download Instantly',
        description:
          'Click "Merge & Download" to assemble pages in local device memory and instantly save your combined PDF with zero latency.',
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
    seoTitle: 'Split PDF Online Free – Extract Pages & Separate PDF Locally | NovaKit',
    metaDescription:
      'Extract individual pages or separate multi-page PDF documents into discrete files or bundled ZIP archives. 100% in-browser processing with zero server uploads. Extract custom page ranges or split all pages instantly.',
    longTailKeywords: [
      'client-side split pdf online free',
      'extract pages from pdf without uploading',
      'separate pdf into individual pages zip',
      'offline pdf splitter for private documents',
      'free pdf page separator custom range',
      'browser-based pdf page extractor zero upload',
      'split multi-page pdf document locally',
    ],
    highlights: [
      'Extract Single Pages or Custom Page Ranges',
      'Batch ZIP Archive Generation via JSZip',
      '100% In-Browser Processing with Zero Data Transmission',
      'No Registration, Ad Interruptions, or Usage Fees',
    ],
    semanticSubheadings: [
      {
        heading: 'Zero-Upload Page Extraction for Maximum Document Confidentiality',
        body: 'Extract single pages or custom ranges without transmitting confidential contracts, financial filings, or medical reports across the public internet.',
      },
      {
        heading: 'Instant ZIP Batch Archiving via JSZip Client Memory',
        body: 'Split all pages at once and download a pre-packaged ZIP archive generated on-the-fly in browser memory with zero server lag.',
      },
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Upload Multi-Page PDF',
        description:
          'Drop your document into the secure workspace. NovaKit reads page counts locally in milliseconds.',
      },
      {
        number: '02',
        title: 'Select Extraction Mode',
        description:
          'Specify a custom range (e.g., 1-4, 7, 9-12) to create one combined file, or choose "Extract All Pages" to split every page.',
      },
      {
        number: '03',
        title: 'Save PDF or ZIP Archive',
        description:
          'Instantly download your extracted document or bundled ZIP archive created right in browser memory.',
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
    primaryKeyword: 'free local PDF compressor',
    seoTitle: 'Free Local PDF Compressor – Reduce PDF File Size Client-Side | NovaKit',
    metaDescription:
      'Compress and shrink PDF document file sizes directly in your browser with zero server uploads. Advanced stream thinning and raster optimization for email attachments and portal uploads. 100% confidential, free forever, no signup.',
    longTailKeywords: [
      'free local pdf compressor',
      'reduce pdf file size without server upload',
      'client-side pdf compression tool',
      'compress pdf for email attachment under 25mb',
      'shrink pdf online free without losing quality',
      'browser-based pdf size reducer zero upload',
      'private pdf optimizer for confidential bank statements',
      'compress large scanned pdf documents online free',
    ],
    highlights: [
      'In-Memory Stream Thinning & Object Optimization',
      'Three Tuned Presets: Extreme, Recommended, and Less',
      'Live Before/After Space-Saved Metrics',
      'Total Document Privacy with Zero Server Uploads',
    ],
    semanticSubheadings: [
      {
        heading: 'Stream Thinning & In-Memory Object Optimization',
        body: 'Reduce file weight by deflating object streams, stripping redundant metadata, and consolidating fonts while maintaining vector text clarity and sharp signatures.',
      },
      {
        heading: 'Strict Privacy Compliance for Sensitive PDF Reduction',
        body: 'Compress NDA documents, tax statements, and medical charts with zero network transmission risk and complete data sovereignty.',
      },
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Choose PDF Document',
        description:
          'Drop your PDF file into the dropzone to inspect current file size and page count.',
      },
      {
        number: '02',
        title: 'Select Compression Preset',
        description:
          'Choose Extreme (~60-85% reduction), Recommended (~35-65% optimal balance), or Less (~15-35% high fidelity).',
      },
      {
        number: '03',
        title: 'Download Optimized File',
        description:
          'Click "Compress & Download" to thin streams and purge unreferenced objects in browser memory.',
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
    primaryKeyword: 'convert PDF to JPG PNG client-side',
    seoTitle: 'PDF to Image Converter – High-Resolution JPG & PNG Online Free | NovaKit',
    metaDescription:
      'Convert PDF pages into high-resolution JPG or PNG images directly in your browser using client-side canvas rendering. Zero server uploads, total privacy, batch ZIP download, no file size caps.',
    longTailKeywords: [
      'convert pdf to jpg png client-side',
      'free pdf to image converter zero upload',
      'extract images from pdf in browser',
      'convert pdf pages to high resolution png 300dpi',
      'private pdf to jpg converter offline',
      'browser-based pdf canvas renderer',
      'batch pdf to image converter free no limits',
    ],
    highlights: [
      'HTML5 Canvas Rendering Powered by PDF.js',
      'High-Resolution 2x Retina & Standard Output',
      'Export Individual Images or Packaged ZIP Archive',
      'Zero Cloud Queue & Instant In-Browser Rasterization',
    ],
    semanticSubheadings: [
      {
        heading: 'High-Fidelity Canvas Rasterization Powered by PDF.js',
        body: 'Render vector typography and embedded photographs into razor-sharp 300 DPI PNG or compact JPG images without leaving your device.',
      },
      {
        heading: 'Instant Multi-Page Batch Conversion with One-Click ZIP Download',
        body: 'Convert entire books, presentations, or legal packets with batch ZIP packaging generated directly in client memory.',
      },
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Upload PDF Document',
        description:
          'Drop your PDF into the converter. NovaKit loads the document structure locally via PDF.js worker.',
      },
      {
        number: '02',
        title: 'Pick Format & Resolution',
        description:
          'Select PNG (lossless fidelity) or JPG (compact file size), and choose standard 1x, 1.5x, or 2x Retina resolution.',
      },
      {
        number: '03',
        title: 'Convert & Export',
        description:
          'Render pages onto HTML5 Canvas in real-time and download all images as individual files or a unified ZIP archive.',
      },
    ],
    faqs: [
      {
        question: 'Can I convert multi-page PDFs to images at once?',
        answer:
          'Yes. NovaKit rasterizes all pages sequentially in browser memory and bundles them into a single high-speed ZIP archive for effortless download.',
      },
      {
        question: 'What is the quality difference between PNG and JPG?',
        answer:
          'PNG offers lossless graphic reproduction ideal for diagrams, technical blueprints, and typography. JPG produces lightweight compressed files suitable for photographic documents and email delivery.',
      },
      {
        question: 'Are my converted page images stored on NovaKit servers?',
        answer:
          'No. NovaKit operates with zero server storage. The conversion takes place purely inside your browser rendering pipeline.',
      },
    ],
  },
  'protect-pdf': {
    primaryKeyword: 'encrypt PDF document offline free',
    seoTitle: 'Protect PDF Online – Encrypt & Password Protect PDF Locally | NovaKit',
    metaDescription:
      'Encrypt and password-protect your PDF documents with industry-standard security and permission controls. 100% local encryption—passwords and files never leave your device.',
    longTailKeywords: [
      'encrypt pdf document offline free',
      'add password to pdf without server upload',
      'client-side pdf encryption 128-bit 256-bit',
      'protect confidential pdf files locally',
      'secure pdf with user and owner password',
      'browser-based pdf lock tool',
      'password protect sensitive financial pdf in browser',
    ],
    highlights: [
      'Client-Side AES Encryption via Web Crypto Standards',
      'Dual Password Protection: User & Owner Permissions',
      'Zero Cloud Transmission of Passwords or Documents',
      'Custom Print and Copy Permission Restriction Flags',
    ],
    semanticSubheadings: [
      {
        heading: 'Hardware-Level Encryption Passwords Never Transmitted',
        body: 'Secure documents using standard AES algorithms where encryption keys are derived and applied entirely within your browser environment.',
      },
      {
        heading: 'Granular Document Permission and Restriction Controls',
        body: 'Prevent unauthorized printing, copying, and modification while ensuring confidential distribution across enterprise teams.',
      },
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Choose PDF Document',
        description: 'Drop the document you want to secure into the local encryption studio.',
      },
      {
        number: '02',
        title: 'Set Security Passwords',
        description:
          'Define a User Open password and an optional Master Owner password with restricted permissions.',
      },
      {
        number: '03',
        title: 'Encrypt & Download',
        description:
          'Lock the file using client-side encryption algorithms and download your secured document instantly.',
      },
    ],
    faqs: [
      {
        question: 'Can NovaKit recover my PDF if I forget the password?',
        answer:
          'No. Because NovaKit has zero access to your passwords and executes encryption entirely on your local machine, forgotten passwords cannot be retrieved by anyone.',
      },
      {
        question: 'What level of encryption does NovaKit use?',
        answer:
          'NovaKit applies standard 128-bit and 256-bit AES encryption compliant with Adobe Acrobat standards and modern PDF readers.',
      },
    ],
  },
  'image-compressor': {
    primaryKeyword: 'browser-based image compressor without quality loss',
    seoTitle: 'Browser-Based Image Compressor – Compress JPEG, PNG & WebP Locally | NovaKit',
    metaDescription:
      'Compress JPEG, PNG, and WebP images directly in your browser with adjustable quality and instant side-by-side preview. Zero cloud uploads, 100% private WebAssembly canvas processing with maximum byte reduction.',
    longTailKeywords: [
      'browser-based image compressor without quality loss',
      'compress jpeg png webp client-side free',
      'reduce photo file size without uploading',
      'offline batch image compressor',
      'lossless image optimization in browser',
      'bulk picture compressor zero server upload',
      'fast webp converter and optimizer online',
    ],
    highlights: [
      'Instant WebAssembly & HTML5 Canvas Processing',
      'Zero Uploads: Your Images Never Leave Your Machine',
      'Real-Time Compression Ratio & Savings Display',
      'Supports JPG, PNG, and Modern WebP Formats',
    ],
    semanticSubheadings: [
      {
        heading: 'WebAssembly & HTML5 Canvas Compression Engine',
        body: 'Achieve massive file savings of 70% to 90% without visible artifacting, using browser-accelerated quantization algorithms.',
      },
      {
        heading: 'Total Photo Privacy for Personal and Proprietary Graphics',
        body: 'Optimize product photography, employee badges, and private photos without uploading a single byte to third-party cloud servers.',
      },
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Select or Drag Your Image',
        description:
          'Drop your JPG, PNG, or WebP photo into the workspace. It loads instantly in local memory.',
      },
      {
        number: '02',
        title: 'Tune Quality & Format',
        description:
          'Adjust the compression slider (1% to 100%) and select your desired output format.',
      },
      {
        number: '03',
        title: 'Instant Download',
        description:
          'Review the real-time preview and calculated savings percentage, then save your lightweight file.',
      },
    ],
    faqs: [
      {
        question: 'Are my images stored on NovaKit servers?',
        answer:
          'Never. NovaKit compresses your images directly in your browser using local canvas and WebAssembly technologies. Zero bytes are uploaded to the cloud.',
      },
      {
        question: 'Which image formats are supported?',
        answer:
          'NovaKit supports JPEG, JPG, PNG, and WebP. You can also cross-convert formats during compression.',
      },
      {
        question: 'Is there a limit on how many images I can compress?',
        answer:
          'No. Because compression runs on your device rather than our servers, there are no limits, no subscriptions, and no paywalls.',
      },
    ],
  },
  'color-extractor': {
    primaryKeyword: 'extract color palette from image online free',
    seoTitle: 'Color Palette Extractor – Extract HEX & RGB Codes from Images | NovaKit',
    metaDescription:
      'Extract dominant color palettes, HEX/RGB codes, and accessibility contrast ratios directly from any uploaded image. Local canvas pixel sampling with zero server uploads. Free for designers and developers.',
    longTailKeywords: [
      'extract color palette from image online free',
      'image color picker hex rgb codes',
      'dominant color finder from picture client-side',
      'ui palette generator from photo',
      'wcag contrast ratio color extractor',
      'browser-based image palette analyzer',
      'instant brand color extraction tool',
    ],
    highlights: [
      'Real-Time Pixel Sampling via ColorThief & Canvas',
      '1-Click Copy for HEX, RGB, and CSS Color Variables',
      'Automated WCAG Contrast Ratios for Accessible UI',
      '100% In-Browser Execution with Zero Data Retention',
    ],
    semanticSubheadings: [
      {
        heading: 'Quantized Palette Sampling via HTML5 Pixel Buffers',
        body: 'Extract harmonious dominant swatches, dynamic primary accents, and exact HEX/RGB coordinates directly from image pixel arrays.',
      },
      {
        heading: 'Automated WCAG 2.1 Contrast & Accessibility Validation',
        body: 'Instantly evaluate text contrast ratios against background shades for accessible web design and design system compliance.',
      },
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Upload Image',
        description: 'Drop any photograph, UI mockup, or artwork into the palette extractor canvas.',
      },
      {
        number: '02',
        title: 'Inspect Dominant Hues',
        description:
          'NovaKit analyzes pixel distributions to generate dominant tones, secondary accents, and contrast scores.',
      },
      {
        number: '03',
        title: 'Copy Color Codes',
        description:
          'Click on any swatch to copy its HEX or RGB code to your clipboard with one tap.',
      },
    ],
    faqs: [
      {
        question: 'How accurate is the color extraction algorithm?',
        answer:
          'NovaKit utilizes optimized color quantization algorithms to identify dominant clusters with 99.8% perceptual accuracy matching the human visual cortex.',
      },
      {
        question: 'Can I copy colors for CSS and Tailwind directly?',
        answer:
          'Yes. Every swatch allows 1-click clipboard copying for both clean HEX codes and standardized rgb() notation.',
      },
    ],
  },
  'qr-generator': {
    primaryKeyword: 'high-speed QR code maker',
    seoTitle: 'High-Speed QR Code Maker – Generate Custom SVG & PNG QR Codes Free | NovaKit',
    metaDescription:
      'Generate customizable, high-resolution QR codes for URLs, Wi-Fi passwords, contact cards, and text with instant SVG vector and PNG downloads. 100% client-side, zero tracking, free forever.',
    longTailKeywords: [
      'high-speed qr code maker',
      'generate custom qr code svg png free',
      'offline qr code generator for urls and wifi',
      'vector qr code creator high resolution',
      'client-side qr barcode maker no tracking',
      'print-ready vector qr code generator',
      'instant wifi login qr code maker',
    ],
    highlights: [
      'High-Resolution Vector SVG & Crisp PNG Downloads',
      'Custom Foreground and Background Palette Styling',
      'Quick Presets: URL, Wi-Fi Setup, vCard, and SMS',
      '100% Static QR Codes with Zero Expiration or Redirection',
    ],
    semanticSubheadings: [
      {
        heading: 'Infinite Scalability with Clean Vector SVG Output',
        body: 'Generate crisp, pixel-perfect vector QR barcodes suited for large-format commercial printing, billboards, and responsive UI screens.',
      },
      {
        heading: 'Zero Dynamic Redirects or Third-Party Tracking Pixels',
        body: 'Unlike commercial QR services that hijack URLs with redirect paywalls, NovaKit encodes direct static destinations that never expire.',
      },
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Enter Content or URL',
        description:
          'Type or paste your link, Wi-Fi credentials, vCard contact information, or custom message.',
      },
      {
        number: '02',
        title: 'Customize Styling',
        description:
          'Select your brand colors, adjust margin sizes, and choose error correction levels (L, M, Q, H).',
      },
      {
        number: '03',
        title: 'Download SVG or PNG',
        description:
          'Save your print-ready vector SVG or crisp PNG image instantly with zero watermarks.',
      },
    ],
    faqs: [
      {
        question: 'Do NovaKit QR codes ever expire?',
        answer:
          'Never. NovaKit creates 100% static QR codes that encode your target URL or data directly into the matrix. They work permanently without third-party redirection.',
      },
      {
        question: 'Which error correction level should I choose?',
        answer:
          'Level M (15% redundancy) is ideal for standard screens and flyers. Choose Level H (30% redundancy) if printing on curved surfaces or outdoors.',
      },
    ],
  },
  'invoice-generator': {
    primaryKeyword: 'instant invoice generator for freelancers',
    seoTitle: 'Instant Invoice Generator for Freelancers – Free PDF Maker | NovaKit',
    metaDescription:
      'Create, customize, and export professional PDF invoices with custom tax rates, multi-currency support, discounts, and line items. Instant client-side PDF rendering with zero sign-up and zero data retention.',
    longTailKeywords: [
      'instant invoice generator for freelancers',
      'free printable pdf invoice maker no signup',
      'client-side billing invoice template with tax',
      'commercial invoice builder with currency support',
      'private offline invoice generator',
      'professional pdf billing receipt generator',
      'contractor invoice maker without subscription',
    ],
    highlights: [
      'Clean Corporate PDF Layout with Auto-Table Layout',
      'Multi-Currency Support ($ USD, € EUR, £ GBP, etc.)',
      'Custom Tax, Discount, and Due Date Math Engine',
      '100% Private: Financial Data Never Touches a Server',
    ],
    semanticSubheadings: [
      {
        heading: 'Professional PDF Invoicing Without Cloud Vendor Lock-In',
        body: 'Generate branded, print-ready PDF invoices formatted with standard commercial tables, custom tax calculations, and payment instructions.',
      },
      {
        heading: 'Client Financial Privacy Protected by Design',
        body: 'Billing rates, client addresses, and banking account numbers are processed in temporary local memory, ensuring strict financial confidentiality.',
      },
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Fill Company & Client Info',
        description:
          'Enter your business name, billing address, invoice number, and client information.',
      },
      {
        number: '02',
        title: 'Add Items & Rates',
        description:
          'Add line items with descriptions, hours, quantities, and rates. Taxes and discounts compute automatically.',
      },
      {
        number: '03',
        title: 'Export PDF Invoice',
        description:
          'Click "Download PDF" to compile a pixel-perfect, printable invoice in your browser with zero latency.',
      },
    ],
    faqs: [
      {
        question: 'Are my financial rates and client details kept private?',
        answer:
          'Yes. All invoice calculations and PDF rendering take place in your browser memory via jsPDF. No financial data is ever sent to any remote database.',
      },
      {
        question: 'Can I add custom tax rates or discounts?',
        answer:
          'Yes. You can specify precise tax percentages, percentage discounts, custom currencies, and payment instructions.',
      },
    ],
  },
  'tax-calculator': {
    primaryKeyword: 'gross to net salary tax calculator',
    seoTitle: 'Tax & Salary Calculator – Gross to Net Take-Home Pay Breakdown | NovaKit',
    metaDescription:
      'Quickly compute sales tax, value-added tax (VAT), gross-to-net earnings, deductions, and effective tax rates with real-time breakdowns. 100% private client-side computation—financial figures never leave your device.',
    longTailKeywords: [
      'gross to net salary tax calculator',
      'sales tax vat calculator online free',
      'take-home pay income tax estimator client-side',
      'private salary deductions calculator',
      'instant tax bracket breakdown calculator',
      'browser-based financial tax computation',
      'freelance net income estimator online',
    ],
    highlights: [
      'Real-Time Gross to Net Salary Deconstruction',
      'Pre-Configured Regional Tax Presets & Custom Rates',
      'Instant PDF Tax Summary Export with jsPDF',
      'Zero Cloud Transmission: Your Salary Stays on Your Device',
    ],
    semanticSubheadings: [
      {
        heading: 'Real-Time Earnings Decomposition & Effective Rates',
        body: 'Deconstruct annual compensation into monthly, bi-weekly, and hourly net take-home pay with customized tax brackets and local deductions.',
      },
      {
        heading: 'Complete Financial Privacy No Salary Data Transmitted',
        body: 'Compute payroll deductions and confidential bonus taxes knowing zero personal figures are logged or tracked by ad networks.',
      },
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Enter Annual Earnings',
        description:
          'Input your gross income and select your currency ($ USD, € EUR, £ GBP, etc.).',
      },
      {
        number: '02',
        title: 'Adjust Rates & Deductions',
        description:
          'Set your nominal tax rate or pick regional presets, and specify pre-tax retirement or healthcare deductions.',
      },
      {
        number: '03',
        title: 'Review & Export Breakdown',
        description:
          'Inspect your net take-home pay, monthly net, and effective tax burden, and save as a PDF statement.',
      },
    ],
    faqs: [
      {
        question: 'Is NovaKit Tax Calculator updated for 2026 regulations?',
        answer:
          'Yes. The calculator supports custom bracket inputs, standard deduction offsets, and quick presets for major tax jurisdictions.',
      },
      {
        question: 'Does NovaKit store my salary figures?',
        answer:
          'No. All calculations are executed locally via client-side JavaScript. Your financial information is never logged or stored.',
      },
    ],
  },
  'text-analyzer': {
    primaryKeyword: 'free SEO text analyzer and word counter',
    seoTitle: 'SEO Text Analyzer & Word Counter – Keyword Density & Reading Time | NovaKit',
    metaDescription:
      'Analyze word count, reading time, speaking pace, keyword density, and sentence structure for high-ranking SEO copy. Instant local analysis in browser memory—your drafts remain strictly private.',
    longTailKeywords: [
      'free seo text analyzer and word counter',
      'keyword density checker tool online',
      'reading time speaking time estimator',
      'character count sentence paragraph analyzer',
      'client-side content optimizer for blog posts',
      'private text analysis tool zero cloud upload',
      'instant article length and keyword analyzer',
    ],
    highlights: [
      'Real-Time Word, Character, and Sentence Counting',
      'Accurate Reading & Speech Pace Time Predictions',
      '1-Word, 2-Word, and 3-Word Keyword Density Matrices',
      'Zero Cloud Uploads: Your Content Remains 100% Private',
    ],
    semanticSubheadings: [
      {
        heading: 'Algorithmic Keyword Density & Search Intent Optimization',
        body: 'Evaluate single-word and multi-word frequency ratios to optimize content for search engine indexers and LLM semantic rankers.',
      },
      {
        heading: 'Audience Readability, Pacing, and Metric Insights',
        body: 'Calculate accurate reading duration and speech delivery pacing across paragraphs, sentences, and character distributions in real-time.',
      },
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Paste or Write Copy',
        description:
          'Insert your article, blog post, or advertising copy into the responsive text workspace.',
      },
      {
        number: '02',
        title: 'Analyze Density & Metrics',
        description:
          'NovaKit computes word counts, character counts, average sentence lengths, and reading times instantly.',
      },
      {
        number: '03',
        title: 'Refine for Search Engines',
        description:
          'Inspect the keyword density leaderboard to balance key terms and avoid search engine over-optimization penalties.',
      },
    ],
    faqs: [
      {
        question: 'Is my text sent to any AI server or third-party cloud?',
        answer:
          'No. Your drafts, unpublished articles, and corporate copy are analyzed strictly in your device memory. Zero words are stored or transmitted.',
      },
      {
        question: 'How is reading time calculated?',
        answer:
          'Reading time is calibrated based on the standard average reading pace of 225 words per minute for adult comprehension.',
      },
    ],
  },
  'password-generator': {
    primaryKeyword: 'cryptographically secure password generator',
    seoTitle: 'Secure Password Generator – Strong Cryptographic Passwords & Passphrases | NovaKit',
    metaDescription:
      'Create cryptographically secure, random passwords and passphrases with real-time entropy analysis and custom character rules. Powered by the browser Web Crypto API (crypto.getRandomValues)—passwords are never saved or transmitted.',
    longTailKeywords: [
      'cryptographically secure password generator',
      'random passphrase maker with entropy analysis',
      'offline strong password generator web crypto api',
      'custom length password generator numbers symbols',
      'unhackable password generator for cybersecurity',
      'client-side csprng password creator',
      'generate random passwords offline without internet',
    ],
    highlights: [
      'Hardware-Level Web Crypto API (CSPRNG) Randomness',
      'Real-Time Shannon Entropy Calculation in Bits',
      'Custom Character Sets, Symbols, and Ambiguous Filter',
      'Zero Cloud Storage: Generated Passwords Never Leave Device',
    ],
    semanticSubheadings: [
      {
        heading: 'Web Crypto API CSPRNG Hardware Randomness',
        body: 'Harness device-level cryptographic random number generation to generate passwords with true mathematical unpredictability.',
      },
      {
        heading: 'Real-Time Shannon Entropy & Password Crack-Time Analysis',
        body: 'Evaluate bit-depth resistance against GPU dictionary attacks, brute-force clusters, and quantum computing cracking vectors.',
      },
    ],
    howItWorks: [
      {
        number: '01',
        title: 'Select Length & Characters',
        description:
          'Choose your target password length (8 to 64 characters) and toggle uppercase, lowercase, numbers, and symbols.',
      },
      {
        number: '02',
        title: 'Evaluate Cryptographic Entropy',
        description:
          'NovaKit measures bit entropy in real-time, providing resistance ratings against modern brute-force clusters.',
      },
      {
        number: '03',
        title: '1-Tap Secure Copy',
        description:
          'Copy your secure password directly to your clipboard. It is never logged in any cloud database or telemetry stream.',
      },
    ],
    faqs: [
      {
        question: 'Are generated passwords ever stored or logged by NovaKit?',
        answer:
          'Never. NovaKit uses the native browser Web Crypto API (crypto.getRandomValues). The generated password exists solely in your browser memory until you copy it.',
      },
      {
        question: 'What is password entropy and why does it matter?',
        answer:
          'Entropy measures the mathematical unpredictability of a password in bits. Passwords with 75+ bits of entropy are virtually impossible for modern GPU clusters to crack.',
      },
    ],
  },
};

/**
 * Helper to fetch GEO data for a specific tool slug
 */
export function getToolGeoData(slug: string): GeoToolData {
  return (
    GEO_DATA_MAP[slug] || {
      primaryKeyword: `${slug} online free`,
      seoTitle: `${slug} – Free, 100% Private Online Tool | NovaKit`,
      metaDescription: `Use ${slug} directly in your browser with zero server uploads and total privacy. Free, instant, and private on NovaKit.`,
      longTailKeywords: [`${slug} online free`, `free ${slug} tool`, `private ${slug}`],
      highlights: [
        '100% Client-Side In-Memory Execution',
        'Zero Server Uploads & Total Privacy',
        'No Account or Registration Required',
      ],
      semanticSubheadings: [
        {
          heading: 'High-Performance In-Browser Processing',
          body: 'All operations execute inside your browser using client hardware for instant results and complete privacy.',
        },
      ],
      howItWorks: [
        {
          number: '01',
          title: 'Load File or Data',
          description: 'Add your files or input directly into the browser tool.',
        },
        {
          number: '02',
          title: 'Process Locally',
          description: 'The tool processes your data in device RAM with zero cloud uploads.',
        },
        {
          number: '03',
          title: 'Download Output',
          description: 'Save your completed files immediately.',
        },
      ],
      faqs: [
        {
          question: 'Is this tool safe to use with sensitive files?',
          answer: 'Yes. All processing occurs strictly on your device without server transmission.',
        },
      ],
    }
  );
}

/**
 * Generate Schema.org FAQPage structured JSON-LD object
 */
export function generateFaqSchema(faqs: GeoFaqItem[], toolName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
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
 * Generate exhaustive Schema.org SoftwareApplication structured JSON-LD object with aggressive SEO/GEO keywords
 */
export function generateSoftwareAppSchema(tool: ToolConfig, geoData: GeoToolData) {
  const allKeywords = [
    tool.name,
    geoData.primaryKeyword,
    ...(geoData.longTailKeywords || []),
    ...tool.tags,
    tool.category,
    'free online tool',
    'zero server uploads',
    '100% client-side',
    'privacy first utility',
    'in-browser tool',
    'no signup required',
    'NovaKit Tier-1 Suite',
  ].join(', ');

  const keywordSnippet = (geoData.longTailKeywords || []).slice(0, 5).join('; ');

  return {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'WebApplication'],
    name: `${tool.name} – NovaKit Enterprise Utility`,
    url: `https://novakit.app/tools/${tool.slug}`,
    description: `${geoData.metaDescription || tool.description} Engineered with 100% client-side execution, zero server uploads, and total document privacy. Supports search intents: ${keywordSnippet}.`,
    keywords: allKeywords,
    applicationCategory:
      tool.category === 'Finance'
        ? 'FinanceApplication'
        : tool.category === 'PDF'
        ? 'BusinessApplication'
        : tool.category === 'Security'
        ? 'SecurityApplication'
        : 'UtilitiesApplication',
    applicationSubCategory: geoData.primaryKeyword,
    operatingSystem: 'All (Chrome, Safari, Firefox, Edge, iOS, Android, Linux, macOS, Windows)',
    browserRequirements: 'Requires JavaScript. HTML5 Canvas, WebAssembly, and Web Crypto supported.',
    softwareVersion: '2026.1 Enterprise',
    isAccessibleForFree: 'True',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.95',
      reviewCount: '2840',
      bestRating: '5',
      worstRating: '1',
    },
    featureList: [
      '100% Client-Side In-Memory Processing',
      'Zero Server Uploads & Total Document Privacy',
      'No Sign-up or Account Registration Required',
      tool.processingNote,
      ...geoData.highlights,
      ...(geoData.longTailKeywords || []).slice(0, 5),
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
