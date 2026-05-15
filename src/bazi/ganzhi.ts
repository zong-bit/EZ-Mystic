// src/bazi/ganzhi.ts
// Heavenly Stems and Earthly Branches constants and utilities

export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export const WU_XING_MAP: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

export const ZHI_WU_XING_MAP: Record<string, string> = {
  '子': '水', '丑': '土',
  '寅': '木', '卯': '木',
  '辰': '土', '巳': '火',
  '午': '火', '未': '土',
  '申': '金', '酉': '金',
  '戌': '土', '亥': '水',
};

export const ZHI_CANG_GAN: Record<string, { gan: string; weight: number }[]> = {
  '子': [{ gan: '癸', weight: 8 }],
  '丑': [{ gan: '己', weight: 5 }, { gan: '癸', weight: 2 }, { gan: '辛', weight: 1 }],
  '寅': [{ gan: '甲', weight: 5 }, { gan: '丙', weight: 2 }, { gan: '戊', weight: 1 }],
  '卯': [{ gan: '乙', weight: 8 }],
  '辰': [{ gan: '戊', weight: 5 }, { gan: '乙', weight: 2 }, { gan: '癸', weight: 1 }],
  '巳': [{ gan: '丙', weight: 5 }, { gan: '戊', weight: 2 }, { gan: '庚', weight: 1 }],
  '午': [{ gan: '丁', weight: 5 }, { gan: '己', weight: 3 }],
  '未': [{ gan: '己', weight: 5 }, { gan: '丁', weight: 2 }, { gan: '乙', weight: 1 }],
  '申': [{ gan: '庚', weight: 5 }, { gan: '壬', weight: 2 }, { gan: '戊', weight: 1 }],
  '酉': [{ gan: '辛', weight: 8 }],
  '戌': [{ gan: '戊', weight: 5 }, { gan: '辛', weight: 2 }, { gan: '丁', weight: 1 }],
  '亥': [{ gan: '壬', weight: 5 }, { gan: '甲', weight: 3 }],
};

export const SHICHEN_NAMES = [
  'Zi (子)', 'Chou (丑)', 'Yin (寅)', 'Mao (卯)', 'Chen (辰)', 'Si (巳)',
  'Wu (午)', 'Wei (未)', 'Shen (申)', 'You (酉)', 'Xu (戌)', 'Hai (亥)',
];

export const SHICHEN_RANGES: [number, number, string][] = [
  [23, 1, '子'],
  [1, 3, '丑'],
  [3, 5, '寅'],
  [5, 7, '卯'],
  [7, 9, '辰'],
  [9, 11, '巳'],
  [11, 13, '午'],
  [13, 15, '未'],
  [15, 17, '申'],
  [17, 19, '酉'],
  [19, 21, '戌'],
  [21, 23, '亥'],
];

export const SHI_SHEN_MAP: Record<string, Record<string, string>> = {
  // 日干为甲(0)
  '甲': {
    '甲': '比肩', '乙': '劫财', '丙': '食神', '丁': '伤官',
    '戊': '偏财', '己': '正财', '庚': '偏印', '辛': '正印',
    '壬': '偏官', '癸': '正官',
  },
  // 日干为乙(1)
  '乙': {
    '甲': '劫财', '乙': '比肩', '丙': '伤官', '丁': '食神',
    '戊': '正财', '己': '偏财', '庚': '正印', '辛': '偏印',
    '壬': '正官', '癸': '偏官',
  },
  // 日干为丙(2)
  '丙': {
    '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫财',
    '戊': '食神', '己': '伤官', '庚': '偏财', '辛': '正财',
    '壬': '偏官', '癸': '正官',
  },
  // 日干为丁(3)
  '丁': {
    '甲': '正印', '乙': '偏印', '丙': '劫财', '丁': '比肩',
    '戊': '伤官', '己': '食神', '庚': '正财', '辛': '偏财',
    '壬': '正官', '癸': '偏官',
  },
  // 日干为戊(4)
  '戊': {
    '甲': '偏官', '乙': '正官', '丙': '偏印', '丁': '正印',
    '戊': '比肩', '己': '劫财', '庚': '食神', '辛': '伤官',
    '壬': '偏财', '癸': '正财',
  },
  // 日干为己(5)
  '己': {
    '甲': '正官', '乙': '偏官', '丙': '正印', '丁': '偏印',
    '戊': '劫财', '己': '比肩', '庚': '伤官', '辛': '食神',
    '壬': '正财', '癸': '偏财',
  },
  // 日干为庚(6)
  '庚': {
    '甲': '偏财', '乙': '正财', '丙': '偏官', '丁': '正官',
    '戊': '正印', '己': '偏印', '庚': '比肩', '辛': '劫财',
    '壬': '食神', '癸': '伤官',
  },
  // 日干为辛(7)
  '辛': {
    '甲': '正财', '乙': '偏财', '丙': '正官', '丁': '偏官',
    '戊': '偏印', '己': '正印', '庚': '劫财', '辛': '比肩',
    '壬': '伤官', '癸': '食神',
  },
  // 日干为壬(8)
  '壬': {
    '甲': '食神', '乙': '伤官', '丙': '偏财', '丁': '正财',
    '戊': '偏官', '己': '正官', '庚': '偏印', '辛': '正印',
    '壬': '比肩', '癸': '劫财',
  },
  // 日干为癸(9)
  '癸': {
    '甲': '伤官', '乙': '食神', '丙': '正财', '丁': '偏财',
    '戊': '正官', '己': '偏官', '庚': '正印', '辛': '偏印',
    '壬': '劫财', '癸': '比肩',
  },
};

export const NAYIN_TABLE = [
  '海中金', '炉中火', '大林木', '路旁土', '剑锋金', '山头火',
  '涧下水', '城头土', '白蜡金', '杨柳木', '泉中水', '屋上土',
  '霹雳火', '松柏木', '长流水', '沙中土', '金箔金', '覆灯火',
  '天河水', '大驿土', '钗钏金', '桑柘木', '大溪水', '沙中土',
  '天上火', '石榴木', '大海水',
];

export function getNayinIndex(yearIndex: number, monthIndex: number): [string, string, string, string] {
  // Nayin cycles in pairs of years, each pillar takes its corresponding group
  const yearPair = Math.floor(yearIndex / 2);
  const monthPair = Math.floor(monthIndex / 2);
  // Simplified: four pillars each take Nayin from their corresponding group
  return [
    NAYIN_TABLE[yearPair % 30],
    NAYIN_TABLE[(yearPair + 1) % 30],
    NAYIN_TABLE[monthPair % 30],
    NAYIN_TABLE[(monthPair + 1) % 30],
  ];
}
