declare module 'lunar-javascript' {
  export interface Solar {
    fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second?: number): Solar;
    getLunar(): Lunar;
    getPrevJie(): Solar;
    getNextJie(): Solar;
    getJieQi(): string;
    toYmdHms(): string;
    getTime(): number;
    getSolar(): Solar;
    getName(): string;
  }

  export interface Lunar {
    getBazi(): {
      getYearGan(): string;
      getYearZhi(): string;
      getMonthGan(): string;
      getMonthZhi(): string;
      getDayGan(): string;
      getDayZhi(): string;
      getTimeGan(): string;
      getTimeZhi(): string;
    };
    getXingZuo(): string;
    getYearShengXiao(): string;
    getShiShen(): string[];
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getTimeInGanZhi(): string;
    getName(): string;
  }

  export const Solar: {
    fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second?: number): Solar;
  };

  export const Lunar: {
    fromYearMonthDay(year: number, month: number, day: number): Lunar;
  };
}
