'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export type BentoSize = 'small' | 'medium' | 'large';

interface BentoCardProps {
  slug: string;
  icon: string;
  size: BentoSize;
  isPro?: boolean;
  hasPreview?: boolean;
  badge?: string;
  previewContent?: React.ReactNode;
}

export function BentoCard({
  slug,
  icon,
  size,
  isPro = false,
  hasPreview = false,
  badge,
  previewContent,
}: BentoCardProps) {
  const t = useTranslations('tools');

  // Get the namespace key from slug (e.g., 'json-formatter' -> 'jsonFormatter')
  const namespaceKey = slug.replace(/-([a-z])/g, (_, letter) =>
    letter.toUpperCase()
  );

  // Safely get translations with fallbacks
  const title = t(`${namespaceKey}.title`);
  const description = t(`${namespaceKey}.description`);

  const sizeClasses = {
    small: 'bento-small',
    medium: 'bento-medium',
    large: 'bento-large',
  };

  // Icon color variations based on tool
  const getIconColor = (slug: string) => {
    const colors = {
      'json-formatter': 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400',
      'uuid-generator': 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
      'http-client': 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400',
      'vietqr-generator': 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400',
    };
    return colors[slug as keyof typeof colors] || 'bg-gray-50 text-gray-600 dark:bg-gray-950/30 dark:text-gray-400';
  };

  return (
    <Link
      href={`/tools/${slug}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-6',
        'shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5',
        sizeClasses[size]
      )}
    >
      {/* Arrow icon for navigation */}
      <div className="absolute right-5 top-5 rounded-lg bg-gray-100 p-1.5 opacity-0 transition-all group-hover:opacity-100 dark:bg-gray-800">
        <Icon
          name="ArrowUpRight"
          className="h-4 w-4 text-gray-600 dark:text-gray-400"
        />
      </div>

      {/* Icon */}
      <div
        className={cn(
          'mb-4 flex items-center justify-center rounded-2xl',
          size === 'large' ? 'h-14 w-14' : 'h-12 w-12',
          getIconColor(slug)
        )}
      >
        <Icon
          name={icon as IconName}
          className={cn(
            size === 'large' ? 'h-7 w-7' : 'h-6 w-6'
          )}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col">
        <div className="mb-2 flex items-center gap-2">
          <h3
            className={cn(
              'text-[var(--color-text-primary)]',
              size === 'large' ? 'text-2xl font-semibold' : 'text-lg font-semibold'
            )}
          >
            {title}
          </h3>
          {badge && (
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium uppercase text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {badge}
            </span>
          )}
          {isPro && <Badge variant="pro">PRO</Badge>}
        </div>

        {/* Description - show on medium and large */}
        {size !== 'small' && (
          <p
            className={cn(
              'text-[var(--color-text-secondary)]',
              size === 'large' ? 'text-base leading-relaxed' : 'text-sm',
              'line-clamp-2'
            )}
          >
            {description}
          </p>
        )}

        {/* Preview area for large cards */}
        {size === 'large' && hasPreview && (
          <div className="mt-4 flex-1">
            {previewContent || <DefaultCodePreview />}
          </div>
        )}
      </div>
    </Link>
  );
}

// Default code preview for JSON formatter card
function DefaultCodePreview() {
  return (
    <div className="overflow-hidden rounded-xl bg-[var(--color-bg-code)] p-4 shadow-sm">
      {/* Fake window controls */}
      <div className="mb-3 flex gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
      </div>

      {/* Code content */}
      <pre className="text-sm leading-relaxed">
        <code>
          <span className="text-[var(--color-code-keyword)]">const</span>{' '}
          <span className="text-[var(--color-code-property)]">data</span> = {'{'}
          {'\n'}
          {'  '}
          <span className="text-[var(--color-code-string)]">
            &quot;status&quot;
          </span>
          : <span className="text-[var(--color-code-string)]">&quot;success&quot;</span>,{'\n'}
          {'  '}
          <span className="text-[var(--color-code-string)]">&quot;id&quot;</span>:{' '}
          <span className="text-[var(--color-code-number)]">2451</span>,{'\n'}
          {'  '}
          <span className="text-[var(--color-code-string)]">
            &quot;message&quot;
          </span>
          : <span className="text-[var(--color-code-string)]">&quot;Valid JSON&quot;</span>
          {'\n'}
          {'}'};
        </code>
      </pre>
    </div>
  );
}
