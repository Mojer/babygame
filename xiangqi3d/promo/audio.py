"""Beat-locked soundtrack for the Q 版象棋王國 brand film (D minor, 120 BPM, 60 beats = 30 s).

Reads score.json (the same cue list main.ts draws) and writes out/soundtrack.wav.
sample(beat) = round(beat * 60/bpm * sr): no offsets.
Style: epic year-ahead trailer — taiko, braams, low string ostinato, a D-minor
pentatonic lead and guzheng-like plucks, a gong for the logo.
"""
import json
import wave
from pathlib import Path

import numpy as np
from scipy.signal import lfilter

HERE = Path(__file__).resolve().parent
SCORE = json.loads((HERE / 'score.json').read_text())
SR = SCORE['sampleRate']
BPM = SCORE['bpm']
SPB = 60 / BPM
STEP = SPB / 4
END = SCORE['beats'] + SCORE['tail']
N = int(round(END * SPB * SR))
LEN = N + SR * 2
rng = np.random.default_rng(1031)
EV = SCORE['events']


def S(beat):
    return int(round(beat * SPB * SR))


def midi(n):
    return 440 * 2 ** ((n - 69) / 12)


drums = np.zeros((2, LEN))
music = np.zeros((2, LEN))   # ducked by kicks
sfx = np.zeros((2, LEN))
verb = np.zeros(LEN)
kicks = []


def add(bus, beat, sig, pan=0.0, gain=1.0, send=0.0):
    start = S(beat)
    if start >= LEN or start < 0:
        return
    sig = sig[: LEN - start] * gain
    end = start + len(sig)
    a = (pan + 1) * np.pi / 4
    bus[0, start:end] += sig * np.cos(a) * np.sqrt(2)
    bus[1, start:end] += sig * np.sin(a) * np.sqrt(2)
    if send:
        verb[start:end] += sig * send


def tt(n):
    return np.arange(n) / SR


def env(n, attack=0.003, decay=0.2, gate=None, release=0.03):
    t = tt(n)
    e = np.minimum(1, t / max(attack, 1e-4)) * np.exp(-t / decay)
    if gate is not None:
        e *= np.clip(1 - (t - gate) / release, 0, 1)
    return e


def osc(freq, n, kind='saw', cutoff=7000, bright=0.0, phase=None):
    t = tt(n)
    out = np.zeros(n)
    top = max(1, int(cutoff // max(freq, 1)))
    for k in range(1, top + 1):
        if kind == 'square' and k % 2 == 0:
            continue
        amp = (1 / k) * np.exp(-(k - 1) * bright)
        ph = rng.uniform(0, 2 * np.pi) if phase is None else phase
        out += amp * np.sin(2 * np.pi * k * freq * t + ph)
    return out


def sweep(f0, f1, n, curve=0.05):
    t = tt(n)
    f = f1 + (f0 - f1) * np.exp(-t / curve)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def band(n, lo=20, hi=20000, order=2):
    x = rng.standard_normal(n)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR) + 1e-3
    mask = 1 / (1 + (lo / f) ** (2 * order)) / (1 + (f / hi) ** (2 * order))
    y = np.fft.irfft(X * mask, n)
    return y / (np.std(y) + 1e-9)


def lowpass(x, cutoff):
    """One-pole lowpass with per-sample cutoff array or scalar."""
    if np.isscalar(cutoff):
        a = 1 - np.exp(-2 * np.pi * cutoff / SR)
        return lfilter([a], [1, a - 1], x)
    c = np.broadcast_to(np.asarray(cutoff, float), x.shape)
    a = 1 - np.exp(-2 * np.pi * c / SR)
    y = np.empty_like(x)
    s = 0.0
    for i in range(len(x)):
        s += a[i] * (x[i] - s)
        y[i] = s
    return y


# ─── Drums ───────────────────────────────────────────────
def kick(beat, vel=1.0, sub=1.0):
    n = int(SR * 0.5)
    t = tt(n)
    f = 42 + 160 * np.exp(-t / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.18 * sub)) * np.minimum(1, t / 0.002)
    click = band(int(SR * 0.01), 2500, 12000) * np.exp(-tt(int(SR * 0.01)) / 0.003) * 0.35
    body[: len(click)] += click
    add(drums, beat, np.tanh(body * 2.2) * 0.9 * vel)
    kicks.append((beat, vel))


