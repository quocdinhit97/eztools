import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

interface FavoritesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: FavoritesPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });

  return {
    title: t('favorites'),
  };
}

export default async function FavoritesPage({ params }: FavoritesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('nav');

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold text-[var(--color-text-primary)]">
        {t('favorites')}
      </h1>
      <p className="text-[var(--color-text-secondary)]">
        Your favorite tools will appear here. Start by marking tools as
        favorites from the dashboard.
      </p>
    </div>
  );
}
