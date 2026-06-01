import { describe, expect, it } from 'vitest';

import { isAllowedVideoUrl } from '@/lib/scoring/videoUrl';

describe('isAllowedVideoUrl', () => {
  it('accepts YouTube watch and short links', () => {
    expect(isAllowedVideoUrl('https://www.youtube.com/watch?v=abc123')).toBe(true);
    expect(isAllowedVideoUrl('https://youtu.be/abc123')).toBe(true);
  });

  it('accepts TikTok links', () => {
    expect(isAllowedVideoUrl('https://www.tiktok.com/@user/video/123')).toBe(true);
  });

  it('rejects invalid or unsupported hosts', () => {
    expect(isAllowedVideoUrl('not-a-url')).toBe(false);
    expect(isAllowedVideoUrl('https://example.com/video')).toBe(false);
  });
});
