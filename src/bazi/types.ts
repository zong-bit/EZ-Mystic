// src/bazi/types.ts
// Core types for the Bazi (Eight Characters) engine

export interface Pillar {
  gan: string;   // 天干
  zhi: string;   // 地支
}

export interface TrueSolarTime {
  meanSolarTime: Date;
  equationOfTime: number;     // 均时差 (分钟)
  longitudeCorrection: number; // 经度校正 (分钟)
  finalTime: Date;
  finalHour: number;           // 真太阳时小时 (0-24)
}

export interface JieqiInfo {
  prevJie: { name: string; utcMs: number };
  nextJie: { name: string; utcMs: number };
  currentJie: string;
}

export interface HiddenStem {
  zhi: string;
  stems: { gan: string; weight: number }[];
}

export interface TenDeityInfo {
  pillar: 'year' | 'month' | 'day' | 'hour';
  gan: string;
  zhi: string;
  ganTenDeity: string;
  zhiTenDeities: { gan: string; deity: string; weight: number }[];
}

export interface GrandFortuneCycle {
  index: number;
  stem: string;
  branch: string;
  startAge: number;
  endAge: number;
}

export interface BaziResult {
  // 四柱
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  hourPillar: Pillar;

  // 真太阳时
  trueSolarTime: TrueSolarTime;

  // 辅助信息
  zodiac: string;
  wuxing: { element: string; count: number }[];
  nayin: string[];
  shichen: string;
  shichenIndex: number;

  // 十神
  tenDeities: TenDeityInfo[];

  // 藏干
  hiddenStems: HiddenStem[];

  // 大运
  grandFortune: {
    startAge: number;
    startYear: number;
    direction: 'forward' | 'backward';
    cycles: GrandFortuneCycle[];
  };

  // 节气
  jieqi: JieqiInfo;
}

export interface BaziInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: 'male' | 'female';
  name?: string;
  // 出生地
  location?: {
    city: string;
    longitude: number;
    latitude: number;
    timezone: string;
  };
  // 配置
  useTrueSolarTime?: boolean;
}

export interface AIPromptData {
  bazi: BaziResult;
  dayMaster: string;
  dayMasterElement: string;
  wuxingSummary: string;
  grandFortuneSummary: string;
}
