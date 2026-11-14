import path from 'path';
import fs from 'fs';
import { getDb } from '@/lib/db';
import { UserProfileFull } from './types';
import { ValidatedProfileData } from './validation';

const AVATAR_DIR = path.join(process.cwd(), 'data', 'avatars');

export function ensureAvatarDir(): string {
  if (!fs.existsSync(AVATAR_DIR)) {
    fs.mkdirSync(AVATAR_DIR, { recursive: true });
  }
  return AVATAR_DIR;
}

export function getFullProfile(userId: string): UserProfileFull | null {
  const db = getDb();

  const user = db
    .prepare('SELECT id, email, display_name, created_at FROM users WHERE id = ?')
    .get(userId) as { id: string; email: string; display_name: string; created_at: string } | undefined;

  if (!user) return null;

  const profile = db
    .prepare('SELECT * FROM profiles WHERE user_id = ?')
    .get(userId) as any;

  return {
    userId: user.id,
    email: user.email,
    displayName: user.display_name,
    dateOfBirth: profile?.date_of_birth || null,
    addressLine1: profile?.address_line1 || null,
    addressLine2: profile?.address_line2 || null,
    city: profile?.city || null,
    state: profile?.state || null,
    pinCode: profile?.pin_code || null,
    mobileE164: profile?.mobile_e164 || null,
    targetExam: profile?.target_exam || null,
    targetExamOther: profile?.target_exam_other || null,
    educationStatus: profile?.education_status || null,
    ssbAttempts: profile?.ssb_attempts || null,
    preferredLanguage: profile?.preferred_language || null,
    avatarVersion: profile?.avatar_version || 0,
    hasPhoto: Boolean(profile?.avatar_filename),
    createdAt: user.created_at,
    updatedAt: profile?.updated_at || null,
  };
}

export function updateProfile(
  userId: string,
  data: ValidatedProfileData
): UserProfileFull | null {
  const db = getDb();
  const now = new Date().toISOString();

  const tx = db.transaction(() => {
    // 1. Update display_name on users table
    db.prepare('UPDATE users SET display_name = ? WHERE id = ?').run(
      data.displayName,
      userId
    );

    // 2. Check if profile exists
    const existing = db
      .prepare('SELECT user_id FROM profiles WHERE user_id = ?')
      .get(userId);

    if (existing) {
      db.prepare(`
        UPDATE profiles SET
          date_of_birth = ?,
          address_line1 = ?,
          address_line2 = ?,
          city = ?,
          state = ?,
          pin_code = ?,
          mobile_e164 = ?,
          target_exam = ?,
          target_exam_other = ?,
          education_status = ?,
          ssb_attempts = ?,
          preferred_language = ?,
          updated_at = ?
        WHERE user_id = ?
      `).run(
        data.dateOfBirth,
        data.addressLine1,
        data.addressLine2,
        data.city,
        data.state,
        data.pinCode,
        data.mobileE164,
        data.targetExam,
        data.targetExamOther,
        data.educationStatus,
        data.ssbAttempts,
        data.preferredLanguage,
        now,
        userId
      );
    } else {
      db.prepare(`
        INSERT INTO profiles (
          user_id, date_of_birth, address_line1, address_line2, city, state, pin_code,
          mobile_e164, target_exam, target_exam_other, education_status, ssb_attempts,
          preferred_language, avatar_version, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
      `).run(
        userId,
        data.dateOfBirth,
        data.addressLine1,
        data.addressLine2,
        data.city,
        data.state,
        data.pinCode,
        data.mobileE164,
        data.targetExam,
        data.targetExamOther,
        data.educationStatus,
        data.ssbAttempts,
        data.preferredLanguage,
        now
      );
    }
  });

  tx();
  return getFullProfile(userId);
}

