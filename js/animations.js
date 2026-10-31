/* GSAP + ScrollTrigger + Lenis layer.
   Everything is guarded: if the CDN scripts fail to load, or the visitor prefers reduced motion,
   DS.fx stays undefined and the page remains fully visible and usable. */
(() => {
  'use strict';
  const DS = (window.DS = window.DS || {});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  DS.canAnimate = () => typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined' && !matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CLEAR = 'transform,opacity,filter,clipPath,visibility';

  /* ----- Text splitting (preserves inline elements such as the gradient spans) ----- */
  const splitText = (el, mode) => {
    if (!el || el.dataset.splitDone) return [];
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-label', label);
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
            if (mode === 'chars') {
              w.style.whiteSpace = 'nowrap';
              [...part].forEach((c) => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; w.appendChild(s); });
            } else { const s = document.createElement('span'); s.className = 'wi'; s.textContent = part; w.appendChild(s); }
            frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el); el.dataset.splitDone = '1';
    return $$(mode === 'chars' ? '.ch' : '.wi', el);
  };
  const splitSimple = (el) => {
    const t = el.textContent.trim(); el.setAttribute('aria-label', t); el.textContent = '';
    return t.split(/\s+/).map((word, i, a) => { const s = document.createElement('span'); s.className = 'sw'; s.setAttribute('aria-hidden', 'true'); s.textContent = word + (i < a.length - 1 ? ' ' : ''); el.appendChild(s); return s; });
  };

  const RAG_TEXT = [
    ['Indexing', 'Documents are collected as the knowledge the system can draw from.'],
    ['Indexing', 'Long documents are split into passages small enough to retrieve precisely.'],
    ['Indexing', 'Each passage is converted into an embedding that captures its meaning.'],
    ['Indexing', 'Embeddings are stored in a vector index, such as FAISS, for fast similarity search.'],
    ['Answering', 'The user asks a question in natural language.'],
    ['Answering', 'The question is embedded and the top-K most similar passages are retrieved.'],
    ['Answering', 'The language model receives the question plus the retrieved context in its prompt.'],
    ['Answering', 'The answer is grounded in the retrieved sources, so it can be checked against them.']
  ];

  DS.fx = null;

  DS.initFx = () => {
    if (!DS.canAnimate() || DS.fx) return !!DS.fx;
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('anim');
    const fx = (DS.fx = {});
    const heroSel = {
      words: () => $$('#heroTitle .wi'),
      fades: () => $$('[data-hero="fade"]'),
    };

    /* ---- Smooth scrolling (Lenis) wired into the GSAP ticker ---- */
    if (typeof window.Lenis !== 'undefined') {
      const lenis = (DS.lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true }));
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    /* ---- Split text ---- */
    $$('[data-split="words"]').forEach((el) => splitText(el, 'words'));
    $$('[data-split="chars"]').forEach((el) => splitText(el, 'chars'));

    /* ---- Hero: initial hidden state + intro timeline (played after the loader) ---- */
    fx.prepHero = () => {
      gsap.set(heroSel.words(), { yPercent: 115, opacity: 0, filter: 'blur(14px)' });
      gsap.set(heroSel.fades(), { y: 26, opacity: 0 });
      gsap.set('.portrait-img', { clipPath: 'inset(100% 0% 0% 0% round 32px)' });
      gsap.set('.portrait-img img', { scale: 1.35 });
      gsap.set(['.portrait-border', '.portrait-cap'], { opacity: 0 });
      gsap.set('.orbit', { scale: 0.55, opacity: 0 });
      gsap.set('.chip', { scale: 0, opacity: 0 });
      gsap.set('.scroll-cue', { opacity: 0 });
      gsap.set('.nav', { yPercent: -160 });
    };
    fx.playHero = () => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.to('.nav', { yPercent: 0, duration: 1.1, clearProps: 'transform' }, 0)
        .to(heroSel.words(), { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.3, stagger: 0.075, clearProps: 'filter,transform,opacity' }, 0.05)
        .to(heroSel.fades(), { y: 0, opacity: 1, duration: 1, stagger: 0.1, clearProps: CLEAR }, 0.35)
        .to('.portrait-img', { clipPath: 'inset(0% 0% 0% 0% round 32px)', duration: 1.5, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.2)
        .to('.portrait-img img', { scale: 1.04, duration: 1.9, ease: 'power3.out', clearProps: 'transform' }, 0.2)
        .to(['.portrait-border', '.portrait-cap'], { opacity: 1, duration: 1, stagger: 0.15, clearProps: 'opacity' }, 0.9)
        .to('.orbit', { scale: 1, opacity: 1, duration: 1.6, stagger: 0.15, ease: 'power3.out', clearProps: 'transform,opacity' }, 0.3)
        .to('.chip', { scale: 1, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'back.out(1.8)', clearProps: 'transform,opacity' }, 1.0)
        .to('.scroll-cue', { opacity: 1, duration: 1, clearProps: 'opacity' }, 1.5);
      return tl;
    };
    fx.showAll = () => {
      gsap.set([...heroSel.words(), ...heroSel.fades(), '.portrait-img', '.portrait-img img', '.portrait-border', '.portrait-cap', '.orbit', '.chip', '.scroll-cue', '.nav'], { clearProps: 'all' });
    };

    /* ---- Project deck: stacking scrub + filter transition ---- */
    let deckTw = [];
    fx.rebuildDeck = () => {
      deckTw.forEach((t) => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); }); deckTw = [];
      const cards = $$('.deck-card').filter((c) => !c.hidden);
      cards.forEach((c) => { c.style.removeProperty('--veil'); gsap.set(c, { clearProps: 'scale,y' }); });
      if (!matchMedia('(min-width: 901px) and (min-height: 641px)').matches) return;
      cards.forEach((c, k) => {
        const next = cards[k + 1]; if (!next) return;
        deckTw.push(gsap.to(c, { scale: 0.93, '--veil': 0.62, ease: 'none',
          scrollTrigger: { trigger: next, start: 'top 94%', end: () => 'top ' + (92 + (k + 1) * 22) + 'px', scrub: true, invalidateOnRefresh: true } }));
      });
    };
    let drt; addEventListener('resize', () => { clearTimeout(drt); drt = setTimeout(() => { fx.rebuildDeck(); ScrollTrigger.refresh(); }, 250); });

    fx.filter = (els, show) => {
      const vis = els.filter((e) => !e.hidden), next = els.filter(show), out = vis.filter((e) => !show(e));
      gsap.killTweensOf(els);
      const tl = gsap.timeline({ onComplete: () => ScrollTrigger.refresh() });
      if (out.length) tl.to(out, { opacity: 0, y: 30, scale: 0.94, duration: 0.3, ease: 'power2.in', stagger: 0.04 });
      tl.add(() => {
        els.forEach((e) => { e.hidden = !show(e); });
        gsap.set(els, { clearProps: 'transform,opacity' });
        fx.rebuildDeck();
        gsap.set(next, { opacity: 0, y: 50 });
        ScrollTrigger.refresh();
      });
      tl.to(next, { opacity: 1, y: 0, duration: 0.75, stagger: 0.09, ease: 'power3.out', clearProps: 'transform,opacity', onComplete: fx.rebuildDeck });
      return tl;
    };

    /* ---- Scroll-based reveals ---- */
    // Headings: masked word-by-word reveal with blur-to-focus
    $$('.sec-head [data-split="words"]').forEach((h) => {
      gsap.from($$('.wi', h), { yPercent: 115, opacity: 0, filter: 'blur(12px)', rotate: 2, duration: 1.1, stagger: 0.06, ease: 'power4.out', clearProps: 'filter,transform,opacity',
        scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
    });
    const ct = $('#contactTitle');
    if (ct) gsap.from($$('.ch', ct), { yPercent: 120, opacity: 0, rotate: 6, filter: 'blur(10px)', duration: 1, stagger: 0.022, ease: 'power4.out', clearProps: 'filter,transform,opacity',
      scrollTrigger: { trigger: ct, start: 'top 85%', once: true } });

    // Generic fade-ups
    $$('[data-reveal]:not([data-tilt])').forEach((el) => {
      gsap.from(el, { y: 36, opacity: 0, filter: 'blur(8px)', duration: 0.9, ease: 'power3.out', clearProps: CLEAR, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });

    // Staggered card entrances (batched), then tilt takes over thanks to clearProps
    const batchIn = (sel, opts = {}) => {
      const items = $$(sel); if (!items.length) return;
      gsap.set(items, { opacity: 0, y: opts.y || 60, scale: 0.96 });
      ScrollTrigger.batch(items, { start: 'top 92%', once: true,
        onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, scale: 1, duration: 0.95, stagger: 0.12, ease: 'power3.out', clearProps: 'transform,opacity' }) });
    };
    batchIn('.icard', { y: 40 }); batchIn('.code-card'); batchIn('.ccard', { y: 40 });

    // Project deck: entrance, parallax inside the browser frame, stacking scrub
    $$('.deck-card').forEach((c) => {
      const info = $$('.dk-info > *', c), media = $('.dk-media', c), par = $('.dk-par', c), once = { trigger: c, start: 'top 80%', once: true };
      gsap.from(info, { y: 44, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', clearProps: CLEAR, scrollTrigger: once });
      gsap.from(media, { x: 80, opacity: 0, rotate: 2, clipPath: 'inset(0% 0% 0% 100% round 20px)', duration: 1.3, ease: 'expo.out', clearProps: CLEAR, scrollTrigger: once });
      gsap.from($('.dk-ghost', c), { xPercent: 20, opacity: 0, duration: 1.6, ease: 'power3.out', clearProps: CLEAR, scrollTrigger: once });
      if (par) gsap.fromTo(par, { yPercent: -3 }, { yPercent: 3, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    fx.rebuildDeck();

    // Skill lab: rail slides in, orbit spins into place, lanes rise
    const lab = $('#lab');
    if (lab) {
      const t = { trigger: lab, start: 'top 80%', once: true };
      gsap.from($$('.tab', lab), { x: -40, opacity: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out', clearProps: CLEAR, scrollTrigger: t });
      gsap.from($('.lab-stage', lab), { scale: 0.7, rotate: -40, opacity: 0, duration: 1.6, ease: 'expo.out', clearProps: CLEAR, scrollTrigger: t });
      gsap.from($('.lab-read', lab), { y: 50, opacity: 0, duration: 1, delay: 0.25, ease: 'power3.out', clearProps: CLEAR, scrollTrigger: t });
    }
    $$('.lane').forEach((l, i) => gsap.from(l, { y: 40, opacity: 0, duration: 0.9, delay: i * 0.1, ease: 'power3.out', clearProps: CLEAR, scrollTrigger: { trigger: '#skillLanes', start: 'top 92%', once: true } }));

    // Statement: words light up as you scroll through it
    const st = $('#statement');
    if (st) {
      const words = splitSimple(st);
      gsap.fromTo(words, { opacity: 0.14 }, { opacity: 1, ease: 'none', stagger: 0.08, scrollTrigger: { trigger: st, start: 'top 82%', end: 'bottom 48%', scrub: true } });
    }

    // Animated counters (only real values from the résumé / certificates)
    $$('[data-count]').forEach((el) => {
      const target = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || '0', 10), suf = el.dataset.suffix || '';
      const o = { v: 0 }; el.textContent = (0).toFixed(dec) + suf;
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: target, duration: 2.2, ease: 'power3.out',
        onUpdate: () => { el.textContent = (dec ? o.v.toFixed(dec) : Math.round(o.v).toLocaleString('en-US')) + suf; },
        onComplete: () => { el.textContent = (dec ? target.toFixed(dec) : target.toLocaleString('en-US')) + suf; } }) });
    });
    const arc = $('#eduArc');
    if (arc) gsap.fromTo(arc, { strokeDashoffset: 100 }, { strokeDashoffset: 19.5, duration: 2.2, ease: 'power3.out', scrollTrigger: { trigger: arc, start: 'top 85%', once: true } });

    // Timeline: animated line + scroll-triggered events
    const tlEl = $('#timeline');
    if (tlEl) {
      gsap.fromTo(tlEl, { '--p': 0 }, { '--p': 1, ease: 'none', scrollTrigger: { trigger: tlEl, start: 'top 70%', end: 'bottom 70%', scrub: 0.4 } });
      $$('.tl-item', tlEl).forEach((it) => {
        ScrollTrigger.create({ trigger: it, start: 'top 72%', onEnter: () => it.classList.add('on'), onLeaveBack: () => it.classList.remove('on') });
        const d = $('.tl-date', it), c = $('.tl-card', it);
        gsap.from(d, { x: -40, opacity: 0, duration: 1, ease: 'power3.out', clearProps: CLEAR, scrollTrigger: { trigger: it, start: 'top 85%', once: true } });
        gsap.from(c, { x: 60, opacity: 0, duration: 1.1, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: it, start: 'top 85%', once: true } });
      });
    }

    /* ---- Hero scroll parallax ---- */
    const heroST = { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.hero-copy', { yPercent: -14, opacity: 0.25, ease: 'none', scrollTrigger: heroST });
    gsap.to('#heroStage', { yPercent: -10, ease: 'none', scrollTrigger: heroST });
    gsap.to('.hero-canvas', { yPercent: 18, ease: 'none', scrollTrigger: heroST });
    gsap.to('.scroll-cue', { opacity: 0, ease: 'none', scrollTrigger: { trigger: '#home', start: 'top top', end: '25% top', scrub: true } });
    gsap.to('.amb-a', { yPercent: 25, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true } });
    gsap.to('.amb-c', { yPercent: -30, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true } });

    /* ---- Marquee reacts to scroll velocity ---- */
    const skewEl = $('#marqueeSkew');
    if (skewEl) {
      let target = 0, cur = 0;
      ScrollTrigger.create({ onUpdate: (self) => { target = gsap.utils.clamp(-9, 9, self.getVelocity() / -260); } });
      gsap.ticker.add(() => { target *= 0.9; cur += (target - cur) * 0.14; if (Math.abs(cur) > 0.01 || Math.abs(target) > 0.01) skewEl.style.transform = `skewX(${cur.toFixed(2)}deg)`; else if (skewEl.style.transform) skewEl.style.transform = ''; });
    }

    /* ---- Pinned storytelling + horizontal gallery (desktop only) ---- */
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1101px) and (min-height: 680px)', () => {
      const pin = $('#ragPin'), rag = $('#rag'), fill = $('#ragFill');
      if (!pin || !rag) return;
      const steps = $$('.rag-step'), lane = $('#ragLane'), txt = $('#ragText');
      rag.classList.add('is-live');
      let cur = -1;
      const setStep = (p) => {
        const i = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999));
        fill.style.setProperty('--p', p.toFixed(3));
        if (i === cur) return; cur = i;
        steps.forEach((s, k) => { s.classList.toggle('on', k === i); s.classList.toggle('done', k < i); });
        lane.textContent = RAG_TEXT[i][0]; txt.textContent = RAG_TEXT[i][1];
      };
      fill.style.setProperty('--p', 0); setStep(0);
      ScrollTrigger.create({ trigger: pin, start: 'top top', end: '+=2000', pin: true, scrub: true, anticipatePin: 1, onUpdate: (s) => setStep(s.progress) });
      return () => { rag.classList.remove('is-live'); steps.forEach((s) => s.classList.remove('on', 'done')); fill.style.setProperty('--p', 1); };
    });
    mm.add('(min-width: 901px) and (min-height: 600px)', () => {
      const pin = $('#certPin'), vp = $('.certs-viewport'), track = $('#certTrack');
      if (!pin || !vp || !track) return;
      vp.classList.add('is-pinned');
      const dist = () => Math.max(0, track.offsetWidth - (vp.clientWidth - 2 * parseFloat(getComputedStyle(vp).paddingLeft)));
      gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: pin, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 } });
      return () => { vp.classList.remove('is-pinned'); gsap.set(track, { clearProps: 'transform' }); };
    });

    /* ---- Keep trigger positions accurate as fonts/images settle ---- */
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', () => setTimeout(refresh, 200));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(refresh, 100));
    let rt; window.addEventListener('orientationchange', () => { clearTimeout(rt); rt = setTimeout(refresh, 400); });

    // Failsafe: never leave content invisible if a trigger misfires.
    setTimeout(() => {
      $$('[data-reveal],.icard,.code-card,.ccard,.edu,.deck-card').forEach((el) => {
        if (getComputedStyle(el).opacity === '0' && el.getBoundingClientRect().top < window.innerHeight * 0.95) gsap.to(el, { opacity: 1, y: 0, scale: 1, filter: 'none', duration: 0.5, clearProps: CLEAR });
      });
    }, 9000);

    return true;
  };
})();
