document.addEventListener('DOMContentLoaded', () => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const hasGsap = Boolean(window.gsap && window.ScrollTrigger);
  const roseSource = 'assets/images/real-rose-v2.webp';
  const deviceMemory = navigator.deviceMemory || 8;
  const cpuCores = navigator.hardwareConcurrency || 8;
  const constrainedDevice = deviceMemory <= 4 || cpuCores <= 4;

  createGarden();
  createBouquet();
  bindGardenScroll();
  bindProgress();
  bindPointerLight();
  bindPetalTrail();
  bindBouquet();
  bindReplay();

  if (!hasGsap || reduced) {
    document.body.classList.add('is-static');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const ease = 'power3.out';

  const intro = gsap.timeline({ defaults: { ease } });
  intro
    .from('.hero__portrait img', { opacity: 0, scale: 1.12, duration: 1.8, ease: 'power2.out' }, 0)
    .from('.hero__energy', { opacity: 0, scale: .5, duration: 1.2, ease: 'back.out(1.4)' }, .65)
    .from('.hero .kicker', { opacity: 0, y: 16, duration: .7 }, .2)
    .from('.hero h1 span', { opacity: 0, x: -80, skewX: -8, duration: 1 }, .35)
    .from('.hero h1 strong', { opacity: 0, x: 90, skewX: 8, duration: 1.05 }, .48)
    .from('.hero__name, .hero__intro', { opacity: 0, y: 20, stagger: .12, duration: .75 }, .95)
    .from('.hero__cta', { opacity: 0, y: 18, duration: .7 }, 1.25)
    .from('.emblem', { opacity: 0, scale: .5, rotation: -15, duration: 1.25, ease: 'back.out(1.5)' }, .7);

  gsap.to('.hero__content', {
    yPercent: -14,
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.to('.hero__portrait img', {
    scale: 1.1,
    yPercent: 5,
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.to('.emblem', {
    yPercent: 16,
    rotation: 9,
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  gsap.from('.powers__heading > *', {
    opacity: 0,
    y: 40,
    stagger: .12,
    duration: .9,
    scrollTrigger: { trigger: '.powers__heading', start: 'top 78%' }
  });
  gsap.from('.power-card', {
    opacity: 0,
    y: 70,
    rotation: (index) => index - 1,
    stagger: .13,
    duration: 1,
    ease,
    scrollTrigger: { trigger: '.power-grid', start: 'top 76%' }
  });
  gsap.utils.toArray('.power-card > i').forEach((icon, index) => {
    gsap.to(icon, {
      yPercent: -18 - index * 4,
      rotation: index === 1 ? 8 : -8,
      scrollTrigger: { trigger: icon.closest('.power-card'), start: 'top bottom', end: 'bottom top', scrub: 1.2 }
    });
  });

  gsap.utils.toArray('.manifesto__line').forEach((line) => {
    gsap.from(line, {
      opacity: 0,
      y: 45,
      scale: .97,
      scrollTrigger: { trigger: line, start: 'top 88%', end: 'center 64%', scrub: .6 }
    });
  });

  gsap.from('.softness__copy > *', {
    opacity: 0,
    y: 45,
    stagger: .13,
    duration: 1,
    scrollTrigger: { trigger: '.softness', start: 'top 68%' }
  });
  gsap.from('.softness__rose', {
    opacity: 0,
    x: 140,
    rotation: 35,
    scale: .55,
    duration: 1.4,
    ease: 'back.out(1.25)',
    scrollTrigger: { trigger: '.softness', start: 'top 67%' }
  });

  gsap.from('.bouquet-rose', {
    opacity: 0,
    scale: .25,
    y: 90,
    rotation: (index) => index % 2 ? -25 : 25,
    stagger: { each: .025, from: 'random' },
    duration: 1.1,
    ease: 'back.out(1.3)',
    scrollTrigger: { trigger: '.bouquet', start: 'top 72%' }
  });
  gsap.from('.bouquet__copy > *', {
    opacity: 0,
    y: 35,
    stagger: .11,
    duration: .9,
    scrollTrigger: { trigger: '.bouquet__copy', start: 'top 78%' }
  });

  gsap.from('.letter', {
    opacity: 0,
    y: 90,
    rotation: -4,
    scale: .94,
    duration: 1.25,
    ease,
    scrollTrigger: { trigger: '.finale', start: 'top 60%' }
  });
  gsap.from('.letter > *', {
    opacity: 0,
    y: 20,
    stagger: .1,
    duration: .75,
    scrollTrigger: { trigger: '.letter', start: 'top 66%' }
  });

  if (!coarse) {
    const gardenX = gsap.quickTo('.rose-garden', 'x', { duration: 1.1, ease: 'power2.out' });
    const gardenY = gsap.quickTo('.rose-garden', 'y', { duration: 1.1, ease: 'power2.out' });
    document.querySelector('.hero')?.addEventListener('pointermove', (event) => {
      const x = event.clientX / innerWidth - .5;
      const y = event.clientY / innerHeight - .5;
      gsap.to('.hero__portrait img', { xPercent: x * 1.6, duration: 1.4, ease: 'power2.out', overwrite: 'auto' });
      gsap.to('.hero__energy', { x: x * 28, y: y * 20, duration: 1.1, ease: 'power2.out', overwrite: 'auto' });
    }, { passive: true });
    document.querySelector('.rose-garden').addEventListener('pointermove', (event) => {
      const x = event.clientX / innerWidth - .5;
      const y = event.clientY / innerHeight - .5;
      gardenX(x * 14);
      gardenY(y * 10);
    }, { passive: true });
  }

  function createGarden() {
    const garden = document.querySelector('.rose-garden');
    if (!garden) return;
    // A smaller, capability-aware DOM budget keeps the layered garden dense
    // without asking mobile GPUs to composite more than a hundred images.
    const count = innerWidth < 700 ? (constrainedDevice ? 42 : 50) :
      innerWidth < 1100 ? (constrainedDevice ? 60 : 72) :
        (constrainedDevice ? 72 : 96);
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < count; index += 1) {
      const rose = document.createElement('div');
      rose.className = 'rose';
      const startRotation = Math.random() * 70 - 35;
      rose.gardenMotion = {
        startY: 105 + Math.random() * 28,
        finalY: -2 + Math.random() * 94,
        startRotation,
        finalRotation: startRotation + (Math.random() - .5) * 62,
        finalScale: .64 + Math.random() * .74,
        delay: (index % 10) * .014,
        opacity: -1
      };
      rose.style.cssText = `left:${-4 + Math.random() * 108}%;top:0;--s:${64 + Math.random() * (innerWidth < 700 ? 92 : 132)}px;--z:${-120 + Math.random() * 230}px;--r:${startRotation}deg;--flip:${Math.random() > .5 ? 1 : -1}`;
      rose.innerHTML = `<img src="${roseSource}" alt="" width="700" height="700" loading="lazy" decoding="async">`;
      fragment.appendChild(rose);
    }
    garden.appendChild(fragment);
  }

  function bindGardenScroll() {
    const section = document.querySelector('.roses');
    const copy = document.querySelector('.roses__copy');
    const roses = [...document.querySelectorAll('.rose')].map((element) => ({
      element,
      ...element.gardenMotion
    }));
    if (!section || !roses.length) return;

    if (reduced) {
      roses.forEach((rose) => {
        rose.element.style.transform = `translate3d(-50%, ${rose.finalY}vh, var(--z)) rotate(${rose.finalRotation}deg) scale(${rose.finalScale})`;
        rose.element.style.opacity = '1';
      });
      if (copy) {
        copy.style.opacity = '1';
        copy.style.transform = 'translate(-50%, -45%)';
      }
      return;
    }

    let ticking = false;
    let petalsRunning = false;
    let sectionInRange = false;
    let viewport = innerHeight;
    let travel = viewport;
    let lastRaw = -1;
    let resizeTicking = false;

    const measure = () => {
      viewport = innerHeight;
      travel = Math.max(section.offsetHeight - viewport * .68, viewport);
      lastRaw = -1;
    };

    const render = () => {
      const rect = section.getBoundingClientRect();
      const raw = Math.max(0, Math.min(1, (viewport * .9 - rect.top) / travel));

      const shouldRunPetals = sectionInRange && raw > .02 && raw < .99 && rect.bottom > 0;
      if (shouldRunPetals !== petalsRunning) {
        petalsRunning = shouldRunPetals;
        shouldRunPetals ? window.petals?.start() : window.petals?.stop();
      }

      // Do not rewrite every rose while scrolling elsewhere on the page or
      // when the garden's progress has not visibly changed.
      if (Math.abs(raw - lastRaw) < .0005) {
        ticking = false;
        return;
      }
      lastRaw = raw;

      roses.forEach((rose) => {
        const { element, delay } = rose;
        const local = Math.max(0, Math.min(1, (raw - delay) / (1 - delay)));
        const eased = 1 - Math.pow(1 - local, 3);
        const y = (rose.startY + (rose.finalY - rose.startY) * eased) * viewport / 100;
        const rotation = rose.startRotation + (rose.finalRotation - rose.startRotation) * eased;
        const scale = .14 + (rose.finalScale - .14) * eased;
        element.style.transform = `translate3d(-50%, ${y.toFixed(1)}px, var(--z)) rotate(${rotation.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        const opacity = Math.min(1, local * 5);
        if (opacity !== rose.opacity) {
          element.style.opacity = String(opacity);
          rose.opacity = opacity;
        }
      });

      if (copy) {
        const reveal = Math.max(0, Math.min(1, (raw - .08) / .22));
        copy.style.opacity = String(reveal);
        copy.style.transform = `translate(-50%, calc(-45% + ${(1 - reveal) * 34}px)) scale(${.97 + reveal * .1})`;
      }

      ticking = false;
    };

    const requestRender = () => {
      if (ticking || !sectionInRange) return;
      ticking = true;
      requestAnimationFrame(render);
    };
    addEventListener('scroll', requestRender, { passive: true });
    addEventListener('resize', () => {
      if (resizeTicking) return;
      resizeTicking = true;
      requestAnimationFrame(() => {
        resizeTicking = false;
        measure();
        requestRender();
      });
    }, { passive: true });

    const observer = new IntersectionObserver(([entry]) => {
      sectionInRange = entry.isIntersecting;
      section.classList.toggle('is-active', sectionInRange);
      if (sectionInRange) {
        requestRender();
      } else if (petalsRunning) {
        petalsRunning = false;
        window.petals?.stop();
      }
    }, { rootMargin: '35% 0px' });
    observer.observe(section);

    measure();
    render();
  }

  function createBouquet() {
    const field = document.querySelector('.bouquet__field');
    if (!field) return;
    const count = innerWidth < 700 ? 28 : 48;
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < count; index += 1) {
      const rose = document.createElement('i');
      rose.className = 'bouquet-rose';
      const x = index % 2 ? Math.random() * 36 : 64 + Math.random() * 36;
      rose.style.cssText = `left:${x}%;top:${-2 + Math.random() * 104}%;--s:${58 + Math.random() * (innerWidth < 700 ? 78 : 112)}px;--r:${Math.random() * 90 - 45}deg;--flip:${Math.random() > .5 ? 1 : -1};--hue:${Math.random() * 14 - 7}deg;--o:${.28 + Math.random() * .42};--dance-delay:${(index % 9) * 55}ms`;
      rose.innerHTML = `<img src="${roseSource}" alt="" width="700" height="700" loading="lazy" decoding="async">`;
      fragment.appendChild(rose);
    }
    field.appendChild(fragment);
  }

  function bindProgress() {
    const bar = document.querySelector('.progress i');
    if (!bar) return;
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      ticking = false;
    };
    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  function bindPointerLight() {
    const glow = document.querySelector('.cursor-glow');
    if (!glow || coarse) return;
    let ticking = false;
    let x = innerWidth / 2;
    let y = innerHeight / 2;
    addEventListener('pointermove', (event) => {
      x = event.clientX;
      y = event.clientY;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        glow.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        ticking = false;
      });
    }, { passive: true });
  }

  function bindPetalTrail() {
    if (coarse || reduced) return;
    let lastTime = 0;
    addEventListener('pointermove', (event) => {
      const now = performance.now();
      if (now - lastTime < 55) return;
      lastTime = now;
      const petal = document.createElement('i');
      petal.className = 'cursor-petal';
      petal.style.left = `${event.clientX}px`;
      petal.style.top = `${event.clientY}px`;
      document.body.appendChild(petal);
      const drift = (Math.random() - .5) * 56;
      petal.animate([
        { transform: 'translate(-50%,-50%) rotate(0deg) scale(.25)', opacity: .85 },
        { transform: `translate(calc(-50% + ${drift}px), calc(-50% + ${42 + Math.random() * 45}px)) rotate(${180 + Math.random() * 180}deg) scale(1)`, opacity: 0 }
      ], { duration: 750 + Math.random() * 350, easing: 'cubic-bezier(.2,.65,.35,1)', fill: 'forwards' }).onfinish = () => petal.remove();
    }, { passive: true });
  }

  function bindBouquet() {
    const section = document.querySelector('.bouquet');
    const button = document.querySelector('.bouquet__button');
    const label = document.querySelector('.bouquet__button-label');
    if (!section || !button) return;
    button.addEventListener('click', () => {
      if (button.dataset.busy === 'true') return;
      button.dataset.busy = 'true';
      button.setAttribute('aria-pressed', 'true');
      if (label) label.textContent = 'look at them go!';

      section.classList.remove('is-dancing');
      requestAnimationFrame(() => {
        section.classList.add('is-dancing');
        setTimeout(() => section.classList.remove('is-dancing'), 4700);
      });

      const rect = button.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;
      const petalCount = innerWidth < 700 ? 42 : 72;
      const fragment = document.createDocumentFragment();

      for (let index = 0; index < petalCount; index += 1) {
        const petal = document.createElement('i');
        petal.className = 'magic-petal';
        petal.style.left = `${originX}px`;
        petal.style.top = `${originY}px`;
        petal.style.setProperty('--petal-color', index % 4 === 0 ? '#f5cc71' : index % 2 ? '#f5a8b8' : '#d93666');
        fragment.appendChild(petal);

        const angle = (Math.PI * 2 * index) / petalCount + (Math.random() - .5) * .4;
        const distance = 120 + Math.random() * Math.min(innerWidth * .42, 440);
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance - 55 - Math.random() * 120;
        const fall = 100 + Math.random() * 190;
        const duration = 3000 + Math.random() * 1800;
        requestAnimationFrame(() => {
          petal.animate([
            { transform: 'translate(-50%, -50%) rotate(0deg) scale(.2)', opacity: 0 },
            { transform: `translate(calc(-50% + ${x * .62}px), calc(-50% + ${y * .72}px)) rotate(${180 + Math.random() * 220}deg) scale(${.75 + Math.random() * .65})`, opacity: 1, offset: .25 },
            { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${430 + Math.random() * 400}deg) scale(${.7 + Math.random() * .7})`, opacity: .92, offset: .52 },
            { transform: `translate(calc(-50% + ${x + (Math.random() - .5) * 100}px), calc(-50% + ${y + fall}px)) rotate(${800 + Math.random() * 540}deg) scale(.55)`, opacity: 0 }
          ], { duration, easing: 'cubic-bezier(.16,.72,.25,1)', fill: 'forwards' }).onfinish = () => petal.remove();
        });
      }
      document.body.appendChild(fragment);

      const flash = document.createElement('i');
      flash.className = 'bouquet__flash';
      flash.style.left = `${originX}px`;
      flash.style.top = `${originY}px`;
      document.body.appendChild(flash);
      flash.animate([
        { transform: 'translate(-50%,-50%) scale(.1)', opacity: .9 },
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 }
      ], { duration: 1800, easing: 'ease-out', fill: 'forwards' }).onfinish = () => flash.remove();

      if (hasGsap && !reduced) {
        gsap.fromTo('.bouquet__button-spark', { scale: .4, rotation: 0 }, { scale: 2.2, rotation: 520, opacity: 0, duration: 2.2, onComplete: () => gsap.set('.bouquet__button-spark', { clearProps: 'all' }) });
      }

      setTimeout(() => {
        button.dataset.busy = 'false';
        button.setAttribute('aria-pressed', 'false');
        if (label) label.textContent = 'make them dance again';
      }, 5000);
    });
  }

  function bindReplay() {
    document.querySelector('.replay')?.addEventListener('click', () => {
      scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }
});
