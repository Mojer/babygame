"use strict";

/* =========================================================
 * 程式合成配樂（WebAudio）
 * 不放音檔：旋律、和弦、貝斯、鼓組都即時算出來，
 * 所以零下載量、無授權問題，而且長度無限（不會聽到接縫）。
 *
 * 曲子結構：I–V–vi–IV 四小節和弦進行，旋律從當下和弦的音 +
 * 五聲音階裡挑，用「決定性亂數」加變化 —— 每一圈 loop 的種子不同，
 * 所以聽起來會一直長出新句子，但和聲不會亂掉。
 *
 * 排程用 lookahead scheduler（setInterval 每 25ms 補排 120ms 內的音），
 * 不依賴 requestAnimationFrame，分頁掉帧也不會走音。
 * ========================================================= */

// ---------- 共用 AudioContext（音效與配樂共用一個，iOS 才不會爆掉） ----------
const AUDIO = (() => {
  let ac = null, master = null, musicBus = null, sfxBus = null;
  function build() {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    musicBus = ac.createGain(); musicBus.gain.value = 1; musicBus.connect(master);
    sfxBus = ac.createGain(); sfxBus.gain.value = 1; sfxBus.connect(master);
  }
  function ctx() {
    if (!ac) build();
    if (ac.state === "suspended") ac.resume();
    return ac;
  }
  return {
    ctx,
    get music() { ctx(); return musicBus; },
    get sfx() { ctx(); return sfxBus; },
  };
})();

// 白噪音緩衝（鼓組用），每個 context 只做一份
function noiseBuffer(ctx) {
  if (ctx.__noiseBuf) return ctx.__noiseBuf;
  const len = Math.floor(ctx.sampleRate * 0.4);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  ctx.__noiseBuf = buf;
  return buf;
}

