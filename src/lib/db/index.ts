import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'veneha.db');
  dbInstance = new Database(dbPath);
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');

  initSchema(dbInstance);
  return dbInstance;
}

function initSchema(db: Database.Database) {
  // 1. Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      terms_accepted_at TEXT NOT NULL,
      age_confirmed_18_plus INTEGER NOT NULL DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  // 2. PPDT Attempts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      guest_id TEXT,
      picture_id TEXT NOT NULL,
      picture_path TEXT NOT NULL,
      date TEXT NOT NULL,
      transcript TEXT NOT NULL,
      ai_transcript TEXT,
      confirmed_transcript TEXT,
      box_and_heading TEXT,
      word_edit_rate REAL,
      unclear_count INTEGER,
      feedback_json TEXT,
      score REAL,
      overall_score REAL,
      ppdt_verdict TEXT,
      assessment_prompt_version TEXT,
      assessment_prompt_hash TEXT,
      assessment_model TEXT,
      story_word_count INTEGER,
      student_concern TEXT,
      assessment_json TEXT,
      CHECK ((user_id IS NOT NULL AND guest_id IS NULL) OR (user_id IS NULL AND guest_id IS NOT NULL))
    );

    CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id);
    CREATE INDEX IF NOT EXISTS idx_attempts_guest ON attempts(guest_id);
    CREATE INDEX IF NOT EXISTS idx_attempts_date ON attempts(date);
  `);

  // 3. WAT Attempts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS wat_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      guest_id TEXT,
      set_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      overall_score REAL,
      summary_json TEXT,
      status TEXT NOT NULL,
      responses_json TEXT NOT NULL,
      CHECK ((user_id IS NOT NULL AND guest_id IS NULL) OR (user_id IS NULL AND guest_id IS NOT NULL))
    );

    CREATE INDEX IF NOT EXISTS idx_wat_attempts_user ON wat_attempts(user_id);
    CREATE INDEX IF NOT EXISTS idx_wat_attempts_guest ON wat_attempts(guest_id);
  `);

  // 4. Daily Usage table
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_usage (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      guest_id TEXT,
      usage_type TEXT NOT NULL, -- 'ppdt' or 'wat'
      date TEXT NOT NULL,        -- YYYY-MM-DD
      count INTEGER NOT NULL DEFAULT 0,
      limit_val INTEGER NOT NULL DEFAULT 5,
      CHECK ((user_id IS NOT NULL AND guest_id IS NULL) OR (user_id IS NULL AND guest_id IS NOT NULL))
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_usage_user_type_date ON daily_usage(user_id, usage_type, date) WHERE user_id IS NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_usage_guest_type_date ON daily_usage(guest_id, usage_type, date) WHERE guest_id IS NOT NULL;
  `);

  // 5. Auth Rate Limits table
  db.exec(`
    CREATE TABLE IF NOT EXISTS auth_rate_limits (
      key TEXT PRIMARY KEY,
      attempts INTEGER NOT NULL,
      first_attempt_at INTEGER NOT NULL,
      last_attempt_at INTEGER NOT NULL
    );
  `);
}

