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

  /* --- boce: vrtnja + panel --- */
  const wines = document.querySelectorAll('.wine');
  function closeAllPanels(except) {
    wines.forEach(w => {
      const panel = w.querySelector('.wine-panel');
      const btn = w.querySelector('.bottle-btn');
      if (panel !== except && panel.classList.contains('open')) {
        panel.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        setTimeout(() => { panel.hidden = true; }, 450);
      }
    });
  }
  wines.forEach(w => {
    const btn = w.querySelector('.bottle-btn');
    const img = w.querySelector('.bottle-img');
    const panel = w.querySelector('.wine-panel');
    const close = w.querySelector('.panel-close');

    btn.addEventListener('click', () => {
      if (panel.classList.contains('open')) { closeAllPanels(null); return; }
      closeAllPanels(panel);
      if (!reduced) {
        img.classList.remove('spin');
        void img.offsetWidth; /* restart animacije */
        img.classList.add('spin');
      }
      panel.hidden = false;
      const delay = reduced ? 0 : 620;
      setTimeout(() => {
        panel.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }, delay);
    });
    close.addEventListener('click', (e) => { e.stopPropagation(); closeAllPanels(null); });
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllPanels(null); });
  document.addEventListener('click', e => {
    if (!e.target.closest('.wine')) closeAllPanels(null);
  });

  /* --- degustacije: zum grozda pri scrollu --- */
  const grozd = document.getElementById('grozd');
  if (grozd && !reduced) {
    let ticking = false;
    function updateZoom() {
      const r = grozd.getBoundingClientRect();
      const vh = window.innerHeight;
      /* napredak: 0 kad grozd ulazi odozdo, 1 kad mu je sredina u sredini ekrana */
      const progress = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.55 + r.height * 0.5)));
      const zoom = 0.78 + 0.22 * easeOut(progress);
      grozd.style.setProperty('--zoom', zoom.toFixed(3));
      ticking = false;
    }
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(updateZoom); ticking = true; }
    }, { passive: true });
    updateZoom();
  } else if (grozd) {
    grozd.style.setProperty('--zoom', '1');
  }

  /* --- carousel proslave --- */
  const carousel = document.getElementById('carousel');
  if (carousel) {
    const track = carousel.querySelector('.car-track');
    const slides = track.children;
    const dotsBox = carousel.querySelector('.car-dots');
    let idx = 0, timer = null;

    for (let i = 0; i < slides.length; i++) {
      const d = document.createElement('button');
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', 'Fotografija ' + (i + 1));
      d.addEventListener('click', () => go(i, true));
      dotsBox.appendChild(d);
    }
    const dots = dotsBox.children;

    function go(i, user) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + idx * 100 + '%)';
      for (let k = 0; k < dots.length; k++) dots[k].classList.toggle('active', k === idx);
      if (user) restart();
    }
    function restart() {
      clearInterval(timer);
      if (!reduced) timer = setInterval(() => go(idx + 1, false), 5000);
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

    go(0, false); restart();
  }

  /* --- lightbox --- */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCap = document.getElementById('lb-cap');
  const items = Array.from(document.querySelectorAll('[data-lightbox]'));
  let lbIdx = 0;

  function openLb(i) {
    lbIdx = (i + items.length) % items.length;
    const el = items[lbIdx];
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
  items.forEach((el, i) => el.addEventListener('click', () => openLb(i)));
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

  /* --- godina u podnožju --- */
  document.getElementById('god').textContent = new Date().getFullYear();
})();
