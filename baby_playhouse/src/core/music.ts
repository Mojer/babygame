import { audioContext } from './audio';

const VOLUME = 0.32; // under the sound effects
const FADE = 1.5; // seconds
const STORE_KEY = 'playhouse:music-muted';

let el: HTMLAudioElement | null = null;
let gain: GainNode | null = null;
let started = false;
let muted = readMuted();

function readMuted() {
  try {
    return localStorage.getItem(STORE_KEY) === '1';
  } catch {
    return false;
  }
}

function saveMuted() {
  try {
    localStorage.setItem(STORE_KEY, muted ? '1' : '0');
  } catch {
    /* storage blocked: the choice just won't be remembered */
  }
}

function rampTo(v: number, seconds: number) {
  const ctx = audioContext();
  if (!ctx || !gain) return;
  const now = ctx.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(v, now + seconds);
}

/** Prepare the looping background track (streams; nothing plays until startMusic). */
export function initMusic(url: string) {
  el = new Audio(url);
  el.loop = true;
  el.preload = 'auto';
  document.addEventListener('visibilitychange', () => {
    if (!el || !started) return;
    if (document.hidden) el.pause();
    else if (!muted) void el.play().catch(() => {});
  });
}

/**
 * Start the music on the first user gesture (browsers block autoplay).
 * Routed through Web Audio so volume and fades also work on iOS.
 */
export function startMusic() {
  const ctx = audioContext();
  if (started || !el || !ctx) return;
  started = true;
  if (!gain) {
    // an element can only be wired into Web Audio once
    gain = ctx.createGain();
    gain.gain.value = 0;
    ctx.createMediaElementSource(el).connect(gain).connect(ctx.destination);
  }
  if (!muted) {
    void el.play().catch(() => {
      started = false; // try again on the next tap
    });
    rampTo(VOLUME, FADE);
  }
}

export function isMusicStarted() {
  return started;
}

export function isMusicMuted() {
  return muted;
}

export function setMusicMuted(m: boolean) {
  muted = m;
  saveMuted();
  if (!el || !started) return;
  if (m) {
    rampTo(0, 0.4);
    setTimeout(() => muted && el?.pause(), 450);
  } else {
    void el.play().catch(() => {});
    rampTo(VOLUME, 0.8);
  }
}
