/**
 * i18n pilot dictionaries (Spanish + Arabic).
 *
 * Scope: homepage + 5 top tool pages (merge-pdf, compress-pdf, pdf-to-word,
 * word-to-pdf, sign-pdf). Quality over quantity — every string below is
 * hand-written, not machine-translated.
 *
 * The interactive tool engines themselves (components/tools/*) remain in
 * English for this pilot; only the SEO/editorial layer is translated.
 */

export type PilotLocale = 'es' | 'ar';

export type PilotToolKey =
  | 'merge-pdf'
  | 'compress-pdf'
  | 'pdf-to-word'
  | 'word-to-pdf'
  | 'sign-pdf';

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface HowStep {
  title: string;
  description: string;
}

export interface ToolCopy {
  /** URL slug segment, e.g. "merge-pdf" */
  key: PilotToolKey;
  /** Engine slug used by ToolEngine, e.g. "pdf-merger" */
  engineSlug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  /** Answer-first quotable lead sentence */
  answerLead: string;
  answerHeading: string;
  answerBody: string;
  processingNote: string;
  stepsHeading: string;
  steps: HowStep[];
  privacyHeading: string;
  privacyBullets: string[];
  faqHeading: string;
  faqs: FaqEntry[];
  relatedToolsHeading: string;
  relatedGuidesHeading: string;
  relatedGuidesNote: string;
  backLabel: string;
  homeLabel: string;
  zeroUploadsLabel: string;
}

export interface HomeCopy {
  metaTitle: string;
  metaDescription: string;
  /** Answer-first H1-adjacent lead */
  heroKicker: string;
  heroTitle: string;
  heroLead: string;
  toolsHeading: string;
  toolsSub: string;
  viewAllTools: string;
  whyHeading: string;
  whyLead: string;
  whyPoints: { title: string; body: string }[];
  trustHeading: string;
  trustBullets: string[];
  faqHeading: string;
  faqs: FaqEntry[];
  ctaHeading: string;
  ctaBody: string;
  ctaButton: string;
}

export interface ChromeCopy {
  backToTools: string;
  home: string;
  popularBadge: string;
  useTool: string;
}

export interface LocaleDictionary {
  locale: PilotLocale;
  htmlLang: string;
  dir: 'ltr' | 'rtl';
  chrome: ChromeCopy;
  home: HomeCopy;
  tools: Record<PilotToolKey, ToolCopy>;
}

export const PILOT_TOOL_KEYS: PilotToolKey[] = [
  'merge-pdf',
  'compress-pdf',
  'pdf-to-word',
  'word-to-pdf',
  'sign-pdf',
];

export const BASE_URL = 'https://www.pdfedit.website';

export function localizedPath(locale: PilotLocale, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${clean === '/' ? '' : clean}`;
}

/** English canonical path for a pilot tool key. */
export function englishPathForTool(key: PilotToolKey): string {
  return `/${key}`;
}

export function hreflangAlternates(
  locale: PilotLocale,
  path: string,
): Record<string, string> {
  const clean = path.startsWith('/') ? path : `/${path}`;
  const en = `${BASE_URL}${clean}`;
  return {
    'x-default': en,
    en,
    es: `${BASE_URL}/es${clean === '/' ? '' : clean}`,
    ar: `${BASE_URL}/ar${clean === '/' ? '' : clean}`,
    // Self-reference for the current locale (overrides the generic entry above
    // when locale is es/ar; harmless duplicate when locale handling differs).
    [locale]: `${BASE_URL}/${locale}${clean === '/' ? '' : clean}`,
  };
}
