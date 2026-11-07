import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'dark'
  | 'secondary'
  | 'on-dark'
  | 'secondary-on-dark'
  | 'ghost'
  | 'link';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', fullWidth = false, className = '', disabled, children, ...props }, ref) => {
    let baseStyles =
      'inline-flex items-center justify-center font-medium text-[14px] leading-[1.30] transition-colors cursor-pointer select-none disabled:cursor-not-allowed';

    // 8px radius for all buttons except ghost (6px) and link (0)
    let variantStyles = '';

    switch (variant) {
      case 'primary':
        variantStyles = disabled
          ? 'bg-hairline text-muted rounded-md px-[18px] py-[10px]'
          : 'bg-primary text-on-primary hover:bg-primary-pressed active:bg-primary-deep rounded-md px-[18px] py-[10px] shadow-sm';
        break;

      case 'dark':
        variantStyles = disabled
          ? 'bg-hairline text-muted rounded-md px-[18px] py-[10px]'
          : 'bg-ink-deep text-on-dark hover:bg-charcoal active:bg-ink rounded-md px-[18px] py-[10px]';
        break;

      case 'secondary':
        variantStyles = disabled
          ? 'border border-hairline bg-transparent text-muted rounded-md px-[18px] py-[10px]'
          : 'border border-hairline-strong bg-transparent text-ink hover:bg-surface active:bg-surface-soft rounded-md px-[18px] py-[10px]';
        break;

      case 'on-dark':
        variantStyles = disabled
          ? 'bg-hairline text-muted rounded-md px-[18px] py-[10px]'
          : 'bg-on-dark text-ink hover:bg-surface active:bg-surface-soft rounded-md px-[18px] py-[10px] shadow-sm';
        break;

      case 'secondary-on-dark':
        variantStyles = disabled
          ? 'border border-hairline/30 bg-transparent text-on-dark-muted/50 rounded-md px-[18px] py-[10px]'
          : 'border border-on-dark-muted/60 bg-transparent text-on-dark hover:border-on-dark hover:bg-white/10 active:bg-white/15 rounded-md px-[18px] py-[10px]';
        break;

      case 'ghost':
        variantStyles = disabled
          ? 'bg-transparent text-muted rounded-sm px-[12px] py-[8px]'
          : 'bg-transparent text-ink hover:bg-surface active:bg-surface-soft rounded-sm px-[12px] py-[8px]';
        break;

      case 'link':
        variantStyles = disabled
          ? 'text-muted p-0 underline'
          : 'text-link-blue hover:text-link-blue-pressed p-0 hover:underline';
        break;
    }

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${variantStyles} ${widthStyle} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

