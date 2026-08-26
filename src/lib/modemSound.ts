/**
 * A synthesized 56k handshake. The real recording is copyrighted, but a modem
 * negotiating is just tones and filtered noise, so this is the genuine article
 * rather than an impression of one: dial tone, DTMF digits, answer tone, then
 * the carrier screech.
 *
 * Must be called from a user gesture or the AudioContext stays suspended.
 * Returns a stop function; calling it twice is safe.
 */
export function playDialupScreech(volume = 0.16): () => void {
  const Ctx: typeof AudioContext | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return () => {};

  let ctx: AudioContext;
  try {
    ctx = new Ctx();
  } catch {
    return () => {};
  }

  const master = ctx.createGain();
  master.gain.value = volume;
  master.connect(ctx.destination);

  const t0 = ctx.currentTime + 0.02;

  const tone = (freq: number, start: number, dur: number, gain = 0.5, type: OscillatorType = 'sine') => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t0 + start);
    g.gain.linearRampToValueAtTime(gain, t0 + start + 0.01);
    g.gain.setValueAtTime(gain, t0 + start + dur - 0.01);
    g.gain.linearRampToValueAtTime(0, t0 + start + dur);
    osc.connect(g).connect(master);
    osc.start(t0 + start);
    osc.stop(t0 + start + dur + 0.02);
  };

  const noise = (start: number, dur: number, gain = 0.4, centre = 1800, q = 0.7) => {
    const frames = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = centre;
    filter.Q.value = q;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0 + start);
    g.gain.linearRampToValueAtTime(gain, t0 + start + 0.02);
    g.gain.setValueAtTime(gain, t0 + start + dur - 0.05);
    g.gain.linearRampToValueAtTime(0, t0 + start + dur);

    src.connect(filter).connect(g).connect(master);
    src.start(t0 + start);
    src.stop(t0 + start + dur);
  };

  // Compressed to fit the ~3s rejection hold, so the screech — the part anyone
  // actually remembers — is what plays rather than what gets cut off.

  // Dial tone: the North American 350 + 440 Hz pair.
  tone(350, 0, 0.3, 0.35);
  tone(440, 0, 0.3, 0.35);

  // DTMF: seven digits, each a genuine row/column tone pair.
  const DTMF: [number, number][] = [
    [697, 1209], [770, 1336], [852, 1477], [697, 1336],
    [770, 1209], [941, 1336], [852, 1209],
  ];
  DTMF.forEach(([low, high], i) => {
    const start = 0.36 + i * 0.07;
    tone(low, start, 0.05, 0.3);
    tone(high, start, 0.05, 0.3);
  });

  // Answer tone, then the carrier negotiation.
  tone(2100, 0.9, 0.22, 0.32);
  tone(1100, 1.14, 0.14, 0.3);
  tone(1650, 1.3, 0.1, 0.26);
  tone(1850, 1.4, 0.1, 0.26);

  // The screech: layered noise plus warbling carriers.
  noise(1.52, 0.5, 0.36, 1500, 0.6);
  tone(1800, 1.54, 0.45, 0.2, 'sawtooth');
  tone(2400, 1.66, 0.4, 0.16, 'square');
  noise(2.04, 0.62, 0.44, 2200, 0.5);
  tone(1200, 2.08, 0.5, 0.18, 'sawtooth');
  noise(2.68, 0.5, 0.32, 900, 0.8);

  const END = 3.25;
  master.gain.setValueAtTime(volume, t0 + END - 0.5);
  master.gain.linearRampToValueAtTime(0, t0 + END);

  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    try {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
      setTimeout(() => ctx.close().catch(() => {}), 150);
    } catch {
      /* context already gone */
    }
  };

  setTimeout(stop, (END + 0.3) * 1000);
  return stop;
}
