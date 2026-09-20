import { getIndexNowKey } from '@/lib/indexnow';

export const dynamic = 'force-dynamic';

export function GET() {
  try {
    const key = getIndexNowKey();
    return new Response(`${key}\n`, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
