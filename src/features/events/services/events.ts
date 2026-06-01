import { supabase } from '@/lib/supabase';
import type { Division, EventType, MicroEvent } from '@/lib/types/database.types';

const EVENT_SELECT =
  'id,slug,title,description,event_type,starts_at,ends_at,status,created_at,updated_at';

export type EventChallengeDetail = {
  challengeId: string;
  sortOrder: number;
  title: string;
  scoreType: string;
};

export type EventDetail = MicroEvent & {
  challenges: EventChallengeDetail[];
};

export type EventStanding = {
  userId: string;
  username: string;
  totalPoints: number;
  challengesScored: number;
};

export type EventRecapRow = {
  division: Division;
  userId: string;
  username: string;
  totalPoints: number;
  rank: number;
};

export async function fetchEventBySlug(slug: string): Promise<EventDetail | null> {
  const { data, error } = await supabase
    .from('events')
    .select(
      `${EVENT_SELECT}, event_challenges(sort_order, challenge:challenges(id,title,score_type))`,
    )
    .eq('slug', slug)
    .neq('status', 'cancelled')
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  type Row = MicroEvent & {
    event_challenges: {
      sort_order: number;
      challenge: { id: string; title: string; score_type: string } | null;
    }[];
  };

  const row = data as unknown as Row;
  const challenges = (row.event_challenges ?? [])
    .filter((ec) => ec.challenge)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((ec) => ({
      challengeId: ec.challenge!.id,
      sortOrder: ec.sort_order,
      title: ec.challenge!.title,
      scoreType: ec.challenge!.score_type,
    }));

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    event_type: row.event_type,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    challenges,
  };
}

export async function fetchEventStandings(
  eventId: string,
  division: Division,
  limit = 50,
): Promise<EventStanding[]> {
  const { data, error } = await supabase.rpc('get_event_standings', {
    p_event_id: eventId,
    p_division: division,
    p_limit: limit,
  });
  if (error) throw new Error(error.message);

  return (data ?? []).map(
    (row: {
      user_id: string;
      username: string;
      total_points: number;
      challenges_scored: number;
    }) => ({
      userId: row.user_id,
      username: row.username,
      totalPoints: Number(row.total_points),
      challengesScored: row.challenges_scored,
    }),
  );
}

export async function fetchEventRecap(eventId: string, topN = 3): Promise<EventRecapRow[]> {
  const { data, error } = await supabase.rpc('get_event_recap', {
    p_event_id: eventId,
    p_top_n: topN,
  });
  if (error) throw new Error(error.message);

  return (data ?? []).map(
    (row: {
      division: Division;
      user_id: string;
      username: string;
      total_points: number;
      rank: number;
    }) => ({
      division: row.division,
      userId: row.user_id,
      username: row.username,
      totalPoints: Number(row.total_points),
      rank: row.rank,
    }),
  );
}

export const EVENT_TYPES: EventType[] = [
  'rookie_week',
  'no_equipment_cup',
  'faction_war_weekend',
  'city_clash',
  'grit_open',
  'comeback_week',
  'custom',
];
