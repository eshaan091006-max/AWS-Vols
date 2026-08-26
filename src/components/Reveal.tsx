'use client';
import { useCallback, useState } from 'react';
import type { Vol } from '@/lib/vols';
import { Chrome } from './Chrome';
import { Desktop } from './phases/Desktop';
import { Dialup } from './phases/Dialup';

export type Phase = 'desktop' | 'dialup' | 'evaluating' | 'rejected' | 'accepted';

export function Reveal({ vol }: { vol: Vol }) {
  const [phase, setPhase] = useState<Phase>('desktop');

  // Stable callbacks: the phase components drive timers off these in effects,
  // and a fresh identity each render would restart those timers.
  const toDialup = useCallback(() => setPhase('dialup'), []);
  const toEvaluating = useCallback(() => setPhase('evaluating'), []);

  return (
    <div style={{ ['--accent' as string]: vol.accent, position: 'relative', minHeight: '100dvh' }}>
      {phase === 'desktop' && <Desktop onLaunch={toDialup} />}
      {phase === 'dialup' && <Dialup onDone={toEvaluating} />}
      {phase === 'evaluating' && <div style={{ color: '#fff', padding: 40 }}>[evaluating]</div>}
      <Chrome accent={vol.accent} />
    </div>
  );
}
