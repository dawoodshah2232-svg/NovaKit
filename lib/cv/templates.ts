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

export type CvHeaderStyle = 'centered' | 'left' | 'band' | 'sidebar-top' | 'monogram';

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
    description: 'Timeless single-column layout with centered header and hairline rules. The safest choice for banking, law, consulting, and enterprise roles.',
    layout: 'single',
    header: 'centered',
    sectionTitle: 'rule',
    fontHeading: 'helvetica',
    fontBody: 'helvetica',
    accent: '#1F3A5F',
    headingColor: '#0F172A',
    bodyColor: '#1F2937',
    mutedColor: '#64748B',
    sidebarBg: '#F8FAFC',
    sidebarText: '#0F172A',
    headerBg: '#FFFFFF',
    nameSize: 24,
    titleSize: 11,
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
    name: 'Swiss Minimal',
    category: 'minimal',
    description: 'Scandinavian whitespace with a terracotta accent bar. Quiet confidence for designers, product people, and startups.',
    layout: 'single',
    header: 'left',
    sectionTitle: 'accent-bar',
    fontHeading: 'helvetica',
    fontBody: 'helvetica',
    accent: '#C4705A',
    headingColor: '#111111',
    bodyColor: '#1F2937',
    mutedColor: '#9CA3AF',
    sidebarBg: '#FFFFFF',
    sidebarText: '#111111',
    headerBg: '#FFFFFF',
    nameSize: 26,
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
    id: 'creative-sidebar',
    name: 'Sidebar Professional',
    category: 'creative',
    description: 'Deep navy sidebar with contact, skills, and languages — main column stays clean for experience. Distinctive but readable.',
    layout: 'sidebar',
    header: 'sidebar-top',
    sectionTitle: 'uppercase',
    fontHeading: 'helvetica',
    fontBody: 'helvetica',
    accent: '#0D9488',
    headingColor: '#0F172A',
    bodyColor: '#1F2937',
    mutedColor: '#64748B',
    sidebarBg: '#1E3A5F',
    sidebarText: '#FFFFFF',
    headerBg: '#FFFFFF',
    nameSize: 22,
    titleSize: 11,
    sectionTitleSize: 10,
    bodySize: 10,
    smallSize: 9,
    sidebarWidth: 0.33,
    showPhotoDefault: true,
    sidebarSections: ['skills', 'languages', 'certifications', 'interests'],
    atsSafe: false,
  },
  {
    id: 'executive-boardroom',
    name: 'Executive Editorial',
    category: 'executive',
    description: 'Serif headlines, oxford navy, and muted gold rules. Quiet luxury for directors, C-level candidates, and partners.',
    layout: 'single',
    header: 'centered',
    sectionTitle: 'rule',
    fontHeading: 'times',
    fontBody: 'helvetica',
    accent: '#B08D4C',
    headingColor: '#1B2A4A',
    bodyColor: '#2C2C2C',
    mutedColor: '#6B7280',
    sidebarBg: '#FAF8F4',
    sidebarText: '#1B2A4A',
    headerBg: '#FFFFFF',
    nameSize: 28,
    titleSize: 11,
    sectionTitleSize: 11,
    bodySize: 10.5,
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
    description: 'Fresh teal accents that lead with education and projects. Modern energy for students and recent graduates.',
    layout: 'single',
    header: 'left',
    sectionTitle: 'accent-bar',
    fontHeading: 'helvetica',
    fontBody: 'helvetica',
    accent: '#0E7490',
    headingColor: '#0F172A',
    bodyColor: '#1F2937',
    mutedColor: '#64748B',
    sidebarBg: '#ECFEFF',
    sidebarText: '#0E7490',
    headerBg: '#FFFFFF',
    nameSize: 24,
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
    id: 'developer-terminal',
    name: 'Tech Developer',
    category: 'technical',
    description: 'Dark header strip with monospace accents. Skills-first layout for engineers, DevOps, and data roles.',
    layout: 'single',
    header: 'band',
    sectionTitle: 'uppercase',
    fontHeading: 'courier',
    fontBody: 'helvetica',
    accent: '#2563EB',
    headingColor: '#0F172A',
    bodyColor: '#1F2937',
    mutedColor: '#64748B',
    sidebarBg: '#F1F5F9',
    sidebarText: '#0F172A',
    headerBg: '#0F172A',
    nameSize: 22,
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
    name: 'Creative Bold',
    category: 'marketing',
    description: 'Full-bleed crimson header band with white type. Confident personal brand for marketers, designers, and media.',
    layout: 'single',
    header: 'band',
    sectionTitle: 'accent-bar',
    fontHeading: 'helvetica',
    fontBody: 'helvetica',
    accent: '#DC2626',
    headingColor: '#111827',
    bodyColor: '#1F2937',
    mutedColor: '#6B7280',
    sidebarBg: '#FEF2F2',
    sidebarText: '#7F1D1D',
    headerBg: '#DC2626',
    nameSize: 26,
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
    name: 'Monogram ATS',
    category: 'ats',
    description: 'Oversized initials as a personal brand mark, pure black on white. Maximum ATS parseability with a designer touch.',
    layout: 'single',
    header: 'monogram',
    sectionTitle: 'uppercase',
    fontHeading: 'helvetica',
    fontBody: 'helvetica',
    accent: '#1E3A5F',
    headingColor: '#000000',
    bodyColor: '#000000',
    mutedColor: '#4B5563',
    sidebarBg: '#FFFFFF',
    sidebarText: '#000000',
    headerBg: '#FFFFFF',
    nameSize: 20,
    titleSize: 11,
    sectionTitleSize: 10,
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
