/*
  Premium 3D portfolio interactions using Three.js + GSAP.
  A lightweight procedural fallback is used until an optimized GLB model is available.
*/

gsap.registerPlugin(ScrollTrigger);

const panels = {
  hero: document.getElementById('three-hero'),
  about: document.getElementById('three-about'),
  skills: document.getElementById('three-skills'),
  contact: document.getElementById('three-contact')
};

const sharedPointer = { x: 0, y: 0 };
window.addEventListener('pointermove', (e) => {
  sharedPointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
  sharedPointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
});

function makeScene(container, variant = 'hero') {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 1.4, 4.4);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight('#a7b6ff', 0.8);
  const key = new THREE.DirectionalLight('#73d6ff', 1.1);
  key.position.set(3, 4, 2);
  const rim = new THREE.PointLight('#895dff', 15, 20, 2);
  rim.position.set(-2.5, 2, -1);
  scene.add(ambient, key, rim);

  const group = new THREE.Group();
  scene.add(group);

  // Procedural young developer character + desk.
  const skin = new THREE.MeshStandardMaterial({ color: '#f5cfb0', roughness: 0.7 });
  const hoodie = new THREE.MeshStandardMaterial({ color: '#263268', roughness: 0.6, metalness: 0.1 });
  const dark = new THREE.MeshStandardMaterial({ color: '#15182a' });
  const glow = new THREE.MeshStandardMaterial({ color: '#6aa6ff', emissive: '#4465ff', emissiveIntensity: 0.65 });

  const desk = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.2, 1.6), dark);
  desk.position.y = -0.1;
  const laptop = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.06, 0.65), glow);
  laptop.position.set(0.3, 0.15, 0.1);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 24, 24), skin);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 0.55, 8, 16), hoodie);
  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.35, 8, 16), hoodie);
  const armR = armL.clone();
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.42, 8, 16), dark);
  const legR = legL.clone();

  head.position.set(0, 0.85, 0.1);
  body.position.set(0, 0.45, 0);
  armL.position.set(-0.27, 0.5, 0.2);
  armR.position.set(0.27, 0.5, 0.2);
  legL.position.set(-0.12, 0.08, 0.32);
  legR.position.set(0.12, 0.08, 0.32);

  const avatar = new THREE.Group();
  avatar.add(head, body, armL, armR, legL, legR);
  avatar.position.x = variant === 'hero' ? 0.5 : 0;

  if (variant === 'about') {
    avatar.rotation.y = -0.3;
    head.position.x -= 0.08;
  }
  if (variant === 'contact') {
    armR.rotation.z = -1.1;
    armR.position.y += 0.12;
  }

  group.add(desk, laptop, avatar);

  const floating = [];
  if (variant === 'hero' || variant === 'skills') {
    for (let i = 0; i < 6; i += 1) {
      const orb = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.08 + Math.random() * 0.08, 0),
        new THREE.MeshStandardMaterial({
          color: i % 2 ? '#6ce7ff' : '#8f74ff',
          emissive: i % 2 ? '#00b9ff' : '#6b48ff',
          emissiveIntensity: 0.45
        })
      );
      orb.userData = {
        radius: 1.2 + Math.random() * 0.4,
        speed: 0.35 + Math.random() * 0.4,
        offset: Math.random() * Math.PI * 2
      };
      floating.push(orb);
      group.add(orb);
    }
  }

  // Lazy-load GLB model if provided and optimized (<5MB recommended).
  const glbPath = 'assets/models/dev-boy.glb';
  const gltfLoader = new THREE.GLTFLoader();
  gltfLoader.load(
    glbPath,
    (gltf) => {
      const model = gltf.scene;
      model.scale.setScalar(1.1);
      model.position.set(0, -0.1, 0);
      avatar.visible = false;
      group.add(model);
      if (gltf.animations?.length) {
        const mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
        group.userData.mixer = mixer;
      }
    },
    undefined,
    () => {
      // Fallback remains active when GLB is unavailable.
    }
  );

  function resize() {
    const { clientWidth, clientHeight } = container;
    renderer.setSize(clientWidth, clientHeight);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  return { scene, camera, renderer, group, avatar, armL, armR, floating };
}

