import 'server-only';
export async function analyticsRpc<T>(name: string, payload: Record<string, unknown>): Promise<T> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Analytics database is not configured.');
  const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/${name}`, {
    method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload), cache: 'no-store', signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error('Analytics database is unavailable. Check schema and server configuration.');
  return response.json() as Promise<T>;
}
