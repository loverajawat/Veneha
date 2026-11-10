import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { GUEST_COOKIE_NAME } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const allowGuest = process.env.ALLOW_GUEST_MODE !== 'false';
    if (!allowGuest) {
      return NextResponse.json({ error: 'Guest mode is currently disabled.' }, { status: 403 });
    }

    let guestId: string | undefined;
    try {
      const body = await req.json();
      guestId = body.guestId;
    } catch {}

    if (!guestId || typeof guestId !== 'string') {
      guestId = `cadet-${crypto.randomBytes(4).toString('hex')}`;
    }

    const response = NextResponse.json({
      success: true,
      guestId,
    });

    response.cookies.set({
      name: GUEST_COOKIE_NAME,
      value: guestId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Guest route error:', error);
    return NextResponse.json({ error: 'Unable to start guest session.' }, { status: 500 });
  }
}

