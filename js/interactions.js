/* Pointer-driven interactions. Pure JS + CSS variables: they work without GSAP
   and are disabled on touch devices and for reduced-motion users. */
(() => {
  'use strict';
  const DS = (window.DS = window.DS || {});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  DS.fine = fine; DS.reduced = reduced;

  /* ---------- 3D tilt + spotlight (event delegation keeps it light) ---------- */
  if (fine && !reduced) {
    let active = null, raf = 0, ev = null;
    const apply = () => {
      raf = 0; if (!active || !ev) return;
      const r = active.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width, py = (ev.clientY - r.top) / r.height;
      const max = active.classList.contains('code-card') || active.classList.contains('tl-card') || active.classList.contains('edu') ? 3 : 7;
      active.style.setProperty('--ry', ((px - 0.5) * 2 * max).toFixed(2) + 'deg');
      active.style.setProperty('--rx', ((0.5 - py) * 2 * max).toFixed(2) + 'deg');
      active.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      active.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      if (active.hasAttribute('data-magnetic-soft')) {
        active.style.setProperty('--tx', ((px - 0.5) * 8).toFixed(1) + 'px');
        active.style.setProperty('--ty', ((py - 0.5) * 8).toFixed(1) + 'px');
      }
    };
    const reset = (el) => ['--rx', '--ry', '--tx', '--ty'].forEach((p) => el.style.removeProperty(p));
    document.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const el = e.target.closest && e.target.closest('[data-tilt]');
      if (el !== active) {
        if (active) { active.classList.remove('tilting'); reset(active); }
        active = el; if (el) el.classList.add('tilting');
      }
      if (active) { ev = e; if (!raf) raf = requestAnimationFrame(apply); }
    }, { passive: true });
    document.addEventListener('pointerleave', () => { if (active) { active.classList.remove('tilting'); reset(active); active = null; } });
    window.addEventListener('blur', () => { if (active) { active.classList.remove('tilting'); reset(active); active = null; } });
  }

  /* ---------- Hero: portrait tilt, floating-chip depth, spotlight ---------- */
  const stage = $('#heroStage'), portrait = $('#portrait'), hero = $('#home'), spot = $('#heroSpot');
  if (stage && portrait && fine && !reduced) {
    const chips = $$('.chip', stage);
    let f = 0, last = null;
    const frame = () => {
      f = 0; if (!last) return;
      const r = stage.getBoundingClientRect();
      const px = (last.clientX - r.left) / r.width - 0.5, py = (last.clientY - r.top) / r.height - 0.5;
      portrait.style.setProperty('--ry', (px * 18).toFixed(2) + 'deg');
      portrait.style.setProperty('--rx', (-py * 18).toFixed(2) + 'deg');
      portrait.style.setProperty('--mx', ((px + 0.5) * 100).toFixed(0) + '%');
      portrait.style.setProperty('--my', ((py + 0.5) * 100).toFixed(0) + '%');
      chips.forEach((c) => { const d = +c.dataset.depth || 20; c.style.transform = `translate3d(${(px * d).toFixed(1)}px,${(py * d).toFixed(1)}px,0)`; });
    };
    stage.addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; last = e; portrait.classList.add('tilting'); if (!f) f = requestAnimationFrame(frame); }, { passive: true });
    stage.addEventListener('pointerleave', () => {
      last = null; portrait.classList.remove('tilting');
      ['--rx', '--ry'].forEach((p) => portrait.style.removeProperty(p));
      chips.forEach((c) => { c.style.transition = 'transform .8s cubic-bezier(.2,.8,.2,1)'; c.style.transform = ''; setTimeout(() => (c.style.transition = ''), 850); });
    });
  }
  if (hero && spot && fine && !reduced) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      spot.style.setProperty('--sx', e.clientX - r.left + 'px'); spot.style.setProperty('--sy', e.clientY - r.top + 'px');
    }, { passive: true });
  }

  /* ---------- Magnetic buttons ---------- */
  if (fine && !reduced) {
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.28, y = (e.clientY - (r.top + r.height / 2)) * 0.4;
        el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Animated cursor ---------- */
  const cursor = $('#cursor');
  if (cursor && fine && !reduced) {
    const dot = $('.cursor-dot', cursor), ring = $('.cursor-ring', cursor), label = $('span', ring);
    let tx = 0, ty = 0, rx = 0, ry = 0, running = false, shown = false;
    const loop = () => {
      rx += (tx - rx) * 0.18; ry += (ty - ry) * 0.18;
      ring.style.transform = `translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0)`;
      if (Math.abs(tx - rx) + Math.abs(ty - ry) > 0.3) requestAnimationFrame(loop); else running = false;
    };
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      dot.style.transform = `translate3d(${tx}px,${ty}px,0)`;
      if (!shown) { shown = true; rx = tx; ry = ty; cursor.classList.add('on'); }
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest ? e.target : null; if (!t) return;
      const view = t.closest('.dk-media,.cert-media');
      const hov = t.closest('a,button,.filter,.tab,[data-tilt]');
      cursor.classList.toggle('view', !!view); label.textContent = view ? 'View' : '';
      cursor.classList.toggle('hover', !!hov && !view);
    });
    document.documentElement.addEventListener('mouseleave', () => cursor.classList.remove('on'));
    document.documentElement.addEventListener('mouseenter', () => shown && cursor.classList.add('on'));
  }

  /* ---------- Hero particle field (Canvas 2D: lighter than WebGL for this effect) ---------- */
  const canvas = $('#heroCanvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const colors = ['200,255,61', '157,107,255', '56,189,248'];
    let W = 0, H = 0, dpr = 1, parts = [], running = false, visible = true, raf = 0, mouse = { x: -999, y: -999 };
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = canvas.getBoundingClientRect(); W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(fine ? 80 : 36, Math.floor((W * H) / 15000));
      parts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.6 + .6, c: colors[(Math.random() * 3) | 0] }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (!reduced) {
          p.x += p.vx; p.y += p.vy;
          const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < 14000) { const f = (1 - d2 / 14000) * 0.9; p.x += (dx / (Math.sqrt(d2) + 1)) * f * 2; p.y += (dy / (Math.sqrt(d2) + 1)) * f * 2; }
          if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
          if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
        }
        ctx.fillStyle = `rgba(${p.c},.8)`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
        for (let j = i + 1; j < parts.length; j++) {
          const q = parts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < 9000) { ctx.strokeStyle = `rgba(${p.c},${(0.16 * (1 - d / 9000)).toFixed(3)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
      }
    };
    const tick = () => { draw(); raf = running ? requestAnimationFrame(tick) : 0; };
    const start = () => { if (running || reduced || !visible || document.hidden) return; running = true; raf = requestAnimationFrame(tick); };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    size(); draw();
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { size(); draw(); }, 200); });
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; visible ? start() : stop(); }).observe(canvas);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    if (fine) window.addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; }, { passive: true });
    start();
  }
})();
