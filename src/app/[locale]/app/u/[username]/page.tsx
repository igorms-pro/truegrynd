'use client';

import { useParams } from 'next/navigation';

import { PublicProfileScreen } from '@/features/profile';

export default function PublicProfilePage() {
  const params = useParams();
  const raw = params.username;
  const username = typeof raw === 'string' ? decodeURIComponent(raw) : '';

  return <PublicProfileScreen username={username} />;
}
