'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Star {
  x: number;
  y: number;
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
  homeX: number;          // initial random position (reset after explosion)
  homeY: number;
}

interface ExplosionState {
  active: boolean;
  phase: 'flash' | 'expand' | 'recover' | 'lightball';
  progress: number;       // 0-1 within phase
  time: number;           // ms since explosion started
  rays: { angle: number; length: number }[];
  particles: { x: number; y: number; vx: number; vy: number; alpha: number; size: number; life: number }[];
  shockwaveRings: { x: number; y: number; radius: number; alpha: number; speed: number }[];
  lightBallTimer: number; // ms accumulated in light ball phase
}

interface LightBallState {
  active: boolean;
  timer: number;          // ms in light ball phase
}

const STAR_COUNT = 3000;

/**
 * Draw a tai chi path (unfilled) for evenodd mask overlay.
 * The path forms the tai chi shape; when filled with evenodd,
 * the tai chi interior is excluded (a "hole" in the overlay).
 */
function drawTaiChiPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  rotation: number,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  // Outer circle (clockwise for evenodd hole)
  ctx.arc(0, 0, radius, 0, Math.PI * 2, true);

  // Left fish (yang) - clockwise semicircle
  ctx.arc(-radius / 2, 0, radius / 2, 0, Math.PI * 2, true);

  // Right fish (yin) - clockwise semicircle
  ctx.arc(radius / 2, 0, radius / 2, Math.PI, 0, true);

  // Left fish eye
  ctx.arc(-radius / 2, 0, radius / 6, 0, Math.PI * 2, true);

  // Right fish eye
  ctx.arc(radius / 2, 0, radius / 6, 0, Math.PI * 2, true);

  ctx.restore();
}

function createStars(width: number, height: number): Star[] {
  const stars: Star[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.max(width, height) * 0.5;

  for (let i = 0; i < STAR_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    // 20% of stars on the edge, forming a natural glowing ring
    const isEdge = Math.random() < 0.2;
    const radius = isEdge
      ? maxR * (0.9 + Math.random() * 0.08)  // edge 90-98%
      : Math.random() * maxR * 0.85;          // interior 0-85%
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
      homeX: cx + Math.cos(angle) * radius,
      homeY: cy + Math.sin(angle) * radius,
      isBright,
    });
  }
  return stars;
}

/**
 * Draw a star with particle glow halo and light rays.
 * Stars are always drawn in full gold; the tai chi mask overlay
 * controls which stars are visible.
 */
function drawParticleStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  star: Star,
  time: number,
): void {
  const { x, y, size, glowRadius, rays, rayAngle, raySpeed, hue, alpha, phase, twinkleSpeed, isBright } = star;

  // Always draw in pure golden color
  const displayAlphaScale = 1;
  const displayHue = hue;  // 40-55 golden range
  const displaySat = 80;
  const displayLight = 60;

  // Twinkle: modulate alpha and glowRadius with sine wave
  const twinkle = Math.sin(time * twinkleSpeed + phase);
  const currentAlpha = alpha * displayAlphaScale * (0.4 + 0.6 * twinkle);
  const currentGlow = glowRadius * (0.7 + 0.3 * twinkle);

  if (currentAlpha < 0.02) return;

  // 1. Draw radial gradient glow halo
  const glow = ctx.createRadialGradient(x, y, 0, x, y, currentGlow);

  if (isBright) {
    glow.addColorStop(0, `hsla(${displayHue}, ${displaySat}%, ${displayLight}%, ${currentAlpha * 0.6})`);
    glow.addColorStop(0.15, `hsla(${displayHue}, ${displaySat - 5}%, ${displayLight - 10}%, ${currentAlpha * 0.35})`);
    glow.addColorStop(0.4, `hsla(${displayHue}, ${displaySat - 10}%, ${displayLight - 20}%, ${currentAlpha * 0.12})`);
    glow.addColorStop(0.7, `hsla(${displayHue}, ${displaySat - 15}%, ${displayLight - 30}%, ${currentAlpha * 0.04})`);
    glow.addColorStop(1, `hsla(${displayHue}, ${displaySat - 20}%, ${displayLight - 35}%, 0)`);
  } else {
    glow.addColorStop(0, `hsla(${displayHue}, ${displaySat}%, ${displayLight}%, ${currentAlpha * 0.25})`);
    glow.addColorStop(0.3, `hsla(${displayHue}, ${displaySat - 5}%, ${displayLight - 10}%, ${currentAlpha * 0.1})`);
    glow.addColorStop(0.6, `hsla(${displayHue}, ${displaySat - 10}%, ${displayLight - 15}%, ${currentAlpha * 0.03})`);
    glow.addColorStop(1, `hsla(${displayHue}, ${displaySat - 15}%, ${displayLight - 20}%, 0)`);
  }

  ctx.beginPath();
  ctx.arc(x, y, currentGlow, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  // 2. Draw core bright point
  const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
  coreGrad.addColorStop(0, `hsla(${displayHue}, 60%, 95%, ${currentAlpha})`);
  coreGrad.addColorStop(0.5, `hsla(${displayHue}, 70%, 80%, ${currentAlpha * 0.7})`);
  coreGrad.addColorStop(1, `hsla(${displayHue}, 80%, 70%, 0)`);

  ctx.beginPath();
  ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
  ctx.fillStyle = coreGrad;
  ctx.fill();

  // 3. Draw light rays
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

      const rayGrad = ctx.createLinearGradient(0, 0, cos * rayLen, sin * rayLen);
      rayGrad.addColorStop(0, `hsla(${displayHue}, 80%, 85%, ${rayAlpha})`);
      rayGrad.addColorStop(0.4, `hsla(${displayHue}, 75%, 75%, ${rayAlpha * 0.5})`);
      rayGrad.addColorStop(1, `hsla(${displayHue}, 70%, 65%, 0)`);

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
  const explosionRef = useRef<ExplosionState>({ active: false, phase: 'flash', progress: 0, time: 0, rays: [], particles: [], shockwaveRings: [], lightBallTimer: 0 });
  const starPositionsRef = useRef<{ x: number; y: number }[]>([]);
  const maskOpacityRef = useRef(0);
  const maskRadiusRef = useRef(400);
  const maskAngleRef = useRef(0);

  const draw = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const cx = width / 2;
    const cy = height / 2;
    const maxR = Math.max(width, height) * 0.5;

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

    // --- Check explosion trigger (time-based: every 45s) ---
    const CYCLE_DURATION = 600000; // 600s per reincarnation cycle
    const cycleTime = time - lastExplosionRef.current;
    if (!explosionRef.current.active && cycleTime > CYCLE_DURATION) {
      starPositionsRef.current = starsRef.current.map(s => ({ x: s.x, y: s.y }));

      const rayCount = 40 + Math.floor(Math.random() * 20);
      const rays = Array.from({ length: rayCount }, () => ({
        angle: Math.random() * Math.PI * 2,
        length: 0,
      }));

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
          life: 0.5 + Math.random() * 0.5,
        };
      });

      // Shockwave rings (sine wave shape)
      const shockwaveRings = Array.from({ length: 3 }, (_, i) => ({
        x: cx,
        y: cy,
        radius: 0,
        alpha: 0.5 - i * 0.12,
        speed: 2.5 + i * 0.5,
      }));

      explosionRef.current = { active: true, phase: 'flash', progress: 0, time: 0, rays, particles, shockwaveRings, lightBallTimer: 0 };
      lastExplosionRef.current = time;
    }

    const exp = explosionRef.current;

    if (exp.active) {
      exp.time += dt;
      const totalTime = exp.time;

      // --- Phase 1: Flash + Light Rays (0-200ms) ---
      if (totalTime < 200) {
        exp.phase = 'flash';
        const p = totalTime / 200;
        const ep = 1 - Math.pow(1 - p, 3);

        // Center flash (white/golden radial)
        const flashAlpha = Math.sin(p * Math.PI) * 0.35;
        ctx.fillStyle = `rgba(255, 248, 220, ${flashAlpha})`;
        ctx.fillRect(0, 0, width, height);

        // Radial flash from center
        const flashGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.4);
        flashGrad.addColorStop(0, `rgba(255, 250, 230, ${flashAlpha * 1.5})`);
        flashGrad.addColorStop(0.3, `rgba(255, 240, 200, ${flashAlpha * 0.6})`);
        flashGrad.addColorStop(1, `rgba(255, 200, 100, 0)`);
        ctx.fillStyle = flashGrad;
        ctx.fillRect(0, 0, width, height);

        // Rays from center
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

        // Shockwave rings (sine wave ripple)
        for (const ring of exp.shockwaveRings) {
          ring.radius += ring.speed * dt;
          const fadeAlpha = ring.alpha * (1 - p * 0.8);
          if (fadeAlpha <= 0) continue;

          // Sine wave ripple effect
          const segments = 72;
          ctx.beginPath();
          for (let i = 0; i <= segments; i++) {
            const a = (i / segments) * Math.PI * 2;
            const ripple = Math.sin(a * 8 + p * 10) * 3; // sine wave ripple
            const r = ring.radius + ripple;
            const px = ring.x + Math.cos(a) * r;
            const py = ring.y + Math.sin(a) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.strokeStyle = `rgba(255, 245, 210, ${fadeAlpha})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Rays fading
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

        // Particles
        for (const pt of exp.particles) {
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
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

        // Stars fly outward from center (random directions, not uniform ring)
        for (let i = 0; i < starsRef.current.length; i++) {
          const s = starsRef.current[i];
          const orig = starPositionsRef.current[i];
          const dx = orig.x - cx;
          const dy = orig.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const angle = Math.atan2(dy, dx);

          // Random spread direction (not just radial)
          const spreadAngle = angle + (Math.random() - 0.5) * 0.8;
          const spread = ep * Math.max(width, height) * 0.5;

          s.x = cx + Math.cos(spreadAngle) * (dist + spread);
          s.y = cy + Math.sin(spreadAngle) * (dist + spread);

          const fadeAlpha = 1 - p * 0.6;
          s.alpha = fadeAlpha;
        }
      }
      // --- Phase 3: Recovery (800-1500ms) ---
      else if (totalTime < 1500) {
        exp.phase = 'recover';
        const p = (totalTime - 800) / 700;
        const ep = p * p;

        // Stars return to base positions
        for (let i = 0; i < starsRef.current.length; i++) {
          const s = starsRef.current[i];
          const base = {
            x: starPositionsRef.current[i].x,
            y: starPositionsRef.current[i].y,
          };
          s.x = base.x + (s.x - base.x) * (1 - ep);
          s.y = base.y + (s.y - base.y) * (1 - ep);
          const targetAlpha = s.isBright ? 0.7 : 0.35;
          s.alpha = targetAlpha + (1 - targetAlpha) * ep;
        }

        // Particles fading
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
      // --- Explosion complete, reset for reincarnation ---
      else {
        exp.active = false;
        // Reset stars to fully random positions across the entire canvas
        const resetStars = createStars(width, height);
        starsRef.current = resetStars;
        starPositionsRef.current = resetStars.map(s => ({ x: s.x, y: s.y }));
        lastExplosionRef.current = time;
        // Reset mask: start transparent again, radius full, reset rotation
        maskOpacityRef.current = 0;
        maskRadiusRef.current = maxR * 0.48;
        maskAngleRef.current = 0;
      }
    } else {
      // === NORMAL SPIRAL CONTRACTION ===

      // Light ball phase: when stars are very close to center
      let totalDist = 0;
      for (const s of starsRef.current) {
        const dx = s.x - cx;
        const dy = s.y - cy;
        totalDist += Math.sqrt(dx * dx + dy * dy);
      }
      const avgDist = totalDist / starsRef.current.length;
      const lightBallThreshold = maxR * 0.15;

      // Update mask state based on contraction progress
      const progress = 1 - avgDist / maxR; // 0-1 contraction progress
      maskOpacityRef.current = Math.min(0.95, progress * 1.5);
      maskRadiusRef.current = maxR * 0.48 * (1 - progress * 0.7); // shrinks with contraction
      maskAngleRef.current += 0.0003 * dt; // slow rotation

      let inLightBall = false;
      if (avgDist < lightBallThreshold && !exp.active) {
        inLightBall = true;
        exp.phase = 'lightball';
        exp.lightBallTimer += dt;

        // All stars converge to center, become brightest
        for (const s of starsRef.current) {
          s.x += (cx - s.x) * 0.05;
          s.y += (cy - s.y) * 0.05;
          s.alpha = Math.min(1, s.alpha + 0.02);
          s.hue = 45 + Math.random() * 5; // all golden
        }

        // After 2 seconds in light ball, trigger explosion
        if (exp.lightBallTimer > 2000) {
          starPositionsRef.current = starsRef.current.map(s => ({ x: s.x, y: s.y }));

          const rayCount = 40 + Math.floor(Math.random() * 20);
          const rays = Array.from({ length: rayCount }, () => ({
            angle: Math.random() * Math.PI * 2,
            length: 0,
          }));

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
              life: 0.5 + Math.random() * 0.5,
            };
          });

          const shockwaveRings = Array.from({ length: 3 }, (_, i) => ({
            x: cx,
            y: cy,
            radius: 0,
            alpha: 0.5 - i * 0.12,
            speed: 2.5 + i * 0.5,
          }));

          explosionRef.current = { active: true, phase: 'flash', progress: 0, time: 0, rays, particles, shockwaveRings, lightBallTimer: 0 };
          lastExplosionRef.current = time;
        }
      }

      if (!inLightBall) {
        for (let i = 0; i < starsRef.current.length; i++) {
          const s = starsRef.current[i];

          const dx = s.x - cx;
          const dy = s.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);

          // Spiral rotation and shrink — NO tai chi pull
          const SHRINK_SPEED = 0.00002;
          const ROTATION_SPEED = 0.00004;

          const newAngle = angle + ROTATION_SPEED * dt;
          const newDist = dist * (1 - SHRINK_SPEED * dt);

          s.x = cx + Math.cos(newAngle) * newDist;
          s.y = cy + Math.sin(newAngle) * newDist;

          // Reset star if too close to center (safety net)
          if (newDist < 2) {
            const resetAngle = Math.random() * Math.PI * 2;
            const resetRadius = maxR;
            s.x = cx + Math.cos(resetAngle) * resetRadius;
            s.y = cy + Math.sin(resetAngle) * resetRadius;
          }
        }
      }
    }

    // Draw all stars
    for (let i = 0; i < starsRef.current.length; i++) {
      const s = starsRef.current[i];
      const rx = s.x;
      const ry = s.y;

      if (rx < -50 || rx > width + 50 || ry < -50 || ry > height + 50) continue;

      drawParticleStar(ctx, rx, ry, s, time);
    }

    // === Draw tai chi mask overlay (solid color, no destination-out) ===
    const maskAlpha = maskOpacityRef.current * 0.85;
    if (maskAlpha > 0.01 && !exp.active) {
      ctx.save();
      ctx.globalAlpha = maskAlpha;

      // Same gradient as background for perfect blend
      const maskGrad = ctx.createLinearGradient(0, 0, width, height);
      maskGrad.addColorStop(0, '#0a0a2e');
      maskGrad.addColorStop(0.5, '#0f0a28');
      maskGrad.addColorStop(1, '#1a0a2e');
      ctx.fillStyle = maskGrad;

      // Full-screen rect + tai chi path → evenodd fills non-tai-chi area
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      drawTaiChiPath(ctx, cx, cy, maskRadiusRef.current, maskAngleRef.current);
      ctx.fill('evenodd');

      ctx.restore();
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
