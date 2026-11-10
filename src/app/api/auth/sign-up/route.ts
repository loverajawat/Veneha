import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDb } from '@/lib/db';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { checkRateLimit, recordFailedAttempt } from '@/lib/auth/rateLimit';

const SIGNUP_WINDOW_MS = 15 * 60 * 1000;
const MAX_SIGNUPS_PER_IP = 10;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const body = await req.json();
    const { name, email, password, ageConfirmed18Plus } = body;

    // Validate Full Name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }

    // Validate Email
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Validate Password (min 8 chars)
    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    // Validate Age confirmation and Privacy note agreement
    if (ageConfirmed18Plus !== true) {
      return NextResponse.json(
        { error: 'You must confirm that you are 18 or older and agree to the Privacy note.' },
        { status: 400 }
      );
    }

    // IP rate limit on signups
    const ipRateKey = `signup:ip:${ip}`;
    const ipRate = checkRateLimit(ipRateKey, MAX_SIGNUPS_PER_IP, SIGNUP_WINDOW_MS);
    if (!ipRate.allowed) {
      return NextResponse.json(
        { error: 'Too many accounts created from this network. Please try again later.' },
        { status: 429 }
      );
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Sign in instead.' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    const userId = `usr_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
    const now = new Date().toISOString();
    const displayName = name.trim();

    db.prepare(`
      INSERT INTO users (id, email, password_hash, display_name, created_at, terms_accepted_at, age_confirmed_18_plus)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(userId, cleanEmail, passwordHash, displayName, now, now);

    recordFailedAttempt(ipRateKey, SIGNUP_WINDOW_MS);

    // Create session token
    const token = await createSessionToken({
      id: userId,
      email: cleanEmail,
      display_name: displayName,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: cleanEmail,
        displayName: displayName,
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
    console.error('Sign-up error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 });
  }
}

