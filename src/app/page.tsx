export default function Home() {
  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh', textAlign: 'center', padding: '2rem' }}>
      <div>
        <h1 style={{ fontSize: 'clamp(2rem, 12vw, 6rem)' }}>404</h1>
        <p>this site is under construction</p>
        <p style={{ opacity: 0.5 }}>best viewed in Netscape Navigator 4.0</p>
      </div>
    </main>
  );
}
