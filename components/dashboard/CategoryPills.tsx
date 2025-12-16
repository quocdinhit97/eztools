'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { getSortedCategories } from '@/config/categories';
import { cn } from '@/lib/utils';

export function CategoryPills() {
  const t = useTranslations('categories');
  const pathname = usePathname();
  const categories = getSortedCategories();

  const allCategories = [
    { slug: null, labelKey: 'all', href: '/' },
    ...categories.map((c) => ({
      slug: c.slug,
      href: `/category/${c.slug}`,
      // Convert slug to translation key (e.g., 'qr-code' -> 'qrCode')
      labelKey: c.slug.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()),
    })),
  ];

  return (
    <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
      {allCategories.map((category) => {
        const isActive = category.slug === null
          ? pathname === '/'
          : pathname.startsWith(`/category/${category.slug}`);

        return (
          <Link
            key={category.slug ?? 'all'}
            href={category.href}
            className={cn(
              'rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-[var(--color-pill-active-bg)] text-[var(--color-pill-active-text)] shadow-sm'
                : 'bg-[var(--color-pill-inactive-bg)] text-[var(--color-pill-inactive-text)] hover:bg-[var(--color-bg-tertiary)] hover:shadow-sm'
            )}
          >
            {t(category.labelKey)}
          </Link>
        );
      })}
    </div>
  );
}
