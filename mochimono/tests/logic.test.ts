import { describe, expect, it } from 'vitest';
import { clothingStatus, judgeStock, sizeUps, splitMove } from '../shared/logic/clothing';
import { formatMonths, monthDiff, todayTokyo } from '../shared/logic/dates';
import { consumeFromLots, isEatSoon, isExpired, stockMeters, waterPerDay } from '../shared/logic/food';
import { buyListText, homeSummary, makeCtx } from '../shared/logic/home';
import { currentSeason, inSeason } from '../shared/logic/season';
import { defaultSettings, parseSettings } from '../shared/logic/settings';
import {
  growthPerYear, isNearBoundary, shoeSizeFromFoot, monthsToNextShoe, monthsToNextSize, recomputeAutoSizes, sizeChoices, suggestSize,
} from '../shared/logic/sizes';
import { refillTarget, supplyExpiringSoon, supplyToBuy } from '../shared/logic/supplies';
import type { FoodItem, FoodLot, SupplyItem } from '../shared/tables';
import { baseData, item, log } from './fixtures';

const TODAY = '2026-11-06'; // 冬

describe('日付', () => {
  it('東京の日付で数える', () => {
    expect(todayTokyo(new Date('2026-11-05T15:30:00Z')).ymd).toBe('2026-11-06');
  });
  it('月の差', () => {
    expect(monthDiff('2027-01', '2026-11')).toBe(2);
    expect(formatMonths(14)).toBe('約1年2か月後');
    expect(formatMonths(12)).toBe('約1年後');
    expect(formatMonths(5)).toBe('約5か月後');
  });
});

describe('7-1 季節', () => {
  it('summer_months に入っていれば夏', () => {
    expect(currentSeason(7, defaultSettings.summer_months)).toBe('summer');
    expect(currentSeason(11, defaultSettings.summer_months)).toBe('winter');
    expect(currentSeason(4, defaultSettings.summer_months)).toBe('winter');
  });
  it('今の季節と通年だけ数える', () => {
    expect(inSeason('all', 'winter')).toBe(true);
    expect(inSeason('winter', 'winter')).toBe(true);
    expect(inSeason('summer', 'winter')).toBe(false);
  });
});

describe('7-2 サイズの提案', () => {
  it('10cm刻み、境目は大きいほう', () => {
    expect(suggestSize(118)).toBe(120);
    expect(suggestSize(125)).toBe(130);
    expect(suggestSize(124.9)).toBe(120);
    expect(suggestSize(96)).toBe(100);
  });
  it('前後のサイズも選べる', () => {
    expect(sizeChoices(125).map((c) => c.size)).toEqual([120, 130, 140]);
    expect(sizeChoices(125).find((c) => c.suggested)!.fit).toBe('125〜135cm');
    expect(isNearBoundary(125)).toBe(true);
    expect(isNearBoundary(120)).toBe(false);
  });
  it('自動のサイズを計算しなおす（手で直した区分はそのまま）', () => {
    const d = baseData();
    const logs = [log(3, '2026-10-01', 128, 19.3)];
    const out = recomputeAutoSizes(d.members[2], logs, [{ member_id: 3, category_key: 'bottoms', size_label: '120', size_num: 120, source: 'manual' }]);
    expect(out.find((s) => s.category_key === 'tops')!.size_num).toBe(130);
    expect(out.find((s) => s.category_key === 'bottoms')).toBeUndefined();
    expect(out.find((s) => s.category_key === 'shoes')!.size_num).toBe(19.5);
    expect(recomputeAutoSizes(d.members[0], logs, [])).toEqual([]);
  });
  it('靴は足のサイズを0.5cm刻みで切り上げ', () => {
    expect(shoeSizeFromFoot(18.6)).toBe(19);
    expect(shoeSizeFromFoot(18.5)).toBe(18.5);
    expect(shoeSizeFromFoot(18.0)).toBe(18);
  });
});

