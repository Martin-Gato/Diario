/**
 * neural-network.js
 * Fondo animado: red de nodos conectados que reacciona a la posición del mouse.
 * Sin dependencias externas — canvas 2D puro.
 */
(function () {
  "use strict";

  const canvas = document.getElementById("neural-bg");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const CONFIG = {
    nodeCount: 90,
    linkDistance: 130,
    mouseLinkDistance: 220,
    nodeSpeed: 0.25,
    nodeRadius: 1.8,
    lineColor: "0, 255, 65",
    mouseColor: "0, 255, 100",
  };

  let width = 0;
  let height = 0;
  let nodes = [];
  let mouse = { x: -9999, y: -9999, active: false };
  let animationId = null;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function densityForArea() {
    const area = width * height;
    const base = Math.round(area / 16000);
    return Math.max(40, Math.min(CONFIG.nodeCount + base - 90, 220));
  }

  function createNodes() {
    const count = densityForArea();
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * CONFIG.nodeSpeed,
      vy: (Math.random() - 0.5) * CONFIG.nodeSpeed,
    }));
  }

  function step() {
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;

      if (n.x <= 0 || n.x >= width) n.vx *= -1;
      if (n.y <= 0 || n.y >= height) n.vy *= -1;

      n.x = Math.max(0, Math.min(width, n.x));
      n.y = Math.max(0, Math.min(height, n.y));
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // enlaces nodo-nodo
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.linkDistance) {
          const opacity = 1 - dist / CONFIG.linkDistance;
          ctx.strokeStyle = `rgba(${CONFIG.lineColor}, ${opacity * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // enlaces nodo-mouse (la "sinapsis" activa)
    if (mouse.active) {
      for (const n of nodes) {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.mouseLinkDistance) {
          const opacity = 1 - dist / CONFIG.mouseLinkDistance;
          ctx.strokeStyle = `rgba(${CONFIG.mouseColor}, ${opacity * 0.7})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
        }
      }

      const pulse = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, 18
      );
      pulse.addColorStop(0, `rgba(${CONFIG.mouseColor}, 0.9)`);
      pulse.addColorStop(1, `rgba(${CONFIG.mouseColor}, 0)`);
      ctx.fillStyle = pulse;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    // nodos
    ctx.fillStyle = `rgba(${CONFIG.lineColor}, 0.85)`;
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, CONFIG.nodeRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop() {
    step();
    draw();
    animationId = requestAnimationFrame(loop);
  }

  function handlePointerMove(e) {
    const point = e.touches ? e.touches[0] : e;
    mouse.x = point.clientX;
    mouse.y = point.clientY;
    mouse.active = true;
  }

  function handlePointerLeave() {
    mouse.active = false;
  }

  window.addEventListener("resize", () => {
    resize();
    createNodes();
  });
  window.addEventListener("mousemove", handlePointerMove, { passive: true });
  window.addEventListener("touchmove", handlePointerMove, { passive: true });
  window.addEventListener("mouseleave", handlePointerLeave);
  window.addEventListener("touchend", handlePointerLeave);

  resize();
  createNodes();

  if (prefersReducedMotion) {
    // una sola imagen estática, sin animación continua ni seguimiento de mouse
    draw();
  } else {
    loop();
  }

  window.addEventListener("beforeunload", () => {
    if (animationId) cancelAnimationFrame(animationId);
  });
})();
