'use client';

import { ArrowLeft, FileUp, Send, Trash2, Upload } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { FilterSelect } from '@/components/FilterSelect';
import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import {
  addImports,
  deleteImport,
  inviteAllPending,
  listImports,
  type MemberImportInput,
} from '@/features/pro/services/imports';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { parseCsv, type ParsedCsv } from '@/lib/csv';

type Mapping = { email: string; name: string; sex: string; age: string };

/** Guess columns from common header names (Peppy / Hustle Up / Resawod / generic exports). */
function guessMapping(headers: string[]): Mapping {
  const find = (re: RegExp) => {
    const i = headers.findIndex((h) => re.test(h.trim()));
    return i === -1 ? '' : String(i);
  };
  return {
    email: find(/mail|courriel/i),
    name: find(/^(nom complet|full ?name|name|nom|pr[ée]nom)/i),
    sex: find(/sexe?$|genre|gender/i),
    age: find(/^(age|âge)$/i),
  };
}

function normalizeSex(raw: string): 'male' | 'female' | null {
  const v = raw.trim().toLowerCase();
  if (/^(m|h|homme|male|man)$/.test(v)) return 'male';
  if (/^(f|femme|female|woman)$/.test(v)) return 'female';
  return null;
}

function toInputs(csv: ParsedCsv, map: Mapping): MemberImportInput[] {
  const idx = (s: string) => (s === '' ? -1 : Number(s));
  const [ei, ni, si, ai] = [idx(map.email), idx(map.name), idx(map.sex), idx(map.age)];
  const seen = new Set<string>();
  const out: MemberImportInput[] = [];
  for (const row of csv.rows) {
    const email = (row[ei] ?? '').trim().toLowerCase();
    if (!email.includes('@') || seen.has(email)) continue;
    seen.add(email);
    const age = ai >= 0 ? Number((row[ai] ?? '').replace(/\D/g, '')) : NaN;
    out.push({
      email,
      fullName: ni >= 0 ? (row[ni] ?? '').trim() || null : null,
      sex: si >= 0 ? normalizeSex(row[si] ?? '') : null,
      age: Number.isFinite(age) && age >= 10 && age <= 100 ? age : null,
    });
  }
  return out;
}

const STATUS_PILL: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-500',
  invited: 'bg-sky-500/15 text-sky-400',
  joined: 'bg-emerald-500/15 text-emerald-500',
};

export function ImportMembersScreen() {
  const t = useTranslations('pro.membersImport');
  const locale = useLocale();
  const profile = useOptionalAppProfile();
  const gymId = profile?.affiliated_gym_id ?? null;

  const load = useCallback(() => listImports(gymId ?? ''), [gymId]);
  const { state, refetch } = useAsyncResource(load, [gymId ?? ''], { enabled: gymId !== null });

  const [csv, setCsv] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<Mapping>({ email: '', name: '', sex: '', age: '' });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const parsed = useMemo(
    () => (csv && mapping.email !== '' ? toInputs(csv, mapping) : []),
    [csv, mapping],
  );

  async function onFile(file: File) {
    const text = await file.text();
    const result = parseCsv(text);
    setCsv(result);
    setMapping(guessMapping(result.headers));
    setNotice(null);
  }

  async function doImport() {
    if (!gymId || parsed.length === 0) return;
    setBusy(true);
    setError(false);
    try {
      const { inserted, skipped } = await addImports(gymId, parsed);
      setNotice(t('imported', { inserted, skipped }));
      setCsv(null);
      refetch();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  async function doInvite() {
    setBusy(true);
    setError(false);
    try {
      const { invited, joined, failed } = await inviteAllPending();
      setNotice(t('invitedResult', { invited, joined, failed }));
      refetch();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  if (!gymId) return <p className="text-sm text-muted-foreground">{t('noGym')}</p>;

  const imports = state.status === 'ready' ? state.data : [];
  const pendingCount = imports.filter((i) => i.status === 'pending').length;
  const headerOptions = (csv?.headers ?? []).map((h, i) => ({ value: String(i), label: h }));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href={`/${locale}/app/pro/members`}
        className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t('back')}
      </Link>

      <header className="space-y-1">
        <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </header>

      {notice ? (
        <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
          {t('error')}
        </p>
      ) : null}

      {!csv ? (
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-md border border-dashed border-border bg-muted/20 p-10 text-center hover:border-primary/60">
          <FileUp className="h-8 w-8 text-muted-foreground" aria-hidden />
          <span className="text-sm font-black uppercase tracking-[0.14em]">{t('dropTitle')}</span>
          <span className="max-w-md text-xs text-muted-foreground">{t('dropBody')}</span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
            }}
          />
        </label>
      ) : (
        <div className="space-y-4 rounded-md border border-border border-l-2 border-l-primary bg-card p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em]">
            {t('mapTitle', { rows: csv.rows.length })}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(['email', 'name', 'sex', 'age'] as const).map((field) => (
              <div
                key={field}
                className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground"
              >
                {t(`fields.${field}`)}
                <div className="mt-1.5">
                  <FilterSelect
                    value={mapping[field]}
                    onChange={(v) => setMapping((m) => ({ ...m, [field]: v }))}
                    options={headerOptions}
                    allLabel={t('ignore')}
                    ariaLabel={t(`fields.${field}`)}
                  />
                </div>
              </div>
            ))}
          </div>

          {mapping.email === '' ? (
            <p className="text-xs font-semibold text-primary">{t('emailRequired')}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t('previewCount', { count: parsed.length })}
              {parsed
                .slice(0, 3)
                .map((p) => ` · ${p.email}`)
                .join('')}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy || parsed.length === 0}
              onClick={doImport}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" aria-hidden />
              {busy ? t('importing') : t('importCta', { count: parsed.length })}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setCsv(null)}
              className="rounded-md border border-border px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t('listTitle', { count: imports.length })}
          </h2>
          {pendingCount > 0 ? (
            <button
              type="button"
              disabled={busy}
              onClick={doInvite}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" aria-hidden />
              {t('inviteCta', { count: pendingCount })}
            </button>
          ) : null}
        </div>

        {imports.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            {t('listEmpty')}
          </p>
        ) : (
          <ul className="rounded-md border border-border bg-card">
            {imports.map((imp) => (
              <li
                key={imp.id}
                className="flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-b-0"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{imp.email}</span>
                  {imp.fullName ? (
                    <span className="block truncate text-xs text-muted-foreground">
                      {imp.fullName}
                    </span>
                  ) : null}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] ${STATUS_PILL[imp.status]}`}
                >
                  {t(`status.${imp.status}`)}
                </span>
                {imp.status === 'pending' ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await deleteImport(imp.id);
                      refetch();
                    }}
                    aria-label={t('delete')}
                    className="shrink-0 rounded-sm p-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                ) : (
                  <span className="w-6 shrink-0" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{t('conciergeNote')}</p>
    </div>
  );
}
