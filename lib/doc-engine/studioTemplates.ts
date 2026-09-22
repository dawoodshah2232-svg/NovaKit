/**
 * PDFEdit Document Engine — Studio V2 document templates.
 *
 * Seven professional starting points for the Studio V2 preview. All content
 * is original sample copy. Typography: dark slate text, one crimson accent
 * (#C8102E), generous spacing.
 */
import {
  blankDoc,
  block,
  makeDividerLayer,
  makeShapeLayer,
  makeTextLayer,
  run,
  type DocAlign,
  type DocState,
  type DocTemplate,
  type DocTextBlock,
  type DocTextLayer,
} from './types';

const INK = '#1c1a16';
const MUTED = '#66615a';
const ACCENT = '#C8102E';
const RULE = '#d9d2c2';

function text(
  x: number,
  y: number,
  w: number,
  blocks: DocTextBlock[],
  opts: Partial<DocTextLayer> = {},
): DocTextLayer {
  return makeTextLayer({ x, y, w, h: 0.3, pageIndex: 0, blocks, color: INK, ...opts });
}

function heading(textStr: string, size = 0.034, color = INK): DocTextBlock {
  return block('h1', [run(textStr, { bold: true, color, fontSize: size })], { align: 'left', spaceAfter: 0.006 });
}

/* ------------------------------------------------------------------ */
/* 1. Blank                                                            */
/* ------------------------------------------------------------------ */

function buildBlank(): DocState {
  return blankDoc();
}

/* ------------------------------------------------------------------ */
/* 2. Business letter                                                  */
/* ------------------------------------------------------------------ */

function buildLetter(): DocState {
  const d = blankDoc();
  d.layers.push(
    text(0.55, 0.07, 0.37, [
      block('paragraph', [run('Amira Haddad', { bold: true })], { align: 'right' }),
      block('paragraph', 'Operations Director', { align: 'right' }),
      block('paragraph', 'Northgate Trading LLC\nJAFZA One, Jebel Ali\nDubai, UAE', { align: 'right' }),
    ], { fontSize: 0.0135 }),
    text(0.08, 0.20, 0.4, [block('paragraph', '22 September 2026')], { fontSize: 0.014 }),
    text(0.08, 0.25, 0.4, [
      block('paragraph', [run('Mr. Daniel Okafor', { bold: true })]),
      block('paragraph', 'Procurement Manager'),
      block('paragraph', 'Harborline Logistics\nAbu Dhabi, UAE'),
    ], { fontSize: 0.014 }),
    text(0.08, 0.38, 0.84, [
      block('paragraph', [run('Subject: Renewal of annual supply agreement (2026–2027)', { bold: true })], { spaceAfter: 0.01 }),
      block('paragraph', 'Dear Mr. Okafor,', { spaceAfter: 0.01 }),
      block('paragraph', 'Thank you for your partnership over the past year. I am writing to confirm the renewal of our annual supply agreement for the period 1 October 2026 to 30 September 2027, under the same commercial terms we agreed in September 2025.', { spaceAfter: 0.01 }),
      block('paragraph', 'Our team has prepared the updated schedule of rates, which reflects a modest 3% adjustment in line with current logistics costs. Delivery windows, service levels, and payment terms (net 30 days) remain unchanged.', { spaceAfter: 0.01 }),
      block('paragraph', 'Please review the attached schedule at your convenience. If the terms are acceptable, kindly sign and return a copy by 30 September so we can keep deliveries running without interruption.', { spaceAfter: 0.01 }),
      block('paragraph', 'Thank you again for your continued trust. I look forward to another strong year together.', { spaceAfter: 0.02 }),
      block('paragraph', 'Warm regards,'),
      block('paragraph', [run('Amira Haddad', { bold: true })]),
      block('paragraph', 'Operations Director, Northgate Trading LLC'),
    ], { fontSize: 0.0145, lineHeight: 1.6 }),
  );
  return d;
}

