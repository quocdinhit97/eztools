import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'rounded-full',

          // Variants
          {
            // Primary - dark button
            primary:
              'bg-[var(--color-text-primary)] text-[var(--color-text-inverse)] hover:opacity-90',
            // Secondary - light button with border
            secondary:
              'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] border border-[var(--color-border-default)] hover:bg-[var(--color-bg-secondary)]',
            // Ghost - no background
            ghost:
              'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]',
            // Outline - border only
            outline:
              'border border-[var(--color-border-default)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]',
            // Danger - red
            danger:
              'bg-[var(--color-accent-error)] text-white hover:bg-[var(--color-accent-error)]/90',
          }[variant],

          // Sizes
          {
            sm: 'h-8 px-3 text-sm',
            md: 'h-10 px-4 text-sm',
            lg: 'h-12 px-6 text-base',
            icon: 'h-10 w-10 p-0',
          }[size],

          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
