import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export type AlertType = 'success' | 'warning' | 'error' | 'info';

interface AlertProps {
  type?: AlertType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Alert({ type = 'warning', title, children, className = '' }: AlertProps) {
  let borderClass = 'border-semantic-warning bg-card-tint-yellow/60 text-charcoal';
  let Icon = AlertTriangle;
  let iconColor = 'text-semantic-warning';

  if (type === 'success') {
    borderClass = 'border-semantic-success bg-card-tint-mint/60 text-charcoal';
    Icon = CheckCircle2;
    iconColor = 'text-semantic-success';
  } else if (type === 'error') {
    borderClass = 'border-semantic-error bg-card-tint-rose/60 text-charcoal';
    Icon = AlertCircle;
    iconColor = 'text-semantic-error';
  } else if (type === 'info') {
    borderClass = 'border-hairline-strong bg-card-tint-sky/60 text-charcoal';
    Icon = Info;
    iconColor = 'text-link-blue';
  }

  return (
    <div className={`flex items-start gap-3 p-4 rounded-md border ${borderClass} ${className}`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
      <div className="text-[14px] leading-relaxed">
        {title && <div className="font-semibold mb-0.5">{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-card-tint-gray rounded-md ${className}`} />;
}

