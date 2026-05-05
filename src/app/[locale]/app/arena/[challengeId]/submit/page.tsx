'use client';

import { use } from 'react';

import { ScoreSubmissionScreen } from '@/features/submission/components/ScoreSubmissionScreen';

type Params = { challengeId: string; locale: string };

export default function SubmitScorePage({ params }: { params: Promise<Params> }) {
  const { challengeId } = use(params);
  return <ScoreSubmissionScreen challengeId={challengeId} />;
}
