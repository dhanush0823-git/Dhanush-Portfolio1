/* Boot sequence, navigation, credential viewer, project modal and intro loader. */
(() => {
  'use strict';
  const DS = (window.DS = window.DS || {});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const safe = (fn) => { try { fn(); } catch (e) { console.warn('[portfolio]', e); } };

  /* ---------- Toast ---------- */
  const toast = $('#toast'); let toastT;
  const showToast = (m) => { if (!toast) return; toast.textContent = m; toast.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), 2200); };

  /* ---------- Scroll lock helpers (Lenis-aware) ---------- */
  const lock = () => { DS.lenis && DS.lenis.stop(); html.style.overflow = 'hidden'; };
  const unlock = () => { DS.lenis && DS.lenis.start(); html.style.overflow = ''; };

  /* ---------- Year ---------- */
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Navigation ---------- */
  const nav = $('#nav'), toggle = $('#navToggle'), links = $('#navLinks');
  const setMenu = (open) => {
    if (!toggle || !links) return;
    toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    links.classList.toggle('open', open);
    open ? lock() : unlock();
  };
  toggle && toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && links && links.classList.contains('open')) setMenu(false); });
  addEventListener('resize', () => { if (innerWidth > 900 && links && links.classList.contains('open')) setMenu(false); });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const target = id === '#home' ? document.body : $(id); if (!target) return;
    e.preventDefault();
    if (links && links.classList.contains('open')) setMenu(false);
    const y = id === '#home' ? 0 : target;
    if (DS.lenis) DS.lenis.scrollTo(y, { offset: id === '#home' ? 0 : -8, duration: 1.5 });
    else if (id === '#home') scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', id === '#home' ? location.pathname : id);
  });

  /* ---------- Scroll progress, nav state, back-to-top ring ---------- */
  const bar = $('#progress'), arc = $('#toTopArc'), toTop = $('#toTop');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const max = html.scrollHeight - innerHeight, p = max > 0 ? Math.min(1, scrollY / max) : 0;
    if (bar) bar.style.transform = `scaleX(${p})`;
    if (arc) arc.style.setProperty('--tt', (100 - p * 100).toFixed(1));
    if (nav) nav.classList.toggle('scrolled', scrollY > 30);
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  toTop && toTop.addEventListener('click', () => { DS.lenis ? DS.lenis.scrollTo(0, { duration: 1.6 }) : scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });

  /* ---------- Section theme (ambient light) + active nav link ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const t = en.target.dataset.theme; if (t) html.dataset.theme = t;
        const id = en.target.id;
        $$('#navLinks a').forEach((a) => { const on = a.getAttribute('href') === '#' + id; a.classList.toggle('active', on); on ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current'); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section[id]').forEach((s) => io.observe(s));
    const heroIO = new IntersectionObserver((en) => { if (en[0].isIntersecting) $$('#navLinks a').forEach((a) => { a.classList.remove('active'); a.removeAttribute('aria-current'); }); });
    const hero = $('#home'); hero && heroIO.observe(hero);
  }

  /* ---------- Copy code ---------- */
  const copyBtn = $('#copyCode'), code = $('#profileCode code');
  if (copyBtn && code) copyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(code.innerText); showToast('Profile snippet copied'); }
    catch (_) { const r = document.createRange(); r.selectNodeContents(code); const s = getSelection(); s.removeAllRanges(); s.addRange(r); showToast('Press Ctrl/Cmd + C to copy'); }
  });

  /* ---------- Dialog plumbing (focus trap, Esc, scroll lock) ---------- */
  let lastFocus = null, openDlg = null;
  const focusables = (el) => $$('a[href],button:not([disabled]):not([hidden]),iframe,[tabindex]:not([tabindex="-1"])', el).filter((n) => n.offsetParent !== null);
  const openDialog = (el, focusSel) => {
    lastFocus = document.activeElement; openDlg = el;
    el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); lock();
    $$('[data-lenis-prevent]', el).length || el.setAttribute('data-lenis-prevent', '');
    setTimeout(() => { const f = $(focusSel, el); f && f.focus({ preventScroll: true }); }, 60);
  };
  const closeDialog = (el, after) => {
    el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); unlock(); openDlg = null;
    setTimeout(() => after && after(), 420);
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  };
  document.addEventListener('keydown', (e) => {
    if (!openDlg) return;
    if (e.key === 'Escape') { openDlg === viewer ? closeViewer() : closeProject(); return; }
    if (openDlg === viewer && e.key === 'ArrowRight') stepViewer(1);
    if (openDlg === viewer && e.key === 'ArrowLeft') stepViewer(-1);
    if (e.key === 'Tab') {
      const f = focusables(openDlg); if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Credential viewer (images + PDF) ---------- */
  const viewer = $('#viewer'), vBody = $('#viewerBody'), vTitle = $('#viewerTitle'), vMeta = $('#viewerMeta'), vOpen = $('#viewerOpen'), vZoom = $('#viewerZoom');
  let vIndex = 0;
  const renderViewer = () => {
    const c = DS.certs[vIndex]; if (!c || !vBody) return;
    vBody.classList.remove('zoomed'); vBody.replaceChildren();
    if (c.kind === 'pdf') {
      vZoom.hidden = true;
      if (matchMedia('(pointer:coarse)').matches) { // phones/tablets cannot embed PDFs reliably: show page 1 + open link
        const w = document.createElement('div'); w.className = 'pdf-fallback';
        w.innerHTML = `<img src="${c.preview}" alt="${c.title} — page 1"><a class="btn btn-solid btn-sm" href="${c.src}" target="_blank" rel="noopener">Open full PDF ↗</a>`;
        vBody.appendChild(w);
      } else { const f = document.createElement('iframe'); f.src = c.src; f.title = `${c.title} (PDF)`; vBody.appendChild(f); }
    } else {
      const im = document.createElement('img'); im.src = c.src; im.alt = `${c.title} — ${c.issuer}`;
      im.addEventListener('click', () => vBody.classList.toggle('zoomed')); vBody.appendChild(im);
      vZoom.hidden = false;
    }
    vTitle.textContent = c.title; vMeta.textContent = `${c.issuer} · ${c.date}`; vOpen.href = c.src;
    vBody.scrollTo && vBody.scrollTo(0, 0);
  };
  const openViewer = (id) => { const i = DS.certs.findIndex((c) => c.id === id); if (i < 0) return; vIndex = i; renderViewer(); openDialog(viewer, '#viewerClose'); };
  const closeViewer = () => closeDialog(viewer, () => vBody.replaceChildren());
  const stepViewer = (d) => { vIndex = (vIndex + d + DS.certs.length) % DS.certs.length; renderViewer(); };
  if (viewer) {
    $('#viewerClose').addEventListener('click', closeViewer);
    $$('[data-close]', viewer).forEach((n) => n.addEventListener('click', closeViewer));
    $('#viewerPrev').addEventListener('click', () => stepViewer(-1));
    $('#viewerNext').addEventListener('click', () => stepViewer(1));
    vZoom.addEventListener('click', () => vBody.classList.toggle('zoomed'));
  }

  /* ---------- Project detail modal ---------- */
  const pview = $('#pview');
  const closeProject = () => closeDialog(pview);
  const openProject = (id) => {
    const p = DS.projects.find((x) => x.id === id); if (!p || !pview) return;
    $('#pvImg').src = p.img; $('#pvImg').alt = `${p.title} preview graphic`;
    $('#pvType').textContent = p.type; $('#pvTitle').textContent = p.title; $('#pvDesc').textContent = p.desc;
    $('#pvPoints').innerHTML = p.points.map((x) => `<li>${x}</li>`).join('');
    $('#pvTags').innerHTML = p.tags.map((t) => `<span>${t}</span>`).join('');
    $('#pvLinks').innerHTML = (p.live ? `<a class="btn btn-solid btn-sm" href="${p.live}" target="_blank" rel="noopener">Live demo ↗</a>` : '') + (p.repo ? `<a class="btn btn-ghost btn-sm" href="${p.repo}" target="_blank" rel="noopener">GitHub ↗</a>` : '') + (!p.live && !p.repo ? '<span class="mono" style="color:var(--mute)">Case study · no public link</span>' : '');
    openDialog(pview, '#pvClose');
  };
  if (pview) { $('#pvClose').addEventListener('click', closeProject); $$('[data-close]', pview).forEach((n) => n.addEventListener('click', closeProject)); }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-open]'); if (!b) return;
    b.dataset.open === 'cert' ? openViewer(b.dataset.id) : openProject(b.dataset.id);
  });

  /* ---------- Intro loader → hero reveal ---------- */
  const loader = $('#loader');
  const endIntro = () => { html.classList.remove('has-loader'); unlock(); try { sessionStorage.setItem('ds-intro', '1'); } catch (_) {} window.ScrollTrigger && window.ScrollTrigger.refresh(); };
  safe(() => {
    let ok = false;
    try { ok = DS.initFx(); } catch (e) {
      console.warn('[portfolio] animation init failed, using static layout', e);
      html.classList.remove('anim');
      if (window.gsap) window.gsap.set('.deck-card,.icard,.code-card,.ccard,[data-reveal]', { clearProps: 'all' });
    }
    if (!html.classList.contains('has-loader')) return;
    if (!ok || !loader) { html.classList.remove('has-loader'); return; }
    const { gsap } = window;
    let seen = false; try { seen = sessionStorage.getItem('ds-intro') === '1'; } catch (_) {}
    const num = $('#loaderNum'), barEl = $('#loaderBar'), counter = { v: 0 };
    DS.lenis && DS.lenis.stop();
    DS.fx.prepHero();
    gsap.set('.lm-d,.lm-s', { yPercent: 110 });
    let done = false;
    const finish = () => {
      if (done) return; done = true;
      num.textContent = '100'; barEl.style.transform = 'scaleX(1)';
      gsap.timeline({ onComplete: endIntro })
        .to('.loader-inner', { opacity: 0, y: -50, duration: 0.45, ease: 'power2.in' })
        .to('.loader-panel', { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '-=0.1')
        .add(() => DS.fx.playHero(), '-=0.75');
    };
    gsap.timeline()
      .to('.lm-d,.lm-s', { yPercent: 0, duration: 0.9, stagger: 0.12, ease: 'expo.out' }, 0)
      .to(counter, { v: 100, duration: seen ? 1.1 : 2.3, ease: 'power2.inOut',
        onUpdate: () => { num.textContent = Math.round(counter.v); barEl.style.transform = `scaleX(${counter.v / 100})`; } }, 0)
      .add(finish, '+=0.15');
    const skip = $('#loaderSkip'); skip && skip.addEventListener('click', finish);
    setTimeout(() => { if (!done) { finish(); } }, 9000);
    setTimeout(() => { if (html.classList.contains('has-loader')) { endIntro(); DS.fx && DS.fx.showAll(); } }, 14000); // last-resort failsafe
  });
})();
