/**
 * PDFEdit CV Builder — data model.
 *
 * A CV is template-agnostic data. Templates (templates.ts) are pure style
 * configs applied to this model, so the same data renders identically in the
 * on-screen preview and the pdf-lib export (selectable text, A4).
 */

export interface CvPersonal {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  photoDataUrl: string | null;
  summary: string;
}

export type CvSectionType =
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'languages'
  | 'projects'
  | 'achievements'
  | 'interests'
  | 'references'
  | 'custom';

export interface CvExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface CvEducationItem {
  id: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  details: string;
}

export interface CvSkillItem {
  id: string;
  name: string;
  level: string; // e.g. "Expert" — optional, hidden by ATS templates
}

export interface CvSimpleItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
}

export type CvSectionItem = CvExperienceItem | CvEducationItem | CvSkillItem | CvSimpleItem;

export interface CvSection {
  id: string;
  type: CvSectionType;
  title: string;
  visible: boolean;
  /** free text for summary/custom sections */
  body: string;
  items: CvSectionItem[];
}

export interface CvDesign {
  templateId: string;
  accentColor: string;
  fontScale: number; // 0.9 – 1.1
  lineSpacing: number; // 1.0 – 1.6
  marginPt: number; // page margin in PDF points
  showPhoto: boolean;
}

export interface CvDocument {
  version: 1;
  updatedAt: string;
  personal: CvPersonal;
  sections: CvSection[];
  design: CvDesign;
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const SECTION_LABELS: Record<CvSectionType, string> = {
  summary: 'Professional Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  certifications: 'Certifications',
  languages: 'Languages',
  projects: 'Projects',
  achievements: 'Achievements',
  interests: 'Interests',
  references: 'References',
  custom: 'Custom Section',
};

export function blankPersonal(): CvPersonal {
  return {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    photoDataUrl: null,
    summary: '',
  };
}

export function blankSection(type: CvSectionType): CvSection {
  return {
    id: newId('sec'),
    type,
    title: SECTION_LABELS[type],
    visible: true,
    body: '',
    items: [],
  };
}

export function blankDocument(): CvDocument {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    personal: blankPersonal(),
    sections: [
      { ...blankSection('summary'), title: 'Professional Summary' },
      { ...blankSection('experience'), title: 'Work Experience' },
      { ...blankSection('education'), title: 'Education' },
      { ...blankSection('skills'), title: 'Skills' },
    ],
    design: {
      templateId: 'professional-corporate',
      accentColor: '#B91C1C',
      fontScale: 1,
      lineSpacing: 1.25,
      marginPt: 44,
      showPhoto: false,
    },
  };
}
