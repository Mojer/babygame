/**
 * 即時合成音效＋發聲數限制：同一種聲音同時最多 N 個、最短間隔 M 毫秒。
 * 300 隻連鎖死亡不會疊出 300 個音效，而是一串音高遞升的「啵啵啵」。
 */
type Voice = 'shot' | 'pop' | 'boom' | 'bigboom' | 'freeze' | 'hole' | 'beam' | 'ult' | 'level' | 'hurt' | 'alarm' | 'dash' | 'chain';

const LIMIT: Record<Voice, { max: number; gap: number }> = {
  shot: { max: 3, gap: 60 },
  pop: { max: 6, gap: 32 },
  boom: { max: 4, gap: 70 },
  bigboom: { max: 2, gap: 200 },
  freeze: { max: 1, gap: 200 },
  hole: { max: 2, gap: 300 },
  beam: { max: 2, gap: 300 },
  ult: { max: 1, gap: 500 },
  level: { max: 1, gap: 300 },
  hurt: { max: 1, gap: 250 },
  alarm: { max: 1, gap: 1000 },
  dash: { max: 1, gap: 150 },
  chain: { max: 1, gap: 400 },
};

// D 小調五聲音階，連擊越高音越高
const PENTA = [0, 3, 5, 7, 10];

export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private readonly active: Record<string, number> = {};
  private readonly last: Record<string, number> = {};
  muted = false;

  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.35;
    const comp = this.ctx.createDynamicsCompressor();
    this.master.connect(comp).connect(this.ctx.destination);
    const len = this.ctx.sampleRate * 0.5;
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.35;
  }

  play(v: Voice, combo = 0) {
    const ctx = this.ctx;
    if (!ctx || !this.master || this.muted) return;
    const now = performance.now();
    const lim = LIMIT[v];
    if ((this.active[v] ?? 0) >= lim.max || now - (this.last[v] ?? 0) < lim.gap) return;
    this.last[v] = now;
    this.active[v] = (this.active[v] ?? 0) + 1;
    let dur = 0.2;
    switch (v) {
      case 'shot':
        dur = this.tone(1400, 0.05, 'square', 0.05, 700);
        break;
      case 'pop': {
        const step = combo % 15;
        const semi = PENTA[step % 5] + Math.floor(step / 5) * 12;
        dur = this.tone(293.66 * Math.pow(2, semi / 12), 0.07, 'triangle', 0.16);
        break;
      }
      case 'boom':
        dur = this.burst(0.18, 900, 0.3);
        break;
      case 'bigboom':
        dur = Math.max(this.burst(0.6, 400, 0.6), this.tone(90, 0.5, 'sine', 0.5, 35));
        break;
      case 'freeze':
        dur = this.tone(2400, 0.25, 'sine', 0.08, 3200);
        this.tone(1800, 0.3, 'triangle', 0.06, 2600);
        break;
      case 'hole':
        dur = this.tone(180, 1.2, 'sawtooth', 0.12, 40);
        break;
      case 'beam':
        dur = Math.max(this.tone(120, 1.0, 'sawtooth', 0.12, 160), this.burst(1.0, 2400, 0.12));
        break;
      case 'ult':
        dur = Math.max(this.burst(0.9, 300, 0.8), this.tone(60, 0.9, 'sine', 0.7, 30), this.tone(880, 0.4, 'square', 0.08, 220));
        break;
      case 'level':
        [0, 4, 7, 12].forEach((s, i) => this.tone(523.25 * Math.pow(2, s / 12), 0.12, 'square', 0.07, undefined, i * 0.07));
        dur = 0.4;
        break;
      case 'hurt':
        dur = this.tone(160, 0.12, 'square', 0.12, 90);
        break;
      case 'alarm':
        for (let i = 0; i < 3; i++) this.tone(660, 0.18, 'square', 0.08, 440, i * 0.3);
        dur = 0.9;
        break;
      case 'dash':
        dur = this.burst(0.12, 3000, 0.12);
        break;
      case 'chain':
        [0, 3, 7, 10, 12].forEach((s, i) => this.tone(587.33 * Math.pow(2, s / 12), 0.1, 'square', 0.07, undefined, i * 0.05));
        dur = 0.4;
        break;
    }
    setTimeout(() => (this.active[v] = Math.max(0, (this.active[v] ?? 1) - 1)), dur * 1000 + 30);
  }

  private tone(freq: number, dur: number, type: OscillatorType, gain: number, slideTo?: number, delay = 0) {
    const ctx = this.ctx!;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master!);
    o.start(t);
    o.stop(t + dur + 0.02);
    return dur + delay;
  }

  private burst(dur: number, cutoff: number, gain: number) {
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(cutoff, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(60, cutoff * 0.15), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.master!);
    src.start(t);
    src.stop(t + dur + 0.02);
    return dur;
  }
}
