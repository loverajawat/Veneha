'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { PPDTPicture } from '@/data/pictures';

interface StoryPanelProps {
  confirmedStory: string;
  picture?: PPDTPicture | null;
  createdAt?: string;
}

export default function StoryPanel({ confirmedStory, picture, createdAt }: StoryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!confirmedStory) return null;

  const wordCount = confirmedStory.split(/\s+/).filter(Boolean).length;
  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) : 'Today';

  return (
    <div className="rounded-xl border border-hairline bg-surface overflow-hidden print:border-none print:p-0">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-canvas transition-colors cursor-pointer select-none print:hidden"
        aria-expanded={isExpanded}
        aria-label="Toggle candidate original story view"
      >
        <div className="flex items-center gap-3 min-w-0">
          {picture ? (
            <img
              src={picture.path}
              alt={picture.title}
              className="w-10 h-8 object-cover rounded border border-hairline shrink-0"
            />
          ) : (
            <div className="w-10 h-8 rounded bg-canvas border border-hairline flex items-center justify-center text-slate">
              <FileText className="w-4 h-4" />
            </div>
          )}
          <div className="text-xs min-w-0">
            <span className="font-semibold text-charcoal block truncate">
              {picture?.title || 'Your Submitted Story'}
            </span>
            <span className="text-steel text-[11px]">
              {wordCount} words · {formattedDate} · Click to {isExpanded ? 'collapse' : 'view original text'}
            </span>
          </div>
        </div>

        <span className="text-slate p-1 shrink-0">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {/* Expanded Story Body */}
      {isExpanded && (
        <div className="px-4 py-3.5 border-t border-hairline bg-canvas/60 text-xs sm:text-[13px] text-charcoal font-sans leading-relaxed whitespace-pre-wrap">
          {confirmedStory}
        </div>
      )}

      {/* Print View: Always visible when printing */}
      <div className="hidden print:block p-2 text-xs border-b border-hairline">
        <strong className="block mb-1 font-semibold">Candidate Story ({wordCount} words):</strong>
        <p className="whitespace-pre-wrap text-slate leading-relaxed">{confirmedStory}</p>
      </div>
    </div>
  );
}

