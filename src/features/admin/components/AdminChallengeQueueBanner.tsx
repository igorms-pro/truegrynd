'use client';

import type { ReactNode } from 'react';

type Props = {
  message: string | null;
};

export function AdminChallengeQueueBanner({ message }: Props): ReactNode {
  if (!message) return null;
  return (
    <div className="rounded-md border border-primary/40 bg-primary/10 p-3 text-xs text-primary">
      {message}
    </div>
  );
}