const MUSIC = (() => {
  const midiFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // 決定性亂數：同一個種子永遠給同一串數字（旋律才不會每次重播都不一樣）
  function rng(seed) {
    let a = (seed * 2654435761) | 0;
    return () => {
      a = (a * 1664525 + 1013904223) | 0;
      return ((a >>> 8) & 0xffff) / 0x10000;
    };
  }

  // ---------- 音色 ----------
  function tone(ctx, dest, o) {
    const t = o.t, dur = o.dur;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.type || "triangle";
    osc.frequency.setValueAtTime(o.freq, t);
    if (o.glide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.glide), t + dur);
    // 音量包絡：快起音 + 指數衰減，聽起來像被撥/彈的音
    const peak = o.gain ?? 0.2;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + (o.attack ?? 0.008));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = osc;
    if (o.cutoff) {
      const f = ctx.createBiquadFilter();
      f.type = "lowpass"; f.frequency.setValueAtTime(o.cutoff, t);
      node.connect(f); node = f;
    }
    node.connect(g).connect(dest);
    osc.start(t); osc.stop(t + dur + 0.02);
  }

  function noise(ctx, dest, o) {
    const t = o.t, dur = o.dur;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx);
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = o.type || "highpass";
    f.frequency.setValueAtTime(o.freq || 6000, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(o.gain ?? 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(dest);
    src.start(t); src.stop(t + dur + 0.02);
  }

  // ---------- 鼓組 ----------
  const kick = (ctx, d, t, gain) => tone(ctx, d, { t, dur: 0.16, freq: 130, glide: 45, type: "sine", gain: gain ?? 0.5, attack: 0.004 });
  const snare = (ctx, d, t, gain) => {
    noise(ctx, d, { t, dur: 0.13, freq: 1400, gain: (gain ?? 0.16) });
    tone(ctx, d, { t, dur: 0.08, freq: 190, glide: 140, type: "triangle", gain: (gain ?? 0.16) * 0.7 });
  };
  const hat = (ctx, d, t, gain) => noise(ctx, d, { t, dur: 0.035, freq: 7500, gain: gain ?? 0.06 });

  // ---------- 曲風 ----------
  // prog：四小節和弦（相對主音的半音數 + 三和弦組成）
  const MAJ = [0, 4, 7], MIN = [0, 3, 7];
  const PROG = [
    { root: 0, tri: MAJ },   // I   C
    { root: 7, tri: MAJ },   // V   G
    { root: 9, tri: MIN },   // vi  Am
    { root: 5, tri: MAJ },   // IV  F
  ];
  const PENTA = [0, 2, 4, 7, 9];

  const STYLES = {
    pop: {
      id: "pop", name: "輕快", tag: "POP", bpm: 126, gain: 0.5,
      lead: "triangle", bassType: "sine", leadOct: 12, bassOct: -24,
      melodyRhythm: [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0],
      drums: "light",
    },
    chip: {
      id: "chip", name: "電玩", tag: "8BIT", bpm: 140, gain: 0.4,
      lead: "square", bassType: "square", leadOct: 12, bassOct: -24,
      melodyRhythm: [1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0],
      drums: "busy",
    },
    march: {
      id: "march", name: "進行曲", tag: "MARCH", bpm: 116, gain: 0.45,
      lead: "sawtooth", bassType: "triangle", leadOct: 0, bassOct: -24,
      melodyRhythm: [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1],
      drums: "march", cutoff: 2200,
    },
  };
  const ROOT_MIDI = 60;   // C4

  // 排一個 16 分音符格點上的所有聲部。可排進真實 context 或 OfflineAudioContext。
  function scheduleStep(ctx, dest, st, absStep, t, intensity) {
    const s = absStep % 16;                     // 小節內的第幾個 16 分音符
    const barIdx = Math.floor(absStep / 16) % 4;
    const loop = Math.floor(absStep / 64);      // 第幾圈（換種子 → 換句子）
    const ch = PROG[barIdx];
    const beat = 60 / st.bpm;

    // 貝斯：每小節的 1 與 3 拍踩根音，第 4 拍前給一個經過音
    if (s === 0 || s === 8) {
      tone(ctx, dest, { t, dur: beat * 0.75, freq: midiFreq(ROOT_MIDI + ch.root + st.bassOct),
        type: st.bassType, gain: 0.3, cutoff: st.cutoff });
    } else if (s === 14) {
      tone(ctx, dest, { t, dur: beat * 0.4, freq: midiFreq(ROOT_MIDI + ch.root + st.bassOct + 7),
        type: st.bassType, gain: 0.2, cutoff: st.cutoff });
    }

    // 和弦鋪底：每小節頭與第 3 拍輕輕按一下三和弦
    if (s === 0 || s === 8) {
      for (const iv of ch.tri) {
        tone(ctx, dest, { t: t + 0.01, dur: beat * 1.1, freq: midiFreq(ROOT_MIDI + ch.root + iv),
          type: "triangle", gain: 0.055, attack: 0.05, cutoff: st.cutoff });
      }
    }

    // 旋律：節奏樣板決定哪裡有音，音高從當下和弦音 + 五聲音階挑
    if (st.melodyRhythm[s]) {
      const r = rng(loop * 977 + barIdx * 31 + s);
      const pick = r();
      let semi;
      if (pick < 0.55) semi = ch.tri[Math.floor(r() * 3)];               // 和弦音（穩）
      else semi = PENTA[Math.floor(r() * PENTA.length)];                 // 五聲音階（色彩）
      const up = r() < 0.22 ? 12 : 0;                                   // 偶爾跳高八度
      tone(ctx, dest, { t, dur: beat * (r() < 0.3 ? 0.5 : 0.28),
        freq: midiFreq(ROOT_MIDI + ch.root + semi + st.leadOct + up),
        type: st.lead, gain: 0.13, cutoff: st.cutoff });
    }

    // 鼓組
    const d = st.drums;
    if (d === "march") {
      if (s === 0 || s === 4 || s === 8 || s === 12) kick(ctx, dest, t);
      if (s === 6 || s === 14) snare(ctx, dest, t);
      if (s === 2 || s === 10) snare(ctx, dest, t, 0.07);
    } else {
      if (s === 0 || s === 10) kick(ctx, dest, t);
      if (s === 4 || s === 12) snare(ctx, dest, t);
      if (d === "busy" ? s % 2 === 0 : s % 4 === 0) hat(ctx, dest, t);
    }
    // 最後衝刺：補 16 分 hi-hat，聽起來就趕起來了
    if (intensity > 0 && s % 2 === 1) hat(ctx, dest, t, 0.05 * intensity);
  }

  // ---------- 播放 ----------
  const LOOKAHEAD = 0.12, TICK = 25;
  let ctx = null, bus = null, timer = null, fadeTimer = null;
  let style = null, stepIndex = 0, nextTime = 0, intensity = 0, playing = false;
  let mp3 = null;   // 「原本的歌」選項

  function stepDur() {
    // intensity 會微微加快速度（最後 10 秒用）
    return 60 / (style.bpm * (1 + 0.07 * intensity)) / 4;
  }

  function pump() {
    if (!playing || !style) return;
    const now = ctx.currentTime;
    let guard = 0;
    while (nextTime < now + LOOKAHEAD && guard++ < 64) {
      scheduleStep(ctx, bus, style, stepIndex, nextTime, intensity);
      nextTime += stepDur();
      stepIndex++;
    }
  }

  function stopAll() {
    clearInterval(timer); timer = null;
    clearInterval(fadeTimer); fadeTimer = null;
    playing = false; style = null;
    if (bus) { try { bus.disconnect(); } catch (e) { /* 已斷開 */ } bus = null; }
    if (mp3) { mp3.pause(); }
  }

  function playMp3() {
    if (!mp3) {
      mp3 = new Audio("Chili Gola Game Pop Mix_1.mp3");
      mp3.loop = true; mp3.preload = "auto";
    }
    mp3.volume = 0.4;
    mp3.currentTime = 0;
    mp3.play().catch(() => { /* 自動播放被擋不影響遊戲 */ });
  }

  return {
    styles: [
      ...Object.values(STYLES).map((s) => ({ id: s.id, name: s.name, tag: s.tag })),
      { id: "mp3", name: "原本的歌", tag: "MP3" },
      { id: "off", name: "不要音樂", tag: "MUTE" },
    ],

    start(id) {
      stopAll();
      if (id === "off") return;
      if (id === "mp3") { AUDIO.ctx(); playMp3(); return; }
      const st = STYLES[id] || STYLES.pop;
      ctx = AUDIO.ctx();
      bus = ctx.createGain();
      bus.gain.value = st.gain;
      bus.connect(AUDIO.music);
      style = st; stepIndex = 0; intensity = 0; playing = true;
      nextTime = ctx.currentTime + 0.06;
      pump();
      timer = setInterval(pump, TICK);
    },

    // 最後衝刺（0～1）：加快一點並補打點
    setIntensity(x) { intensity = Math.max(0, Math.min(1, x)); },

    fadeOut() {
      clearInterval(fadeTimer);
      if (mp3 && !mp3.paused) {
        fadeTimer = setInterval(() => {
          if (mp3.volume > 0.05) mp3.volume = Math.max(0, mp3.volume - 0.05);
          else { clearInterval(fadeTimer); stopAll(); }
        }, 80);
        return;
      }
      if (!playing || !bus) { stopAll(); return; }
      const t = ctx.currentTime;
      bus.gain.cancelScheduledValues(t);
      bus.gain.setValueAtTime(bus.gain.value, t);
      bus.gain.linearRampToValueAtTime(0.0001, t + 1.1);
      const dying = bus;
      setTimeout(() => { if (bus === dying) stopAll(); }, 1300);
      playing = false;
      clearInterval(timer); timer = null;
    },

    stop: stopAll,

    // 進球時把配樂壓低一下，歡呼聲才聽得清楚
    duck(depth = 0.45, dur = 0.7) {
      if (!bus) return;
      const t = ctx.currentTime;
      const g = bus.gain;
      const cur = style ? style.gain : g.value;
      g.cancelScheduledValues(t);
      g.setValueAtTime(cur * depth, t);
      g.linearRampToValueAtTime(cur, t + dur);
    },

    // 試聽：選曲風時放幾秒就淡出
    preview(id) {
      this.start(id);
      clearTimeout(this._pv);
      this._pv = setTimeout(() => this.fadeOut(), 4200);
    },

    get playing() { return playing || !!(mp3 && !mp3.paused); },

    // 測試用：把曲子離線算出來，可以檢查有沒有聲音、會不會爆音
    async renderOffline(id, seconds, sampleRate = 22050) {
      const st = STYLES[id];
      if (!st) throw new Error("unknown style " + id);
      const OC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      const oc = new OC(1, Math.ceil(seconds * sampleRate), sampleRate);
      const g = oc.createGain(); g.gain.value = st.gain; g.connect(oc.destination);
      const dur = 60 / st.bpm / 4;
      let t = 0.02, i = 0;
      while (t < seconds) { scheduleStep(oc, g, st, i, t, 0); t += dur; i++; }
      return { buffer: await oc.startRendering(), notes: i };
    },
  };
})();
