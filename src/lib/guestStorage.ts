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
  transcript: string;
  feedback: any;
  score: number;
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
  }
  return usage;
}

export function canAttemptToday(): boolean {
  const usage = getDailyUsage();
  return usage.count < usage.limit;
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
  }
  incrementDailyUsage();
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

export function getPictureGridData(): PictureGridItem[] {
  const activePictures = getActivePictures();
  const attempts = getStoredAttempts();

  return activePictures.map((pic, idx) => {
    const picNum = idx + 1;
    const picAttempts = attempts.filter(a => a.pictureId === pic.id);
    const attempted = picAttempts.length > 0;

    let lastScore: string | null = null;
    let lastAttemptedAt: string | null = null;
    let lastAttemptId: string | null = null;

    if (attempted) {
      const latest = picAttempts[0];
      lastAttemptId = latest.id;
      if (typeof latest.score === 'number' && !isNaN(latest.score)) {
        lastScore = `${latest.score}/10`;
      } else if (latest.feedback?.overallScore) {
        lastScore = `${latest.feedback.overallScore}/10`;
      } else {
        lastScore = 'Attempted';
      }

      if (latest.date) {
        try {
          const d = new Date(latest.date);
          lastAttemptedAt = d.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
        } catch {
          lastAttemptedAt = latest.date;
        }
      }
    }

    return {
      pictureNumber: picNum,
      pictureId: pic.id,
      attempted,
      lastScore,
      lastAttemptedAt,
      lastAttemptId,
      attemptCount: picAttempts.length,
    };
  });
}
