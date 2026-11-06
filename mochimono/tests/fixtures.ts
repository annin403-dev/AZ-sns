import type { AllData, ClothingItem, GrowthLog } from '../shared/tables';

export function baseData(): AllData {
  return {
    members: [
      { id: 1, name: '夫', kind: 'adult', gender: 'male', sort_order: 1 },
      { id: 2, name: 'わたし', kind: 'adult', gender: 'female', sort_order: 2 },
      { id: 3, name: '長子', kind: 'child', gender: 'female', sort_order: 3 },
      { id: 4, name: '次子', kind: 'child', gender: 'male', sort_order: 4 },
      { id: 5, name: '末子', kind: 'child', gender: 'female', sort_order: 5 },
    ],
    growth_logs: [],
    member_sizes: [],
    places: [{ id: 1, room: '洋室B', spot: '引き出し上段', sort_order: 1, archived: 0 }],
    clothing_categories: [
      { key: 'tops', label: 'トップス', sort_order: 1, free: 0 },
      { key: 'onepiece', label: 'ワンピース・セットアップ', sort_order: 3, free: 1 },
      { key: 'shoes', label: '靴', sort_order: 8, free: 0 },
      { key: 'socks', label: '靴下・タイツ', sort_order: 7, free: 0 },
    ],
    clothing_targets: [
      { member_id: 1, category_key: 'tops', target_qty: 6 },
      { member_id: 3, category_key: 'tops', target_qty: 7 },
      { member_id: 4, category_key: 'tops', target_qty: 7 },
      { member_id: 5, category_key: 'tops', target_qty: 7 },
    ],
    clothing_items: [],
    supply_items: [],
    food_items: [],
    food_lots: [],
    settings: [],
    dismissals: [],
  };
}

let nextId = 100;
export function item(p: Partial<ClothingItem>): ClothingItem {
  return {
    id: nextId++, owner_type: 'member', member_id: null, gender: null, reserved_for_member_id: null, category_key: 'tops', kind: 'Tシャツ',
    size_label: null, size_num: null, season: 'all', status: 'wearing', qty: 1, place_id: 1, note: null, ...p,
  };
}
export function log(member_id: number, measured_on: string, height_cm: number | null, foot_cm: number | null = null): GrowthLog {
  return { id: nextId++, member_id, measured_on, height_cm, weight_kg: null, foot_cm, note: null };
}
