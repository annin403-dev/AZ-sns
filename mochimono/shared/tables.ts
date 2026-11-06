import { z } from 'zod';

// サーバーとアプリの両方で使うテーブル定義と入力チェック
const int = z.number().int();
const num = z.number().finite();
const text = (max = 200) => z.string().max(max);
const ym = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, '年月は YYYY-MM の形で入れてください');
const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付は YYYY-MM-DD の形で入れてください');
const bool01 = z.union([z.literal(0), z.literal(1)]);

export const schemas = {
  members: z.object({
    id: int.optional(),
    name: text(30).min(1, '名前を入れてください'),
    kind: z.enum(['adult', 'child']),
    gender: z.enum(['female', 'male']),
    sort_order: int.default(0),
  }),
  growth_logs: z.object({
    id: int.optional(),
    member_id: int,
    measured_on: ymd,
    height_cm: num.positive().max(250).nullable().default(null),
    weight_kg: num.positive().max(300).nullable().default(null),
    foot_cm: num.positive().max(40).nullable().default(null),
    note: text(500).nullable().default(null),
  }),
  member_sizes: z.object({
    member_id: int,
    category_key: text(40),
    size_label: text(20).nullable().default(null),
    size_num: num.nullable().default(null),
    source: z.enum(['auto', 'manual']).default('auto'),
  }),
  places: z.object({
    id: int.optional(),
    room: text(40).min(1, '部屋の名前を入れてください'),
    spot: text(40).min(1, '場所の名前を入れてください'),
    sort_order: int.default(0),
    archived: bool01.default(0),
  }),
  clothing_categories: z.object({
    key: text(40).min(1),
    label: text(40).min(1),
    sort_order: int.default(0),
    free: bool01.default(0),
  }),
  clothing_targets: z.object({
    member_id: int,
    category_key: text(40),
    target_qty: int.min(0).max(999).nullable().default(null),
  }),
  clothing_items: z
    .object({
      id: int.optional(),
      owner_type: z.enum(['member', 'stock']),
      member_id: int.nullable().default(null),
      gender: z.enum(['female', 'male', 'unisex']).nullable().default(null),
      reserved_for_member_id: int.nullable().default(null),
      category_key: text(40),
      kind: text(60).default(''),
      size_label: text(20).nullable().default(null),
      size_num: num.nullable().default(null),
      season: z.enum(['summer', 'winter', 'all']).default('all'),
      status: z.enum(['wearing', 'next', 'stock', 'discard']).default('wearing'),
      qty: int.min(0).max(9999),
      place_id: int.nullable().default(null),
      note: text(500).nullable().default(null),
    })
    .refine((r) => r.owner_type !== 'member' || r.member_id !== null, { message: '持ち主を選んでください' })
    .refine((r) => r.owner_type !== 'stock' || r.gender !== null, { message: 'お下がり在庫は性別（女児・男児・兼用）を選んでください' }),
  supply_items: z.object({
    id: int.optional(),
    category: text(40).min(1),
    name: text(80).min(1, '品名を入れてください'),
    owner_member_id: int.nullable().default(null),
    unit: text(20).default('個'),
    qty_unopened: int.min(0).max(99999),
    reorder_at: int.min(0).max(99999).default(0),
    refill_to: int.min(0).max(99999).default(1),
    auto_target: z.enum(['toilet']).nullable().default(null),
    place_id: int.nullable().default(null),
    is_disaster: bool01.default(0),
    expires_on: ym.nullable().default(null),
    note: text(500).nullable().default(null),
  }),
  food_items: z.object({
    id: int.optional(),
    group_key: z.enum(['water', 'rice', 'pasta', 'retort', 'canned', 'soup', 'snack', 'other']),
    name: text(80).min(1, '品名を入れてください'),
    unit: text(20).default('個'),
    meals_per_unit: num.min(0).max(1000).nullable().default(null),
    liters_per_unit: num.min(0).max(1000).nullable().default(null),
    kg_per_unit: num.min(0).max(1000).nullable().default(null),
    default_place_id: int.nullable().default(null),
    note: text(500).nullable().default(null),
  }),
  food_lots: z.object({
    id: int.optional(),
    food_item_id: int,
    best_before: ym.nullable().default(null),
    qty: num.min(0).max(99999),
    place_id: int.nullable().default(null),
  }),
  settings: z.object({ key: text(60).min(1), value: z.string().max(2000) }),
  dismissals: z.object({ key: text(300).min(1) }),
} as const;

