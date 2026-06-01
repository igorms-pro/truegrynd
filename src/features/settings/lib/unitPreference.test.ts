import { describe, expect, it } from 'vitest';

import { readUnitPreference, writeUnitPreference } from '@/features/settings/lib/unitPreference';

describe('unitPreference', () => {
  it('defaults to metric', () => {
    writeUnitPreference('metric');
    expect(readUnitPreference()).toBe('metric');
  });

  it('persists imperial selection', () => {
    writeUnitPreference('imperial');
    expect(readUnitPreference()).toBe('imperial');
    writeUnitPreference('metric');
  });
});
