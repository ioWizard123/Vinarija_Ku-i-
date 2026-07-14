/* ===== Vinarija Kušić — interakcije ===== */
(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- reveal on scroll --- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* --- mobilni izbornik --- */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open'); toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

  /* --- naša priča: "Pročitaj više" (mobitel + tablet) --- */
  const pricaBtn = document.getElementById('prica-more-btn');
  if (pricaBtn) {
    pricaBtn.addEventListener('click', () => {
      document.getElementById('nasa-prica').classList.add('prica-open');
      pricaBtn.setAttribute('aria-expanded', 'true');
    });
  }

  /* --- burger vidljiv tek nakon scrolla --- */
  let navTick = false;
  function updateScrolled() {
    document.body.classList.toggle('scrolled', window.scrollY > 40);
    navTick = false;
  }
  window.addEventListener('scroll', () => {
    if (!navTick) { requestAnimationFrame(updateScrolled); navTick = true; }
  }, { passive: true });
  updateScrolled();

  /* --- degustacije: pop-in bobica odozgo prema dolje --- */
  const grozdEl = document.getElementById('grozd');
  if (grozdEl) {
    const bobice = Array.from(grozdEl.querySelectorAll('.grozd-stem, .krug'));
    function popGrozd() {
      bobice.sort((a, b) => a.offsetTop - b.offsetTop);
      bobice.forEach((el, i) => { el.style.transitionDelay = (i * 90) + 'ms'; });
      grozdEl.classList.add('pop');
      setTimeout(() => {
        bobice.forEach(el => { el.style.transitionDelay = ''; });
        grozdEl.classList.add('pop-done');
      }, bobice.length * 90 + 700);
    }
    if ('IntersectionObserver' in window && !reduced) {
      const gio = new IntersectionObserver(es => {
        if (es[0].isIntersecting) { popGrozd(); gio.disconnect(); }
      }, { threshold: 0.25 });
      gio.observe(grozdEl);
    } else {
      grozdEl.classList.add('pop', 'pop-done');
    }
  }

  /* --- carousel proslave --- */
  const carousel = document.getElementById('carousel');
  if (carousel) {
    const track = carousel.querySelector('.car-track');
    const slides = track.children;
    const dotsBox = carousel.querySelector('.car-dots');
    let idx = 0;

    for (let i = 0; i < slides.length; i++) {
      const d = document.createElement('button');
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', 'Fotografija ' + (i + 1));
      d.addEventListener('click', () => go(i, true));
      dotsBox.appendChild(d);
    }
    const dots = dotsBox.children;

    /* bez automatske vrtnje: samo strelice (desktop), točkice i swipe */
    function go(i) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + idx * 100 + '%)';
      for (let k = 0; k < dots.length; k++) dots[k].classList.toggle('active', k === idx);
    }
    carousel.querySelector('.prev').addEventListener('click', () => go(idx - 1, true));
    carousel.querySelector('.next').addEventListener('click', () => go(idx + 1, true));

    /* swipe */
    let x0 = null;
    track.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1), true);
      x0 = null;
    }, { passive: true });

    go(0);
  }

  /* --- galerija: coverflow (po PDF predlošku) --- */
  const gf = document.getElementById('gflow');
  if (gf) {
    const cards = Array.from(gf.querySelectorAll('.gf-item'));
    const n = cards.length;
    let ci = 2; /* start: društvo u sredini, kao u PDF-u */

    function relOf(i) {
      let d = (i - ci + n) % n;
      return d > n / 2 ? d - n : d;
    }
    function render() {
      cards.forEach((c, i) => {
        const rel = relOf(i);
        const cls = rel === 0 ? 'gf-c' : rel === -1 ? 'gf-l1' : rel === 1 ? 'gf-r1'
                  : rel === -2 ? 'gf-l2' : rel === 2 ? 'gf-r2' : rel < 0 ? 'gf-hl' : 'gf-hr';
        c.className = 'gf-item ' + cls;
      });
    }
    cards.forEach((c, i) => {
      /* capture: klik na bočnu karticu lista, ne otvara lightbox */
      c.addEventListener('click', e => {
        const rel = relOf(i);
        if (rel !== 0) { e.stopPropagation(); e.preventDefault(); ci = i; render(); }
      }, true);
    });
    gf.querySelector('.gf-prev').addEventListener('click', () => { ci = (ci - 1 + n) % n; render(); });
    gf.querySelector('.gf-next').addEventListener('click', () => { ci = (ci + 1) % n; render(); });
    gf.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { ci = (ci - 1 + n) % n; render(); e.preventDefault(); }
      if (e.key === 'ArrowRight') { ci = (ci + 1) % n; render(); e.preventDefault(); }
    });
    /* swipe */
    let gx0 = null;
    gf.addEventListener('touchstart', e => { gx0 = e.touches[0].clientX; }, { passive: true });
    gf.addEventListener('touchend', e => {
      if (gx0 === null) return;
      const dx = e.changedTouches[0].clientX - gx0;
      if (Math.abs(dx) > 40) { ci = (ci + (dx < 0 ? 1 : -1) + n) % n; render(); }
      gx0 = null;
    }, { passive: true });
    render();

    /* ulazna animacija pri prvom dolasku u kadar */
    if (!reduced && 'IntersectionObserver' in window) {
      gf.classList.add('gf-pre', 'gf-intro');
      const io = new IntersectionObserver(es => {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        gf.classList.remove('gf-pre');
        void gf.offsetWidth; /* reflow: tranzicije kreću iz početnog stanja */
        gf.classList.add('gf-s1');
        setTimeout(() => gf.classList.add('gf-s2'), 750);
        setTimeout(() => gf.classList.remove('gf-s1', 'gf-s2'), 1400);
        /* strelice tek kad treći val (zadnje dvije) završi */
        setTimeout(() => gf.classList.remove('gf-intro'), 2050);
      }, { threshold: .3 });
      io.observe(gf);
    }
  }

  /* --- priznanja: parallax na slikama diploma --- */
  const awardMedia = Array.from(document.querySelectorAll('.award-media'));
  if (awardMedia.length && !reduced) {
    let awTick = false;
    function updateAwards() {
      const vh = window.innerHeight;
      awardMedia.forEach(m => {
        const r = m.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const center = r.top + r.height / 2;
        const p = (center - vh / 2) / (vh / 2);
        const shift = Math.max(-1, Math.min(1, p)) * 22;
        m.style.transform = 'translateY(' + shift.toFixed(1) + 'px)';
      });
      awTick = false;
    }
    window.addEventListener('scroll', () => {
      if (!awTick) { requestAnimationFrame(updateAwards); awTick = true; }
    }, { passive: true });
    window.addEventListener('resize', () => {
      if (!awTick) { requestAnimationFrame(updateAwards); awTick = true; }
    }, { passive: true });
    updateAwards();
  }

  /* --- lightbox --- */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCap = document.getElementById('lb-cap');
  const items = Array.from(document.querySelectorAll('[data-lightbox]'));
  /* grupiranje po sekciji: klik na diplomu lista samo diplome, na galeriju samo galeriju… */
  const groupOf = el => { const s = el.closest('section'); return (s && s.id) || 'stranica'; };
  let lbList = items;
  let lbIdx = 0;

  function openLb(i) {
    lbIdx = (i + lbList.length) % lbList.length;
    const el = lbList[lbIdx];
    lbImg.src = el.src;
    lbImg.alt = el.alt || '';
    lbCap.textContent = el.getAttribute('data-lightbox') || '';
    lb.hidden = false;
    requestAnimationFrame(() => lb.classList.add('open'));
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lb.hidden = true; lbImg.src = ''; }, 300);
  }
  items.forEach(el => el.addEventListener('click', () => {
    const g = groupOf(el);
    lbList = items.filter(x => groupOf(x) === g);
    openLb(lbList.indexOf(el));
  }));
  lb.querySelector('.lb-close').addEventListener('click', closeLb);
  lb.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); openLb(lbIdx - 1); });
  lb.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); openLb(lbIdx + 1); });
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') openLb(lbIdx - 1);
    if (e.key === 'ArrowRight') openLb(lbIdx + 1);
  });

  /* swipe u lightboxu */
  let lx0 = null;
  lb.addEventListener('touchstart', e => { lx0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (lx0 === null) return;
    const dx = e.changedTouches[0].clientX - lx0;
    if (Math.abs(dx) > 40) openLb(lbIdx + (dx < 0 ? 1 : -1));
    lx0 = null;
  }, { passive: true });

  /* --- priznanja: bento galerija s modalom i dockom --- */
  const bento = document.getElementById('dip-bento');
  const bmodal = document.getElementById('dip-modal');
  if (bento && bmodal) {
    const bItems = Array.from(bento.querySelectorAll('.bento-item'));
    const bmImg = document.getElementById('bm-img');
    const bmTitle = document.getElementById('bm-title');
    const bmDesc = document.getElementById('bm-desc');
    const dock = document.getElementById('bm-dock');
    let bIdx = 0;

    /* dock sličice */
    bItems.forEach((it, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', it.dataset.title + ' — ' + it.dataset.desc);
      const im = document.createElement('img');
      im.src = it.querySelector('img').src;
      im.alt = '';
      b.appendChild(im);
      b.addEventListener('click', e => { e.stopPropagation(); showB(i); });
      dock.appendChild(b);
    });
    const dockBtns = Array.from(dock.children);

    function showB(i) {
      bIdx = (i + bItems.length) % bItems.length;
      const it = bItems[bIdx];
      bmImg.src = it.querySelector('img').src;
      bmImg.alt = it.querySelector('img').alt;
      bmTitle.textContent = it.dataset.title;
      bmDesc.textContent = it.dataset.desc;
      dockBtns.forEach((d, k) => d.classList.toggle('active', k === bIdx));
      dockBtns[bIdx].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
    function openB(i) {
      showB(i);
      bmodal.hidden = false;
      requestAnimationFrame(() => bmodal.classList.add('open'));
      document.body.style.overflow = 'hidden';
    }
    function closeB() {
      bmodal.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => { bmodal.hidden = true; }, 300);
    }
    bItems.forEach((it, i) => it.addEventListener('click', () => openB(i)));
    bmodal.querySelector('.bm-close').addEventListener('click', closeB);
    bmImg.addEventListener('click', closeB);
    bmodal.addEventListener('click', e => { if (e.target === bmodal) closeB(); });
    document.addEventListener('keydown', e => {
      if (bmodal.hidden) return;
      if (e.key === 'Escape') closeB();
      if (e.key === 'ArrowLeft') showB(bIdx - 1);
      if (e.key === 'ArrowRight') showB(bIdx + 1);
    });
  }

  /* --- CTA typewriter --- */
  const tw = document.getElementById('cta-typewriter');
  if (tw) {
    const phrase = 'Svaka čaša priča priču.';
    const cursor = document.createElement('span');
    cursor.className = 'cta-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    let started = false;

    function typePhrase() {
      let i = 0;
      tw.textContent = '';
      tw.appendChild(cursor);
      const interval = reduced ? 0 : 65;
      if (reduced) { tw.insertBefore(document.createTextNode(phrase), cursor); return; }
      const t = setInterval(() => {
        tw.insertBefore(document.createTextNode(phrase[i]), cursor);
        i++;
        if (i >= phrase.length) clearInterval(t);
      }, interval);
    }

    const ctaObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        setTimeout(typePhrase, 300);
        ctaObs.disconnect();
      }
    }, { threshold: 0.4 });
    ctaObs.observe(tw);
  }

  /* --- godina u podnožju --- */
  document.getElementById('god').textContent = new Date().getFullYear();
})();
