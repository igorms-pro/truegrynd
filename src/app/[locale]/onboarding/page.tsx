import { useTranslations } from 'next-intl';

export default function OnboardingPage() {
  const t = useTranslations('onboarding');

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="mx-auto w-full max-w-lg">
        <h1 className="text-3xl font-black tracking-tight">{t('title')}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t('comingSoon')}</p>
        <div className="mt-8 rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground">{t('note')}</p>
          <p className="mt-2 text-sm">{t('body')}</p>
        </div>
      </div>
    </main>
  );
}