/* ------------------------------------------------------------------ */
/* 3. Report                                                           */
/* ------------------------------------------------------------------ */

function buildReport(): DocState {
  const d = blankDoc();
  d.layers.push(
    makeShapeLayer({ x: 0, y: 0, w: 1, h: 0.018, kind: 'rect', fill: ACCENT, stroke: ACCENT }),
    text(0.08, 0.06, 0.84, [
      block('paragraph', [run('QUARTERLY BUSINESS REVIEW', { bold: true, color: ACCENT })], { spaceAfter: 0.004 }),
      heading('Q3 2026 Performance Report'),
      block('paragraph', 'Prepared by the Strategy Office · 22 September 2026', { spaceAfter: 0.004 }),
    ], { fontSize: 0.014 }),
    makeDividerLayer({ x: 0.08, y: 0.20, w: 0.84, color: RULE }),
    text(0.08, 0.225, 0.84, [
      block('h2', [run('Executive summary', { bold: true, color: INK })], { spaceAfter: 0.006 }),
      block('paragraph', 'Revenue grew 18% quarter over quarter to AED 4.2M, driven by enterprise contracts and a 31% increase in average deal size. Operating margin improved to 24% as automation reduced manual processing costs across fulfillment and billing.', { spaceAfter: 0.01 }),
      block('h2', [run('Key findings', { bold: true })], { spaceAfter: 0.006 }),
      block('bullet', 'Enterprise segment now accounts for 62% of total revenue, up from 48% in Q2.'),
      block('bullet', 'Customer retention reached 94%, the highest in company history.'),
      block('bullet', 'Two new partnerships in Saudi Arabia added AED 640K in pipeline.', { spaceAfter: 0.01 }),
      block('h2', [run('Outlook', { bold: true })], { spaceAfter: 0.006 }),
      block('paragraph', 'Q4 guidance is set at AED 4.8M–5.1M. The board has approved hiring six additional engineers and opening the Riyadh office in November to support regional expansion.'),
    ], { fontSize: 0.0145, lineHeight: 1.6 }),
    text(0.08, 0.93, 0.84, [block('paragraph', 'Confidential · Northgate Trading LLC', { align: 'center' })], { fontSize: 0.011, color: MUTED }),
  );
  return d;
}

/* ------------------------------------------------------------------ */
/* 4. Invoice — column-aligned item table                              */
/* ------------------------------------------------------------------ */

const INV_Y = 0.42;

function invCol(
  x: number,
  w: number,
  rows: string[],
  align: DocAlign,
  header: string,
): DocTextLayer {
  const blocks: DocTextBlock[] = [
    block('paragraph', [run(header, { bold: true, color: MUTED })], { align, spaceAfter: 0.006 }),
    ...rows.map((r) => block('paragraph', r, { align, spaceAfter: 0.004 })),
  ];
  return makeTextLayer({ x, y: INV_Y, w, h: 0.3, pageIndex: 0, blocks, fontSize: 0.014, color: INK });
}

