import { isAdmin } from '@/lib/admin-auth';
import { analyticsRpc } from '@/lib/analytics-db';
export async function GET(req: Request) {
  const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
  if (!await isAdmin()) return Response.json({ error: 'Unauthorized.' }, { status: 401, headers });
  const params = new URL(req.url).searchParams;
  const range = params.get('range') ?? 'today';
  const ranges = ['today', 'yesterday', '7d', '30d', 'this_month', 'last_month', 'all', 'custom'];
  const date = (value: string | null) => value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
  const clock = (value: string | null) => value && /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : null;
  const page = Number(params.get('historyPage') || '1');
  const pageSize = Number(params.get('historySize') || '25');
  if (!ranges.includes(range) || !Number.isInteger(page) || page < 1 || page > 100000 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) return Response.json({ error: 'Invalid analytics filters.' }, { status: 400, headers });
  const startDate = date(params.get('startDate')); const endDate = date(params.get('endDate'));
  const fromTime = clock(params.get('fromTime')); const toTime = clock(params.get('toTime'));
  if (range === 'custom' && (!startDate || !endDate)) return Response.json({ error: 'Custom ranges require start and end dates.' }, { status: 400, headers });
  if ((fromTime || toTime) && !['today', 'yesterday'].includes(range)) return Response.json({ error: 'Time filters are available for one-day ranges.' }, { status: 400, headers });
  try {
    return Response.json(await analyticsRpc('analytics_dashboard_filtered', {
      p_range: range, p_start_date: startDate, p_end_date: endDate, p_from_time: fromTime, p_to_time: toTime,
      p_country: params.get('country') || null, p_device: params.get('device') || null,
      p_source: params.get('source') || null, p_page: params.get('page') || null,
      p_history_page: page, p_history_size: pageSize,
    }), { headers });
  }
  catch { return Response.json({ error: 'Analytics database unavailable. Check Supabase configuration and apply database/analytics.sql.' }, { status: 503, headers }); }
}
