import { useMemo, useState } from 'react';
import { useData, useStore } from '../store';
import { Button, Empty, Field, Sheet, inputCls } from '../ui';
import { buildEntries } from '../pages/Items';
import { PlaceSelect } from './Editors';
import type { BatchOp } from '../../shared/tables';

/** 数え直しモード：場所を選んで、その場所の物の数をまとめて入れる */
export function Recount({ onClose }: { onClose: () => void }) {
  const data = useData();
  const { today, commit } = useStore();
  const [placeId, setPlaceId] = useState<number | null>(null);
  const [counts, setCounts] = useState<Record<string, string>>({});
  const entries = useMemo(() => buildEntries(data, today).filter((e) => e.placeId === placeId), [data, today, placeId]);

  const changed = entries.filter((e) => counts[e.key] !== undefined && counts[e.key] !== '' && Number(counts[e.key]) !== e.qty);
  const save = async () => {
    const ops: BatchOp[] = changed.map((e) => {
      const v = Math.max(0, Number(counts[e.key]));
      if (e.type === 'clothing') return { table: 'clothing_items', op: 'upsert', row: { ...e.raw, qty: Math.floor(v) } };
      if (e.type === 'supply') return { table: 'supply_items', op: 'upsert', row: { ...e.raw, qty_unopened: Math.floor(v) } };
      return { table: 'food_lots', op: 'upsert', row: { ...e.raw, qty: v } };
    });
    onClose();
    if (ops.length) await commit(ops, { undoLabel: `${ops.length}件の数を直しました` });
  };

  return (
    <Sheet open onClose={onClose} title="数え直し" footer={<Button variant="primary" className="flex-1" onClick={save}>{changed.length ? `${changed.length}件を保存` : '閉じる'}</Button>}>
      <Field label="数える場所">
        <PlaceSelect value={placeId} onChange={(v) => { setPlaceId(v); setCounts({}); }} />
      </Field>
      {entries.length === 0 ? (
        <Empty>この場所には、まだ何も登録されていません。</Empty>
      ) : (
        <ul className="space-y-1">
          {entries.map((e) => (
            <li key={e.key} className="flex items-center gap-2 border-t border-stone-100 py-2 dark:border-stone-800">
              <div className="flex-1">
                <div className="font-medium">{e.title}</div>
                <div className="text-xs text-stone-500">{e.ownerLabel}・今 {e.qty}{e.unit}</div>
              </div>
              <input
                aria-label={`${e.title}の数`}
                className={inputCls + ' w-20 text-center'}
                type="number"
                inputMode="numeric"
                min={0}
                placeholder={String(e.qty)}
                value={counts[e.key] ?? ''}
                onChange={(ev) => setCounts((c) => ({ ...c, [e.key]: ev.target.value }))}
              />
              <span className="w-10 text-xs text-stone-500">{e.unit}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs text-stone-500">空のままの行は変えません。</p>
    </Sheet>
  );
}