describe('7-3 伸び方と次のサイズ', () => {
  it('記録が足りなければ初期値（年6cm）', () => {
    expect(growthPerYear([log(3, '2026-10-01', 118)], 'height_cm', TODAY, 6)).toBe(6);
    // 60日未満しか離れていない
    expect(growthPerYear([log(3, '2026-09-01', 117), log(3, '2026-10-01', 118)], 'height_cm', TODAY, 6)).toBe(6);
    // 12か月より前の記録は使わない
    expect(growthPerYear([log(3, '2025-01-01', 110), log(3, '2026-10-01', 118)], 'height_cm', TODAY, 6)).toBe(6);
  });
  it('直近12か月に60日以上離れた2件があれば、そこから計算', () => {
    // 2026-02-01→2026-12-01（303日）で 5cm 伸びた → 年 約6.0cm
    const r = growthPerYear([log(3, '2026-02-01', 115), log(3, '2026-12-01', 120)], 'height_cm', '2027-01-02', 3)!;
    expect(r).toBeCloseTo((5 / 303) * 365, 5);
  });
  it('例：118cm・年6cm → 125cmまで約14か月', () => {
    expect(monthsToNextSize(118, 120, 6)).toBeCloseTo(14, 5);
  });
  it('足は記録がなければ出さない', () => {
    expect(growthPerYear([log(3, '2026-10-01', null, 19)], 'foot_cm', TODAY, null)).toBeNull();
    expect(monthsToNextShoe(19, 19, null)).toBeNull();
    expect(monthsToNextShoe(19, 19, 1)).toBeCloseTo(6, 5);
  });
});

describe('7-4 服の不足と「買わなくてOK」', () => {
  it('目安−着ている数。今の季節と通年、今のサイズだけ数える', () => {
    const d = baseData();
    d.member_sizes = [{ member_id: 4, category_key: 'tops', size_label: '130', size_num: 130, source: 'auto' }];
    d.clothing_items = [
      item({ member_id: 4, size_num: 130, season: 'all', qty: 3 }),
      item({ member_id: 4, size_num: 130, season: 'summer', qty: 6 }), // 夏物は冬に数えない
      item({ member_id: 4, size_num: 120, season: 'winter', qty: 4 }), // 前のサイズは数えない
      item({ member_id: 4, size_num: 130, season: 'winter', qty: 1, status: 'discard' }),
    ];
    const r = clothingStatus(makeCtx(d, TODAY)).find((x) => x.member.id === 4 && x.category.key === 'tops')!;
    expect(r.wearing).toBe(3);
    expect(r.shortage).toBe(4);
    expect(r.remaining).toBe(4);
  });
  it('来年用→お下がりの順に足りるか確かめる', () => {
    const d = baseData();
    d.member_sizes = [{ member_id: 5, category_key: 'tops', size_label: '110', size_num: 110, source: 'auto' }];
    d.clothing_items = [
      item({ member_id: 5, size_num: 110, qty: 3 }),
      item({ member_id: 5, size_num: 110, qty: 1, status: 'next' }),
      item({ owner_type: 'stock', gender: 'male', size_num: 110, qty: 5, status: 'stock' }), // 男児は合わない
      item({ owner_type: 'stock', gender: 'unisex', size_num: 110, qty: 2, status: 'stock', season: 'summer' }), // 季節が違う
      item({ owner_type: 'stock', gender: 'female', size_num: 110, qty: 2, status: 'stock', reserved_for_member_id: 3 }), // 他の子に固定
      item({ owner_type: 'stock', gender: 'unisex', size_num: 110, qty: 2, status: 'stock' }),
      item({ owner_type: 'stock', gender: 'female', size_num: 120, qty: 2, status: 'stock' }), // サイズが違う
    ];
    const r = clothingStatus(makeCtx(d, TODAY)).find((x) => x.member.id === 5 && x.category.key === 'tops')!;
    expect(r.shortage).toBe(4);
    expect(r.fromNext.reduce((a, c) => a + c.use, 0)).toBe(1);
    expect(r.fromStock.reduce((a, c) => a + c.use, 0)).toBe(2);
    expect(r.remaining).toBe(1);
  });
  it('お下がりは2人で取り合わない', () => {
    const d = baseData();
    d.member_sizes = [
      { member_id: 3, category_key: 'tops', size_label: '110', size_num: 110, source: 'manual' },
      { member_id: 5, category_key: 'tops', size_label: '110', size_num: 110, source: 'auto' },
    ];
    d.clothing_items = [item({ owner_type: 'stock', gender: 'female', size_num: 110, qty: 10, status: 'stock' })];
    const rows = clothingStatus(makeCtx(d, TODAY));
    const a = rows.find((x) => x.member.id === 3 && x.category.key === 'tops')!;
    const b = rows.find((x) => x.member.id === 5 && x.category.key === 'tops')!;
    expect(a.fromStock[0].use).toBe(7);
    expect(b.fromStock[0].use).toBe(3);
    expect(b.remaining).toBe(4);
  });
  it('大人はサイズに関係なく数える。多すぎは over', () => {
    const d = baseData();
    d.clothing_items = [item({ member_id: 1, size_label: 'M', qty: 5 }), item({ member_id: 1, size_label: 'L', qty: 3 })];
    const r = clothingStatus(makeCtx(d, TODAY)).find((x) => x.member.id === 1)!;
    expect(r.wearing).toBe(8);
    expect(r.over).toBe(2);
    expect(r.shortage).toBe(0);
  });
  it('自由枠と目安なしは対象外', () => {
    const d = baseData();
    expect(clothingStatus(makeCtx(d, TODAY)).some((r) => r.category.key === 'onepiece')).toBe(false);
    expect(clothingStatus(makeCtx(d, TODAY)).some((r) => r.member.id === 2)).toBe(false);
  });
  it('一部だけ「着ている」に移す', () => {
    const src = item({ owner_type: 'stock', gender: 'unisex', size_num: 110, qty: 5, status: 'stock' });
    const ch = splitMove([src], src, 2, { owner_type: 'member', member_id: 5, status: 'wearing' });
    expect(ch).toHaveLength(2);
    expect(ch[0]).toMatchObject({ kind: 'update', row: { id: src.id, qty: 3 } });
    expect(ch[1]).toMatchObject({ kind: 'insert', row: { qty: 2, member_id: 5, status: 'wearing', owner_type: 'member', gender: null } });
  });
  it('同じまとまりがあれば、そこへ足す', () => {
    const src = item({ owner_type: 'member', member_id: 5, size_num: 110, qty: 2, status: 'next' });
    const dst = item({ owner_type: 'member', member_id: 5, size_num: 110, qty: 3, status: 'wearing' });
    const ch = splitMove([src, dst], src, 2, { status: 'wearing' });
    expect(ch).toEqual([{ kind: 'update', row: { ...dst, qty: 5 } }, { kind: 'delete', id: src.id }]);
  });
});

