(function () {
  const canvas = document.querySelector('#petals-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const constrainedDevice = (navigator.deviceMemory || 8) <= 4 || (navigator.hardwareConcurrency || 8) <= 4;
  const petalSprites = [makePetalSprite('#ec7893'), makePetalSprite('#f5a0b2')];
  let petals = [], running = false, raf = 0, wind = 0, targetWind = 0, lastFrame = 0;
  let width = 0, height = 0;

  function makePetalSprite(color) {
    const sprite = document.createElement('canvas');
    const spriteCtx = sprite.getContext('2d');
    const size = 64;
    sprite.width = size;
    sprite.height = size;
    spriteCtx.translate(size / 2, size / 2);
    spriteCtx.beginPath();
    spriteCtx.moveTo(0, -size * .45);
    spriteCtx.bezierCurveTo(size * .36, -size * .27, size * .3, size * .2, 0, size * .45);
    spriteCtx.bezierCurveTo(-size * .3, size * .2, -size * .36, -size * .27, 0, -size * .45);
    const gradient = spriteCtx.createRadialGradient(-size * .09, -size * .13, 0, 0, 0, size * .45);
    gradient.addColorStop(0, '#ffd0d8');
    gradient.addColorStop(.35, color);
    gradient.addColorStop(1, '#a91f49');
    spriteCtx.fillStyle = gradient;
    spriteCtx.fill();
    return sprite;
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const dpr = Math.min(devicePixelRatio, constrainedDevice || coarse ? 1 : 1.35);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function makePetal(initial) {
    return {
      x: Math.random() * width, y: initial ? Math.random() * height : -30,
      size: 8 + Math.random() * 18, speed: .45 + Math.random() * 1.15,
      drift: (Math.random() - .5) * .45, rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - .5) * .035, phase: Math.random() * 8,
      sprite: Math.random() > .55 ? 0 : 1, alpha: .55 + Math.random() * .4
    };
  }
  function reset(p) { Object.assign(p, makePetal(false)); }
  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.scale(Math.cos(p.phase) * .75 + .25, 1);
    ctx.globalAlpha = p.alpha;
    ctx.drawImage(petalSprites[p.sprite], -p.size, -p.size, p.size * 2, p.size * 2);
    ctx.restore();
  }
  function tick(now) {
    if (!running) return;
    raf = requestAnimationFrame(tick);

    // Cap drawing at 60fps on high-refresh displays. Movement remains
    // time-based, so it looks the same at 60Hz, 90Hz and 120Hz.
    const elapsed = lastFrame ? now - lastFrame : 16.67;
    if (elapsed < 15) return;
    const step = Math.min(elapsed, 34) / 16.67;
    lastFrame = now;

    ctx.clearRect(0, 0, width, height);
    wind += (targetWind - wind) * Math.min(.08, .025 * step);
    petals.forEach(p => {
      p.y += p.speed * step;
      p.x += (p.drift + Math.sin(p.phase) * .24 + wind) * step;
      p.rotation += p.spin * step;
      p.phase += .018 * step;
      if (p.y > height + 35 || p.x < -50 || p.x > width + 50) reset(p);
      drawPetal(p);
    });
  }
  function start() {
    if (reduced || running) return;
    running = true;
    lastFrame = 0;
    if (!petals.length) {
      const count = width < 700 ? (constrainedDevice ? 18 : 24) : (constrainedDevice ? 28 : 40);
      petals = Array.from({ length: count }, () => makePetal(true));
    }
    raf = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    ctx.clearRect(0, 0, width, height);
  }
  let resizeRaf = 0;
  addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(resize);
  }, { passive: true });
  if (!coarse) {
    addEventListener('pointermove', e => { targetWind = (e.clientX / width - .5) * .45; }, { passive: true });
  }
  resize();
  window.petals = { start, stop };
})();
