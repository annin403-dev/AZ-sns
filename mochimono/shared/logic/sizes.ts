import type { GrowthLog, Member, MemberSize } from '../tables';
import { dayDiff } from './dates';

/** 身長からサイズを出す区分（子ども） */
export const HEIGHT_CATS = ['tops', 'bottoms', 'onepiece', 'outer', 'pajama', 'underwear', 'school', 'formal'];
/** 足のサイズを使う区分 */
export const FOOT_CATS = ['shoes'];
/** サイズで絞り込まない区分（ざっくり管理） */
export const SIZE_FREE_CATS = ['socks', 'accessories', 'work'];

export function isSizeTracked(categoryKey: string): boolean {
  return HEIGHT_CATS.includes(categoryKey) || FOOT_CATS.includes(categoryKey);
}

/** 7-2 身長から10cm刻みで提案（サイズNは N−5〜N+5cm。ちょうど境目は大きいほう） */
export function suggestSize(heightCm: number): number {
  return Math.max(50, Math.floor(heightCm / 10 + 0.5) * 10);
}

/** 選べるサイズ（提案の前後1つずつ）。細身の子などに合わせて選べるようにする */
export function sizeChoices(heightCm: number): { size: number; fit: string; suggested: boolean }[] {
  const s = suggestSize(heightCm);
  return [s - 10, s, s + 10]
    .filter((n) => n >= 50)
    .map((n) => ({ size: n, fit: `${n - 5}〜${n + 5}cm`, suggested: n === s }));
}

/** 境目に近い（±1.5cm）ときは、どちらのサイズも合いそうなことを伝える */
export function isNearBoundary(heightCm: number): boolean {
  const r = heightCm % 10;
  return Math.abs(r - 5) <= 1.5;
}

/** 靴のサイズ表記（0.5cm刻み。足より小さくならないよう切り上げ） */
export function shoeSizeFromFoot(footCm: number): number {
  return Math.ceil(Math.round(footCm * 100) / 50) / 2;
}

type Field = 'height_cm' | 'foot_cm';

function sortedLogs(logs: GrowthLog[], field: Field) {
  return logs.filter((l) => l[field] != null).sort((a, b) => a.measured_on.localeCompare(b.measured_on));
}

export function latestValue(logs: GrowthLog[], field: Field): { value: number; on: string } | null {
  const s = sortedLogs(logs, field);
  const last = s[s.length - 1];
  return last ? { value: last[field] as number, on: last.measured_on } : null;
}

/**
 * 7-3 年あたりの伸び。
 * 直近12か月に、60日以上離れた記録が2件以上あれば、その間（いちばん古い〜いちばん新しい）の伸びから計算。
 * なければ fallback（身長は default_growth_cm_per_year、足は null＝出さない）。
 */
export function growthPerYear(logs: GrowthLog[], field: Field, todayYmd: string, fallback: number | null): number | null {
  const recent = sortedLogs(logs, field).filter((l) => dayDiff(todayYmd, l.measured_on) <= 365);
  if (recent.length >= 2) {
    const first = recent[0], last = recent[recent.length - 1];
    const days = dayDiff(last.measured_on, first.measured_on);
    if (days >= 60) {
      const rate = (((last[field] as number) - (first[field] as number)) / days) * 365;
      if (rate > 0) return rate;
    }
  }
  return fallback;
}

/** ある長さ（身長・足）に届くまでの月数。届いていれば0。伸びがわからなければ null */
export function monthsUntil(current: number, target: number, ratePerYear: number | null): number | null {
  if (current >= target) return 0;
  if (!ratePerYear || ratePerYear <= 0) return null;
  return ((target - current) / ratePerYear) * 12;
}

/** 7-3 次のサイズ（N+10）になる時期＝身長が N+5 に届くまでの月数 */
export function monthsToNextSize(heightCm: number, currentSize: number, ratePerYear: number | null): number | null {
  return monthsUntil(heightCm, currentSize + 5, ratePerYear);
}

/** 服のサイズ N を着られるようになる（身長が N−5 に届く）までの月数 */
export function monthsToWearSize(heightCm: number, size: number, ratePerYear: number | null): number | null {
  return monthsUntil(heightCm, size - 5, ratePerYear);
}

/** 靴：次のサイズ（+0.5cm）は、足がその長さに届いたとき */
export function monthsToNextShoe(footCm: number, currentShoe: number, ratePerYear: number | null): number | null {
  return monthsUntil(footCm, currentShoe + 0.5, ratePerYear);
}
export function monthsToWearShoe(footCm: number, shoe: number, ratePerYear: number | null): number | null {
  return monthsUntil(footCm, shoe, ratePerYear);
}

/**
 * 成長の記録から、自動のサイズを計算しなおす。手で直した（manual）区分は変えない。
 * 変わる行だけを返す。
 */
export function recomputeAutoSizes(member: Member, logs: GrowthLog[], current: MemberSize[]): MemberSize[] {
  if (member.kind !== 'child') return [];
  const mine = logs.filter((l) => l.member_id === member.id);
  const h = latestValue(mine, 'height_cm');
  const f = latestValue(mine, 'foot_cm');
  const out: MemberSize[] = [];
  const consider = (cat: string, num: number, label: string) => {
    const existing = current.find((s) => s.member_id === member.id && s.category_key === cat);
    if (existing?.source === 'manual') return;
    if (existing && existing.size_num === num && existing.size_label === label) return;
    out.push({ member_id: member.id, category_key: cat, size_num: num, size_label: label, source: 'auto' });
  };
  if (h) for (const cat of HEIGHT_CATS) { const n = suggestSize(h.value); consider(cat, n, String(n)); }
  if (f) for (const cat of FOOT_CATS) { const n = shoeSizeFromFoot(f.value); consider(cat, n, String(n)); }
  return out;
}
