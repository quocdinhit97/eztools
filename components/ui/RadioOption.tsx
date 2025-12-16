'use client';

import { cn } from '@/lib/utils';

interface RadioOptionProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  className?: string;
}

export function RadioOption({
  name,
  value,
  checked,
  onChange,
  label,
  className,
}: RadioOptionProps) {
  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center gap-2.5 rounded-lg border px-4 py-2.5 transition-all whitespace-nowrap',
        checked
          ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
          : 'border-[var(--color-border-default)] bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-tertiary)]',
        className
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded-sm border border-[var(--color-border-default)] accent-orange-500"
      />
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}
