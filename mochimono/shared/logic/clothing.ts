import type { AllData, ClothingCategory, ClothingItem, Member } from '../tables';
import { currentSeason, inSeason } from './season';
import type { Settings } from './settings';
import {
  FOOT_CATS, HEIGHT_CATS, growthPerYear, isSizeTracked, latestValue, monthsToWearShoe, monthsToWearSize, shoeSizeFromFoot, suggestSize,
} from './sizes';

export type Ctx = { data: AllData; settings: Settings; todayYmd: string; month: number };

export function seasonOf(ctx: Ctx) {
  return currentSeason(ctx.month, ctx.settings.summer_months);
}

/** その子の、ある区分の今のサイズ（数値）。登録がなければ身長・足から出す。わからなければ null */
export function memberSizeNum(ctx: Ctx, memberId: number, cat: string): number | null {
  const row = ctx.data.member_sizes.find((s) => s.member_id === memberId && s.category_key === cat);
  if (row && row.size_num != null) return row.size_num;
  const logs = ctx.data.growth_logs.filter((l) => l.member_id === memberId);
  if (HEIGHT_CATS.includes(cat)) {
    const h = latestValue(logs, 'height_cm');
    return h ? suggestSize(h.value) : null;
  }
  if (FOOT_CATS.includes(cat)) {
    const f = latestValue(logs, 'foot_cm');
    return f ? shoeSizeFromFoot(f.value) : null;
  }
  return null;
}

export function genderMatches(kid: Member, itemGender: ClothingItem['gender']): boolean {
  return itemGender === 'unisex' || itemGender === kid.gender;
}

/** 子どもは今のサイズと同じ行だけ数える（サイズを決めていない区分・サイズ不明なら全部） */
export function sizeMatches(ctx: Ctx, member: Member, item: ClothingItem): boolean {
  if (member.kind !== 'child' || !isSizeTracked(item.category_key)) return true;
  const cur = memberSizeNum(ctx, member.id, item.category_key);
  if (cur == null) return true;
  return item.size_num === cur;
}

export type Cover = { item: ClothingItem; use: number };
export type ClothingRow = {
  member: Member;
  category: ClothingCategory;
  target: number;
  wearing: number;
  sizeNum: number | null;
  shortage: number;
  over: number;
  fromNext: Cover[];
  fromStock: Cover[];
  remaining: number;
};

/** 7-4 服の不足と「買わなくてOK」（人×区分ごと）。お下がり在庫は家族の並び順に早い者勝ちで割り当てる */
export function clothingStatus(ctx: Ctx): ClothingRow[] {
  const season = seasonOf(ctx);
  const items = ctx.data.clothing_items;
  const stockLeft = new Map<number, number>();
  for (const it of items) if (it.owner_type === 'stock' && it.status === 'stock') stockLeft.set(it.id, it.qty);

  const members = [...ctx.data.members].sort((a, b) => a.sort_order - b.sort_order);
  const cats = [...ctx.data.clothing_categories].sort((a, b) => a.sort_order - b.sort_order);
  const out: ClothingRow[] = [];
  for (const m of members) {
    for (const cat of cats) {
      if (cat.free) continue;
      const t = ctx.data.clothing_targets.find((x) => x.member_id === m.id && x.category_key === cat.key);
      if (!t || t.target_qty == null) continue;
      const sizeNum = m.kind === 'child' && isSizeTracked(cat.key) ? memberSizeNum(ctx, m.id, cat.key) : null;
      const sameSize = (it: ClothingItem) => (sizeNum == null ? true : it.size_num === sizeNum);
      const wearing = items
        .filter((it) => it.owner_type === 'member' && it.member_id === m.id && it.category_key === cat.key && it.status === 'wearing' && inSeason(it.season, season) && sizeMatches(ctx, m, it))
        .reduce((s, it) => s + it.qty, 0);
      const shortage = Math.max(0, t.target_qty - wearing);
      const over = Math.max(0, wearing - t.target_qty);
      const fromNext: Cover[] = [];
      const fromStock: Cover[] = [];
      let need = shortage;
      if (need > 0) {
        // 1. その人の来年用（今のサイズ）
        for (const it of items) {
          if (need <= 0) break;
          if (it.owner_type === 'member' && it.member_id === m.id && it.category_key === cat.key && it.status === 'next' && inSeason(it.season, season) && sameSize(it) && it.qty > 0) {
            const use = Math.min(need, it.qty);
            fromNext.push({ item: it, use });
            need -= use;
          }
        }
        // 2. お下がり在庫（子どもだけ）
        if (m.kind === 'child') {
          for (const it of items) {
            if (need <= 0) break;
            if (it.owner_type !== 'stock' || it.status !== 'stock' || it.category_key !== cat.key) continue;
            if (!genderMatches(m, it.gender) || !inSeason(it.season, season)) continue;
            if (it.reserved_for_member_id != null && it.reserved_for_member_id !== m.id) continue;
            if (isSizeTracked(cat.key) && (sizeNum == null || it.size_num !== sizeNum)) continue;
            const left = stockLeft.get(it.id) ?? 0;
            if (left <= 0) continue;
            const use = Math.min(need, left);
            stockLeft.set(it.id, left - use);
            fromStock.push({ item: it, use });
            need -= use;
          }
        }
      }
      out.push({ member: m, category: cat, target: t.target_qty, wearing, sizeNum, shortage, over, fromNext, fromStock, remaining: need });
    }
  }
  return out;
}