def heartbeat(beat, soft=False):
    n = int(SR * 0.45)
    t = tt(n)
    f = 38 + 50 * np.exp(-t / 0.04)
    sig = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.006, 0.12)
    add(drums, beat, np.tanh(sig * 2.5), gain=0.55 if soft else 0.85)
    kicks.append((beat, 0.5))


def snare(beat, vel=1.0, send=0.3):
    n = int(SR * 0.3)
    t = tt(n)
    tone = sweep(260, 170, n, 0.03) * env(n, 0.001, 0.06)
    noise = band(n, 1200, 9000) * env(n, 0.001, 0.11)
    add(drums, beat, np.tanh((tone * 0.7 + noise) * 1.4) * 0.32 * vel, send=send)


def clap(beat, vel=1.0):
    n = int(SR * 0.2)
    for off in (0, 0.009, 0.019):
        add(drums, beat + off / SPB, band(n, 900, 3000) * env(n, 0.001, 0.08), gain=0.16 * vel, send=0.3)


def hat(beat, vol, open_=False, pan=0.0):
    n = int(SR * (0.22 if open_ else 0.045))
    sig = band(n, 7000, 18000) * env(n, 0.001, 0.08 if open_ else 0.013)
    add(drums, beat, sig, pan=pan, gain=vol)


def taiko(beat, vel=1.0, pitch=1.0, pan=0.0):
    n = int(SR * 0.9)
    t = tt(n)
    f = (70 + 60 * np.exp(-t / 0.05)) * pitch
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.28)
    skin = band(n, 150, 1400) * env(n, 0.001, 0.05) * 0.5
    add(drums, beat, np.tanh((body + skin) * 1.8) * 0.55 * vel, pan=pan, send=0.45)
    kicks.append((beat, 0.6 * vel))


def tom(beat, vel=1.0, pitch=1.0, pan=0.0):
    n = int(SR * 0.4)
    t = tt(n)
    f = (110 + 80 * np.exp(-t / 0.04)) * pitch
    add(drums, beat, np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.15) * 2) * 0.4 * vel, pan=pan, send=0.3)


def crash(beat, vol=0.16):
    n = int(SR * 2.5)
    for pan in (-0.4, 0.4):
        add(drums, beat, band(n, 4000, 16000) * env(n, 0.002, 0.8), pan=pan, gain=vol, send=0.3)


def reverse_crash(beat, length):
    n = int(SR * length * SPB)
    t = np.linspace(0, 1, n)
    add(drums, beat, band(n, 3000, 15000) * t ** 3, gain=0.18, send=0.2)


# ─── Tonal ───────────────────────────────────────────────
def bass(beat, note, length, vol=0.5, dist=True, bright=0.18):
    n = int(SR * (length + 0.03))
    t = tt(n)
    f = midi(note)
    sig = osc(f, n, 'saw', 3000, bright=bright + t * 4, phase=0) + 0.8 * np.sin(2 * np.pi * f / 2 * t)
    sig *= env(n, 0.003, 0.3, gate=length, release=0.02)
    if dist:
        sig = np.tanh(sig * 3) * 0.6
    add(music, beat, sig, gain=vol)


def braam(beat, notes, length, vol=0.5):
    """Big detuned brass-ish swell with an opening filter."""
    n = int(SR * (length + 0.6))
    t = tt(n)
    sig = np.zeros(n)
    for note in notes:
        for det in (-0.12, 0, 0.12):
            sig += osc(midi(note) * 2 ** (det / 12), n, 'saw', 5000, bright=0.02)
    cut = 180 + 2600 * np.exp(-t / 0.5) * np.minimum(1, t / 0.04)
    sig = lowpass(sig, cut)
    sig = np.tanh(sig * 0.9) * env(n, 0.02, 2.5, gate=length, release=0.5)
    add(music, beat, sig, gain=vol, send=0.4)
    add(music, beat, sweep(70, 30, n, 0.6) * env(n, 0.005, 0.8), gain=vol * 0.9)


def pad(beat, notes, length, vol=0.05, cutoff=1400):
    n = int(SR * (length + 0.4))
    t = tt(n)
    sig = np.zeros(n)
    for note in notes:
        for det in (-0.1, 0.1):
            sig += osc(midi(note) * 2 ** (det / 12), n, 'saw', cutoff, bright=0.12)
    sig *= np.minimum(1, t / 0.35) * np.clip(1 - (t - length) / 0.4, 0, 1)
    add(music, beat, sig, gain=vol, send=0.35)


