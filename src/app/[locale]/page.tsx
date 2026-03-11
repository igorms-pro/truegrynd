import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { HeaderMobileSignIn } from '@/components/HeaderMobileSignIn';

export default function Home() {
  const t = useTranslations('common');

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4">
      <HeaderMobileSignIn />
      <main className="flex w-full max-w-lg flex-col items-center gap-10 pt-20 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {t('appName')}
          </h1>
          <p className="text-lg italic text-muted">{t('tagline')}</p>
        </div>
        <Link
          href="/"
          className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
          aria-label="Enter the arena"
        >
          {t('appName')}
        </Link>
      </main>
    </div>
  );
}
