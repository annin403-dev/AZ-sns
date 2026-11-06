import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api, ApiError, onSlow } from './api';
import { primaryKeys, type AllData, type BatchOp, type TableName } from '../shared/tables';
import { parseSettings, type Settings } from '../shared/logic/settings';
import { todayTokyo } from '../shared/logic/dates';

type Row = Record<string, unknown>;
type Toast = { id: number; text: string; undo?: () => void; tone?: 'error' | 'info' };

const keyOf = (table: TableName, row: Row) => primaryKeys[table].map((k) => String(row[k])).join('|');
let tempId = -1;

/** 変更をその場のデータに当てる（すぐ画面に出すため） */
export function applyOps(data: AllData, ops: BatchOp[]): AllData {
  const next = { ...data } as Record<TableName, Row[]>;
  for (const op of ops) {
    const rows = [...(next[op.table] as Row[])];
    if (op.op === 'delete') {
      const k = keyOf(op.table, op.key);
      next[op.table] = rows.filter((r) => keyOf(op.table, r) !== k);
      continue;
    }
    const row = { ...op.row };
    if (primaryKeys[op.table][0] === 'id' && row.id == null) row.id = tempId--;
    const k = keyOf(op.table, row);
    const i = rows.findIndex((r) => keyOf(op.table, r) === k);
    if (i >= 0) rows[i] = { ...rows[i], ...row };
    else rows.push(row);
    next[op.table] = rows;
  }
  return next as unknown as AllData;
}

/** 元に戻すための逆の操作を作る */
function inverseOps(before: AllData, ops: BatchOp[], results: (Row | null)[]): BatchOp[] {
  const inv: BatchOp[] = [];
  ops.forEach((op, i) => {
    const table = op.table;
    const rows = before[table] as unknown as Row[];
    if (op.op === 'delete') {
      const old = rows.find((r) => keyOf(table, r) === keyOf(table, op.key));
      if (old) inv.unshift({ table, op: 'insert', row: old });
      return;
    }
    const pkRow = op.row.id == null && primaryKeys[table][0] === 'id' ? results[i] ?? op.row : op.row;
    const old = rows.find((r) => keyOf(table, r) === keyOf(table, pkRow));
    if (old) inv.unshift({ table, op: 'upsert', row: old });
    else if (results[i]) {
      const key: Row = {};
      primaryKeys[table].forEach((k) => (key[k] = (results[i] as Row)[k]));
      inv.unshift({ table, op: 'delete', key });
    }
  });
  return inv;
}

type Store = {
  data: AllData | null;
  settings: Settings;
  today: string;
  loadError: string | null;
  slow: boolean;
  toasts: Toast[];
  reload: () => Promise<void>;
  /** 保存する。undoLabel を渡すと5秒間「元に戻す」を出す */
  commit: (ops: BatchOp[], opts?: { undoLabel?: string; silent?: boolean }) => Promise<(Row | null)[] | null>;
  /** −／＋：すぐ画面に出し、続けて押したらまとめて1回で保存 */
  bump: (table: 'clothing_items' | 'supply_items' | 'food_lots', id: number, field: string, delta: number, label: string) => void;
  toast: (text: string, tone?: 'error' | 'info') => void;
  dismissToast: (id: number) => void;
};

