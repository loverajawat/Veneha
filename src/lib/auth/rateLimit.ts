import { getDb } from '@/lib/db';

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export function checkRateLimit(key: string, maxAttempts: number, windowMs: number): RateLimitResult {
  const db = getDb();
  const now = Date.now();
  const cutoff = now - windowMs;

  const row = db.prepare(`
    SELECT attempts, first_attempt_at, last_attempt_at 
    FROM auth_rate_limits 
    WHERE key = ?
  `).get(key) as { attempts: number; first_attempt_at: number; last_attempt_at: number } | undefined;

  if (!row) {
    return { allowed: true };
  }

  // If the window has expired, reset
  if (row.first_attempt_at < cutoff) {
    db.prepare('DELETE FROM auth_rate_limits WHERE key = ?').run(key);
    return { allowed: true };
  }

  if (row.attempts >= maxAttempts) {
    const retryAfterSeconds = Math.max(1, Math.ceil((row.first_attempt_at + windowMs - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true };
}

export function recordFailedAttempt(key: string, windowMs: number) {
  const db = getDb();
  const now = Date.now();
  const cutoff = now - windowMs;

  const row = db.prepare(`
    SELECT attempts, first_attempt_at 
    FROM auth_rate_limits 
    WHERE key = ?
  `).get(key) as { attempts: number; first_attempt_at: number } | undefined;

  if (!row || row.first_attempt_at < cutoff) {
    db.prepare(`
      INSERT OR REPLACE INTO auth_rate_limits (key, attempts, first_attempt_at, last_attempt_at)
      VALUES (?, 1, ?, ?)
    `).run(key, now, now);
  } else {
    db.prepare(`
      UPDATE auth_rate_limits 
      SET attempts = attempts + 1, last_attempt_at = ?
      WHERE key = ?
    `).run(now, key);
  }
}

export function clearRateLimit(key: string) {
  const db = getDb();
  db.prepare('DELETE FROM auth_rate_limits WHERE key = ?').run(key);
}

