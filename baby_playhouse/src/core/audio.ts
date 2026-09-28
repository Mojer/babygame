/** Tiny WebAudio synth: every sound is generated, no audio files needed yet. */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;

export function unlockAudio() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
}

function tone(freq: number, dur: number, opts: { type?: OscillatorType; to?: number; delay?: number; vol?: number } = {}) {
  if (!ctx || !master) return;
  const t0 = ctx.currentTime + (opts.delay ?? 0);
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = opts.type ?? 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(opts.vol ?? 0.4, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise(dur: number, opts: { freq?: number; to?: number; q?: number; vol?: number; delay?: number; wobble?: number } = {}) {
  if (!ctx || !master) return;
  const t0 = ctx.currentTime + (opts.delay ?? 0);
  const len = Math.ceil(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = opts.q ?? 1.5;
  f.frequency.setValueAtTime(opts.freq ?? 1200, t0);
  if (opts.to) f.frequency.exponentialRampToValueAtTime(opts.to, t0 + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(opts.vol ?? 0.3, t0 + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  if (opts.wobble) {
    const lfo = ctx.createOscillator();
    const lg = ctx.createGain();
    lfo.frequency.value = opts.wobble;
    lg.gain.value = 0.25;
    lfo.connect(lg).connect(g.gain);
    lfo.start(t0);
    lfo.stop(t0 + dur);
  }
  src.connect(f).connect(g).connect(master);
  src.start(t0);
}

const NOTE = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

const SOUNDS: Record<string, (pitch?: number) => void> = {
  pop: () => tone(700, 0.14, { to: 220, vol: 0.35 }),
  tap: () => tone(900, 0.07, { to: 600, type: 'triangle', vol: 0.15 }),
  step: () => tone(180 + Math.random() * 40, 0.05, { type: 'triangle', vol: 0.06 }),
  hop: () => tone(300, 0.18, { to: 900, type: 'square', vol: 0.08 }),
  chime: () => [84, 88, 91, 96].forEach((n, i) => tone(NOTE(n), 0.5, { type: 'triangle', delay: i * 0.09, vol: 0.2 })),
  ding: () => {
    tone(1318, 0.8, { vol: 0.25 });
    tone(1760, 0.9, { delay: 0.12, vol: 0.22 });
  },
  twinkle: () => {
    for (let i = 0; i < 7; i++) tone(NOTE(84 + [0, 4, 7, 12, 7, 4, 12][i]), 0.25, { type: 'sine', delay: i * 0.06, vol: 0.15 });
  },
  coffee: () => {
    noise(1.4, { freq: 500, to: 1400, q: 3, vol: 0.25, wobble: 11 });
    tone(880, 0.25, { delay: 1.35, type: 'triangle', vol: 0.2 });
  },
  yum: () => {
    tone(392, 0.16, { to: 523, type: 'triangle', vol: 0.25 });
    tone(523, 0.22, { to: 659, type: 'triangle', delay: 0.18, vol: 0.25 });
  },
  whoosh: () => noise(0.5, { freq: 400, to: 2400, q: 0.8, vol: 0.3 }),
  boing: () => tone(160, 0.45, { to: 520, type: 'sine', vol: 0.3 }),
  squeak: () => {
    tone(1100, 0.09, { to: 1700, type: 'square', vol: 0.12 });
    tone(1700, 0.12, { to: 900, type: 'square', delay: 0.09, vol: 0.1 });
  },
  splash: () => {
    noise(0.6, { freq: 1800, to: 500, q: 0.7, vol: 0.35 });
    tone(500, 0.2, { to: 180, delay: 0.05, vol: 0.12 });
  },
  water: () => noise(1.2, { freq: 2600, to: 2000, q: 0.5, vol: 0.14, wobble: 7 }),
  bloop: () => [0, 0.12, 0.22].forEach((d, i) => tone(300 + i * 160, 0.12, { to: 700 + i * 200, delay: d, vol: 0.18 })),
  toot: () => {
    tone(392, 0.22, { type: 'square', vol: 0.1 });
    tone(523, 0.3, { type: 'square', delay: 0.24, vol: 0.1 });
  },
  door: () => {
    noise(0.35, { freq: 600, to: 1800, q: 0.8, vol: 0.22 });
    [72, 76, 79].forEach((n, i) => tone(NOTE(n), 0.3, { type: 'triangle', delay: 0.1 + i * 0.08, vol: 0.14 }));
  },
  hi: (p = 440) => {
    tone(p, 0.12, { to: p * 1.35, type: 'triangle', vol: 0.3 });
    tone(p * 1.35, 0.16, { to: p * 1.1, type: 'triangle', delay: 0.12, vol: 0.28 });
  },
};

export function sfx(name: string | undefined, pitch?: number) {
  if (!name) return;
  (SOUNDS[name] ?? SOUNDS.pop)(pitch);
}
