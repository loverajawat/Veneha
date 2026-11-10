'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart3, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getStoredAttempts, StoredAttempt } from '@/lib/guestStorage';
import { CardBase, TagChip, Button } from '@/components/ui';

export default function TranscriptionStatsPage() {
  const [attempts, setAttempts] = useState<StoredAttempt[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setAttempts(getStoredAttempts());
  }, []);

  if (!isClient) return null;

  const validAttempts = attempts.filter((a) => a.ai_transcript && a.confirmed_transcript);
  const totalCount = validAttempts.length;

  const averageEditRate =
    totalCount > 0
      ? validAttempts.reduce((sum, a) => sum + (a.word_edit_rate || 0), 0) / totalCount
      : 0;

  const attemptsWithUnclear = validAttempts.filter((a) => (a.unclear_count || 0) > 0);
  const unclearShare = totalCount > 0 ? (attemptsWithUnclear.length / totalCount) * 100 : 0;

  // Sort by edit rate descending to show worst cases
  const worstCases = [...validAttempts]
    .sort((a, b) => (b.word_edit_rate || 0) - (a.word_edit_rate || 0))
    .slice(0, 10);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans space-y-6 text-ink">
      <div className="flex items-center justify-between pb-4 border-b border-hairline">
        <div>
          <span className="text-[11px] font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 uppercase tracking-wider">
            Development Telemetry
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Transcription Accuracy & Edit Rate Dashboard
          </h1>
          <p className="text-xs text-slate mt-0.5">
            Real-world accuracy signal comparing AI verbatim output against candidate-confirmed text.
          </p>
        </div>
        <Link href="/" className="text-xs text-slate hover:text-ink flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-hairline bg-surface">
          <span className="text-xs text-slate font-medium block">Total Verified Attempts</span>
          <strong className="text-2xl font-bold text-ink mt-1 block">{totalCount}</strong>
          <span className="text-[11px] text-steel">Logged attempts with diffs</span>
        </div>

        <div className="p-4 rounded-xl border border-hairline bg-surface">
          <span className="text-xs text-slate font-medium block">Average Word Edit Rate</span>
          <strong className="text-2xl font-bold text-ink mt-1 block">
            {(averageEditRate * 100).toFixed(1)}%
          </strong>
          <span className="text-[11px] text-emerald-600">
            {averageEditRate <= 0.15 ? 'Target achieved (≤ 15%)' : 'Needs tuning'}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-hairline bg-surface">
          <span className="text-xs text-slate font-medium block">Share with Unclear Markers</span>
          <strong className="text-2xl font-bold text-ink mt-1 block">
            {unclearShare.toFixed(1)}%
          </strong>
          <span className="text-[11px] text-slate">
            {attemptsWithUnclear.length} of {totalCount} attempts
          </span>
        </div>
      </div>

      {/* Worst Cases Table */}
      <div className="rounded-xl border border-hairline bg-surface overflow-hidden">
        <div className="p-4 border-b border-hairline flex items-center justify-between">
          <h2 className="text-sm font-semibold text-charcoal flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Highest Edit Discrepancies (Worst Cases)
          </h2>
          <span className="text-xs text-slate">Showing top {worstCases.length}</span>
        </div>

        {worstCases.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate">
            No completed attempts found in local storage yet. Transcribe and confirm a story to view stats.
          </div>
        ) : (
          <div className="divide-y divide-hairline">
            {worstCases.map((attempt) => (
              <div key={attempt.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-steel text-[11px]">{attempt.id}</span>
                    <span className="text-slate">
                      {new Date(attempt.date).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-50 text-amber-800 border border-amber-200">
                      WER: {(((attempt.word_edit_rate || 0) * 100)).toFixed(1)}%
                    </span>
                    <span className="text-[11px] text-slate">
                      Score: {attempt.score.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-canvas border border-hairline space-y-1">
                    <span className="text-[10px] font-semibold text-steel uppercase tracking-wider block">
                      AI Verbatim Transcript
                    </span>
                    <p className="text-slate font-sans leading-relaxed line-clamp-4">
                      {attempt.ai_transcript || 'None'}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-canvas border border-hairline space-y-1">
                    <span className="text-[10px] font-semibold text-steel uppercase tracking-wider block">
                      Candidate Confirmed Transcript
                    </span>
                    <p className="text-charcoal font-sans leading-relaxed line-clamp-4">
                      {attempt.confirmed_transcript || attempt.transcript}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Notice Card */}
      <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200/60 text-xs text-slate flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-charcoal block">Privacy & Data Storage Policy</strong>
          <p>
            Veneha stores the raw AI transcript and confirmed student transcript solely for error measurement and calibration. Original handwritten photos are strictly processed in-memory and discarded. Photos are never stored on Veneha servers.
          </p>
        </div>
      </div>
    </div>
  );
}

