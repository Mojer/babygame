// 即時合成的配樂與音效。音樂時鐘同時是畫面節拍的來源（pollBeats）。
//
// 致敬 Gyruss（1983）以巴哈《D 小調觸技曲與賦格》BWV 565（公有領域）改編的配樂，
// 以現代電子舞曲手法重新編曲：
// - 觸技曲開頭的裝飾音下行 → 選單、Boss 登場的標誌動機
// - 賦格主題的「持續音交替」16 分音符（A-G-A-F-A-E-A-D…）→ 戰鬥主奏
// - 減七和弦琶音 → 警報與樂句過門
// 製作：150 BPM、四拍底鼓、疊層拍手、八度奔馳貝斯、Supersaw 和弦、側鏈抽吸、
// 左右彈跳延遲、Crash／滾奏／上升音效／落地重擊，以 8 小節樂句編排。

export type Section = 'menu' | 'wave' | 'break' | 'warning' | 'boss' | 'exposed' | 'win' | 'lose';

export interface Beat {
  time: number;
  /** 小節內第幾拍（0–3）。 */
  beat: number;
  bar: number;
  downbeat: boolean;
  section: Section;
}

export const BPM = 150;
const STEP = 60 / BPM / 4;
const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);

// ─── 樂譜 ─────────────────────────────────────────────────

type ChordName = 'Dm' | 'Bb' | 'Gm' | 'A' | 'Cdim';

const CHORDS: Record<ChordName, { root: number; voicing: number[] }> = {
  Dm: { root: 38, voicing: [62, 65, 69] },
  Bb: { root: 34, voicing: [62, 65, 70] },
  Gm: { root: 43, voicing: [62, 67, 70] },
  A: { root: 33, voicing: [61, 64, 69] },
  Cdim: { root: 37, voicing: [61, 64, 67, 70] }
};

const PROGRESSION: Record<'wave' | 'boss', ChordName[]> = {
  wave: ['Dm', 'Bb', 'Gm', 'A'],
  boss: ['Dm', 'Gm', 'Cdim', 'A']
};

/** 賦格主題式的持續音交替：p 與下行線條交錯，16 個 16 分音符。 */
const pedal = (p: number, line: number[]) =>
  [p, line[0], p, line[1], p, line[2], p, line[3], p, line[4], p, line[5], p, line[2], p, line[1]];

const FUGUE: Record<ChordName, number[]> = {
  Dm: pedal(81, [79, 77, 76, 74, 73, 74]),
  Bb: pedal(77, [76, 74, 72, 70, 69, 70]),
  Gm: pedal(79, [77, 76, 74, 72, 70, 72]),
  A: pedal(81, [79, 77, 76, 73, 76, 73]),
  Cdim: pedal(79, [76, 73, 70, 67, 70, 73])
};

/** 觸技曲開頭動機（兩小節 = 32 步）：A 裝飾音 → G F E D → C# → D。 */
const TOCCATA: { step: number; note: number; length: number; mordent?: boolean }[] = [
  { step: 0, note: 81, length: 5, mordent: true },
  { step: 6, note: 79, length: 1 },
  { step: 7, note: 77, length: 1 },
  { step: 8, note: 76, length: 1 },
  { step: 9, note: 74, length: 1 },
  { step: 10, note: 73, length: 5 },
  { step: 16, note: 74, length: 12 }
];

/** 減七和弦上下琶音（一小節）。 */
const DIMINISHED = [61, 64, 67, 70, 73, 76, 79, 82, 85, 82, 79, 76, 73, 70, 67, 64];
/** 樂句尾的觸技曲式下行快跑。 */
const RUN = [86, 85, 86, 81, 79, 77, 76, 74, 73, 74, 76, 77, 79, 81, 82, 85];
const PICARDY = [62, 66, 69, 74, 78, 81, 86, 90];

