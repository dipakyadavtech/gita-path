import { useEffect, useRef, useState } from 'react';

/**
 * Recitation player.
 * Studio recordings are not produced yet, so this simulates playback timing (FR-VS-02 UI).
 * When a verse gets an audioUrl from the CMS, swap the timer for expo-audio's useAudioPlayer.
 */
export function usePlayer(durationSec = 58, speed = 1, onEnd?: () => void) {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const end = useRef(onEnd);
  useEffect(() => {
    end.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setPosition((p) => {
        const next = p + 0.25 * speed;
        if (next >= durationSec) {
          setPlaying(false);
          end.current?.();
          return durationSec;
        }
        return next;
      });
    }, 250);
    return () => clearInterval(t);
  }, [playing, speed, durationSec]);

  return {
    playing,
    position,
    duration: durationSec,
    toggle: () => {
      if (position >= durationSec) setPosition(0);
      setPlaying((p) => !p);
    },
    seek: (s: number) => setPosition(Math.max(0, Math.min(durationSec, s))),
  };
}

export const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
