/**
 * Procedural WebAudio sound effects plus the looping background track; if the track
 * cannot load, a procedural pentatonic tune plays instead.
 * Nothing plays until the first user gesture unlocks the AudioContext.
 */

export type Sfx = 'select' | 'place' | 'capture' | 'check' | 'win' | 'lose' | 'draw' | 'pass' | 'fail' | 'click'

const PREFS_KEY = 'xq3d.audio'

interface Prefs {
  sfx: boolean
  music: boolean
}

function loadPrefs(): Prefs {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') as Partial<Prefs>
    return { sfx: p.sfx ?? true, music: p.music ?? true }
  } catch {
    return { sfx: true, music: true }
  }
}

// C major pentatonic (宮商角徵羽) across two octaves, as MIDI notes
const SCALE = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81]
const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12)

/** 16-step phrases (scale index, or -1 for rest); the tune cycles A A B A. */
const PHRASE_A = [4, -1, 3, 4, 5, -1, 4, 3, 2, -1, 3, 2, 1, -1, -1, -1]
const PHRASE_B = [5, -1, 6, 7, 6, -1, 5, 4, 3, -1, 4, 3, 2, 1, 0, -1]
const BASS = [0, 0, 3, 3, 4, 4, 0, 0]
const STEP = 0.24

const TRACK_URL = `${import.meta.env.BASE_URL}audio/medieval.mp3`
const TRACK_GAIN = 0.45
const SYNTH_GAIN = 0.16

class Sound {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private musicBus: GainNode | null = null
  private noise: AudioBuffer | null = null
  private prefs = loadPrefs()
  private step = 0
  private nextTime = 0
  private timer = 0
  private track: HTMLAudioElement | null = null
  private trackFailed = false

