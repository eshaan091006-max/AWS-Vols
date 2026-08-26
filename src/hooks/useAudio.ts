'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The track is organizer-supplied and may simply not exist yet. Absence must be
 * silent: no console errors, no dead controls. `available` stays false until the
 * file actually loads.
 */
export function useAudio(src: string) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [available, setAvailable] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    // Constructed in an effect: there is no Audio on the server.
    const el = new Audio(src);
    el.loop = true;
    el.preload = 'auto';
    ref.current = el;

    const onReady = () => setAvailable(true);
    const onError = () => setAvailable(false);
    el.addEventListener('canplaythrough', onReady);
    el.addEventListener('error', onError);

    return () => {
      el.removeEventListener('canplaythrough', onReady);
      el.removeEventListener('error', onError);
      el.pause();
      ref.current = null;
    };
  }, [src]);

  const play = useCallback(() => {
    // Rejects when the file is missing or autoplay is blocked. Both are fine.
    ref.current?.play().catch(() => {});
  }, []);

  const pause = useCallback(() => {
    ref.current?.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  }, []);

  /** Silence for the fake rejection, without losing playback position. */
  const setDucked = useCallback((ducked: boolean) => {
    const el = ref.current;
    if (el) el.volume = ducked ? 0 : 1;
  }, []);

  return { play, pause, toggleMute, setDucked, muted, available };
}
