document.addEventListener('DOMContentLoaded', () => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = Boolean(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  createGarden();
  createHeroPetals();
  createBloomRoses();
  createConstellation();
  bindPointerLight();
  bindFlower();
  bindReplay();
  bindProgress();

  if (!hasGsap || reduced) {
    document.body.classList.add('is-static');
    document.querySelectorAll('.matter-line').forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    document.querySelector('.hero__door').style.transform = 'translateX(10%)';
    return;
  }

  const ease = 'power3.out';
  const intro = gsap.timeline({ defaults: { ease } });
  intro.from('.hero__eyebrow', { opacity: 0, y: 15, duration: .8 }, .25)
    .from('.hero h1 span', { opacity: 0, y: 50, rotateX: -35, duration: 1.2 }, .4)
    .from('.hero h1 strong', { opacity: 0, y: 70, rotateX: -30, duration: 1.35 }, .55)
    .from('.hero__aside', { opacity: 0, y: 15, duration: .8 }, 1.2)
    .to('.hero__door', { x: '-10%', duration: 1.45, ease: 'back.out(1.35)' }, 1)
    .to('.hero__doll-note', { scale: 1, duration: .55, ease: 'back.out(2)' }, 2)
    .from('.hero__footer', { opacity: 0, y: 15, duration: .9 }, 1.45);

  gsap.to('.hero__copy', { yPercent: -20, opacity: .08, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__doll', { yPercent: 12, rotation: 4, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  const lines = gsap.utils.toArray('.matter-line');
  lines.forEach(line => {
    gsap.fromTo(line,
      { opacity: .35, y: 32 },
      {
        opacity: 1,
        y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: line,
          start: 'top 88%',
          end: 'center 58%',
          scrub: .35
        }
      }
    );
  });
  gsap.to('.matter__orb', { scale: 1.28, rotation: 28, scrollTrigger: { trigger: '.matter', start: 'top bottom', end: 'bottom top', scrub: 1.5 } });

  gsap.from('.interlude p, .interlude > span', { opacity: 0, y: 35, stagger: .15, scrollTrigger: { trigger: '.interlude', start: 'top 65%', end: 'center center', scrub: 1 } });

  const roseEls = gsap.utils.toArray('.rose');
  roseEls.forEach((rose, i) => {
    const finalY = 15 + Math.random() * 82;
    gsap.to(rose, {
      y: `${-105 + finalY}vh`, scale: .65 + Math.random() * .7, rotation: `+=${(Math.random() - .5) * 50}`,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.roses', start: 'top 85%', end: '45% 45%', scrub: .8 + (i % 4) * .15 }
    });
  });
  gsap.from('.roses__copy > *', { opacity: 0, y: 45, stagger: .12, scrollTrigger: { trigger: '.roses', start: '22% center', end: '50% center', scrub: 1 } });
  gsap.to('.roses__copy', { scale: 1.08, scrollTrigger: { trigger: '.roses', start: '45% center', end: 'bottom bottom', scrub: 1 } });
  ScrollTrigger.create({ trigger: '.roses', start: 'top 80%', end: 'bottom 20%', onEnter: () => window.petals?.start(), onEnterBack: () => window.petals?.start(), onLeave: () => window.petals?.stop(), onLeaveBack: () => window.petals?.stop() });

  ScrollTrigger.create({ trigger: '.bloom', start: 'top 60%', once: true, onEnter: () => bloomFlower(true) });
  gsap.from('.bloom-rose', {
    opacity: 0,
    scale: .35,
    y: 70,
    rotation: index => index % 2 ? -20 : 20,
    stagger: { each: .025, from: 'random' },
    duration: 1.1,
    ease: 'back.out(1.35)',
    scrollTrigger: { trigger: '.bloom', start: 'top 72%', toggleActions: 'play none none none' }
  });
  gsap.from('.bloom__copy > *', { opacity: 0, y: 35, stagger: .1, scrollTrigger: { trigger: '.bloom__copy', start: 'top 78%', toggleActions: 'play none none none' } });
  gsap.from('.letter', { opacity: 0, y: 100, rotation: -5, scale: .92, duration: 1.4, ease, scrollTrigger: { trigger: '.finale', start: 'top 55%' } });
  gsap.from('.letter > *', { opacity: 0, y: 22, stagger: .12, duration: .8, ease, scrollTrigger: { trigger: '.letter', start: 'top 60%' } });

  document.querySelector('.rose-garden').addEventListener('pointermove', e => {
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    gsap.to('.rose', { x: i => x * (12 + (i % 5) * 5), yPercent: i => y * (6 + (i % 3) * 4), duration: 1.1, ease: 'power2.out', overwrite: 'auto' });
  });

  function bloomFlower(animate) {
    const tl = gsap.timeline({ defaults: { ease: 'back.out(1.4)' } });
    tl.to('.flower-stem', { scaleY: 1, duration: animate ? 1.1 : 0 })
      .to('.flower-head i', { scale: 1, stagger: .07, duration: animate ? .85 : 0 }, '-=.25')
      .to('.flower-head b', { scale: 1, duration: animate ? .6 : 0 }, '-=.4')
      .to('.flower-spark', { opacity: 1, scale: 1.4, stagger: .1, duration: animate ? .5 : 0 }, '-=.25')
      .to('.flower-spark', { y: -20, opacity: .2, stagger: .1, repeat: 2, yoyo: true, duration: .8 });
  }

  function createGarden() {
    const garden = document.querySelector('.rose-garden');
    const count = innerWidth < 700 ? 32 : 56;
    for (let i = 0; i < count; i++) {
      const rose = document.createElement('div');
      rose.className = 'rose';
      rose.style.cssText = `left:${-4 + Math.random() * 108}%;top:${-5 + Math.random() * 75}%;--s:${70 + Math.random() * 125}px;--z:${-120 + Math.random() * 230}px;--r:${Math.random() * 60 - 30}deg;--flip:${Math.random() > .5 ? 1 : -1};--hue:${Math.random() * 12 - 6}deg;--sat:${.88 + Math.random() * .24}`;
      rose.innerHTML = '<img src="assets/images/real-rose-v2.webp" alt="" width="700" height="700">';
      garden.appendChild(rose);
    }
  }

  function createBloomRoses() {
    const field = document.querySelector('.bloom-roses');
    const count = innerWidth < 700 ? 28 : 48;
    for (let i = 0; i < count; i++) {
      const rose = document.createElement('i');
      rose.className = 'bloom-rose';
      const edgeX = i % 2 ? Math.random() * 43 : 57 + Math.random() * 43;
      rose.style.cssText = `left:${edgeX}%;top:${-3 + Math.random() * 103}%;--s:${58 + Math.random() * 105}px;--r:${Math.random() * 90 - 45}deg;--flip:${Math.random() > .5 ? 1 : -1};--hue:${Math.random() * 14 - 7}deg;--o:${.26 + Math.random() * .38}`;
      rose.innerHTML = '<img src="assets/images/real-rose-v2.webp" alt="" width="700" height="700">';
      field.appendChild(rose);
    }
  }

  function createHeroPetals() {
    const field = document.querySelector('.hero-petals');
    const count = innerWidth < 700 ? 7 : 12;
    for (let i = 0; i < count; i++) {
      const petal = document.createElement('i');
      petal.style.cssText = `--x:${-8 + Math.random() * 112}%;--y:${-5 + Math.random() * 105}%;--s:${100 + Math.random() * 190}px;--r:${Math.random() * 330}deg;--d:${.35 + Math.random() * .9}`;
      field.appendChild(petal);
    }
    if (hasGsap && !reduced) {
      addEventListener('pointermove', e => {
        const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
        gsap.to('.hero-petals i', {
          x: index => x * (26 + index * 5),
          y: index => y * (20 + index * 3),
          rotation: index => `+=${x * (index % 2 ? 10 : -10)}`,
          duration: 1.15,
          ease: 'power2.out', overwrite: 'auto'
        });
      }, { passive: true });
      gsap.to('.hero-petals', { yPercent: 24, opacity: .4, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
  }

  function createConstellation() {
    const space = document.querySelector('.finale__constellation');
    for (let i = 0; i < 24; i++) {
      const star = document.createElement('i');
      star.textContent = i % 4 ? '·' : '✦';
      star.style.cssText = `position:absolute;left:${Math.random() * 100}%;top:${Math.random() * 100}%;font-style:normal;font-size:${.5 + Math.random()}rem;color:#fff;opacity:${.25 + Math.random() * .6}`;
      space.appendChild(star);
    }
  }

  function bindPointerLight() {
    const glow = document.querySelector('.cursor-glow');
    addEventListener('pointermove', e => { glow.style.left = `${e.clientX}px`; glow.style.top = `${e.clientY}px`; }, { passive: true });
  }

  function bindFlower() {
    const flower = document.querySelector('.bloom__flower');
    const button = document.querySelector('.bloom__button');
    const react = () => {
      if (hasGsap && !reduced) {
        gsap.fromTo('.bloom__flower', { rotation: -2 }, { rotation: 2, repeat: 5, yoyo: true, duration: .12, ease: 'sine.inOut', onComplete: () => gsap.to('.bloom__flower', { rotation: 0 }) });
        gsap.fromTo('.flower-spark', { opacity: 1, scale: .4 }, { opacity: 0, y: -55, x: () => (Math.random() - .5) * 65, scale: 1.8, stagger: .08, duration: 1.2 });
      }
    };
    flower.addEventListener('click', react); button.addEventListener('click', react);
    flower.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); react(); } });
  }

  function bindReplay() {
    document.querySelector('.replay').addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
  }

  function bindProgress() {
    const bar = document.querySelector('.progress__track i');
    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = `scaleX(${max ? scrollY / max : 0})`; ticking = false;
      });
    }, { passive: true });
  }
});
