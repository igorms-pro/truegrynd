'use client';

/**
 * MM:SS duration picker — two number steppers (minutes 0–999, seconds 0–59) that emit a
 * single "M:SS" string, the exact shape `isValidHoldTime` / `capDurationSeconds` accept.
 * Replaces free-text time entry (no more typing colons) for hold blocks and scoring caps.
 */

function parse(value: string): { minutes: string; seconds: string } {
  const match = /^(\d{1,3}):([0-5]?\d)$/.exec(value.trim());
  if (!match) return { minutes: '', seconds: '' };
  return { minutes: match[1], seconds: match[2] };
}

function clamp(raw: string, max: number): string {
  const digits = raw.replace(/\D/g, '');
  if (digits === '') return '';
  return String(Math.min(Number(digits), max));
}

function combine(minutes: string, seconds: string): string {
  if (minutes === '' && seconds === '') return '';
  const m = minutes === '' ? 0 : Number(minutes);
  const s = seconds === '' ? 0 : Number(seconds);
  return `${m}:${String(s).padStart(2, '0')}`;
}

type DurationInputProps = {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  minutesLabel: string;
  secondsLabel: string;
};

export function DurationInput({
  id,
  value,
  onChange,
  disabled,
  minutesLabel,
  secondsLabel,
}: DurationInputProps) {
  const { minutes, seconds } = parse(value);

  const inputClass =
    'w-20 rounded-sm border border-border bg-background px-3 py-2 text-center text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';

  return (
    <div className="mt-1 flex items-end gap-2">
      <div>
        <label
          htmlFor={id ? `${id}-min` : undefined}
          className="block text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground"
        >
          {minutesLabel}
        </label>
        <input
          id={id ? `${id}-min` : undefined}
          type="number"
          inputMode="numeric"
          min={0}
          max={999}
          step={1}
          disabled={disabled}
          placeholder="0"
          autoComplete="off"
          className={inputClass}
          value={minutes}
          onChange={(e) => onChange(combine(clamp(e.target.value, 999), seconds))}
        />
      </div>
      <span aria-hidden className="pb-2 text-sm font-black text-muted-foreground">
        :
      </span>
      <div>
        <label
          htmlFor={id ? `${id}-sec` : undefined}
          className="block text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground"
        >
          {secondsLabel}
        </label>
        <input
          id={id ? `${id}-sec` : undefined}
          type="number"
          inputMode="numeric"
          min={0}
          max={59}
          step={1}
          disabled={disabled}
          placeholder="00"
          autoComplete="off"
          className={inputClass}
          value={seconds}
          onChange={(e) => onChange(combine(minutes, clamp(e.target.value, 59)))}
        />
      </div>
    </div>
  );
}
