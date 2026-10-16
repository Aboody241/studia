import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({
  className = '',
  variant = 'default',
  children,
  ...props
}) => {
  const base = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium leading-normal select-none';

  const variants = {
    default: 'bg-secondary text-muted-foreground border border-border',
    primary: 'bg-primary text-primary-foreground',
    success: 'bg-secondary text-foreground border border-border',
    warning: 'bg-neutral-100 text-neutral-800 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700',
    destructive: 'bg-neutral-900 text-white dark:bg-white dark:text-black',
    outline: 'bg-transparent text-foreground border border-border',
  };

  return (
    <span className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
