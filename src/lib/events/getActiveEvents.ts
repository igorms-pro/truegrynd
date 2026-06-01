import { supabase } from '@/lib/supabase';
import type { EventStatus, MicroEvent } from '@/lib/types/database.types';

const EVENT_SELECT =
  'id,slug,title,description,event_type,starts_at,ends_at,status,created_at,updated_at';

export type ActiveEventSummary = MicroEvent & {
  challengeCount: number;
};

type EventRow = MicroEvent & {
  event_challenges: { challenge_id: string }[];
};

export type EventTimeRemaining = {
  days: number;
  hours: number;
  ended: boolean;
};

export function getEventTimeRemaining(endsAt: Date, now: Date = new Date()): EventTimeRemaining {
  const ms = endsAt.getTime() - now.getTime();
  if (ms <= 0) {
    return { days: 0, hours: 0, ended: true };
  }
  const totalHours = Math.ceil(ms / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return { days, hours, ended: false };
}

export async function getActiveEvents(limit = 6): Promise<ActiveEventSummary[]> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('events')
    .select(`${EVENT_SELECT}, event_challenges(challenge_id)`)
    .eq('status', 'active')
    .lte('starts_at', nowIso)
    .gt('ends_at', nowIso)
    .order('ends_at', { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return mapEventRows(data as EventRow[] | null);
}

export async function listPublicEvents(): Promise<ActiveEventSummary[]> {
  const { data, error } = await supabase
    .from('events')
    .select(`${EVENT_SELECT}, event_challenges(challenge_id)`)
    .in('status', ['scheduled', 'active', 'completed'] satisfies EventStatus[])
    .order('starts_at', { ascending: false })
    .limit(24);

  if (error) throw new Error(error.message);
  return mapEventRows(data as EventRow[] | null);
}

function mapEventRows(rows: EventRow[] | null): ActiveEventSummary[] {
  return (rows ?? []).map(({ event_challenges, ...event }) => ({
    ...event,
    challengeCount: event_challenges?.length ?? 0,
  }));
}
