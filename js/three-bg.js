(function () {
  const canvas = document.querySelector('#three-bg-canvas');
  if (!canvas || !window.THREE || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, .1, 300);
  camera.position.z = 52;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.setSize(innerWidth, innerHeight);

  const group = new THREE.Group();
  scene.add(group);
  const count = innerWidth < 700 ? 75 : 150;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [new THREE.Color('#b43f67'), new THREE.Color('#e58ca6'), new THREE.Color('#81506f')];
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - .5) * 100;
    positions[i * 3 + 1] = (Math.random() - .5) * 80;
    positions[i * 3 + 2] = (Math.random() - .5) * 55;
    const color = palette[i % palette.length];
    colors[i * 3] = color.r; colors[i * 3 + 1] = color.g; colors[i * 3 + 2] = color.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const stars = new THREE.Points(geometry, new THREE.PointsMaterial({ size: .22, vertexColors: true, transparent: true, opacity: .75 }));
  group.add(stars);

  const rings = [];
  for (let i = 0; i < 4; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(8 + i * 4.8, .025, 6, 120),
      new THREE.MeshBasicMaterial({ color: i % 2 ? 0xb13d67 : 0x8f587a, transparent: true, opacity: .1 })
    );
    ring.rotation.x = Math.PI * (.25 + i * .08);
    ring.rotation.y = i * .5;
    ring.position.z = -9 - i * 2;
    group.add(ring); rings.push(ring);
  }

  let mx = 0, my = 0, tx = 0, ty = 0, active = true;
  addEventListener('pointermove', e => { tx = (e.clientX / innerWidth - .5) * 2; ty = (e.clientY / innerHeight - .5) * 2; }, { passive: true });
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  });
  document.addEventListener('visibilitychange', () => { active = !document.hidden; if (active) animate(); });

  function animate() {
    if (!active) return;
    requestAnimationFrame(animate);
    mx += (tx - mx) * .025; my += (ty - my) * .025;
    group.rotation.y += .00035; group.rotation.x = my * .045;
    camera.position.x = mx * 1.6; camera.position.y = -my * 1.1;
    rings.forEach((ring, i) => { ring.rotation.z += .0007 * (i % 2 ? -1 : 1); });
    renderer.render(scene, camera);
  }
  animate();
})();
