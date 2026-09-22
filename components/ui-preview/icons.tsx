import type { ReactElement, SVGProps } from 'react';

// ─────────────────────────────────────────────────────────────
// PDFEdit preview icon family — "Paper & Gesture"
// One coherent product-grade system:
// · 24 × 24 grid, optical padding ~2.5px (content lives in 3…21)
// · strokeWidth 1.5, round caps, round joins — no exceptions
// · documents share one fold-corner language
// · accent metaphors (arrows, locks, sparkles) are geometric, not cute
// ─────────────────────────────────────────────────────────────
function Svg({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Standard document shell shared across the family. */
const DOC = 'M7 3h7l4 4v14H7z';
const DOC_FOLD = 'M14 3v4h4';

// ─── Merge: two source documents flowing right into one — flagship mark ───
export function MergeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M2.5 4h4.5L9.5 6.5v5h-7z" />
      <path d="M7 4v2.5h2.5" />
      <path d="M2.5 14.5h4.5L9.5 17v3.5h-7z" />
      <path d="M7 14.5V17h2.5" />
      <path d="M11.5 9.5h2.6" />
      <path d="M12.6 7.8l1.5 1.7-1.5 1.7" />
      <path d="M11.5 15h2.6" />
      <path d="M12.6 13.3l1.5 1.7-1.5 1.7" />
      <path d="M15 6.5h4.5L21 8v10h-6z" />
      <path d="M19.5 6.5V8H21" />
      <path d="M17 11.5h2" />
      <path d="M17 14h2" />
    </Svg>
  );
}

// ─── Split: one document, dashed parting line, twin outward chevrons ───
export function SplitIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d={DOC} />
      <path d={DOC_FOLD} />
      <path d="M12 10v7" strokeDasharray="2.2 1.8" />
      <path d="M9.3 5.8 7 8.1l2.3 2.3" />
      <path d="M14.7 5.8 17 8.1l-2.3 2.3" />
    </Svg>
  );
}

// ─── Compress: document held between twin inward chevrons ───
export function CompressIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M9.5 4h5L17 6.5V20H9.5z" />
      <path d="M14.5 4v2.5H17" />
      <path d="M2.8 9.5l2.6 2.5-2.6 2.5" />
      <path d="M6 9.5l2.6 2.5L6 14.5" />
      <path d="M21.2 9.5l-2.6 2.5 2.6 2.5" />
      <path d="M18 9.5l-2.6 2.5 2.6 2.5" />
    </Svg>
  );
}

// ─── PDF → Word: source page, arrow, target page ───
export function PdfToWordIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M2.5 5h5.5L11 8v11h-8.5z" />
      <path d="M8 5v3h3" />
      <path d="M5 12h4" />
      <path d="M5 14.5h4" />
      <path d="M12.5 12.5h3" />
      <path d="M14 10.8l1.7 1.7-1.7 1.7" />
      <path d="M17 8.5h2.5L21 10v6.5h-4z" />
      <path d="M19.5 8.5V10H21" />
    </Svg>
  );
}

// ─── Word → PDF: mirror of PDF → Word ───
export function WordToPdfIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M3 8.5h2.5L7 10v6.5H3z" />
      <path d="M5.5 8.5V10H7" />
      <path d="M8.5 12.5h3" />
      <path d="M10 10.8l1.7 1.7-1.7 1.7" />
      <path d="M13 5h5.5L21.5 8v11H13z" />
      <path d="M18.5 5v3h3" />
      <path d="M15.5 12h4" />
      <path d="M15.5 14.5h4" />
    </Svg>
  );
}

// ─── PDF → JPG: source page, arrow, image frame ───
export function PdfToJpgIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M2.5 5h5.5L11 8v11h-8.5z" />
      <path d="M8 5v3h3" />
      <path d="M5 12h4" />
      <path d="M5 14.5h4" />
      <path d="M12.5 12.5h2.5" />
      <path d="M13.5 10.8l1.7 1.7-1.7 1.7" />
      <path d="M16.5 8.5h5v8h-5z" />
      <path d="M16.5 14.5l1.4-1.8 1 1.2 1.2-1.4 1.4 1.6" />
      <circle cx="19.6" cy="10.8" r="0.9" />
    </Svg>
  );
}

