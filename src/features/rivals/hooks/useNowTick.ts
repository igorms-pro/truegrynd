'use client';

import { useEffect, useState } from 'react';

export function useNowTick(active: boolean): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!active) return undefined;
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, [active]);

  return now;
}
