'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Icon } from '@/components/ui/Icon';
import { FlagIcon } from '@/components/ui/FlagIcon';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { trackFeatureUsage } from '@/lib/analytics';

const LANGUAGES = [
  { code: 'en', label: 'English', flagCode: 'uk' as const },
  { code: 'vi', label: 'Tiếng Việt', flagCode: 'vn' as const },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common');

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = LANGUAGES.find((lang) => lang.code === locale);

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
    trackFeatureUsage('language', 'change', newLocale);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex h-10 items-center gap-2 rounded-full px-3',
          'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
          'hover:bg-[var(--color-bg-tertiary)] transition-colors',
          'border border-[var(--color-border-default)]'
        )}
        aria-label="Change language"
      >
        {/* <Icon name="Intern" className="h-4 w-4" /> */}
        {currentLanguage && <FlagIcon country={currentLanguage.flagCode} className="w-5 h-4" />}
        <Icon
          name={isOpen ? 'ChevronUp' : 'ChevronDown'}
          className="h-3 w-3"
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute right-0 top-full mt-2 w-48',
            'rounded-xl border border-[var(--color-border-default)]',
            'bg-[var(--color-bg-primary)] shadow-lg',
            'py-2 z-50'
          )}
        >
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2.5',
                'text-sm transition-colors',
                locale === language.code
                  ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-medium'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
              )}
            >
              <FlagIcon country={language.flagCode} className="w-5 h-4" />
              <span>{language.label}</span>
              {locale === language.code && (
                <Icon name="Check" className="ml-auto h-4 w-4" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
