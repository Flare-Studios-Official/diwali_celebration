const {g, R, CALM, pick, WARM, MARI, bg, drawStars, moon, emitBurst, spark, diya, lantern, petal, parts} = DW;
const TYPES = [0, 1, 3], rt = () => TYPES[Math.random() * 3 | 0];

function aurora() {
  const W = DW.W, H = DW.H, S = DW.S, t = DW.t;
  g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for (let r = 0; r < 3; r++) {
    g.beginPath();
    for (let x = 0; x <= W; x += 20) {
      const y = H*(.18+.08*r) + Math.sin(x*.004+t*.5+r)*H*.05 + Math.sin(x*.011-t*.7)*12*S;
      if (x) g.lineTo(x, y); else g.moveTo(x, y);
    }
    g.strokeStyle = ['#2ee6a6','#6a7bff','#ff6ad5'][r]; g.globalAlpha = .09; g.lineWidth = Math.max(30, H*.05); g.stroke();
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

/* 0 — Fireworks, aurora, shooting stars */
DW.scenes.push({
  title: 'Happy Diwali', sub: 'May your days shine with light', hint: 'Tap the sky for fireworks',
  rockets: [], meteors: [], nextAuto: 0, nextMeteor: 0,
  init() { this.rockets = []; this.meteors = []; this.nextAuto = 0; this.nextMeteor = 0; },
  launch(x) { if (DW.sfx) DW.sfx.launch(); this.rockets.push({x, y: DW.H+5, vx: R(-.5,.5)*DW.S, vy: -R(10,13)*DW.S, ty: R(DW.H*.12, DW.H*.45), c: pick(), type: rt()}); },
  update(k, now) {
    if (now > this.nextAuto) { this.launch(R(DW.W*.12, DW.W*.88)); this.nextAuto = now + (CALM ? 4000 : R(900,1700)); }
    if (now > this.nextMeteor && !CALM) { this.meteors.push({x: R(0,DW.W), y: R(0,DW.H*.3), vx: R(6,9)*DW.S, vy: R(3,5)*DW.S, life: 1}); this.nextMeteor = now + R(2500,5000); }
    for (let i = this.meteors.length-1; i >= 0; i--) { const m = this.meteors[i]; m.x += m.vx*k; m.y += m.vy*k; m.life -= .012*k; if (m.life <= 0 || m.x > DW.W+50) this.meteors.splice(i,1); }
    for (let i = this.rockets.length-1; i >= 0; i--) {
      const r = this.rockets[i]; r.x += r.vx*k; r.y += r.vy*k;
      parts.push({x: r.x, y: r.y, vx: R(-.3,.3), vy: R(0,.4), life: .7, d: .05, c: '#ffd27a', s: 1.3*DW.S, g: .02, fl: 0});
      if (r.y <= r.ty) { emitBurst(r.x, r.y, r.c, r.type); this.rockets.splice(i,1); }
    }
  },
  draw() {
    bg('#07021f','#2a1020'); drawStars(); moon(); aurora();
    g.globalCompositeOperation = 'lighter';
    for (const m of this.meteors) {
      const gr = g.createLinearGradient(m.x, m.y, m.x-m.vx*8, m.y-m.vy*8);
      gr.addColorStop(0,'#ffffff'); gr.addColorStop(1,'rgba(255,255,255,0)');
      g.globalAlpha = m.life; g.strokeStyle = gr; g.lineWidth = 2*DW.S;
      g.beginPath(); g.moveTo(m.x, m.y); g.lineTo(m.x-m.vx*8, m.y-m.vy*8); g.stroke();
    }
    g.fillStyle = '#ffd27a';
    for (const r of this.rockets) { g.globalAlpha = 1; g.beginPath(); g.arc(r.x, r.y, 2*DW.S, 0, 6.283); g.fill(); }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    const fl = g.createLinearGradient(0, DW.H*.88, 0, DW.H);
    fl.addColorStop(0,'#3a1420'); fl.addColorStop(1,'#12050a');
    g.fillStyle = fl; g.fillRect(0, DW.H*.88, DW.W, DW.H*.12);
  },
  down(x, y) { emitBurst(x, y, pick(), rt()); }
});

/* 1 — Diya lane */
DW.scenes.push({
  title: 'Lighting the Path', sub: 'शुभ दीपावली · Each diya carries a wish', hint: 'Tap a diya to light it',
  N: 11, lit: [], doneAt: 0, k: [],
  init() { this.lit = Array(this.N).fill(false); this.doneAt = 0; this.k = Array.from({length: this.N}, () => R(0,6.3)); },
  update(k, now) { if (this.doneAt && now - this.doneAt > 3000) { this.lit.fill(false); this.doneAt = 0; } },
  draw() {
    bg('#0a0320','#2c0c22'); drawStars();
    const y = DW.H*.72, cnt = this.lit.filter(Boolean).length;
    const gl = g.createRadialGradient(DW.W/2, y, 0, DW.W/2, y, DW.W*.7);
    gl.addColorStop(0, `rgba(255,150,50,${.08 + .22*cnt/this.N})`); gl.addColorStop(1, 'rgba(255,150,50,0)');
    g.globalCompositeOperation = 'lighter'; g.fillStyle = gl; g.fillRect(0, 0, DW.W, DW.H); g.globalCompositeOperation = 'source-over';
    for (let i = 0; i < this.N; i++) diya(DW.W*(i+.5)/this.N, y, this.lit[i], this.k[i], DW.S*1.1);
  },
  down(x, y, now) {
    const sp = DW.W/this.N, y0 = DW.H*.72;
    for (let i = 0; i < this.N; i++) {
      const dx = DW.W*(i+.5)/this.N;
      if (Math.abs(x-dx) < sp*.6 && y > y0-70*DW.S && y < y0+14*DW.S) {
        if (!this.lit[i]) {
          this.lit[i] = true; spark(dx, y0-10*DW.S, '#ffd27a', 14, 2);if (DW.sfx) DW.sfx.chime();
          if (this.lit.every(Boolean)) {
            this.doneAt = now;
            for (let j = 0; j < 6; j++) setTimeout(() => emitBurst(R(DW.W*.15,DW.W*.85), R(DW.H*.08,DW.H*.4), pick(), rt()), j*300);
          }
        }
        return;
      }
    }
  }
});

/* 2 — Rangoli bloom */
DW.scenes.push({
  title: 'Rangoli of Colours', sub: 'Touch the floor to bloom a pattern', hint: 'Tap anywhere to bloom a rangoli',
  blooms: [], nextB: 0,
  init() { this.blooms = []; this.nextB = 0; },
  add(x, y, now) { this.blooms.push({x, y, t0: now, size: R(70,105)*DW.S, n: [8,12,16], rot: R(0,6.3), pal: [pick(), pick(), pick()]}); },
  update(k, now) {
    if (now > this.nextB && !CALM) { this.add(R(DW.W*.15,DW.W*.85), R(DW.H*.2,DW.H*.85), now); this.nextB = now + 2200; }
    this.blooms = this.blooms.filter(b => now - b.t0 < 9000);
  },
  draw(now) {
    bg('#0c0320','#2a0a26'); drawStars();
    g.globalCompositeOperation = 'lighter';
    for (const b of this.blooms) {
      const age = (now-b.t0)/1000, grow = Math.min(1, age/1.2), e = 1-Math.pow(1-grow,3);
      g.globalAlpha = Math.max(0, 1-Math.max(0, age-6)/3);
      [.35,.65,.95].forEach((f, ri) => {
        const n = b.n[ri], rad = b.size*f*e, pc = b.pal[ri][0];
        for (let i = 0; i < n; i++) {
          const an = b.rot + i/n*6.283;
          g.save(); g.translate(b.x+Math.cos(an)*rad, b.y+Math.sin(an)*rad); g.rotate(an+Math.PI/2);
          g.beginPath(); g.ellipse(0, 0, b.size*.14*e, b.size*.07*e+2, 0, 0, 6.283);
          g.fillStyle = i%2 ? pc : b.pal[ri][1]; g.fill(); g.restore();
        }
      });
      g.beginPath(); g.arc(b.x, b.y, b.size*.12*e, 0, 6.283); g.fillStyle = '#ffe08a'; g.fill();
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  },
  down(x, y, now) { this.add(x, y, now); spark(x, y, '#ffd27a', 10, 1.5); }
});

/* 3 — Sparkler writing */
DW.scenes.push({
  title: 'Wishes in Light', sub: 'Write a wish with your sparkler', hint: 'Drag to write in light',
  strokes: [], cur: null,
  init() { this.strokes = []; this.cur = null; },
  update(k, now) { this.strokes = this.strokes.filter(s => now - s[s.length-1].t < 3500); },
  draw(now) {
    bg('#03040f','#0b0a24'); drawStars();
    g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.lineJoin = 'round';
    for (const s of this.strokes) {
      for (let i = 1; i < s.length; i++) {
        const a = Math.max(0, 1-(now-s[i].t)/3000);
        g.beginPath(); g.moveTo(s[i-1].x, s[i-1].y); g.lineTo(s[i].x, s[i].y);
        g.globalAlpha = a*.3; g.strokeStyle = '#ffb347'; g.lineWidth = 9*DW.S; g.stroke();
        g.globalAlpha = a; g.strokeStyle = '#fff3c4'; g.lineWidth = 2.5*DW.S; g.stroke();
      }
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  },
  down(x, y, now) { this.cur = [{x, y, t: now}]; this.strokes.push(this.cur); spark(x, y, '#ffd27a', 8, 1);if (DW.sfx) DW.sfx.crackle(); },
  move(x, y, now) {
    if (!this.cur) return;
    const p = this.cur[this.cur.length-1];
    if (Math.hypot(x-p.x, y-p.y) < 2) return;
    this.cur.push({x, y, t: now}); spark(x, y, '#ffd27a', 2, .6);
  },
  up() { this.cur = null; }
});

/* 4 — Floating lanterns */
DW.scenes.push({
  title: 'Floating Lanterns', sub: 'Release a lantern for someone you love', hint: 'Tap to release a lantern',
  lanterns: [], nextL: 0,
  init() { this.lanterns = []; this.nextL = 0; },
  add(x, y) { this.lanterns.push({x, y, vy: -R(.35,.6)*DW.S, sw: R(.3,.8), ph: R(0,6.3), c: WARM[Math.random()*WARM.length|0], sc: R(.8,1.2)*DW.S}); },
  update(k, now) {
    if (now > this.nextL && !CALM) { this.add(R(DW.W*.1, DW.W*.9), DW.H+40); this.nextL = now + 1600; }
    for (let i = this.lanterns.length-1; i >= 0; i--) {
      const l = this.lanterns[i]; l.y += l.vy*k; l.ph += .01*k; l.x += Math.sin(l.ph)*l.sw*DW.S*k*.5;
      if (l.y < -60) this.lanterns.splice(i, 1);
    }
  },
  draw() {
    bg('#0a0520','#3a1030'); drawStars(); moon();
    for (const l of this.lanterns) lantern(l.x, l.y, l.c, l.sc);
  },
  down(x, y) { this.add(x, y); }
});

/* 5 — Marigold winds */
DW.scenes.push({
  title: 'Marigold Winds', sub: 'Sweep through the petals', hint: 'Move to stir the wind · Tap to scatter petals',
  pet: [], wind: 0, lx: 0,
  init() { this.pet = Array.from({length: Math.min(120, DW.W/9|0)}, () => this.newP(true)); this.wind = 0; this.lx = 0; },
  newP(init) { return {x: R(0,DW.W), y: init ? R(-DW.H,DW.H) : -20, vx: R(-.3,.3), vy: R(.6,1.6)*DW.S, r: R(4,8)*DW.S, rot: R(0,6.3), vr: R(-.05,.05), ph: R(0,6.3), c: MARI[Math.random()*5|0]}; },
  update(k) {
    this.wind *= Math.pow(.98, k);
    for (const p of this.pet) {
      p.ph += .02*k; p.x += (p.vx + Math.sin(p.ph)*.5 + this.wind)*k; p.y += p.vy*k; p.rot += p.vr*k;
      if (p.y > DW.H+20 || p.x < -30 || p.x > DW.W+30) Object.assign(p, this.newP(false));
    }
  },
  draw() {
    bg('#1a0612','#4a1a0a');
    for (const p of this.pet) petal(p.x, p.y, p.r, p.rot, p.c);
  },
  move(x) { if (this.lx) this.wind = Math.max(-4, Math.min(4, (x-this.lx)*.15))*DW.S; this.lx = x; },
  down(x, y) {
    for (let i = 0; i < 40; i++) {
      const an = R(0,6.283), sp = R(2,6)*DW.S, p = this.newP(false);
      p.x = x; p.y = y; p.vx = Math.cos(an)*sp; p.vy = Math.sin(an)*sp - 1; this.pet.push(p);
    }
    if (this.pet.length > 260) this.pet.splice(0, this.pet.length-260);
  }
});

/* 6 — Golden glitter rain */
DW.scenes.push({
  title: 'Golden Glitter', sub: 'Let the light rain down', hint: 'Tap to shower sparkles',
  gl: [],
  init() { this.gl = Array.from({length: Math.min(160, DW.W/7|0)}, () => this.mk(true)); },
  mk(init) { return {x: R(0,DW.W), y: init ? R(0,DW.H) : -10, vy: R(.8,2.2)*DW.S, ph: R(0,6.3), sw: R(.3,1), s: R(1,2.6)*DW.S, c: Math.random()<.6 ? '#ffd27a' : '#fff3c4'}; },
  update(k) {
    for (const q of this.gl) { q.ph += .04*k; q.x += Math.sin(q.ph)*q.sw*.6*k; q.y += q.vy*k; if (q.y > DW.H+10) Object.assign(q, this.mk(false)); }
  },
  draw(now) {
    bg('#080318','#2b0f1a');
    g.globalCompositeOperation = 'lighter';
    for (const q of this.gl) {
      const tw = .5 + .5*Math.sin(q.ph*2 + q.x);
      g.globalAlpha = .35 + .65*tw; g.fillStyle = q.c; g.beginPath(); g.arc(q.x, q.y, q.s, 0, 6.283); g.fill();
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  },
  down(x, y) {
    for (let i = 0; i < 30; i++) parts.push({x, y, vx: R(-2,2)*DW.S, vy: R(-3,0)*DW.S, life: 1, d: .012, c: Math.random()<.5 ? '#ffd27a' : '#fff3c4', s: 1.5*DW.S, g: .06, fl: 0});
  }
});
