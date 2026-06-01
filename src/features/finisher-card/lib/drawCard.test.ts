import { describe, expect, it } from 'vitest';

import { drawFinisherCard } from '@/features/finisher-card/lib/drawCard';

function createCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.getContext = ((contextId: string) => {
    if (contextId !== '2d') return null;
    return {
      measureText(text: string) {
        return { width: text.length * 10 };
      },
      fillRect: () => undefined,
      strokeRect: () => undefined,
      fillText: () => undefined,
      font: '',
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      textBaseline: 'top',
    } as unknown as CanvasRenderingContext2D;
  }) as HTMLCanvasElement['getContext'];
  return canvas;
}

describe('drawFinisherCard', () => {
  it('renders thumb layout without throwing for long titles and time scores', () => {
    const canvas = createCanvas();
    expect(() =>
      drawFinisherCard(canvas, {
        width: 360,
        height: 640,
        faction: 'iron_alliance',
        division: 'rookie',
        username: 'igorms',
        challengeTitle: 'QA Official — Max Push-Ups (1 min)',
        scoreType: 'time',
        scoreValue: 430,
        topPercent: null,
        rankTextOverride: 'RANKED',
        rankSubOverride: 'VALIDATED',
      }),
    ).not.toThrow();
    expect(canvas.width).toBe(360);
    expect(canvas.height).toBe(640);
  });

  it('renders saved thumb layout without throwing for large rep counts', () => {
    const canvas = createCanvas();
    expect(() =>
      drawFinisherCard(canvas, {
        width: 360,
        height: 640,
        faction: 'horde',
        division: 'savage',
        username: 'longusernamehere',
        challengeTitle: 'QA Official — Burpees For Time',
        scoreType: 'reps',
        scoreValue: 999,
        topPercent: null,
        rankTextOverride: 'SAVED',
        rankSubOverride: 'NO VIDEO',
      }),
    ).not.toThrow();
  });

  it('renders weekly badge layout without throwing', () => {
    const canvas = createCanvas();
    expect(() =>
      drawFinisherCard(canvas, {
        width: 360,
        height: 640,
        faction: 'nomads',
        division: 'regular',
        username: 'grinder',
        challengeTitle: 'Weekly Burpees',
        scoreType: 'reps',
        scoreValue: 120,
        topPercent: 12,
        weeklyBadge: 'W22 · 2026',
      }),
    ).not.toThrow();
  });
});
