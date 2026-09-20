import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminConfigured, adminCookieOptions, adminPassword, equalSecret, issueAdminSession } from '@/lib/admin-auth';
import { analyticsRpc } from '@/lib/analytics-db';
import { InputError, requireSameOrigin, smallJson } from '@/lib/analytics-input';
export async function POST(req: Request) {
  try {
    requireSameOrigin(req);
    const body = await smallJson(req);
    if (!adminConfigured()) return NextResponse.json({ error: 'Set ADMIN_PASS and ADMIN_SESSION_SECRET on the server.' }, { status: 503 });
    if (typeof body.passcode !== 'string' || body.passcode.length > 256) throw new InputError(400, 'Invalid passcode.');
    // A persistent, global attempt budget works across serverless instances without storing IPs.
    if (!await analyticsRpc<boolean>('analytics_admin_attempt', {})) return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
    if (!equalSecret(body.passcode, adminPassword()!)) return NextResponse.json({ error: 'Incorrect passcode.' }, { status: 401 });
    const response = NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.set(ADMIN_COOKIE, issueAdminSession(), adminCookieOptions);
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof InputError ? error.message : 'Admin storage unavailable. Complete database setup.' }, { status: error instanceof InputError ? error.status : 503 });
  }
}
export async function DELETE(req: Request) {
  try { requireSameOrigin(req); } catch { return new Response(null, { status: 403 }); }
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, '', { ...adminCookieOptions, maxAge: 0 });
  return response;
}
