export const FINISHER_FRAME_STYLES = ['standard', 'neon', 'gold', 'carbon'] as const;

export type FinisherFrameStyle = (typeof FINISHER_FRAME_STYLES)[number];

export const PREMIUM_FINISHER_FRAMES: FinisherFrameStyle[] = ['neon', 'gold', 'carbon'];

export function isPremiumFinisherFrame(style: FinisherFrameStyle): boolean {
  return style !== 'standard';
}
