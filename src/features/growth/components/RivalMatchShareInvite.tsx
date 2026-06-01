'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { ShareInviteButton } from '@/features/growth/components/ShareInviteButton';
import { type ReferralParams } from '@/features/factions/lib/referral';
import { buildRivalInviteUrl } from '@/lib/growth/inviteLinks';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { trackEvent } from '@/lib/analytics/trackEvent';
import type { Division, Faction } from '@/lib/types/database.types';

type Props = {
  matchId: string;
  faction: Faction | null;
  division: Division | null;
};

export function RivalMatchShareInvite({ matchId, faction, division }: Props) {
  const t = useTranslations('growth.rivalInvite');
  const locale = useLocale();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://truegrynd.app';

  const inviteUrl = useMemo(() => {
    if (!faction) return null;
    const params: ReferralParams = { faction, ...(division ? { division } : {}) };
    return buildRivalInviteUrl(siteUrl, locale, matchId, params);
  }, [division, faction, locale, matchId, siteUrl]);

  if (!inviteUrl) return null;

  return (
    <article className="rounded-md border border-border bg-card p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{t('title')}</p>
      <p className="mt-2 text-sm text-muted-foreground">{t('body')}</p>
      <p
        className="mt-3 break-all rounded-md border border-border bg-muted/40 px-3 py-2 font-mono text-xs text-foreground"
        title={inviteUrl}
      >
        {inviteUrl}
      </p>
      <div className="mt-3">
        <ShareInviteButton
          url={inviteUrl}
          shareTitle={t('shareTitle')}
          shareText={t('shareText')}
          shareAria={t('shareAria')}
          copyAria={t('copyAria')}
          onShare={() => trackEvent(ANALYTICS_EVENTS.shareRivalInvite, { matchId })}
          onCopy={() => trackEvent(ANALYTICS_EVENTS.shareRivalInvite, { matchId })}
        />
      </div>
    </article>
  );
}
