import { callEdgeFunction } from '@/lib/edgeFunction';
import { supabase } from '@/lib/supabase';

export type ImportStatus = 'pending' | 'invited' | 'joined';

/** One imported roster row (see `gym_member_imports` / V4-09). */
export type MemberImport = {
  id: string;
  email: string;
  fullName: string | null;
  sex: string | null;
  age: number | null;
  status: ImportStatus;
};

export type MemberImportInput = {
  email: string;
  fullName: string | null;
  sex: 'male' | 'female' | null;
  age: number | null;
};

type Row = {
  id: string;
  email: string;
  full_name: string | null;
  sex: string | null;
  age: number | null;
  status: ImportStatus;
};

export async function listImports(gymId: string): Promise<MemberImport[]> {
  const { data, error } = await supabase
    .from('gym_member_imports')
    .select('id, email, full_name, sex, age, status')
    .eq('gym_id', gymId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map((r) => ({
    id: r.id,
    email: r.email,
    fullName: r.full_name,
    sex: r.sex,
    age: r.age,
    status: r.status,
  }));
}

/** Insert parsed rows; duplicates (same gym+email) are skipped, not errors. */
export async function addImports(
  gymId: string,
  rows: MemberImportInput[],
): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;
  // upsert with ignoreDuplicates so re-importing the same file is idempotent.
  const { data, error } = await supabase
    .from('gym_member_imports')
    .upsert(
      rows.map((r) => ({
        gym_id: gymId,
        email: r.email.toLowerCase(),
        full_name: r.fullName,
        sex: r.sex,
        age: r.age,
      })),
      { onConflict: 'gym_id,email', ignoreDuplicates: true },
    )
    .select('id');
  if (error) throw new Error(error.message);
  inserted = (data ?? []).length;
  skipped = rows.length - inserted;
  return { inserted, skipped };
}

export async function deleteImport(id: string): Promise<void> {
  const { error } = await supabase.from('gym_member_imports').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/** Send invites for every pending row of the caller's gym (Edge Function, batches of 50). */
export async function inviteAllPending(): Promise<{
  invited: number;
  joined: number;
  failed: number;
}> {
  return callEdgeFunction('invite-members', {});
}
