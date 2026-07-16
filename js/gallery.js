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
  image: 'assets/img/nagrada-' + String(i + 1).padStart(2, '0') + '.jpg',
  text: ''
}));

/* ---- Media: one image plane ---- */
class Media {
  constructor({ gl, geometry, scene, screen, viewport, image, index, length, bend, borderRadius }) {
    Object.assign(this, { gl, geometry, scene, screen, viewport, image, index, length, bend, borderRadius });
    this.extra = 0; this.padding = 2; this.speed = 0;
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
    this.plane.scale.y = (this.viewport.height * (900 * scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width  * (700 * scale)) / this.screen.width;
    this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding   = 2;
    this.width     = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x         = this.width * this.index;
  }

  update(scroll, dir) {
    this.plane.position.x = this.x - scroll.current - this.extra;
    const x = this.plane.position.x, H = this.viewport.width / 2;

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

/* ---- App ---- */
class GalleryApp {
  constructor(container, { bend = 3, borderRadius = 0.05, scrollSpeed = 2, scrollEase = 0.05 } = {}) {
    this.container   = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll      = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.isDown = false; this.start = 0;
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
      this.isDown = true;
      this._pos = this.scroll.current;
      this.start = 'touches' in e ? e.touches[0].clientX : e.clientX;
    };
    const onMove = e => {
      if (!this.isDown) return;
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
      this.scroll.target = this._pos + (this.start - x) * this.scrollSpeed * 0.025;
    };
    const onUp = () => { this.isDown = false; this._check(); };

    window.addEventListener('resize',     onResize);
    window.addEventListener('wheel',      onWheel,  { passive: true });
    this.container.addEventListener('mousedown',  onDown);
    window.addEventListener('mousemove',  onMove);
    window.addEventListener('mouseup',   onUp);
    this.container.addEventListener('touchstart', onDown,  { passive: true });
    window.addEventListener('touchmove',  onMove,  { passive: true });
    window.addEventListener('touchend',  onUp);

    this._destroy = () => {
      cancelAnimationFrame(this._raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('wheel', onWheel);
      this.container.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      this.container.removeEventListener('touchstart', onDown);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
      if (this.gl.canvas.parentNode) this.gl.canvas.parentNode.removeChild(this.gl.canvas);
    };
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
