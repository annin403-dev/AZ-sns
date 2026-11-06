import { useMemo, useState } from 'react';
import { useData, useStore } from '../store';
import { Button, Card, Empty, Field, Pill, Sheet, Stepper, inputCls } from '../ui';
import { fmtNum, fmtYm, foodGroupLabel, foodGroups, placeName } from '../labels';
import { Meters } from '../components/Meters';
import { FoodItemEditor, FoodLotEditor } from '../components/Editors';
import { consumeFromLots, isEatSoon, isExpired, riceDays, stockMeters, totalRiceKg } from '../../shared/logic/food';
import type { FoodItem, FoodLot } from '../../shared/tables';

export default function Stock() {
  const data = useData();
  const { settings, today, bump, commit } = useStore();
  const ym = today.slice(0, 7);
  const meters = useMemo(() => stockMeters({ items: data.food_items, lots: data.food_lots, settings, currentYm: ym }), [data, settings, ym]);
  const [buy, setBuy] = useState<{ itemId?: number } | null>(null);
  const [lot, setLot] = useState<FoodLot | null>(null);
  const [itemEdit, setItemEdit] = useState<FoodItem | null | 'new'>(null);
  const [eat, setEat] = useState<FoodItem | null>(null);
  const [eatQty, setEatQty] = useState('1');

  const riceKg = totalRiceKg({ items: data.food_items, lots: data.food_lots, settings, currentYm: ym });

  const doEat = async () => {
    if (!eat) return;
    const changed = consumeFromLots(data.food_lots, eat.id, Number(eatQty) || 0);
    setEat(null);
    if (changed.length) await commit(changed.map((l) => ({ table: 'food_lots' as const, op: 'upsert' as const, row: l })), { undoLabel: `${eat.name}を減らしました` });
  };

  return (
    <div className="space-y-3 pt-3">
      <Card title="備蓄のメーター">
        <Meters meters={meters} />
        <p className="mt-3 text-sm text-stone-600 dark:text-stone-300">
          米 {fmtNum(riceKg)}kg（約{fmtNum(Math.floor(riceDays(riceKg, settings) * 10) / 10)}日分・1日{settings.rice_go_per_day}合）
        </p>
      </Card>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="primary" onClick={() => setBuy({})}>買った</Button>
        <Button onClick={() => setItemEdit('new')}>品目を追加</Button>
      </div>
      <p className="px-1 text-xs text-stone-500">食数に数えたい物だけ、何人前かを入れてください。パスタとソースのように組み合わせて1食になる物は、どちらか片方にだけ入れてください。</p>

      {foodGroups.map((g) => {
        const items = data.food_items.filter((i) => i.group_key === g);
        if (!items.length) return null;
        return (
          <Card key={g} title={foodGroupLabel[g]}>
            <ul className="space-y-3">
              {items.map((it) => {
                const lots = data.food_lots
                  .filter((l) => l.food_item_id === it.id && l.qty > 0)
                  .sort((a, b) => (a.best_before ?? '9999').localeCompare(b.best_before ?? '9999'));
                const total = lots.reduce((s, l) => s + l.qty, 0);
                const per = it.meals_per_unit != null ? `1${it.unit}${fmtNum(it.meals_per_unit)}人前` : it.group_key === 'water' ? `1${it.unit}${fmtNum(it.liters_per_unit ?? 0)}L` : it.group_key === 'rice' ? '' : '食数に数えない';
                return (
                  <li key={it.id}>
                    <div className="flex items-center justify-between gap-2">
                      <button className="min-h-11 text-left" onClick={() => setItemEdit(it)}>
                        <div className="font-bold">{it.name}</div>
                        <div className="text-xs text-stone-500">合計 {fmtNum(total)}{it.unit}{per && `・${per}`}</div>
                      </button>
                      <div className="flex gap-1">
                        <Button small onClick={() => setBuy({ itemId: it.id })}>買った</Button>
                        <Button small disabled={total <= 0} onClick={() => { setEat(it); setEatQty(it.group_key === 'rice' ? '1' : '1'); }}>食べた</Button>
                      </div>
                    </div>
                    {lots.length === 0 ? (
                      <Empty>まだありません</Empty>
                    ) : (
                      <ul>
                        {lots.map((l) => {
                          const expired = isExpired(l, ym);
                          const soon = isEatSoon(l, ym, settings.eat_alert_months);
                          return (
                            <li key={l.id} className="flex items-center gap-2 border-t border-stone-100 py-1.5 dark:border-stone-800">
                              <button className="min-h-11 flex-1 text-left" onClick={() => setLot(l)}>
                                <div className="flex items-center gap-1.5 text-sm">
                                  期限 {fmtYm(l.best_before)}
                                  {expired && <Pill tone="red">✕ 期限切れ</Pill>}
                                  {soon && <Pill tone="amber">！ 早めに食べる</Pill>}
                                </div>
                                <div className="text-xs text-stone-500">{placeName(data.places, l.place_id)}</div>
                              </button>
                              <Stepper value={l.qty} unit={it.unit} label={it.name} onMinus={() => bump('food_lots', l.id, 'qty', -1, it.name)} onPlus={() => bump('food_lots', l.id, 'qty', 1, it.name)} />
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        );
      })}

      {buy && <FoodLotEditor lot={null} foodItemId={buy.itemId} onClose={() => setBuy(null)} />}
      {lot && <FoodLotEditor lot={lot} onClose={() => setLot(null)} />}
      {itemEdit && <FoodItemEditor item={itemEdit === 'new' ? null : itemEdit} onClose={() => setItemEdit(null)} />}
      <Sheet open={!!eat} onClose={() => setEat(null)} title={`${eat?.name ?? ''}を食べた／使った`} footer={<Button variant="primary" className="flex-1" onClick={doEat}>減らす</Button>}>
        <Field label={`いくつ（${eat?.unit ?? ''}）`} hint="期限が一番近いものから減らします">
          <input className={inputCls} type="number" inputMode="decimal" min={0} value={eatQty} onChange={(e) => setEatQty(e.target.value)} />
        </Field>
      </Sheet>
    </div>
  );
}
