import { describe, expect, it } from 'vitest';

import { DIVISIONS } from '@/lib/divisions/constants';
import { getDivisionBadgeClasses, getDivisionColor } from '@/lib/divisions/divisionStyles';

describe('divisionStyles', () => {
  it('returns badge classes for every canonical division', () => {
    for (const division of DIVISIONS) {
      const classes = getDivisionBadgeClasses(division);
      expect(classes.bg).toContain('bg-');
      expect(classes.text).toContain('text-');
      expect(classes.border).toContain('border-');
    }
  });

  it('returns a hex color for every canonical division', () => {
    for (const division of DIVISIONS) {
      expect(getDivisionColor(division)).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
