import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/dashboard/Hero';
import { CategoryPills } from '@/components/dashboard/CategoryPills';
import { BentoSection } from '@/components/dashboard/BentoSection';
import { BentoGrid } from '@/components/dashboard/BentoGrid';
import { registry } from '@/tools/registry';
import { categories } from '@/config/categories';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Get all categories that have enabled tools
  const categoriesWithTools = registry.getCategoriesWithTools();
  const sortedCategories = categories
    .filter((cat) => categoriesWithTools.includes(cat.slug))
    .sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Hero Section */}
      <Hero />

      {/* Category Pills */}
      <CategoryPills />

      {/* Popular Tools Section */}
      <BentoSection sectionKey="popular">
        <BentoGrid section="popular" />
      </BentoSection>

      {/* Dynamic Category Sections - Only show categories with enabled tools */}
      {sortedCategories.map((category) => (
        <BentoSection key={category.slug} sectionKey={category.slug}>
          <BentoGrid section={category.slug} />
        </BentoSection>
      ))}
    </div>
  );
}
