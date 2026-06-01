import type { Division, Faction, ScoreType } from '@/lib/types/database.types';

export type FinisherCardDrawOptions = {
  width: number;
  height: number;
  faction: Faction;
  division: Division;
  username: string;
  challengeTitle: string;
  scoreType: ScoreType;
  scoreValue: number;
  topPercent: number | null;
  rankTextOverride?: string;
  rankSubOverride?: string;
  /** V2-03: e.g. "W22 · 2026" when score is on the current weekly challenge. */
  weeklyBadge?: string;
  /** V2-11: active micro-event label. */
  eventBadge?: string;
  /** V2-11: e.g. "I SCORED FOR HORDE ROOKIE". */
  tagline?: string;
  /** V2-11: e.g. "+4.2 RATING". */
  ratingDeltaText?: string;
  /** V2-11: e.g. "+892 WAR PTS". */
  warPointsText?: string;
};

type RankedLabels = {
  ranked: boolean;
  isValidated: boolean;
  topPercent: number | null;
};

function rankLabels({ ranked, isValidated, topPercent }: RankedLabels): {
  rankTextOverride: string;
  rankSubOverride: string;
} {
  if (isValidated && topPercent !== null) {
    return { rankTextOverride: `TOP ${topPercent}%`, rankSubOverride: 'WORLDWIDE (VALIDATED)' };
  }
  if (ranked && isValidated) {
    return { rankTextOverride: 'RANKED', rankSubOverride: 'VALIDATED' };
  }
  if (isValidated) {
    return { rankTextOverride: 'RANKED', rankSubOverride: 'VALIDATED' };
  }
  return { rankTextOverride: 'SAVED', rankSubOverride: 'NO VIDEO' };
}

type FullParams = RankedLabels & {
  faction: Faction;
  division: Division;
  username: string;
  challengeTitle: string;
  scoreType: ScoreType;
  scoreValue: number;
  weeklyBadge?: string;
  eventBadge?: string;
  tagline?: string;
  ratingDeltaText?: string;
  warPointsText?: string;
};

export function buildFinisherCardOptionsFull(params: FullParams): FinisherCardDrawOptions {
  const labels = rankLabels(params);
  return {
    width: 1080,
    height: 1920,
    faction: params.faction,
    division: params.division,
    username: params.username,
    challengeTitle: params.challengeTitle,
    scoreType: params.scoreType,
    scoreValue: params.scoreValue,
    topPercent: params.topPercent,
    weeklyBadge: params.weeklyBadge,
    eventBadge: params.eventBadge,
    tagline: params.tagline,
    ratingDeltaText: params.ratingDeltaText,
    warPointsText: params.warPointsText,
    ...labels,
  };
}

type ThumbParams = {
  faction: Faction;
  division: Division;
  username: string;
  challengeTitle: string;
  scoreType: ScoreType;
  scoreValue: number;
  ranked: boolean;
};

export function buildFinisherCardOptionsThumb(params: ThumbParams): FinisherCardDrawOptions {
  const labels = params.ranked
    ? { rankTextOverride: 'RANKED', rankSubOverride: 'VALIDATED' }
    : { rankTextOverride: 'SAVED', rankSubOverride: 'NO VIDEO' };
  return {
    width: 360,
    height: 640,
    faction: params.faction,
    division: params.division,
    username: params.username,
    challengeTitle: params.challengeTitle,
    scoreType: params.scoreType,
    scoreValue: params.scoreValue,
    topPercent: null,
    ...labels,
  };
}
