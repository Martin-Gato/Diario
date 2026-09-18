/**
 * neural-network.js (versión Portfolio)
 * Fondo animado híbrido:
 *   1. Una estructura de capas tenue de fondo (estilo diagrama de red
 *      neuronal artificial: columnas de nodos conectadas entre sí), con
 *      "pulsos" de datos viajando por algunas conexiones.
 *   2. Partículas libres encima, reaccionando a mouse/touch (mismo
 *      comportamiento que el fondo del Diario).
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
    // partículas libres
    nodeCount: 90,
    linkDistance: 130,
    mouseLinkDistance: 220,
    nodeSpeed: 0.25,
    nodeRadius: 1.8,
    lineColor: "0, 255, 65",
    mouseColor: "0, 255, 100",

    // capas de fondo
    layerNodeColor: "0, 255, 120",
    layerLineColor: "0, 255, 65",
    layerNodeRadius: 3.2,
    layerLineOpacity: 0.28,
    pulseCount: 16,
    pulseColor: "120, 255, 170",
    pulseSpeedMin: 0.0035,
    pulseSpeedMax: 0.009,
  };

  let width = 0;
  let height = 0;

  // ---------- partículas libres ----------
  let nodes = [];
  let mouse = { x: -9999, y: -9999, active: false };

  // ---------- capas de fondo ----------
  let layers = []; // layers[i] = [{x, y, phase}, ...]
  let edges = []; // [{a: node, b: node}]
  let pulses = []; // [{edge, t, speed}]

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

  function layerLayout() {
    if (width < 640) return [4, 6, 4];
    if (width < 1024) return [5, 7, 6, 5];
    return [4, 7, 8, 7, 4];
  }

  function createLayers() {
    const counts = layerLayout();
    const marginX = width * 0.1;
    const marginY = height * 0.14;
    const usableW = Math.max(1, width - marginX * 2);
    const usableH = Math.max(1, height - marginY * 2);

    layers = counts.map((count, li) => {
      const x =
        counts.length === 1
          ? width / 2
          : marginX + (li * usableW) / (counts.length - 1);

      return Array.from({ length: count }, (_, ni) => {
        const spread = count === 1 ? 0.5 : ni / (count - 1);
        const jitter = (Math.sin(li * 12.9898 + ni * 78.233) * 0.5 + 0.5 - 0.5) * 0.06;
        return {
          x,
          y: marginY + (spread + jitter) * usableH,
          phase: (li * 7 + ni * 3) % 10,
        };
      });
    });

    edges = [];
    for (let li = 0; li < layers.length - 1; li++) {
      for (const a of layers[li]) {
        for (const b of layers[li + 1]) {
          edges.push({ a, b });
        }
      }
    }

    pulses = Array.from({ length: Math.min(CONFIG.pulseCount, edges.length) }, () =>
      spawnPulse()
    );
  }

  function spawnPulse() {
    return {
      edge: edges[(Math.random() * edges.length) | 0],
      t: Math.random() * -1.2, // arranque escalonado
      speed:
        CONFIG.pulseSpeedMin +
        Math.random() * (CONFIG.pulseSpeedMax - CONFIG.pulseSpeedMin),
    };
  }

  function drawLayers(time) {
    // conexiones tenues entre capas
    ctx.lineWidth = 1;
    for (const { a, b } of edges) {
      ctx.strokeStyle = `rgba(${CONFIG.layerLineColor}, ${CONFIG.layerLineOpacity})`;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // pulsos viajando por algunas conexiones
    for (const p of pulses) {
      if (p.t >= 0 && p.t <= 1) {
        const { a, b } = p.edge;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 7);
        glow.addColorStop(0, `rgba(${CONFIG.pulseColor}, 0.9)`);
        glow.addColorStop(1, `rgba(${CONFIG.pulseColor}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      p.t += p.speed;
      if (p.t > 1) Object.assign(p, spawnPulse());
    }

    // nodos de capa, con leve respiración de brillo
    for (const layer of layers) {
      for (const n of layer) {
        const breathe = 0.55 + 0.45 * Math.sin(time / 1400 + n.phase);
        ctx.fillStyle = `rgba(${CONFIG.layerNodeColor}, ${0.45 + breathe * 0.45})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, CONFIG.layerNodeRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function stepFreeNodes() {
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;

      if (n.x <= 0 || n.x >= width) n.vx *= -1;
      if (n.y <= 0 || n.y >= height) n.vy *= -1;

      n.x = Math.max(0, Math.min(width, n.x));
      n.y = Math.max(0, Math.min(height, n.y));
    }
  }

  function drawFreeNodes() {
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

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    drawLayers(time || 0);
    drawFreeNodes();
  }

  function loop(time) {
    stepFreeNodes();
    draw(time);
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
    createLayers();
  });
  window.addEventListener("mousemove", handlePointerMove, { passive: true });
  window.addEventListener("touchmove", handlePointerMove, { passive: true });
  window.addEventListener("mouseleave", handlePointerLeave);
  window.addEventListener("touchend", handlePointerLeave);

  resize();
  createNodes();
  createLayers();

  if (prefersReducedMotion) {
    // una sola imagen estática, sin animación continua ni seguimiento de mouse
    draw(0);
  } else {
    loop(0);
  }

  window.addEventListener("beforeunload", () => {
    if (animationId) cancelAnimationFrame(animationId);
  });
})();
