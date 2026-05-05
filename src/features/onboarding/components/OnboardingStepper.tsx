'use client';

import type { OnboardingStep } from '@/features/onboarding/lib/onboardingStep';

type ViewStep = Exclude<OnboardingStep, 'completed'>;

type Props = {
  flowName: string;
  activeStep: 1 | 2 | 3;
  labels: readonly [string, string, string];
  onSelect: (target: ViewStep) => void;
};

const STEPS = [
  { n: 1 as const, step: 'identity' as const },
  { n: 2 as const, step: 'initiation' as const },
  { n: 3 as const, step: 'faction' as const },
] as const;

function buttonClassName(isActive: boolean): string {
  return `flex h-9 md:h-10 w-full items-center justify-center rounded-md border transition-opacity hover:opacity-90 ${
    isActive ? 'border-primary/40 bg-primary/10' : 'border-border bg-background'
  }`;
}

export function OnboardingStepper({ flowName, activeStep, labels, onSelect }: Props) {
  return (
    <div className="mt-3 md:mt-6 rounded-lg border border-border bg-card p-3 md:p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground">{flowName}</p>
      </div>

      <div className="mt-3 md:mt-4">
        <ol className="flex items-center justify-between gap-2 text-center">
          {STEPS.map(({ n, step }, idx) => {
            const label = labels[idx];
            const isActive = n <= activeStep;
            return (
              <li key={n} className="flex-1">
                <button
                  type="button"
                  onClick={() => onSelect(step)}
                  className={buttonClassName(isActive)}
                  aria-label={label}
                >
                  <span className="text-xs font-black tracking-tight">{n}</span>
                </button>
                <p className="mt-1.5 md:mt-2 text-[11px] text-muted-foreground">{label}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
