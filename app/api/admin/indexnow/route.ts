import { isAdmin } from '@/lib/admin-auth';
import { submitCanonicalUrlsToIndexNow } from '@/lib/indexnow';
import { requireSameOrigin, InputError } from '@/lib/analytics-input';

export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'no-store', Vary: 'Cookie' };

  if (!await isAdmin()) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401, headers });
  }

  try {
    requireSameOrigin(request);
    const result = await submitCanonicalUrlsToIndexNow();
    return Response.json(result, { headers });
  } catch (error) {
    const status = error instanceof InputError ? error.status : 502;
    return Response.json(
      { error: error instanceof Error ? error.message : 'IndexNow submission failed.' },
      { status, headers }
    );
  }
}
