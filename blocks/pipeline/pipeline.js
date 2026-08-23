/*
 * pipeline — animated hybrid-search visualization + step list
 * Authoring model (DA): each row = [step name, description]
 * Canvas: two particle streams (lexical = angular/paper, semantic = wavy/ember)
 * fuse into one channel and settle into five ranked result bars.
 */

const EMBER = [255, 160, 46];
const PAPER = [242, 236, 223];

function makeViz(canvas) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let dpr = 1;
  let raf = 0;
  let running = false;
  const particles = [];
  const bars = [1, 0.78, 0.62, 0.48, 0.36].map((len, i) => ({ len, heat: 0, i }));

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn() {
    const lex = Math.random() < 0.5;
    particles.push({
      lex,
      x: -8,
      y: h * (lex ? 0.2 : 0.8) + (Math.random() - 0.5) * h * 0.22,
      v: 1.1 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2,
      bar: null,
      alpha: 0.9,
    });
  }

  function barY(i) {
    return h * 0.22 + i * ((h * 0.56) / 4);
  }

  function step() {
    const cx = w * 0.46;
    const cy = h * 0.5;
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      if (p.bar === null && p.x < cx) {
        // approach: converge toward the fusion point
        const t = Math.min(p.x / cx, 1);
        p.x += p.v * (1 + t * 0.8);
        const targetY = cy + (p.lex ? -1 : 1) * (1 - t) * h * 0.3;
        if (p.lex) {
          // angular: stepwise snaps
          p.y += (targetY - p.y) * 0.06;
          if (Math.random() < 0.02) p.y += (Math.random() - 0.5) * 6;
        } else {
          // semantic: smooth wave
          p.phase += 0.08;
          p.y += (targetY - p.y) * 0.05 + Math.sin(p.phase) * 0.7;
        }
      } else if (p.bar === null) {
        // fused channel
        p.x += p.v * 2.6;
        p.y += (cy - p.y) * 0.3 + (Math.random() - 0.5) * 1.2;
        if (p.x > w * 0.6) {
          // weighted toward top-ranked bars
          const r = Math.random() ** 2.2;
          p.bar = bars[Math.min(Math.floor(r * 5), 4)];
        }
      } else {
        // settle into the assigned result bar
        const ty = barY(p.bar.i);
        const tx = w * 0.68 + p.bar.len * w * 0.24;
        p.x += (tx - p.x) * 0.08 + p.v * 0.4;
        p.y += (ty - p.y) * 0.12;
        p.alpha -= 0.02;
        if (p.alpha <= 0.05 || p.x >= tx - 2) {
          p.bar.heat = Math.min(p.bar.heat + 0.35, 1);
          particles.splice(i, 1);
        }
      }
    }
    bars.forEach((b) => { b.heat *= 0.96; });
    if (particles.length < 70 && Math.random() < 0.5) spawn();
  }

  function rgba(c, a) {
    return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const cx = w * 0.46;
    const cy = h * 0.5;

    // fusion glow
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, h * 0.42);
    glow.addColorStop(0, rgba(EMBER, 0.16));
    glow.addColorStop(1, rgba(EMBER, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // fused channel
    const chan = ctx.createLinearGradient(cx, 0, w * 0.64, 0);
    chan.addColorStop(0, rgba(EMBER, 0.5));
    chan.addColorStop(1, rgba(EMBER, 0.06));
    ctx.fillStyle = chan;
    ctx.fillRect(cx, cy - 1, w * 0.18, 2);

    // result bars
    bars.forEach((b) => {
      const y = barY(b.i);
      const x0 = w * 0.68;
      const len = b.len * w * 0.24;
      ctx.fillStyle = rgba(PAPER, 0.1);
      ctx.fillRect(x0, y - 2, w * 0.26, 4);
      ctx.fillStyle = rgba(EMBER, 0.28 + b.heat * 0.65 - b.i * 0.03);
      ctx.fillRect(x0, y - 2, len, 4);
      ctx.fillStyle = rgba(EMBER, 0.5 + b.heat * 0.5);
      ctx.fillRect(x0 + len - 3, y - 3, 3, 6);
    });

    // particles
    particles.forEach((p) => {
      if (p.lex && p.bar === null && p.x < cx) {
        ctx.fillStyle = rgba(PAPER, 0.55 * p.alpha);
        ctx.fillRect(p.x - 2.2, p.y - 1, 4.4, 2);
      } else {
        const c = p.bar === null && p.x < cx && !p.lex ? EMBER : EMBER;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.bar === null && p.x >= cx ? 1.6 : 1.9, 0, Math.PI * 2);
        ctx.fillStyle = rgba(c, (p.x >= cx ? 0.85 : 0.5) * p.alpha);
        ctx.fill();
      }
    });
  }

  function loop() {
    if (!running) return;
    step();
    draw();
    raf = window.requestAnimationFrame(loop);
  }

  return {
    start() {
      if (running) return;
      running = true;
      resize();
      loop();
    },
    stop() {
      running = false;
      window.cancelAnimationFrame(raf);
    },
    resize,
    staticFrame() {
      resize();
      for (let i = 0; i < 600; i += 1) step();
      draw();
    },
  };
}

export default function decorate(block) {
  const steps = document.createElement('ol');
  steps.className = 'pipeline-steps';
  [...block.children].forEach((row, i) => {
    const [nameCell, descCell] = row.children;
    const li = document.createElement('li');
    const index = document.createElement('span');
    index.className = 'pipeline-index';
    index.textContent = String(i + 1).padStart(2, '0');
    const name = document.createElement('h3');
    name.textContent = nameCell ? nameCell.textContent.trim() : '';
    const desc = document.createElement('p');
    if (descCell) desc.append(...descCell.childNodes);
    li.append(index, name, desc);
    steps.append(li);
  });

  const viz = document.createElement('div');
  viz.className = 'pipeline-viz';
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const labels = document.createElement('div');
  labels.className = 'pipeline-viz-labels';
  ['lexical', 'semantic', 'fused + reranked'].forEach((t, i) => {
    const s = document.createElement('span');
    s.className = `pipeline-label pipeline-label-${i}`;
    s.textContent = t;
    labels.append(s);
  });
  viz.append(canvas, labels);
  block.replaceChildren(viz, steps);

  const anim = makeViz(canvas);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cycle = 0;
  let cycleTimer = 0;
  const items = [...steps.children];
  function cycleSteps() {
    items.forEach((li, i) => li.classList.toggle('active', i === cycle % items.length));
    cycle += 1;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (reduced) {
          anim.staticFrame();
        } else {
          anim.start();
          cycleSteps();
          cycleTimer = window.setInterval(cycleSteps, 2600);
        }
      } else {
        anim.stop();
        window.clearInterval(cycleTimer);
      }
    });
  }, { threshold: 0.25 });
  io.observe(block);

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (reduced) anim.staticFrame();
      else anim.resize();
    }, 150);
  });
}
