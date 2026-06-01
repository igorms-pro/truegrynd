'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { PublicPassportSections } from '@/features/profile/components/PublicPassportSections';
import { PublicProfileHeader } from '@/features/profile/components/PublicProfileHeader';
import { usePublicProfile } from '@/features/profile/hooks/usePublicProfile';
import {
  hasPublicPassportContent,
  parsePassportPrivacy,
} from '@/features/profile/lib/passportPrivacy';

type Props = {
  username: string;
};

export function PublicProfileScreen({ username }: Props) {
  const locale = useLocale();
  const t = useTranslations('profile.public');
  const { state, refetch } = usePublicProfile(username);

  if (state.status === 'loading') {
    return (
      <section className="space-y-3">
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
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
        <Link
          href={`/${locale}/app/clan`}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t('backClan')}
        </Link>
      </section>
    );
  }

  const privacy = parsePassportPrivacy(state.profile);
  const showPassport = hasPublicPassportContent(privacy);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">
          {state.profile.username ?? t('unknownUser')}
        </h1>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('subtitle')}
        </p>
      </header>

      <PublicProfileHeader profile={state.profile} />

      {showPassport ? (
        <PublicPassportSections profile={state.profile} />
      ) : (
        <div className="rounded-sm border border-dashed border-border bg-muted/20 p-4">
          <p className="text-sm text-muted-foreground">{t('passportHidden')}</p>
        </div>
      )}

      <Link
        href={`/${locale}/app/clan`}
        className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {t('backClan')}
      </Link>
    </section>
  );
}
