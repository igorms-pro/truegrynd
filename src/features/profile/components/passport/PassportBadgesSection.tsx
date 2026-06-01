'use client';

import { useTranslations } from 'next-intl';

import { CreatorScoreBadge } from '@/features/profile/components/CreatorScoreBadge';
import { creatorTier } from '@/features/profile/lib/creatorBadge';
import type { Profile } from '@/lib/types/database.types';

type Props = {
  profile: Profile;
};

export function PassportBadgesSection({ profile }: Props) {
  const t = useTranslations('profile.passport.badges');
  const tier = creatorTier(profile.creator_score ?? 0);
  const streak = profile.streak_days ?? 0;

  return (
    <section
      className="rounded-sm border border-border bg-card p-4 space-y-3"
      aria-labelledby="passport-badges-title"
    >
      <h2
        id="passport-badges-title"
        className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground"
      >
        {t('title')}
      </h2>

      <ul className="space-y-3">
        <li className="flex items-center justify-between gap-3">
          <span className="text-xs font-black uppercase tracking-[0.14em]">{t('streak')}</span>
          <span className="font-mono text-sm font-black tabular-nums text-accent">
            {t('streakDays', { days: streak })}
          </span>
        </li>
        <li className="flex items-center justify-between gap-3">
          <span className="text-xs font-black uppercase tracking-[0.14em]">{t('creator')}</span>
          <CreatorScoreBadge score={profile.creator_score ?? 0} />
        </li>
        {tier !== 'none' ? (
          <li>
            <p className="text-xs text-muted-foreground">
              {t('creatorHint', { tier: tier.toUpperCase() })}
            </p>
          </li>
        ) : null}
      </ul>
    </section>
  );
}
