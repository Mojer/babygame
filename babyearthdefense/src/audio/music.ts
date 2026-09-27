// 即時合成的節奏配樂與音效。音樂時鐘同時是畫面節拍的來源（pollBeats）。
// 140 BPM、4/4、16 分音符步進；段落在下一小節切換。

export type Section = 'menu' | 'wave' | 'break' | 'warning' | 'boss' | 'exposed' | 'win' | 'lose';

export interface Beat {
  time: number;
  /** 小節內第幾拍（0–3）。 */
  beat: number;
  bar: number;
  downbeat: boolean;
  section: Section;
}

export const BPM = 140;
const STEP = 60 / BPM / 4;
const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);

interface Progression { bass: number[]; chords: number[][] }

const PROGRESSIONS: Record<'calm' | 'wave' | 'boss', Progression> = {
  calm: { bass: [33, 29, 36, 31], chords: [[69, 72, 76], [65, 69, 72], [67, 72, 76], [67, 71, 74]] },
  wave: { bass: [33, 29, 36, 31], chords: [[69, 72, 76], [65, 69, 72], [67, 72, 76], [67, 71, 74]] },
  boss: { bass: [33, 34, 31, 33], chords: [[69, 72, 76], [70, 74, 77], [67, 70, 74], [69, 73, 76]] }
};

