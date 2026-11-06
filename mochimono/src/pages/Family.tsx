import { useMemo, useState } from 'react';
import { useData, useStore } from '../store';
import { Button, Card, Empty, Field, Pill, Sheet, cx, inputCls } from '../ui';
import { fmtNum, sortedCats, sortedMembers } from '../labels';
import { formatMonths } from '../../shared/logic/dates';
import {
  FOOT_CATS, HEIGHT_CATS, growthPerYear, isNearBoundary, latestValue, monthsToNextShoe, monthsToNextSize, recomputeAutoSizes, shoeSizeFromFoot, sizeChoices, suggestSize,
} from '../../shared/logic/sizes';
import type { BatchOp, GrowthLog, Member, MemberSize } from '../../shared/tables';

function Spark({ logs, field, unit }: { logs: GrowthLog[]; field: 'height_cm' | 'weight_kg' | 'foot_cm'; unit: string }) {
  const pts = logs.filter((l) => l[field] != null).sort((a, b) => a.measured_on.localeCompare(b.measured_on));
  if (pts.length < 2) return null;
  const xs = pts.map((p) => Date.parse(p.measured_on));
  const ys = pts.map((p) => p[field] as number);
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
  if (x1 === x0) return null;
  const [y0, y1] = [Math.min(...ys), Math.max(...ys)];
  const W = 120, H = 32, pad = 3;
  const sx = (x: number) => pad + ((x - x0) / Math.max(1, x1 - x0)) * (W - pad * 2);
  const sy = (y: number) => H - pad - ((y - y0) / Math.max(0.1, y1 - y0)) * (H - pad * 2);
  const d = pts.map((_, i) => `${i ? 'L' : 'M'}${sx(xs[i]).toFixed(1)},${sy(ys[i]).toFixed(1)}`).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${fmtNum(ys[0])}${unit}から${fmtNum(ys[ys.length - 1])}${unit}への推移`} className="text-accent-600 dark:text-accent-100">
      <path d={d} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={sx(xs[xs.length - 1])} cy={sy(ys[ys.length - 1])} r={3} fill="currentColor" />
    </svg>
  );
}

export function LogEditor({ member, log, onClose }: { member: Member; log: GrowthLog | null; onClose: () => void }) {
  const data = useData();
  const { commit, today } = useStore();
  const [f, setF] = useState({ measured_on: log?.measured_on ?? today, height_cm: log?.height_cm?.toString() ?? '', weight_kg: log?.weight_kg?.toString() ?? '', foot_cm: log?.foot_cm?.toString() ?? '', note: log?.note ?? '' });
  const num = (s: string) => (s.trim() === '' || Number.isNaN(Number(s)) ? null : Number(s));
  const row = { ...(log ? { id: log.id } : {}), member_id: member.id, measured_on: f.measured_on, height_cm: num(f.height_cm), weight_kg: num(f.weight_kg), foot_cm: num(f.foot_cm), note: f.note || null };
  const save = async () => {
    const others = data.growth_logs.filter((l) => l.id !== log?.id);
    const sizes = recomputeAutoSizes(member, [...others, { id: -1, ...row } as GrowthLog], data.member_sizes);
    onClose();
    await commit([{ table: 'growth_logs', op: log ? 'upsert' : 'insert', row }, ...sizes.map((s) => ({ table: 'member_sizes' as const, op: 'upsert' as const, row: s }))], { undoLabel: log ? '記録を直しました' : '記録を追加しました' });
  };
  const del = async () => {
    const others = data.growth_logs.filter((l) => l.id !== log!.id);
    const sizes = recomputeAutoSizes(member, others, data.member_sizes);
    onClose();
    await commit([{ table: 'growth_logs', op: 'delete', key: { id: log!.id } }, ...sizes.map((s) => ({ table: 'member_sizes' as const, op: 'upsert' as const, row: s }))], { undoLabel: '記録を削除しました' });
  };
  return (
    <Sheet open onClose={onClose} title={`${member.name}の記録`} footer={<><Button variant="primary" className="flex-1" onClick={save} disabled={!f.measured_on || (row.height_cm == null && row.weight_kg == null && row.foot_cm == null)}>保存</Button>{log && <Button variant="danger" onClick={del}>削除</Button>}</>}>
      <Field label="測った日"><input className={inputCls} type="date" value={f.measured_on} onChange={(e) => setF({ ...f, measured_on: e.target.value })} /></Field>
      <div className="grid grid-cols-3 gap-2">
        <Field label="身長（cm）"><input className={inputCls} type="number" inputMode="decimal" value={f.height_cm} onChange={(e) => setF({ ...f, height_cm: e.target.value })} /></Field>
        <Field label="体重（kg）"><input className={inputCls} type="number" inputMode="decimal" value={f.weight_kg} placeholder="任意" onChange={(e) => setF({ ...f, weight_kg: e.target.value })} /></Field>
        <Field label="足（cm）"><input className={inputCls} type="number" inputMode="decimal" step="0.1" value={f.foot_cm} placeholder="任意" onChange={(e) => setF({ ...f, foot_cm: e.target.value })} /></Field>
      </div>
      {member.kind === 'child' && num(f.height_cm) != null && <p className="mb-2 text-sm text-stone-600 dark:text-stone-300">服のサイズの目安：{suggestSize(num(f.height_cm)!)}</p>}
      <Field label="メモ"><input className={inputCls} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></Field>
    </Sheet>
  );
}

/** 子どものサイズ：身長から自動で出し、自分で選び直せる */
export function ChildSizes({ member }: { member: Member }) {
  const data = useData();
  const { commit, today, settings } = useStore();
  const [detail, setDetail] = useState(false);
  const logs = data.growth_logs.filter((l) => l.member_id === member.id);
  const h = latestValue(logs, 'height_cm');
  const ft = latestValue(logs, 'foot_cm');
  const sizes = data.member_sizes.filter((s) => s.member_id === member.id);
  const sizeOf = (cat: string) => sizes.find((s) => s.category_key === cat);
  const cats = sortedCats(data);
  const clothesSize = sizeOf('tops')?.size_num ?? (h ? suggestSize(h.value) : null);

  const save = (rows: MemberSize[], label: string) => commit(rows.map((row) => ({ table: 'member_sizes', op: 'upsert', row }) as BatchOp), { undoLabel: label });

  const pickAll = (n: number) => {
    const suggested = h ? suggestSize(h.value) : null;
    const source = n === suggested ? 'auto' : 'manual';
    save(HEIGHT_CATS.map((c) => ({ member_id: member.id, category_key: c, size_num: n, size_label: String(n), source })), `${member.name}の服のサイズを${n}にしました`);
  };
  const setOne = (cat: string, v: string) => {
    if (v === 'auto') {
      const n = HEIGHT_CATS.includes(cat) ? (h ? suggestSize(h.value) : null) : ft ? shoeSizeFromFoot(ft.value) : null;
      save([{ member_id: member.id, category_key: cat, size_num: n, size_label: n == null ? null : String(n), source: 'auto' }], 'サイズを自動に戻しました');
    } else {
      const n = Number(v);
      save([{ member_id: member.id, category_key: cat, size_num: Number.isNaN(n) ? null : n, size_label: v, source: 'manual' }], 'サイズを変えました');
    }
  };

  const rate = growthPerYear(logs, 'height_cm', today, settings.default_growth_cm_per_year)!;
  const measured = growthPerYear(logs, 'height_cm', today, null);
  const footRate = growthPerYear(logs, 'foot_cm', today, null);
  const shoe = sizeOf('shoes')?.size_num ?? (ft ? shoeSizeFromFoot(ft.value) : null);
  const nextClothes = h && clothesSize ? monthsToNextSize(h.value, clothesSize, rate) : null;
  const nextShoe = ft && shoe ? monthsToNextShoe(ft.value, shoe, footRate) : null;
  const [shoeInput, setShoeInput] = useState('');
  const [sockInput, setSockInput] = useState(sizeOf('socks')?.size_label ?? '');

  return (
    <div className="mt-3 space-y-3 border-t border-stone-100 pt-3 dark:border-stone-800">
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="font-bold">服のサイズ</span>
          {h && <span className="text-xs text-stone-500">身長{fmtNum(h.value)}cmの目安：{suggestSize(h.value)}</span>}
        </div>
        {h ? (
          <>
            <div className="flex gap-2">
              {sizeChoices(h.value).map((c) => (
                <button key={c.size} onClick={() => pickAll(c.size)} className={cx('min-h-12 flex-1 rounded-xl border px-1 text-center', clothesSize === c.size ? 'border-accent-600 bg-accent-600 text-white' : 'border-stone-300 dark:border-stone-700')} aria-pressed={clothesSize === c.size}>
                  <div className="font-bold">{c.size}</div>
                  <div className="text-[11px] opacity-80">{c.fit}</div>
                  {c.suggested && <div className="text-[11px] font-bold">目安</div>}
                </button>
              ))}
            </div>
            {isNearBoundary(h.value) && <p className="mt-1 text-xs text-stone-500">ちょうどサイズの境目です。細身・ゆったりなど体型に合わせて選んでください。</p>}
          </>
        ) : (
          <Empty>身長を記録すると、サイズの目安が出ます。</Empty>
        )}
        {nextClothes != null && clothesSize && (
          <p className="mt-2 text-sm">
            次のサイズ（{clothesSize + 10}）になるのは <b>{formatMonths(nextClothes)}</b>
            <span className="text-xs text-stone-500">（伸び：年{fmtNum(rate)}cm{measured == null ? '・記録が少ないので目安の値' : ''}）</span>
          </p>
        )}
      </div>

      <div>
        <div className="mb-1 font-bold">靴</div>
        <div className="flex items-center gap-2">
          <span className="min-w-20">{shoe ? `${fmtNum(shoe)}cm` : '未設定'}</span>
          {sizeOf('shoes')?.source === 'manual' && <Pill>手で入力</Pill>}
          <input className={inputCls + ' w-24'} type="number" inputMode="decimal" step="0.5" placeholder="例 19.5" value={shoeInput} onChange={(e) => setShoeInput(e.target.value)} aria-label="靴のサイズ" />
          <Button small onClick={() => { if (shoeInput) { setOne('shoes', shoeInput); setShoeInput(''); } }}>決める</Button>
        </div>
        <p className="mt-1 text-xs text-stone-500">{ft ? `足の記録 ${fmtNum(ft.value)}cm から出しています。` : '足のサイズは「記録を追加」から入れられます。'}</p>
        {nextShoe != null && shoe && <p className="text-sm">次のサイズ（{fmtNum(shoe + 0.5)}）になるのは <b>{formatMonths(nextShoe)}</b></p>}
      </div>

      <div>
        <div className="mb-1 font-bold">靴下・タイツ</div>
        <div className="flex gap-2">
          <input className={inputCls} placeholder="ざっくりでOK（例：16-18）" value={sockInput} onChange={(e) => setSockInput(e.target.value)} aria-label="靴下のサイズ" />
          <Button small onClick={() => setOne('socks', sockInput)}>決める</Button>
        </div>
      </div>

      <button className="min-h-11 text-sm text-accent-700 underline dark:text-accent-100" onClick={() => setDetail((v) => !v)}>{detail ? '区分ごとのサイズを閉じる' : '区分ごとにサイズを変える'}</button>
      {detail && (
        <ul className="space-y-1">
          {cats.filter((c) => HEIGHT_CATS.includes(c.key) || FOOT_CATS.includes(c.key)).map((c) => {
            const s = sizeOf(c.key);
            const opts = FOOT_CATS.includes(c.key) ? [] : [80, 90, 95, 100, 110, 120, 130, 140, 150, 160];
            return (
              <li key={c.key} className="flex items-center gap-2">
                <span className="flex-1 text-sm">{c.label}</span>
                <span className="text-xs text-stone-500">{s?.source === 'manual' ? '手で入力' : '自動'}</span>
                <select className={inputCls + ' w-28'} value={s?.source === 'manual' ? s.size_label ?? '' : 'auto'} onChange={(e) => setOne(c.key, e.target.value)} aria-label={`${c.label}のサイズ`}>
                  <option value="auto">自動（{s?.size_label ?? '—'}）</option>
                  {opts.map((n) => <option key={n} value={String(n)}>{n}</option>)}
                  {s?.source === 'manual' && !opts.includes(Number(s.size_label)) && <option value={s.size_label ?? ''}>{s.size_label}</option>}
                </select>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function Family() {
  const data = useData();
  const members = sortedMembers(data);
  const [edit, setEdit] = useState<{ member: Member; log: GrowthLog | null } | null>(null);
  const [showLogs, setShowLogs] = useState<number | null>(null);
  const logsBy = useMemo(() => {
    const m = new Map<number, GrowthLog[]>();
    for (const l of data.growth_logs) m.set(l.member_id, [...(m.get(l.member_id) ?? []), l]);
    return m;
  }, [data.growth_logs]);

  return (
    <div className="space-y-3 pt-3">
      {members.map((m) => {
        const logs = (logsBy.get(m.id) ?? []).sort((a, b) => b.measured_on.localeCompare(a.measured_on));
        const h = latestValue(logs, 'height_cm');
        const w = logs.find((l) => l.weight_kg != null);
        const f = latestValue(logs, 'foot_cm');
        return (
          <Card key={m.id} title={<span>{m.name} <span className="text-sm font-normal text-stone-500">{m.kind === 'child' ? '子ども' : '大人'}</span></span>} right={<Button small onClick={() => setEdit({ member: m, log: null })}>記録を追加</Button>}>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: '身長', v: h?.value, unit: 'cm', field: 'height_cm' as const },
                { label: '体重', v: w?.weight_kg ?? undefined, unit: 'kg', field: 'weight_kg' as const },
                { label: '足', v: f?.value, unit: 'cm', field: 'foot_cm' as const },
              ].map((x) => (
                <div key={x.label} className="rounded-xl bg-stone-50 p-2 dark:bg-stone-950">
                  <div className="text-xs text-stone-500">{x.label}</div>
                  <div className="text-lg font-bold tabular-nums">{x.v != null ? `${fmtNum(x.v)}` : '—'}<span className="text-xs font-normal">{x.v != null ? x.unit : ''}</span></div>
                  <div className="flex justify-center"><Spark logs={logs} field={x.field} unit={x.unit} /></div>
                </div>
              ))}
            </div>
            {h && <p className="mt-1 text-xs text-stone-500">最後に測った日：{h.on}</p>}
            {logs.length > 0 && (
              <button className="min-h-11 text-sm text-accent-700 underline dark:text-accent-100" onClick={() => setShowLogs(showLogs === m.id ? null : m.id)}>
                {showLogs === m.id ? '記録を閉じる' : `記録を見る（${logs.length}件）`}
              </button>
            )}
            {showLogs === m.id && (
              <ul className="text-sm">
                {logs.map((l) => (
                  <li key={l.id}>
                    <button className="flex min-h-11 w-full items-center justify-between border-t border-stone-100 text-left dark:border-stone-800" onClick={() => setEdit({ member: m, log: l })}>
                      <span>{l.measured_on}</span>
                      <span className="tabular-nums text-stone-600 dark:text-stone-300">
                        {[l.height_cm != null && `${l.height_cm}cm`, l.weight_kg != null && `${l.weight_kg}kg`, l.foot_cm != null && `足${l.foot_cm}cm`].filter(Boolean).join('・')}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {m.kind === 'child' && <ChildSizes member={m} />}
          </Card>
        );
      })}
      {edit && <LogEditor member={edit.member} log={edit.log} onClose={() => setEdit(null)} />}
    </div>
  );
}
