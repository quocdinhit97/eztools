import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Supported locales
  locales: ['en', 'vi'],

  // Default locale
  defaultLocale: 'en',

  // Always show locale prefix in URL (/en/tools/..., /vi/tools/...)
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];
