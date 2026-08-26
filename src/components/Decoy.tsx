export function Decoy({ line }: { line: string }) {
  return (
    <main style={styles.root}>
      <div style={styles.inner}>
        <h1 className="wordart" style={styles.hello}>
          Hello
        </h1>
        <p style={styles.line}>{line}</p>
        <p style={styles.small}>best viewed in Netscape Navigator 4.0</p>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'grid',
    placeItems: 'center',
    minHeight: '100dvh',
    padding: '2rem 1rem',
    textAlign: 'center',
  },
  inner: { maxWidth: 560 },
  hello: { fontSize: 'clamp(3rem, 18vw, 8rem)', marginBottom: '1.4rem' },
  line: {
    margin: '0 0 1rem',
    color: '#fff',
    fontFamily: 'var(--font-pixel), monospace',
    fontSize: 'clamp(0.55rem, 2.8vw, 0.8rem)',
    lineHeight: 2,
    textShadow: '2px 2px 0 #000',
  },
  small: {
    margin: 0,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'var(--font-terminal), monospace',
    fontSize: 'clamp(0.85rem, 3vw, 1rem)',
  },
};
