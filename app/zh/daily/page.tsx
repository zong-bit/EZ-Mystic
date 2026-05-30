import type { Metadata } from 'next';
import { TIAN_GAN, DI_ZHI } from '@/bazi/ganzhi';
import { Solar } from 'lunar-javascript';

// CJS library can't be statically analyzed — force dynamic rendering
export const dynamic = 'force-dynamic';

// ─── Metadata (static — page is 'use client') ────────────────────────────────

export const metadata: Metadata = {
  title: 'FateWise — 每日黄历 · 宜忌',
  description:
    'Today\'s Chinese almanac: heavenly stem and earthly branch, auspicious activities, inauspicious activities, lucky hours, and zodiac clash. Updated daily.',
  openGraph: {
    title: 'FateWise — 每日黄历 · 宜忌',
    description: 'Today\'s Yi Ji (宜忌): auspicious and inauspicious activities based on the Chinese calendar.',
    url: 'https://bornchart.app/daily',
    siteName: 'FateWise',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'FateWise 每日黄历' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FateWise — 每日黄历 · 宜忌',
    description: 'Today\'s Yi Ji: auspicious and inauspicious activities based on the Chinese calendar.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// ─── Constants ───────────────────────────────────────────────────────────────

const YI_JI_BY_GAN: Record<string, { yi: string[]; ji: string[] }> = {
  '甲': { yi: ['签约', '出行', '求职'], ji: ['动土', '安葬'] },
  '乙': { yi: ['装修', '学习', '交友'], ji: ['诉讼', '出行'] },
  '丙': { yi: ['开业', '庆祝', '出行'], ji: ['安床', '动土'] },
  '丁': { yi: ['祭祀', '求医', '学习'], ji: ['嫁娶', '搬家'] },
  '戊': { yi: ['交易', '签约', '求职'], ji: ['Travel', 'Breaking Ground'] },
  '己': { yi: ['装修', '祭祀', '学习'], ji: ['开业', '嫁娶'] },
  '庚': { yi: ['诉讼', '出行', 'Job Hunting'], ji: ['动土', '安葬'] },
  '辛': { yi: ['Worship', 'Seeking Medical Help', 'Moving'], ji: ['开业', '嫁娶'] },
  '壬': { yi: ['Business Transactions', 'Travel', 'Studying'], ji: ['动土', '安葬'] },
  '癸': { yi: ['祭祀', '求医', '学习'], ji: ['Travel', 'Marriage'] },
};

const LUCKY_SHICHEN: [number, number, string][] = [
  [1, 3, '子时 Zi (23:00–01:00)'],
  [3, 5, '丑时 Chou (01:00–03:00)'],
  [5, 7, '寅时 Yin (03:00–05:00)'],
  [7, 9, '卯时 Mao (05:00–07:00)'],
  [9, 11, '辰时 Chen (07:00–09:00)'],
  [11, 13, '午时 Wu (11:00–13:00)'],
  [13, 15, '未时 Wei (13:00–15:00)'],
  [15, 17, '申时 Shen (15:00–17:00)'],
  [17, 19, '酉时 You (17:00–19:00)'],
  [19, 21, '戌时 Xu (19:00–21:00)'],
  [21, 23, '亥时 Hai (19:00–23:00)'],
];

const CHONG_ZHI: Record<string, string> = {
  '子': '子午相冲 (Rat clashes with Horse)',
  '丑': '丑未相冲 (Ox clashes with Goat)',
  '寅': '寅申相冲 (Tiger clashes with Monkey)',
  '卯': '卯酉相冲 (Rabbit clashes with Rooster)',
  '辰': '辰戌相冲 (Dragon clashes with Dog)',
  '巳': '巳亥相冲 (Snake clashes with Pig)',
  '午': '午子相冲 (Horse clashes with Rat)',
  '未': '未丑相冲 (Goat clashes with Ox)',
  '申': '寅 (Monkey clashes with Tiger)',
  '酉': '卯 (Rooster clashes with Rabbit)',
  '戌': '辰 (Dog clashes with Dragon)',
  '亥': '巳 (Pig clashes with Snake)',
};

const ZHI_ANIMAL: Record<string, string> = {
  '子': '鼠 Rat',
  '丑': '牛 Ox',
  '寅': '虎 Tiger',
  '卯': '兔 Rabbit',
  '辰': '龙 Dragon',
  '巳': '蛇 Snake',
  '午': '马 Horse',
  '未': '羊 Goat',
  '申': '猴 Monkey',
  '酉': '鸡 Rooster',
  '戌': '狗 Dog',
  '亥': '猪 Pig',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDayGanZhi(year: number, month: number, day: number): { gan: string; zhi: string; ganIndex: number; zhiIndex: number } {
  const solar = Solar.fromYmdHms(year, month, day, 0, 0, 0);
  const lunar = solar.getLunar();
  const dayPillar = lunar.getDayInGanZhi(); // e.g. "甲辰"
  return {
    gan: dayPillar[0],
    zhi: dayPillar[1],
    ganIndex: TIAN_GAN.indexOf(dayPillar[0]),
    zhiIndex: DI_ZHI.indexOf(dayPillar[1]),
  };
}

function getYearGanZhi(year: number): string {
  const gan = TIAN_GAN[((year - 3) % 10 + 10) % 10];
  const zhi = DI_ZHI[((year - 3) % 12 + 12) % 12];
  return `${gan}${zhi}`;
}

interface ChineseDate {
  year: string;
  month: string;
  day: string;
  gz: string;
  shengxiao: string;
}

function getChineseDate(date: Date): ChineseDate {
  const solar = Solar.fromYmdHms(date.getFullYear(), date.getMonth() + 1, date.getDate(), 0, 0, 0);
  const lunar: any = solar.getLunar();
  return {
    year: lunar.getYearInChinese(),
    month: lunar.getMonthInChinese(),
    day: lunar.getDayInChinese(),
    gz: lunar.getDayInGanZhi(),
    shengxiao: lunar.getYearShengXiao(),
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InfoCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="glass-card p-5 text-center">
      <div className="text-xs text-text-tertiary mb-2 tracking-wider uppercase">{title}</div>
      <div className="text-2xl md:text-3xl font-display font-bold text-gold-primary mb-1">{value}</div>
      {subtitle && <div className="text-xs text-text-tertiary">{subtitle}</div>}
    </div>
  );
}

function YiJiSection({ items, label, color }: { items: string[]; label: string; color: string }) {
  return (
    <div className="glass-card p-6">
      <div className={`text-lg font-display font-bold mb-4 ${color}`}>
        {label}
      </div>
      <div className="flex flex-wrap gap-3">
        {items.map((item, i) => (
          <span
            key={i}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${color === 'text-yi-green'
              ? 'bg-yi-green/10 text-yi-green border border-yi-green/20'
              : 'bg-yi-red/10 text-yi-red border border-yi-red/20'
            }`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DailyPage() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const hour = today.getHours();

  const dayGz = getDayGanZhi(year, month, day);
  const yearGz = getYearGanZhi(year);
  const chineseDate = getChineseDate(today);
  const yiJi = YI_JI_BY_GAN[dayGz.gan];
  const clash = CHONG_ZHI[dayGz.zhi];
  const clashAnimal = ZHI_ANIMAL[dayGz.zhi];
  const clashZhi = DI_ZHI[(DI_ZHI.indexOf(dayGz.zhi) + 6) % 12];
  const clashAnimalFull = ZHI_ANIMAL[clashZhi];

  // Pick 2 lucky hours based on day gan
  const luckyShichen = [
    LUCKY_SHICHEN[dayGz.ganIndex % 12],
    LUCKY_SHICHEN[(dayGz.ganIndex + 3) % 12],
  ];

  // Zodiac for the day
  const dayZodiac = ZHI_ANIMAL[dayGz.zhi];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ─── Hero ─── */}
      <section className="relative pt-20 pb-12 px-6 overflow-hidden">
        <div className="absolute inset-0 starry-bg opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gold-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-star-dust/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto text-center pt-8">
          <div className="mb-3">
            <span className="text-gold-primary text-sm font-display tracking-widest">✦ DAILY ALMANAC ✦</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-3 text-gold-glow">
            Daily Yi Ji
          </h1>
          <p className="text-text-secondary text-base max-w-lg mx-auto">
            Today&apos;s Heavenly Stem &amp; Earthly Branch · Auspicious &amp; Inauspicious Activities
          </p>
          <div className="mt-4 text-sm text-text-tertiary">
            {chineseDate.month} · {chineseDate.day} · {chineseDate.shengxiao} Year (Chinese Calendar)
          </div>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Day Pillar */}
          <div className="text-center">
            <span className="text-5xl md:text-7xl font-display font-bold text-gold-glow">
              {dayGz.gan}{dayGz.zhi}
            </span>
            <div className="mt-2 text-text-tertiary text-sm">
              {chineseDate.gz} Day · {dayZodiac}
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoCard
              title="Year Pillar"
              value={yearGz}
              subtitle={`${year} · ${chineseDate.shengxiao}`}
            />
            <InfoCard
              title="Day Element"
              value={['木', '火', '土', '金', '水'][TIAN_GAN.indexOf(dayGz.gan) % 5]}
              subtitle={['Wood', 'Fire', 'Earth', 'Metal', 'Water'][TIAN_GAN.indexOf(dayGz.gan) % 5]}
            />
            {/* Day Element: Chinese character kept as cultural reference; subtitle provides English */}
            <InfoCard
              title="Day Branch"
              value={clashAnimal}
              subtitle={clash}
            />
            <InfoCard
              title="Current Hour"
              value={`${String(hour).padStart(2, '0')}:00`}
              subtitle={LUCKY_SHICHEN.find(([s, e]) => hour >= s && hour < e)?.[2] || ''}
            />
          </div>

          {/* Yi / Ji */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <YiJiSection
              items={yiJi.yi}
              label="YI · Auspicious"
              color="text-yi-green"
            />
            <YiJiSection
              items={yiJi.ji}
              label="JI · Inauspicious"
              color="text-yi-red"
            />
          </div>

          {/* Lucky Hours */}
          <div className="glass-card p-6">
            <div className="text-lg font-display font-bold text-gold-primary mb-4">
              Lucky Hours
            </div>
            <div className="flex flex-wrap gap-3">
              {luckyShichen.map(([start, end, label], i) => (
                <span
                  key={i}
                  className="px-4 py-2 rounded-xl text-sm bg-gold-primary/10 text-gold-primary border border-gold-primary/20">
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Clash */}
          <div className="glass-card p-6">
            <div className="text-lg font-display font-bold text-yi-red mb-2">
              Clash
            </div>
            <div className="text-text-primary text-sm leading-relaxed">
              Today&apos;s clash: {clashAnimal} · {clash}
            </div>
            <div className="text-text-tertiary text-xs mt-2">
              People born in the year of {clashAnimalFull} should avoid major decisions today.
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-center text-text-muted text-xs py-4">
            ⚠️ Based on traditional Chinese almanac rules, for reference and entertainment only.
          </div>

          {/* CTA */}
          <div className="text-center py-8">
            <div className="inline-block glass-card px-8 py-6 border-gold-primary/30">
              <p className="text-text-secondary mb-3">
                Want personalized advice?
              </p>
              <a
                href="/chat"
                className="text-gold-primary font-semibold hover:text-gold-light transition-colors text-lg"
              >
                Talk to our AI Master for free →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
