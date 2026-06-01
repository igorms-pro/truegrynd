'use client';

import { useParams } from 'next/navigation';

import { FactionPageScreen } from '@/features/factions/components/FactionPageScreen';

export default function FactionPage() {
  const params = useParams();
  const raw = params.slug;
  const slug = typeof raw === 'string' ? raw : '';

  return <FactionPageScreen slug={slug} />;
}