const Ctx = createContext<Store | null>(null);
export const useStore = () => useContext(Ctx)!;
export const useData = () => useStore().data!;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AllData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [slow, setSlow] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dataRef = useRef<AllData | null>(null);
  dataRef.current = data;
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const inflight = useRef(0);
  const bumps = useRef(new Map<string, { timer: ReturnType<typeof setTimeout>; before: Row; table: TableName; label: string }>());
  const [today, setToday] = useState(() => todayTokyo().ymd);

  useEffect(() => onSlow(setSlow), []);
  useEffect(() => {
    const t = setInterval(() => setToday(todayTokyo().ymd), 60_000);
    return () => clearInterval(t);
  }, []);

  const toast = useCallback((text: string, tone: 'error' | 'info' = 'info', undo?: () => void) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text, tone, undo }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), undo ? 5000 : tone === 'error' ? 6000 : 3000);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const reload = useCallback(async () => {
    try {
      const d = await api.all();
      // まだ保存していない −／＋ があれば、その数を残す
      let merged = d;
      for (const [k, b] of bumps.current) {
        const [table, id] = k.split(':');
        const cur = (dataRef.current?.[table as TableName] as unknown as Row[] | undefined)?.find((r) => String(r.id) === id);
        if (cur) merged = applyOps(merged, [{ table: b.table, op: 'upsert', row: cur }]);
      }
      setData(merged);
      setLoadError(null);
    } catch (e) {
      if (!dataRef.current) setLoadError(e instanceof ApiError ? (e.status === 401 ? 'ログインが切れました。ページを読み込みなおしてください' : e.message) : '読み込めませんでした');
      else throw e;
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const commit = useCallback<Store['commit']>(
    (ops, opts) => {
      const before = dataRef.current!;
      setData((d) => (d ? applyOps(d, ops) : d));
      inflight.current++;
      const p = queue.current.then(async () => {
        try {
          const { results } = await api.batch(ops);
          inflight.current--;
          if (opts?.undoLabel) {
            const inv = inverseOps(before, ops, results);
            toast(opts.undoLabel, 'info', () => {
              commitRef.current(inv, { silent: true });
            });
          }
          if (inflight.current === 0) await reload().catch(() => {});
          return results;
        } catch (e) {
          inflight.current--;
          toast(`${e instanceof Error ? e.message : '保存できませんでした'}。元に戻しました`, 'error');
          await reload().catch(() => setData(before));
          return null;
        }
      });
      queue.current = p.catch(() => {});
      return p;
    },
    [reload, toast],
  );
  const commitRef = useRef(commit);
  commitRef.current = commit;

  const bump = useCallback<Store['bump']>(
    (table, id, field, delta, label) => {
      const d = dataRef.current!;
      const rows = d[table] as unknown as Row[];
      const row = rows.find((r) => r.id === id);
      if (!row) return;
      const nextVal = Math.max(0, Math.round(((row[field] as number) + delta) * 1000) / 1000);
      if (nextVal === row[field]) return;
      const k = `${table}:${id}`;
      const existing = bumps.current.get(k);
      const updated = { ...row, [field]: nextVal };
      setData((cur) => (cur ? applyOps(cur, [{ table, op: 'upsert', row: updated }]) : cur));
      dataRef.current = applyOps(d, [{ table, op: 'upsert', row: updated }]);
      if (existing) clearTimeout(existing.timer);
      const before = existing?.before ?? row;
      const timer = setTimeout(async () => {
        bumps.current.delete(k);
        const latest = (dataRef.current![table] as unknown as Row[]).find((r) => r.id === id);
        if (!latest || latest[field] === before[field]) return;
        inflight.current++;
        const p = queue.current.then(async () => {
          try {
            await api.batch([{ table, op: 'upsert', row: latest }]);
            inflight.current--;
            toast(`${label}を ${latest[field]} にしました`, 'info', () => commitRef.current([{ table, op: 'upsert', row: before }], { silent: true }));
            if (inflight.current === 0 && bumps.current.size === 0) await reload().catch(() => {});
          } catch (e) {
            inflight.current--;
            setData((cur) => (cur ? applyOps(cur, [{ table, op: 'upsert', row: before }]) : cur));
            toast(`${label}の数を保存できませんでした。元の数（${before[field]}）に戻しました`, 'error');
            void e;
          }
        });
        queue.current = p.catch(() => {});
      }, 800);
      bumps.current.set(k, { timer, before, table, label });
    },
    [reload, toast],
  );

  const settings = useMemo(() => parseSettings(data?.settings ?? []), [data?.settings]);

  const value: Store = { data, settings, today, loadError, slow, toasts, reload, commit, bump, toast: (t, tone) => toast(t, tone), dismissToast };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
