'use client';

import { useTranslations } from 'next-intl';

import type { RivalWin } from '@/features/profile/services/passport';

type Props = {
  wins: RivalWin[];
  loading?: boolean;
};

export function PassportRivalsSection({ wins, loading }: Props) {
  const t = useTranslations('profile.passport.rivals');
  const tDivisions = useTranslations('divisions');

  if (loading) {
    return (
      <section className="rounded-sm border border-border bg-card p-4" aria-busy="true">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('loading')}
        </p>
      </section>
    );
  }

  return (
    <section
      className="rounded-sm border border-border bg-card p-4 space-y-3"
      aria-labelledby="passport-rivals-title"
    >
      <h2
        id="passport-rivals-title"
        className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground"
      >
        {t('title')}
      </h2>
      <p className="text-sm text-muted-foreground">{t('body')}</p>

      {wins.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      ) : (
        <ul className="space-y-2">
          {wins.map((win) => (
            <li
              key={win.matchId}
              className="flex items-start justify-between gap-3 border-t border-border pt-2 first:border-t-0 first:pt-0"
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-accent">
                  {t('badge')}
                </p>
                <p className="text-sm font-semibold">
                  {t('versus', {
                    opponent: win.opponentUsername ? `@${win.opponentUsername}` : t('unknown'),
                  })}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {win.challengeTitles.join(' · ') || t('challengesFallback')}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {tDivisions(win.division)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
