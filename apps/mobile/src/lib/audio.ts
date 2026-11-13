// Where a verse's recitation audio and video come from (FR-VS-02).
// 1. verse.audioUrl / verse.videoUrl from the bundled content (set when a studio recording exists).
// 2. With EXPO_PUBLIC_API_URL set: the URLs the API returns (published from the CMS).
// 3. Dev builds only: placeholder audio clips so the player can be tested before recordings exist.
//    These are device text-to-speech, NOT real chanting, and never ship in a release build.
import type { AudioSource } from 'expo-audio';
import { useEffect, useState } from 'react';
import { api, apiEnabled } from './api';
import type { Verse } from './types';

const DEV_SAMPLES: Record<string, number> = __DEV__
  ? {
      '2.14': require('../../assets/audio/dev/verse-2.14.m4a'),
      '2.46': require('../../assets/audio/dev/verse-2.46.m4a'),
      '2.47': require('../../assets/audio/dev/verse-2.47.m4a'),
    }
  : {};

type Remote = { id: string; audio: string | null; video: string | null };

/** Audio and video for a verse. Either may be null; the player then falls back (video → audio → simulated). */
export function useVerseMedia(verse: Verse | undefined): { audio: AudioSource; video: string | null } {
  const bundledAudio = verse?.audioUrl || null;
  const bundledVideo = verse?.videoUrl || null;
  // The fetched URLs are kept with their verse id, so a stale answer for another verse is ignored.
  const [fetched, setFetched] = useState<Remote | null>(null);
  const id = verse?.id;

  useEffect(() => {
    if (!id || (bundledAudio && bundledVideo) || !apiEnabled) return;
    let alive = true;
    api<Verse>(`/v1/verses/${id}`, { auth: false })
      .then((v) => alive && setFetched({ id, audio: v.audioUrl || null, video: v.videoUrl || null }))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [id, bundledAudio, bundledVideo]);

  const remote = fetched && fetched.id === id ? fetched : null;
  const audioUrl = bundledAudio || remote?.audio;
  const audio: AudioSource = audioUrl ? { uri: audioUrl } : ((verse && DEV_SAMPLES[verse.id]) ?? null);
  return { audio, video: bundledVideo || remote?.video || null };
}
