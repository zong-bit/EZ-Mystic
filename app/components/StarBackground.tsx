'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Star {
  x: number;
  y: number;
  baseX: number;          // initial/return position
  baseY: number;
  size: number;           // core radius
  glowRadius: number;     // glow halo radius
  rays: number;           // number of light rays (4-6)
  rayAngle: number;       // initial ray rotation angle
  raySpeed: number;       // ray rotation speed
  hue: number;            // 40-55 gold, 30-40 warm orange
  alpha: number;          // base alpha
  twinkleSpeed: number;
  phase: number;          // animation phase offset
  isBright: boolean;
}

interface ExplosionState {
  active: boolean;
  phase: 'flash' | 'expand' | 'recover';
  progress: number;       // 0-1 within phase
  time: number;           // ms since explosion started
  rays: { angle: number; length: number }[];
  particles: { x: number; y: number; vx: number; vy: number; alpha: number; size: number; life: number }[];
}

const STAR_COUNT = 250;

function createStars(width: number, height: number): Star[] {
  const stars: Star[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy);

  for (let i = 0; i < STAR_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * maxR;
    const isBright = Math.random() < 0.18;

    // Color: golden/amber (40-55) with some warm orange (30-40)
    const hue = Math.random() < 0.2
      ? 30 + Math.random() * 10  // warm orange
      : 40 + Math.random() * 15; // golden (40-55)

    const size = isBright
      ? 1.5 + Math.random() * 2.5   // bright core: 1.5-4px
      : 0.8 + Math.random() * 1.2;  // dim core: 0.8-2px

    const glowRadius = isBright
      ? size * (6 + Math.random() * 8)  // bright glow: 15-40px
      : size * (3 + Math.random() * 4); // dim glow: 3-7px

    const rays = isBright
      ? 4 + Math.floor(Math.random() * 3)  // 4-6 rays
      : Math.random() < 0.3
        ? 4 + Math.floor(Math.random() * 3)
        : 0;

    stars.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      baseX: cx + Math.cos(angle) * radius,
      baseY: cy + Math.sin(angle) * radius,
      size,
      glowRadius,
      rays,
      rayAngle: Math.random() * Math.PI * 2,
      raySpeed: (0.0001 + Math.random() * 0.0003) * (Math.random() < 0.5 ? 1 : -1),
      hue,
      alpha: isBright
        ? 0.5 + Math.random() * 0.5
        : 0.2 + Math.random() * 0.3,
      twinkleSpeed: isBright
        ? 0.0006 + Math.random() * 0.001   // 3-8s period
        : 0.002 + Math.random() * 0.006,   // 1-3s period
      phase: Math.random() * Math.PI * 2,
      isBright,
    });
  }
  return stars;
}

/**
 * Draw a star with particle glow halo and light rays.
 */
function drawParticleStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  star: Star,
  time: number,
): void {
  const { x, y, size, glowRadius, rays, rayAngle, raySpeed, hue, alpha, phase, twinkleSpeed, isBright } = star;

  // Twinkle: modulate alpha and glowRadius with sine wave
  const twinkle = Math.sin(time * twinkleSpeed + phase);
  const currentAlpha = alpha * (0.4 + 0.6 * twinkle);
  const currentGlow = glowRadius * (0.7 + 0.3 * twinkle);

  if (currentAlpha < 0.02) return;

  // 1. Draw radial gradient glow halo
  //    Center is bright, fades to transparent at glowRadius
  const glow = ctx.createRadialGradient(x, y, 0, x, y, currentGlow);

  if (isBright) {
    // Bright star: bright center → soft glow
    glow.addColorStop(0, `hsla(${hue}, 90%, 85%, ${currentAlpha * 0.6})`);
    glow.addColorStop(0.15, `hsla(${hue}, 85%, 75%, ${currentAlpha * 0.35})`);
    glow.addColorStop(0.4, `hsla(${hue}, 80%, 65%, ${currentAlpha * 0.12})`);
    glow.addColorStop(0.7, `hsla(${hue}, 75%, 55%, ${currentAlpha * 0.04})`);
    glow.addColorStop(1, `hsla(${hue}, 70%, 50%, 0)`);
  } else {
    // Dim star: subtle soft halo
    glow.addColorStop(0, `hsla(${hue}, 80%, 70%, ${currentAlpha * 0.25})`);
    glow.addColorStop(0.3, `hsla(${hue}, 75%, 60%, ${currentAlpha * 0.1})`);
    glow.addColorStop(0.6, `hsla(${hue}, 70%, 55%, ${currentAlpha * 0.03})`);
    glow.addColorStop(1, `hsla(${hue}, 65%, 50%, 0)`);
  }

  ctx.beginPath();
  ctx.arc(x, y, currentGlow, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  // 2. Draw core bright point (small solid circle)
  const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
  coreGrad.addColorStop(0, `hsla(${hue}, 60%, 95%, ${currentAlpha})`);
  coreGrad.addColorStop(0.5, `hsla(${hue}, 70%, 80%, ${currentAlpha * 0.7})`);
  coreGrad.addColorStop(1, `hsla(${hue}, 80%, 70%, 0)`);

  ctx.beginPath();
  ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
  ctx.fillStyle = coreGrad;
  ctx.fill();

  // 3. Draw light rays (only for stars with rays)
  if (rays > 0) {
    const rayLen = currentGlow * 1.2;
    const rayAngleRot = rayAngle + time * raySpeed;
    const rayAlpha = currentAlpha * (isBright ? 0.35 : 0.12);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rayAngleRot);

    for (let r = 0; r < rays; r++) {
      const angle = (r * Math.PI * 2) / rays;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // Thin ray line with gradient fade
      const rayGrad = ctx.createLinearGradient(0, 0, cos * rayLen, sin * rayLen);
      rayGrad.addColorStop(0, `hsla(${hue}, 80%, 85%, ${rayAlpha})`);
      rayGrad.addColorStop(0.4, `hsla(${hue}, 75%, 75%, ${rayAlpha * 0.5})`);
      rayGrad.addColorStop(1, `hsla(${hue}, 70%, 65%, 0)`);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(cos * rayLen, sin * rayLen);
      ctx.strokeStyle = rayGrad;
      ctx.lineWidth = isBright ? 0.8 : 0.4;
      ctx.stroke();
    }

    ctx.restore();
  }
}

