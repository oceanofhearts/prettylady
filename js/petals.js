(function () {
  const canvas = document.querySelector('#petals-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let petals = [], running = false, raf = 0, wind = 0, targetWind = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio, 1.5);
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function makePetal(initial) {
    return {
      x: Math.random() * innerWidth, y: initial ? Math.random() * innerHeight : -30,
      size: 8 + Math.random() * 18, speed: .45 + Math.random() * 1.15,
      drift: (Math.random() - .5) * .45, rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - .5) * .035, phase: Math.random() * 8,
      color: Math.random() > .55 ? '#ec7893' : '#f5a0b2', alpha: .55 + Math.random() * .4
    };
  }
  function reset(p) { Object.assign(p, makePetal(false)); }
  function drawPetal(p) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation); ctx.scale(Math.cos(p.phase) * .75 + .25, 1);
    ctx.beginPath(); ctx.moveTo(0, -p.size);
    ctx.bezierCurveTo(p.size * .8, -p.size * .6, p.size * .65, p.size * .45, 0, p.size);
    ctx.bezierCurveTo(-p.size * .65, p.size * .45, -p.size * .8, -p.size * .6, 0, -p.size);
    const g = ctx.createRadialGradient(-p.size * .2, -p.size * .3, 0, 0, 0, p.size);
    g.addColorStop(0, '#ffd0d8'); g.addColorStop(.35, p.color); g.addColorStop(1, '#a91f49');
    ctx.fillStyle = g; ctx.globalAlpha = p.alpha; ctx.fill(); ctx.restore();
  }
  function tick() {
    if (!running) return;
    ctx.clearRect(0, 0, innerWidth, innerHeight); wind += (targetWind - wind) * .025;
    petals.forEach(p => {
      p.y += p.speed; p.x += p.drift + Math.sin(p.phase) * .24 + wind; p.rotation += p.spin; p.phase += .018;
      if (p.y > innerHeight + 35 || p.x < -50 || p.x > innerWidth + 50) reset(p);
      drawPetal(p);
    });
    raf = requestAnimationFrame(tick);
  }
  function start() {
    if (reduced || running) return; running = true;
    if (!petals.length) petals = Array.from({ length: innerWidth < 700 ? 36 : 68 }, () => makePetal(true));
    tick();
  }
  function stop() { running = false; cancelAnimationFrame(raf); ctx.clearRect(0, 0, innerWidth, innerHeight); }
  addEventListener('resize', resize);
  addEventListener('pointermove', e => { targetWind = (e.clientX / innerWidth - .5) * .45; }, { passive: true });
  resize();
  window.petals = { start, stop };
})();