describe('7-5 お下がり在庫の判定', () => {
  const setup = () => {
    const d = baseData();
    d.growth_logs = [log(3, '2026-10-01', 138), log(5, '2026-10-01', 103), log(4, '2026-10-01', 118)];
    d.member_sizes = [
      { member_id: 3, category_key: 'tops', size_label: '140', size_num: 140, source: 'auto' },
      { member_id: 5, category_key: 'tops', size_label: '100', size_num: 100, source: 'auto' },
      { member_id: 4, category_key: 'tops', size_label: '120', size_num: 120, source: 'auto' },
    ];
    return d;
  };
  it('今のサイズと同じ子がいれば「今使えます」', () => {
    const d = setup();
    const v = judgeStock(makeCtx(d, TODAY), item({ owner_type: 'stock', gender: 'female', size_num: 100, status: 'stock' }));
    expect(v.kind).toBe('now');
    expect(v.assignee!.id).toBe(5);
  });
  it('一番早く届く子に割り当てる', () => {
    const d = setup();
    // 兼用130：次子（118cm→125まで7cm＝14か月）、末子（103→125まで22cm）
    const v = judgeStock(makeCtx(d, TODAY), item({ owner_type: 'stock', gender: 'unisex', size_num: 130, status: 'stock' }));
    expect(v.kind).toBe('later');
    expect(v.assignee!.id).toBe(4);
    expect(v.months).toBeCloseTo(14, 5);
  });
  it('着る子がいない（性別・サイズが合わない）', () => {
    const d = setup();
    const v = judgeStock(makeCtx(d, TODAY), item({ owner_type: 'stock', gender: 'male', size_num: 110, status: 'stock' }));
    expect(v.kind).toBe('none');
  });
  it('固定された子だけを見る', () => {
    const d = setup();
    const v = judgeStock(makeCtx(d, TODAY), item({ owner_type: 'stock', gender: 'female', size_num: 130, status: 'stock', reserved_for_member_id: 3 }));
    expect(v.kind).toBe('none');
  });
  it('着るまでが長すぎると「保管が長い」', () => {
    const d = setup();
    // 末子103cm→155cm(160サイズ)まで52cm÷6＝104か月 > 36か月
    const v = judgeStock(makeCtx(d, TODAY), item({ owner_type: 'stock', gender: 'female', size_num: 160, status: 'stock' }));
    expect(v.assignee!.id).toBe(3);
    expect(v.tooLong).toBe(false); // 長子 138→155 は 34か月
    const v2 = judgeStock(makeCtx(d, TODAY), item({ owner_type: 'stock', gender: 'female', size_num: 170, status: 'stock' }));
    expect(v2.tooLong).toBe(true);
  });
});

