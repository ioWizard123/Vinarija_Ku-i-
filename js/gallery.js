/* ===== Vinarija Kušić — Priznanja OGL horizontal gallery ===== */
import {
  Camera, Mesh, Plane, Program, Renderer, Texture, Transform
} from 'https://esm.sh/ogl@1.0.11';

/* ---- helpers ---- */
function lerp(a, b, t) { return a + (b - a) * t; }
function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

/* ---- 34 nagrada images ---- */
const ITEMS = Array.from({ length: 34 }, (_, i) => ({
  image: 'assets/img/nagrada-' + String(i + 1).padStart(2, '0') + '.jpg'
}));

/* custom opis po slici (indeks 0 = nagrada-01) */
const DESCRIPTIONS = [
  { title: 'Srebrna diploma',   text: '41. izložba vina kontinentalne Hrvatske — za vino Mješavina sorata, berba 2008.\nSveti Ivan Zelina, 2009.' },                       // 01
  { title: 'Srebrna diploma',   text: '41. izložba vina kontinentalne Hrvatske — za vino Mješavina sorata, berba 2008.\nSveti Ivan Zelina, 2009.' },                       // 02
  { title: 'Brončana diploma',  text: '40. izložba vina kontinentalne Hrvatske — za vino Mješavina sorata, berba 2007.\nSveti Ivan Zelina, 2008.' },                       // 03
  { title: 'Brončana diploma',  text: '36. izložba vina kontinentalne Hrvatske — za vino Mješavina sorata, berba 2003.\nSveti Ivan Zelina, 2004.' },                       // 04
  { title: 'Zlatna medalja',    text: 'Novosadski sajam — Mješavina sorata, 11,9% vol. alk., berba 2008.\nNovi Sad, 2009.' },                                                // 05
  { title: 'Srebrna medalja',   text: 'XVI. izložba vina „Vivodina" (Udruga Ozalj) — mješavina bijelih sorata.\nVivodina, 2008.' },                                          // 06
  { title: 'Srebrna medalja',   text: 'Novosadski sajam — „Kapljica", stolno bijelo vino, 12,2% vol. alk., 2007.\nNovi Sad, 2008.' },                                        // 07
  { title: 'Zid priznanja',     text: 'Diplome Novosadskog sajma i priznanje Turističke zajednice Sv. Ivana Zeline obitelji Kušić.' },                                        // 08
  { title: 'Podrumski zid odličja', text: 'Zlatne, srebrne i brončane diplome kroz desetljeća, uz uvjerenje voditelja podruma.' },                                          // 09
  { title: 'Obiteljski podrum', text: 'Zid ovjenčan priznanjima u obnovljenoj podrumskoj kući iz 1930. godine.' },                                                          // 10
  { title: 'Novija priznanja',  text: 'Odličja Ivice Kušića iz Virovitice i Brckovljana — Graševina, Mješavina i Cabernet.' },                                               // 11
  { title: 'Kušaonica Vina Kušić', text: 'Zid diploma koji dočekuje goste na degustacijama u obiteljskoj kušaonici.' },                                                     // 12
  { title: 'Tri zlatne diplome', text: 'Udruga općine Brckovljani — Graševina, Cabernet Sauvignon i Mješavina, 2024.' },                                                    // 13
  { title: 'Zlatna diploma',    text: 'Vinogradarsko-vinarska udruga općine Brckovljani — za vino Graševina.\nBrckovljani, 2024.' },                                         // 14
  { title: 'Zlatna diploma',    text: 'Vinogradarsko-vinarska udruga općine Brckovljani — za vino Cabernet Sauvignon.\nBrckovljani, 2024.' },                                // 15
  { title: 'Zlatna diploma',    text: 'Vinogradarsko-vinarska udruga općine Brckovljani — za vino Mješavina.\nBrckovljani, 2024.' },                                         // 16
  { title: 'Srebrna diploma',   text: '57. izložba vina kontinentalne Hrvatske — za vino Graševina, berba 2024.\nSveti Ivan Zelina, 2025.' },                                // 17
  { title: 'Brončana diploma',  text: '16. izložba Zagrebačkog vinogorja — za vino Mješavina BS, berba 2021.\nMoravče, 2022.' },                                             // 18
  { title: 'Brončana diploma',  text: '15. izložba Zagrebačkog vinogorja — za vino Graševina, berba 2020.\nMoravče, 2020.' },                                                // 19
  { title: 'Srebrna diploma',   text: 'Vinogradarsko-vinarska udruga općine Brckovljani — za vino Graševina.\nBrckovljani, 2025.' },                                         // 20
  { title: 'Srebrna diploma',   text: 'Vinogradarsko-vinarska udruga općine Brckovljani — za vino Mješavina.\nBrckovljani, 2025.' },                                         // 21
  { title: 'Zahvalnica',        text: 'Moto racing klub Sveti Ivan Zelina — Vinima Kušić za poseban doprinos radu kluba, 2026.' },                                           // 22
  { title: 'Brončana diploma',  text: '15. izložba Zagrebačkog vinogorja — za vino Mješavina BS, berba 2020.\nMoravče, 2020.' },                                             // 23
  { title: 'Srebrna diploma',   text: '16. izložba Zagrebačkog vinogorja — za vino Graševina, berba 2021.\nMoravče, 2022.' },                                                // 24
  { title: 'Srebrna diploma',   text: '14. izložba vina Dugoselsko-vrbovečkog vinogorja — za vino Mješavina, berba 2020.\nŠtakorovec, 2021.' },                              // 25
  { title: 'Brončano odličje',  text: '„Sveti Vinko" Virovitica, 28. izložba vina — za vino Cabernet Sauvignon.\nVirovitica, 2022.' },                                       // 26
  { title: 'Brončano odličje',  text: '„Sveti Vinko" Virovitica, 28. izložba vina — za vino Mješavina bijelih sorata.\nVirovitica, 2022.' },                                 // 27
  { title: 'Srebrno odličje',   text: '„Sveti Vinko" Virovitica, 28. izložba vina — za vino Graševina.\nVirovitica, 2022.' },                                                // 28
  { title: 'Zahvalnica',        text: '14. izložba vina Dugoselsko-vrbovečkog vinogorja — za izloženo vino Graševina, berba 2020.\nŠtakorovec, 2021.' },                     // 29
  { title: 'Srebrno odličje',   text: '„Sveti Vinko" Virovitica, 29. izložba vina — za vino Graševina.\nVirovitica, 2023.' },                                                // 30
  { title: 'Srebrno odličje',   text: '„Sveti Vinko" Virovitica, 29. izložba vina — za vino Cabernet Sauvignon.\nVirovitica, 2023.' },                                       // 31
  { title: 'Brončano odličje',  text: '„Sveti Vinko" Virovitica, 29. izložba vina — za vino Mješavina bijelih sorata.\nVirovitica, 2023.' },                                 // 32
  { title: 'Zlatno odličje',    text: '„Sveti Vinko" Virovitica (Viroexpo), 31. izložba vina — za vino Mješavina bij. sorata.\nVincekovo 2025, Virovitica.' },               // 33
  { title: 'Srebrno odličje',   text: '„Sveti Vinko" Virovitica (Viroexpo), 31. izložba vina — za vino Graševina.\nVincekovo 2025, Virovitica.' }                            // 34
];

