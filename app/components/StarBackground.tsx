'use client';

import { useEffect, useRef } from 'react';

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

interface Star {
  /** Polar radius from canvas center */
  orbitR: number;
  /** Polar angle from canvas center (base, before rotation) */
  orbitA: number;
  /** Core radius */
  size: number;
  /** Glow halo radius */
  glowRadius: number;
  /** Hue for colour */
  hue: number;
  /** Saturation */
  sat: number;
  /** Lightness */
  light: number;
  /** Base alpha (0-1) */
  baseAlpha: number;
  /** Twinkle frequency */
  twinkleSpeed: number;
  /** Twinkle phase offset */
  twinklePhase: number;
  /** Radial wobble amplitude (pixels) */
  wobbleAmount: number;
  /** Wobble frequency */
  wobbleSpeed: number;
  /** Wobble phase offset */
  wobblePhase: number;
  /** Region classification */
  region: 'yang' | 'yin' | 'bg';
  /** Whether this star gets full glow + rays treatment */
  isBright: boolean;
  /** Number of light rays (0 = none) */
  rays: number;
  /** Ray rotation angle */
  rayAngle: number;
  /** Ray spin speed */
  raySpeed: number;
}

// ──────────────────────────────────────────
// Tai Chi geometry — pure math, no canvas
// ──────────────────────────────────────────

/**
 * Classify a point (dx, dy) relative to the Tai Chi centre.
 * @param dx  x-offset from centre
 * @param dy  y-offset from centre
 * @param R   outer circle radius
 * @returns   'yang' | 'yin' | 'outside'
 */
function classifyTaiChi(dx: number, dy: number, R: number): 'yang' | 'yin' | 'outside' {
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > R) return 'outside';

  const fishR = R / 2;

  if (dy < 0) {
    // ── Upper half ──
    // Upper fish centre at (0, -R/2)
    const fishDx = dx;
    const fishDy = dy + fishR;
    const distFish = Math.sqrt(fishDx * fishDx + fishDy * fishDy);

    if (distFish < fishR) {
      // Inside upper fish → yang (white); fish-eye dot → yin
      return distFish < R / 8 ? 'yin' : 'yang';
    }

    // Outside fish → S-curve is the RIGHT semicircle of the upper fish
    const sx = Math.sqrt(Math.max(0, fishR * fishR - fishDy * fishDy));
    return dx < sx ? 'yang' : 'yin';
  } else {
    // ── Lower half ──
    // Lower fish centre at (0, R/2)
    const fishDx = dx;
    const fishDy = dy - fishR;
    const distFish = Math.sqrt(fishDx * fishDx + fishDy * fishDy);

    if (distFish < fishR) {
      // Inside lower fish → yin (black); fish-eye dot → yang
      return distFish < R / 8 ? 'yang' : 'yin';
    }

    // Outside fish → S-curve is the LEFT semicircle of the lower fish
    const sx = -Math.sqrt(Math.max(0, fishR * fishR - fishDy * fishDy));
    return dx < sx ? 'yang' : 'yin';
  }
}

// ──────────────────────────────────────────
// Star generation
// ──────────────────────────────────────────

const TOTAL_STARS = 1100;

