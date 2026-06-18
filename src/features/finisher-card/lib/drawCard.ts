import type { FinisherCardDrawOptions } from '@/lib/finisher/buildFinisherCardOptions';
import { getDivisionColor } from '@/lib/divisions';
import type { FinisherFrameStyle } from '@/lib/finisher/frameStyles';
import type { Faction } from '@/lib/types/database.types';

type Options = FinisherCardDrawOptions;

function factionColor(faction: Faction): string {
  if (faction === 'nomads') return '#4a9e6f';
  if (faction === 'horde') return '#c0392b';
  return '#7f8c8d';
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  weight: number,
  family: string,
  startSize: number,
  minSize = 18,
): number {
  let size = startSize;
  while (size >= minSize) {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 2;
  }
  return minSize;
}

function truncateToWidth(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let trimmed = text;
  while (trimmed.length > 0 && ctx.measureText(`${trimmed}…`).width > maxWidth) {
    trimmed = trimmed.slice(0, -1);
  }
  return trimmed.length > 0 ? `${trimmed}…` : '…';
}

export function drawFinisherCard(canvas: HTMLCanvasElement, options: Options): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = options.width;
  canvas.height = options.height;

  const bg = '#0a0a0f';
  const card = '#111118';
  const border = '#2a2a3a';
  const fg = '#f9fafb';
  const muted = '#9ca3af';
  const accent = factionColor(options.faction);

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const pad = Math.floor(canvas.width * 0.06);
  const innerX = pad;
  const innerY = pad;
  const innerW = canvas.width - pad * 2;
  const innerH = canvas.height - pad * 2;
  const textX = innerX + Math.floor(innerW * 0.08);
  const maxTextW = innerW * 0.84;
  const lineY = (pct: number) => innerY + Math.floor(innerH * pct);

  ctx.fillStyle = card;
  ctx.fillRect(innerX, innerY, innerW, innerH);

  ctx.strokeStyle = border;
  ctx.lineWidth = Math.max(2, Math.floor(canvas.width * 0.011));
  ctx.strokeRect(innerX, innerY, innerW, innerH);

  ctx.fillStyle = accent;
  ctx.fillRect(innerX, innerY, Math.max(4, Math.floor(innerW * 0.02)), innerH);

  ctx.textBaseline = 'top';

  // Header is laid out with a flowing vertical cursor that advances by each
  // line's measured height + a gap. This guarantees no overlap regardless of
  // card dimensions (the previous fixed-percentage positions collided when the
  // wordmark font grew on wide/short cards).
  const FONT = 'system-ui, -apple-system, Segoe UI, sans-serif';
  const gap = Math.floor(innerH * 0.014);
  let cursorY = lineY(0.04);

  const brandSize = fitFontSize(ctx, 'TRUEGRYND', maxTextW, 900, FONT, Math.floor(innerW * 0.15));
  ctx.fillStyle = fg;
  ctx.font = `900 ${brandSize}px ${FONT}`;
  ctx.fillText('TRUEGRYND', textX, cursorY);
  cursorY += brandSize + gap;

  if (options.tagline) {
    const taglineSize = fitFontSize(
      ctx,
      options.tagline,
      maxTextW,
      900,
      FONT,
      Math.floor(innerW * 0.045),
      10,
    );
    ctx.fillStyle = accent;
    ctx.font = `900 ${taglineSize}px ${FONT}`;
    ctx.fillText(truncateToWidth(ctx, options.tagline, maxTextW), textX, cursorY);
    cursorY += taglineSize + gap;
  }

  if (options.weeklyBadge) {
    const weeklySize = fitFontSize(
      ctx,
      options.weeklyBadge.toUpperCase(),
      maxTextW,
      900,
      FONT,
      Math.floor(innerW * 0.055),
      12,
    );
    ctx.fillStyle = '#ffb800';
    ctx.font = `900 ${weeklySize}px ${FONT}`;
    ctx.fillText(truncateToWidth(ctx, options.weeklyBadge.toUpperCase(), maxTextW), textX, cursorY);
    cursorY += weeklySize + gap;
  }

  if (options.eventBadge) {
    const eventSize = fitFontSize(
      ctx,
      options.eventBadge,
      maxTextW,
      900,
      FONT,
      Math.floor(innerW * 0.05),
      10,
    );
    ctx.fillStyle = '#ffb800';
    ctx.font = `900 ${eventSize}px ${FONT}`;
    ctx.fillText(truncateToWidth(ctx, options.eventBadge, maxTextW), textX, cursorY);
    cursorY += eventSize + gap;
  }

  cursorY += Math.floor(innerH * 0.006);
  const titleSize = fitFontSize(
    ctx,
    options.challengeTitle.toUpperCase(),
    maxTextW,
    900,
    FONT,
    Math.floor(innerW * 0.062),
    14,
  );
  ctx.fillStyle = muted;
  ctx.font = `900 ${titleSize}px ${FONT}`;
  const title = truncateToWidth(ctx, options.challengeTitle.toUpperCase(), maxTextW);
  ctx.fillText(title, textX, cursorY);

  const scoreTop = lineY(0.26);
  const labelTop = lineY(0.52);
  const maxScoreHeight = Math.max(24, labelTop - scoreTop - Math.floor(innerH * 0.02));

  const scoreText =
    options.scoreType === 'time' ? formatSeconds(options.scoreValue) : String(options.scoreValue);
  let scoreSize = fitFontSize(
    ctx,
    scoreText,
    maxTextW,
    900,
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    Math.floor(innerW * 0.44),
  );
  scoreSize = Math.min(scoreSize, maxScoreHeight);

  ctx.fillStyle = fg;
  ctx.font = `900 ${scoreSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
  ctx.fillText(scoreText, textX, scoreTop);

  const compact = options.height <= 700;
  const labelY = compact ? lineY(0.54) : lineY(0.52);
  const rankY = compact ? lineY(0.6) : lineY(0.58);
  const rankSubY = compact ? lineY(0.66) : lineY(0.68);
  const hasGrowth = Boolean(options.ratingDeltaText || options.warPointsText);
  const usernameY = compact ? lineY(hasGrowth ? 0.78 : 0.76) : lineY(hasGrowth ? 0.8 : 0.78);
  const divisionY = compact ? lineY(hasGrowth ? 0.84 : 0.82) : lineY(hasGrowth ? 0.85 : 0.83);
  const factionY = compact ? lineY(hasGrowth ? 0.9 : 0.88) : lineY(hasGrowth ? 0.91 : 0.89);

  const labelSize = Math.floor(innerW * (compact ? 0.06 : 0.072));
  ctx.fillStyle = muted;
  ctx.font = `900 ${labelSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
  const label = options.metricLabel ?? (options.scoreType === 'time' ? 'TIME (MM:SS)' : 'REPS');
  ctx.fillText(label, textX, labelY);

  const rankText =
    options.rankTextOverride ?? (options.topPercent ? `TOP ${options.topPercent}%` : 'SAVED');
  const rankSize = fitFontSize(
    ctx,
    rankText,
    maxTextW,
    900,
    'system-ui, -apple-system, Segoe UI, sans-serif',
    Math.floor(innerW * (compact ? 0.16 : 0.2)),
  );
  ctx.fillStyle = fg;
  ctx.font = `900 ${rankSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
  ctx.fillText(rankText, textX, rankY);

  const rankSub =
    options.rankSubOverride ??
    (options.topPercent ? 'WORLDWIDE (VALIDATED)' : 'NOT RANKED (NO VIDEO)');
  const rankSubSize = fitFontSize(
    ctx,
    rankSub,
    maxTextW,
    900,
    'system-ui, -apple-system, Segoe UI, sans-serif',
    Math.floor(innerW * (compact ? 0.05 : 0.058)),
    compact ? 10 : 12,
  );
  ctx.fillStyle = muted;
  ctx.font = `900 ${rankSubSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
  const rankSubLine = truncateToWidth(ctx, rankSub, maxTextW);
  ctx.fillText(rankSubLine, textX, rankSubY);

  const growthY = compact ? lineY(0.72) : lineY(0.74);
  if (hasGrowth) {
    const growthText = [options.ratingDeltaText, options.warPointsText].filter(Boolean).join(' · ');
    const growthSize = Math.floor(innerW * (compact ? 0.045 : 0.05));
    ctx.fillStyle = '#ffb800';
    ctx.font = `900 ${growthSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
    ctx.fillText(truncateToWidth(ctx, growthText, maxTextW), textX, growthY);
  }

  const usernameSize = Math.floor(innerW * (compact ? 0.06 : 0.072));
  ctx.fillStyle = accent;
  ctx.font = `900 ${usernameSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
  ctx.fillText(truncateToWidth(ctx, options.username.toUpperCase(), maxTextW), textX, usernameY);

  const divisionLabel = options.division.toUpperCase();
  const divisionSize = Math.floor(innerW * (compact ? 0.05 : 0.058));
  ctx.fillStyle = getDivisionColor(options.division);
  ctx.font = `900 ${divisionSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
  ctx.fillText(truncateToWidth(ctx, divisionLabel, maxTextW), textX, divisionY);

  const factionLabel = options.faction.replace('_', ' ').toUpperCase();
  const factionSize = Math.floor(innerW * (compact ? 0.05 : 0.058));
  ctx.fillStyle = muted;
  ctx.font = `900 ${factionSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
  ctx.fillText(truncateToWidth(ctx, factionLabel, maxTextW), textX, factionY);

  drawFinisherFrame(ctx, {
    innerX,
    innerY,
    innerW,
    innerH,
    accent,
    frameStyle: options.frameStyle ?? 'standard',
    lineWidth: Math.max(2, Math.floor(canvas.width * 0.011)),
  });
}

function drawFinisherFrame(
  ctx: CanvasRenderingContext2D,
  params: {
    innerX: number;
    innerY: number;
    innerW: number;
    innerH: number;
    accent: string;
    frameStyle: FinisherFrameStyle;
    lineWidth: number;
  },
): void {
  const { innerX, innerY, innerW, innerH, accent, frameStyle, lineWidth } = params;
  if (frameStyle === 'standard') return;

  const inset = Math.max(4, Math.floor(innerW * 0.02));

  if (frameStyle === 'neon') {
    ctx.strokeStyle = accent;
    ctx.lineWidth = lineWidth * 2;
    ctx.strokeRect(innerX + inset, innerY + inset, innerW - inset * 2, innerH - inset * 2);
    ctx.strokeStyle = '#f9fafb';
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(innerX + inset * 2, innerY + inset * 2, innerW - inset * 4, innerH - inset * 4);
    return;
  }

  if (frameStyle === 'gold') {
    ctx.strokeStyle = '#ffb800';
    ctx.lineWidth = lineWidth * 3;
    ctx.strokeRect(innerX + inset, innerY + inset, innerW - inset * 2, innerH - inset * 2);
    ctx.fillStyle = 'rgba(255, 184, 0, 0.08)';
    ctx.fillRect(innerX + inset, innerY + inset, innerW - inset * 2, innerH - inset * 2);
    return;
  }

  if (frameStyle === 'carbon') {
    ctx.strokeStyle = '#3a3a4a';
    ctx.lineWidth = lineWidth * 2;
    ctx.strokeRect(innerX + inset, innerY + inset, innerW - inset * 2, innerH - inset * 2);
    const step = Math.max(8, Math.floor(innerW * 0.04));
    ctx.strokeStyle = 'rgba(42, 42, 58, 0.6)';
    ctx.lineWidth = 1;
    for (let x = innerX + inset; x < innerX + innerW - inset; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, innerY + inset);
      ctx.lineTo(x, innerY + innerH - inset);
      ctx.stroke();
    }
    for (let y = innerY + inset; y < innerY + innerH - inset; y += step) {
      ctx.beginPath();
      ctx.moveTo(innerX + inset, y);
      ctx.lineTo(innerX + innerW - inset, y);
      ctx.stroke();
    }
  }
}

function formatSeconds(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}
