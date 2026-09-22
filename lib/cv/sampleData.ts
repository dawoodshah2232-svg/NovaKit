/**
 * PDFEdit CV Builder — sample content.
 *
 * Realistic, original placeholder content so the template gallery and the
 * editor preview look like real CVs. One tap replaces it with the user's
 * own blank document.
 */
import { blankSection, newId, type CvDocument, type CvSection } from './types';

export function sampleDocument(): CvDocument {
  const sections: CvSection[] = [];

  const summary = blankSection('summary');
  summary.body =
    'Results-driven marketing manager with 5+ years of experience growing B2B SaaS brands across the MENA region. ' +
    'Led campaigns that increased qualified pipeline by 63% and cut acquisition cost by 31%. ' +
    'Skilled at turning market insight into content, lifecycle, and paid programs that sales teams love.';
  sections.push(summary);

  const exp = blankSection('experience');
  exp.items = [
    {
      id: newId('exp'),
      role: 'Senior Marketing Manager',
      company: 'Northbeam Technologies',
      location: 'Dubai, UAE',
      startDate: 'Jan 2023',
      endDate: '',
      current: true,
      bullets: [
        'Own demand generation across MENA; grew marketing-sourced pipeline 63% year over year.',
        'Rebuilt lifecycle email program — trial-to-paid conversion up from 11% to 19%.',
        'Manage a team of 4 and a AED 1.2M annual budget across paid, content, and events.',
      ],
    },
    {
      id: newId('exp'),
      role: 'Marketing Specialist',
      company: 'Brightline Media',
      location: 'Dubai, UAE',
      startDate: 'Jun 2020',
      endDate: 'Dec 2022',
      current: false,
      bullets: [
        'Launched SEO content engine; organic sessions grew 4.1x in 18 months.',
        'Cut cost per qualified lead 31% by consolidating paid search and LinkedIn.',
      ],
    },
  ];
  sections.push(exp);

  const edu = blankSection('education');
  edu.items = [
    {
      id: newId('edu'),
      degree: 'BBA, Marketing',
      school: 'American University of Sharjah',
      location: 'Sharjah, UAE',
      startDate: '2016',
      endDate: '2020',
      details: 'Graduated with honors. President, Marketing Society.',
    },
  ];
  sections.push(edu);

  const skills = blankSection('skills');
  skills.items = [
    { id: newId('sk'), name: 'Demand Generation', level: '' },
    { id: newId('sk'), name: 'Marketing Automation (HubSpot)', level: '' },
    { id: newId('sk'), name: 'SEO & Content Strategy', level: '' },
    { id: newId('sk'), name: 'Paid Search & Social', level: '' },
    { id: newId('sk'), name: 'Team Leadership', level: '' },
    { id: newId('sk'), name: 'Analytics (GA4, Mixpanel)', level: '' },
  ];
  sections.push(skills);

  const certs = blankSection('certifications');
  certs.items = [
    { id: newId('ct'), title: 'Google Ads Search Certification', subtitle: 'Google Skillshop', date: '2024', description: '' },
    { id: newId('ct'), title: 'HubSpot Revenue Operations', subtitle: 'HubSpot Academy', date: '2023', description: '' },
  ];
  sections.push(certs);

  const langs = blankSection('languages');
  langs.items = [
    { id: newId('lg'), title: 'English', subtitle: 'Fluent', date: '', description: '' },
    { id: newId('lg'), title: 'Arabic', subtitle: 'Native', date: '', description: '' },
  ];
  sections.push(langs);

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    personal: {
      fullName: 'Layla Haddad',
      title: 'Senior Marketing Manager',
      email: 'layla.haddad@example.com',
      phone: '+971 50 123 4567',
      location: 'Dubai, UAE',
      website: 'laylahaddad.com',
      linkedin: 'linkedin.com/in/laylahaddad',
      photoDataUrl: null,
      summary: '',
    },
    sections,
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
