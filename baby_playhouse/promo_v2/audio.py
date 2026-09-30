"""Beat-locked soundtrack for the 寶貝遊樂場 茜の篇 promo, KIRAKIRA edition.

Every sound is placed by beat number from score.json, the same file the
renderer reads. sample(beat) = round(beat * 60 / bpm * sampleRate), so audio
and picture share one clock and cannot drift.

Warm and cute at 128 BPM in F major: ukulele strums (Karplus-Strong), a music-box
glockenspiel lead, oom-pah bass, soft four-on-the-floor kick, claps and shaker,
plus cartoon SFX (pop, boing, slide whistle, squeak, ding) placed on the events.
Two bars per scene, 64 beats = 30 s; chords per bar are in score.json.

    python3 audio.py            → out/soundtrack.wav
"""
import json
import wave
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
SCORE = json.loads((HERE / 'score.json').read_text())
SR = SCORE['sampleRate']
SPB = 60 / SCORE['bpm']
BEATS = SCORE['beats']
N = int(round(BEATS * SPB * SR))
LEN = N + SR * 2
rng = np.random.default_rng(128)
EV = SCORE['events']


def S(beat):
    """Beat number → sample index. The only time conversion in this file."""
    return int(round(beat * SPB * SR))


def secs(beats):
    return beats * SPB


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def t_(dur):
    return np.arange(int(dur * SR)) / SR


# ─── Buses ────────────────────────────────────────────────
drums = np.zeros((2, LEN))
music = np.zeros((2, LEN))  # ducked by the kick
sfx = np.zeros((2, LEN))
verb = np.zeros(LEN)  # mono reverb send
kicks = []


def add(bus, beat, sig, pan=0.0, gain=1.0, send=0.0, offset=0):
    start = S(beat) + offset
    if start >= LEN or start < 0:
        return
    sig = sig[: LEN - start] * gain
    end = start + len(sig)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    bus[0, start:end] += sig * l * 1.414
    bus[1, start:end] += sig * r * 1.414
    if send:
        verb[start:end] += sig * send


def env(n, a=0.002, d=0.3, curve=1.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d) ** curve
    return e


