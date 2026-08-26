'use client';
import { useEffect, useRef, useState } from 'react';
import type { Vol } from '@/lib/vols';
import { Confetti } from '../Confetti';
import { FlexCardButton } from '../FlexCardButton';

const TICKER = '★ WELCOME TO AWS SBG TECHNICALS ★ YOU ABSOLUTE LEGEND ★ ';

export function Accepted({ vol }: { vol: Vol }) {
  return (
    <main style={styles.root}>
      <Confetti active accent={vol.accent} />

      <div className="marquee">
        <span>{TICKER.repeat(4)}</span>
      </div>

      <div style={styles.stack}>
        <div style={styles.hero}>
          <p style={styles.kicker}>DECISION: !REJECTED</p>
          <h1 className="wordart" style={styles.wordart}>
            You&apos;re In
          </h1>
          <p style={styles.name}>{vol.name}</p>
        </div>

        <DraggableWindow title={`${vol.name}.exe — Properties`}>
          <MemeFrame vol={vol} />

          <p style={styles.message}>{vol.message}</p>

          <div style={styles.actions}>
            <FlexCardButton vol={vol} />
          </div>
        </DraggableWindow>

        <p style={styles.footer}>
          AWS STUDENT BUILDER GROUP · TECHNICALS · SEE YOU AT THE FIRST MEETING
        </p>
      </div>

      <div className="marquee">
        <span>{TICKER.repeat(4)}</span>
      </div>
    </main>
  );
}

/**
 * A typo'd path in vols.json must never surface as a broken-image icon on
 * someone's results page, so a load failure falls back to the placeholder.
 */
function MemeFrame({ vol }: { vol: Vol }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(vol.meme) && !failed;

  return (
    <div style={styles.memeWrap}>
      {showImage ? (
        <img
          src={vol.meme as string}
          alt={`meme for ${vol.name}`}
          style={styles.meme}
          onError={() => setFailed(true)}
        />
      ) : (
        <div style={styles.placeholder}>
          <span style={styles.placeholderGlyph} aria-hidden>
            🖼
          </span>
          <span style={styles.placeholderText}>[meme.gif — coming soon]</span>
        </div>
      )}
    </div>
  );
}

/** Drag is a desktop flourish. On touch the window just sits centred. */
function DraggableWindow({ title, children }: { title: string; children: React.ReactNode }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [draggable, setDraggable] = useState(false);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setDraggable(window.matchMedia('(pointer: fine)').matches);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!draggable) return;
    drag.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setOffset({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y });
  };

  const endDrag = () => {
    drag.current = null;
  };

  return (
    <div
      className="win"
      style={{ ...styles.win, transform: `translate(${offset.x}px, ${offset.y}px)` }}
    >
      <div
        className="win-title"
        style={{ cursor: draggable ? 'move' : 'default', touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <span>{title}</span>
        <span className="spacer" />
        <span className="btns">
          <span>_</span>
          <span>□</span>
          <span>×</span>
        </span>
      </div>
      <div className="win-body" style={styles.winBody}>
        {children}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 18,
    paddingBottom: 'var(--taskbar-h)',
  },
  stack: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 22,
    padding: '10px 12px',
  },
  hero: { textAlign: 'center' },
  kicker: {
    margin: '0 0 6px',
    color: '#fff',
    fontFamily: 'var(--font-pixel), monospace',
    fontSize: 'clamp(0.5rem, 2.4vw, 0.7rem)',
    textShadow: '2px 2px 0 #000',
  },
  wordart: { fontSize: 'clamp(2.6rem, 15vw, 7rem)' },
  name: {
    margin: '14px 0 0',
    color: 'var(--accent)',
    fontFamily: 'var(--font-pixel), monospace',
    fontSize: 'clamp(0.85rem, 4.5vw, 1.6rem)',
    textShadow: '3px 3px 0 #000',
    wordBreak: 'break-word',
  },
  win: { width: 'min(440px, 100%)' },
  winBody: { display: 'flex', flexDirection: 'column', gap: 12 },
  memeWrap: { border: 'var(--bevel-in)', background: '#fff', padding: 4 },
  meme: { display: 'block', width: '100%', height: 'auto' },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 150,
    background: '#e8e8e8',
  },
  placeholderGlyph: { fontSize: 38, opacity: 0.55 },
  placeholderText: { fontFamily: 'var(--font-pixel), monospace', fontSize: 9, color: '#666' },
  message: {
    margin: 0,
    padding: '10px 12px',
    background: '#fff',
    border: 'var(--bevel-in)',
    fontFamily: 'var(--font-comic), sans-serif',
    fontSize: 'clamp(0.95rem, 3.6vw, 1.1rem)',
    lineHeight: 1.6,
  },
  actions: { display: 'flex', justifyContent: 'center' },
  footer: {
    margin: 0,
    textAlign: 'center',
    color: '#fff',
    fontFamily: 'var(--font-pixel), monospace',
    fontSize: 'clamp(0.42rem, 2vw, 0.6rem)',
    lineHeight: 1.9,
    textShadow: '2px 2px 0 #000',
  },
};
