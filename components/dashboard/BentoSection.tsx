'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';
import { type ReactNode } from 'react';

interface BentoSectionProps {
  sectionKey: string;
  children: ReactNode;
}

export function BentoSection({ sectionKey, children }: BentoSectionProps) {
  const t = useTranslations('sections');

  // Get icon based on section key
  const getIcon = () => {
    switch (sectionKey) {
      case 'popular':
        return "Star";
      default:
        return "Tools";
    }
  };

  const iconName = getIcon();

  return (
    <section className="mb-12">
      <div className="mb-6 flex items-center gap-2.5">
        {iconName && (
          <Icon
            name={iconName as any}
            className="h-5 w-5 text-red-500"
          />
        )}
        <h2 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          {t(sectionKey)}
        </h2>
      </div>
      {children}
    </section>
  );
}
