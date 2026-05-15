// Chinese-English translations for Bazi terminology
// Chinese terms are kept as primary; English is shown as secondary (smaller text)

export const GAN_TRANSLATIONS: Record<string, string> = {
  '甲': 'Jiǎ (Yang Wood)',
  '乙': 'Yǐ (Yin Wood)',
  '丙': 'Bǐng (Yang Fire)',
  '丁': 'Dīng (Yin Fire)',
  '戊': 'Wù (Yang Earth)',
  '己': 'Jǐ (Yin Earth)',
  '庚': 'Gēng (Yang Metal)',
  '辛': 'Xīn (Yin Metal)',
  '壬': 'Rén (Yang Water)',
  '癸': 'Guǐ (Yin Water)',
};

export const ZHI_TRANSLATIONS: Record<string, string> = {
  '子': 'Zǐ (Rat)',
  '丑': 'Chǒu (Ox)',
  '寅': 'Yín (Tiger)',
  '卯': 'Mǎo (Rabbit)',
  '辰': 'Chén (Dragon)',
  '巳': 'Sì (Snake)',
  '午': 'Wǔ (Horse)',
  '未': 'Wèi (Goat)',
  '申': 'Shēn (Monkey)',
  '酉': 'Yǒu (Rooster)',
  '戌': 'Xū (Dog)',
  '亥': 'Hài (Pig)',
};

export const WUXING_TRANSLATIONS: Record<string, string> = {
  '木': 'Wood (木)',
  '火': 'Fire (火)',
  '土': 'Earth (土)',
  '金': 'Metal (金)',
  '水': 'Water (水)',
};

export const SHICHEN_TRANSLATIONS: Record<string, string> = {
  '子': 'Zi Hour (子时) · 23:00–01:00',
  '丑': 'Chou Hour (丑时) · 01:00–03:00',
  '寅': 'Yin Hour (寅时) · 03:00–05:00',
  '卯': 'Mao Hour (卯时) · 05:00–07:00',
  '辰': 'Chen Hour (辰时) · 07:00–09:00',
  '巳': 'Si Hour (巳时) · 09:00–11:00',
  '午': 'Wu Hour (午时) · 11:00–13:00',
  '未': 'Wei Hour (未时) · 13:00–15:00',
  '申': 'Shen Hour (申时) · 15:00–17:00',
  '酉': 'You Hour (酉时) · 17:00–19:00',
  '戌': 'Xu Hour (戌时) · 19:00–21:00',
  '亥': 'Hai Hour (亥时) · 21:00–23:00',
};

export const NAYIN_TRANSLATIONS: Record<string, string> = {
  '海中金': 'Sea Gold (海中金)',
  '炉中火': 'Furnace Fire (炉中火)',
  '大林木': 'Great Forest Wood (大林木)',
  '路旁土': 'Roadside Earth (路旁土)',
  '剑锋金': 'Sword-edge Metal (剑锋金)',
  '山头火': 'Mountaintop Fire (山头火)',
  '涧下水': 'Mountain Stream Water (涧下水)',
  '城头土': 'City Wall Earth (城头土)',
  '白蜡金': 'White Wax Metal (白蜡金)',
  '杨柳木': 'Willow Wood (杨柳木)',
  '泉中水': 'Spring Water (泉中水)',
  '屋上土': 'Roof Earth (屋上土)',
  '霹雳火': 'Thunderbolt Fire (霹雳火)',
  '松柏木': 'Pine & Cypress Wood (松柏木)',
  '长流水': 'Ever-flowing Water (长流水)',
  '沙中土': 'Sand Earth (沙中土)',
  '金箔金': 'Gold Foil Metal (金箔金)',
  '覆灯火': 'Lamp Fire (覆灯火)',
  '天河水': 'Heavenly River Water (天河水)',
  '大驿土': 'Great Post Road Earth (大驿土)',
  '钗钏金': 'Hairpin Metal (钗钏金)',
  '桑柘木': 'Mulberry Wood (桑柘木)',
  '大溪水': 'Great Stream Water (大溪水)',
  '天上火': 'Heavenly Fire (天上火)',
  '石榴木': 'Pomegranate Wood (石榴木)',
  '大海水': 'Vast Ocean Water (大海水)',
};

// Ten Deity English translations
export const TEN_DEITY_TRANSLATIONS: Record<string, string> = {
  '比肩': 'Friend (比肩)',
  '劫财': 'Rob Wealth (劫财)',
  '食神': 'Eating God (食神)',
  '伤官': 'Hurting Officer (伤官)',
  '偏财': 'Indirect Wealth (偏财)',
  '正财': 'Direct Wealth (正财)',
  '偏印': 'Indirect Resource (偏印)',
  '正印': 'Direct Resource (正印)',
  '偏官': 'Indirect Officer (偏官)',
  '正官': 'Direct Officer (正官)',
  'Day Master': 'Day Master (日主)',
};

// Pillar labels with Chinese
export const PILLAR_LABELS: Record<string, string> = {
  year: 'Year Pillar (年柱)',
  month: 'Month Pillar (月柱)',
  day: 'Day Pillar (日柱)',
  hour: 'Hour Pillar (时柱)',
};

// Section headers
export const SECTION_HEADERS = {
  fourPillars: 'Four Pillars (四柱)',
  wuxing: 'Five Elements (五行)',
  tenDeities: 'Ten Deities (十神)',
  hiddenStems: 'Hidden Stems (藏干)',
  grandFortune: 'Great Fortune Cycles (大运)',
  trueSolarTime: 'True Solar Time (真太阳时)',
  aiInterpretation: '🤖 AI Destiny Reading (AI 命理解读)',
  fullDestinyBook: '📜 Full Destiny Book (完整命书)',
  disclaimer: 'Disclaimer (免责声明)',
  subjectInfo: 'Subject Information (命主信息)',
  nayin: 'Nayin (纳音)',
  shichen: 'Shichen (时辰)',
  zodiac: 'Zodiac (生肖)',
} as const;
