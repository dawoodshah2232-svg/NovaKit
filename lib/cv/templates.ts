/**
 * PDFEdit CV Builder — original template library.
 *
 * All templates are original designs created for PDFEdit (no copied layouts).
 * A template is a pure style config: fonts map to pdf-lib StandardFonts so the
 * exported PDF always embeds correctly, and the on-screen preview mirrors the
 * same metrics. Categories cover corporate, minimal, creative, executive,
 * student, technical, marketing, and ATS-friendly use cases.
 */

export type CvTemplateCategory =
  | 'corporate'
  | 'minimal'
  | 'creative'
  | 'executive'
  | 'student'
  | 'technical'
  | 'marketing'
  | 'ats';

export type CvLayout = 'single' | 'sidebar';

export type CvHeaderStyle = 'centered' | 'left' | 'band' | 'sidebar-top';

export type CvSectionTitleStyle = 'rule' | 'accent-bar' | 'uppercase' | 'boxed';

export type CvFontId = 'helvetica' | 'times' | 'courier';

export interface CvTemplate {
  id: string;
  name: string;
  category: CvTemplateCategory;
  description: string;
  layout: CvLayout;
  header: CvHeaderStyle;
  sectionTitle: CvSectionTitleStyle;
  fontHeading: CvFontId;
  fontBody: CvFontId;
  /** default accent; user can override per-document */
  accent: string;
  headingColor: string;
  bodyColor: string;
  mutedColor: string;
  sidebarBg: string;
  sidebarText: string;
  headerBg: string;
  nameSize: number; // pt
  titleSize: number; // pt
  sectionTitleSize: number; // pt
  bodySize: number; // pt
  smallSize: number; // pt
  sidebarWidth: number; // fraction of content width, sidebar layout only
  showPhotoDefault: boolean;
  /** sidebar templates place these section types in the sidebar */
  sidebarSections: string[];
  /** ATS template: no graphics, no photo, single column, standard fonts */
  atsSafe: boolean;
}

