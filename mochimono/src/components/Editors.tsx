import { useMemo, useState } from 'react';
import { useData, useStore } from '../store';
import { Button, Field, inputCls, Sheet, cx } from '../ui';
import { foodGroupLabel, foodGroups, genderLabel, kindSuggestions, lastUsed, sortedCats, sortedMembers, sortedPlaces, statusLabel } from '../labels';
import type { ClothingItem, FoodItem, FoodLot, SupplyItem } from '../../shared/tables';
import { isSizeTracked } from '../../shared/logic/sizes';
import { memberSizeNum } from '../../shared/logic/clothing';
import { makeCtx } from '../../shared/logic/home';

export function PlaceSelect({ value, onChange, allowEmpty = true }: { value: number | null; onChange: (v: number | null) => void; allowEmpty?: boolean }) {
  const data = useData();
  const places = sortedPlaces(data.places);
  const rooms = [...new Set(places.map((p) => p.room))];
  return (
    <select className={inputCls} value={value ?? ''} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}>
      {allowEmpty && <option value="">場所未設定</option>}
      {rooms.map((r) => (
        <optgroup key={r} label={r}>
          {places.filter((p) => p.room === r).map((p) => (
            <option key={p.id} value={p.id}>{p.room}／{p.spot}</option>
          ))}
        </optgroup>
      ))}
      {value != null && !places.some((p) => p.id === value) && <option value={value}>（隠した場所）</option>}
    </select>
  );
}

const CHILD_SIZES = [80, 90, 95, 100, 110, 120, 130, 140, 150, 160];
const toNum = (s: string) => (s.trim() !== '' && !Number.isNaN(Number(s)) ? Number(s) : null);

function ConfirmDelete({ onDelete, label = '削除' }: { onDelete: () => void; label?: string }) {
  const [ask, setAsk] = useState(false);
  return ask ? (
    <div className="flex gap-2">
      <Button variant="danger" onClick={onDelete}>本当に{label}</Button>
      <Button onClick={() => setAsk(false)}>やめる</Button>
    </div>
  ) : (
    <Button variant="danger" onClick={() => setAsk(true)}>{label}</Button>
  );
}