export default function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastExplosionRef = useRef(0);
  const explosionRef = useRef<ExplosionState>({ active: false, phase: 'flash', progress: 0, time: 0, rays: [], particles: [] });
  const starPositionsRef = useRef<{ x: number; y: number }[]>([]); // snapshot before explosion

  const draw = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const cx = width / 2;
    const cy = height / 2;

    // Delta time
    const dt = lastTimeRef.current ? time - lastTimeRef.current : 16;
    lastTimeRef.current = time;

    // Clear with gradient background
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0a0a2e');
    grad.addColorStop(0.5, '#0f0a28');
    grad.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Check for explosion trigger (every ~30-60 seconds)
    if (!explosionRef.current.active && (time - lastExplosionRef.current) > 30000 + Math.random() * 30000) {
      let totalDist = 0;
      for (const s of starsRef.current) {
        const dx = s.x - cx;
        const dy = s.y - cy;
        totalDist += Math.sqrt(dx * dx + dy * dy);
      }
      const avgDist = totalDist / starsRef.current.length;
      if (avgDist < 50) {
        // Snap current positions as start positions for the explosion
        starPositionsRef.current = starsRef.current.map(s => ({ x: s.x, y: s.y }));
        // Generate rays
        const rayCount = 40 + Math.floor(Math.random() * 20);
        const rays = Array.from({ length: rayCount }, () => ({
          angle: Math.random() * Math.PI * 2,
          length: 0, // will grow during phase 1
        }));
        // Generate extra particles
        const particleCount = 120 + Math.floor(Math.random() * 80);
        const particles = Array.from({ length: particleCount }, () => {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 4;
          return {
            x: cx,
            y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 0.6 + Math.random() * 0.4,
            size: 0.5 + Math.random() * 1.5,
            life: 0.5 + Math.random() * 0.5, // fraction of expand phase before fading
          };
        });
        explosionRef.current = { active: true, phase: 'flash', progress: 0, time: 0, rays, particles };
        lastExplosionRef.current = time;
      }
    }

    // Handle explosion animation
    const exp = explosionRef.current;
    if (exp.active) {
      exp.time += dt;
      const totalTime = exp.time;

      // --- Phase 1: Flash + Light Rays (0-200ms) ---
      if (totalTime < 200) {
        exp.phase = 'flash';
        const p = totalTime / 200;
        // Ease out
        const ep = 1 - Math.pow(1 - p, 3);

        // Background flash
        const flashAlpha = Math.sin(p * Math.PI) * 0.35;
        ctx.fillStyle = `rgba(255, 248, 220, ${flashAlpha})`;
        ctx.fillRect(0, 0, width, height);

        // Draw rays from center
        for (const ray of exp.rays) {
          const rayLen = ep * Math.max(width, height) * 0.6;
          const rayAlpha = (1 - p * 0.5) * 0.6;
          const grad = ctx.createLinearGradient(cx, cy, cx + Math.cos(ray.angle) * rayLen, cy + Math.sin(ray.angle) * rayLen);
          grad.addColorStop(0, `rgba(255, 240, 200, ${rayAlpha})`);
          grad.addColorStop(0.3, `rgba(255, 220, 150, ${rayAlpha * 0.6})`);
          grad.addColorStop(1, `rgba(255, 200, 100, 0)`);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(ray.angle) * rayLen, cy + Math.sin(ray.angle) * rayLen);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5 + (1 - p) * 2;
          ctx.stroke();
        }

        // Stars at max brightness
        for (const s of starsRef.current) {
          s.alpha = 1;
        }
      }
      // --- Phase 2: Particle Burst (200-800ms) ---
      else if (totalTime < 800) {
        exp.phase = 'expand';
        const p = (totalTime - 200) / 600;
        const ep = 1 - Math.pow(1 - p, 2);

        // Continue rays fading out
        const rayFade = 1 - p;
        for (const ray of exp.rays) {
          const rayLen = Math.max(width, height) * 0.6 * (0.5 + ep * 0.5);
          const rayAlpha = rayFade * 0.3;
          const grad = ctx.createLinearGradient(cx, cy, cx + Math.cos(ray.angle) * rayLen, cy + Math.sin(ray.angle) * rayLen);
          grad.addColorStop(0, `rgba(255, 240, 200, ${rayAlpha})`);
          grad.addColorStop(1, `rgba(255, 200, 100, 0)`);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(ray.angle) * rayLen, cy + Math.sin(ray.angle) * rayLen);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Draw extra particles
        for (const pt of exp.particles) {
          const ptLife = pt.life;
          const fadeStart = 0.5;
          let ptAlpha = pt.alpha;
          if (p > fadeStart) {
            ptAlpha *= 1 - (p - fadeStart) / (1 - fadeStart);
          }
          if (ptAlpha <= 0) continue;

          const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.size * 2);
          grad.addColorStop(0, `rgba(255, 240, 200, ${ptAlpha})`);
          grad.addColorStop(0.5, `rgba(255, 210, 140, ${ptAlpha * 0.5})`);
          grad.addColorStop(1, `rgba(255, 180, 80, 0)`);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Stars fly outward from center with easing
        for (let i = 0; i < starsRef.current.length; i++) {
          const s = starsRef.current[i];
          const orig = starPositionsRef.current[i];
          const dx = orig.x - cx;
          const dy = orig.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const angle = Math.atan2(dy, dx);
          const spread = ep * Math.max(width, height) * 0.5;
          s.x = cx + Math.cos(angle) * dist + Math.cos(angle) * spread;
          s.y = cy + Math.sin(angle) * dist + Math.sin(angle) * spread;
          // Fade alpha
          const fadeAlpha = 1 - p * 0.6;
          s.alpha = fadeAlpha;
        }
      }
      // --- Phase 3: Recovery (800-1500ms) ---
      else if (totalTime < 1500) {
        exp.phase = 'recover';
        const p = (totalTime - 800) / 700;
        const ep = p * p; // ease in

        // Stars return to base positions
        for (let i = 0; i < starsRef.current.length; i++) {
          const s = starsRef.current[i];
          const base = {
            x: starPositionsRef.current[i].x,
            y: starPositionsRef.current[i].y,
          };
          s.x = base.x + (s.x - base.x) * (1 - ep);
          s.y = base.y + (s.y - base.y) * (1 - ep);
          // Restore alpha
          const targetAlpha = s.isBright ? 0.7 : 0.35;
          s.alpha = targetAlpha + (1 - targetAlpha) * ep;
        }

        // Particles fading out
        for (const pt of exp.particles) {
          const fadeAlpha = Math.max(0, 1 - (p + 0.2) * 2);
          if (fadeAlpha <= 0) continue;
          const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.size);
          grad.addColorStop(0, `rgba(255, 240, 200, ${fadeAlpha * 0.3})`);
          grad.addColorStop(1, `rgba(255, 200, 100, 0)`);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }
      // --- Explosion complete ---
      else {
        exp.active = false;
        // Reset stars to clean state
        starsRef.current.forEach((s, i) => {
          s.x = starPositionsRef.current[i].x;
          s.y = starPositionsRef.current[i].y;
          s.alpha = s.isBright ? 0.7 : 0.35;
        });
      }
    } else {
      // Normal spiral shrink phase
      for (let i = 0; i < starsRef.current.length; i++) {
        const s = starsRef.current[i];

        // Spiral rotation + shrink toward center
        const dx = s.x - cx;
        const dy = s.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const rotationSpeed = 0.00004;
        const SHRINK_SPEED = 0.00002;
        const newAngle = angle + rotationSpeed * dt;
        const newDist = dist * (1 - SHRINK_SPEED * dt);

        s.x = cx + Math.cos(newAngle) * newDist;
        s.y = cy + Math.sin(newAngle) * newDist;

        // Reset if too close to center
        if (newDist < 2) {
          const resetAngle = Math.random() * Math.PI * 2;
          const resetRadius = Math.max(width, height) * 0.5;
          s.x = cx + Math.cos(resetAngle) * resetRadius;
          s.y = cy + Math.sin(resetAngle) * resetRadius;
        }
      }
    }

    // Draw all stars
    for (let i = 0; i < starsRef.current.length; i++) {
      const s = starsRef.current[i];
      const rx = s.x;
      const ry = s.y;

      // Skip if off screen
      if (rx < -50 || rx > width + 50 || ry < -50 || ry > height + 50) continue;

      // Draw particle star
      drawParticleStar(ctx, rx, ry, s, time);
    }

    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      const newStars = createStars(window.innerWidth, window.innerHeight);
      starsRef.current = newStars;
      starPositionsRef.current = newStars.map(s => ({ x: s.x, y: s.y }));
    };

    resize();
    window.addEventListener('resize', resize);

    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
      aria-hidden="true"
    />
  );
}
