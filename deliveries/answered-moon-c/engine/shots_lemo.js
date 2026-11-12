// Lemo Opuscar shots: S01 S02 S07 S09 S10. Code-drawn, Answered. palette, WHAT pillar.
(function () {
  const { W, H, clamp, lerp, seg, ss, eo, eio, back, mulberry, captions, icon, tag, noteCard } = KIT;
  const B = BRAND, ctx = CTX, S = window.S;
  const off = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
  const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };

  // ================= ROOFTOP NIGHT (S01, S10) =================
  let skyline, rooftop, stars;
  function buildRooftop() {
    const r = mulberry(7);
    stars = Array.from({ length: 300 }, () => ({ x: r() * W, y: r() * 1500, s: r() < 0.08 ? 2.6 : 0.8 + r() * 1.4, a: 0.35 + r() * 0.6, ph: r() * 6.28, f: 0.6 + r() * 1.8 }));
    // far skyline
    let c; [skyline, c] = off(W, H);
    const base = 1470; c.fillStyle = '#0A1122';
    let x = -20; const blds = [];
    while (x < W + 20) { const w = 60 + r() * 120, h = 90 + r() * 260; blds.push([x, w, h]); x += w + 4 + r() * 10; }
    blds.forEach(([bx, bw, bh]) => c.fillRect(bx, base - bh, bw, bh + 460));
    // temple shikhara + mobile tower silhouettes
    c.beginPath(); c.moveTo(250, base - 120); c.quadraticCurveTo(268, base - 300, 290, base - 340); c.quadraticCurveTo(312, base - 300, 330, base - 120); c.closePath(); c.fill();
    c.fillRect(287, base - 372, 6, 34);
    c.strokeStyle = '#0A1122'; c.lineWidth = 4; c.beginPath(); c.moveTo(880, base - 210); c.lineTo(905, base - 520); c.lineTo(930, base - 210); c.moveTo(888, base - 300); c.lineTo(922, base - 300); c.moveTo(895, base - 400); c.lineTo(915, base - 400); c.stroke();
    // windows
    blds.forEach(([bx, bw, bh]) => { for (let yy = base - bh + 18; yy < base - 10; yy += 26) for (let xx = bx + 10; xx < bx + bw - 14; xx += 22) if (r() < 0.16) { c.fillStyle = r() < 0.7 ? 'rgba(255,196,107,0.75)' : 'rgba(190,215,255,0.55)'; c.fillRect(xx, yy, 9, 12); } });
    // near rooftop (terrace) silhouette
    [rooftop, c] = off(W, H);
    c.fillStyle = '#04070F';
    const top = 1600;
    c.fillRect(0, top, W, H - top);                       // parapet wall
    c.fillRect(0, top - 14, W, 16);                       // coping
    for (let px = 20; px < W; px += 54) c.fillRect(px, top - 70, 7, 58);   // railing posts
    c.fillRect(0, top - 74, W, 6);                        // rail
    // water tank on stand (right)
    c.fillRect(800, top - 210, 10, 140); c.fillRect(950, top - 210, 10, 140); c.fillRect(800, top - 120, 160, 8);
    c.beginPath(); c.roundRect(780, top - 360, 200, 160, 18); c.fill(); c.fillRect(790, top - 372, 180, 18); c.beginPath(); c.arc(880, top - 376, 40, Math.PI, 0); c.fill();
    // clothesline with clothes (left-centre)
    c.fillRect(110, top - 330, 7, 260); c.fillRect(560, top - 320, 7, 250);
    c.strokeStyle = '#04070F'; c.lineWidth = 3; c.beginPath(); c.moveTo(113, top - 326); c.quadraticCurveTo(340, top - 290, 563, top - 316); c.stroke();
    const cl = (x0, w, h, y0) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + w, y0 + 2); c.lineTo(x0 + w - 6, y0 + h); c.lineTo(x0 + 6, y0 + h - 4); c.closePath(); c.fill(); };
    cl(170, 70, 120, top - 316); cl(260, 46, 160, top - 309); cl(330, 90, 70, top - 306); cl(450, 60, 130, top - 308);
    // tulsi planter + dish
    c.fillRect(620, top - 150, 90, 80); c.beginPath(); for (let k = 0; k < 14; k++) { const a = -Math.PI * (0.1 + 0.8 * k / 13); c.ellipse(665 + Math.cos(a) * 30, top - 150 + Math.sin(a) * 50, 10, 22, a + Math.PI / 2, 0, 7); } c.fill();
    c.save(); c.translate(60, top - 150); c.rotate(-0.5); c.beginPath(); c.ellipse(0, 0, 46, 22, 0, 0, 7); c.fill(); c.restore(); c.fillRect(56, top - 150, 8, 80);
  }
  function moonDisc(c, x, y, r, a) {
    if (a <= 0) return;
    c.save(); c.globalAlpha = a;
    let g = c.createRadialGradient(x, y, r * 0.9, x, y, r * 5.2); g.addColorStop(0, 'rgba(225,232,255,0.42)'); g.addColorStop(0.25, 'rgba(170,190,240,0.12)'); g.addColorStop(1, 'rgba(120,140,200,0)');
    c.fillStyle = g; c.fillRect(x - r * 6, y - r * 6, r * 12, r * 12);
    c.beginPath(); c.arc(x, y, r, 0, 7); c.clip();
    g = c.createRadialGradient(x - r * 0.25, y - r * 0.25, r * 0.1, x, y, r * 1.05); g.addColorStop(0, '#FBF8EE'); g.addColorStop(0.75, '#ECE6D6'); g.addColorStop(1, '#C9C1AE');
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
    [[-0.3, -0.25, 0.32], [0.2, -0.35, 0.22], [0.15, 0.12, 0.3], [-0.35, 0.3, 0.2], [0.42, 0.28, 0.14], [-0.05, 0.5, 0.12]].forEach(([dx, dy, rr]) => {
      const gg = c.createRadialGradient(x + dx * r, y + dy * r, 0, x + dx * r, y + dy * r, rr * r); gg.addColorStop(0, 'rgba(150,145,130,0.45)'); gg.addColorStop(1, 'rgba(150,145,130,0)');
      c.fillStyle = gg; c.fillRect(x - r, y - r, r * 2, r * 2); });
    c.restore();
  }
  function rooftopScene(t, cam, moonA) {
    ctx.save();
    ctx.translate(540, 900); ctx.scale(cam, cam); ctx.translate(-540, -900);
    const g = ctx.createLinearGradient(0, 0, 0, 1600); g.addColorStop(0, '#02050E'); g.addColorStop(0.55, '#08132B'); g.addColorStop(0.85, '#16223F'); g.addColorStop(1, '#2A2A44');
    ctx.fillStyle = g; ctx.fillRect(-100, -100, W + 200, H + 200);
    const haze = ctx.createLinearGradient(0, 1250, 0, 1500); haze.addColorStop(0, 'rgba(255,150,80,0)'); haze.addColorStop(1, 'rgba(255,150,80,0.10)'); ctx.fillStyle = haze; ctx.fillRect(-100, 1250, W + 200, 260);
    const starBoost = 1 + 0.35 * (1 - moonA);
    stars.forEach(s => { const tw = 0.75 + 0.25 * Math.sin(t * s.f + s.ph); ctx.globalAlpha = clamp(s.a * tw * starBoost); ctx.fillStyle = '#EAF0FF'; ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, 7); ctx.fill(); });
    ctx.globalAlpha = 1;
    moonDisc(ctx, 760, 520, 105, moonA);
    ctx.drawImage(skyline, 0, 0);
    // moon rim light on rooftop edges
    ctx.drawImage(rooftop, 0, 0);
    if (moonA > 0) { ctx.globalAlpha = 0.22 * moonA; ctx.fillStyle = '#9FB2D8'; ctx.fillRect(0, 1586, W, 2); ctx.fillRect(0, 1526, W, 2); ctx.globalAlpha = 1; }
    // tower beacon: slow soft pulse (no flash)
    const bp = 0.35 + 0.35 * (0.5 + 0.5 * Math.sin(t * 2.2)); ctx.fillStyle = `rgba(255,70,60,${bp})`; ctx.beginPath(); ctx.arc(905, 948, 4, 0, 7); ctx.fill();
    ctx.restore();
  }

  // ================= S02: Moon -> clock + lamp + anchor =================
  function moonIcon(c, x, y, r, grey) {
    c.save(); c.translate(x, y);
    c.fillStyle = grey > 0 ? mix(B.paper, '#8F9196', grey) : B.paper;
    c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.10)';
    [[-0.35, -0.3, 0.2], [0.3, -0.2, 0.14], [0.12, 0.3, 0.24], [-0.3, 0.35, 0.11], [0.5, 0.25, 0.09]].forEach(([dx, dy, rr]) => { c.beginPath(); c.arc(dx * r, dy * r, rr * r, 0, 7); c.fill(); });
    c.restore();
  }
  function mix(a, b, k) { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const ch = s => Math.round(lerp(pa >> s & 255, pb >> s & 255, k)); return `rgb(${ch(16)},${ch(8)},${ch(0)})`; }
  function darkGround(t, push) {
    ctx.fillStyle = B.bg; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(540, 820, 50, 540, 820, 1100); g.addColorStop(0, hexA(B.bg2, 1)); g.addColorStop(1, hexA(B.bg, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    const s = 1 + push; for (let y = 30; y < H; y += 60) for (let x = 30; x < W; x += 60) { const xx = 540 + (x - 540) * s, yy = 900 + (y - 900) * s; ctx.fillRect(xx - 1.5, yy - 1.5, 3, 3); }
  }
  function S02(t) {
    const push = 0.03 * eio(t / S.dur);
    darkGround(t, push);
    ctx.save(); ctx.translate(540, 900); ctx.scale(1 + push, 1 + push); ctx.translate(-540, -900);
    const W0 = S.words, wt = i => W0[i].t0;   // 0 You'd 1 think 2 so 3 what 4 it's 5 just 6 a 7 rock 8 It 9 isn't 10 It's 11 Earth's 12 clock 13 lamp 14 and 15 anchor
    const cy = 800;
    // moon
    const appear = back(seg(t, 0, 0.4), 1.6);
    const grey = ss(wt(7) - 0.05, wt(7) + 0.3, t) * (1 - ss(wt(9), wt(9) + 0.25, t));
    const pulse = 1 + 0.07 * Math.sin(Math.PI * seg(t, wt(9), wt(9) + 0.45));
    const splitK = eo(seg(t, wt(12) - 0.15, wt(15) + 0.1));
    const mr = 165 * (0.85 + 0.15 * appear) * pulse * (1 - splitK);
    const wob = grey > 0 ? Math.sin(t * 18) * 3 * grey : 0;
    if (mr > 1) { ctx.globalAlpha = clamp(appear) * (1 - splitK * 0.6); moonIcon(ctx, 540 + wob, cy + 12 * grey, mr, grey); ctx.globalAlpha = 1; }
    // ring on "isn't"
    const rk = seg(t, wt(9), wt(9) + 0.6); if (rk > 0 && rk < 1) { ctx.strokeStyle = hexA(B.accent, 0.6 * (1 - rk)); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(540, cy, 165 + 120 * eo(rk), 0, 7); ctx.stroke(); }
    // icons
    const slots = [['clock', 12, 228, 'CLOCK'], ['lamp', 13, 540, 'LAMP'], ['anchor', 15, 852, 'ANCHOR']];
    slots.forEach(([nm, wi, sx, label]) => {
      const p = seg(t, wt(wi) - 0.06, wt(wi) + 0.42); if (p <= 0) return;
      const k = eo(p), x = lerp(540, sx, k), sc = lerp(0.35, 1, back(p, 1.5));
      ctx.save(); ctx.translate(x, cy); ctx.scale(sc, sc); ctx.globalAlpha = clamp(p / 0.3);
      ctx.fillStyle = B.bg2; ctx.beginPath(); ctx.arc(0, 0, 122, 0, 7); ctx.fill();
      ctx.strokeStyle = B.accent; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, 122, 0, 7); ctx.stroke();
      icon(ctx, nm, 0, 4, 150, B.paper, 9);
      ctx.restore();
      ctx.save(); ctx.globalAlpha = clamp((p - 0.4) / 0.6); ctx.fillStyle = B.ink; ctx.font = `700 34px ${B.font}`; ctx.textAlign = 'center'; ctx.letterSpacing = '5px'; ctx.fillText(label, sx, cy + 180); ctx.restore();
    });
    ctx.restore();
    noteCard(ctx, 'Moon = clock + lamp + anchor', 540, 1560, t, wt(10) - 0.05, -3, 64);
    captions(ctx, S, t);
  }

  // ================= S07: top-down beach map =================
  let agents, town;
  function buildBeach() {
    const r = mulberry(21);
    agents = Array.from({ length: 74 }, (_, i) => ({ x0: 470 + r() * 210, y0: 560 + r() * 560, st: -4.2 + r() * 8.6, bias: r(), sp: 66 + r() * 26, ph: r() * 6.28 }));
    town = []; let y = 300;
    while (y < 1620) { const h = 70 + r() * 110; let x = 800; while (x < 1060) { const w = 60 + r() * 90; town.push([x, y, Math.min(w, 1075 - x), h, r()]); x += w + 14; } y += h + 22; }
  }
  const SHORE = (y, t) => 330 + 16 * Math.sin(y / 95 + t * 1.3) + 8 * Math.sin(y / 37 - t * 0.9);
  function glowAt(t) { return 1 - ss(S.words[4].t0 + 0.05, S.words[6].t0 + 0.35, t); } // Without -> moonlit .. fades ~0.9 s
  function simAgent(a, t) {
    const dt = 1 / 30; let x = a.x0, y = a.y0, hd = Math.PI + (a.bias - 0.5) * 0.5, gone = 0, stuck = 0; const trail = [];
    if (t < a.st) return null;
    const ty = a.y0 + (a.bias - 0.5) * 140, townY = 380 + a.bias * 1150;
    for (let tt = a.st; tt < t; tt += dt) {
      const g = glowAt(Math.max(0, tt));
      const seaW = 0.12 + 1.0 * g, townW = 0.55 * (a.bias < 0.24 ? 0.15 : 1);
      const goSea = seaW >= townW;
      const tx = goSea ? 300 : 770, tyy = goSea ? ty : townY;
      const want = Math.atan2(tyy - y, tx - x) + 0.25 * Math.sin(tt * 3 + a.ph);
      let d = want - hd; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      hd += clamp(d, -2.4 * dt, 2.4 * dt);
      if (!stuck) { x += Math.cos(hd) * a.sp * dt; y += Math.sin(hd) * a.sp * dt; }
      if (x < SHORE(y, tt) + 4) gone += dt;
      if (x > 752) { x = 752; stuck = 1; }
      trail.push(x, y); if (trail.length > 40) trail.splice(0, 2);
      if (gone > 0.5) return null;
    }
    return { x, y, hd, gone, trail };
  }
  function S07(t) {
    const push = 0.04 * eio(t / S.dur), g = glowAt(t);
    ctx.save(); ctx.translate(540, 900); ctx.scale(1 + push, 1 + push); ctx.translate(-540, -900);
    // sand
    ctx.fillStyle = B.sand; ctx.fillRect(-60, -60, W + 120, H + 120);
    const sg = ctx.createLinearGradient(300, 0, 800, 0); sg.addColorStop(0, 'rgba(0,0,0,0.18)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sg; ctx.fillRect(300, -60, 500, H + 120);
    // night tint over everything
    ctx.fillStyle = 'rgba(8,16,40,0.42)'; ctx.fillRect(-60, -60, W + 120, H + 120);
    // sea
    ctx.beginPath(); ctx.moveTo(-60, -60); for (let y = -60; y <= H + 60; y += 20) ctx.lineTo(SHORE(y, t), y); ctx.lineTo(-60, H + 60); ctx.closePath();
    const seaG = ctx.createLinearGradient(0, 0, 340, 0); seaG.addColorStop(0, mix(B.sea, '#000000', 0.45)); seaG.addColorStop(1, mix(B.sea, '#000000', 0.15)); ctx.fillStyle = seaG; ctx.fill();
    ctx.save(); ctx.clip();
    // wave lines
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 3;
    for (let k = 0; k < 5; k++) { const off2 = (t * 18 + k * 60) % 300; ctx.beginPath(); for (let y = -60; y <= H + 60; y += 20) ctx.lineTo(SHORE(y, t) - 20 - off2, y); ctx.stroke(); }
    // moonlit glow on the sea
    if (g > 0) {
      ctx.globalAlpha = g;
      const mg = ctx.createRadialGradient(140, 820, 20, 140, 820, 520); mg.addColorStop(0, 'rgba(235,242,255,0.85)'); mg.addColorStop(0.35, 'rgba(200,220,255,0.40)'); mg.addColorStop(1, 'rgba(160,190,240,0)');
      ctx.fillStyle = mg; ctx.fillRect(-60, 200, 600, 1300);
      const rr = mulberry(5); ctx.fillStyle = '#FFFFFF';
      for (let k = 0; k < 90; k++) { const x = rr() * 320, y = 520 + rr() * 600, f = rr() * 6; const a = 0.5 + 0.5 * Math.sin(t * 4 + f); ctx.globalAlpha = g * a * clamp(1 - Math.hypot(x - 140, y - 820) / 330); ctx.fillRect(x, y, 18, 3); }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    // foam edge
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 5; ctx.beginPath(); for (let y = -60; y <= H + 60; y += 20) ctx.lineTo(SHORE(y, t), y); ctx.stroke();
    // road + town
    ctx.fillStyle = '#2B2E3A'; ctx.fillRect(760, -60, 30, H + 120);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; for (let y = -40; y < H; y += 70) ctx.fillRect(773, y, 4, 34);
    // town light spill onto sand (always on)
    const sp = ctx.createRadialGradient(900, 900, 50, 900, 900, 620); sp.addColorStop(0, 'rgba(255,190,90,0.28)'); sp.addColorStop(1, 'rgba(255,190,90,0)'); ctx.fillStyle = sp; ctx.fillRect(300, 200, 800, 1400);
    town.forEach(([x, y, w, h, q]) => {
      ctx.fillStyle = '#1E2638'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 6); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x + 6, y + 6, w - 12, 4);
      const n = 1 + Math.floor(q * 3);
      for (let k = 0; k < n; k++) { const lx = x + 14 + (w - 28) * ((k + 0.5) / n), ly = y + h * 0.55;
        const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, 46); lg.addColorStop(0, 'rgba(255,205,110,0.55)'); lg.addColorStop(1, 'rgba(255,205,110,0)'); ctx.fillStyle = lg; ctx.fillRect(lx - 46, ly - 46, 92, 92);
        ctx.fillStyle = '#FFD27A'; ctx.beginPath(); ctx.arc(lx, ly, 6, 0, 7); ctx.fill(); }
    });
    // street lamps along the road
    for (let y = 330; y < 1650; y += 150) { const lg = ctx.createRadialGradient(792, y, 0, 792, y, 90); lg.addColorStop(0, 'rgba(255,215,130,0.5)'); lg.addColorStop(1, 'rgba(255,215,130,0)'); ctx.fillStyle = lg; ctx.fillRect(700, y - 90, 180, 180); ctx.fillStyle = '#FFE1A0'; ctx.beginPath(); ctx.arc(792, y, 7, 0, 7); ctx.fill(); }
    // hatchlings
    agents.forEach(a => {
      const s = simAgent(a, t); if (!s) return;
      const fade = 1 - clamp(s.gone / 0.5);
      ctx.globalAlpha = 0.28 * fade; ctx.strokeStyle = '#2A2016'; ctx.lineWidth = 2; ctx.beginPath(); for (let k = 0; k < s.trail.length; k += 2) ctx.lineTo(s.trail[k], s.trail[k + 1]); ctx.stroke();
      ctx.globalAlpha = fade; ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.hd);
      ctx.fillStyle = '#1C150F'; ctx.beginPath(); ctx.ellipse(0, 0, 11, 7, 0, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,240,210,0.35)'; ctx.beginPath(); ctx.ellipse(-1, -1, 4, 2.4, 0, 0, 7); ctx.fill();
      ctx.restore(); ctx.globalAlpha = 1;
    });
    // labels
    ctx.font = `700 30px ${B.font}`; ctx.textAlign = 'center'; ctx.letterSpacing = '6px'; ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText('SEA', 160, 330); ctx.fillText('SAND', 560, 330); ctx.fillText('TOWN', 935, 270);
    ctx.letterSpacing = '0px';
    if (g > 0.02) { ctx.globalAlpha = g; ctx.font = `600 26px ${B.font}`; ctx.fillStyle = 'rgba(235,242,255,0.9)'; ctx.fillText('moonlight', 160, 1100); ctx.globalAlpha = 1; }
    ctx.restore();
    noteCard(ctx, 'brightest horizon = the way home', 540, 1575, t, 0.35, 2.5, 62);
    captions(ctx, S, t);
  }

  // ================= S09: Earth tilt =================
  let land, spaceStars;
  function buildEarth() {
    const r = mulberry(99), LW = 360, LH = 180; land = new Float32Array(LW * LH);
    const pts = Array.from({ length: 26 }, () => [r() * LW, 25 + r() * 130, 18 + r() * 34]);
    for (let j = 0; j < LH; j++) for (let i = 0; i < LW; i++) {
      let v = 0; pts.forEach(([px, py, pr]) => { let dx = Math.abs(i - px); dx = Math.min(dx, LW - dx); const d = Math.hypot(dx, j - py) / pr; v += Math.exp(-d * d * 1.6); });
      v += 0.18 * Math.sin(i * 0.21 + j * 0.13) * Math.sin(j * 0.17 - i * 0.07);
      land[j * LW + i] = v;
    }
    const r2 = mulberry(3); spaceStars = Array.from({ length: 260 }, () => [r2() * W, r2() * H, 0.6 + r2() * 1.6, 0.25 + r2() * 0.6]);
  }
  let earthBuf;
  function drawEarth(cx, cy, R, tilt, spin) {
    if (!earthBuf) earthBuf = off(R * 2, R * 2);
    const [cv, c] = earthBuf, img = c.createImageData(R * 2, R * 2), d = img.data;
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    const L = [-0.62, -0.32, 0.72], ll = Math.hypot(...L); L[0] /= ll; L[1] /= ll; L[2] /= ll;
    const oc = [0x1D, 0x4E, 0x89], lc = [0x5E, 0x8C, 0x5A], dc = [0xA8, 0x96, 0x62];
    for (let py = 0; py < R * 2; py++) for (let px = 0; px < R * 2; px++) {
      const nx = (px + 0.5 - R) / R, ny = (py + 0.5 - R) / R, r2 = nx * nx + ny * ny; if (r2 > 1) continue;
      const nz = Math.sqrt(1 - r2);
      // undo screen tilt -> body frame
      const bx = nx * ct + ny * st, by = -nx * st + ny * ct, bz = nz;
      const lat = Math.asin(-by), lon = Math.atan2(bx, bz) + spin;
      let u = ((lon / (2 * Math.PI)) % 1 + 1) % 1, v = 0.5 - lat / Math.PI;
      const li = Math.min(359, Math.floor(u * 360)), lj = Math.min(179, Math.floor(v * 180)), lv = land[lj * 360 + li];
      let col = lv > 1.05 ? (lv > 1.75 ? dc : lc) : oc;
      if (Math.abs(lat) > 1.2) col = [235, 242, 248];
      const diff = nx * L[0] + ny * L[1] + nz * L[2], lit = 0.14 + 0.95 * Math.max(0, Math.min(1, diff * 1.4 + 0.15));
      const rim = Math.pow(1 - nz, 3) * 0.6;
      const k = (py * R * 2 + px) * 4;
      d[k] = Math.min(255, col[0] * lit + 120 * rim); d[k + 1] = Math.min(255, col[1] * lit + 170 * rim); d[k + 2] = Math.min(255, col[2] * lit + 255 * rim); d[k + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    const ag = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.22); ag.addColorStop(0, 'rgba(110,170,255,0.45)'); ag.addColorStop(1, 'rgba(110,170,255,0)'); ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(cx, cy, R * 1.22, 0, 7); ctx.fill();
    ctx.drawImage(cv, cx - R, cy - R);
  }
  function S09(t) {
    const push = 0.04 * eio(t / S.dur);
    ctx.fillStyle = '#02050D'; ctx.fillRect(0, 0, W, H);
    const bg = ctx.createRadialGradient(540, 760, 100, 540, 760, 1200); bg.addColorStop(0, hexA(B.bg2, 0.9)); bg.addColorStop(1, hexA(B.bg, 0)); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    spaceStars.forEach(([x, y, s, a]) => { ctx.globalAlpha = a; ctx.fillStyle = '#E6EEFF'; ctx.fillRect(x, y, s, s); }); ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(540, 760); ctx.scale(1 + push, 1 + push); ctx.translate(-540, -760);
    const W0 = S.words, wt = i => W0[i].t0;  // 0 And 1 slowly 2 over 3 millions 4 of 5 years 6 Earth's 7 tilt 8 could 9 start 10 to 11 wobble ...
    const cx = 540, cy = 740, R = 250;
    const w0 = wt(6), A = 17 * ss(w0, w0 + 3.2, t), u = t - w0;
    const tiltDeg = 23.5 + (u > 0 ? A * (0.62 * Math.sin(1.9 * u) + 0.38 * Math.sin(3.3 * u + 1.1)) : 0);
    const tilt = tiltDeg * Math.PI / 180;
    // vertical reference
    ctx.setLineDash([10, 12]); ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy - R - 150); ctx.lineTo(cx, cy + R + 150); ctx.stroke(); ctx.setLineDash([]);
    // moon + orbit, fading away
    const mA = 1 - ss(wt(1) - 0.1, wt(2) + 0.35, t);
    if (mA > 0) { ctx.globalAlpha = mA * 0.35; ctx.strokeStyle = '#BFD0F0'; ctx.lineWidth = 2; ctx.setLineDash([4, 10]); ctx.beginPath(); ctx.ellipse(cx, cy, 420, 150, -0.3, 0, 7); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      moonDiscSmall(910, 560, 50, mA); }
    drawEarth(cx, cy, R, tilt, t * 0.35);
    // axis
    const ax = Math.sin(tilt), ay = -Math.cos(tilt), Lx = R + 95;
    ctx.strokeStyle = B.accent; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - ax * Lx, cy - ay * Lx); ctx.lineTo(cx + ax * Lx, cy + ay * Lx); ctx.stroke();
    ctx.fillStyle = B.accent; ctx.beginPath(); ctx.arc(cx + ax * Lx, cy + ay * Lx, 9, 0, 7); ctx.fill();
    // angle arc + label
    const labA = 1 - ss(w0 + 0.2, w0 + 0.8, t);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R + 70, -Math.PI / 2, -Math.PI / 2 + tilt, tilt < 0); ctx.stroke();
    ctx.globalAlpha = labA; ctx.font = `800 46px ${B.font}`; ctx.fillStyle = B.ink; ctx.textAlign = 'left'; ctx.fillText('23.5°', cx + 70, cy - R - 100);
    ctx.globalAlpha = 1 - labA; ctx.fillText('?', cx + 95, cy - R - 100); ctx.globalAlpha = 1;
    // season seesaw
    const dev = (tiltDeg - 23.5) / 17, bang = dev * 0.26, px0 = 540, py0 = 1125, half = 235;
    ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.beginPath(); ctx.moveTo(px0, py0); ctx.lineTo(px0 - 22, py0 + 36); ctx.lineTo(px0 + 22, py0 + 36); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.translate(px0, py0); ctx.rotate(bang);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-half, 0); ctx.lineTo(half, 0); ctx.stroke();
    const sunS = 1 + 0.4 * Math.max(0, -dev), snowS = 1 + 0.4 * Math.max(0, dev);
    [[-half, 'sun', B.accent, sunS], [half, 'snow', '#BFE3FF', snowS]].forEach(([x, nm, col, s]) => {
      ctx.save(); ctx.translate(x, -50); ctx.rotate(-bang); ctx.scale(s, s);
      ctx.fillStyle = B.bg2; ctx.beginPath(); ctx.arc(0, 0, 46, 0, 7); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 46, 0, 7); ctx.stroke();
      icon(ctx, nm, 0, 0, 62, col, 9); ctx.restore(); });
    ctx.restore();
    ctx.restore();
    tag(ctx, 'ANCHOR · over millions of years', 'anchor', t, 0.15);
    captions(ctx, S, t);
  }
  function moonDiscSmall(x, y, r, a) { ctx.save(); ctx.globalAlpha = a; moonIcon(ctx, x, y, r, 0); ctx.restore(); }

  // ================= S10: payoff + end card =================
  function S10(t) {
    const cam = 1.06 + 0.03 * eio(t / S.dur);
    const moonA = ss(0.0, 0.85, t);
    rooftopScene(t + 4.6, cam, moonA);
    captions(ctx, S, t);
    const endT = S.voiceDur + 0.04, k = ss(endT, endT + 0.55, t);
    if (k > 0) {
      ctx.fillStyle = hexA(B.bg, k); ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.globalAlpha = k; ctx.translate(540, 930); const sc = 0.96 + 0.04 * eo(seg(t, endT, endT + 0.8)); ctx.scale(sc, sc);
      ctx.font = `800 132px ${B.font}`; ctx.textBaseline = 'middle';
      const w1 = ctx.measureText('Answered').width, w2 = ctx.measureText('.').width, x0 = -(w1 + w2) / 2;
      ctx.textAlign = 'left'; ctx.fillStyle = B.ink; ctx.fillText('Answered', x0, 0); ctx.fillStyle = B.accent; ctx.fillText('.', x0 + w1, 0);
      ctx.restore();
    }
  }

  // ================= S01 =================
  function S01(t) {
    const cam = 1 + 0.06 * eio(t / S.dur);
    const gone = S.words[9].t0;  // "gone."
    const moonA = 1 - ss(gone, gone + 0.5, t);
    rooftopScene(t, cam, moonA);
    const k = ss(gone + 0.05, gone + 0.45, t);
    if (k > 0) {
      ctx.save(); ctx.globalAlpha = k; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `900 96px ${B.font}`;
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 24; ctx.fillStyle = B.ink;
      ctx.fillText('THE MOON', 540, 470); ctx.fillStyle = B.accent; ctx.fillText('IS GONE.', 540, 580); ctx.restore();
    }
    captions(ctx, S, t);
  }

  const SHOTS = { S01, S02, S07, S09, S10 };
  window.render = function (t) { SHOTS[SHOT](Math.min(t, DUR - 1e-4)); };
  bootFonts(async () => { if (SHOT === 'S01' || SHOT === 'S10') buildRooftop(); if (SHOT === 'S07') buildBeach(); if (SHOT === 'S09') buildEarth(); });
})();
