'use client';

/**
 * PDFEdit CV Builder — live on-screen preview.
 *
 * Renders the same CvDocument the PDF exporter draws, as HTML/CSS on a
 * scaled A4 canvas. Uses the --pe-* tokens for the editor chrome (light/dark
 * aware); the paper itself stays white like a real document.
 */
import type { CvDocument, CvSection } from '@/lib/cv/types';
import { cvCssFont, getTemplate } from '@/lib/cv/templates';

const PX_PER_PT = 96 / 72; // css px per PDF point at scale 1

interface Props {
  cv: CvDocument;
  scale?: number;
}

function ContactLine({ cv, color, small }: { cv: CvDocument; color: string; small: number }) {
  const p = cv.personal;
  const parts = [p.email, p.phone, p.location, p.website, p.linkedin].filter(Boolean);
  if (!parts.length) return null;
  return (
    <div style={{ color, fontSize: `${small}px`, lineHeight: 1.5 }}>
      {parts.join('  •  ')}
    </div>
  );
}

function SectionTitle({ title, cv }: { title: string; cv: CvDocument }) {
  const tpl = getTemplate(cv.design.templateId);
  const fs = cv.design.fontScale;
  const accent = cv.design.accentColor || tpl.accent;
  const size = tpl.sectionTitleSize * fs * PX_PER_PT;
  const common: React.CSSProperties = {
    fontFamily: cvCssFont(tpl.fontHeading),
    fontWeight: 700,
    fontSize: `${size}px`,
    color: tpl.headingColor,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    margin: '0 0 8px 0',
  };
  if (tpl.sectionTitle === 'rule') {
    return (
      <div style={{ ...common, borderBottom: `1.5px solid ${accent}`, paddingBottom: 4 }}>{title}</div>
    );
  }
  if (tpl.sectionTitle === 'accent-bar') {
    return (
      <div style={{ ...common, borderLeft: `4px solid ${accent}`, paddingLeft: 10 }}>{title}</div>
    );
  }
  if (tpl.sectionTitle === 'boxed') {
    return (
      <div style={{ marginBottom: 8 }}>
        <span style={{ ...common, margin: 0, background: accent, color: '#fff', padding: '4px 10px', display: 'inline-block' }}>
          {title}
        </span>
      </div>
    );
  }
  return (
    <div style={{ ...common, borderBottom: '1px solid #D1D5DB', paddingBottom: 4 }}>{title}</div>
  );
}

function EntryDate({ date, color, size }: { date: string; color: string; size: number }) {
  if (!date) return null;
  return <span style={{ color, fontSize: `${size}px`, whiteSpace: 'nowrap' }}>{date}</span>;
}

