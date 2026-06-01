'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  hideScoreFromCards,
  SCORE_ACTION_ERRORS,
  updateScoreVideoUrl,
} from '@/features/profile/services/scoreActions';

type Props = {
  scoreId: string;
  userId: string;
  currentVideoUrl: string | null;
  onChanged: () => void;
};

export function HistoryScoreActions({ scoreId, userId, currentVideoUrl, onChanged }: Props) {
  const t = useTranslations('profile.historyPage.actions');
  const [open, setOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState(currentVideoUrl ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closeMenu = useCallback(() => setOpen(false), []);

  const onHide = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      await hideScoreFromCards(scoreId, userId);
      closeMenu();
      onChanged();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'unknown';
      setError(message);
    } finally {
      setBusy(false);
    }
  }, [closeMenu, onChanged, scoreId, userId]);

  const onSaveVideo = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      await updateScoreVideoUrl(scoreId, userId, videoUrl);
      setEditingVideo(false);
      closeMenu();
      onChanged();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'unknown';
      if (message === SCORE_ACTION_ERRORS.VIDEO_INVALID) {
        setError(t('videoInvalid'));
      } else {
        setError(t('updateFailed'));
      }
    } finally {
      setBusy(false);
    }
  }, [closeMenu, onChanged, scoreId, t, userId, videoUrl]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('menuAria')}
        disabled={busy}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border bg-muted px-2 text-sm font-black text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        ⋯
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-1 min-w-[12rem] rounded-md border border-border bg-card p-2 shadow-lg"
        >
          {!editingVideo ? (
            <>
              <button
                type="button"
                role="menuitem"
                className="block w-full rounded-sm px-2 py-2 text-left text-[11px] font-black uppercase tracking-[0.14em] text-foreground hover:bg-muted"
                onClick={() => {
                  setEditingVideo(true);
                  setError(null);
                }}
              >
                {t('updateVideo')}
              </button>
              <button
                type="button"
                role="menuitem"
                className="block w-full rounded-sm px-2 py-2 text-left text-[11px] font-black uppercase tracking-[0.14em] text-foreground hover:bg-muted"
                onClick={() => void onHide()}
              >
                {t('hideFromCards')}
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                {t('videoLabel')}
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-2 text-xs text-foreground"
                  placeholder="https://"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void onSaveVideo()}
                  disabled={busy}
                  className="flex-1 rounded-sm bg-primary px-2 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-primary-foreground"
                >
                  {t('save')}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingVideo(false)}
                  disabled={busy}
                  className="flex-1 rounded-sm border border-border px-2 py-2 text-[10px] font-black uppercase tracking-[0.14em]"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {error ? <p className="mt-1 text-[10px] text-primary">{error}</p> : null}
    </div>
  );
}
