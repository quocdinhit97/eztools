import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

interface SettingsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: SettingsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });

  return {
    title: t('settings'),
  };
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('nav');

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold text-[var(--color-text-primary)]">
        {t('settings')}
      </h1>
      
      <div className="space-y-6">
        <section className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-6">
          <h2 className="mb-4 text-xl font-semibold text-[var(--color-text-primary)]">
            Preferences
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            Theme, language, and other preferences will be available here.
          </p>
        </section>

        <section className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-6">
          <h2 className="mb-4 text-xl font-semibold text-[var(--color-text-primary)]">
            Account
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            Manage your account settings and preferences.
          </p>
        </section>
      </div>
    </div>
  );
}
