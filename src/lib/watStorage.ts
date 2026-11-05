'use client';

import { getAllWatSets } from '@/data/watWords';

export interface WatResponseItem {
  position: number;
  word: string;
  response_text: string;
  rating?: 'strong' | 'acceptable' | 'needs_work' | 'not_answered';
  comment?: string;
  better_example?: string | null;
}

export interface WatSummaryJson {
  overall_score: number;
  answered: number;
  unanswered: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  patterns: string;
}

export interface WatAttempt {
  id: string;
  guestId: string;
  setId: number;
  createdAt: string;
  overallScore: number | null;
  summaryJson: WatSummaryJson | null;
  status: 'transcribed' | 'assessed' | 'failed';
  responses: WatResponseItem[];
}

export interface WatDailyUsage {
  date: string; // YYYY-MM-DD
  count: number;
  limit: number;
}

const WAT_ATTEMPTS_KEY = 'ssb_prep_wat_attempts';
const WAT_USAGE_KEY = 'ssb_prep_wat_daily_usage';
export const WAT_DAILY_LIMIT = 2;

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getWatDailyUsage(): WatDailyUsage {
  if (typeof window === 'undefined') {
    return { date: getTodayString(), count: 0, limit: WAT_DAILY_LIMIT };
  }
  const today = getTodayString();
  const raw = localStorage.getItem(WAT_USAGE_KEY);
  if (!raw) {
    return { date: today, count: 0, limit: WAT_DAILY_LIMIT };
  }
  try {
    const data: WatDailyUsage = JSON.parse(raw);
    if (data.date !== today) {
      const fresh: WatDailyUsage = { date: today, count: 0, limit: WAT_DAILY_LIMIT };
      localStorage.setItem(WAT_USAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return data;
  } catch {
    return { date: today, count: 0, limit: WAT_DAILY_LIMIT };
  }
}

export function incrementWatDailyUsage(): WatDailyUsage {
  const usage = getWatDailyUsage();
  usage.count += 1;
  if (typeof window !== 'undefined') {
    localStorage.setItem(WAT_USAGE_KEY, JSON.stringify(usage));
  }
  return usage;
}

export function canAttemptWatToday(): boolean {
  const usage = getWatDailyUsage();
  return usage.count < usage.limit;
}

export function getWatAttempts(): WatAttempt[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(WAT_ATTEMPTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getWatAttemptById(id: string): WatAttempt | null {
  const list = getWatAttempts();
  return list.find((a) => a.id === id) || null;
}

export function saveWatAttempt(
  attempt: Omit<WatAttempt, 'id' | 'createdAt'>
): WatAttempt {
  const fullAttempt: WatAttempt = {
    ...attempt,
    id: `wat-attempt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  const list = getWatAttempts();
  list.unshift(fullAttempt);
  if (typeof window !== 'undefined') {
    localStorage.setItem(WAT_ATTEMPTS_KEY, JSON.stringify(list));
  }
  return fullAttempt;
}

export function updateWatAttempt(
  id: string,
  updates: Partial<WatAttempt>
): WatAttempt | null {
  const list = getWatAttempts();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  const updated: WatAttempt = {
    ...list[idx],
    ...updates,
  };
  list[idx] = updated;
  if (typeof window !== 'undefined') {
    localStorage.setItem(WAT_ATTEMPTS_KEY, JSON.stringify(list));
  }
  return updated;
}

export interface WatGridItem {
  setNumber: number;
  wordCount: number;
  attempted: boolean;
  lastScore: string | null;
  lastAttemptedAt: string | null;
  lastAttemptId: string | null;
  attemptCount: number;
}

export function getWatGridData(): WatGridItem[] {
  const sets = getAllWatSets();
  const attempts = getWatAttempts();

  return sets.map((s) => {
    const setAttempts = attempts.filter((a) => a.setId === s.setNumber && a.status === 'assessed');
    const attempted = setAttempts.length > 0;

    let lastScore: string | null = null;
    let lastAttemptedAt: string | null = null;
    let lastAttemptId: string | null = null;

    if (attempted) {
      const latest = setAttempts[0];
      lastAttemptId = latest.id;
      if (typeof latest.overallScore === 'number' && !isNaN(latest.overallScore)) {
        lastScore = `${latest.overallScore}/10`;
      } else if (latest.summaryJson?.overall_score) {
        lastScore = `${latest.summaryJson.overall_score}/10`;
      } else {
        lastScore = 'Attempted';
      }

      if (latest.createdAt) {
        try {
          const d = new Date(latest.createdAt);
          lastAttemptedAt = d.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
        } catch {
          lastAttemptedAt = latest.createdAt;
        }
      }
    }

    return {
      setNumber: s.setNumber,
      wordCount: s.wordCount,
      attempted,
      lastScore,
      lastAttemptedAt,
      lastAttemptId,
      attemptCount: setAttempts.length,
    };
  });
}

