import { analyticsRpc } from '@/lib/analytics-db';
import { analyticsInput, InputError, isBot, requireSameOrigin, smallJson } from '@/lib/analytics-input';
export async function POST(req: Request) {
  try {
    requireSameOrigin(req);
    if (isBot(req.headers.get('user-agent') ?? '')) return new Response(null, { status: 204 });
    const payload = analyticsInput(await smallJson(req), req);
    const accepted = await analyticsRpc<boolean>('analytics_ingest', payload);
    return new Response(null, { status: accepted ? 204 : 429 });
  } catch (error) {
    return Response.json({ error: error instanceof InputError ? error.message : 'Analytics unavailable.' },
      { status: error instanceof InputError ? error.status : 503 });
  }
}
