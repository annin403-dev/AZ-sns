import type { FoodItem, FoodLot } from '../tables';
import { monthDiff } from './dates';
import type { Settings } from './settings';

export const GO_GRAMS = 150;
export const RICE_WATER_L_PER_GO = 0.2;

/** 期限切れ（期限の月が今月より前） */
export function isExpired(lot: FoodLot, currentYm: string): boolean {
  return lot.best_before != null && monthDiff(lot.best_before, currentYm) < 0;
}

/** 期限が今月から eat_alert_months 以内（期限切れは含まない） */
export function isEatSoon(lot: FoodLot, currentYm: string, alertMonths: number): boolean {
  if (lot.best_before == null) return false;
  const d = monthDiff(lot.best_before, currentYm);
  return d >= 0 && d <= alertMonths;
}

export function waterPerDay(s: Settings): number {
  return s.household_size * s.water_l_per_person_day + (s.include_rice_water ? s.rice_go_per_day * RICE_WATER_L_PER_GO : 0);
}

export type Meter = { key: 'water' | 'rice' | 'food' | 'retort_pasta'; label: string; days: number; target: number; amount: number; unit: string; shortText: string | null };

type Ctx = { items: FoodItem[]; lots: FoodLot[]; settings: Settings; currentYm: string };

function validLots(ctx: Ctx, pred: (it: FoodItem) => boolean) {
  const byId = new Map(ctx.items.map((i) => [i.id, i]));
  return ctx.lots
    .filter((l) => !isExpired(l, ctx.currentYm) && l.qty > 0)
    .map((l) => ({ lot: l, item: byId.get(l.food_item_id)! }))
    .filter((x) => x.item && pred(x.item));
}

export function totalWaterL(ctx: Ctx): number {
  return validLots(ctx, (i) => i.group_key === 'water').reduce((s, x) => s + x.lot.qty * (x.item.liters_per_unit ?? 0), 0);
}
export function totalRiceKg(ctx: Ctx): number {
  return validLots(ctx, (i) => i.group_key === 'rice').reduce((s, x) => s + x.lot.qty * (x.item.kg_per_unit ?? 0), 0);
}
/** 人前の合計（meals_per_unit が null の物は数えない） */
export function totalMeals(ctx: Ctx, groups?: string[]): number {
  return validLots(ctx, (i) => i.group_key !== 'water' && i.group_key !== 'rice' && i.meals_per_unit != null && (!groups || groups.includes(i.group_key)))
    .reduce((s, x) => s + x.lot.qty * (x.item.meals_per_unit as number), 0);
}

export function riceDays(kg: number, s: Settings): number {
  if (s.rice_go_per_day <= 0) return 0;
  return (kg * 1000) / GO_GRAMS / s.rice_go_per_day;
}

const floor1 = (n: number) => Math.floor(n * 10) / 10;

/** 7-8 備蓄のメーター。足りないときは shortText に買う量 */
export function stockMeters(ctx: Ctx): Meter[] {
  const s = ctx.settings;
  const perDayMeals = s.household_size * 3;

  const water = totalWaterL(ctx);
  const wpd = waterPerDay(s);
  const waterDays = wpd > 0 ? water / wpd : 0;
  const waterNeedL = s.target_days_water * wpd - water;
  const bottles = Math.ceil(waterNeedL / 2 - 1e-9);

  const rice = totalRiceKg(ctx);
  const rDays = riceDays(rice, s);
  const riceNeedKg = (s.target_days_rice * s.rice_go_per_day * GO_GRAMS) / 1000 - rice;

  const meals = totalMeals(ctx);
  const foodDays = perDayMeals > 0 ? meals / perDayMeals : 0;
  const foodNeed = Math.ceil(s.target_days_food * perDayMeals - meals - 1e-9);

  const rp = totalMeals(ctx, ['retort', 'pasta']);
  const rpDays = perDayMeals > 0 ? rp / perDayMeals : 0;
  const rpNeed = Math.ceil(s.target_days_retort_pasta * perDayMeals - rp - 1e-9);

  return [
    { key: 'water', label: '水', days: floor1(waterDays), target: s.target_days_water, amount: water, unit: 'L', shortText: bottles > 0 ? `水 2L あと${bottles}本` : null },
    { key: 'rice', label: '米', days: floor1(rDays), target: s.target_days_rice, amount: rice, unit: 'kg', shortText: riceNeedKg > 0.05 ? `米 あと約${Math.ceil(riceNeedKg)}kg` : null },
    { key: 'food', label: '食料（米以外）', days: floor1(foodDays), target: s.target_days_food, amount: meals, unit: '人前', shortText: foodNeed > 0 ? `食料（米以外） あと${foodNeed}人前` : null },
    { key: 'retort_pasta', label: 'レトルト＋パスタ類', days: floor1(rpDays), target: s.target_days_retort_pasta, amount: rp, unit: '人前', shortText: rpNeed > 0 ? `レトルト・パスタ類 あと${rpNeed}人前` : null },
  ];
}

/** 「食べた／使った」：期限が一番近いロットから減らす。変わったロットを返す（0になった物は qty 0） */
export function consumeFromLots(lots: FoodLot[], foodItemId: number, amount: number): FoodLot[] {
  const mine = lots
    .filter((l) => l.food_item_id === foodItemId && l.qty > 0)
    .sort((a, b) => (a.best_before ?? '9999-99').localeCompare(b.best_before ?? '9999-99') || a.id - b.id);
  let left = amount;
  const changed: FoodLot[] = [];
  for (const l of mine) {
    if (left <= 0) break;
    const use = Math.min(l.qty, left);
    left -= use;
    changed.push({ ...l, qty: Math.round((l.qty - use) * 1000) / 1000 });
  }
  return changed;
}