/* ---- Media: one image plane ---- */
class Media {
  constructor({ gl, geometry, scene, screen, viewport, image, index, length, bend, borderRadius }) {
    Object.assign(this, { gl, geometry, scene, screen, viewport, image, index, length, bend, borderRadius });
    this.extra = 0; this.padding = 2; this.speed = 0;
    this.focus = 0;            /* 0..1 — koliko je slika blizu centra */
    this._shader(); this._mesh(); this.onResize();
  }

  _shader() {
    const tex = new Texture(this.gl, { generateMipmaps: true });
    this.program = new Program(this.gl, {
      depthTest: false, depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position; attribute vec2 uv;
        uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes, uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;
        float rBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p)-b; return length(max(d,vec2(0.)))+min(max(d.x,d.y),0.)-r;
        }
        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x/uPlaneSizes.y)/(uImageSizes.x/uImageSizes.y),1.0),
            min((uPlaneSizes.y/uPlaneSizes.x)/(uImageSizes.y/uImageSizes.x),1.0)
          );
          vec2 uv = vec2(vUv.x*ratio.x+(1.-ratio.x)*.5, vUv.y*ratio.y+(1.-ratio.y)*.5);
          vec4 col = texture2D(tMap, uv);
          float d = rBoxSDF(vUv-.5, vec2(.5-uBorderRadius), uBorderRadius);
          gl_FragColor = vec4(col.rgb, col.a*(1.-smoothstep(-.002,.002,d)));
        }
      `,
      uniforms: {
        tMap: { value: tex },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uBorderRadius: { value: this.borderRadius }
      },
      transparent: true
    });
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      tex.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }

  _mesh() {
    this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
    this.plane.setParent(this.scene);
  }

  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) this.viewport = viewport;
    const scale = this.screen.height / 1500;
    this.baseY = (this.viewport.height * (900 * scale)) / this.screen.height;
    this.baseX = (this.viewport.width  * (700 * scale)) / this.screen.width;
    this.plane.scale.y = this.baseY;
    this.plane.scale.x = this.baseX;
    this.program.uniforms.uPlaneSizes.value = [this.baseX, this.baseY];
    this.padding    = 2;
    this.width      = this.baseX + this.padding;
    this.widthTotal = this.width * this.length;
    this.x          = this.width * this.index;
  }

  update(scroll, dir) {
    this.plane.position.x = this.x - scroll.current - this.extra;
    const x = this.plane.position.x, H = this.viewport.width / 2;

    /* --- fokus: slika u sredini je veća --- */
    this.focus = Math.max(0, 1 - Math.abs(x) / (this.width * 1.15));
    const s = 1 + this.focus * 0.24;               /* centar ~1.24x */
    this.plane.scale.x = this.baseX * s;
    this.plane.scale.y = this.baseY * s;
    this.plane.position.z = this.focus * 0.6;      /* centar malo naprijed */

    /* --- krivina (bend) --- */
    if (this.bend === 0) {
      this.plane.position.y = 0; this.plane.rotation.z = 0;
    } else {
      const B = Math.abs(this.bend), R = (H*H + B*B) / (2*B);
      const ex = Math.min(Math.abs(x), H);
      const arc = R - Math.sqrt(R*R - ex*ex);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(ex / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z =  Math.sign(x) * Math.asin(ex / R);
      }
    }

    const po = this.plane.scale.x / 2, vo = this.viewport.width / 2;
    if (dir === 'right' && this.plane.position.x + po < -vo) this.extra -= this.widthTotal;
    if (dir === 'left'  && this.plane.position.x - po >  vo) this.extra += this.widthTotal;
  }
}

/* ---- Card modal (HTML overlay) ---- */
function buildModal() {
  const m = document.createElement('div');
  m.className = 'pg-modal';
  m.hidden = true;
  m.innerHTML =
    '<div class="pg-modal-backdrop"></div>' +
    '<figure class="pg-modal-card" role="dialog" aria-modal="true" aria-label="Priznanje">' +
      '<button class="pg-modal-close" aria-label="Zatvori">&times;</button>' +
      '<div class="pg-modal-media"><img class="pg-modal-img" alt="Priznanje Vinarije Kušić"></div>' +
      '<figcaption class="pg-modal-body">' +
        '<h3 class="pg-modal-title"></h3>' +
        '<span class="pg-modal-rule" aria-hidden="true"></span>' +
        '<p class="pg-modal-desc"></p>' +
      '</figcaption>' +
    '</figure>';
  document.body.appendChild(m);
  return m;
}

/* ---- App ---- */
class GalleryApp {
  constructor(container, { bend = 3, borderRadius = 0.05, scrollSpeed = 2, scrollEase = 0.05 } = {}) {
    this.container   = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll      = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.isDown = false; this.start = 0; this.moved = 0;
    this._check = debounce(this.__check.bind(this), 200);

    /* renderer */
    this.renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(devicePixelRatio || 1, 2) });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    container.appendChild(this.gl.canvas);

    /* camera */
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;

    this.scene = new Transform();
    this._measure();

    const geo = new Plane(this.gl, { heightSegments: 10, widthSegments: 20 });
    const all = [...ITEMS, ...ITEMS];
    this.medias = all.map((it, i) => new Media({
      gl: this.gl, geometry: geo, scene: this.scene,
      screen: this.screen, viewport: this.viewport,
      image: it.image, index: i, length: all.length,
      bend, borderRadius
    }));

    this.modal = buildModal();
    this._wireModal();

    this._raf = requestAnimationFrame(this._tick.bind(this));
    this._listen();
  }

  _measure() {
    this.screen = { width: this.container.clientWidth, height: this.container.clientHeight };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const fov = this.camera.fov * Math.PI / 180;
    const h = 2 * Math.tan(fov / 2) * this.camera.position.z;
    this.viewport = { width: h * this.camera.aspect, height: h };
  }

  _tick() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const dir = this.scroll.current > this.scroll.last ? 'right' : 'left';
    this.medias.forEach(m => m.update(this.scroll, dir));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this._raf = requestAnimationFrame(this._tick.bind(this));
  }

  __check() {
    if (!this.medias[0]) return;
    const w = this.medias[0].width;
    const idx = Math.round(Math.abs(this.scroll.target) / w);
    const snap = w * idx;
    this.scroll.target = this.scroll.target < 0 ? -snap : snap;
  }

  /* koja je slika najbliža poziciji klika */
  _pickImageAt(clientX) {
    const rect = this.container.getBoundingClientRect();
    const px = (clientX - rect.left) / rect.width;
    const vx = (px - 0.5) * this.viewport.width;
    let best = null, bestDist = Infinity;
    for (const m of this.medias) {
      const d = Math.abs(m.plane.position.x - vx);
      if (d < bestDist) { bestDist = d; best = m; }
    }
    return best;
  }

  /* --- modal open/close --- */
  _wireModal() {
    const close = () => this._closeModal();
    this.modal.querySelector('.pg-modal-close').addEventListener('click', close);
    this.modal.querySelector('.pg-modal-backdrop').addEventListener('click', close);
    document.addEventListener('keydown', e => {
      if (!this.modal.hidden && e.key === 'Escape') close();
    });
  }
  _openModal(media) {
    if (!media) return;
    const info = DESCRIPTIONS[media.index % DESCRIPTIONS.length] || { title: 'Priznanje Vinarije Kušić', text: '' };
    this.modal.querySelector('.pg-modal-img').src = media.image;
    this.modal.querySelector('.pg-modal-title').textContent = info.title;
    /* opis: prelomi \n u <br> */
    this.modal.querySelector('.pg-modal-desc').innerHTML =
      info.text.split('\n').map(s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))).join('<br>');
    this.modal.hidden = false;
    requestAnimationFrame(() => this.modal.classList.add('open'));
    document.body.style.overflow = 'hidden';
  }
  _closeModal() {
    this.modal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { this.modal.hidden = true; }, 300);
  }

  _listen() {
    const onResize = () => {
      this._measure();
      this.medias.forEach(m => m.onResize({ screen: this.screen, viewport: this.viewport }));
    };
    const onWheel = e => {
      const d = e.deltaY || e.wheelDelta || e.detail;
      this.scroll.target += (d > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
      this._check();
    };
    const onDown = e => {
      this.isDown = true; this.moved = 0;
      this._pos = this.scroll.current;
      this.start  = 'touches' in e ? e.touches[0].clientX : e.clientX;
      this.startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    };
    const onMove = e => {
      if (!this.isDown) return;
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
      this.moved = Math.max(this.moved, Math.hypot(x - this.start, y - this.startY));
      this.scroll.target = this._pos + (this.start - x) * this.scrollSpeed * 0.025;
    };
    const onUp = e => {
      if (this.isDown && this.moved < 9) {
        /* klik (ne povlačenje) → otvori karticu */
        const cx = e && e.changedTouches ? e.changedTouches[0].clientX : (e ? e.clientX : this.start);
        this._openModal(this._pickImageAt(cx));
      } else {
        this._check();
      }
      this.isDown = false;
    };

    window.addEventListener('resize',     onResize);
    window.addEventListener('wheel',      onWheel,  { passive: true });
    this.container.addEventListener('mousedown',  onDown);
    window.addEventListener('mousemove',  onMove);
    window.addEventListener('mouseup',   onUp);
    this.container.addEventListener('touchstart', onDown,  { passive: true });
    window.addEventListener('touchmove',  onMove,  { passive: true });
    window.addEventListener('touchend',  onUp);
  }
}

/* ---- Boot ---- */
const wrap = document.getElementById('pgallery');
const hint = document.getElementById('pgallery-hint');

if (wrap) {
  new GalleryApp(wrap, { bend: 3, borderRadius: 0.05, scrollSpeed: 2, scrollEase: 0.05 });

  const hideHint = () => hint && hint.classList.add('pgallery-hint--gone');
  wrap.addEventListener('mousedown',  hideHint, { once: true });
  wrap.addEventListener('touchstart', hideHint, { once: true, passive: true });
  wrap.addEventListener('wheel',      hideHint, { once: true, passive: true });
}
