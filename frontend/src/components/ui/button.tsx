import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:pointer-events-none active:scale-[0.99] select-none';

    const normalizedVariant = variant === 'default' ? 'primary' : variant;

    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-neutral-800 shadow-xs',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-neutral-200 border border-border/60',
      outline: 'bg-background border border-border text-foreground hover:bg-secondary',
      ghost: 'bg-transparent text-foreground hover:bg-secondary',
      destructive: 'bg-neutral-900 text-white hover:bg-black',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 h-8 gap-1.5',
      md: 'text-sm px-3.5 py-2 h-9 gap-2',
      lg: 'text-base px-5 py-2.5 h-10 gap-2.5',
      icon: 'h-8 w-8 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[normalizedVariant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
