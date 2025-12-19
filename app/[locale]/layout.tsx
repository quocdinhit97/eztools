import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import { routing } from '@/i18n/routing';
import { Providers } from '@/components/providers/Providers';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400'],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const titles = {
    en: 'EzTools - Simple tools, smarter work',
    vi: 'EzTools - Công cụ đơn giản, làm việc thông minh hơn',
  };

  const descriptions = {
    en: 'EzTools helps you solve everyday tasks faster, easier, and smarter, all in one place',
    vi: 'Mọi công cụ, một nơi',
  };

  return {
    title: {
      default: titles[locale as keyof typeof titles] || titles.en,
      template: '%s | EzTools',
    },
    description:
      descriptions[locale as keyof typeof descriptions] || descriptions.en,
    icons: {
      icon: '/eztools.ico',
      shortcut: '/eztools.ico',
      apple: '/eztools.ico',
    },
  };
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for this locale
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="flex min-h-screen">
              {/* Sidebar */}
              <Sidebar />

              {/* Main content area */}
              <div className="ml-[var(--sidebar-width)] flex-1">
                <Header />
                <main className="min-h-[calc(100vh-var(--header-height))]">
                  {children}
                </main>
              </div>
            </div>
          </Providers>
        </NextIntlClientProvider>
        <GoogleAnalytics gaId="G-TNXXTD33WN" />
      </body>
    </html>
  );
}
