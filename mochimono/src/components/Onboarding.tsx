import { useState } from 'react';
import { useData, useStore } from '../store';
import { Button, Field, inputCls } from '../ui';
import { sortedMembers, sortedPlaces } from '../labels';
import { recomputeAutoSizes, suggestSize } from '../../shared/logic/sizes';
import type { BatchOp, GrowthLog } from '../../shared/tables';

const steps = ['家族の名前', '子どもの身長など', '1日に炊く米の量', '置き場所の確認'];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const data = useData();
  const { commit, today, settings } = useStore();
  const members = sortedMembers(data);
  const kids = members.filter((m) => m.kind === 'child');
  const [step, setStep] = useState(0);
  const [names, setNames] = useState<Record<number, string>>(Object.fromEntries(members.map((m) => [m.id, m.name])));
  const [body, setBody] = useState<Record<number, { h: string; w: string; f: string }>>(Object.fromEntries(kids.map((k) => [k.id, { h: '', w: '', f: '' }])));
  const [rice, setRice] = useState(String(settings.rice_go_per_day));
  const num = (s: string) => (s.trim() === '' || Number.isNaN(Number(s)) ? null : Number(s));

  const next = async () => {
    if (step === 0) {
      const ops: BatchOp[] = members.filter((m) => names[m.id]?.trim() && names[m.id].trim() !== m.name).map((m) => ({ table: 'members', op: 'upsert', row: { ...m, name: names[m.id].trim() } }));
      if (ops.length) await commit(ops);
    }
    if (step === 1) {
      const ops: BatchOp[] = [];
      let sizes = data.member_sizes;
      for (const k of kids) {
        const b = body[k.id];
        const row = { member_id: k.id, measured_on: today, height_cm: num(b.h), weight_kg: num(b.w), foot_cm: num(b.f), note: null };
        if (row.height_cm == null && row.weight_kg == null && row.foot_cm == null) continue;
        ops.push({ table: 'growth_logs', op: 'insert', row });
        const add = recomputeAutoSizes(k, [...data.growth_logs, { id: -1, ...row } as GrowthLog], sizes);
        sizes = [...sizes, ...add];
        add.forEach((s) => ops.push({ table: 'member_sizes', op: 'upsert', row: s }));
      }
      if (ops.length) await commit(ops);
    }
    if (step === 2) {
      const n = num(rice);
      if (n != null && n !== settings.rice_go_per_day) await commit([{ table: 'settings', op: 'upsert', row: { key: 'rice_go_per_day', value: JSON.stringify(n) } }]);
    }
    if (step === 3) {
      await commit([{ table: 'settings', op: 'upsert', row: { key: 'onboarding_done', value: 'true' } }]);
      onDone();
      return;
    }
    setStep(step + 1);
  };

  const places = sortedPlaces(data.places);
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-lg px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-32">
        <p className="text-sm text-stone-500">はじめの案内 {step + 1}/{steps.length}</p>
        <h1 className="mb-1 text-2xl font-bold">{steps[step]}</h1>
        <div className="mb-4 flex gap-1">{steps.map((_, i) => <div key={i} className={i <= step ? 'h-1.5 flex-1 rounded-full bg-accent-600' : 'h-1.5 flex-1 rounded-full bg-stone-200 dark:bg-stone-800'} />)}</div>

        {step === 0 && (
          <>
            <p className="mb-3 text-sm">アプリの中で使う呼び名です。あとから「設定」で変えられます。</p>
            {members.map((m) => (
              <Field key={m.id} label={`${m.kind === 'child' ? '子ども' : '大人'}（${m.gender === 'female' ? '女' : '男'}）`}>
                <input className={inputCls} value={names[m.id] ?? ''} onChange={(e) => setNames({ ...names, [m.id]: e.target.value })} />
              </Field>
            ))}
          </>
        )}
        {step === 1 && (
          <>
            <p className="mb-3 text-sm">身長から服のサイズの目安を出します。わからない所は空のままでOK。サイズはあとで「家族」から選び直せます。</p>
            {kids.map((k) => {
              const b = body[k.id];
              const h = num(b.h);
              return (
                <div key={k.id} className="mb-4 rounded-2xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900">
                  <div className="mb-2 font-bold">{names[k.id] || k.name}</div>
                  <div className="grid grid-cols-3 gap-2">
                    <Field label="身長 cm"><input className={inputCls} type="number" inputMode="decimal" value={b.h} onChange={(e) => setBody({ ...body, [k.id]: { ...b, h: e.target.value } })} /></Field>
                    <Field label="体重 kg"><input className={inputCls} type="number" inputMode="decimal" value={b.w} onChange={(e) => setBody({ ...body, [k.id]: { ...b, w: e.target.value } })} /></Field>
                    <Field label="足 cm"><input className={inputCls} type="number" inputMode="decimal" value={b.f} onChange={(e) => setBody({ ...body, [k.id]: { ...b, f: e.target.value } })} /></Field>
                  </div>
                  {h != null && <p className="text-sm">服のサイズの目安：<b>{suggestSize(h)}</b></p>}
                </div>
              );
            })}
          </>
        )}
        {step === 2 && (
          <>
            <p className="mb-3 text-sm">備蓄の米が何日分あるかの計算に使います。</p>
            <Field label="1日に炊く米の量（合）"><input className={inputCls} type="number" inputMode="decimal" value={rice} onChange={(e) => setRice(e.target.value)} /></Field>
          </>
        )}
        {step === 3 && (
          <>
            <p className="mb-3 text-sm">いまの置き場所の一覧です。名前の変更・追加・隠すは「設定」→「置き場所」からできます。</p>
            {[...new Set(places.map((p) => p.room))].map((r) => (
              <div key={r} className="mb-2">
                <div className="font-bold">{r}</div>
                <div className="text-sm text-stone-600 dark:text-stone-300">{places.filter((p) => p.room === r).map((p) => p.spot).join('、')}</div>
              </div>
            ))}
          </>
        )}
      </div>
      <div className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-stone-800 dark:bg-stone-900/95">
        <div className="mx-auto flex max-w-lg gap-2">
          {step > 0 && <Button onClick={() => setStep(step - 1)}>もどる</Button>}
          <Button variant="primary" className="flex-1" onClick={next}>{step === steps.length - 1 ? 'はじめる' : '次へ'}</Button>
        </div>
      </div>
    </div>
  );
}
