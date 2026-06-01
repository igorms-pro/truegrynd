import type { ReferralParams } from '@/features/factions/lib/referral';
import { buildReferralUrl } from '@/features/factions/lib/referral';

export function buildRivalInviteUrl(
  siteUrl: string,
  locale: string,
  matchId: string,
  params: ReferralParams,
): string {
  const base = `${siteUrl.replace(/\/$/, '')}/${locale}/app/rivals/${matchId}`;
  const url = new URL(base);
  url.searchParams.set('invite', '1');
  if (params.faction) url.searchParams.set('faction', params.faction);
  if (params.division) url.searchParams.set('division', params.division);
  return url.toString();
}

export function buildWeeklyInviteUrl(
  siteUrl: string,
  locale: string,
  challengeId: string,
  params: ReferralParams,
): string {
  const base = `${siteUrl.replace(/\/$/, '')}/${locale}/app/arena/${challengeId}`;
  return buildReferralUrl(base, params);
}
