// src/bazi/engine.ts
// Core Bazi calculation engine using lunar-javascript + true solar time

import { Solar, Lunar } from 'lunar-javascript';
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

// ========== 真太阳时计算 ==========

function calcDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function calcEquationOfTime(date: Date): number {
  // Meeus 算法，返回分钟
  const N = calcDayOfYear(date);
  const gamma = 357.529 + 0.98560028 * N; // 太阳平近点角(度)
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const eq =
    1.9148 * Math.sin(rad(gamma)) +
    0.02 * Math.sin(rad(2 * gamma)) +
    0.0003 * Math.sin(rad(3 * gamma)) +
    2.466 * Math.sin(rad(2 * (102.937 + gamma))) -
    0.005 * Math.sin(rad(4 * gamma)) -
    0.0001 * Math.sin(rad(6 * gamma));
  return eq / 60; // 转为分钟
}

function calcTrueSolarTime(
  utcDate: Date,
  longitude: number,
  standardLongitude: number = 120
): TrueSolarTime {
  // 经度校正 (分钟)
  const longitudeCorrection = (standardLongitude - longitude) * 4;

  // 均时差 (分钟)
  const eot = calcEquationOfTime(utcDate);

  // 总校正
  const totalCorrectionMin = longitudeCorrection + eot;

  // 平太阳时 = UTC + 时区偏移 + 经度校正
  const meanSolarTime = new Date(utcDate.getTime() + totalCorrectionMin * 60000);

  // 真太阳时小时
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

// ========== 干支计算 ==========

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
      if (hour >= s || hour < e) return 0; // 子时
    }
  }
  return 0;
}

// ========== 主引擎 ==========

export function calculateBazi(input: BaziInput): BaziResult {
  const { year, month, day, hour, minute, location, useTrueSolarTime = true } = input;

  // 创建 Solar 对象
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();

  // 获取默认经纬度（如果未提供）
  const defaultLong = location?.longitude ?? 116.404; // 北京
  const defaultLat = location?.latitude ?? 39.915;
  const long = defaultLong;

  // 计算真太阳时
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const trueSolar = calcTrueSolarTime(utcDate, long);

  // 使用真太阳时的小时来推算时柱
  const trueHour = trueSolar.finalHour;

  // 时辰索引
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
      // 子时跨日 (23-1)
      if (trueHour >= s || trueHour < e) {
        shichenIndex = 0;
        break;
      }
    }
  }

  // 使用 lunar-javascript 获取八字（四柱）
  const bazi = lunar.getBazi();

  // 年柱
  const yearPillar = { gan: bazi.getYearGan(), zhi: bazi.getYearZhi() };

  // 月柱
  const monthPillar = { gan: bazi.getMonthGan(), zhi: bazi.getMonthZhi() };

  // 日柱
  const dayPillar = { gan: bazi.getDayGan(), zhi: bazi.getDayZhi() };

  // 时柱（用真太阳时）
  const timeGanIndex = (TIAN_GAN.indexOf(dayPillar.gan) * 2 + shichenIndex * 2) % 10;
  const timeZhi = DI_ZHI[shichenIndex];
  const hourPillar = { gan: TIAN_GAN[timeGanIndex], zhi: timeZhi };

  // 生肖
  const zodiac = lunar.getXingZuo(); // 西方星座
  const chineseZodiac = lunar.getYearShengXiao(); // 中国生肖

  // 五行统计
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

  // 纳音
  const yearIdx = (year - 3) % 10;
  const monthIdx = (year - 3) % 12;
  const nayin = [
    NAYIN_TABLE[Math.floor(yearIdx / 2) % 30],
    NAYIN_TABLE[Math.floor(yearIdx / 2) % 30],
    NAYIN_TABLE[Math.floor(monthIdx / 2) % 30],
    NAYIN_TABLE[Math.floor(monthIdx / 2) % 30],
  ];

  // 十神
  const dayMaster = dayPillar.gan;
  const tenDeities: TenDeityInfo[] = [
    { pillar: 'year', gan: yearPillar.gan, zhi: yearPillar.zhi, ganTenDeity: SHI_SHEN_MAP[dayMaster]?.[yearPillar.gan] || '', zhiTenDeities: [] },
    { pillar: 'month', gan: monthPillar.gan, zhi: monthPillar.zhi, ganTenDeity: SHI_SHEN_MAP[dayMaster]?.[monthPillar.gan] || '', zhiTenDeities: [] },
    { pillar: 'day', gan: dayPillar.gan, zhi: dayPillar.zhi, ganTenDeity: '日主', zhiTenDeities: [] },
    { pillar: 'hour', gan: hourPillar.gan, zhi: hourPillar.zhi, ganTenDeity: SHI_SHEN_MAP[dayMaster]?.[hourPillar.gan] || '', zhiTenDeities: [] },
  ];

  // 为每个地支添加藏干十神
  for (const td of tenDeities) {
    const cangGan = ZHI_CANG_GAN[td.zhi] || [];
    td.zhiTenDeities = cangGan.map(({ gan: cg, weight }) => ({
      gan: cg,
      deity: SHI_SHEN_MAP[dayMaster]?.[cg] || '',
      weight,
    }));
  }

  // 藏干
  const hiddenStems: HiddenStem[] = allZhis.map((zhi) => ({
    zhi,
    stems: ZHI_CANG_GAN[zhi] || [],
  }));

  // 大运计算
  const yearStemIdx = (year - 3) % 10;
  const isYangYear = [0, 2, 4, 6, 8].includes(yearStemIdx);
  const isForward = (isYangYear && input.gender === 'male') || (!isYangYear && input.gender === 'female');

  // 计算起运岁数
  // 用 lunar 库的节气功能计算起运
  const prevJie = solar.getPrevJie();
  const nextJie = solar.getNextJie();

  let daysDiff: number;
  if (isForward) {
    // 顺排：从出生日顺数到下一个节
    const nextJieSolar = nextJie.getSolar();
    daysDiff = (nextJieSolar.toYmdHms() === solar.toYmdHms())
      ? 0
      : (nextJieSolar.getTime() - solar.getTime()) / (1000 * 60 * 60 * 24);
  } else {
    // 逆排：从出生日逆数到上一个节
    const prevJieSolar = prevJie.getSolar();
    daysDiff = (prevJieSolar.toYmdHms() === solar.toYmdHms())
      ? 0
      : (solar.getTime() - prevJieSolar.getTime()) / (1000 * 60 * 60 * 24);
  }

  const startAgeYears = Math.floor(Math.abs(daysDiff) / 3);
  const startAgeMonths = Math.floor((Math.abs(daysDiff) % 3) * 4);
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

  // 节气信息
  const jieqi: JieqiInfo = {
    prevJie: { name: prevJie.getName(), utcMs: prevJie.getSolar().getTime() },
    nextJie: { name: nextJie.getName(), utcMs: nextJie.getSolar().getTime() },
    currentJie: solar.getJieQi(),
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
