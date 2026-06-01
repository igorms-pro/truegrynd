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
};

type RankedLabels = {
  ranked: boolean;
  isValidated: boolean;
};

function rankLabels({ ranked, isValidated }: RankedLabels): {
  rankTextOverride: string;
  rankSubOverride: string;
} {
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
  topPercent: number | null;
  weeklyBadge?: string;
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
