'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface SystemStatusProps {
  status?: 'online' | 'degraded' | 'offline';
}

export function SystemStatus({ status = 'online' }: SystemStatusProps) {
  const t = useTranslations('common');

  const statusConfig = {
    online: {
      color: 'bg-[var(--color-status-online)]',
      text: t('systemStable'),
    },
    degraded: {
      color: 'bg-yellow-500',
      text: 'Degraded performance',
    },
    offline: {
      color: 'bg-red-500',
      text: 'System offline',
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border border-[var(--color-border-default)] px-3 py-1.5',
        'text-sm text-[var(--color-text-secondary)]'
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', config.color)} />
      <span>{config.text}</span>
    </div>
  );
}
