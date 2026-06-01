'use client';

import { Suspense } from 'react';

import { ProfileHistoryScreen } from '@/features/profile/components/ProfileHistoryScreen';

export default function ProfileHistoryPage() {
  return (
    <Suspense fallback={null}>
      <ProfileHistoryScreen />
    </Suspense>
  );
}
