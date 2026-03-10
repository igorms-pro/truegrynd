import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'fr', 'es', 'pt', 'pt-BR', 'ja', 'zh', 'de', 'it', 'ru'],

  // Used when no locale matches
  defaultLocale: 'en',
});
