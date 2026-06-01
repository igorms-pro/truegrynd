'use client';

import { Suspense } from 'react';

import { ProfileHistoryScreen } from '@/features/profile';

export default function ProfileHistoryPage() {
  return (
    <Suspense fallback={null}>
      <ProfileHistoryScreen />
    </Suspense>
  );
}
