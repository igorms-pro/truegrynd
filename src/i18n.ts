import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'fr'];

export default getRequestConfig(async (params) => {
  const locale = params.locale;

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale)) notFound();

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
  };
});