const scenes = Object.fromEntries(
  Object.entries(panels).map(([name, el]) => [name, makeScene(el, name)])
);

const techDescriptions = [
  'Python: Building robust AI services and automation layers.',
  'FastAPI: High-throughput APIs with async architecture.',
  'ML: Production-ready model pipelines and observability.',
  'Data Viz: Real-time insights with storytelling dashboards.',
  'Energy AI: Solar and smart-grid intelligence optimization.'
];

const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach((card) => {
  card.addEventListener('mouseenter', () => {
    gsap.to(scenes.hero.armR.rotation, { z: -0.9, duration: 0.4 });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(scenes.hero.armR.rotation, { z: 0, duration: 0.5 });
  });
});

const skillItems = document.querySelectorAll('.skill-item');
skillItems.forEach((item) => {
  const value = item.dataset.level;
  gsap.to(item.querySelector('.bar i'), {
    width: `${value}%`,
    duration: 1.4,
    ease: 'power3.out',
    scrollTrigger: { trigger: item, start: 'top 85%' }
  });
});

gsap.to('#hero .hero-content', {
  y: 0,
  opacity: 1,
  duration: 1,
  from: { y: 40, opacity: 0 }
});

gsap.to(scenes.hero.avatar.position, {
  y: 1.2,
  scrollTrigger: {
    trigger: '#hero',
    start: 'bottom 70%',
    end: 'bottom 20%',
    scrub: true
  }
});

const holos = document.querySelectorAll('.floating-holo');
window.addEventListener('pointermove', () => {
  holos.forEach((el, i) => {
    gsap.to(el, {
      x: sharedPointer.x * (8 + i * 2),
      y: sharedPointer.y * (5 + i),
      duration: 0.8,
      overwrite: true
    });
  });
});

function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  const particles = Array.from({ length: 65 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.8 + 0.4,
    vx: (Math.random() - 0.5) * 0.12,
    vy: (Math.random() - 0.5) * 0.12
  }));

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.fillStyle = 'rgba(113, 160, 255, 0.45)';
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  resize();
  window.addEventListener('resize', resize);
  return draw;
}

const drawParticles = initParticles();
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  const dt = clock.getDelta();

  Object.values(scenes).forEach((s, idx) => {
    s.avatar.position.y += Math.sin(t * 2 + idx) * 0.0009; // subtle breathing
    s.armL.rotation.x = Math.sin(t * 5) * 0.09; // typing loop
    s.armR.rotation.x = Math.cos(t * 5) * 0.09;

    s.group.rotation.y += (sharedPointer.x * 0.22 - s.group.rotation.y) * 0.04;
    s.group.rotation.x += (-sharedPointer.y * 0.08 - s.group.rotation.x) * 0.04;

    s.floating.forEach((orb, i) => {
      const a = t * orb.userData.speed + orb.userData.offset;
      orb.position.set(
        Math.cos(a) * orb.userData.radius,
        0.6 + Math.sin(a * 1.4 + i) * 0.35,
        Math.sin(a) * orb.userData.radius
      );
    });

    if (s.group.userData.mixer) s.group.userData.mixer.update(dt);
    s.renderer.render(s.scene, s.camera);
  });

  drawParticles();
}
animate();

const techPanel = document.getElementById('tech-details');
const skillPanel = panels.skills;
skillPanel.addEventListener('mousemove', (event) => {
  const x = event.offsetX / skillPanel.clientWidth;
  const index = Math.floor(x * techDescriptions.length);
  techPanel.textContent = techDescriptions[Math.max(0, Math.min(techDescriptions.length - 1, index))];
});
