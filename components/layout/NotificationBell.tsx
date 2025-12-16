'use client';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  hasNotifications?: boolean;
}

export function NotificationBell({ hasNotifications = false }: NotificationBellProps) {
  return (
    <button
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-full',
        'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
        'hover:bg-[var(--color-bg-tertiary)] transition-colors'
      )}
      aria-label="Notifications"
    >
      <Icon name="Bell" className="h-5 w-5" />
      {hasNotifications && (
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--color-accent-primary)]" />
      )}
    </button>
  );
}