export type TableName = keyof typeof schemas;
export const tableNames = Object.keys(schemas) as TableName[];

/** 主キー（id 自動採番のテーブルは ['id']） */
export const primaryKeys: Record<TableName, string[]> = {
  members: ['id'],
  growth_logs: ['id'],
  member_sizes: ['member_id', 'category_key'],
  places: ['id'],
  clothing_categories: ['key'],
  clothing_targets: ['member_id', 'category_key'],
  clothing_items: ['id'],
  supply_items: ['id'],
  food_items: ['id'],
  food_lots: ['id'],
  settings: ['key'],
  dismissals: ['key'],
};

/** updated_at を自動で入れるテーブル */
export const touchUpdated: TableName[] = ['members', 'member_sizes', 'clothing_items', 'supply_items'];

// ---- 型 ----
export type Member = { id: number; name: string; kind: 'adult' | 'child'; gender: 'female' | 'male'; sort_order: number };
export type GrowthLog = { id: number; member_id: number; measured_on: string; height_cm: number | null; weight_kg: number | null; foot_cm: number | null; note: string | null };
export type MemberSize = { member_id: number; category_key: string; size_label: string | null; size_num: number | null; source: 'auto' | 'manual'; updated_at?: string };
export type Place = { id: number; room: string; spot: string; sort_order: number; archived: 0 | 1 };
export type ClothingCategory = { key: string; label: string; sort_order: number; free: 0 | 1 };
export type ClothingTarget = { member_id: number; category_key: string; target_qty: number | null };
export type Season = 'summer' | 'winter' | 'all';
export type ClothingStatus = 'wearing' | 'next' | 'stock' | 'discard';
export type ClothingItem = {
  id: number; owner_type: 'member' | 'stock'; member_id: number | null; gender: 'female' | 'male' | 'unisex' | null;
  reserved_for_member_id: number | null; category_key: string; kind: string; size_label: string | null; size_num: number | null;
  season: Season; status: ClothingStatus; qty: number; place_id: number | null; note: string | null; created_at?: string; updated_at?: string;
};
export type SupplyItem = {
  id: number; category: string; name: string; owner_member_id: number | null; unit: string; qty_unopened: number; reorder_at: number;
  refill_to: number; auto_target: 'toilet' | null; place_id: number | null; is_disaster: 0 | 1; expires_on: string | null; note: string | null; updated_at?: string;
};
export type FoodGroup = 'water' | 'rice' | 'pasta' | 'retort' | 'canned' | 'soup' | 'snack' | 'other';
export type FoodItem = { id: number; group_key: FoodGroup; name: string; unit: string; meals_per_unit: number | null; liters_per_unit: number | null; kg_per_unit: number | null; default_place_id: number | null; note: string | null };
export type FoodLot = { id: number; food_item_id: number; best_before: string | null; qty: number; place_id: number | null; created_at?: string };
export type Dismissal = { key: string; dismissed_at?: string };
export type SettingRow = { key: string; value: string };

export type AllData = {
  members: Member[]; growth_logs: GrowthLog[]; member_sizes: MemberSize[]; places: Place[]; clothing_categories: ClothingCategory[];
  clothing_targets: ClothingTarget[]; clothing_items: ClothingItem[]; supply_items: SupplyItem[]; food_items: FoodItem[]; food_lots: FoodLot[];
  settings: SettingRow[]; dismissals: Dismissal[];
};

export type BatchOp =
  | { table: TableName; op: 'insert'; row: Record<string, unknown> }
  | { table: TableName; op: 'upsert'; row: Record<string, unknown> }
  | { table: TableName; op: 'delete'; key: Record<string, unknown> };
