// Modelo 3D de um sobrado (fundação, pilares, vigas e lajes), desenhado em canvas.
// Botões: Construir / Ampliar. Arraste para girar.
(() => {
  const C = { pilar: '#1a2c50', viga: '#2f4a7d', laje: '#c9ced8', sapata: '#3a4856', antigo: '#a9b0bc', novo: '#d43616' };
  const X = [0, 4, 8], Z = [0, 4, 8];
  const P = 0.3, VB = 0.2, VH = 0.45, LE = 0.12;
  const box = (x0, y0, z0, x1, y1, z1, cor, andar) => ({ a: [x0, y0, z0], b: [x1, y1, z1], cor, andar });

  // camadas na ordem de desenho, de baixo para cima (a câmera sempre olha de cima)
  function camadas() {
    const out = [];
    const nos = X.flatMap((x) => Z.map((z) => [x, z]));
    const pilares = (y0, y1, andar) => nos.map(([x, z]) => box(x - P / 2, y0, z - P / 2, x + P / 2, y1, z + P / 2, 'pilar', andar));
    const vigas = (y, andar) => [
      ...Z.map((z) => box(-P / 2, y - VH, z - VB / 2, 8 + P / 2, y, z + VB / 2, 'viga', andar)),
      ...X.map((x) => box(x - VB / 2, y - VH, -P / 2, x + VB / 2, y, 8 + P / 2, 'viga', andar)),
    ];
    const laje = (y, andar) => [box(-P / 2, y, -P / 2, 8 + P / 2, y + LE, 8 + P / 2, 'laje', andar)];
    out.push(nos.map(([x, z]) => box(x - 0.6, -1.1, z - 0.6, x + 0.6, -0.7, z + 0.6, 'sapata', 0)));
    out.push(pilares(-0.7, -0.4, 0), vigas(0, 0));
    out.push(pilares(0, 3 - VH, 1), vigas(3, 1), laje(3, 1));
    out.push(pilares(3 + LE, 6 - VH, 2), vigas(6, 2), laje(6, 2));
    return out;
  }
  const CAMADAS = camadas();
  const L = norm([-0.45, 1, 0.65]);
  function norm(v) { const m = Math.hypot(...v); return v.map((c) => c / m); }
  function hex(h, k) {
    const n = parseInt(h.slice(1), 16);
    return `rgb(${[n >> 16, (n >> 8) & 255, n & 255].map((c) => Math.round(c * k)).join(',')})`;
  }

  // desenha o modelo; queda = 0..1 (quanto o andar novo ainda está acima, no modo ampliar)
  function draw(ctx, w, h, yaw, pitch, modo, queda = 0) {
    ctx.clearRect(0, 0, w, h);
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const s = Math.min(w / 16.5, h / 16.5);
    const ox = w / 2, oy = h * 0.5;
    const rot = ([x, y, z]) => {
      x -= 4; y -= 2.5; z -= 4;
      const x1 = x * cy - z * sy, z1 = x * sy + z * cy;
      return [x1, y * cp - z1 * sp, y * sp + z1 * cp];
    };
    const faces = [
      [[0, 1, 0], (a, b) => [[a[0], b[1], a[2]], [b[0], b[1], a[2]], [b[0], b[1], b[2]], [a[0], b[1], b[2]]]],
      [[0, -1, 0], (a, b) => [[a[0], a[1], a[2]], [a[0], a[1], b[2]], [b[0], a[1], b[2]], [b[0], a[1], a[2]]]],
      [[1, 0, 0], (a, b) => [[b[0], a[1], a[2]], [b[0], a[1], b[2]], [b[0], b[1], b[2]], [b[0], b[1], a[2]]]],
      [[-1, 0, 0], (a, b) => [[a[0], a[1], a[2]], [a[0], b[1], a[2]], [a[0], b[1], b[2]], [a[0], a[1], b[2]]]],
      [[0, 0, 1], (a, b) => [[a[0], a[1], b[2]], [a[0], b[1], b[2]], [b[0], b[1], b[2]], [b[0], a[1], b[2]]]],
      [[0, 0, -1], (a, b) => [[a[0], a[1], a[2]], [b[0], a[1], a[2]], [b[0], b[1], a[2]], [a[0], b[1], a[2]]]],
    ];
    ctx.lineJoin = 'round';
    for (const camada of CAMADAS) {
      const novo = modo === 'ampliar' && camada[0].andar === 2;
      if (novo && queda >= 1) continue;
      const dy = novo ? queda * 4 : 0;
      const itens = camada.map((bx) => {
        const a = [bx.a[0], bx.a[1] + dy, bx.a[2]], b = [bx.b[0], bx.b[1] + dy, bx.b[2]];
        return { bx, a, b, d: rot([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2])[2] };
      }).sort((p, q) => p.d - q.d);
      ctx.globalAlpha = novo ? 1 - queda : 1;
      for (const { bx, a, b } of itens) {
        const base = modo === 'ampliar' ? (novo ? C.novo : C.antigo) : C[bx.cor];
        const tom = modo === 'ampliar' && !novo && bx.cor === 'laje' ? '#d3d6de' : base;
        for (const [n, quad] of faces) {
          const vz = rot(n)[2] - rot([0, 0, 0])[2];
          if (vz <= 0.001) continue;
          const k = 0.62 + 0.38 * Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]);
          ctx.beginPath();
          quad(a, b).forEach((v, i) => {
            const r = rot(v);
            const px = ox + r[0] * s, py = oy - r[1] * s;
            i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
          });
          ctx.closePath();
          ctx.fillStyle = hex(tom, k);
          ctx.fill();
          ctx.strokeStyle = hex(tom, k * 0.86);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  window.ArflamModelo = { draw };

  const tile = document.getElementById('modelo');
  if (!tile) return;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Modelo 3D da estrutura de um sobrado: fundação, pilares, vigas e lajes');
  const ctx = canvas.getContext('2d');
  const reduz = matchMedia('(prefers-reduced-motion: reduce)');
  const notas = {
    construir: 'Sobrado: fundação, pilares, vigas e lajes calculados juntos. Arraste para girar.',
    ampliar: 'Ampliação: antes de subir um andar, pilares e fundação existentes precisam ser verificados.',
  };
  let yaw = -0.62, pitch = 0.42, modo = 'construir', queda = 0, w = 0, h = 0;
  let arrastando = false, visivel = true, ultimo = 0, px = 0, py = 0, raf = 0;

  function medir() {
    const r = tile.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function quadro(t) {
    raf = 0;
    const dt = ultimo ? Math.min(t - ultimo, 50) : 16;
    ultimo = t;
    let segue = false;
    if (!arrastando && !reduz.matches && visivel) { yaw += dt * 0.00012; segue = true; }
    if (queda > 0) { queda = Math.max(0, queda - dt / 650); segue = true; }
    draw(ctx, w, h, yaw, pitch, modo, Math.pow(queda, 2));
    if (segue) pedir(); else ultimo = 0;
  }
  const pedir = () => { if (!raf) raf = requestAnimationFrame(quadro); };

  medir();
  tile.prepend(canvas);
  tile.querySelector('.model__fallback').remove();
  pedir();

  new ResizeObserver(() => { medir(); pedir(); }).observe(tile);
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; if (visivel) pedir(); }).observe(tile);
  reduz.addEventListener('change', pedir);

  canvas.addEventListener('pointerdown', (e) => { arrastando = true; px = e.clientX; py = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!arrastando) return;
    yaw -= (e.clientX - px) * 0.008;
    pitch = Math.min(0.85, Math.max(0.12, pitch + (e.clientY - py) * 0.004));
    px = e.clientX; py = e.clientY;
    pedir();
  });
  const solta = () => { arrastando = false; pedir(); };
  canvas.addEventListener('pointerup', solta);
  canvas.addEventListener('pointercancel', solta);

  tile.querySelectorAll('[data-mode]').forEach((btn) => btn.addEventListener('click', () => {
    if (btn.dataset.mode === modo) return;
    modo = btn.dataset.mode;
    queda = modo === 'ampliar' && !reduz.matches ? 1 : 0;
    tile.querySelectorAll('[data-mode]').forEach((b) => {
      const on = b === btn;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on);
    });
    tile.querySelector('[data-note]').textContent = notas[modo];
    pedir();
  }));
})();
