'use client';

import { ChallengeCard } from '@/features/challenges/components/ChallengeCard';
import type { Challenge } from '@/lib/types/database.types';

type Props = {
  challenges: readonly Challenge[];
};

export function ChallengeList({ challenges }: Props) {
  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {challenges.map((challenge) => (
        <li key={challenge.id} className="h-full">
          <ChallengeCard challenge={challenge} />
        </li>
      ))}
    </ul>
  );
}
