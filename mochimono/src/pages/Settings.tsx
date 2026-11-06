import { useMemo, useState, type ReactNode } from 'react';
import { useData, useStore } from '../store';
import { Button, Card, Field, Segmented, Sheet, cx, inputCls } from '../ui';
import { csvDefs, download, exportCsv, previewImport, type ImportPreview } from '../csv';
import { categoryLabel, foodGroupLabel, memberGenderLabel, placeName, sortedCats, sortedMembers, sortedPlaces, statusLabel } from '../labels';
import { PlaceSelect } from '../components/Editors';
import type { BatchOp, ClothingItem, Member, Place } from '../../shared/tables';
import type { Settings as S } from '../../shared/logic/settings';

function Section({ title, children, open, onToggle }: { title: string; children: ReactNode; open: boolean; onToggle: () => void }) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
      <button className="flex min-h-14 w-full items-center justify-between px-4 text-left font-bold" onClick={onToggle} aria-expanded={open}>
        {title}
        <span className="text-stone-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="border-t border-stone-100 px-4 py-3 dark:border-stone-800">{children}</div>}
    </section>
  );
}

export default function Settings({ onRestartGuide }: { onRestartGuide: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const t = (k: string) => () => setOpen(open === k ? null : k);
  return (
    <div className="space-y-2 pt-3">
      <Section title="家族" open={open === 'members'} onToggle={t('members')}><MembersSettings /></Section>
      <Section title="置き場所" open={open === 'places'} onToggle={t('places')}><PlacesSettings /></Section>
      <Section title="服の目安数" open={open === 'targets'} onToggle={t('targets')}><TargetsSettings /></Section>
      <Section title="備蓄の目標と計算の条件" open={open === 'stock'} onToggle={t('stock')}><StockSettings /></Section>
      <Section title="まとめて編集" open={open === 'bulk'} onToggle={t('bulk')}><BulkEdit /></Section>
      <Section title="CSV（書き出し・読み込み）" open={open === 'csv'} onToggle={t('csv')}><CsvSettings /></Section>
      <Section title="バックアップ" open={open === 'backup'} onToggle={t('backup')}>
        <p className="mb-2 text-sm">全部のデータを1つのファイル（JSON）に保存します。</p>
        <a className="inline-flex min-h-11 items-center rounded-xl bg-accent-600 px-4 font-medium text-white" href="/api/backup" download>バックアップを保存</a>
      </Section>
      <Card><Button className="w-full" onClick={onRestartGuide}>はじめの案内をもう一度見る</Button></Card>
    </div>
  );
}

function MembersSettings() {
  const data = useData();
  const { commit } = useStore();
  const members = sortedMembers(data);
  const save = (m: Member, p: Partial<Member>) => commit([{ table: 'members', op: 'upsert', row: { ...m, ...p } }], { undoLabel: '家族を変更しました' });
  const swap = (i: number, j: number) => {
    const a = members[i], b = members[j];
    if (!a || !b) return;
    commit([{ table: 'members', op: 'upsert', row: { ...a, sort_order: b.sort_order } }, { table: 'members', op: 'upsert', row: { ...b, sort_order: a.sort_order } }]);
  };
  return (
    <ul className="space-y-3">
      {members.map((m, i) => (
        <li key={m.id} className="flex flex-wrap items-center gap-2">
          <input className={inputCls + ' w-28 flex-1'} defaultValue={m.name} aria-label="名前" onBlur={(e) => e.target.value.trim() && e.target.value !== m.name && save(m, { name: e.target.value.trim() })} />
          <select className={inputCls + ' w-auto'} value={m.gender} onChange={(e) => save(m, { gender: e.target.value as Member['gender'] })} aria-label="性別">
            {(['female', 'male'] as const).map((g) => <option key={g} value={g}>{memberGenderLabel[g]}</option>)}
          </select>
          <span className="text-xs text-stone-500">{m.kind === 'child' ? '子ども' : '大人'}</span>
          <Button small ariaLabel="上へ" onClick={() => swap(i, i - 1)} disabled={i === 0}>↑</Button>
          <Button small ariaLabel="下へ" onClick={() => swap(i, i + 1)} disabled={i === members.length - 1}>↓</Button>
        </li>
      ))}
    </ul>
  );
}

function PlacesSettings() {
  const data = useData();
  const { commit } = useStore();
  const places = sortedPlaces(data.places, true);
  const [room, setRoom] = useState('');
  const [spot, setSpot] = useState('');
  const [removing, setRemoving] = useState<Place | null>(null);
  const [moveTo, setMoveTo] = useState<number | null>(null);
  const usage = (id: number) =>
    data.clothing_items.filter((x) => x.place_id === id).length + data.supply_items.filter((x) => x.place_id === id).length + data.food_lots.filter((x) => x.place_id === id).length + data.food_items.filter((x) => x.default_place_id === id).length;
  const save = (p: Place, patch: Partial<Place>) => commit([{ table: 'places', op: 'upsert', row: { ...p, ...patch } }], { undoLabel: '置き場所を変更しました' });
  const swap = (i: number, j: number) => {
    const a = places[i], b = places[j];
    if (!a || !b) return;
    const [sa, sb] = a.sort_order === b.sort_order ? [j, i] : [b.sort_order, a.sort_order];
    commit([{ table: 'places', op: 'upsert', row: { ...a, sort_order: sa } }, { table: 'places', op: 'upsert', row: { ...b, sort_order: sb } }]);
  };
  const add = () => {
    if (!room.trim() || !spot.trim()) return;
    commit([{ table: 'places', op: 'insert', row: { room: room.trim(), spot: spot.trim(), sort_order: Math.max(0, ...places.map((p) => p.sort_order)) + 1, archived: 0 } }], { undoLabel: '置き場所を追加しました' });
    setSpot('');
  };
  const remove = () => {
    const p = removing!;
    const ops: BatchOp[] = [];
    if (usage(p.id) > 0) {
      if (moveTo == null) return;
      for (const x of data.clothing_items.filter((r) => r.place_id === p.id)) ops.push({ table: 'clothing_items', op: 'upsert', row: { ...x, place_id: moveTo } });
      for (const x of data.supply_items.filter((r) => r.place_id === p.id)) ops.push({ table: 'supply_items', op: 'upsert', row: { ...x, place_id: moveTo } });
      for (const x of data.food_lots.filter((r) => r.place_id === p.id)) ops.push({ table: 'food_lots', op: 'upsert', row: { ...x, place_id: moveTo } });
      for (const x of data.food_items.filter((r) => r.default_place_id === p.id)) ops.push({ table: 'food_items', op: 'upsert', row: { ...x, default_place_id: moveTo } });
    }
    ops.push({ table: 'places', op: 'delete', key: { id: p.id } });
    setRemoving(null);
    commit(ops, { undoLabel: `「${p.room}／${p.spot}」を消しました` });
  };
  return (
    <div>
      <p className="mb-2 text-xs text-stone-500">名前を書きかえると、すぐに保存されます。引っ越したときは、部屋や場所の名前を変えるだけでOKです。</p>
      <ul className="space-y-2">
        {places.map((p, i) => (
          <li key={p.id} className={cx('rounded-xl border border-stone-200 p-2 dark:border-stone-800', !!p.archived && 'opacity-60')}>
            <div className="flex gap-2">
              <input className={inputCls + ' w-24'} defaultValue={p.room} aria-label="部屋" onBlur={(e) => e.target.value.trim() && e.target.value !== p.room && save(p, { room: e.target.value.trim() })} />
              <input className={inputCls + ' flex-1'} defaultValue={p.spot} aria-label="細かい場所" onBlur={(e) => e.target.value.trim() && e.target.value !== p.spot && save(p, { spot: e.target.value.trim() })} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1">
              <span className="mr-auto text-xs text-stone-500">{usage(p.id)}件の物{p.archived ? '・隠しています' : ''}</span>
              <Button small ariaLabel="上へ" onClick={() => swap(i, i - 1)} disabled={i === 0}>↑</Button>
              <Button small ariaLabel="下へ" onClick={() => swap(i, i + 1)} disabled={i === places.length - 1}>↓</Button>
              <Button small onClick={() => save(p, { archived: p.archived ? 0 : 1 })}>{p.archived ? '表示する' : '隠す'}</Button>
              <Button small variant="danger" onClick={() => { setRemoving(p); setMoveTo(null); }}>消す</Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-2">
        <input className={inputCls + ' w-24'} placeholder="部屋" value={room} onChange={(e) => setRoom(e.target.value)} list="rooms" />
        <datalist id="rooms">{[...new Set(places.map((p) => p.room))].map((r) => <option key={r} value={r} />)}</datalist>
        <input className={inputCls + ' flex-1'} placeholder="細かい場所" value={spot} onChange={(e) => setSpot(e.target.value)} />
        <Button variant="primary" onClick={add} disabled={!room.trim() || !spot.trim()}>追加</Button>
      </div>
      <Sheet open={!!removing} onClose={() => setRemoving(null)} title="置き場所を消す" footer={<Button variant="danger" className="flex-1" onClick={remove} disabled={removing != null && usage(removing.id) > 0 && moveTo == null}>消す</Button>}>
        {removing && (usage(removing.id) > 0 ? (
          <>
            <p className="mb-2 text-sm">「{removing.room}／{removing.spot}」には{usage(removing.id)}件の物があります。移す先を選んでください。</p>
            <Field label="移す先"><PlaceSelect value={moveTo} onChange={setMoveTo} allowEmpty={false} /></Field>
            {moveTo === removing.id && <p className="text-sm text-red-700">別の場所を選んでください。</p>}
          </>
        ) : <p className="text-sm">「{removing.room}／{removing.spot}」を消します。</p>)}
      </Sheet>
    </div>
  );
}

function TargetsSettings() {
  const data = useData();
  const { commit } = useStore();
  const members = sortedMembers(data);
  const cats = sortedCats(data).filter((c) => !c.free);
  const init = () => Object.fromEntries(data.clothing_targets.map((t) => [`${t.member_id}:${t.category_key}`, t.target_qty == null ? '' : String(t.target_qty)]));
  const [v, setV] = useState<Record<string, string>>(init);
  const save = () => {
    const ops: BatchOp[] = [];
    for (const m of members) for (const c of cats) {
      const k = `${m.id}:${c.key}`;
      const val = v[k] ?? '';
      const n = val.trim() === '' ? null : Math.max(0, Math.floor(Number(val)));
      const cur = data.clothing_targets.find((t) => t.member_id === m.id && t.category_key === c.key)?.target_qty ?? null;
      if (n !== cur) ops.push({ table: 'clothing_targets', op: 'upsert', row: { member_id: m.id, category_key: c.key, target_qty: n } });
    }
    if (ops.length) commit(ops, { undoLabel: '目安数を保存しました' });
  };
  return (
    <div>
      <p className="mb-2 text-xs text-stone-500">「今の季節に手元に必要な数」です。空欄は目安なし。ワンピース・小物は自由枠なので目安はありません。</p>
      <div className="-mx-4 overflow-x-auto px-4">
        <table className="text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white pr-2 text-left dark:bg-stone-900">区分</th>
              {members.map((m) => <th key={m.id} className="px-1 font-medium">{m.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.key}>
                <td className="sticky left-0 bg-white pr-2 whitespace-nowrap dark:bg-stone-900">{c.label}</td>
                {members.map((m) => {
                  const k = `${m.id}:${c.key}`;
                  return (
                    <td key={k} className="p-0.5">
                      <input aria-label={`${m.name}の${c.label}`} className="h-11 w-14 rounded-lg border border-stone-300 bg-white text-center dark:border-stone-700 dark:bg-stone-950" type="number" inputMode="numeric" value={v[k] ?? ''} placeholder="—" onChange={(e) => setV({ ...v, [k]: e.target.value })} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="primary" className="mt-3 w-full" onClick={save}>保存</Button>
    </div>
  );
}

const settingFields: { key: keyof S; label: string; unit?: string; kind?: 'bool' | 'months' }[] = [
  { key: 'household_size', label: '家族の人数', unit: '人' },
  { key: 'water_l_per_person_day', label: '1人1日に必要な水', unit: 'L' },
  { key: 'include_rice_water', label: '炊飯用の水（1合0.2L）を足す', kind: 'bool' },
  { key: 'rice_go_per_day', label: '1日に炊く米の量', unit: '合' },
  { key: 'target_days_water', label: '水の目標', unit: '日' },
  { key: 'target_days_rice', label: '米の目標', unit: '日' },
  { key: 'target_days_food', label: '米以外の食料の目標（缶詰を含む）', unit: '日' },
  { key: 'target_days_retort_pasta', label: 'レトルト＋パスタ類の目標', unit: '日' },
  { key: 'toilet_uses_per_person_day', label: '簡易トイレの1人1日の回数', unit: '回' },
  { key: 'target_days_toilet', label: '簡易トイレの目標', unit: '日' },
  { key: 'eat_alert_months', label: '期限の何か月前から「食べるもの」に出すか', unit: 'か月' },
  { key: 'summer_months', label: '夏物の季節（ほかの月は冬物）', kind: 'months' },
  { key: 'default_growth_cm_per_year', label: '記録が少ないときの、年あたりの身長の伸び', unit: 'cm' },
  { key: 'keep_limit_months', label: 'お下がりを何か月先まで取っておくか', unit: 'か月' },
  { key: 'measure_interval_days', label: '身長を測るお知らせの間隔', unit: '日' },
];

function StockSettings() {
  const { settings, commit } = useStore();
  const [v, setV] = useState<S>(settings);
  const save = () => {
    const ops: BatchOp[] = settingFields
      .filter((f) => JSON.stringify(v[f.key]) !== JSON.stringify(settings[f.key]))
      .map((f) => ({ table: 'settings', op: 'upsert', row: { key: f.key, value: JSON.stringify(v[f.key]) } }));
    if (ops.length) commit(ops, { undoLabel: '設定を保存しました' });
  };
  return (
    <div>
      {settingFields.map((f) => (
        <div key={f.key} className="mb-3">
          {f.kind === 'bool' ? (
            <label className="flex min-h-11 items-center gap-2">
              <input type="checkbox" className="h-5 w-5" checked={v[f.key] as boolean} onChange={(e) => setV({ ...v, [f.key]: e.target.checked })} />
              {f.label}
            </label>
          ) : f.kind === 'months' ? (
            <div>
              <div className="mb-1 text-sm font-medium text-stone-600 dark:text-stone-300">{f.label}</div>
              <div className="grid grid-cols-6 gap-1">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                  const on = v.summer_months.includes(m);
                  return (
                    <button key={m} aria-pressed={on} onClick={() => setV({ ...v, summer_months: on ? v.summer_months.filter((x) => x !== m) : [...v.summer_months, m].sort((a, b) => a - b) })} className={cx('min-h-11 rounded-lg border text-sm', on ? 'border-accent-600 bg-accent-600 text-white' : 'border-stone-300 dark:border-stone-700')}>
                      {m}月
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <Field label={f.label}>
              <div className="flex items-center gap-2">
                <input className={inputCls + ' w-28'} type="number" inputMode="decimal" value={String(v[f.key])} onChange={(e) => setV({ ...v, [f.key]: Number(e.target.value) || 0 })} />
                <span className="text-sm">{f.unit}</span>
              </div>
            </Field>
          )}
        </div>
      ))}
      <Button variant="primary" className="w-full" onClick={save}>保存</Button>
    </div>
  );
}

type BulkTable = 'clothing' | 'supply' | 'food';
function BulkEdit() {
  const data = useData();
  const { commit } = useStore();
  const [tab, setTab] = useState<BulkTable>('clothing');
  const [edits, setEdits] = useState<Record<string, Record<string, unknown>>>({});
  const set = (k: string, p: Record<string, unknown>) => setEdits((e) => ({ ...e, [k]: { ...e[k], ...p } }));
  const rows = useMemo(() => {
    if (tab === 'clothing') return data.clothing_items.map((r) => ({ k: `c${r.id}`, r: r as unknown as Record<string, unknown>, title: `${r.owner_type === 'stock' ? 'お下がり' : data.members.find((m) => m.id === r.member_id)?.name ?? ''} ${categoryLabel(data, r.category_key)} ${r.kind}` }));
    if (tab === 'supply') return data.supply_items.map((r) => ({ k: `s${r.id}`, r: r as unknown as Record<string, unknown>, title: r.name }));
    return data.food_lots.map((r) => {
      const fi = data.food_items.find((i) => i.id === r.food_item_id);
      return { k: `f${r.id}`, r: r as unknown as Record<string, unknown>, title: `${fi?.name ?? ''}（${fi ? foodGroupLabel[fi.group_key] : ''}）` };
    });
  }, [tab, data]);
  const qtyKey = tab === 'supply' ? 'qty_unopened' : 'qty';
  const table = tab === 'clothing' ? 'clothing_items' : tab === 'supply' ? 'supply_items' : 'food_lots';
  const changedCount = Object.keys(edits).filter((k) => k[0] === table[0]).length;
  const save = () => {
    const ops: BatchOp[] = rows.filter((x) => edits[x.k]).map((x) => ({ table, op: 'upsert', row: { ...x.r, ...edits[x.k] } }) as BatchOp);
    setEdits({});
    if (ops.length) commit(ops, { undoLabel: `${ops.length}件をまとめて保存しました` });
  };
  const val = (x: { k: string; r: Record<string, unknown> }, f: string) => (edits[x.k]?.[f] ?? x.r[f]) as never;
  return (
    <div>
      <Segmented ariaLabel="まとめて編集する種類" value={tab} onChange={(t) => { setTab(t); setEdits({}); }} options={[{ value: 'clothing', label: '衣類' }, { value: 'supply', label: '消耗品' }, { value: 'food', label: '食品' }]} />
      <ul className="mt-2 max-h-[60dvh] space-y-2 overflow-y-auto">
        {rows.map((x) => (
          <li key={x.k} className={cx('rounded-xl border p-2', edits[x.k] ? 'border-accent-500' : 'border-stone-200 dark:border-stone-800')}>
            <div className="mb-1 text-sm font-medium">{x.title}</div>
            <div className="grid grid-cols-[4.5rem_1fr] gap-1">
              <input aria-label="数" className={inputCls + ' text-center'} type="number" inputMode="decimal" value={val(x, qtyKey)} onChange={(e) => set(x.k, { [qtyKey]: tab === 'food' ? Number(e.target.value) || 0 : Math.floor(Number(e.target.value) || 0) })} />
              <PlaceSelect value={val(x, 'place_id')} onChange={(v) => set(x.k, { place_id: v })} />
            </div>
            {tab === 'clothing' && (
              <div className="mt-1 grid grid-cols-[4.5rem_1fr] gap-1">
                <input aria-label="サイズ" className={inputCls + ' text-center'} placeholder="サイズ" value={(val(x, 'size_label') as string) ?? ''} onChange={(e) => set(x.k, { size_label: e.target.value || null, size_num: e.target.value.trim() && !Number.isNaN(Number(e.target.value)) ? Number(e.target.value) : null })} />
                <select aria-label="状態" className={inputCls} value={val(x, 'status')} onChange={(e) => set(x.k, { status: e.target.value })}>
                  {((x.r as unknown as ClothingItem).owner_type === 'stock' ? (['stock', 'discard'] as const) : (['wearing', 'next', 'discard'] as const)).map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
                </select>
              </div>
            )}
            {tab !== 'clothing' && <div className="mt-1 text-xs text-stone-500">{placeName(data.places, x.r.place_id as number)}</div>}
          </li>
        ))}
      </ul>
      <Button variant="primary" className="mt-3 w-full" onClick={save} disabled={changedCount === 0}>{changedCount ? `${changedCount}件を保存` : '変更はまだありません'}</Button>
    </div>
  );
}

function CsvSettings() {
  const data = useData();
  const { commit } = useStore();
  const [defIdx, setDefIdx] = useState(0);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const def = csvDefs[defIdx];
  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    setPreview(previewImport(def, data, text));
  };
  const apply = async () => {
    if (!preview) return;
    const ops = preview.ops;
    setPreview(null);
    await commit(ops, { undoLabel: `${def.label}を読み込みました` });
  };
  return (
    <div>
      <Field label="表">
        <select className={inputCls} value={defIdx} onChange={(e) => setDefIdx(Number(e.target.value))}>
          {csvDefs.map((d, i) => <option key={d.table} value={i}>{d.label}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => download(`${def.label}.csv`, exportCsv(def, data))}>書き出す</Button>
        <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-stone-100 px-4 font-medium dark:bg-stone-800">
          読み込む
          <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }} />
        </label>
      </div>
      <p className="mt-2 text-xs text-stone-500">持ち主や置き場所は名前で書きます（例：「洋室B/引き出し上段」）。id がある行は上書き、id が空の行は追加になります。</p>
      <Sheet open={!!preview} onClose={() => setPreview(null)} title={`${def.label}の読み込み`} footer={<><Button variant="primary" className="flex-1" onClick={apply} disabled={!preview || preview.ops.length === 0}>反映する</Button><Button onClick={() => setPreview(null)}>やめる</Button></>}>
        {preview && (
          <>
            <p className="mb-2 text-lg font-bold">追加 {preview.adds}件・変更 {preview.updates}件・エラー {preview.errors.length}件</p>
            {preview.errors.length > 0 && (
              <>
                <p className="mb-1 text-sm">エラーの行は読み込みません：</p>
                <ul className="max-h-60 overflow-y-auto text-sm text-red-700 dark:text-red-300">{preview.errors.slice(0, 50).map((e) => <li key={e}>{e}</li>)}</ul>
              </>
            )}
          </>
        )}
      </Sheet>
    </div>
  );
}
