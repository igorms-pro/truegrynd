import { supabase } from '@/lib/supabase';

import { assertTimeScoreWithinCap, TIME_CAP_ERROR } from '@/features/submission/lib/timeScoreCap';
import { isAllowedVideoUrl } from '@/lib/scoring';

type Options = {
  challengeId: string;
  userId: string;
  value: number;
  videoUrl?: string | null;
};

type Result = {
  insertedId: string;
  ranked: boolean;
};

const VIDEO_INVALID_ERROR = 'video_invalid';

export async function submitScore(options: Options): Promise<Result> {
  const trimmedVideo = options.videoUrl?.trim() ?? '';
  const hasVideo = trimmedVideo.length > 0;

  if (hasVideo && !isAllowedVideoUrl(trimmedVideo)) throw new Error(VIDEO_INVALID_ERROR);

  const { data: ch, error: chErr } = await supabase
    .from('challenges')
    .select('score_type, max_duration_seconds')
    .eq('id', options.challengeId)
    .maybeSingle<{ score_type: string; max_duration_seconds: number | null }>();
  if (chErr) throw new Error(chErr.message);
  if (!ch) throw new Error('challenge_not_found');
  assertTimeScoreWithinCap({
    scoreType: ch.score_type,
    value: options.value,
    maxDurationSeconds: ch.max_duration_seconds,
  });

  const ranked = hasVideo;
  const is_validated = ranked;
  const video_url = ranked ? trimmedVideo : null;

  const { data, error } = await supabase
    .from('scores')
    .insert({
      challenge_id: options.challengeId,
      user_id: options.userId,
      value: options.value,
      video_url,
      is_validated,
    })
    .select('id')
    .maybeSingle<{ id: string }>();

  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error('insert_failed');

  return { insertedId: data.id, ranked };
}

export const SUBMISSION_ERRORS = {
  VIDEO_INVALID: VIDEO_INVALID_ERROR,
  EXCEEDS_TIME_CAP: TIME_CAP_ERROR,
} as const;
