'use client';

import { useTranslations } from 'next-intl';
import { SearchBar } from './SearchBar';

export function Hero() {
  const t = useTranslations('hero');

  return (
    <div className="mb-10 flex flex-col items-center text-center">
      <h1 className="mb-8 max-w-3xl font-serif text-4xl font-normal tracking-tight text-[var(--color-text-primary)] md:text-5xl lg:text-6xl">
        {t('title')}
      </h1>
      <SearchBar />
    </div>
  );
}