// ─── JPG → PDF: image frame, arrow, target page ───
export function JpgToPdfIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M2.5 8.5h5v8h-5z" />
      <path d="M2.5 14.5l1.4-1.8 1 1.2 1.2-1.4 1.4 1.6" />
      <circle cx="5.4" cy="10.8" r="0.9" />
      <path d="M9 12.5h2.5" />
      <path d="M10 10.8l1.7 1.7-1.7 1.7" />
      <path d="M13 5h5.5L21.5 8v11H13z" />
      <path d="M18.5 5v3h3" />
      <path d="M15.5 12h4" />
      <path d="M15.5 14.5h4" />
    </Svg>
  );
}

// ─── OCR: document under a scan frame, scan line mid-pass ───
export function OcrIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d={DOC} />
      <path d={DOC_FOLD} />
      <path d="M8.5 8.5h7v5h-7z" />
      <path d="M8.5 11h7" />
      <path d="M9.5 6h5" />
      <path d="M8.5 16.5h7" />
      <path d="M8.5 18.5h4.5" />
    </Svg>
  );
}

// ─── Sign: pen nib above a single confident signature gesture ───
export function SignIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M14.5 3.5l6 6-8.3 8.3-5.7 1.7 1.7-5.7z" />
      <path d="M12.5 11.5l3-3" />
      <circle cx="13.6" cy="10.4" r="0.8" />
      <path d="M2.5 20.5c1.8-2.4 3.4-2.4 4.8-.9s1.8-2.7 3.6-2.2 1.9 2 3.7 1.4 2-1.9 3.9-1.3" />
    </Svg>
  );
}

// ─── Redact: document with two solid redaction bars ───
export function RedactIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d={DOC} />
      <path d={DOC_FOLD} />
      <path d="M9 9.5h6" />
      <rect x="8.8" y="12" width="6.4" height="2.2" rx="0.6" fill="currentColor" stroke="none" />
      <rect x="8.8" y="15.4" width="4.4" height="2.2" rx="0.6" fill="currentColor" stroke="none" />
    </Svg>
  );
}

// ─── Rotate: document inside a clean circular arrow ───
export function RotateIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M20 12a8 8 0 1 0-2.4 5.7" />
      <path d="M17.9 15.2l-.3 2.8 2.8-.3" />
      <path d="M9.5 8h4.5l2.5 2.5V16h-7z" />
      <path d="M14 8v2.5h2.5" />
    </Svg>
  );
}

// ─── Organize: two offset documents, front one lined ───
export function OrganizeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M9 2.5h7L20 6.5v10H9z" />
      <path d="M16 2.5V6.5H20" />
      <path d="M4 7.5h7l4 4v9H4z" />
      <path d="M11 7.5v4h4" />
      <path d="M7 14.5h5" />
      <path d="M7 17h3.5" />
    </Svg>
  );
}

// ─── Delete Pages: document with a minimal trash bin ───
export function DeletePagesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M4.5 4h7l3.5 3.5V20h-10.5z" />
      <path d="M11.5 4v3.5H15" />
      <path d="M10 12.5h8V19h-8z" />
      <path d="M9 12.5h10" />
      <path d="M12.3 12.5v-1.6h3.4v1.6" />
      <path d="M12.5 14.8v2.4" />
      <path d="M15.5 14.8v2.4" />
    </Svg>
  );
}

// ─── Extract Pages: document releasing a page downward ───
export function ExtractPagesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M5 3.5h8L16.5 7v6.5H5z" />
      <path d="M13 3.5V7h3.5" />
      <path d="M8 8h5" />
      <path d="M10.75 15.5V20" />
      <path d="M8.75 18l2 2 2-2" />
    </Svg>
  );
}

// ─── Page Numbers: document with text lines and a hash mark ───
export function PageNumbersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d={DOC} />
      <path d={DOC_FOLD} />
      <path d="M9 9.5h6" />
      <path d="M9 12h6" />
      <path d="M10.5 14.5v5" />
      <path d="M13.5 14.5v5" />
      <path d="M8.8 16.2h6.4" />
      <path d="M8.8 17.8h6.4" />
    </Svg>
  );
}

// ─── Crop: document inside four corner brackets ───
export function CropIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M7.5 6h6.5l3.5 3.5V18h-10z" />
      <path d="M14 6v3.5h3.5" />
      <path d="M3 8V3h5" />
      <path d="M16 3h5v5" />
      <path d="M3 16v5h5" />
      <path d="M16 21h5v-5" />
    </Svg>
  );
}

