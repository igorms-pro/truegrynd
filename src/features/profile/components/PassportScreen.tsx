'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { FinisherGallery } from '@/features/finisher-card';
import { ProfileRatingCard } from '@/features/profile/components/ProfileRatingCard';
import { FinisherCosmeticsTeaser } from '@/features/profile/components/passport/FinisherCosmeticsTeaser';
import { PassportBadgesSection } from '@/features/profile/components/passport/PassportBadgesSection';
import { PassportDivisionSection } from '@/features/profile/components/passport/PassportDivisionSection';
import { PassportPrivacySection } from '@/features/profile/components/passport/PassportPrivacySection';
import { PassportRivalsSection } from '@/features/profile/components/passport/PassportRivalsSection';
import { PassportShareBar } from '@/features/profile/components/passport/PassportShareBar';
import { PassportTopScoresSection } from '@/features/profile/components/passport/PassportTopScoresSection';
import { PassportWeeklySection } from '@/features/profile/components/passport/PassportWeeklySection';
import { usePassportData } from '@/features/profile/hooks/usePassportData';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useProfileRating } from '@/features/profile/hooks/useProfileRating';
import { publicProfilePath } from '@/lib/profile/publicProfilePath';

export function PassportScreen() {
  const locale = useLocale();
  const t = useTranslations('profile.passport');
  const { state: profileState, refetch: refetchProfile } = useProfile();
  const profile = profileState.status === 'ready' ? profileState.profile : null;
  const userId = profile?.id ?? null;
  const ratingState = useProfileRating(userId);
  const passportState = usePassportData(userId, profile?.division ?? null);

  const profileHref = `/${locale}/app/profile`;
  const publicPath = profile?.username != null ? publicProfilePath(locale, profile.username) : null;

  if (profileState.status === 'loading') {
    return (
      <section className="space-y-4">
        <PassportBackLink href={profileHref} label={t('back')} />
        <p role="status" className="text-sm text-muted-foreground">
          {t('loading')}
        </p>
      </section>
    );
  }

  if (profileState.status === 'error' || !profile) {
    return (
      <section className="space-y-4">
        <PassportBackLink href={profileHref} label={t('back')} />
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
            {t('errorTitle')}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{t('errorBody')}</p>
        </div>
      </section>
    );
  }

  const dataLoading = passportState.state.status === 'loading';
  const passportData = passportState.state.status === 'ready' ? passportState.state.data : null;
  const dataError = passportState.state.status === 'error' ? passportState.state.error : null;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <PassportBackLink href={profileHref} label={t('back')} />
        <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </header>

      <PassportShareBar publicPath={publicPath} />

      <PassportPrivacySection profile={profile} onSaved={refetchProfile} />

      <PassportDivisionSection
        currentDivision={profile.division}
        divisions={passportData?.divisions ?? [profile.division]}
        history={passportData?.history ?? []}
        loading={dataLoading}
      />

      <ProfileRatingCard
        rating={ratingState.state.status === 'ready' ? ratingState.state.rating : null}
        loading={ratingState.state.status === 'loading'}
        error={ratingState.state.status === 'error' ? ratingState.state.error : null}
        onRetry={ratingState.refetch}
      />

      <PassportTopScoresSection
        scores={passportData?.topScores ?? []}
        loading={dataLoading}
        error={dataError}
        onRetry={passportState.refetch}
      />

      <PassportBadgesSection profile={profile} />

      <PassportWeeklySection weeklies={passportData?.weeklies ?? []} loading={dataLoading} />

      <PassportRivalsSection wins={passportData?.rivalWins ?? []} loading={dataLoading} />

      {profile.username && profile.faction ? (
        <FinisherCosmeticsTeaser
          username={profile.username}
          faction={profile.faction}
          division={profile.division}
        />
      ) : null}

      <FinisherGallery
        userId={profile.id}
        username={profile.username}
        faction={profile.faction}
        division={profile.division}
      />
    </section>
  );
}

function PassportBackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {label}
    </Link>
  );
}
