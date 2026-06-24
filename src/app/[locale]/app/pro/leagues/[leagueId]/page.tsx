'use client';

import { use } from 'react';

import { LeagueDetail } from '@/features/pro/components/LeagueDetail';

type Params = { leagueId: string; locale: string };

export default function ProLeagueDetailPage({ params }: { params: Promise<Params> }) {
  const { leagueId } = use(params);
  return <LeagueDetail leagueId={leagueId} />;
}
