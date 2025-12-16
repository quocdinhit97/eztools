import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

interface HistoryPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HistoryPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });

  return {
    title: t('history'),
  };
}

export default async function HistoryPage({ params }: HistoryPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('nav');

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold text-[var(--color-text-primary)]">
        {t('history')}
      </h1>
      <p className="text-[var(--color-text-secondary)]">
        Your recently used tools will appear here.
      </p>
    </div>
  );
}
