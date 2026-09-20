import { isAdmin } from '@/lib/admin-auth';
import { analyticsRpc } from '@/lib/analytics-db';
export async function GET(req: Request) {
  const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
  if (!await isAdmin()) return Response.json({ error: 'Unauthorized.' }, { status: 401, headers });
  const range = new URL(req.url).searchParams.get('range') ?? 'today';
  if (!['today', '7d', '30d'].includes(range)) return Response.json({ error: 'Invalid range.' }, { status: 400, headers });
  try { return Response.json(await analyticsRpc('analytics_dashboard', { p_days: range === 'today' ? 1 : range === '7d' ? 7 : 30 }), { headers }); }
  catch { return Response.json({ error: 'Analytics database unavailable. Check Supabase configuration and apply database/analytics.sql.' }, { status: 503, headers }); }
}
