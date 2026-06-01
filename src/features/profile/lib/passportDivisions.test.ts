import { describe, expect, it } from 'vitest';

import { divisionsReached } from '@/features/profile/lib/passportDivisions';

describe('divisionsReached', () => {
  it('includes current division and unique history divisions in order', () => {
    const result = divisionsReached('savage', [{ division: 'rookie' }, { division: 'regular' }]);

    expect(result).toEqual(['rookie', 'regular', 'savage']);
  });
});
