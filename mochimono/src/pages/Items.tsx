import { useMemo, useState, type ReactNode } from 'react';
import { useData, useStore } from '../store';
import { Button, Card, Empty, Gauge, Pill, Segmented, Sheet, Stepper, cx, inputCls } from '../ui';
import { categoryLabel, fmtNum, fmtYm, foodGroupLabel, foodGroups, memberName, ownerLabel, placeName, sortedCats, sortedMembers, sortedPlaces, statusLabel } from '../labels';
import { ClothingEditor, FoodItemEditor, FoodLotEditor, SupplyEditor } from '../components/Editors';
import { Recount } from '../components/Recount';
import { seasonLabel } from '../../shared/logic/season';
import { clothingStatus } from '../../shared/logic/clothing';
import { makeCtx } from '../../shared/logic/home';
import { isExpired } from '../../shared/logic/food';
import type { AllData, ClothingItem, FoodItem, FoodLot, SupplyItem } from '../../shared/tables';

type View = 'thing' | 'person' | 'place';
type Kind = 'all' | 'clothing' | 'supply' | 'food';

export type Entry = {
  key: string;
  type: 'clothing' | 'supply' | 'food';
  id: number;
  title: string;
  detail: string;
  qty: number;
  unit: string;
  placeId: number | null;
  ownerKey: string;
  ownerLabel: string;
  group: string;
  groupOrder: number;
  kind: string;
  tag?: { text: string; tone: 'red' | 'amber' | 'stone' | 'accent' };
  search: string;
  raw: ClothingItem | SupplyItem | FoodLot;
};

export function buildEntries(data: AllData, today: string): Entry[] {
  const out: Entry[] = [];
  const cats = sortedCats(data);
  for (const it of data.clothing_items) {
    const cat = categoryLabel(data, it.category_key);
    const owner = ownerLabel(data, it);
    const size = it.size_label ? ` ${it.size_label}` : '';
    out.push({
      key: `c${it.id}`, type: 'clothing', id: it.id, raw: it,
      title: `${it.kind || cat}${size}`,
      detail: `${it.owner_type === 'stock' ? owner : memberName(data, it.member_id)}・${seasonLabel[it.season]}・${placeName(data.places, it.place_id)}`,
      qty: it.qty, unit: '枚', placeId: it.place_id,
      ownerKey: it.owner_type === 'stock' ? 'stock' : `m${it.member_id}`, ownerLabel: owner,
      group: cat, groupOrder: cats.findIndex((c) => c.key === it.category_key), kind: it.kind || cat,
      tag: it.status !== 'wearing' ? { text: statusLabel[it.status], tone: it.status === 'discard' ? 'red' : 'accent' } : undefined,
      search: [it.kind, cat, owner, placeName(data.places, it.place_id), it.size_label, it.note].join(' '),
    });
  }
  for (const s of data.supply_items) {
    const owner = memberName(data, s.owner_member_id);
    out.push({
      key: `s${s.id}`, type: 'supply', id: s.id, raw: s,
      title: s.name + (s.owner_member_id ? `（${owner}）` : ''),
      detail: `${placeName(data.places, s.place_id)}${s.expires_on ? `・期限 ${fmtYm(s.expires_on)}` : ''}`,
      qty: s.qty_unopened, unit: s.unit, placeId: s.place_id,
      ownerKey: s.owner_member_id ? `m${s.owner_member_id}` : 'shared', ownerLabel: owner,
      group: s.category, groupOrder: 100, kind: s.name,
      tag: s.is_disaster ? { text: '防災', tone: 'stone' } : undefined,
      search: [s.name, s.category, owner, placeName(data.places, s.place_id), s.note].join(' '),
    });
  }
  const items = new Map(data.food_items.map((i) => [i.id, i]));
  for (const l of data.food_lots) {
    const fi = items.get(l.food_item_id);
    if (!fi) continue;
    const expired = isExpired(l, today.slice(0, 7));
    out.push({
      key: `f${l.id}`, type: 'food', id: l.id, raw: l,
      title: fi.name,
      detail: `期限 ${fmtYm(l.best_before)}・${placeName(data.places, l.place_id)}`,
      qty: l.qty, unit: fi.unit, placeId: l.place_id,
      ownerKey: 'shared', ownerLabel: '家族共有',
      group: foodGroupLabel[fi.group_key], groupOrder: 200 + foodGroups.indexOf(fi.group_key), kind: fi.name,
      tag: expired ? { text: '期限切れ', tone: 'red' } : undefined,
      search: [fi.name, foodGroupLabel[fi.group_key], placeName(data.places, l.place_id), '食品 備蓄'].join(' '),
    });
  }
  return out;
}

