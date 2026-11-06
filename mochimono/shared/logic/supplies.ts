import type { SupplyItem } from '../tables';
import { monthDiff } from './dates';
import type { Settings } from './settings';

/** 7-7 補充後の数。簡易トイレは「人数×1日の回数×日数」 */
export function refillTarget(item: SupplyItem, s: Settings): number {
  if (item.auto_target === 'toilet') return s.household_size * s.toilet_uses_per_person_day * s.target_days_toilet;
  return item.refill_to;
}

/** 買う数（買わなくてよければ 0）。自動計算の物は、目標に届いていなければ買う */
export function supplyToBuy(item: SupplyItem, s: Settings): number {
  const refill = refillTarget(item, s);
  if (item.auto_target) return Math.max(0, refill - item.qty_unopened);
  if (item.qty_unopened > item.reorder_at) return 0;
  return Math.max(0, refill - item.qty_unopened);
}

/** 使用期限が今月から2か月以内（過ぎた物も含む） */
export function supplyExpiringSoon(item: SupplyItem, currentYm: string): boolean {
  if (!item.expires_on) return false;
  return monthDiff(item.expires_on, currentYm) <= 2;
}
