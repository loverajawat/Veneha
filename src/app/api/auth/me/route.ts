import { NextRequest, NextResponse } from 'next/server';
import { getAuthOwner } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const owner = await getAuthOwner(req);
  const allowGuestMode = process.env.ALLOW_GUEST_MODE !== 'false';
  return NextResponse.json({
    owner,
    allowGuestMode,
  });
}

