'use client';

import { use } from 'react';

import { RivalMatchDetailScreen } from '@/features/rivals/components/RivalMatchDetailScreen';

type Params = { matchId: string; locale: string };

export default function RivalMatchDetailPage({ params }: { params: Promise<Params> }) {
  const { matchId } = use(params);
  return <RivalMatchDetailScreen matchId={matchId} />;
}
