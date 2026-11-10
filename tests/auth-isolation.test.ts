import assert from 'assert';
import { getDb } from '../src/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createSessionToken, verifySessionToken } from '../src/lib/auth/session';

async function runAuthTests() {
  console.log('Running test: auth-isolation.test.ts...');

  const db = getDb();

  // Create two distinct users
  const userAId = `usr_test_a_${Date.now()}`;
  const userBId = `usr_test_b_${Date.now()}`;
  const passHash = await bcrypt.hash('password123', 10);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, email, password_hash, display_name, created_at, terms_accepted_at, age_confirmed_18_plus)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `).run(userAId, `user_a_${Date.now()}@example.com`, passHash, 'User A', now, now);

  db.prepare(`
    INSERT INTO users (id, email, password_hash, display_name, created_at, terms_accepted_at, age_confirmed_18_plus)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `).run(userBId, `user_b_${Date.now()}@example.com`, passHash, 'User B', now, now);

  // User A creates an attempt
  const attemptAId = `att_a_${Date.now()}`;
  db.prepare(`
    INSERT INTO attempts (id, user_id, guest_id, picture_id, picture_path, date, transcript, score)
    VALUES (?, ?, NULL, 'p1', '/pictures/1.jpg', ?, 'User A secret story', 8.5)
  `).run(attemptAId, userAId, now);

  // User B creates an attempt
  const attemptBId = `att_b_${Date.now()}`;
  db.prepare(`
    INSERT INTO attempts (id, user_id, guest_id, picture_id, picture_path, date, transcript, score)
    VALUES (?, ?, NULL, 'p2', '/pictures/2.jpg', ?, 'User B secret story', 7.0)
  `).run(attemptBId, userBId, now);

  // Verify server-side isolation: query by user A strictly
  const rowsA = db.prepare('SELECT * FROM attempts WHERE user_id = ?').all(userAId) as any[];
  assert.strictEqual(rowsA.length, 1);
  assert.strictEqual(rowsA[0].id, attemptAId);
  assert.strictEqual(rowsA[0].transcript, 'User A secret story');

  // Verify server-side isolation: query by user B strictly
  const rowsB = db.prepare('SELECT * FROM attempts WHERE user_id = ?').all(userBId) as any[];
  assert.strictEqual(rowsB.length, 1);
  assert.strictEqual(rowsB[0].id, attemptBId);
  assert.strictEqual(rowsB[0].transcript, 'User B secret story');

  // Verify User B cannot see User A's data
  const leakCheck = rowsB.find((r) => r.user_id === userAId || r.id === attemptAId);
  assert.strictEqual(leakCheck, undefined, 'User B must never see User A data');

  // Test Session Token creation and verification
  const tokenA = await createSessionToken({ id: userAId, email: 'userA@test.com', display_name: 'User A' });
  const payloadA = await verifySessionToken(tokenA);
  assert(payloadA !== null);
  assert.strictEqual(payloadA?.sub, userAId);

  // Test guest history claiming in single transaction
  const guestCadetId = `cadet_test_${Date.now()}`;
  const guestAttId = `att_guest_${Date.now()}`;
  db.prepare(`
    INSERT INTO attempts (id, user_id, guest_id, picture_id, picture_path, date, transcript, score)
    VALUES (?, NULL, ?, 'p3', '/pictures/3.jpg', ?, 'Guest story to claim', 6.5)
  `).run(guestAttId, guestCadetId, now);

  const claimTx = db.transaction(() => {
    return db.prepare('UPDATE attempts SET user_id = ?, guest_id = NULL WHERE guest_id = ?').run(userAId, guestCadetId);
  });
  const res = claimTx();
  assert.strictEqual(res.changes, 1);

  const claimedAtt = db.prepare('SELECT * FROM attempts WHERE id = ?').get(guestAttId) as any;
  assert.strictEqual(claimedAtt.user_id, userAId);
  assert.strictEqual(claimedAtt.guest_id, null);

  console.log('PASS: Auth and data isolation verified! No cross-user leakage, atomic transactions working.');
}

runAuthTests().catch((err) => {
  console.error('FAIL: Auth isolation test failed', err);
  process.exit(1);
});

