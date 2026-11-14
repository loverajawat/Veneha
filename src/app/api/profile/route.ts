import { NextRequest, NextResponse } from 'next/server';
import { getAuthOwner } from '@/lib/auth/session';
import { getFullProfile, updateProfile, getUserPracticeStats } from '@/lib/profile/db';
import { validateProfileInput } from '@/lib/profile/validation';

export async function GET(req: NextRequest) {
  const owner = await getAuthOwner(req);

  if (owner.type !== 'user') {
    return NextResponse.json(
      { error: 'Authentication required. Profiles are available for signed-in accounts.' },
      { status: 401 }
    );
  }

  const profile = getFullProfile(owner.userId);
  if (!profile) {
    return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
  }

  const stats = getUserPracticeStats(owner.userId);

  return NextResponse.json({ profile, stats });
}

export async function PATCH(req: NextRequest) {
  const owner = await getAuthOwner(req);

  if (owner.type !== 'user') {
    return NextResponse.json(
      { error: 'Authentication required. Profiles are available for signed-in accounts.' },
      { status: 401 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const { isValid, errors, data } = validateProfileInput(body);

  if (!isValid) {
    return NextResponse.json(
      { error: 'Validation failed', errors },
      { status: 422 }
    );
  }

  const updated = updateProfile(owner.userId, data);
  if (!updated) {
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    profile: updated,
  });
}
