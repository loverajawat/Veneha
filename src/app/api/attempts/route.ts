import { NextRequest, NextResponse } from 'next/server';
import { getAuthOwner } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const owner = await getAuthOwner(req);
    if (owner.type === 'anonymous') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    let rows: any[] = [];

    if (owner.type === 'user') {
      rows = db.prepare(`
        SELECT * FROM attempts 
        WHERE user_id = ? 
        ORDER BY date DESC
      `).all(owner.userId);
    } else {
      rows = db.prepare(`
        SELECT * FROM attempts 
        WHERE guest_id = ? 
        ORDER BY date DESC
      `).all(owner.guestId);
    }

    const attempts = rows.map((r) => ({
      id: r.id,
      guestId: r.guest_id || '',
      userId: r.user_id || undefined,
      pictureId: r.picture_id,
      picturePath: r.picture_path,
      date: r.date,
      transcript: r.transcript,
      ai_transcript: r.ai_transcript,
      confirmed_transcript: r.confirmed_transcript,
      box_and_heading: r.box_and_heading,
      word_edit_rate: r.word_edit_rate,
      unclear_count: r.unclear_count,
      feedback: r.feedback_json ? JSON.parse(r.feedback_json) : null,
      score: r.score,
      overall_score: r.overall_score,
      ppdt_verdict: r.ppdt_verdict,
      assessment_prompt_version: r.assessment_prompt_version,
      assessment_prompt_hash: r.assessment_prompt_hash,
      assessment_model: r.assessment_model,
      story_word_count: r.story_word_count,
      student_concern: r.student_concern,
      assessment_json: r.assessment_json ? JSON.parse(r.assessment_json) : null,
    }));

    return NextResponse.json({ attempts });
  } catch (error: any) {
    console.error('Fetch attempts error:', error);
    return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const owner = await getAuthOwner(req);
    if (owner.type === 'anonymous') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { attempt } = body;

    if (!attempt || !attempt.id || !attempt.pictureId) {
      return NextResponse.json({ error: 'Invalid attempt data' }, { status: 400 });
    }

    const db = getDb();
    const userId = owner.type === 'user' ? owner.userId : null;
    const guestId = owner.type === 'guest' ? owner.guestId : null;

    db.prepare(`
      INSERT OR REPLACE INTO attempts (
        id, user_id, guest_id, picture_id, picture_path, date,
        transcript, ai_transcript, confirmed_transcript, box_and_heading,
        word_edit_rate, unclear_count, feedback_json, score, overall_score,
        ppdt_verdict, assessment_prompt_version, assessment_prompt_hash,
        assessment_model, story_word_count, student_concern, assessment_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      attempt.id,
      userId,
      guestId,
      attempt.pictureId,
      attempt.picturePath || '',
      attempt.date || new Date().toISOString(),
      attempt.transcript || '',
      attempt.ai_transcript || null,
      attempt.confirmed_transcript || null,
      attempt.box_and_heading || null,
      attempt.word_edit_rate || null,
      attempt.unclear_count || null,
      typeof attempt.feedback === 'object' ? JSON.stringify(attempt.feedback) : attempt.feedback || null,
      attempt.score || 0,
      attempt.overall_score || null,
      attempt.ppdt_verdict || null,
      attempt.assessment_prompt_version || null,
      attempt.assessment_prompt_hash || null,
      attempt.assessment_model || null,
      attempt.story_word_count || null,
      attempt.student_concern || null,
      typeof attempt.assessment_json === 'object' ? JSON.stringify(attempt.assessment_json) : attempt.assessment_json || null
    );

    return NextResponse.json({ success: true, id: attempt.id });
  } catch (error: any) {
    console.error('Save attempt error:', error);
    return NextResponse.json({ error: 'Failed to save attempt' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const owner = await getAuthOwner(req);
    if (owner.type === 'anonymous') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    if (owner.type === 'user') {
      db.prepare('DELETE FROM attempts WHERE user_id = ?').run(owner.userId);
    } else {
      db.prepare('DELETE FROM attempts WHERE guest_id = ?').run(owner.guestId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete attempts error:', error);
    return NextResponse.json({ error: 'Failed to delete attempts' }, { status: 500 });
  }
}

