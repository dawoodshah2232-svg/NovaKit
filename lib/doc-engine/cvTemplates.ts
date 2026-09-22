/**
 * PDFEdit CV Builder V2 — eight premium templates on the shared document engine.
 *
 * Each template builds a one-page DocState from realistic sample content,
 * with genuinely different structure, typography, spacing, hierarchy, and
 * layout. Section layers are tagged with groupId/groupLabel so the editor
 * can add/remove/reorder/duplicate whole sections. Layers that follow the
 * template accent carry `accent: true` so the Design panel can recolor them.
 */
import {
  A4_PAGE,
  block,
  docDefaults,
  makeDividerLayer,
  makeShapeLayer,
  makeTextLayer,
  run,
  type DocBlockKind,
  type DocFontId,
  type DocLayer,
  type DocState,
  type DocTextBlock,
  type DocTextLayer,
} from './types';

export interface CvTemplateMeta {
  id: string;
  label: string;
  description: string;
  accent: string;
  build: () => DocState;
}

/* ------------------------------------------------------------------ */
/* Sample content (mirrors lib/cv/sampleData.ts, kept decoupled)       */
/* ------------------------------------------------------------------ */

const S = {
  name: 'Layla Haddad',
  title: 'Senior Marketing Manager',
  email: 'layla.haddad@example.com',
  phone: '+971 50 123 4567',
  location: 'Dubai, UAE',
  website: 'laylahaddad.com',
  linkedin: 'linkedin.com/in/laylahaddad',
  summary:
    'Results-driven marketing manager with 6 years of experience scaling B2B SaaS brands across the MENA region. ' +
    'Grew qualified pipeline 63% and cut acquisition cost 31% as demand-generation lead at Northbeam Technologies. ' +
    'Turns market insight into content, lifecycle, and paid programs that sales teams trust.',
  experience: [
    {
      role: 'Senior Marketing Manager',
      company: 'Northbeam Technologies',
      meta: 'Dubai, UAE · Jan 2023 – Present',
      bullets: [
        'Own demand generation across MENA; grew marketing-sourced pipeline 63% year over year.',
        'Rebuilt lifecycle email program — trial-to-paid conversion rose from 11% to 19%.',
        'Manage a team of 4 and a AED 1.2M annual budget across paid, content, and events.',
      ],
    },
    {
      role: 'Marketing Specialist',
      company: 'Brightline Media',
      meta: 'Dubai, UAE · Jun 2020 – Dec 2022',
      bullets: [
        'Launched SEO content engine; organic sessions grew 4.1x in 18 months.',
        'Cut cost per qualified lead 31% by consolidating paid search and LinkedIn.',
      ],
    },
  ],
  education: [
    {
      degree: 'BBA, Marketing',
      school: 'American University of Sharjah',
      meta: 'Sharjah, UAE · 2016 – 2020',
      detail: 'Graduated with honors. President, Marketing Society.',
    },
  ],
  skills: [
    'Demand Generation',
    'HubSpot Automation',
    'SEO & Content Strategy',
    'Paid Search & Social',
    'Team Leadership',
    'Analytics (GA4, Mixpanel)',
  ],
  certs: [
    'Google Ads Search Certification — Google Skillshop (2024)',
    'HubSpot Revenue Operations — HubSpot Academy (2023)',
  ],
  languages: ['English — Fluent', 'Arabic — Native'],
  projects: [
    {
      name: 'MENA Pipeline Playbook',
      detail: 'Open-sourced demand-gen framework; adopted by 3 regional SaaS teams.',
    },
    {
      name: 'Lifecycle Email Teardowns',
      detail: 'Monthly newsletter with 2,400+ B2B marketer subscribers.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Layout helpers                                                      */
/* ------------------------------------------------------------------ */

function txt(
  groupId: string,
  groupLabel: string,
  x: number,
  y: number,
  w: number,
  h: number,
  blocks: DocTextBlock[],
  opts: Partial<DocTextLayer> = {},
): DocTextLayer {
  return makeTextLayer({ ...opts, groupId, groupLabel, x, y, w, h, blocks });
}

function shape(
  x: number,
  y: number,
  w: number,
  h: number,
  opts: Partial<import('./types').DocShapeLayer> = {},
): DocLayer {
  return makeShapeLayer({ x, y, w, h, ...opts });
}

function rule(
  x: number,
  y: number,
  w: number,
  color: string,
  opts: { accent?: boolean; groupId?: string; groupLabel?: string; thickness?: number } = {},
): DocLayer {
  return makeDividerLayer({
    x, y, w, h: 0.004, color,
    accent: opts.accent,
    groupId: opts.groupId,
    groupLabel: opts.groupLabel,
    thickness: opts.thickness ?? 0.0018,
  });
}

/** Vertical cursor: hand out y positions top-to-bottom. */
function cursor(startY: number, gap = 0.014) {
  let y = startY;
  return {
    next(h: number): number {
      const yy = y;
      y += h + gap;
      return yy;
    },
    peek(): number {
      return y;
    },
  };
}

function para(text: string, opts: Partial<DocTextBlock> = {}): DocTextBlock {
  return block('paragraph', text, opts);
}

function bullets(items: string[], spaceAfter = 0.004): DocTextBlock[] {
  return items.map((t) => block('bullet', t, { spaceAfter }));
}

function heading(
  text: string,
  opts: {
    kind?: DocBlockKind;
    color?: string | null;
    fontSizePt?: number;
    align?: DocTextBlock['align'];
    fontId?: DocFontId;
  } = {},
): DocTextBlock {
  return block(opts.kind ?? 'h3', [
    run(text, {
      bold: true,
      color: opts.color === undefined ? null : opts.color,
      fontSize: (opts.fontSizePt ?? 13) / 841.89,
      fontId: opts.fontId ?? null,
    }),
  ], { align: opts.align ?? 'left', spaceAfter: 0.004 });
}

function expBlocks(muted: string): DocTextBlock[] {
  const out: DocTextBlock[] = [];
  for (const e of S.experience) {
    out.push(
      block('paragraph', [
        run(e.role, { bold: true }),
        run(`  ·  ${e.company}`, {}),
      ], { spaceAfter: 0.001 }),
      block('paragraph', [run(e.meta, { italic: true, color: muted })], { spaceAfter: 0.003 }),
      ...bullets(e.bullets),
    );
  }
  return out;
}

function eduBlocks(muted: string): DocTextBlock[] {
  return S.education.flatMap((e) => [
    block('paragraph', [run(e.degree, { bold: true }), run(`  ·  ${e.school}`, {})], { spaceAfter: 0.001 }),
    block('paragraph', [run(e.meta, { italic: true, color: muted })], { spaceAfter: 0.002 }),
    para(e.detail),
  ]);
}

function contactLine(sep: string, color: string | null = null): DocTextBlock {
  return block('paragraph', [
    run(S.email, { color }),
    run(sep, { color }),
    run(S.phone, { color }),
    run(sep, { color }),
    run(S.location, { color }),
  ], { spaceAfter: 0.002 });
}

/* ------------------------------------------------------------------ */
/* 1 — Executive Corporate                                             */
/* ------------------------------------------------------------------ */

function buildExecutive(): DocState {
  const accent = '#1F3A5F';
  const ink = '#1c1a16';
  const muted = '#5b564c';
  const layers: DocLayer[] = [];
  const c = cursor(0.055);

  layers.push(
    txt('sec-profile', 'Profile', 0.08, c.next(0.062), 0.84, 0.062, [
      block('h1', [run(S.name, { fontId: 'serif', fontSize: 30 / 841.89 })], { align: 'center', spaceAfter: 0.002 }),
      block('paragraph', [run(S.title, { fontId: 'serif', italic: true, fontSize: 14 / 841.89, color: accent })], { align: 'center' }),
    ], { fontId: 'serif', fontSize: 0.0135, color: ink, lineHeight: 1.4 }),
    txt('sec-profile', 'Profile', 0.08, c.next(0.02), 0.84, 0.02, [contactLine('   ·   ', muted)],
      { fontId: 'serif', fontSize: 0.0115, color: muted, lineHeight: 1.4 }),
    rule(0.08, c.next(0.004), 0.84, accent, { accent: true, groupId: 'sec-profile', groupLabel: 'Profile' }),
  );

  const sec = (id: string, label: string, blocks: DocTextBlock[], h: number) => {
    const yy = c.next(h + 0.012);
    layers.push(
      txt(id, label, 0.08, yy, 0.84, 0.02, [heading(label.toUpperCase(), { color: accent, fontSizePt: 12.5 })],
        { fontId: 'serif', fontSize: 0.013, color: ink, lineHeight: 1.5, accent: true }),
      txt(id, label, 0.08, yy + 0.026, 0.84, h, blocks, { fontId: 'serif', fontSize: 0.013, color: ink, lineHeight: 1.5 }),
    );
  };

  sec('sec-summary', 'Summary', [para(S.summary)], 0.055);
  sec('sec-experience', 'Experience', expBlocks(muted), 0.19);
  sec('sec-education', 'Education', eduBlocks(muted), 0.055);
  sec('sec-skills', 'Skills', [para(S.skills.join('  ·  '))], 0.03);
  sec('sec-certifications', 'Certifications', bullets(S.certs), 0.035);
  sec('sec-languages', 'Languages', [para(S.languages.join('  ·  '))], 0.02);

  return { page: A4_PAGE, ...docDefaults(), pages: [{ key: 'pg_1', background: null }], layers };
}

/* ------------------------------------------------------------------ */
/* 2 — Modern Professional (accent sidebar)                            */
/* ------------------------------------------------------------------ */

function buildModern(): DocState {
  const accent = '#B91C1C';
  const dark = '#7F1D1D';
  const ink = '#1c1a16';
  const muted = '#5b564c';
  const layers: DocLayer[] = [];

  // Sidebar backdrop
  layers.push(shape(0, 0, 0.3, 1, { kind: 'rect', fill: dark, stroke: dark, groupId: 'sec-profile', groupLabel: 'Profile', accent: true }));

  const sc = cursor(0.05, 0.01);
  layers.push(
    txt('sec-profile', 'Profile', 0.035, sc.next(0.07), 0.23, 0.07, [
      block('h1', [run(S.name, { fontSize: 24 / 841.89, color: '#ffffff' })], { spaceAfter: 0.002 }),
      block('paragraph', [run(S.title, { fontSize: 11.5 / 841.89, color: '#fecaca' })]),
    ], { fontSize: 0.013, color: '#ffffff', lineHeight: 1.35 }),
    txt('sec-profile', 'Profile', 0.035, sc.next(0.075), 0.23, 0.075, [
      para(S.email), para(S.phone), para(S.location), para(S.website), para(S.linkedin),
    ], { fontSize: 0.0105, color: '#fee2e2', lineHeight: 1.6 }),
  );

  const sideSec = (id: string, label: string, blocks: DocTextBlock[], h: number) => {
    const yy = sc.next(h + 0.014);
    layers.push(
      txt(id, label, 0.035, yy, 0.23, 0.02, [heading(label.toUpperCase(), { color: '#ffffff', fontSizePt: 11.5 })],
        { fontSize: 0.0115, color: '#ffffff', lineHeight: 1.4 }),
      rule(0.035, yy + 0.024, 0.23, accent, { accent: true, groupId: id, groupLabel: label, thickness: 0.0022 }),
      txt(id, label, 0.035, yy + 0.032, 0.23, h, blocks, { fontSize: 0.0115, color: '#fee2e2', lineHeight: 1.55 }),
    );
  };
  sideSec('sec-skills', 'Skills', bullets(S.skills, 0.002), 0.1);
  sideSec('sec-languages', 'Languages', bullets(S.languages, 0.002), 0.035);
  sideSec('sec-certifications', 'Certifications', bullets(S.certs, 0.002), 0.045);

  // Main column
  const mc = cursor(0.05);
  const mainSec = (id: string, label: string, blocks: DocTextBlock[], h: number) => {
    const yy = mc.next(h + 0.014);
    layers.push(
      txt(id, label, 0.35, yy, 0.59, 0.02, [heading(label.toUpperCase(), { color: accent, fontSizePt: 12.5 })],
        { fontSize: 0.0125, color: ink, lineHeight: 1.5, accent: true }),
      rule(0.35, yy + 0.024, 0.59, '#e7e0d2', { groupId: id, groupLabel: label }),
      txt(id, label, 0.35, yy + 0.032, 0.59, h, blocks, { fontSize: 0.0125, color: ink, lineHeight: 1.5 }),
    );
  };
  mainSec('sec-summary', 'Summary', [para(S.summary)], 0.06);
  mainSec('sec-experience', 'Experience', expBlocks(muted), 0.2);
  mainSec('sec-education', 'Education', eduBlocks(muted), 0.055);

  return { page: A4_PAGE, ...docDefaults(), pages: [{ key: 'pg_1', background: null }], layers };
}

/* ------------------------------------------------------------------ */
/* 3 — ATS Resume (pure single column, black & white)                  */
/* ------------------------------------------------------------------ */

function buildAts(): DocState {
  const ink = '#111111';
  const layers: DocLayer[] = [];
  const c = cursor(0.05);

  layers.push(
    txt('sec-profile', 'Profile', 0.07, c.next(0.075), 0.86, 0.075, [
      block('h1', [run(S.name, { fontSize: 26 / 841.89 })], { spaceAfter: 0.002 }),
      contactLine(' | '),
    ], { fontSize: 0.0118, color: ink, lineHeight: 1.45 }),
  );

  const sec = (id: string, label: string, blocks: DocTextBlock[], h: number) => {
    const yy = c.next(h + 0.012);
    layers.push(
      txt(id, label, 0.07, yy, 0.86, 0.018, [heading(label.toUpperCase(), { fontSizePt: 12 })],
        { fontSize: 0.0118, color: ink, lineHeight: 1.45 }),
      rule(0.07, yy + 0.022, 0.86, '#111111', { groupId: id, groupLabel: label, thickness: 0.002 }),
      txt(id, label, 0.07, yy + 0.03, 0.86, h, blocks, { fontSize: 0.0118, color: ink, lineHeight: 1.45 }),
    );
  };

  sec('sec-summary', 'Professional Summary', [para(S.summary)], 0.055);
  sec('sec-experience', 'Work Experience', expBlocks('#444444'), 0.19);
  sec('sec-education', 'Education', eduBlocks('#444444'), 0.05);
  sec('sec-skills', 'Skills', [para(S.skills.join(', '))], 0.025);
  sec('sec-certifications', 'Certifications', bullets(S.certs), 0.032);

  return { page: A4_PAGE, ...docDefaults(), pages: [{ key: 'pg_1', background: null }], layers };
}

/* ------------------------------------------------------------------ */
/* 4 — Creative Designer (oversized name, asymmetric, accent shapes)   */
/* ------------------------------------------------------------------ */

function buildCreative(): DocState {
  const accent = '#0D9488';
  const ink = '#14201d';
  const muted = '#4b5b57';
  const layers: DocLayer[] = [];

  // Accent geometry: big circle top-right + bar
  layers.push(
    shape(0.78, -0.06, 0.34, 0.2, { kind: 'ellipse', fill: accent, stroke: accent, groupId: 'sec-profile', groupLabel: 'Profile', accent: true }),
    shape(0.06, 0.235, 0.1, 0.012, { kind: 'rect', fill: accent, stroke: accent, groupId: 'sec-profile', groupLabel: 'Profile', accent: true }),
  );

  const c = cursor(0.06);
  layers.push(
    txt('sec-profile', 'Profile', 0.06, c.next(0.1), 0.7, 0.1, [
      block('h1', [run(S.name.toUpperCase(), { fontSize: 40 / 841.89 })], { spaceAfter: 0.002 }),
      block('paragraph', [run(S.title, { fontSize: 14 / 841.89, color: accent, bold: true })]),
    ], { fontSize: 0.013, color: ink, lineHeight: 1.3, accent: true }),
    txt('sec-profile', 'Profile', 0.06, c.next(0.028), 0.7, 0.028, [contactLine('   /   ', muted)],
      { fontSize: 0.011, color: muted, lineHeight: 1.5 }),
  );

  const hcol = (label: string) => heading(label.toUpperCase(), { color: accent, fontSizePt: 12 });

  // Left column: experience + projects
  const lx = 0.06;
  const lw = 0.5;
  const ly1 = c.peek();
  layers.push(
    txt('sec-experience', 'Experience', lx, ly1, lw, 0.02, [hcol('Experience')],
      { fontSize: 0.012, color: ink, lineHeight: 1.45, accent: true }),
    txt('sec-experience', 'Experience', lx, ly1 + 0.026, lw, 0.21, expBlocks(muted),
      { fontSize: 0.012, color: ink, lineHeight: 1.45 }),
  );
  const ly2 = ly1 + 0.026 + 0.21 + 0.014;
  layers.push(
    txt('sec-projects', 'Projects', lx, ly2, lw, 0.02, [hcol('Selected Work')],
      { fontSize: 0.012, color: ink, lineHeight: 1.45, accent: true }),
    txt('sec-projects', 'Projects', lx, ly2 + 0.026, lw, 0.07,
      S.projects.flatMap((p) => [
        block('paragraph', [run(p.name, { bold: true, color: accent })], { spaceAfter: 0.001 }),
        para(p.detail),
      ]), { fontSize: 0.012, color: ink, lineHeight: 1.45, accent: true }),
  );

  // Right column: about + toolbox + education
  const rx = 0.62;
  const rw = 0.32;
  const ry1 = c.peek();
  layers.push(
    txt('sec-summary', 'Summary', rx, ry1, rw, 0.02, [hcol('About')],
      { fontSize: 0.012, color: ink, lineHeight: 1.45, accent: true }),
    txt('sec-summary', 'Summary', rx, ry1 + 0.026, rw, 0.075, [para(S.summary)],
      { fontSize: 0.0115, color: ink, lineHeight: 1.55 }),
  );
  const ry2 = ry1 + 0.026 + 0.075 + 0.014;
  layers.push(
    txt('sec-skills', 'Skills', rx, ry2, rw, 0.02, [hcol('Toolbox')],
      { fontSize: 0.012, color: ink, lineHeight: 1.45, accent: true }),
    txt('sec-skills', 'Skills', rx, ry2 + 0.026, rw, 0.1, bullets(S.skills, 0.002),
      { fontSize: 0.0115, color: ink, lineHeight: 1.5 }),
  );
  const ry3 = ry2 + 0.026 + 0.1 + 0.014;
  layers.push(
    txt('sec-education', 'Education', rx, ry3, rw, 0.02, [hcol('Education')],
      { fontSize: 0.012, color: ink, lineHeight: 1.45, accent: true }),
    txt('sec-education', 'Education', rx, ry3 + 0.026, rw, 0.055, eduBlocks(muted),
      { fontSize: 0.0115, color: ink, lineHeight: 1.45 }),
  );

  return { page: A4_PAGE, ...docDefaults(), pages: [{ key: 'pg_1', background: null }], layers };
}

/* ------------------------------------------------------------------ */
/* 5 — Developer Resume (mono accents, skill tag row)                  */
/* ------------------------------------------------------------------ */

function buildDeveloper(): DocState {
  const accent = '#1E40AF';
  const ink = '#16181d';
  const muted = '#555b66';
  const layers: DocLayer[] = [];
  const c = cursor(0.05);

  layers.push(
    txt('sec-profile', 'Profile', 0.07, c.next(0.085), 0.86, 0.085, [
      block('h1', [run(S.name, { fontSize: 28 / 841.89 })], { spaceAfter: 0.002 }),
      block('paragraph', [run(S.title, { fontId: 'mono', fontSize: 12 / 841.89, color: accent })], { spaceAfter: 0.002 }),
      block('paragraph', [
        run(S.email, { fontId: 'mono' }), run('  ·  ', { fontId: 'mono' }),
        run(S.phone, { fontId: 'mono' }), run('  ·  ', { fontId: 'mono' }),
        run(S.location, { fontId: 'mono' }),
      ]),
    ], { fontSize: 0.0115, color: ink, lineHeight: 1.4, accent: true }),
  );

  // Skill tags row (wraps to a second row if needed)
  let tagY = c.next(0.062);
  let tx = 0.07;
  S.skills.forEach((skill) => {
    const w = Math.min(0.3, 0.035 + skill.length * 0.0072);
    if (tx + w > 0.93) {
      tx = 0.07;
      tagY += 0.034;
    }
    layers.push(
      shape(tx, tagY, w, 0.026, { kind: 'rect', fill: '#EFF6FF', stroke: '#BFDBFE', strokeWidth: 0.0012, groupId: 'sec-skills', groupLabel: 'Skills' }),
      txt('sec-skills', 'Skills', tx, tagY + 0.004, w, 0.02,
        [block('paragraph', [run(skill, { fontId: 'mono', fontSize: 9.5 / 841.89, color: accent })], { align: 'center' })],
        { fontSize: 0.0113, color: accent, lineHeight: 1.2, accent: true }),
    );
    tx += w + 0.012;
  });

  const mc = cursor(tagY + 0.04);
  const sec = (id: string, label: string, blocks: DocTextBlock[], h: number) => {
    const yy = mc.next(h + 0.012);
    layers.push(
      txt(id, label, 0.07, yy, 0.86, 0.02,
        [block('h3', [run(`// ${label}`, { fontId: 'mono', fontSize: 12.5 / 841.89, color: accent, bold: true })], { spaceAfter: 0.004 })],
        { fontSize: 0.012, color: ink, lineHeight: 1.45, accent: true }),
      txt(id, label, 0.07, yy + 0.028, 0.86, h, blocks, { fontSize: 0.012, color: ink, lineHeight: 1.5 }),
    );
  };

  sec('sec-summary', 'Summary', [para(S.summary)], 0.055);
  sec('sec-experience', 'Experience', expBlocks(muted), 0.19);
  sec('sec-projects', 'Projects',
    S.projects.flatMap((p) => [
      block('paragraph', [run(p.name, { bold: true, fontId: 'mono', color: accent })], { spaceAfter: 0.001 }),
      para(p.detail),
    ]), 0.05);
  sec('sec-education', 'Education', eduBlocks(muted), 0.05);

  return { page: A4_PAGE, ...docDefaults(), pages: [{ key: 'pg_1', background: null }], layers };
}

/* ------------------------------------------------------------------ */
/* 6 — Marketing Resume (warm accent, photo medallion)                 */
/* ------------------------------------------------------------------ */

function buildMarketing(): DocState {
  const accent = '#EA580C';
  const ink = '#1f1a15';
  const muted = '#6b5f54';
  const layers: DocLayer[] = [];

  // Photo medallion (initials; user replaces with a real photo)
  layers.push(
    shape(0.07, 0.05, 0.15, 0.106, { kind: 'ellipse', fill: accent, stroke: accent, groupId: 'sec-photo', groupLabel: 'Photo', accent: true }),
    txt('sec-photo', 'Photo', 0.07, 0.072, 0.15, 0.06,
      [block('paragraph', [run('LH', { fontSize: 34 / 841.89, color: '#ffffff', bold: true })], { align: 'center' })],
      { fontSize: 0.04, color: '#ffffff', lineHeight: 1 }),
  );

  const c = cursor(0.05);
  layers.push(
    txt('sec-profile', 'Profile', 0.26, c.next(0.075), 0.67, 0.075, [
      block('h1', [run(S.name, { fontSize: 30 / 841.89 })], { spaceAfter: 0.002 }),
      block('paragraph', [run(S.title, { fontSize: 13.5 / 841.89, color: accent, bold: true })], { spaceAfter: 0.002 }),
      contactLine('  ·  ', muted),
    ], { fontSize: 0.0115, color: ink, lineHeight: 1.4, accent: true }),
  );
  layers.push(rule(0.07, c.next(0.004), 0.86, accent, { accent: true, groupId: 'sec-profile', groupLabel: 'Profile', thickness: 0.0028 }));

  const sec = (id: string, label: string, blocks: DocTextBlock[], h: number) => {
    const yy = c.next(h + 0.01);
    layers.push(
      txt(id, label, 0.07, yy, 0.86, 0.02, [heading(label, { color: accent, fontSizePt: 13 })],
        { fontSize: 0.0122, color: ink, lineHeight: 1.5, accent: true }),
      txt(id, label, 0.07, yy + 0.026, 0.86, h, blocks, { fontSize: 0.0122, color: ink, lineHeight: 1.5 }),
    );
  };

  sec('sec-summary', 'Summary', [para(S.summary)], 0.058);
  sec('sec-experience', 'Experience', expBlocks(muted), 0.19);
  sec('sec-skills', 'Core Skills', [para(S.skills.join('  ·  '))], 0.028);
  sec('sec-education', 'Education', eduBlocks(muted), 0.05);
  sec('sec-certifications', 'Certifications', bullets(S.certs), 0.032);

  return { page: A4_PAGE, ...docDefaults(), pages: [{ key: 'pg_1', background: null }], layers };
}

/* ------------------------------------------------------------------ */
/* 7 — Finance Resume (navy, serif, ruled sections)                    */
/* ------------------------------------------------------------------ */

function buildFinance(): DocState {
  const accent = '#1E3A5F';
  const ink = '#191c22';
  const muted = '#4c5563';
  const layers: DocLayer[] = [];
  const c = cursor(0.055);

  layers.push(
    txt('sec-profile', 'Profile', 0.09, c.next(0.07), 0.82, 0.07, [
      block('h1', [run(S.name, { fontId: 'serif', fontSize: 28 / 841.89 })], { align: 'center', spaceAfter: 0.002 }),
      block('paragraph', [run(S.title, { fontId: 'serif', fontSize: 13 / 841.89, color: accent })], { align: 'center', spaceAfter: 0.002 }),
      block('paragraph', [run(`${S.email}  ·  ${S.phone}  ·  ${S.location}`, { fontId: 'serif', color: muted })], { align: 'center' }),
    ], { fontId: 'serif', fontSize: 0.012, color: ink, lineHeight: 1.4, accent: true }),
    rule(0.09, c.next(0.004), 0.82, accent, { accent: true, groupId: 'sec-profile', groupLabel: 'Profile' }),
    rule(0.09, c.next(0.002), 0.82, accent, { accent: true, groupId: 'sec-profile', groupLabel: 'Profile', thickness: 0.001 }),
  );

  const sec = (id: string, label: string, blocks: DocTextBlock[], h: number) => {
    const yy = c.next(h + 0.012);
    layers.push(
      txt(id, label, 0.09, yy, 0.82, 0.018,
        [block('h3', [run(label.toUpperCase(), { fontId: 'serif', fontSize: 11.5 / 841.89, color: accent, bold: true })], { align: 'center', spaceAfter: 0.002 })],
        { fontId: 'serif', fontSize: 0.0122, color: ink, lineHeight: 1.5, accent: true }),
      rule(0.32, yy + 0.024, 0.36, '#c8cdd6', { groupId: id, groupLabel: label, thickness: 0.0012 }),
      txt(id, label, 0.09, yy + 0.032, 0.82, h, blocks, { fontId: 'serif', fontSize: 0.0122, color: ink, lineHeight: 1.5 }),
    );
  };

  sec('sec-summary', 'Professional Summary', [para(S.summary)], 0.058);
  sec('sec-experience', 'Professional Experience', expBlocks(muted), 0.19);
  sec('sec-education', 'Education', eduBlocks(muted), 0.05);
  sec('sec-skills', 'Skills & Competencies', [para(S.skills.join('  ·  '))], 0.028);
  sec('sec-certifications', 'Certifications', bullets(S.certs), 0.032);

  return { page: A4_PAGE, ...docDefaults(), pages: [{ key: 'pg_1', background: null }], layers };
}

/* ------------------------------------------------------------------ */
/* 8 — Graduate Resume (fresh, education-first, compact)               */
/* ------------------------------------------------------------------ */

function buildGraduate(): DocState {
  const accent = '#059669';
  const ink = '#17211c';
  const muted = '#5b6b61';
  const layers: DocLayer[] = [];

  // Fresh top band
  layers.push(shape(0, 0, 1, 0.035, { kind: 'rect', fill: accent, stroke: accent, groupId: 'sec-profile', groupLabel: 'Profile', accent: true }));

  const c = cursor(0.055);
  layers.push(
    txt('sec-profile', 'Profile', 0.07, c.next(0.062), 0.86, 0.062, [
      block('h1', [run(S.name, { fontSize: 26 / 841.89, color: accent })], { spaceAfter: 0.001 }),
      block('paragraph', [run('Marketing Graduate · Class of 2020', { fontSize: 12.5 / 841.89, bold: true })], { spaceAfter: 0.002 }),
      contactLine('  ·  ', muted),
    ], { fontSize: 0.0115, color: ink, lineHeight: 1.4, accent: true }),
  );

  const sec = (id: string, label: string, blocks: DocTextBlock[], h: number) => {
    const yy = c.next(h + 0.008);
    layers.push(
      txt(id, label, 0.07, yy, 0.86, 0.018,
        [block('h3', [
          run('● ', { color: accent, fontSize: 11 / 841.89 }),
          run(label.toUpperCase(), { fontSize: 11.5 / 841.89, color: accent, bold: true }),
        ], { spaceAfter: 0.003 })],
        { fontSize: 0.0118, color: ink, lineHeight: 1.45, accent: true }),
      txt(id, label, 0.07, yy + 0.024, 0.86, h, blocks, { fontSize: 0.0118, color: ink, lineHeight: 1.45 }),
    );
  };

  sec('sec-education', 'Education', eduBlocks(muted), 0.05);
  sec('sec-experience', 'Experience', expBlocks(muted), 0.19);
  sec('sec-projects', 'Projects',
    S.projects.flatMap((p) => [
      block('paragraph', [run(p.name, { bold: true, color: accent })], { spaceAfter: 0.001 }),
      para(p.detail),
    ]), 0.05);
  sec('sec-skills', 'Skills', [para(S.skills.join('  ·  '))], 0.028);
  sec('sec-summary', 'About Me', [para(S.summary)], 0.058);
  sec('sec-languages', 'Languages', [para(S.languages.join('  ·  '))], 0.02);

  return { page: A4_PAGE, ...docDefaults(), pages: [{ key: 'pg_1', background: null }], layers };
}

/* ------------------------------------------------------------------ */

export const CV_TEMPLATES: CvTemplateMeta[] = [
  {
    id: 'executive-corporate',
    label: 'Executive Corporate',
    description: 'Centered serif header, hairline rules, generous whitespace. Boardroom-safe.',
    accent: '#1F3A5F',
    build: buildExecutive,
  },
  {
    id: 'modern-professional',
    label: 'Modern Professional',
    description: 'Dark accent sidebar with contact and skills; clean content column.',
    accent: '#B91C1C',
    build: buildModern,
  },
  {
    id: 'ats-resume',
    label: 'ATS Resume',
    description: 'Pure single-column black & white. Maximum parser compatibility.',
    accent: '#111111',
    build: buildAts,
  },
  {
    id: 'creative-designer',
    label: 'Creative Designer',
    description: 'Oversized name, accent geometry, asymmetric two-column body.',
    accent: '#0D9488',
    build: buildCreative,
  },
  {
    id: 'developer-resume',
    label: 'Developer Resume',
    description: 'Monospace accents, skill-tag row, comment-style section markers.',
    accent: '#1E40AF',
    build: buildDeveloper,
  },
  {
    id: 'marketing-resume',
    label: 'Marketing Resume',
    description: 'Warm accent, photo medallion, confident headline hierarchy.',
    accent: '#EA580C',
    build: buildMarketing,
  },
  {
    id: 'finance-resume',
    label: 'Finance Resume',
    description: 'Navy serif, centered ruled sections. Conservative and precise.',
    accent: '#1E3A5F',
    build: buildFinance,
  },
  {
    id: 'graduate-resume',
    label: 'Graduate Resume',
    description: 'Fresh emerald band, education-first, compact early-career layout.',
    accent: '#059669',
    build: buildGraduate,
  },
];
