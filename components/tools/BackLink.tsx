'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/ui/Icon';

interface BackLinkProps {
  href?: string;
  labelKey?: 'backToHome' | 'backToTools';
}

export function BackLink({
  href = '/',
  labelKey = 'backToHome',
}: BackLinkProps) {
  const t = useTranslations('common');

  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
    >
      <Icon name="ArrowLeft" className="h-4 w-4" />
      <span>{t(labelKey)}</span>
    </Link>
  );
}
