import { NextRequest, NextResponse } from 'next/server';
import { getAuthOwner } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const owner = await getAuthOwner(req);
    if (owner.type !== 'user') {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json();
    const { guestId, clientAttempts } = body;

    if (!guestId || typeof guestId !== 'string') {
      return NextResponse.json({ error: 'Valid guest ID is required.' }, { status: 400 });
    }

    const cleanGuestId = guestId.trim();
    const db = getDb();

    // Use a single transaction to migrate attempts to the user's account
    const claimTx = db.transaction(() => {
      // 1. Move server-side attempts for this guest
      const updateAttempts = db.prepare(`
        UPDATE attempts 
        SET user_id = ?, guest_id = NULL 
        WHERE guest_id = ?
      `).run(owner.userId, cleanGuestId);

      // 2. Move server-side wat_attempts for this guest
      const updateWat = db.prepare(`
        UPDATE wat_attempts 
        SET user_id = ?, guest_id = NULL 
        WHERE guest_id = ?
      `).run(owner.userId, cleanGuestId);

      // 3. Move daily usage records
      db.prepare(`
        UPDATE daily_usage 
        SET user_id = ?, guest_id = NULL 
        WHERE guest_id = ?
      `).run(owner.userId, cleanGuestId);

      // 4. If client passed attempts from localStorage that weren't yet on server, insert them under user_id
      if (Array.isArray(clientAttempts) && clientAttempts.length > 0) {
        const insertStmt = db.prepare(`
          INSERT OR IGNORE INTO attempts (
            id, user_id, guest_id, picture_id, picture_path, date,
            transcript, ai_transcript, confirmed_transcript, box_and_heading,
            word_edit_rate, unclear_count, feedback_json, score, overall_score,
            ppdt_verdict, assessment_prompt_version, assessment_prompt_hash,
            assessment_model, story_word_count, student_concern, assessment_json
          ) VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const att of clientAttempts) {
          if (att.id && att.pictureId) {
            insertStmt.run(
              att.id,
              owner.userId,
              att.pictureId,
              att.picturePath || '',
              att.date || new Date().toISOString(),
              att.transcript || '',
              att.ai_transcript || null,
              att.confirmed_transcript || null,
              att.box_and_heading || null,
              att.word_edit_rate || null,
              att.unclear_count || null,
              typeof att.feedback === 'object' ? JSON.stringify(att.feedback) : att.feedback || null,
              att.score || 0,
              att.overall_score || null,
              att.ppdt_verdict || null,
              att.assessment_prompt_version || null,
              att.assessment_prompt_hash || null,
              att.assessment_model || null,
              att.story_word_count || null,
              att.student_concern || null,
              typeof att.assessment_json === 'object' ? JSON.stringify(att.assessment_json) : att.assessment_json || null
            );
          }
        }
      }

      return updateAttempts.changes + updateWat.changes;
    });

    const claimedCount = claimTx();

    return NextResponse.json({
      success: true,
      claimedCount,
    });
  } catch (error: any) {
    console.error('Claim guest history error:', error);
    return NextResponse.json({ error: 'Failed to claim guest history.' }, { status: 500 });
  }
}

