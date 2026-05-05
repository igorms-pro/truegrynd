'use client';

import { use } from 'react';

import { ChallengeDetail } from '@/features/challenges/components/ChallengeDetail';

type Params = { challengeId: string; locale: string };

export default function ChallengeDetailPage({ params }: { params: Promise<Params> }) {
  const { challengeId } = use(params);
  return <ChallengeDetail challengeId={challengeId} />;
}
