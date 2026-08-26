'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Vol } from '@/lib/vols';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const HOLD = 3000;
const GRACE = 1200;
const SHATTER = 520;
const FADE = 200;

const DIALOGS = [
  { title: 'decision.exe', text: 'decision.exe has stopped responding.' },
  { title: 'Scheduler', text: 'Cannot allocate free time.' },
  { title: 'Error', text: 'ERR_TOO_MANY_APPLICANTS' },
  { title: 'System', text: 'sbg_technicals.dll not found.' },
];

export function Rejected({ vol, onDone }: { vol: Vol; onDone: () => void }) {
  const reduced = useReducedMotion();
  const [dialogs, setDialogs] = useState(0);
  const [exiting, setExiting] = useState(false);
  const fired = useRef(false);

  const leave = useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    setExiting(true);
    setTimeout(onDone, reduced ? FADE : SHATTER);
  }, [onDone, reduced]);

  // Error dialogs pile up over the first 1.2s.
  useEffect(() => {
    const timers = DIALOGS.map((_, i) => setTimeout(() => setDialogs(i + 1), 300 * (i + 1)));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const timer = setTimeout(leave, HOLD);
    return () => clearTimeout(timer);
  }, [leave]);

  // "Press any key to continue" invites a tap, and letting them trigger their
  // own reveal is better than making them wait. But an instant reflex tap would
  // skip the dread entirely, so early input is ignored.
  useEffect(() => {
    let armed = false;
    const arm = setTimeout(() => {
      armed = true;
    }, GRACE);

    const skip = () => {
      if (armed) leave();
    };
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      clearTimeout(arm);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, [leave]);

  const exitClass = exiting ? (reduced ? 'fade-out' : 'shatter') : '';
  const shakeClass = !reduced && !exiting ? 'shake' : '';

  return (
    <main className={`${exitClass} ${shakeClass}`.trim()} style={styles.root}>
      <div style={styles.sheet}>
        <h1 style={styles.heading}>SBG_TECHNICALS_STACK</h1>

        <p style={styles.para}>A fatal exception has occurred at DEPLOYMENT:0x0000SBG.</p>

        <pre style={styles.pre}>
{`  Status ....... CREATE_FAILED
  Resource ..... VolunteerRole/${vol.name}
  Reason ....... APPLICATION `}
          <span className="blink" style={styles.rejected}>
            REJECTED
          </span>
        </pre>

        <p style={styles.para}>
          Press any key to continue <span className="blink">_</span>
        </p>
      </div>

      {DIALOGS.slice(0, dialogs).map((d, i) => (
        <div
          key={d.title}
          className="win"
          style={{
            ...styles.dialog,
            top: `calc(38% + ${i * 26}px)`,
            left: `calc(50% + ${(i - 1.5) * 18}px)`,
          }}
        >
          <div className="win-title" style={styles.dialogTitle}>
            <span>{d.title}</span>
          </div>
          <div className="win-body" style={styles.dialogBody}>
            <p style={styles.dialogText}>
              <span style={styles.x}>✖</span> {d.text}
            </p>
            <button className="win-btn" type="button" style={styles.ok}>
              OK
            </button>
          </div>
        </div>
      ))}

      <button type="button" onClick={leave} style={styles.skip}>
        [skip]
      </button>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: 'relative',
    minHeight: '100dvh',
    background: 'var(--y2k-bsod)',
    color: '#fff',
    display: 'grid',
    placeItems: 'center',
    padding: '20px 14px calc(var(--taskbar-h) + 20px)',
    fontFamily: 'var(--font-terminal), monospace',
    overflow: 'hidden',
  },
  sheet: { width: 'min(620px, 100%)', fontSize: 'clamp(1rem, 4vw, 1.35rem)' },
  heading: {
    display: 'inline-block',
    margin: '0 0 20px',
    padding: '2px 12px',
    background: '#c0c0c0',
    color: 'var(--y2k-bsod)',
    fontFamily: 'var(--font-terminal), monospace',
    fontSize: 'clamp(1rem, 4vw, 1.35rem)',
    fontWeight: 400,
  },
  para: { margin: '0 0 18px' },
  pre: {
    margin: '0 0 22px',
    fontFamily: 'var(--font-terminal), monospace',
    fontSize: 'clamp(0.95rem, 3.8vw, 1.3rem)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  rejected: {
    color: '#ff3b3b',
    fontSize: '1.55em',
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  dialog: { position: 'absolute', width: 'min(280px, 78vw)', transform: 'translateX(-50%)' },
  dialogTitle: { background: 'linear-gradient(90deg, #7f0000, #ff2222)' },
  dialogBody: { display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' },
  dialogText: {
    margin: 0,
    color: '#000',
    fontFamily: 'var(--font-comic), sans-serif',
    fontSize: 13,
    textAlign: 'center',
  },
  x: { color: '#cc0000', fontSize: 16 },
  ok: { minHeight: 30, padding: '4px 22px' },
  skip: {
    position: 'absolute',
    right: 12,
    bottom: 'calc(var(--taskbar-h) + 12px)',
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.45)',
    fontFamily: 'var(--font-terminal), monospace',
    fontSize: 16,
    cursor: 'pointer',
    padding: 8,
  },
};
