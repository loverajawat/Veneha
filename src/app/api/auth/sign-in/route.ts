import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from '@/lib/auth/rateLimit';

const SIGNIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 400 });
    }

    // Rate limiting: by email and by IP
    const emailRateKey = `signin:email:${cleanEmail}`;
    const ipRateKey = `signin:ip:${ip}`;

    const emailRate = checkRateLimit(emailRateKey, MAX_FAILED_ATTEMPTS, SIGNIN_WINDOW_MS);
    const ipRate = checkRateLimit(ipRateKey, MAX_FAILED_ATTEMPTS * 2, SIGNIN_WINDOW_MS);

    if (!emailRate.allowed || !ipRate.allowed) {
      const retryAfter = Math.max(emailRate.retryAfterSeconds || 60, ipRate.retryAfterSeconds || 60);
      return NextResponse.json(
        { 
          error: `Too many sign-in attempts. Please try again in ${Math.ceil(retryAfter / 60)} minute(s).`,
          rateLimited: true,
          retryAfterSeconds: retryAfter
        }, 
        { status: 429 }
      );
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail) as any;

    if (!user) {
      recordFailedAttempt(emailRateKey, SIGNIN_WINDOW_MS);
      recordFailedAttempt(ipRateKey, SIGNIN_WINDOW_MS);
      return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      recordFailedAttempt(emailRateKey, SIGNIN_WINDOW_MS);
      recordFailedAttempt(ipRateKey, SIGNIN_WINDOW_MS);
      return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
    }

    // Success: clear rate limits
    clearRateLimit(emailRateKey);

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      display_name: user.display_name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Sign-in error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 });
  }
}

