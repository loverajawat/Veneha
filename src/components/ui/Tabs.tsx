import React from 'react';

interface PillTabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function PillTab({ active, onClick, children, className = '', ...props }: PillTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`group min-h-[44px] md:min-h-[36px] px-[16px] py-[8px] rounded-full text-[14px] font-medium transition-all select-none cursor-pointer inline-flex items-center justify-center gap-1.5 shrink-0 ${
        active
          ? 'bg-[#18181b] text-white border border-[#18181b] shadow-sm dark:bg-primary dark:text-white dark:border-primary [&_svg]:!text-white [&_*]:!text-white'
          : 'bg-white text-slate border border-hairline hover:bg-surface hover:text-ink hover:border-hairline-strong dark:bg-surface dark:text-slate dark:border-hairline dark:hover:bg-[#1e293b] dark:hover:text-white dark:hover:border-hairline-strong [&_svg]:text-slate group-hover:[&_svg]:text-ink dark:[&_svg]:text-slate dark:group-hover:[&_svg]:text-white'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface SegmentedTabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function SegmentedTab({ active, onClick, children, className = '', ...props }: SegmentedTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`px-[16px] py-[12px] text-[14px] font-medium transition-all select-none cursor-pointer border-b-2 -mb-[1px] inline-flex items-center gap-1.5 ${
        active
          ? 'text-ink border-ink font-semibold dark:text-white dark:border-primary [&_svg]:!text-ink dark:[&_svg]:!text-white'
          : 'text-steel border-transparent hover:text-ink hover:border-hairline-strong dark:text-slate dark:hover:text-white [&_svg]:text-steel hover:[&_svg]:text-ink dark:[&_svg]:text-slate dark:hover:[&_svg]:text-white'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

