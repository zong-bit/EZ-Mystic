// src/bazi/types.ts
// Core types for the Bazi (Eight Characters) engine

export interface Pillar {
  gan: string;   // Heavenly Stem
  zhi: string;   // Earthly Branch
}

export interface TrueSolarTime {
  meanSolarTime: Date;
  equationOfTime: number;     // Equation of time (minutes)
  longitudeCorrection: number; // Longitude correction (minutes)
  finalTime: Date;
  finalHour: number;           // True solar time hour (0-24)
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
  // Four Pillars
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  hourPillar: Pillar;

  // True solar time
  trueSolarTime: TrueSolarTime;

  // Auxiliary info
  zodiac: string;
  wuxing: { element: string; count: number }[];
  nayin: string[];
  shichen: string;
  shichenIndex: number;

  // Ten Deities
  tenDeities: TenDeityInfo[];

  // Hidden stems
  hiddenStems: HiddenStem[];

  // Great Fortune
  grandFortune: {
    startAge: number;
    startYear: number;
    direction: 'forward' | 'backward';
    cycles: GrandFortuneCycle[];
  };

  // Solar terms
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
  // Birth location
  location?: {
    city: string;
    longitude: number;
    latitude: number;
    timezone: string;
  };
  // Configuration
  useTrueSolarTime?: boolean;
}

export interface AIPromptData {
  bazi: BaziResult;
  dayMaster: string;
  dayMasterElement: string;
  wuxingSummary: string;
  grandFortuneSummary: string;
}
