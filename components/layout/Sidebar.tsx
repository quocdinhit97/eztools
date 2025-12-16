'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/ui/Icon';
import { SidebarNav } from './SidebarNav';
import { SidebarCategories } from './SidebarCategories';
import { SidebarDonation } from './SidebarDonation';
import Image from 'next/image';

export function Sidebar() {
  const t = useTranslations('common');

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[var(--sidebar-width)] flex-col border-r border-gray-200 bg-white dark:border-[var(--color-border-subtle)] dark:bg-[var(--color-bg-sidebar)]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center">
            <Image src="/eztools.png" alt="EzTools Logo" width={36} height={36} className="rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-[var(--color-text-primary)]">
              {t('appName')}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              {t('tagline')}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <SidebarNav />

        {/* Divider */}
        <div className="my-5 h-px bg-gray-100 dark:bg-[var(--color-border-subtle)]" />

        {/* Categories */}
        <SidebarCategories />
      </div>

      {/* Pro Plan Card */}
      <div className="border-t border-gray-100 p-4 dark:border-[var(--color-border-subtle)]">
        <SidebarDonation />
      </div>
    </aside>
  );
}
