import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const passcode = typeof body?.passcode === 'string' ? body.passcode.trim() : '';

    // Server-side environment variable only - never exposed to client bundles
    const serverPasscode =
      process.env.ADMIN_PASS ||
      process.env.ADMIN_PASSCODE ||
      process.env.ADMIN_PASSWORD ||
      process.env.NEXT_PUBLIC_ADMIN_PASS;

    if (!serverPasscode) {
      return NextResponse.json(
        { success: false, error: 'Admin passcode is not configured on the server.' },
        { status: 500 }
      );
    }

    if (passcode && passcode === serverPasscode.trim()) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Incorrect admin passcode. Please verify your credentials.' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Authentication verification failed.' },
      { status: 500 }
    );
  }
}