describe('7-6 サイズが上がったとき', () => {
  it('前のサイズの服と、新しいサイズのお下がり・来年用を出す', () => {
    const d = baseData();
    d.growth_logs = [log(5, '2026-10-01', 103)];
    d.member_sizes = [
      { member_id: 4, category_key: 'tops', size_label: '130', size_num: 130, source: 'auto' },
      { member_id: 5, category_key: 'tops', size_label: '100', size_num: 100, source: 'auto' },
    ];
    d.clothing_items = [
      item({ member_id: 4, size_num: 120, qty: 5 }),
      item({ member_id: 4, size_num: 130, qty: 2, status: 'next' }),
      item({ owner_type: 'stock', gender: 'male', size_num: 130, qty: 3, status: 'stock' }),
    ];
    const ups = sizeUps(makeCtx(d, TODAY));
    expect(ups).toHaveLength(1);
    expect(ups[0].member.id).toBe(4);
    expect(ups[0].newNext).toHaveLength(1);
    expect(ups[0].newStock).toHaveLength(1);
    // 次子(男)の120は、男の子がほかにいないので「着る子がいない」→手放すを提案
    expect(ups[0].oldItems[0].verdict.kind).toBe('none');
  });
});

describe('7-7 消耗品', () => {
  const sup = (p: Partial<SupplyItem>): SupplyItem => ({
    id: 1, category: '紙類', name: 'トイレットペーパー', owner_member_id: null, unit: 'パック', qty_unopened: 0, reorder_at: 0, refill_to: 1,
    auto_target: null, place_id: null, is_disaster: 0, expires_on: null, note: null, ...p,
  });
  it('reorder_at 以下で買う。買う数＝refill_to−未開封', () => {
    expect(supplyToBuy(sup({ qty_unopened: 0, reorder_at: 0, refill_to: 1 }), defaultSettings)).toBe(1);
    expect(supplyToBuy(sup({ qty_unopened: 1, reorder_at: 1, refill_to: 3 }), defaultSettings)).toBe(2);
    expect(supplyToBuy(sup({ qty_unopened: 2, reorder_at: 1, refill_to: 3 }), defaultSettings)).toBe(0);
  });
  it('簡易トイレは 5×5×7＝175回分', () => {
    const t = sup({ auto_target: 'toilet', refill_to: 1 });
    expect(refillTarget(t, defaultSettings)).toBe(175);
    expect(supplyToBuy({ ...t, qty_unopened: 100 }, defaultSettings)).toBe(75);
    expect(supplyToBuy({ ...t, qty_unopened: 175 }, defaultSettings)).toBe(0);
  });
  it('使用期限が2か月以内ならお知らせ', () => {
    expect(supplyExpiringSoon(sup({ expires_on: '2027-01' }), '2026-11')).toBe(true);
    expect(supplyExpiringSoon(sup({ expires_on: '2027-02' }), '2026-11')).toBe(false);
    expect(supplyExpiringSoon(sup({ expires_on: '2026-08' }), '2026-11')).toBe(true);
  });
});

