'use client';

import { useTranslations } from 'next-intl';

import type { RivalMatchView } from '@/features/rivals/services/rivalMatches';

type Props = {
  match: RivalMatchView;
  disabled: boolean;
  onAccept: () => void;
  onDecline: () => void;
};

export function RivalPendingInviteCard({ match, disabled, onAccept, onDecline }: Props) {
  const t = useTranslations('rivals.invite');
  const tDivisions = useTranslations('divisions');
  const creator = match.participants.find((p) => p.userId === match.creatorId);
  const challengeTitles = match.challenges.map((c) => c.title).join(' · ');

  return (
    <article className="rounded-sm border border-border bg-card p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{t('kicker')}</p>
      <h2 className="mt-1 text-sm font-black uppercase tracking-tight">
        {t('from', { username: creator?.username ?? t('unknown') })}
      </h2>
      <p className="mt-2 text-xs text-muted-foreground">{challengeTitles}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {t('meta', {
          division: tDivisions(match.division),
          duration: match.durationHours === 24 ? t('duration24') : t('duration7d'),
        })}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onAccept}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {disabled ? t('accepting') : t('accept')}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onDecline}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-muted px-4 text-xs font-black uppercase tracking-[0.18em] hover:border-primary/40 disabled:opacity-50"
        >
          {t('decline')}
        </button>
      </div>
    </article>
  );
}
