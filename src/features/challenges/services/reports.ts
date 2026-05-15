import { supabase } from '@/lib/supabase';

export type ReportTargetType = 'score' | 'challenge' | 'profile';

export async function submitReport(input: {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
}): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('auth_required');

  const { error } = await supabase.from('reports').insert({
    target_type: input.targetType,
    target_id: input.targetId,
    reporter_id: auth.user.id,
    reason: input.reason.trim(),
  });

  if (error) {
    if (error.code === '23505') throw new Error('already_reported');
    throw new Error(error.message);
  }
}
