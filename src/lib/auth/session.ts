import { SignJWT, jwtVerify } from 'jose';
import { cookies, headers } from 'next/headers';
import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { AuthOwner, DbUser, SessionPayload, UserProfile } from './types';

export const SESSION_COOKIE_NAME = 'veneha_session';
export const GUEST_COOKIE_NAME = 'veneha_guest';
const SESSION_EXPIRATION_DAYS = 30;

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || 'veneha_default_development_secret_key_minimum_32_chars';
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: { id: string; email: string; display_name: string }): Promise<string> {
  const secret = getAuthSecret();
  return await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.display_name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_EXPIRATION_DAYS}d`)
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getAuthSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Returns the current authenticated owner (User or Guest) strictly derived server-side.
 * Works inside Next.js Route Handlers and Server Components.
 */
export async function getAuthOwner(req?: NextRequest): Promise<AuthOwner> {
  let sessionToken: string | undefined;
  let guestId: string | undefined;

  if (req) {
    sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    guestId = req.cookies.get(GUEST_COOKIE_NAME)?.value || req.headers.get('x-guest-id') || undefined;
  } else {
    try {
      const cookieStore = await cookies();
      sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
      guestId = cookieStore.get(GUEST_COOKIE_NAME)?.value;
      if (!guestId) {
        const headerStore = await headers();
        guestId = headerStore.get('x-guest-id') || undefined;
      }
    } catch {
      // In non-request contexts or static generation
      return { type: 'anonymous' };
    }
  }

  // 1. Check user session
  if (sessionToken) {
    const payload = await verifySessionToken(sessionToken);
    if (payload && payload.sub) {
      const db = getDb();
      const user = db.prepare('SELECT id, email, display_name, created_at FROM users WHERE id = ?').get(payload.sub) as
        | { id: string; email: string; display_name: string; created_at: string }
        | undefined;

      if (user) {
        return {
          type: 'user',
          userId: user.id,
          user: {
            id: user.id,
            email: user.email,
            displayName: user.display_name,
            createdAt: user.created_at,
          },
        };
      }
    }
  }

  // 2. Check guest mode (if allowed)
  const allowGuest = process.env.ALLOW_GUEST_MODE !== 'false';
  if (allowGuest && guestId && guestId.trim().length > 0) {
    return {
      type: 'guest',
      guestId: guestId.trim(),
    };
  }

  return { type: 'anonymous' };
}

