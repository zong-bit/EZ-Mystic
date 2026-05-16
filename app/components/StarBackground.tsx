'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Star {
  x: number;
  y: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  size: number;
  hue: number;
  saturation: number;
  lightness: number;
  breathePhase: number;
  breatheSpeed: number;
  breatheAmount: number;
  isBright: boolean;
}

const STAR_COUNT = 300;
const ROTATION_PERIOD = 90; // seconds per full rotation (slower for subtler effect)
const SHRINK_SPEED = 0.00002; // pixels per ms — very slow inward drift

function createStars(width: number, height: number): Star[] {
  const stars: Star[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy);

  for (let i = 0; i < STAR_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * maxR;
    // Brighter stars get golden hues, dimmer stars get warmer gold
    const isBright = Math.random() < 0.15;
    const hue = isBright
      ? 42 + Math.random() * 10  // 42-52 bright gold
      : 45 + Math.random() * 15; // 45-60 warm gold/amber
    const sat = 80 + Math.random() * 20;
    const light = isBright
      ? 70 + Math.random() * 20  // 70-90 bright
      : 60 + Math.random() * 15; // 60-75 dimmer

    // Bright stars twinkle slower, dim stars twinkle faster
    const twinkleSpeed = isBright
      ? 0.0008 + Math.random() * 0.001  // slower (3-8s period)
      : 0.002 + Math.random() * 0.006;  // faster (1-3s period)

    stars.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      baseAlpha: isBright ? 0.6 + Math.random() * 0.4 : 0.3 + Math.random() * 0.4,
      alpha: 0,
      twinkleSpeed,
      twinkleOffset: Math.random() * Math.PI * 2,
      size: isBright
        ? 2 + Math.random() * 4  // bright stars: 2-6px
        : 1 + Math.random() * 1.5, // dim stars: 1-2.5px
      hue,
      saturation: sat,
      lightness: light,
      // Breathe effect (slow size pulsing)
      breathePhase: Math.random() * Math.PI * 2,
      breatheSpeed: 0.0003 + Math.random() * 0.0005,
      breatheAmount: isBright ? 0.15 + Math.random() * 0.15 : 0.05 + Math.random() * 0.05,
      isBright,
    });
  }
  return stars;
}

/**
 * Draw a filled five-pointed star at (cx, cy) with the given outer radius.
 */
function drawStarPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  rotation: number,
) {
  const points = 5;
  const step = Math.PI / points;

  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = rotation + (i * step);
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
}

export default function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const rotationRef = useRef<number>(0);

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

    // Update rotation
    rotationRef.current += (dt / 1000) * (2 * Math.PI) / ROTATION_PERIOD;
    const rot = rotationRef.current;

    // Clear with gradient background
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0a0a2e');
    grad.addColorStop(0.5, '#0f0a28');
    grad.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Update and draw stars
    const stars = starsRef.current;
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];

      // Rotate around center
      const dx = s.x - cx;
      const dy = s.y - cy;
      const cos = Math.cos(rot);
      const sin = Math.sin(rot);
      const rx = dx * cos - dy * sin + cx;
      const ry = dx * sin + dy * cos + cy;

      // Shrink toward center (very slow)
      const shrinkFactor = 1 - SHRINK_SPEED * dt;
      s.x = cx + (s.x - cx) * shrinkFactor;
      s.y = cy + (s.y - cy) * shrinkFactor;

      // Twinkle: from dark → bright → dark
      // Use squared sine for sharper peaks (more dramatic twinkling)
      const twinkleRaw = Math.sin(time * s.twinkleSpeed + s.twinkleOffset);
      // Map to 0..1 with sharper transitions
      s.alpha = s.baseAlpha * (0.3 + 0.7 * twinkleRaw * twinkleRaw);

      // Breathe effect: slow size pulsing
      const breathe = 1 + s.breatheAmount * Math.sin(time * s.breatheSpeed + s.breathePhase);
      const effectiveSize = s.size * breathe;

      // Reset if too close to center
      const dist = Math.sqrt((s.x - cx) ** 2 + (s.y - cy) ** 2);
      if (dist < 2) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(width, height) * 0.5;
        s.x = cx + Math.cos(angle) * radius;
        s.y = cy + Math.sin(angle) * radius;
      }

      // Skip if off screen
      if (rx < -10 || rx > width + 10 || ry < -10 || ry > height + 10) continue;

      // Draw star shape (five-pointed)
      const innerR = effectiveSize * 0.4;
      drawStarPath(ctx, rx, ry, effectiveSize, innerR, time * 0.0003 + i);

      const lightness = s.lightness + s.alpha * 15;
      ctx.fillStyle = `hsla(${s.hue}, ${s.saturation}%, ${lightness}%, ${s.alpha})`;
      ctx.fill();

      // Glow effect for brighter stars
      if (s.alpha > 0.5) {
        const glowSize = effectiveSize * (s.isBright ? 4 : 2.5);
        const glowAlpha = s.alpha * (s.isBright ? 0.12 : 0.06);
        ctx.beginPath();
        ctx.arc(rx, ry, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, ${s.saturation}%, ${Math.min(lightness + 15, 95)}%, ${glowAlpha})`;
        ctx.fill();
      }
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
      starsRef.current = createStars(window.innerWidth, window.innerHeight);
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
      className="fixed inset-0 -z-10"
      style={{ width: '100vw', height: '100vh' }}
      aria-hidden="true"
    />
  );
}
