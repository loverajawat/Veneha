import React from 'react';

interface OLQBadgeProps {
  name: string;
  factor?: string;
  score?: number;
  showFactor?: boolean;
}

export default function OLQBadge({ name, factor, score, showFactor = false }: OLQBadgeProps) {
  // Determine factor color styling
  let factorClass = 'bg-blue-950/60 text-blue-300 border-blue-700/60';
  let dotColor = 'bg-blue-400';

  if (factor?.includes('Social Adjustment') || factor?.includes('Factor 2')) {
    factorClass = 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60';
    dotColor = 'bg-emerald-400';
  } else if (factor?.includes('Social Effectiveness') || factor?.includes('Factor 3')) {
    factorClass = 'bg-amber-950/60 text-amber-300 border-amber-700/60';
    dotColor = 'bg-amber-400';
  } else if (factor?.includes('Dynamic') || factor?.includes('Factor 4')) {
    factorClass = 'bg-rose-950/60 text-rose-300 border-rose-700/60';
    dotColor = 'bg-rose-400';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${factorClass} transition-transform hover:scale-[1.02]`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{name}</span>
      {score !== undefined && (
        <span className="ml-1 px-1.5 py-0.2 bg-black/40 rounded text-[10px] text-white">
          {score}/10
        </span>
      )}
      {showFactor && factor && (
        <span className="text-[10px] opacity-75 font-normal ml-1">
          ({factor.split(':')[0]})
        </span>
      )}
    </span>
  );
}