// ─── PDF → Text: source page, arrow, text lines ───
export function PdfToTextIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M2.5 5h5.5L11 8v11h-8.5z" />
      <path d="M8 5v3h3" />
      <path d="M5 12h4" />
      <path d="M5 14.5h2.5" />
      <path d="M12.5 12.5h3" />
      <path d="M14 10.8l1.7 1.7-1.7 1.7" />
      <path d="M17.5 9.5h4" />
      <path d="M17.5 12h4" />
      <path d="M17.5 14.5h4" />
      <path d="M17.5 17h2.5" />
    </Svg>
  );
}

// ─── Flatten: layers collapsing downward into one sheet ───
export function FlattenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M7 4.5h10" />
      <path d="M8.5 8h7" />
      <path d="M12 10v3.5" />
      <path d="M10.3 11.8l1.7 1.7 1.7-1.7" />
      <path d="M8.5 16h7l2.5 2.5V21h-12z" />
    </Svg>
  );
}

// ─── Protect: document with a closed padlock ───
export function ProtectIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d={DOC} />
      <path d={DOC_FOLD} />
      <path d="M10.3 12.5v-1.7a1.7 1.7 0 0 1 3.4 0v1.7" />
      <path d="M9 13.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z" />
      <circle cx="12" cy="14.2" r="0.7" />
      <path d="M12 14.9v1" />
    </Svg>
  );
}

// ─── Unlock: document with an open padlock ───
export function UnlockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d={DOC} />
      <path d={DOC_FOLD} />
      <path d="M10.3 12.5v-1.7a1.7 1.7 0 0 1 3.3-.7" />
      <path d="M9 13.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z" />
      <circle cx="12" cy="14.2" r="0.7" />
      <path d="M12 14.9v1" />
    </Svg>
  );
}

// ─── Watermark: document under a translucent diagonal band ───
export function WatermarkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d={DOC} />
      <path d={DOC_FOLD} />
      <path d="M9.5 8h5" />
      <g opacity={0.45}>
        <path d="M6.5 17 17 6.5" />
        <path d="M6.5 20 20 6.5" />
      </g>
    </Svg>
  );
}

// ─── Studio: flagship — document with sparkles, the creative mark ───
export function StudioIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M4.5 5h6.5L14.5 8.5V18h-10z" />
      <path d="M11 5v3.5h3.5" />
      <path d="M18 3l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z" />
      <path d="M20.5 12.5l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5z" />
      <path d="M7.5 11h4" />
      <path d="M7.5 13.5h6" />
    </Svg>
  );
}

export type PreviewIconName =
  | 'merge'
  | 'split'
  | 'compress'
  | 'pdf-to-word'
  | 'word-to-pdf'
  | 'pdf-to-jpg'
  | 'jpg-to-pdf'
  | 'ocr'
  | 'sign'
  | 'redact'
  | 'rotate'
  | 'organize'
  | 'delete-pages'
  | 'extract-pages'
  | 'page-numbers'
  | 'crop'
  | 'pdf-to-text'
  | 'flatten'
  | 'protect'
  | 'unlock'
  | 'watermark'
  | 'studio';

export const PreviewIcons: Record<PreviewIconName, (props: SVGProps<SVGSVGElement>) => ReactElement> = {
  merge: MergeIcon,
  split: SplitIcon,
  compress: CompressIcon,
  'pdf-to-word': PdfToWordIcon,
  'word-to-pdf': WordToPdfIcon,
  'pdf-to-jpg': PdfToJpgIcon,
  'jpg-to-pdf': JpgToPdfIcon,
  ocr: OcrIcon,
  sign: SignIcon,
  redact: RedactIcon,
  rotate: RotateIcon,
  organize: OrganizeIcon,
  'delete-pages': DeletePagesIcon,
  'extract-pages': ExtractPagesIcon,
  'page-numbers': PageNumbersIcon,
  crop: CropIcon,
  'pdf-to-text': PdfToTextIcon,
  flatten: FlattenIcon,
  protect: ProtectIcon,
  unlock: UnlockIcon,
  watermark: WatermarkIcon,
  studio: StudioIcon,
};
