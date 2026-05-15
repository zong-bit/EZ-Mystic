// src/bazi/engine.ts
// Core Bazi calculation engine using lunar-javascript + true solar time

import { Solar, Lunar } from 'lunar-javascript';
// EightChar is available at runtime but not in type definitions
const { EightChar } = require('lunar-javascript') as any;
import {
  TIAN_GAN,
  DI_ZHI,
  WU_XING_MAP,
  ZHI_WU_XING_MAP,
  ZHI_CANG_GAN,
  SHICHEN_NAMES,
  SHICHEN_RANGES,
  SHI_SHEN_MAP,
  NAYIN_TABLE,
} from './ganzhi';
import type {
  BaziInput,
  BaziResult,
  TrueSolarTime,
  Pillar,
  HiddenStem,
  TenDeityInfo,
  GrandFortuneCycle,
  JieqiInfo,
} from './types';

// ========== True Solar Time Calculation ==========

function calcDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function calcEquationOfTime(date: Date): number {
  // Meeus algorithm, returns minutes
  const N = calcDayOfYear(date);
  const gamma = 357.529 + 0.98560028 * N; // mean anomaly of the Sun (degrees)
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const eq =
    1.9148 * Math.sin(rad(gamma)) +
    0.02 * Math.sin(rad(2 * gamma)) +
    0.0003 * Math.sin(rad(3 * gamma)) +
    2.466 * Math.sin(rad(2 * (102.937 + gamma))) -
    0.005 * Math.sin(rad(4 * gamma)) -
    0.0001 * Math.sin(rad(6 * gamma));
  return eq / 60; // convert to minutes
}

function calcTrueSolarTime(
  utcDate: Date,
  longitude: number,
  standardLongitude: number = 120
): TrueSolarTime {
  // Longitude correction (minutes)
  const longitudeCorrection = (standardLongitude - longitude) * 4;

  // Equation of time (minutes)
  const eot = calcEquationOfTime(utcDate);

  // Total correction
  const totalCorrectionMin = longitudeCorrection + eot;

  // Mean solar time = UTC + timezone offset + longitude correction
  const meanSolarTime = new Date(utcDate.getTime() + totalCorrectionMin * 60000);

  // True solar time hour
  let finalHour =
    (meanSolarTime.getUTCHours() +
      meanSolarTime.getUTCMinutes() / 60 +
      meanSolarTime.getUTCSeconds() / 3600 +
      standardLongitude / 15) %
    24;
  if (finalHour < 0) finalHour += 24;

  return {
    meanSolarTime,
    equationOfTime: eot,
    longitudeCorrection,
    finalTime: meanSolarTime,
    finalHour,
  };
}

// ========== Ganzhi (Heavenly Stems & Earthly Branches) Calculation ==========

function ganzhiFromYear(year: number): Pillar {
  const ganIndex = ((year - 3) % 10 + 10) % 10;
  const zhiIndex = ((year - 3) % 12 + 12) % 12;
  return { gan: TIAN_GAN[ganIndex], zhi: DI_ZHI[zhiIndex] };
}

function getShichenIndex(hour: number): number {
  for (const [start, end, _zhi] of SHICHEN_RANGES) {
    const s = Number(start);
    const e = Number(end);
    if (s < e) {
      if (hour >= s && hour < e) {
        const idx = Math.floor(s / 2) % 12;
        return ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'].indexOf(DI_ZHI[idx]);
      }
    } else {
      if (hour >= s || hour < e) return 0; // 子时 (Zi hour spans midnight)
    }
  }
  return 0;
}

// ========== Main Engine ==========

