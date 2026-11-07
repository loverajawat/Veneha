import React from 'react';

export type CardTint =
  | 'peach'
  | 'rose'
  | 'mint'
  | 'lavender'
  | 'sky'
  | 'yellow'
  | 'yellow-bold'
  | 'cream'
  | 'gray';

interface CardBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  clickable?: boolean;
  children: React.ReactNode;
}

export function CardBase({ clickable = false, className = '', children, ...props }: CardBaseProps) {
  return (
    <div
      className={`bg-canvas rounded-lg p-6 border border-hairline ${
        clickable ? 'hover:shadow-level1 transition-shadow cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tint?: CardTint;
  children: React.ReactNode;
}

const tintClassMap: Record<CardTint, string> = {
  peach: 'bg-card-tint-peach',
  rose: 'bg-card-tint-rose',
  mint: 'bg-card-tint-mint',
  lavender: 'bg-card-tint-lavender',
  sky: 'bg-card-tint-sky',
  yellow: 'bg-card-tint-yellow',
  'yellow-bold': 'bg-card-tint-yellow-bold',
  cream: 'bg-card-tint-cream',
  gray: 'bg-card-tint-gray',
};

export function FeatureCard({ tint = 'cream', className = '', children, ...props }: FeatureCardProps) {
  const bgClass = tintClassMap[tint] || 'bg-card-tint-cream';
  return (
    <div className={`rounded-lg p-8 text-charcoal ${bgClass} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function YellowBoldBanner({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-card-tint-yellow-bold rounded-lg p-8 text-charcoal ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

