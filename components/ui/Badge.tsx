import { cn } from '@/lib/utils';
import { type HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'pro';
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        {
          default:
            'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
          secondary:
            'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border-default)]',
          success:
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
          warning:
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
          error:
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
          pro: 'bg-[var(--color-pro-badge-bg)] text-[var(--color-pro-badge-text)]',
        }[variant],
        className
      )}
      {...props}
    />
  );
}
