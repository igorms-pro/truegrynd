export type WeeklyTimeRemaining = {
  days: number;
  hours: number;
  minutes: number;
};

export function buildDefaultWeekLabel(startsAt: Date): string {
  const { week, year } = getIsoWeekParts(startsAt);
  return `W${String(week).padStart(2, '0')} · ${year}`;
}

export function getWeeklyTimeRemaining(
  endsAt: Date,
  now: Date = new Date(),
): WeeklyTimeRemaining | null {
  const ms = endsAt.getTime() - now.getTime();
  if (ms <= 0) return null;

  const totalMinutes = Math.floor(ms / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes };
}

export function isWeeklyWindowLive(startsAt: Date, endsAt: Date, now: Date = new Date()): boolean {
  const t = now.getTime();
  return t >= startsAt.getTime() && t < endsAt.getTime();
}

function getIsoWeekParts(date: Date): { week: number; year: number } {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const year = utc.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return { week, year };
}

export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}
