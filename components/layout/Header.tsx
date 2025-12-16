'use client';

import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationBell } from './NotificationBell';
import { UserAvatar } from './UserAvatar';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-4 border-b border-gray-100 bg-white px-6 dark:border-[var(--color-border-subtle)] dark:bg-[var(--color-bg-primary)]">
      <LanguageSwitcher />
      <ThemeToggle />
      <NotificationBell />
      <UserAvatar />
    </header>
  );
}
