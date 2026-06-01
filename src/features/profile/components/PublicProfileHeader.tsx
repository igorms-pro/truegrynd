'use client';

import { useTranslations } from 'next-intl';

import { CreatorScoreBadge } from '@/features/profile/components/CreatorScoreBadge';
import { initialsFromUsername } from '@/features/profile/lib/initials';
import { getFactionBadgeClasses } from '@/lib/factionStyles';
import type { Profile } from '@/lib/types/database.types';

type Props = {
  profile: Profile;
};

export function PublicProfileHeader({ profile }: Props) {
  const t = useTranslations('profile.header');
  const ta = useTranslations('profile.public');

  const username = profile.username ?? t('unknownUser');
  const faction = profile.faction;
  const badge = faction ? getFactionBadgeClasses(faction) : null;

  return (
    <section className="rounded-sm border border-border bg-card p-4">
      <div className="flex items-start gap-4">
        <div
          className="h-20 w-20 shrink-0 overflow-hidden rounded-sm border border-border bg-muted shadow-[0_10px_30px_rgba(0,0,0,0.22)]"
          aria-hidden={profile.avatar_url ? undefined : true}
        >
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={ta('avatarAlt', { username })}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-black tracking-tight">
              {initialsFromUsername(profile.username)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3 pt-1">
          <div>
            <p className="truncate text-xl font-black uppercase tracking-tight">{username}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {badge ? (
                <span
                  className={[
                    'inline-flex items-center rounded-sm border px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em]',
                    badge.bg,
                    badge.text,
                    badge.border,
                  ].join(' ')}
                >
                  {t(`factions.${faction}`)}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-sm border border-border bg-muted px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                  {t('noFaction')}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {t('streak', { days: profile.streak_days })}
              </span>
              <CreatorScoreBadge score={profile.creator_score} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