describe('7-8 備蓄の日数', () => {
  const items: FoodItem[] = [
    { id: 1, group_key: 'water', name: '水 2L', unit: '本', meals_per_unit: null, liters_per_unit: 2, kg_per_unit: null, default_place_id: null, note: null },
    { id: 2, group_key: 'rice', name: '米', unit: 'kg', meals_per_unit: null, liters_per_unit: null, kg_per_unit: 1, default_place_id: null, note: null },
    { id: 3, group_key: 'pasta', name: 'パスタ', unit: '袋', meals_per_unit: 5, liters_per_unit: null, kg_per_unit: null, default_place_id: null, note: null },
    { id: 4, group_key: 'canned', name: '魚の缶詰', unit: '缶', meals_per_unit: 1, liters_per_unit: null, kg_per_unit: null, default_place_id: null, note: null },
    { id: 5, group_key: 'snack', name: 'ビスケット', unit: '箱', meals_per_unit: null, liters_per_unit: null, kg_per_unit: null, default_place_id: null, note: null },
    { id: 6, group_key: 'retort', name: 'カレー', unit: '袋', meals_per_unit: 1, liters_per_unit: null, kg_per_unit: null, default_place_id: null, note: null },
  ];
  const lot = (id: number, food_item_id: number, qty: number, best_before: string | null): FoodLot => ({ id, food_item_id, qty, best_before, place_id: null });
  it('1日の水＝5×3＋5合×0.2＝16L', () => {
    expect(waterPerDay(defaultSettings)).toBe(16);
    expect(waterPerDay({ ...defaultSettings, include_rice_water: false })).toBe(15);
  });
  it('日数と足りない量', () => {
    const lots = [
      lot(1, 1, 24, '2030-01'), // 48L → 3日
      lot(2, 2, 10, null), // 10kg → 10000/150/5 = 13.3日
      lot(3, 3, 3, '2027-12'), // 15人前
      lot(4, 4, 15, '2027-12'), // 15人前
      lot(5, 4, 30, '2026-10'), // 期限切れは数えない
      lot(6, 5, 10, '2027-12'), // 人前なしは数えない
      lot(7, 6, 6, '2027-12'), // 6人前
    ];
    const m = stockMeters({ items, lots, settings: defaultSettings, currentYm: '2026-11' });
    const get = (k: string) => m.find((x) => x.key === k)!;
    expect(get('water').days).toBe(3);
    expect(get('water').shortText).toBe('水 2L あと32本'); // 112L−48L＝64L
    expect(get('rice').days).toBe(13.3);
    expect(get('rice').shortText).toBeNull();
    expect(get('food').amount).toBe(36);
    expect(get('food').days).toBe(2.4);
    expect(get('food').shortText).toBe('食料（米以外） あと69人前'); // 105−36
    expect(get('retort_pasta').amount).toBe(21);
    expect(get('retort_pasta').shortText).toBe('レトルト・パスタ類 あと24人前'); // 45−21
  });
  it('期限：今月から eat_alert_months 以内は「食べるもの」、過ぎたら期限切れ', () => {
    expect(isEatSoon(lot(1, 1, 1, '2027-01'), '2026-11', 2)).toBe(true);
    expect(isEatSoon(lot(1, 1, 1, '2027-02'), '2026-11', 2)).toBe(false);
    expect(isExpired(lot(1, 1, 1, '2026-10'), '2026-11')).toBe(true);
    expect(isExpired(lot(1, 1, 1, '2026-11'), '2026-11')).toBe(false);
    expect(isEatSoon(lot(1, 1, 1, null), '2026-11', 2)).toBe(false);
  });
  it('食べた：期限が近いロットから減らす', () => {
    const lots = [lot(1, 4, 2, '2028-01'), lot(2, 4, 1, '2027-01'), lot(3, 4, 5, null)];
    expect(consumeFromLots(lots, 4, 2)).toEqual([{ ...lots[1], qty: 0 }, { ...lots[0], qty: 1 }]);
  });
});

describe('ホームのまとめ', () => {
  it('買うもの・お知らせ・消したお知らせ', () => {
    const d = baseData();
    d.supply_items = [{ id: 1, category: '紙類', name: 'ティッシュ', owner_member_id: null, unit: '5箱パック', qty_unopened: 0, reorder_at: 0, refill_to: 1, auto_target: null, place_id: null, is_disaster: 0, expires_on: null, note: null }];
    d.member_sizes = [{ member_id: 4, category_key: 'tops', size_label: '130', size_num: 130, source: 'auto' }];
    d.growth_logs = [log(4, '2026-10-01', 128)];
    const h = homeSummary(d, TODAY);
    const text = buyListText(h);
    expect(text).toContain('ティッシュ 5箱パック×1');
    expect(text).toContain('次子 トップス130 あと7枚');
    expect(text).toContain('夫 トップス あと6枚');
    // 長子・末子は身長の記録がない → 測るお知らせ。次子は最近測ったので出ない
    const measure = h.notices.filter((n) => n.type === 'measure').map((n) => (n.data as { member: { id: number } }).member.id);
    expect(measure).toEqual([3, 5]);
    d.dismissals = [{ key: h.notices.find((n) => n.type === 'measure')!.key }];
    expect(homeSummary(d, TODAY).notices.filter((n) => n.type === 'measure')).toHaveLength(1);
  });
  it('設定値の読み込み（壊れた値は初期値）', () => {
    const s = parseSettings([{ key: 'household_size', value: '4' }, { key: 'summer_months', value: 'xx' }]);
    expect(s.household_size).toBe(4);
    expect(s.summer_months).toEqual(defaultSettings.summer_months);
  });
});