def stab(beat, notes, length, vol=0.03, spread=0.7):
    n = int(SR * (length + 0.2))
    t = tt(n)
    gate = np.clip(1 - (t - length) / 0.2, 0, 1) * np.minimum(1, t / 0.004) * np.exp(-t / 0.5)
    for note in notes:
        for v, det in enumerate((-0.18, -0.08, 0, 0.08, 0.18)):
            sig = osc(midi(note) * 2 ** (det / 12), n, 'saw', 7000, bright=0.04) * gate
            add(music, beat, sig, pan=(v - 2) / 2 * spread, gain=vol, send=0.15)


def lead(beat, note, length, vel=1.0):
    n = int(SR * (length + 0.05))
    t = tt(n)
    f = midi(note) * (1 + 0.005 * np.sin(2 * np.pi * 5.8 * t) * np.minimum(1, t / 0.2))
    ph = 2 * np.pi * np.cumsum(f) / SR
    sig = np.zeros(n)
    for k in range(1, int(6500 // midi(note)) + 1):
        sig += (1 / k) * np.exp(-(k - 1) * (0.05 + t * 0.5)) * np.sin(k * ph)
    sig = np.tanh(sig * 1.6) * env(n, 0.005, 0.7, gate=length, release=0.04)
    add(music, beat, sig, gain=0.085 * vel, send=0.3, pan=0.1)
    add(music, beat + 0.75, sig, gain=0.03 * vel, pan=-0.6)   # dotted-8th echo


def pluck(beat, note, vol=0.12, pan=0.0, decay=0.09):
    n = int(SR * 0.4)
    f = midi(note)
    sig = osc(f, n, 'square', 6000, bright=0.15) * env(n, 0.001, decay)
    add(music, beat, sig, pan=pan, gain=vol, send=0.15)


# ─── SFX ─────────────────────────────────────────────────
def boom(beat, vol=0.6, length=1.6):
    n = int(SR * length)
    rumble = band(n, 30, 600) * env(n, 0.002, length / 4)
    crackle = band(n, 1500, 9000) * env(n, 0.001, 0.07) * 0.6
    sub = sweep(120, 28, n, length / 3) * env(n, 0.003, length / 3)
    add(sfx, beat, np.tanh((rumble + crackle + sub * 1.5) * 1.3), gain=vol, send=0.3)


def thump(beat, vol=0.3, pan=0.0):
    n = int(SR * 0.3)
    sig = sweep(320, 70, n, 0.03) * env(n, 0.001, 0.07) + band(n, 400, 3000) * env(n, 0.001, 0.03) * 0.4
    add(sfx, beat, np.tanh(sig * 2), pan=pan, gain=vol)


def gun(beat, vol=0.16, pan=0.0):
    n = int(SR * 0.12)
    sig = band(n, 900, 9000) * env(n, 0.0005, 0.018) + sweep(900, 120, n, 0.012) * env(n, 0.0005, 0.03) * 0.8
    add(sfx, beat, np.tanh(sig * 2.5), pan=pan, gain=vol)


def blip(beat, vol=0.06, note=88, pan=0.0):
    n = int(SR * 0.08)
    add(sfx, beat, np.sin(2 * np.pi * midi(note) * tt(n)) * env(n, 0.001, 0.025), pan=pan, gain=vol)


def tick(beat, vol=0.05):
    n = int(SR * 0.02)
    add(sfx, beat, band(n, 3000, 12000) * env(n, 0.0005, 0.004), gain=vol, pan=rng.uniform(-.2, .2))


def glass(beat, vol=0.1, pitch=1.0, pan=0.0):
    n = int(SR * 0.5)
    t = tt(n)
    sig = np.zeros(n)
    for k, (fr, d) in enumerate(((2400, 0.12), (3710, 0.08), (5230, 0.05), (6900, 0.03))):
        sig += np.sin(2 * np.pi * fr * pitch * t + k) * np.exp(-t / d)
    sig += band(n, 4000, 14000) * env(n, 0.0005, 0.012) * 0.8
    add(sfx, beat, sig * np.minimum(1, t / 0.0005), pan=pan, gain=vol, send=0.35)


def shimmer(beat, length, vol=0.08):
    n = int(SR * length * SPB)
    t = tt(n)
    sig = np.zeros(n)
    for k in range(8):
        f = midi(86 + [0, 3, 7, 10, 12, 15, 19, 22][k])
        sig += np.sin(2 * np.pi * f * t + k) * (0.5 + 0.5 * np.sin(2 * np.pi * (3 + k) * t))
    sig *= env(n, 0.01, length * SPB / 2)
    add(sfx, beat, sig / 4, gain=vol, send=0.6)


def whoosh(beat, vol=0.16, length=0.6):
    n = int(SR * length)
    t = np.linspace(0, 1, n)
    shape = np.sin(np.pi * t) ** 2
    sig = lowpass(band(n, 200, 9000), 400 + 6000 * shape)
    add(sfx, beat, sig * shape * 3, gain=vol, pan=0, send=0.2)


def riser(beat, length, vol=0.14):
    n = int(SR * length * SPB)
    t = np.linspace(0, 1, n)
    f = 110 * 2 ** (t * 4)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.5 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)
    noise = lowpass(band(n, 200, 14000), 300 + 9000 * t ** 2)
    add(sfx, beat, (tone * 0.35 + noise * 2.2) * t ** 2.2, gain=vol, send=0.3)


def siren(beat, length, vol=0.05):
    n = int(SR * length * SPB)
    t = tt(n)
    f = 620 + 240 * np.sin(2 * np.pi * t / (SPB * 2) - np.pi / 2)
    sig = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5
    sig = lowpass(sig, 3000)
    sig *= np.minimum(1, t / 0.02) * np.clip((length * SPB - t) / 0.06, 0, 1)
    add(sfx, beat, sig, gain=vol, send=0.25)


def growl(beat, length, vol=0.22):
    n = int(SR * length * SPB)
    t = np.linspace(0, 1, n)
    sig = sum(osc(midi(31) * 2 ** (d / 12), n, 'saw', 1400, bright=0.15) for d in (-0.4, 0, 0.4, 0.7))
    sig *= 1 + 0.6 * np.sin(2 * np.pi * 9 * tt(n))
    sig = np.tanh(sig * (0.6 + t * 1.6)) * np.sin(np.pi * np.clip(t * 1.1, 0, 1)) ** 0.5
    add(sfx, beat, sig, gain=vol, send=0.2)


def engine(beat, length, vol=0.12):
    n = int(SR * length * SPB)
    t = np.linspace(0, 1, n)
    shape = np.sin(np.pi * t) ** 1.5
    sig = lowpass(band(n, 60, 3000), 300 + 2500 * shape) * 2
    sig += osc(55 * (1 + 0.3 * shape.mean()), n, 'saw', 900, bright=0.2) * 0.4
    add(sfx, beat, sig * shape, gain=vol, send=0.2)


def chime(beat, notes, vol=0.08):
    for i, note in enumerate(notes):
        n = int(SR * 1.0)
        t = tt(n)
        f = midi(note)
        sig = (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.15)) * env(n, 0.001, 0.4)
        add(sfx, beat + i * 0.125, sig, gain=vol, pan=-0.4 + 0.25 * i, send=0.4)


