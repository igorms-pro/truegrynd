import { useTranslations } from 'next-intl';

export default function OverviewPage() {
  const t = useTranslations('app');

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="mx-auto w-full max-w-lg">
        <h1 className="text-3xl font-black tracking-tight">{t('overviewTitle')}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t('overviewBody')}</p>
      </div>
    </main>
  );
}