export type StockVerdict = {
  item: ClothingItem;
  kind: 'now' | 'later' | 'none' | 'unknown';
  assignee: Member | null;
  months: number | null;
  tooLong: boolean;
};

/** 7-5 お下がり在庫の行の判定。overrideGender などで「仮のお下がり」を判定することもできる */
export function judgeStock(ctx: Ctx, item: ClothingItem): StockVerdict {
  const kids = ctx.data.members.filter((m) => m.kind === 'child').sort((a, b) => a.sort_order - b.sort_order);
  let cands = kids.filter((k) => genderMatches(k, item.gender ?? 'unisex'));
  if (item.reserved_for_member_id != null) cands = cands.filter((k) => k.id === item.reserved_for_member_id);
  const tracked = isSizeTracked(item.category_key);
  if (tracked && item.size_num == null) return { item, kind: 'unknown', assignee: cands[0] ?? null, months: null, tooLong: false };

  let best: { kid: Member; months: number | null } | null = null;
  const rank = (x: number | null) => (x == null ? Number.POSITIVE_INFINITY : x);
  for (const kid of cands) {
    let months: number | null = 0;
    if (tracked) {
      const cur = memberSizeNum(ctx, kid.id, item.category_key);
      if (cur == null || cur > (item.size_num as number)) continue;
      if (cur !== item.size_num) {
        const logs = ctx.data.growth_logs.filter((l) => l.member_id === kid.id);
        if (FOOT_CATS.includes(item.category_key)) {
          const f = latestValue(logs, 'foot_cm');
          const rate = growthPerYear(logs, 'foot_cm', ctx.todayYmd, null);
          months = f ? monthsToWearShoe(f.value, item.size_num as number, rate) : null;
        } else {
          const h = latestValue(logs, 'height_cm');
          const rate = growthPerYear(logs, 'height_cm', ctx.todayYmd, ctx.settings.default_growth_cm_per_year);
          months = h ? monthsToWearSize(h.value, item.size_num as number, rate) : null;
        }
        // サイズが大きいのに 0 か月（身長はもう届いている）なら、ごく近いうち
      }
    }
    if (!best || rank(months) < rank(best.months)) best = { kid, months };
  }
  if (!best) return { item, kind: 'none', assignee: null, months: null, tooLong: false };
  const isNow = tracked ? memberSizeNum(ctx, best.kid.id, item.category_key) === item.size_num : true;
  const tooLong = best.months != null && best.months > ctx.settings.keep_limit_months;
  return { item, kind: isNow ? 'now' : best.months == null ? 'unknown' : 'later', assignee: best.kid, months: best.months, tooLong };
}

export function judgeAllStock(ctx: Ctx): StockVerdict[] {
  return ctx.data.clothing_items.filter((it) => it.owner_type === 'stock' && it.status === 'stock').map((it) => judgeStock(ctx, it));
}

