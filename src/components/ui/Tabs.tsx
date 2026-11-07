import React from 'react';

interface PillTabProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function PillTab({ active, onClick, children, className = '' }: PillTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[44px] md:min-h-[36px] px-[16px] py-[8px] rounded-full text-[14px] font-medium transition-all select-none cursor-pointer ${
        active
          ? 'bg-ink-deep text-on-dark border border-ink-deep shadow-sm'
          : 'bg-transparent text-steel border border-hairline hover:border-hairline-strong hover:text-ink'
      } ${className}`}
    >
      {children}
    </button>
  );
}

interface SegmentedTabProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function SegmentedTab({ active, onClick, children, className = '' }: SegmentedTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-[16px] py-[12px] text-[14px] font-medium transition-all select-none cursor-pointer border-b-2 -mb-[1px] ${
        active
          ? 'text-ink border-ink font-semibold'
          : 'text-steel border-transparent hover:text-ink hover:border-hairline-strong'
      } ${className}`}
    >
      {children}
    </button>
  );
}
