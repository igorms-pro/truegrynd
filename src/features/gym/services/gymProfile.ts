import { supabase } from '@/lib/supabase';

export type GymEventSummary = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  scoreType: 'time' | 'reps';
};

export type GymLeagueSummary = {
  id: string;
  name: string;
  scope: 'local' | 'regional' | 'national';
};

export type GymProfile = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  countryCode: string | null;
  verified: boolean;
  memberCount: number;
  leagues: GymLeagueSummary[];
  events: GymEventSummary[];
};

type RawEvent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  scoreType: 'time' | 'reps';
};

type Raw = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  countryCode: string | null;
  verified: boolean;
  memberCount: number;
  leagues: GymLeagueSummary[] | null;
  events: RawEvent[] | null;
};

/** Fetch any gym by slug for the public gym page. Throws `gym_not_found` on an unknown slug. */
export async function getGymProfileBySlug(slug: string): Promise<GymProfile> {
  const { data, error } = await supabase.rpc('gym_public_profile', { p_slug: slug });
  if (error) throw new Error(error.message);
  if (!data) throw new Error('gym_not_found');
  const raw = data as Raw;
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    city: raw.city,
    countryCode: raw.countryCode,
    verified: Boolean(raw.verified),
    memberCount: Number(raw.memberCount ?? 0),
    leagues: raw.leagues ?? [],
    events: (raw.events ?? []).map((e) => ({
      id: e.id,
      title: e.title,
      startsAt: e.startsAt,
      endsAt: e.endsAt,
      scoreType: e.scoreType,
    })),
  };
}
