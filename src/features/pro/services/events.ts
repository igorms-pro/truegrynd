import { supabase } from '@/lib/supabase';

/** A gym-owned competition (see `gym_events`). */
export type GymEvent = {
  id: string;
  title: string;
  description: string;
  workout: string;
  scoreType: 'time' | 'reps';
  startsAt: string;
  endsAt: string;
  challengeId: string | null;
};

type Row = {
  id: string;
  title: string;
  description: string;
  workout: string;
  score_type: 'time' | 'reps';
  starts_at: string;
  ends_at: string;
  challenge_id: string | null;
};

function toGymEvent(row: Row): GymEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    workout: row.workout,
    scoreType: row.score_type,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    challengeId: row.challenge_id ?? null,
  };
}

export async function listGymEvents(): Promise<GymEvent[]> {
  const { data, error } = await supabase.rpc('gym_events_list');
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map(toGymEvent);
}

const GYM_EVENT_SELECT = 'id,title,description,workout,score_type,starts_at,ends_at,challenge_id';

export async function getGymEvent(id: string): Promise<GymEvent | null> {
  const { data, error } = await supabase
    .from('gym_events')
    .select(GYM_EVENT_SELECT)
    .eq('id', id)
    .maybeSingle<Row>();
  if (error) throw new Error(error.message);
  return data ? toGymEvent(data) : null;
}

export async function createGymEvent(input: {
  title: string;
  description: string;
  workout: string;
  scoreType: 'time' | 'reps';
  startsAt: string;
  endsAt: string;
}): Promise<GymEvent> {
  const { data, error } = await supabase
    .rpc('create_gym_event', {
      p_title: input.title,
      p_description: input.description,
      p_workout: input.workout,
      p_score_type: input.scoreType,
      p_starts_at: new Date(input.startsAt).toISOString(),
      p_ends_at: new Date(input.endsAt).toISOString(),
    })
    .single<Row>();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('event_create_failed');
  return toGymEvent(data);
}

export async function updateGymEvent(input: {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
}): Promise<GymEvent> {
  const { data, error } = await supabase
    .rpc('update_gym_event', {
      p_event_id: input.id,
      p_title: input.title,
      p_description: input.description,
      p_starts_at: new Date(input.startsAt).toISOString(),
      p_ends_at: new Date(input.endsAt).toISOString(),
    })
    .single<Row>();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('event_update_failed');
  return toGymEvent(data);
}

export async function cancelGymEvent(id: string): Promise<void> {
  const { error } = await supabase.rpc('cancel_gym_event', { p_event_id: id });
  if (error) throw new Error(error.message);
}

/** A workout within a (possibly multi-WOD) gym event. */
export type EventWorkout = {
  challengeId: string;
  title: string;
  scoreType: 'time' | 'reps';
  rules: string;
  sortOrder: number;
};

export async function listEventWorkouts(eventId: string): Promise<EventWorkout[]> {
  const { data, error } = await supabase.rpc('gym_event_workouts_list', { p_event_id: eventId });
  if (error) throw new Error(error.message);
  return (
    (data ?? []) as Array<{
      challenge_id: string;
      title: string;
      score_type: 'time' | 'reps';
      rules: string;
      sort_order: number;
    }>
  ).map((r) => ({
    challengeId: r.challenge_id,
    title: r.title,
    scoreType: r.score_type,
    rules: r.rules,
    sortOrder: r.sort_order,
  }));
}

export async function addEventWorkout(input: {
  eventId: string;
  title: string;
  workout: string;
  scoreType: 'time' | 'reps';
}): Promise<void> {
  const { error } = await supabase.rpc('add_gym_event_workout', {
    p_event_id: input.eventId,
    p_title: input.title,
    p_workout: input.workout,
    p_score_type: input.scoreType,
  });
  if (error) throw new Error(error.message);
}

/** A row in the cumulative event standings. */
export type EventStanding = {
  userId: string;
  username: string | null;
  avatarUrl: string | null;
  faction: string | null;
  totalPoints: number;
};

export async function getEventStandings(eventId: string): Promise<EventStanding[]> {
  const { data, error } = await supabase.rpc('gym_event_standings', { p_event_id: eventId });
  if (error) throw new Error(error.message);
  return (
    (data ?? []) as Array<{
      user_id: string;
      username: string | null;
      avatar_url: string | null;
      faction: string | null;
      total_points: number;
    }>
  ).map((r) => ({
    userId: r.user_id,
    username: r.username,
    avatarUrl: r.avatar_url,
    faction: r.faction,
    totalPoints: Number(r.total_points ?? 0),
  }));
}
