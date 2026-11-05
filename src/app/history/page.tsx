'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  History, 
  Clock, 
  ArrowRight, 
  Award, 
  Trash2, 
  FileText, 
  Calendar, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { getStoredAttempts, StoredAttempt } from '@/lib/guestStorage';
import OLQBadge from '@/components/OLQBadge';

export default function HistoryPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<StoredAttempt[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setAttempts(getStoredAttempts());
    setLoaded(true);
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
    if (confirm('Are you sure you want to delete your stored PPDT attempt history on this browser?')) {
      localStorage.removeItem('ssb_prep_attempts');
      setAttempts([]);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-olive-800/80">
        <div>
          <span className="text-xs font-bold text-olive-300 uppercase tracking-wider">
            Practice Log & Progress
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white mt-0.5">
            My Past PPDT Attempts
          </h1>
          <p className="text-sm text-[#a8baa3] mt-1">
            Track your scoring trajectory, review past transcripts, and inspect feedback.
          </p>
        </div>

        {attempts.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-900/60 bg-red-950/40 text-red-300 hover:text-white hover:bg-red-900/60 text-xs transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Attempts List */}
      {!loaded ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading practice log...</div>
      ) : attempts.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#121911] border border-olive-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-olive-800/70 border border-olive-600/50 flex items-center justify-center text-camo-gold mx-auto shadow-lg">
            <History className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-bold text-xl text-white">No Attempts Recorded Yet</h3>
          <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto">
            Take your first 30s picture observation and 4-minute writing session to see your psychological analysis here.
          </p>
          <div className="pt-2">
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-olive-600 hover:bg-olive-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg"
            >
              <Clock className="w-4 h-4 text-camo-gold" />
              <span>Start First PPDT Practice</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => {
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

            const verdict = attempt.feedback?.summaryRating?.verdictBadge || 'Evaluated';
            const headline = attempt.feedback?.summaryRating?.headline || '';
            const score = attempt.score || attempt.feedback?.summaryRating?.overallScore || 7.5;
            const olqs = attempt.feedback?.olqsDemonstrated?.slice(0, 3) || [];

            return (
              <div
                key={attempt.id}
                onClick={() => handleOpenAttempt(attempt)}
                className="p-5 rounded-2xl bg-[#111710] border border-olive-800/80 hover:border-olive-600 hover:bg-[#141d13] transition-all cursor-pointer shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Left info */}
                <div className="flex items-start gap-4">
                  {/* Stimulus picture thumb */}
                  <img
                    src={attempt.picturePath || '/pictures/ppdt_stimulus_01.jpg'}
                    alt="PPDT card"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-olive-700 shrink-0"
                  />

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-camo-gold transition-colors">
                        {verdict}
                      </span>
                      <span className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {dateStr} at {timeStr}
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 line-clamp-2 max-w-xl leading-relaxed">
                      {attempt.transcript}
                    </p>

                    {/* Demonstrated OLQs mini tags */}
                    {olqs.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {olqs.map((q: any, i: number) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-olive-950 text-olive-300 border border-olive-900"
                          >
                            {q.olqName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right score and action */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-olive-900">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      Score
                    </span>
                    <span className="text-xl font-mono font-black text-camo-gold">
                      {score}
                      <span className="text-xs text-gray-500 font-normal">/10</span>
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-olive-900/60 text-olive-300 group-hover:text-white group-hover:bg-olive-800 transition-all">
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

