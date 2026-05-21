'use client';

import { useEffect, useRef } from 'react';

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

type AnimState = 'wander' | 'attract' | 'spin' | 'burst';

interface Star {
  /** Tai-Chi polar radius from canvas center */
  taiChiR: number;
  /** Tai-Chi polar angle from canvas center (base, before rotation) */
  taiChiA: number;
  /** Home scatter position (cartesian offset from canvas center) */
  homeX: number;
  homeY: number;
  /** Original home position (never changes, for reset) */
  originX: number;
  originY: number;
  /** Screen position cache (set each frame before draw) */
  orbitR: number;
  orbitA: number;
  /** Core size */
  size: number;
  /** Glow halo radius */
  glowRadius: number;
  /** Tai-Chi state colours */
  taiChiHue: number;
  taiChiSat: number;
  taiChiLight: number;
  taiChiAlpha: number;
  /** Home scatter colours (dim, desaturated) */
  homeHue: number;
  homeSat: number;
  homeLight: number;
  homeAlpha: number;
  /** Current display colour — set dynamically each frame in the draw loop */
  hue: number;
  sat: number;
  light: number;
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
  /** Converge phase offset (0-1, for organic timing) */
  convergePhase: number;
  /** Explosion velocity (px/ms) */
  vx: number;
  vy: number;
}

// ──────────────────────────────────────────
// Easing helpers
// ──────────────────────────────────────────

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
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

/**
 * Generate ~2200 stars: Tai-Chi target coords + home scatter coords + dual colours.
 */
