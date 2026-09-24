import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * i18n pilot (branch blitz/i18n).
 *
 * The root layout (app/layout.tsx) hard-codes <html lang="en"> and is owned
 * by another track — it must not be edited. This proxy rewrites the <html>
 * tag server-side for the translated routes so crawlers and assistive tech
 * see the correct language:
 *   /es/* -> <html lang="es" ...>
 *   /ar/* -> <html lang="ar" dir="rtl" ...>
 *
 * Implementation: fetch the rendered page internally (guarded by the
 * x-i18n-rewrite header to avoid a loop), transform only text/html
 * responses, and stream the result back. The matcher scopes this to the
 * pilot routes only — every other route is untouched.
 */

const LOCALE_ATTRS: Record<string, string> = {
  es: 'lang="es"',
  ar: 'lang="ar" dir="rtl"',
};

const REWRITE_GUARD = 'x-i18n-rewrite';

export async function proxy(request: NextRequest) {
  // Inner fetch (see below) carries the guard header: let it through.
  if (request.headers.get(REWRITE_GUARD)) {
    return NextResponse.next();
  }

  const prefix = request.nextUrl.pathname.split('/')[1];
  const attrs = LOCALE_ATTRS[prefix];
  if (!attrs) {
    return NextResponse.next();
  }

  const upstream = await fetch(request.nextUrl.toString(), {
    headers: { ...Object.fromEntries(request.headers), [REWRITE_GUARD]: '1' },
  });

  const contentType = upstream.headers.get('content-type') ?? '';
  if (!contentType.includes('text/html')) {
    return upstream;
  }

  const html = await upstream.text();
  const rewritten = html.replace(/<html([^>]*)>/, (_match, innerAttrs: string) => {
    const cleaned = innerAttrs
      .replace(/\slang="[^"]*"/, '')
      .replace(/\sdir="[^"]*"/, '');
    return `<html${cleaned} ${attrs}>`;
  });

  const headers = new Headers(upstream.headers);
  // Body changed: drop stale framing headers so the runtime re-computes them.
  headers.delete('content-length');
  headers.delete('content-encoding');

  return new Response(rewritten, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}

export const config = {
  matcher: ['/es/:path*', '/ar/:path*'],
};
