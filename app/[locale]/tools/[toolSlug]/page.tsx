import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { registry } from '@/tools/registry';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { routing } from '@/i18n/routing';

type Props = {
  params: Promise<{ locale: string; toolSlug: string }>;
};

// Generate static params for all tools and locales
export async function generateStaticParams() {
  const slugs = registry.getAllSlugs();
  const locales = routing.locales;

  return locales.flatMap((locale) =>
    slugs.map((toolSlug) => ({ locale, toolSlug }))
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props) {
  const { locale, toolSlug } = await params;
  const tool = registry.getToolBySlug(toolSlug);

  if (!tool) {
    return {
      title: 'Tool Not Found',
    };
  }

  const t = await getTranslations({ locale, namespace: 'tools' });

  const title = t(`${tool.i18nKey}.title`);
  const description = t(`${tool.i18nKey}.description`);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

// Loading fallback
function ToolSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-8 w-1/3 rounded bg-[var(--color-bg-tertiary)]" />
      <div className="h-96 rounded-xl bg-[var(--color-bg-tertiary)]" />
    </div>
  );
}

export default async function ToolPage({ params }: Props) {
  const { locale, toolSlug } = await params;
  setRequestLocale(locale);

  const tool = registry.getToolBySlug(toolSlug);

  console.log('Rendering tool page for:', toolSlug, 'in locale:', locale);

  if (!tool) {
    notFound();
  }

  // Dynamically import the tool component
  const ToolComponent = (await tool.component()).default;

  // Extract metadata (without the component function)
  const { component: _, ...toolMeta } = tool;

  return (
    <ToolLayout tool={toolMeta}>
      <Suspense fallback={<ToolSkeleton />}>
        <ToolComponent />
      </Suspense>
    </ToolLayout>
  );
}