function buildInvoice(): DocState {
  const d = blankDoc();
  d.layers.push(
    makeShapeLayer({ x: 0.08, y: 0.06, w: 0.05, h: 0.028, kind: 'rect', fill: ACCENT, stroke: ACCENT }),
    text(0.15, 0.055, 0.5, [
      heading('Northgate Trading LLC', 0.026),
      block('paragraph', 'JAFZA One, Jebel Ali, Dubai, UAE · accounts@northgate.example', { spaceAfter: 0 }),
    ], { fontSize: 0.0125, color: MUTED }),
    text(0.62, 0.055, 0.3, [
      block('paragraph', [run('INVOICE', { bold: true, color: ACCENT, fontSize: 0.028 })], { align: 'right' }),
      block('paragraph', 'INV-2026-0847', { align: 'right' }),
    ]),
    text(0.08, 0.17, 0.4, [
      block('paragraph', [run('Bill to', { bold: true, color: MUTED })], { spaceAfter: 0.004 }),
      block('paragraph', [run('Harborline Logistics', { bold: true })]),
      block('paragraph', 'Finance Department\nAbu Dhabi, UAE'),
    ], { fontSize: 0.014 }),
    text(0.6, 0.17, 0.32, [
      block('paragraph', 'Issue date: 22 Sep 2026', { align: 'right' }),
      block('paragraph', 'Due date: 22 Oct 2026', { align: 'right' }),
      block('paragraph', 'Terms: Net 30', { align: 'right' }),
    ], { fontSize: 0.014 }),
    makeDividerLayer({ x: 0.08, y: 0.33, w: 0.84, color: RULE }),
    // Item table — four aligned columns
    invCol(0.08, 0.44, ['Quarterly logistics retainer', 'Extra pallet storage (120 units)', 'Customs clearance — Jebel Ali', 'Express delivery surcharge'], 'left', 'Description'),
    invCol(0.54, 0.10, ['1', '3', '2', '4'], 'center', 'Qty'),
    invCol(0.66, 0.13, ['AED 18,000', 'AED 450', 'AED 900', 'AED 150'], 'right', 'Rate'),
    invCol(0.81, 0.11, ['AED 18,000', 'AED 1,350', 'AED 1,800', 'AED 600'], 'right', 'Amount'),
    makeDividerLayer({ x: 0.08, y: 0.66, w: 0.84, color: RULE }),
    text(0.55, 0.685, 0.37, [
      block('paragraph', 'Subtotal', { align: 'right' }),
      block('paragraph', 'VAT (5%)', { align: 'right' }),
      block('paragraph', [run('Total due', { bold: true, color: ACCENT })], { align: 'right' }),
    ], { fontSize: 0.014 }),
    text(0.78, 0.685, 0.14, [
      block('paragraph', 'AED 21,750', { align: 'right' }),
      block('paragraph', 'AED 1,087.50', { align: 'right' }),
      block('paragraph', [run('AED 22,837.50', { bold: true, color: ACCENT })], { align: 'right' }),
    ], { fontSize: 0.014 }),
    text(0.08, 0.80, 0.84, [
      block('paragraph', [run('Payment details', { bold: true })], { spaceAfter: 0.004 }),
      block('paragraph', 'Bank transfer to IBAN AE07 0331 2345 6789 0123 456 · Reference INV-2026-0847. Please pay within 30 days of the issue date.', { spaceAfter: 0.01 }),
      block('paragraph', 'Thank you for your business.', { spaceAfter: 0 }),
    ], { fontSize: 0.013, color: MUTED }),
  );
  return d;
}

/* ------------------------------------------------------------------ */
/* 5. Proposal                                                         */
/* ------------------------------------------------------------------ */

