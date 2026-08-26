'use client';
import { useCallback, useEffect, useState } from 'react';
import type { Vol } from '@/lib/vols';
import { useAudio } from '@/hooks/useAudio';
import { Chrome } from './Chrome';
import { Desktop } from './phases/Desktop';
import { Dialup } from './phases/Dialup';
import { Evaluating } from './phases/Evaluating';
import { Rejected } from './phases/Rejected';
import { Accepted } from './phases/Accepted';

export type Phase = 'desktop' | 'dialup' | 'evaluating' | 'rejected' | 'accepted';

export function Reveal({ vol }: { vol: Vol }) {
  const [phase, setPhase] = useState<Phase>('desktop');
  const audio = useAudio('/music.mp3');
  const { play, setDucked } = audio;

  // Stable callbacks: the phase components drive timers off these in effects,
  // and a fresh identity each render would restart those timers.
  const toDialup = useCallback(() => setPhase('dialup'), []);
  const toEvaluating = useCallback(() => setPhase('evaluating'), []);
  const toRejected = useCallback(() => setPhase('rejected'), []);
  const toAccepted = useCallback(() => setPhase('accepted'), []);

  // The double-click that opened the .exe is the gesture browsers require
  // before audio may start.
  useEffect(() => {
    if (phase === 'dialup') play();
  }, [phase, play]);

  // Silence lands with the bad news; the music slams back in on the flip.
  useEffect(() => {
    setDucked(phase === 'rejected');
  }, [phase, setDucked]);

  return (
    <div style={{ ['--accent' as string]: vol.accent, position: 'relative', minHeight: '100dvh' }}>
      {phase === 'desktop' && <Desktop onLaunch={toDialup} />}
      {phase === 'dialup' && <Dialup onDone={toEvaluating} />}
      {phase === 'evaluating' && <Evaluating vol={vol} onDone={toRejected} />}
      {phase === 'rejected' && <Rejected vol={vol} onDone={toAccepted} soundEnabled={!audio.muted} />}
      {phase === 'accepted' && <Accepted vol={vol} />}
      <Chrome
        accent={vol.accent}
        muted={audio.muted}
        onToggleMute={audio.toggleMute}
        audioAvailable={audio.available}
      />
    </div>
  );
}
