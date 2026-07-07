import { supabase } from '@/lib/supabase';

export const CLASS_TYPES = [
  'wod',
  'open_gym',
  'hyrox',
  'weightlifting',
  'gymnastics',
  'endurance',
  'other',
] as const;
export type ClassType = (typeof CLASS_TYPES)[number];

/** A recurring weekly class slot (template — see `gym_classes`). weekday: 0 = Monday … 6 = Sunday. */
export type GymClass = {
  id: string;
  gymId: string;
  title: string;
  classType: ClassType;
  weekday: number;
  /** 'HH:MM' (seconds stripped). */
  startTime: string;
  durationMin: number;
  capacity: number;
  coachId: string | null;
  isActive: boolean;
};

export type GymClassInput = {
  title: string;
  classType: ClassType;
  weekday: number;
  startTime: string;
  durationMin: number;
  capacity: number;
  coachId: string | null;
};

type Row = {
  id: string;
  gym_id: string;
  title: string;
  class_type: ClassType;
  weekday: number;
  start_time: string;
  duration_min: number;
  capacity: number;
  coach_id: string | null;
  is_active: boolean;
};

const COLUMNS =
  'id, gym_id, title, class_type, weekday, start_time, duration_min, capacity, coach_id, is_active';

function fromRow(row: Row): GymClass {
  return {
    id: row.id,
    gymId: row.gym_id,
    title: row.title,
    classType: row.class_type,
    weekday: row.weekday,
    startTime: row.start_time.slice(0, 5),
    durationMin: row.duration_min,
    capacity: row.capacity,
    coachId: row.coach_id,
    isActive: row.is_active,
  };
}

/** All slots of one gym, grid-ordered. RLS scopes reads; the explicit gym_id keeps admins scoped too. */
export async function listGymClasses(gymId: string): Promise<GymClass[]> {
  const { data, error } = await supabase
    .from('gym_classes')
    .select(COLUMNS)
    .eq('gym_id', gymId)
    .order('weekday')
    .order('start_time');
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map(fromRow);
}

export async function createGymClass(gymId: string, input: GymClassInput): Promise<GymClass> {
  const { data, error } = await supabase
    .from('gym_classes')
    .insert({
      gym_id: gymId,
      title: input.title,
      class_type: input.classType,
      weekday: input.weekday,
      start_time: input.startTime,
      duration_min: input.durationMin,
      capacity: input.capacity,
      coach_id: input.coachId,
    })
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return fromRow(data as Row);
}

export async function updateGymClass(id: string, input: GymClassInput): Promise<GymClass> {
  const { data, error } = await supabase
    .from('gym_classes')
    .update({
      title: input.title,
      class_type: input.classType,
      weekday: input.weekday,
      start_time: input.startTime,
      duration_min: input.durationMin,
      capacity: input.capacity,
      coach_id: input.coachId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return fromRow(data as Row);
}

export async function deleteGymClass(id: string): Promise<void> {
  const { error } = await supabase.from('gym_classes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