export function EntryRow({ e, onOpen }: { e: Entry; onOpen: (e: Entry) => void }) {
  const { bump } = useStore();
  const table = e.type === 'clothing' ? 'clothing_items' : e.type === 'supply' ? 'supply_items' : 'food_lots';
  const field = e.type === 'supply' ? 'qty_unopened' : 'qty';
  return (
    <li className="flex items-center gap-2 border-t border-stone-100 py-2 first:border-t-0 dark:border-stone-800">
      <button className="min-h-11 flex-1 text-left" onClick={() => onOpen(e)}>
        <div className="flex flex-wrap items-center gap-1.5 font-medium">
          {e.title}
          {e.tag && <Pill tone={e.tag.tone}>{e.tag.text}</Pill>}
        </div>
        <div className="text-xs text-stone-500">{e.detail}</div>
      </button>
      <Stepper value={e.qty} unit={e.unit} label={e.title} onMinus={() => bump(table, e.id, field, -1, e.title)} onPlus={() => bump(table, e.id, field, 1, e.title)} />
    </li>
  );
}

function groupBy<T>(arr: T[], key: (t: T) => string) {
  const m = new Map<string, T[]>();
  for (const x of arr) {
    const k = key(x);
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(x);
  }
  return m;
}

export function useEditor() {
  const data = useData();
  const [open, setOpen] = useState<null | { type: 'clothing'; item: ClothingItem | null; preset?: Partial<ClothingItem> } | { type: 'supply'; item: SupplyItem | null } | { type: 'food'; lot: FoodLot | null } | { type: 'fooditem'; item: FoodItem | null }>(null);
  const openEntry = (e: Entry) => {
    if (e.type === 'clothing') setOpen({ type: 'clothing', item: data.clothing_items.find((x) => x.id === e.id) ?? null });
    if (e.type === 'supply') setOpen({ type: 'supply', item: data.supply_items.find((x) => x.id === e.id) ?? null });
    if (e.type === 'food') setOpen({ type: 'food', lot: data.food_lots.find((x) => x.id === e.id) ?? null });
  };
  const close = () => setOpen(null);
  const node: ReactNode = open && (
    <>
      {open.type === 'clothing' && <ClothingEditor item={open.item} preset={open.preset} onClose={close} />}
      {open.type === 'supply' && <SupplyEditor item={open.item} onClose={close} />}
      {open.type === 'food' && <FoodLotEditor lot={open.lot} onClose={close} />}
      {open.type === 'fooditem' && <FoodItemEditor item={open.item} onClose={close} />}
    </>
  );
  return { openEntry, setOpen, node };
}

