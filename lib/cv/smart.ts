/**
 * PDFEdit CV Builder — honest writing helpers.
 *
 * These are local, rule-based suggestion helpers (template phrasing + curated
 * skill lists). They are NOT AI. The UI labels them "Suggestions" and never
 * claims generated content is AI-written.
 */

const ROLE_SKILLS: Array<{ match: RegExp; skills: string[] }> = [
  {
    match: /market/i,
    skills: ['Demand Generation', 'SEO & Content Strategy', 'Marketing Automation (HubSpot)', 'Paid Search & Social', 'Lifecycle Email Marketing', 'Analytics (GA4)', 'Brand Positioning', 'Campaign Management'],
  },
  {
    match: /engineer|developer|software|devops|data/i,
    skills: ['TypeScript', 'React', 'Node.js', 'REST API Design', 'Git & CI/CD', 'SQL', 'System Design', 'Testing (Jest/Playwright)'],
  },
  {
    match: /design|ux|ui|product/i,
    skills: ['User Research', 'Wireframing & Prototyping', 'Figma', 'Design Systems', 'Usability Testing', 'Interaction Design', 'Visual Hierarchy', 'Stakeholder Workshops'],
  },
  {
    match: /sale|account|business development/i,
    skills: ['Prospecting', 'CRM (Salesforce/HubSpot)', 'Negotiation', 'Pipeline Management', 'Discovery Calls', 'Forecasting', 'Objection Handling', 'Upselling'],
  },
  {
    match: /finance|account|audit/i,
    skills: ['Financial Modeling', 'Excel (Advanced)', 'Budgeting & Forecasting', 'Variance Analysis', 'IFRS', 'Power BI', 'Risk Assessment', 'Stakeholder Reporting'],
  },
  {
    match: /hr|human resources|recruit|talent/i,
    skills: ['Talent Acquisition', 'Onboarding', 'HRIS (Workday)', 'Performance Management', 'Employee Relations', 'Compensation & Benefits', 'Labor Law Basics', 'Employer Branding'],
  },
  {
    match: /project|program|scrum|agile/i,
    skills: ['Agile / Scrum', 'Roadmapping', 'Jira', 'Risk Management', 'Stakeholder Communication', 'Budget Tracking', 'Sprint Planning', 'Retrospectives'],
  },
  {
    match: /customer|support|success/i,
    skills: ['Customer Onboarding', 'Zendesk / Intercom', 'De-escalation', 'CSAT & NPS Improvement', 'Knowledge Base Writing', 'Churn Reduction', 'Multichannel Support'],
  },
  {
    match: /student|intern|graduate/i,
    skills: ['Research & Analysis', 'Microsoft Office / Google Workspace', 'Presentation Skills', 'Teamwork', 'Time Management', 'Academic Writing', 'Public Speaking'],
  },
];

const GENERIC_SKILLS = [
  'Communication', 'Problem Solving', 'Time Management', 'Teamwork', 'Adaptability', 'Attention to Detail', 'Critical Thinking', 'Leadership',
];

/** Suggest skills based on the user's professional title. Pure keyword matching. */
export function suggestSkills(title: string): string[] {
  const t = (title || '').trim();
  for (const entry of ROLE_SKILLS) {
    if (entry.match.test(t)) return entry.skills;
  }
  return GENERIC_SKILLS;
}

const SUMMARY_TEMPLATES = [
  '{role} with {years} of experience delivering measurable results in {field}. Known for {strength1} and {strength2}, with a track record of {outcome}.',
  'Driven {role} bringing {years} of hands-on experience in {field}. Combines {strength1} with {strength2} to deliver {outcome}.',
  '{role} focused on {field}, with {years} turning {strength1} into {outcome}. Recognized for {strength2} and clear, dependable execution.',
];

/**
 * Build professional summary phrasing suggestions from a job title.
 * The user picks one and edits freely — these are starting points, not final copy.
 */
export function suggestSummary(title: string): string[] {
  const role = (title || 'Professional').trim() || 'Professional';
  const years = '5+ years';
  const field = guessField(role);
  return SUMMARY_TEMPLATES.map((tpl, i) =>
    tpl
      .replace('{role}', capitalize(role))
      .replace('{years}', years)
      .replace('{field}', field)
      .replace('{strength1}', ['strategic thinking', 'data-driven decision making', 'cross-functional collaboration'][i % 3])
      .replace('{strength2}', ['mentoring teams', 'process improvement', 'stakeholder communication'][i % 3])
      .replace('{outcome}', ['consistent growth in competitive markets', 'efficiency gains that compound over time', 'results stakeholders can measure'][i % 3])
  );
}

function guessField(role: string): string {
  if (/market/i.test(role)) return 'demand generation and brand growth';
  if (/engineer|developer|software/i.test(role)) return 'building reliable software systems';
  if (/design|ux|ui/i.test(role)) return 'user-centered product design';
  if (/sale/i.test(role)) return 'revenue growth and client relationships';
  if (/finance/i.test(role)) return 'financial planning and analysis';
  if (/hr|recruit/i.test(role)) return 'talent acquisition and people operations';
  if (/project/i.test(role)) return 'delivering complex projects on time';
  return 'their industry';
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
