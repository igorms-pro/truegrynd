'use client';

import { useTranslations } from 'next-intl';

import { AvatarUploader } from '@/features/profile/components/AvatarUploader';
import { FinisherGallery } from '@/features/profile/components/FinisherGallery';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ScoreHistory } from '@/features/profile/components/ScoreHistory';
import { useProfile } from '@/features/profile/hooks/useProfile';

export default function ProfilePage() {
  const tabs = useTranslations('app.tabs');
  const t = useTranslations('profile');
  const { state, refetch } = useProfile();

  if (state.status === 'loading') {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
          {tabs('profile')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      </section>
    );
  }

  if (state.status === 'error') {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
          {tabs('profile')}
        </h1>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
            {t('errorTitle')}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{t('errorBody')}</p>
          <p className="mt-2 text-xs text-muted-foreground">{state.error}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90"
          >
            {t('retry')}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
        {tabs('profile')}
      </h1>

      <ProfileHeader profile={state.profile} />

      <AvatarUploader
        userId={state.profile.id}
        avatarUrl={state.profile.avatar_url}
        username={state.profile.username}
        onUpdated={refetch}
      />

      <FinisherGallery
        userId={state.profile.id}
        username={state.profile.username}
        faction={state.profile.faction}
      />

      <ScoreHistory userId={state.profile.id} />
    </section>
  );
}