function createStars(width: number, height: number): Star[] {
  const stars: Star[] = [];
  const cx = width / 2;
  const cy = height / 2;

  // R slightly less than half the shortest dimension for a good fit
  const R = Math.min(width, height) * 0.42;
  const fishR = R / 2;

  // ── Helpers ──

  function makeStar(
    worldX: number,
    worldY: number,
    region: 'yang' | 'yin' | 'bg',
    opts: {
      size?: number;
      glow?: number;
      hue?: number;
      sat?: number;
      light?: number;
      alpha?: number;
      bright?: boolean;
      rays?: number;
    } = {},
  ): void {
    const dx = worldX - cx;
    const dy = worldY - cy;
    const orbitR = Math.sqrt(dx * dx + dy * dy);
    const orbitA = Math.atan2(dy, dx);

    const isBright = opts.bright ?? (region === 'yang');
    const size = opts.size ?? (isBright ? 1.0 + Math.random() * 2.2 : 0.4 + Math.random() * 0.8);
    const rayCount =
      opts.rays ??
      (isBright && Math.random() < 0.35 ? 4 + Math.floor(Math.random() * 3) : 0);

    stars.push({
      orbitR,
      orbitA,
      size,
      glowRadius: opts.glow ?? (isBright ? size * (4 + Math.random() * 7) : size * 2),
      hue: opts.hue ?? (region === 'yin' ? 220 + Math.random() * 35 : 38 + Math.random() * 14),
      sat: opts.sat ?? (region === 'yin' ? 30 + Math.random() * 25 : 55 + Math.random() * 25),
      light: opts.light ?? (region === 'yin' ? 18 + Math.random() * 15 : 45 + Math.random() * 30),
      baseAlpha: opts.alpha ?? (isBright ? 0.45 + Math.random() * 0.55 : 0.12 + Math.random() * 0.18),
      twinkleSpeed: 0.0005 + Math.random() * 0.0025,
      twinklePhase: Math.random() * Math.PI * 2,
      wobbleAmount: 0.3 + Math.random() * 0.5,
      wobbleSpeed: 0.0003 + Math.random() * 0.001,
      wobblePhase: Math.random() * Math.PI * 2,
      region,
      isBright,
      rays: rayCount,
      rayAngle: Math.random() * Math.PI * 2,
      raySpeed: (0.0001 + Math.random() * 0.0004) * (Math.random() < 0.5 ? 1 : -1),
    });
  }

  // ── 1. Outer ring stars (boundary delineation) ──
  for (let i = 0; i < 100; i++) {
    const angle = (i / 100) * Math.PI * 2;
    // Slight radial scatter so the ring isn't perfectly uniform
    const r = R * (0.98 + Math.random() * 0.02);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    makeStar(x, y, 'yang', { bright: true, alpha: 0.5 + Math.random() * 0.2, size: 1.0 + Math.random() * 1.5 });
  }

  // ── 2. S-curve boundary stars ──
  for (let i = 0; i < 80; i++) {
    const t = i / 80; // 0..1
    let px: number;
    let py: number;

    if (t < 0.5) {
      // Upper: right semicircle of upper fish
      const a = (t / 0.5) * Math.PI; // 0..π
      const angle = -Math.PI / 2 + a; // -π/2 .. π/2 (right side)
      px = Math.cos(angle) * fishR;
      py = -fishR + Math.sin(angle) * fishR;
    } else {
      // Lower: left semicircle of lower fish
      const a = ((t - 0.5) / 0.5) * Math.PI;
      const angle = Math.PI / 2 + a; // π/2 .. 3π/2 (left side)
      px = Math.cos(angle) * fishR;
      py = fishR + Math.sin(angle) * fishR;
    }

    makeStar(cx + px, cy + py, 'yang', {
      bright: true,
      alpha: 0.55 + Math.random() * 0.25,
      size: 0.8 + Math.random() * 1.2,
    });
  }

  // ── 3. Yang region fill ──
  let yangCount = 0;
  while (yangCount < 280) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * R * 0.95;
    const dx = Math.cos(angle) * radius;
    const dy = Math.sin(angle) * radius;
    if (classifyTaiChi(dx, dy, R) === 'yang') {
      makeStar(cx + dx, cy + dy, 'yang');
      yangCount++;
    }
  }

  // ── 4. Yin region fill ──
  let yinCount = 0;
  while (yinCount < 240) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * R * 0.95;
    const dx = Math.cos(angle) * radius;
    const dy = Math.sin(angle) * radius;
    if (classifyTaiChi(dx, dy, R) === 'yin') {
      makeStar(cx + dx, cy + dy, 'yin');
      yinCount++;
    }
  }

  // ── 5. Fish-eye dots ──
  // Yin dot inside the yang fish (upper, dark bluish)
  for (let i = 0; i < 20; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * fishR * 0.3;
    makeStar(cx + Math.cos(a) * r, cy - fishR + Math.sin(a) * r, 'yin', {
      alpha: 0.35 + Math.random() * 0.25,
      hue: 250 + Math.random() * 25,
      sat: 40 + Math.random() * 30,
      light: 20 + Math.random() * 15,
      size: 0.7 + Math.random() * 1.0,
      bright: false,
    });
  }
  // Yang dot inside the yin fish (lower, bright golden)
  for (let i = 0; i < 20; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * fishR * 0.3;
    makeStar(cx + Math.cos(a) * r, cy + fishR + Math.sin(a) * r, 'yang', {
      alpha: 0.6 + Math.random() * 0.4,
      hue: 42 + Math.random() * 8,
      sat: 70 + Math.random() * 20,
      light: 60 + Math.random() * 20,
      size: 1.2 + Math.random() * 2.0,
      bright: true,
    });
  }

  // ── 6. Background stars (scattered around the canvas, outside the Tai Chi) ──
  for (let i = 0; i < 220; i++) {
    const maxDim = Math.max(width, height) * 0.55;
    const angle = Math.random() * Math.PI * 2;
    const radius = R + Math.random() * (maxDim - R);
    const dx = Math.cos(angle) * radius;
    const dy = Math.sin(angle) * radius;

    if (classifyTaiChi(dx, dy, R) === 'outside') {
      makeStar(cx + dx, cy + dy, 'bg', {
        alpha: 0.08 + Math.random() * 0.18,
        hue: 200 + Math.random() * 80,
        sat: 20 + Math.random() * 20,
        light: 40 + Math.random() * 20,
        size: 0.3 + Math.random() * 0.7,
        bright: false,
      });
    }
  }

  return stars;
}

