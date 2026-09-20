import { getAllToolSlugs } from './tools-config';
export class InputError extends Error { constructor(public status: number, message: string) { super(message); } }
export function requireSameOrigin(req: Request) {
  const origin = req.headers.get('origin');
  if (!origin || origin !== new URL(req.url).origin || req.headers.get('sec-fetch-site') === 'cross-site') {
    throw new InputError(403, 'Origin not allowed.');
  }
}
export async function smallJson(req: Request): Promise<Record<string, unknown>> {
  if (!req.headers.get('content-type')?.startsWith('application/json')) throw new InputError(415, 'JSON required.');
  if (Number(req.headers.get('content-length')) > 4096) throw new InputError(413, 'Payload too large.');
  const reader = req.body?.getReader();
  if (!reader) throw new InputError(400, 'Body required.');
  let size = 0; const chunks: Uint8Array[] = [];
  try {
    for (;;) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 4096) { await reader.cancel(); throw new InputError(413, 'Payload too large.'); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const body = JSON.parse(new TextDecoder().decode(bytes));
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
    return body;
  } catch (error) { if (error instanceof InputError) throw error; throw new InputError(400, 'Invalid JSON.'); }
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const toolSlugs = new Set(getAllToolSlugs());
// Store known public routes only: no arbitrary path segments, filenames, queries or fragments.
const routes = new Set(['/', '/privacy', '/terms', '/Studio', '/studio', '/batch-pdf', '/pdf-to-jpg',
  '/pdf-to-images', '/jpg-to-pdf', '/merge-pdf', '/ocr-pdf', '/sign-pdf', '/edit-pdf',
  ...getAllToolSlugs().flatMap(slug => [`/${slug}`, `/tools/${slug}`])]);
export const isBot = (ua: string) => /bot|crawler|spider|slurp|bingpreview|google-inspectiontool|headless|lighthouse|pagespeed|facebookexternalhit|preview|curl|wget/i.test(ua);
function tag(value: unknown): string | null {
  // Campaign labels only; reject addresses, free text, encoded data and long identifiers.
  return typeof value === 'string' && /^[a-z0-9][a-z0-9_.-]{0,79}$/i.test(value) ? value : null;
}
export function analyticsInput(body: Record<string, unknown>, req: Request) {
  if (typeof body.sessionId !== 'string' || !uuid.test(body.sessionId) ||
      typeof body.eventId !== 'string' || !uuid.test(body.eventId)) throw new InputError(400, 'Invalid identifier.');
  if (!['page_view', 'route_change', 'tool_execution', 'heartbeat'].includes(String(body.type))) throw new InputError(400, 'Invalid event.');
  if (typeof body.path !== 'string' || !routes.has(body.path)) throw new InputError(400, 'Invalid public path.');
  if (body.type === 'tool_execution' && (typeof body.toolSlug !== 'string' || !toolSlugs.has(body.toolSlug))) throw new InputError(400, 'Invalid tool.');
  if (body.success !== undefined && typeof body.success !== 'boolean') throw new InputError(400, 'Invalid result.');
  let referrer: string | null = null;
  try { const u = new URL(String(body.referrer)); if (['https:', 'http:'].includes(u.protocol) && u.hostname !== new URL(req.url).hostname) referrer = u.hostname.slice(0, 253); } catch {}
  const ua = req.headers.get('user-agent') ?? '';
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox|FxiOS/.test(ua) ? 'Firefox' : /Chrome|CriOS/.test(ua) ? 'Chrome' : /Safari/.test(ua) ? 'Safari' : 'Other';
  const os = /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Macintosh/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'Other';
  const device = /iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua)) ? 'tablet' : /Mobile|iPhone|iPod/i.test(ua) ? 'mobile' : 'desktop';
  const country = process.env.VERCEL === '1' ? req.headers.get('x-vercel-ip-country') : null;
  return { p_session: body.sessionId, p_event: body.eventId, p_type: body.type, p_path: body.path,
    p_tool: body.type === 'tool_execution' ? body.toolSlug : null, p_success: body.type === 'tool_execution' ? body.success ?? null : null,
    p_referrer: referrer, p_source: tag(body.utmSource), p_medium: tag(body.utmMedium), p_campaign: tag(body.utmCampaign),
    p_browser: browser, p_os: os, p_device: device, p_country: country && /^[A-Z]{2}$/.test(country) ? country : null };
}
