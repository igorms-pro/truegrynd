import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'fr', 'es', 'pt', 'pt-BR', 'ja', 'zh', 'de', 'it', 'ru'] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  if (!locale || !locales.includes(locale as (typeof locales)[number])) notFound();

  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default,
  };
});
