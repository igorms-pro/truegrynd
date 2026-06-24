'use client';

import { use } from 'react';

import { EventBroadcast } from '@/features/pro/components/EventBroadcast';

type Params = { eventId: string; locale: string };

export default function EventTvPage({ params }: { params: Promise<Params> }) {
  const { eventId } = use(params);
  return <EventBroadcast eventId={eventId} />;
}