function buildProposal(): DocState {
  const d = blankDoc();
  d.layers.push(
    makeShapeLayer({ x: 0, y: 0, w: 0.035, h: 1, kind: 'rect', fill: ACCENT, stroke: ACCENT }),
    text(0.10, 0.06, 0.82, [
      block('paragraph', [run('PROPOSAL', { bold: true, color: ACCENT })], { spaceAfter: 0.004 }),
      heading('Digital Operations Overhaul'),
      block('paragraph', 'Prepared for Harborline Logistics · 22 September 2026 · Valid 30 days', { spaceAfter: 0.004 }),
    ], { fontSize: 0.014 }),
    makeDividerLayer({ x: 0.10, y: 0.215, w: 0.82, color: RULE }),
    text(0.10, 0.24, 0.82, [
      block('h2', [run('Overview', { bold: true })], { spaceAfter: 0.006 }),
      block('paragraph', 'We will modernize your order-to-cash workflow: automated invoicing, real-time shipment tracking, and a client portal that cuts support tickets by half. The engagement runs 10 weeks with a dedicated team of four.', { spaceAfter: 0.012 }),
      block('h2', [run('Scope of work', { bold: true })], { spaceAfter: 0.006 }),
      block('bullet', 'Discovery and process mapping (weeks 1–2).'),
      block('bullet', 'Automation build and systems integration (weeks 3–7).'),
      block('bullet', 'Pilot rollout, training, and handover (weeks 8–10).', { spaceAfter: 0.012 }),
      block('h2', [run('Investment', { bold: true })], { spaceAfter: 0.006 }),
      block('paragraph', 'Discovery & design — AED 24,000', { spaceAfter: 0.004 }),
      block('paragraph', 'Build & integration — AED 68,000', { spaceAfter: 0.004 }),
      block('paragraph', 'Rollout & training — AED 18,000', { spaceAfter: 0.006 }),
      block('paragraph', [run('Total — AED 110,000', { bold: true, color: ACCENT })], { spaceAfter: 0.012 }),
      block('h2', [run('Next steps', { bold: true })], { spaceAfter: 0.006 }),
      block('paragraph', 'Reply to this proposal to schedule a 45-minute walkthrough. On acceptance, we kick off within five working days.'),
    ], { fontSize: 0.0145, lineHeight: 1.6 }),
  );
  return d;
}

/* ------------------------------------------------------------------ */
/* 6. Agreement                                                        */
/* ------------------------------------------------------------------ */

function buildAgreement(): DocState {
  const d = blankDoc();
  d.layers.push(
    text(0.10, 0.06, 0.80, [
      block('paragraph', [run('SERVICE AGREEMENT', { bold: true })], { align: 'center', spaceAfter: 0.004 }),
      block('paragraph', 'Effective 1 October 2026', { align: 'center' }),
    ], { fontSize: 0.015 }),
    makeDividerLayer({ x: 0.10, y: 0.15, w: 0.80, color: ACCENT, thickness: 0.003 }),
    text(0.10, 0.175, 0.80, [
      block('paragraph', 'This agreement is between Northgate Trading LLC ("Provider") and Harborline Logistics ("Client") for the provision of logistics support services described in Schedule A.', { spaceAfter: 0.012 }),
      block('numbered', [run('Services. ', { bold: true }), run('Provider shall perform the services with reasonable skill and care, in line with industry practice.')], { spaceAfter: 0.008 }),
      block('numbered', [run('Term. ', { bold: true }), run('This agreement runs for twelve months from the effective date and renews automatically unless either party gives 30 days written notice.')], { spaceAfter: 0.008 }),
      block('numbered', [run('Fees and payment. ', { bold: true }), run('Client pays the fees in Schedule A within 30 days of invoice. Late payments accrue interest at 1% per month.')], { spaceAfter: 0.008 }),
      block('numbered', [run('Confidentiality. ', { bold: true }), run('Each party keeps the other\u2019s confidential information private and uses it only to perform this agreement.')], { spaceAfter: 0.008 }),
      block('numbered', [run('Termination. ', { bold: true }), run('Either party may terminate for material breach with 14 days written notice and opportunity to remedy.')], { spaceAfter: 0.008 }),
      block('numbered', [run('Governing law. ', { bold: true }), run('This agreement is governed by the laws of the United Arab Emirates.')], { spaceAfter: 0.02 }),
      block('paragraph', [run('Agreed and accepted:', { bold: true })], { spaceAfter: 0.03 }),
    ], { fontSize: 0.0145, lineHeight: 1.6 }),
    makeDividerLayer({ x: 0.10, y: 0.86, w: 0.34, color: INK, thickness: 0.002 }),
    makeDividerLayer({ x: 0.56, y: 0.86, w: 0.34, color: INK, thickness: 0.002 }),
    text(0.10, 0.875, 0.34, [block('paragraph', 'Provider signature · Date')]),
    text(0.56, 0.875, 0.34, [block('paragraph', 'Client signature · Date')]),
  );
  return d;
}

