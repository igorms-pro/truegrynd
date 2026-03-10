import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr', 'es', 'pt', 'pt-BR', 'ja', 'zh', 'de', 'it', 'ru'],
  defaultLocale: 'en',
});
