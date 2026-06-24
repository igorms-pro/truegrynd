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
