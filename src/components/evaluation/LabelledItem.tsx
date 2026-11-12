'use client';

import React from 'react';
import { Quote } from 'lucide-react';
import { TagChip } from '@/components/ui';
import { OlqBasis } from '@/lib/assessor/types';

interface LabelledItemProps {
  label: string;
  text: string;
  quote?: string | null;
  basis?: OlqBasis;
  className?: string;
}

export default function LabelledItem({
  label,
  text,
  quote,
  basis,
  className = '',
}: LabelledItemProps) {
  let basisColor: 'green' | 'yellow' | 'gray' = 'gray';
  let basisLabel = 'Not demonstrated';
  if (basis === 'present_in_story') {
    basisColor = 'green';
    basisLabel = 'Present in story';
  } else if (basis === 'inferred') {
    basisColor = 'yellow';
    basisLabel = 'Inferred';
  }

  return (
    <div className={`space-y-1.5 text-[15px] sm:text-[16px] leading-[1.65] text-charcoal ${className}`}>
      <div className="flex flex-wrap items-baseline gap-2">
        <strong className="font-semibold text-ink">{label}:</strong>
        {basis && (
          <TagChip color={basisColor} className="text-[11px] px-2 py-0.5 font-medium">
            {basisLabel}
          </TagChip>
        )}
        <span>{text}</span>
      </div>

      {/* Grounded excerpt from student's story */}
      {quote && (
        <div className="text-xs sm:text-[13px] text-steel italic pl-3 border-l-2 border-primary/50 mt-1 flex items-start gap-1.5 print:text-black">
          <Quote className="w-3.5 h-3.5 text-steel/70 shrink-0 mt-0.5 print:hidden" />
          <span>From your story: &ldquo;{quote}&rdquo;</span>
        </div>
      )}
    </div>
  );
}

