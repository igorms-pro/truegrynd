'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { DataManagementSection } from '@/features/settings/components/DataManagementSection';
import { GymAffiliationSection } from '@/features/settings/components/GymAffiliationSection';
import { PassportSettingsSection } from '@/features/settings/components/PassportSettingsSection';
import { PreferencesSection } from '@/features/settings/components/PreferencesSection';
import { SettingsFooter } from '@/features/settings/components/SettingsFooter';
import { useProfile } from '@/features/profile/hooks/useProfile';

export function SettingsScreen() {
  const locale = useLocale();
  const t = useTranslations('settings');
  const { state, refetch } = useProfile();
  const profileHref = `/${locale}/app/profile`;

  if (state.status === 'loading') {
    return (
      <section className="space-y-4">
        <p role="status" className="text-sm text-muted-foreground">
          {t('loading')}
        </p>
      </section>
    );
  }

  if (state.status === 'error') {
    return (
      <section className="space-y-4">
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
            {t('errorTitle')}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{t('errorBody')}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('retry')}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 pb-8">
      <Link
        href={profileHref}
        className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t('backAria')}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('back')}
      </Link>

      <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{t('title')}</h1>

      <PassportSettingsSection profile={state.profile} onSaved={refetch} />
      <GymAffiliationSection />
      <PreferencesSection />
      <DataManagementSection userId={state.profile.id} />
      <SettingsFooter />
    </section>
  );
}