export function calculateBazi(input: BaziInput): BaziResult {
  const { year, month, day, hour, minute, location, useTrueSolarTime = true } = input;

  // Create Solar object
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();

  // Use default coordinates if not provided
  const defaultLong = location?.longitude ?? 116.404; // Beijing
  const defaultLat = location?.latitude ?? 39.915;
  const long = defaultLong;

  // Calculate true solar time
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const trueSolar = calcTrueSolarTime(utcDate, long);

  // Use true solar time hour for the Hour Pillar
  const trueHour = trueSolar.finalHour;

  // Shichen index
  let shichenIndex = 0;
  for (const [start, end, zhi] of SHICHEN_RANGES) {
    const s = Number(start);
    const e = Number(end);
    if (s < e) {
      if (trueHour >= s && trueHour < e) {
        shichenIndex = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'].indexOf(zhi);
        break;
      }
    } else {
      // 子时 spans midnight (23-1)
      if (trueHour >= s || trueHour < e) {
        shichenIndex = 0;
        break;
      }
    }
  }

  // Get Bazi (Four Pillars) using lunar-javascript EightChar
  // EightChar.toString() returns "年柱 月柱 日柱 时柱" like "己巳 丙子 丙寅 甲午"
  const eightChar = EightChar.fromLunar(lunar);
  const baziPillars = eightChar.toString().split(' ');
  // Each pillar is 2 chars: first is 天干(gan), second is 地支(zhi)
  const getPillarGan = (p: string) => p[0];
  const getPillarZhi = (p: string) => p[1];

  // Year Pillar (from EightChar)
  const yearPillar = { gan: getPillarGan(baziPillars[0]), zhi: getPillarZhi(baziPillars[0]) };

  // Month Pillar (from EightChar)
  const monthPillar = { gan: getPillarGan(baziPillars[1]), zhi: getPillarZhi(baziPillars[1]) };

  // Day Pillar (from EightChar)
  const dayPillar = { gan: getPillarGan(baziPillars[2]), zhi: getPillarZhi(baziPillars[2]) };

  // Hour Pillar: use EightChar output but override time stem with true solar time correction
  // EightChar.toString() already has time pillar (baziPillars[3]), but we may want to
  // recalculate if true solar time changes the hour
  const timeGanIndex = (TIAN_GAN.indexOf(dayPillar.gan) * 2 + shichenIndex * 2) % 10;
  const timeZhi = DI_ZHI[shichenIndex];
  const hourPillar = { gan: TIAN_GAN[timeGanIndex], zhi: timeZhi };

  // Zodiac (Western - calculated from birth date)
  const ZODIAC_SIGNS = ['摩羯','水瓶','双鱼','白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手'];
  const ZODIAC_CUTOFFS = [20,19,21,20,21,22,23,23,23,23,22,22];
  const zodiacIdx = (month - 1 + (day >= ZODIAC_CUTOFFS[month - 1] ? 1 : 0)) % 12;
  const zodiac = ZODIAC_SIGNS[zodiacIdx];
  const chineseZodiac = lunar.getYearShengXiao(); // Chinese zodiac

  // Five Elements count
  const allStems = [yearPillar.gan, monthPillar.gan, dayPillar.gan, hourPillar.gan];
  const allZhis = [yearPillar.zhi, monthPillar.zhi, dayPillar.zhi, hourPillar.zhi];
  const wuxingCount: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  for (const g of allStems) {
    const wx = WU_XING_MAP[g] || '';
    if (wx) wuxingCount[wx]++;
  }
  for (const z of allZhis) {
    const wx = ZHI_WU_XING_MAP[z] || '';
    if (wx) wuxingCount[wx]++;
  }
  const wuxing = Object.entries(wuxingCount).map(([element, count]) => ({ element, count }));

  // Nayin (Melodic Element)
  const yearIdx = (year - 3) % 10;
  const monthIdx = (year - 3) % 12;
  const nayin = [
    NAYIN_TABLE[Math.floor(yearIdx / 2) % 30],
    NAYIN_TABLE[Math.floor(yearIdx / 2) % 30],
    NAYIN_TABLE[Math.floor(monthIdx / 2) % 30],
    NAYIN_TABLE[Math.floor(monthIdx / 2) % 30],
  ];

  // Ten Deities
  const dayMaster = dayPillar.gan;
  const tenDeities: TenDeityInfo[] = [
    { pillar: 'year', gan: yearPillar.gan, zhi: yearPillar.zhi, ganTenDeity: SHI_SHEN_MAP[dayMaster]?.[yearPillar.gan] || '', zhiTenDeities: [] },
    { pillar: 'month', gan: monthPillar.gan, zhi: monthPillar.zhi, ganTenDeity: SHI_SHEN_MAP[dayMaster]?.[monthPillar.gan] || '', zhiTenDeities: [] },
    { pillar: 'day', gan: dayPillar.gan, zhi: dayPillar.zhi, ganTenDeity: 'Day Master', zhiTenDeities: [] },
    { pillar: 'hour', gan: hourPillar.gan, zhi: hourPillar.zhi, ganTenDeity: SHI_SHEN_MAP[dayMaster]?.[hourPillar.gan] || '', zhiTenDeities: [] },
  ];

  // Add hidden stem Ten Deities for each earthly branch
  for (const td of tenDeities) {
    const cangGan = ZHI_CANG_GAN[td.zhi] || [];
    td.zhiTenDeities = cangGan.map(({ gan: cg, weight }) => ({
      gan: cg,
      deity: SHI_SHEN_MAP[dayMaster]?.[cg] || '',
      weight,
    }));
  }

  // Hidden stems
  const hiddenStems: HiddenStem[] = allZhis.map((zhi) => ({
    zhi,
    stems: ZHI_CANG_GAN[zhi] || [],
  }));

  // Great Fortune calculation
  const yearStemIdx = (year - 3) % 10;
  const isYangYear = [0, 2, 4, 6, 8].includes(yearStemIdx);
  const isForward = (isYangYear && input.gender === 'male') || (!isYangYear && input.gender === 'female');

  // Simplified start age estimation (without JieQi API in this lunar-javascript version)
  // In a full implementation, this would use JieQi solars terms to calculate exact days
  // For now, use month-based approximation: start fortune at age 2-6 based on closeness to month boundaries
  // Each year-pillar shift approximately corresponds to 10 days in age calculation
  // Starting age = roughly (month-1) * 0.4 + 1 for forward, (12-month) * 0.4 + 1 for reverse
  const daysToNext = isForward ? (32 - day) : day;
  const daysDiff = daysToNext * (isForward ? 1 : -1);
  const startAgeYears = Math.floor(Math.abs(daysDiff) / 10);
  const startAgeMonths = Math.floor((Math.abs(daysDiff) % 10) * 1.2);
  const startYear = year + startAgeYears;

  const grandFortuneCycles: GrandFortuneCycle[] = [];
  const monthGanIdx = TIAN_GAN.indexOf(monthPillar.gan);
  const monthZhiIdx2 = DI_ZHI.indexOf(monthPillar.zhi);

  for (let i = 0; i < 8; i++) {
    let stem: number;
    let branch: number;
    if (isForward) {
      stem = (monthGanIdx + i + 10) % 10;
      branch = (monthZhiIdx2 + i + 12) % 12;
    } else {
      stem = (monthGanIdx - i + 10) % 10;
      branch = (monthZhiIdx2 - i + 12) % 12;
    }
    grandFortuneCycles.push({
      index: i,
      stem: TIAN_GAN[stem],
      branch: DI_ZHI[branch],
      startAge: startAgeYears + i * 10,
      endAge: startAgeYears + (i + 1) * 10 - 1,
    });
  }

  // Solar term info
  const jieqi: JieqiInfo = {
    prevJie: { name: '', utcMs: 0 },
    nextJie: { name: '', utcMs: 0 },
    currentJie: '',
  };

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    trueSolarTime: trueSolar,
    zodiac: chineseZodiac,
    wuxing,
    nayin,
    shichen: SHICHEN_NAMES[shichenIndex],
    shichenIndex,
    tenDeities,
    hiddenStems,
    grandFortune: {
      startAge: startAgeYears,
      startYear,
      direction: isForward ? 'forward' : 'backward',
      cycles: grandFortuneCycles,
    },
    jieqi,
  };
}
