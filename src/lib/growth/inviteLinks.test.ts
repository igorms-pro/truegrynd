import { describe, expect, it } from 'vitest';

import { buildRivalInviteUrl, buildWeeklyInviteUrl } from '@/lib/growth/inviteLinks';

describe('inviteLinks', () => {
  it('builds rival invite url with referral params', () => {
    const url = buildRivalInviteUrl('https://truegrynd.app', 'en', 'match-1', {
      faction: 'horde',
      division: 'rookie',
    });
    expect(url).toContain('/en/app/rivals/match-1');
    expect(url).toContain('invite=1');
    expect(url).toContain('faction=horde');
    expect(url).toContain('division=rookie');
  });

  it('builds weekly invite url', () => {
    const url = buildWeeklyInviteUrl('https://truegrynd.app', 'fr', 'challenge-1', {
      faction: 'nomads',
      division: 'regular',
      weekly: 'W22',
    });
    expect(url).toContain('/fr/app/arena/challenge-1');
    expect(url).toContain('weekly=W22');
  });
});