export function saveUserAvatar(userId: string, filename: string): { avatarVersion: number } {
  const db = getDb();
  const now = new Date().toISOString();
  ensureAvatarDir();

  let newVersion = 1;

  const tx = db.transaction(() => {
    const existing = db
      .prepare('SELECT avatar_filename, avatar_version FROM profiles WHERE user_id = ?')
      .get(userId) as { avatar_filename?: string; avatar_version?: number } | undefined;

    // Delete old avatar file from disk if exists
    if (existing?.avatar_filename && typeof existing.avatar_filename === 'string') {
      const oldPath = path.join(AVATAR_DIR, existing.avatar_filename);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch {}
      }
    }

    newVersion = (existing?.avatar_version || 0) + 1;

    if (existing) {
      db.prepare(`
        UPDATE profiles SET
          avatar_filename = ?,
          avatar_version = ?,
          updated_at = ?
        WHERE user_id = ?
      `).run(filename, newVersion, now, userId);
    } else {
      db.prepare(`
        INSERT INTO profiles (user_id, avatar_filename, avatar_version, updated_at)
        VALUES (?, ?, ?, ?)
      `).run(userId, filename, newVersion, now);
    }
  });

  tx();
  return { avatarVersion: newVersion };
}

export function removeUserAvatar(userId: string): { avatarVersion: number } {
  const db = getDb();
  const now = new Date().toISOString();
  let newVersion = 1;

  const tx = db.transaction(() => {
    const existing = db
      .prepare('SELECT avatar_filename, avatar_version FROM profiles WHERE user_id = ?')
      .get(userId) as { avatar_filename?: string; avatar_version?: number } | undefined;

    if (existing?.avatar_filename && typeof existing.avatar_filename === 'string') {
      const oldPath = path.join(AVATAR_DIR, existing.avatar_filename);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch {}
      }
    }

    newVersion = (existing?.avatar_version || 0) + 1;

    if (existing) {
      db.prepare(`
        UPDATE profiles SET
          avatar_filename = NULL,
          avatar_version = ?,
          updated_at = ?
        WHERE user_id = ?
      `).run(newVersion, now, userId);
    }
  });

  tx();
  return { avatarVersion: newVersion };
}

export function getUserAvatarFilePath(userId: string): string | null {
  const db = getDb();
  const profile = db
    .prepare('SELECT avatar_filename FROM profiles WHERE user_id = ?')
    .get(userId) as { avatar_filename?: string } | undefined;

  if (!profile || !profile.avatar_filename) {
    return null;
  }

  const filePath = path.join(AVATAR_DIR, profile.avatar_filename);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return filePath;
}

export function getUserPracticeStats(userId: string) {
  const db = getDb();

  const ppdtStats = db.prepare(`
    SELECT 
      COUNT(*) as count,
      AVG(COALESCE(overall_score, score)) as avg_score,
      MAX(COALESCE(overall_score, score)) as best_score,
      MAX(date) as last_date
    FROM attempts 
    WHERE user_id = ?
  `).get(userId) as any;

  const watStats = db.prepare(`
    SELECT COUNT(*) as count 
    FROM wat_attempts 
    WHERE user_id = ?
  `).get(userId) as any;

  return {
    ppdtCount: ppdtStats?.count || 0,
    ppdtAvgScore: ppdtStats?.avg_score ? Number(ppdtStats.avg_score.toFixed(1)) : null,
    ppdtBestScore: ppdtStats?.best_score ? Number(ppdtStats.best_score.toFixed(1)) : null,
    ppdtLastDate: ppdtStats?.last_date || null,
    watCount: watStats?.count || 0,
  };
}

export function deleteUserAccountAndData(userId: string): boolean {
  const db = getDb();
  ensureAvatarDir();

  // Find avatar to delete from disk
  const profile = db
    .prepare('SELECT avatar_filename FROM profiles WHERE user_id = ?')
    .get(userId) as { avatar_filename?: string } | undefined;

  if (profile?.avatar_filename) {
    const avatarPath = path.join(AVATAR_DIR, profile.avatar_filename);
    if (fs.existsSync(avatarPath)) {
      try {
        fs.unlinkSync(avatarPath);
      } catch {}
    }
  }

  // Delete user from DB (Foreign keys ON DELETE CASCADE will delete profiles, attempts, wat_attempts, daily_usage)
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM daily_usage WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM wat_attempts WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM attempts WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM profiles WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  });

  tx();
  return true;
}
