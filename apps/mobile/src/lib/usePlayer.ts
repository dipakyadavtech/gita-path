import { useEvent, useEventListener } from 'expo';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, type AudioSource } from 'expo-audio';
import { useVideoPlayer, type VideoPlayer } from 'expo-video';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

// Recitations should be heard even when the iPhone's silent switch is on.
setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});

/**
 * Recitation / episode player.
 * With a `video` URL it plays that video (picture and sound) through expo-video; render it with
 * `<VideoView player={player.video} />`. Otherwise, with an audio `source`, it plays audio through
 * expo-audio. With neither (no recording yet) it simulates playback timing so the screen still works.
 */
export function usePlayer(durationSec = 58, speed = 1, onEnd?: () => void, source: AudioSource = null, video: string | null = null) {
  const end = useRef(onEnd);
  useEffect(() => {
    end.current = onEnd;
  }, [onEnd]);

  const vid = useVideo(video, speed, end);
  const real = useRealPlayer(video ? null : source, speed, end);
  const fake = useSimulatedPlayer(durationSec, speed, end, !video && !source);
  const active = video ? vid : { ...(source ? real : fake), video: null as VideoPlayer | null };

  // Pause when the screen loses focus (another screen pushed on top), so two players never overlap.
  const pauseRef = useRef<() => void>(() => {});
  useEffect(() => {
    pauseRef.current = () => {
      if (active.playing) active.toggle();
    };
  });
  useFocusEffect(useCallback(() => () => pauseRef.current(), []));
  return active;
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

function useVideo(url: string | null, speed: number, end: EndRef) {
  const player = useVideoPlayer(url, (p) => {
    p.timeUpdateEventInterval = 0.25;
  });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { currentTime } = useEvent(player, 'timeUpdate', { currentTime: 0, currentLiveTimestamp: null, currentOffsetFromLive: null, bufferedPosition: 0 });
  // Re-render when the video loads so `duration` is read once it is known.
  useEvent(player, 'statusChange', { status: player.status });
  useEventListener(player, 'playToEnd', () => end.current?.());

  useEffect(() => {
    setRate(player, speed);
  }, [player, speed]);

  const duration = player.duration || 0;
  return {
    playing: isPlaying,
    position: Math.min(currentTime, duration || currentTime),
    duration: duration || 1,
    toggle: () => {
      if (player.playing) return player.pause();
      if (duration > 0 && player.currentTime >= duration - 0.1) return player.replay();
      player.play();
    },
    seek: (s: number) => player.seekBy(Math.max(0, Math.min(duration, s)) - player.currentTime),
    video: url ? player : null,
  };
}

// The native player object is mutable by design (expo-video sets options by assignment).
function setRate(player: VideoPlayer, speed: number) {
  player.playbackRate = speed;
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
