import 'server-only';
import sitemap from '@/app/sitemap';

const HOST = 'www.pdfedit.website';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

function indexNowKey(): string {
  const key = process.env.INDEXNOW_KEY;
  if (!key || !/^[A-Za-z0-9_-]{8,128}$/.test(key)) {
    throw new Error('INDEXNOW_KEY is missing or invalid.');
  }
  return key;
}

export function getIndexNowKey(): string {
  return indexNowKey();
}

export async function submitCanonicalUrlsToIndexNow() {
  const key = indexNowKey();
  const urlList = Array.from(new Set(sitemap().map((page) => page.url))).filter((url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' && parsed.hostname === HOST;
    } catch {
      return false;
    }
  });

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key,
      keyLocation: `https://${HOST}/indexnow-key.txt`,
      urlList,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`IndexNow submission failed with status ${response.status}.`);
  }

  return { submitted: urlList.length, status: response.status };
}