export const CV_TEMPLATES: CvTemplate[] = [
  {
    id: 'professional-corporate',
    name: 'Corporate Classic',
    category: 'corporate',
    description: 'Timeless single-column layout with a centered header and hairline rules. Safe for banks, consulting, and enterprise roles.',
    layout: 'single',
    header: 'centered',
    sectionTitle: 'rule',
    fontHeading: 'helvetica',
    fontBody: 'helvetica',
    accent: '#B91C1C',
    headingColor: '#111827',
    bodyColor: '#1F2937',
    mutedColor: '#6B7280',
    sidebarBg: '#F9FAFB',
    sidebarText: '#1F2937',
    headerBg: '#FFFFFF',
    nameSize: 26,
    titleSize: 12,
    sectionTitleSize: 11,
    bodySize: 10,
    smallSize: 9,
    sidebarWidth: 0.32,
    showPhotoDefault: false,
    sidebarSections: [],
    atsSafe: true,
  },
  {
    id: 'modern-minimal',
    name: 'Minimal Light',
    category: 'minimal',
    description: 'Generous whitespace, quiet gray accents, and left-aligned type. Lets achievements breathe.',
    layout: 'single',
    header: 'left',
    sectionTitle: 'uppercase',
    fontHeading: 'helvetica',
    fontBody: 'helvetica',
    accent: '#4B5563',
    headingColor: '#111827',
    bodyColor: '#374151',
    mutedColor: '#9CA3AF',
    sidebarBg: '#F9FAFB',
    sidebarText: '#1F2937',
    headerBg: '#FFFFFF',
    nameSize: 28,
    titleSize: 12,
    sectionTitleSize: 10,
    bodySize: 10,
    smallSize: 9,
    sidebarWidth: 0.32,
    showPhotoDefault: false,
    sidebarSections: [],
    atsSafe: true,
  },
  {
    id: 'creative-sidebar',
    name: 'Creative Sidebar',
    category: 'creative',
    description: 'Bold crimson sidebar with contact, skills, and languages — main column stays clean for experience.',
    layout: 'sidebar',
    header: 'sidebar-top',
    sectionTitle: 'accent-bar',
    fontHeading: 'helvetica',
    fontBody: 'helvetica',
    accent: '#B91C1C',
    headingColor: '#111827',
    bodyColor: '#1F2937',
    mutedColor: '#6B7280',
    sidebarBg: '#7F1D1D',
    sidebarText: '#FFFFFF',
    headerBg: '#FFFFFF',
    nameSize: 24,
    titleSize: 11,
    sectionTitleSize: 11,
    bodySize: 10,
    smallSize: 9,
    sidebarWidth: 0.34,
    showPhotoDefault: true,
    sidebarSections: ['skills', 'languages', 'certifications', 'interests'],
    atsSafe: false,
  },
  {
    id: 'executive-boardroom',
    name: 'Executive Boardroom',
    category: 'executive',
    description: 'Serif headings, deep navy band header, and restrained rules. Built for directors and C-level candidates.',
    layout: 'single',
    header: 'band',
    sectionTitle: 'rule',
    fontHeading: 'times',
    fontBody: 'helvetica',
    accent: '#1E3A5F',
    headingColor: '#0F172A',
    bodyColor: '#1F2937',
    mutedColor: '#64748B',
    sidebarBg: '#F1F5F9',
    sidebarText: '#0F172A',
    headerBg: '#1E3A5F',
    nameSize: 26,
    titleSize: 12,
    sectionTitleSize: 11,
    bodySize: 10,
    smallSize: 9,
    sidebarWidth: 0.32,
    showPhotoDefault: false,
    sidebarSections: [],
    atsSafe: false,
  },
  {
    id: 'graduate-launch',
    name: 'Graduate Launch',
    category: 'student',
    description: 'Fresh layout that leads with education and projects — ideal for students and recent graduates.',
    layout: 'single',
    header: 'left',
    sectionTitle: 'accent-bar',
    fontHeading: 'helvetica',
    fontBody: 'helvetica',
    accent: '#0E7490',
    headingColor: '#111827',
    bodyColor: '#1F2937',
    mutedColor: '#6B7280',
    sidebarBg: '#ECFEFF',
    sidebarText: '#0E7490',
    headerBg: '#FFFFFF',
    nameSize: 26,
    titleSize: 12,
    sectionTitleSize: 11,
    bodySize: 10,
    smallSize: 9,
    sidebarWidth: 0.32,
    showPhotoDefault: true,
    sidebarSections: [],
    atsSafe: true,
  },
  {
    id: 'developer-terminal',
    name: 'Developer Mono',
    category: 'technical',
    description: 'Monospace accents and a structured project-first layout for engineers and technical roles.',
    layout: 'single',
    header: 'left',
    sectionTitle: 'boxed',
    fontHeading: 'courier',
    fontBody: 'helvetica',
    accent: '#166534',
    headingColor: '#111827',
    bodyColor: '#1F2937',
    mutedColor: '#6B7280',
    sidebarBg: '#F0FDF4',
    sidebarText: '#14532D',
    headerBg: '#FFFFFF',
    nameSize: 24,
    titleSize: 11,
    sectionTitleSize: 10,
    bodySize: 10,
    smallSize: 9,
    sidebarWidth: 0.32,
    showPhotoDefault: false,
    sidebarSections: [],
    atsSafe: true,
  },
  {
    id: 'marketing-bold',
    name: 'Marketing Bold',
    category: 'marketing',
    description: 'Confident crimson header band with a strong personal brand statement for marketers and designers.',
    layout: 'single',
    header: 'band',
    sectionTitle: 'accent-bar',
    fontHeading: 'helvetica',
    fontBody: 'helvetica',
    accent: '#B91C1C',
    headingColor: '#111827',
    bodyColor: '#1F2937',
    mutedColor: '#6B7280',
    sidebarBg: '#FEF2F2',
    sidebarText: '#7F1D1D',
    headerBg: '#B91C1C',
    nameSize: 28,
    titleSize: 12,
    sectionTitleSize: 11,
    bodySize: 10,
    smallSize: 9,
    sidebarWidth: 0.32,
    showPhotoDefault: true,
    sidebarSections: [],
    atsSafe: false,
  },
  {
    id: 'ats-plain',
    name: 'ATS Plain',
    category: 'ats',
    description: 'Maximum parseability: standard fonts, no graphics, no columns, no photo. Built to survive applicant tracking systems.',
    layout: 'single',
    header: 'left',
    sectionTitle: 'uppercase',
    fontHeading: 'helvetica',
    fontBody: 'helvetica',
    accent: '#111827',
    headingColor: '#000000',
    bodyColor: '#000000',
    mutedColor: '#333333',
    sidebarBg: '#FFFFFF',
    sidebarText: '#000000',
    headerBg: '#FFFFFF',
    nameSize: 22,
    titleSize: 11,
    sectionTitleSize: 11,
    bodySize: 10.5,
    smallSize: 9.5,
    sidebarWidth: 0.32,
    showPhotoDefault: false,
    sidebarSections: [],
    atsSafe: true,
  },
];

export const CV_TEMPLATE_CATEGORIES: Array<{ id: CvTemplateCategory; label: string }> = [
  { id: 'corporate', label: 'Professional Corporate' },
  { id: 'minimal', label: 'Modern Minimal' },
  { id: 'creative', label: 'Creative' },
  { id: 'executive', label: 'Executive' },
  { id: 'student', label: 'Student / Graduate' },
  { id: 'technical', label: 'Technical / Developer' },
  { id: 'marketing', label: 'Marketing / Designer' },
  { id: 'ats', label: 'ATS-Friendly' },
];

export function getTemplate(id: string): CvTemplate {
  return CV_TEMPLATES.find((t) => t.id === id) ?? CV_TEMPLATES[0];
}

/** CSS font stack approximating the PDF font for the on-screen preview. */
export function cvCssFont(fontId: CvFontId): string {
  if (fontId === 'times') return '"Times New Roman", Times, Georgia, serif';
  if (fontId === 'courier') return '"Courier New", Courier, monospace';
  return 'Arial, Helvetica, sans-serif';
}
