import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  opacity: number;
}

const COLORS = [
  "#e85d2a", // Primary orange
  "#b8f23a", // Neon lime
  "#3b82f6", // Electric blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#8b5cf6", // Violet
];

export function ConfettiCanvas({ active, onDone }: { active: boolean; onDone?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const particles: Particle[] = [];
    const count = 90;

    // Launch from bottom corners and center
    for (let i = 0; i < count; i++) {
      const fromLeft = i % 2 === 0;
      particles.push({
        x: fromLeft ? width * 0.2 + Math.random() * 50 : width * 0.8 - Math.random() * 50,
        y: height * 0.7,
        w: 8 + Math.random() * 8,
        h: 6 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
        vx: (fromLeft ? 1 : -1) * (4 + Math.random() * 9) + (Math.random() - 0.5) * 4,
        vy: -(12 + Math.random() * 12),
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        opacity: 1,
      });
    }

    let animId: number;
    let frames = 0;

    function render() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);
      frames++;

      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.985; // drag
        p.rotation += p.vRot;

        if (frames > 45) {
          p.opacity -= 0.016;
        }

        if (p.opacity > 0 && p.y < height + 50) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      }

      if (alive && frames < 140) {
        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
        onDone?.();
      }
    }

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [active, onDone]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      style={{ pointerEvents: "none" }}
    />
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function fireConfetti() {
  if (typeof window === "undefined") return;
  const existing = document.getElementById("pf-confetti-root");
  if (existing) existing.remove();

  const container = document.createElement("div");
  container.id = "pf-confetti-root";
  document.body.appendChild(container);

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = (canvas.width = window.innerWidth);
  const h = (canvas.height = window.innerHeight);

  const count = 100;
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const fromLeft = i % 2 === 0;
    particles.push({
      x: fromLeft ? w * 0.25 : w * 0.75,
      y: h * 0.8,
      w: 8 + Math.random() * 8,
      h: 5 + Math.random() * 7,
      color: COLORS[i % COLORS.length]!,
      vx: (fromLeft ? 1 : -1) * (5 + Math.random() * 8) + (Math.random() - 0.5) * 4,
      vy: -(13 + Math.random() * 11),
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 14,
      opacity: 1,
    });
  }

  let frame = 0;
  function tick() {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    frame++;
    let hasVisible = false;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.38;
      p.vx *= 0.98;
      p.rotation += p.vRot;
      if (frame > 40) p.opacity -= 0.018;

      if (p.opacity > 0 && p.y < h + 40) {
        hasVisible = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    }
    if (hasVisible && frame < 150) {
      requestAnimationFrame(tick);
    } else {
      container.remove();
    }
  }
  requestAnimationFrame(tick);
}
