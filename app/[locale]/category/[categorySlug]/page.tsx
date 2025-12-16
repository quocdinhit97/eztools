import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getCategoryBySlug, getSortedCategories } from '@/config/categories';
import { registry } from '@/tools/registry';
import { BentoGrid } from '@/components/dashboard/BentoGrid';
import { Icon, type IconName } from '@/components/ui/Icon';

interface CategoryPageProps {
  params: Promise<{ locale: string; categorySlug: string }>;
}

// Generate static params for all categories and locales
export async function generateStaticParams() {
  const categories = getSortedCategories();
  const locales = routing.locales;

  return locales.flatMap((locale) =>
    categories.map((category) => ({
      locale,
      categorySlug: category.slug,
    }))
  );
}

// Generate metadata
export async function generateMetadata({ params }: CategoryPageProps) {
  const { locale, categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  const t = await getTranslations({ locale, namespace: 'categories' });
  
  // Convert category slug to translation key
  const translationKey = categorySlug.replace(/-([a-z])/g, (_, letter) =>
    letter.toUpperCase()
  );

  const title = t(translationKey);

  return {
    title,
    description: `Browse all ${title} tools`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, categorySlug } = await params;
  setRequestLocale(locale);

  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const t = await getTranslations('categories');
  
  // Convert category slug to translation key
  const translationKey = categorySlug.replace(/-([a-z])/g, (_, letter) =>
    letter.toUpperCase()
  );

  const categoryName = t(translationKey);
  const tools = registry.getToolsByCategory(category.slug);

  // Extract only serializable metadata (exclude component function)
  const toolsMetadata = tools.map(({ component, ...meta }) => meta);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Category Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent-primary)] text-white">
          <Icon name={category.icon as IconName} className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            {categoryName}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {tools.length} {tools.length === 1 ? 'tool' : 'tools'} available
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      {tools.length > 0 ? (
        <BentoGrid section="custom" customTools={toolsMetadata} />
      ) : (
        <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-12 text-center">
          <p className="text-[var(--color-text-secondary)]">
            No tools available in this category yet.
          </p>
        </div>
      )}
    </div>
  );
}
