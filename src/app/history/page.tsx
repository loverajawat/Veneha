'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  History, 
  Clock, 
  ArrowRight, 
  Trash2, 
  Calendar, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { getStoredAttempts, clearAttempts, StoredAttempt } from '@/lib/guestStorage';
import { Button, TagChip, CardBase, PillTab } from '@/components/ui';

export default function HistoryPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<StoredAttempt[]>([]);
  const [filter, setFilter] = useState<'all' | 'Strong' | 'Average' | 'Weak'>('all');
  const [loaded, setLoaded] = useState(false);

  const loadHistory = () => {
    const local = getStoredAttempts();
    setAttempts(local);
    setLoaded(true);

    fetch('/api/attempts')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.attempts && Array.isArray(data.attempts)) {
          if (data.attempts.length > 0) {
            setAttempts(data.attempts);
          } else if (local.length === 0) {
            setAttempts([]);
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadHistory();

    window.addEventListener('attempts-updated', loadHistory);
    window.addEventListener('storage', loadHistory);
    window.addEventListener('focus', loadHistory);

    return () => {
      window.removeEventListener('attempts-updated', loadHistory);
      window.removeEventListener('storage', loadHistory);
      window.removeEventListener('focus', loadHistory);
    };
  }, []);

  const handleOpenAttempt = (attempt: StoredAttempt) => {
    sessionStorage.setItem('current_assessment_result', JSON.stringify(attempt.feedback));
    sessionStorage.setItem('current_story_transcript', attempt.transcript);
    sessionStorage.setItem(
      'current_ppdt_picture',
      JSON.stringify({
        id: attempt.pictureId,
        path: attempt.picturePath,
        title: `Attempt on ${new Date(attempt.date).toLocaleDateString()}`,
      })
    );
    router.push('/result');
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to delete your stored PPDT attempt history?')) {
      clearAttempts();
      setAttempts([]);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6 font-sans text-ink">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <span className="text-xs font-semibold text-steel uppercase tracking-wider">
            Practice Log & History
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-0.5">
            Past PPDT Attempts
          </h1>
          <p className="text-xs text-slate mt-1 max-w-xl">
            Track your scoring trajectory, inspect past assessor evaluations, and compare revisions.
          </p>
        </div>

        {attempts.length > 0 && (
          <Button
            variant="secondary"
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 py-1.5 px-3 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </Button>
        )}
      </div>

      {/* Attempts List */}
      {!loaded ? (
        <div className="text-center py-12 text-slate text-xs">Loading practice history...</div>
      ) : attempts.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface border border-hairline text-center space-y-4 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-xl bg-canvas border border-hairline flex items-center justify-center text-slate mx-auto">
            <History className="w-6 h-6 text-steel" />
          </div>
          <h3 className="font-semibold text-base text-ink">No Attempts Recorded Yet</h3>
          <p className="text-xs text-slate">
            Complete a timed observation and writing session to receive your psychological analysis.
          </p>
          <div className="pt-2">
            <Link href="/practice">
              <Button variant="primary" className="text-xs py-2 px-4">
                <span>Start Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Verdict Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist">
            <PillTab active={filter === 'all'} onClick={() => setFilter('all')}>
              All ({attempts.length})
            </PillTab>
            {attempts.some(a => (a.ppdt_verdict || a.feedback?.ppdt_suitability?.verdict) === 'Strong') && (
              <PillTab active={filter === 'Strong'} onClick={() => setFilter('Strong')}>
                Strong ({attempts.filter(a => (a.ppdt_verdict || a.feedback?.ppdt_suitability?.verdict) === 'Strong').length})
              </PillTab>
            )}
            {attempts.some(a => (a.ppdt_verdict || a.feedback?.ppdt_suitability?.verdict) === 'Average') && (
              <PillTab active={filter === 'Average'} onClick={() => setFilter('Average')}>
                Average ({attempts.filter(a => (a.ppdt_verdict || a.feedback?.ppdt_suitability?.verdict) === 'Average').length})
              </PillTab>
            )}
            {attempts.some(a => (a.ppdt_verdict || a.feedback?.ppdt_suitability?.verdict) === 'Weak') && (
              <PillTab active={filter === 'Weak'} onClick={() => setFilter('Weak')}>
                Weak ({attempts.filter(a => (a.ppdt_verdict || a.feedback?.ppdt_suitability?.verdict) === 'Weak').length})
              </PillTab>
            )}
          </div>

          <div className="space-y-3">
            {attempts
              .filter((a) => {
                if (filter === 'all') return true;
                return (a.ppdt_verdict || a.feedback?.ppdt_suitability?.verdict) === filter;
              })
              .map((attempt) => {
            const dateObj = new Date(attempt.date);
            const dateStr = dateObj.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const timeStr = dateObj.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            });

            const score = (attempt.overall_score ?? attempt.feedback?.final_assessment?.overall_score ?? attempt.score ?? 5.0).toFixed(1);
            const verdict = attempt.ppdt_verdict || attempt.feedback?.ppdt_suitability?.verdict || 'Average';
            
            let tagColor: 'green' | 'yellow' | 'red' = 'yellow';
            if (verdict === 'Strong') tagColor = 'green';
            if (verdict === 'Weak') tagColor = 'red';

            return (
              <div
                key={attempt.id}
                onClick={() => handleOpenAttempt(attempt)}
                className="p-4 rounded-xl bg-surface border border-hairline hover:border-hairline-strong hover:bg-canvas/50 transition-all cursor-pointer shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Left info */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={attempt.picturePath || '/pictures/ppdt_stimulus_01.jpg'}
                    alt="PPDT card"
                    className="w-14 h-14 object-cover rounded-lg border border-hairline shrink-0"
                  />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <TagChip color={tagColor}>{verdict}</TagChip>
                      <span className="text-[11px] text-steel flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-slate" />
                        {dateStr} · {timeStr}
                      </span>
                    </div>

                    <p className="text-xs text-charcoal line-clamp-2 max-w-xl leading-relaxed">
                      {attempt.transcript}
                    </p>
                  </div>
                </div>

                {/* Right score and action */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-hairline">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-steel block">
                      Overall Score
                    </span>
                    <span className="text-lg font-bold text-ink">
                      {score}
                      <span className="text-xs text-slate font-normal"> / 10</span>
                    </span>
                  </div>

                  <div className="p-1.5 rounded-lg bg-canvas border border-hairline text-slate group-hover:text-ink transition-colors">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
}
