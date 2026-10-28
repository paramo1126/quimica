/* ============================================================
   SEMANA CULTURAL DE QUÍMICA — index.js
   Three.js Particle Background + Tilt Effects (Design System Formal)
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. SCENE SETUP
  ---------------------------------------------------------- */
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0A0F1D, 1);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.z = 40;

  /* ----------------------------------------------------------
     2. PARTICLE SYSTEM (Primary #38BDF8 + Secondary #818CF8)
  ---------------------------------------------------------- */
  const PARTICLE_COUNT = 1500;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = [];

  const colPrimary = new THREE.Color(0x38BDF8);
  const colSecondary = new THREE.Color(0x818CF8);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 100;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

    const chosen = Math.random() > 0.4 ? colPrimary : colSecondary;
    colors[i * 3]     = chosen.r;
    colors[i * 3 + 1] = chosen.g;
    colors[i * 3 + 2] = chosen.b;

    velocities.push({
      x: (Math.random() - 0.5) * 0.015,
      y: (Math.random() - 0.5) * 0.015,
      z: (Math.random() - 0.5) * 0.015,
    });
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.22,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(particleGeo, particleMat);

  /* ----------------------------------------------------------
     3. CONNECTION LINES
  ---------------------------------------------------------- */
  const MAX_DIST = 9;
  const linePositions = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const ax = positions[i * 3];
    const ay = positions[i * 3 + 1];
    const az = positions[i * 3 + 2];

    const limit = Math.min(i + 22, PARTICLE_COUNT);
    for (let j = i + 1; j < limit; j++) {
      const bx = positions[j * 3];
      const by = positions[j * 3 + 1];
      const bz = positions[j * 3 + 2];

      const dist = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2);
      if (dist < MAX_DIST) {
        linePositions.push(ax, ay, az, bx, by, bz);
      }
    }
  }

  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

  const lineMat = new THREE.LineBasicMaterial({
    color: 0x38BDF8,
    transparent: true,
    opacity: 0.08,
  });

  const lineSegments = new THREE.LineSegments(lineGeo, lineMat);

  const group = new THREE.Group();
  group.add(points);
  group.add(lineSegments);
  scene.add(group);

  /* ----------------------------------------------------------
     4. MOUSE TRACKING
  ---------------------------------------------------------- */
  const mouse = { x: 0, y: 0 };
  const targetRotation = { x: 0, y: 0 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* ----------------------------------------------------------
     5. ANIMATION LOOP
  ---------------------------------------------------------- */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    group.rotation.y += 0.0006;
    group.rotation.x += 0.0002;

    targetRotation.x += (mouse.y * 0.25 - targetRotation.x) * 0.04;
    targetRotation.y += (mouse.x * 0.25 - targetRotation.y) * 0.04;

    group.rotation.x = targetRotation.x + elapsed * 0.0002;
    group.rotation.y = targetRotation.y + elapsed * 0.0006;

    const pos = particleGeo.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3]     += velocities[i].x;
      pos[i * 3 + 1] += velocities[i].y;
      pos[i * 3 + 2] += velocities[i].z;

      if (Math.abs(pos[i * 3]) > 50) velocities[i].x *= -1;
      if (Math.abs(pos[i * 3 + 1]) > 50) velocities[i].y *= -1;
      if (Math.abs(pos[i * 3 + 2]) > 50) velocities[i].z *= -1;
    }
    particleGeo.attributes.position.needsUpdate = true;

    particleMat.opacity = 0.65 + 0.15 * Math.sin(elapsed * 1.2);
    renderer.render(scene, camera);
  }

  animate();

  /* ----------------------------------------------------------
     6. RESIZE HANDLER
  ---------------------------------------------------------- */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  /* ----------------------------------------------------------
     7. CARD TILT EFFECT (Vanilla JS)
  ---------------------------------------------------------- */
  const tiltCards = document.querySelectorAll('[data-tilt]');

  tiltCards.forEach((card) => {
    const TILT_MAX = 8;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      const rotateX = (-deltaY / (rect.height / 2)) * TILT_MAX;
      const rotateY = (deltaX / (rect.width / 2)) * TILT_MAX;

      card.style.transform = `
        translateY(-8px)
        perspective(800px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'all 0.4s ease';
      setTimeout(() => {
        card.style.transition = '';
      }, 400);
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });

})();