export default function Items() {
  const data = useData();
  const { today } = useStore();
  const [view, setView] = useState<View>(() => (sessionStorage.getItem('items:view') as View) || 'thing');
  const [kind, setKind] = useState<Kind>('all');
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [recount, setRecount] = useState(false);
  const { openEntry, setOpen, node } = useEditor();

  const entries = useMemo(() => buildEntries(data, today), [data, today]);
  const filtered = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return entries.filter((e) => (kind === 'all' || e.type === kind) && words.every((w) => e.search.toLowerCase().includes(w)));
  }, [entries, kind, q]);

  const changeView = (v: View) => {
    setView(v);
    try { sessionStorage.setItem('items:view', v); } catch { /* なくても動く */ }
  };

  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-10 -mx-4 space-y-2 bg-stone-50/95 px-4 pt-3 pb-2 backdrop-blur dark:bg-stone-950/95">
        <Segmented ariaLabel="見方" value={view} onChange={changeView} options={[{ value: 'thing', label: '物ごと' }, { value: 'person', label: '人ごと' }, { value: 'place', label: '場所ごと' }]} />
        <Segmented ariaLabel="種類" value={kind} onChange={setKind} options={[{ value: 'all', label: 'すべて' }, { value: 'clothing', label: '衣類' }, { value: 'supply', label: '消耗品' }, { value: 'food', label: '食品' }]} />
        <div className="flex gap-2">
          <input type="search" className={inputCls} placeholder="品名・種類・場所・人で探す" value={q} onChange={(e) => setQ(e.target.value)} aria-label="検索" />
          <Button small onClick={() => setRecount(true)} className="shrink-0">数え直し</Button>
        </div>
      </div>

      {filtered.length === 0 && <Empty>{q ? '見つかりませんでした。' : 'まだ何も登録されていません。右下の「＋」から追加してください。'}</Empty>}
      {view === 'thing' && <ByThing entries={filtered} onOpen={openEntry} />}
      {view === 'person' && <ByPerson entries={filtered} onOpen={openEntry} showAll={!q && (kind === 'all' || kind === 'clothing')} />}
      {view === 'place' && <ByPlace entries={filtered} onOpen={openEntry} />}

      <button aria-label="追加" onClick={() => setAdding(true)} className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-20 flex h-14 w-14 items-center justify-center rounded-full bg-accent-600 text-3xl text-white shadow-lg active:scale-95">＋</button>
      <Sheet open={adding} onClose={() => setAdding(false)} title="何を追加しますか">
        <div className="grid gap-2 pb-2">
          <Button onClick={() => { setAdding(false); setOpen({ type: 'clothing', item: null }); }}>👕 衣類</Button>
          <Button onClick={() => { setAdding(false); setOpen({ type: 'supply', item: null }); }}>🧻 消耗品</Button>
          <Button onClick={() => { setAdding(false); setOpen({ type: 'food', lot: null }); }}>🥫 食品（買った物を入れる）</Button>
          <Button variant="ghost" onClick={() => { setAdding(false); setOpen({ type: 'fooditem', item: null }); }}>食品の品目を新しく作る</Button>
        </div>
      </Sheet>
      {recount && <Recount onClose={() => setRecount(false)} />}
      {node}
    </div>
  );
}

