import React from 'react';

export type SolidBadgeColor = 'purple' | 'pink' | 'orange';
export type TagBadgeColor = 'purple' | 'orange' | 'green' | 'gray';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: SolidBadgeColor;
  children: React.ReactNode;
}

export function Badge({ color = 'purple', className = '', children, ...props }: BadgeProps) {
  let colorStyles = 'bg-primary text-on-primary';
  if (color === 'pink') colorStyles = 'bg-brand-pink text-on-primary';
  if (color === 'orange') colorStyles = 'bg-brand-orange text-on-primary';

  return (
    <span
      className={`inline-flex items-center justify-center font-semibold text-[13px] leading-[1.40] rounded-full px-[10px] py-[4px] ${colorStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

interface TagChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: TagBadgeColor;
  children: React.ReactNode;
}

export function TagChip({ color = 'purple', className = '', children, ...props }: TagChipProps) {
  let colorStyles = 'bg-card-tint-lavender text-brand-purple-800';
  if (color === 'orange') colorStyles = 'bg-card-tint-peach text-brand-orange-deep';
  if (color === 'green') colorStyles = 'bg-card-tint-mint text-brand-green';
  if (color === 'gray') colorStyles = 'bg-card-tint-gray text-slate';

  return (
    <span
      className={`inline-flex items-center justify-center font-semibold text-[12px] leading-[1.40] rounded-sm px-[8px] py-[2px] ${colorStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
