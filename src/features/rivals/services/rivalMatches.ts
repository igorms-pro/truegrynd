import { pickBestScorePerUser } from '@/features/challenges/lib/pickBestScorePerUser';
import {
  resolveRivalWinner,
  type RivalChallengeInput,
  type RivalWinnerResult,
} from '@/features/rivals/lib/resolveRivalWinner';
import { supabase } from '@/lib/supabase';
import type {
  Division,
  RivalMatch,
  RivalMatchChallenge,
  RivalMatchParticipant,
  RivalMatchStatus,
  RivalParticipantStatus,
  ScoreType,
} from '@/lib/types/database.types';

export type RivalMatchChallengeView = {
  challengeId: string;
  sortOrder: number;
  title: string;
  scoreType: ScoreType;
};

export type RivalMatchParticipantView = {
  userId: string;
  username: string | null;
  status: RivalParticipantStatus;
  invitedAt: string;
  respondedAt: string | null;
};

export type RivalMatchView = {
  id: string;
  creatorId: string;
  status: RivalMatchStatus;
  durationHours: 24 | 168;
  division: Division;
  maxParticipants: number;
  createdAt: string;
  startsAt: string | null;
  endsAt: string | null;
  winnerId: string | null;
  challenges: RivalMatchChallengeView[];
  participants: RivalMatchParticipantView[];
};

export type RivalParticipantScoreView = {
  userId: string;
  username: string | null;
  value: number | null;
};

export type RivalChallengeScoresView = {
  challengeId: string;
  sortOrder: number;
  title: string;
  scoreType: ScoreType;
  participantScores: RivalParticipantScoreView[];
  roundWinnerId: string | null;
};

export type RivalMatchDetailData = {
  challengeScores: RivalChallengeScoresView[];
  winnerResult: RivalWinnerResult;
};

const MATCH_COLUMNS =
  'id,creator_id,status,duration_hours,division,max_participants,created_at,starts_at,ends_at,winner_id';

type MatchRow = RivalMatch;

type ChallengeJoinRow = RivalMatchChallenge & {
  challenge: { title: string; score_type: ScoreType } | null;
};

type ParticipantJoinRow = RivalMatchParticipant & {
  profile: { username: string | null } | null;
};

function mapMatchRow(
  row: MatchRow,
  challenges: ChallengeJoinRow[],
  participants: ParticipantJoinRow[],
): RivalMatchView {
  return {
    id: row.id,
    creatorId: row.creator_id,
    status: row.status,
    durationHours: row.duration_hours as 24 | 168,
    division: row.division,
    maxParticipants: row.max_participants,
    createdAt: row.created_at,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    winnerId: row.winner_id,
    challenges: challenges
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((c) => ({
        challengeId: c.challenge_id,
        sortOrder: c.sort_order,
        title: c.challenge?.title ?? '',
        scoreType: c.challenge?.score_type ?? 'reps',
      })),
    participants: participants.map((p) => ({
      userId: p.user_id,
      username: p.profile?.username ?? null,
      status: p.status,
      invitedAt: p.invited_at,
      respondedAt: p.responded_at,
    })),
  };
}

export async function createRivalMatch(options: {
  challengeIds: string[];
  durationHours: 24 | 168;
  inviteeUsername: string;
  maxParticipants?: number;
}): Promise<string> {
  const { data, error } = await supabase.rpc('create_rival_match', {
    p_challenge_ids: options.challengeIds,
    p_duration_hours: options.durationHours,
    p_invitee_username: options.inviteeUsername,
    p_max_participants: options.maxParticipants ?? 2,
  });

  if (error) throw new Error(error.message);
  return data as string;
}

export async function respondRivalMatchInvite(matchId: string, accept: boolean): Promise<void> {
  const { error } = await supabase.rpc('respond_rival_match_invite', {
    p_match_id: matchId,
    p_accept: accept,
  });

  if (error) throw new Error(error.message);
}

export async function cancelRivalMatch(matchId: string): Promise<void> {
  const { error } = await supabase.rpc('cancel_rival_match', {
    p_match_id: matchId,
  });

  if (error) throw new Error(error.message);
}

export async function finalizeRivalMatch(matchId: string): Promise<void> {
  const { error } = await supabase.rpc('finalize_rival_match', {
    p_match_id: matchId,
  });

  if (error) throw new Error(error.message);
}

export async function finalizeMyDueRivalMatches(): Promise<void> {
  const { error } = await supabase.rpc('finalize_my_due_rival_matches');
  if (error) throw new Error(error.message);
}

async function syncRivalMatchLifecycle(matchId: string): Promise<void> {
  try {
    await finalizeRivalMatch(matchId);
  } catch {
    /* non-fatal: match may already be terminal or caller lacks access */
  }
}

