// Where a verse's recitation audio comes from (FR-VS-02).
// 1. verse.audioUrl from the bundled content (set when a studio recording exists).
// 2. With EXPO_PUBLIC_API_URL set: the audioUrl the API returns (published from the CMS).
// 3. Dev builds only: placeholder clips so the player can be tested before recordings exist.
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

/** Returns the audio for a verse, or null when it has none (the player then simulates timing). */
export function useVerseAudio(verse: Verse | undefined): AudioSource {
  const bundled = verse?.audioUrl || null;
  // The fetched URL is kept with its verse id, so a stale answer for another verse is ignored.
  const [fetched, setFetched] = useState<{ id: string; url: string | null } | null>(null);
  const id = verse?.id;

  useEffect(() => {
    if (!id || bundled || !apiEnabled) return;
    let alive = true;
    api<Verse>(`/v1/verses/${id}`, { auth: false })
      .then((v) => alive && setFetched({ id, url: v.audioUrl || null }))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [id, bundled]);

  const remote = fetched && fetched.id === id ? fetched.url : null;
  const url = bundled || remote;
  if (url) return { uri: url };
  return (verse && DEV_SAMPLES[verse.id]) ?? null;
}
