'use client';

import { use } from 'react';

import { EventDetail } from '@/features/pro/components/EventDetail';

type Params = { eventId: string; locale: string };

export default function ProEventDetailPage({ params }: { params: Promise<Params> }) {
  const { eventId } = use(params);
  return <EventDetail eventId={eventId} />;
}
