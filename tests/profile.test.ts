import assert from 'assert';
import { getDb } from '../src/lib/db';
import bcrypt from 'bcryptjs';
import { validateProfileInput } from '../src/lib/profile/validation';
import {
  getFullProfile,
  updateProfile,
  saveUserAvatar,
  removeUserAvatar,
  getUserPracticeStats,
  deleteUserAccountAndData,
} from '../src/lib/profile/db';
import { createSessionToken, verifySessionToken } from '../src/lib/auth/session';

async function runProfileTests() {
  console.log('Running test: profile.test.ts...');

  const db = getDb();
  const now = new Date().toISOString();
  const passHash = await bcrypt.hash('password123', 10);

  // -------------------------------------------------------------
  // 1. Validation Rules Tests
  // -------------------------------------------------------------
  console.log('Testing validation rules...');

  // Name validation
  {
    const shortName = validateProfileInput({ displayName: 'A' });
    assert.strictEqual(shortName.isValid, false);
    assert.ok(shortName.errors.displayName?.includes('at least 2 characters'));

    const longName = validateProfileInput({ displayName: 'A'.repeat(61) });
    assert.strictEqual(longName.isValid, false);
    assert.ok(longName.errors.displayName?.includes('60 characters or less'));

    const invalidCharName = validateProfileInput({ displayName: 'John123!' });
    assert.strictEqual(invalidCharName.isValid, false);
    assert.ok(invalidCharName.errors.displayName);

    const validHindiName = validateProfileInput({ displayName: 'अमन सिंह' });
    assert.strictEqual(validHindiName.isValid, true);
    assert.strictEqual(validHindiName.data.displayName, 'अमन सिंह');

    const validEngName = validateProfileInput({ displayName: 'Major Amit Sharma' });
    assert.strictEqual(validEngName.isValid, true);
  }

  // Date of Birth validation
  {
    const futureDob = validateProfileInput({
      displayName: 'Test Cadet',
      dateOfBirth: '2099-01-01',
    });
    assert.strictEqual(futureDob.isValid, false);
    assert.ok(futureDob.errors.dateOfBirth?.includes('future'));

    const tooYoung = validateProfileInput({
      displayName: 'Test Cadet',
      dateOfBirth: new Date(Date.now() - 5 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0],
    });
    assert.strictEqual(tooYoung.isValid, false);
    assert.ok(tooYoung.errors.dateOfBirth?.includes('between 10 and 70'));

    const validDob = validateProfileInput({
      displayName: 'Test Cadet',
      dateOfBirth: '2002-05-15',
    });
    assert.strictEqual(validDob.isValid, true);
    assert.strictEqual(validDob.data.dateOfBirth, '2002-05-15');
  }

  // PIN Code validation
  {
    const invalidPin1 = validateProfileInput({ displayName: 'Cadet', pinCode: '012345' });
    assert.strictEqual(invalidPin1.isValid, false);
    assert.ok(invalidPin1.errors.pinCode);

    const invalidPin2 = validateProfileInput({ displayName: 'Cadet', pinCode: '11000' });
    assert.strictEqual(invalidPin2.isValid, false);

    const validPin = validateProfileInput({ displayName: 'Cadet', pinCode: '110001' });
    assert.strictEqual(validPin.isValid, true);
    assert.strictEqual(validPin.data.pinCode, '110001');
  }

  // Indian Mobile validation
  {
    const invalidMobile1 = validateProfileInput({
      displayName: 'Cadet',
      mobileCountryCode: '+91',
      mobileNumber: '1234567890',
    });
    assert.strictEqual(invalidMobile1.isValid, false);
    assert.ok(invalidMobile1.errors.mobileNumber);

    const validMobile = validateProfileInput({
      displayName: 'Cadet',
      mobileCountryCode: '+91',
      mobileNumber: '9876543210',
    });
    assert.strictEqual(validMobile.isValid, true);
    assert.strictEqual(validMobile.data.mobileE164, '+919876543210');
  }

  // Target Exam validation
  {
    const invalidExam = validateProfileInput({ displayName: 'Cadet', targetExam: 'NON_EXISTENT' });
    assert.strictEqual(invalidExam.isValid, false);
    assert.ok(invalidExam.errors.targetExam);

    const validExam = validateProfileInput({ displayName: 'Cadet', targetExam: 'NDA' });
    assert.strictEqual(validExam.isValid, true);
    assert.strictEqual(validExam.data.targetExam, 'NDA');

    const otherWithoutDesc = validateProfileInput({ displayName: 'Cadet', targetExam: 'OTHER' });
    assert.strictEqual(otherWithoutDesc.isValid, false);
    assert.ok(otherWithoutDesc.errors.targetExamOther);

    const otherWithDesc = validateProfileInput({
      displayName: 'Cadet',
      targetExam: 'OTHER',
      targetExamOther: 'Coast Guard AC',
    });
    assert.strictEqual(otherWithDesc.isValid, true);
    assert.strictEqual(otherWithDesc.data.targetExamOther, 'Coast Guard AC');
  }

  console.log('PASS: Validation rules verified.');

  // -------------------------------------------------------------
  // 2. Data Isolation and Persistence Tests
  // -------------------------------------------------------------
  console.log('Testing data isolation and profile persistence in DB...');

  const userAId = `usr_prof_a_${Date.now()}`;
  const userBId = `usr_prof_b_${Date.now()}`;

  db.prepare(`
    INSERT INTO users (id, email, password_hash, display_name, created_at, terms_accepted_at, age_confirmed_18_plus)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `).run(userAId, `prof_a_${Date.now()}@example.com`, passHash, 'Cadet Alpha', now, now);

  db.prepare(`
    INSERT INTO users (id, email, password_hash, display_name, created_at, terms_accepted_at, age_confirmed_18_plus)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `).run(userBId, `prof_b_${Date.now()}@example.com`, passHash, 'Cadet Bravo', now, now);

  // User A updates profile
  const validatedA = validateProfileInput({
    displayName: 'Captain Alpha',
    dateOfBirth: '2001-08-20',
    addressLine1: 'Quarter 14, Officers Enclave',
    city: 'Pune',
    state: 'MH',
    pinCode: '411001',
    mobileCountryCode: '+91',
    mobileNumber: '9822012345',
    targetExam: 'CDS',
    educationStatus: 'graduate',
    ssbAttempts: '1',
    preferredLanguage: 'en',
  });
  assert.strictEqual(validatedA.isValid, true);

  const updatedA = updateProfile(userAId, validatedA.data);
  assert.strictEqual(updatedA.displayName, 'Captain Alpha');
  assert.strictEqual(updatedA.targetExam, 'CDS');
  assert.strictEqual(updatedA.state, 'MH');
  assert.strictEqual(updatedA.pinCode, '411001');

  // Verify User B profile is untouched and isolated
  const profileB = getFullProfile(userBId);
  assert.strictEqual(profileB?.displayName, 'Cadet Bravo');
  assert.strictEqual(profileB?.targetExam, null);
  assert.strictEqual(profileB?.city, null);

  // Verify display_name updated in users table too
  const userRowA = db.prepare('SELECT display_name FROM users WHERE id = ?').get(userAId) as any;
  assert.strictEqual(userRowA.display_name, 'Captain Alpha');

  // -------------------------------------------------------------
  // 3. Avatar Storage & Isolation
  // -------------------------------------------------------------
  console.log('Testing avatar storage and versioning...');
  const fakeFilename = `${userAId}_test.webp`;
  saveUserAvatar(userAId, fakeFilename);

  const profileAWithAvatar = getFullProfile(userAId);
  assert.strictEqual(profileAWithAvatar?.hasPhoto, true);
  assert.ok((profileAWithAvatar?.avatarVersion || 0) >= 1);

  // Verify User B does not have avatar
  const profileBCheck = getFullProfile(userBId);
  assert.strictEqual(profileBCheck?.hasPhoto, false);

  // Remove avatar
  removeUserAvatar(userAId);
  const profileAAfterRemove = getFullProfile(userAId);
  assert.strictEqual(profileAAfterRemove?.hasPhoto, false);

  // -------------------------------------------------------------
  // 4. Practice Summary Stats
  // -------------------------------------------------------------
  console.log('Testing real practice stats vs zero stats...');
  const statsEmpty = getUserPracticeStats(userBId);
  assert.strictEqual(statsEmpty.ppdtCount, 0);
  assert.strictEqual(statsEmpty.watCount, 0);
  assert.strictEqual(statsEmpty.ppdtAvgScore, null);
  assert.strictEqual(statsEmpty.ppdtBestScore, null);

  // Insert attempts for User A
  db.prepare(`
    INSERT INTO attempts (id, user_id, guest_id, picture_id, picture_path, date, transcript, score)
    VALUES (?, ?, NULL, 'p1', '/pictures/1.jpg', ?, 'Great story 1', 7.5)
  `).run(`att_${Date.now()}_1`, userAId, now);

  db.prepare(`
    INSERT INTO attempts (id, user_id, guest_id, picture_id, picture_path, date, transcript, score)
    VALUES (?, ?, NULL, 'p2', '/pictures/2.jpg', ?, 'Great story 2', 8.5)
  `).run(`att_${Date.now()}_2`, userAId, now);

  const statsA = getUserPracticeStats(userAId);
  assert.strictEqual(statsA.ppdtCount, 2);
  assert.strictEqual(statsA.ppdtAvgScore, 8.0);
  assert.strictEqual(statsA.ppdtBestScore, 8.5);

  // -------------------------------------------------------------
  // 5. Account Deletion Cascade
  // -------------------------------------------------------------
  console.log('Testing account deletion cascade...');
  deleteUserAccountAndData(userAId);

  const userAfterDel = db.prepare('SELECT id FROM users WHERE id = ?').get(userAId);
  assert.strictEqual(userAfterDel, undefined);

  const profAfterDel = db.prepare('SELECT user_id FROM profiles WHERE user_id = ?').get(userAId);
  assert.strictEqual(profAfterDel, undefined);

  const attAfterDel = db.prepare('SELECT id FROM attempts WHERE user_id = ?').all(userAId);
  assert.strictEqual(attAfterDel.length, 0);

  console.log('PASS: All Profile tests passed cleanly!');
}

runProfileTests().catch((err) => {
  console.error('FAIL: Profile tests encountered an error:', err);
  process.exit(1);
});
