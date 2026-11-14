import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAuthOwner } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

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

  const { currentPassword, newPassword } = body || {};

  if (!currentPassword || typeof currentPassword !== 'string') {
    return NextResponse.json({ error: 'Current password is required.' }, { status: 400 });
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    return NextResponse.json(
      { error: 'New password must be at least 8 characters long.' },
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

  const matches = await bcrypt.compare(currentPassword, user.password_hash);
  if (!matches) {
    return NextResponse.json({ error: 'Incorrect current password.' }, { status: 400 });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, owner.userId);

  return NextResponse.json({
    success: true,
    message: 'Password updated successfully.',
  });
}
