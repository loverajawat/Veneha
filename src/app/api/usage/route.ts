import { NextRequest, NextResponse } from 'next/server';
import { getAuthOwner } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function GET(req: NextRequest) {
  try {
    const owner = await getAuthOwner(req);
    const searchParams = req.nextUrl.searchParams;
    const usageType = searchParams.get('type') === 'wat' ? 'wat' : 'ppdt';
    const limitVal = usageType === 'wat' ? 2 : 5;
    const today = getTodayString();

    if (owner.type === 'anonymous') {
      return NextResponse.json({ date: today, count: 0, limit: limitVal });
    }

    const db = getDb();
    let row: any;

    if (owner.type === 'user') {
      row = db.prepare(`
        SELECT count, limit_val FROM daily_usage 
        WHERE user_id = ? AND usage_type = ? AND date = ?
      `).get(owner.userId, usageType, today);
    } else {
      row = db.prepare(`
        SELECT count, limit_val FROM daily_usage 
        WHERE guest_id = ? AND usage_type = ? AND date = ?
      `).get(owner.guestId, usageType, today);
    }

    return NextResponse.json({
      date: today,
      count: row ? row.count : 0,
      limit: row ? row.limit_val : limitVal,
    });
  } catch (error: any) {
    console.error('Fetch usage error:', error);
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const owner = await getAuthOwner(req);
    if (owner.type === 'anonymous') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const usageType = searchParams.get('type') === 'wat' ? 'wat' : 'ppdt';
    const limitVal = usageType === 'wat' ? 2 : 5;
    const today = getTodayString();
    const id = `${owner.type === 'user' ? owner.userId : owner.guestId}_${usageType}_${today}`;
    const db = getDb();

    if (owner.type === 'user') {
      db.prepare(`
        INSERT INTO daily_usage (id, user_id, guest_id, usage_type, date, count, limit_val)
        VALUES (?, ?, NULL, ?, ?, 1, ?)
        ON CONFLICT(id) DO UPDATE SET count = count + 1
      `).run(id, owner.userId, usageType, today, limitVal);
    } else {
      db.prepare(`
        INSERT INTO daily_usage (id, user_id, guest_id, usage_type, date, count, limit_val)
        VALUES (?, NULL, ?, ?, ?, 1, ?)
        ON CONFLICT(id) DO UPDATE SET count = count + 1
      `).run(id, owner.guestId, usageType, today, limitVal);
    }

    const row = db.prepare(`
      SELECT count, limit_val FROM daily_usage WHERE id = ?
    `).get(id) as any;

    return NextResponse.json({
      date: today,
      count: row ? row.count : 1,
      limit: row ? row.limit_val : limitVal,
    });
  } catch (error: any) {
    console.error('Increment usage error:', error);
    return NextResponse.json({ error: 'Failed to increment usage' }, { status: 500 });
  }
}