function ByThing({ entries, onOpen }: { entries: Entry[]; onOpen: (e: Entry) => void }) {
  const data = useData();
  const groups = groupBy([...entries].sort((a, b) => a.groupOrder - b.groupOrder), (e) => `${e.type}:${e.group}`);
  return (
    <div className="space-y-3">
      {[...groups].map(([gk, list]) => (
        <Card key={gk} title={list[0].group}>
          <div className="space-y-3">
            {[...groupBy(list, (e) => e.kind)].map(([kind, rows]) => {
              const total = rows.reduce((s, e) => s + e.qty, 0);
              const byOwner = [...groupBy(rows, (e) => e.ownerKey)].map(([, rs]) => {
                const places = [...new Set(rs.map((r) => placeName(data.places, r.placeId)))].join('、');
                return `${rs[0].type === 'clothing' && rs[0].ownerKey === 'stock' ? 'お下がり' : rs[0].ownerLabel}${fmtNum(rs.reduce((s, r) => s + r.qty, 0))}（${places}）`;
              });
              return (
                <div key={kind}>
                  <div className="font-bold">
                    {kind} <span className="text-sm font-normal text-stone-500">合計{fmtNum(total)}{rows[0].unit}</span>
                  </div>
                  <p className="text-xs text-stone-500">{byOwner.join('、')}</p>
                  <ul>{rows.map((e) => <EntryRow key={e.key} e={e} onOpen={onOpen} />)}</ul>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}

function ByPerson({ entries, onOpen, showAll }: { entries: Entry[]; onOpen: (e: Entry) => void; showAll: boolean }) {
  const data = useData();
  const { today } = useStore();
  const status = useMemo(() => clothingStatus(makeCtx(data, today)), [data, today]);
  const owners = [...sortedMembers(data).map((m) => ({ key: `m${m.id}`, label: m.name, memberId: m.id as number | null })), { key: 'stock', label: 'お下がり在庫', memberId: null }, { key: 'shared', label: '家族共有', memberId: null }];
  return (
    <div className="space-y-3">
      {owners.map((o) => {
        const mine = entries.filter((e) => e.ownerKey === o.key);
        const rows = o.memberId != null ? status.filter((r) => r.member.id === o.memberId) : [];
        if (!mine.length && !(showAll && rows.length)) return null;
        const clothes = mine.filter((e) => e.type === 'clothing');
        const others = mine.filter((e) => e.type !== 'clothing');
        const cats = sortedCats(data).filter((c) => clothes.some((e) => (e.raw as ClothingItem).category_key === c.key) || rows.some((r) => r.category.key === c.key));
        return (
          <Card key={o.key} title={o.label}>
            {cats.map((c) => {
              const r = rows.find((x) => x.category.key === c.key);
              const list = clothes.filter((e) => (e.raw as ClothingItem).category_key === c.key);
              const places = [...new Set(list.map((e) => placeName(data.places, e.placeId)))].join('、');
              return (
                <div key={c.key} className="mb-3">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-bold">{c.label}{r?.sizeNum ? <span className="ml-1 text-sm font-normal text-stone-500">今のサイズ {r.sizeNum}</span> : null}</span>
                    {r ? <Gauge now={r.wearing} target={r.target} /> : o.key !== 'stock' && <span className="text-xs text-stone-500">目安なし</span>}
                  </div>
                  {places && <p className="text-xs text-stone-500">{places}</p>}
                  <ul>{list.map((e) => <EntryRow key={e.key} e={e} onOpen={onOpen} />)}</ul>
                </div>
              );
            })}
            {others.length > 0 && (
              <div>
                {[...groupBy(others, (e) => e.group)].map(([g, list]) => (
                  <div key={g} className="mb-2">
                    <div className="font-bold">{g}</div>
                    <ul>{list.map((e) => <EntryRow key={e.key} e={e} onOpen={onOpen} />)}</ul>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function ByPlace({ entries, onOpen }: { entries: Entry[]; onOpen: (e: Entry) => void }) {
  const data = useData();
  const places = sortedPlaces(data.places, true);
  const rooms = [...new Set(places.map((p) => p.room))];
  const unplaced = entries.filter((e) => e.placeId == null || !places.some((p) => p.id === e.placeId));
  const block = (list: Entry[]) =>
    [...groupBy(list, (e) => `${e.ownerLabel}・${e.group}`)].map(([k, rs]) => (
      <div key={k} className="mb-2">
        <div className="text-sm font-bold text-stone-600 dark:text-stone-300">{k}</div>
        <ul>{rs.map((e) => <EntryRow key={e.key} e={e} onOpen={onOpen} />)}</ul>
      </div>
    ));
  return (
    <div className="space-y-3">
      {rooms.map((room) => {
        const spots = places.filter((p) => p.room === room && entries.some((e) => e.placeId === p.id));
        if (!spots.length) return null;
        return (
          <Card key={room} title={room}>
            {spots.map((p) => (
              <div key={p.id} className="mb-3">
                <h3 className={cx('mb-1 border-b border-stone-200 pb-1 font-bold dark:border-stone-800')}>{p.spot}{p.archived ? '（隠した場所）' : ''}</h3>
                {block(entries.filter((e) => e.placeId === p.id))}
              </div>
            ))}
          </Card>
        );
      })}
      {unplaced.length > 0 && <Card title="場所未設定">{block(unplaced)}</Card>}
    </div>
  );
}
