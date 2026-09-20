// Anonymous browser telemetry. Failures never escape into tool code.
const SESSION_KEY = 'novakit.analytics.session';
let ephemeralId: string | undefined;
let lastNavigation: string | undefined;
export function getOrCreateVisitorId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(SESSION_KEY, id); }
    return id;
  } catch { return ephemeralId ??= crypto.randomUUID(); }
}
function send(type: string, toolSlug?: string, success?: boolean) {
  if (typeof window === 'undefined' || location.pathname.startsWith('/admin')) return;
  try {
    const params = new URLSearchParams(location.search);
    let referrer = '';
    try { const url = new URL(document.referrer); referrer = url.origin; } catch {}
    const campaign = (key: string) => { const value = params.get(key); return value && /^[a-z0-9][a-z0-9_.-]{0,79}$/i.test(value) ? value : null; };
    const body = JSON.stringify({ sessionId: getOrCreateVisitorId(), eventId: crypto.randomUUID(),
      type, path: location.pathname, referrer,
      utmSource: campaign('utm_source'), utmMedium: campaign('utm_medium'),
      utmCampaign: campaign('utm_campaign'), toolSlug, success });
    void fetch('/api/analytics/event', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body, referrerPolicy: 'no-referrer', keepalive: true, credentials: 'same-origin' }).catch(() => {});
  } catch { /* Storage/network restrictions must not affect the website. */ }
}
export function trackNavigation() {
  const navigation = location.pathname + location.search;
  if (navigation === lastNavigation) return;
  const type = lastNavigation === undefined ? 'page_view' : 'route_change';
  lastNavigation = navigation;
  send(type);
}
export function trackHeartbeat() { send('heartbeat'); }
export function trackToolExecution(toolSlug: string, success?: boolean): void {
  send('tool_execution', toolSlug, success);
}
