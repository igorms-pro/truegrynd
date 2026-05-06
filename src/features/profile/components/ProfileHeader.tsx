'use client';

import { useTranslations } from 'next-intl';

import type { Faction, Profile } from '@/lib/types/database.types';
import { initialsFromUsername } from '@/features/profile/lib/initials';

function factionClasses(faction: Faction): { bg: string; text: string; border: string } {
  if (faction === 'nomads') {
    return {
      bg: 'bg-[var(--faction-nomads)]/15',
      text: 'text-[var(--faction-nomads)]',
      border: 'border-[var(--faction-nomads)]/40',
    };
  }
  if (faction === 'horde') {
    return {
      bg: 'bg-[var(--faction-horde)]/15',
      text: 'text-[var(--faction-horde)]',
      border: 'border-[var(--faction-horde)]/40',
    };
  }
  return {
    bg: 'bg-[var(--faction-iron)]/15',
    text: 'text-[var(--faction-iron)]',
    border: 'border-[var(--faction-iron)]/40',
  };
}

export function ProfileHeader({ profile }: { profile: Profile }) {
  const t = useTranslations('profile.header');

  const username = profile.username ?? t('unknownUser');
  const faction = profile.faction;
  const badge = faction ? factionClasses(faction) : null;

  return (
    <section className="rounded-md border border-border bg-card p-4">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-sm border border-border bg-muted">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={t('avatarAlt')}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-black tracking-tight">
              {initialsFromUsername(profile.username)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
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
          </div>
        </div>
      </div>
    </section>
  );
}