def onepole_fft(x, fc, kind='low'):
    """Zero-phase one-pole-ish filter in the frequency domain (fast for long noise)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    h = 1 / np.sqrt(1 + (f / fc) ** 2)
    if kind == 'high':
        h = np.sqrt(1 - h ** 2)
    return np.fft.irfft(X * h, len(x))


def band(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    h = 1 / np.sqrt(1 + (f / hi) ** 4) * (1 - 1 / np.sqrt(1 + (f / lo) ** 4))
    return np.fft.irfft(X * h, len(x))


# ─── Instruments ──────────────────────────────────────────
def kick(gain=1.0):
    t = t_(0.32)
    f = 48 + 110 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    click = np.exp(-t * 400) * 0.3
    return (np.sin(ph) * np.exp(-t * 11) + click * np.sin(2 * np.pi * 1200 * t)) * gain


def clap():
    n = int(0.22 * SR)
    noise = band(rng.standard_normal(n), 900, 3500)
    t = np.arange(n) / SR
    e = np.zeros(n)
    for k, off in enumerate((0, 0.009, 0.018)):
        tt = np.clip(t - off, 0, None)
        e += (t >= off) * np.exp(-tt * (140 if k < 2 else 22))
    return noise * e * 0.9


def hat(dec=0.035, gain=1.0):
    n = int(0.12 * SR)
    noise = onepole_fft(rng.standard_normal(n), 7000, 'high')
    return noise * env(n, 0.0005, dec) * gain


def crash():
    n = int(1.6 * SR)
    noise = onepole_fft(rng.standard_normal(n), 5000, 'high')
    return noise * env(n, 0.001, 0.55) * 0.5


def ks_pluck(freq, dur, bright=0.6, decay=0.996):
    """Karplus-Strong string, vectorised one period at a time."""
    n = int(dur * SR)
    P = max(2, int(round(SR / freq)))
    y = np.zeros(n + P + 1)
    burst = rng.uniform(-1, 1, P)
    burst = bright * burst + (1 - bright) * np.convolve(burst, [0.5, 0.5], 'same')
    y[1:P + 1] = burst
    i = P + 1
    while i < len(y):
        j = min(i + P, len(y))
        y[i:j] = decay * 0.5 * (y[i - P:j - P] + y[i - P - 1:j - P - 1])
        i = j
    out = y[P + 1:P + 1 + n]
    fade = min(len(out), int(0.01 * SR))
    out[-fade:] *= np.linspace(1, 0, fade)
    return out


def uke(notes, dur, down=True, gain=1.0):
    """Strum: 11 ms between strings, low→high on a down-strum."""
    order = notes if down else notes[::-1]
    n = int((dur + 0.08) * SR)
    out = np.zeros(n)
    for k, m in enumerate(order):
        s = ks_pluck(midi(m), dur, bright=0.55, decay=0.9975) * (0.85 if k else 1.0)
        o = int(k * 0.011 * SR)
        out[o:o + len(s)] += s[: n - o]
    # gentle body resonance / tame the fizz
    out = onepole_fft(out, 3800)
    return out * gain


def glock(m, dur, gain=1.0):
    f = midi(m)
    t = t_(dur + 0.9)
    tone = (np.sin(2 * np.pi * f * t) * np.exp(-t * 3.2)
            + 0.35 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 6)
            + 0.22 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 9)
            + 0.08 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 18))
    a = np.minimum(1, t / 0.002)
    return tone * a * gain


def bass(m, dur, gain=1.0):
    f = midi(m)
    t = t_(dur)
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) + 0.1 * np.sin(2 * np.pi * 3 * f * t)
    e = np.minimum(1, t / 0.004) * np.exp(-t * 4.5)
    rel = min(len(t), int(0.02 * SR))
    e[-rel:] *= np.linspace(1, 0, rel)
    return s * e * gain


def pad(notes, dur, gain=1.0):
    t = t_(dur)
    s = np.zeros(len(t))
    for k, m in enumerate(notes):
        f = midi(m)
        for det in (-0.12, 0.12):
            ff = f * 2 ** (det / 12)
            s += np.sin(2 * np.pi * ff * t + k) + 0.25 * np.sin(4 * np.pi * ff * t)
    e = np.minimum(1, t / 0.25) * np.minimum(1, (dur - t) / 0.3)
    return s * e * gain / len(notes)


# ─── SFX ──────────────────────────────────────────────────
def glide(f0, f1, dur, shape='exp', vib=0.0, vibf=0.0, wave_='sine'):
    t = t_(dur)
    k = t / dur
    f = f0 * (f1 / f0) ** k if shape == 'exp' else f0 + (f1 - f0) * k
    if vib:
        f = f * (1 + vib * np.sin(2 * np.pi * vibf * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    if wave_ == 'tri':
        return 2 / np.pi * np.arcsin(np.sin(ph))
    return np.sin(ph)


def pop(pitch=1.0):
    d = 0.09
    s = glide(420 * pitch, 1500 * pitch, d)
    return s * env(len(s), 0.001, 0.035)


def boing():
    d = 0.42
    s = glide(170, 520, d, vib=0.18, vibf=17, wave_='tri')
    return s * env(len(s), 0.003, 0.2) * 0.8


def slide_whistle():
    d = secs(0.8)
    t = t_(d)
    f = 1500 * (430 / 1500) ** (t / d) * (1 + 0.012 * np.sin(2 * np.pi * 6 * t))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.1 * rng.standard_normal(len(t)) * 0.2
    e = np.minimum(1, t / 0.03) * np.minimum(1, (d - t) / 0.06)
    return s * e * 0.5


def squeak():
    d = 0.16
    t = t_(d)
    f = 1350 + 700 * np.sin(np.pi * t / d)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return s * np.sin(np.pi * t / d) * 0.45


def whoosh(beats=0.5):
    d = secs(beats) + 0.1
    n = int(d * SR)
    noise = rng.standard_normal(n)
    t = np.arange(n) / SR
    # sweep a band upward by crossfading two fixed bands
    lo = band(noise, 300, 1200)
    hi = band(noise, 1500, 6000)
    k = t / d
    e = np.sin(np.pi * k) ** 1.5
    return (lo * (1 - k) + hi * k) * e * 0.55


def splash():
    n = int(0.5 * SR)
    noise = band(rng.standard_normal(n), 400, 5000)
    bl = sum(np.sin(2 * np.pi * f * np.arange(n) / SR) * np.exp(-np.arange(n) / SR * 30) for f in (620, 880, 1170))
    return noise * env(n, 0.002, 0.12) * 0.6 + bl * 0.08


def voice_hi(f0):
    """Tiny 'hi!' chirp: a gliding tone with a formant-ish buzz."""
    d = 0.2
    t = t_(d)
    f = f0 * (1 + 0.5 * np.sin(np.pi * t / d * 0.9))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph)
    return s * np.sin(np.pi * t / d) ** 0.7 * 0.35


# ─── Harmony ──────────────────────────────────────────────
UKE = {
    'F': [60, 65, 69, 72],
    'Am': [60, 64, 69, 72],
    'Dm': [62, 65, 69, 74],
    'Bb': [62, 65, 70, 74],
    'C': [60, 64, 67, 72],
}
ROOT = {'F': 41, 'Am': 45, 'Dm': 50, 'Bb': 46, 'C': 48}
PAD = {'F': [57, 60, 65], 'Am': [57, 60, 64], 'Dm': [57, 62, 65], 'Bb': [58, 62, 65], 'C': [55, 60, 64]}

# (beat, midi, length in beats). Two bars per scene, phrases answer each other.
MELODY = [
    # intro: a chime when 茜 lands, then the title letters climb, the ribbon rings high
    (1, 77, .5), (1.5, 81, .5), (2, 84, 1),
    (3, 72, .5), (3.5, 74, .5), (4, 77, .5), (4.5, 79, .5), (5, 81, 1), (6, 84, 1), (7, 82, .5), (7.5, 79, .5),
    # lawn (F | C) — the second bar tumbles down with the slide
    (8, 72, .5), (8.5, 69, .5), (9, 72, .5), (9.5, 77, 1), (10.5, 76, .5), (11, 77, .5), (11.5, 79, .5),
    (12, 79, 1), (13, 84, .5), (13.5, 82, .25), (13.75, 81, .25), (14, 79, .5), (14.5, 76, .5), (15, 72, 1),
    # living room (Am | Dm)
    (16, 81, 1), (17, 79, .5), (17.5, 76, .5), (18, 72, 1), (19, 76, .5), (19.5, 79, .5),
    (20, 77, 1), (21, 74, .5), (21.5, 77, .5), (22, 81, 1.5), (23.5, 79, .5),
    # cafe (Bb | C)
    (24, 77, .5), (24.5, 74, .5), (25, 70, .5), (25.5, 74, .5), (26, 77, 1), (27, 79, .5), (27.5, 81, .5),
    (28, 79, 1.5), (29.5, 76, .5), (30, 72, .5), (30.5, 74, .5), (31, 76, 1),
    # bathroom (F | Am) — higher and bubblier
    (32, 84, .5), (32.5, 81, .5), (33, 77, .5), (33.5, 81, .5), (34, 84, 1), (35, 86, .5), (35.5, 84, .5),
    (36, 81, 1), (37, 76, .5), (37.5, 79, .5), (38, 81, 1.5), (39.5, 84, .5),
    # friends — one two-note call per friend
    (40, 77, 1), (41, 81, 1), (42, 76, 1), (43, 81, 1), (44, 77, 1), (45, 82, 1), (46, 79, 1), (47, 84, 1),
    # together (Bb | C)
    (48, 86, .5), (48.5, 84, .5), (49, 82, .5), (49.5, 81, .5), (50, 82, .5), (50.5, 84, .5), (51, 86, 1),
    (52, 84, .5), (52.5, 82, .5), (53, 81, .5), (53.5, 79, .5), (54, 79, .5), (54.5, 81, .5), (55, 82, .5), (55.5, 84, .5),
    # logo
    (56, 89, 2), (58, 84, .5), (58.5, 86, .5), (59, 89, 1),
    (60, 84, .5), (60.5, 81, .5), (61, 84, .5), (61.5, 86, .5), (62, 89, 2),
]


def chord_at(beat):
    bar = SCORE['bars'][min(int(beat // 4), len(SCORE['bars']) - 1)]
    return bar['chords'][int(beat % 4)]


def shot(name):
    return next(s for s in SCORE['shots'] if s['name'] == name)


# ─── Arrangement ──────────────────────────────────────────
def build():
    groove = shot('lawn')['beat']        # full band from here
    logo = shot('end')['beat']           # final section
    last = BEATS - 2                     # final chord rings for two beats

    # Intro (2 bars): strum + pad, soft kicks, building into the band.
    add(music, 0, uke(UKE['F'], secs(2)), gain=0.9, send=0.3)
    add(music, 0, pad(PAD['F'], secs(4)), gain=0.18)
    add(music, 4, pad(PAD['Bb'], secs(2)), gain=0.16)
    add(music, 6, pad(PAD['C'], secs(2)), gain=0.16)
    for b in (0, 2, 4, 5, 6, 7):
        add(drums, b, kick(0.7))
        kicks.append(b)
    for b in (4, 4.5, 5, 5.5, 6, 6.5):
        c = chord_at(b)
        add(music, b, uke(UKE[c], secs(0.45), b % 1 == 0), gain=0.45 if b % 1 == 0 else 0.28, pan=-0.25, send=0.2)
    for b in np.arange(0, 7, 0.5):
        add(drums, b + 0.5, hat(0.03, 0.22), pan=0.3)
    for i in range(8):
        add(drums, 7 + i * 0.125, clap(), gain=0.15 + 0.45 * i / 7, pan=0.1)

    # Main groove.
    for beat in range(groove, BEATS):
        c = chord_at(beat)
        tail = beat >= last
        light = beat >= logo
        if not tail:
            add(drums, beat, kick(0.6 if light else 0.75))
            kicks.append(beat)
            if beat % 2 == 1:
                add(drums, beat, clap(), gain=0.55, pan=-0.05, send=0.15)
            for k in range(4):
                g = 0.28 if k == 2 else 0.14
                add(drums, beat + k * 0.25, hat(0.025 if k != 2 else 0.05, g), pan=0.35 if k % 2 else -0.25)
            add(music, beat, uke(UKE[c], secs(0.45), True), gain=0.55, pan=-0.25, send=0.2)
            add(music, beat + 0.5, uke(UKE[c][1:], secs(0.4), False), gain=0.32, pan=-0.25, send=0.2)
            add(music, beat, bass(ROOT[c], secs(0.45)), gain=0.55)
            add(music, beat + 0.5, bass(ROOT[c] + 12, secs(0.3)), gain=0.32)
        # pad: one per chord change
        if beat == groove or chord_at(beat - 1) != c or beat % 4 == 0:
            length = 1
            while beat + length < BEATS and chord_at(beat + length) == c and (beat + length) % 4:
                length += 1
            if not tail:
                add(music, beat, pad(PAD[c], secs(length)), gain=0.14)

    # Builds into the next scene: a short clap roll before the friends and before the logo.
    for start in (shot('friends')['beat'] - 1, logo - 2):
        n = 8 if start == logo - 2 else 4
        for i in range(n):
            b = start + i * (0.25 if n == 8 else 0.25)
            add(drums, b + 0.125, clap(), gain=0.15 + 0.3 * i / n, pan=0.15)
    add(sfx, logo - 1, whoosh(1.0), gain=0.5)

    # Logo hit and ending.
    add(drums, logo, crash(), gain=0.7, send=0.3)
    add(music, logo, uke(UKE['F'] + [77], secs(2)), gain=0.8, send=0.35)
    add(music, last, uke(UKE['F'] + [77], secs(2)), gain=0.85, send=0.45)
    add(music, last, bass(ROOT['F'], secs(2)), gain=0.6)
    add(music, last, pad(PAD['F'], secs(2)), gain=0.16)
    add(drums, last, kick(0.8))
    add(drums, last, crash(), gain=0.4, send=0.35)

    # Lead.
    for b, m, l in MELODY:
        add(music, b, glock(m + 12 if b < 3 else m, secs(l)), gain=0.32, pan=0.2, send=0.45)
        if b >= groove:
            add(music, b, glock(m - 12, secs(l)), gain=0.08, pan=-0.2, send=0.2)

    # Event SFX.
    voices = {'capybara': 200, 'panda': 330, 'bunny': 620, 'cat': 470, 'akane': 560}
    for e in EV:
        b, ty = e['beat'], e['type']
        if ty == 'letter':
            add(sfx, b, pop(1 + e['index'] * 0.12), gain=0.5, pan=-0.4 + e['index'] * 0.2, send=0.1)
        elif ty in ('badge', 'ding'):
            for k, m in enumerate((96, 100, 103)):
                add(sfx, b + k * 0.0625, glock(m, secs(0.5)), gain=0.18, send=0.4, pan=0.3)
        elif ty == 'boing':
            add(sfx, b, boing(), gain=0.45, send=0.1, pan=0.1)
        elif ty == 'slide':
            add(sfx, b, slide_whistle(), gain=0.45, send=0.2, pan=-0.2)
        elif ty == 'squeak':
            add(sfx, b, squeak(), gain=0.5, pan=0.2)
        elif ty == 'splash':
            add(sfx, b, splash(), gain=0.55, send=0.2)
        elif ty == 'pop':
            add(sfx, b, pop(1.3), gain=0.45, send=0.1)
        elif ty == 'wipe':
            add(sfx, b, whoosh(0.5), gain=0.5)
        elif ty == 'friend':
            add(sfx, b + 0.5, voice_hi(voices[e['who']] * 1.5), gain=0.6, send=0.15)
            add(sfx, b + 0.5, pop(0.8), gain=0.3)
        elif ty in ('sparkle', 'cheer', 'burst'):
            base = 84 if ty != 'cheer' else 79
            for k, m in enumerate([0, 4, 7, 12, 16, 19, 24]):
                add(sfx, b + k * 0.0625, glock(base + m, secs(0.25)), gain=0.13, send=0.5, pan=-0.5 + k / 6)
        elif ty == 'caption':
            add(sfx, b + 0.1, pop(1.1), gain=0.3)
            for k, ch in enumerate(e['sub']):
                if ch != ' ':
                    add(sfx, e['subAt'] + k * 0.125, pop(1.2 + k * 0.05), gain=0.12)
        elif ty == 'hi':
            add(sfx, b, voice_hi(voices[e['who']] * 1.4), gain=0.5)
        elif ty == 'stamp':
            for k in range(len(e['text'])):
                add(sfx, b + k * 0.25, pop(0.9 + k * 0.1), gain=0.35)
        elif ty == 'pow':
            add(sfx, b, pop(1.6), gain=0.45, send=0.1)
            for k, m in enumerate((91, 96)):
                add(sfx, b + 0.0625 + k * 0.0625, glock(m, secs(0.3)), gain=0.12, send=0.4, pan=0.4)
        elif ty == 'cta':
            add(sfx, b, pop(1.4), gain=0.5)
            for k, m in enumerate((89, 93, 96)):
                add(sfx, b + k * 0.0625, glock(m, secs(0.5)), gain=0.16, send=0.4)


def tunnel_chimes():
    """A soft sparkle each time a rainbow gate passes the camera (tunnel shots)."""
    PENTA = [84, 86, 89, 91, 93, 96]
    for s_ in SCORE['shots']:
        if s_['name'] not in ('intro', 'end'):
            continue
        step = 1 if s_['name'] == 'intro' else 0.5
        b = s_['beat'] + (0.5 if s_['name'] == 'intro' else 0)
        i = 0
        while b < min(s_['beat'] + s_['len'], BEATS - 2):
            add(sfx, b, glock(PENTA[i % len(PENTA)] + 12, secs(0.25)), gain=0.06, send=0.5, pan=(-0.6, 0.6)[i % 2])
            b += step
            i += 1


def reverb(x):
    n = int(1.4 * SR)
    t = np.arange(n) / SR
    ir_l = rng.standard_normal(n) * np.exp(-t * 4.2)
    ir_r = rng.standard_normal(n) * np.exp(-t * 4.2)
    ir_l[: int(0.012 * SR)] = 0
    ir_r[: int(0.017 * SR)] = 0
    size = 1 << int(np.ceil(np.log2(len(x) + n)))
    X = np.fft.rfft(x, size)
    out = np.stack([np.fft.irfft(X * np.fft.rfft(ir, size), size)[: len(x)] for ir in (ir_l, ir_r)])
    out = np.stack([onepole_fft(ch, 5000) for ch in out])
    return out / np.max(np.abs(out) + 1e-9) * np.max(np.abs(x) + 1e-9) * 0.5


def duck_env():
    e = np.ones(LEN)
    d = int(secs(0.45) * SR)
    curve = 1 - 0.35 * np.exp(-np.arange(d) / SR * 9)
    for b in kicks:
        s = S(b)
        seg = e[s:s + d]
        e[s:s + d] = np.minimum(seg, curve[: len(seg)])
    return e


def main():
    build()
    tunnel_chimes()
    wet = reverb(verb)
    mix = drums * 0.9 + music * duck_env() * 0.85 + sfx * 0.8 + wet * 0.5
    mix = mix[:, :N]
    mix = np.tanh(mix * 0.9) / np.tanh(0.9)
    mix /= np.max(np.abs(mix)) / 0.5
    fade = int(0.04 * SR)
    mix[:, -fade:] *= np.linspace(1, 0, fade)
    out = HERE / 'out' / 'soundtrack.wav'
    out.parent.mkdir(exist_ok=True)
    pcm = (mix.T * 32767).astype('<i2')
    with wave.open(str(out), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'wrote {out}  {N / SR:.3f}s  {N} samples')


if __name__ == '__main__':
    main()