  constructor() {
    const unlock = () => {
      this.ensure()
      if (this.ctx?.state === 'suspended') void this.ctx.resume()
    }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return
      if (document.hidden) {
        void this.ctx.suspend()
        this.track?.pause()
      } else {
        void this.ctx.resume()
        this.syncTrack()
      }
    })
  }

  get sfxOn(): boolean {
    return this.prefs.sfx
  }

  get musicOn(): boolean {
    return this.prefs.music
  }

  setSfx(on: boolean): void {
    this.prefs.sfx = on
    this.save()
  }

  setMusic(on: boolean): void {
    this.prefs.music = on
    this.save()
    if (this.musicBus && this.ctx) this.musicBus.gain.setTargetAtTime(on ? this.musicGain() : 0, this.ctx.currentTime, 0.2)
    this.syncTrack()
  }

  private musicGain(): number {
    return this.trackFailed ? SYNTH_GAIN : TRACK_GAIN
  }

  /** Streams the mp3 through the music bus so the music toggle and volume apply to it. */
  private startTrack(ctx: AudioContext): void {
    const el = new Audio(TRACK_URL)
    el.loop = true
    el.preload = 'auto'
    el.addEventListener('error', () => {
      this.trackFailed = true
      this.track = null
      if (this.musicBus) this.musicBus.gain.value = this.prefs.music ? SYNTH_GAIN : 0
    })
    ctx.createMediaElementSource(el).connect(this.musicBus!)
    this.track = el
    this.syncTrack()
  }

  private syncTrack(): void {
    const el = this.track
    if (!el) return
    if (this.prefs.music && !document.hidden) void el.play().catch(() => {})
    else el.pause()
  }

  private save(): void {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(this.prefs))
    } catch {
      /* preference lasts for this visit only */
    }
  }

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    const ctx = (this.ctx = new Ctor())
    this.master = ctx.createGain()
    this.master.gain.value = 0.7
    this.master.connect(ctx.destination)
    this.musicBus = ctx.createGain()
    this.musicBus.gain.value = this.prefs.music ? TRACK_GAIN : 0
    this.musicBus.connect(this.master)
    this.startTrack(ctx)
    const len = ctx.sampleRate * 0.5
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = this.noise.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    this.nextTime = ctx.currentTime + 0.1
    this.timer = window.setInterval(() => this.schedule(), 60)
    return ctx
  }

  // ---------- building blocks ----------

  private tone(freq: number, at: number, dur: number, type: OscillatorType, gain: number, out: AudioNode, slideTo?: number): void {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, at)
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, at + dur)
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(gain, at + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
    osc.connect(g).connect(out)
    osc.start(at)
    osc.stop(at + dur + 0.02)
  }

  private burst(at: number, dur: number, freq: number, q: number, gain: number): void {
    const ctx = this.ctx!
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = freq
    filter.Q.value = q
    const g = ctx.createGain()
    g.gain.setValueAtTime(gain, at)
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
    src.connect(filter).connect(g).connect(this.master!)
    src.start(at)
    src.stop(at + dur + 0.02)
  }

  // ---------- effects ----------

  play(name: Sfx): void {
    if (!this.prefs.sfx) return
    const ctx = this.ensure()
    if (!ctx || ctx.state !== 'running') return
    const t = ctx.currentTime + 0.005
    const out = this.master!
    switch (name) {
      case 'click':
        this.tone(1400, t, 0.05, 'sine', 0.15, out)
        break
      case 'select':
        this.tone(620, t, 0.09, 'sine', 0.25, out, 980)
        break
      case 'place':
        this.burst(t, 0.07, 1800, 6, 0.6)
        this.tone(190, t, 0.12, 'sine', 0.45, out, 120)
        break
      case 'capture':
        this.burst(t, 0.35, 700, 1.2, 0.9)
        this.tone(160, t, 0.4, 'sine', 0.7, out, 45)
        this.tone(1300, t + 0.05, 0.25, 'triangle', 0.18, out, 2400)
        break
      case 'check':
        for (let i = 0; i < 2; i++) {
          this.tone(880, t + i * 0.22, 0.12, 'square', 0.12, out)
          this.tone(660, t + i * 0.22 + 0.11, 0.1, 'square', 0.12, out)
        }
        break
      case 'win':
      case 'pass':
        ;[0, 2, 4, 5, 7].forEach((s, i) => this.tone(midi(SCALE[s] + 12), t + i * 0.11, 0.35, 'triangle', 0.3, out))
        break
      case 'lose':
        ;[4, 3, 2, 0].forEach((s, i) => this.tone(midi(SCALE[s]), t + i * 0.16, 0.4, 'triangle', 0.28, out))
        break
      case 'draw':
        ;[3, 3].forEach((s, i) => this.tone(midi(SCALE[s]), t + i * 0.2, 0.3, 'triangle', 0.25, out))
        break
      case 'fail':
        this.tone(330, t, 0.25, 'triangle', 0.25, out, 260)
        this.tone(262, t + 0.2, 0.35, 'triangle', 0.25, out, 200)
        break
    }
  }

  // ---------- music ----------

  /** Plucked, guzheng-like note: fast attack, quick decay, a little octave shimmer. */
  private pluck(freq: number, at: number, gain: number): void {
    const out = this.musicBus!
    this.tone(freq, at, 0.9, 'triangle', gain, out)
    this.tone(freq * 2, at, 0.35, 'sine', gain * 0.3, out)
  }

  private schedule(): void {
    const ctx = this.ctx
    if (!ctx || ctx.state !== 'running') {
      if (ctx) this.nextTime = ctx.currentTime + 0.1
      return
    }
    while (this.nextTime < ctx.currentTime + 0.3) {
      const bar = Math.floor(this.step / 16) % 4
      const phrase = bar === 2 ? PHRASE_B : PHRASE_A
      const note = phrase[this.step % 16]
      if (this.prefs.music && this.trackFailed) {
        if (note >= 0) this.pluck(midi(SCALE[note] + 12), this.nextTime, 0.32)
        if (this.step % 2 === 0) {
          const bass = BASS[(this.step / 2) % BASS.length]
          if (this.step % 4 === 0) this.pluck(midi(SCALE[bass] - 12), this.nextTime, 0.4)
        }
      }
      this.step++
      this.nextTime += STEP
    }
  }

  dispose(): void {
    clearInterval(this.timer)
    this.track?.pause()
    void this.ctx?.close()
  }
}

export const sound = new Sound()
