'use client';
import { useEffect, useState } from 'react';
import { CursorTrail } from './CursorTrail';

type ChromeProps = {
  accent: string;
  muted?: boolean;
  onToggleMute?: () => void;
  audioAvailable?: boolean;
};

export function Chrome({ accent, muted, onToggleMute, audioAvailable = false }: ChromeProps) {
  // Rendered only after mount so server and client markup agree.
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <CursorTrail accent={accent} />
      <div className="taskbar">
        <button className="win-btn" type="button" aria-label="Start">
          ⊞ START
        </button>
        {audioAvailable && onToggleMute && (
          <button className="win-btn" type="button" onClick={onToggleMute}>
            {muted ? '♪ OFF' : '♪ ON'}
          </button>
        )}
        <div className="clock">{now ?? ''}</div>
      </div>
    </>
  );
}
