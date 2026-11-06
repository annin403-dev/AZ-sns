import type { AllData, ClothingItem, ClothingStatus, FoodGroup, Place } from '../shared/tables';

export const statusLabel: Record<ClothingStatus, string> = { wearing: '着ている', next: '来年用', stock: 'お下がり在庫', discard: '手放す予定' };
export const genderLabel = { female: '女児', male: '男児', unisex: '兼用' } as const;
export const memberGenderLabel = { female: '女性・女の子', male: '男性・男の子' } as const;
export const foodGroupLabel: Record<FoodGroup, string> = {
  water: '水', rice: '米', pasta: 'パスタ・麺・パックご飯', retort: 'レトルト', canned: '缶詰', soup: '汁物・副菜', snack: 'おやつ・飲み物', other: 'その他',
};
export const foodGroups = Object.keys(foodGroupLabel) as FoodGroup[];

export const kindSuggestions: Record<string, string[]> = {
  tops: ['Tシャツ', '長袖Tシャツ', 'トレーナー', 'パーカー', 'シャツ', 'ニット', 'ブラウス', 'タンクトップ'],
  bottoms: ['ズボン', '長ズボン', '半ズボン', 'スカート', 'レギンス', 'デニム'],
  onepiece: ['ワンピース', 'セットアップ', 'ジャンパースカート'],
  outer: ['ダウン', 'ジャンパー', 'コート', 'ウインドブレーカー', 'カーディガン', 'ベスト'],
  pajama: ['パジャマ', '部屋着'],
  underwear: ['パンツ', 'ショーツ', '肌着', 'キャミソール', 'ブラ'],
  socks: ['靴下', 'タイツ', 'レギンス'],
  shoes: ['スニーカー', '上履き', '長靴', 'サンダル', '革靴'],
  school: ['体操服', '制服', 'スモック', '帽子'],
  accessories: ['帽子', '手袋', 'マフラー', 'バッグ', 'ベルト'],
  formal: ['フォーマル', 'スーツ', 'ワンピース'],
  work: ['ブラウス', 'パンツ', 'ジャケット'],
};

export function placeName(places: Place[], id: number | null | undefined): string {
  if (id == null) return '場所未設定';
  const p = places.find((x) => x.id === id);
  return p ? `${p.room}／${p.spot}` : '場所未設定';
}

export function memberName(data: AllData, id: number | null | undefined): string {
  if (id == null) return '家族共有';
  return data.members.find((m) => m.id === id)?.name ?? '（不明）';
}

export function categoryLabel(data: AllData, key: string): string {
  return data.clothing_categories.find((c) => c.key === key)?.label ?? key;
}

export function ownerLabel(data: AllData, it: ClothingItem): string {
  if (it.owner_type === 'stock') {
    const g = it.gender ? genderLabel[it.gender] : '';
    const r = it.reserved_for_member_id ? `・${memberName(data, it.reserved_for_member_id)}用` : '';
    return `お下がり在庫（${g}${r}）`;
  }
  return memberName(data, it.member_id);
}

export function sortedPlaces(places: Place[], includeArchived = false): Place[] {
  return places.filter((p) => includeArchived || !p.archived).sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
}
export function sortedMembers(data: AllData) {
  return [...data.members].sort((a, b) => a.sort_order - b.sort_order);
}
export function sortedCats(data: AllData) {
  return [...data.clothing_categories].sort((a, b) => a.sort_order - b.sort_order);
}

export function fmtNum(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10);
}

export function fmtYm(ym: string | null): string {
  if (!ym) return '期限なし';
  const [y, m] = ym.split('-');
  return `${y}年${Number(m)}月`;
}

/** 前回使った持ち主・置き場所・サイズを覚えておく（この端末だけ） */
export const lastUsed = {
  get(): Record<string, unknown> {
    try {
      return JSON.parse(localStorage.getItem('mochimono:last') ?? '{}');
    } catch {
      return {};
    }
  },
  set(v: Record<string, unknown>) {
    try {
      localStorage.setItem('mochimono:last', JSON.stringify({ ...lastUsed.get(), ...v }));
    } catch {
      /* 保存できなくても動く */
    }
  },
};