export type SizeUp = {
  member: Member;
  category: ClothingCategory;
  sizeNum: number;
  oldItems: { item: ClothingItem; verdict: StockVerdict }[];
  newNext: ClothingItem[];
  newStock: ClothingItem[];
};

/** 7-6 サイズが上がった子（前のサイズで「着ている」の服が残っている区分） */
export function sizeUps(ctx: Ctx): SizeUp[] {
  const out: SizeUp[] = [];
  const kids = ctx.data.members.filter((m) => m.kind === 'child').sort((a, b) => a.sort_order - b.sort_order);
  for (const kid of kids) {
    for (const cat of [...ctx.data.clothing_categories].sort((a, b) => a.sort_order - b.sort_order)) {
      if (!isSizeTracked(cat.key)) continue;
      const cur = memberSizeNum(ctx, kid.id, cat.key);
      if (cur == null) continue;
      const old = ctx.data.clothing_items.filter(
        (it) => it.owner_type === 'member' && it.member_id === kid.id && it.category_key === cat.key && it.status === 'wearing' && it.size_num != null && it.size_num < cur && it.qty > 0,
      );
      if (old.length === 0) continue;
      const newNext = ctx.data.clothing_items.filter(
        (it) => it.owner_type === 'member' && it.member_id === kid.id && it.category_key === cat.key && it.status === 'next' && it.size_num === cur && it.qty > 0,
      );
      const newStock = ctx.data.clothing_items.filter(
        (it) => it.owner_type === 'stock' && it.status === 'stock' && it.category_key === cat.key && it.size_num === cur && genderMatches(kid, it.gender) &&
          (it.reserved_for_member_id == null || it.reserved_for_member_id === kid.id) && it.qty > 0,
      );
      const oldItems = old.map((item) => ({
        item,
        verdict: judgeStock(ctx, { ...item, owner_type: 'stock', member_id: null, status: 'stock', gender: kid.gender, reserved_for_member_id: null }),
      }));
      out.push({ member: kid, category: cat, sizeNum: cur, oldItems, newNext, newStock });
    }
  }
  return out;
}

export type RowChange =
  | { kind: 'update'; row: ClothingItem }
  | { kind: 'insert'; row: Omit<ClothingItem, 'id'> }
  | { kind: 'delete'; id: number };

function sameGroup(a: Omit<ClothingItem, 'id'>, b: ClothingItem) {
  return a.owner_type === b.owner_type && a.member_id === b.member_id && a.gender === b.gender && a.reserved_for_member_id === b.reserved_for_member_id &&
    a.category_key === b.category_key && a.kind === b.kind && a.size_num === b.size_num && a.size_label === b.size_label &&
    a.season === b.season && a.status === b.status && a.place_id === b.place_id;
}

/**
 * 行の一部（qty枚）を、別の持ち主・状態へ移す。
 * 同じまとまりの行がもうあれば、そこへ足す。全部移すなら元の行を書き換える（または消す）。
 */
export function splitMove(items: ClothingItem[], src: ClothingItem, qty: number, to: Partial<ClothingItem>): RowChange[] {
  const n = Math.max(0, Math.min(qty, src.qty));
  if (n === 0) return [];
  const { id: _id, created_at: _c, updated_at: _u, ...base } = src;
  void _id; void _c; void _u;
  const moved: Omit<ClothingItem, 'id'> = { ...base, ...to, qty: n };
  if (moved.owner_type === 'member') moved.gender = null;
  if (moved.owner_type === 'member') moved.reserved_for_member_id = null;
  if (moved.owner_type === 'stock') moved.member_id = null;
  const target = items.find((it) => it.id !== src.id && sameGroup(moved, it));
  const changes: RowChange[] = [];
  if (target) {
    changes.push({ kind: 'update', row: { ...target, qty: target.qty + n } });
    if (n === src.qty) changes.push({ kind: 'delete', id: src.id });
    else changes.push({ kind: 'update', row: { ...src, qty: src.qty - n } });
  } else if (n === src.qty) {
    changes.push({ kind: 'update', row: { ...src, ...moved, qty: n } as ClothingItem });
  } else {
    changes.push({ kind: 'update', row: { ...src, qty: src.qty - n } });
    changes.push({ kind: 'insert', row: moved });
  }
  return changes;
}
