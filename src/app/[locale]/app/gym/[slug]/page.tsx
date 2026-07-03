'use client';

import { useParams } from 'next/navigation';

import { GymProfileScreen } from '@/features/gym/components/GymProfileScreen';

export default function GymProfilePage() {
  const params = useParams();
  const raw = params.slug;
  const slug = typeof raw === 'string' ? decodeURIComponent(raw) : '';

  return <GymProfileScreen slug={slug} />;
}
