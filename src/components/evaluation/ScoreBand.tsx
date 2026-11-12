'use client';

import React from 'react';
import { EvaluationScores } from '@/lib/assessor/types';
import { TagChip } from '@/components/ui';

interface ScoreBandProps {
  scores: EvaluationScores;
  verdict: 'Strong' | 'Average' | 'Weak';
}

export default function ScoreBand({ scores, verdict }: ScoreBandProps) {
  let verdictColor: 'green' | 'yellow' | 'red' = 'yellow';
  if (verdict === 'Strong') verdictColor = 'green';
  if (verdict === 'Weak') verdictColor = 'red';

  const subScoreList = [
    { label: 'Picture Perception', score: scores.picture_perception },
    { label: 'Story Quality', score: scores.story },
    { label: 'Realism', score: scores.realism },
    { label: 'Protagonist & Action', score: scores.protagonist_action },
    { label: 'Narration Suitability', score: scores.narration_suitability },
  ];

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-hairline shadow-sm space-y-4 print:border-none print:shadow-none print:p-2">
      {/* Top row: Overall score & Suitability tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
              {scores.overall.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-slate">/ 10</span>
          </div>
          <div className="h-6 w-px bg-hairline hidden sm:block" />
          <TagChip color={verdictColor} className="text-xs px-2.5 py-1">
            {verdict} PPDT Suitability
          </TagChip>
        </div>
        <span className="text-xs text-steel font-medium">
          Six-parameter SSB Evaluation
        </span>
      </div>

      {/* Five sub-scores with thin bars */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
        {subScoreList.map((item) => {
          const pct = Math.min(100, (item.score / 10) * 100);
          return (
            <div
              key={item.label}
              className="p-3 rounded-lg bg-canvas border border-hairline space-y-1.5 print:border-none print:p-1"
            >
              <span className="text-[11px] text-slate font-medium block truncate" title={item.label}>
                {item.label}
              </span>
              <div className="flex items-baseline justify-between text-xs">
                <strong className="text-ink font-semibold">{item.score.toFixed(1)}</strong>
                <span className="text-steel text-[10px]">/ 10</span>
              </div>
              <div className="w-full h-1.5 bg-hairline rounded-full overflow-hidden print:hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

