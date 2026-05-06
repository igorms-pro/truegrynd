import type { Faction, ScoreType } from '@/lib/types/database.types';

type Options = {
  width: number;
  height: number;
  faction: Faction;
  username: string;
  challengeTitle: string;
  scoreType: ScoreType;
  scoreValue: number;
  topPercent: number | null;
};

function factionColor(faction: Faction): string {
  if (faction === 'nomads') return '#4a9e6f';
  if (faction === 'horde') return '#c0392b';
  return '#7f8c8d';
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

  // main panel
  ctx.fillStyle = card;
  ctx.fillRect(innerX, innerY, innerW, innerH);

  // border
  ctx.strokeStyle = border;
  ctx.lineWidth = 4;
  ctx.strokeRect(innerX, innerY, innerW, innerH);

  // faction slash
  ctx.fillStyle = accent;
  ctx.fillRect(innerX, innerY, Math.floor(innerW * 0.02), innerH);

  // header branding
  ctx.fillStyle = fg;
  ctx.font = '900 54px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText('TRUEGRYND', innerX + 30, innerY + 28);

  ctx.fillStyle = muted;
  ctx.font = '900 22px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillText(options.challengeTitle.toUpperCase(), innerX + 30, innerY + 96);

  // main score
  ctx.fillStyle = fg;
  ctx.font = '900 160px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  const scoreText =
    options.scoreType === 'time' ? formatSeconds(options.scoreValue) : String(options.scoreValue);
  ctx.fillText(scoreText, innerX + 30, innerY + 190);

  ctx.fillStyle = muted;
  ctx.font = '900 26px system-ui, -apple-system, Segoe UI, sans-serif';
  const label = options.scoreType === 'time' ? 'TIME (MM:SS)' : 'REPS';
  ctx.fillText(label, innerX + 30, innerY + 370);

  // rank
  ctx.fillStyle = fg;
  ctx.font = '900 72px system-ui, -apple-system, Segoe UI, sans-serif';
  const rankText = options.topPercent ? `TOP ${options.topPercent}%` : 'SAVED';
  ctx.fillText(rankText, innerX + 30, innerY + 470);

  ctx.fillStyle = muted;
  ctx.font = '900 22px system-ui, -apple-system, Segoe UI, sans-serif';
  const rankSub = options.topPercent ? 'WORLDWIDE (VALIDATED)' : 'NOT RANKED (NO VIDEO)';
  ctx.fillText(rankSub, innerX + 30, innerY + 560);

  // footer identity
  ctx.fillStyle = accent;
  ctx.font = '900 26px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillText(options.username.toUpperCase(), innerX + 30, innerY + innerH - 70);

  ctx.fillStyle = muted;
  ctx.font = '900 22px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillText(options.faction.replace('_', ' ').toUpperCase(), innerX + 30, innerY + innerH - 40);
}

function formatSeconds(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}
