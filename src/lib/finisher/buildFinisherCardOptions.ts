import type { FinisherFrameStyle } from '@/lib/finisher/frameStyles';
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
  /** V2-12: cosmetic frame (standard free; premium frames exploratory). */
  frameStyle?: FinisherFrameStyle;
  /** Localized metric label, e.g. "TEMPS (MM:SS)". Falls back to English. */
  metricLabel?: string;
};

/**
 * Localized strings painted on the canvas. Resolved from i18n in the React
 * layer (the draw function stays locale-agnostic) and threaded through here.
 */
export type FinisherCardLabels = {
  metricTime: string;
  metricReps: string;
  saved: string;
  ranked: string;
  /** Prefix for the top-percentile badge, e.g. "TOP" → "TOP 12%". */
  top: string;
  subNoVideo: string;
  subValidated: string;
  subWorldwide: string;
};

type RankedLabels = {
  ranked: boolean;
  isValidated: boolean;
  topPercent: number | null;
};

function rankLabels(
  { ranked, isValidated, topPercent }: RankedLabels,
  labels: FinisherCardLabels,
): {
  rankTextOverride: string;
  rankSubOverride: string;
} {
  if (isValidated && topPercent !== null) {
    return {
      rankTextOverride: `${labels.top} ${topPercent}%`,
      rankSubOverride: labels.subWorldwide,
    };
  }
  if (ranked && isValidated) {
    return { rankTextOverride: labels.ranked, rankSubOverride: labels.subValidated };
  }
  if (isValidated) {
    return { rankTextOverride: labels.ranked, rankSubOverride: labels.subValidated };
  }
  return { rankTextOverride: labels.saved, rankSubOverride: labels.subNoVideo };
}

function metricLabelFor(scoreType: ScoreType, labels: FinisherCardLabels): string {
  return scoreType === 'time' ? labels.metricTime : labels.metricReps;
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
  labels: FinisherCardLabels;
};

export function buildFinisherCardOptionsFull(params: FullParams): FinisherCardDrawOptions {
  const ranks = rankLabels(params, params.labels);
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
    metricLabel: metricLabelFor(params.scoreType, params.labels),
    ...ranks,
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
  frameStyle?: FinisherFrameStyle;
  labels: FinisherCardLabels;
};

export function buildFinisherCardOptionsThumb(params: ThumbParams): FinisherCardDrawOptions {
  const ranks = params.ranked
    ? { rankTextOverride: params.labels.ranked, rankSubOverride: params.labels.subValidated }
    : { rankTextOverride: params.labels.saved, rankSubOverride: params.labels.subNoVideo };
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
    frameStyle: params.frameStyle ?? 'standard',
    metricLabel: metricLabelFor(params.scoreType, params.labels),
    ...ranks,
  };
}
