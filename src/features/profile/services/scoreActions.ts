import { isAllowedVideoUrl } from '@/features/submission/lib/videoUrl';
import { supabase } from '@/lib/supabase';

const VIDEO_INVALID_ERROR = 'video_invalid';

export async function updateScoreVideoUrl(
  scoreId: string,
  userId: string,
  videoUrl: string,
): Promise<void> {
  const trimmed = videoUrl.trim();
  if (!isAllowedVideoUrl(trimmed)) throw new Error(VIDEO_INVALID_ERROR);

  const { error } = await supabase
    .from('scores')
    .update({ video_url: trimmed, is_validated: true })
    .eq('id', scoreId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}

export async function hideScoreFromCards(scoreId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('scores')
    .update({ is_hidden: true })
    .eq('id', scoreId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}

export const SCORE_ACTION_ERRORS = {
  VIDEO_INVALID: VIDEO_INVALID_ERROR,
} as const;
