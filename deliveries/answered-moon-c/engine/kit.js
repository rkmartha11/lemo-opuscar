// Answered. shared kit: captions, tags, note cards, icons, easing, footage frames.
// Used IDENTICALLY by the Lemo Opuscar page and the OpenMontage page so the two tools match exactly.
(function () {
  const W = 1080, H = 1920;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const ss = (a, b, t) => { const x = seg(t, a, b); return x * x * (3 - 2 * x); };
  const eo = x => 1 - Math.pow(1 - clamp(x), 3);
  const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const back = (x, s = 1.7) => { x = clamp(x) - 1; return 1 + (s + 1) * x * x * x + s * x * x; };
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // ---------- captions ----------
  const CAP = { size: 70, weight: 800, maxW: 960, lowY: 0.65 * H, highY: 0.33 * H };
  function captions(ctx, shot, t, opt = {}) {
    const B = window.BRAND, y = opt.y ?? (shot.pos === 'high' ? CAP.highY : CAP.lowY);
    const line = shot.lines.find(l => t >= l.t0 - 0.04 && t < l.t1 - 0.001);
    if (!line) return;
    let size = CAP.size;
    ctx.save();
    const setFont = s => ctx.font = `${CAP.weight} ${s}px ${B.font}`;
    setFont(size);
    const space = ctx.measureText(' ').width;
    let widths = line.words.map(w => ctx.measureText(w.w).width);
    let total = widths.reduce((a, b) => a + b, 0) + space * (line.words.length - 1);
    if (total > CAP.maxW) { size = Math.floor(size * CAP.maxW / total); setFont(size); widths = line.words.map(w => ctx.measureText(w.w).width); total = widths.reduce((a, b) => a + b, 0) + ctx.measureText(' ').width * (line.words.length - 1); }
    const sp = ctx.measureText(' ').width;
    let x = W / 2 - total / 2;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    line.words.forEach((w, i) => {
      const cx = x + widths[i] / 2; x += widths[i] + sp;
      const p = seg(t, w.t0 - 0.05, w.t0 + 0.13);
      if (p <= 0) return;
      const sc = 0.8 + 0.2 * back(p, 2.2), a = clamp(p / 0.45) * (opt.alpha ?? 1);
      ctx.save(); ctx.translate(cx, y + (1 - eo(p)) * 10); ctx.scale(sc, sc); ctx.globalAlpha = a;
      ctx.fillStyle = w.key ? B.accent : B.ink;
      ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 5;
      ctx.fillText(w.w, 0, 0);
      ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 2;
      ctx.fillText(w.w, 0, 0);
      ctx.restore();
    });
    ctx.restore();
  }

  // ---------- icons (vector, so no emoji font is needed) ----------
  function icon(ctx, name, x, y, s, col, lw) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw ?? 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const B = window.BRAND;
    if (name === 'clock') {
      ctx.beginPath(); ctx.arc(0, 0, 44, 0, 7); ctx.stroke();
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; ctx.beginPath(); ctx.moveTo(Math.sin(a) * 34, -Math.cos(a) * 34); ctx.lineTo(Math.sin(a) * 40, -Math.cos(a) * 40); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -28); ctx.moveTo(0, 0); ctx.lineTo(20, 8); ctx.stroke();
    } else if (name === 'lamp') { // diya: bowl + flame
      ctx.beginPath(); ctx.moveTo(-46, 4); ctx.quadraticCurveTo(-40, 40, 0, 40); ctx.quadraticCurveTo(40, 40, 46, 4); ctx.lineTo(18, 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-46, 4); ctx.lineTo(-10, 4); ctx.stroke();
      ctx.save(); ctx.fillStyle = col === B.ink || col === '#fff' || col === '#FFFFFF' ? col : B.accent;
      ctx.beginPath(); ctx.moveTo(30, -48); ctx.bezierCurveTo(46, -26, 44, -6, 30, -4); ctx.bezierCurveTo(16, -6, 14, -26, 30, -48); ctx.fill(); ctx.restore();
    } else if (name === 'anchor') {
      ctx.beginPath(); ctx.arc(0, -36, 10, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(0, 44); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-24, -12); ctx.lineTo(24, -12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-40, 14); ctx.quadraticCurveTo(-34, 44, 0, 44); ctx.quadraticCurveTo(34, 44, 40, 14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-40, 14); ctx.lineTo(-48, 24); ctx.moveTo(-40, 14); ctx.lineTo(-30, 20); ctx.moveTo(40, 14); ctx.lineTo(48, 24); ctx.moveTo(40, 14); ctx.lineTo(30, 20); ctx.stroke();
    } else if (name === 'sun') {
      ctx.beginPath(); ctx.arc(0, 0, 22, 0, 7); ctx.fill();
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 32, Math.sin(a) * 32); ctx.lineTo(Math.cos(a) * 44, Math.sin(a) * 44); ctx.stroke(); }
    } else if (name === 'snow') {
      for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; const c = Math.cos(a), s2 = Math.sin(a);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(c * 44, s2 * 44); ctx.stroke();
        const bx = c * 26, by = s2 * 26, a1 = a + 0.7, a2 = a - 0.7;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a1) * 14, by + Math.sin(a1) * 14); ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a2) * 14, by + Math.sin(a2) * 14); ctx.stroke(); }
    }
    ctx.restore();
  }

  // ---------- tag: small rounded pill, top of frame, accent background, white text ----------
  function tag(ctx, text, iconName, t, t0 = 0.15, y = 168) {
    const B = window.BRAND, p = seg(t, t0, t0 + 0.32);
    if (p <= 0) return;
    ctx.save();
    ctx.font = `700 36px ${B.font}`;
    const tw = ctx.measureText(text).width, ic = iconName ? 52 : 0, padX = 30, h = 76, w = tw + ic + padX * 2;
    ctx.translate(W / 2, y); const sc = 0.88 + 0.12 * back(p, 2); ctx.scale(sc, sc); ctx.globalAlpha = clamp(p / 0.5);
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
    ctx.fillStyle = B.accent; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); ctx.fill();
    ctx.shadowColor = 'transparent';
    let x = -w / 2 + padX;
    if (iconName) { icon(ctx, iconName, x + 20, 0, 42, '#FFFFFF', 11); x += ic; }
    ctx.fillStyle = '#FFFFFF'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(text, x, 2);
    ctx.restore();
  }

  // ---------- note card: off-white paper, handwriting, slight tilt, pop with small bounce ----------
  function noteCard(ctx, text, x, y, t, t0, rot = -3, size = 66) {
    const B = window.BRAND; if (t < t0) return;
    const k = t - t0, sc = k < 0.2 ? 1.08 * eo(k / 0.2) : k < 0.36 ? lerp(1.08, 0.98, eo((k - 0.2) / 0.16)) : lerp(0.98, 1, eo((k - 0.36) / 0.14));
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot * Math.PI / 180); ctx.scale(sc, sc); ctx.globalAlpha = clamp(k / 0.1);
    ctx.font = `700 ${size}px ${B.hand}`;
    const lines = text.split('\n'), tw = Math.max(...lines.map(l => ctx.measureText(l).width)), lh = size * 1.05;
    const w = tw + 84, h = lh * lines.length + 60;
    ctx.shadowColor = 'rgba(0,0,0,0.38)'; ctx.shadowBlur = 34; ctx.shadowOffsetY = 14;
    ctx.fillStyle = B.paper; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 10); ctx.fill();
    ctx.shadowColor = 'transparent';
    // faint ruled line + tape
    ctx.strokeStyle = 'rgba(80,110,160,0.18)'; ctx.lineWidth = 2;
    lines.forEach((l, i) => { const yy = -h / 2 + 30 + lh * (i + 1) - 4; ctx.beginPath(); ctx.moveTo(-w / 2 + 24, yy); ctx.lineTo(w / 2 - 24, yy); ctx.stroke(); });
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.save(); ctx.rotate(0.06); ctx.fillRect(-60, -h / 2 - 16, 120, 34); ctx.restore();
    ctx.fillStyle = B.paperInk; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lines.forEach((l, i) => ctx.fillText(l, 0, -h / 2 + 30 + lh * (i + 0.5) + 2));
    ctx.restore();
  }

  // ---------- footage frames (JPEG sequences, 30 fps) ----------
  const cache = new Map();
  function loadImg(src) {
    if (cache.has(src)) return cache.get(src);
    const p = new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('missing ' + src)); im.src = src; });
    cache.set(src, p); if (cache.size > 120) cache.delete(cache.keys().next().value); return p;
  }
  async function frame(name, localT, n) {
    const i = Math.min(n, Math.max(1, Math.floor(localT * 30 + 1e-6) + 1));
    return loadImg(`frames/${name}/${String(i).padStart(4, '0')}.jpg`);
  }
  function legibility(ctx, top = true, bottom = true) {
    if (top) { const g = ctx.createLinearGradient(0, 0, 0, 340); g.addColorStop(0, 'rgba(0,0,0,0.38)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 340); }
    if (bottom) { const g = ctx.createLinearGradient(0, 1000, 0, 1560); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(0,0,0,0.30)'); g.addColorStop(1, 'rgba(0,0,0,0.12)'); ctx.fillStyle = g; ctx.fillRect(0, 1000, W, 560); }
  }

  window.KIT = { W, H, clamp, lerp, seg, ss, eo, eio, back, mulberry, captions, icon, tag, noteCard, frame, loadImg, legibility };
})();
