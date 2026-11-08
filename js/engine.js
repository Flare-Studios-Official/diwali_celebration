const DW = window.DW = {};
(() => {
const cv = document.getElementById('c'), g = cv.getContext('2d');
const $ = id => document.getElementById(id);
const R = (a, b) => a + Math.random() * (b - a);
const CALM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PAL = [['#ffe08a','#ff9a1f'],['#ff5ca8','#ff1f5a'],['#7fe7ff','#2f8cff'],['#d6a2ff','#7b3cff'],['#9dffb8','#20c978'],['#fff6d5','#ffc857'],['#ff7a45','#ff3d2e']];
const pick = () => PAL[Math.random() * PAL.length | 0];
const WARM = ['#ff9a3d','#ff5c8a','#ffd166','#ff7a45','#ffb347'];
const MARI = ['#ff9f1c','#ffbf3f','#ff6b35','#ffd166','#ff8c42'];
const parts = [], scenes = [];
let W = 1, H = 1, D = 1, S = 1, t = 0, last = performance.now(), cur = 0, busy = false, flash = 0, stars = [];

function resize() {
  D = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
  cv.width = W * D; cv.height = H * D; g.setTransform(D, 0, 0, D, 0, 0);
  S = Math.max(.7, Math.min(1.5, Math.min(W, H) / 520));
  stars = Array.from({length: Math.min(220, W * H / 5000 | 0)}, () => ({x: R(0,W), y: R(0,H*.72), r: R(.3,1.5)*S, p: R(0,6.3), s: R(.5,2)}));
}
function bg(c1, c2) {
  const s = g.createLinearGradient(0, 0, 0, H);
  s.addColorStop(0, c1); s.addColorStop(1, c2);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.fillStyle = s; g.fillRect(0, 0, W, H);
}
function drawStars() {
  g.fillStyle = '#fff';
  for (const st of stars) { g.globalAlpha = .35 + .65 * Math.abs(Math.sin(t * st.s + st.p)); g.beginPath(); g.arc(st.x, st.y, st.r, 0, 6.283); g.fill(); }
  g.globalAlpha = 1;
}
function moon() {
  const mx = W * .84, my = H * .16, mr = 24 * S;
  const mg = g.createRadialGradient(mx, my, mr * .5, mx, my, mr * 3);
  mg.addColorStop(0, 'rgba(255,230,160,.35)'); mg.addColorStop(1, 'rgba(255,230,160,0)');
  g.fillStyle = mg; g.fillRect(mx - mr * 3, my - mr * 3, mr * 6, mr * 6);
  g.beginPath(); g.arc(mx, my, mr, 0, 6.283); g.fillStyle = '#fff3c8'; g.fill();
  g.beginPath(); g.arc(mx + mr * .35, my - mr * .2, mr * .9, 0, 6.283); g.fillStyle = '#1c0838'; g.fill();
}
function addFlash(a) { flash = Math.min(.08, flash + a); }
function emitBurst(x, y, c, type) {
  const [a, b] = c, n = type === 3 ? 110 : 90;
  for (let i = 0; i < n; i++) {
    const an = R(0, 6.283), sp = R(1.5, 5.5) * S * (type === 1 ? 1.3 : 1);
    parts.push({x, y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, life: 1, d: type === 3 ? R(.004,.008) : R(.011,.018), c: Math.random() < .5 ? a : b, s: R(1.4,2.6) * S, g: type === 3 ? .012 : .045, fl: type === 0 ? 1 : 0});
  }
  parts.push({x, y, vx: 0, vy: 0, life: 1, d: .09, c: '#fff8e0', s: 10 * S, g: 0, fl: 0, glow: 1});
  addFlash(.03);
}
function spark(x, y, c, n, spd) {
  for (let i = 0; i < n; i++) parts.push({x, y, vx: R(-spd,spd)*S, vy: R(-spd*1.5,-spd*.3)*S, life: 1, d: R(.02,.035), c: Math.random() < .5 ? c : '#fff3c4', s: 1.6*S, g: .07, fl: 1});
}
function updateParts(k) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i], f = Math.pow(.965, k);
    p.vx *= f; p.vy = p.vy * f + p.g * k; p.x += p.vx * k; p.y += p.vy * k; p.life -= p.d * k;
    if (p.fl && p.life < .45 && Math.random() < .06 * k) parts.push({x: p.x, y: p.y, vx: R(-.5,.5), vy: R(-.5,.5), life: .5, d: .05, c: '#ffffff', s: .9*S, g: .03, fl: 0});
    if (p.life <= 0) parts.splice(i, 1);
  }
  if (parts.length > 1000) parts.splice(0, parts.length - 1000);
  flash *= Math.pow(.9, k);
}
function drawParts() {
  g.globalCompositeOperation = 'lighter';
  for (const p of parts) {
    g.globalAlpha = Math.max(0, p.life) * (p.glow ? .35 : 1);
    g.fillStyle = p.c; g.beginPath();
    g.arc(p.x, p.y, p.s * (p.glow ? 1 : (.5 + p.life * .5)), 0, 6.283); g.fill();
  }
  if (flash > .005) { g.globalAlpha = flash; g.fillStyle = '#ffe9b0'; g.fillRect(0, 0, W, H); }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
function diya(x, y, lit, k, sc) {
  g.globalCompositeOperation = 'source-over';
  g.beginPath(); g.ellipse(x, y, 22*sc, 8*sc, 0, 0, Math.PI); g.fillStyle = '#b8552a'; g.fill();
  g.beginPath(); g.ellipse(x, y-2*sc, 14*sc, 3*sc, 0, 0, 6.283); g.fillStyle = lit ? '#ffb347' : '#3a1a14'; g.fill();
  if (!lit) return;
  const f = .8 + .2*Math.sin(t*11+k)*Math.sin(t*6.1+k*2), fh = 20*sc*f, fw = 7*sc*f, top = y-10*sc-fh, mid = y-10*sc-fh*.35;
  g.globalCompositeOperation = 'lighter';
  const gl = g.createRadialGradient(x, top+fh*.5, 0, x, top+fh*.5, 70*sc);
  gl.addColorStop(0, 'rgba(255,170,60,.45)'); gl.addColorStop(1, 'rgba(255,100,20,0)');
  g.fillStyle = gl; g.fillRect(x-70*sc, top+fh*.5-70*sc, 140*sc, 140*sc);
  g.beginPath(); g.moveTo(x, top); g.quadraticCurveTo(x+fw, mid, x, y-10*sc); g.quadraticCurveTo(x-fw, mid, x, top);
  const fg = g.createLinearGradient(0, top, 0, y-10*sc);
  fg.addColorStop(0,'#fff6c8'); fg.addColorStop(.5,'#ffb020'); fg.addColorStop(1,'#ff5a1a');
  g.fillStyle = fg; g.fill();
  g.globalCompositeOperation = 'source-over';
}
function lantern(x, y, c, sc) {
  g.globalCompositeOperation = 'lighter';
  const gl = g.createRadialGradient(x, y, 0, x, y, 50*sc); gl.addColorStop(0, c); gl.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalAlpha = .5; g.fillStyle = gl; g.fillRect(x-50*sc, y-50*sc, 100*sc, 100*sc);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  const bgd = g.createLinearGradient(0, y-18*sc, 0, y+18*sc);
  bgd.addColorStop(0,'#ffe9a0'); bgd.addColorStop(.6,c); bgd.addColorStop(1,'#a02a10');
  g.beginPath(); g.ellipse(x, y, 13*sc, 18*sc, 0, 0, 6.283); g.fillStyle = bgd; g.fill();
  g.fillStyle = '#4a1408'; g.fillRect(x-6*sc, y+17*sc, 12*sc, 4*sc); g.fillRect(x-6*sc, y-22*sc, 12*sc, 4*sc);
  g.globalCompositeOperation = 'lighter'; g.globalAlpha = .8;
  g.beginPath(); g.ellipse(x, y+2*sc, 5*sc, 8*sc*(.9+.1*Math.sin(t*9+x)), 0, 0, 6.283); g.fillStyle = '#fff6d0'; g.fill();
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
function petal(x, y, r, rot, c) {
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = .8; g.fillStyle = c;
  g.beginPath(); g.ellipse(0, 0, r, r*.45, 0, 0, 6.283); g.fill(); g.restore();
}
function applyScene() {
  const s = scenes[cur];
  if (s.init) s.init();
  $('title').textContent = s.title; $('sub').textContent = s.sub; $('hint').textContent = s.hint;
  const ui = $('ui'); ui.classList.remove('swap'); void ui.offsetWidth; ui.classList.add('swap');
  $('hint').style.opacity = .7;
  clearTimeout(applyScene.ht); applyScene.ht = setTimeout(() => $('hint').style.opacity = 0, 5000);
  [...$('dots').children].forEach((d, i) => d.classList.toggle('on', i === cur));
}
function go(i) {
  if (busy) return; busy = true; $('fade').style.opacity = 1;
  setTimeout(() => { cur = (i + scenes.length) % scenes.length; applyScene(); $('fade').style.opacity = 0; busy = false; }, 400);
}
function frame(now) {
  const dt = Math.min(50, now - last); last = now; const k = dt / 16.67; t += dt / 1000;
  const s = scenes[cur];
  if (s.update) s.update(k, now);
  updateParts(k);
  s.draw(now);
  drawParts();
  requestAnimationFrame(frame);
}
Object.defineProperties(DW, {W: {get: () => W}, H: {get: () => H}, S: {get: () => S}, t: {get: () => t}});
Object.assign(DW, {g, R, CALM, pick, WARM, MARI, PAL, parts, scenes, bg, drawStars, moon, emitBurst, spark, diya, lantern, petal,
  boot() {
    addEventListener('resize', resize); resize();
    scenes.forEach((_, i) => { const d = document.createElement('i'); d.onclick = () => go(i); $('dots').appendChild(d); });
    $('prev').onclick = () => go(cur - 1); $('next').onclick = () => go(cur + 1);
    addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(cur + 1); if (e.key === 'ArrowLeft') go(cur - 1); });
    const at = fn => e => { const s = scenes[cur]; if (s[fn]) s[fn](e.clientX, e.clientY, performance.now()); };
    cv.addEventListener('pointerdown', at('down'));
    cv.addEventListener('pointermove', at('move'));
    ['pointerup','pointercancel','pointerleave'].forEach(ev => cv.addEventListener(ev, () => { const s = scenes[cur]; if (s.up) s.up(); }));
    applyScene(); requestAnimationFrame(frame);
  }
});
})();