export async function fetchRivalMatch(matchId: string): Promise<RivalMatchView | null> {
  await syncRivalMatchLifecycle(matchId);

  const { data: match, error: matchError } = await supabase
    .from('rival_matches')
    .select(MATCH_COLUMNS)
    .eq('id', matchId)
    .maybeSingle();

  if (matchError) throw new Error(matchError.message);
  if (!match) return null;

  const [{ data: challenges, error: chError }, { data: participants, error: pError }] =
    await Promise.all([
      supabase
        .from('rival_match_challenges')
        .select(
          'match_id,challenge_id,sort_order,challenge:challenges!rival_match_challenges_challenge_id_fkey(title,score_type)',
        )
        .eq('match_id', matchId),
      supabase
        .from('rival_match_participants')
        .select(
          'match_id,user_id,status,invited_at,responded_at,profile:profiles!rival_match_participants_user_id_fkey(username)',
        )
        .eq('match_id', matchId),
    ]);

  if (chError) throw new Error(chError.message);
  if (pError) throw new Error(pError.message);

  return mapMatchRow(
    match as MatchRow,
    (challenges ?? []) as unknown as ChallengeJoinRow[],
    (participants ?? []) as unknown as ParticipantJoinRow[],
  );
}

export async function listMyRivalMatches(userId: string): Promise<RivalMatchView[]> {
  try {
    await finalizeMyDueRivalMatches();
  } catch {
    /* keep listing even if batch finalize fails */
  }

  const { data: participantRows, error: participantError } = await supabase
    .from('rival_match_participants')
    .select('match_id')
    .eq('user_id', userId)
    .order('invited_at', { ascending: false })
    .limit(30);

  if (participantError) throw new Error(participantError.message);

  const matchIds = [...new Set((participantRows ?? []).map((r) => r.match_id as string))];
  if (matchIds.length === 0) return [];

  const results = await Promise.all(matchIds.map((id) => fetchRivalMatch(id)));
  return results.filter((m): m is RivalMatchView => m !== null);
}

function acceptedParticipantIds(match: RivalMatchView): string[] {
  return match.participants.filter((p) => p.status === 'accepted').map((p) => p.userId);
}

function usernameFor(match: RivalMatchView, userId: string): string | null {
  return match.participants.find((p) => p.userId === userId)?.username ?? null;
}

export async function fetchRivalMatchDetailData(
  match: RivalMatchView,
): Promise<RivalMatchDetailData> {
  const empty: RivalMatchDetailData = {
    challengeScores: [],
    winnerResult: { winnerId: null, challengeWinners: new Map(), reason: 'incomplete' },
  };

  if (!match.startsAt || !match.endsAt) return empty;

  const acceptedIds = acceptedParticipantIds(match);
  const challengeInputs: RivalChallengeInput[] = [];
  const challengeScores: RivalChallengeScoresView[] = [];

  for (const challenge of match.challenges) {
    const { data, error } = await supabase
      .from('scores')
      .select('id,user_id,value,is_validated,submitted_at')
      .eq('challenge_id', challenge.challengeId)
      .eq('is_validated', true)
      .in('user_id', acceptedIds)
      .gte('submitted_at', match.startsAt)
      .lte('submitted_at', match.endsAt);

    if (error) throw new Error(error.message);

    const best = pickBestScorePerUser(
      ((data ?? []) as { id: string; user_id: string; value: number }[]).map((row) => ({
        id: row.id,
        user_id: row.user_id,
        value: Number(row.value),
      })),
      challenge.scoreType,
    );

    const bestByUser = new Map(best.map((row) => [row.user_id, row.value]));

    challengeInputs.push({
      challengeId: challenge.challengeId,
      scoreType: challenge.scoreType,
      scores: best.map((row) => ({ userId: row.user_id, value: row.value })),
    });

    challengeScores.push({
      challengeId: challenge.challengeId,
      sortOrder: challenge.sortOrder,
      title: challenge.title,
      scoreType: challenge.scoreType,
      participantScores: acceptedIds.map((userId) => ({
        userId,
        username: usernameFor(match, userId),
        value: bestByUser.get(userId) ?? null,
      })),
      roundWinnerId: null,
    });
  }

  const winnerResult = resolveRivalWinner(challengeInputs, acceptedIds);

  return {
    challengeScores: challengeScores.map((row) => ({
      ...row,
      roundWinnerId: winnerResult.challengeWinners.get(row.challengeId) ?? null,
    })),
    winnerResult,
  };
}

export async function computeRivalWinnerFromScores(
  match: RivalMatchView,
): Promise<RivalWinnerResult> {
  if (
    !match.startsAt ||
    !match.endsAt ||
    (match.status !== 'active' && match.status !== 'completed')
  ) {
    return { winnerId: null, challengeWinners: new Map(), reason: 'incomplete' };
  }

  if (match.status === 'completed' && match.winnerId) {
    const { winnerResult } = await fetchRivalMatchDetailData(match);
    return { ...winnerResult, winnerId: match.winnerId };
  }

  const { winnerResult } = await fetchRivalMatchDetailData(match);
  return winnerResult;
}
