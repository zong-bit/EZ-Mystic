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
}

const STAR_COUNT = 250;
const ROTATION_PERIOD = 60; // seconds per full rotation
const SHRINK_SPEED = 0.00003; // pixels per ms — very slow inward drift

function createStars(width: number, height: number): Star[] {
  const stars: Star[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy);

  for (let i = 0; i < STAR_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * maxR;
    stars.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      baseAlpha: 0.3 + Math.random() * 0.7,
      alpha: 0,
      twinkleSpeed: 0.001 + Math.random() * 0.003, // period ~2-7s
      twinkleOffset: Math.random() * Math.PI * 2,
      size: 1 + Math.random() * 2,
      hue: 200 + Math.random() * 60, // 200-260 (blue-white range)
    });
  }
  return stars;
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

      // Twinkle
      s.alpha = s.baseAlpha * (0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset));

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

      // Draw star
      ctx.beginPath();
      ctx.arc(rx, ry, s.size, 0, Math.PI * 2);
      const hue = s.hue;
      const lightness = 80 + s.alpha * 20;
      ctx.fillStyle = `hsla(${hue}, 30%, ${lightness}%, ${s.alpha})`;
      ctx.fill();

      // Glow effect for brighter stars
      if (s.alpha > 0.6) {
        ctx.beginPath();
        ctx.arc(rx, ry, s.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 40%, 90%, ${s.alpha * 0.1})`;
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