// ──────────────────────────────────────────
// Rendering helpers
// ──────────────────────────────────────────

/**
 * Draw a single star with glow halo, bright core, and optional light rays.
 */
function drawStar(ctx: CanvasRenderingContext2D, s: Star, time: number): void {
  const twinkle = Math.sin(time * s.twinkleSpeed + s.twinklePhase);
  const currentAlpha = s.baseAlpha * (0.4 + 0.6 * twinkle);
  const currentGlow = s.glowRadius * (0.7 + 0.3 * twinkle);

  if (currentAlpha < 0.015) return;

  // ── Glow halo ──
  const glow = ctx.createRadialGradient(s.orbitR, s.orbitA, 0, s.orbitR, s.orbitA, currentGlow);

  if (s.isBright) {
    glow.addColorStop(0, `hsla(${s.hue}, ${s.sat}%, ${s.light}%, ${currentAlpha * 0.55})`);
    glow.addColorStop(0.15, `hsla(${s.hue}, ${s.sat - 5}%, ${s.light - 10}%, ${currentAlpha * 0.3})`);
    glow.addColorStop(0.4, `hsla(${s.hue}, ${s.sat - 10}%, ${s.light - 18}%, ${currentAlpha * 0.1})`);
    glow.addColorStop(0.7, `hsla(${s.hue}, ${s.sat - 15}%, ${s.light - 28}%, ${currentAlpha * 0.035})`);
    glow.addColorStop(1, `hsla(${s.hue}, ${s.sat - 20}%, ${s.light - 35}%, 0)`);
  } else {
    glow.addColorStop(0, `hsla(${s.hue}, ${s.sat}%, ${s.light}%, ${currentAlpha * 0.2})`);
    glow.addColorStop(0.3, `hsla(${s.hue}, ${s.sat - 5}%, ${s.light - 8}%, ${currentAlpha * 0.08})`);
    glow.addColorStop(0.6, `hsla(${s.hue}, ${s.sat - 10}%, ${s.light - 12}%, ${currentAlpha * 0.025})`);
    glow.addColorStop(1, `hsla(${s.hue}, ${s.sat - 12}%, ${s.light - 15}%, 0)`);
  }

  ctx.beginPath();
  ctx.arc(s.orbitR, s.orbitA, currentGlow, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  // ── Bright core ──
  const core = ctx.createRadialGradient(s.orbitR, s.orbitA, 0, s.orbitR, s.orbitA, s.size * 1.5);
  core.addColorStop(0, `hsla(${s.hue}, 60%, 92%, ${currentAlpha})`);
  core.addColorStop(0.5, `hsla(${s.hue}, 70%, 78%, ${currentAlpha * 0.6})`);
  core.addColorStop(1, `hsla(${s.hue}, 80%, 65%, 0)`);

  ctx.beginPath();
  ctx.arc(s.orbitR, s.orbitA, s.size * 1.5, 0, Math.PI * 2);
  ctx.fillStyle = core;
  ctx.fill();

  // ── Light rays (only for bright stars) ──
  if (s.rays > 0) {
    const rayLen = currentGlow * 1.1;
    const rayAlpha = currentAlpha * (s.isBright ? 0.3 : 0.1);
    const rot = s.rayAngle + time * s.raySpeed;

    ctx.save();
    ctx.translate(s.orbitR, s.orbitA);
    ctx.rotate(rot);

    for (let r = 0; r < s.rays; r++) {
      const a = (r * Math.PI * 2) / s.rays;
      const cos = Math.cos(a);
      const sin = Math.sin(a);

      const grad = ctx.createLinearGradient(0, 0, cos * rayLen, sin * rayLen);
      grad.addColorStop(0, `hsla(${s.hue}, 80%, 82%, ${rayAlpha})`);
      grad.addColorStop(0.4, `hsla(${s.hue}, 75%, 72%, ${rayAlpha * 0.45})`);
      grad.addColorStop(1, `hsla(${s.hue}, 70%, 60%, 0)`);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(cos * rayLen, sin * rayLen);
      ctx.strokeStyle = grad;
      ctx.lineWidth = s.isBright ? 0.7 : 0.35;
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ──────────────────────────────────────────
// Component
// ──────────────────────────────────────────

export default function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const rotationRef = useRef<number>(0);
  const bgGradientRef = useRef<CanvasGradient | null>(null);
  let bgGradientKey = '';

  // ── Main draw loop ──

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx2d = canvas.getContext('2d');

    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      starsRef.current = createStars(window.innerWidth, window.innerHeight);
      bgGradientKey = '';
    };

    function draw(time: number): void {
      if (!canvas || !ctx2d) return;
      const { width, height } = canvas;
      const cx = width / 2;
      const cy = height / 2;

      // Delta time
      const dt = lastTimeRef.current ? time - lastTimeRef.current : 16;
      lastTimeRef.current = time;

      // ── Background gradient ──
      const gradKey = `${width}x${height}`;
      if (gradKey !== bgGradientKey) {
        bgGradientRef.current = ctx2d.createLinearGradient(0, 0, width / window.devicePixelRatio, height / window.devicePixelRatio);
        bgGradientRef.current.addColorStop(0, '#0a0a2e');
        bgGradientRef.current.addColorStop(0.5, '#0f0a28');
        bgGradientRef.current.addColorStop(1, '#1a0a2e');
        bgGradientKey = gradKey;
      }

      // Use the CSS dimensions for rendering coordinates
      const cssW = width / (window.devicePixelRatio || 1);
      const cssH = height / (window.devicePixelRatio || 1);

      ctx2d.fillStyle = bgGradientRef.current as CanvasGradient;
      ctx2d.fillRect(0, 0, cssW, cssH);

      // ── Rotation ──
      // Continually rotate; the speed is ~1 full rotation per 40 seconds
      rotationRef.current += 0.00015 * dt;

      // ── Draw stars ──
      const stars = starsRef.current;
      const R = Math.min(cssW, cssH) * 0.42;
      const rot = rotationRef.current;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Compute world position from polar (orbitR, orbitA + rotation + wobble)
        const wobble = Math.sin(time * s.wobbleSpeed + s.wobblePhase) * s.wobbleAmount;
        const angle = s.orbitA + rot;
        const r = Math.max(0.01, s.orbitR + wobble);

        const wx = cx + Math.cos(angle) * r;
        const wy = cy + Math.sin(angle) * r;

        // Skip off-screen stars
        if (wx < -60 || wx > cssW + 60 || wy < -60 || wy > cssH + 60) continue;

        // Temporarily mutate orbitR/orbitA for the drawing function to read
        // (We save/restore instead of creating temp objects for performance)
        const savedR = s.orbitR;
        const savedA = s.orbitA;
        s.orbitR = wx;
        s.orbitA = wy;

        drawStar(ctx2d, s, time);

        s.orbitR = savedR;
        s.orbitA = savedA;
      }

      animRef.current = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
      aria-hidden="true"
    />
  );
}