function SectionBody({ section, cv }: { section: CvSection; cv: CvDocument }) {
  const tpl = getTemplate(cv.design.templateId);
  const fs = cv.design.fontScale;
  const bodyPx = tpl.bodySize * fs * PX_PER_PT;
  const smallPx = tpl.smallSize * fs * PX_PER_PT;
  const lh = cv.design.lineSpacing;
  const body: React.CSSProperties = {
    fontFamily: cvCssFont(tpl.fontBody),
    fontSize: `${bodyPx}px`,
    lineHeight: lh,
    color: tpl.bodyColor,
  };
  const muted: React.CSSProperties = { ...body, fontSize: `${smallPx}px`, color: tpl.mutedColor };

  switch (section.type) {
    case 'summary':
      return <p style={{ ...body, margin: '0 0 4px 0', whiteSpace: 'pre-wrap' }}>{section.body}</p>;
    case 'experience':
      return (
        <div>
          {section.items.map((raw) => {
            const it = raw as { id: string; role: string; company: string; location: string; startDate: string; endDate: string; current: boolean; bullets: string[] };
            const date = [it.startDate, it.current ? 'Present' : it.endDate].filter(Boolean).join(' – ');
            return (
              <div key={it.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ ...body, fontWeight: 700, margin: 0 }}>{it.role}</div>
                  <EntryDate date={date} color={tpl.mutedColor} size={smallPx} />
                </div>
                <div style={{ ...muted, fontStyle: 'italic', margin: '1px 0 3px 0' }}>
                  {[it.company, it.location].filter(Boolean).join(', ')}
                </div>
                <ul style={{ margin: '2px 0 0 0', paddingLeft: 16, ...body }}>
                  {(it.bullets ?? []).filter(Boolean).map((b, i) => (
                    <li key={i} style={{ marginBottom: 2 }}>{b}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      );
    case 'education':
      return (
        <div>
          {section.items.map((raw) => {
            const it = raw as { id: string; degree: string; school: string; location: string; startDate: string; endDate: string; details: string };
            const date = [it.startDate, it.endDate].filter(Boolean).join(' – ');
            return (
              <div key={it.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ ...body, fontWeight: 700, margin: 0 }}>{it.degree}</div>
                  <EntryDate date={date} color={tpl.mutedColor} size={smallPx} />
                </div>
                <div style={{ ...muted, fontStyle: 'italic', margin: '1px 0 2px 0' }}>
                  {[it.school, it.location].filter(Boolean).join(', ')}
                </div>
                {it.details ? <div style={body}>{it.details}</div> : null}
              </div>
            );
          })}
        </div>
      );
    case 'skills': {
      const names = section.items
        .map((r) => (r as { name?: string; title?: string }).name ?? (r as { title?: string }).title ?? '')
        .filter(Boolean);
      if (tpl.atsSafe) return <p style={{ ...body, margin: 0 }}>{names.join(', ')}</p>;
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {names.map((n, i) => (
            <span key={i} style={{ ...body, fontSize: `${smallPx}px`, background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 999, padding: '3px 10px' }}>
              {n}
            </span>
          ))}
        </div>
      );
    }
    case 'references':
      return (
        <p style={{ ...body, fontStyle: 'italic', color: tpl.mutedColor, margin: 0 }}>
          {section.body.trim() || 'Available upon request.'}
        </p>
      );
    case 'custom':
      return section.body.trim() ? (
        <p style={{ ...body, margin: 0, whiteSpace: 'pre-wrap' }}>{section.body}</p>
      ) : (
        <SimpleList items={section.items} cv={cv} rightDate />
      );
    default:
      return <SimpleList items={section.items} cv={cv} rightDate={section.type !== 'languages' && section.type !== 'interests'} />;
  }
}

function SimpleList({ items, cv, rightDate }: { items: CvSection['items']; cv: CvDocument; rightDate: boolean }) {
  const tpl = getTemplate(cv.design.templateId);
  const fs = cv.design.fontScale;
  const bodyPx = tpl.bodySize * fs * PX_PER_PT;
  const smallPx = tpl.smallSize * fs * PX_PER_PT;
  const body: React.CSSProperties = { fontFamily: cvCssFont(tpl.fontBody), fontSize: `${bodyPx}px`, lineHeight: cv.design.lineSpacing, color: tpl.bodyColor };
  return (
    <div>
      {items.map((raw) => {
        const it = raw as { id: string; title: string; subtitle: string; date: string; description: string };
        if (!it.title && !it.description) return null;
        return (
          <div key={it.id} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ ...body, fontWeight: 700, margin: 0 }}>{it.title}</div>
              {rightDate ? <EntryDate date={it.date} color={tpl.mutedColor} size={smallPx} /> : null}
            </div>
            {[it.subtitle, !rightDate && it.date ? it.date : ''].filter(Boolean).length ? (
              <div style={{ ...body, fontSize: `${smallPx}px`, color: tpl.mutedColor, margin: '1px 0 2px 0' }}>
                {[it.subtitle, !rightDate ? it.date : ''].filter(Boolean).join('  •  ')}
              </div>
            ) : null}
            {it.description ? <div style={body}>{it.description}</div> : null}
          </div>
        );
      })}
    </div>
  );
}

function Photo({ cv, size }: { cv: CvDocument; size: number }) {
  if (!cv.design.showPhoto || !cv.personal.photoDataUrl) return null;
  return (
    <img
      src={cv.personal.photoDataUrl}
      alt="Profile"
      style={{ width: size, height: size, objectFit: 'cover', borderRadius: '50%' }}
    />
  );
}

export function CvPreview({ cv, scale = 1 }: Props) {
  const tpl = getTemplate(cv.design.templateId);
  const fs = cv.design.fontScale;
  const accent = cv.design.accentColor || tpl.accent;
  const marginPt = cv.design.marginPt;
  const marginPx = marginPt * PX_PER_PT * scale;
  const pageW = 595.28 * PX_PER_PT * scale;
  const pageH = 841.89 * PX_PER_PT * scale;
  const p = cv.personal;
  const sections = cv.sections.filter((s) => s.visible);
  const namePx = tpl.nameSize * fs * PX_PER_PT * scale;
  const titlePx = tpl.titleSize * fs * PX_PER_PT * scale;
  const smallPx = tpl.smallSize * fs * PX_PER_PT * scale;

  const headerCentered = tpl.header === 'centered';
  const bandHeader = tpl.header === 'band';
  const nameColor = bandHeader && tpl.headerBg !== '#FFFFFF' ? '#FFFFFF' : tpl.headingColor;
  const subColor = bandHeader && tpl.headerBg !== '#FFFFFF' ? '#FFFFFF' : tpl.mutedColor;

  const renderSections = (list: CvSection[]) =>
    list.map((s) => {
      if (s.type === 'summary' && !s.body.trim()) return null;
      if (s.type !== 'summary' && s.type !== 'references' && s.type !== 'custom' && !s.items.length && !s.body.trim()) return null;
      return (
        <div key={s.id} style={{ marginBottom: 14 * scale }}>
          <SectionTitle title={s.title} cv={cv} />
          <SectionBody section={s} cv={cv} />
        </div>
      );
    });

  let body: React.ReactNode;
  if (tpl.layout === 'sidebar') {
    const side = sections.filter((s) => tpl.sidebarSections.includes(s.type));
    const main = sections.filter((s) => !tpl.sidebarSections.includes(s.type));
    const sbW = `${tpl.sidebarWidth * 100}%`;
    body = (
      <div style={{ display: 'flex', minHeight: '100%' }}>
        <div style={{ width: sbW, background: tpl.sidebarBg, padding: `${marginPx}px ${14 * scale}px`, color: tpl.sidebarText }}>
          <Photo cv={cv} size={92 * scale} />
          <div style={{ height: 10 * scale }} />
          <div style={{ fontFamily: cvCssFont(tpl.fontHeading), fontWeight: 700, fontSize: `${namePx * 0.85}px`, color: tpl.sidebarText, lineHeight: 1.2 }}>
            {p.fullName || 'Your Name'}
          </div>
          {p.title ? <div style={{ fontSize: `${titlePx * 0.9}px`, fontStyle: 'italic', color: tpl.sidebarText, opacity: 0.85, marginTop: 4 }}>{p.title}</div> : null}
          <div style={{ height: 8 * scale }} />
          <ContactLine cv={cv} color={tpl.sidebarText} small={smallPx * 0.92} />
          <div style={{ height: 12 * scale }} />
          {side.map((s) => (
            <div key={s.id} style={{ marginBottom: 12 * scale }}>
              <div style={{ fontFamily: cvCssFont(tpl.fontHeading), fontWeight: 700, fontSize: `${tpl.sectionTitleSize * fs * PX_PER_PT * scale}px`, textTransform: 'uppercase', letterSpacing: '0.06em', color: tpl.sidebarText, marginBottom: 6 }}>{s.title}</div>
              <div style={{ color: tpl.sidebarText }}>
                <SectionBody section={{ ...s, title: s.title }} cv={{ ...cv, design: { ...cv.design } }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: `${marginPx}px ${marginPx}px` }}>
          {renderSections(main)}
        </div>
      </div>
    );
    // NOTE: sidebar body text inherits sidebar colors via wrapper; SectionBody uses tpl colors,
    // so we pass a template-colored override below for side sections.
  } else {
    body = (
      <div style={{ padding: bandHeader ? `0 ${marginPx}px ${marginPx}px ${marginPx}px` : `${marginPx}px` }}>
        {bandHeader ? null : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 * scale, textAlign: headerCentered ? 'center' : 'left' } as React.CSSProperties}>
            <div style={{ flex: 1, textAlign: headerCentered ? 'center' : 'left' }}>
              <div style={{ fontFamily: cvCssFont(tpl.fontHeading), fontWeight: 700, fontSize: `${namePx}px`, color: tpl.headingColor, lineHeight: 1.15 }}>
                {p.fullName || 'Your Name'}
              </div>
              {p.title ? <div style={{ fontSize: `${titlePx}px`, fontStyle: 'italic', color: accent, marginTop: 2 }}>{p.title}</div> : null}
              <div style={{ marginTop: 6 }}>
                <ContactLine cv={cv} color={tpl.mutedColor} small={smallPx} />
              </div>
            </div>
            {tpl.header === 'left' ? <Photo cv={cv} size={84 * scale} /> : null}
          </div>
        )}
        {renderSections(sections)}
      </div>
    );
  }

  return (
    <div
      style={{
        width: pageW,
        minHeight: pageH,
        background: '#FFFFFF',
        color: tpl.bodyColor,
        boxShadow: '0 12px 48px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.18)',
        borderRadius: 2,
        overflow: 'hidden',
        fontFamily: cvCssFont(tpl.fontBody),
      }}
    >
      {bandHeader ? (
        <div style={{ background: tpl.headerBg, padding: `${20 * scale}px ${marginPx}px`, textAlign: 'center', marginBottom: 6 * scale }}>
          <div style={{ fontFamily: cvCssFont(tpl.fontHeading), fontWeight: 700, fontSize: `${namePx}px`, color: nameColor, lineHeight: 1.15 }}>
            {p.fullName || 'Your Name'}
          </div>
          {p.title ? <div style={{ fontSize: `${titlePx}px`, color: subColor, marginTop: 4 }}>{p.title}</div> : null}
          <div style={{ marginTop: 8 }}>
            <ContactLine cv={cv} color={subColor} small={smallPx} />
          </div>
          {cv.design.showPhoto && p.photoDataUrl ? (
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
              <Photo cv={cv} size={76 * scale} />
            </div>
          ) : null}
        </div>
      ) : null}
      {body}
    </div>
  );
}
