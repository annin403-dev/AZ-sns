import { schemas, type AllData, type BatchOp, type TableName } from '../shared/tables';
import { foodGroupLabel, genderLabel, statusLabel } from './labels';

/** CSV を読む（ダブルクォート・改行入りにも対応） */
export function parseCsv(text: string): string[][] {
  const s = text.replace(/^﻿/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let q = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (q) {
      if (ch === '"') {
        if (s[i + 1] === '"') { cell += '"'; i++; } else q = false;
      } else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

export function toCsv(rows: (string | number | null | undefined)[][]): string {
  const esc = (v: string | number | null | undefined) => {
    const t = v == null ? '' : String(v);
    return /[",\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  return '﻿' + rows.map((r) => r.map(esc).join(',')).join('\r\n') + '\r\n';
}

type Col = { h: string; out: (r: Record<string, unknown>, d: AllData) => string | number | null; in?: (v: string, d: AllData) => unknown; key?: string };
type Def = { label: string; table: TableName; cols: Col[]; rows: (d: AllData) => Record<string, unknown>[] };

const invert = (m: Record<string, string>) => Object.fromEntries(Object.entries(m).map(([k, v]) => [v, k]));
const placeStr = (d: AllData, id: unknown) => {
  const p = d.places.find((x) => x.id === id);
  return p ? `${p.room}/${p.spot}` : '';
};
const placeIn = (v: string, d: AllData) => {
  if (!v.trim()) return null;
  const [room, ...rest] = v.split(/[/／]/);
  const spot = rest.join('/');
  const p = d.places.find((x) => x.room === room.trim() && x.spot === spot.trim());
  if (!p) throw new Error(`置き場所「${v}」が見つかりません`);
  return p.id;
};
const memberStr = (d: AllData, id: unknown) => d.members.find((m) => m.id === id)?.name ?? '';
const memberIn = (v: string, d: AllData) => {
  if (!v.trim()) return null;
  const m = d.members.find((x) => x.name === v.trim());
  if (!m) throw new Error(`家族「${v}」が見つかりません`);
  return m.id;
};
const catIn = (v: string, d: AllData) => {
  const c = d.clothing_categories.find((x) => x.label === v.trim() || x.key === v.trim());
  if (!c) throw new Error(`区分「${v}」が見つかりません`);
  return c.key;
};
const numIn = (v: string) => (v.trim() === '' ? null : Number(v));
const intIn = (v: string) => (v.trim() === '' ? 0 : Math.floor(Number(v)));
const strIn = (v: string) => (v.trim() === '' ? null : v.trim());
const mapIn = (m: Record<string, string>, name: string) => (v: string) => {
  if (!v.trim()) return null;
  const inv = invert(m);
  if (inv[v.trim()]) return inv[v.trim()];
  if (m[v.trim()]) return v.trim();
  throw new Error(`${name}「${v}」がわかりません`);
};
const seasonMap = { summer: '夏', winter: '冬', all: '通年' };
const ownerMap = { member: '家族', stock: 'お下がり在庫' };
const kindMap = { adult: '大人', child: '子ども' };
const mgMap = { female: '女', male: '男' };
const yn = (v: string) => (['1', 'はい', 'true', '○', '◯'].includes(v.trim()) ? 1 : 0);

const id: Col = { h: 'id', key: 'id', out: (r) => r.id as number, in: (v) => (v.trim() ? Number(v) : undefined) };

export const csvDefs: Def[] = [
  {
    label: '衣類', table: 'clothing_items', rows: (d) => d.clothing_items,
    cols: [
      id,
      { h: '持ち主の種類', key: 'owner_type', out: (r) => ownerMap[r.owner_type as 'member'], in: mapIn(ownerMap, '持ち主の種類') },
      { h: '持ち主', key: 'member_id', out: (r, d) => memberStr(d, r.member_id), in: memberIn },
      { h: '性別', key: 'gender', out: (r) => (r.gender ? genderLabel[r.gender as 'female'] : ''), in: mapIn(genderLabel, '性別') },
      { h: '誰用に固定', key: 'reserved_for_member_id', out: (r, d) => memberStr(d, r.reserved_for_member_id), in: memberIn },
      { h: '区分', key: 'category_key', out: (r, d) => d.clothing_categories.find((c) => c.key === r.category_key)?.label ?? String(r.category_key), in: catIn },
      { h: '種類', key: 'kind', out: (r) => r.kind as string, in: (v) => v.trim() },
      { h: 'サイズ', key: 'size_label', out: (r) => r.size_label as string, in: strIn },
      { h: '季節', key: 'season', out: (r) => seasonMap[r.season as 'all'], in: mapIn(seasonMap, '季節') },
      { h: '状態', key: 'status', out: (r) => statusLabel[r.status as 'wearing'], in: mapIn(statusLabel, '状態') },
      { h: '数', key: 'qty', out: (r) => r.qty as number, in: intIn },
      { h: '置き場所', key: 'place_id', out: (r, d) => placeStr(d, r.place_id), in: placeIn },
      { h: 'メモ', key: 'note', out: (r) => r.note as string, in: strIn },
    ],
  },
  {
    label: '消耗品', table: 'supply_items', rows: (d) => d.supply_items,
    cols: [
      id,
      { h: '分類', key: 'category', out: (r) => r.category as string, in: (v) => v.trim() },
      { h: '品名', key: 'name', out: (r) => r.name as string, in: (v) => v.trim() },
      { h: '持ち主', key: 'owner_member_id', out: (r, d) => memberStr(d, r.owner_member_id), in: memberIn },
      { h: '単位', key: 'unit', out: (r) => r.unit as string, in: (v) => v.trim() || '個' },
      { h: '未開封の数', key: 'qty_unopened', out: (r) => r.qty_unopened as number, in: intIn },
      { h: 'この数以下で買う', key: 'reorder_at', out: (r) => r.reorder_at as number, in: intIn },
      { h: '買うときはこの数まで', key: 'refill_to', out: (r) => r.refill_to as number, in: intIn },
      { h: '自動計算', key: 'auto_target', out: (r) => (r.auto_target as string) ?? '', in: (v) => (v.trim() === 'toilet' ? 'toilet' : null) },
      { h: '置き場所', key: 'place_id', out: (r, d) => placeStr(d, r.place_id), in: placeIn },
      { h: '防災', key: 'is_disaster', out: (r) => (r.is_disaster ? 'はい' : ''), in: yn },
      { h: '使用期限', key: 'expires_on', out: (r) => r.expires_on as string, in: strIn },
      { h: 'メモ', key: 'note', out: (r) => r.note as string, in: strIn },
    ],
  },
  {
    label: '食品の品目', table: 'food_items', rows: (d) => d.food_items,
    cols: [
      id,
      { h: 'グループ', key: 'group_key', out: (r) => foodGroupLabel[r.group_key as 'water'], in: mapIn(foodGroupLabel, 'グループ') },
      { h: '品名', key: 'name', out: (r) => r.name as string, in: (v) => v.trim() },
      { h: '単位', key: 'unit', out: (r) => r.unit as string, in: (v) => v.trim() || '個' },
      { h: '何人前', key: 'meals_per_unit', out: (r) => r.meals_per_unit as number, in: numIn },
      { h: 'L', key: 'liters_per_unit', out: (r) => r.liters_per_unit as number, in: numIn },
      { h: 'kg', key: 'kg_per_unit', out: (r) => r.kg_per_unit as number, in: numIn },
      { h: 'いつもの置き場所', key: 'default_place_id', out: (r, d) => placeStr(d, r.default_place_id), in: placeIn },
      { h: 'メモ', key: 'note', out: (r) => r.note as string, in: strIn },
    ],
  },
  {
    label: '食品の期限ごとの数', table: 'food_lots', rows: (d) => d.food_lots,
    cols: [
      id,
      { h: '品名', key: 'food_item_id', out: (r, d) => d.food_items.find((i) => i.id === r.food_item_id)?.name ?? '', in: (v, d) => { const i = d.food_items.find((x) => x.name === v.trim()); if (!i) throw new Error(`品名「${v}」が見つかりません`); return i.id; } },
      { h: '賞味期限', key: 'best_before', out: (r) => r.best_before as string, in: strIn },
      { h: '数', key: 'qty', out: (r) => r.qty as number, in: (v) => Number(v) || 0 },
      { h: '置き場所', key: 'place_id', out: (r, d) => placeStr(d, r.place_id), in: placeIn },
    ],
  },
  {
    label: '家族', table: 'members', rows: (d) => d.members,
    cols: [
      id,
      { h: '名前', key: 'name', out: (r) => r.name as string, in: (v) => v.trim() },
      { h: '大人・子ども', key: 'kind', out: (r) => kindMap[r.kind as 'adult'], in: mapIn(kindMap, '大人・子ども') },
      { h: '性別', key: 'gender', out: (r) => mgMap[r.gender as 'male'], in: mapIn(mgMap, '性別') },
      { h: '並び順', key: 'sort_order', out: (r) => r.sort_order as number, in: intIn },
    ],
  },
  {
    label: '成長の記録', table: 'growth_logs', rows: (d) => d.growth_logs,
    cols: [
      id,
      { h: '名前', key: 'member_id', out: (r, d) => memberStr(d, r.member_id), in: (v, d) => { const m = memberIn(v, d); if (m == null) throw new Error('名前を入れてください'); return m; } },
      { h: '測った日', key: 'measured_on', out: (r) => r.measured_on as string, in: (v) => v.trim().replace(/\//g, '-') },
      { h: '身長', key: 'height_cm', out: (r) => r.height_cm as number, in: numIn },
      { h: '体重', key: 'weight_kg', out: (r) => r.weight_kg as number, in: numIn },
      { h: '足', key: 'foot_cm', out: (r) => r.foot_cm as number, in: numIn },
      { h: 'メモ', key: 'note', out: (r) => r.note as string, in: strIn },
    ],
  },
  {
    label: '置き場所', table: 'places', rows: (d) => d.places,
    cols: [
      id,
      { h: '部屋', key: 'room', out: (r) => r.room as string, in: (v) => v.trim() },
      { h: '細かい場所', key: 'spot', out: (r) => r.spot as string, in: (v) => v.trim() },
      { h: '並び順', key: 'sort_order', out: (r) => r.sort_order as number, in: intIn },
      { h: '隠す', key: 'archived', out: (r) => (r.archived ? 'はい' : ''), in: yn },
    ],
  },
  {
    label: '服の目安数', table: 'clothing_targets', rows: (d) => d.clothing_targets,
    cols: [
      { h: '名前', key: 'member_id', out: (r, d) => memberStr(d, r.member_id), in: (v, d) => { const m = memberIn(v, d); if (m == null) throw new Error('名前を入れてください'); return m; } },
      { h: '区分', key: 'category_key', out: (r, d) => d.clothing_categories.find((c) => c.key === r.category_key)?.label ?? String(r.category_key), in: catIn },
      { h: '目安の数', key: 'target_qty', out: (r) => r.target_qty as number, in: numIn },
    ],
  },
];

export function exportCsv(def: Def, data: AllData): string {
  return toCsv([def.cols.map((c) => c.h), ...def.rows(data).map((r) => def.cols.map((c) => c.out(r, data)))]);
}

export type ImportPreview = { adds: number; updates: number; errors: string[]; ops: BatchOp[] };

export function previewImport(def: Def, data: AllData, text: string): ImportPreview {
  const rows = parseCsv(text);
  const res: ImportPreview = { adds: 0, updates: 0, errors: [], ops: [] };
  if (rows.length === 0) {
    res.errors.push('中身が空です');
    return res;
  }
  const header = rows[0].map((h) => h.trim());
  const idx = def.cols.map((c) => header.indexOf(c.h));
  const missing = def.cols.filter((c, i) => idx[i] < 0 && c.h !== 'id').map((c) => c.h);
  if (missing.length) {
    res.errors.push(`見出しが足りません：${missing.join('、')}`);
    return res;
  }
  const existing = def.rows(data);
  rows.slice(1).forEach((cells, n) => {
    const line = n + 2;
    try {
      const row: Record<string, unknown> = {};
      def.cols.forEach((c, i) => {
        if (idx[i] < 0 || !c.in || !c.key) return;
        const v = c.in(cells[idx[i]] ?? '', data);
        if (v !== undefined) row[c.key] = v;
      });
      if (def.table === 'clothing_items') {
        const lbl = (row.size_label as string | null) ?? '';
        row.size_num = lbl.trim() !== '' && !Number.isNaN(Number(lbl)) ? Number(lbl) : null;
      }
      let isUpdate: boolean;
      if (def.table === 'clothing_targets') {
        isUpdate = existing.some((e) => e.member_id === row.member_id && e.category_key === row.category_key);
      } else {
        if (row.id != null) {
          const old = existing.find((e) => e.id === row.id);
          if (!old) throw new Error(`id ${row.id} が見つかりません（新しく追加するときは id を空に）`);
          isUpdate = true;
        } else isUpdate = false;
      }
      const r = schemas[def.table].safeParse(row);
      if (!r.success) throw new Error(r.error.issues.map((x) => x.message).join('、'));
      res.ops.push({ table: def.table, op: isUpdate ? 'upsert' : 'insert', row: r.data as Record<string, unknown> });
      if (isUpdate) res.updates++;
      else res.adds++;
    } catch (e) {
      res.errors.push(`${line}行目：${(e as Error).message}`);
    }
  });
  return res;
}

export function download(name: string, content: string, type = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