# ─── Extra voices for this film ──────────────────────────
def gong(beat, vol=0.5):
    n = int(SR * 5)
    t = tt(n)
    sig = np.zeros(n)
    for ratio, amp, dec in ((1, 1, 3.2), (1.49, .6, 2.4), (2.03, .45, 1.8), (2.71, .3, 1.3), (3.6, .2, .9), (4.4, .12, .6)):
        f = 92 * ratio * (1 + 0.012 * np.exp(-t / 0.4))
        sig += amp * np.sin(2 * np.pi * np.cumsum(f) / SR + ratio) * np.exp(-t / dec) * (1 + 0.25 * np.sin(2 * np.pi * (1.3 + ratio) * t))
    sig += band(n, 300, 6000) * env(n, 0.001, 0.06) * 0.6
    sig *= np.minimum(1, t / 0.004)
    add(music, beat, np.tanh(sig * 0.8), gain=vol, send=0.6)


def flip(beat, vol=0.22, pan=0.0):
    """Mechanical split-flap clack: two quick clicks and a short metal ring."""
    for k, d in enumerate((0, 0.035)):
        n = int(SR * 0.08)
        click = band(n, 1800, 9000) * env(n, 0.0005, 0.012)
        ring = np.sin(2 * np.pi * (1650 - 300 * k) * tt(n)) * env(n, 0.001, 0.03) * 0.3
        add(sfx, beat + d / SPB, click + ring, pan=pan, gain=vol * (1 - 0.35 * k), send=0.15)
    thump(beat, 0.12, pan)


