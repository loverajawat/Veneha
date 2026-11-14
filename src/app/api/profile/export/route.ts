import { NextRequest, NextResponse } from 'next/server';
import { getAuthOwner } from '@/lib/auth/session';
import { getFullProfile } from '@/lib/profile/db';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const owner = await getAuthOwner(req);

  if (owner.type !== 'user') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = getFullProfile(owner.userId);
  const db = getDb();

  const attempts = db
    .prepare('SELECT id, picture_id, date, score, overall_score, ppdt_verdict, transcript FROM attempts WHERE user_id = ? ORDER BY date DESC')
    .all(owner.userId);

  const watAttempts = db
    .prepare('SELECT id, set_id, created_at, overall_score, status, responses_json FROM wat_attempts WHERE user_id = ? ORDER BY created_at DESC')
    .all(owner.userId)
    .map((w: any) => ({
      ...w,
      responses: w.responses_json ? JSON.parse(w.responses_json) : [],
    }));

  const exportData = {
    exportedAt: new Date().toISOString(),
    profile,
    ppdtAttempts: attempts,
    watAttempts,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="veneha-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
