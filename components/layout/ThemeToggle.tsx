'use client';

import { useTheme } from 'next-themes';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    // Cycle through: light -> dark -> system -> light
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  if (!mounted) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full">
        <Icon name="Sun" className="h-5 w-5 opacity-0" />
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full',
        'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
        'hover:bg-[var(--color-bg-tertiary)] transition-colors'
      )}
      aria-label={`Current theme: ${theme}. Click to change.`}
      title={`Current: ${theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}`}
    >
      {theme === 'system' ? (
        <Icon name="Monitor" className="h-5 w-5" />
      ) : resolvedTheme === 'dark' ? (
        <Icon name="Moon" className="h-5 w-5" />
      ) : (
        <Icon name="Sun" className="h-5 w-5" />
      )}
    </button>
  );
}
