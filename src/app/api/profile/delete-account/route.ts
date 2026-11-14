import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAuthOwner, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { getDb } from '@/lib/db';
import { deleteUserAccountAndData } from '@/lib/profile/db';

export async function POST(req: NextRequest) {
  const owner = await getAuthOwner(req);

  if (owner.type !== 'user') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const { password, confirmWord } = body || {};

  if (confirmWord !== 'DELETE') {
    return NextResponse.json(
      { error: 'Please type the word DELETE exactly to confirm.' },
      { status: 400 }
    );
  }

  if (!password || typeof password !== 'string') {
    return NextResponse.json(
      { error: 'Password is required to delete your account.' },
      { status: 400 }
    );
  }

  const db = getDb();
  const user = db
    .prepare('SELECT password_hash FROM users WHERE id = ?')
    .get(owner.userId) as { password_hash: string } | undefined;

  if (!user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 400 });
  }

  // Delete all user data and avatar
  deleteUserAccountAndData(owner.userId);

  // Clear session cookie
  const res = NextResponse.json({
    success: true,
    message: 'Account deleted successfully.',
  });

  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    path: '/',
    maxAge: 0,
  });

  return res;
}
