(() => {
  const DW = window.DW;
  let ctx = null, master = null, on = true, lastBoom = 0;
  const btn = document.getElementById('sound');
  const now = () => ctx.currentTime;

  function init() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = on ? 0.5 : 0;
    master.connect(ctx.destination);
    startMusic();
  }

  function tone(freq, t0, dur, type, vol) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  function noise(dur) {
    const b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource(); s.buffer = b;
    return s;
  }

  function startMusic() {
    const chords = [[196, 293.7, 392], [220, 329.6, 440], [174.6, 261.6, 349.2], [196, 293.7, 392]];
    let i = 0;
    const pad = () => {
      const t0 = now();
      chords[i++ % chords.length].forEach(f => tone(f, t0, 4.2, 'sine', 0.05));
      setTimeout(pad, 4000);
    };
    const scale = [523.25, 587.33, 659.25, 783.99, 880, 987.77];
    const bells = () => {
      if (Math.random() < 0.7) tone(scale[Math.random() * scale.length | 0], now(), 1.8, 'triangle', 0.08);
      setTimeout(bells, 1400 + Math.random() * 1200);
    };
    pad();
    bells();
  }

  const sfx = {
    launch() {
      if (!ctx) return;
      const t0 = now(), o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(300, t0);
      o.frequency.exponentialRampToValueAtTime(1200, t0 + 0.6);
      g.gain.setValueAtTime(0.08, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.7);
      o.connect(g); g.connect(master);
      o.start(t0); o.stop(t0 + 0.75);
    },
    boom() {
      if (!ctx || now() - lastBoom < 0.08) return;
      lastBoom = now();
      const t0 = now(), n = noise(1.2), f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(900, t0);
      f.frequency.exponentialRampToValueAtTime(80, t0 + 1.1);
      g.gain.setValueAtTime(0.9, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.3);
      n.connect(f); f.connect(g); g.connect(master);
      n.start(t0); n.stop(t0 + 1.3);
      for (let i = 0; i < 5; i++) tone(2000 + Math.random() * 2000, t0 + 0.2 + Math.random() * 0.9, 0.05, 'square', 0.02);
    },
    chime() {
      if (!ctx) return;
      const t0 = now();
      [880, 1174.66, 1318.5].forEach((f, i) => tone(f, t0 + i * 0.06, 1.2, 'sine', 0.12));
    },
    crackle() {
      if (!ctx) return;
      const t0 = now();
      for (let i = 0; i < 6; i++) tone(3000 + Math.random() * 3000, t0 + i * 0.03, 0.03, 'square', 0.01);
    },
    whoosh() {
      if (!ctx) return;
      const t0 = now(), n = noise(0.8), f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = 'bandpass';
      f.frequency.setValueAtTime(400, t0);
      f.frequency.exponentialRampToValueAtTime(2000, t0 + 0.6);
      g.gain.setValueAtTime(0.001, t0);
      g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.25);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.8);
      n.connect(f); f.connect(g); g.connect(master);
      n.start(t0); n.stop(t0 + 0.8);
    }
  };

  DW.sfx = sfx;

  document.addEventListener('pointerdown', () => {
    init();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }, true);

  if (btn) btn.onclick = e => {
    e.stopPropagation();
    on = !on;
    init();
    if (master) master.gain.setTargetAtTime(on ? 0.5 : 0, now(), 0.05);
    btn.textContent = on ? '🔊' : '🔇';
  };
})();