/* ------------------------------------------------------------------ */
/* 7. Form                                                             */
/* ------------------------------------------------------------------ */

function buildForm(): DocState {
  const d = blankDoc();
  d.layers.push(
    text(0.10, 0.06, 0.80, [
      heading('Client Onboarding Form'),
      block('paragraph', 'Please complete all fields. We will respond within two working days.', { spaceAfter: 0.004 }),
    ], { fontSize: 0.014 }),
    makeDividerLayer({ x: 0.10, y: 0.175, w: 0.80, color: RULE }),
    text(0.10, 0.20, 0.80, [block('paragraph', [run('Full name', { bold: true })])], { fontSize: 0.0135 }),
    makeDividerLayer({ x: 0.10, y: 0.235, w: 0.80, color: '#8a8478', thickness: 0.0015 }),
    text(0.10, 0.27, 0.80, [block('paragraph', [run('Work email', { bold: true })])], { fontSize: 0.0135 }),
    makeDividerLayer({ x: 0.10, y: 0.305, w: 0.80, color: '#8a8478', thickness: 0.0015 }),
    text(0.10, 0.34, 0.38, [block('paragraph', [run('Phone', { bold: true })])], { fontSize: 0.0135 }),
    makeDividerLayer({ x: 0.10, y: 0.375, w: 0.38, color: '#8a8478', thickness: 0.0015 }),
    text(0.52, 0.34, 0.38, [block('paragraph', [run('Company', { bold: true })])], { fontSize: 0.0135 }),
    makeDividerLayer({ x: 0.52, y: 0.375, w: 0.38, color: '#8a8478', thickness: 0.0015 }),
    text(0.10, 0.41, 0.80, [block('paragraph', [run('What do you need help with?', { bold: true })])], { fontSize: 0.0135 }),
    makeShapeLayer({ x: 0.10, y: 0.445, w: 0.80, h: 0.12, kind: 'rect', fill: null, stroke: '#8a8478', strokeWidth: 0.002 }),
    text(0.10, 0.59, 0.80, [block('paragraph', [run('Preferred contact method', { bold: true })])], { fontSize: 0.0135 }),
    makeShapeLayer({ x: 0.10, y: 0.625, w: 0.024, h: 0.017, kind: 'rect', fill: null, stroke: '#66615a', strokeWidth: 0.002 }),
    text(0.135, 0.622, 0.3, [block('paragraph', 'Email')]),
    makeShapeLayer({ x: 0.32, y: 0.625, w: 0.024, h: 0.017, kind: 'rect', fill: null, stroke: '#66615a', strokeWidth: 0.002 }),
    text(0.355, 0.622, 0.3, [block('paragraph', 'Phone')]),
    text(0.10, 0.70, 0.80, [
      block('paragraph', 'By submitting this form you agree to our privacy policy. We never share your details with third parties.', { spaceAfter: 0.01 }),
    ], { fontSize: 0.0125, color: MUTED }),
  );
  return d;
}

export const STUDIO_TEMPLATES: DocTemplate[] = [
  { id: 'blank', label: 'Blank document', description: 'Start from an empty A4 page.', build: buildBlank },
  { id: 'letter', label: 'Business letter', description: 'Formal letter with sender block and signature.', build: buildLetter },
  { id: 'report', label: 'Report', description: 'Quarterly review layout with summary and findings.', build: buildReport },
  { id: 'invoice', label: 'Invoice', description: 'Itemized invoice with totals and payment details.', build: buildInvoice },
  { id: 'proposal', label: 'Proposal', description: 'Client proposal with scope and investment.', build: buildProposal },
  { id: 'agreement', label: 'Agreement', description: 'Numbered-clause service agreement with signature lines.', build: buildAgreement },
  { id: 'form', label: 'Form', description: 'Client onboarding form with fields and checkboxes.', build: buildForm },
];
