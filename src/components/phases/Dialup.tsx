'use client';
import { useEffect, useRef, useState } from 'react';

const DURATION = 2600;
const STATUS = [
  'Dialing sbg-technicals.aws ...',
  'Handshaking ...',
  'Verifying credentials ...',
  'Connected at 56.6 Kbps',
];

export function Dialup({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const fired = useRef(false);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const step = (t: number) => {
      const pct = Math.min(100, ((t - start) / DURATION) * 100);
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(step);
      } else if (!fired.current) {
        fired.current = true;
        timeout = setTimeout(onDone, 400);
      }
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      if (timeout) clearTimeout(timeout);
    };
  }, [onDone]);

  const status = STATUS[Math.min(STATUS.length - 1, Math.floor((progress / 100) * STATUS.length))];
  const blocks = Math.round((progress / 100) * 28);

  return (
    <main style={styles.root}>
      <div className="win" style={styles.win}>
        <div className="win-title">
          <span>Connecting to sbg-technicals.aws</span>
          <span className="spacer" />
          <span className="btns">
            <span>_</span>
            <span>□</span>
            <span>×</span>
          </span>
        </div>
        <div className="win-body">
          <p style={styles.status}>{status}</p>
          <div style={styles.track}>
            <div style={{ ...styles.fill, width: `${progress}%` }} />
          </div>
          <p style={styles.blocks} aria-hidden>
            {'█'.repeat(blocks)}
            {'░'.repeat(28 - blocks)}
          </p>
          <p style={styles.pct}>{Math.floor(progress)}%</p>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100dvh',
    display: 'grid',
    placeItems: 'center',
    padding: '16px 12px calc(var(--taskbar-h) + 20px)',
  },
  win: { width: 'min(420px, 100%)' },
  status: {
    margin: '0 0 12px',
    fontFamily: 'var(--font-terminal), monospace',
    fontSize: 'clamp(1rem, 4.5vw, 1.3rem)',
  },
  track: { height: 22, border: 'var(--bevel-in)', background: '#fff', padding: 2 },
  fill: {
    height: '100%',
    background:
      'repeating-linear-gradient(90deg, var(--y2k-navy) 0 10px, transparent 10px 13px)',
  },
  blocks: {
    margin: '10px 0 0',
    fontFamily: 'monospace',
    fontSize: 'clamp(0.65rem, 3vw, 0.9rem)',
    letterSpacing: '-1px',
    color: 'var(--y2k-navy)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  pct: {
    margin: '4px 0 0',
    textAlign: 'right',
    fontFamily: 'var(--font-pixel), monospace',
    fontSize: 'clamp(0.5rem, 2.4vw, 0.7rem)',
  },
};