def roll(b0, b1, vol=0.5):
    """Snare roll that tightens from 8ths to 32nds."""
    b = b0
    while b < b1:
        k = (b - b0) / (b1 - b0)
        snare(b, vol * (0.35 + 0.65 * k), send=0.2)
        b += 0.5 * (1 - k) + 0.125 * k


def ostinato(b0, b1, root=38, vol=0.26):
    pat = [0, 0, 12, 0, 0, 10, 0, 7]
    b = b0
    i = 0
    while b < b1 - 1e-6:
        bass(b, root + pat[i % 8], 0.2, vol=vol * (1.15 if i % 4 == 0 else 1), bright=0.25)
        b += 0.5
        i += 1


# D minor pentatonic phrase helpers (D F G A C)
def phrase(b0, notes, vel=1.0):
    for off, note, length in notes:
        lead(b0 + off, note, length * SPB, vel)


# ─── Arrangement ─────────────────────────────────────────
Dm = [38, 45, 50, 53, 57]

# 0–8 cold open: drone, heartbeat taiko, shimmer on the captions
boom(0, 0.75, 3.2)
pad(0, [26, 38, 45], 14 * SPB, vol=0.05, cutoff=700)
for b in (2, 4, 6, 7, 7.5):
    taiko(b, 0.55 if b < 6 else 0.75, 0.8)
chime(1, [74, 81], 0.05)
chime(4, [72, 79], 0.05)
riser(6, 2, 0.12)
reverse_crash(6, 2)

# 8–14 split-flap reveal
for i in range(8):
    tick(8 + i * 0.5, 0.05)
for e in EV:
    if e['type'] == 'flip':
        flip(e['beat'], pan=-0.45 + e['i'] * 0.3)
braam(12, [38, 45, 50], 2.0, 0.5)
boom(12, 0.45, 2.0)
crash(12, 0.12)
whoosh(13.4, 0.2, 0.7)

# 14–24 lineup: taiko groove, spotlight hits, ostinato from 16
for b in range(14, 24):
    taiko(b, 0.85, 1.0, pan=0)
    if b >= 16:
        tom(b + 0.5, 0.35, 1.3, pan=0.3)
        tom(b + 0.75, 0.25, 1.5, pan=-0.3)
for e in EV:
    if e['type'] == 'spot':
        thump(e['beat'], 0.28)
        stab(e['beat'], [62 + [0, 3, 5, 7, 10, 12, 15][e['i']]], 0.2, vol=0.018)
ostinato(16, 24)
pad(16, [50, 57, 62], 8 * SPB, vol=0.03)
braam(20, [38, 45, 53], 2.5, 0.45)
crash(20, 0.14)
for k in range(8):
    tom(23 + k * 0.125, 0.3 + k * 0.06, 0.9 + k * 0.08)

# 24–34 battle: full groove, lead melody, impacts
for b in range(24, 34):
    taiko(b, 0.95)
    if b % 2:
        snare(b, 0.8)
    hat(b + 0.5, 0.05)
ostinato(24, 34)
pad(24, [50, 53, 57], 6 * SPB, vol=0.035)
pad(30, [48, 53, 57], 4 * SPB, vol=0.035)
phrase(24, [(0, 62, 1.5), (1.5, 65, 0.5), (2, 67, 1), (3, 69, 1), (4, 72, 1.5), (5.5, 69, 0.5), (6, 67, 2)])
whoosh(25.6, 0.22, 0.9)
engine_len = 3
boom(26, 0.3, 2.0)
riser(27, 2, 0.1)
boom(29, 0.85, 2.4)
crash(29, 0.2)
braam(29, [38, 50], 1.0, 0.35)
gun(32, 0.3)
boom(32, 0.35, 0.8)
whoosh(32.2, 0.15, 0.6)
boom(33, 0.6, 1.6)
crash(33, 0.12)

# 34–42 difficulty bars: rising stacked swells
for b in range(34, 42):
    taiko(b, 0.85)
    if b % 2:
        snare(b, 0.6)
