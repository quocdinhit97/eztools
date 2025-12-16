'use client';

import { useTranslations } from 'next-intl';
import { Icon, type IconName } from '@/components/ui/Icon';
import { type ToolMeta } from '@/tools/types';

interface ToolHeaderProps {
  tool: ToolMeta;
}

export function ToolHeader({ tool }: ToolHeaderProps) {
  const t = useTranslations('tools');

  const title = t(`${tool.i18nKey}.title`);
  const description = t(`${tool.i18nKey}.description`);

  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-bg-tertiary)]">
          <Icon
            name={tool.icon as IconName}
            className="h-6 w-6 text-[var(--color-accent-primary)]"
          />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          {title}
        </h1>
      </div>
      <p className="text-[var(--color-text-secondary)]">{description}</p>
    </div>
  );
}
