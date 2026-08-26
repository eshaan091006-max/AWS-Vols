'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { buildConsoleScript, type ConsoleLine } from '@/lib/consoleScript';
import type { Vol } from '@/lib/vols';

const LINE_DELAY = 260;
const STALL_DELAY = 1300;
const AFTER_LAST = 700;

const COLOR: Record<ConsoleLine['status'], string> = {
  ok: '#00ff66',
  warn: '#ffcc00',
  fail: '#ff2222',
  plain: '#9aa0a6',
};

export function Evaluating({ vol, onDone }: { vol: Vol; onDone: () => void }) {
  const script = useMemo(() => buildConsoleScript(vol), [vol]);
  const [shown, setShown] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const advance = (i: number) => {
      setShown(i + 1);

      if (i + 1 >= script.length) {
        if (!fired.current) {
          fired.current = true;
          timer = setTimeout(onDone, AFTER_LAST);
        }
        return;
      }

      // The 99% line hangs before the rollback lands. That pause is the dread.
      const isStall = script[i].text.includes('99%');
      timer = setTimeout(() => advance(i + 1), isStall ? STALL_DELAY : LINE_DELAY);
    };

    timer = setTimeout(() => advance(0), LINE_DELAY);
    return () => clearTimeout(timer);
  }, [script, onDone]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown]);

  return (
    <main style={styles.root}>
      <div className="win" style={styles.win}>
        <div className="win-title">
          <span>AWS Management Console — SBG Technicals</span>
          <span className="spacer" />
          <span className="btns">
            <span>_</span>
            <span>□</span>
            <span>×</span>
          </span>
        </div>

        <div className="scanlines" style={styles.screenWrap}>
          <div ref={scrollRef} style={styles.screen}>
            {script.slice(0, shown).map((line, i) => (
              <div key={i} style={{ ...styles.line, color: COLOR[line.status] }}>
                {line.text}
                {line.text.includes('99%') && <StallBar />}
              </div>
            ))}
            <span className="blink" style={styles.caret}>
              ▮
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

function StallBar() {
  return (
    <div style={styles.track} aria-hidden>
      <div style={styles.fill} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100dvh',
    display: 'grid',
    placeItems: 'center',
    padding: '14px 10px calc(var(--taskbar-h) + 16px)',
  },
  win: { width: 'min(680px, 100%)' },
  screenWrap: { position: 'relative', margin: 3 },
  screen: {
    height: 'min(60dvh, 420px)',
    overflowY: 'auto',
    padding: '12px 14px',
    background: '#0a0a0a',
    border: 'var(--bevel-in)',
    fontFamily: 'var(--font-terminal), monospace',
    fontSize: 'clamp(0.95rem, 3.8vw, 1.25rem)',
    lineHeight: 1.45,
  },
  line: { wordBreak: 'break-word' },
  caret: { color: '#00ff66', fontFamily: 'var(--font-terminal), monospace' },
  track: {
    height: 12,
    marginTop: 4,
    marginBottom: 4,
    border: '1px solid #ffcc00',
    background: '#000',
    padding: 1,
  },
  fill: {
    width: '99%',
    height: '100%',
    background: 'repeating-linear-gradient(90deg, #ffcc00 0 6px, transparent 6px 9px)',
  },
};
