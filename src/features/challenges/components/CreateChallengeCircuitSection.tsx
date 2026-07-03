'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { DurationInput } from '@/features/challenges/components/DurationInput';
import type { CreateChallengeFormValues } from '@/features/challenges/lib/createChallengeSchema';
import {
  movementsByCategory,
  OTHER_MOVEMENT_SLUG,
  type MovementCategory,
} from '@/features/challenges/lib/movementCatalog';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs font-semibold text-primary" role="alert">
      {message}
    </p>
  );
}

const EMPTY_ROW = { label: '', kind: 'reps' as const, amount: '', movementSlug: '' };

const CATEGORY_ORDER: MovementCategory[] = [
  'push',
  'pull',
  'squat',
  'hinge',
  'lunge',
  'carry',
  'cardio',
  'olympic',
  'core',
  'isometric',
  'plyometric',
  'gymnastics',
];

export function CreateChallengeCircuitSection({ disabled }: { disabled: boolean }) {
  const t = useTranslations('arena.create');
  const tMov = useTranslations('movements');
  const tCat = useTranslations('movements.categories');
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<CreateChallengeFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'circuitBlocks',
  });

  const blocks = useWatch({ control, name: 'circuitBlocks' }) ?? [];
  const grouped = movementsByCategory();

  const handleMovementChange = useCallback(
    (index: number, slug: string) => {
      setValue(`circuitBlocks.${index}.movementSlug`, slug, { shouldValidate: false });
      if (slug && slug !== OTHER_MOVEMENT_SLUG) {
        setValue(`circuitBlocks.${index}.label`, tMov(slug), { shouldValidate: false });
      } else {
        setValue(`circuitBlocks.${index}.label`, '', { shouldValidate: false });
      }
    },
    [setValue, tMov],
  );

  const kindBtnClass = (index: number, kind: 'reps' | 'hold') =>
    [
      'flex-1 rounded-sm border px-2 py-2 text-[10px] font-black uppercase tracking-[0.14em] transition-colors',
      blocks[index]?.kind === kind
        ? 'border-primary bg-primary/15 text-primary'
        : 'border-border bg-background text-muted-foreground hover:text-foreground',
    ].join(' ');

  const circuitErrors = errors.circuitBlocks;
  const rootError =
    circuitErrors && !Array.isArray(circuitErrors)
      ? (circuitErrors as { message?: string }).message
      : undefined;

  return (
    <fieldset className="space-y-3 rounded-sm border border-border bg-muted/30 p-4">
      <legend className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
        {t('circuit.legend')}
      </legend>
      <p className="text-xs text-muted-foreground">{t('circuit.helper')}</p>

      {rootError ? (
        <p className="text-xs font-semibold text-primary" role="alert">
          {rootError}
        </p>
      ) : null}

      <div className="space-y-4">
        {fields.map((field, index) => {
          const slug = blocks[index]?.movementSlug ?? '';
          const isOther = slug === OTHER_MOVEMENT_SLUG;
          const kind = blocks[index]?.kind ?? 'reps';
          const amountPlaceholder =
            kind === 'hold'
              ? t('circuit.amountPlaceholderHold')
              : t('circuit.amountPlaceholderReps');

          return (
            <div
              key={field.id}
              className="space-y-3 rounded-sm border border-border bg-background p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="pt-1 text-[10px] font-black text-muted-foreground">
                  #{index + 1}
                </span>
                {fields.length > 1 ? (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => remove(index)}
                    className="rounded-sm border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                    aria-label={t('circuit.removeRow')}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor={`cc-move-select-${field.id}`}
                  className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {t('circuit.movement')}
                </label>
                <select
                  id={`cc-move-select-${field.id}`}
                  disabled={disabled}
                  value={slug}
                  onChange={(e) => handleMovementChange(index, e.target.value)}
                  className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">{t('circuit.movementPlaceholder')}</option>
                  {CATEGORY_ORDER.map((cat) => {
                    const items = grouped.get(cat);
                    if (!items) return null;
                    return (
                      <optgroup key={cat} label={tCat(cat)}>
                        {items.map((m) => (
                          <option key={m.slug} value={m.slug}>
                            {tMov(m.slug)}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                  <option value={OTHER_MOVEMENT_SLUG}>{t('circuit.otherOption')}</option>
                </select>
                <input type="hidden" {...register(`circuitBlocks.${index}.movementSlug`)} />
              </div>

              {isOther ? (
                <div>
                  <label
                    htmlFor={`cc-move-custom-${field.id}`}
                    className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    {t('circuit.otherLabel')}
                  </label>
                  <input
                    id={`cc-move-custom-${field.id}`}
                    type="text"
                    disabled={disabled}
                    placeholder={t('circuit.otherPlaceholder')}
                    className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register(`circuitBlocks.${index}.label`)}
                  />
                  <FieldError message={errors.circuitBlocks?.[index]?.label?.message} />
                </div>
              ) : null}

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={disabled}
                  className={kindBtnClass(index, 'reps')}
                  onClick={() =>
                    setValue(`circuitBlocks.${index}.kind`, 'reps', { shouldValidate: true })
                  }
                >
                  {t('circuit.kindReps')}
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  className={kindBtnClass(index, 'hold')}
                  onClick={() =>
                    setValue(`circuitBlocks.${index}.kind`, 'hold', { shouldValidate: true })
                  }
                >
                  {t('circuit.kindHold')}
                </button>
              </div>
              <input type="hidden" {...register(`circuitBlocks.${index}.kind`)} />

              <div>
                <label
                  htmlFor={`cc-amt-${field.id}`}
                  className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {kind === 'hold' ? t('circuit.amountHoldLabel') : t('circuit.amountRepsLabel')}
                </label>
                {kind === 'hold' ? (
                  <>
                    <DurationInput
                      id={`cc-amt-${field.id}`}
                      value={blocks[index]?.amount ?? ''}
                      disabled={disabled}
                      minutesLabel={t('circuit.durationMin')}
                      secondsLabel={t('circuit.durationSec')}
                      onChange={(next) =>
                        setValue(`circuitBlocks.${index}.amount`, next, { shouldValidate: true })
                      }
                    />
                    <input type="hidden" {...register(`circuitBlocks.${index}.amount`)} />
                  </>
                ) : (
                  <input
                    id={`cc-amt-${field.id}`}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    disabled={disabled}
                    placeholder={amountPlaceholder}
                    autoComplete="off"
                    className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register(`circuitBlocks.${index}.amount`)}
                  />
                )}
                <FieldError message={errors.circuitBlocks?.[index]?.amount?.message} />
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => append(EMPTY_ROW)}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-sm border border-dashed border-border px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        <Plus className="h-4 w-4" aria-hidden />
        {t('circuit.addMovement')}
      </button>
    </fieldset>
  );
}
