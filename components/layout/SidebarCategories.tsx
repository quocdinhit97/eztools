'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Icon, type IconName } from '@/components/ui/Icon';
import { getSortedCategories } from '@/config/categories';
import { registry } from '@/tools/registry';
import { cn } from '@/lib/utils';
import { trackNavigation } from '@/lib/analytics';

export function SidebarCategories() {
  const t = useTranslations('categories');
  const tTools = useTranslations('tools');
  const pathname = usePathname();
  const categories = getSortedCategories();

  // Check if we're on a tool page
  const getIsToolActive = (toolSlug: string) => {
    return pathname.includes(`/tools/${toolSlug}`);
  };

  // Filter categories that have enabled tools
  const categoriesWithTools = categories.filter((category) => {
    const tools = registry.getToolsByCategory(category.slug as any);
    return tools.length > 0;
  });

  return (
    <div className="flex flex-col">
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[var(--color-text-tertiary)]">
        {t('title')}
      </p>
      <nav className="flex flex-col">
        {categoriesWithTools.map((category, index) => {
          const translationKey = category.slug.replace(/-([a-z])/g, (_, letter) =>
            letter.toUpperCase()
          );

          // Get tools for this category
          const categoryTools = registry.getToolsByCategory(category.slug as any);

          return (
            <div key={category.slug}>
              {/* Category Section */}
              <div className="px-3 py-2">
                {/* Category Title - Bold, no icon */}
                <div className="mb-2 px-3">
                  <span className="text-sm font-semibold text-gray-700 dark:text-[var(--color-text-primary)]">
                    {t(translationKey)}
                  </span>
                </div>

                {/* Tools List - Same level as category */}
                {categoryTools.length > 0 && (
                  <div className="flex flex-col gap-0.5">
                    {categoryTools.map((tool) => {
                      const isToolActiveState = getIsToolActive(tool.slug);
                      const toolTranslationKey = tool.slug.replace(/-([a-z])/g, (_, letter) =>
                        letter.toUpperCase()
                      );

                      return (
                        <Link
                          key={tool.slug}
                          href={`/tools/${tool.slug}`}
                          onClick={() => trackNavigation(`/tools/${tool.slug}`, 'sidebar-categories', 'click')}
                          className={cn(
                            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                            isToolActiveState
                              ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-[var(--color-text-primary)] dark:text-[var(--color-text-secondary)] dark:hover:bg-[var(--color-bg-tertiary)]'
                          )}
                        >
                          <Icon
                            name={tool.icon as IconName}
                            className={cn(
                              'h-4 w-4',
                              isToolActiveState
                                ? 'text-orange-500 dark:text-orange-400'
                                : 'text-gray-400 dark:text-[var(--color-text-tertiary)]'
                            )}
                          />
                          <span className="text-sm">
                            {tTools(`${toolTranslationKey}.title`)}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Divider between categories (except last one) */}
              {index < categoriesWithTools.length - 1 && (
                <div className="my-2 h-px bg-gray-100 dark:bg-[var(--color-border-subtle)]" />
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