/** A 小調五聲音階：擊破音效依連擊往上爬，讓連環消滅聽起來像旋律。 */
const PENTATONIC = [69, 72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96];
const LEAD = [76, -1, 79, 81, -1, 79, 76, 74, 76, -1, 72, 74, -1, 76, 79, -1];
const ARP_ORDER = [0, 1, 2, 1, 0, 2, 1, 2, 0, 1, 2, 1, 2, 1, 0, 1];

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicBus!: GainNode;
  private duck!: GainNode;
  private sfxBus!: GainNode;
  private reverb!: ConvolverNode;
  private reverbSend!: GainNode;
  private noise!: AudioBuffer;
  private drive!: WaveShaperNode;
  private timer = 0;
  private step = 0;
  private nextTime = 0;
  private beats: Beat[] = [];
  private laserOsc: OscillatorNode | null = null;
  private laserGain: GainNode | null = null;
  section: Section = 'menu';
  private pending: Section | null = null;
  muted = false;

  constructor() {
    try { this.muted = localStorage.getItem('earth-muted') === '1'; } catch { /* 無法存取儲存空間時預設有聲。 */ }
  }

  /** 必須在使用者手勢內呼叫（瀏覽器自動播放限制）。 */
  unlock() {
    if (!this.ctx) this.build();
    void this.ctx!.resume();
  }

  get currentTime() { return this.ctx?.currentTime ?? 0; }

  setMuted(muted: boolean) {
    this.muted = muted;
    try { localStorage.setItem('earth-muted', muted ? '1' : '0'); } catch { /* 忽略 */ }
    if (this.ctx) this.master.gain.setTargetAtTime(muted ? 0 : .8, this.ctx.currentTime, .05);
  }

  suspend() { void this.ctx?.suspend(); this.laser(false); }
  resume() { void this.ctx?.resume(); }

  /** 換段落：一般在下一小節生效；警報與結算立刻在下一拍生效。 */
  setSection(section: Section) {
    if (section === (this.pending ?? this.section)) return;
    this.pending = section === this.section ? null : section;
  }

  /** 取出已經「響起」的節拍，給畫面做同步脈動。 */
  pollBeats() {
    if (!this.ctx) return [];
    const now = this.ctx.currentTime;
    const ready: Beat[] = [];
    while (this.beats.length && this.beats[0].time <= now) ready.push(this.beats.shift()!);
    return ready;
  }

  // ─── Graph ──────────────────────────────────────────────

  private build() {
    const ctx = this.ctx = new AudioContext();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = .003; comp.release.value = .2;
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : .8;
    this.master.connect(comp).connect(ctx.destination);

    this.musicBus = ctx.createGain(); this.musicBus.gain.value = .55; this.musicBus.connect(this.master);
    this.duck = ctx.createGain(); this.duck.connect(this.musicBus);
    this.sfxBus = ctx.createGain(); this.sfxBus.gain.value = .7; this.sfxBus.connect(this.master);

    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.impulse(1.8);
    this.reverbSend = ctx.createGain(); this.reverbSend.gain.value = .25;
    this.reverbSend.connect(this.reverb).connect(this.musicBus);

    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    this.drive = ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) { const x = i / 512 - 1; curve[i] = Math.tanh(x * 3.2); }
    this.drive.curve = curve;
    this.drive.connect(this.duck);

    this.nextTime = ctx.currentTime + .08;
    this.timer = window.setInterval(() => this.schedule(), 25);
  }

  private impulse(seconds: number) {
    const ctx = this.ctx!;
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buffer.getChannelData(c);
      for (let i = 0; i < length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
    }
    return buffer;
  }

  // ─── Sequencer ──────────────────────────────────────────

  private schedule() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    if (this.nextTime < ctx.currentTime - .2) this.nextTime = ctx.currentTime + .05;
    while (this.nextTime < ctx.currentTime + .12) {
      if (this.step % 16 === 0 && this.pending) { this.section = this.pending; this.pending = null; this.step = 0; }
      else if (this.step % 4 === 0 && this.pending && ['warning', 'win', 'lose'].includes(this.pending)) {
        this.section = this.pending; this.pending = null; this.step = 0;
      }
      this.playStep(this.step, this.nextTime);
      this.nextTime += STEP;
      this.step++;
    }
  }

  private playStep(step: number, t: number) {
    const s = step % 16;
    const bar = Math.floor(step / 16);
    const section = this.section;
    if (s % 4 === 0) this.beats.push({ time: t, beat: s / 4, bar, downbeat: s === 0, section });

    const prog = section === 'boss' || section === 'exposed' || section === 'warning' ? PROGRESSIONS.boss
      : section === 'menu' || section === 'break' ? PROGRESSIONS.calm : PROGRESSIONS.wave;
    const chordIndex = bar % 4;
    const root = prog.bass[chordIndex];
    const chord = prog.chords[chordIndex];

    switch (section) {
      case 'menu':
        if (s === 0) this.pad(chord, t, STEP * 16, .05);
        if (s % 2 === 0) this.pluck(chord[ARP_ORDER[s]] + 12, t, .018, 1800);
        if (s === 0 || s === 10) this.kick(t, .35);
        break;
      case 'break':
        if (s === 0) this.pad(chord, t, STEP * 16, .06);
        this.pluck(chord[ARP_ORDER[s]] + (s % 8 < 4 ? 0 : 12), t, .025, 1200 + s * 120);
        if (s % 2 === 1) this.hat(t, .05);
        if (s % 4 === 0) this.kick(t, .45);
        break;
      case 'wave':
        if (s % 4 === 0) this.kick(t, 1);
        if (s === 4 || s === 12) this.snare(t, .9);
        this.hat(t, s % 4 === 2 ? .16 : .06, s % 4 === 2);
        if (s % 2 === 0) this.bass(root + (s % 4 === 2 ? 12 : 0), t, STEP * 1.8, .5);
        this.pluck(chord[ARP_ORDER[s]] + 12, t, .035, 2400 + Math.sin(bar * .8) * 900);
        if (s === 0) this.pad(chord, t, STEP * 16, .04);
        if (bar % 4 === 3 && s >= 12) this.snare(t, .4 + (s - 12) * .15);
        break;
      case 'warning':
        if (s % 4 === 0) { this.kick(t, 1); this.siren(t, s % 8 === 0 ? 880 : 660); }
        this.hat(t, .08);
        if (s % 2 === 0) this.bass(33, t, STEP * 1.5, .5, true);
        if (s === 0) this.riser(t, STEP * 16);
        break;
      case 'boss':
      case 'exposed': {
        const heavy = [0, 3, 6, 8, 10, 11, 14];
        if (heavy.includes(s)) this.kick(t, s === 0 ? 1.1 : .85);
        if (s === 4 || s === 12) this.snare(t, 1);
        this.hat(t, s % 2 ? .07 : .13, section === 'exposed' && s % 4 === 2);
        this.bass(root + (s % 8 === 7 ? 12 : 0), t, STEP * .9, s % 4 === 0 ? .6 : .42, true);
        if (s % 2 === 0) this.pluck(chord[ARP_ORDER[s]] + 12, t, .03, 3000);
        if (section === 'exposed' && LEAD[s] > 0) this.lead(LEAD[s] + (bar % 2 ? 0 : 12), t, STEP * 1.6);
        if (s === 0) this.pad(chord, t, STEP * 16, .035);
        if (bar % 2 === 1 && s >= 12) this.tom(t, 180 - (s - 12) * 25);
        break;
      }
      case 'win':
        if (step < 16 && s % 2 === 0) this.pluck([69, 73, 76, 81, 85, 88, 93, 97][s / 2], t, .06, 5000);
        if (step === 0) { this.kick(t, 1); this.pad([69, 73, 76], t, STEP * 32, .08); }
        break;
      case 'lose':
        if (step < 16 && s % 4 === 0) this.pluck([76, 72, 69, 64][s / 4], t, .06, 1500);
        if (step === 0) this.pad([57, 60, 64], t, STEP * 32, .07);
        break;
    }
  }

  // ─── Instruments ────────────────────────────────────────

  private env(gain: GainNode, t: number, peak: number, attack: number, release: number) {
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + release);
  }

  private kick(t: number, velocity: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + .12);
    this.env(gain, t, .9 * velocity, .002, .32);
    osc.connect(gain).connect(this.musicBus);
    osc.start(t); osc.stop(t + .4);
    // 側鏈壓縮：底鼓時壓低貝斯與和弦，製造抽吸律動。
    this.duck.gain.cancelScheduledValues(t);
    this.duck.gain.setValueAtTime(.25, t);
    this.duck.gain.linearRampToValueAtTime(1, t + .2);
  }

  private noiseHit(t: number, duration: number, volume: number, type: BiquadFilterType, frequency: number, q = 1, bus: AudioNode = this.musicBus) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = ctx.createBiquadFilter();
    filter.type = type; filter.frequency.value = frequency; filter.Q.value = q;
    const gain = ctx.createGain();
    this.env(gain, t, volume, .002, duration);
    src.connect(filter).connect(gain).connect(bus);
    src.start(t, Math.random() * .5); src.stop(t + duration + .05);
    return gain;
  }

  private snare(t: number, velocity: number) {
    const g = this.noiseHit(t, .18, .45 * velocity, 'bandpass', 1900, .8);
    g.connect(this.reverbSend);
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + .08);
    this.env(gain, t, .3 * velocity, .002, .1);
    osc.connect(gain).connect(this.musicBus);
    osc.start(t); osc.stop(t + .15);
  }

  private hat(t: number, volume: number, open = false) {
    this.noiseHit(t, open ? .16 : .035, volume, 'highpass', 7500, .7);
  }

  private tom(t: number, frequency: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(frequency, t);
    osc.frequency.exponentialRampToValueAtTime(frequency * .6, t + .15);
    this.env(gain, t, .45, .003, .18);
    osc.connect(gain).connect(this.musicBus);
    osc.connect(gain).connect(this.reverbSend);
    osc.start(t); osc.stop(t + .25);
  }

  private bass(note: number, t: number, duration: number, volume: number, distorted = false) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = 'sawtooth'; sub.type = 'sine';
    osc.frequency.value = midi(note); sub.frequency.value = midi(note - 12);
    filter.type = 'lowpass'; filter.Q.value = 6;
    filter.frequency.setValueAtTime(distorted ? 1600 : 900, t);
    filter.frequency.exponentialRampToValueAtTime(180, t + duration);
    this.env(gain, t, volume * .5, .005, duration);
    osc.connect(filter); sub.connect(filter);
    filter.connect(gain).connect(distorted ? this.drive : this.duck);
    osc.start(t); sub.start(t); osc.stop(t + duration + .05); sub.stop(t + duration + .05);
  }

  private pluck(note: number, t: number, volume: number, cutoff: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = midi(note);
    filter.type = 'lowpass'; filter.frequency.setValueAtTime(cutoff, t); filter.frequency.exponentialRampToValueAtTime(300, t + .15);
    this.env(gain, t, volume, .003, .16);
    osc.connect(filter).connect(gain);
    gain.connect(this.duck); gain.connect(this.reverbSend);
    osc.start(t); osc.stop(t + .22);
  }

  private lead(note: number, t: number, duration: number) {
    const ctx = this.ctx!;
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 3200; filter.Q.value = 3;
    this.env(gain, t, .06, .01, duration);
    for (const detune of [-9, 9]) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = midi(note); osc.detune.value = detune;
      osc.connect(filter);
      osc.start(t); osc.stop(t + duration + .05);
    }
    filter.connect(gain);
    gain.connect(this.duck); gain.connect(this.reverbSend);
  }

  private pad(notes: number[], t: number, duration: number, volume: number) {
    const ctx = this.ctx!;
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 1400;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + duration * .25);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    for (const note of notes) for (const detune of [-12, 12]) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = midi(note - 12); osc.detune.value = detune;
      osc.connect(filter);
      osc.start(t); osc.stop(t + duration + .05);
    }
    filter.connect(gain);
    gain.connect(this.duck); gain.connect(this.reverbSend);
  }

  private siren(t: number, frequency: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(frequency, t);
    osc.frequency.linearRampToValueAtTime(frequency * .8, t + .35);
    this.env(gain, t, .05, .01, .35);
    osc.connect(gain).connect(this.musicBus);
    osc.start(t); osc.stop(t + .4);
  }

  private riser(t: number, duration: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise; src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.Q.value = 4;
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(6000, t + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(.2, t + duration * .95);
    gain.gain.linearRampToValueAtTime(0, t + duration);
    src.connect(filter).connect(gain).connect(this.musicBus);
    src.start(t); src.stop(t + duration);
  }

  // ─── SFX ────────────────────────────────────────────────

  private blip(frequency: number, duration: number, volume: number, type: OscillatorType, slide = 0, delay = 0) {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, frequency + slide), t + duration);
    this.env(gain, t, volume, .003, duration);
    osc.connect(gain).connect(this.sfxBus);
    osc.start(t); osc.stop(t + duration + .05);
  }

  /** 擊破音：音高沿五聲音階依連擊數上升。 */
  kill(combo: number, big = false) {
    if (!this.ctx) return;
    const note = PENTATONIC[Math.min(combo, PENTATONIC.length - 1)];
    this.blip(midi(note), .12, .08, 'square');
    this.blip(midi(note + 7), .08, .04, 'triangle', 0, .03);
    this.noiseHit(this.ctx.currentTime, big ? .35 : .12, big ? .3 : .12, 'lowpass', big ? 1200 : 3000, 1, this.sfxBus);
  }

  chainLink(index: number) {
    const note = PENTATONIC[Math.min(index + 3, PENTATONIC.length - 1)];
    this.blip(midi(note), .09, .06, 'sawtooth', 0, index * .035);
  }

  nova(depth: number) {
    if (!this.ctx) return;
    this.blip(midi(57 + depth * 5), .25, .09, 'sine', -80);
    this.noiseHit(this.ctx.currentTime, .25, .18, 'lowpass', 900, 1, this.sfxBus);
  }

  chainCombo(count: number) {
    for (let i = 0; i < 4; i++) this.blip(midi(PENTATONIC[Math.min(count, 7)] + i * 5), .14, .05, 'square', 0, i * .05);
  }

  hit() { this.blip(1800, .03, .02, 'square'); }
  deflect() { this.blip(2400, .025, .015, 'triangle'); }

  earthHit() {
    if (!this.ctx) return;
    this.blip(90, .3, .14, 'sawtooth', -40);
    this.noiseHit(this.ctx.currentTime, .3, .25, 'lowpass', 600, 1, this.sfxBus);
  }

  stun() { this.blip(300, .35, .08, 'triangle', -200); }

  pickup() {
    [0, 4, 7, 12].forEach((n, i) => this.blip(midi(81 + n), .1, .06, 'triangle', 0, i * .045));
  }

  bomb() {
    if (!this.ctx) return;
    this.blip(60, .8, .25, 'sine', -25);
    this.noiseHit(this.ctx.currentTime, .9, .4, 'lowpass', 2000, .7, this.sfxBus);
  }

  bossBoom() {
    if (!this.ctx) return;
    this.blip(70, .5, .2, 'sawtooth', -40);
    this.noiseHit(this.ctx.currentTime, .6, .35, 'lowpass', 1100, 1, this.sfxBus);
  }

  start() { [0, 7, 12, 19].forEach((n, i) => this.blip(midi(69 + n), .12, .06, 'square', 0, i * .06)); }

  /** 雷射持續嗡鳴。 */
  laser(on: boolean) {
    const ctx = this.ctx;
    if (!ctx) return;
    if (on && !this.laserOsc) {
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();
      osc.type = 'sawtooth'; osc.frequency.value = 110;
      lfo.frequency.value = BPM / 60 * 4; lfoGain.gain.value = 30;
      lfo.connect(lfoGain).connect(osc.frequency);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.05, ctx.currentTime + .05);
      osc.connect(gain).connect(this.sfxBus);
      osc.start(); lfo.start();
      osc.onended = () => lfo.stop();
      this.laserOsc = osc; this.laserGain = gain;
    } else if (!on && this.laserOsc) {
      this.laserGain!.gain.setTargetAtTime(0.0001, ctx.currentTime, .03);
      this.laserOsc.stop(ctx.currentTime + .15);
      this.laserOsc = null; this.laserGain = null;
    }
  }

  dispose() { window.clearInterval(this.timer); }
}
