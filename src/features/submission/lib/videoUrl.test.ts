import { describe, expect, it } from 'vitest';

import { isAllowedVideoUrl } from '@/features/submission/lib/videoUrl';

describe('isAllowedVideoUrl', () => {
  it('accepts YouTube watch URLs', () => {
    expect(isAllowedVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
  });

  it('accepts youtu.be and shorts URLs', () => {
    expect(isAllowedVideoUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
    expect(isAllowedVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe(true);
  });

  it('accepts TikTok URLs', () => {
    expect(isAllowedVideoUrl('https://www.tiktok.com/@user/video/123')).toBe(true);
    expect(isAllowedVideoUrl('https://m.tiktok.com/v/123.html')).toBe(true);
  });

  it('rejects non-http(s) and unsupported hosts', () => {
    expect(isAllowedVideoUrl('ftp://youtube.com/watch?v=123')).toBe(false);
    expect(isAllowedVideoUrl('not a url')).toBe(false);
    expect(isAllowedVideoUrl('javascript:alert(1)')).toBe(false);
    expect(isAllowedVideoUrl('https://example.com/video/123')).toBe(false);
  });
});
