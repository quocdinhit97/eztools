'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Icon, type IconName } from '@/components/ui/Icon';
import { mainNavItems } from '@/config/navigation';
import { cn } from '@/lib/utils';

export function SidebarNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {mainNavItems.map((item) => {
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-gray-100 text-[var(--color-text-primary)] dark:bg-[var(--color-bg-tertiary)]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-[var(--color-text-primary)] dark:text-[var(--color-text-secondary)] dark:hover:bg-[var(--color-bg-tertiary)]'
            )}
          >
            <Icon
              name={item.icon as IconName}
              className="h-4 w-4 text-gray-500 dark:text-[var(--color-text-tertiary)]"
            />
            <span>{t(item.key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
