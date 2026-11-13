'use client';

import { getActivePictures } from '@/data/pictures';

export interface GuestProfile {
  id: string;
  name: string;
  createdAt: string;
}

export interface StoredAttempt {
  id: string;
  guestId: string;
  pictureId: string;
  picturePath: string;
  date: string;
  transcript: string; // The confirmed transcript
  ai_transcript?: string; // What the model initially returned
  confirmed_transcript?: string; // What the student approved
  box_and_heading?: string;
  word_edit_rate?: number; // Edit rate between ai_transcript and confirmed_transcript
  unclear_count?: number;
  feedback: any;
  score: number;
  overall_score?: number;
  ppdt_verdict?: 'Strong' | 'Average' | 'Weak' | string;
  assessment_prompt_version?: string;
  assessment_prompt_hash?: string;
  assessment_model?: string;
  story_word_count?: number;
  student_concern?: string | null;
  assessment_json?: any;
}

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  count: number;
  limit: number;
}

const GUEST_KEY = 'ssb_prep_guest';
const ATTEMPTS_KEY = 'ssb_prep_attempts';
const USAGE_KEY = 'ssb_prep_daily_usage';
export const DEFAULT_DAILY_LIMIT = 5;

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getGuest(): GuestProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(GUEST_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveGuest(name: string): GuestProfile {
  const existing = getGuest();
  const profile: GuestProfile = {
    id: existing?.id || `cadet-${Math.random().toString(36).substring(2, 9)}`,
    name: name.trim() || 'Cadet',
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
  localStorage.setItem(GUEST_KEY, JSON.stringify(profile));
  return profile;
}

export function getDailyUsage(): DailyUsage {
  if (typeof window === 'undefined') {
    return { date: getTodayString(), count: 0, limit: DEFAULT_DAILY_LIMIT };
  }
  const today = getTodayString();
  const raw = localStorage.getItem(USAGE_KEY);
  if (!raw) {
    return { date: today, count: 0, limit: DEFAULT_DAILY_LIMIT };
  }
  try {
    const data: DailyUsage = JSON.parse(raw);
    if (data.date !== today) {
      // New day, reset count
      const fresh: DailyUsage = { date: today, count: 0, limit: DEFAULT_DAILY_LIMIT };
      localStorage.setItem(USAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return data;
  } catch {
    return { date: today, count: 0, limit: DEFAULT_DAILY_LIMIT };
  }
}

export function incrementDailyUsage(): DailyUsage {
  const usage = getDailyUsage();
  usage.count += 1;
  if (typeof window !== 'undefined') {
    localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
    window.dispatchEvent(new Event('usage-updated'));
  }
  return usage;
}

export function canAttemptToday(): boolean {
  const usage = getDailyUsage();
  return usage.count < usage.limit;
}

export function clearGuest(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GUEST_KEY);
  }
}

export function clearAttempts(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ATTEMPTS_KEY);
    window.dispatchEvent(new Event('attempts-updated'));
  }
  fetch('/api/attempts', { method: 'DELETE' }).catch(() => {});
}

export function getStoredAttempts(): StoredAttempt[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(ATTEMPTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export const getAttempts = getStoredAttempts;

export function saveStoredAttempts(list: StoredAttempt[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('attempts-updated'));
  }
}

export function saveAttempt(attempt: Omit<StoredAttempt, 'id' | 'date'>): StoredAttempt {
  const fullAttempt: StoredAttempt = {
    ...attempt,
    id: `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    date: new Date().toISOString(),
  };
  const list = getStoredAttempts();
  list.unshift(fullAttempt);
  if (typeof window !== 'undefined') {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('attempts-updated'));
  }
  incrementDailyUsage();

  // Save to server database asynchronously
  if (typeof window !== 'undefined') {
    fetch('/api/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attempt: fullAttempt }),
    }).catch(() => {});

    fetch('/api/usage?type=ppdt', { method: 'POST' }).catch(() => {});
  }

  return fullAttempt;
}

export function getAttemptById(id: string): StoredAttempt | null {
  const list = getStoredAttempts();
  return list.find(a => a.id === id) || null;
}

export interface PictureGridItem {
  pictureNumber: number;
  pictureId: string;
  attempted: boolean;
  lastScore: string | null;
  lastAttemptedAt: string | null;
  lastAttemptId: string | null;
  attemptCount: number;
}

export function getPictureGridData(customAttempts?: StoredAttempt[]): PictureGridItem[] {
  const activePictures = getActivePictures();
  const attempts = customAttempts ?? getStoredAttempts();

  return activePictures.map((pic, idx) => {
    const picNum = idx + 1;
    const picAttempts = attempts.filter(a => a.pictureId === pic.id);
    const attempted = picAttempts.length > 0;
    const lastAttempt = attempted ? picAttempts[0] : null;

    let scoreFormatted: string | null = null;
    if (lastAttempt) {
      const numericScore = typeof lastAttempt.score === 'number' ? lastAttempt.score : (lastAttempt.overall_score ?? 0);
      scoreFormatted = Number(numericScore).toFixed(1);
    }

    return {
      pictureNumber: picNum,
      pictureId: pic.id,
      attempted,
      lastScore: scoreFormatted,
      lastAttemptedAt: lastAttempt ? lastAttempt.date : null,
      lastAttemptId: lastAttempt ? lastAttempt.id : null,
      attemptCount: picAttempts.length,
    };
  });
}
