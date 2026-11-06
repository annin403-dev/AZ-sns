import type { AllData, ClothingItem, FoodItem, FoodLot, Member, SupplyItem } from '../tables';
import { clothingStatus, judgeAllStock, sizeUps, type ClothingRow, type Ctx, type SizeUp, type StockVerdict } from './clothing';
import { dayDiff, formatMonths, fromYmd, monthDiff } from './dates';
import { isEatSoon, isExpired, stockMeters, type Meter } from './food';
import { parseSettings } from './settings';
import { latestValue } from './sizes';
import { supplyExpiringSoon, supplyToBuy } from './supplies';

export type Notice =
  | { key: string; type: 'sizeup'; data: SizeUp }
  | { key: string; type: 'cover'; data: ClothingRow }
  | { key: string; type: 'supply_expiry'; data: SupplyItem }
  | { key: string; type: 'measure'; data: { member: Member; last: string | null; days: number | null } };

export type DiscardCandidate =
  | { key: string; type: 'over'; data: ClothingRow }
  | { key: string; type: 'no_kid'; data: StockVerdict }
  | { key: string; type: 'too_long'; data: StockVerdict }
  | { key: string; type: 'marked'; data: ClothingItem };

export type HomeSummary = {
  buySupplies: { item: SupplyItem; qty: number }[];
  buyClothes: ClothingRow[];
  buyFood: Meter[];
  eat: { lot: FoodLot; item: FoodItem; expired: boolean; monthsLeft: number }[];
  notices: Notice[];
  discards: DiscardCandidate[];
  meters: Meter[];
  clothing: ClothingRow[];
  stock: StockVerdict[];
};

export function makeCtx(data: AllData, todayYmd: string): Ctx {
  const t = fromYmd(todayYmd);
  return { data, settings: parseSettings(data.settings), todayYmd, month: t.m };
}

export function homeSummary(data: AllData, todayYmd: string): HomeSummary {
  const ctx = makeCtx(data, todayYmd);
  const ym = todayYmd.slice(0, 7);
  const s = ctx.settings;
  const dismissed = new Set(data.dismissals.map((d) => d.key));

  const buySupplies = data.supply_items.map((item) => ({ item, qty: supplyToBuy(item, s) })).filter((x) => x.qty > 0);
  const clothing = clothingStatus(ctx);
  const buyClothes = clothing.filter((r) => r.remaining > 0);
  const meters = stockMeters({ items: data.food_items, lots: data.food_lots, settings: s, currentYm: ym });
  const buyFood = meters.filter((m) => m.shortText);

  const itemsById = new Map(data.food_items.map((i) => [i.id, i]));
  const eat = data.food_lots
    .filter((l) => l.qty > 0 && (isExpired(l, ym) || isEatSoon(l, ym, s.eat_alert_months)))
    .map((lot) => ({ lot, item: itemsById.get(lot.food_item_id)!, expired: isExpired(lot, ym), monthsLeft: monthDiff(lot.best_before!, ym) }))
    .filter((x) => x.item)
    .sort((a, b) => Number(b.expired) - Number(a.expired) || a.lot.best_before!.localeCompare(b.lot.best_before!));

  const notices: Notice[] = [];
  for (const up of sizeUps(ctx)) {
    const sig = up.oldItems.map((o) => `${o.item.id}x${o.item.qty}`).join(',') + '|' + [...up.newNext, ...up.newStock].map((i) => `${i.id}x${i.qty}`).join(',');
    notices.push({ key: `sizeup:${up.member.id}:${up.category.key}:${up.sizeNum}:${sig}`, type: 'sizeup', data: up });
  }
  for (const r of clothing) {
    if (r.fromNext.length + r.fromStock.length === 0) continue;
    const n = r.fromNext.reduce((a, c) => a + c.use, 0), st = r.fromStock.reduce((a, c) => a + c.use, 0);
    notices.push({ key: `cover:${r.member.id}:${r.category.key}:${r.sizeNum}:${n}:${st}:${r.wearing}`, type: 'cover', data: r });
  }
  for (const it of data.supply_items) {
    if (supplyExpiringSoon(it, ym)) notices.push({ key: `supexp:${it.id}:${it.expires_on}`, type: 'supply_expiry', data: it });
  }
  for (const m of data.members.filter((x) => x.kind === 'child')) {
    const logs = data.growth_logs.filter((l) => l.member_id === m.id);
    const last = latestValue(logs, 'height_cm');
    const days = last ? dayDiff(todayYmd, last.on) : null;
    if (days == null || days >= s.measure_interval_days) notices.push({ key: `measure:${m.id}:${last?.on ?? 'none'}`, type: 'measure', data: { member: m, last: last?.on ?? null, days } });
  }

  const stock = judgeAllStock(ctx);
  const discards: DiscardCandidate[] = [];
  for (const r of clothing) if (r.over > 0) discards.push({ key: `over:${r.member.id}:${r.category.key}:${r.sizeNum}:${r.over}`, type: 'over', data: r });
  for (const v of stock) {
    if (v.kind === 'none') discards.push({ key: `nokid:${v.item.id}:${v.item.qty}:${v.item.size_num}`, type: 'no_kid', data: v });
    else if (v.tooLong) discards.push({ key: `toolong:${v.item.id}:${v.item.qty}:${v.assignee?.id}:${Math.round(v.months ?? 0)}`, type: 'too_long', data: v });
  }
  for (const it of data.clothing_items) if (it.status === 'discard') discards.push({ key: `marked:${it.id}`, type: 'marked', data: it });

  return {
    buySupplies,
    buyClothes,
    buyFood,
    eat,
    notices: notices.filter((n) => !dismissed.has(n.key)),
    discards: discards.filter((d) => d.type === 'marked' || !dismissed.has(d.key)),
    meters,
    clothing,
    stock,
  };
}

export function clothingLabel(r: ClothingRow): string {
  const size = r.member.kind === 'child' && r.sizeNum != null ? String(r.sizeNum) : '';
  return `${r.member.name} ${r.category.label}${size}`;
}

export function stockVerdictText(v: StockVerdict): string {
  if (v.kind === 'none') return '着る子がいません';
  if (v.kind === 'now') return `${v.assignee!.name}が今使えます`;
  if (v.kind === 'unknown') return v.assignee ? `${v.assignee.name}が着る予定（時期は記録が増えるとわかります）` : '判定できません';
  return `${v.assignee!.name}が${formatMonths(v.months!)}に着ます`;
}

/** 数と単位（単位が数字で始まる「5箱パック」などは「5箱パック×1」にする） */
export function fmtQtyUnit(qty: number, unit: string): string {
  return /^[0-9０-９]/.test(unit) ? `${unit}×${qty}` : `${qty}${unit}`;
}

/** 「買うもの」をLINEなどに貼れる文章にする */
export function buyListText(h: HomeSummary): string {
  const lines: string[] = ['【買うもの】'];
  if (h.buySupplies.length) {
    lines.push('■ 消耗品');
    for (const { item, qty } of h.buySupplies) lines.push(`・${item.name} ${fmtQtyUnit(qty, item.unit)}`);
  }
  if (h.buyClothes.length) {
    lines.push('■ 服');
    for (const r of h.buyClothes) lines.push(`・${clothingLabel(r)} あと${r.remaining}枚`);
  }
  if (h.buyFood.length) {
    lines.push('■ 備蓄');
    for (const m of h.buyFood) lines.push(`・${m.shortText}`);
  }
  if (lines.length === 1) lines.push('今は買うものはありません');
  return lines.join('\n');
}
