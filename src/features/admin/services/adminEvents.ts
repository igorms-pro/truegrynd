import { supabase } from '@/lib/supabase';
import type { EventStatus, EventType, MicroEvent } from '@/lib/types/database.types';

const EVENT_SELECT =
  'id,slug,title,description,event_type,starts_at,ends_at,status,created_at,updated_at';

export type AdminEventRow = MicroEvent & {
  event_challenges: { challenge_id: string; sort_order: number }[];
};

export async function listEventsForAdmin(): Promise<AdminEventRow[]> {
  const { data, error } = await supabase
    .from('events')
    .select(`${EVENT_SELECT}, event_challenges(challenge_id,sort_order)`)
    .order('starts_at', { ascending: false })
    .limit(24);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as AdminEventRow[];
}

export async function listApprovedChallengesForEventPicker(): Promise<
  { id: string; title: string; is_official: boolean }[]
> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('challenges')
    .select('id,title,is_official')
    .eq('status', 'approved')
    .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
    .order('is_official', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
}

type UpsertInput = {
  id?: string | null;
  slug: string;
  title: string;
  description?: string;
  eventType: EventType;
  startsAt: string;
  endsAt: string;
  status: EventStatus;
  challengeIds: string[];
};

export async function adminUpsertEvent(input: UpsertInput): Promise<string> {
  const { data, error } = await supabase.rpc('admin_upsert_event', {
    p_id: input.id ?? null,
    p_slug: input.slug,
    p_title: input.title,
    p_description: input.description ?? '',
    p_event_type: input.eventType,
    p_starts_at: input.startsAt,
    p_ends_at: input.endsAt,
    p_status: input.status,
    p_challenge_ids: input.challengeIds,
  });
  if (error) throw new Error(error.message);
  return data as string;
}
