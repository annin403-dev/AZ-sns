import type { Season } from '../tables';

/** 7-1 今月が summer_months に入っていれば夏、それ以外は冬 */
export function currentSeason(month: number, summerMonths: number[]): 'summer' | 'winter' {
  return summerMonths.includes(month) ? 'summer' : 'winter';
}

/** 今の季節と通年の行だけを数える */
export function inSeason(itemSeason: Season, now: 'summer' | 'winter'): boolean {
  return itemSeason === 'all' || itemSeason === now;
}

export const seasonLabel: Record<Season, string> = { summer: '夏', winter: '冬', all: '通年' };
