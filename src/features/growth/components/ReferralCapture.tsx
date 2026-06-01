'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { parseReferralParams, storeReferralContext } from '@/features/factions/lib/referral';

export function ReferralCapture(): null {
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = parseReferralParams(searchParams);
    if (params) storeReferralContext(params);
  }, [searchParams]);

  return null;
}
