import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, type AudioSource } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';

// Recitations should be heard even when the iPhone's silent switch is on.
setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});

/**
 * Recitation player.
 * With a `source` it plays real audio through expo-audio. Without one (no recording yet)
 * it simulates playback timing so the screen still works (FR-VS-02 UI).
 */
export function usePlayer(durationSec = 58, speed = 1, onEnd?: () => void, source: AudioSource = null) {
  const end = useRef(onEnd);
  useEffect(() => {
    end.current = onEnd;
  }, [onEnd]);

  const real = useRealPlayer(source, speed, end);
  const fake = useSimulatedPlayer(durationSec, speed, end, !source);
  return source ? real : fake;
}

type EndRef = { current: (() => void) | undefined };

function useRealPlayer(source: AudioSource, speed: number, end: EndRef) {
  const player = useAudioPlayer(source, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    player.setPlaybackRate(speed, 'high');
  }, [player, speed]);

  useEffect(() => {
    if (status.didJustFinish) end.current?.();
  }, [status.didJustFinish, end]);

  const duration = status.duration || 0;
  const finished = duration > 0 && status.currentTime >= duration - 0.1;
  return {
    playing: status.playing,
    position: Math.min(status.currentTime, duration || status.currentTime),
    // Avoid 0 so progress math (position / duration) never divides by zero while loading.
    duration: duration || 1,
    toggle: () => {
      if (status.playing) return player.pause();
      if (finished) player.seekTo(0);
      player.play();
    },
    seek: (s: number) => player.seekTo(Math.max(0, Math.min(duration, s))),
  };
}

function useSimulatedPlayer(durationSec: number, speed: number, end: EndRef, active: boolean) {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const pos = useRef(0);
  const moveTo = (s: number) => {
    pos.current = s;
    setPosition(s);
  };

  useEffect(() => {
    if (!playing || !active) return;
    const t = setInterval(() => {
      // Side effects live in the tick, never in a state updater (React may run those during render).
      const next = Math.min(durationSec, pos.current + 0.25 * speed);
      pos.current = next;
      setPosition(next);
      if (next >= durationSec) {
        setPlaying(false);
        end.current?.();
      }
    }, 250);
    return () => clearInterval(t);
  }, [playing, speed, durationSec, active, end]);

  return {
    playing,
    position,
    duration: durationSec,
    toggle: () => {
      if (pos.current >= durationSec) moveTo(0);
      setPlaying((p) => !p);
    },
    seek: (s: number) => moveTo(Math.max(0, Math.min(durationSec, s))),
  };
}

export const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