ostinato(34, 42, root=38)
for e in EV:
    if e['type'] == 'bar':
        braam(e['beat'], [[38, 50], [41, 53], [45, 57]][e['i']], 1.2, 0.28)
        thump(e['beat'], 0.25)
crash(38, 0.14)
phrase(38, [(0, 74, 1), (1, 72, 1), (2, 69, 1.5), (3.5, 67, 0.5)])

# 42–50 teach: half-time, guzheng-like plucks
for b in range(42, 50, 2):
    taiko(b, 0.8)
    snare(b + 1, 0.45)
pent = [62, 65, 67, 69, 72, 74, 77, 79]
for i in range(32):
    b = 42 + i * 0.25
    pluck(b, pent[(i * 3) % 8 if i % 8 < 4 else (8 - i % 8) * 2 % 8], vol=0.1, pan=np.sin(i) * 0.5, decay=0.18)
pad(42, [50, 57, 60, 65], 8 * SPB, vol=0.03)
for e in EV:
    if e['type'] == 'hop':
        blip(e['beat'], 0.06, 86)
        thump(e['beat'] + 0.5, 0.2)
crash(46, 0.12)
phrase(46, [(0, 69, 1), (1, 67, 0.5), (1.5, 65, 0.5), (2, 62, 2)], 0.8)

# 50–54 check: roll, gap, checkmate hit
roll(50, 51.5, 0.55)
riser(50, 1.5, 0.15)
reverse_crash(50.5, 1.0)
boom(52, 1.0, 3.0)
braam(52, [26, 38, 45], 2.0, 0.55)
crash(52, 0.22)
taiko(52, 1.2, 0.7)

# 54–60 logo
gong(54, 0.55)
taiko(54, 1.1, 0.8)
pad(54, [38, 50, 57, 62, 65], 7 * SPB, vol=0.05, cutoff=1800)
phrase(55, [(0, 69, 1), (1, 72, 1), (2, 74, 3)], 0.9)
taiko(56, 0.6, 0.9)
taiko(58, 0.5, 0.9)
chime(55, [86, 93], 0.05)

# Sidechain: kicks duck the music bus.
duck = np.ones(LEN)
for b, vel in kicks:
    s = S(b)
    n = int(SR * SPB * 0.75)
    if s >= LEN:
        continue
    seg = 1 - 0.55 * min(vel, 1.2) * np.exp(-tt(min(n, LEN - s)) / 0.09)
    duck[s:s + len(seg)] = np.minimum(duck[s:s + len(seg)], seg)
music *= duck

# Gap before the drop: a half-beat of silence on the music bus.
g0, g1 = S(51.5), S(52)
music[:, g0:g1] = 0
drums[:, g0:g1] = 0

# Reverb: a few comb + allpass stages on the mono send.
def reverb(x):
    out = np.zeros_like(x)
    for d, g in ((1557, .84), (1617, .83), (1491, .83), (1422, .82), (1277, .81), (1356, .82)):
        d = int(d * SR / 44100)
        y = np.zeros_like(x)
        for i in range(0, len(x), d):
            seg = x[i:i + d]
            prev = y[i - d:i - d + len(seg)] if i >= d else np.zeros(len(seg))
            y[i:i + len(seg)] = seg + g * prev
        out += y
    return lowpass(out / 6, 5000) * 0.5


wet = reverb(verb)
mix = drums + music + sfx
mix[0] += wet
mix[1] += np.roll(wet, int(SR * 0.013))

# Gentle master: high-pass rumble guard, glue, limiter.
mix -= np.stack([lowpass(mix[0], 22), lowpass(mix[1], 22)])
print('pre-master peak', np.abs(mix).max().round(2), 'p99.9', np.percentile(np.abs(mix), 99.9).round(2))
mix /= np.percentile(np.abs(mix), 99.95) / 0.85
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
fade = np.ones(LEN)
f0 = S(SCORE['beats'] - 3.5)
fade[f0:] = np.clip(1 - np.arange(LEN - f0) / (N - f0), 0, 1) ** 1.6
mix *= fade
mix = mix[:, :N]
mix /= np.max(np.abs(mix)) / 0.93

out = HERE / 'out'
out.mkdir(exist_ok=True)
pcm = (mix.T * 32767).astype('<i2')
with wave.open(str(out / 'soundtrack.wav'), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote', out / 'soundtrack.wav', round(N / SR, 2), 's')