function createStars(width: number, height: number): Star[] {
  const stars: Star[] = [];
  const cx = width / 2;
  const cy = height / 2;

  // R slightly less than half the shortest dimension for a good fit
  const R = Math.min(width, height) * 0.42;
  const fishR = R / 2;
  const scatterR = R * 1.6; // disk radius for the scatter state

  // ── Helper ──

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
    const taiChiR = Math.sqrt(dx * dx + dy * dy);
    const taiChiA = Math.atan2(dy, dx);

    const isBright = opts.bright ?? (region === 'yang');
    const size = opts.size ?? (isBright ? 1.0 + Math.random() * 2.2 : 0.4 + Math.random() * 0.8);
    const rayCount =
      opts.rays ??
      (isBright && Math.random() < 0.35 ? 4 + Math.floor(Math.random() * 3) : 0);

    // Tai-Chi colours
    const taiChiHue = opts.hue ?? (region === 'yin' ? 220 + Math.random() * 35 : 38 + Math.random() * 14);
    const taiChiSat = opts.sat ?? (region === 'yin' ? 30 + Math.random() * 25 : 55 + Math.random() * 25);
    const taiChiLight = opts.light ?? (region === 'yin' ? 18 + Math.random() * 15 : 45 + Math.random() * 30);
    const taiChiAlpha = opts.alpha ?? (isBright ? 0.45 + Math.random() * 0.55 : 0.12 + Math.random() * 0.18);

    // Home scatter position (random point in a disk of radius scatterR)
    const homeAngle = Math.random() * Math.PI * 2;
    const homeRadius = Math.random() * scatterR;
    const homeX = Math.cos(homeAngle) * homeRadius;
    const homeY = Math.sin(homeAngle) * homeRadius;

    // Home scatter colours — all warm golden (so scatter/explosion colors are uniform)
    const homeHue = 38 + Math.random() * 22;
    const homeSat = 30 + Math.random() * 20;
    const homeLight = 40 + Math.random() * 20;
    const homeAlpha = 0.30 + Math.random() * 0.20;

    stars.push({
      taiChiR,
      taiChiA,
      homeX,
      homeY,
      originX: homeX,
      originY: homeY,
      orbitR: 0,
      orbitA: 0,
      size,
      glowRadius: opts.glow ?? (isBright ? size * (4 + Math.random() * 7) : size * 2),
      taiChiHue,
      taiChiSat,
      taiChiLight,
      taiChiAlpha,
      homeHue,
      homeSat,
      homeLight,
      homeAlpha,
      hue: 0,
      sat: 0,
      light: 0,
      baseAlpha: 0,
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
      convergePhase: Math.random() * 0.25,
      vx: 0,
      vy: 0,
    });
  }

  // ── 1. Outer ring stars (boundary delineation) — doubled from 100 → 200 ──
  for (let i = 0; i < 200; i++) {
    const angle = (i / 200) * Math.PI * 2;
    const r = R * (0.98 + Math.random() * 0.02);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    makeStar(x, y, 'yang', { bright: true, alpha: 0.5 + Math.random() * 0.2, size: 1.0 + Math.random() * 1.5 });
  }

  // ── 2. S-curve boundary stars — doubled from 80 → 160 ──
  for (let i = 0; i < 160; i++) {
    const t = i / 160;
    let px: number;
    let py: number;

    if (t < 0.5) {
      const a = (t / 0.5) * Math.PI;
      const angle = -Math.PI / 2 + a;
      px = Math.cos(angle) * fishR;
      py = -fishR + Math.sin(angle) * fishR;
    } else {
      const a = ((t - 0.5) / 0.5) * Math.PI;
      const angle = Math.PI / 2 + a;
      px = Math.cos(angle) * fishR;
      py = fishR + Math.sin(angle) * fishR;
    }

    makeStar(cx + px, cy + py, 'yang', {
      bright: true,
      alpha: 0.55 + Math.random() * 0.25,
      size: 0.8 + Math.random() * 1.2,
    });
  }

  // ── 3. Yang region fill — doubled from 280 → 640 ──
  let yangCount = 0;
  while (yangCount < 640) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * R * 0.95;
    const dx = Math.cos(angle) * radius;
    const dy = Math.sin(angle) * radius;
    if (classifyTaiChi(dx, dy, R) === 'yang') {
      makeStar(cx + dx, cy + dy, 'yang');
      yangCount++;
    }
  }

  // ── 4. Yin region fill — doubled from 240 → 560 ──
  let yinCount = 0;
  while (yinCount < 560) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * R * 0.95;
    const dx = Math.cos(angle) * radius;
    const dy = Math.sin(angle) * radius;
    if (classifyTaiChi(dx, dy, R) === 'yin') {
      makeStar(cx + dx, cy + dy, 'yin');
      yinCount++;
    }
  }

  // ── 5. Fish-eye dots — doubled 20 → 40 each ──
  // Yin dot inside the yang fish (upper)
  for (let i = 0; i < 40; i++) {
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
  // Yang dot inside the yin fish (lower)
  for (let i = 0; i < 40; i++) {
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

  // ── 6. Background stars — doubled from 220 → 560 ──
  for (let i = 0; i < 560; i++) {
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
 * Reads position from `s.orbitR` / `s.orbitA` (set each frame).
 * Reads colour from `s.hue`, `s.sat`, `s.light`, `s.baseAlpha` (set each frame).
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
// Animation state machine
// ──────────────────────────────────────────

interface PrevState {
  state: AnimState;
  stateStartAt: number;
  duration: number;
}

interface AnimStateMachine {
  state: AnimState;
  /** Timestamp (performance.now) when this state began */
  stateStartAt: number;
  /** Total duration of this state in ms */
  duration: number;
  /** Previous state for cross-fade transitions */
  prevState?: PrevState;
  /** When cross-fade started (performance.now) */
  crossfadeStartAt?: number;
}

const STATE_DURATIONS: Record<AnimState, number> = {
  wander: 8000,
  attract: 100000,
  spin: 5000,
  burst: 4000,
};

const STATE_ORDER: AnimState[] = ['wander', 'attract', 'spin', 'burst'];

/** Cross-fade durations per transition (ms). 0 = no cross-fade. */
const CROSSFADE_DURATIONS: Record<string, number> = {
  'wander->attract': 2000,
  'attract->spin': 1500,
  'spin->burst': 0,
  'burst->wander': 1500,
};

function getNextState(current: AnimState): AnimState {
  const idx = STATE_ORDER.indexOf(current);
  return STATE_ORDER[(idx + 1) % STATE_ORDER.length];
}

function getStateProgress(now: number, sm: AnimStateMachine): number {
  return clamp((now - sm.stateStartAt) / sm.duration, 0, 1);
}

/**
 * Compute a star's position + colour for a given state at a given progress.
 * Does NOT mutate the star — returns a plain result object.
 */
interface StateRenderResult {
  wx: number;
  wy: number;
  hue: number;
  sat: number;
  light: number;
  baseAlpha: number;
}

function calcStateAt(
  state: AnimState,
  progress: number,
  star: Star,
  time: number,
  cx: number,
  cy: number,
  rot: number,
  scaleFactor: number,
  spinAccel: number,
): StateRenderResult {
  const wobble = Math.sin(time * star.wobbleSpeed + star.wobblePhase) * star.wobbleAmount;
  const taiChiAngleFull = star.taiChiA + rot;
  const taiChiDistScaled = Math.max(0.01, star.taiChiR * scaleFactor + wobble);
  const taiChiWX = cx + Math.cos(taiChiAngleFull) * taiChiDistScaled;
  const taiChiWY = cy + Math.sin(taiChiAngleFull) * taiChiDistScaled;
  const homeWX = cx + star.homeX;
  const homeWY = cy + star.homeY;

  switch (state) {
    case 'wander': {
      const driftX = Math.sin(time * 0.0004 + star.twinklePhase) * 5;
      const driftY = Math.cos(time * 0.0003 + star.twinklePhase * 1.3) * 5;
      return {
        wx: homeWX + driftX,
        wy: homeWY + driftY,
        hue: star.homeHue,
        sat: star.homeSat,
        light: star.homeLight,
        baseAlpha: star.homeAlpha,
      };
    }
    case 'attract': {
      const off = star.convergePhase;
      const rawP = clamp((progress + off * 0.15 - off * 0.075) / (1 + off * 0.075), 0, 1);
      const e = easeInOutCubic(rawP);
      const homeDist = Math.sqrt(star.homeX * star.homeX + star.homeY * star.homeY);
      const targetDist = star.taiChiR * scaleFactor;
      const currentDist = lerp(homeDist, targetDist, e);
      const homeAngle = Math.atan2(star.homeY, star.homeX);
      let angleDiff = taiChiAngleFull - homeAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      const sweepDir = angleDiff >= 0 ? 1 : -1;
      const sweepAmount = Math.cos(e * Math.PI * 0.5) * Math.PI * 0.8 * sweepDir;
      const currentAngle = homeAngle + angleDiff * e + sweepAmount;
      const wx = cx + Math.cos(currentAngle) * currentDist;
      const wy = cy + Math.sin(currentAngle) * currentDist;
      return {
        wx,
        wy,
        hue: lerp(star.homeHue, star.taiChiHue, e),
        sat: lerp(star.homeSat, star.taiChiSat, e),
        light: lerp(star.homeLight, star.taiChiLight, e),
        baseAlpha: lerp(star.homeAlpha, star.taiChiAlpha, e),
      };
    }
    case 'spin': {
      return {
        wx: taiChiWX,
        wy: taiChiWY,
        hue: star.taiChiHue,
        sat: star.taiChiSat,
        light: star.taiChiLight,
        baseAlpha: star.taiChiAlpha,
      };
    }
    case 'burst': {
      const implodeFraction = 0.35;
      if (progress < implodeFraction) {
        const rawImplode = progress / implodeFraction;
        const eImp = easeOutExpo(rawImplode);
        return {
          wx: lerp(taiChiWX, cx, eImp),
          wy: lerp(taiChiWY, cy, eImp),
          hue: star.taiChiHue,
          sat: lerp(star.taiChiSat, 0, eImp),
          light: lerp(star.taiChiLight, 3, eImp),
          baseAlpha: lerp(star.taiChiAlpha, 0.5, eImp),
        };
      } else {
        // For burst crossfade, we need the star's current screen position
        // which depends on accumulated explosion velocities — can't be pure function
        // Caller will handle this by passing pre-computed wx/wy
        return {
          wx: taiChiWX, // placeholder
          wy: taiChiWY,
          hue: star.homeHue,
          sat: star.homeSat,
          light: star.homeLight,
          baseAlpha: star.homeAlpha,
        };
      }
    }
    default:
      return { wx: homeWX, wy: homeWY, hue: star.homeHue, sat: star.homeSat, light: star.homeLight, baseAlpha: star.homeAlpha };
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
  /** Additional rotation for the spinning state (accumulated) */
  const spinRef = useRef<number>(0);
  /** Spin speed multiplier, continuously grows during spin state (1 → 60+) */
  const spinAccelRef = useRef<number>(1);
  const bgGradientRef = useRef<CanvasGradient | null>(null);
  const smRef = useRef<AnimStateMachine>({
    state: 'wander',
    stateStartAt: 0,
    duration: STATE_DURATIONS.wander,
  });
  /** Ref to avoid recreating crossfade state objects */
  const crossfadeStateRef = useRef<{
    active: boolean;
    prevState: AnimState;
    nextState: AnimState;
    startAt: number;
    duration: number;
  }>({ active: false, prevState: 'wander', nextState: 'wander', startAt: 0, duration: 0 });
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

    function setExplosionVelocities(stars: Star[], cx: number, cy: number, scaleFactor: number): void {
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        // Use taiChiX (scaled) for the direction away from center
        const theta = s.taiChiA + rotationRef.current;
        const tR = s.taiChiR * scaleFactor;
        const dirX = Math.cos(theta) * tR;
        const dirY = Math.sin(theta) * tR;
        const dist = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
        const baseSpeed = (1.0 + Math.random() * 2.5) * (s.isBright ? 1.4 : 0.8);
        s.vx = (dirX / dist) * baseSpeed + (Math.random() - 0.5) * 0.8;
        s.vy = (dirY / dist) * baseSpeed + (Math.random() - 0.5) * 0.8;
      }
    }

    /**
     * After explosion, record every star's current screen position as its new home.
     */
    function recordExplosionAsHome(stars: Star[], cx: number, cy: number): void {
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const dx = s.orbitR - cx;
        const dy = s.orbitA - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const originDist = Math.sqrt(s.originX * s.originX + s.originY * s.originY);
        if (dist > 1 && originDist > 1) {
          // 保持爆炸方向，但拉伸到原始 home 距离
          const scale = originDist / dist;
          s.homeX = dx * scale;
          s.homeY = dy * scale;
        } else {
          s.homeX = s.originX;
          s.homeY = s.originY;
        }
        s.vx = 0;
        s.vy = 0;
      }
    }

    function draw(time: number): void {
      if (!canvas || !ctx2d) return;
      const { width, height } = canvas;
      const dpr = window.devicePixelRatio || 1;
      const cssW = width / dpr;
      const cssH = height / dpr;
      const cx = cssW / 2;
      const cy = cssH / 2;

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

      ctx2d.fillStyle = bgGradientRef.current as CanvasGradient;
      ctx2d.fillRect(0, 0, cssW, cssH);

      // ── Animation state machine — advance ──
      const sm = smRef.current;
      const elapsed = time - sm.stateStartAt;
      const crossfadeStart = sm.crossfadeStartAt ?? sm.stateStartAt;
      const crossfadeDuration = sm.prevState ? CROSSFADE_DURATIONS[`${sm.prevState}->${sm.state}`] ?? 0 : 0;
      const crossfading = sm.prevState !== undefined && (time - crossfadeStart) < crossfadeDuration && crossfadeDuration > 0;

      if (elapsed >= sm.duration) {
        const prev = sm.state;
        const next = getNextState(sm.state);

        // Set up crossfade if there's a transition that needs it
        if (crossfadeDuration > 0) {
          crossfadeStateRef.current = {
            active: true,
            prevState: prev,
            nextState: next,
            startAt: time,
            duration: crossfadeDuration,
          };
        }

        smRef.current = {
          state: next,
          stateStartAt: time,
          duration: STATE_DURATIONS[next],
        };

        // On entering spin: start accel from 1x (current rotation speed)
        if (next === 'spin') {
          spinAccelRef.current = 1;
        }

        // On entering burst: compute explosion velocities at start
        if (next === 'burst') {
          // Stars are at 1/3 size by end of attract phase
          setExplosionVelocities(starsRef.current, cx, cy, 1 / 3);
        }

        sm.state = next;
        sm.stateStartAt = time;
        sm.duration = STATE_DURATIONS[next];
      }

      const progress = getStateProgress(time, sm);

      // ── Rotation ──
      // Base rotation: ~40s per full turn, continuous throughout
      const BASE_ROT_SPEED = 0.00015;
      rotationRef.current += BASE_ROT_SPEED * dt;

      // Spin: continuously accelerate from 1x upward
      if (sm.state === 'spin') {
        spinAccelRef.current += 0.002 * dt;
        const spinSpeed = spinAccelRef.current;
        spinRef.current += BASE_ROT_SPEED * spinSpeed * dt;
      }
      const rot = rotationRef.current + spinRef.current;

      // ── Dynamic state transition: spin → burst at speed threshold ──
      if (sm.state === 'spin' && spinAccelRef.current >= 60) {
        smRef.current = {
          state: 'burst',
          stateStartAt: time,
          duration: STATE_DURATIONS.burst,
        };
        setExplosionVelocities(starsRef.current, cx, cy, 1 / 6);
        sm.state = 'burst';
        sm.stateStartAt = time;
        sm.duration = STATE_DURATIONS.burst;
      }

      // ── Scale factor ──
      // During 'attract': stars form tai chi AND gradually shrink from full → 1/3
      // During 'spin' / 'burst': stays at 1/3
      let scaleFactor = 1;
      if (sm.state === 'attract') {
        // First 30% of attract: form tai chi at full size (no shrink)
        // Remaining 70%: shrink from full → 1/3
        if (progress > 0.3) {
          const shrinkP = (progress - 0.3) / 0.7;
          scaleFactor = lerp(1, 1 / 3, easeInOutCubic(shrinkP));
        }
      } else if (sm.state === 'spin') {
        // Continuous shrink from 1/3 → 1/6 as speed grows from 1x → 60x
        const speedFraction = clamp((spinAccelRef.current - 1) / 59, 0, 1);
        scaleFactor = lerp(1 / 3, 1 / 6, easeOutCubic(speedFraction));
      } else if (sm.state === 'burst') {
        scaleFactor = lerp(1 / 3, 1 / 4.5, easeInOutCubic(progress));
      }

      // ── Draw stars ──
      const stars = starsRef.current;
      const cf = crossfadeStateRef.current;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        let wx: number;
        let wy: number;
        let hue: number;
        let sat: number;
        let light: number;
        let baseAlpha: number;

        // ── Current state position ──
        if (sm.state === 'burst') {
          // Burst accumulates position per-frame; compute it directly
          const implodeFraction = 0.35;
          // Compute tai chi target for this star (same as calcStateAt does)
          const wobble = Math.sin(time * s.wobbleSpeed + s.wobblePhase) * s.wobbleAmount;
          const taiChiAngleFull = s.taiChiA + rot;
          const taiChiDistScaled = Math.max(0.01, s.taiChiR * scaleFactor + wobble);
          const taiChiWX = cx + Math.cos(taiChiAngleFull) * taiChiDistScaled;
          const taiChiWY = cy + Math.sin(taiChiAngleFull) * taiChiDistScaled;
          if (progress < implodeFraction) {
            const rawImplode = progress / implodeFraction;
            const eImp = easeOutExpo(rawImplode);
            wx = lerp(taiChiWX, cx, eImp);
            wy = lerp(taiChiWY, cy, eImp);
            hue = s.taiChiHue;
            sat = lerp(s.taiChiSat, 0, eImp);
            light = lerp(s.taiChiLight, 3, eImp);
            baseAlpha = lerp(s.taiChiAlpha, 0.5, eImp);
          } else {
            s.orbitR += s.vx * dt * 0.06;
            s.orbitA += s.vy * dt * 0.06;
            s.vx *= 0.985;
            s.vy *= 0.985;
            wx = s.orbitR;
            wy = s.orbitA;
            const explosionElapsed = (progress - implodeFraction) / (1 - implodeFraction);
            const eEase = easeOutCubic(explosionElapsed);
            hue = lerp(s.taiChiHue, s.homeHue, eEase);
            sat = lerp(s.taiChiSat, s.homeSat, eEase);
            light = lerp(s.taiChiLight, s.homeLight, eEase);
            baseAlpha = lerp(s.taiChiAlpha, s.homeAlpha, eEase);
          }
        } else {
          const result = calcStateAt(sm.state, progress, s, time, cx, cy, rot, scaleFactor, spinAccelRef.current);
          wx = result.wx;
          wy = result.wy;
          hue = result.hue;
          sat = result.sat;
          light = result.light;
          baseAlpha = result.baseAlpha;
        }

        // ── Crossfade: lerp with previous state ──
        if (cf.active && cf.nextState === sm.state) {
          const fadeElapsed = time - cf.startAt;
          const fadeT = clamp(fadeElapsed / cf.duration, 0, 1);

          if (fadeT >= 1) {
            // Crossfade complete
            cf.active = false;
            sm.prevState = undefined;
            sm.crossfadeStartAt = undefined;
          } else {
            // Compute previous state position
            const prevProgress = fadeT; // 0→1 during crossfade
            const prevResult = calcStateAt(cf.prevState, prevProgress, s, time, cx, cy, rot, scaleFactor, spinAccelRef.current);

            // For burst prev state, use the star's current accumulated position
            let prevWx = prevResult.wx;
            let prevWy = prevResult.wy;
            if (cf.prevState === 'burst') {
              prevWx = s.orbitR;
              prevWy = s.orbitA;
            }

            // Lerp position
            wx = lerp(prevWx, wx, fadeT);
            wy = lerp(prevWy, wy, fadeT);
            // Lerp colour
            hue = lerp(prevResult.hue, hue, fadeT);
            sat = lerp(prevResult.sat, sat, fadeT);
            light = lerp(prevResult.light, light, fadeT);
            baseAlpha = lerp(prevResult.baseAlpha, baseAlpha, fadeT);
          }
        }

        // Skip off-screen
        if (wx < -80 || wx > cssW + 80 || wy < -80 || wy > cssH + 80) continue;

        // Set position + colour on star
        s.orbitR = wx;
        s.orbitA = wy;
        s.hue = Math.round(hue);
        s.sat = Math.round(sat);
        s.light = Math.round(light);
        s.baseAlpha = clamp(baseAlpha, 0, 1);

        drawStar(ctx2d, s, time);
      }

      // ── At the end of burst state, record explosion positions as new home ──
      if (sm.state === 'burst' && progress >= 0.99) {
        recordExplosionAsHome(stars, cx, cy);
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