/** D 小調五聲音階：擊破音效依連擊往上爬，讓連環消滅聽起來像旋律。 */
const PENTATONIC = [74, 77, 79, 81, 84, 86, 89, 91, 93, 96, 98, 101];

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicBus!: GainNode;
  private duck!: GainNode;
  private leadBus!: GainNode;
  private sfxBus!: GainNode;
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

  /** 換段落：一般在下一小節生效；警報與結算在下一拍生效。 */
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
    comp.threshold.value = -12; comp.knee.value = 6; comp.ratio.value = 5; comp.attack.value = .003; comp.release.value = .15;
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : .8;
    this.master.connect(comp).connect(ctx.destination);

    this.musicBus = ctx.createGain(); this.musicBus.gain.value = .5; this.musicBus.connect(this.master);
    this.duck = ctx.createGain(); this.duck.connect(this.musicBus);
    this.sfxBus = ctx.createGain(); this.sfxBus.gain.value = .7; this.sfxBus.connect(this.master);

    const reverb = ctx.createConvolver();
    reverb.buffer = this.impulse(2.4);
    this.reverbSend = ctx.createGain(); this.reverbSend.gain.value = .3;
    this.reverbSend.connect(reverb).connect(this.duck);

    // 主奏：乾聲 + 左右彈跳延遲（左 3/16、右 6/16，即附點八分與附點四分）。
    this.leadBus = ctx.createGain();
    this.leadBus.connect(this.duck);
    this.leadBus.connect(this.reverbSend);
    for (const [steps, pan] of [[3, -.7], [6, .7]] as const) {
      const delay = ctx.createDelay(1); delay.delayTime.value = STEP * steps;
      const feedback = ctx.createGain(); feedback.gain.value = .32;
      const tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 3200;
      const panner = ctx.createStereoPanner(); panner.pan.value = pan;
      const wet = ctx.createGain(); wet.gain.value = .35;
      this.leadBus.connect(delay);
      delay.connect(tone).connect(feedback).connect(delay);
      tone.connect(panner).connect(wet).connect(this.duck);
    }

    this.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    this.drive = ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) { const x = i / 512 - 1; curve[i] = Math.tanh(x * 3.5); }
    this.drive.curve = curve;
    const driveOut = ctx.createGain(); driveOut.gain.value = .6;
    this.drive.connect(driveOut).connect(this.duck);

    this.nextTime = ctx.currentTime + .08;
    this.timer = window.setInterval(() => this.schedule(), 25);
  }

  private impulse(seconds: number) {
    const ctx = this.ctx!;
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buffer.getChannelData(c);
      for (let i = 0; i < length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2.5;
    }
    return buffer;
  }

  // ─── Sequencer ──────────────────────────────────────────

  private schedule() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    if (this.nextTime < ctx.currentTime - .2) this.nextTime = ctx.currentTime + .05;
    while (this.nextTime < ctx.currentTime + .12) {
      const urgent = this.pending === 'warning' || this.pending === 'win' || this.pending === 'lose';
      if (this.pending && (this.step % 16 === 0 || (urgent && this.step % 4 === 0))) {
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
    const phraseBar = bar % 8;
    const section = this.section;
    if (s % 4 === 0) this.beats.push({ time: t, beat: s / 4, bar, downbeat: s === 0, section });

    switch (section) {
      case 'menu': this.menu(s, bar, t); break;
      case 'wave': this.wave(s, bar, phraseBar, t); break;
      case 'break': this.breakdown(s, t); break;
      case 'warning': this.warning(s, bar, t); break;
      case 'boss':
      case 'exposed': this.boss(s, bar, phraseBar, t, section === 'exposed'); break;
      case 'win':
        if (step < 8) this.pluck(PICARDY[step], t, .07, 6000, step % 2 ? .5 : -.5);
        if (step === 0) this.kick(t, 1);
        if (step === 8) { this.crash(t); this.impact(t); this.supersaw([62, 66, 69, 74], t, STEP * 24, .06); this.bass(38, t, STEP * 16, .6); }
        break;
      case 'lose':
        if (bar < 2) this.toccata(step, -24, t, .8);
        if (step === 0) this.supersaw([50, 53, 57], t, STEP * 32, .05);
        break;
    }
  }

  /** 選單：觸技曲開頭三段下降（原曲的三個八度），第 9 小節起加入輕律動。 */
  private menu(s: number, bar: number, t: number) {
    const phraseBar = bar % 8;
    const local = phraseBar * 16 + s;
    if (phraseBar < 2) this.toccata(local, 0, t, 2);
    else if (phraseBar < 4) this.toccata(local - 32, -12, t, 2.2);
    else if (phraseBar < 6) this.toccata(local - 64, -24, t, 2.6);
    else if (phraseBar === 6) this.pluck(DIMINISHED[s], t, .08, 2200 + s * 160, s % 2 ? .6 : -.6);
    if (s === 0 && phraseBar % 4 === 0) this.supersaw(CHORDS.Dm.voicing.map(n => n - 12), t, STEP * 64, .05);
    if (phraseBar === 7 && s === 0) { this.impact(t); this.supersaw([50, 57, 62, 65], t, STEP * 16, .08); }
    if (bar >= 8) {
      if (s % 4 === 0) this.kick(t, .5);
      if (s % 4 === 2) this.hat(t, .05, true);
      if (s % 2 === 0) this.bass(CHORDS.Dm.root, t, STEP * 1.5, .25);
    }
  }

  private wave(s: number, bar: number, phraseBar: number, t: number) {
    const chord = CHORDS[PROGRESSION.wave[bar % 4]];
    const fill = phraseBar === 7;
    if (phraseBar === 0 && s === 0) { this.crash(t); if (bar > 0) this.impact(t); }

    // 鼓組
    if (s % 4 === 0 && !(fill && s >= 12)) this.kick(t, 1);
    if (s === 4 || s === 12) this.clap(t, 1);
    this.hat(t, [.12, .04, .08, .04][s % 4], false, s % 2 ? .3 : -.3);
    if (s % 4 === 2) this.hat(t, .11, true);
    if (fill && s >= 8) this.clap(t, .25 + (s - 8) * .1, true);
    if (fill && s === 0) this.riser(t, STEP * 16);

    // 八度奔馳貝斯
    const gallop = [0, 0, 12, 0][s % 4];
    this.bass(chord.root + gallop, t, STEP * .9, s % 4 === 0 ? .55 : .4);

    // Supersaw：小節開頭長和弦 + 切分短刺
    if (s === 0) this.supersaw(chord.voicing, t, STEP * 16, .022);
    if (s === 0 || s === 6 || s === 10) this.supersaw(chord.voicing.map(n => n + 12), t, STEP * 2, .03);

    // 主奏：賦格式持續音交替；後半樂句升八度；樂句尾觸技曲快跑
    if (fill) this.lead(RUN[s], t, STEP * .95, .9);
    else this.lead(FUGUE[PROGRESSION.wave[bar % 4]][s] + (phraseBar >= 4 ? 12 : 0), t, STEP * .9, phraseBar >= 4 ? .8 : .7);
  }

  private breakdown(s: number, t: number) {
    const chord = CHORDS.Dm;
    if (s === 0) { this.supersaw(chord.voicing, t, STEP * 16, .03); this.riser(t, STEP * 16); }
    this.pluck(FUGUE.Dm[s], t, .035, 700 + s * 260, s % 2 ? .5 : -.5);
    if (s % 2 === 0) this.hat(t, .05);
    if (s >= 8) this.clap(t, .2 + (s - 8) * .08, true);
    if (s % 4 === 0) this.bass(chord.root, t, STEP * 3, .3);
  }

  /** Boss 警報：低八度觸技曲動機 + 警報器，第二小節減七琶音與滾奏。 */
  private warning(s: number, bar: number, t: number) {
    if (s % 4 === 0) this.kick(t, 1);
    this.hat(t, .07);
    if (bar % 2 === 0) {
      this.toccata(s, -12, t, 1);
      this.bass(38, t, STEP * .9, .5, true);
      if (s % 8 === 0) this.siren(t, s === 0 ? 880 : 660);
      if (s === 0) this.crash(t);
    } else {
      this.lead(DIMINISHED[s], t, STEP * .9, .8);
      this.bass(37, t, STEP * .9, .5, true);
      if (s >= 4) this.clap(t, .2 + s * .05, true);
      if (s === 0) this.riser(t, STEP * 16);
    }
  }

  private boss(s: number, bar: number, phraseBar: number, t: number, exposed: boolean) {
    const name = PROGRESSION.boss[bar % 4];
    const chord = CHORDS[name];
    const fill = phraseBar === 7;
    if (phraseBar === 0 && s === 0) { this.crash(t); this.impact(t); }

    // 鼓組：四拍 + 切分補拍，拍手加殘響
    const kicks = bar % 2 ? [0, 4, 8, 11, 12, 14] : [0, 4, 8, 12, 14];
    if (kicks.includes(s) && !(fill && s >= 12)) this.kick(t, s % 4 === 0 ? 1.1 : .75);
    if (s === 4 || s === 12) this.clap(t, 1.1);
    this.hat(t, s % 2 ? .06 : .12, false, s % 2 ? .35 : -.35);
    if (s % 4 === 2 || (exposed && s % 2 === 1)) this.hat(t, .1, true);
    if (fill && s >= 8) this.clap(t, .3 + (s - 8) * .1, true);
    if (fill && s === 0) this.riser(t, STEP * 16);

    // 失真 16 分貝斯
    this.bass(chord.root + (s % 4 === 3 ? 12 : 0), t, STEP * .85, s % 4 === 0 ? .6 : .45, true);

    // 3-3-2 切分和弦刺
    if (s === 0) this.supersaw(chord.voicing, t, STEP * 16, .02);
    if (s === 0 || s === 3 || s === 6 || s === 10) this.supersaw(chord.voicing.map(n => n + 12), t, STEP * 1.5, .032);

    // 主奏：Boss 以觸技曲動機登場，之後轉入賦格；弱點暴露時全程賦格並疊高八度
    if (fill) this.lead(DIMINISHED[s] + 12, t, STEP * .9, .9);
    else if (!exposed && phraseBar < 2) this.toccata(phraseBar * 16 + s, 0, t, 1.1);
    else if (!exposed && phraseBar < 4) this.toccata((phraseBar - 2) * 16 + s, -12, t, 1.1);
    else {
      const note = FUGUE[name][s];
      this.lead(note, t, STEP * .9, .85);
      if (exposed) this.lead(note + 12, t, STEP * .9, .45);
    }
  }

  /** 播放觸技曲動機中落在 localStep 的音符。 */
  private toccata(localStep: number, transpose: number, t: number, velocity: number) {
    for (const n of TOCCATA) {
      if (n.step !== localStep) continue;
      const note = n.note + transpose;
      if (n.mordent) {
        const third = STEP / 3;
        this.lead(note, t, third * .9, velocity);
        this.lead(note - 2, t + third, third * .9, velocity);
        this.lead(note, t + third * 2, STEP * n.length - third * 2, velocity);
      } else {
        this.lead(note, t, STEP * n.length * .95, velocity);
      }
    }
  }

  // ─── Instruments ────────────────────────────────────────

  private env(gain: GainNode, t: number, peak: number, attack: number, release: number) {
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002, peak), t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + release);
  }

  private kick(t: number, velocity: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(48, t + .09);
    osc.frequency.exponentialRampToValueAtTime(38, t + .3);
    this.env(gain, t, .95 * velocity, .002, .34);
    osc.connect(gain).connect(this.musicBus);
    osc.start(t); osc.stop(t + .4);
    this.noiseHit(t, .012, .25 * velocity, 'highpass', 3000, 1); // 敲擊點
    // 側鏈抽吸：壓低貝斯、和弦與主奏
    this.duck.gain.cancelScheduledValues(t);
    this.duck.gain.setValueAtTime(.2, t);
    this.duck.gain.linearRampToValueAtTime(1, t + STEP * 2.2);
  }

  private noiseHit(t: number, duration: number, volume: number, type: BiquadFilterType, frequency: number, q = 1, bus: AudioNode = this.musicBus, pan = 0) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = ctx.createBiquadFilter();
    filter.type = type; filter.frequency.value = frequency; filter.Q.value = q;
    const gain = ctx.createGain();
    this.env(gain, t, volume, .002, duration);
    let node: AudioNode = src.connect(filter).connect(gain);
    if (pan) { const p = ctx.createStereoPanner(); p.pan.value = pan; node = node.connect(p); }
    node.connect(bus);
    src.start(t, Math.random() * 1.5); src.stop(t + duration + .05);
    return gain;
  }

  /** 疊層拍手：三次微小錯開的雜訊爆發 + 殘響。 */
  private clap(t: number, velocity: number, roll = false) {
    const bursts = roll ? [0] : [0, .011, .022];
    for (const offset of bursts) {
      const g = this.noiseHit(t + offset, roll ? .06 : .14, .32 * velocity, 'bandpass', 1500, 1.1);
      if (!roll) g.connect(this.reverbSend);
    }
  }

  private hat(t: number, volume: number, open = false, pan = 0) {
    this.noiseHit(t, open ? .18 : .03, volume, 'highpass', open ? 7000 : 9000, .8, this.musicBus, pan);
  }

  private crash(t: number) {
    const g = this.noiseHit(t, 1.8, .16, 'highpass', 5000, .5);
    g.connect(this.reverbSend);
  }

  /** 落地重擊：低頻下潛。 */
  private impact(t: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(28, t + 1.2);
    this.env(gain, t, .7, .005, 1.3);
    osc.connect(gain).connect(this.musicBus);
    osc.start(t); osc.stop(t + 1.4);
  }

  private riser(t: number, duration: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise; src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.Q.value = 3;
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(9000, t + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(.14, t + duration * .95);
    gain.gain.linearRampToValueAtTime(0, t + duration);
    src.connect(filter).connect(gain).connect(this.musicBus);
    src.start(t); src.stop(t + duration);
  }

  private bass(note: number, t: number, duration: number, volume: number, distorted = false) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = midi(note);
    filter.type = 'lowpass'; filter.Q.value = distorted ? 4 : 8;
    filter.frequency.setValueAtTime(distorted ? 2400 : 1500, t);
    filter.frequency.exponentialRampToValueAtTime(distorted ? 300 : 160, t + Math.max(.06, duration));
    this.env(gain, t, volume * .45, .004, duration);
    osc.connect(filter).connect(gain).connect(distorted ? this.drive : this.duck);
    osc.start(t); osc.stop(t + duration + .05);
    if (note >= 36) {
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.frequency.value = midi(note - 12);
      this.env(subGain, t, volume * .35, .004, duration);
      sub.connect(subGain).connect(this.duck);
      sub.start(t); sub.stop(t + duration + .05);
    }
  }

  /** 主奏：兩個微走音鋸齒 + 方波，濾波包絡；送入彈跳延遲。 */
  private lead(note: number, t: number, duration: number, velocity: number) {
    const ctx = this.ctx!;
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.Q.value = 4;
    filter.frequency.setValueAtTime(6500, t);
    filter.frequency.exponentialRampToValueAtTime(1400, t + Math.max(.08, duration));
    this.env(gain, t, .045 * velocity, .004, Math.max(.06, duration));
    const voices: [OscillatorType, number][] = [['sawtooth', -8], ['sawtooth', 8], ['square', 0]];
    for (const [type, detune] of voices) {
      const osc = ctx.createOscillator();
      osc.type = type; osc.frequency.value = midi(note); osc.detune.value = detune;
      osc.connect(filter);
      osc.start(t); osc.stop(t + duration + .08);
    }
    filter.connect(gain).connect(this.leadBus);
  }

  /** Supersaw：每個音 5 支走音鋸齒、左右展開。 */
  private supersaw(notes: number[], t: number, duration: number, volume: number) {
    const ctx = this.ctx!;
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.setValueAtTime(duration > STEP * 4 ? 2200 : 5200, t);
    filter.frequency.exponentialRampToValueAtTime(duration > STEP * 4 ? 1200 : 1800, t + duration);
    const attack = duration > STEP * 4 ? duration * .15 : .005;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    const spread = [-24, -11, 0, 11, 24];
    for (const note of notes) spread.forEach((detune, i) => {
      const osc = ctx.createOscillator();
      const pan = ctx.createStereoPanner();
      osc.type = 'sawtooth'; osc.frequency.value = midi(note); osc.detune.value = detune;
      pan.pan.value = (i - 2) / 2.5;
      osc.connect(pan).connect(filter);
      osc.start(t); osc.stop(t + duration + .05);
    });
    filter.connect(gain);
    gain.connect(this.duck); gain.connect(this.reverbSend);
  }

  private pluck(note: number, t: number, volume: number, cutoff: number, pan = 0) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    osc.type = 'square';
    osc.frequency.value = midi(note);
    filter.type = 'lowpass'; filter.frequency.setValueAtTime(cutoff, t); filter.frequency.exponentialRampToValueAtTime(300, t + .18);
    panner.pan.value = pan;
    this.env(gain, t, volume, .003, .2);
    osc.connect(filter).connect(gain).connect(panner);
    panner.connect(this.duck); panner.connect(this.reverbSend);
    osc.start(t); osc.stop(t + .25);
  }

  private siren(t: number, frequency: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(frequency, t);
    osc.frequency.linearRampToValueAtTime(frequency * .75, t + STEP * 7);
    this.env(gain, t, .04, .01, STEP * 7);
    osc.connect(gain).connect(this.musicBus);
    osc.start(t); osc.stop(t + STEP * 8);
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

  /** 擊破音：音高沿 D 小調五聲音階依連擊數上升，與配樂同調。 */
  kill(combo: number, big = false) {
    if (!this.ctx) return;
    const note = PENTATONIC[Math.min(combo, PENTATONIC.length - 1)];
    this.blip(midi(note), .12, .07, 'square');
    this.blip(midi(note + 7), .08, .035, 'triangle', 0, .03);
    this.noiseHit(this.ctx.currentTime, big ? .35 : .12, big ? .3 : .12, 'lowpass', big ? 1200 : 3000, 1, this.sfxBus);
  }

  chainLink(index: number) {
    const note = PENTATONIC[Math.min(index + 3, PENTATONIC.length - 1)];
    this.blip(midi(note), .09, .06, 'sawtooth', 0, index * .035);
  }

  nova(depth: number) {
    if (!this.ctx) return;
    this.blip(midi(50 + [0, 3, 5, 7, 10, 12, 15][Math.min(depth, 6)]), .25, .09, 'sine', -80);
    this.noiseHit(this.ctx.currentTime, .25, .18, 'lowpass', 900, 1, this.sfxBus);
  }

  chainCombo(count: number) {
    for (let i = 0; i < 4; i++) this.blip(midi(PENTATONIC[Math.min(count, 7)] + [0, 3, 7, 12][i]), .14, .05, 'square', 0, i * .05);
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
    [0, 3, 7, 12].forEach((n, i) => this.blip(midi(86 + n), .1, .06, 'triangle', 0, i * .045));
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

  start() { [0, 7, 12, 19].forEach((n, i) => this.blip(midi(62 + n), .12, .06, 'square', 0, i * .06)); }

  /** 雷射持續嗡鳴（16 分音符速率的顫動，與節拍同步）。 */
  laser(on: boolean) {
    const ctx = this.ctx;
    if (!ctx) return;
    if (on && !this.laserOsc) {
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();
      osc.type = 'sawtooth'; osc.frequency.value = midi(38);
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
