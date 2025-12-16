import { cn } from '@/lib/utils';

interface BentoSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleClassName?: string;
}

/**
 * Reusable bento-style card section for tool options and settings
 */
export function BentoSection({
  children,
  className,
  title,
  titleClassName,
}: BentoSectionProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-6',
        'dark:border-[var(--color-border-default)] dark:bg-[var(--color-bg-card)]',
        className
      )}
    >
      {title && (
        <h3
          className={cn(
            'mb-5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]',
            titleClassName
          )}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
