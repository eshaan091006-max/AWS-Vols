'use client';
import { useEffect, useState } from 'react';

const DECOYS = ['My Computer', 'Recycle Bin', 'Internet'];

export function Desktop({ onLaunch }: { onLaunch: () => void }) {
  const [selected, setSelected] = useState(false);
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    setCoarse(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  // On touch a double-tap is a discoverability trap and often zooms instead,
  // so the first tap launches. On desktop the classic double-click applies.
  const handleClick = () => {
    if (coarse || selected) onLaunch();
    else setSelected(true);
  };

  return (
    <main style={styles.root}>
      <div style={styles.icons}>
        <button
          type="button"
          style={{ ...styles.icon, ...(selected ? styles.iconSelected : null) }}
          onClick={handleClick}
          onDoubleClick={onLaunch}
        >
          <span style={styles.glyph} aria-hidden>
            📁
          </span>
          <span style={styles.label}>SBG_TECHNICALS_VERDICT.exe</span>
        </button>

        {DECOYS.map((name) => (
          <div key={name} style={{ ...styles.icon, ...styles.decoy }} aria-hidden>
            <span style={styles.glyph}>🖥️</span>
            <span style={styles.label}>{name}</span>
          </div>
        ))}
      </div>

      <p className="blink" style={styles.hint}>
        &gt;&gt; {coarse ? 'tap' : 'double-click'} to open &lt;&lt;
      </p>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100dvh',
    padding: '20px 12px calc(var(--taskbar-h) + 60px)',
    display: 'flex',
    flexDirection: 'column',
  },
  icons: { display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' },
  icon: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    width: 104,
    padding: '8px 4px',
    background: 'transparent',
    border: '1px dotted transparent',
    color: '#fff',
    cursor: 'pointer',
    textAlign: 'center',
  },
  iconSelected: { background: 'rgba(0,0,0,0.45)', border: '1px dotted #fff' },
  decoy: { opacity: 0.75, cursor: 'default' },
  glyph: { fontSize: 34, lineHeight: 1, filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.6))' },
  label: {
    fontFamily: 'var(--font-pixel), monospace',
    fontSize: 8,
    lineHeight: 1.5,
    wordBreak: 'break-word',
    textShadow: '1px 1px 0 #000',
  },
  hint: {
    marginTop: 'auto',
    textAlign: 'center',
    color: '#fff',
    fontFamily: 'var(--font-pixel), monospace',
    fontSize: 'clamp(0.5rem, 2.4vw, 0.7rem)',
    textShadow: '2px 2px 0 #000',
  },
};
