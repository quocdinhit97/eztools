'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TwoPanelProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  className?: string;
}

export function TwoPanel({ leftPanel, rightPanel, className }: TwoPanelProps) {
  return (
    <div className={cn('two-panel', className)}>
      <div className="flex flex-col">{leftPanel}</div>
      <div className="flex flex-col">{rightPanel}</div>
    </div>
  );
}

interface PanelProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, actions, children, className }: PanelProps) {
  return (
    <div
      className={cn(
        'flex min-h-0 flex-col rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)]',
        className
      )}
    >
      {/* Panel header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-[var(--color-border-subtle)] px-5 py-3.5">
        <span className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
          {title}
        </span>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Panel content */}
      <div className="min-h-0 flex-1 overflow-hidden p-5">{children}</div>
    </div>
  );
}
