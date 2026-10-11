(() => {
  const loadingInit = document.querySelector('.loading-init');
  const stageContainer = document.querySelector('.stage-container');
  const trailsCanvas = document.getElementById('trails-canvas');
  const mainCanvas = document.getElementById('main-canvas');

  if (!loadingInit || !stageContainer || !trailsCanvas || !mainCanvas) {
    return;
  }

  const trailCtx = trailsCanvas.getContext('2d');
  const mainCtx = mainCanvas.getContext('2d');

  const colors = ['#ff0043', '#14fc56', '#1e7fff', '#e60aff', '#ffbf36', '#ffffff'];
  let width = window.innerWidth;
  let height = window.innerHeight;
  let lastTs = 0;
  const rockets = [];
  const particles = [];

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function setCanvasSize() {
    const ratio = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    trailsCanvas.width = width * ratio;
    trailsCanvas.height = height * ratio;
    mainCanvas.width = width * ratio;
    mainCanvas.height = height * ratio;

    trailCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
    mainCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function launchRocket() {
    const targetX = rand(width * 0.12, width * 0.88);
    const targetY = rand(height * 0.2, height * 0.55);
    const rocket = {
      x: rand(width * 0.1, width * 0.9),
      y: height + 20,
      targetX,
      targetY,
      vx: 0,
      vy: 0,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: rand(4.4, 6.5)
    };

    const dx = targetX - rocket.x;
    const dy = targetY - rocket.y;
    const length = Math.hypot(dx, dy) || 1;

    rocket.vx = (dx / length) * rocket.speed;
    rocket.vy = (dy / length) * rocket.speed;
    rockets.push(rocket);
  }

  function explode(rocket) {
    const particleCount = 60;
    for (let i = 0; i < particleCount; i += 1) {
      const angle = (Math.PI * 2 * i) / particleCount + rand(-0.25, 0.25);
      const speed = rand(1.5, 6.2);
      particles.push({
        x: rocket.targetX,
        y: rocket.targetY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: rand(1.5, 3.8),
        life: rand(50, 90),
        maxLife: rand(50, 90),
        color: rocket.color,
        alpha: 1
      });
    }
  }

  function update(dt) {
    for (let i = rockets.length - 1; i >= 0; i -= 1) {
      const rocket = rockets[i];
      rocket.x += rocket.vx * dt * 0.06;
      rocket.y += rocket.vy * dt * 0.06;

      if (rocket.y >= rocket.targetY || rocket.vy >= 0) {
        explode(rocket);
        rockets.splice(i, 1);
      }
    }

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.vy += 0.08;
      particle.x += particle.vx * dt * 0.06;
      particle.y += particle.vy * dt * 0.06;
      particle.life -= dt * 0.06;
      particle.alpha = Math.max(0, particle.life / particle.maxLife);

      if (particle.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  function draw() {
    trailCtx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    trailCtx.fillRect(0, 0, width, height);
    mainCtx.clearRect(0, 0, width, height);

    for (const rocket of rockets) {
      trailCtx.beginPath();
      trailCtx.fillStyle = rocket.color;
      trailCtx.arc(rocket.x, rocket.y, 2.2, 0, Math.PI * 2);
      trailCtx.fill();
    }

    for (const particle of particles) {
      trailCtx.beginPath();
      trailCtx.fillStyle = particle.color.replace(')', `, ${particle.alpha})`).replace('rgb', 'rgba');
      trailCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      trailCtx.fill();

      mainCtx.beginPath();
      mainCtx.fillStyle = particle.color;
      mainCtx.globalAlpha = particle.alpha;
      mainCtx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
      mainCtx.fill();
      mainCtx.globalAlpha = 1;
    }
  }

  function animate(ts) {
    if (!lastTs) {
      lastTs = ts;
    }

    const dt = Math.min(ts - lastTs, 32);
    lastTs = ts;

    if (ts % 260 < dt) {
      launchRocket();
    }

    update(dt);
    draw();
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', setCanvasSize);
  document.body.addEventListener('pointerdown', launchRocket);

  setCanvasSize();
  loadingInit.classList.add('remove');
  stageContainer.classList.remove('remove');
  requestAnimationFrame(animate);
})();