// ───────── 衣類 ─────────
export function ClothingEditor({ item, onClose, preset }: { item: ClothingItem | null; onClose: () => void; preset?: Partial<ClothingItem> }) {
  const data = useData();
  const { commit } = useStore();
  const last = lastUsed.get();
  const [f, setF] = useState<Omit<ClothingItem, 'id'> & { id?: number }>(() =>
    item ?? {
      owner_type: (last.owner_type as 'member' | 'stock') ?? 'member',
      member_id: (last.member_id as number) ?? sortedMembers(data)[0]?.id ?? null,
      gender: (last.gender as ClothingItem['gender']) ?? null,
      reserved_for_member_id: null,
      category_key: (last.category_key as string) ?? 'tops',
      kind: '',
      size_label: (last.size_label as string) ?? null,
      size_num: (last.size_num as number) ?? null,
      season: 'all',
      status: 'wearing',
      qty: 1,
      place_id: (last.place_id as number) ?? null,
      note: null,
      ...preset,
    },
  );
  const set = (p: Partial<ClothingItem>) => setF((x) => ({ ...x, ...p }));
  const member = data.members.find((m) => m.id === f.member_id);
  const isChildish = f.owner_type === 'stock' || member?.kind === 'child';
  const tracked = isSizeTracked(f.category_key);
  const kids = sortedMembers(data).filter((m) => m.kind === 'child');

  const kindOptions = useMemo(() => {
    const past = data.clothing_items.filter((i) => i.category_key === f.category_key).map((i) => i.kind);
    return [...new Set([...past, ...(kindSuggestions[f.category_key] ?? [])])].filter(Boolean);
  }, [data.clothing_items, f.category_key]);

  const currentSize = member?.kind === 'child' && tracked ? memberSizeNum(makeCtx(data, '2000-01-01'), member.id, f.category_key) : null;

  const save = async () => {
    const row = { ...f, kind: f.kind.trim() };
    if (row.owner_type === 'stock') row.member_id = null;
    if (row.owner_type === 'member') {
      row.gender = null;
      row.reserved_for_member_id = null;
      if (row.status === 'stock') row.status = 'wearing';
    } else row.status = row.status === 'discard' ? 'discard' : 'stock';
    if (!isChildish) {
      row.size_label = null;
      row.size_num = null;
    }
    lastUsed.set({ owner_type: row.owner_type, member_id: row.member_id, gender: row.gender, category_key: row.category_key, place_id: row.place_id, size_label: row.size_label, size_num: row.size_num });
    onClose();
    await commit([{ table: 'clothing_items', op: item ? 'upsert' : 'insert', row }], { undoLabel: item ? '変更しました' : '追加しました' });
  };
  const del = async () => {
    onClose();
    await commit([{ table: 'clothing_items', op: 'delete', key: { id: item!.id } }], { undoLabel: '削除しました' });
  };

  return (
    <Sheet open onClose={onClose} title={item ? '服を編集' : '服を追加'} footer={<><Button variant="primary" className="flex-1" onClick={save} disabled={f.qty < 0}>保存</Button>{item && <ConfirmDelete onDelete={del} />}</>}>
      <Field label="持ち主">
        <select className={inputCls} value={f.owner_type === 'stock' ? 'stock' : String(f.member_id ?? '')} onChange={(e) => (e.target.value === 'stock' ? set({ owner_type: 'stock', status: 'stock', gender: f.gender ?? 'unisex' }) : set({ owner_type: 'member', member_id: Number(e.target.value), status: f.status === 'stock' ? 'wearing' : f.status }))}>
          {sortedMembers(data).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          <option value="stock">お下がり在庫</option>
        </select>
      </Field>
      {f.owner_type === 'stock' && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="性別">
            <select className={inputCls} value={f.gender ?? 'unisex'} onChange={(e) => set({ gender: e.target.value as ClothingItem['gender'] })}>
              {(['female', 'male', 'unisex'] as const).map((g) => <option key={g} value={g}>{genderLabel[g]}</option>)}
            </select>
          </Field>
          <Field label="誰用か固定する">
            <select className={inputCls} value={f.reserved_for_member_id ?? ''} onChange={(e) => set({ reserved_for_member_id: e.target.value ? Number(e.target.value) : null })}>
              <option value="">固定しない</option>
              {kids.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
          </Field>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Field label="区分">
          <select className={inputCls} value={f.category_key} onChange={(e) => set({ category_key: e.target.value })}>
            {sortedCats(data).map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </Field>
        <Field label="種類">
          <input className={inputCls} list="kind-options" value={f.kind} placeholder="例：Tシャツ" onChange={(e) => set({ kind: e.target.value })} />
          <datalist id="kind-options">{kindOptions.map((k) => <option key={k} value={k} />)}</datalist>
        </Field>
      </div>
      {isChildish && (
        <Field label="サイズ" hint={tracked ? (currentSize ? `${member?.name}の今のサイズ：${currentSize}` : f.category_key === 'shoes' ? '靴は cm で入れてください（例：18.5）' : undefined) : 'ざっくりでOKです（例：16-18）'}>
          {tracked && f.category_key !== 'shoes' && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {CHILD_SIZES.map((s) => (
                <button key={s} type="button" onClick={() => set({ size_num: s, size_label: String(s) })} className={cx('min-h-10 min-w-12 rounded-lg border px-2 text-sm', f.size_num === s ? 'border-accent-600 bg-accent-600 text-white' : 'border-stone-300 dark:border-stone-700', currentSize === s && f.size_num !== s && 'ring-2 ring-accent-500/40')}>
                  {s}
                </button>
              ))}
            </div>
          )}
          <input className={inputCls} inputMode={tracked ? 'decimal' : 'text'} value={f.size_label ?? ''} placeholder={tracked ? '数字で入れる' : 'サイズ（任意）'} onChange={(e) => set({ size_label: e.target.value || null, size_num: toNum(e.target.value) })} />
        </Field>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Field label="季節">
          <select className={inputCls} value={f.season} onChange={(e) => set({ season: e.target.value as ClothingItem['season'] })}>
            <option value="all">通年</option><option value="summer">夏</option><option value="winter">冬</option>
          </select>
        </Field>
        <Field label="状態">
          <select className={inputCls} value={f.status} onChange={(e) => set({ status: e.target.value as ClothingItem['status'] })}>
            {(f.owner_type === 'stock' ? (['stock', 'discard'] as const) : (['wearing', 'next', 'discard'] as const)).map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="数（枚・足）">
          <input className={inputCls} type="number" inputMode="numeric" min={0} value={f.qty} onChange={(e) => set({ qty: Math.max(0, Math.floor(Number(e.target.value) || 0)) })} />
        </Field>
        <Field label="置き場所"><PlaceSelect value={f.place_id} onChange={(v) => set({ place_id: v })} /></Field>
      </div>
      <Field label="メモ"><input className={inputCls} value={f.note ?? ''} onChange={(e) => set({ note: e.target.value || null })} /></Field>
    </Sheet>
  );
}

// ───────── 消耗品 ─────────
export function SupplyEditor({ item, onClose }: { item: SupplyItem | null; onClose: () => void }) {
  const data = useData();
  const { commit } = useStore();
  const last = lastUsed.get();
  const [f, setF] = useState<Omit<SupplyItem, 'id'> & { id?: number }>(() =>
    item ?? { category: (last.supply_category as string) ?? '紙類', name: '', owner_member_id: null, unit: '個', qty_unopened: 0, reorder_at: 0, refill_to: 1, auto_target: null, place_id: (last.place_id as number) ?? null, is_disaster: 0, expires_on: null, note: null },
  );
  const set = (p: Partial<SupplyItem>) => setF((x) => ({ ...x, ...p }));
  const cats = [...new Set(data.supply_items.map((s) => s.category))];
  const n = (v: string) => Math.max(0, Math.floor(Number(v) || 0));
  const save = async () => {
    lastUsed.set({ supply_category: f.category, place_id: f.place_id });
    onClose();
    await commit([{ table: 'supply_items', op: item ? 'upsert' : 'insert', row: { ...f, name: f.name.trim() } }], { undoLabel: item ? '変更しました' : '追加しました' });
  };
  const del = async () => {
    onClose();
    await commit([{ table: 'supply_items', op: 'delete', key: { id: item!.id } }], { undoLabel: '削除しました' });
  };
  return (
    <Sheet open onClose={onClose} title={item ? '消耗品を編集' : '消耗品を追加'} footer={<><Button variant="primary" className="flex-1" onClick={save} disabled={!f.name.trim()}>保存</Button>{item && <ConfirmDelete onDelete={del} />}</>}>
      <div className="grid grid-cols-2 gap-2">
        <Field label="分類">
          <input className={inputCls} list="supply-cats" value={f.category} onChange={(e) => set({ category: e.target.value })} />
          <datalist id="supply-cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
        </Field>
        <Field label="持ち主">
          <select className={inputCls} value={f.owner_member_id ?? ''} onChange={(e) => set({ owner_member_id: e.target.value ? Number(e.target.value) : null })}>
            <option value="">家族共有</option>
            {sortedMembers(data).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-[2fr_1fr] gap-2">
        <Field label="品名"><input className={inputCls} value={f.name} onChange={(e) => set({ name: e.target.value })} /></Field>
        <Field label="単位"><input className={inputCls} value={f.unit} onChange={(e) => set({ unit: e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Field label="未開封の数"><input className={inputCls} type="number" inputMode="numeric" value={f.qty_unopened} onChange={(e) => set({ qty_unopened: n(e.target.value) })} /></Field>
        <Field label="この数以下で買う"><input className={inputCls} type="number" inputMode="numeric" value={f.reorder_at} disabled={!!f.auto_target} onChange={(e) => set({ reorder_at: n(e.target.value) })} /></Field>
        <Field label="買うときはこの数まで"><input className={inputCls} type="number" inputMode="numeric" value={f.refill_to} disabled={!!f.auto_target} onChange={(e) => set({ refill_to: n(e.target.value) })} /></Field>
      </div>
      {f.auto_target === 'toilet' && <p className="mb-3 text-sm text-stone-500">簡易トイレの目標は「人数×1日の回数×日数」で自動で決まります（設定で変えられます）。</p>}
      <p className="mb-3 text-xs text-stone-500">使っている途中の物は数えず、未開封の物だけを数えます。</p>
      <div className="grid grid-cols-2 gap-2">
        <Field label="置き場所"><PlaceSelect value={f.place_id} onChange={(v) => set({ place_id: v })} /></Field>
        <Field label="使用期限（任意）"><input className={inputCls} type="month" value={f.expires_on ?? ''} onChange={(e) => set({ expires_on: e.target.value || null })} /></Field>
      </div>
      <label className="mb-3 flex min-h-11 items-center gap-2">
        <input type="checkbox" className="h-5 w-5" checked={!!f.is_disaster} onChange={(e) => set({ is_disaster: e.target.checked ? 1 : 0 })} />
        防災用
      </label>
      <Field label="メモ"><input className={inputCls} value={f.note ?? ''} onChange={(e) => set({ note: e.target.value || null })} /></Field>
    </Sheet>
  );
}

// ───────── 食品（品目） ─────────
export function FoodItemEditor({ item, onClose }: { item: FoodItem | null; onClose: () => void }) {
  const data = useData();
  const { commit } = useStore();
  const [f, setF] = useState<Omit<FoodItem, 'id'> & { id?: number }>(() => item ?? { group_key: 'retort', name: '', unit: '個', meals_per_unit: null, liters_per_unit: null, kg_per_unit: null, default_place_id: null, note: null });
  const set = (p: Partial<FoodItem>) => setF((x) => ({ ...x, ...p }));
  const save = async () => {
    onClose();
    await commit([{ table: 'food_items', op: item ? 'upsert' : 'insert', row: { ...f, name: f.name.trim() } }], { undoLabel: item ? '変更しました' : '追加しました' });
  };
  const hasLots = item && data.food_lots.some((l) => l.food_item_id === item.id);
  const del = async () => {
    onClose();
    await commit([
      ...data.food_lots.filter((l) => l.food_item_id === item!.id).map((l) => ({ table: 'food_lots' as const, op: 'delete' as const, key: { id: l.id } })),
      { table: 'food_items', op: 'delete', key: { id: item!.id } },
    ], { undoLabel: '削除しました' });
  };
  return (
    <Sheet open onClose={onClose} title={item ? '食品の品目を編集' : '食品の品目を追加'} footer={<><Button variant="primary" className="flex-1" onClick={save} disabled={!f.name.trim()}>保存</Button>{item && <ConfirmDelete onDelete={del} label={hasLots ? '期限ごとの数も削除' : '削除'} />}</>}>
      <Field label="グループ">
        <select className={inputCls} value={f.group_key} onChange={(e) => set({ group_key: e.target.value as FoodItem['group_key'] })}>
          {foodGroups.map((g) => <option key={g} value={g}>{foodGroupLabel[g]}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-[2fr_1fr] gap-2">
        <Field label="品名"><input className={inputCls} value={f.name} onChange={(e) => set({ name: e.target.value })} /></Field>
        <Field label="単位"><input className={inputCls} value={f.unit} onChange={(e) => set({ unit: e.target.value })} /></Field>
      </div>
      {f.group_key === 'water' && <Field label="1単位あたりのL"><input className={inputCls} type="number" inputMode="decimal" value={f.liters_per_unit ?? ''} onChange={(e) => set({ liters_per_unit: toNum(e.target.value) })} /></Field>}
      {f.group_key === 'rice' && <Field label="1単位あたりのkg"><input className={inputCls} type="number" inputMode="decimal" value={f.kg_per_unit ?? ''} onChange={(e) => set({ kg_per_unit: toNum(e.target.value) })} /></Field>}
      {f.group_key !== 'water' && f.group_key !== 'rice' && (
        <Field label="1単位で何人前か" hint="食数に数えたい物だけ、何人前かを入れてください。パスタとソースのように組み合わせて1食になる物は、どちらか片方にだけ入れてください。">
          <input className={inputCls} type="number" inputMode="decimal" value={f.meals_per_unit ?? ''} placeholder="数えない" onChange={(e) => set({ meals_per_unit: toNum(e.target.value) })} />
        </Field>
      )}
      <Field label="いつもの置き場所"><PlaceSelect value={f.default_place_id} onChange={(v) => set({ default_place_id: v })} /></Field>
      <Field label="メモ"><input className={inputCls} value={f.note ?? ''} onChange={(e) => set({ note: e.target.value || null })} /></Field>
    </Sheet>
  );
}

// ───────── 食品（期限ごとの数）＝「買った」 ─────────
export function FoodLotEditor({ lot, onClose, foodItemId }: { lot: FoodLot | null; onClose: () => void; foodItemId?: number }) {
  const data = useData();
  const { commit } = useStore();
  const first = foodItemId ?? data.food_items[0]?.id;
  const fi = (id: number) => data.food_items.find((i) => i.id === id);
  const [f, setF] = useState<Omit<FoodLot, 'id'> & { id?: number }>(() => lot ?? { food_item_id: first, best_before: null, qty: 1, place_id: fi(first)?.default_place_id ?? null });
  const set = (p: Partial<FoodLot>) => setF((x) => ({ ...x, ...p }));
  const item = fi(f.food_item_id);
  const save = async () => {
    onClose();
    await commit([{ table: 'food_lots', op: lot ? 'upsert' : 'insert', row: f }], { undoLabel: lot ? '変更しました' : `${item?.name}を追加しました` });
  };
  const del = async () => {
    onClose();
    await commit([{ table: 'food_lots', op: 'delete', key: { id: lot!.id } }], { undoLabel: '削除しました' });
  };
  return (
    <Sheet open onClose={onClose} title={lot ? '期限ごとの数を編集' : '買った'} footer={<><Button variant="primary" className="flex-1" onClick={save} disabled={!item}>保存</Button>{lot && <ConfirmDelete onDelete={del} />}</>}>
      <Field label="品目">
        <select className={inputCls} value={f.food_item_id} onChange={(e) => { const id = Number(e.target.value); set({ food_item_id: id, place_id: f.place_id ?? fi(id)?.default_place_id ?? null }); }}>
          {foodGroups.map((g) => (
            <optgroup key={g} label={foodGroupLabel[g]}>
              {data.food_items.filter((i) => i.group_key === g).map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </optgroup>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label={`数（${item?.unit ?? ''}）`}><input className={inputCls} type="number" inputMode="decimal" min={0} value={f.qty} onChange={(e) => set({ qty: Math.max(0, Number(e.target.value) || 0) })} /></Field>
        <Field label="賞味期限（年月）" hint={item?.group_key === 'rice' ? '米など期限のない物は空のままでOK' : undefined}><input className={inputCls} type="month" value={f.best_before ?? ''} onChange={(e) => set({ best_before: e.target.value || null })} /></Field>
      </div>
      <Field label="置き場所"><PlaceSelect value={f.place_id} onChange={(v) => set({ place_id: v })} /></Field>
    </Sheet>
  );
}
